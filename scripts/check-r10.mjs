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
const effective = pages.map((page) => ({ ...page, ...(overrides.get(page.slug) ?? {}) }));
const errors = [];
const warnings = [];
const verify = (condition, message) => { if (!condition) errors.push(message); };
const warn = (condition, message) => { if (!condition) warnings.push(message); };
const escape = (s) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
const routes = [site, `${site}services/`, ...effective.map((page) => `${site}${page.slug}/`)];
const sitemap = [...read('dist/sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
verify(effective.length === 20, `SEO registry: expected 20, found ${effective.length}`);
verify(new Set(effective.map((p) => p.slug)).size === effective.length, 'Duplicate SEO slugs');
verify(sitemap.length === 22 && new Set(sitemap).size === 22, `Sitemap: expected 22 distinct URLs, found ${sitemap.length}`);
verify(JSON.stringify(sitemap) === JSON.stringify(routes), 'Sitemap differs from actual source registry/order');
verify([...overrides.keys()].every((slug) => effective.some((p) => p.slug === slug)), 'Orphan override slug');
verify(read('dist/robots.txt').includes(`Sitemap: ${site}sitemap.xml`), 'robots.txt sitemap differs from production');
verify(read('dist/llms.txt').includes('Нефтезаводская, 49/1'), 'Public showroom not reflected in llms.txt');
const products = read('src/data/products.ts');
const waNumber = products.match(/whatsapp:\s*"(\d+)"/)?.[1];
verify(Boolean(waNumber), 'No actual WhatsApp destination in product registry');

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
      continue;
    }
    if (/^https:\/\/wa\.me\//i.test(href)) {
      const wa = new URL(href);
      verify(wa.pathname === `/${waNumber}` && Boolean(wa.searchParams.get('text')?.trim()), `Malformed or noncanonical WhatsApp CTA: ${url}`);
      continue;
    }
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
      verify(html.includes(`https://wa.me/${waNumber}?text=`), `Missing direct contact for commercial page: ${url}`);
    }
  }
  routeRows.push({ route: url.replace(site, '/') || '/', type: page?.kind ?? (url === site ? 'home' : 'services'), staticHTML: true, canonical: canonical === url, h1: h1 === 1, links: localLinks.length });
}

const legacy = effective.filter((p) => p.productId);
verify(legacy.length === 7, `Expected 7 legacy numeric aliases, got ${legacy.length}`);
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
const printPages = effective.filter((page) => page.printChecklistPath);
verify(printPages.length > 0, 'No printable checklist in source');
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
console.log('R10 PASS: 22 canonical static pages, 7 aliases, printed parity, live registry SEO parity, internal links, photos, source-based CTAs and structured data. Browser journeys and external HTTP are separate checks.');
