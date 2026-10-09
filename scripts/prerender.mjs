import fs from "node:fs/promises";
import path from "node:path";
import { renderPlasterFallback } from "./plaster-fallback.mjs";
import { saunaChoiceFallback } from "./sauna-choice-fallback.mjs";
import { operationalGuideFallback } from "./operational-guide-fallback.mjs";
import { constructionHomeFallback } from "./home-fallback.mjs";
import { saunaOfferFallback } from "./sauna-offer-fallback.mjs";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const SITE_ORIGIN = "https://conradipui-glitch.github.io";
const BASE_PATH = "/silalesa/";
const SITE_URL = `${SITE_ORIGIN}${BASE_PATH}`;
const REPAIR_GUIDE_SLUG = "guides/remont/shtukaturka-ili-styazhka-chto-snachala";
const SCREED_GUIDE_SLUG = "guides/remont/polusuhaya-ili-mokraya-styazhka";
const PLASTER_GUIDE_SLUG = "guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka";
const MATERIAL_GUIDE_SLUG = "guides/remont/gipsovaya-ili-tsementnaya-shtukaturka";

const basePages = [
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-pages.json"), "utf8")),
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-guides.json"), "utf8")),
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-guides-remont.json"), "utf8")),
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-guides-screed.json"), "utf8")),
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-guides-plaster.json"), "utf8")),
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-guides-materials.json"), "utf8")),
];
const saunaChoiceModels = JSON.parse(await fs.readFile(path.join(ROOT, "src/data/sauna-choice-models.json"), "utf8"));
const briefServices = JSON.parse(await fs.readFile(path.join(ROOT, "src/data/offer-contexts.json"), "utf8"));
const constructionCatalog = JSON.parse(await fs.readFile(path.join(ROOT, "src/data/construction-services.json"), "utf8"));
const assets = await fs.readdir(path.join(DIST, "assets"));
const modelAssets = Object.fromEntries([
  ["k2", "kvadro-2x2-"], ["k3", "kvadro-3x2-"], ["k4", "kvadro-4x2-"], ["f55", "karkasnaya-5-5-"],
].map(([key, prefix]) => {
  const file = assets.find((name) => name.startsWith(prefix) && name.endsWith(".webp"));
  if (!file) throw new Error(`Missing real packaged model image ${key}`);
  return [key, `${BASE_PATH}assets/${file}`];
}));
const pageOverrides = [
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides.json"), "utf8")),
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-next.json"), "utf8")),
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r3.json"), "utf8")),
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r4.json"), "utf8")),
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r5.json"), "utf8")),
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r6.json"), "utf8")),
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r7.json"), "utf8")),
];
const overrideBySlug = new Map();
for (const override of pageOverrides) {
  overrideBySlug.set(override.slug, { ...(overrideBySlug.get(override.slug) ?? {}), ...override });
}
// Only construction service URLs and their supporting articles are published here.
const pages = basePages
  .filter((page) => page.kind === "service" || (page.kind === "guide" && !page.slug.startsWith("guides/bani/")))
  .map((page) => ({ ...page, ...(overrideBySlug.get(page.slug) ?? {}) }));
const servicePages = pages.filter((page) => page.kind === "service");
const whatsappMatch = (await fs.readFile(path.join(ROOT, "src/data/products.ts"), "utf8")).match(/whatsapp:\s*"(\d+)"/);
if (!whatsappMatch) throw new Error("Canonical WhatsApp contact missing");
const template = await fs.readFile(path.join(DIST, "index.html"), "utf8");

