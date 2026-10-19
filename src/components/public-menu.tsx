import { MapPin, Phone, Mail, UtensilsCrossed } from "lucide-react";
import type { MenuData } from "@/lib/types";
export function money(value: string, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value));
}
export function PublicMenu({
  menu,
  preview = false,
}: {
  menu: MenuData;
  preview?: boolean;
}) {
  const categories = menu.categories
    .map((c) => ({
      ...c,
      placements: c.placements.filter((p) => !p.item.isHidden),
    }))
    .filter((c) => c.placements.length);
  return (
    <article className={`public-menu ${preview ? "is-preview" : ""}`}>
      {menu.bannerImageUrl && (
        <div className="menu-banner">
          <img src={menu.bannerImageUrl} alt="" width={1600} height={600} />
        </div>
      )}
      <header className="restaurant-heading">
        <div className="restaurant-mark">
          <UtensilsCrossed size={23} />
        </div>
        <h1>{menu.pageTitle || "Our menu"}</h1>
        {menu.description && <p>{menu.description}</p>}
        <span className="menu-greeting">Good food. Good company.</span>
      </header>
      {!!categories.length && (
        <nav className="category-nav" aria-label="Menu categories">
          {categories.map((c) => (
            <a key={c.id} href={`#${preview ? "preview-" : ""}${c.id}`}>
              {c.name}
            </a>
          ))}
        </nav>
      )}
      <div className="public-content">
        {!categories.length ? (
          <div className="empty-state">
            <UtensilsCrossed />
            <h2>Something good is on its way</h2>
            <p>
              We’re putting the finishing touches on our menu. Check back soon.
            </p>
          </div>
        ) : (
          categories.map((category) => (
            <section
              className="public-category"
              key={category.id}
              id={`${preview ? "preview-" : ""}${category.id}`}
            >
              <div className="public-section-heading">
                <h2>{category.name}</h2>
                <span>
                  {category.placements.length}{" "}
                  {category.placements.length === 1 ? "dish" : "dishes"}
                </span>
              </div>
              {category.description && (
                <p className="category-description">{category.description}</p>
              )}
              <div className="dish-grid">
                {category.placements.map(({ item }) => (
                  <div className="dish" key={item.id}>
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={item.title}
                        width={360}
                        height={260}
                        loading="lazy"
                      />
                    ) : (
                      <div className="dish-placeholder">
                        <UtensilsCrossed size={28} />
                      </div>
                    )}
                    <div className="dish-copy">
                      <div className="dish-title">
                        <h3>{item.title}</h3>
                        <span>{money(item.price, menu.currency)}</span>
                      </div>
                      {item.description && <p>{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
      <footer className="restaurant-footer">
        <h2>{menu.pageTitle || "Come join us"}</h2>
        <div>
          {menu.address && (
            <p>
              <MapPin size={17} />
              {menu.address}
            </p>
          )}
          {menu.mapUrl && (
            <a href={menu.mapUrl} target="_blank" rel="noreferrer">
              Find us on the map
            </a>
          )}
          {menu.phone && (
            <a href={`tel:${menu.phone.replace(/[^+\d]/g, "")}`}>
              <Phone size={17} />
              {menu.phone}
            </a>
          )}
          {menu.contactEmail && (
            <a href={`mailto:${menu.contactEmail}`}>
              <Mail size={17} />
              {menu.contactEmail}
            </a>
          )}
        </div>
        <span className="powered">
          Made with <strong>gather</strong>
        </span>
      </footer>
    </article>
  );
}
