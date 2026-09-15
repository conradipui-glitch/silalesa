import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const SITE_ORIGIN = "https://conradipui-glitch.github.io";
const BASE_PATH = "/silalesa/";
const SITE_URL = `${SITE_ORIGIN}${BASE_PATH}`;

const basePages = [
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-pages.json"), "utf8")),
  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-guides.json"), "utf8")),
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
  return `<div id="root" data-prerendered="true"><main><article><p>${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.lead)}</p><ul>${points}</ul><section><h2>${faqTitle}</h2>${faq}</section><p><a href="${BASE_PATH}">Сила Леса — главная</a></p></article></main><script type="application/ld+json">${jsonLd}</script><script type="application/ld+json">${faqLd}</script></div>`;
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
