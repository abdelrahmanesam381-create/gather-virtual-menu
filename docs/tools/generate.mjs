import { readFileSync, writeFileSync, readdirSync } from "node:fs";
const check = process.argv.includes("--check");
const schema = JSON.parse(readFileSync("docs/schema.json", "utf8"));
function output(path, text) {
  if (check) {
    if (readFileSync(path, "utf8") !== text)
      throw Error(`Stale generated file: ${path}`);
  } else writeFileSync(path, text);
}
output(
  "docs/enums.md",
  "# Generated enum catalogue\n\nDo not edit. Source: schema.json.\n\n" +
    schema.enums
      .map((e) => `## ${e.name}\n${e.values.join(", ")}\n`)
      .join("\n"),
);
output(
  "docs/erd.md",
  "# Generated relationships\n\nDo not edit. Source: schema.json.\n\n```mermaid\nerDiagram\n" +
    schema.relations
      .map((r) => `  ${r.from} ||--o{ ${r.to} : "${r.label}"`)
      .join("\n") +
    "\n```\n",
);
const physical = readFileSync("prisma/schema.prisma", "utf8");
for (const model of schema.models) {
  const block = physical.match(
    new RegExp(`model ${model.name} \\{([\\s\\S]*?)\\n\\}`),
  )?.[1];
  if (!block) throw Error(`Missing runtime model ${model.name}`);
  for (const field of model.fields)
    if (
      !new RegExp(
        `\\b${field.name}\\s+${field.type.replace(/[\[\]?]/g, "\\$&")}`,
      ).test(block)
    )
      throw Error(`Field drift ${model.name}.${field.name}`);
}
for (const name of [
  "Virtual Menu Platform — PRD.md",
  "schema.prisma",
  "WORKFLOW.md",
])
  if (
    !readFileSync(name).equals(readFileSync(`Product/Drafted Planning/${name}`))
  )
    throw Error(`Protected source copy drift: ${name}`);
for (const name of readdirSync("docs/Specs").filter((x) => x.startsWith("SP-")))
  if (
    !readFileSync(`docs/Specs/${name}`).equals(
      readFileSync(`Product/Docs/3-Features/${name}`),
    )
  )
    throw Error(`Product mirror drift: ${name}`);
console.log(
  "Schema, derived catalogues, protected sources and capability mirrors are consistent.",
);
