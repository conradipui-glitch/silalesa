import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Run AFTER the complete prerender pipeline; does not rely on browser-only SPA fallbacks.
const site = 'https://conradipui-glitch.github.io/silalesa/';
const base = new URL(site);
const read = (file) => fs.readFileSync(file, 'utf8');
const sourceFiles = [
  'seo-pages.json', 'seo-page-guides.json', 'seo-page-guides-remont.json',
  'seo-page-guides-screed.json', 'seo-page-guides-plaster.json',
  'seo-page-guides-materials.json',
  'seo-page-guides-wave3.json',
];
const pages = sourceFiles.flatMap((file) => JSON.parse(read(`src/data/${file}`)));
const overrideFiles = [
  'seo-page-overrides.json', 'seo-page-overrides-next.json', 'seo-page-overrides-r3.json', 'seo-page-overrides-r4.json',
  'seo-page-overrides-r5.json', 'seo-page-overrides-r6.json', 'seo-page-overrides-r7.json',
];
const overrides = new Map();
for (const file of overrideFiles) for (const page of JSON.parse(read(`src/data/${file}`))) {
  overrides.set(page.slug, { ...(overrides.get(page.slug) ?? {}), ...page });
}
const effective = pages
  .filter((page) => page.kind === 'service' || (page.kind === 'guide' && !page.slug.startsWith('guides/bani/')))
  .map((page) => ({ ...page, ...(overrides.get(page.slug) ?? {}) }));
