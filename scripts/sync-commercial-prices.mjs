// Keep standalone calculator domain modules import-free for isolated math tests.
// The JSON registry is authoritative; this script updates generated numeric constants at build time.
import fs from "node:fs";
const registry = JSON.parse(fs.readFileSync("src/data/commercialRegistry.json", "utf8"));
const sources = [
  ["plaster", "src/lib/plasterCalculator.ts", "PLASTER_START_PRICE"],
  ["screed", "src/lib/screedCalculator.ts", "SCREED_START_PRICE"],
];
for (const [id, file, constant] of sources) {
  const service = registry.services.find((x) => x.id === id);
  if (!service || !Number.isFinite(service.priceFrom) || service.priceFrom <= 0) throw Error(`Missing valid ${id} price in commercialRegistry.json`);
  const src = fs.readFileSync(file, "utf8");
  const expr = new RegExp(`export const ${constant} = \\d+;`);
  if (!expr.test(src)) throw Error(`Cannot update ${constant} in ${file}`);
  const next = src.replace(expr, `export const ${constant} = ${service.priceFrom};`);
  if (next !== src) fs.writeFileSync(file, next);
}
console.log("COMMERCIAL_PRICE_SYNC_PASS");
