from pathlib import Path


def patch(filename, old, new, count=1):
    path = Path(filename)
    text = path.read_text(encoding='utf-8')
    actual = text.count(old)
    if actual != count:
        raise RuntimeError(f'{filename}: expected {count} occurrences, got {actual}: {old[:100]!r}')
    path.write_text(text.replace(old, new), encoding='utf-8')
    print(f'R6 PATCH {filename}: {count} occurrence(s)')


DATA = 'src/data/seoPages.ts'
patch(DATA, 'import rawR5Overrides from "./seo-page-overrides-r5.json";', 'import rawR5Overrides from "./seo-page-overrides-r5.json";\nimport rawR6Overrides from "./seo-page-overrides-r6.json";')
patch(DATA, '  choiceCtaLabel?: string;\n', '  choiceCtaLabel?: string;\n  operationHeading?: string;\n  operationIntro?: string;\n  operationSteps?: { title: string; do: string; send: string; outcome: string }[];\n  operationPrompt?: string;\n  operationCtaLabel?: string;\n  operationLinks?: { slug: string; label: string }[];\n')
patch(DATA, '...rawR4Overrides, ...rawR5Overrides] as SeoPageOverride[]', '...rawR4Overrides, ...rawR5Overrides, ...rawR6Overrides] as SeoPageOverride[]')

PAGE = 'src/pages/SeoLandingPage.tsx'
patch(PAGE, 'import { SaunaChoiceGuide } from "../components/SaunaChoiceGuide";', 'import { SaunaChoiceGuide } from "../components/SaunaChoiceGuide";\nimport { OperationalGuide } from "../components/OperationalGuide";')
patch(PAGE, '  const isSaunaChoiceGuide = Boolean(page.choiceModels?.length);', '  const isSaunaChoiceGuide = Boolean(page.choiceModels?.length);\n  const isOperationalGuide = Boolean(page.operationSteps?.length);')
patch(PAGE, '    : isGuide && page.choicePrompt\n      ? `${page.choicePrompt} Страница: ${SITE_BASE}${page.slug}/`\n      : isGuide', '    : isGuide && page.choicePrompt\n      ? `${page.choicePrompt} Страница: ${SITE_BASE}${page.slug}/`\n      : isGuide && page.operationPrompt\n      ? `${page.operationPrompt} Страница: ${SITE_BASE}${page.slug}/`\n      : isGuide')
patch(PAGE, 'const otherGuides = isGuide && !isRepairGuide', 'const otherGuides = isGuide && !isOperationalGuide && !isRepairGuide')
patch(PAGE, '            {!isGuide && (', '''            {isOperationalGuide && (
              <div className="mt-6 rounded-2xl border border-cedar-300/30 bg-bark-800 p-4 sm:p-5">
                <p className="font-display text-xl text-cedar-300">{isDrillingGuide ? seoPageBySlug("burenie-skvazhiny-omsk")?.priceLabel : `Квадро — от ${formatPrice(Math.min(...saunas.map((model) => model.price)))}`}</p>
                <p className="mt-2 text-sm leading-relaxed text-cream-200">{isDrillingGuide ? "Цена за погонный метр, не за всю скважину. Глубина и оснащение уточняются для участка." : "Для стандартных Квадро доставка по Омску и установка на блоки включены. Нестандартные условия согласуются отдельно."}</p>
              </div>
            )}
            {!isGuide && (''')
patch(PAGE, '              ) : isGuide ? (\n                <LinkButton to={isDrillingGuide', '''              ) : isOperationalGuide ? (
                <>
                  <LinkButton to={whatsappUrl(waText)} size="lg" external onClick={() => track("cta_click", { type: "whatsapp", where: "r6-guide-hero", slug })}>{page.operationCtaLabel ?? "Уточнить следующий шаг"} <ArrowIcon /></LinkButton>
                  {page.printChecklistPath && <a href={`${import.meta.env.BASE_URL}${page.printChecklistPath}/`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-cedar-300/60 px-5 py-3 font-semibold text-cedar-300 hover:bg-cedar-300 hover:text-bark-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300">Чек-лист для печати ↗</a>}
                  <LinkButton to={isDrillingGuide ? "/burenie-skvazhiny-omsk/" : "/mobilnaya-banya-omsk/"} size="lg" variant="ghost">{isDrillingGuide ? "Цена и состав бурения" : "Модели и комплектация"} <ArrowIcon /></LinkButton>
                </>
              ) : isGuide ? (
                <LinkButton to={isDrillingGuide''')
