import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { AppError } from "./http";
export const uploadDir = () =>
  path.resolve(
    /* turbopackIgnore: true */ process.env.UPLOAD_DIR || "var/uploads",
  );
export async function encodeImage(input: Buffer, mime: string) {
  if (input.length > 5 * 1024 * 1024)
    throw new AppError(400, "Images must be 5 MB or smaller.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(mime))
    throw new AppError(400, "Choose a JPG, PNG or WebP image.");
  try {
    const image = sharp(input, {
      limitInputPixels: 40_000_000,
      animated: false,
    });
    const meta = await image.metadata();
    if (!["jpeg", "png", "webp"].includes(meta.format || ""))
      throw Error("Unsupported image");
    return await image
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new AppError(
      400,
      "This image could not be read. Choose a valid JPG, PNG or WebP image.",
    );
  }
}
export async function storeImage(input: Buffer, mime: string) {
  const output = await encodeImage(input, mime);
  const file = `${randomUUID()}.webp`;
  await mkdir(uploadDir(), { recursive: true });
  await writeFile(path.join(uploadDir(), file), output, { flag: "wx" });
  return `/media/${file}`;
}
