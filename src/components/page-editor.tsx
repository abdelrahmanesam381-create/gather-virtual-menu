"use client";
import { useState } from "react";
import { Save, ExternalLink } from "lucide-react";
import type { MenuData } from "@/lib/types";
import { ImageUpload } from "./ui";
import { PublicMenu } from "./public-menu";
export function PageEditor({
  menu,
  onSave,
}: {
  menu: MenuData;
  onSave: (data: unknown) => Promise<void>;
}) {
  const [draft, setDraft] = useState(menu);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const field = (
    key: keyof MenuData,
    label: string,
    placeholder: string,
    type = "text",
  ) => (
    <label>
      {label}
      <input
        type={type}
        value={String(draft[key] || "")}
        placeholder={placeholder}
        maxLength={key === "description" ? 2000 : 500}
        onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
      />
    </label>
  );
  return (
    <div className="page-editor-layout">
      <form
        className="page-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (uploading) return;
          setBusy(true);
          setError("");
          try {
            await onSave(draft);
          } catch (error) {
            setError((error as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <section className="form-panel">
          <div className="panel-title">
            <h2>Make it yours</h2>
            <p>A warm welcome before the first bite.</p>
          </div>
          <ImageUpload
            onBusyChange={setUploading}
            label="Cover image"
            value={draft.bannerImageUrl || ""}
            onChange={(value) => setDraft({ ...draft, bannerImageUrl: value })}
          />
          {field("pageTitle", "Restaurant name", "Your restaurant")}
          <label>
            Description
            <textarea
              value={draft.description || ""}
              maxLength={2000}
              rows={4}
              placeholder="Tell guests a little about your table."
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </label>
          <label>
            Menu currency
            <select
              value={draft.currency}
              onChange={(e) => setDraft({ ...draft, currency: e.target.value })}
            >
              {Array.from(
                new Set([
                  draft.currency,
                  "EGP",
                  "USD",
                  "EUR",
                  "GBP",
                  "AED",
                  "SAR",
                ]),
              ).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </section>
        <section className="form-panel">
          <div className="panel-title">
            <h2>Find your table</h2>
            <p>Empty contact fields stay off your menu.</p>
          </div>
          {field("address", "Address", "Street, neighborhood, city")}
          {field("mapUrl", "Map link", "https://maps.google.com/", "url")}
          {field("phone", "Phone number", "+20 …", "tel")}
          {field(
            "contactEmail",
            "Contact email",
            "hello@restaurant.com",
            "email",
          )}
        </section>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="button primary" disabled={busy || uploading}>
          <Save size={17} />
          {busy ? "Saving…" : "Save page changes"}
        </button>
      </form>
      <aside className="preview-panel">
        <div className="preview-heading">
          <span>
            <span className="live-dot" />
            Live preview
          </span>
          <a
            href={`/m/${menu.slug}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Open public menu"
          >
            <ExternalLink size={17} />
          </a>
        </div>
        <div className="phone-preview">
          <PublicMenu menu={draft} preview />
        </div>
      </aside>
    </div>
  );
}
