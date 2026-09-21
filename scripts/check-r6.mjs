import assert from 'node:assert/strict';
import fs from 'node:fs';
import { operationalGuideFallback } from './operational-guide-fallback.mjs';

const read = (name) => fs.readFileSync(name, 'utf8');
const base = 'https://conradipui-glitch.github.io/silalesa/';
const escapeHtml = (s) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const originals = [
  'src/data/seo-pages.json', 'src/data/seo-page-guides.json',
  'src/data/seo-page-guides-remont.json', 'src/data/seo-page-guides-screed.json',
  'src/data/seo-page-guides-plaster.json', 'src/data/seo-page-guides-materials.json',
].flatMap((file) => JSON.parse(read(file)));
const revisions = JSON.parse(read('src/data/seo-page-overrides-r6.json'));
const models = JSON.parse(read('src/data/sauna-choice-models.json'));
const service = JSON.parse(read('src/data/seo-page-overrides-r4.json')).find((page) => page.slug === 'burenie-skvazhiny-omsk');
const phone = read('src/data/products.ts').match(/whatsapp:\s*"(\d+)"/)?.[1];
const required = [
  'guides/bani/fundament-dlya-mobilnoy-bani',
  'guides/bani/podgotovka-uchastka-dostavka-manipulyator',
  'guides/bani/chek-list-priemki-gotovoy-bani',
  'guides/uchastok/kogda-burit-skvazhinu',
];
assert(phone && service?.priceLabel === 'от 2 500 ₽/пог. м', 'Verified drilling price and WhatsApp source');
assert.deepEqual(revisions.map((page) => page.slug), required, 'Exactly four existing operational guides in R6');
const slugs = new Set(originals.map((page) => page.slug));
const titles = new Set();
for (const revised of revisions) {
  const original = originals.find((page) => page.slug === revised.slug);
  assert(original && original.kind === 'guide', `Existing guide: ${revised.slug}`);
  assert.equal(revised.summary.length, 4, `Four buyer takeaways: ${revised.slug}`);
  assert.equal(revised.operationSteps.length, 3, `Three steps: ${revised.slug}`);
  assert(revised.operationHeading && !titles.has(revised.operationHeading), 'Unique, nonempty buyer journey heading');
  titles.add(revised.operationHeading);
  assert(revised.lead && revised.description && revised.operationPrompt && revised.operationCtaLabel);
  for (const step of revised.operationSteps) for (const key of ['title','do','send','outcome']) assert(step[key]?.length > 10, `Practical ${key} in ${revised.slug}`);
  for (const link of revised.operationLinks) assert(slugs.has(link.slug) && link.slug !== revised.slug && link.label, `Valid contextual target: ${link.slug}`);
  const rendered = operationalGuideFallback(revised, models, service.priceLabel, base, phone);
  assert(rendered.hasSteps && rendered.first.includes('Стоимость и первый шаг') && rendered.panel.includes(revised.operationHeading));
  const html = read(`dist/${revised.slug}/index.html`);
  const canonical = `${base}${revised.slug}/`;
  assert(html.includes('data-prerendered="true"') && html.includes(`<link rel="canonical" href="${canonical}"`), `Generated canonical HTML: ${revised.slug}`);
  assert(html.includes(escapeHtml(revised.lead)) && html.includes(escapeHtml(revised.description)), `New buyer answer/meta in no-JS: ${revised.slug}`);
  assert(html.includes('FAQPage') && html.includes('Article'), `SEO schemas: ${revised.slug}`);
  assert(html.indexOf('Стоимость и первый шаг') > -1 && html.indexOf('Стоимость и первый шаг') < html.indexOf(escapeHtml(revised.operationHeading)), 'Price and action precede extended scenario');
  assert(html.includes(`https://wa.me/${phone}?text=`) && html.includes(escapeHtml(revised.operationCtaLabel)), `Contact button: ${revised.slug}`);
  for (const line of revised.summary) assert(html.includes(escapeHtml(line)), `First-screen takeaway: ${line}`);
  for (const step of revised.operationSteps) for (const text of [step.title,step.do,step.send,step.outcome]) assert(html.includes(escapeHtml(text)), `No-JS step: ${text}`);
  for (const link of revised.operationLinks) assert(html.includes(`${base}${link.slug}/`) && html.includes(escapeHtml(link.label)), `Contextual interlink: ${link.slug}`);
  assert(html.includes('<details><summary>Подробные инструкции и безопасность</summary>'), 'Detailed safety information optional in static HTML');
  for (const section of original.sections ?? []) {
    assert(html.includes(escapeHtml(section.heading)), `Detailed heading kept: ${section.heading}`);
    for (const p of section.paragraphs) assert(html.includes(escapeHtml(p)), `Detailed paragraph retained: ${revised.slug}`);
    for (const b of section.bullets ?? []) assert(html.includes(escapeHtml(b)), `Detailed checklist retained: ${revised.slug}`);
  }
  const drilling = revised.slug.includes('kogda-burit');
  assert(html.includes(drilling ? service.priceLabel : '230'), `Correct sourced price: ${revised.slug}`);
  if (original.printChecklistPath) {
    const printable = read(`dist/${original.printChecklistPath}/index.html`);
    const bullets = original.sections.at(-1).bullets;
    assert(bullets?.length >= 10, 'Keep full printable acceptance checklist');
    for (const bullet of bullets) assert(printable.includes(escapeHtml(bullet)), `Print item retained: ${bullet}`);
    assert(html.includes(`${base}${original.printChecklistPath}/`), 'Visible print URL in no-JS hero');
    assert(read('src/components/OperationalGuide.tsx').includes('page.printChecklistPath'), 'Visible print button in runtime');
  }
}
const template = read('src/pages/SeoLandingPage.tsx');
const registry = read('src/data/seoPages.ts');
const prerender = read('scripts/prerender.mjs');
assert(template.includes('isOperationalGuide && <OperationalGuide page={page} />') && template.includes('where: "r6-guide-hero"'), 'R6 runtime and first-screen CTA wired');
assert(template.includes('!isOperationalGuide && page.sections') && read('src/components/OperationalGuide.tsx').includes('Подробные инструкции и безопасность'), 'No duplicate detailed article in runtime');
assert(registry.includes('...rawR6Overrides') && prerender.includes('...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r6.json"'), 'Runtime/static use same overrides');
assert.equal((read('dist/sitemap.xml').match(/<loc>/g) ?? []).length, 22, 'No new competing canonical URLs');
console.log('R6 PASS: four three-step buyer journeys, sourced prices, first-screen CTA, no-JS parity, safety details, linked pages, SEO and complete printable acceptance checklist.');
