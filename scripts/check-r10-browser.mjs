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

  const serviceLinks = page.locator('#services [data-qa="service-group"] article a[aria-label^="Обсудить работы:"], #services [data-qa="service-group"] article a[aria-label^="Подробнее об услуге"]');
  assert.equal(await serviceLinks.count(), 14, `${label}: every construction direction has an action`);
  const wave3Guides = page.locator('#services [data-qa="wave3-catalogue-guide"]');
  assert.equal(await wave3Guides.count(), 2, `${label}: masonry and demolition offer additional relevant guides without replacing 14 service actions`);

  const linkKinds = await serviceLinks.evaluateAll((els) => els.map((el) => ({
    href: el.getAttribute('href') || '',
    label: el.getAttribute('aria-label') || '',
    height: Math.round(el.getBoundingClientRect().height),
  })));
  assert.equal(linkKinds.filter((entry) => entry.href.startsWith('#contact-draft=')).length, 12, `${label}: 12 directions open a service-specific consultation`);
  assert.equal(linkKinds.filter((entry) => /mehanizirovannaya-shtukaturka-omsk|polusuhaya-styazhka-omsk/.test(entry.href)).length, 2, `${label}: two detailed service pages remain linked`);
  assert.ok(linkKinds.every((entry) => entry.height >= 44 && entry.label.length > 15), `${label}: every service action has a readable, accessible 44px target`);
  const hints = page.locator('#services [data-qa="service-request-hint"]');
  assert.equal(await hints.count(), 14, `${label}: all construction directions show estimate preparation hints`);
  const hintText = await hints.allInnerTexts();
  assert.ok(hintText.every((item) => item.startsWith("Для первого расчёта:") && item.length > 40), `${label}: estimate hints are clear, nonempty text`);
  for (const [serviceName, keywords] of Object.entries({
    "Кровельные работы": ["монтаж или ремонт", "покрытие"],
    "Фасадные работы": ["материал стен", "утепления"],
    "Демонтажные работы": ["что нужно разобрать", "условия доступа"],
  })) {
    const card = page.locator('#services [data-qa="service-group"] article').filter({ hasText: serviceName });
    assert.equal(await card.count(), 1, `${label}: distinct service card for ${serviceName}`);
    const href = await card.locator('a[href^="#contact-draft="]').getAttribute('href');
    const message = decodeURIComponent(href.slice('#contact-draft='.length));
    assert.ok(message.includes(serviceName), `${label}: consultation prefills chosen service`);
    assert.ok(keywords.every((word) => message.includes(word)), `${label}: consultation prefills relevant estimation context for ${serviceName}`);
  }
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

  const specialtyCards = page.locator('[data-qa="specialty-card"]');
  assert.equal(await specialtyCards.count(), 2, `${label}: plaster and screed cards exist`);
  assert.equal(await specialtyCards.locator('[role="slider"]').count(), 2, `${label}: original before/after comparisons are available on homepage`);
  const images = await specialtyCards.locator('img').evaluateAll((imgs) => imgs.map((img) => ({
    src: img.getAttribute('src') || '',
    loading: img.getAttribute('loading'),
    decoding: img.getAttribute('decoding'),
  })));
  assert.equal(images.length, 4, `${label}: four local comparison images are shown`);
  for (const name of ['plaster-before', 'plaster-after', 'screed-before', 'screed-after']) {
    assert.ok(images.some((item) => item.src.includes(name)), `${label}: local comparison asset ${name} is used`);
  }
  for (const image of images) {
    assert.ok(!image.src.includes('unsplash'), `${label}: no unrelated stock photo in service showcase`);
    assert.equal(image.loading, 'lazy', `${label}: comparison image is lazy-loaded`);
    assert.equal(image.decoding, 'async', `${label}: comparison image uses async decoding`);
  }
  assert.equal(await specialtyCards.locator('a[href$="-omsk/"]').count(), 2, `${label}: both services retain detail links`);
}