const calculatorPage = {
  slug: "kalkulyator-styazhki-pola",
  title: "Калькулятор стяжки пола онлайн: площадь, объём, цена — Сила Леса",
  description: "Рассчитайте площадь, толщину и объём стяжки по нескольким помещениям. Ориентир стоимости в Омске, четыре точки замера, запас и результат без регистрации.",
  h1: "Калькулятор стяжки пола",
};
const plasterCalculatorPage = {
  slug: "kalkulyator-shtukaturki-sten",
  title: "Калькулятор штукатурки стен онлайн: площадь, проёмы, цена — Сила Леса",
  description: "Посчитайте штукатурку стен онлайн: комнаты, окна, двери, толщина слоя, площадь, объём и ориентир цены в Омске. Расход мешков — по данным с упаковки.",
  h1: "Калькулятор штукатурки стен",
};
const servicesHub = {
  slug: "services",
  title: "Строительные работы в Омске — Сила Леса",
  description: "Строительные работы в Омске: коттеджи под ключ, монолит, кладка, ангары, металлоконструкции, штукатурка, стяжка, промышленные полы, кровля, фасады и демонтаж.",
  h1: "Строительные работы в Омске",
  lead: "Монолит, кладка, штукатурка, стяжка, промышленные полы и другие работы. Отдельные этапы — основной формат предложения; комплексное строительство тоже можно обсудить.",
  directions: constructionCatalog.map((service) => service.title),
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function replaceTag(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html.replace("</head>", `${replacement}\n</head>`);
}

function applyPageMeta(html, { title, description, canonical }) {
  let next = html;
  next = next.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  next = replaceTag(next, /<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(description)}" />`);
  next = replaceTag(next, /<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonical}" />`);
  next = replaceTag(next, /<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
  next = replaceTag(next, /<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`);
  next = replaceTag(next, /<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${canonical}" />`);
  return next;
}

function staticSnapshot(page) {
  const canonical = `${SITE_URL}${page.slug}/`;
  const keyPoints = page.summary ?? page.points;
  const points = keyPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("");
  const faq = page.faq
    .map(([question, answer]) => `<section><h2>${escapeHtml(question)}</h2><p>${escapeHtml(answer)}</p></section>`)
    .join("");
  const isGuide = page.kind === "guide";
  const isRepairGuide = page.slug === REPAIR_GUIDE_SLUG;
  const isScreedGuide = page.slug === SCREED_GUIDE_SLUG;
  const isPlasterGuide = page.slug === PLASTER_GUIDE_SLUG;
  const isMaterialGuide = page.slug === MATERIAL_GUIDE_SLUG;
  const saunaChoice = saunaChoiceFallback(page, saunaChoiceModels, SITE_URL, whatsappMatch[1]);
  const operation = operationalGuideFallback(page, saunaChoiceModels, servicePages.find((item) => item.slug === "burenie-skvazhiny-omsk")?.priceLabel, SITE_URL, whatsappMatch[1]);
  const offer = saunaOfferFallback(page, saunaChoiceModels, SITE_URL, whatsappMatch[1], modelAssets);
  const comparison = isGuide && page.comparison
    ? `${page.choiceModels?.length ? '<details><summary>Подробная таблица сравнения готовой бани и строительства</summary>' : ''}<section><h2>${escapeHtml(page.comparison.heading)}</h2><p>${escapeHtml(page.comparison.intro)}</p><table><caption>Готовая Квадро и строительство на участке</caption><thead><tr><th>Критерий</th><th>Готовая Квадро</th><th>Строительство на участке</th></tr></thead><tbody>${page.comparison.rows.map(([criterion, ready, build]) => `<tr><th>${escapeHtml(criterion)}</th><td>${escapeHtml(ready)}</td><td>${escapeHtml(build)}</td></tr>`).join("")}</tbody></table></section>${page.choiceModels?.length ? '</details>' : ''}`
    : "";
  const methodComparison = isGuide && page.methodComparison
    ? `<details><summary>Подробная таблица сравнения способов штукатурки</summary><section aria-label="Сравнение способов штукатурки"><h2>${escapeHtml(page.methodComparison.heading)}</h2><p>${escapeHtml(page.methodComparison.intro)}</p><table><caption>${escapeHtml(page.methodComparison.heading)}</caption><thead><tr><th scope="col">Вопрос</th>${page.methodComparison.columns.map((column) => `<th scope="col">${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody>${page.methodComparison.rows.map(([criterion, machine, hand]) => `<tr><th scope="row">${escapeHtml(criterion)}</th><td>${escapeHtml(machine)}</td><td>${escapeHtml(hand)}</td></tr>`).join("")}</tbody></table></section></details>`
    : "";
  const plasterWaText = `Здравствуйте! Хочу обсудить расчёт механизированной штукатурки. Площадь и фото стен пришлю в чат. Страница: ${SITE_URL}${page.slug}/`;
  const plasterCta = isPlasterGuide ? `<section><h2>Хотите рассчитать механизированную штукатурку?</h2><p>Пришлите площадь и фотографии стен — обсудим расчёт механизированной штукатурки.</p><p><a href="https://wa.me/${whatsappMatch[1]}?text=${encodeURIComponent(plasterWaText)}">Обсудить расчёт в WhatsApp</a></p></section>` : "";
  const plasterFirstAnswer = isPlasterGuide
    ? `<section aria-label="Короткий ответ о штукатурке"><p><strong>Механизированная штукатурка — от 550 ₽/м².</strong> Для большого доступного объёма запросите расчёт со станцией; для локального ремонта сравните ручной способ. Это ориентир, не окончательная смета.</p><p><a href="${SITE_URL}mehanizirovannaya-shtukaturka-omsk/">Условия услуги</a> · <a href="https://wa.me/${whatsappMatch[1]}?text=${encodeURIComponent(plasterWaText)}">Пришлите площадь и фото стен — обсудим расчёт</a></p></section>`
    : "";
  const screedVisual = isScreedGuide
    ? `<section aria-label="Визуальное сравнение полусухой и мокрой стяжки"><h2>Полусухая и мокрая стяжка: что сравнивать</h2><p>Полусухая смесь содержит меньше воды, требует распределения и уплотнения; мокрый раствор более подвижен и укладывается по инструкции выбранного материала. Ни один метод сам по себе не гарантирует сроки или качество.</p><table><caption>Критерии выбора стяжки</caption><thead><tr><th>Критерий</th><th>Полусухая</th><th>Мокрая</th></tr></thead><tbody><tr><th>Укладка</th><td>Распределение, уплотнение, выравнивание</td><td>Укладка, выравнивание по техкарте</td></tr><tr><th>Слои и нагрузка</th><td>По проекту конструкции</td><td>По проекту конструкции</td></tr><tr><th>Готовность к покрытию</th><td>Проверка влажности и требований покрытия</td><td>Проверка влажности и требований покрытия</td></tr><tr><th>Смета</th><td>Полный состав и условия объекта</td><td>Тот же полный состав и условия объекта</td></tr></tbody></table><h3>Условная схема слоёв</h3><ol><li>Основание / перекрытие</li><li>Разделительный или изоляционный слой, если предусмотрен проектом</li><li>Стяжка выбранной технологии</li><li>Совместимое финишное покрытие</li></ol><p>Схема не в масштабе. Для тёплого пола, мокрой зоны и ограниченной несущей способности решение определяют отдельно. Интерактивная проверка условий доступна при включённом JavaScript.</p></section>`
    : "";
  const repairVisual = isRepairGuide
    ? `<section aria-label="Карта очередности ремонта"><h2>Карта очередности: штукатурка и стяжка</h2><p>Выберите сценарий в интерактивной схеме, если включён JavaScript. Здесь — доступный без него ориентир. Порядок всегда уточняют по проекту и техническим документам материалов.</p><h3>Типовой маршрут с мокрой штукатуркой</h3><ol><li>Согласовать уровни, проёмы и коммуникации.</li><li>Оштукатурить потолок, если предусмотрен, затем стены.</li><li>Проверить требования к передаче штукатурного этапа.</li><li>Подготовить основание, проверить скрытые работы и тёплый пол до закрытия.</li><li>Выполнить стяжку и обеспечить предусмотренный уход.</li><li>Передавать основание под покрытие после проверки требований системы.</li></ol><h3>Если стяжка уже готова</h3><p>Сначала проверить допустимость нагрузки и влаги, защитить пол от раствора и оборудования, выполнить штукатурку и осмотреть основание перед отделкой.</p><h3>Если вместо мокрой штукатурки — гипсокартон</h3><p>Очередность сухой облицовки может отличаться: в некоторых системах ГКЛ устанавливают после стяжки. Проверить проект и инструкцию конкретной системы.</p><p>Для мокрых зон отдельно согласовать гидроизоляцию; тёплый пол проверяет профильный специалист. Универсальных сроков в схеме нет.</p></section>`
    : "";
  const plasterVisual = isPlasterGuide
    ? renderPlasterFallback({ siteUrl: SITE_URL, slug: page.slug, whatsapp: whatsappMatch[1] })
    : "";
  const sections = isGuide && page.sections
    ? page.sections.map((section) => `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}${section.bullets ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>` : ""}</section>`).join("")
    : "";
  const detailedSections = operation.hasSteps && sections ? `<details><summary>Подробные инструкции и безопасность</summary>${sections}</details>` : sections;
  const guideTarget = page.slug === "guides/uchastok/kogda-burit-skvazhinu"
    ? { path: "burenie-skvazhiny-omsk", label: "Узнать об услуге бурения" }
    : isPlasterGuide
      ? { path: "mehanizirovannaya-shtukaturka-omsk", label: "Об услуге механизированной штукатурки" }
    : isScreedGuide
      ? { path: "polusuhaya-styazhka-omsk", label: "Об услуге полусухой стяжки" }
      : { path: "mobilnaya-banya-omsk", label: "Смотреть готовые бани" };
  const repairServiceLinks = `<p><a href="${SITE_URL}mehanizirovannaya-shtukaturka-omsk/">Механизированная штукатурка в Омске</a></p><p><a href="${SITE_URL}polusuhaya-styazhka-omsk/">Полусухая стяжка в Омске</a></p>`;
  const plasterServiceLink = page.slug === "mehanizirovannaya-shtukaturka-omsk"
    ? `<p><a href="${SITE_URL}${PLASTER_GUIDE_SLUG}/">Механизированная или ручная штукатурка: что выбрать?</a></p>`
    : "";
  const materialServiceLink = page.slug === "mehanizirovannaya-shtukaturka-omsk" || isPlasterGuide
    ? `<p><a href="${SITE_URL}${MATERIAL_GUIDE_SLUG}/">Гипсовая или цементная штукатурка: что выбрать?</a></p>`
    : "";
  const screedServiceLink = page.slug === "polusuhaya-styazhka-omsk"
    ? `<p><a href="${SITE_URL}${SCREED_GUIDE_SLUG}/">Полусухая или мокрая стяжка: в чём разница?</a></p>`
    : "";
  const plasterCalculatorLink = ["mehanizirovannaya-shtukaturka-omsk", "guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka", "guides/remont/gipsovaya-ili-tsementnaya-shtukaturka"].includes(page.slug)
    ? `<section aria-label="Бесплатный калькулятор штукатурки стен"><h2>Калькулятор штукатурки стен</h2><p>Рассчитайте площадь стен, вычтите проёмы и оцените объём слоя и стартовую стоимость работ.</p><p><a href="${SITE_URL}${plasterCalculatorPage.slug}/">Открыть калькулятор штукатурки</a></p></section>`
    : "";
  const calculatorLink = ["polusuhaya-styazhka-omsk", "guides/remont/polusuhaya-ili-mokraya-styazhka"].includes(page.slug)
    ? `<section aria-label="Бесплатный расчёт стяжки"><h2>Калькулятор стяжки пола</h2><p>Рассчитайте несколько помещений, среднюю толщину и объём стяжки без регистрации.</p><p><a href="${SITE_URL}${calculatorPage.slug}/">Открыть калькулятор стяжки пола</a></p></section>`
    : "";
  const serviceGuideLink = page.slug === "burenie-skvazhiny-omsk"
    ? `<p><a href="${SITE_URL}guides/uchastok/kogda-burit-skvazhinu/">Когда лучше бурить скважину: до стройки или зимой?</a></p>`
    : page.slug === "mehanizirovannaya-shtukaturka-omsk" || page.slug === "polusuhaya-styazhka-omsk"
      ? `<p><a href="${SITE_URL}${REPAIR_GUIDE_SLUG}/">Штукатурка или стяжка: что делать сначала?</a></p>`
      : "";
  const guideLinks = isGuide
    ? operation.hasSteps ? "" : isRepairGuide
      ? repairServiceLinks
      : isPlasterGuide || isMaterialGuide
        ? `<p><a href="${SITE_URL}mehanizirovannaya-shtukaturka-omsk/">Механизированная штукатурка в Омске</a></p>`
      : isScreedGuide
        ? `<p><a href="${SITE_URL}polusuhaya-styazhka-omsk/">Полусухая стяжка в Омске</a></p>`
      : `<nav aria-label="Ещё полезные гайды"><h2>Другие полезные гайды</h2><ul>${pages.filter((guide) => guide.kind === "guide" && guide.slug !== page.slug && guide.slug !== REPAIR_GUIDE_SLUG && guide.slug !== SCREED_GUIDE_SLUG && guide.slug !== PLASTER_GUIDE_SLUG && guide.slug !== MATERIAL_GUIDE_SLUG).map((guide) => `<li><a href="${SITE_URL}${guide.slug}/">${escapeHtml(guide.h1)}</a></li>`).join("")}</ul></nav><p><a href="${SITE_URL}${guideTarget.path}/">${escapeHtml(guideTarget.label)}</a></p>`
    : "";

  // The same short informational paths are visible to crawlers without JavaScript.
  const repairGuideNeighbors = {
    "guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka": ["guides/remont/gipsovaya-ili-tsementnaya-shtukaturka", "guides/remont/shtukaturka-ili-styazhka-chto-snachala"],
    "guides/remont/gipsovaya-ili-tsementnaya-shtukaturka": ["guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka"],
    "guides/remont/polusuhaya-ili-mokraya-styazhka": ["guides/remont/shtukaturka-ili-styazhka-chto-snachala"],
    "guides/remont/shtukaturka-ili-styazhka-chto-snachala": ["guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka", "guides/remont/polusuhaya-ili-mokraya-styazhka"],
  };
  const neighborSlugs = repairGuideNeighbors[page.slug] ?? [];
  const repairGuideLinks = neighborSlugs.length
    ? `<nav aria-label="Материалы по теме"><h2>Читайте также</h2><ul>${neighborSlugs.map((slug) => { const item = pages.find((page) => page.slug === slug); if (!item) throw new Error(`Missing related SEO page: ${slug}`); return `<li><a href="${SITE_URL}${slug}/">${escapeHtml(item.h1)}</a></li>`; }).join("")}</ul></nav>`
    : "";

  const printLink = isGuide && page.printChecklistPath && !operation.hasSteps
    ? `<p><a href="${SITE_URL}${page.printChecklistPath}/">Открыть чек-лист для печати</a></p>`
    : "";

  const serviceBlock = page.kind === "service" && page.priceLabel && page.requestChecklist && page.serviceResults && page.requestPrompt
    ? `<section aria-label="Стоимость и расчёт услуги"><h2>Цена и условия</h2><p><strong>${escapeHtml(page.priceLabel)}</strong> — ${escapeHtml(page.priceNote ?? "Стоимость уточняется по объекту.")}</p><h2>Что получит клиент</h2><ul>${page.serviceResults.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul><h2>Что прислать для расчёта</h2><ol>${page.requestChecklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol><p><a href="https://wa.me/${whatsappMatch[1]}?text=${encodeURIComponent(page.requestPrompt + " Страница: " + SITE_URL + page.slug + "/")}">Отправить данные для расчёта в WhatsApp</a></p></section>`
    : "";

  const about = page.kind === "service"
    ? { "@type": "Service", name: page.h1 }
    : page.kind === "category"
      ? { "@type": "ItemList", name: page.h1 }
      : isGuide
        ? { "@type": "Thing", name: page.h1 }
        : { "@type": "Product", name: page.h1, ...(page.offerModel ? { offers: {
          "@type": "Offer", priceCurrency: "RUB",
          price: saunaChoiceModels.find((model) => model.key === page.offerModel)?.price,
          url: canonical,
        } } : {}) };

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": isGuide ? "Article" : "WebPage",
    "@id": `${canonical}#page`,
    ...(isGuide
      ? {
          headline: page.h1,
          author: { "@id": `${SITE_URL}#organization` },
          publisher: { "@id": `${SITE_URL}#organization` },
        }
      : { name: page.h1 }),
    description: page.description,
    url: canonical,
    inLanguage: "ru-RU",
    isPartOf: { "@id": `${SITE_URL}#website` },
    about,
    ...(!isGuide ? { provider: { "@id": `${SITE_URL}#organization` } } : {}),
  }).replaceAll("<", "\\u003c");

  const faqLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  }).replaceAll("<", "\\u003c");

  const faqTitle = isGuide ? "Частые вопросы" : "Вопросы перед заказом или расчётом";
  return `<div id="root" data-prerendered="true"><main><article><p>${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.lead)}</p>${plasterFirstAnswer}${calculatorLink}${plasterCalculatorLink}${saunaChoice.first}${operation.first}${offer.first}<ul>${points}</ul>${serviceBlock}${saunaChoice.panel}${operation.panel}${offer.panel}${plasterCta}${comparison}${screedVisual}${repairVisual}${plasterVisual}${methodComparison}${detailedSections}${printLink}${guideLinks}${repairGuideLinks}${serviceGuideLink}${screedServiceLink}${plasterServiceLink}${materialServiceLink}<section><h2>${faqTitle}</h2>${faq}</section><p><a href="${BASE_PATH}">Сила Леса — главная</a></p></article></main><script type="application/ld+json">${jsonLd}</script><script type="application/ld+json">${faqLd}</script></div>`;
}

