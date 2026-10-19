import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "./db";
import { AppError } from "./http";
import {
  assertOrder,
  categoryInput,
  itemInput,
  pageInput,
  orderInput,
  emailInput,
  invitationUsable,
} from "./validation";
import { hashToken, newToken } from "./auth";

type Tx = Prisma.TransactionClient;
export async function withMenu<T>(
  menuId: string,
  adminId: string,
  work: (tx: Tx) => Promise<T>,
): Promise<T> {
  return db.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM menus WHERE id = ${menuId} FOR UPDATE`;
      if (
        !(await tx.menuAdmin.findUnique({
          where: { menuId_adminId: { menuId, adminId } },
        }))
      )
        throw new AppError(404, "Menu not found.");
      return work(tx);
    },
    { maxWait: 10000, timeout: 15000 },
  );
}
export const menuInclude = {
  categories: {
    orderBy: [{ position: "asc" as const }, { id: "asc" as const }],
    include: {
      placements: {
        orderBy: [{ position: "asc" as const }, { id: "asc" as const }],
        include: { item: true },
      },
    },
  },
  items: { orderBy: { createdAt: "asc" as const } },
};
export async function getDashboard(adminId: string, menuId?: string) {
  return db.menu.findFirst({
    where: { ...(menuId ? { id: menuId } : {}), admins: { some: { adminId } } },
    orderBy: { createdAt: "asc" },
    include: {
      ...menuInclude,
      admins: {
        include: { admin: { select: { id: true, name: true, email: true } } },
      },
      invitations: {
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, status: true, expiresAt: true },
      },
    },
  });
}
const idInput = z.object({ id: z.string().min(1) });
async function categoryInMenu(tx: Tx, id: string, menuId: string) {
  if (!(await tx.category.findFirst({ where: { id, menuId } })))
    throw new AppError(404, "Category not found.");
}
export async function mutateMenu(
  menuId: string,
  adminId: string,
  action: string,
  input: unknown,
): Promise<unknown> {
  return withMenu(menuId, adminId, async (tx) => {
    if (action === "categories") {
      const { id, ...data } = categoryInput.parse(input);
      if (id) {
        await categoryInMenu(tx, id, menuId);
        return tx.category.update({ where: { id }, data });
      }
      const last = await tx.category.aggregate({
        where: { menuId },
        _max: { position: true },
      });
      return tx.category.create({
        data: { ...data, menuId, position: (last._max.position ?? -1) + 1 },
      });
    }
    if (action === "category-delete") {
      const { id } = idInput.parse(input);
      await categoryInMenu(tx, id, menuId);
      await tx.category.delete({ where: { id } });
      return { ok: true };
    }
    if (action === "category-order") {
      const { ids } = orderInput.parse(input);
      const list = await tx.category.findMany({
        where: { menuId },
        select: { id: true },
      });
      try {
        assertOrder(
          ids,
          list.map((x) => x.id),
        );
      } catch (e) {
        throw new AppError(409, (e as Error).message);
      }
      for (const [position, id] of ids.entries())
        await tx.category.update({ where: { id }, data: { position } });
      return { ok: true };
    }
    if (action === "items") {
      const { id, categoryIds, ...data } = itemInput.parse(input);
      if (
        (await tx.category.count({
          where: { id: { in: categoryIds }, menuId },
        })) !== categoryIds.length
      )
        throw new AppError(400, "Choose categories from this menu.");
      if (id && !(await tx.item.findFirst({ where: { id, menuId } })))
        throw new AppError(404, "Item not found.");
      const item = id
        ? await tx.item.update({ where: { id }, data })
        : await tx.item.create({ data: { ...data, menuId } });
      await tx.placement.deleteMany({
        where: { itemId: item.id, categoryId: { notIn: categoryIds } },
      });
      for (const categoryId of categoryIds) {
        if (
          !(await tx.placement.findUnique({
            where: { itemId_categoryId: { itemId: item.id, categoryId } },
          }))
        ) {
          const last = await tx.placement.aggregate({
            where: { categoryId },
            _max: { position: true },
          });
          await tx.placement.create({
            data: {
              itemId: item.id,
              categoryId,
              position: (last._max.position ?? -1) + 1,
            },
          });
        }
      }
      return item;
    }
    if (action === "item-delete") {
      const { id } = idInput.parse(input);
      if (!(await tx.item.findFirst({ where: { id, menuId } })))
        throw new AppError(404, "Item not found.");
      await tx.item.delete({ where: { id } });
      return { ok: true };
    }
    if (action === "item-order") {
      const { ids, categoryId } = orderInput.parse(input);
      if (!categoryId) throw new AppError(400, "Choose a category.");
      await categoryInMenu(tx, categoryId, menuId);
      const list = await tx.placement.findMany({
        where: { categoryId },
        select: { id: true },
      });
      try {
        assertOrder(
          ids,
          list.map((x) => x.id),
        );
      } catch (e) {
        throw new AppError(409, (e as Error).message);
      }
      for (const [position, id] of ids.entries())
        await tx.placement.update({ where: { id }, data: { position } });
      return { ok: true };
    }
    if (action === "page")
      return tx.menu.update({
        where: { id: menuId },
        data: pageInput.parse(input),
      });
    if (action === "invitations") {
      const { email } = z.object({ email: emailInput }).parse(input);
      if (await tx.menuAdmin.findFirst({ where: { menuId, admin: { email } } }))
        throw new AppError(409, "This person is already on your team.");
      if (
        await tx.invitation.findFirst({
          where: {
            menuId,
            email,
            status: "PENDING",
            expiresAt: { gt: new Date() },
          },
        })
      )
        throw new AppError(
          409,
          "A pending invitation already exists for this email.",
        );
      const token = newToken();
      const invitation = await tx.invitation.create({
        data: {
          menuId,
          invitedById: adminId,
          email,
          tokenHash: hashToken(token),
          expiresAt: new Date(Date.now() + 7 * 86400000),
        },
      });
      return { id: invitation.id, token, email };
    }
    if (action === "invite-revoke") {
      const { id } = idInput.parse(input);
      const result = await tx.invitation.updateMany({
        where: { id, menuId, status: "PENDING" },
        data: { status: "REVOKED" },
      });
      if (!result.count)
        throw new AppError(404, "Pending invitation not found.");
      return { ok: true };
    }
    if (action === "admins") {
      const { adminId: target } = z
        .object({ adminId: z.string().min(1) })
        .parse(input);
      if (
        !(await tx.menuAdmin.findUnique({
          where: { menuId_adminId: { menuId, adminId: target } },
        }))
      )
        throw new AppError(404, "Admin not found.");
      if ((await tx.menuAdmin.count({ where: { menuId } })) <= 1)
        throw new AppError(409, "The last admin cannot be removed.");
      await tx.menuAdmin.delete({
        where: { menuId_adminId: { menuId, adminId: target } },
      });
      return { ok: true };
    }
    throw new AppError(404, "Unknown action.");
  });
}
export async function acceptInvitation(
  token: string,
  adminId: string,
  email: string,
) {
  const invite = await db.invitation.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!invite)
    throw new AppError(
      400,
      "This invitation is invalid or no longer available.",
    );
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM menus WHERE id = ${invite.menuId} FOR UPDATE`;
    const fresh = await tx.invitation.findUnique({ where: { id: invite.id } });
    if (!fresh || !invitationUsable(fresh))
      throw new AppError(
        400,
        "This invitation has expired, was revoked or has already been used.",
      );
    if (fresh.email !== email.toLowerCase())
      throw new AppError(
        403,
        "Sign in with the email address this invitation was sent to.",
      );
    await tx.menuAdmin.upsert({
      where: { menuId_adminId: { menuId: fresh.menuId, adminId } },
      create: { menuId: fresh.menuId, adminId },
      update: {},
    });
    await tx.invitation.update({
      where: { id: fresh.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });
    return { menuId: fresh.menuId };
  });
}
export async function registerInvitedAdmin(
  token: string,
  input: { email: string; name: string; passwordHash: string },
) {
  const invitation = await db.invitation.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!invitation) throw new AppError(400, "This invitation is unavailable.");
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM menus WHERE id = ${invitation.menuId} FOR UPDATE`;
    const fresh = await tx.invitation.findUnique({
      where: { id: invitation.id },
    });
    if (
      !fresh ||
      !invitationUsable(fresh) ||
      fresh.email !== input.email.toLowerCase()
    )
      throw new AppError(
        400,
        "This invitation is unavailable or belongs to another email.",
      );
    const admin = await tx.admin.create({ data: input });
    await tx.menuAdmin.create({
      data: { menuId: fresh.menuId, adminId: admin.id },
    });
    await tx.invitation.update({
      where: { id: fresh.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });
    return admin;
  });
}
