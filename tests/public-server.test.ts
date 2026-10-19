import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { createPublicServer } from "../scripts/public-server";
test("independent public server reads snapshots without dashboard or database", async () => {
  await mkdir("var/tests", { recursive: true });
  const root = await mkdtemp(path.resolve("var/tests/public-"));
  const menu = {
    id: "menu",
    slug: "test-table",
    currency: "EGP",
    pageTitle: "Test & Table",
    description: null,
    bannerImageUrl: null,
    address: null,
    mapUrl: null,
    phone: null,
    contactEmail: null,
    categories: [],
    items: [],
  };
  await writeFile(path.join(root, "test-table.json"), JSON.stringify(menu));
  const server = createPublicServer({
    snapshots: root,
    uploads: root,
    assets: root,
    stylesheet: "src/app/globals.css",
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}`;
  try {
    const response = await fetch(`${base}/m/test-table`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /Test &amp; Table/);
    assert.match(html, /Something good is on its way/);
    assert.equal((await fetch(`${base}/m/missing`)).status, 404);
    assert.equal((await fetch(`${base}/media/%2e%2e%2f.env`)).status, 404);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((e) => (e ? reject(e) : resolve())),
    );
    assert.ok(root.startsWith(path.resolve("var/tests") + path.sep));
    await rm(root, { recursive: true });
  }
});