function servicesSnapshot() {
  const canonical = `${SITE_URL}${servicesHub.slug}/`;
  const directionItems = constructionCatalog.map((service) => `<li><strong>${escapeHtml(service.title)}</strong><p>${escapeHtml(service.text)}</p><p>Для первого расчёта: ${escapeHtml(service.requestHint)}.</p></li>`).join("");
  const items = servicePages
    .map(
      (page) => `<li><a href="${SITE_URL}${page.slug}/">${escapeHtml(page.h1)}</a><p>${escapeHtml(page.priceLabel ?? "")}</p><p>${escapeHtml(page.lead)}</p></li>`,
    )
    .join("");

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${canonical}#page`,
    name: servicesHub.h1,
    description: servicesHub.description,
    url: canonical,
    inLanguage: "ru-RU",
    isPartOf: { "@id": `${SITE_URL}#website` },
    provider: { "@id": `${SITE_URL}#organization` },
    hasPart: [
      ...servicesHub.directions.map((name) => ({ "@type": "Service", name })),
      ...servicePages.map((page) => ({
        "@type": "Service",
        name: page.h1,
        url: `${SITE_URL}${page.slug}/`,
      })),
    ],
  }).replaceAll("<", "\\u003c");

  return `<div id="root" data-prerendered="true"><main><article><p>Строительство · Омск</p><h1>${escapeHtml(servicesHub.h1)}</h1><p>${escapeHtml(servicesHub.lead)}</p><section><h2>Основные направления</h2><ul>${directionItems}</ul></section><section><h2>Услуги с подробным расчётом</h2><ul>${items}</ul></section><p><a href="${BASE_PATH}">Сила Леса — главная</a></p></article></main><script type="application/ld+json">${jsonLd}</script></div>`;
}

