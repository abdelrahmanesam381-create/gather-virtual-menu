import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
// Supabase Storage when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
// (serverless hosts such as Vercel have no durable disk); local disk otherwise,
// where only the file name of the key is used.
const bucket = () => process.env.SUPABASE_STORAGE_BUCKET || "gather";
const remote = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
};
const objectUrl = (base: string, key: string) =>
  `${base}/storage/v1/object/${bucket()}/${key}`;
const headers = (key: string) => ({
  Authorization: `Bearer ${key}`,
  apikey: key,
});
export async function putObject(
  dir: string,
  key: string,
  data: Buffer | string,
  contentType: string,
  overwrite: boolean,
) {
  const config = remote();
  if (!config) {
    await mkdir(dir, { recursive: true });
    const destination = path.join(dir, path.basename(key));
    if (!overwrite) return writeFile(destination, data, { flag: "wx" });
    const temp = `${destination}.${randomUUID()}.tmp`;
    await writeFile(temp, data);
    return rename(temp, destination);
  }
  const response = await fetch(objectUrl(config.url, key), {
    method: "POST",
    headers: {
      ...headers(config.key),
      "Content-Type": contentType,
      "x-upsert": overwrite ? "true" : "false",
    },
    body: typeof data === "string" ? data : new Uint8Array(data),
  });
  if (!response.ok) throw Error(`Storage upload failed: ${response.status}`);
}
export async function getObject(dir: string, key: string) {
  const config = remote();
  if (!config) return readFile(path.join(dir, path.basename(key)));
  const response = await fetch(objectUrl(config.url, key), {
    headers: headers(config.key),
  });
  if (!response.ok) throw Error(`Storage read failed: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
