import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";
export default async function setup() {
  process.loadEnvFile(".env");
  const url = new URL(process.env.DATABASE_URL!);
  if (!["localhost", "127.0.0.1"].includes(url.hostname))
    throw Error("Browser fixtures require a local database.");
  const access = readFileSync("var/demo-access.txt", "utf8");
  const email = access.match(/Email: (.+)/)![1].trim();
  const db = new PrismaClient();
  try {
    await db.rateLimit.deleteMany({
      where: {
        key: createHash("sha256").update(`login:${email}`).digest("hex"),
      },
    });
  } finally {
    await db.$disconnect();
  }
}
