import assert from "node:assert/strict";
import fs from "node:fs";
const r = JSON.parse(fs.readFileSync("src/data/commercialRegistry.json", "utf8"));
assert.equal(r.services.length, 14);
assert.equal(new Set(r.services.map((s) => s.id)).size, 14);
assert.equal(new Set(r.services.map((s) => s.title)).size, 14);
assert.ok(r.services.every((s) => ["primary","consultation","paused"].includes(s.status)));
assert.ok(r.services.every((s) => ["details","contact"].includes(s.action)));
assert.ok(r.services.every((s) => s.priceFrom === null || Number.isFinite(s.priceFrom)));
assert.ok(r.standalonePages.some((s) => s.landingSlug === "burenie-skvazhiny-omsk"));
const map = fs.readFileSync("dist/sitemap.xml","utf8");
for (const s of [...r.services,...r.standalonePages]) {
  if (!s.landingSlug) continue;
  const has = map.includes("/"+s.landingSlug+"/");
  assert.equal(has, s.status !== "paused", "Unexpected sitemap state for "+s.id);
  const html = fs.readFileSync("dist/"+s.landingSlug+"/index.html","utf8");
  if (s.status === "paused") {
    assert.match(html, /noindex, follow/);
    assert.match(html, /временно приостановлен/);
  } else {
    assert.match(html,/index, follow/);
  }
}
const urls = [...map.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
assert.ok(urls.every(u => u.startsWith("https://")));
assert.ok(!urls.some(u => /banya|sauna|kvadro|karkasnaya-5-5/.test(u)));
console.log("COMMERCIAL_REGISTRY_PASS: statuses, prices, public routes");
