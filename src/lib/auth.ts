import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";
import { AppError } from "./http";
export const hashToken = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const newToken = () => randomBytes(32).toString("hex");
export async function createSession(adminId: string) {
  const token = newToken();
  const expires = new Date(Date.now() + 7 * 86400000);
  await db.session.create({
    data: { id: hashToken(token), adminId, expiresAt: expires },
  });
  (await cookies()).set("gather_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}
export async function currentAdmin() {
  const token = (await cookies()).get("gather_session")?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: hashToken(token) },
    include: { admin: true },
  });
  return session && session.expiresAt > new Date() ? session.admin : null;
}
export async function requireAdmin() {
  const admin = await currentAdmin();
  if (!admin) throw new AppError(401, "Sign in to continue.");
  return admin;
}
export async function endSession() {
  const jar = await cookies();
  const token = jar.get("gather_session")?.value;
  if (token) await db.session.deleteMany({ where: { id: hashToken(token) } });
  jar.delete("gather_session");
}
export const passwordHash = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);
export async function throttle(key: string, limit = 10) {
  const bucket = hashToken(key);
  const reset = new Date(Date.now() + 15 * 60000);
  const rows = await db.$queryRaw<
    { count: number }[]
  >`INSERT INTO rate_limits (key, count, "resetAt") VALUES (${bucket}, 1, ${reset}) ON CONFLICT (key) DO UPDATE SET count = CASE WHEN rate_limits."resetAt" <= NOW() THEN 1 ELSE rate_limits.count + 1 END, "resetAt" = CASE WHEN rate_limits."resetAt" <= NOW() THEN ${reset} ELSE rate_limits."resetAt" END RETURNING count`;
  if (rows[0].count > limit)
    throw new AppError(429, "Too many attempts. Please wait 15 minutes.");
}
