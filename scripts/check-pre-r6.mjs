import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (name) => fs.readFileSync(name, 'utf8');
const site = 'https://conradipui-glitch.github.io/silalesa/';
const models = JSON.parse(read('src/data/seo-pages.json')).filter((page) => page.productId);
const products = read('src/data/products.ts');
const index = read('dist/index.html');
const llms = read('dist/llms.txt');
const sitemap = read('dist/sitemap.xml');
const cards = read('src/sections/Models.tsx');
const footer = read('src/components/Brand.tsx');
const about = read('src/sections/ServicesAbout.tsx');
assert.equal(models.length, 7, 'Four sauna models and three services have numeric legacy URLs');
assert.equal(new Set(models.map((page) => page.productId)).size, models.length, 'Unique legacy IDs');
assert.ok(products.includes('showroom: "Омск, ул. Нефтезаводская, 49/1"'));
assert.ok(!products.includes('  address:'), 'Do not advertise unverified old legal/production address');
assert.ok(index.includes('"streetAddress": "ул. Нефтезаводская, 49/1"'), 'Schema references actual visit location');
assert.ok(footer.includes('Осмотр по предварительной договорённости') && !footer.includes('company.address'));
assert.ok(about.includes('Перед оформлением заказа попросите письменно подтвердить срок изготовления, условия гарантии') && about.includes('Фотографии моделей не выдаём за отзывы'));
assert.ok(cards.includes('const productUrl = landing ?') && (cards.match(/to=\{productUrl\}/g) ?? []).length === 3, 'Home cards point at canonical landing instead of numeric legacy URLs');
for (const page of models) {
  const legacy = `dist/product/${page.productId}/index.html`;
  assert.ok(fs.existsSync(legacy), `Static 200-able legacy route missing: ${legacy}`);
  const html = read(legacy);
  const canonical = `${site}${page.slug}/`;
  assert.ok(html.includes(`<link rel="canonical" href="${canonical}"`), `Canonical: ${legacy}`);
  assert.ok(html.includes('name="robots" content="noindex, follow"'), `Legacy must not compete in index: ${legacy}`);
  assert.ok(html.includes(`http-equiv="refresh" content="0;url=${canonical}"`), `Legacy browser redirect: ${legacy}`);
  assert.ok(html.includes(`<a href="${canonical}">`), `No-JS human link: ${legacy}`);
  assert.ok(fs.existsSync(`dist/${page.slug}/index.html`), `Canonical page exists: ${page.slug}`);
  assert.ok(!sitemap.includes(`${site}product/${page.productId}`), `Do not index alias: ${page.productId}`);
}
assert.equal((sitemap.match(/<loc>/g) ?? []).length, 22, '22 canonical website pages, no legacy duplicates');
for (const source of ['src', 'scripts', 'index.html', 'dist']) {
  const root = fs.statSync(source).isDirectory() ? source : null;
  const files = root ? walk(root) : [source];
  for (const filename of files) {
    if (!/\.(ts|tsx|js|mjs|json|html|txt)$/.test(filename) || filename.endsWith('check-pre-r6.mjs')) continue;
    if (filename.includes('apply-pre-r6-temporary')) continue;
    if (filename.startsWith('dist/assets/')) continue;
    const text = read(filename);
    assert.ok(!/Заоз[её]рн/iu.test(text), `Stale visit address in ${filename}`);
  }
}
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => { const name = path.join(dir, entry.name); return entry.isDirectory() ? walk(name) : [name]; }); }
assert.ok(llms.includes('Нефтезаводская, 49/1') && !llms.includes('Заозерная'), 'AI index and public location agree');
console.log('PRE-R6 PASS: seven legacy numeric URLs have static HTML with noindex/canonical/refresh, home links canonical, obsolete address absent, showroom and factual trust copy visible; sitemap unchanged');
