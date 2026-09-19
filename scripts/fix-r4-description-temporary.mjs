import fs from "node:fs/promises";
const file = "src/data/seo-page-overrides-r4.json";
const text = await fs.readFile(file, "utf8");
const old = "Бурение скважин на воду в Омске от 2 500 ₽ за погонный метр.";
const next = "Бурение скважин на воду в Омске от 2 500 ₽/пог. м.";
if (text.split(old).length !== 2) throw new Error("Unexpected drilling metadata: stop rather than blind replace");
await fs.writeFile(file, text.replace(old, next), "utf8");
console.log("R4: drilling metadata includes confirmed RUB price and per-metre unit.");
