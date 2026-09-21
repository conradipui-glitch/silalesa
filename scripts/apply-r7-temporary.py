from pathlib import Path


def patch(file, old, new, expected=1):
    path = Path(file)
    text = path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != expected:
        raise RuntimeError(f'R7 PATCH {file}: expected {expected}, found {count}: {old[:90]!r}')
    path.write_text(text.replace(old, new), encoding='utf-8')
    print(f'R7 PATCH {file}: {count} occurrence(s)')

# Shared data registry is the single source for both the React page and static prerender.
p = 'src/data/seoPages.ts'
patch(p, 'import rawR6Overrides from "./seo-page-overrides-r6.json";', 'import rawR6Overrides from "./seo-page-overrides-r6.json";\nimport rawR7Overrides from "./seo-page-overrides-r7.json";')
patch(p, '  operationLinks?: { slug: string; label: string }[];\n', '  operationLinks?: { slug: string; label: string }[];\n  offerModel?: string;\n  offerModels?: string[];\n  offerHeading?: string;\n  offerIncluded?: string[];\n  offerOptions?: string[];\n  offerChecklist?: string[];\n  offerPrompt?: string;\n  offerCtaLabel?: string;\n')
patch(p, '...rawR5Overrides, ...rawR6Overrides] as SeoPageOverride[]', '...rawR5Overrides, ...rawR6Overrides, ...rawR7Overrides] as SeoPageOverride[]')

p = 'src/pages/SeoLandingPage.tsx'
patch(p, 'import { OperationalGuide } from "../components/OperationalGuide";', 'import { OperationalGuide } from "../components/OperationalGuide";\nimport { SaunaOffer } from "../components/SaunaOffer";')
patch(p, '  const isOperationalGuide = Boolean(page.operationSteps?.length);', '  const isOperationalGuide = Boolean(page.operationSteps?.length);\n  const isSaunaOffer = Boolean(page.offerModel || page.offerModels?.length);')
patch(p, '    : product\n    ? `Здравствуйте! Интересует ${product.name}. Страница: ${SITE_BASE}${page.slug}/`', '    : page.offerPrompt\n    ? `${page.offerPrompt} Страница: ${SITE_BASE}${page.slug}/`\n    : product\n    ? `Здравствуйте! Интересует ${product.name}. Страница: ${SITE_BASE}${page.slug}/`')
patch(p, 'price: product.price, availability: "https://schema.org/InStock"', 'price: product.price')
patch(p, '              <div className="mt-7 flex flex-wrap items-baseline gap-3">\n                <span className="font-display text-3xl text-cedar-300 sm:text-4xl">{page.priceLabel ?? ((isService || isCategory ? "от " : "") + formatPrice(price))}</span>', '              <div className="mt-7 flex flex-wrap items-baseline gap-3">\n                <span className="font-display text-3xl text-cedar-300 sm:text-4xl">{page.priceLabel ?? ((isService || isCategory || page.offerModel === "f55" ? "от " : "") + formatPrice(price))}</span>')
patch(p, '              ) : isGuide ? (\n                <LinkButton to={isDrillingGuide ?', '''              ) : isSaunaOffer ? (
                <>
                  <LinkButton to={whatsappUrl(waText)} size="lg" external onClick={() => track("cta_click", { type: "whatsapp", where: "r7-hero", slug })}>{page.offerCtaLabel ?? "Уточнить предложение"} <ArrowIcon /></LinkButton>
                  {isCategory ? <a href="#models" className="inline-flex min-h-11 items-center rounded-full border border-cedar-300/60 px-5 py-3 font-semibold text-cedar-300 hover:bg-bark-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300">Сравнить четыре модели ↓</a> : <LinkButton to="/mobilnaya-banya-omsk/" size="lg" variant="ghost">Сравнить модели <ArrowIcon /></LinkButton>}
                </>
              ) : isGuide ? (
                <LinkButton to={isDrillingGuide ?''')
patch(p, '          {product && !isService && (', '          {product && !isService && !isSaunaOffer && (')
patch(p, '      {isSaunaChoiceGuide && <SaunaChoiceGuide page={page} />}', '      {isSaunaOffer && <SaunaOffer page={page} />}\n      {isSaunaChoiceGuide && <SaunaChoiceGuide page={page} />}')
patch(p, 'isPlasterGuide ? "Выбор за минуту" : isGuide ? "Главное по теме"', 'isPlasterGuide ? "Выбор за минуту" : isSaunaOffer ? "Модель и условия за минуту" : isGuide ? "Главное по теме"')

