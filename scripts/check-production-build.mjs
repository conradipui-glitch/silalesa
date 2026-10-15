import fs from "node:fs";
import assert from "node:assert/strict";
const base = process.env.SITE_ORIGIN?.replace(/\/$/,"") + "/";
assert.ok(base.startsWith("https://"));
for (const [path,segment] of [
  ["index.html", ""],
  ["services/index.html","services/"],
  ["kalkulyator-styazhki-pola/index.html","kalkulyator-styazhki-pola/"],
  ["kalkulyator-shtukaturki-sten/index.html","kalkulyator-shtukaturki-sten/"],
  ["mehanizirovannaya-shtukaturka-omsk/index.html","mehanizirovannaya-shtukaturka-omsk/"],
  ["polusuhaya-styazhka-omsk/index.html","polusuhaya-styazhka-omsk/"]
]) {
  const html=fs.readFileSync("dist/"+path,"utf8");
  assert.ok(html.includes(`rel="canonical" href="${base+segment}"`), `Canonical mismatch: ${path}`);
  assert.ok(!html.includes("conradipui-glitch.github.io"), `Stale preview URL: ${path}`);
}
assert.match(fs.readFileSync("dist/robots.txt","utf8"),new RegExp(base.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"sitemap.xml"));
assert.ok(fs.existsSync("dist/fonts/fonts.css"));
assert.ok(fs.existsSync("dist/404.html"));
assert.ok(fs.existsSync("dist/.htaccess"));
console.log("RU_ROOT_DEPLOY_SMOKE_PASS: preview links absent, static routes and fonts present");
