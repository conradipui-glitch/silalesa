import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const P01 = 'guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka';
const BASE = 'https://conradipui-glitch.github.io/silalesa/';
const names = [
  'seo-pages.json', 'seo-page-guides.json', 'seo-page-guides-remont.json',
  'seo-page-guides-screed.json', 'seo-page-guides-plaster.json', 'seo-page-guides-materials.json',
];
const source = names.flatMap((name) => JSON.parse(read(`src/data/${name}`)));
const overrides = ['seo-page-overrides.json', 'seo-page-overrides-next.json'].flatMap((name) => JSON.parse(read(`src/data/${name}`)));
const byOverride = new Map(overrides.map((item) => [item.slug, item]));
const pages = source.map((page) => ({ ...page, ...(byOverride.get(page.slug) ?? {}) }));
const escapeHtml = (text) => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');

assert.equal(pages.length, 20, '20 SEO routes');
assert.equal(new Set(pages.map((page) => page.slug)).size, 20, 'unique URLs');
assert.equal(pages.filter((page) => page.summary).length, 1, 'only P01 overrides the shared summary');
assert.equal(pages.filter((page) => page.methodComparison).length, 1, 'only P01 introduces method table');
const p01 = pages.find((page) => page.slug === P01);
assert(p01 && p01.kind === 'guide');
assert.equal(p01.points.length, 7, 'all original detailed P01 points retained in the registry');
assert.equal(p01.summary.length, 4, 'four first-screen takeaways');
assert(p01.summary.every((text) => text.length < 105), 'short, scannable takeaways');
assert.equal(p01.methodComparison.rows.length, 6, 'six comparison questions');
assert.equal(p01.methodComparison.columns.length, 2);
assert(p01.sections.length === 8 && p01.faq.length === 8, 'article structure and FAQ remain');
assert(p01.lead.includes('«Сила Леса»') && p01.lead.includes('Одна стена'));
assert(!/\b(?:30|50|80)\s*м²/.test(p01.lead + p01.summary.join(' ')), 'no invented area threshold');

const template = read('src/pages/SeoLandingPage.tsx');
assert(template.includes('const keyPoints = page.summary ?? page.points;'), 'shared template has backwards-compatible summary');
assert(template.includes('page.methodComparison.rows.map'), 'client comparison renders from registry');
assert(template.includes('md:hidden') && template.includes('md:block'), 'small-screen comparison cards and desktop table');
assert(template.includes('whatsappUrl(plasterWaText)') && template.includes('whatsappUrl(isPlasterGuide ? plasterWaText : waText)'), 'middle and final CTA use canonical contact helper');
assert(template.includes('<PlasterProcessGuide />'), 'existing R2 interactive preserved');
assert(template.includes('<details key={question}'), 'existing FAQ accordion preserved');
assert(template.includes('MATERIAL_GUIDE_SLUG'), 'route to P02 retained');

const whatsapp = read('src/data/products.ts').match(/whatsapp:\s*"(\d+)"/)?.[1];
assert(whatsapp, 'company contact is available');
const p01Html = read(`dist/${P01}/index.html`);
assert(p01Html.includes('data-prerendered="true"'), 'P01 has no-JS content');
assert(p01Html.includes(`<link rel="canonical" href="${BASE}${P01}/"`), 'P01 canonical URL uses Pages base');
assert(p01Html.includes('<table>') && p01Html.includes('<caption>Машинная и ручная: сравнение по делу</caption>'), 'semantic comparison in fallback');
for (const item of p01.summary) assert(p01Html.includes(escapeHtml(item)), `takeaway in fallback: ${item}`);
for (const [criterion, machine, hand] of p01.methodComparison.rows) {
  for (const text of [criterion, machine, hand]) assert(p01Html.includes(escapeHtml(text)), `method table content in fallback: ${text}`);
}
for (const section of p01.sections) {
  assert(p01Html.includes(escapeHtml(section.heading)), `section in no-JS HTML: ${section.heading}`);
  for (const paragraph of section.paragraphs) assert(p01Html.includes(escapeHtml(paragraph)), 'article content survives prerender');
  for (const bullet of section.bullets ?? []) assert(p01Html.includes(escapeHtml(bullet)), 'article bullet survives prerender');
}
assert(p01Html.includes('https://wa.me/' + whatsapp + '?text='), 'no-JS CTA goes to configured WhatsApp');
assert(p01Html.includes('Обсудить расчёт в WhatsApp'), 'contextual CTA in fallback');
assert(p01Html.includes(`${BASE}mehanizirovannaya-shtukaturka-omsk/`), 'service route in fallback');
assert(p01Html.includes(`${BASE}guides/remont/gipsovaya-ili-tsementnaya-shtukaturka/`), 'P02 route in fallback');
assert(p01Html.includes('Пять вопросов, чтобы понять смету') && p01Html.includes('Выбор штукатурки и вопросы к смете') && p01Html.includes('от 550 ₽/м²'), 'R4.1 simple buyer fallback replaces old R2 matrix');
assert(p01Html.includes('FAQPage') && p01Html.includes('Article'), 'SEO schemas retained');

for (const page of pages) {
  const html = read(`dist/${page.slug}/index.html`);
  assert(html.includes('data-prerendered="true"'), `static fallback ${page.slug}`);
  assert(html.includes(`<link rel="canonical" href="${BASE}${page.slug}/"`), `canonical ${page.slug}`);
  // Service copy is intentionally revised in R4 and verified separately by check-r4.
  // This R1 regression still verifies all 20 routes, canonical links, FAQ and original guide copy.
  if (page.kind !== 'service') {
    assert(html.includes(escapeHtml(page.h1)), `H1 ${page.slug}`);
    assert(html.includes(escapeHtml(page.lead)), `lead ${page.slug}`);
    for (const item of page.summary ?? page.points) assert(html.includes(escapeHtml(item)), `summary/points ${page.slug}`);
  }
  if (page.slug !== P01) {
    assert.equal(page.summary, undefined, `other SEO page untouched by R1 summary ${page.slug}`);
    assert.equal(page.methodComparison, undefined, `no unexpected method table ${page.slug}`);
  }
  assert(html.includes('FAQPage'), `FAQ schema ${page.slug}`);
}
assert(read('dist/services/index.html').includes(`${BASE}services/`), 'services hub route');
assert(read('dist/index.html').includes('/silalesa/'), 'main page base URL');
const sitemap = read('dist/sitemap.xml');
assert.equal((sitemap.match(/<loc>/g) ?? []).length, 22, '22 distinct canonical URLs in sitemap');
for (const page of pages) assert(sitemap.includes(`<loc>${BASE}${page.slug}/</loc>`), `sitemap ${page.slug}`);
assert(sitemap.includes(`<loc>${BASE}</loc>`) && sitemap.includes(`<loc>${BASE}services/</loc>`));
assert(!p01Html.includes('href="/mehanizirovannaya-shtukaturka-omsk/"'), 'no broken root-relative service URL in static fallback');
console.log('R1 PASS: 20 SEO URLs + home/services (22), 4 short takeaways, 7 detailed points, 6 rows, 8 sections and FAQ, contact/related URLs, canonical, sitemap, schema and no-JS fallback.');
