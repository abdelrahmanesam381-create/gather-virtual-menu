import { requireAdmin, throttle } from "@/lib/auth";
import { endpoint, checkOrigin, jsonBody, AppError } from "@/lib/http";
import { mutateMenu } from "@/lib/menu-service";
import { refreshSnapshot } from "@/lib/public-menu";
import { sendInvitation } from "@/lib/mail";
import { db } from "@/lib/db";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; action: string[] }> },
) {
  return endpoint(async () => {
    checkOrigin(request);
    const admin = await requireAdmin();
    const { id, action } = await params;
    const name = action.join("/");
    if (name === "invitations") await throttle(`invite:${admin.id}`, 20);
    const result = await mutateMenu(
      id,
      admin.id,
      name,
      await jsonBody(request),
    );
    if (name === "invitations") {
      const invite = result as { id: string; email: string; token: string };
      const menu = await db.menu.findUniqueOrThrow({ where: { id } });
      try {
        const delivery = await sendInvitation(
          invite.email,
          invite.token,
          menu.pageTitle || "your restaurant",
        );
        return { ok: true, delivery };
      } catch {
        await db.invitation.updateMany({
          where: { id: invite.id, status: "PENDING" },
          data: { status: "REVOKED" },
        });
        throw new AppError(
          503,
          "The invitation could not be delivered. Check email settings and try again.",
        );
      }
    }
    if (!["invite-revoke", "admins"].includes(name)) {
      try {
        await refreshSnapshot(id);
      } catch {
        return {
          saved: true,
          warning:
            "Saved, but the offline public snapshot could not be updated. Please retry saving shortly.",
        };
      }
    }
    return result;
  });
}
