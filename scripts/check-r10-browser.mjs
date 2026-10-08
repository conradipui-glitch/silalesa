import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = 'http://127.0.0.1:4173/silalesa/';
const browser = await chromium.launch({ headless: true });
const failures = [];

async function assertNoPairOverlap(page, selector, label) {
  const rects = await page.locator(selector).evaluateAll((elements) =>
    elements
      .filter((el) => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 1 && rect.height > 1;
      })
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          name: el.getAttribute('data-qa') || el.id || el.textContent?.trim().slice(0, 45) || el.tagName,
          left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom,
        };
      }),
  );
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      const a = rects[i];
      const b = rects[j];
      const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      assert.ok(!(overlapX > 1 && overlapY > 1), `${label}: overlap between "${a.name}" and "${b.name}" (${Math.round(overlapX)}×${Math.round(overlapY)} px)`);
    }
  }
}

async function checkConstructionLayout(page, label) {
  const fit = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    width: window.innerWidth,
  }));
  assert.ok(fit.scrollWidth <= fit.width + 2, `${label}: horizontal overflow ${JSON.stringify(fit)}`);

  await assertNoPairOverlap(page, '[data-qa="hero-copy"], [data-qa="hero-media"]', `${label} hero columns`);
  await assertNoPairOverlap(page, '[data-qa="hero-card-private"], [data-qa="hero-card-commercial"]', `${label} hero cards`);
  await assertNoPairOverlap(page, '[data-qa="header-logo"], [data-qa="header-nav"], [data-qa="header-actions"]', `${label} header`);
  await assertNoPairOverlap(page, '#services article', `${label} service cards`);
  await assertNoPairOverlap(page, '[data-qa="specialty-card"]', `${label} specialty cards`);

  const overlayFit = await page.locator('[data-qa="hero-overlay-cards"]').evaluate((overlay) => {
    const style = getComputedStyle(overlay);
    if (style.display === 'none') return { hidden: true };
    const parent = overlay.parentElement.getBoundingClientRect();
    const rect = overlay.getBoundingClientRect();
    return {
      hidden: false,
      inside: rect.left >= parent.left - 1 && rect.right <= parent.right + 1 && rect.top >= parent.top - 1 && rect.bottom <= parent.bottom + 1,
    };
  });
  assert.ok(overlayFit.hidden || overlayFit.inside, `${label}: hero overlay cards escape image bounds`);
  console.log('CHROMIUM_LAYOUT_INTEGRITY_PASS', label, fit);
}



async function checkServiceDiscovery(page, label) {
  const groups = page.locator('#services [data-qa="service-group"]');
  assert.equal(await groups.count(), 4, `${label}: services are grouped into four customer-readable categories`);

  const distribution = [];
  for (const group of await groups.all()) {
    distribution.push(await group.locator('article').count());
  }
  assert.deepEqual(distribution, [4, 3, 4, 3], `${label}: all 14 directions remain visible in correct groups`);

  const navLinks = page.locator('#services nav[aria-label="Группы строительных работ"] a');
  assert.equal(await navLinks.count(), 4, `${label}: service group navigation is available`);
  const targets = await navLinks.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
  assert.deepEqual(targets, ['#services-general', '#services-structure', '#services-finishing', '#services-special'], `${label}: group navigation uses real in-page anchors`);

  const serviceLinks = page.locator('#services [data-qa="service-group"] article a');
  assert.equal(await serviceLinks.count(), 14, `${label}: every construction direction has an action`);
  const linkKinds = await serviceLinks.evaluateAll((els) => els.map((el) => ({
    href: el.getAttribute('href') || '',
    label: el.getAttribute('aria-label') || '',
    height: Math.round(el.getBoundingClientRect().height),
  })));
  assert.equal(linkKinds.filter((entry) => entry.href.startsWith('https://wa.me/')).length, 12, `${label}: 12 directions open a service-specific consultation`);
  assert.equal(linkKinds.filter((entry) => /mehanizirovannaya-shtukaturka-omsk|polusuhaya-styazhka-omsk/.test(entry.href)).length, 2, `${label}: two detailed service pages remain linked`);
  assert.ok(linkKinds.every((entry) => entry.height >= 44 && entry.label.length > 15), `${label}: every service action has a readable, accessible 44px target`);
  assert.equal(await page.locator('#process ol > li').count(), 6, `${label}: five process steps plus clear contact action`);
  console.log('CHROMIUM_SERVICE_DISCOVERY_PASS', label, distribution);
}