const errors = [];
const warnings = [];
const verify = (condition, message) => { if (!condition) errors.push(message); };
const warn = (condition, message) => { if (!condition) warnings.push(message); };
const escape = (s) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const routes = [site, `${site}services/`, ...effective.map((page) => `${site}${page.slug}/`), `${site}kalkulyator-styazhki-pola/`, `${site}kalkulyator-shtukaturki-sten/`];
const sitemap = [...read('dist/sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
verify(effective.length === 10, `Construction SEO registry: expected 10, found ${effective.length}`);
verify(new Set(effective.map((p) => p.slug)).size === effective.length, 'Duplicate SEO slugs');
verify(sitemap.length === 14 && new Set(sitemap).size === 14, `Construction sitemap: expected 14 distinct URLs, found ${sitemap.length}`);
verify(JSON.stringify(sitemap) === JSON.stringify(routes), 'Sitemap differs from actual source registry/order');
verify([...overrides.keys()].filter((slug) => !/banya|mobilnaya-banya|karkasnaya-banya|guides\/bani/.test(slug)).every((slug) => effective.some((p) => p.slug === slug)), 'Orphan construction override slug');
verify(!/подбор по пяти вопросам/iu.test(JSON.stringify(effective)), 'Obsolete five-question FAQ contradicts two-answer quiz');
verify(read('dist/robots.txt').includes(`Sitemap: ${site}sitemap.xml`), 'robots.txt sitemap differs from production');
verify(!/бан[ьяиею]|квадро|саун/iu.test(read('dist/llms.txt')), 'Construction llms.txt must not promote archived sauna business');

const catalogue = JSON.parse(read('src/data/construction-services.json'));
verify(catalogue.length === 14, 'Construction catalogue must have 14 directions');
verify(new Set(catalogue.map((service) => service.title)).size === 14, 'Construction titles must be unique');
verify(JSON.stringify(['Генподряд','Конструктив','Отделка и полы','Спецработы'].map((group) => catalogue.filter((service) => service.group === group).length)) === JSON.stringify([4,3,4,3]), 'Construction catalogue groups must retain 4/3/4/3 directions');
const staticCatalogues = [read('dist/index.html'), read('dist/services/index.html')];
for (const service of catalogue) {
  verify(service.title.length > 4 && service.text.length > 35 && service.requestHint.length > 25, `Construction catalogue fields incomplete: ${service.title}`);
  verify(!/бан[ьяиею]|саун|квадро/iu.test(JSON.stringify(service)), `Sauna offer appeared in construction catalogue: ${service.title}`);
  for (const html of staticCatalogues) {
    verify(html.includes(service.title), `No-JS construction catalogue missing title: ${service.title}`);
    verify(html.includes(service.requestHint), `No-JS construction catalogue missing estimate hint: ${service.title}`);
  }
}

const products = read('src/data/products.ts');
const primaryPhone = products.match(/phonePrimary:\s*\{[^}]*tel:\s*"([^"]+)"/)?.[1];
verify(Boolean(primaryPhone), 'No canonical phone contact in product registry');
verify(!/whatsappUrl|wa\.me\//i.test(products), 'Retired WhatsApp contact still present in registry');

function routeFile(url) {
  const parsed = new URL(url, site);
  if (parsed.origin !== base.origin || !parsed.pathname.startsWith(base.pathname)) return null;
  let rel = decodeURIComponent(parsed.pathname.slice(base.pathname.length));
  if (!rel || rel.endsWith('/')) return path.join('dist', rel, 'index.html');
  if (/\.[a-z\d]{2,6}$/i.test(rel)) return path.join('dist', rel);
  return path.join('dist', rel, 'index.html');
}
const links = [];
const imageLinks = [];
const routeRows = [];
for (const url of routes) {
  const file = routeFile(url);
  verify(file && fs.existsSync(file), `Missing real static HTML: ${url}`);
  if (!file || !fs.existsSync(file)) continue;
  const html = read(file);
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1];
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1];
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1];
  const h1 = [...html.matchAll(/<h1(?:\s[^>]*)?>/gi)].length;
  verify(html.includes('data-prerendered="true"'), `No readable HTML without JS: ${url}`);
  verify(h1 === 1, `Expected one h1, got ${h1}: ${url}`);
  verify(Boolean(title?.length && description?.length), `Missing title or meta description: ${url}`);
  verify(canonical === url, `Canonical mismatch: ${url} -> ${canonical}`);
  verify(!/<meta[^>]+name="robots"[^>]+noindex/i.test(html), `Canonical URL accidentally noindex: ${url}`);
  verify(html.includes('<main>') || html.includes('<main '), `No semantic main: ${url}`);
  for (const match of html.matchAll(/<script\s+type="application\/ld\+json"\s*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch { errors.push(`Invalid JSON-LD on ${url}`); }
  }
  const localLinks = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map((match) => match[1].replaceAll('&amp;', '&'));
  verify(localLinks.length > 0, `Dead-end page without links: ${url}`);
  for (const href of localLinks) {
    if (/^(mailto:|tel:|javascript:)/i.test(href)) {
      verify(!href.startsWith('javascript:'), `javascript: link on ${url}`);
      if (href.startsWith('tel:')) verify(/^tel:\+7\d{10}$/.test(href), `Invalid call link on ${url}: ${href}`);
      continue;
    }
    verify(!/wa\.me\/|whatsapp/i.test(href), `Retired WhatsApp CTA: ${url}`);
    if (href.startsWith('#')) {
      verify(href.length > 1 && html.includes(`id="${href.slice(1)}"`), `Nonworking no-JS in-page anchor ${href} in ${url}`);
      continue;
    }
    const target = new URL(href, url);
    if (target.origin === base.origin) {
      const targetFile = routeFile(target.href);
      verify(Boolean(targetFile && fs.existsSync(targetFile)), `Broken internal link: ${url} -> ${href}`);
      links.push([url, target.href]);
    }
  }
  for (const match of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)) {
    const target = new URL(match[1], url);
    verify(/\balt="[^"]+"/.test(match[0]), `Unlabelled model/guide photo: ${url}`);
    if (target.origin === base.origin) {
      const asset = routeFile(target.href);
      verify(Boolean(asset && fs.existsSync(asset)), `Missing local photo: ${url} -> ${match[1]}`);
      imageLinks.push(match[1]);
    }
  }
  verify(!/Заоз[её]рн/iu.test(html), `Retired showroom address: ${url}`);
  const page = effective.find((p) => `${site}${p.slug}/` === url);
  if (page) {
    verify(title === escape(page.title) && description === escape(page.description), `Browser SEO metadata differs from merged source: ${url}`);
    verify(html.includes(`<h1>${escape(page.h1)}</h1>`) && html.includes(escape(page.lead)), `Rendered first answer differs from merged source: ${url}`);
    verify(html.includes('FAQPage'), `Missing structured FAQs: ${url}`);
    if (page.kind === 'service' || page.offerModel || page.offerModels) {
      verify(html.includes(`href="tel:${primaryPhone}"`), `Missing working phone contact for commercial page: ${url}`);
    }
  }
  routeRows.push({ route: url.replace(site, '/') || '/', type: page?.kind ?? (url === site ? 'home' : 'services'), staticHTML: true, canonical: canonical === url, h1: h1 === 1, links: localLinks.length });
}

