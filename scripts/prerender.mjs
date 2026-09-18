import fs from "node:fs/promises";
import path from "node:path";

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
const pageOverrides = [
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides.json"), "utf8")),
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-next.json"), "utf8")),
];
const overrideBySlug = new Map(pageOverrides.map((override) => [override.slug, override]));
const pages = basePages.map((page) => ({ ...page, ...(overrideBySlug.get(page.slug) ?? {}) }));
const servicePages = pages.filter((page) => page.kind === "service");
const template = await fs.readFile(path.join(DIST, "index.html"), "utf8");

const servicesHub = {
  slug: "services",
  title: "Строительные услуги в Омске — Сила Леса",
  description: "Строительные услуги Сила Леса в Омске: бурение скважин, полусухая стяжка пола и механизированная штукатурка. Стартовые цены и отдельные страницы услуг.",
  h1: "Строительные услуги в Омске",
  lead: "Отдельные направления компании: бурение скважин, полусухая стяжка пола и механизированная штукатурка. Каждая услуга вынесена на свою страницу с условиями и стартовой ценой.",
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
  const points = page.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("");
  const faq = page.faq
    .map(([question, answer]) => `<section><h2>${escapeHtml(question)}</h2><p>${escapeHtml(answer)}</p></section>`)
    .join("");
  const isGuide = page.kind === "guide";
  const isRepairGuide = page.slug === REPAIR_GUIDE_SLUG;
  const isScreedGuide = page.slug === SCREED_GUIDE_SLUG;
  const isPlasterGuide = page.slug === PLASTER_GUIDE_SLUG;
  const isMaterialGuide = page.slug === MATERIAL_GUIDE_SLUG;
  const comparison = isGuide && page.comparison
    ? `<section><h2>${escapeHtml(page.comparison.heading)}</h2><p>${escapeHtml(page.comparison.intro)}</p><table><caption>Готовая Квадро и строительство на участке</caption><thead><tr><th>Критерий</th><th>Готовая Квадро</th><th>Строительство на участке</th></tr></thead><tbody>${page.comparison.rows.map(([criterion, ready, build]) => `<tr><th>${escapeHtml(criterion)}</th><td>${escapeHtml(ready)}</td><td>${escapeHtml(build)}</td></tr>`).join("")}</tbody></table></section>`
    : "";
  const sections = isGuide && page.sections
    ? page.sections.map((section) => `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}${section.bullets ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>` : ""}</section>`).join("")
    : "";
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
    ? isRepairGuide
      ? repairServiceLinks
      : isPlasterGuide || isMaterialGuide
        ? `<p><a href="${SITE_URL}mehanizirovannaya-shtukaturka-omsk/">Механизированная штукатурка в Омске</a></p>`
      : isScreedGuide
        ? `<p><a href="${SITE_URL}polusuhaya-styazhka-omsk/">Полусухая стяжка в Омске</a></p>`
      : `<nav aria-label="Ещё полезные гайды"><h2>Другие полезные гайды</h2><ul>${pages.filter((guide) => guide.kind === "guide" && guide.slug !== page.slug && guide.slug !== REPAIR_GUIDE_SLUG && guide.slug !== SCREED_GUIDE_SLUG && guide.slug !== PLASTER_GUIDE_SLUG && guide.slug !== MATERIAL_GUIDE_SLUG).map((guide) => `<li><a href="${SITE_URL}${guide.slug}/">${escapeHtml(guide.h1)}</a></li>`).join("")}</ul></nav><p><a href="${SITE_URL}${guideTarget.path}/">${escapeHtml(guideTarget.label)}</a></p>`
    : "";

  const printLink = isGuide && page.printChecklistPath
    ? `<p><a href="${SITE_URL}${page.printChecklistPath}/">Открыть чек-лист для печати</a></p>`
    : "";

  const about = page.kind === "service"
    ? { "@type": "Service", name: page.h1 }
    : page.kind === "category"
      ? { "@type": "ItemList", name: page.h1 }
      : isGuide
        ? { "@type": "Thing", name: page.h1 }
        : { "@type": "Product", name: page.h1 };

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
  return `<div id="root" data-prerendered="true"><main><article><p>${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.lead)}</p><ul>${points}</ul>${comparison}${sections}${printLink}${guideLinks}${serviceGuideLink}${screedServiceLink}${plasterServiceLink}${materialServiceLink}<section><h2>${faqTitle}</h2>${faq}</section><p><a href="${BASE_PATH}">Сила Леса — главная</a></p></article></main><script type="application/ld+json">${jsonLd}</script><script type="application/ld+json">${faqLd}</script></div>`;
}

function servicesSnapshot() {
  const canonical = `${SITE_URL}${servicesHub.slug}/`;
  const items = servicePages
    .map(
      (page) => `<li><a href="${SITE_URL}${page.slug}/">${escapeHtml(page.h1)}</a><p>${escapeHtml(page.description)}</p></li>`,
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
const llms = `# Сила Леса\n\n> Производство и продажа мобильных бань в Омске: кедровые бани Квадро, каркасные бани и дополнительные строительные услуги.\n\n## Основные факты\n\n- Регион: Омск и Омская область.\n- Выставочная площадка: Омск, ул. Нефтезаводская, 49/1.\n- Производственная/контактная точка из данных компании: Омск, ул. Заозерная, 11/1И.\n- Основной телефон: +7 (913) 688-45-33.\n- Дополнительный телефон / WhatsApp: +7 (999) 456-33-64.\n- Основные модели бань: Квадро 2×2, Квадро 3×2, Квадро 4×2, каркасная 5,5×2,2.\n- Для моделей Квадро на сайте указана доставка по Омску и установка на блоки в стандартной комплектации.\n- Если готовую баню нельзя завезти манипулятором, способ сборки на участке согласуется отдельно.\n\n## Канонический сайт\n\n- [Главная](${SITE_URL})\n- [Строительные услуги](${SITE_URL}${servicesHub.slug}/)\n- [Карта сайта](${SITE_URL}sitemap.xml)\n- [VK](https://vk.com/silalesa55)\n\n## Страницы продуктов, услуг и гайдов\n\n${pageList}\n\n## Как интерпретировать данные\n\nЦены и комплектации на отдельных страницах относятся к указанным моделям и предложениям. Для строительных услуг стартовая цена не равна итоговой смете: точный расчёт зависит от объёма и условий объекта. Для доставки и установки бань условия подъезда и место установки проверяются отдельно. Гайды не заменяют проверку конкретного участка и не содержат универсальных инженерных норм, если они не подтверждены данными компании.\n`;
await fs.writeFile(path.join(DIST, "llms.txt"), llms, "utf8");

console.log(`Prerendered ${pages.length} SEO pages + services hub and generated sitemap.xml + llms.txt.`);
