import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const site = "https://conradipui-glitch.github.io/silalesa/";
const offers = JSON.parse(await fs.readFile(path.join(root, "src/data/seo-page-overrides-r4.json"), "utf8"));
const expected = new Map([
  ["mehanizirovannaya-shtukaturka-omsk", { id: "12656055", price: 550, label: "от 550 ₽/м²" }],
  ["polusuhaya-styazhka-omsk", { id: "12656157", price: 600, label: "от 600 ₽/м²" }],
  ["burenie-skvazhiny-omsk", { id: "12791309", price: 2500, label: "от 2 500 ₽/пог. м" }],
]);
assert.equal(offers.length, expected.size, "R4 must cover exactly three separate service pages");
assert.equal(new Set(offers.map((offer) => offer.slug)).size, offers.length, "duplicate services");
const source = await fs.readFile(path.join(root, "src/data/products.ts"), "utf8");
const phone = source.match(/whatsapp:\s*"(\d+)"/);
assert.ok(phone, "canonical WhatsApp number");
const sitemap = await fs.readFile(path.join(root, "dist/sitemap.xml"), "utf8");
const registry = await fs.readFile(path.join(root, "src/data/seoPages.ts"), "utf8");
const prerender = await fs.readFile(path.join(root, "scripts/prerender.mjs"), "utf8");
const runtime = await fs.readFile(path.join(root, "src/pages/SeoLandingPage.tsx"), "utf8");
const hubRuntime = await fs.readFile(path.join(root, "src/sections/ServicesAbout.tsx"), "utf8");
assert.ok(registry.includes("rawR4Overrides"), "runtime must apply R4 registry");
assert.ok(prerender.includes("seo-page-overrides-r4.json"), "static HTML must apply R4 registry");
for (const marker of ["page.priceLabel", "page.requestChecklist", "page.serviceResults", "whatsappUrl(waText)"]) assert.ok(runtime.includes(marker), `runtime missing ${marker}`);
assert.ok(hubRuntime.includes("landing?.priceLabel") && hubRuntime.includes("landing?.lead"), "hub must use canonical R4 offers");
for (const offer of offers) {
  const config = expected.get(offer.slug);
  assert.ok(config, `unexpected R4 page ${offer.slug}`);
  assert.equal(offer.priceLabel, config.label, `unit price for ${offer.slug}`);
  assert.ok(offer.title.includes(config.label.slice(3)), `title price unit for ${offer.slug}`);
  assert.ok(offer.description.includes(config.label.slice(3)), `description price unit for ${offer.slug}`);
  const escapedId = config.id.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const sourcePrice = source.match(new RegExp(`id: "${escapedId}"[\\s\\S]{0,400}?price: (\\d+)`));
  assert.ok(sourcePrice, `source product price missing for ${offer.slug}`);
  assert.equal(Number(sourcePrice[1]), config.price, `product and R4 offer must agree for ${offer.slug}`);
  for (const key of ["lead", "priceNote", "requestPrompt"]) assert.ok(offer[key]?.length > 40, `${offer.slug} missing ${key}`);
  assert.equal(offer.summary.length, 4, `${offer.slug} must have four scan-friendly points`);
  assert.ok(offer.requestChecklist.length >= 3 && offer.serviceResults.length >= 3, `${offer.slug} quote and results`);
  const html = await fs.readFile(path.join(root, "dist", offer.slug, "index.html"), "utf8");
  for (const required of ['data-prerendered="true"', offer.h1, offer.lead, offer.summary[0], offer.priceLabel, offer.priceNote, offer.requestChecklist[0], offer.serviceResults[0], "Что прислать для расчёта", "Отправить данные для расчёта в WhatsApp", "FAQPage", 'rel="canonical"']) {
    assert.ok(html.includes(required), `${offer.slug} static HTML missing ${required}`);
  }
  assert.ok(html.includes(`https://wa.me/${phone[1]}?text=`), `${offer.slug} must contain real WhatsApp link`);
  assert.ok(html.includes(encodeURIComponent(offer.requestPrompt)), `${offer.slug} CTA must describe its own service`);
  assert.ok(html.includes(`content="${offer.description}"`), `${offer.slug} stale meta description`);
  assert.ok(html.includes(`${site}${offer.slug}/`), `${offer.slug} missing canonical`);
  assert.ok(sitemap.includes(`${offer.slug}/`), `${offer.slug} missing sitemap`);
  for (const faq of offer.faq) assert.ok(html.includes(faq[0]) && html.includes(faq[1]), `${offer.slug} FAQ mismatch`);
}
const hub = await fs.readFile(path.join(root, "dist/services/index.html"), "utf8");
assert.ok(hub.includes('data-prerendered="true"') && hub.includes("Строительные услуги в Омске"));
for (const offer of offers) assert.ok(hub.includes(offer.priceLabel) && hub.includes(offer.lead) && hub.includes(`${site}${offer.slug}/`), `services hub missing ${offer.slug}`);
assert.ok(hub.includes("550 ₽/м²") && hub.includes("600 ₽/м²") && hub.includes("2 500 ₽/пог. м"), "hub unit prices");
console.log("R4 PASS: three unit-priced service offers, canonical data, scoped CTA, SEO/static HTML, sitemap and services hub.");
