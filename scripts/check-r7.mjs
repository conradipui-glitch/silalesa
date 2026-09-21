import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');
const base = 'https://conradipui-glitch.github.io/silalesa/';
const escapes = (text) => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const all = JSON.parse(read('src/data/seo-pages.json'));
const revised = JSON.parse(read('src/data/seo-page-overrides-r7.json'));
const models = JSON.parse(read('src/data/sauna-choice-models.json'));
const products = read('src/data/products.ts');
const phone = products.match(/whatsapp:\s*"(\d+)"/)?.[1];
const target = ['banya-kvadro-2x2-omsk','banya-kvadro-3x2-omsk','banya-kvadro-4x2-omsk','karkasnaya-banya-omsk','mobilnaya-banya-omsk'];
assert.deepEqual(revised.map((item) => item.slug), target, 'Exactly four model pages and one catalogue');
assert.equal(models.length, 4);
assert(phone, 'Configured contact exists');
for (const model of models) {
  const match = products.slice(products.indexOf(`id: "${model.productId}"`)).match(/price:\s*(\d+)/);
  assert(match && Number(match[1]) === model.price, `Price agrees with canonical product: ${model.key}`);
  assert(all.some((item) => item.slug === model.slug && item.productId === model.productId), `Commercial URL maps to product: ${model.slug}`);
}
for (const page of revised) {
  const original = all.find((item) => item.slug === page.slug);
  assert(original && (original.kind === 'sauna' || original.kind === 'category'), `Existing commercial page ${page.slug}`);
  assert.equal(page.summary.length, 4, `Four quick facts ${page.slug}`);
  assert(page.offerHeading && page.offerPrompt && page.offerCtaLabel && page.offerChecklist.length === 3);
  assert(page.description && page.lead && page.offerOptions.length >= 2);
  assert(!/гарантия \d|за \d+ (?:дней|недель)|до \d+ человек/i.test(JSON.stringify(page)), `No fabricated guarantee, times or capacity: ${page.slug}`);
  const html = read(`dist/${page.slug}/index.html`);
  assert(html.includes('data-prerendered="true"') && html.includes(`<link rel="canonical" href="${base}${page.slug}/"`), `Canonical static HTML ${page.slug}`);
  assert(html.includes(escapes(page.description)) && html.includes(escapes(page.lead)), `Updated meta and first answer ${page.slug}`);
  assert(html.includes('FAQPage') && html.includes('Product') || original.kind === 'category' && html.includes('FAQPage'), `Structured product/FAQ ${page.slug}`);
  assert(html.indexOf('Цена и следующий шаг') > 0 && html.indexOf('Цена и следующий шаг') < html.indexOf('<ul>'), `Buyer first-answer precedes points ${page.slug}`);
  assert(html.includes(`https://wa.me/${phone}?text=`) && html.includes(escapes(page.offerCtaLabel)), `WhatsApp actionable ${page.slug}`);
  for (const line of [...page.summary, ...(page.offerIncluded ?? []), ...page.offerOptions, ...page.offerChecklist]) assert(html.includes(escapes(line)), `Buyer detail parity: ${line}`);
  const keys = page.offerModels ?? [page.offerModel];
  for (const key of keys) {
    const model = models.find((item) => item.key === key);
    assert(model, `Only supported models: ${key}`);
    assert(html.includes(model.slug === page.slug ? model.name : `${base}${model.slug}/`), `Canonical model route: ${model.slug}`);
    assert(html.includes(model.price.toLocaleString('ru-RU')), `Verified model price in no-JS: ${model.slug}`);
    const match = html.match(new RegExp('src="(/silalesa/assets/[^" ]*' + (key === 'f55' ? 'karkasnaya-5-5' : 'kvadro-' + key.slice(1) + 'x2') + '[^" ]*)"'));
    // Asset paths are generated from real packaged product photos; validate one per model separately below.
    const imageName = key === 'k2' ? 'kvadro-2x2-' : key === 'k3' ? 'kvadro-3x2-' : key === 'k4' ? 'kvadro-4x2-' : 'karkasnaya-5-5-';
    const photo = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]).find((url) => url.includes(imageName));
    assert(photo && fs.existsSync(path.join('dist', photo.replace(/^\//, '')) .replace(/^dist\/silalesa\//, 'dist/')), `Actual bundled model photo: ${key}`);
  }
  if (page.offerModel === 'f55') assert(html.includes('не приравниваются автоматически') && html.includes('630'), 'Frame delivery separate');
  if (page.offerModel === 'k4') assert(html.includes('дополнительные опции') && html.includes('365'), 'Image options distinguished from standard');
}
const catalog = read('dist/mobilnaya-banya-omsk/index.html');
for (const model of models) assert(catalog.includes(`${base}${model.slug}/`), 'Catalogue links directly to model rather than numeric URL');
assert(!catalog.includes('href="/product/'), 'No numeric outbound product links from catalogue');
const runtime = read('src/pages/SeoLandingPage.tsx');
const registry = read('src/data/seoPages.ts');
const prerender = read('scripts/prerender.mjs');
assert(runtime.includes('<SaunaOffer page={page} />') && runtime.includes('where: "r7-hero"'), 'Runtime offer, contextual hero CTA');
assert(runtime.includes('!isSaunaOffer') && read('src/components/SaunaOffer.tsx').includes('model.slug'), 'Old numeric upsell hidden; cards use model SEO routes');
assert(registry.includes('...rawR7Overrides') && prerender.includes('seo-page-overrides-r7.json'), 'One R7 data source for runtime and static HTML');
assert(read('src/pages/ProductPage.tsx').includes('isSauna && p.modelKey !== "f55"') && !read('src/pages/ProductPage.tsx').includes('https://schema.org/InStock'), 'Legacy details do not misattribute free delivery or inventory');
assert.equal((read('dist/sitemap.xml').match(/<loc>/g) ?? []).length, 22, 'R7 changes five pages, not canonical URL count');
console.log('R7 PASS: four product pages and catalogue, four source-verified prices/photos, truthful options and inclusion, contextual hero CTA, model links, no-JS parity, 22 canonicals.');
