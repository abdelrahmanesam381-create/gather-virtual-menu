"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UtensilsCrossed,
  BookOpen,
  PanelsTopLeft,
  Users,
  ExternalLink,
  Plus,
  Search,
  GripVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Check,
  LogOut,
  Leaf,
  Copy,
  ChevronDown,
} from "lucide-react";
import type { DashboardData, MenuCategory, MenuItem } from "@/lib/types";
import { api, Modal } from "./ui";
import { ItemEditor } from "./item-editor";
import { PageEditor } from "./page-editor";
import { TeamEditor } from "./team-editor";
import { money } from "./public-menu";
export function Dashboard({
  menu,
  admin,
  menus,
}: {
  menu: DashboardData;
  admin: { id: string; name: string | null; email: string };
  menus: { id: string; pageTitle: string | null }[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState("menu");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editor, setEditor] = useState<{
    item?: MenuItem;
    category?: string;
  } | null>(null);
  const [categoryEditor, setCategoryEditor] =
    useState<Partial<MenuCategory> | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshing, startTransition] = useTransition();
  const [drag, setDrag] = useState<{
    type: "category" | "item";
    id: string;
    categoryId?: string;
  } | null>(null);
  const disabled = busy || refreshing;
  async function action(name: string, data: unknown) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api(`/api/menus/${menu.id}/${name}`, data);
      setNotice(
        result?.warning ||
          (result?.delivery === "local-outbox"
            ? "Invitation saved to the development email outbox."
            : name === "invitations"
              ? "Invitation sent."
              : "Changes saved."),
      );
      startTransition(() => router.refresh());
      return result;
    } catch (error) {
      setError((error as Error).message);
      throw error;
    } finally {
      setBusy(false);
    }
  }
  function run(name: string, data: unknown) {
    void action(name, data).catch(() => {});
  }
  const assigned = new Set(
    menu.categories.flatMap((c) => c.placements.map((p) => p.item.id)),
  );
  const orphans = menu.items.filter((i) => !assigned.has(i.id));
  const visibleCount = menu.items.filter(
    (i) => !i.isHidden && assigned.has(i.id),
  ).length;
  function matches(item: MenuItem) {
    return (
      (!query ||
        `${item.title} ${item.description || ""}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (filter !== "hidden" || item.isHidden) &&
      (filter !== "visible" || !item.isHidden)
    );
  }
  function reorder(
    type: "category" | "item",
    ids: string[],
    from: number,
    to: number,
    categoryId?: string,
  ) {
    if (disabled || to < 0 || to >= ids.length || from === to) return;
    const next = [...ids];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    run(type === "category" ? "category-order" : "item-order", {
      ids: next,
      categoryId,
    });
  }
  function itemRow(
    item: MenuItem,
    placementId?: string,
    category?: MenuCategory,
    index = 0,
  ) {
    return (
      <div
        className={`item-row ${item.isHidden ? "item-hidden" : ""}`}
        key={placementId || item.id}
        draggable={!!placementId && !disabled && !query && filter === "all"}
        onDragStart={(e) => {
          e.stopPropagation();
          setDrag({ type: "item", id: placementId!, categoryId: category?.id });
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragOver={(e) => {
          if (drag?.type === "item" && drag.categoryId === category?.id)
            e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (
            drag?.type === "item" &&
            category &&
            drag.categoryId === category.id
          ) {
            const ids = category.placements.map((p) => p.id);
            reorder("item", ids, ids.indexOf(drag.id), index, category.id);
          }
          setDrag(null);
        }}
      >
        <GripVertical className="drag-handle" size={17} aria-hidden="true" />
        {item.photoUrl ? (
          <img
            className="item-photo"
            src={item.photoUrl}
            alt=""
            width={64}
            height={64}
          />
        ) : (
          <div className="item-photo placeholder">
            <UtensilsCrossed size={23} />
          </div>
        )}
        <div className="item-info">
          <div>
            <button className="item-name" onClick={() => setEditor({ item })}>
              {item.title}
            </button>
            {item.isHidden && <span className="hidden-label">Hidden</span>}
          </div>
          <p>{item.description || "No description yet"}</p>
        </div>
        <strong className="item-price">
          {money(item.price, menu.currency)}
        </strong>
        <div className="row-actions">
          {category && (
            <div className="order-buttons">
              <button
                disabled={disabled || index === 0}
                className="icon-button"
                aria-label={`Move ${item.title} up in ${category.name}`}
                onClick={() =>
                  reorder(
                    "item",
                    category.placements.map((p) => p.id),
                    index,
                    index - 1,
                    category.id,
                  )
                }
              >
                <ArrowUp size={14} />
              </button>
              <button
                disabled={disabled || index === category.placements.length - 1}
                className="icon-button"
                aria-label={`Move ${item.title} down in ${category.name}`}
                onClick={() =>
                  reorder(
                    "item",
                    category.placements.map((p) => p.id),
                    index,
                    index + 1,
                    category.id,
                  )
                }
              >
                <ArrowDown size={14} />
              </button>
            </div>
          )}
          <button
            className="icon-button"
            aria-label={`${item.isHidden ? "Show" : "Hide"} ${item.title}`}
            disabled={disabled || !assigned.has(item.id)}
            onClick={() =>
              run("items", {
                ...item,
                photoUrl: item.photoUrl || "",
                description: item.description || "",
                isHidden: !item.isHidden,
                categoryIds: menu.categories
                  .filter((c) =>
                    c.placements.some((p) => p.item.id === item.id),
                  )
                  .map((c) => c.id),
              })
            }
          >
            {item.isHidden ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
          <button
            className="icon-button"
            aria-label={`Edit ${item.title}`}
            onClick={() => setEditor({ item })}
          >
            <Pencil size={16} />
          </button>
          <button
            className="icon-button danger"
            aria-label={`Delete ${item.title}`}
            disabled={disabled}
            onClick={() => {
              if (
                confirm(
                  `Delete “${item.title}” from every category? This cannot be undone.`,
                )
              )
                run("item-delete", { id: item.id });
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/dashboard">
          <span className="brand-icon">
            <UtensilsCrossed size={23} />
          </span>
          gather<span className="brand-period">.</span>
        </a>
        <div className="restaurant-switcher">
          <div className="restaurant-avatar">
            {(menu.pageTitle || "M").slice(0, 1)}
          </div>
          <div>
            <strong>{menu.pageTitle || "Your restaurant"}</strong>
            <span>Restaurant workspace</span>
          </div>
          <ChevronDown size={15} />
          {menus.length > 1 && (
            <select
              aria-label="Switch restaurant"
              value={menu.id}
              onChange={(e) => router.push(`/dashboard?menu=${e.target.value}`)}
            >
              {menus.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.pageTitle || "Untitled menu"}
                </option>
              ))}
            </select>
          )}
        </div>
        <nav className="main-nav" aria-label="Workspace">
          {[
            { id: "menu", label: "Menu", icon: BookOpen },
            { id: "page", label: "Restaurant page", icon: PanelsTopLeft },
            { id: "team", label: "Team", icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button
              className={tab === id ? "active" : ""}
              aria-current={tab === id ? "page" : undefined}
              key={id}
              onClick={() => {
                setTab(id);
                setError("");
                setNotice("");
              }}
            >
              <Icon size={19} />
              {label}
              {id === "menu" && (
                <span className="nav-count">{menu.items.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Leaf size={22} />
            <strong>A fresh menu, always.</strong>
            <p>Small updates make a big difference at the table.</p>
            <a href={`/m/${menu.slug}`} target="_blank" rel="noreferrer">
              See your menu <ExternalLink size={14} />
            </a>
          </div>
          <div className="profile">
            <div className="avatar">
              {(admin.name || admin.email)[0].toUpperCase()}
            </div>
            <div>
              <strong>{admin.name || "Restaurant admin"}</strong>
              <span>Admin</span>
            </div>
            <button
              className="icon-button"
              aria-label="Sign out"
              onClick={async () => {
                try {
                  await api("/api/auth/logout", {});
                  router.push("/login");
                  router.refresh();
                } catch (error) {
                  setError((error as Error).message);
                }
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="workspace-topbar">
          <div className="breadcrumb">
            Workspace <span>/</span>{" "}
            <strong>
              {tab === "menu"
                ? "Menu"
                : tab === "page"
                  ? "Restaurant page"
                  : "Team"}
            </strong>
          </div>
          <a
            className="public-link"
            href={`/m/${menu.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            <span className="live-dot" />
            Your menu is live
            <ExternalLink size={15} />
          </a>
        </header>
        <main className="workspace-main">
          <div className="page-heading">
            <div>
              <h1>
                {tab === "menu"
                  ? "Your menu, beautifully served."
                  : tab === "page"
                    ? "A little more you."
                    : "Better, together."}
              </h1>
              <p>
                {tab === "menu"
                  ? "Curate your dishes. Keep things fresh. Make every first impression count."
                  : tab === "page"
                    ? "Give your menu a home that feels like your restaurant."
                    : "The people behind your restaurant’s menu."}
              </p>
            </div>
            {tab === "menu" && (
              <button
                className="button primary"
                disabled={!menu.categories.length || disabled}
                onClick={() => setEditor({})}
              >
                <Plus size={18} />
                Add item
              </button>
            )}
          </div>
          {notice && (
            <div className="notice" role="status">
              <Check size={17} />
              {notice}
              <button className="text-button" onClick={() => setNotice("")}>
                Dismiss
              </button>
            </div>
          )}
          {error && (
            <div className="error" role="alert">
              {error}
            </div>
          )}
          {tab === "menu" && (
            <>
              <div className="menu-overview">
                <div className="overview-icon">
                  <BookOpen size={26} />
                </div>
                <div>
                  <h2>{menu.pageTitle || "Your restaurant"} menu</h2>
                  <p>
                    <span>{menu.categories.length} categories</span>
                    <span>{visibleCount} visible items</span>
                    <span className="subtle-status">
                      <span className="live-dot" />
                      Updates go live when saved
                    </span>
                  </p>
                </div>
                <button
                  className="button secondary copy-link"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        `${location.origin}/m/${menu.slug}`,
                      );
                      setNotice("Menu link copied.");
                    } catch {
                      setError("Copy the menu URL from the View menu page.");
                    }
                  }}
                >
                  <Copy size={15} />
                  Copy menu link
                </button>
              </div>
              <div className="menu-toolbar">
                <div className="filter-tabs" aria-label="Filter items">
                  {[
                    ["all", "All items"],
                    ["visible", "Visible"],
                    ["hidden", "Hidden"],
                    [
                      "unassigned",
                      `Unassigned${orphans.length ? ` (${orphans.length})` : ""}`,
                    ],
                  ].map(([key, label]) => (
                    <button
                      className={filter === key ? "selected" : ""}
                      key={key}
                      onClick={() => setFilter(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <label className="search-field">
                  <Search size={17} />
                  <input
                    aria-label="Search menu"
                    placeholder="Search your menu…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
              </div>
              {filter === "unassigned" ? (
                <section className="category-panel">
                  <div className="category-heading">
                    <h2>Unassigned items</h2>
                    <span className="count-pill">{orphans.length}</span>
                  </div>
                  <p className="hint inset">
                    These items are kept safe but won’t appear on your public
                    menu. Edit an item to choose a category.
                  </p>
                  {orphans.filter(matches).map((i) => itemRow(i))}
                  {!orphans.length && (
                    <div className="empty-inline">
                      Everything has a place. No unassigned items.
                    </div>
                  )}
                </section>
              ) : (
                menu.categories.map((category, index) => {
                  const rows = category.placements.filter((p) =>
                    matches(p.item),
                  );
                  if ((query || filter !== "all") && !rows.length) return null;
                  return (
                    <section
                      className="category-panel"
                      key={category.id}
                      draggable={!disabled && !query && filter === "all"}
                      onDragStart={(e) => {
                        if (e.target !== e.currentTarget) return;
                        setDrag({ type: "category", id: category.id });
                      }}
                      onDragOver={(e) => {
                        if (drag?.type === "category") e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (drag?.type === "category")
                          reorder(
                            "category",
                            menu.categories.map((c) => c.id),
                            menu.categories.findIndex((c) => c.id === drag.id),
                            index,
                          );
                        setDrag(null);
                      }}
                    >
                      <div className="category-heading">
                        <GripVertical className="drag-handle" size={18} />
                        <h2>{category.name}</h2>
                        <span className="count-pill">
                          {category.placements.length}
                        </span>
                        <div className="category-actions">
                          <button
                            disabled={disabled || index === 0}
                            className="icon-button"
                            aria-label={`Move ${category.name} up`}
                            onClick={() =>
                              reorder(
                                "category",
                                menu.categories.map((c) => c.id),
                                index,
                                index - 1,
                              )
                            }
                          >
                            <ArrowUp size={15} />
                          </button>
                          <button
                            disabled={
                              disabled || index === menu.categories.length - 1
                            }
                            className="icon-button"
                            aria-label={`Move ${category.name} down`}
                            onClick={() =>
                              reorder(
                                "category",
                                menu.categories.map((c) => c.id),
                                index,
                                index + 1,
                              )
                            }
                          >
                            <ArrowDown size={15} />
                          </button>
                          <button
                            className="icon-button"
                            aria-label={`Edit ${category.name}`}
                            onClick={() => setCategoryEditor(category)}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            className="icon-button danger"
                            disabled={disabled}
                            aria-label={`Delete ${category.name}`}
                            onClick={() => {
                              if (
                                confirm(
                                  `Delete “${category.name}”? Items will be kept. Items with no other category will move to Unassigned and disappear from the public menu.`,
                                )
                              )
                                run("category-delete", { id: category.id });
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                      {rows.map((p) =>
                        itemRow(
                          p.item,
                          p.id,
                          category,
                          category.placements.findIndex((x) => x.id === p.id),
                        ),
                      )}
                      {!rows.length && (
                        <div className="empty-inline">
                          Ready for something delicious. Add the first item to
                          this category.
                        </div>
                      )}
                      <button
                        className="add-inline"
                        onClick={() => setEditor({ category: category.id })}
                      >
                        <Plus size={16} />
                        Add item to {category.name}
                      </button>
                    </section>
                  );
                })
              )}
              {!menu.categories.length && filter !== "unassigned" && (
                <div className="empty-state">
                  <BookOpen size={34} />
                  <h2>Let’s set the table</h2>
                  <p>
                    Start with a category, add your first dish, then make your
                    restaurant page your own.
                  </p>
                </div>
              )}
              {(query || filter === "hidden" || filter === "visible") &&
                !menu.items.some(matches) && (
                  <div className="empty-inline">
                    No items match. Try another search or filter.
                  </div>
                )}
              <button
                className="add-category"
                onClick={() => setCategoryEditor({})}
              >
                <Plus size={19} />
                Add a category
              </button>
              <div className="bottom-tip">
                <GripVertical size={15} />
                Drag to reorder, or use the arrow buttons. Your changes are
                saved automatically.
              </div>
            </>
          )}
          {tab === "page" && (
            <PageEditor
              key={menu.id}
              menu={menu}
              onSave={(data) => action("page", data)}
            />
          )}
          {tab === "team" && (
            <TeamEditor
              menu={menu}
              currentAdminId={admin.id}
              onAction={action}
            />
          )}
        </main>
        <footer className="workspace-footer">
          A little care in every detail.<span>Made with gather.</span>
        </footer>
      </div>
      {editor && (
        <ItemEditor
          menu={menu}
          item={editor.item}
          defaultCategory={editor.category}
          onClose={() => setEditor(null)}
          onSave={(data) => action("items", data)}
        />
      )}
      {categoryEditor && (
        <Modal
          title={categoryEditor.id ? "Edit category" : "Add a category"}
          onClose={() => setCategoryEditor(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              try {
                await action("categories", {
                  id: categoryEditor.id,
                  name: data.get("name"),
                  description: data.get("description"),
                });
                setCategoryEditor(null);
              } catch {}
            }}
          >
            <div className="modal-body">
              <label>
                Category name
                <input
                  autoFocus
                  name="name"
                  defaultValue={categoryEditor.name || ""}
                  placeholder="e.g. Small plates"
                  required
                  maxLength={100}
                />
              </label>
              <label>
                Description <span className="optional">optional</span>
                <textarea
                  name="description"
                  defaultValue={categoryEditor.description || ""}
                  rows={3}
                  maxLength={500}
                  placeholder="A few words to whet the appetite."
                />
              </label>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="button secondary"
                onClick={() => setCategoryEditor(null)}
              >
                Cancel
              </button>
              <button className="button primary" disabled={disabled}>
                {busy ? "Saving…" : "Save category"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
