const fs = require("fs");
const path =
  "C:/Users/QATester/.cursor/projects/c-Users-QATester-Documents-Cypress-CmoreSIBS/agent-transcripts/63ffb041-7334-44d7-a695-b2a7fa6e7514/63ffb041-7334-44d7-a695-b2a7fa6e7514.jsonl";
const lines = fs.readFileSync(path, "utf8").split("\n");
const line = lines.find((l) => l.includes("wire:model") || l.includes("data-test"));
if (!line) {
  console.log("No line found");
  process.exit(1);
}
const html = JSON.parse(line).message.content.find((c) => c.type === "text").text;
const dataTests = [...html.matchAll(/data-test="([^"]+)"/g)].map((m) => m[1]);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
const wireModels = [...html.matchAll(/wire:model(?:\.[^=]+)?="([^"]+)"/g)].map((m) => m[1]);
console.log("=== data-test ===");
console.log([...new Set(dataTests)].join("\n"));
console.log("\n=== ids (form related) ===");
console.log(
  [...new Set(ids)]
    .filter((id) => !id.startsWith("ts-") && !id.includes("dropdown"))
    .join("\n")
);
console.log("\n=== wire:model ===");
console.log([...new Set(wireModels)].join("\n"));
