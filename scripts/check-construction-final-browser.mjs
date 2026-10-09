import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const origin = 'http://127.0.0.1:4173';
const site = 'https://conradipui-glitch.github.io/silalesa/';
const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
assert.equal(routes.length, 12, 'The construction release has 12 canonical pages');

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
      if (pathname.endsWith('/kalkulyator-styazhki-pola/')) {
        const calculator = page.locator('[data-qa="screed-calculator"]');
        assert.equal(await calculator.count(), 1, 'Interactive calculator renders on direct URL');
        assert.equal(await page.locator('[data-qa="calculator-room"]').count(), 2, 'Two example rooms render');
        assert.ok((await page.locator('[data-qa="calculator-area"]').innerText()).includes('32'), 'Default calculator area is 32 m²');
        assert.ok((await page.locator('[data-qa="calculator-budget"]').innerText()).includes('19'), 'Default budget uses 600 ₽/m²');
        await page.getByRole('button', { name: '+ Добавить помещение' }).click();
        assert.equal(await page.locator('[data-qa="calculator-room"]').count(), 3, 'Adding a room updates the result');
        const wa = await page.locator('[data-qa="calculator-whatsapp"]').getAttribute('href');
        assert.ok(wa && new URL(wa).searchParams.get('text')?.includes('Общая площадь'), 'Calculator sends draft data, not an empty message');
      }
      if (pathname.endsWith('/kalkulyator-shtukaturki-sten/')) {
        const calc = page.locator('[data-qa="plaster-calculator"]');
        assert.equal(await calc.count(), 1, 'Direct plaster calculator renders');
        assert.equal(await calc.locator('[data-qa="plaster-room"]').count(), 1, 'Initial plaster room');
        assert.ok((await calc.locator('[data-qa="plaster-gross"]').innerText()).includes('48,6'), 'Correct room walls');
        assert.ok((await calc.locator('[data-qa="plaster-net"]').innerText()).includes('45,3'), 'Openings deducted');
        assert.ok((await calc.locator('[data-qa="plaster-volume"]').innerText()).includes('0,6795'), 'Layer volume');
        assert.ok((await calc.locator('[data-qa="plaster-budget"]').innerText()).includes('24'), 'Starting estimate');
        await calc.getByRole('checkbox', { name: 'Включить' }).check();
        assert.equal(await calc.locator('[data-qa="plaster-bags"]').count(), 0, 'No bags without actual manufacturer values');
        assert.ok((await calc.locator('[data-qa="plaster-net"]').innerText()).includes('45,3'), 'Incomplete optional bags never hide geometry');
        await calc.locator('[data-qa="plaster-material-consumption"]').fill('8.5');
        await calc.locator('[data-qa="plaster-material-bagWeight"]').fill('30');
        assert.ok((await calc.locator('[data-qa="plaster-bags"]').innerText()).includes('21 мешок'), 'Bag count uses entered package rate and proper grammar');

        await calc.getByRole('button', { name: '+ Добавить помещение' }).click();
        assert.equal(await calc.locator('[data-qa="plaster-room"]').count(), 2, 'Room added');
        const href = await calc.locator('[data-qa="plaster-whatsapp"]').getAttribute('href');
        assert.ok(href && new URL(href).searchParams.get('text')?.includes('Помещение 2'), 'Draft estimate includes second room');
        const sharedRooms = [{
          name: "Проверка", length: 5, width: 4, height: 2.7, thickness: 15,
          openings: [{ label: "Окно", width: 1.5, height: 1, count: 1 }, { label: "Дверь", width: .9, height: 2, count: 1 }],
        }];
        const sharedMix = { enabled: true, consumption: 8.5, bagWeight: 30, reserve: 5 };
        const shared = new URL(origin + pathname);
        shared.searchParams.set('walls', JSON.stringify(sharedRooms));
        shared.searchParams.set('mix', JSON.stringify(sharedMix));
        await page.goto(shared.href, { waitUntil: 'networkidle' });
        assert.ok((await page.locator('[data-qa="plaster-net"]').innerText()).includes('45,3'), 'Shared URL restores geometry');
        assert.ok((await page.locator('[data-qa="plaster-bags"]').innerText()).includes('21 мешок'), 'Shared URL restores package configuration');

      }
      const guideToolPaths = {
        "/silalesa/guides/remont/shtukaturka-ili-styazhka-chto-snachala/": ["kalkulyator-shtukaturki-sten", "kalkulyator-styazhki-pola"],
        "/silalesa/guides/remont/polusuhaya-ili-mokraya-styazhka/": ["kalkulyator-styazhki-pola"],
        "/silalesa/guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka/": ["kalkulyator-shtukaturki-sten"],
        "/silalesa/guides/remont/gipsovaya-ili-tsementnaya-shtukaturka/": ["kalkulyator-shtukaturki-sten"],
      };
      if (guideToolPaths[pathname]) {
        const links = page.locator('[data-qa="guide-estimate-link"]');
        assert.equal(await page.locator('[data-qa="guide-estimate-links"]').count(), 1, 'Guide needs an early calculation choice: ' + pathname);
        assert.equal(await links.count(), guideToolPaths[pathname].length, 'Correct calculator choices: ' + pathname);
        for (const calculator of guideToolPaths[pathname]) {
          assert.equal(await links.filter({ has: page.locator(`a[href$="/${calculator}/"]`) }).count(), 0, 'No nested links');
          assert.equal(await links.evaluateAll((els, path) => els.filter((x) => x.getAttribute("href")?.endsWith("/" + path + "/")).length, calculator), 1, 'Calculator link missing: ' + calculator);
        }
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
