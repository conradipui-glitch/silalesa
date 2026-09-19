import { useEffect } from "react";
import { ArrowIcon, CheckIcon, LinkButton, PhoneIcon } from "../components/Brand";
import { BeforeAfter } from "../components/BeforeAfter";
import { PlasterMaterialGuide } from "../components/PlasterMaterialGuide";
import { ScreedComparisonGuide } from "../components/ScreedComparisonGuide";
import { RenovationSequenceGuide } from "../components/RenovationSequenceGuide";
import { PlasterProcessGuide } from "../components/PlasterProcessGuide";
import { SaunaChoiceGuide } from "../components/SaunaChoiceGuide";
import saunaChoiceModels from "../data/sauna-choice-models.json";
import { byId, company, formatPrice, images, saunas, whatsappUrl } from "../data/products";
import { serviceComparisonBySlug } from "../data/serviceMedia";
import { seoPageBySlug, seoPages } from "../data/seoPages";
import { Link } from "../lib/router";
import { track, useRevealRoot } from "../lib/utils";

const SITE_BASE = "https://conradipui-glitch.github.io/silalesa/";
const REPAIR_GUIDE_SLUG = "guides/remont/shtukaturka-ili-styazhka-chto-snachala";
const SCREED_GUIDE_SLUG = "guides/remont/polusuhaya-ili-mokraya-styazhka";
const PLASTER_GUIDE_SLUG = "guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka";
const MATERIAL_GUIDE_SLUG = "guides/remont/gipsovaya-ili-tsementnaya-shtukaturka";

function useLandingMeta(slug: string, title: string, description: string) {
  useEffect(() => {
    document.title = title;
    const canonicalUrl = `${SITE_BASE}${slug}/`;

    const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');

    const prev = {
      description: descriptionMeta?.content,
      canonical: canonical?.href,
      ogTitle: ogTitle?.content,
      ogDescription: ogDescription?.content,
      ogUrl: ogUrl?.content,
    };

    if (descriptionMeta) descriptionMeta.content = description;
    if (canonical) canonical.href = canonicalUrl;
    if (ogTitle) ogTitle.content = title;
    if (ogDescription) ogDescription.content = description;
    if (ogUrl) ogUrl.content = canonicalUrl;

    return () => {
      if (descriptionMeta && prev.description) descriptionMeta.content = prev.description;
      if (canonical && prev.canonical) canonical.href = prev.canonical;
      if (ogTitle && prev.ogTitle) ogTitle.content = prev.ogTitle;
      if (ogDescription && prev.ogDescription) ogDescription.content = prev.ogDescription;
      if (ogUrl && prev.ogUrl) ogUrl.content = prev.ogUrl;
    };
  }, [slug, title, description]);
}