async function checkConstructionUx(page, label, { touch = false } = {}) {
  const serviceBody = page.locator('#services article > p');
  if (await serviceBody.count()) {
    const fontSizes = await serviceBody.evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).fontSize)));
    assert.ok(fontSizes.every((size) => size >= 16), `${label}: service body copy stays at least 16px: ${JSON.stringify(fontSizes)}`);
  }

  const lowContrastUtility = await page.locator('body').evaluate(() =>
    [...document.querySelectorAll('[class]')]
      .filter((el) => {
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
          && /text-cream-300\/(35|40|45|50|55|60)(?:\s|$)/.test(el.className);
      })
      .map((el) => ({ text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 70), className: el.className })),
  );
  assert.deepEqual(lowContrastUtility, [], `${label}: construction UI must not use known low-contrast cream utilities`);

  if (touch) {
    const targets = page.locator('header a:visible, header button:visible, .fixed.bottom-0 a:visible');
    const small = await targets.evaluateAll((els) =>
      els.map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          text: (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 70),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        };
      }).filter((item) => item.width < 44 || item.height < 44),
    );
    assert.deepEqual(small, [], `${label}: visible touch targets stay at least 44x44px`);
  }

  const specialtyImages = page.locator('[data-qa="specialty-card"] img');
  if (await specialtyImages.count()) {
    const attrs = await specialtyImages.evaluateAll((imgs) => imgs.map((img) => ({
      srcset: img.getAttribute('srcset'),
      sizes: img.getAttribute('sizes'),
      loading: img.getAttribute('loading'),
      decoding: img.getAttribute('decoding'),
    })));
    for (const image of attrs) {
      assert.ok(image.srcset?.includes('640w') && image.srcset.includes('960w') && image.srcset.includes('1400w'), `${label}: specialty image has responsive srcset`);
      assert.ok(image.sizes, `${label}: specialty image declares sizes`);
      assert.equal(image.loading, 'lazy', `${label}: below-fold specialty image is lazy loaded`);
      assert.equal(image.decoding, 'async', `${label}: below-fold specialty image decodes asynchronously`);
    }
  }
}

async function checkConstructionKeyboard() {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  page.on('pageerror', error => failures.push(`keyboard: ${error.message}`));
  await visit(page, '', 'keyboard: homepage');

  await page.keyboard.press('Tab');
  const skip = page.locator('a[href="#main"]');
  assert.ok(await skip.isVisible(), 'Skip link becomes visible when focused');

  const burger = page.locator('header button[aria-controls="construction-mobile-menu"]');
  await burger.click();
  const dialog = page.locator('#construction-mobile-menu');
  await dialog.waitFor({ state: 'attached' });
  const dialogState = await dialog.evaluate((el) => {
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return { display: style.display, visibility: style.visibility, width: Math.round(rect.width), height: Math.round(rect.height) };
  });
  assert.ok(dialogState.display !== 'none' && dialogState.visibility !== 'hidden' && dialogState.width > 0 && dialogState.height > 0, `Mobile menu is visibly rendered: ${JSON.stringify(dialogState)}`);

  const focusable = dialog.locator('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
  const count = await focusable.count();
  assert.ok(count >= 2, 'Mobile dialog contains multiple focusable controls');
  assert.ok(await focusable.first().evaluate((el) => document.activeElement === el), 'Mobile dialog moves focus to its first link');

  await page.keyboard.press('Shift+Tab');
  assert.ok(await focusable.last().evaluate((el) => document.activeElement === el), 'Shift+Tab wraps focus to the last dialog control');
  await page.keyboard.press('Tab');
  assert.ok(await focusable.first().evaluate((el) => document.activeElement === el), 'Tab wraps focus back to the first dialog control');

  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  assert.ok(await burger.evaluate((el) => document.activeElement === el), 'Escape closes menu and returns focus to trigger');

  await context.close();
}

async function checkReducedMotion() {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => failures.push(`reduced-motion: ${error.message}`));
  await visit(page, '', 'reduced-motion: homepage');

  const state = await page.locator('.reveal').first().evaluate((el) => {
    const style = getComputedStyle(el);
    const maxTransition = Math.max(...style.transitionDuration.split(',').map((item) => parseFloat(item) || 0));
    return {
      opacity: style.opacity,
      transform: style.transform,
      maxTransition,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    };
  });
  assert.equal(state.opacity, '1', 'Reduced motion reveals content immediately');
  assert.equal(state.transform, 'none', 'Reduced motion removes reveal transforms');
  assert.ok(state.maxTransition <= 0.001, `Reduced motion transition is effectively disabled: ${state.maxTransition}s`);
  assert.equal(state.scrollBehavior, 'auto', 'Reduced motion disables smooth scrolling');

  await context.close();
}

