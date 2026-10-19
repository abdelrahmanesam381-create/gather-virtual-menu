import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { encodeImage } from "../src/lib/uploads";
test("uploads are decoded, resized, and converted to webp", async () => {
  const input = await sharp({
    create: { width: 1800, height: 900, channels: 3, background: "#456548" },
  })
    .png()
    .toBuffer();
  const output = await encodeImage(input, "image/png");
  const meta = await sharp(output).metadata();
  assert.equal(meta.format, "webp");
  assert.equal(meta.width, 1600);
});
test("uploads reject bad bytes, unsupported types and files over 5 MB", async () => {
  await assert.rejects(() =>
    encodeImage(Buffer.from("not an image"), "image/png"),
  );
  await assert.rejects(() =>
    encodeImage(Buffer.from("<svg/>"), "image/svg+xml"),
  );
  await assert.rejects(() =>
    encodeImage(Buffer.alloc(5 * 1024 * 1024 + 1), "image/png"),
  );
});
