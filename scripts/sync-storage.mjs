// One-time copy of local photos and snapshots into Supabase Storage.
// Usage: node --env-file=.env scripts/sync-storage.mjs
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "gather";
if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first.");
  process.exit(1);
}
const headers = { Authorization: `Bearer ${key}`, apikey: key };
const created = await fetch(`${url}/storage/v1/bucket`, {
  method: "POST",
  headers: { ...headers, "Content-Type": "application/json" },
  body: JSON.stringify({ id: bucket, name: bucket, public: false }),
});
if (!created.ok && created.status !== 400 && created.status !== 409)
  throw Error(
    `Bucket creation failed: ${created.status} ${await created.text()}`,
  );
const sources = [
  [
    process.env.UPLOAD_DIR || "var/uploads",
    "media",
    /^[a-f0-9-]{36}\.webp$/,
    "image/webp",
  ],
  [
    process.env.SNAPSHOT_DIR || "var/snapshots",
    "snapshots",
    /^[a-z0-9-]+\.json$/,
    "application/json",
  ],
];
let count = 0;
for (const [dir, prefix, pattern, type] of sources) {
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).filter((f) => pattern.test(f))) {
    const response = await fetch(
      `${url}/storage/v1/object/${bucket}/${prefix}/${file}`,
      {
        method: "POST",
        headers: { ...headers, "Content-Type": type, "x-upsert": "true" },
        body: readFileSync(path.join(dir, file)),
      },
    );
    if (!response.ok)
      throw Error(`${file}: ${response.status} ${await response.text()}`);
    count++;
  }
}
console.log(`Copied ${count} files to bucket "${bucket}".`);
