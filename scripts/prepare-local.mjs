import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
const source = readFileSync(".env", "utf8");
if (!/SEED_PASSWORD=".+"/.test(source)) {
  const password = randomBytes(18).toString("base64url");
  writeFileSync(
    ".env",
    source.replace('SEED_PASSWORD=""', `SEED_PASSWORD="${password}"`),
  );
  mkdirSync("var", { recursive: true });
  writeFileSync(
    "var/demo-access.txt",
    `Local demo only\nEmail: demo@example.com\nPassword: ${password}\nMenu: http://localhost:3000/m/olive-table\n`,
  );
  console.log(
    "Random demo credentials saved to var/demo-access.txt (gitignored).",
  );
}
