import path from "node:path";
import { db } from "./db";
import { getObject, putObject } from "./storage";
import { menuInclude } from "./menu-service";
import type { MenuData } from "./types";
const dir = () =>
  path.resolve(
    /* turbopackIgnore: true */ process.env.SNAPSHOT_DIR || "var/snapshots",
  );
export function publicData(menu: MenuData): MenuData {
  return {
    ...menu,
    items: menu.items.filter((i) => !i.isHidden),
    categories: menu.categories
      .map((c) => ({
        ...c,
        placements: c.placements.filter((p) => !p.item.isHidden),
      }))
      .filter((c) => c.placements.length > 0),
  };
}
export async function refreshSnapshot(menuId: string) {
  const menu = await db.menu.findUnique({
    where: { id: menuId },
    include: menuInclude,
  });
  if (!menu) return;
  const data = publicData(JSON.parse(JSON.stringify(menu)));
  await putObject(
    dir(),
    `snapshots/${menu.slug}.json`,
    JSON.stringify(data),
    "application/json",
    true,
  );
}
export async function getPublicMenu(slug: string): Promise<MenuData | null> {
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return null;
  try {
    const menu = await db.menu.findUnique({
      where: { slug },
      include: menuInclude,
    });
    return menu ? publicData(JSON.parse(JSON.stringify(menu))) : null;
  } catch {
    try {
      return JSON.parse(
        (await getObject(dir(), `snapshots/${slug}.json`)).toString("utf8"),
      );
    } catch {
      return null;
    }
  }
}
