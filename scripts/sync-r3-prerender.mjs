import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sources = ["seo-page-guides-materials.json", "seo-page-guides-screed.json", "seo-page-guides-remont.json"];
const base = (await Promise.all(sources.map(async (file) => JSON.parse(await fs.readFile(path.join(root, "src/data", file), "utf8"))))).flat();
const overrides = JSON.parse(await fs.readFile(path.join(root, "src/data/seo-page-overrides-r3.json"), "utf8"));
const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const renderSections = (sections) => (sections ?? []).map((section) => `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}${section.bullets ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>` : ""}</section>`).join("");
function replaceOnce(html, oldValue, nextValue, label) {
  const index = html.indexOf(oldValue);
  if (index < 0 || !oldValue) throw new Error(`Missing original ${label}`);
  if (html.indexOf(oldValue, index + oldValue.length) >= 0) throw new Error(`Ambiguous ${label}`);
  return html.slice(0, index) + nextValue + html.slice(index + oldValue.length);
}
for (const override of overrides) {
  const old = base.find((page) => page.slug === override.slug);
  if (!old) throw new Error(`Unknown R3 page ${override.slug}`);
  const page = { ...old, ...override };
  const file = path.join(root, "dist", page.slug, "index.html");
  let html = await fs.readFile(file, "utf8");
  if (!html.includes('data-prerendered="true"')) throw new Error(`Not a static snapshot: ${page.slug}`);
  html = replaceOnce(html, `<p>${escapeHtml(old.lead)}</p>`, `<p>${escapeHtml(page.lead)}</p>`, `${page.slug} lead`);
  const oldPoints = `<ul>${(old.summary ?? old.points).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>`;
  const newPoints = `<ul>${(page.summary ?? page.points).map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>`;
  html = replaceOnce(html, oldPoints, newPoints, `${page.slug} summary`);
  html = replaceOnce(html, renderSections(old.sections), renderSections(page.sections), `${page.slug} sections`);
  if (old.description !== page.description) {
    const meta = /<meta\s+name="description"[^>]*>/i;
    const og = /<meta\s+property="og:description"[^>]*>/i;
    if (!meta.test(html) || !og.test(html)) throw new Error(`Missing SEO metadata: ${page.slug}`);
    html = html.replace(meta, `<meta name="description" content="${escapeHtml(page.description)}" />`);
    html = html.replace(og, `<meta property="og:description" content="${escapeHtml(page.description)}" />`);
    const oldJsonDescription = `"description":${JSON.stringify(old.description)}`;
    const newJsonDescription = `"description":${JSON.stringify(page.description)}`;
    if (!html.includes(oldJsonDescription)) throw new Error(`Missing Article description: ${page.slug}`);
    html = html.replace(oldJsonDescription, newJsonDescription);
  }
  await fs.writeFile(file, html, "utf8");
}
console.log(`R3: ${overrides.length} no-JS articles synced to their runtime overrides.`);
