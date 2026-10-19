import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import { PublicMenu } from "../src/components/public-menu";
import type { MenuData } from "../src/lib/types";

type Settings = {
  snapshots: string;
  uploads: string;
  assets: string;
  stylesheet: string;
};
export function createPublicServer(settings: Settings) {
  return createServer(async (request, response) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405);
      response.end();
      return;
    }
    const pathname = new URL(request.url || "/", "http://localhost").pathname;
    try {
      let content: Buffer | string;
      let type: string;
      const menuMatch = pathname.match(/^\/m\/([a-z0-9-]{1,120})$/);
      const mediaMatch = pathname.match(/^\/media\/([a-f0-9-]{36}\.webp)$/);
      const imageMatch = pathname.match(/^\/images\/([a-z0-9-]+\.webp)$/);
      if (menuMatch) {
        const menu: MenuData = JSON.parse(
          await readFile(
            path.join(settings.snapshots, `${menuMatch[1]}.json`),
            "utf8",
          ),
        );
        content =
          "<!doctype html>" +
          renderToStaticMarkup(
            <html lang="en">
              <head>
                <meta charSet="utf-8" />
                <meta
                  name="viewport"
                  content="width=device-width, initial-scale=1"
                />
                <meta httpEquiv="refresh" content="45" />
                <title>{menu.pageTitle || "Our menu"}</title>
                <meta
                  name="description"
                  content={menu.description || "Discover our menu."}
                />
                <meta
                  property="og:title"
                  content={menu.pageTitle || "Our menu"}
                />
                {menu.bannerImageUrl && (
                  <meta property="og:image" content={menu.bannerImageUrl} />
                )}
                <link rel="stylesheet" href="/menu.css" />
              </head>
              <body>
                <main>
                  <PublicMenu menu={menu} />
                </main>
              </body>
            </html>,
          );
        type = "text/html; charset=utf-8";
        response.setHeader("Cache-Control", "public, max-age=30");
      } else if (pathname === "/menu.css") {
        content = await readFile(settings.stylesheet);
        type = "text/css; charset=utf-8";
        response.setHeader("Cache-Control", "public, max-age=300");
      } else if (mediaMatch || imageMatch) {
        content = await readFile(
          path.join(
            mediaMatch ? settings.uploads : settings.assets,
            (mediaMatch || imageMatch)![1],
          ),
        );
        type = "image/webp";
        response.setHeader(
          "Cache-Control",
          "public, max-age=31536000, immutable",
        );
      } else {
        response.writeHead(404);
        response.end("Menu not found");
        return;
      }
      response.setHeader("Content-Type", type);
      response.writeHead(200);
      response.end(request.method === "HEAD" ? undefined : content);
    } catch {
      response.writeHead(404);
      response.end("Menu not found");
    }
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  try {
    process.loadEnvFile(".env");
  } catch {}
  const settings = {
    snapshots: path.resolve(process.env.SNAPSHOT_DIR || "var/snapshots"),
    uploads: path.resolve(process.env.UPLOAD_DIR || "var/uploads"),
    assets: path.resolve("public/images"),
    stylesheet: path.resolve("src/app/globals.css"),
  };
  const port = Number(process.env.PUBLIC_PORT || 3001);
  createPublicServer(settings).listen(port, "127.0.0.1", () =>
    console.log(
      `Read-only public menu server: http://localhost:${port}/m/olive-table`,
    ),
  );
}