async function checkIntentAwareHomepage() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const homeCanonical = "https://conradipui-glitch.github.io/silalesa/";

  const cases = [
    ["monolith", "Монолитные работы"],
    ["roofing", "Кровельные работы"],
    ["plaster", "Механизированная штукатурка"],
    ["screed", "Полусухая стяжка"],
    ["cottages", "Коттеджи под ключ"],
    ["hangars", "Строительство ангаров"],
    ["demolition", "Демонтажные работы"],
  ];
  for (const [code, title] of cases) {
    const response = await page.goto(new URL(`?service=${code}`, base).href, { waitUntil: 'networkidle', timeout: 30_000 });
    assert.equal(response?.status(), 200, `Focused ${code} uses the real home route`);
    assert.equal(await page.locator('[data-qa="hero-copy"]').getAttribute("data-offer-mode"),"direct");
    assert.equal(await page.locator('[data-qa="hero-copy"]').getAttribute("data-offer-code"),code);
    const heading = (await page.locator("main h1").innerText()).trim();
    assert.ok(heading.includes(title) && heading.includes("в Омске"), `Focused H1 names the requested service: ${heading}`);
    const href = await page.locator('[data-qa="hero-copy"] a[href^="#contact-draft="]').first().getAttribute("href");
    assert.ok(decodeURIComponent(href.slice('#contact-draft='.length)).includes(title), `Focused contact chooser prompt matches ${title}`);
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),homeCanonical,"Explicit focus never generates SEO duplicate canonical");
    assert.equal(await page.locator('[data-qa="offer-context-note"]').count(),1,"Explicit focus explains navigation context");
  }

  for (const query of ["", "?service=invalid-token", "?service=monolith%20roofing"]) {
    const response = await page.goto(new URL(query,base).href,{waitUntil:"networkidle",timeout:30_000});
    assert.equal(response?.status(),200);
    assert.equal(await page.locator('[data-qa="hero-copy"]').getAttribute("data-offer-mode"),"general","Unknown/blank focus falls back to neutral");
    assert.ok((await page.locator("main h1").innerText()).includes("Строительные работы"),"Neutral H1 focuses on construction services");
    assert.equal(await page.locator('[data-qa="offer-context-note"]').count(),0,"No fake personalized context");
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),homeCanonical);
  }
  console.log("CHROMIUM_INTENT_OFFER_PASS: seven explicit services, unknown and direct fallback, canonical/CTA parity");
  await context.close();
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

