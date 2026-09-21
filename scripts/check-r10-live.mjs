import assert from 'node:assert/strict';
import fs from 'node:fs';

// Network smoke test: run after GitHub Pages deploy, NOT in npm build or before deployment.
// Does not click or send WhatsApp messages. HTTP 200 on a legacy page is a static HTML alias,
// not a server-side 301 (GitHub Pages does not support one).
const site = 'https://conradipui-glitch.github.io/silalesa/';
const sources = ['seo-pages.json','seo-page-guides.json','seo-page-guides-remont.json','seo-page-guides-screed.json','seo-page-guides-plaster.json','seo-page-guides-materials.json'];
const pages = sources.flatMap((file) => JSON.parse(fs.readFileSync(`src/data/${file}`, 'utf8')));
const routes = [site, `${site}services/`, ...pages.map((page) => `${site}${page.slug}/`)];
const aliases = pages.filter((page) => page.productId);
const printable = pages.filter((page) => page.printChecklistPath);
assert.equal(routes.length, 22, 'Public sitemap must cover 22 canonical routes');
assert.equal(aliases.length, 7, 'Seven numeric product/service URLs');
assert.equal(printable.length, 1, 'Exactly one printable acceptance checklist');

async function request(url, attempts = 3) {
  let error;
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url, { redirect: 'manual', headers: { 'user-agent': 'Silalesa-R10-post-deploy-audit/1.0' }, signal: AbortSignal.timeout(15000) });
      const body = await response.text();
      if (response.status >= 500 && i < attempts - 1) { error = new Error(`HTTP ${response.status}`); continue; }
      return { status: response.status, body, type: response.headers.get('content-type') ?? '' };
    } catch (reason) { error = reason; }
  }
  throw new Error(`Failed public HTTP request ${url}: ${String(error)}`);
}

const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
let checked = 0;
for (const url of routes) {
  const response = await request(url);
  checked++;
  check(response.status === 200, `Canonical HTTP ${response.status}: ${url}`);
  check(response.type.includes('text/html'), `Not HTML: ${url} (${response.type})`);
  check(response.body.includes('data-prerendered="true"') && /<h1(?:\s[^>]*)?>/.test(response.body), `No readable HTML without JS: ${url}`);
  check(response.body.includes(`<link rel="canonical" href="${url}"`), `Published canonical differs: ${url}`);
  check(!/<meta[^>]+name="robots"[^>]+noindex/i.test(response.body), `Canonical is noindex: ${url}`);
}
for (const page of aliases) {
  const url = `${site}product/${page.productId}/`;
  const canonical = `${site}${page.slug}/`;
  const response = await request(url);
  checked++;
  check(response.status === 200 && response.type.includes('text/html'), `Legacy alias missing/404: ${url} (${response.status})`);
  check(response.body.includes(`rel="canonical" href="${canonical}"`) && response.body.includes('content="noindex, follow"'), `Alias SEO mismatch: ${url}`);
  check(response.body.includes(`http-equiv="refresh" content="0;url=${canonical}"`) && response.body.includes(`<a href="${canonical}">`), `Legacy human redirect missing: ${url}`);
}
for (const page of printable) {
  const url = `${site}${page.printChecklistPath}/`;
  const response = await request(url);
  checked++;
  check(response.status === 200 && response.body.includes('name="robots" content="noindex"'), `Actual printable URL absent/not noindex: ${url} (${response.status})`);
  check((response.body.match(/<input type="checkbox"/g) ?? []).length === 12, `Expected 12 printable inspection points: ${url}`);
  check(response.body.includes(`href="${site}${page.slug}/"`), `Printable page has no guide return link: ${url}`);
}
const sitemapUrl = `${site}sitemap.xml`;
const sitemap = await request(sitemapUrl);
checked++;
const actual = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
check(sitemap.status === 200 && JSON.stringify(actual) === JSON.stringify(routes), 'Live sitemap does not match source registry (22 URLs)');
const robots = await request(`${site}robots.txt`);
checked++;
check(robots.status === 200 && robots.body.includes(`Sitemap: ${sitemapUrl}`), 'Live robots.txt wrong or unavailable');
const llms = await request(`${site}llms.txt`);
checked++;
check(llms.status === 200 && llms.body.includes('Нефтезаводская, 49/1') && !/Заоз[её]рн/iu.test(llms.body), 'Live AI index has old or missing showroom');
const unknown = await request(`${site}__r10-test-unknown-route__/`);
checked++;
check(unknown.status === 404, `Unknown route should remain HTTP 404, got ${unknown.status}`);

console.log('R10 LIVE HTTP SUMMARY:', JSON.stringify({ checked, canonical: routes.length, legacy: aliases.length, printable: printable.length, sitemap: 1, robots: 1, llms: 1, unknown404: unknown.status === 404, errors }, null, 2));
assert.equal(errors.length, 0, 'Live acceptance failed; see R10 LIVE HTTP SUMMARY');
console.log('R10 LIVE PASS: public routes return HTTP 200 and readable HTML; aliases are static 200 with canonical/noindex/refresh, print works, sitemap/robots/llms agree, unknown URL returns 404. Interactive browser clicks and actual WhatsApp sending remain manual.');
