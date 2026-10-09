import assert from "node:assert/strict";
import fs from "node:fs";

const read = (p) => fs.readFileSync(p, "utf8");
const source = JSON.parse(read("src/data/seo-page-guides-wave3.json"));
const demand = JSON.parse(read("research/yaai/results/silalesa-wave3-construction-review-2026-10-10.json"));
const SITE = "https://conradipui-glitch.github.io/silalesa/";
assert.equal(source.length, 2, "W3 scoped to two distinct buyer intents");
assert.equal(demand.meteredTopRequests, 16, "16 live regional Wordstat requests recorded");
assert.equal(demand.source, "Yandex Wordstat TopRequests via yaai");
const slugs = new Set(source.map((p) => p.slug));
assert.equal(slugs.size, 2, "W3 canonical paths distinct");
assert.ok(source.every((p) => p.kind === "guide" && p.sections.length >= 5 && p.faq.length >= 5), "Guide depth and FAQ");
const sitemap = read("dist/sitemap.xml");
assert.equal((sitemap.match(/<loc>/g) ?? []).length, 14, "W3 should add exactly two routes to original twelve");
const hub = read("dist/services/index.html");
const home = read("dist/index.html");

for (const page of source) {
  assert.ok(page.description.length >= 100 && page.description.length <= 180, "Yandex snippet in reasonable range: " + page.slug);
  assert.ok(!/бан[ьяиею]|саун|квадро/i.test(JSON.stringify(page)), "No legacy sauna copy");
  assert.ok(!/гарантия\s+\d+|стоимость\s+от\s+\d+/iu.test(JSON.stringify(page)), "No unverified offer promise");
  const url = SITE + page.slug + "/";
  const html = read("dist/" + page.slug + "/index.html");
  assert.ok(sitemap.includes("<loc>" + url + "</loc>"), "Guide in sitemap: " + page.slug);
  assert.ok(html.includes('<link rel="canonical" href="' + url + '"'), "Canonical: " + page.slug);
  assert.ok(html.includes("<title>" + page.title + "</title>"), "Title: " + page.slug);
  assert.ok(html.includes(page.description) && html.includes(page.h1) && html.includes(page.lead), "Source and no-JS first answer parity");
  assert.ok(html.includes('"@type":"Article"') && html.includes('"@type":"FAQPage"'), "Structured data: " + page.slug);
  assert.ok(html.includes("data-prerendered=\"true\""), "Static readable page: " + page.slug);
  assert.ok(html.includes(SITE + "services/"), "Link to real service list: " + page.slug);
  assert.ok(html.includes('href="tel:+79136884533"') && !html.includes("https://wa.me/"), "Working phone CTA without retired WhatsApp: " + page.slug);
  assert.ok(hub.includes(url) && home.includes(url), "Discoverable on non-JS construction home + services hub: " + page.slug);
  assert.ok(html.includes("Связанные строительные материалы"), "Related construction context");
}
const masonry = source.find((p) => p.slug.includes("kladka"));
const dem = source.find((p) => p.slug.includes("demontazh"));
assert.ok(masonry && dem && masonry.slug !== dem.slug);
assert.ok(JSON.stringify(masonry).includes("4,4 м³") && JSON.stringify(masonry).includes("22 м²"), "Masonry geometry example 22 m² × 0.2m");
assert.ok(JSON.stringify(dem).includes("12 м²") && JSON.stringify(dem).includes("несущ"), "Demolition geometry and structural checks");
assert.ok(read("dist/" + masonry.slug + "/index.html").includes(SITE + dem.slug + "/"), "Cross-link from masonry to demolition");
assert.ok(read("dist/" + dem.slug + "/index.html").includes(SITE + masonry.slug + "/"), "Cross-link from demolition to masonry");
console.log("SEO_WAVE3_PASS: two original construction buyer guides; 14 canonical URLs; live Wordstat provenance; structured, static SEO and contextual conversion links.");
