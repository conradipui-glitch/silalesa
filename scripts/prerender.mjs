import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const SITE_ORIGIN = "https://conradipui-glitch.github.io";
const BASE_PATH = "/silalesa/";
const SITE_URL = `${SITE_ORIGIN}${BASE_PATH}`;

const pages = JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-pages.json"), "utf8"));
const template = await fs.readFile(path.join(DIST, "index.html"), "utf8");

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

function staticSnapshot(page) {
  const canonical = `${SITE_URL}${page.slug}/`;
  const points = page.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("");
  const faq = page.faq
    .map(([question, answer]) => `<section><h2>${escapeHtml(question)}</h2><p>${escapeHtml(answer)}</p></section>`)
    .join("");

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.h1,
    description: page.description,
    url: canonical,
    isPartOf: { "@id": `${SITE_URL}#website` },
    about: { "@type": page.kind === "service" ? "Service" : "Product", name: page.h1 },
    provider: { "@id": `${SITE_URL}#organization` },
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

  return `<div id="root" data-prerendered="true"><main><article><p>${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.lead)}</p><ul>${points}</ul><section><h2>Вопросы перед заказом или расчётом</h2>${faq}</section><p><a href="${BASE_PATH}">Сила Леса — главная</a></p></article></main><script type="application/ld+json">${jsonLd}</script><script type="application/ld+json">${faqLd}</script></div>`;
}

for (const page of pages) {
  const canonical = `${SITE_URL}${page.slug}/`;
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`);
  html = replaceTag(html, /<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${escapeHtml(page.description)}" />`);
  html = replaceTag(html, /<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonical}" />`);
  html = replaceTag(html, /<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${escapeHtml(page.title)}" />`);
  html = replaceTag(html, /<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${escapeHtml(page.description)}" />`);
  html = replaceTag(html, /<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${canonical}" />`);
  html = html.replace(/<div id="root"><\/div>/i, staticSnapshot(page));

  const dir = path.join(DIST, page.slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "index.html"), html, "utf8");
}

const sitemapUrls = [SITE_URL, ...pages.map((page) => `${SITE_URL}${page.slug}/`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls
  .map((url) => `  <url><loc>${url}</loc></url>`)
  .join("\n")}\n</urlset>\n`;
await fs.writeFile(path.join(DIST, "sitemap.xml"), sitemap, "utf8");

// Optional machine-readable index for AI tools that choose to consume llms.txt.
// Google Search explicitly does not require or use this file, so it is generated
// from the same page registry to avoid becoming a stale manual disclaimer/index.
const pageList = pages
  .map((page) => `- [${page.h1}](${SITE_URL}${page.slug}/): ${page.description}`)
  .join("\n");
const llms = `# Сила Леса\n\n> Производство и продажа мобильных бань в Омске: кедровые бани Квадро, каркасные бани и дополнительные строительные услуги.\n\n## Основные факты\n\n- Регион: Омск и Омская область.\n- Выставочная площадка: Омск, ул. Нефтезаводская, 49/1.\n- Производственная/контактная точка из данных компании: Омск, ул. Заозерная, 11/1И.\n- Основной телефон: +7 (913) 688-45-33.\n- Дополнительный телефон / WhatsApp: +7 (999) 456-33-64.\n- Основные модели бань: Квадро 2×2, Квадро 3×2, Квадро 4×2, каркасная 5,5×2,2.\n- Для моделей Квадро на сайте указана доставка по Омску и установка на блоки в стандартной комплектации.\n- Если готовую баню нельзя завезти манипулятором, способ сборки на участке согласуется отдельно.\n\n## Канонический сайт\n\n- [Главная](${SITE_URL})\n- [Карта сайта](${SITE_URL}sitemap.xml)\n- [VK](https://vk.com/silalesa55)\n\n## Страницы продуктов и услуг\n\n${pageList}\n\n## Как интерпретировать данные\n\nЦены и комплектации на отдельных страницах относятся к указанным моделям и предложениям. Для строительных услуг стартовая цена не равна итоговой смете: точный расчёт зависит от объёма и условий объекта. Для доставки и установки бань условия подъезда и место установки проверяются отдельно.\n`;
await fs.writeFile(path.join(DIST, "llms.txt"), llms, "utf8");

console.log(`Prerendered ${pages.length} SEO landing pages and generated sitemap.xml + llms.txt.`);
