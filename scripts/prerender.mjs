import fs from "node:fs/promises";
import path from "node:path";
import { renderPlasterFallback } from "./plaster-fallback.mjs";
import { saunaChoiceFallback } from "./sauna-choice-fallback.mjs";
import { operationalGuideFallback } from "./operational-guide-fallback.mjs";
import { homeFallback } from "./home-fallback.mjs";
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
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r4.json"), "utf8")),
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r5.json"), "utf8")),
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r6.json"), "utf8")),
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r7.json"), "utf8")),
];
const overrideBySlug = new Map();
for (const override of pageOverrides) {
  overrideBySlug.set(override.slug, { ...(overrideBySlug.get(override.slug) ?? {}), ...override });
}
const pages = basePages.map((page) => ({ ...page, ...(overrideBySlug.get(page.slug) ?? {}) }));
const servicePages = pages.filter((page) => page.kind === "service");
const whatsappMatch = (await fs.readFile(path.join(ROOT, "src/data/products.ts"), "utf8")).match(/whatsapp:\s*"(\d+)"/);
if (!whatsappMatch) throw new Error("Canonical WhatsApp contact missing");
const template = await fs.readFile(path.join(DIST, "index.html"), "utf8");

const servicesHub = {
  slug: "services",
  title: "Строительные услуги в Омске — Сила Леса",
  description: "Строительные услуги в Омске: механизированная штукатурка от 550 ₽/м², полусухая стяжка от 600 ₽/м², бурение скважин от 2 500 ₽/пог. м. Условия и расчёт.",
  h1: "Строительные услуги в Омске",
  lead: "Бурение скважин, полусухая стяжка и механизированная штукатурка: стартовые цены за единицу работ, условия и перечень данных для расчёта на каждой странице услуги.",
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
  return `<div id="root" data-prerendered="true"><main><article><p>${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.lead)}</p>${plasterFirstAnswer}${saunaChoice.first}${operation.first}${offer.first}<ul>${points}</ul>${serviceBlock}${saunaChoice.panel}${operation.panel}${offer.panel}${plasterCta}${comparison}${screedVisual}${repairVisual}${plasterVisual}${methodComparison}${detailedSections}${printLink}${guideLinks}${serviceGuideLink}${screedServiceLink}${plasterServiceLink}${materialServiceLink}<section><h2>${faqTitle}</h2>${faq}</section><p><a href="${BASE_PATH}">Сила Леса — главная</a></p></article></main><script type="application/ld+json">${jsonLd}</script><script type="application/ld+json">${faqLd}</script></div>`;
}

function servicesSnapshot() {
  const canonical = `${SITE_URL}${servicesHub.slug}/`;
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
    hasPart: servicePages.map((page) => ({
      "@type": "Service",
      name: page.h1,
      url: `${SITE_URL}${page.slug}/`,
    })),
  }).replaceAll("<", "\\u003c");

  return `<div id="root" data-prerendered="true"><main><article><p>Другие услуги · Омск</p><h1>${escapeHtml(servicesHub.h1)}</h1><p>${escapeHtml(servicesHub.lead)}</p><ul>${items}</ul><p><a href="${BASE_PATH}">Сила Леса — главная</a></p></article></main><script type="application/ld+json">${jsonLd}</script></div>`;
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

// Give the home page the same meaningful first answer and canonical product links without JavaScript.
{
  const prefix = { k2: "kvadro-2x2-", k3: "kvadro-3x2-", k4: "kvadro-4x2-", f55: "karkasnaya-5-5-" };
  const builtAssets = await fs.readdir(path.join(DIST, "assets"));
  const assets = Object.fromEntries(Object.entries(prefix).map(([key, stem]) => {
    const match = builtAssets.filter((name) => name.startsWith(stem) && name.endsWith(".webp"));
    if (match.length !== 1) throw new Error(`Home static image ambiguous or missing: ${key}`);
    return [key, match[0]];
  }));
  const home = homeFallback(saunaChoiceModels, assets, SITE_URL, whatsappMatch[1], "+79136884533", "Омск, ул. Нефтезаводская, 49/1");
  if (!template.includes('<div id="root"></div>')) throw new Error('Home root placeholder missing');
  await fs.writeFile(path.join(DIST, "index.html"), template.replace('<div id="root"></div>', home), "utf8");
}

const sitemapUrls = [SITE_URL, `${SITE_URL}${servicesHub.slug}/`, ...pages.map((page) => `${SITE_URL}${page.slug}/`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls
  .map((url) => `  <url><loc>${url}</loc></url>`)
  .join("\n")}\n</urlset>\n`;
await fs.writeFile(path.join(DIST, "sitemap.xml"), sitemap, "utf8");

// Optional machine-readable index for AI tools that choose to consume llms.txt.
// It is generated from the same source registry so it cannot silently drift from the site.
const pageList = pages
  .map((page) => `- [${page.h1}](${SITE_URL}${page.slug}/): ${page.description}`)
  .join("\n");
const llms = `# Сила Леса\n\n> Производство и продажа мобильных бань в Омске: кедровые бани Квадро, каркасные бани и дополнительные строительные услуги.\n\n## Основные факты\n\n- Регион: Омск и Омская область.\n- Выставочная площадка: Омск, ул. Нефтезаводская, 49/1.\n- Осмотр образцов — по предварительной договорённости, время уточните по телефону.\n- Основной телефон: +7 (913) 688-45-33.\n- Дополнительный телефон / WhatsApp: +7 (999) 456-33-64.\n- Основные модели бань: Квадро 2×2, Квадро 3×2, Квадро 4×2, каркасная 5,5×2,2.\n- Для моделей Квадро на сайте указана доставка по Омску и установка на блоки в стандартной комплектации.\n- Если готовую баню нельзя завезти манипулятором, способ сборки на участке согласуется отдельно.\n\n## Канонический сайт\n\n- [Главная](${SITE_URL})\n- [Строительные услуги](${SITE_URL}${servicesHub.slug}/)\n- [Карта сайта](${SITE_URL}sitemap.xml)\n- [VK](https://vk.com/silalesa55)\n\n## Страницы продуктов, услуг и гайдов\n\n${pageList}\n\n## Как интерпретировать данные\n\nЦены и комплектации на отдельных страницах относятся к указанным моделям и предложениям. Для строительных услуг стартовая цена не равна итоговой смете: точный расчёт зависит от объёма и условий объекта. Для доставки и установки бань условия подъезда и место установки проверяются отдельно. Гайды не заменяют проверку конкретного участка и не содержат универсальных инженерных норм, если они не подтверждены данными компании.\n`;
await fs.writeFile(path.join(DIST, "llms.txt"), llms, "utf8");

console.log(`Prerendered home + ${pages.length} SEO pages + services hub and generated sitemap.xml + llms.txt.`);
