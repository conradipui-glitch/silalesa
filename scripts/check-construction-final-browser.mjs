import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const origin = 'http://127.0.0.1:4173';
const site = 'https://conradipui-glitch.github.io/silalesa/';
const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
assert.equal(routes.length, 14, 'The construction release has 14 canonical pages');

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
      if (!pathname.includes('/kalkulyator-styazhki-pola/') && !pathname.includes('/kalkulyator-shtukaturki-sten/')) {
        // Static prerender already contains H1 before the lazy React article hydrates.
        // Wait for the client-visible mascot before checking dynamic article links and FAQ.
        await page.locator('[data-qa="forest-lead-trigger"]').waitFor({ state: 'visible' });
      }
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
        const draftHref = await page.locator('[data-qa="calculator-contact"]').getAttribute('href');
        assert.ok(draftHref?.startsWith('#contact-draft=') && decodeURIComponent(draftHref.slice('#contact-draft='.length)).includes('Общая площадь'), 'Calculator prepares a local, consent-based contact draft');
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
        const href = await calc.locator('[data-qa="plaster-contact"]').getAttribute('href');
        assert.ok(href?.startsWith('#contact-draft=') && decodeURIComponent(href.slice('#contact-draft='.length)).includes('Помещение 2'), 'Local draft includes second room');
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
      if (pathname.endsWith('/guides/stroitelstvo/skolko-stoit-kladka-kirpicha-i-gazobetona/') || pathname.endsWith('/guides/remont/demontazh-pered-remontom-smeta/')) {
        assert.ok(/кладк|демонтаж/iu.test(state.text), 'Construction buyer guide content missing: ' + pathname);
        assert.equal(await page.locator('a[href*="/services/"]').count() > 0, true, 'Guide needs service navigation: ' + pathname);
        assert.equal(await page.locator('img[alt*="баня"]').count(), 0, 'No unrelated bath image');
        assert.ok((await page.locator('a[href^="#contact-draft="]').count()) >= 1, 'Guide needs an optional contact chooser');
      }
      assert.deepEqual(errors, [], 'No JavaScript errors: ' + pathname);
      checked += 1;
    }

    // Consent-based mascot-assisted draft remains local until the visitor acts.
    await page.goto(origin + '/silalesa/', { waitUntil: 'networkidle' });
    const assistant = page.locator('[data-qa="forest-lead-assistant"]');
    await assistant.waitFor({ state: 'visible' });
    assert.equal(await page.locator('[data-qa="forest-lead-dialog"]').count(), 0, 'Mascot does not auto-open a form');
    assert.equal(await page.locator('[data-qa="forest-lead-hint"]').count(), 0, 'Mascot does not show an immediate hint');
    const mascot = page.locator('[data-qa="forest-lead-trigger"]');
    assert.equal(await mascot.count(), 1, 'One interactive forest mascot');
    await mascot.click();
    const dialog = page.locator('[data-qa="forest-lead-dialog"]');
    await dialog.waitFor({ state: 'visible' });
    await dialog.locator('select[name="service"]').selectOption('Кладочные работы');
    await dialog.locator('textarea[name="notes"]').fill('Стенка 20 м²');
    await dialog.locator('input[name="phone"]').fill('+7 999 100-00-00');
    await dialog.locator('[data-qa="forest-lead-contact"]').click();
    const chooser = page.locator('[data-qa="contact-choice-dialog"]');
    await chooser.waitFor({ state: 'visible' });
    const draft = await chooser.getByRole('textbox', { name: 'Подготовленный текст обращения' }).inputValue();
    assert.ok(draft.includes('Кладочные работы') && draft.includes('Стенка 20 м²') && draft.includes('+7 999 100-00-00'), 'Contact chooser preserves the user-approved draft');
    assert.equal(await chooser.locator('[data-qa="contact-choice-call"]').getAttribute('href'), 'tel:+79136884533', 'Call channel is ready');
    assert.ok((await chooser.locator('[data-qa="contact-choice-max"]').getAttribute('href')).startsWith('https://max.ru/'), 'MAX channel exists without inventing owner profile');
    assert.equal(await page.evaluate(() => JSON.stringify(window.__silalesaEvents ?? []).includes('+7 999 100-00-00')), false, 'Never send visitor contact details to analytics');
    await page.keyboard.press('Escape');
    assert.equal(await chooser.count(), 0, 'Escape closes contact chooser');
    await page.goto(origin + '/silalesa/kalkulyator-styazhki-pola/', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('[data-qa="forest-lead-assistant"]').count(), 0, 'Mascot never obscures working calculators');

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
