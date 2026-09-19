import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const site = "https://conradipui-glitch.github.io/silalesa/";
const models = JSON.parse(read("src/data/sauna-choice-models.json"));
const guides = JSON.parse(read("src/data/seo-page-overrides-r5.json"));
const source = JSON.parse(read("src/data/seo-page-guides.json"));
const seoModels = JSON.parse(read("src/data/seo-pages.json"));
const products = read("src/data/products.ts");
const whatsapp = products.match(/whatsapp:\s*"(\d+)"/)?.[1];
const client = read("src/pages/SeoLandingPage.tsx");
const component = read("src/components/SaunaChoiceGuide.tsx");
const fallback = read("scripts/prerender.mjs");
const sitemap = read("dist/sitemap.xml");
assert.ok(whatsapp, "Canonical WhatsApp contact");
assert.equal(models.length, 4);
assert.equal(guides.length, 4);
assert.equal(new Set(models.map((m) => m.key)).size, 4);
assert.equal(new Set(guides.map((p) => p.slug)).size, 4);
assert.deepEqual(guides.map((p) => p.slug), ["guides/bani/kvadro-ili-karkasnaya", "guides/bani/chto-vhodit-v-tsenu", "guides/bani/kak-vybrat-razmer-2x2-3x2-4x2", "guides/bani/gotovaya-ili-stroit"]);
for (const model of models) {
  const record = seoModels.find((p) => p.slug === model.slug);
  assert.equal(record?.productId, model.productId, `Canonical model route: ${model.key}`);
  const index = products.indexOf(`id: "${model.productId}"`);
  assert.ok(index >= 0, `Product exists: ${model.key}`);
  assert.equal(Number(products.slice(index, index + 400).match(/price: (\d+)/)?.[1]), model.price, `Model price matches company record: ${model.key}`);
  assert.ok(products.slice(index, index + 400).includes(`shortName: "${model.name}"`), `Model name matches company record: ${model.key}`);
  assert.ok(fs.existsSync(`dist/${model.slug}/index.html`), `Model route generated: ${model.key}`);
}
for (const page of guides) {
  assert.ok(source.some((entry) => entry.slug === page.slug && entry.kind === "guide"), `Only existing guide route revised: ${page.slug}`);
  assert.ok(page.summary.length === 4 && page.summary.every((text) => text.length < 170), `Four short main takeaways: ${page.slug}`);
  assert.ok(page.choiceModels.length >= 3 && page.choiceModels.every((key) => models.some((m) => m.key === key)), `Model selection: ${page.slug}`);
  assert.equal(page.choiceChecklist.length, 3, `Three helpful inquiry items: ${page.slug}`);
  assert.ok(page.choicePrompt.startsWith("Здравствуйте!") && page.choiceCtaLabel, `Contextual CTA: ${page.slug}`);
  const html = read(`dist/${page.slug}/index.html`);
  assert.ok(html.includes('data-prerendered="true"') && html.includes(`<link rel="canonical" href="${site}${page.slug}/"`), `SEO and no-JS: ${page.slug}`);
  assert.ok(html.includes(page.lead) && html.includes(page.description), `Live override text: ${page.slug}`);
  for (const take of page.summary) assert.ok(html.includes(take), `Guide summary parity: ${page.slug}`);
  assert.ok(html.includes(page.choiceHeading) && html.includes(page.choiceIntro), `Guide buyer section: ${page.slug}`);
  assert.ok(html.indexOf("Цены выбранных бань") < html.indexOf(page.choiceHeading), `Early price before details: ${page.slug}`);
  for (const key of page.choiceModels) {
    const m = models.find((item) => item.key === key);
    assert.ok(html.includes(`${site}${m.slug}/`) && html.includes(m.plan) && html.includes(m.detail), `Product card/link in static guide: ${key}`);
    assert.ok(html.includes(`от ${m.price.toLocaleString("ru-RU")} ₽`), `Current price in static guide: ${key}`);
  }
  for (const item of page.choiceChecklist) assert.ok(html.includes(item), `Checklist parity: ${page.slug}`);
  assert.ok(html.includes(`https://wa.me/${whatsapp}?text=`) && html.includes(page.choiceCtaLabel), `Working WhatsApp entry: ${page.slug}`);
  assert.ok(html.includes("FAQPage") && html.includes("Article") && sitemap.includes(`${site}${page.slug}/`), `Schemas and sitemap: ${page.slug}`);
  assert.ok(!html.includes('href="/banya-'), `No root-relative product URL in static HTML: ${page.slug}`);
}
const ready = read("dist/guides/bani/gotovaya-ili-stroit/index.html");
assert.ok(ready.includes("Готовая Квадро") && ready.includes("Строительство на участке"), "Both paths, not a false winner");
assert.ok(ready.includes("<details><summary>Подробная таблица сравнения готовой бани и строительства</summary>"), "Long table is optional");
assert.ok(ready.indexOf("Готовые варианты для предметного сравнения") < ready.indexOf("Подробная таблица сравнения"), "Early useful answer comes before deep table");
for (const sourceText of ["SaunaChoiceGuide", "choiceModels", "choicePrompt", "choiceCtaLabel"]) assert.ok(client.includes(sourceText), `React buyer-facing guide integration ${sourceText}`);
assert.ok(component.includes("whatsappUrl(contact)") && component.includes("<Link to={`/${model.slug}/`}"), "Responsive model cards and context CTA");
assert.ok(fallback.includes("saunaChoiceFallback") && fallback.includes("seo-page-overrides-r5.json"), "Same registry used by prerender");
assert.ok(read("package.json").includes("check-r5.mjs"), "R5 regression is in build");
console.log("R5 PASS: four buying guides, model/price sync, early answer, model cards, no-JS parity, CTA, detailed comparison and SEO");
