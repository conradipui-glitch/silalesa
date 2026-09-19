import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(file, "utf8");
const slug = "guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka";
const page = read("src/pages/SeoLandingPage.tsx");
const guide = read("src/components/PlasterProcessGuide.tsx");
const fallback = read("scripts/plaster-fallback.mjs");
const html = read(`dist/${slug}/index.html`);
const site = "https://conradipui-glitch.github.io/silalesa/";

// A price, answer and working entry point appear before optional deep reading.
assert.ok(page.includes("{isPlasterGuide && (") && page.includes("от 550 ₽/м²"), "P01 hero price must be visible without interaction");
assert.ok(page.includes('where: "p01-hero"') && page.includes("whatsappUrl(plasterWaText)"), "P01 hero CTA must go directly to canonical contact");
for (const phrase of ["Что выбрать для ваших стен?", "от 550 ₽/м²", "Пять вопросов, чтобы понять смету", "Ничего заполнять не нужно", "Что делать дальше?", "Подробнее: как проходят работы", "У меня две сметы — как их сравнить?"]) assert.ok(guide.includes(phrase), `Buyer-facing text absent: ${phrase}`);
assert.equal((guide.match(/title: "Что |title: "За |title: "Какие |title: "Какой /g) ?? []).length >= 5, true, "Checklist is compact and always present");
for (const old of ["scopeLabels", "visibleCount", "role=\"progressbar\"", "setOffers", "Уточнено 0 из 8", "Показать следующие позиции", "Начните с одной позиции"]) assert.ok(!guide.includes(old), `Mandatory estimate worksheet remains: ${old}`);
assert.ok(guide.includes("<details") && guide.includes("</details>"), "Advanced explanations are optional native disclosures");
assert.ok(guide.includes("whatsappUrl(contactText)"), "No questionnaire gate before inquiry");
assert.ok(guide.includes("<Link") && guide.includes("to={serviceUrl}"), "Internal service link must respect GitHub Pages base");
assert.ok(fallback.includes("Пять вопросов, чтобы понять смету"), "Static fallback shares same buyer checklist");
for (const phrase of ["data-prerendered=\"true\"", "Короткий ответ о штукатурке", "от 550 ₽/м²", "Пять вопросов, чтобы понять смету", "Практические различия", "У меня две сметы — как их сравнить?", "Обсудить расчёт в WhatsApp", "FAQPage", "Article"]) assert.ok(html.includes(phrase), `Rendered no-JS output missing: ${phrase}`);
assert.ok(html.indexOf("Короткий ответ о штукатурке") < html.indexOf("Практические различия"), "Price and answer precede deep content in static HTML");
assert.ok(html.includes(`${site}mehanizirovannaya-shtukaturka-omsk/`), "Commercial service link preserved");
const contact = read("src/data/products.ts").match(/whatsapp:\s*"(\d+)"/)?.[1];
assert.ok(contact && html.includes(`https://wa.me/${contact}?text=`), "Live contact number belongs to canonical company record");
assert.ok(html.includes(`<link rel="canonical" href="${site}${slug}/"`), "Canonical URL preserved");
assert.ok(!html.includes("Карта нанесения и проверки смет штукатурки") && !html.includes("Уточнено 0 из 8"), "No-JS page excludes retired matrix");
for (const neighbor of ["PlasterMaterialGuide", "ScreedComparisonGuide", "RenovationSequenceGuide"]) {
  const source = read(`src/components/${neighbor}.tsx`);
  assert.ok(source.includes("RepairGuideAction"), `Neighbor ${neighbor} preserves direct inquiry`);
}
console.log("R4.1 PASS: immediate answer/price/CTA, five buyer questions, no compulsory 8×2 worksheet, optional details, static parity, links/SEO and neighboring guide entry points");
