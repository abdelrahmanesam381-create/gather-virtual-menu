"use client";
import { useState } from "react";
import { Send, Users, X } from "lucide-react";
import type { DashboardData } from "@/lib/types";
export function TeamEditor({
  menu,
  currentAdminId,
  onAction,
}: {
  menu: DashboardData;
  currentAdminId: string;
  onAction: (action: string, data: unknown) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="team-layout">
      <section className="form-panel">
        <div className="panel-title">
          <h2>A good menu takes a team</h2>
          <p>
            Invite someone to help keep things fresh. Every admin has the same
            permissions.
          </p>
        </div>
        <form
          className="invite-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            setBusy(true);
            setError("");
            try {
              await onAction("invitations", {
                email: new FormData(form).get("email"),
              });
              form.reset();
            } catch (error) {
              setError((error as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            Email address
            <input
              name="email"
              type="email"
              placeholder="teammate@restaurant.com"
              required
            />
          </label>
          <button className="button primary" disabled={busy}>
            <Send size={16} />
            {busy ? "Sending…" : "Send invitation"}
          </button>
        </form>
        <p className="hint">Invitations expire after 7 days.</p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>
      <section className="form-panel">
        <div className="panel-title">
          <h2>
            Team members{" "}
            <span className="count-pill">{menu.admins.length}</span>
          </h2>
        </div>
        {menu.admins.map(({ admin }) => (
          <div className="team-row" key={admin.id}>
            <div className="avatar">
              {(admin.name || admin.email).slice(0, 1).toUpperCase()}
            </div>
            <div className="team-person">
              <strong>
                {admin.name || admin.email}
                {admin.id === currentAdminId && (
                  <span className="you-label">You</span>
                )}
              </strong>
              <span>{admin.email}</span>
            </div>
            <span className="status-badge">Admin</span>
            <button
              className="text-button danger"
              disabled={menu.admins.length === 1 || busy}
              onClick={async () => {
                if (
                  !confirm(
                    `Remove ${admin.name || admin.email} from this menu? They will lose access.`,
                  )
                )
                  return;
                setBusy(true);
                try {
                  await onAction("admins", { adminId: admin.id });
                } catch (error) {
                  setError((error as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Remove
            </button>
          </div>
        ))}
        <p className="hint">
          <Users size={15} />
          The last admin always keeps access to the menu.
        </p>
      </section>
      <section className="form-panel">
        <div className="panel-title">
          <h2>Invitations</h2>
        </div>
        {!menu.invitations.length ? (
          <p className="hint">
            No invitations yet. A bigger table starts with an email.
          </p>
        ) : (
          menu.invitations.map((invite) => {
            const status =
              invite.status === "PENDING" &&
              new Date(invite.expiresAt) <= new Date()
                ? "EXPIRED"
                : invite.status;
            return (
              <div className="team-row" key={invite.id}>
                <div className="team-person">
                  <strong>{invite.email}</strong>
                  <span>
                    Expires {new Date(invite.expiresAt).toLocaleDateString()}
                  </span>
                </div>
                <span
                  className={`status-badge ${status === "PENDING" ? "amber" : "neutral"}`}
                >
                  {status.toLowerCase()}
                </span>
                {status === "PENDING" && (
                  <button
                    disabled={busy}
                    className="icon-button"
                    aria-label={`Revoke invitation for ${invite.email}`}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await onAction("invite-revoke", { id: invite.id });
                      } catch (error) {
                        setError((error as Error).message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