async function checkHomepageViewport(label, contextOptions) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  page.on('pageerror', error => failures.push(`${label}: ${error.message}`));
  await visit(page, '', `${label}: homepage visual QA`);
  await checkConstructionLayout(page, label);
  await checkServiceDiscovery(page, label);
  assert.equal(await page.locator('#estimate [data-qa="estimate-checklist"] article').count(), 3, `${label}: transparent calculation conditions are visible`);
  assert.equal(await page.locator('[data-qa="hero-image-disclaimer"]').count(), 1, `${label}: generated hero clearly discloses it is not a company project photo`);
  const estimateText = await page.locator('#estimate').innerText();
  assert.ok(estimateText.includes('срок действия цены') && estimateText.includes('гарантийные условия') && estimateText.includes('порядок оплаты'), `${label}: estimate checklist covers contract questions`);
  await checkConstructionUx(page, label, { touch: Boolean(contextOptions.isMobile || contextOptions.hasTouch) });
  const hero = page.locator('img[data-construction-hero]');
  await hero.evaluate((img) => img.decode());
  const src = await hero.getAttribute('src');
  assert.ok(src && src.includes('assets/construction-hero-mixed.webp') && !src.startsWith('https://images.unsplash.com'), `${label}: generated construction hero must be served locally`);
  await context.close();
}

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
  const hero = page.locator('img[data-construction-hero]').first();
  await hero.waitFor({ state: 'visible', timeout: 10_000 });
  await hero.evaluate(img => img.decode());
  assert.ok(await hero.evaluate(img => img.naturalWidth > 500), 'Hero image decoded with real pixels');
  const heroSrc = await hero.getAttribute('src');
  assert.ok(heroSrc && heroSrc.includes('assets/construction-hero-mixed.webp') && !heroSrc.startsWith('https://images.unsplash.com'), 'Construction homepage serves the generated hero locally');
  await checkConstructionLayout(page, label);
  const resourceNames = await page.evaluate(() => performance.getEntriesByType('resource').map(x => x.name));
  assert.ok(resourceNames.some(name => /index-[\w-]+\.js/.test(name)), 'Homepage loads JS entry');
  assert.ok(!resourceNames.some(name => /seoPages-[\w-]+\.js/.test(name)), 'Homepage does not preload 240 KB SEO registry');
  console.log('CHROMIUM_ENTRY_PASS', label, resourceNames.filter(name => /\.js$/.test(name)).length, 'JS requests');
  await checkSeasonalDecor(page, label);
  await visit(page, '', `${label}: homepage after seasonal override`);
  if (label === 'mobile') {
    if (await page.locator('#layout').count()) {
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
    } else {
      const serviceCards = page.locator('#services article');
      await serviceCards.first().scrollIntoViewIfNeeded();
      assert.equal(await serviceCards.count(), 14, 'Construction homepage exposes all 14 requested service directions');
      const serviceText = await page.locator('#services').innerText();
      assert.ok(serviceText.includes('Коттеджи под ключ') && serviceText.includes('Монолитные работы') && serviceText.includes('Промышленные полы'), 'Core construction directions are visible');
      const fit = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, width: window.innerWidth }));
      assert.ok(fit.scrollWidth <= fit.width + 2, `Construction homepage mobile overflow: ${JSON.stringify(fit)}`);
      console.log('CHROMIUM_CONSTRUCTION_HOME_PASS', fit);
    }
  }
  await visit(page, 'mobilnaya-banya-omsk/', `${label}: catalogue`);
  await visit(page, 'banya-kvadro-3x2-omsk/', `${label}: product`);
  assert.equal(await page.locator('[data-qa="price-verification-note"]').count(), 1, `${label}: sauna prices are explicitly flagged for reconfirmation`);
  assert.equal(await page.locator('a[href$="/#quiz"]').count(), 0, `${label}: obsolete quiz link does not appear on sauna landing`);
  await visit(page, 'guides/bani/kak-vybrat-razmer-2x2-3x2-4x2/', `${label}: guide`);
  assert.equal(await page.locator('aside[aria-label="О характере материала"]').count(), 1, `${label}: article has information-scope disclaimer`);
  assert.ok((await page.evaluate(() => performance.getEntriesByType('resource').map(x => x.name))).some(name => /seoPages-[\w-]+\.js/.test(name)), 'SEO registry is fetched on landing routes');
  await visit(page, 'mehanizirovannaya-shtukaturka-omsk/', `${label}: service`);
  assert.equal(await page.locator('[data-qa="price-verification-note"]').count(), 1, `${label}: service prices are flagged for reconfirmation`);
  assert.ok((await page.locator('figure figcaption').allInnerTexts()).some(text => text.includes('не являются подтверждённым фотоотчётом')), `${label}: before/after visual is not passed off as verified portfolio`);
  await visit(page, 'services/', `${label}: services hub`);
  assert.ok((await page.locator('a[href$="/#estimate"]').count()) >= 1, `${label}: services hub links to pricing transparency`);
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
  await checkHomepageViewport('wide', { viewport: { width: 1800, height: 900 } });
  await checkHomepageViewport('small-phone', { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await checkHomepageViewport('tablet-touch', { viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await checkHomepageViewport('landscape-touch', { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await checkHomepageViewport('tablet', { viewport: { width: 1024, height: 800 } });
  await run('desktop', { viewport: { width: 1440, height: 900 } });
  await run('mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await checkConstructionKeyboard();
  await checkReducedMotion();
  assert.deepEqual(failures, [], 'No uncaught browser JS errors');
  console.log('R10 BROWSER PASS: Chromium visual/UX checks at 375/390/768/844x390/1024/1440/1800, focus trap, reduced motion, touch targets, responsive images, lazy SEO and routes');
} finally {
  await browser.close();
}