for (const page of pages.filter((entry) => entry.kind === "guide" && entry.printChecklistPath)) {
  const checklist = page.sections?.at(-1)?.bullets;
  if (!checklist?.length) throw new Error(`Printable checklist is missing for ${page.slug}`);
  const heading = "Чек-лист приёмки бани Квадро";
  const list = checklist.map((text, i) => `<label><input type="checkbox" /><span>${i + 1}. ${escapeHtml(text)}</span></label>`).join("\n");
  const printHtml = `<!doctype html><html lang="ru"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="robots" content="noindex" /><title>${escapeHtml(heading)} — Сила Леса</title><style>
    *{box-sizing:border-box}body{max-width:820px;margin:0 auto;padding:32px 24px;font:16px/1.5 Arial,sans-serif;color:#242019}h1{font-size:28px;line-height:1.2}p{max-width:740px}label{display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid #ddd;break-inside:avoid}input{width:20px;height:20px;flex:none;margin-top:2px}button{padding:10px 16px;border:0;border-radius:10px;background:#352a1d;color:white;cursor:pointer}.fields{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin:22px 0}.notes{border:1px solid #aaa;min-height:90px;padding:8px}.hint{color:#555;font-size:14px}@media print{body{max-width:none;margin:0;padding:0;font-size:12pt}button,.back{display:none}h1{font-size:22pt}label{padding:5px 0}input{print-color-adjust:exact;-webkit-print-color-adjust:exact}.notes{min-height:65px}@page{size:A4;margin:13mm}}
  </style></head><body><p class="back"><a href="${SITE_URL}${page.slug}/">← Вернуться к полному гайду</a></p><h1>${escapeHtml(heading)}</h1><p class="hint">Отмечайте пункты вместе с представителем. Если пункт не относится к модели, напишите «не предусмотрено». Безопасность печи, дымохода и электрики проверяет специалист.</p><div class="fields"><span>Модель/заказ: ____________________</span><span>Дата/адрес: ____________________</span></div><button type="button" onclick="window.print()">Распечатать</button><main>${list}</main><h2>Замечания и дальнейшие действия</h2><div class="notes"></div><p class="hint">Сверяйте комплектацию с вашим заказом. Этот лист помогает осмотру, но не заменяет документы передачи и профессиональную техническую проверку.</p></body></html>`;
  const printDir = path.join(DIST, page.printChecklistPath);
  await fs.mkdir(printDir, { recursive: true });
  await fs.writeFile(path.join(printDir, "index.html"), printHtml, "utf8");
}

