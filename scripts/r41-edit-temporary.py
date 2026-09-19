from pathlib import Path


def replace_once(path, old, new):
    file = Path(path)
    content = file.read_text(encoding='utf-8')
    count = content.count(old)
    if count != 1:
        raise AssertionError(f'{path}: expected one occurrence of {old[:75]!r}; found {count}')
    file.write_text(content.replace(old, new, 1), encoding='utf-8')
    print(f'R4.1 patched {path}: {old[:75]!r}')


page = 'src/pages/SeoLandingPage.tsx'
replace_once(page,
'''            {!isGuide && (
''',
'''            {isPlasterGuide && (
              <div className="mt-6 rounded-2xl border border-cedar-300/30 bg-bark-800 p-4 sm:p-5">
                <p className="text-sm leading-relaxed text-cream-100">Механизированная штукатурка — <strong className="font-display text-2xl text-cedar-300">от 550 ₽/м²</strong>. Это стартовая цена, не окончательная смета.</p>
                <p className="mt-2 text-sm text-cream-200">Для расчёта достаточно начать с площади и фотографий стен. <Link to="/mehanizirovannaya-shtukaturka-omsk/" className="font-semibold text-cedar-300 underline underline-offset-4">Подробнее об услуге и условиях</Link>.</p>
              </div>
            )}
            {!isGuide && (
''')
replace_once(page,
'''              ) : isPlasterGuide || isMaterialGuide ? (
                <LinkButton to="/mehanizirovannaya-shtukaturka-omsk/" size="lg" onClick={() => track("cta_click", { type: "guide_to_plaster", where: "seo-landing", slug })}>
                  Об услуге механизированной штукатурки <ArrowIcon />
                </LinkButton>
''',
'''              ) : isPlasterGuide ? (
                <>
                  <LinkButton to={whatsappUrl(plasterWaText)} size="lg" external onClick={() => track("cta_click", { type: "whatsapp", where: "p01-hero", slug })}>
                    Пришлите площадь и фото стен <ArrowIcon />
                  </LinkButton>
                  <LinkButton to="/mehanizirovannaya-shtukaturka-omsk/" size="lg" variant="ghost" onClick={() => track("cta_click", { type: "guide_to_plaster", where: "seo-landing", slug })}>
                    Об услуге и условиях <ArrowIcon />
                  </LinkButton>
                </>
              ) : isMaterialGuide ? (
                <LinkButton to="/mehanizirovannaya-shtukaturka-omsk/" size="lg" onClick={() => track("cta_click", { type: "guide_to_plaster", where: "seo-landing", slug })}>
                  Об услуге механизированной штукатурки <ArrowIcon />
                </LinkButton>
''')

prerender = 'scripts/prerender.mjs'
replace_once(prerender,
'''  const screedVisual = isScreedGuide
''',
'''  const plasterFirstAnswer = isPlasterGuide
    ? `<section aria-label="Короткий ответ о штукатурке"><p><strong>Механизированная штукатурка — от 550 ₽/м².</strong> Для большого доступного объёма запросите расчёт со станцией; для локального ремонта сравните ручной способ. Это ориентир, не окончательная смета.</p><p><a href="${SITE_URL}mehanizirovannaya-shtukaturka-omsk/">Условия услуги</a> · <a href="https://wa.me/${whatsappMatch[1]}?text=${encodeURIComponent(plasterWaText)}">Пришлите площадь и фото стен — обсудим расчёт</a></p></section>`
    : "";
  const screedVisual = isScreedGuide
''')
replace_once(prerender,
'''<h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.lead)}</p><ul>${points}</ul>''',
'''<h1>${escapeHtml(page.h1)}</h1><p>${escapeHtml(page.lead)}</p>${plasterFirstAnswer}<ul>${points}</ul>''')

r1 = 'scripts/check-r1.mjs'
replace_once(r1,
'''assert(p01Html.includes('Одна смета или две') && p01Html.includes('Карта нанесения и проверки смет штукатурки'), 'R2 interactive semantic fallback intact');''',
'''assert(p01Html.includes('Пять вопросов, чтобы понять смету') && p01Html.includes('Выбор штукатурки и вопросы к смете') && p01Html.includes('от 550 ₽/м²'), 'R4.1 simple buyer fallback replaces old R2 matrix');''')

package = 'package.json'
replace_once(package,
'''node scripts/check-r4.mjs"''',
'''node scripts/check-r4.mjs && node scripts/check-r4-1.mjs"''')
