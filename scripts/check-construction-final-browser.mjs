import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const origin = 'http://127.0.0.1:4173';
const site = 'https://conradipui-glitch.github.io/silalesa/';
const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
assert.equal(routes.length, 10, 'The construction release has 10 canonical pages');

const browser = await chromium.launch({ headless: true });
let checked = 0;
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      isMobile: width === 390,
      hasTouch: width === 390,
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    for (const pathname of routes) {
      const response = await page.goto(origin + pathname, { waitUntil: 'networkidle', timeout: 30000 });
      assert.equal(response?.status(), 200, 'Canonical route must load: ' + pathname);
      await page.locator('main h1').first().waitFor({ state: 'visible' });
      const state = await page.evaluate(() => ({
        title: document.title,
        h1Count: document.querySelectorAll('main h1').length,
        robots: document.querySelector('meta[name="robots"]')?.content,
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        width: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        text: document.querySelector('main')?.innerText ?? '',
        oldLinks: [...document.querySelectorAll('a[href]')]
          .map((link) => link.href)
          .filter((href) => /silalesa55\.ru|vk\.com\/silalesa55|orgs\.biz/i.test(href)),
        brokenImages: [...document.querySelectorAll('img:not([loading="lazy"])')]
          .filter((img) => img.complete && img.naturalWidth === 0)
          .map((img) => img.getAttribute('src')),
        priceNotes: document.querySelectorAll('[data-qa="price-verification-note"]').length,
      }));

      assert.equal(state.h1Count, 1, 'Exactly one H1: ' + pathname);
      assert.ok(state.title && !state.title.includes('Страница не найдена'), 'Correct page title: ' + pathname);
      assert.equal(state.robots, 'index, follow', 'Canonical page is indexable: ' + pathname);
      assert.equal(state.canonical, site + pathname.replace(/^\/silalesa\//, ''), 'Canonical address: ' + pathname);
      assert.ok(state.scrollWidth <= state.width + 2, 'No horizontal overflow at ' + width + 'px: ' + pathname);
      assert.ok(!/бан[ьяиею]|квадро|саун/iu.test(state.text), 'No sauna promotion: ' + pathname);
      assert.deepEqual(state.oldLinks, [], 'No unverified bath-era website/social link: ' + pathname);
      assert.deepEqual(state.brokenImages, [], 'All eager images loaded: ' + pathname);
      if (/\/(polusuhaya-styazhka|mehanizirovannaya-shtukaturka|burenie-skvazhiny)-omsk\//.test(pathname)) {
        assert.equal(state.priceNotes, 1, 'One clear service price note: ' + pathname);
        assert.ok(!state.text.includes('Цены на сайте — ориентир'), 'No duplicate price disclaimer: ' + pathname);
      }
      assert.deepEqual(errors, [], 'No JavaScript errors: ' + pathname);
      checked += 1;
    }

    for (const retired of ['mobilnaya-banya-omsk/', 'guides/bani/kak-vybrat-razmer-2x2-3x2-4x2/']) {
      await page.goto(origin + '/silalesa/' + retired, { waitUntil: 'networkidle' });
      assert.ok((await page.locator('main h1').innerText()).includes('Такой страницы нет'), 'Retired route displays 404 screen');
      assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, follow', 'Retired route noindex');
    }
    await context.close();
  }
} finally {
  await browser.close();
}

const static404 = fs.readFileSync('dist/404.html', 'utf8');
assert.ok(static404.includes('Такой страницы нет') && static404.includes('noindex, follow'), 'GitHub Pages static 404 is present');
console.log('CONSTRUCTION_FINAL_ACCEPTANCE_PASS: ' + checked + ' canonical renderings at 390/1440px, prices, no sauna promotion, safe links and static 404.');
