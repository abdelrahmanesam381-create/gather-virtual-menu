import EmbeddedPostgres from "embedded-postgres";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
const directory = path.resolve("var/postgres");
mkdirSync("var", { recursive: true });
const pg = new EmbeddedPostgres({
  databaseDir: directory,
  user: "menu",
  password: "menu_local_only",
  port: 54329,
  persistent: true,
  authMethod: "scram-sha-256",
  postgresFlags: ["-h", "127.0.0.1"],
  onLog: () => {},
  onError: (message) => console.error(String(message)),
});
if (!existsSync(path.join(directory, "PG_VERSION"))) await pg.initialise();
await pg.start();
const client = pg.getPgClient();
await client.connect();
for (const name of ["virtual_menu", "virtual_menu_test"]) {
  const result = await client.query(
    "SELECT 1 FROM pg_database WHERE datname=$1",
    [name],
  );
  if (!result.rowCount) await client.query(`CREATE DATABASE ${name}`);
}
await client.end();
console.log(
  "Project-local PostgreSQL is ready on 127.0.0.1:54329 (virtual_menu and virtual_menu_test).",
);
async function stop() {
  await pg.stop();
  process.exit(0);
}
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 60000);
