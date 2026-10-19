import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
const sources = {
  restaurant: "photo-1414235077428-338989a2e8c0",
  bruschetta: "photo-1572695157366-5e585ab2b69f",
  salad: "photo-1512621776951-a57141f2eefd",
  pasta: "photo-1473093295043-cdd812d0e601",
  salmon: "photo-1467003909585-2f8a72700288",
  coffee: "photo-1509042239860-f550ce710b93",
  dessert: "photo-1578985545062-69928b1d9587",
};
await mkdir("public/images", { recursive: true });
for (const [name, id] of Object.entries(sources)) {
  const response = await fetch(
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${name === "restaurant" ? 1600 : 600}&q=80`,
  );
  if (!response.ok) throw Error(`Image download failed: ${name}`);
  const data = await sharp(Buffer.from(await response.arrayBuffer()))
    .resize({
      width: name === "restaurant" ? 1600 : 600,
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toBuffer();
  await writeFile(`public/images/${name}.webp`, data);
  console.log(`Saved ${name}.webp (${Math.round(data.length / 1024)} KB)`);
}
