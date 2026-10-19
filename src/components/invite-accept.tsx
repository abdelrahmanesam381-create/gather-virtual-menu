"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "./ui";
export function InviteAccept({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <button
        className="button primary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            const result = await api("/api/invitations/accept", { token });
            router.push(`/dashboard?menu=${result.menuId}`);
            router.refresh();
          } catch (error) {
            setError((error as Error).message);
            setBusy(false);
          }
        }}
      >
        {busy ? "Joining…" : "Accept invitation"}
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
