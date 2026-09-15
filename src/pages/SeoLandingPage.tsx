import { useEffect } from "react";
import { ArrowIcon, CheckIcon, LinkButton, PhoneIcon } from "../components/Brand";
import { byId, company, formatPrice, images, saunas, whatsappUrl } from "../data/products";
import { seoPageBySlug, seoPages } from "../data/seoPages";
import { Link } from "../lib/router";
import { track, useRevealRoot } from "../lib/utils";

const SITE_BASE = "https://conradipui-glitch.github.io/silalesa/";

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
  const image = product?.image ?? images.hero;
  const price = product?.price ?? Math.min(...saunas.map((item) => item.price));
  const isService = page.kind === "service";
  const isCategory = page.kind === "category";
  const isGuide = page.kind === "guide";
  const waText = product
    ? `Здравствуйте! Интересует ${product.name}. Страница: ${SITE_BASE}${page.slug}/`
    : isGuide
      ? `Здравствуйте! Хочу уточнить подготовку участка и основание под мобильную баню. Страница: ${SITE_BASE}${page.slug}/`
      : `Здравствуйте! Хочу подобрать мобильную баню в Омске. Страница: ${SITE_BASE}${page.slug}/`;

  const related = isGuide
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

            {!isGuide && (
              <div className="mt-7 flex flex-wrap items-baseline gap-3">
                <span className="font-display text-3xl text-cedar-300 sm:text-4xl">{isService ? "от " : isCategory ? "от " : ""}{formatPrice(price)}</span>
                {product?.dims && <span className="text-sm text-cream-300/70">{product.dims}</span>}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {isService ? (
                <LinkButton to={whatsappUrl(waText)} size="lg" external onClick={() => track("cta_click", { type: "whatsapp", where: "seo-landing", slug })}>
                  Получить расчёт в WhatsApp <ArrowIcon />
                </LinkButton>
              ) : isGuide ? (
                <LinkButton to="/mobilnaya-banya-omsk/" size="lg" onClick={() => track("cta_click", { type: "guide_to_catalog", where: "seo-landing", slug })}>
                  Смотреть готовые бани <ArrowIcon />
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
            <div className={isService ? "overflow-hidden rounded-3xl bg-bark-800 shadow-card aspect-[16/10]" : "kvadro-mask overflow-hidden bg-bark-800 shadow-card aspect-[4/3]"}>
              <img src={image} alt={product?.imageAlt ?? "Мобильная кедровая баня Сила Леса в Омске"} className="h-full w-full object-cover" fetchPriority="high" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream-50 py-16 text-bark-950 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
            <div className="reveal">
              <p className="text-xs uppercase tracking-[0.2em] text-cedar-700">Коротко по делу</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{isGuide ? "Что проверить до доставки" : "Что важно знать до обращения"}</h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-bark-600 sm:text-base">
                {isGuide
                  ? "Здесь только подтверждённые условия компании. Если универсальная норма по основанию, блокам или отводу воды не зафиксирована, мы прямо отмечаем, что её нужно уточнить для конкретного участка."
                  : "Здесь собраны характеристики именно под этот запрос. Без скрытия цены и без требования оставить телефон, чтобы увидеть базовую информацию."}
              </p>
            </div>
            <ul className="divide-y divide-bark-950/10 border-y border-bark-950/10">
              {page.points.map((point, index) => (
                <li key={point} className="reveal flex gap-4 py-5 text-sm leading-relaxed text-bark-700 sm:text-base" style={{ ["--reveal-delay" as string]: `${index * 50}ms` }}>
                  <span className="font-display text-xs text-cedar-700">0{index + 1}</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {product && (
            <div className="reveal mt-12 flex flex-col gap-5 rounded-3xl bg-bark-950 p-6 text-cream-50 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="font-display text-xl">{isService ? "Нужны исходные детали по услуге?" : "Нужна полная комплектация и детали?"}</p>
                <p className="mt-2 text-sm text-cream-300/75">{isService ? "На карточке услуги — исходное описание, стартовая цена и доступные детали процесса." : "На карточке модели — планировка, характеристики, состав комплектации и дополнительные условия."}</p>
              </div>
              <LinkButton to={`/product/${product.id}`} className="shrink-0" onClick={() => track("product_view", { id: product.id, from: "seo-landing" })}>
                {isService ? "Открыть карточку услуги" : "Открыть карточку"} <ArrowIcon />
              </LinkButton>
            </div>
          )}
        </div>
      </section>

      <section className="bg-bark-900 py-16 sm:py-20" aria-labelledby={`faq-${slug}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div className="reveal">
              <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Вопросы</p>
              <h2 id={`faq-${slug}`} className="mt-3 font-display text-3xl text-cream-50 sm:text-4xl">{isGuide ? "Что уточнить по вашему участку" : "Перед заказом или расчётом"}</h2>
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
          <h2 className="mt-4 font-display text-2xl text-cream-50">{isGuide ? "Нужно проверить ваш участок?" : isCategory ? "Не знаете, какая модель подойдёт?" : "Можно обсудить ваш участок или объект"}</h2>
          <p className="mt-3 text-sm leading-relaxed text-cream-300/75">Позвоните или отправьте сообщение — уточним условия и следующий шаг без обязательства оформлять заказ сразу.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LinkButton to={whatsappUrl(waText)} external onClick={() => track("cta_click", { type: "whatsapp", where: "seo-landing-bottom", slug })}>Написать в WhatsApp</LinkButton>
            {!isService && <LinkButton to="/#quiz" variant="ghost">Подобрать модель</LinkButton>}
          </div>
        </div>
      </section>
    </div>
  );
}