for (const page of pages) {
  const canonical = `${SITE_URL}${page.slug}/`;
  let html = applyPageMeta(template, {
    title: page.title,
    description: page.description,
    canonical,
  });
  html = html.replace(/<div id="root"><\/div>/i, staticSnapshot(page));

  const dir = path.join(DIST, page.slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "index.html"), html, "utf8");
}


// GitHub Pages serves its SPA fallback with an HTTP 404 for unknown paths.
// Give legacy numeric product links a real static file (HTTP 200), and direct
// both users and crawlers to the unique descriptive product/service URL.
// GitHub Pages cannot issue an HTTP 301 redirect without another host layer.
for (const page of pages.filter((entry) => entry.productId)) {
  if (!/^\d+$/.test(page.productId)) throw new Error(`Invalid legacy product ID: ${page.productId}`);
  const canonical = `${SITE_URL}${page.slug}/`;
  let html = applyPageMeta(template, { title: page.title, description: page.description, canonical });
  html = html.replace(/<meta name="robots" content="index, follow" \/>/i, '<meta name="robots" content="noindex, follow" />');
  html = html.replace('</head>', `<meta http-equiv="refresh" content="0;url=${canonical}" />\n</head>`);
  html = html.replace(/<div id="root"><\/div>/i, `<div id="root"><main><h1>${escapeHtml(page.h1)}</h1><p>У страницы новый адрес: <a href="${canonical}">открыть модель или услугу</a>.</p></main></div>`);
  const directory = path.join(DIST, 'product', page.productId);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, 'index.html'), html, 'utf8');
}

