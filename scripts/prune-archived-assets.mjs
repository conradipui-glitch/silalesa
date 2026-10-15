// Build-output hygiene: archived sauna assets are not shipped with the current construction site.
// Historical sources stay in Git; no live route needs these binaries.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const dist = "dist", assetsDir = path.join(dist, "assets");
const archived = /^(?:kvadro-(?:2x2|3x2|4x2)|karkasnaya-5-5|interior-parnaya|interior-otdyh|hero-kvadro|hero-family-pool|winter)(?:[.-])/i;
const files = fs.readdirSync(assetsDir);
const candidates = files.filter(file => archived.test(file));
const html = (function gather(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(item => {
    const full=path.join(dir,item.name);
    return item.isDirectory() ? gather(full) : item.name.endsWith(".html") ? [fs.readFileSync(full,"utf8")] : [];
  });
})(dist).join("\n");
for (const name of candidates) assert.ok(!html.includes(name), `Published HTML references archived asset ${name}`);
for (const name of candidates) fs.rmSync(path.join(assetsDir,name));
const remaining = fs.readdirSync(assetsDir).filter(file => archived.test(file));
assert.deepEqual(remaining, [], "Archived bath binaries must not remain in distribution");
const publicIndex = fs.readFileSync(path.join(dist,"index.html"),"utf8");
const sitemap = fs.readFileSync(path.join(dist,"sitemap.xml"),"utf8");
assert.ok(!/бан(и|я|ю)|парн(ая|ую)|квадро|kvadro/iu.test(publicIndex), "Construction homepage must not promote archived bath offers");
assert.ok(!/banya|sauna|kvadro|mobilnaya-banya/iu.test(sitemap), "Construction sitemap must exclude archived bath routes");
console.log(`ARCHIVED_ASSET_ISOLATION_PASS: ${candidates.length} unused bath assets excluded from dist`);
