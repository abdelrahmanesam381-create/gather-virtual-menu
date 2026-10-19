"use client";
import { useState } from "react";
import type { MenuData, MenuItem } from "@/lib/types";
import { Modal, ImageUpload } from "./ui";
export function ItemEditor({
  menu,
  item,
  defaultCategory,
  onClose,
  onSave,
}: {
  menu: MenuData;
  item?: MenuItem;
  defaultCategory?: string;
  onClose: () => void;
  onSave: (data: unknown) => Promise<void>;
}) {
  const [photo, setPhoto] = useState(item?.photoUrl || "");
  const [categories, setCategories] = useState(
    item
      ? menu.categories
          .filter((c) => c.placements.some((p) => p.item.id === item.id))
          .map((c) => c.id)
      : defaultCategory
        ? [defaultCategory]
        : [],
  );
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  return (
    <Modal
      title={item ? "Edit menu item" : "Add a menu item"}
      onClose={onClose}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (uploading) return;
          setBusy(true);
          setError("");
          const form = new FormData(e.currentTarget);
          try {
            await onSave({
              id: item?.id,
              title: form.get("title"),
              description: form.get("description"),
              price: form.get("price"),
              photoUrl: photo,
              categoryIds: categories,
              isHidden: form.get("hidden") === "on",
            });
            onClose();
          } catch (error) {
            setError((error as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="modal-body">
          <ImageUpload
            onBusyChange={setUploading}
            value={photo}
            onChange={setPhoto}
          />
          <label>
            Item name
            <input
              name="title"
              defaultValue={item?.title}
              placeholder="e.g. Roasted tomato bruschetta"
              required
              maxLength={150}
            />
          </label>
          <label>
            Description <span className="optional">optional</span>
            <textarea
              name="description"
              defaultValue={item?.description || ""}
              placeholder="Ingredients, flavors, and the little details."
              maxLength={1000}
              rows={3}
            />
          </label>
          <label>
            Price ({menu.currency})
            <input
              name="price"
              inputMode="decimal"
              defaultValue={item?.price}
              placeholder="0.00"
              required
              pattern="[0-9]{1,8}(\.[0-9]{1,2})?"
            />
          </label>
          <fieldset>
            <legend>
              Categories <span className="optional">choose at least one</span>
            </legend>
            <div className="checkboxes">
              {menu.categories.map((c) => (
                <label className="check-label" key={c.id}>
                  <input
                    type="checkbox"
                    checked={categories.includes(c.id)}
                    onChange={(e) =>
                      setCategories(
                        e.target.checked
                          ? [...categories, c.id]
                          : categories.filter((id) => id !== c.id),
                      )
                    }
                  />
                  {c.name}
                </label>
              ))}
            </div>
            {!menu.categories.length && (
              <p className="hint">
                Create a category before adding your first item.
              </p>
            )}
          </fieldset>
          <label className="check-label">
            <input
              type="checkbox"
              name="hidden"
              defaultChecked={item?.isHidden}
            />
            Hide from the public menu
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="button primary"
            disabled={busy || uploading || !categories.length}
          >
            {busy ? "Saving…" : "Save item"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
