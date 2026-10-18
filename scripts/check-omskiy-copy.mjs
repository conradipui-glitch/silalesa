import assert from "node:assert/strict";
import fs from "node:fs";

const entries = JSON.parse(fs.readFileSync("src/data/seo-service-copy-2026.json", "utf8"));
assert.equal(entries.length, 3, "Exactly three priority service pages");
for (const page of entries) {
  const html = fs.readFileSync(`dist/${page.slug}/index.html`, "utf8");
  assert.ok(html.includes(`<title>${page.title}</title>`), `Static title: ${page.slug}`);
  assert.ok(html.includes(`content="${page.description}"`), `Static description: ${page.slug}`);
  for (const section of page.sections) {
    assert.ok(html.includes(`<h2>${section.heading}</h2>`), `Static H2: ${page.slug}`);
    assert.ok(html.includes(section.paragraphs[0]), `Useful service explanation: ${page.slug}`);
    for (const bullet of section.bullets ?? []) {
      assert.ok(html.includes(bullet), `Static bullet: ${page.slug}`);
    }
  }
}
const catalogue = fs.readFileSync("src/sections/ConstructionHome.tsx", "utf8");
assert.ok(catalogue.includes("Для обсуждения возможности:"), "Catalogue clarifies consultation status");
assert.ok(catalogue.includes("Уточнить возможность"), "Consultation CTA is honest");
for (const name of ["Screed", "Plaster"]) {
  const code = fs.readFileSync(`src/components/${name}Calculator.tsx`, "utf8");
  assert.ok(code.includes("Карточка для предварительной оценки исполнителем"), `${name} card copy`);
}
const footer = fs.readFileSync("src/components/ConstructionChrome.tsx", "utf8");
assert.ok(footer.includes("Цены и расчёты на сайте предварительные"), "Footer explains estimate nature");
console.log("OMSK_CONTENT_2026_PASS: 3 SEO pages, static copy parity, CTA, calculators, footer");
