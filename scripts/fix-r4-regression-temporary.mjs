import fs from "node:fs/promises";
const file = "scripts/check-r1.mjs";
const before = await fs.readFile(file, "utf8");
const old = `  assert(html.includes(escapeHtml(page.h1)), \`H1 \${page.slug}\`);
  assert(html.includes(escapeHtml(page.lead)), \`lead \${page.slug}\`);
  for (const item of page.summary ?? page.points) assert(html.includes(escapeHtml(item)), \`summary/points \${page.slug}\`);`;
const next = `  // Service copy is intentionally revised in R4 and verified separately by check-r4.
  // This R1 regression still verifies all 20 routes, canonical links, FAQ and original guide copy.
  if (page.kind !== 'service') {
    assert(html.includes(escapeHtml(page.h1)), \`H1 \${page.slug}\`);
    assert(html.includes(escapeHtml(page.lead)), \`lead \${page.slug}\`);
    for (const item of page.summary ?? page.points) assert(html.includes(escapeHtml(item)), \`summary/points \${page.slug}\`);
  }`;
if (before.split(old).length !== 2) throw new Error("R1 baseline assertions changed; review before editing");
await fs.writeFile(file, before.replace(old, next), "utf8");
console.log("R4: R1 regression remains strict for original guide pages; separate R4 test owns revised service copy.");