{
  const canonical = `${SITE_URL}${servicesHub.slug}/`;
  let html = applyPageMeta(template, {
    title: servicesHub.title,
    description: servicesHub.description,
    canonical,
  });
  html = html.replace(/<div id="root"><\/div>/i, servicesSnapshot());

  const dir = path.join(DIST, servicesHub.slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "index.html"), html, "utf8");
}

// A standalone indexable, useful calculator answer is available even before JS loads.
{
  const canonical = `${SITE_URL}${calculatorPage.slug}/`;
  const sampleVolume = 20 * 50 / 1000;
  const htmlOverview = `<div id="root" data-prerendered="true"><main><article>
    <nav aria-label="Хлебные крошки"><a href="${SITE_URL}">Главная</a> / Калькулятор стяжки</nav>
    <h1>${escapeHtml(calculatorPage.h1)}</h1>
    <p>Рассчитайте площадь, толщину, объём стяжки по нескольким помещениям и стартовый бюджет без регистрации. Добавьте комнаты и толщину будущего слоя в интерактивном калькуляторе.</p>
    <section aria-label="Пример расчёта"><h2>Как рассчитать объём стяжки пола</h2>
      <p>Площадь прямоугольной комнаты равна длине, умноженной на ширину. Объём слоя в м³ = площадь в м² × средняя толщина в мм ÷ 1000.</p>
      <p>Например, комната 5 × 4 м = 20 м²; толщина 50 мм; объём ${sampleVolume} м³; с ориентировочным запасом 5% — 1,05 м³.</p>
      <p>По опубликованной стартовой цене от 600 ₽/м² получается ориентир от 12 000 ₽. Это не итоговая смета: её определяют после уточнения состава работ, основания, толщины и условий объекта.</p>
      <p>Расход цемента, песка и сухих смесей без рецептуры или паспортного расхода не определяется. Четыре угла дают лишь приблизительное среднее значение слоя.</p>
    </section>
    <section><h2>Что можно узнать</h2><ul><li>Площадь пола в квадратных метрах</li><li>Объём будущего слоя в кубических метрах</li><li>Объём с ориентировочным запасом</li><li>Стартовый ценовой ориентир</li></ul></section>
    <section><h2>Полезные материалы</h2><p><a href="${SITE_URL}polusuhaya-styazhka-omsk/">Полусухая стяжка: услуга в Омске</a></p><p><a href="${SITE_URL}guides/remont/polusuhaya-ili-mokraya-styazhka/">Полусухая или мокрая: сравнение технологий</a></p></section>
  </article></main></div>`;
  const structured = { "@context": "https://schema.org", "@type": "WebApplication", name: calculatorPage.h1,
    url: canonical, description: calculatorPage.description, inLanguage: "ru", applicationCategory: "CalculatorApplication",
    operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" } };
  let html = applyPageMeta(template, { title: calculatorPage.title, description: calculatorPage.description, canonical });
  html = html.replace("</head>", `<script type="application/ld+json">${JSON.stringify(structured)}</script>\n</head>`);
  html = html.replace('<div id="root"></div>', htmlOverview);
  const directory = path.join(DIST, calculatorPage.slug);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, "index.html"), html, "utf8");
}

