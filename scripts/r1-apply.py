#!/usr/bin/env python3
"""One-shot, branch-only R1 transformation; removed before the pull request."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
P01 = "guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka"


def replace_once(path, old, new):
    p = ROOT / path
    text = p.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise AssertionError(f"{path}: expected one anchor, got {count}: {old[:90]!r}")
    p.write_text(text.replace(old, new, 1), encoding="utf-8")


# Keep all seven original detailed points in source for content provenance. Only
# the four short summary items enter the first visible block; all essential
# details also occur in the article, table and FAQ, including the no-JS HTML.
p = ROOT / "src/data/seo-page-guides-plaster.json"
pages = json.loads(p.read_text(encoding="utf-8"))
assert len(pages) == 1 and pages[0]["slug"] == P01
page = pages[0]
assert len(page["points"]) == 7 and len(page["sections"]) == 8
page["description"] = "Машинная или ручная штукатурка: выбор для больших стен, локального ремонта и сложного доступа. Сравнение шести критериев, полной сметы и пути к расчёту в Омске."
page["lead"] = "Много стен и есть место для оборудования? Стоит рассчитать механизированную штукатурку: станция готовит и подаёт раствор, а мастера выравнивают поверхность. Одна стена, отдельные участки или сложный доступ? Сравните и ручной способ. «Сила Леса» специализируется на механизированной штукатурке в Омске — пришлите площадь и фото стен, обсудим ваш объект."
page["summary"] = [
    "Большие непрерывные площади и удобный доступ — повод рассчитать механизацию.",
    "Одна стена, локальные участки или сложный доступ — повод оценить ручной способ.",
    "Станция готовит и подаёт смесь; выравнивание и контроль остаются за мастерами.",
    "Сравнивайте полную смету: площадь, слой, подготовку, материалы и доплаты.",
]
page["methodComparison"] = {
    "heading": "Машинная и ручная: сравнение по делу",
    "intro": "Сравниваем способы для одной задачи, а не обещания в рекламе. Ни один метод сам по себе не определяет цену или качество.",
    "columns": ["Механизированная", "Ручная"],
    "rows": [
        ["Объём", "Стоит рассчитать для протяжённых стен и потолков.", "Стоит оценить для небольших и разрозненных участков."],
        ["Доступ", "Проверяют место станции, питание по её требованиям, воду, путь шланга и доставку.", "Станция не нужна; доставка материалов и безопасный доступ всё равно важны."],
        ["Замес и подача", "Совместимую смесь готовит и подаёт станция.", "Замес и перенос раствора организуют без штукатурной станции."],
        ["Работа мастеров", "Мастера распределяют и выравнивают смесь, оформляют углы и примыкания.", "Мастера наносят раствор инструментом, выравнивают и оформляют углы."],
        ["Основание и результат", "Нужны подготовка, контроль геометрии и соблюдение технологии смеси.", "Те же требования: ручное нанесение само по себе не гарантирует качество."],
        ["Полная смета", "Сверьте слой, материал, подготовку, оборудование, доставку и доплаты.", "Сверьте те же позиции, инструмент, логистику и доплаты."],
    ],
}
sections = page["sections"]
sections[0]["heading"] = "Что делает станция, а что — мастер"
sections[0]["paragraphs"] = [
    "Станция по предусмотренной технологии готовит совместимую смесь, подаёт её по шлангу и помогает нанести на стену. Дальше работают люди: осматривают основание, ставят маяки или другие ориентиры по принятой схеме, распределяют раствор, выравнивают плоскость, оформляют углы и примыкания.",
    "При ручном способе раствор замешивают, переносят и наносят без штукатурной станции. Но «ручная или машинная» — не то же самое, что «гипс или цемент»: сначала подбирают смесь под помещение и основание и проверяют разрешённый способ нанесения.",
]
# The first-screen six-criterion list repeated the comparison; replace it with
# practical decision-making details which remain available below the table.
sections[1]["heading"] = "Что проверить до выбора"
sections[1]["paragraphs"] = [
    "Представьте две ситуации. В первой нужно оштукатурить много доступных стен: есть смысл посчитать вариант со станцией. Во второй — восстановить один участок в помещении со сложным доступом: ручной способ стоит сравнить по полной стоимости. Это примеры выбора, а не порог площади или обещание экономии.",
]
sections[1]["bullets"] = [
    "Для станции проверьте место размещения, подъезд, воду, питание по требованиям оборудования, маршрут шланга и подъём смеси. Ручному способу тоже нужны доставка и безопасное рабочее место.",
    "Сопоставляйте весь срок работ: защиту помещения, подготовку, нанесение, выравнивание, уход и допуск к следующей отделке. Быстрая подача раствора — не готовность стены под окраску.",
    "Результат зависит от смеси, основания, подготовки, работы мастеров и контроля. У обеих технологий заранее согласуют слой, плоскость, углы и критерии приёмки.",
]
sections[2]["heading"] = "Когда имеет смысл механизация"
sections[2]["paragraphs"] = [
    "Если перед вами протяжённые стены или потолки и есть доступ для оборудования, запросите расчёт механизированной штукатурки. Покажите планировку, проёмы, основание и место размещения станции — это поможет оценить объём и организацию работ без выдуманного порога в квадратных метрах.",
    "«Сила Леса» специализируется на механизированной штукатурке в Омске. На странице услуги можно узнать о предложении; перед заказом согласуйте состав подготовки, работу с маяками и углами, обработку поверхности и условия будущей отделки, а не судите о комплектации по стартовой ставке.",
]
sections[2]["bullets"] = [
    "Пришлите площадь стен и потолков отдельно, высоту и фотографии основания.",
    "Уточните доступ, место станции и необходимые подключения по требованиям оборудования.",
    "Согласуйте письменную смету и критерии приёмки под будущее покрытие.",
]
sections[3]["heading"] = "Когда удобнее ручной способ"
sections[3]["paragraphs"] = [
    "Нужно поправить одну стену или несколько разрозненных мест? Если станцию трудно разместить либо подвести к участку, ручной метод стоит включить в сравнение. Но даже небольшой объём требует подготовки основания, подходящей смеси и соблюдения её инструкции.",
    "Проверьте, допускает ли проект и выбранная смесь такой способ нанесения. Здесь ручная штукатурка — альтернатива для сравнения, а заявленная услуга «Силы Леса» — механизированная.",
]
sections[4]["heading"] = "Основание и смесь: проверьте совместимость"
sections[4]["paragraphs"] = [
    "Посмотрите на стены: старое покрытие, пыль, трещины, непрочные места, стыки материалов и перепады. Подготовку, грунтование, армирование и толщину слоя выбирают по требованиям штукатурной системы, а не только по фотографии.",
    "Гипсовая и цементно-песчаная смеси подходят для разных задач и не заменяют друг друга автоматически. Для влажных помещений, потолков, облицовки и особых оснований проверьте назначение конкретной смеси и способ нанесения. Подробнее — в гайде о выборе гипсовой и цементной штукатурки.",
]
sections[5]["heading"] = "Как принять работу и продолжить ремонт"
sections[5]["paragraphs"] = [
    "До старта согласуйте плоскость и вертикаль стен, углы, примыкания и дальнейшее покрытие. При приёмке проверьте результат по оговорённой методике, состояние поверхности и выполнение согласованных операций. Под плитку и под окраску требования могут различаться.",
    "Когда переходить к следующему этапу, определяют инструкция смеси, толщина слоя, температура, влажность и требования будущего покрытия. Универсального срока высыхания нет. Очерёдность работ со стяжкой разобрана в отдельном гайде.",
]
sections[6]["heading"] = "Сравниваем сметы без сюрпризов"
sections[6]["paragraphs"] = [
    "Попросите два расчёта на одну измеренную площадь и предполагаемый слой. Сверьте защиту и очистку поверхностей, грунтование, маяки, уголки и армирование при необходимости, смесь, доставку и подъём, оборудование, откосы, обработку, уборку и приёмку. Если позиция оплачивается отдельно, её нельзя принимать за нулевую стоимость.",
    "Проверьте, как считают расход при больших перепадах, как согласуют дополнительные работы и когда разрешена следующая отделка. Стартовая ставка не равна полной сумме; экономию и сроки можно сравнить только после приведения смет к одному составу.",
]
sections[7]["heading"] = "Что отправить для расчёта"
sections[7]["paragraphs"] = [
    "Начните с плана или размеров и фотографий стен. Добавьте высоту, информацию о доступе и желаемую отделку: так можно обсудить механизированный способ предметно, не заполняя длинную анкету до первого обращения.",
]
# The six existing check-list bullets remain, including material compatibility,
# access, both estimates, acceptance and handoff.
p.write_text(json.dumps(pages, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# Optional summary/comparison are generic and do not alter any other page.
replace_once("src/data/seoPages.ts",
    'export type SeoGuideComparison = { heading: string; intro: string; rows: [criterion: string, ready: string, build: string][] };',
    'export type SeoGuideComparison = { heading: string; intro: string; rows: [criterion: string, ready: string, build: string][] };\nexport type SeoMethodComparison = { heading: string; intro: string; columns: [string, string]; rows: [string, string, string][] };')
replace_once("src/data/seoPages.ts",
    '  points: string[];\n  faq: SeoFaq[];',
    '  points: string[];\n  summary?: string[];\n  methodComparison?: SeoMethodComparison;\n  faq: SeoFaq[];')

replace_once("src/pages/SeoLandingPage.tsx",
    '  const isGuide = page.kind === "guide";\n  const comparison =',
    '  const isGuide = page.kind === "guide";\n  const keyPoints = page.summary ?? page.points;\n  const comparison =')
replace_once("src/pages/SeoLandingPage.tsx",
    '  const otherGuides = isGuide',
    '  const plasterWaText = `Здравствуйте! Хочу обсудить расчёт механизированной штукатурки. Площадь и фото стен пришлю в чат. Страница: ${SITE_BASE}${page.slug}/`;\n\n  const otherGuides = isGuide')
replace_once("src/pages/SeoLandingPage.tsx",
    '? seoPages.filter((item) => item.slug === "mehanizirovannaya-shtukaturka-omsk")',
    '? seoPages.filter((item) => item.slug === "mehanizirovannaya-shtukaturka-omsk" || item.slug === MATERIAL_GUIDE_SLUG)')
replace_once("src/pages/SeoLandingPage.tsx",
    '{isGuide ? "Главное по теме" : "Что важно знать до обращения"}',
    '{isPlasterGuide ? "Выбор за минуту" : isGuide ? "Главное по теме" : "Что важно знать до обращения"}')
replace_once("src/pages/SeoLandingPage.tsx",
    '{isGuide\n                  ? "Ниже — практические ориентиры: что проверить заранее и какие вопросы согласовать для вашего объекта."',
    '{isPlasterGuide\n                  ? "Четыре ориентира, чтобы быстро понять различия. Подробности и условия — ниже."\n                  : isGuide\n                  ? "Ниже — практические ориентиры: что проверить заранее и какие вопросы согласовать для вашего объекта."')
replace_once("src/pages/SeoLandingPage.tsx", 'page.points.map((point, index)', 'keyPoints.map((point, index)')

comparison_jsx = '''      {page.methodComparison && (
        <section className="bg-bark-800 py-14 text-cream-50 sm:py-20" aria-labelledby="method-comparison-title">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">По одной задаче</p>
            <h2 id="method-comparison-title" className="mt-3 font-display text-2xl sm:text-4xl">{page.methodComparison.heading}</h2>
            <p className="mt-4 max-w-3xl text-cream-200/85">{page.methodComparison.intro}</p>
            <div className="mt-7 space-y-3 md:hidden">
              {page.methodComparison.rows.map(([criterion, machine, hand]) => (
                <article key={criterion} className="rounded-2xl border border-cream-50/15 p-5">
                  <h3 className="font-display text-lg text-cedar-300">{criterion}</h3>
                  <dl className="mt-3 space-y-3 text-sm leading-relaxed">
                    <div><dt className="font-semibold text-cream-50">{page.methodComparison!.columns[0]}</dt><dd className="mt-1 text-cream-200">{machine}</dd></div>
                    <div><dt className="font-semibold text-cream-50">{page.methodComparison!.columns[1]}</dt><dd className="mt-1 text-cream-200">{hand}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
            <div className="mt-8 hidden overflow-x-auto rounded-2xl border border-cream-50/15 md:block">
              <table className="w-full border-collapse text-left text-sm lg:text-base">
                <caption className="sr-only">{page.methodComparison.heading}</caption>
                <thead className="bg-bark-950"><tr>
                  <th scope="col" className="w-1/5 p-4">Вопрос</th>
                  {page.methodComparison.columns.map((column) => <th key={column} scope="col" className="w-2/5 p-4">{column}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-cream-50/10">
                  {page.methodComparison.rows.map(([criterion, machine, hand]) => (
                    <tr key={criterion} className="align-top"><th scope="row" className="p-4 text-cedar-300">{criterion}</th><td className="p-4 text-cream-100">{machine}</td><td className="p-4 text-cream-100">{hand}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            {isPlasterGuide && (
              <div className="mt-8 flex flex-col gap-5 rounded-2xl bg-bark-950 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <p className="max-w-xl text-sm leading-relaxed text-cream-100 sm:text-base">Пришлите площадь и фотографии стен — обсудим расчёт механизированной штукатурки.</p>
                <LinkButton to={whatsappUrl(plasterWaText)} external className="shrink-0" onClick={() => track("cta_click", { type: "whatsapp", where: "plaster-comparison", slug })}>
                  Обсудить расчёт в WhatsApp <ArrowIcon />
                </LinkButton>
              </div>
            )}
          </div>
        </section>
      )}

'''
replace_once("src/pages/SeoLandingPage.tsx",
    '      {isPlasterGuide && <PlasterProcessGuide />}',
    comparison_jsx + '      {isPlasterGuide && <PlasterProcessGuide />}')
replace_once("src/pages/SeoLandingPage.tsx",
    '"Нужно выбрать способ штукатурки стен?"',
    '"Хотите рассчитать механизированную штукатурку?"')
replace_once("src/pages/SeoLandingPage.tsx",
    '<p className="mt-3 text-sm leading-relaxed text-cream-300/75">Позвоните или отправьте сообщение — уточним условия и следующий шаг без обязательства оформлять заказ сразу.</p>',
    '<p className="mt-3 text-sm leading-relaxed text-cream-300/75">{isPlasterGuide ? "Пришлите площадь, высоту и фото стен. Обсудим объём, доступ и состав работ перед расчётом." : "Позвоните или отправьте сообщение — уточним условия и следующий шаг без обязательства оформлять заказ сразу."}</p>')
replace_once("src/pages/SeoLandingPage.tsx",
    '<LinkButton to={whatsappUrl(waText)} external onClick={() => track("cta_click", { type: "whatsapp", where: "seo-landing-bottom", slug })}>Написать в WhatsApp</LinkButton>',
    '<LinkButton to={whatsappUrl(isPlasterGuide ? plasterWaText : waText)} external onClick={() => track("cta_click", { type: "whatsapp", where: "seo-landing-bottom", slug })}>{isPlasterGuide ? "Отправить площадь и фото" : "Написать в WhatsApp"}</LinkButton>')

# Align the static no-JS snapshot with the visible summary and comparison.
replace_once("scripts/prerender.mjs",
    '  const points = page.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("");',
    '  const keyPoints = page.summary ?? page.points;\n  const points = keyPoints.map((point) => `<li>${escapeHtml(point)}</li>`).join("");')
replace_once("scripts/prerender.mjs",
    '  const screedVisual = isScreedGuide',
    '''  const methodComparison = isGuide && page.methodComparison
    ? `<section aria-label="Сравнение способов штукатурки"><h2>${escapeHtml(page.methodComparison.heading)}</h2><p>${escapeHtml(page.methodComparison.intro)}</p><table><caption>${escapeHtml(page.methodComparison.heading)}</caption><thead><tr><th scope="col">Вопрос</th>${page.methodComparison.columns.map((column) => `<th scope="col">${escapeHtml(column)}</th>`).join("")}</tr></thead><tbody>${page.methodComparison.rows.map(([criterion, machine, hand]) => `<tr><th scope="row">${escapeHtml(criterion)}</th><td>${escapeHtml(machine)}</td><td>${escapeHtml(hand)}</td></tr>`).join("")}</tbody></table></section>`
    : "";
  const whatsappMatch = (await fs.readFile(path.join(ROOT, "src/data/products.ts"), "utf8")).match(/whatsapp:\\s*"(\\d+)"/);
  if (!whatsappMatch) throw new Error("Canonical WhatsApp contact missing");
  const plasterWaText = `Здравствуйте! Хочу обсудить расчёт механизированной штукатурки. Площадь и фото стен пришлю в чат. Страница: ${SITE_URL}${page.slug}/`;
  const plasterCta = isPlasterGuide ? `<section><h2>Хотите рассчитать механизированную штукатурку?</h2><p>Пришлите площадь и фотографии стен — обсудим расчёт механизированной штукатурки.</p><p><a href="https://wa.me/${whatsappMatch[1]}?text=${encodeURIComponent(plasterWaText)}">Обсудить расчёт в WhatsApp</a></p></section>` : "";
  const screedVisual = isScreedGuide''')
# staticSnapshot is not async: read the canonical contact once at module scope instead.
prerender_path = ROOT / "scripts/prerender.mjs"
prerender = prerender_path.read_text(encoding="utf-8")
needle = 'const servicePages = pages.filter((page) => page.kind === "service");'
assert prerender.count(needle) == 1
prerender = prerender.replace(needle, needle + '\nconst whatsappMatch = (await fs.readFile(path.join(ROOT, "src/data/products.ts"), "utf8")).match(/whatsapp:\\s*"(\\d+)"/);\nif (!whatsappMatch) throw new Error("Canonical WhatsApp contact missing");', 1)
inside = '  const whatsappMatch = (await fs.readFile(path.join(ROOT, "src/data/products.ts"), "utf8")).match(/whatsapp:\\s*"(\\d+)"/);\n  if (!whatsappMatch) throw new Error("Canonical WhatsApp contact missing");\n'
assert prerender.count(inside) == 1
prerender = prerender.replace(inside, '', 1)
prerender_path.write_text(prerender, encoding="utf-8")
replace_once("scripts/prerender.mjs",
    '${points}</ul>${comparison}${screedVisual}',
    '${points}</ul>${methodComparison}${plasterCta}${comparison}${screedVisual}')

# Publish a compact 22-route audit matrix. A smoke check of a shared component
# does NOT mark another page's editorial revision complete.
source_files = [
    "seo-pages.json", "seo-page-guides.json", "seo-page-guides-remont.json",
    "seo-page-guides-screed.json", "seo-page-guides-plaster.json", "seo-page-guides-materials.json",
]
all_pages = [x for filename in source_files for x in json.loads((ROOT / "src/data" / filename).read_text(encoding="utf-8"))]
assert len(all_pages) == 20 and len({x["slug"] for x in all_pages}) == 20
r3 = {"guides/remont/gipsovaya-ili-tsementnaya-shtukaturka", "guides/remont/polusuhaya-ili-mokraya-styazhka", "guides/remont/shtukaturka-ili-styazhka-chto-snachala"}
r6_keywords = ("fundament", "dostav", "priem", "kogda-burit")
lines = [
    "# R1: карта покрытия 22 основных маршрутов",
    "",
    "Дата: 19.09.2026. Редакционная работа R1 затрагивает только P01 и общий шаблон. Тест общего шаблона остальных 19 SEO-маршрутов **не означает**, что их редакционные итерации завершены.",
    "",
    "Этапы: 1 срез; 2 UX-диагноз; 3 факты; 4 текст; 5 CTA; 6 SEO/prerender; 7 тест/PR/Pages; 8 отчёт. «Смоук» = только регрессия общего шаблона, «—» = будущая итерация.",
    "",
    "| URL | Блок | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |",
    "|---|---|---|---|---|---|---|---|---|---|---|",
]
for slug, block in [("", "R8"), ("services", "R4")] + [
    (x["slug"], "R1" if x["slug"] == P01 else "R3" if x["slug"] in r3 else "R4" if x["kind"] == "service" else "R7" if x["kind"] in ("sauna", "category") else "R6" if any(keyword in x["slug"] for keyword in r6_keywords) else "R5") for x in all_pages
]:
    marks = ["✓", "✓", "✓", "✓", "✓", "✓", "PR/Pages", "отчёт"] if block == "R1" else ["—", "—", "—", "—", "—", "смоук", "смоук", "—"] if slug else ["—"] * 8
    lines.append("| /" + (slug + "/" if slug else "") + " | " + block + " | " + " | ".join(marks) + " |")
lines += ["", "Дополнительные поверхности: общий header/footer — R8/R10; legacy /product/:id, печать, 404, JS/без JS и мобильные состояния — R10. Интерактив P01 (карта этапов и матрица смет) — R2, в R1 не изменён.", "", "Проверки R1: `node scripts/check-r1.mjs` после `GITHUB_PAGES=true npm run build`, `npx tsc --noEmit`; фактический CI/PR/Pages фиксируются при публикации, а не предполагаются заранее.", ""]
(ROOT / "docs/R1-COVERAGE.md").write_text("\n".join(lines), encoding="utf-8")
print("R1 source modifications and 22-route matrix applied; awaiting actual tests and publication")