patch(PAGE, '      {isSaunaChoiceGuide && <SaunaChoiceGuide page={page} />}', '      {isSaunaChoiceGuide && <SaunaChoiceGuide page={page} />}\n      {isOperationalGuide && <OperationalGuide page={page} />}')
patch(PAGE, '{isGuide && page.sections && page.sections.length > 0 && (', '{isGuide && !isOperationalGuide && page.sections && page.sections.length > 0 && (')
patch(PAGE, '{isGuide && page.printChecklistPath && (', '{isGuide && !isOperationalGuide && page.printChecklistPath && (')

COMP = 'src/components/OperationalGuide.tsx'
patch(COMP, '        </nav> : null}\n      </div>', '''        </nav> : null}
        {page.sections?.length ? <details className="mt-10 rounded-2xl border border-cream-50/20 bg-bark-950 p-5 sm:p-7">
          <summary className="cursor-pointer font-display text-xl font-semibold text-cedar-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300">Подробные инструкции и безопасность</summary>
          <div className="mt-7 space-y-9">{page.sections.map((section) => (
            <article key={section.heading} className="border-l-2 border-cedar-300/50 pl-4 sm:pl-6">
              <h3 className="font-display text-xl text-cream-50">{section.heading}</h3>
              {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-3 text-sm leading-relaxed text-cream-200 sm:text-base">{paragraph}</p>)}
              {section.bullets && <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-cream-200 sm:text-base">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
            </article>
          ))}</div>
        </details> : null}
      </div>''')

PRE = 'scripts/prerender.mjs'
patch(PRE, 'import { saunaChoiceFallback } from "./sauna-choice-fallback.mjs";', 'import { saunaChoiceFallback } from "./sauna-choice-fallback.mjs";\nimport { operationalGuideFallback } from "./operational-guide-fallback.mjs";')
patch(PRE, '  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r5.json"), "utf8")),', '  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r5.json"), "utf8")),\n  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r6.json"), "utf8")),')
patch(PRE, '  const saunaChoice = saunaChoiceFallback(page, saunaChoiceModels, SITE_URL, whatsappMatch[1]);', '  const saunaChoice = saunaChoiceFallback(page, saunaChoiceModels, SITE_URL, whatsappMatch[1]);\n  const operation = operationalGuideFallback(page, saunaChoiceModels, servicePages.find((item) => item.slug === "burenie-skvazhiny-omsk")?.priceLabel, SITE_URL, whatsappMatch[1]);')
patch(PRE, '    : "";\n  const guideTarget = page.slug === "guides/uchastok/kogda-burit-skvazhinu"', '    : "";\n  const detailedSections = operation.hasSteps && sections ? `<details><summary>Подробные инструкции и безопасность</summary>${sections}</details>` : sections;\n  const guideTarget = page.slug === "guides/uchastok/kogda-burit-skvazhinu"')
patch(PRE, '  const guideLinks = isGuide\n    ? isRepairGuide', '  const guideLinks = isGuide\n    ? operation.hasSteps ? "" : isRepairGuide')
patch(PRE, '  const printLink = isGuide && page.printChecklistPath', '  const printLink = isGuide && page.printChecklistPath && !operation.hasSteps')
patch(PRE, '${plasterFirstAnswer}${saunaChoice.first}<ul>', '${plasterFirstAnswer}${saunaChoice.first}${operation.first}<ul>')
patch(PRE, '${serviceBlock}${saunaChoice.panel}${plasterCta}', '${serviceBlock}${saunaChoice.panel}${operation.panel}${plasterCta}')
patch(PRE, '${methodComparison}${sections}${printLink}', '${methodComparison}${detailedSections}${printLink}')

R1 = 'scripts/check-r1.mjs'
patch(R1, 'const r5Slugs = new Set(JSON.parse(read("src/data/seo-page-overrides-r5.json")).map((page) => page.slug));', 'const r5Slugs = new Set(JSON.parse(read("src/data/seo-page-overrides-r5.json")).map((page) => page.slug));\nconst r6Slugs = new Set(JSON.parse(read("src/data/seo-page-overrides-r6.json")).map((page) => page.slug));')
patch(R1, 'if (!r5Slugs.has(page.slug))', 'if (!r5Slugs.has(page.slug) && !r6Slugs.has(page.slug))', 2)

PACKAGE = 'package.json'
patch(PACKAGE, '&& node scripts/check-pre-r6.mjs"', '&& node scripts/check-pre-r6.mjs && node scripts/check-r6.mjs"')
print('R6 SOURCE INTEGRATION DONE')