// Indexable no-JS answer with formulas and a useful numerical example.
{
  const canonical = `${SITE_URL}${plasterCalculatorPage.slug}/`;
  const overview = `<div id="root" data-prerendered="true"><main><article>
    <nav aria-label="Хлебные крошки"><a href="${SITE_URL}">Главная</a> / Калькулятор штукатурки</nav>
    <h1>${escapeHtml(plasterCalculatorPage.h1)}</h1>
    <p>Рассчитайте площадь штукатурки по прямоугольным комнатам, вычтите окна и двери, задайте среднюю толщину и получите объём слоя. Интерактивная версия даёт расчёт без регистрации.</p>
    <section><h2>Как посчитать штукатурку на стены</h2>
      <p>Площадь стен = 2 × (длина + ширина) × высота. Вычтите площадь окон и дверей: ширина × высота каждого проёма × количество.</p>
      <p>Пример: комната 5 × 4 × 2,7 м имеет 48,6 м² стен. Окно площадью 1,5 м² и дверь площадью 1,8 м² дают 45,3 м² после вычета.</p>
      <p>При толщине слоя 15 мм геометрический объём: 45,3 × 15 / 1000 = 0,6795 м³. По стартовой ставке от 550 ₽/м² базовый ориентир работ — от 24 915 ₽. Это не окончательная смета.</p>
      <p>Чтобы получить мешки смеси, укажите паспортный расход в кг/м² на 10 мм и вес конкретного мешка. Без данных производителя нельзя достоверно определить количество сухого материала.</p>
    </section>
    <section><h2>Что учесть до заказа</h2><p>Откосы, сложные поверхности, подготовку основания, толщину и дополнительные работы оценивают отдельно. Вывод объёма по средней толщине — геометрический ориентир.</p></section>
    <section><h2>Полезные ссылки</h2><p><a href="${SITE_URL}mehanizirovannaya-shtukaturka-omsk/">Механизированная штукатурка в Омске</a></p>
      <p><a href="${SITE_URL}guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka/">Механизированная или ручная штукатурка</a></p>
      <p><a href="${SITE_URL}guides/remont/gipsovaya-ili-tsementnaya-shtukaturka/">Гипсовая или цементная штукатурка</a></p></section>
  </article></main></div>`;
  const structured = { "@context": "https://schema.org", "@type": "WebApplication",
    name: plasterCalculatorPage.h1, url: canonical, description: plasterCalculatorPage.description,
    inLanguage: "ru", applicationCategory: "CalculatorApplication", operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "RUB" } };
  let html = applyPageMeta(template, { title: plasterCalculatorPage.title, description: plasterCalculatorPage.description, canonical });
  html = html.replace("</head>", `<script type="application/ld+json">${JSON.stringify(structured)}</script>\n</head>`);
  html = html.replace('<div id="root"></div>', overview);
  const directory = path.join(DIST, plasterCalculatorPage.slug);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, "index.html"), html, "utf8");
}