async function checkSocialServiceBriefs() {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await context.newPage();
  page.on("pageerror", (error) => failures.push(`social-brief: ${error.message}`));
  await visit(page, "brief/roofing/", "social: roofing link");
  assert.equal(await page.locator('[data-qa="social-brief"]').getAttribute("data-service-code"), "roofing");
  assert.ok((await page.locator('[data-qa="brief-service-guidance"]').innerText()).includes("покрытие"), "Roofing brief offers practical photo and material checklist");
  assert.ok((await page.locator("main h1").innerText()).includes("Кровельные работы в Омске"), "Shareable service URL opens a focused micro page");
  assert.equal(await page.locator("header").count(), 1, "Focused brief has compact own header, not the full company nav");
  assert.equal(await page.locator("main").count(), 1, "Brief uses one main landmark");
  assert.equal(await page.locator('meta[name="robots"]').getAttribute("content"), "noindex, follow", "Campaign microsite is not another SEO landing");

  await page.locator("#brief-location").fill("Омск, Центральный округ");
  await page.locator("#brief-volume").fill("135 м²");
  await page.locator("#brief-timing").selectOption("В течение 1–3 месяцев");
  await page.locator("#brief-details").fill("Есть проект и фото кровли");
  const wa = page.locator('[data-qa="brief-contact"]');
  const url = new URL("https://example.invalid/" + (await wa.getAttribute("href")));
  const message = decodeURIComponent(url.hash.slice('#contact-draft='.length));
  for (const phrase of ["Кровельные работы", "Центральный округ", "135 м²", "1–3 месяцев", "Есть проект"]) {
    assert.ok(message.includes(phrase), `contact chooser prepared draft contains: ${phrase}`);
  }
  await page.locator("details > summary").click();
  assert.ok((await page.locator('[data-qa="brief-message-preview"]').innerText()).includes("135 м²"), "Visitor can review the message locally");
  assert.ok(url.host === "example.invalid" && url.hash.startsWith('#contact-draft='), "CTA stores a local draft, not a sent message");

  await page.locator("#brief-service").selectOption("monolith");
  await page.waitForURL("**/brief/monolith/");
  assert.ok((await page.locator("main h1").innerText()).includes("Монолитные работы"), "Changing service changes title and address");
  assert.ok((await page.locator('[data-qa="brief-contact"]').getAttribute("href")).includes("monolith")===false, "contact chooser uses Russian service text, not internal service code");
  assert.ok((await page.locator("#brief-location").inputValue()).includes("Центральный"), "Switching service retains entered brief");
  assert.equal(await page.locator('[data-qa="brief-service-guidance"]').count(), 0, "Generic directions do not inherit another service’s checklist");
  const fit = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: innerWidth }));
  assert.ok(fit.scroll <= fit.width + 2, `No mobile overflow: ${JSON.stringify(fit)}`);
  await context.close();

  const desk = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktop = await desk.newPage();
  await visit(desktop, "brief/", "social: general link");
  assert.equal(await desktop.locator("#brief-service option").count(), 15, "General microsite exposes 14 services plus mixed task");
  assert.ok((await desktop.locator("main h1").innerText()).includes("Строительные работы"), "General microsite is coherent on desktop");
  await visit(desktop, "brief/screed/", "social: screed guidance");
  assert.ok((await desktop.locator('[data-qa="brief-service-guidance"]').innerText()).includes("толщина"), "Screed checklist mentions thickness and covering");
  await visit(desktop, "brief/facades/", "social: facade guidance");
  assert.ok((await desktop.locator('[data-qa="brief-service-guidance"]').innerText()).includes("материал стен"), "Facades checklist covers substrate and access");

  const desktopFit = await desktop.evaluate(() => ({ scroll: document.documentElement.scrollWidth, width: innerWidth }));
  assert.ok(desktopFit.scroll <= desktopFit.width + 2, "No desktop overflow");
  await visit(desktop, "brief/roofing/?utm_source=telegram&utm_medium=post&utm_campaign=roof_oct26", "social: tagged roofing");
  const taggedMessage = decodeURIComponent((await desktop.locator('[data-qa="brief-contact"]').getAttribute("href")).slice('#contact-draft='.length));
  assert.ok(taggedMessage.includes("Публикация: Telegram / roof_oct26."), "Published campaign label is included in visitor-reviewed contact chooser draft");
  await desktop.locator("#brief-service").selectOption("facades");
  await desktop.waitForURL("**/brief/facades/?utm_source=telegram&utm_medium=post&utm_campaign=roof_oct26");
  const switchedMessage = decodeURIComponent((await desktop.locator('[data-qa="brief-contact"]').getAttribute("href")).slice('#contact-draft='.length));
  assert.ok(switchedMessage.includes("Фасадные работы") && switchedMessage.includes("Публикация: Telegram / roof_oct26."), "Campaign survives service selection, service remains accurate");
  await visit(desktop, "brief/screed/?utm_source=unexpected&utm_campaign=hacker", "social: untrusted source");
  const untrustedMessage = decodeURIComponent((await desktop.locator('[data-qa="brief-contact"]').getAttribute("href")).slice('#contact-draft='.length));
  assert.ok(!untrustedMessage.includes("Публикация:"), "Unknown UTM source cannot inject attribution into contact chooser");
  await visit(desktop, "brief/roofing/?utm_source=vk&utm_campaign=%0Asecret", "social: rejected campaign");
  const rejectedMessage = decodeURIComponent((await desktop.locator('[data-qa="brief-contact"]').getAttribute("href")).slice('#contact-draft='.length));
  assert.ok(rejectedMessage.includes("Публикация: ВКонтакте.") && !rejectedMessage.includes("secret"), "Malicious or personal campaign values are rejected");
  console.log("CHROMIUM_CAMPAIGN_TAG_PASS: Telegram/VK, service changes, missing/invalid labels, opt-in draft parity");

  console.log("CHROMIUM_SOCIAL_BRIEF_PASS: direct mobile and desktop URLs, own OG/noindex metadata, live service select, editable contact chooser draft");
  await desk.close();
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
  assert.equal(await page.locator('[data-qa="hero-image-disclaimer"]').count(), 0, `${label}: hero has no intrusive disclosure badge`);
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
  const expectedCanonical = new URL(path, 'https://conradipui-glitch.github.io/silalesa/');
  expectedCanonical.search = '';
  expectedCanonical.hash = '';
  assert.equal(canonical, expectedCanonical.href, `${label}: canonical strips UTM and fragments`);
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
  assert.equal(await page.locator('header a[href*="banya"], footer a[href*="banya"], nav a[href*="banya"]').count(), 0, `${label}: construction navigation does not promote archived saunas`);
  await visit(page, 'guides/remont/polusuhaya-ili-mokraya-styazhka/', `${label}: screed guide`);
  const screedCopy = await page.locator('main').innerText();
  assert.ok(screedCopy.includes('Полусухая смесь содержит меньше воды и требует уплотнения'), `${label}: screed first answer uses approved source rather than stale R3 override`);
  const screedAction = page.getByRole('link', { name: 'Запросить расчёт стяжки' }).first();
  assert.equal(await screedAction.count(), 1, `${label}: screed guide offers a named estimate action`);
  const screedContact = new URL('https://example.invalid/' + (await screedAction.getAttribute('href')));
  assert.ok(decodeURIComponent(screedContact.hash.slice('#contact-draft='.length)).includes('Нужен расчёт полусухой стяжки'), `${label}: estimate message reflects screed service`);
  const screedNote = page.locator('aside[aria-label="О характере материала"]');
  assert.equal(await screedNote.count(), 1, `${label}: guide has a brief technical-scope note`);
  assert.ok((await screedNote.innerText()).length < 180, `${label}: no overly wordy disclaimer`);
  assert.ok(!/бан[ьяи]|квадро|саун/iu.test(screedCopy), `${label}: construction guide contains no sauna promotion`);
  await visit(page, 'guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka/', `${label}: plaster comparison guide`);
  assert.ok((await page.locator('main').innerText()).includes('Для расчёта механизированной штукатурки в Омске пригодятся площадь и фото стен'), `${label}: plaster guide uses revised opening`);
  // On mobile, innerWidth may grow to match an overflowing document: compare with clientWidth.
  const guideFit = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
    visual: window.visualViewport?.width,
  }));
  assert.ok(guideFit.document <= guideFit.viewport + 2, `${label}: long Russian plaster H1 must not widen the page: ${JSON.stringify(guideFit)}`);
  assert.ok((await page.evaluate(() => performance.getEntriesByType('resource').map(x => x.name))).some(name => /SeoLandingPage-[\w-]+\.js/.test(name)), 'Construction landing component is fetched lazily');
  assert.equal(await page.locator('a[href*="banya"], a[href*="/guides/bani/"]').count(), 0, `${label}: screed article does not recommend archived saunas`);
  await visit(page, 'mehanizirovannaya-shtukaturka-omsk/', `${label}: service`);
  assert.equal(await page.locator('[data-qa="price-verification-note"]').count(), 1, `${label}: service prices are flagged for reconfirmation`);
  assert.ok((await page.locator('figure figcaption').allInnerTexts()).some(text => text.includes('Примеры процесса работ и результата')), `${label}: service comparison is labelled as examples without excessive disclaimer`);
  assert.equal(await page.locator('a[href*="banya"], a[href*="/guides/bani/"]').count(), 0, `${label}: service page contains no sauna cross-promotion`);
  await visit(page, 'services/', `${label}: services hub`);
  assert.ok((await page.locator('a[href$="/#estimate"]').count()) >= 1, `${label}: services hub links to pricing transparency`);
  // Retired sauna routes must show a truthful 404, not silently render home.
  await page.evaluate((url) => {
    history.pushState({}, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, new URL('mobilnaya-banya-omsk/', base).pathname);
  await page.locator('main h1').filter({ hasText: 'Такой страницы нет' }).waitFor({ state: 'visible', timeout: 10_000 });
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, follow', `${label}: retired route is noindex`);
  assert.equal(await page.locator('a[href*="banya"], a[href*="/guides/bani/"]').count(), 0, `${label}: 404 only offers construction routes`);
  await visit(page, 'services/', `${label}: return from retired route`);
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'index, follow', `${label}: indexability is restored after 404`);
  if (label === 'mobile') {
    const wa = page.locator('a[href^="#contact-draft="]').first();
    const href = await wa.getAttribute('href');
    assert.ok(href && href.startsWith('#contact-draft=') && decodeURIComponent(href.slice('#contact-draft='.length)).length > 10, 'Mobile contact chooser link is encoded; no message sent');
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
  await checkIntentAwareHomepage();
  await checkSocialServiceBriefs();
  await checkReducedMotion();
  assert.deepEqual(failures, [], 'No uncaught browser JS errors');
  console.log('R10 BROWSER PASS: Chromium visual/UX checks at 375/390/768/844x390/1024/1440/1800, focus trap, reduced motion, touch targets, responsive images, lazy SEO and routes');
} finally {
  await browser.close();
}
