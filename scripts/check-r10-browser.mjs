import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:4173/silalesa/';
const browser = await chromium.launch({ headless: true });
const failures = [];

async function visit(page, path, label) {
  const response = await page.goto(new URL(path, base).href, { waitUntil: 'networkidle', timeout: 30_000 });
  assert.equal(response?.status(), 200, `${label}: HTTP 200`);
  await page.locator('main h1').first().waitFor({ state: 'visible', timeout: 15_000 });
  const h1 = (await page.locator('main h1').first().innerText()).trim();
  assert.ok(h1.length > 8, `${label}: meaningful H1`);
  assert.ok(!h1.includes('Загружаем страницу'), `${label}: lazy component resolved`);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  assert.equal(canonical, new URL(path, 'https://conradipui-glitch.github.io/silalesa/').href, `${label}: canonical`);
  console.log('CHROMIUM_ROUTE_PASS', label, response?.status(), h1.slice(0, 70));
}

async function checkSeasonalDecor(page, label) {
  await page.goto(new URL('?decor=halloween', base).href, { waitUntil: 'networkidle', timeout: 30_000 });
  const decor = page.locator('[data-seasonal-theme="halloween"]');
  await decor.waitFor({ state: 'visible', timeout: 10_000 });
  assert.equal(await decor.evaluate(el => getComputedStyle(el).pointerEvents), 'none', `${label}: seasonal decor never intercepts clicks`);
  assert.equal(await page.locator('.seasonal-falling-leaf').count(), 7, `${label}: Halloween leaf field rendered`);
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, width: window.innerWidth }));
  assert.ok(dimensions.scrollWidth <= dimensions.width + 2, `${label}: seasonal decor creates horizontal overflow: ${JSON.stringify(dimensions)}`);
  console.log('CHROMIUM_HALLOWEEN_PASS', label, dimensions);

  await page.goto(new URL('?decor=off', base).href, { waitUntil: 'networkidle', timeout: 30_000 });
  assert.equal(await page.locator('[data-seasonal-theme="halloween"]').count(), 0, `${label}: decor=off disables seasonal layer`);
}

async function run(label, contextOptions) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  page.on('pageerror', error => failures.push(`${label}: ${error.message}`));
  await visit(page, '', `${label}: homepage`);
  const hero = page.locator('main img[src*="hero-home-"]').first();
  await hero.waitFor({ state: 'visible', timeout: 10_000 });
  await hero.evaluate(img => img.decode());
  assert.ok(await hero.evaluate(img => img.naturalWidth > 500), 'Hero image decoded with real pixels');
  const resourceNames = await page.evaluate(() => performance.getEntriesByType('resource').map(x => x.name));
  assert.ok(resourceNames.some(name => /index-[\w-]+\.js/.test(name)), 'Homepage loads JS entry');
  assert.ok(!resourceNames.some(name => /seoPages-[\w-]+\.js/.test(name)), 'Homepage does not preload 240 KB SEO registry');
  console.log('CHROMIUM_ENTRY_PASS', label, resourceNames.filter(name => /\.js$/.test(name)).length, 'JS requests');
  await checkSeasonalDecor(page, label);
  await visit(page, '', `${label}: homepage after seasonal override`);
  if (label === 'mobile') {
    const frameButton = page.locator('#layout [role="group"] button').filter({ hasText: '5,5' }).first();
    await frameButton.scrollIntoViewIfNeeded();
    await frameButton.click();
    await page.waitForTimeout(150);
    const layoutFit = await page.evaluate(() => {
      const panel = document.querySelector('#layout-panel');
      if (!panel) return null;
      const rect = panel.getBoundingClientRect();
      return {
        pageScrollWidth: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
        panelLeft: Math.round(rect.left),
        panelRight: Math.round(rect.right),
        panelWidth: Math.round(rect.width),
      };
    });
    assert.ok(layoutFit, 'Mobile frame layout panel exists');
    assert.ok(layoutFit.pageScrollWidth <= layoutFit.viewport + 2, `Mobile frame layout page overflow: ${JSON.stringify(layoutFit)}`);
    assert.ok(layoutFit.panelLeft >= -1 && layoutFit.panelRight <= layoutFit.viewport + 1, `Mobile frame layout panel clipped: ${JSON.stringify(layoutFit)}`);
    const layoutText = await page.locator('#layout-panel').innerText();
    assert.ok(layoutText.includes('≈ 2,2 м'), 'Frame sauna shows approximate 2.2 m room lengths');
    assert.ok(layoutText.includes('≈ 1,1 м'), 'Frame sauna shows approximate 1.1 m wash-room length');
    assert.ok(layoutText.includes('размеры помещений ориентировочные'), 'Frame sauna explains approximate room dimensions');
    console.log('CHROMIUM_LAYOUT_PASS', layoutFit);
  }
  await visit(page, 'mobilnaya-banya-omsk/', `${label}: catalogue`);
  await visit(page, 'banya-kvadro-3x2-omsk/', `${label}: product`);
  await visit(page, 'guides/bani/kak-vybrat-razmer-2x2-3x2-4x2/', `${label}: guide`);
  assert.ok((await page.evaluate(() => performance.getEntriesByType('resource').map(x => x.name))).some(name => /seoPages-[\w-]+\.js/.test(name)), 'SEO registry is fetched on landing routes');
  await visit(page, 'mehanizirovannaya-shtukaturka-omsk/', `${label}: service`);
  await visit(page, 'services/', `${label}: services hub`);
  if (label === 'mobile') {
    const wa = page.locator('a[href*="wa.me/"]').first();
    const href = await wa.getAttribute('href');
    assert.ok(href && href.startsWith('https://wa.me/') && href.includes('text='), 'Mobile WhatsApp link is encoded; no message sent');
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, width: window.innerWidth }));
    assert.ok(dimensions.scrollWidth <= dimensions.width + 2, `Mobile page horizontal overflow: ${JSON.stringify(dimensions)}`);
    console.log('CHROMIUM_MOBILE_PASS', dimensions);
  }
  await context.close();
}

try {
  await run('desktop', { viewport: { width: 1440, height: 900 } });
  await run('mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  assert.deepEqual(failures, [], 'No uncaught browser JS errors');
  console.log('R10 BROWSER PASS: two Chromium viewports, homepage/gallery/guide/product/services, lazy SEO, photo decode, WhatsApp link (not sent)');
} finally {
  await browser.close();
}
