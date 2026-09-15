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
    about: { "@type": page.kind === "service" ? "Service" : "Product", name: page.h1 },
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

console.log(`Prerendered ${pages.length} SEO landing pages.`);
