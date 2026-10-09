import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const overrides = JSON.parse(read("src/data/seo-page-overrides-r3.json"));
const plasterGuide = JSON.parse(read("src/data/seo-page-guides-plaster.json"))[0];
const entries = [
  {
    slug: "guides/remont/shtukaturka-ili-styazhka-chto-snachala",
    page: overrides.find((x) => x.slug === "guides/remont/shtukaturka-ili-styazhka-chto-snachala"),
    marker: "Как посчитать штукатурку и стяжку до заказа",
    tools: ["kalkulyator-styazhki-pola", "kalkulyator-shtukaturki-sten"],
  },
  {
    slug: "guides/remont/polusuhaya-ili-mokraya-styazhka",
    page: overrides.find((x) => x.slug === "guides/remont/polusuhaya-ili-mokraya-styazhka"),
    marker: "20 м² при предполагаемой средней толщине 50 мм",
    tools: ["kalkulyator-styazhki-pola"],
  },
  {
    slug: "guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka",
    page: plasterGuide,
    marker: "периметр каждой комнаты × высота, минус окна и двери",
    tools: ["kalkulyator-shtukaturki-sten"],
  },
  {
    slug: "guides/remont/gipsovaya-ili-tsementnaya-shtukaturka",
    page: overrides.find((x) => x.slug === "guides/remont/gipsovaya-ili-tsementnaya-shtukaturka"),
    marker: "паспортный расход именно выбранной смеси",
    tools: ["kalkulyator-shtukaturki-sten"],
  },
];

const site = "https://conradipui-glitch.github.io/silalesa/";
const sitemap = read("dist/sitemap.xml");
assert.equal((sitemap.match(/<loc>/g) ?? []).length, 12, "No thin duplicate SEO pages created");

for (const entry of entries) {
  assert.ok(entry.page, "Missing SEO wave 2 guide: " + entry.slug);
  const src = JSON.stringify(entry.page);
  const html = read("dist/" + entry.slug + "/index.html");
  assert.ok(src.includes(entry.marker), "Missing buyer-oriented source: " + entry.slug);
  assert.ok(html.includes(entry.marker.replaceAll("×", "×")), "Prerender lost wave 2 text: " + entry.slug);
  assert.ok(/<meta name="robots" content="index, follow"/.test(html), "Guide lost indexability: " + entry.slug);
  assert.ok(html.includes(`rel="canonical" href="${site}${entry.slug}/"`), "Guide canonical mismatch: " + entry.slug);
  assert.ok(!/бан[ьяиею]|квадро|саун/iu.test(html.match(/<main>[\s\S]*?<\/main>/)?.[0] ?? ""), "Bath text in repair guide: " + entry.slug);
  for (const tool of entry.tools) {
    assert.ok(html.includes(`${site}${tool}/`), "Missing useful calculator link in no-JS HTML: " + entry.slug + " → " + tool);
  }
}

const sequence = read("dist/guides/remont/shtukaturka-ili-styazhka-chto-snachala/index.html");
assert.ok(sequence.includes("Один объект — два разных расчёта"), "Missing standalone dual-tool choice without JavaScript");
assert.ok(sequence.includes("45,3 м²") && sequence.includes("20 м²"), "Two differently measured areas not explained");
assert.ok(sequence.includes("не означает автоматически единый пакет"), "Guide must not imply a combined package price");

console.log("SEO_WAVE2_PASS: four buyer-useful repair articles, 2 different calculator intents, no-JS/SEO parity and no new duplicate route.");
