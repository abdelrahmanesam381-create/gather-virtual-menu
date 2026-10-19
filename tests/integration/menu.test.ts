import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
if (!process.env.TEST_DATABASE_URL)
  throw new Error("Set TEST_DATABASE_URL to an isolated PostgreSQL database.");
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
const { db } = await import("../../src/lib/db");
const { mutateMenu, acceptInvitation, registerInvitedAdmin } =
  await import("../../src/lib/menu-service");
const { hashToken } = await import("../../src/lib/auth");
const ids: string[] = [];
const admins: string[] = [];
after(async () => {
  await db.menu.deleteMany({ where: { id: { in: ids } } });
  await db.admin.deleteMany({ where: { id: { in: admins } } });
  await db.$disconnect();
});
async function fixture() {
  const id = randomUUID();
  const a = await db.admin.create({
    data: { email: `${id}@example.test`, passwordHash: "test" },
  });
  admins.push(a.id);
  const m = await db.menu.create({
    data: { slug: `test-${id}`, admins: { create: { adminId: a.id } } },
  });
  ids.push(m.id);
  return { a, m };
}

test("application tables deny public Data API access through RLS", async () => {
  const tables = await db.$queryRaw<{ name: string; enabled: boolean }[]>`
    SELECT c.relname AS name, c.relrowsecurity AS enabled
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname IN
      ('admins','menus','menu_admins','categories','items','placements','invitations','sessions','rate_limits','_prisma_migrations')
    ORDER BY c.relname
  `;
  assert.equal(tables.length, 10);
  assert.ok(
    tables.every((table) => table.enabled),
    "Every application table must have RLS enabled.",
  );
  const policies = await db.$queryRaw<{ count: bigint }[]>`
    SELECT count(*) AS count FROM pg_policies WHERE schemaname = 'public'
    AND tablename IN ('admins','menus','menu_admins','categories','items','placements','invitations','sessions','rate_limits')
  `;
  assert.equal(
    Number(policies[0].count),
    0,
    "Access is through the authorized application server, not browser Data API policies.",
  );
});
test("menu isolation, independent ordering, hiding and orphan recovery", async () => {
  const { a, m } = await fixture();
  const other = await fixture();
  await assert.rejects(() =>
    mutateMenu(m.id, other.a.id, "categories", { name: "Intruder" }),
  );
  const c1 = (await mutateMenu(m.id, a.id, "categories", {
    name: "First",
  })) as { id: string };
  const c2 = (await mutateMenu(m.id, a.id, "categories", {
    name: "Second",
  })) as { id: string };
  const c3 = (await mutateMenu(other.m.id, other.a.id, "categories", {
    name: "Foreign",
  })) as { id: string };
  await assert.rejects(() =>
    mutateMenu(m.id, a.id, "items", {
      title: "Leak",
      price: "10",
      categoryIds: [c3.id],
    }),
  );
  const item = (await mutateMenu(m.id, a.id, "items", {
    title: "Coffee",
    price: "12.50",
    categoryIds: [c1.id, c2.id],
  })) as { id: string };
  await mutateMenu(m.id, a.id, "items", {
    title: "Tea",
    price: "10",
    categoryIds: [c1.id, c2.id],
  });
  const first = await db.placement.findMany({
    where: { categoryId: c1.id },
    orderBy: { position: "asc" },
  });
  const second = await db.placement.findMany({
    where: { categoryId: c2.id },
    orderBy: { position: "asc" },
  });
  await mutateMenu(m.id, a.id, "item-order", {
    categoryId: c1.id,
    ids: first.map((x) => x.id).reverse(),
  });
  assert.deepEqual(
    (
      await db.placement.findMany({
        where: { categoryId: c2.id },
        orderBy: { position: "asc" },
      })
    ).map((x) => x.id),
    second.map((x) => x.id),
  );
  await assert.rejects(() =>
    mutateMenu(m.id, a.id, "item-order", { categoryId: c1.id, ids: [] }),
  );
  await mutateMenu(m.id, a.id, "category-delete", { id: c1.id });
  await mutateMenu(m.id, a.id, "category-delete", { id: c2.id });
  assert.ok(await db.item.findUnique({ where: { id: item.id } }));
  assert.equal(await db.placement.count({ where: { itemId: item.id } }), 0);
});
test("concurrent removals preserve at least one admin", async () => {
  const { a, m } = await fixture();
  const other = await fixture();
  await db.menuAdmin.create({ data: { menuId: m.id, adminId: other.a.id } });
  const results = await Promise.allSettled([
    mutateMenu(m.id, a.id, "admins", { adminId: other.a.id }),
    mutateMenu(m.id, other.a.id, "admins", { adminId: a.id }),
  ]);
  assert.ok(results.some((x) => x.status === "rejected"));
  assert.equal(await db.menuAdmin.count({ where: { menuId: m.id } }), 1);
});
test("invitations enforce email, expiry and single-use under concurrency", async () => {
  const { a, m } = await fixture();
  const invited = await fixture();
  const token = randomUUID();
  const inv = await db.invitation.create({
    data: {
      menuId: m.id,
      invitedById: a.id,
      email: invited.a.email,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 100000),
    },
  });
  await assert.rejects(() => acceptInvitation(token, a.id, a.email));
  const results = await Promise.allSettled([
    acceptInvitation(token, invited.a.id, invited.a.email),
    acceptInvitation(token, invited.a.id, invited.a.email),
  ]);
  assert.equal(results.filter((x) => x.status === "fulfilled").length, 1);
  assert.equal(
    (await db.invitation.findUniqueOrThrow({ where: { id: inv.id } })).status,
    "ACCEPTED",
  );
  const expired = randomUUID();
  await db.invitation.create({
    data: {
      menuId: m.id,
      email: invited.a.email,
      tokenHash: hashToken(expired),
      expiresAt: new Date(0),
    },
  });
  await assert.rejects(() =>
    acceptInvitation(expired, invited.a.id, invited.a.email),
  );
});
test("revoked invitation signup never leaves an orphan account", async () => {
  const { a, m } = await fixture();
  const token = randomUUID();
  const email = `invite-${randomUUID()}@example.test`;
  await db.invitation.create({
    data: {
      menuId: m.id,
      invitedById: a.id,
      email,
      tokenHash: hashToken(token),
      status: "REVOKED",
      expiresAt: new Date(Date.now() + 100000),
    },
  });
  assert.equal(typeof registerInvitedAdmin, "function");
  await assert.rejects(() =>
    registerInvitedAdmin(token, {
      email,
      name: "Invited",
      passwordHash: "test",
    }),
  );
  assert.equal(await db.admin.findUnique({ where: { email } }), null);
});
