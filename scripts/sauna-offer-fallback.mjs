const escapeHtml = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
const price = (n) => `${Number(n).toLocaleString('ru-RU')} ₽`;

export function saunaOfferFallback(page, models, base, phone, assetMap = {}) {
  if (!page.offerHeading || !page.offerPrompt) return { first: '', panel: '', hasOffer: false };
  const model = page.offerModel ? models.find((entry) => entry.key === page.offerModel) : null;
  const list = (page.offerModels ?? []).map((key) => models.find((entry) => entry.key === key)).filter(Boolean);
  const catalogue = list.length > 0;
  const message = `${page.offerPrompt} Страница: ${base}${page.slug}/`;
  const contact = `<a href="https://wa.me/${phone}?text=${encodeURIComponent(message)}">${escapeHtml(page.offerCtaLabel ?? 'Уточнить предложение')}</a>`;
  const cost = model ? `${model.key === 'f55' ? 'от ' : ''}${price(model.price)}` : `от ${price(Math.min(...list.map((item) => item.price)))}`;
  const photo = (item) => assetMap[item.key] ? `<img loading="lazy" width="640" height="400" src="${escapeHtml(assetMap[item.key])}" alt="${escapeHtml(item.name)} — фото модели" />` : '';
  const first = `<section aria-label="Цена и выбор бани"><h2>Цена и следующий шаг</h2><p><strong>${escapeHtml(model ? model.name : 'Четыре модели бань')} — ${escapeHtml(cost)}</strong></p>${model ? `<p>${escapeHtml(model.plan)}. ${escapeHtml(model.detail)}</p>` : '<p>Сравните реальные планировки и цены четырёх моделей ниже.</p>'}<p>${contact} · <a href="${base}mobilnaya-banya-omsk/${catalogue ? '#models' : ''}">${catalogue ? 'Сравнить четыре модели' : 'Каталог моделей'}</a></p>${model?.key === 'k4' ? '<p>На фотографии дополнительные опции: боковой вход, увеличенное окно и стеклянная дверца печи. В стандартную цену они не включены.</p>' : ''}${model?.key === 'f55' ? '<p>Стоимость доставки и установки каркасной бани уточняется отдельно от стандарта Квадро; схема внутренних помещений условная.</p>' : ''}</section>`;
  const items = list.map((item) => `<article>${photo(item)}<h3>${escapeHtml(item.name)} — ${escapeHtml(`${item.key === 'f55' ? 'от ' : ''}${price(item.price)}`)}</h3><p>${escapeHtml(item.size)} · ${escapeHtml(item.plan)}</p><p>${escapeHtml(item.detail)}</p><p><a href="${base}${item.slug}/">Планировка и комплектация</a></p></article>`).join('');
  const benefits = page.offerIncluded?.length ? `<section><h3>Что входит в предложение</h3><ul>${page.offerIncluded.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul></section>` : '';
  const options = page.offerOptions?.length ? `<section><h3>Что проверить отдельно</h3><ul>${page.offerOptions.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ul></section>` : '';
  const checklist = `<section><h3>Что сообщить для следующего шага</h3><ol>${(page.offerChecklist ?? []).map((line) => `<li>${escapeHtml(line)}</li>`).join('')}</ol><p>${contact}</p></section>`;
  const related = model ? `<nav aria-label="Другие модели"><h3>Сравнить с другими моделями</h3><ul>${models.filter((item) => item.key !== model.key).map((item) => `<li><a href="${base}${item.slug}/">${escapeHtml(item.name)}</a></li>`).join('')}<li><a href="${base}mobilnaya-banya-omsk/">Все модели</a></li></ul></nav>` : '';
  const panel = `<section id="models" aria-label="Модели, комплектация и следующий шаг"><h2>${escapeHtml(page.offerHeading)}</h2>${model ? `${photo(model)}<p>${escapeHtml(model.name)} — ${escapeHtml(cost)}. ${escapeHtml(model.plan)}. ${escapeHtml(model.detail)}</p>` : ''}${catalogue ? `<div aria-label="Четыре модели бань">${items}</div>` : ''}${benefits}${options}${checklist}${related}</section>`;
  return { first, panel, hasOffer: true };
}
