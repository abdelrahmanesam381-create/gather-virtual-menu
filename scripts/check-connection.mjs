import { PrismaClient } from "@prisma/client";
try {
  process.loadEnvFile(".env");
} catch {}
const value = process.env.DATABASE_URL;
if (!value) throw Error("DATABASE_URL is missing. Configure it in .env.");
const url = new URL(value);
const local = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
if (
  !local &&
  !["require", "verify-full"].includes(url.searchParams.get("sslmode"))
)
  throw Error(
    "Remote database connections must specify sslmode=require or sslmode=verify-full.",
  );
const db = new PrismaClient({ datasourceUrl: value });
try {
  const result =
    await db.$queryRaw`SELECT current_database() AS database, current_user AS role`;
  console.log("Database connection succeeded.", {
    host: url.hostname,
    clientSslMode: url.searchParams.get("sslmode") || "local default",
    ...result[0],
  });
  const count = await db.menu.count();
  console.log(`Prisma schema is accessible; ${count} menu(s) found.`);
  const rows =
    await db.$queryRaw`SELECT relname, relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('admins','menus','menu_admins','categories','items','placements','invitations','sessions','rate_limits','_prisma_migrations')`;
  if (rows.length !== 10 || rows.some((row) => !row.relrowsecurity))
    throw Error("Application tables are missing RLS. Run the migrations.");
  console.log("Application tables have row-level security enabled.");
} catch (error) {
  console.error(
    "Database verification failed.",
    error?.code || error?.name || "Unknown error",
  );
  console.error(
    "Check the server-only DATABASE_URL, database role, network connection and applied migrations.",
  );
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
