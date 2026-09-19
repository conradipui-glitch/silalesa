import fs from "node:fs/promises";

const prerenderPath = "scripts/prerender.mjs";
let prerender = await fs.readFile(prerenderPath, "utf8");
const importAnchor = 'import path from "node:path";';
if (!prerender.includes(importAnchor) || prerender.includes('renderPlasterFallback } from "./plaster-fallback.mjs"')) throw new Error("Unexpected prerender imports");
prerender = prerender.replace(importAnchor, `${importAnchor}\nimport { renderPlasterFallback } from "./plaster-fallback.mjs";`);
const start = prerender.indexOf("  const plasterVisual = isPlasterGuide\n");
const end = prerender.indexOf("  const sections = isGuide", start);
if (start < 0 || end <= start || prerender.indexOf("  const plasterVisual = isPlasterGuide\n", start + 1) !== -1) throw new Error("Cannot locate exactly one plaster fallback");
prerender = prerender.slice(0, start)
  + '  const plasterVisual = isPlasterGuide\n    ? renderPlasterFallback({ siteUrl: SITE_URL, slug: page.slug, whatsapp: whatsappMatch[1] })\n    : "";\n'
  + prerender.slice(end);
await fs.writeFile(prerenderPath, prerender);

const r1Path = "scripts/check-r1.mjs";
let r1 = await fs.readFile(r1Path, "utf8");
const oldAssertion = "assert(p01Html.includes('Матрица сравнения смет'), 'R2 interactive semantic fallback intact');";
if (!r1.includes(oldAssertion)) throw new Error("Unexpected R1 fallback check");
r1 = r1.replace(oldAssertion, "assert(p01Html.includes('Одна смета или две') && p01Html.includes('Карта нанесения и проверки смет штукатурки'), 'R2 interactive semantic fallback intact');");
await fs.writeFile(r1Path, r1);
console.log("Applied R2 prerender and backwards-compatible R1 regression checks; unchanged CI workflow");