const plasterStatic = read('dist/kalkulyator-shtukaturki-sten/index.html');
verify(plasterStatic.includes('45,3 м²') && plasterStatic.includes('0,6795 м³') && plasterStatic.includes('24 915 ₽'), 'Plaster no-JS maths example and explanation missing');
verify(plasterStatic.includes('WebApplication') && plasterStatic.includes('550 ₽/м²'), 'Plaster schema or starting price missing');
for (const path of ['dist/index.html', 'dist/mehanizirovannaya-shtukaturka-omsk/index.html', 'dist/guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka/index.html', 'dist/guides/remont/gipsovaya-ili-tsementnaya-shtukaturka/index.html']) {
  verify(read(path).includes(`${site}kalkulyator-shtukaturki-sten/`), `Missing plaster calculator link: ${path}`);
}
const calculatorStatic = read('dist/kalkulyator-styazhki-pola/index.html');
verify(calculatorStatic.includes('Объём слоя в м³') && calculatorStatic.includes('12 000 ₽'), 'Calculator static formula and sample are visible without JS');
verify(calculatorStatic.includes('application/ld+json') && calculatorStatic.includes('WebApplication'), 'Calculator structured metadata missing');
verify(read('dist/index.html').includes(`${site}kalkulyator-styazhki-pola/`), 'Home no-JS needs calculator link');
verify(read('dist/polusuhaya-styazhka-omsk/index.html').includes(`${site}kalkulyator-styazhki-pola/`), 'Screed service must link to calculator');
verify(read('dist/guides/remont/polusuhaya-ili-mokraya-styazhka/index.html').includes(`${site}kalkulyator-styazhki-pola/`), 'Guide must link to calculator');
const legacy = effective.filter((p) => p.productId);
verify(legacy.length === 3, `Expected 3 construction service aliases, got ${legacy.length}`);
for (const page of legacy) {
  const file = `dist/product/${page.productId}/index.html`;
  verify(fs.existsSync(file), `Missing legacy static alias: ${page.productId}`);
  if (!fs.existsSync(file)) continue;
  const html = read(file);
  const destination = `${site}${page.slug}/`;
  verify(html.includes(`rel="canonical" href="${destination}"`) && html.includes('name="robots" content="noindex, follow"'), `Legacy SEO incorrectly configured: ${page.productId}`);
  verify(html.includes(`http-equiv="refresh" content="0;url=${destination}"`) && html.includes(`<a href="${destination}">`), `Legacy browser/no-JS destination missing: ${page.productId}`);
  verify(!sitemap.includes(`${site}product/${page.productId}/`), `Legacy URL appears in sitemap: ${page.productId}`);
}
for (const retired of [
  'mobilnaya-banya-omsk', 'banya-kvadro-2x2-omsk', 'banya-kvadro-3x2-omsk',
  'banya-kvadro-4x2-omsk', 'karkasnaya-banya-omsk', 'guides/bani/fundament-dlya-mobilnoy-bani',
]) {
  verify(!fs.existsSync(`dist/${retired}/index.html`), `Archived sauna page leaked into construction: ${retired}`);
  verify(!sitemap.includes(`${site}${retired}/`), `Archived sauna URL in sitemap: ${retired}`);
}
verify(!/mobilnaya-banya|guides\/bani|karkasnaya-banya|banya-kvadro/iu.test(read('dist/index.html')), 'Construction home no-JS fallback includes sauna link');
const printPages = effective.filter((page) => page.printChecklistPath);
verify(printPages.length === 0, 'Sauna printable checklists must not ship in construction build');
for (const page of printPages) {
  const file = `dist/${page.printChecklistPath}/index.html`;
  verify(fs.existsSync(file), `Printable page missing: ${file}`);
  if (!fs.existsSync(file)) continue;
  const html = read(file);
  const bullets = page.sections?.at(-1)?.bullets ?? [];
  verify(bullets.length > 0 && (html.match(/<input type="checkbox"/g) ?? []).length === bullets.length, `Print item count differs from live checklist: ${file}`);
  for (const point of bullets) verify(html.includes(escape(point)), `Printable checklist lost point: ${point}`);
  verify(html.includes('name="robots" content="noindex"') && html.includes(`href="${site}${page.slug}/"`), `Print version index/back link incorrect: ${file}`);
}
warn(imageLinks.length > 0, 'No actual bundled photography checked');
const outcome = { checked: { canonical: routeRows.length, aliases: legacy.length, printable: printPages.length, internalLinks: links.length, localImages: imageLinks.length }, errors, warnings, routes: routeRows };
console.log('R10 ACCEPTANCE AUDIT:', JSON.stringify(outcome, null, 2));
assert.equal(errors.length, 0, `${errors.length} acceptance failures; see R10 ACCEPTANCE AUDIT above`);
console.log('R10 PASS: 14 construction canonical static pages, 3 service aliases, no archived sauna routes, live registry SEO parity, internal links, photos, source-based CTAs and structured data. Browser journeys and external HTTP are separate checks.');