// Compact direct-link microsites for VK, Telegram and campaign messages.
// The static first answer and OG meta are available without client JS.
{
  const briefs = [["", { title: "Строительные работы", subtitle: "Выберите нужный вид работ и отправьте исходные данные для предварительного расчёта." }], ...Object.entries(briefServices)];
  for (const [code, offer] of briefs) {
    const slug = code ? `brief/${code}` : "brief";
    const canonical = `${SITE_URL}${slug}/`;
    const title = `${offer.title} в Омске — отправить задачу | Сила Леса`;
    const description = code
      ? `Короткая форма по направлению «${offer.title}» в Омске: укажите объект, объём и срок, затем откройте готовое обращение в WhatsApp.`
      : "Выберите строительные работы, укажите данные объекта и откройте готовое обращение в WhatsApp. Без регистрации и отправки данных в фоне.";
    let html = applyPageMeta(template, { title, description, canonical });
    html = html.replace(/<meta name="robots" content="index, follow" \/>/i, '<meta name="robots" content="noindex, follow" />');
    const wa = `https://wa.me/${whatsappMatch[1]}?text=${encodeURIComponent(`Здравствуйте! Интересуют работы «${offer.title}» в Омске. Подскажите, какие данные нужны для предварительного расчёта.`)}`;
    const snapshot = `<div id="root" data-prerendered="true"><main style="max-width:740px;margin:60px auto;padding:24px;color:#fff"><p>СИЛА ЛЕСА · Омск</p><h1>${escapeHtml(offer.title)} в Омске</h1><p>${escapeHtml(offer.subtitle)}</p><p>Для предварительной оценки уточним объём, место и условия объекта. Это не автоматическая смета и не бронирование бригады.</p><p><a href="${wa}">Обсудить работы в WhatsApp</a> · <a href="tel:+79136884533">Позвонить</a> · <a href="${SITE_URL}services/">Все направления</a></p></main></div>`;
    html = html.replace(/<div id="root"><\/div>/i, snapshot);
    const targetDir = path.join(DIST, slug);
    await fs.mkdir(targetDir, { recursive: true });
    await fs.writeFile(path.join(targetDir, "index.html"), html, "utf8");
  }
}

// Give the construction-first home page a meaningful no-JS first answer.
{
  const home = constructionHomeFallback(SITE_URL, whatsappMatch[1], "+79136884533", constructionCatalog);
  if (!template.includes('<div id="root"></div>')) throw new Error('Home root placeholder missing');
  await fs.writeFile(path.join(DIST, "index.html"), template.replace('<div id="root"></div>', home), "utf8");
}

// GitHub Pages serves missing paths using 404.html with a real 404 status.
// Give expired sauna links a usable construction-only error page, not a false home.
{
  const notFoundMarkup = `<div id="root"><main style="max-width:740px;margin:60px auto;padding:24px;color:#fff"><h1>Такой страницы нет</h1><p>Адрес не найден. На этой версии сайта представлены только строительные работы.</p><p><a href="${SITE_URL}services/">Все строительные работы</a> · <a href="${SITE_URL}">На главную</a></p></main></div>`;
  const notFoundHtml = template
    .replace(/<title>[\s\S]*?<\/title>/i, "<title>Страница не найдена — Сила Леса</title>")
    .replace(/<meta name="robots" content="index, follow" \/>/i, '<meta name="robots" content="noindex, follow" />')
    .replace(/<link rel="canonical"[^>]*>/i, "")
    .replace('<div id="root"></div>', notFoundMarkup);
  await fs.writeFile(path.join(DIST, "404.html"), notFoundHtml, "utf8");
}

const sitemapUrls = [SITE_URL, `${SITE_URL}${servicesHub.slug}/`, ...pages.map((page) => `${SITE_URL}${page.slug}/`), `${SITE_URL}${calculatorPage.slug}/`, `${SITE_URL}${plasterCalculatorPage.slug}/`];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls
  .map((url) => `  <url><loc>${url}</loc></url>`)
  .join("\n")}\n</urlset>\n`;
await fs.writeFile(path.join(DIST, "sitemap.xml"), sitemap, "utf8");

// Optional machine-readable index for AI tools that choose to consume llms.txt.
// It is generated from the same source registry so it cannot silently drift from the site.
const pageList = pages
  .map((page) => `- [${page.h1}](${SITE_URL}${page.slug}/): ${page.description}`)
  .join("\n");
const llms = `# Сила Леса

> Строительные работы в Омске и Омской области: отдельные этапы и комплексное строительство объектов.

## Строительные направления

- Коттеджи и жилое/нежилое строительство, монолитные и кладочные работы, ангары, металлоконструкции.
- Механизированная штукатурка, полусухая стяжка, промышленные полы, кровля, фасады и демонтаж.
- Регион: Омск и Омская область.
- Контакт для уточнения строительных работ: +7 (913) 688-45-33.
- Действующие условия, объём и сроки подтверждаются при обращении.

## Канонический сайт

- [Главная](${SITE_URL})
- [Все строительные услуги](${SITE_URL}${servicesHub.slug}/)
- [Калькулятор стяжки пола](${SITE_URL}${calculatorPage.slug}/) — площадь, толщина, объём и ориентир бюджета без регистрации.
- [Калькулятор штукатурки стен](${SITE_URL}${plasterCalculatorPage.slug}/) — площадь комнат, проёмы, толщина, объём, ориентир работ и паспортный расход смеси.
- [Карта сайта](${SITE_URL}sitemap.xml)

## Страницы услуг и материалов

${pageList}

## О расчёте

Цены услуг — стартовые ориентиры, итоговая стоимость зависит от объёма и условий объекта. Информационные статьи не заменяют проект и техническую документацию конкретной конструкции.`;
await fs.writeFile(path.join(DIST, "llms.txt"), llms, "utf8");

console.log(`Prerendered home + ${pages.length} SEO pages + services hub + 15 non-indexed social briefs and generated sitemap.xml + llms.txt.`);
