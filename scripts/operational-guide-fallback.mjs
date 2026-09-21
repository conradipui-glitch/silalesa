const escapeHtml = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

export function operationalGuideFallback(page, models, drillingPrice, siteUrl, whatsapp) {
  if (!page.operationSteps?.length || !page.operationHeading || !page.operationPrompt) return { first: "", panel: "", hasSteps: false };
  const drilling = page.slug === "guides/uchastok/kogda-burit-skvazhinu";
  const kvadro = models.filter((model) => ["k2", "k3", "k4"].includes(model.key));
  if (kvadro.length !== 3 || !drillingPrice) throw new Error("R6 price sources missing");
  const price = drilling ? drillingPrice : `Квадро — от ${Math.min(...kvadro.map((model) => model.price)).toLocaleString("ru-RU")} ₽`;
  const note = drilling
    ? "Это начальная цена за погонный метр, не стоимость всей скважины. Глубину, оснащение и итог уточняем для участка."
    : "Для стандартных Квадро доставка по Омску и установка на блоки включены; особые условия согласуются отдельно.";
  const contact = `https://wa.me/${whatsapp}?text=${encodeURIComponent(`${page.operationPrompt} Страница: ${siteUrl}${page.slug}/`)}`;
  const first = `<section aria-label="Стоимость и первый шаг"><p><strong>${escapeHtml(price)}</strong>. ${escapeHtml(note)}</p><p><a href="${contact}">${escapeHtml(page.operationCtaLabel ?? "Уточнить следующий шаг")}</a></p>${page.printChecklistPath ? `<p><a href="${siteUrl}${page.printChecklistPath}/">Открыть чек-лист для печати</a></p>` : ""}</section>`;
  const steps = page.operationSteps.map((step, index) => `<article><h3>Шаг ${index + 1}. ${escapeHtml(step.title)}</h3><dl><dt>Что сделать</dt><dd>${escapeHtml(step.do)}</dd><dt>Что прислать или показать</dt><dd>${escapeHtml(step.send)}</dd><dt>Что получите</dt><dd>${escapeHtml(step.outcome)}</dd></dl></article>`).join("");
  const links = page.operationLinks?.length ? `<nav aria-label="Следующие шаги по участку"><h3>Что полезно посмотреть дальше</h3><ul>${page.operationLinks.map((link) => `<li><a href="${siteUrl}${link.slug}/">${escapeHtml(link.label)}</a></li>`).join("")}</ul></nav>` : "";
  const panel = `<section aria-label="Три шага по подготовке и обращению"><h2>${escapeHtml(page.operationHeading)}</h2>${page.operationIntro ? `<p>${escapeHtml(page.operationIntro)}</p>` : ""}<p><strong>${escapeHtml(price)}</strong>. ${escapeHtml(note)}</p>${steps}<p><a href="${contact}">${escapeHtml(page.operationCtaLabel ?? "Уточнить следующий шаг")}</a></p>${links}</section>`;
  return { first, panel, hasSteps: true };
}
