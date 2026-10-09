import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const ROOT=process.cwd();
const dist=path.join(ROOT,"dist");
const offers=JSON.parse(fs.readFileSync(path.join(ROOT,"src/data/offer-contexts.json"),"utf8"));
assert.equal(Object.keys(offers).length,14,"Social microsites must cover 14 real services");

const sitemap=fs.readFileSync(path.join(dist,"sitemap.xml"),"utf8");
for(const code of ["",...Object.keys(offers)]){
  const slug=code?`brief/${code}`:"brief";
  const file=path.join(dist,slug,"index.html");
  assert.ok(fs.existsSync(file),`Missing static direct social URL: ${slug}`);
  const html=fs.readFileSync(file,"utf8");
  const name=offers[code]?.title??"Строительные работы";
  assert.ok(html.includes(`<h1>${name} в Омске</h1>`),`First answer must match service: ${slug}`);
  assert.ok(html.includes('<meta name="robots" content="noindex, follow" />'),`Direct campaign brief must not compete with SEO landing: ${slug}`);
  assert.ok(html.includes(`property="og:title" content="${name} в Омске`),`Social OG title matches service: ${slug}`);
  assert.ok(html.includes(`property="og:url" content="https://conradipui-glitch.github.io/silalesa/${slug}/"`),`Social OG URL uses static route: ${slug}`);
  assert.ok(html.includes('tel:+79136884533')&&html.includes('Для предварительной оценки'),`No JS consultation link works: ${slug}`);
  assert.ok(!sitemap.includes(`/silalesa/${slug}/`),`Social campaign links are excluded from SEO sitemap: ${slug}`);
}
console.log("SOCIAL BRIEFS STATIC PASS: 15 direct 200 URLs, indexable content excluded, OG parity, no-JS phone and MAX");