export function SeoLandingPage({ slug }: { slug: string }) {
  const page = seoPageBySlug(slug);
  const root = useRevealRoot<HTMLDivElement>([slug]);

  if (!page) return null;
  useLandingMeta(page.slug, page.title, page.description);

  const product = page.productId ? byId(page.productId) : undefined;
  const isDrillingGuide = page.slug === "guides/uchastok/kogda-burit-skvazhinu";
  const isRepairGuide = page.slug === REPAIR_GUIDE_SLUG;
  const isScreedGuide = page.slug === SCREED_GUIDE_SLUG;
  const isPlasterGuide = page.slug === PLASTER_GUIDE_SLUG;
  const isMaterialGuide = page.slug === MATERIAL_GUIDE_SLUG;
  const image = isMaterialGuide
    ? serviceComparisonBySlug["mehanizirovannaya-shtukaturka-omsk"].before
    : isDrillingGuide
    ? serviceComparisonBySlug["burenie-skvazhiny-omsk"].before
    : isRepairGuide
      ? serviceComparisonBySlug["mehanizirovannaya-shtukaturka-omsk"].before
    : isPlasterGuide
        ? serviceComparisonBySlug["mehanizirovannaya-shtukaturka-omsk"].before
      : isScreedGuide
        ? serviceComparisonBySlug["polusuhaya-styazhka-omsk"].before
        : product?.image ?? images.hero;
  const imageAlt = isMaterialGuide
    ? serviceComparisonBySlug["mehanizirovannaya-shtukaturka-omsk"].beforeAlt
    : isDrillingGuide
    ? serviceComparisonBySlug["burenie-skvazhiny-omsk"].beforeAlt
    : isRepairGuide
      ? serviceComparisonBySlug["mehanizirovannaya-shtukaturka-omsk"].beforeAlt
    : isPlasterGuide
        ? serviceComparisonBySlug["mehanizirovannaya-shtukaturka-omsk"].beforeAlt
      : isScreedGuide
        ? serviceComparisonBySlug["polusuhaya-styazhka-omsk"].beforeAlt
        : product?.imageAlt ?? "Мобильная кедровая баня Сила Леса в Омске";
  const price = product?.price ?? Math.min(...saunas.map((item) => item.price));
  const isService = page.kind === "service";
  const isCategory = page.kind === "category";
  const isGuide = page.kind === "guide";
  const isSaunaChoiceGuide = Boolean(page.choiceModels?.length);
  const firstChoice = page.choiceModels?.length ? saunaChoiceModels.find((model) => model.key === page.choiceModels?.[0]) : undefined;
  const lastChoice = page.choiceModels?.length ? saunaChoiceModels.find((model) => model.key === page.choiceModels?.at(-1)) : undefined;
  const keyPoints = page.summary ?? page.points;
  const comparison = isService ? serviceComparisonBySlug[page.slug] : undefined;
  const waText = isService && page.requestPrompt
    ? page.requestPrompt + " Страница: " + SITE_BASE + page.slug + "/"
    : product
    ? `Здравствуйте! Интересует ${product.name}. Страница: ${SITE_BASE}${page.slug}/`
    : isGuide && page.choicePrompt
      ? `${page.choicePrompt} Страница: ${SITE_BASE}${page.slug}/`
      : isGuide
      ? `Здравствуйте! Хочу уточнить информацию по гайду «${page.h1}». Страница: ${SITE_BASE}${page.slug}/`
      : `Здравствуйте! Хочу подобрать мобильную баню в Омске. Страница: ${SITE_BASE}${page.slug}/`;

  const plasterWaText = `Здравствуйте! Хочу обсудить расчёт механизированной штукатурки. Площадь и фото стен пришлю в чат. Страница: ${SITE_BASE}${page.slug}/`;

  const otherGuides = isGuide && !isRepairGuide && !isScreedGuide && !isPlasterGuide && !isMaterialGuide
    ? seoPages.filter((item) => item.kind === "guide" && item.slug !== page.slug && item.slug !== REPAIR_GUIDE_SLUG)
    : [];
  const related = isMaterialGuide
    ? seoPages.filter((item) => item.slug === "mehanizirovannaya-shtukaturka-omsk" || item.slug === PLASTER_GUIDE_SLUG)
    : isRepairGuide
    ? seoPages.filter((item) => item.slug === "mehanizirovannaya-shtukaturka-omsk" || item.slug === "polusuhaya-styazhka-omsk")
    : isPlasterGuide
      ? seoPages.filter((item) => item.slug === "mehanizirovannaya-shtukaturka-omsk" || item.slug === MATERIAL_GUIDE_SLUG)
    : isScreedGuide
      ? seoPages.filter((item) => item.slug === "polusuhaya-styazhka-omsk")
    : isDrillingGuide
      ? seoPages.filter((item) => item.slug === "burenie-skvazhiny-omsk")
      : isGuide
        ? seoPages.filter((item) => item.kind === "sauna" || item.kind === "category").slice(0, 3)
        : seoPages.filter((item) => item.slug !== page.slug && item.kind === page.kind).slice(0, 3);

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": isService ? "Service" : "Product",
        name: product.name,
        description: page.description,
        provider: { "@type": "LocalBusiness", name: company.name, telephone: company.phonePrimary.tel },
        areaServed: "Омск",
        ...(isService
          ? {}
          : { offers: { "@type": "Offer", priceCurrency: "RUB", price: product.price, availability: "https://schema.org/InStock" } }),
        url: `${SITE_BASE}${page.slug}/`,
      }
    : isGuide
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: page.h1,
          description: page.description,
          mainEntityOfPage: `${SITE_BASE}${page.slug}/`,
          author: { "@type": "Organization", name: company.name },
          publisher: { "@type": "Organization", name: company.name },
          url: `${SITE_BASE}${page.slug}/`,
        }
      : {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: page.h1,
          description: page.description,
          url: `${SITE_BASE}${page.slug}/`,
        };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <div ref={root} className="bg-bark-900 pt-24 text-cream-50 sm:pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <nav aria-label="Хлебные крошки" className="text-xs text-cream-300/60">
          <Link to="/" className="hover:text-cream-50">Главная</Link>
          <span className="mx-2">/</span>
          <span aria-current="page">{page.h1}</span>
        </nav>

        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_0.95fr] lg:gap-14">
          <div className="reveal">
            <p className="text-xs uppercase tracking-[0.22em] text-cedar-300">{page.eyebrow}</p>
            <h1 className="mt-4 max-w-3xl font-display text-[34px] font-semibold leading-[1.06] tracking-tight sm:text-5xl lg:text-[58px]">{page.h1}</h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-cream-200/85 sm:text-lg">{page.lead}</p>

            {isPlasterGuide && (
              <div className="mt-6 rounded-2xl border border-cedar-300/30 bg-bark-800 p-4 sm:p-5">
                <p className="text-sm leading-relaxed text-cream-100">Механизированная штукатурка — <strong className="font-display text-2xl text-cedar-300">от 550 ₽/м²</strong>. Это стартовая цена, не окончательная смета.</p>
                <p className="mt-2 text-sm text-cream-200">Для расчёта достаточно начать с площади и фотографий стен. <Link to="/mehanizirovannaya-shtukaturka-omsk/" className="font-semibold text-cedar-300 underline underline-offset-4">Подробнее об услуге и условиях</Link>.</p>
              </div>
            )}
            {isSaunaChoiceGuide && firstChoice && lastChoice && (
              <div className="mt-6 rounded-2xl border border-cedar-300/30 bg-bark-800 p-4 sm:p-5">
                <p className="font-display text-xl text-cedar-300">{firstChoice.name} — от {formatPrice(firstChoice.price)}{firstChoice.key !== lastChoice.key ? ` · ${lastChoice.name} — от ${formatPrice(lastChoice.price)}` : ""}</p>
                <p className="mt-2 text-sm leading-relaxed text-cream-200">Выберите планировку ниже. Условия доставки и итоговый состав уточним под ваш участок.</p>
              </div>
            )}
            {!isGuide && (
              <div className="mt-7 flex flex-wrap items-baseline gap-3">
                <span className="font-display text-3xl text-cedar-300 sm:text-4xl">{page.priceLabel ?? ((isService || isCategory ? "от " : "") + formatPrice(price))}</span>
                {product?.dims && <span className="text-sm text-cream-300/70">{product.dims}</span>}
              </div>
            )}
            {isService && page.priceNote && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cream-300/85">{page.priceNote}</p>}

            <div className="mt-8 flex flex-wrap gap-3">
              {isService ? (
                <LinkButton to={whatsappUrl(waText)} size="lg" external onClick={() => track("cta_click", { type: "whatsapp", where: "seo-landing", slug })}>
                  Отправить данные для расчёта <ArrowIcon />
                </LinkButton>
              ) : isPlasterGuide ? (
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
              ) : isScreedGuide ? (
                <LinkButton to="/polusuhaya-styazhka-omsk/" size="lg" onClick={() => track("cta_click", { type: "guide_to_screed", where: "seo-landing", slug })}>
                  Об услуге полусухой стяжки <ArrowIcon />
                </LinkButton>
              ) : isRepairGuide ? (
                <>
                  <LinkButton to="/mehanizirovannaya-shtukaturka-omsk/" size="lg" onClick={() => track("cta_click", { type: "guide_to_plaster", where: "seo-landing", slug })}>
                    Механизированная штукатурка <ArrowIcon />
                  </LinkButton>
                  <LinkButton to="/polusuhaya-styazhka-omsk/" variant="ghost" size="lg" onClick={() => track("cta_click", { type: "guide_to_screed", where: "seo-landing", slug })}>
                    Полусухая стяжка <ArrowIcon />
                  </LinkButton>
                </>
              ) : isSaunaChoiceGuide ? (
                <>
                  <LinkButton to={whatsappUrl(waText)} size="lg" external onClick={() => track("cta_click", { type: "whatsapp", where: "r5-guide-hero", slug })}>{page.choiceCtaLabel ?? "Помогите выбрать баню"} <ArrowIcon /></LinkButton>
                  <LinkButton to="/mobilnaya-banya-omsk/" size="lg" variant="ghost">Каталог моделей <ArrowIcon /></LinkButton>
                </>
              ) : isGuide ? (
                <LinkButton to={isDrillingGuide ? "/burenie-skvazhiny-omsk/" : "/mobilnaya-banya-omsk/"} size="lg" onClick={() => track("cta_click", { type: isDrillingGuide ? "guide_to_drilling" : "guide_to_catalog", where: "seo-landing", slug })}>
                  {isDrillingGuide ? "Узнать об услуге бурения" : "Смотреть готовые бани"} <ArrowIcon />
                </LinkButton>
              ) : (
                <LinkButton to="/#configurator" size="lg" onClick={() => track("cta_click", { type: "configurator", where: "seo-landing", slug })}>
                  Рассчитать стоимость <ArrowIcon />
                </LinkButton>
              )}
              <LinkButton to={`tel:${company.phonePrimary.tel}`} variant="ghost" size="lg" onClick={() => track("cta_click", { type: "call", where: "seo-landing", slug })}>
                <PhoneIcon /> {company.phonePrimary.display}
              </LinkButton>
            </div>
          </div>

          <div className="reveal" style={{ ["--reveal-delay" as string]: "100ms" }}>
            {comparison ? (
              <BeforeAfter {...comparison} />
            ) : (
              <div className={isService ? "overflow-hidden rounded-3xl bg-bark-800 shadow-card aspect-[16/10]" : "kvadro-mask overflow-hidden bg-bark-800 shadow-card aspect-[4/3]"}>
                <img src={image} alt={imageAlt} className="h-full w-full object-cover" fetchPriority="high" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-cream-50 py-16 text-bark-950 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
            <div className="reveal">
              <p className="text-xs uppercase tracking-[0.2em] text-cedar-700">Коротко по делу</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{isPlasterGuide ? "Выбор за минуту" : isGuide ? "Главное по теме" : "Что важно знать до обращения"}</h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-bark-600 sm:text-base">
                {isPlasterGuide
                  ? "Четыре ориентира, чтобы быстро понять различия. Подробности и условия — ниже."
                  : isGuide
                  ? "Ниже — практические ориентиры: что проверить заранее и какие вопросы согласовать для вашего объекта."
                  : "Здесь собраны характеристики именно под этот запрос. Без скрытия цены и без требования оставить телефон, чтобы увидеть базовую информацию."}
              </p>
            </div>
            <ul className="divide-y divide-bark-950/10 border-y border-bark-950/10">
              {keyPoints.map((point, index) => (
                <li key={point} className="reveal flex gap-4 py-5 text-sm leading-relaxed text-bark-700 sm:text-base" style={{ ["--reveal-delay" as string]: `${index * 50}ms` }}>
                  <span className="font-display text-xs text-cedar-700">0{index + 1}</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {page.slug === "burenie-skvazhiny-omsk" && (
            <p className="mt-6 text-sm"><Link to="/guides/uchastok/kogda-burit-skvazhinu/" className="font-medium text-cedar-700 underline underline-offset-4 hover:text-bark-900">Когда лучше бурить скважину: до стройки или зимой? →</Link></p>
          )}
          {(page.slug === "mehanizirovannaya-shtukaturka-omsk" || page.slug === "polusuhaya-styazhka-omsk") && (
            <p className="mt-6 text-sm"><Link to={`/${REPAIR_GUIDE_SLUG}/`} className="font-medium text-cedar-700 underline underline-offset-4 hover:text-bark-900">Штукатурка или стяжка: что делать сначала? →</Link></p>
          )}
          {page.slug === "mehanizirovannaya-shtukaturka-omsk" && (
            <p className="mt-6 text-sm"><Link to={`/${PLASTER_GUIDE_SLUG}/`} className="font-medium text-cedar-700 underline underline-offset-4 hover:text-bark-900">Механизированная или ручная штукатурка: что выбрать? →</Link></p>
          )}
          {page.slug === "mehanizirovannaya-shtukaturka-omsk" && (
            <p className="mt-6 text-sm"><Link to={`/${MATERIAL_GUIDE_SLUG}/`} className="font-medium text-cedar-700 underline underline-offset-4 hover:text-bark-900">Гипсовая или цементная штукатурка: что выбрать? →</Link></p>
          )}
          {page.slug === "polusuhaya-styazhka-omsk" && (
            <p className="mt-6 text-sm"><Link to={`/${SCREED_GUIDE_SLUG}/`} className="font-medium text-cedar-700 underline underline-offset-4 hover:text-bark-900">Полусухая или мокрая стяжка: в чём разница? →</Link></p>
          )}
          {product && !isService && (
            <div className="reveal mt-12 flex flex-col gap-5 rounded-3xl bg-bark-950 p-6 text-cream-50 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="font-display text-xl">{isService ? "Нужны подробности по услуге?" : "Нужна полная комплектация и детали?"}</p>
                <p className="mt-2 text-sm text-cream-300/75">{isService ? "На странице услуги — описание, стартовая цена и доступные детали процесса." : "На карточке модели — планировка, характеристики, состав комплектации и дополнительные условия."}</p>
              </div>
              <LinkButton to={`/product/${product.id}`} className="shrink-0" onClick={() => track("product_view", { id: product.id, from: "seo-landing" })}>
                {isService ? "Открыть карточку услуги" : "Открыть карточку"} <ArrowIcon />
              </LinkButton>
            </div>
          )}
        </div>
      </section>

      {isService && page.serviceResults && page.requestChecklist && (
        <section className="bg-bark-800 py-16 text-cream-50 sm:py-20" aria-label="Что получите и как рассчитать услугу">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Результат и условия</p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl">Что входит в обсуждение заказа</h2>
              <ul className="mt-6 space-y-4 text-base leading-relaxed text-cream-100">
                {page.serviceResults.map((result) => <li key={result} className="flex gap-3"><CheckIcon className="mt-1 h-4 w-4 shrink-0 text-cedar-300" /><span>{result}</span></li>)}
              </ul>
              {page.priceNote && <p className="mt-6 rounded-xl border border-cream-50/15 p-4 text-sm leading-relaxed text-cream-200">{page.priceNote}</p>}
            </div>
            <div className="rounded-3xl border border-cream-50/15 bg-bark-950 p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Следующий шаг</p>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl">Что прислать для расчёта</h2>
              <ol className="mt-6 space-y-4">
                {page.requestChecklist.map((item, index) => <li key={item} className="flex gap-3 text-sm leading-relaxed text-cream-100 sm:text-base"><span className="shrink-0 font-display text-cedar-300">{index + 1}.</span><span>{item}</span></li>)}
              </ol>
              <p className="mt-6 text-sm leading-relaxed text-cream-300/85">Отправьте то, что уже известно. Остальные параметры уточним в разговоре — заполнение формы не требуется.</p>
              <LinkButton to={whatsappUrl(waText)} external className="mt-6" onClick={() => track("cta_click", { type: "whatsapp", where: "service-request", slug })}>Отправить параметры <ArrowIcon /></LinkButton>
            </div>
          </div>
        </section>
      )}

      {isSaunaChoiceGuide && <SaunaChoiceGuide page={page} />}

      {isPlasterGuide && <PlasterProcessGuide />}

      {page.methodComparison && (
        <details className="bg-bark-800 text-cream-50">
          <summary className="mx-auto max-w-7xl cursor-pointer px-4 py-5 font-display text-xl font-semibold sm:px-6">Подробная таблица сравнения способов штукатурки</summary>
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
        </details>
      )}

      {isRepairGuide && <RenovationSequenceGuide />}

      {isScreedGuide && <ScreedComparisonGuide />}

      {isMaterialGuide && <PlasterMaterialGuide />}

      {isGuide && page.comparison && (
        <details open={!isSaunaChoiceGuide} className="bg-bark-800 text-cream-50">
          <summary className="mx-auto max-w-7xl cursor-pointer px-4 py-5 font-display text-xl font-semibold sm:px-6">Подробная таблица сравнения готовой бани и строительства</summary>
        <section className="bg-bark-800 py-16 text-cream-50 sm:py-20" aria-label="Сравнение способов строительства">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Сравнение вариантов</p>
            <h2 className="mt-3 font-display text-2xl sm:text-4xl">{page.comparison.heading}</h2>
            <p className="mt-4 max-w-3xl text-cream-200/85">{page.comparison.intro}</p>
            <div role="region" aria-label="Таблица сравнения бани" tabIndex={0} className="mt-8 overflow-x-auto rounded-2xl border border-cream-50/15 focus-visible:outline-2">
              <table className="w-full min-w-[690px] border-collapse text-left text-sm sm:text-base">
                <caption className="sr-only">Готовая баня и строительство на участке: различия по критериям</caption>
                <thead className="bg-bark-950 text-cream-50"><tr>
                  <th scope="col" className="w-1/5 p-4 font-display">Критерий</th>
                  <th scope="col" className="w-2/5 p-4 font-display">Готовая Квадро</th>
                  <th scope="col" className="w-2/5 p-4 font-display">Строительство на участке</th>
                </tr></thead>
                <tbody className="divide-y divide-cream-50/10">
                  {page.comparison.rows.map(([criterion, ready, build]) => (
                    <tr key={criterion} className="align-top">
                      <th scope="row" className="p-4 font-semibold text-cedar-300">{criterion}</th>
                      <td className="p-4 leading-relaxed text-cream-100">{ready}</td>
                      <td className="p-4 leading-relaxed text-cream-100">{build}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        </details>
      )}
      {isGuide && page.sections && page.sections.length > 0 && (
        <section className="bg-cream-50 py-16 text-bark-950 sm:py-20" aria-label="Подробный разбор вариантов">
          <div className="mx-auto max-w-5xl space-y-12 px-4 sm:px-6 lg:px-8">
            {page.sections.map((section) => (
              <article key={section.heading} className="border-l-2 border-cedar-500 pl-5 sm:pl-8">
                <h2 className="font-display text-2xl leading-tight sm:text-3xl">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-base leading-relaxed text-bark-700">{paragraph}</p>
                ))}
                {section.bullets && <ul className="mt-5 list-disc space-y-2 pl-6 text-bark-700">
                  {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>}
              </article>
            ))}
          </div>
        </section>
      )}
      {isGuide && page.printChecklistPath && (
        <div className="bg-cream-50 px-4 pb-12 text-center sm:px-6">
          <a href={`${import.meta.env.BASE_URL}${page.printChecklistPath}/`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-bark-950 px-6 py-3 font-medium text-cream-50 hover:bg-bark-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-500">
            Открыть чек-лист для печати ↗
          </a>
        </div>
      )}
      {otherGuides.length > 0 && (
        <nav aria-label="Ещё полезные гайды" className="bg-bark-900 px-4 py-10 text-cream-50 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-xl">Другие полезные гайды</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">{otherGuides.map((guide) => (
              <li key={guide.slug}><Link to={`/${guide.slug}/`} className="block rounded-xl border border-cream-50/15 p-4 text-cream-100 hover:border-cedar-400 hover:text-cedar-300">{guide.h1}</Link></li>
            ))}</ul>
          </div>
        </nav>
      )}
      <section className="bg-bark-900 py-16 sm:py-20" aria-labelledby={`faq-${slug}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div className="reveal">
              <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Вопросы</p>
              <h2 id={`faq-${slug}`} className="mt-3 font-display text-3xl text-cream-50 sm:text-4xl">{isGuide ? "Частые вопросы" : "Перед заказом или расчётом"}</h2>
            </div>
            <div className="divide-y divide-cream-50/10 border-y border-cream-50/10">
              {page.faq.map(([question, answer]) => (
                <details key={question} className="reveal group py-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-5 font-display text-base text-cream-50 marker:hidden sm:text-lg">
                    <span>{question}</span><span className="text-cedar-300 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="max-w-2xl pt-3 pr-8 text-sm leading-relaxed text-cream-200/80 sm:text-base">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-cream-50 py-14 text-bark-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-xl">{isGuide ? "Связанные страницы" : isService ? "Другие услуги" : "Другие страницы по баням"}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {related.map((item) => (
                <Link key={item.slug} to={`/${item.slug}/`} className="group rounded-2xl border border-bark-950/10 p-4 transition-colors hover:border-cedar-600/40 hover:bg-white">
                  <span className="block text-xs uppercase tracking-[0.14em] text-cedar-700">{item.eyebrow}</span>
                  <span className="mt-2 block font-display text-sm leading-snug group-hover:text-cedar-700">{item.h1}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-bark-950 py-14 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <CheckIcon className="mx-auto h-6 w-6 text-moss-400" />
          <h2 className="mt-4 font-display text-2xl text-cream-50">{isMaterialGuide ? "Нужно подобрать штукатурную систему?" : isPlasterGuide ? "Хотите рассчитать механизированную штукатурку?" : isScreedGuide ? "Нужно подобрать технологию стяжки?" : isRepairGuide ? "Нужно согласовать штукатурку и стяжку?" : isDrillingGuide ? "Нужно обсудить бурение на вашем участке?" : isGuide ? "Нужно уточнить детали по вашей бане?" : isCategory ? "Не знаете, какая модель подойдёт?" : "Можно обсудить ваш участок или объект"}</h2>
          <p className="mt-3 text-sm leading-relaxed text-cream-300/75">{isPlasterGuide ? "Пришлите площадь, высоту и фото стен. Обсудим объём, доступ и состав работ перед расчётом." : isService ? "Пришлите параметры объекта и фотографии, которые есть под рукой. Уточним остальные данные и состав работ перед итоговой сметой." : "Позвоните или отправьте сообщение — уточним условия и следующий шаг без обязательства оформлять заказ сразу."}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LinkButton to={whatsappUrl(isPlasterGuide ? plasterWaText : waText)} external onClick={() => track("cta_click", { type: "whatsapp", where: "seo-landing-bottom", slug })}>{isPlasterGuide ? "Отправить площадь и фото" : isService ? "Отправить данные для расчёта" : "Написать в WhatsApp"}</LinkButton>
            {isRepairGuide ? (
              <>
                <LinkButton to="/mehanizirovannaya-shtukaturka-omsk/" variant="ghost">Штукатурка</LinkButton>
                <LinkButton to="/polusuhaya-styazhka-omsk/" variant="ghost">Стяжка</LinkButton>
              </>
            ) : isPlasterGuide || isMaterialGuide ? <LinkButton to="/mehanizirovannaya-shtukaturka-omsk/" variant="ghost">Механизированная штукатурка</LinkButton> : isScreedGuide ? <LinkButton to="/polusuhaya-styazhka-omsk/" variant="ghost">Полусухая стяжка</LinkButton> : isDrillingGuide ? <LinkButton to="/burenie-skvazhiny-omsk/" variant="ghost">Об услуге бурения</LinkButton> : !isService && <LinkButton to="/#quiz" variant="ghost">Подобрать модель</LinkButton>}
          </div>
        </div>
      </section>
    </div>
  );
}
