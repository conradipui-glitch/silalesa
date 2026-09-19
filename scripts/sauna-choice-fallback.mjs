const escapeHtml = (text = "") => String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

export function saunaChoiceFallback(page, models, siteUrl, whatsapp) {
  if (!page.choiceModels?.length) return { first: "", panel: "" };
  const selected = page.choiceModels.map((key) => models.find((model) => model.key === key));
  if (selected.some((model) => !model)) throw new Error(`Unknown sauna in ${page.slug}`);
  const format = (n) => `${n.toLocaleString("ru-RU")} ₽`;
  const contact = `${page.choicePrompt} Страница: ${siteUrl}${page.slug}/`;
  const wa = `https://wa.me/${whatsapp}?text=${encodeURIComponent(contact)}`;
  const ends = [...new Set([selected[0], selected.at(-1)])];
  const first = `<section aria-label="Цены выбранных бань"><p>${ends.map((model) => `<strong>${escapeHtml(model.name)} — от ${format(model.price)}</strong>`).join(" · ")}</p><p><a href="${wa}">${escapeHtml(page.choiceCtaLabel)}</a> · <a href="${siteUrl}mobilnaya-banya-omsk/">Каталог бань</a></p></section>`;
  const paths = page.choicePaths?.length ? `<div>${page.choicePaths.map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.benefit)}</p><p>${escapeHtml(item.condition)}</p></article>`).join("")}</div>` : "";
  const cards = selected.map((model) => `<li><article><h3>${escapeHtml(model.name)}</h3><p>${escapeHtml(model.size)} · <strong>от ${format(model.price)}</strong></p><p>${escapeHtml(model.plan)}</p><p>${escapeHtml(model.detail)}</p><p><a href="${siteUrl}${model.slug}/">Планировка и комплектация</a></p></article></li>`).join("");
  const checks = (page.choiceChecklist ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const panel = `<section aria-label="Подбор модели и обращение"><h2>${escapeHtml(page.choiceHeading)}</h2><p>${escapeHtml(page.choiceIntro)}</p>${paths}<ul>${cards}</ul><h3>Что сообщить для расчёта</h3><p>Можно начать с того, что уже известно: заполнять таблицу не нужно.</p><ol>${checks}</ol><p><a href="${wa}">${escapeHtml(page.choiceCtaLabel)}</a></p></section>`;
  return { first, panel };
}
