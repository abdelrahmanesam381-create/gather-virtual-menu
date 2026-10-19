import { test } from "node:test";
import assert from "node:assert/strict";
import {
  itemInput,
  pageInput,
  assertOrder,
  invitationUsable,
} from "../src/lib/validation";

test("items require a category, a title and an exact nonnegative decimal price", () => {
  const base = { title: "Coffee", price: "25.50", categoryIds: ["cat"] };
  assert.equal(itemInput.parse(base).price, "25.50");
  for (const price of ["-1", "1.234", "Infinity", "1e3", "", "100000000"])
    assert.equal(itemInput.safeParse({ ...base, price }).success, false);
  assert.equal(
    itemInput.safeParse({ ...base, categoryIds: [] }).success,
    false,
  );
  assert.equal(itemInput.safeParse({ ...base, title: " " }).success, false);
});
test("public links cannot use executable protocols", () => {
  assert.equal(
    pageInput.safeParse({ currency: "EGP", mapUrl: "javascript:alert(1)" })
      .success,
    false,
  );
  assert.equal(
    pageInput.safeParse({ currency: "EGP", mapUrl: "https://maps.google.com/" })
      .success,
    true,
  );
});
test("new menus can save optional database fields that are null", () => {
  const result = pageInput.parse({
    currency: "EGP",
    pageTitle: "New table",
    description: null,
    bannerImageUrl: null,
    address: null,
    phone: null,
    contactEmail: null,
    mapUrl: null,
  });
  assert.equal(result.description, "");
  assert.equal(result.bannerImageUrl, "");
  assert.equal(result.contactEmail, "");
});
test("reordering rejects omissions, duplicates and foreign identifiers", () => {
  assert.doesNotThrow(() => assertOrder(["b", "a"], ["a", "b"]));
  for (const ids of [["a"], ["a", "a"], ["a", "c"]])
    assert.throws(() => assertOrder(ids, ["a", "b"]));
});
test("invitations expire at the deadline and cannot be reused or revoked", () => {
  const now = new Date("2026-10-19T00:00:00Z");
  assert.equal(
    invitationUsable(
      { status: "PENDING", expiresAt: new Date(now.getTime() + 1) },
      now,
    ),
    true,
  );
  assert.equal(
    invitationUsable({ status: "PENDING", expiresAt: now }, now),
    false,
  );
  assert.equal(
    invitationUsable(
      { status: "ACCEPTED", expiresAt: new Date(now.getTime() + 1) },
      now,
    ),
    false,
  );
  assert.equal(
    invitationUsable(
      { status: "REVOKED", expiresAt: new Date(now.getTime() + 1) },
      now,
    ),
    false,
  );
});
