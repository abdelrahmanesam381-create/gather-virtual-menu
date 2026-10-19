import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
const patterns = [
  [/\beval\s*\(/, "eval"],
  [/new\s+Function\s*\(/, "dynamic function"],
  [/dangerouslySetInnerHTML/, "raw HTML insertion"],
  [/\$queryRawUnsafe|\$executeRawUnsafe/, "unsafe SQL"],
  [/@ts-nocheck/, "disabled type checking"],
  [
    /localStorage.*(?:token|password)|(?:token|password).*localStorage/i,
    "credentials in local storage",
  ],
];
function scan(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(file);
    else if (/\.[cm]?[jt]sx?$/.test(file)) {
      const text = readFileSync(file, "utf8");
      for (const [regex, label] of patterns)
        if (regex.test(text))
          throw Error(`Forbidden pattern ${label}: ${file}`);
    }
  }
}
scan("src");
console.log("Forbidden-pattern checks passed.");
