// Regression for first Yandex-content wave: rendered, no-JS SEO and actual guide URLs.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const BASE = "https://conradipui-glitch.github.io/silalesa/";
const sources = [
  "seo-pages.json", "seo-page-guides.json", "seo-page-guides-remont.json",
  "seo-page-guides-screed.json", "seo-page-guides-plaster.json", "seo-page-guides-materials.json",
].flatMap((f) => JSON.parse(fs.readFileSync(path.join(root, "src/data", f), "utf8")));
const overrideFiles = [
  "seo-page-overrides.json", "seo-page-overrides-next.json", "seo-page-overrides-r3.json",
  "seo-page-overrides-r4.json", "seo-page-overrides-r5.json", "seo-page-overrides-r6.json", "seo-page-overrides-r7.json",
].flatMap((f) => JSON.parse(fs.readFileSync(path.join(root, "src/data", f), "utf8")));
const overrides = new Map();
for (const item of overrideFiles) overrides.set(item.slug, { ...(overrides.get(item.slug) ?? {}), ...item });
const effective = new Map(sources.map((source) => [source.slug, { ...source, ...(overrides.get(source.slug) ?? {}) }]));
const expected = {
  "guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka": "Механизированная или ручная штукатурка: что выбрать | Сила Леса",
  "guides/remont/polusuhaya-ili-mokraya-styazhka": "Полусухая или мокрая стяжка: что выбрать для пола | Сила Леса",
  "guides/remont/shtukaturka-ili-styazhka-chto-snachala": "Что сначала — штукатурка или стяжка пола? | Сила Леса",
  "guides/remont/gipsovaya-ili-tsementnaya-shtukaturka": "Гипсовая или цементная штукатурка: что выбрать | Сила Леса"
};
const requiredLinks = {
  "guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka": ["guides/remont/gipsovaya-ili-tsementnaya-shtukaturka", "guides/remont/shtukaturka-ili-styazhka-chto-snachala", "mehanizirovannaya-shtukaturka-omsk"],
  "guides/remont/gipsovaya-ili-tsementnaya-shtukaturka": ["guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka", "mehanizirovannaya-shtukaturka-omsk"],
  "guides/remont/polusuhaya-ili-mokraya-styazhka": ["guides/remont/shtukaturka-ili-styazhka-chto-snachala", "polusuhaya-styazhka-omsk"],
  "guides/remont/shtukaturka-ili-styazhka-chto-snachala": ["guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka", "guides/remont/polusuhaya-ili-mokraya-styazhka", "polusuhaya-styazhka-omsk", "mehanizirovannaya-shtukaturka-omsk"],
};
for (const [slug, title] of Object.entries(expected)) {
  const page = effective.get(slug);
  assert.ok(page, `Unknown SEO article: ${slug}`);
  assert.equal(page.title, title);
  assert.ok(page.description.length >= 100 && page.description.length <= 175, `Snippet description length ${slug}`);
  const html = fs.readFileSync(path.join(root, "dist",slug,"index.html"),"utf8");
  assert.ok(html.includes(`<title>${title}</title>`), `Static title missing ${slug}`);
  assert.ok(html.includes(page.description), `Static description missing ${slug}`);
  assert.ok(html.includes(page.h1), `Static H1 missing ${slug}`);
  assert.ok(html.includes(`<link rel="canonical" href="${BASE}${slug}/"`), `Canonical missing ${slug}`);
  assert.ok(html.includes('"@type":"Article"') && html.includes('"@type":"FAQPage"'), `Schema missing ${slug}`);
  assert.ok(html.includes('<nav aria-label="Материалы по теме">'), `Related topical nav missing ${slug}`);
  for (const link of requiredLinks[slug]) {
    assert.ok(effective.has(link), `Broken related source: ${link}`);
    assert.ok(html.includes(`${BASE}${link}/`), `Missing related URL ${slug} -> ${link}`);
  }
}
// The R3 interactive layout must not silently shadow the approved screed introduction.
const screedSlug = "guides/remont/polusuhaya-ili-mokraya-styazhka";
const screedSource = sources.find((source) => source.slug === screedSlug);
const screedOverride = overrideFiles.find((source) => source.slug === screedSlug);
const screedEffective = effective.get(screedSlug);
assert.ok(screedSource && screedOverride && screedEffective, "Screed guide source and effective data exist");
assert.ok(!Object.hasOwn(screedOverride, "lead") && !Object.hasOwn(screedOverride, "description"), "Interactive R3 overrides must not mask the edited source screed lead and description");
assert.equal(screedEffective.lead, screedSource.lead, "Screed lead matches the editor's source data");
assert.equal(screedEffective.description, screedSource.description, "Screed description matches the editor's source data");
const screedHtml = fs.readFileSync(path.join(root, "dist", screedSlug, "index.html"), "utf8");
assert.ok(screedHtml.includes(screedEffective.lead), "Static screed first answer reflects current source text");
assert.ok(screedHtml.includes(screedEffective.description), "Static screed description reflects current source text");
const plasterSlug = "guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka";
const plaster = effective.get(plasterSlug);
assert.ok(plaster && plaster.lead.includes("площадь и фото стен"), "Plaster guide explains what to send for an estimate");
assert.ok(fs.readFileSync(path.join(root, "dist", plasterSlug, "index.html"), "utf8").includes(plaster.lead), "Static plaster first answer reflects current source text");
console.log("CONSTRUCTION_COPY_PARITY_PASS: editorial source, effective SEO registry and no-JS HTML agree.");

console.log("YANDEX_ARTICLE_WAVE1_PASS: 4 topics, metadata, schema, canonicals and internal links in no-JS HTML.");
