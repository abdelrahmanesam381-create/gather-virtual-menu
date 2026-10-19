import { db } from "@/lib/db";
import { endpoint, checkOrigin, jsonBody, AppError } from "@/lib/http";
import {
  createSession,
  endSession,
  passwordHash,
  verifyPassword,
  throttle,
  hashToken,
  newToken,
} from "@/lib/auth";
import { loginInput, signupInput, invitationUsable } from "@/lib/validation";
import { registerInvitedAdmin } from "@/lib/menu-service";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  return endpoint(async () => {
    checkOrigin(request);
    const { action } = await params;
    if (action === "logout") {
      await endSession();
      return { ok: true };
    }
    const body = await jsonBody(request);
    if (action === "login") {
      const input = loginInput.parse(body);
      await throttle(`login:${input.email}`);
      const admin = await db.admin.findUnique({
        where: { email: input.email },
      });
      const valid = await verifyPassword(
        input.password,
        admin?.passwordHash ||
          "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxLM3YNpNHaHLRG7.Jo5S0u8N7W",
      );
      if (!admin || !valid)
        throw new AppError(401, "Email or password is incorrect.");
      await createSession(admin.id);
      return { ok: true };
    }
    if (action === "signup") {
      const input = signupInput.parse(body);
      await throttle("signup:global", 100);
      await throttle(`signup:${input.email}`, 5);
      if (input.inviteToken) {
        const invite = await db.invitation.findUnique({
          where: { tokenHash: hashToken(input.inviteToken) },
        });
        if (
          !invite ||
          !invitationUsable(invite) ||
          invite.email !== input.email
        )
          throw new AppError(
            400,
            "This invitation is unavailable or belongs to another email.",
          );
      }
      const password = await passwordHash(input.password);
      const slug =
        (input.restaurant || "menu")
          .normalize("NFKD")
          .replace(/[^a-zA-Z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .toLowerCase()
          .slice(0, 90) || "menu";
      const admin = input.inviteToken
        ? await registerInvitedAdmin(input.inviteToken, {
            email: input.email,
            name: input.name,
            passwordHash: password,
          })
        : await db.admin.create({
            data: {
              email: input.email,
              name: input.name,
              passwordHash: password,
              menus: {
                create: {
                  menu: {
                    create: {
                      slug: `${slug}-${newToken().slice(0, 6)}`,
                      pageTitle: input.restaurant,
                    },
                  },
                },
              },
            },
          });
      await createSession(admin.id);
      return { ok: true };
    }
    throw new AppError(404, "Unknown action.");
  });
}