p = 'scripts/prerender.mjs'
patch(p, 'import { operationalGuideFallback } from "./operational-guide-fallback.mjs";', 'import { operationalGuideFallback } from "./operational-guide-fallback.mjs";\nimport { saunaOfferFallback } from "./sauna-offer-fallback.mjs";')
patch(p, 'const saunaChoiceModels = JSON.parse(await fs.readFile(path.join(ROOT, "src/data/sauna-choice-models.json"), "utf8"));', '''const saunaChoiceModels = JSON.parse(await fs.readFile(path.join(ROOT, "src/data/sauna-choice-models.json"), "utf8"));
const assets = await fs.readdir(path.join(DIST, "assets"));
const modelAssets = Object.fromEntries([
  ["k2", "kvadro-2x2-"], ["k3", "kvadro-3x2-"], ["k4", "kvadro-4x2-"], ["f55", "karkasnaya-5-5-"],
].map(([key, prefix]) => {
  const file = assets.find((name) => name.startsWith(prefix) && name.endsWith(".webp"));
  if (!file) throw new Error(`Missing real packaged model image ${key}`);
  return [key, `${BASE_PATH}assets/${file}`];
}));''')
patch(p, '  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r6.json"), "utf8")),', '  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r6.json"), "utf8")),\n  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r7.json"), "utf8")),')
patch(p, '  const operation = operationalGuideFallback(page, saunaChoiceModels, servicePages.find((item) => item.slug === "burenie-skvazhiny-omsk")?.priceLabel, SITE_URL, whatsappMatch[1]);', '  const operation = operationalGuideFallback(page, saunaChoiceModels, servicePages.find((item) => item.slug === "burenie-skvazhiny-omsk")?.priceLabel, SITE_URL, whatsappMatch[1]);\n  const offer = saunaOfferFallback(page, saunaChoiceModels, SITE_URL, whatsappMatch[1], modelAssets);')
patch(p, ': { "@type": "Product", name: page.h1 };', ''': { "@type": "Product", name: page.h1, ...(page.offerModel ? { offers: {
          "@type": "Offer", priceCurrency: "RUB",
          price: saunaChoiceModels.find((model) => model.key === page.offerModel)?.price,
          url: canonical,
        } } : {}) };''')
patch(p, '${plasterFirstAnswer}${saunaChoice.first}${operation.first}<ul>${points}</ul>${serviceBlock}${saunaChoice.panel}${operation.panel}', '${plasterFirstAnswer}${saunaChoice.first}${operation.first}${offer.first}<ul>${points}</ul>${serviceBlock}${saunaChoice.panel}${operation.panel}${offer.panel}')

# Original R1 assertions remain for unmodified routes; the R7-specific copy has its own strict check.
p = 'scripts/check-r1.mjs'
patch(p, 'const r6Slugs = new Set(JSON.parse(read("src/data/seo-page-overrides-r6.json")).map((page) => page.slug));', 'const r6Slugs = new Set(JSON.parse(read("src/data/seo-page-overrides-r6.json")).map((page) => page.slug));\nconst r7Slugs = new Set(JSON.parse(read("src/data/seo-page-overrides-r7.json")).map((page) => page.slug));')
patch(p, '!r5Slugs.has(page.slug) && !r6Slugs.has(page.slug)', '!r5Slugs.has(page.slug) && !r6Slugs.has(page.slug) && !r7Slugs.has(page.slug)', 2)

# Legacy SPA product details must not contradict canonical commercial pages.
p = 'src/pages/ProductPage.tsx'
patch(p, 'useProductMeta(metaTitle, metaDescription, canonicalUrl, Boolean(p));', 'useProductMeta(metaTitle, metaDescription, canonicalUrl, Boolean(p && !seoPage));')
patch(p, '          availability: "https://schema.org/InStock",\n', '')
patch(p, '''  const safeOutro = p.modelKey === "k2"
    ? [p.outro?.[0], "Квадро 2×2 — самая маленькая и мобильная модель серии. Ориентир по вместимости — до 4 человек; фактический комфорт зависит от сценария использования и количества людей одновременно в парной."].filter(Boolean) as string[]
    : p.outro;''', '''  const safeOutro = p.modelKey === "k2" ? p.outro?.slice(0, 1) : p.outro;''')
patch(p, '{isSauna && <ul className="mt-6 flex flex-wrap gap-2"', '{isSauna && p.modelKey !== "f55" && <ul className="mt-6 flex flex-wrap gap-2"')
patch(p, '>{p.intro}</p>', '>{seoPage?.lead ?? p.intro}</p>')

p = 'package.json'
patch(p, '&& node scripts/check-r6.mjs"', '&& node scripts/check-r6.mjs && node scripts/check-r7.mjs"')

# Update only R6's published technical status, leaving R7 pending until deployment succeeds.
p = Path('docs/CONTENT-CONVERSION-REVISION-PLAN.md')
text = p.read_text(encoding='utf-8')
rows = text.splitlines(keepends=True)
indexes = [i for i, line in enumerate(rows) if '| **R6** |' in line]
if len(indexes) != 1 or '| ☐ План |' not in rows[indexes[0]]:
    raise RuntimeError('Expected precisely one still-pending R6 row in master plan')
rows[indexes[0]] = rows[indexes[0]].replace('| ☐ План |', '| ☑ Техническая реализация опубликована · PR #30; CI, Pages и проверки R1–R6 успешны. Ручной просмотр mobile/desktop и фактическая отправка WhatsApp остаются отдельными пунктами приёмки |')
p.write_text(''.join(rows), encoding='utf-8')
print('R7 INTEGRATION COMPLETE')
