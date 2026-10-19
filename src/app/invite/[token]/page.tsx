import Link from "next/link";
import { currentAdmin, hashToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { invitationUsable } from "@/lib/validation";
import { InviteAccept } from "@/components/invite-accept";
import { UtensilsCrossed } from "lucide-react";
export const dynamic = "force-dynamic";
export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await db.invitation.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { menu: true },
  });
  const admin = await currentAdmin();
  return (
    <main className="standalone-card">
      <div className="restaurant-mark">
        <UtensilsCrossed />
      </div>
      {!invite || !invitationUsable(invite) ? (
        <>
          <h1>This invitation is no longer available.</h1>
          <p>
            It may have expired or already been used. Ask a team member to send
            a fresh invitation.
          </p>
          <Link href="/dashboard" className="button secondary">
            Go to your workspace
          </Link>
        </>
      ) : (
        <>
          <h1>A seat at the table.</h1>
          <p>
            You’ve been invited to help manage{" "}
            <strong>{invite.menu.pageTitle || "a restaurant"}</strong>.
          </p>
          {admin ? (
            <>
              <p>Signed in as {admin.email}.</p>
              <InviteAccept token={token} />
              {admin.email !== invite.email && (
                <Link href={`/login?invite=${token}`}>
                  Sign in with your invited email
                </Link>
              )}
            </>
          ) : (
            <div className="invite-choices">
              <Link className="button primary" href={`/signup?invite=${token}`}>
                Create account and join
              </Link>
              <Link
                className="button secondary"
                href={`/login?invite=${token}`}
              >
                Sign in to join
              </Link>
            </div>
          )}
        </>
      )}
    </main>
  );
}
