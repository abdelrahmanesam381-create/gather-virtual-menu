"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { X, Upload, ImagePlus } from "lucide-react";
export async function api(path: string, body: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Unable to save. Try again.");
  return result.data;
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = ref.current;
    node?.showModal();
    return () => node?.close();
  }, []);
  return (
    <dialog ref={ref} className="modal" onCancel={onClose}>
      <div className="modal-heading">
        <h2>{title}</h2>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function ImageUpload({
  value,
  onChange,
  onBusyChange,
  label = "Photo",
}: {
  value: string;
  onChange: (value: string) => void;
  onBusyChange?: (busy: boolean) => void;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="upload-field">
      <span className="field-label">{label}</span>
      <div className="upload-box">
        {value ? (
          <img src={value} alt={`${label} preview`} />
        ) : (
          <div className="upload-placeholder">
            <ImagePlus size={28} />
            <span>A little appetite appeal</span>
          </div>
        )}
        <label
          className={`button secondary upload-button ${busy ? "disabled" : ""}`}
        >
          <Upload size={15} />
          {busy ? "Uploading…" : value ? "Change image" : "Upload image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.size > 5 * 1024 * 1024) {
                setError("Choose an image under 5 MB.");
                return;
              }
              setBusy(true);
              onBusyChange?.(true);
              setError("");
              try {
                const data = new FormData();
                data.set("file", file);
                const response = await fetch("/api/uploads", {
                  method: "POST",
                  body: data,
                });
                const result = await response.json();
                if (!response.ok) throw Error(result.error);
                onChange(result.data.url);
              } catch (error) {
                setError((error as Error).message);
              } finally {
                setBusy(false);
                onBusyChange?.(false);
                e.target.value = "";
              }
            }}
          />
        </label>
        {value && (
          <button
            className="text-button"
            type="button"
            onClick={() => onChange("")}
          >
            Remove
          </button>
        )}
      </div>
      <small>JPG, PNG or WebP. Up to 5 MB.</small>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
