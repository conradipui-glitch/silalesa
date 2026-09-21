import { ArrowIcon, LinkButton } from "./Brand";
import { formatPrice, saunas, whatsappUrl } from "../data/products";
import { seoPageBySlug, type SeoPage } from "../data/seoPages";
import { Link } from "../lib/router";
import { track } from "../lib/utils";

const SITE_BASE = "https://conradipui-glitch.github.io/silalesa/";

export function OperationalGuide({ page }: { page: SeoPage }) {
  if (!page.operationSteps?.length || !page.operationPrompt || !page.operationHeading) return null;
  const drilling = page.slug === "guides/uchastok/kogda-burit-skvazhinu";
  const priceLabel = drilling
    ? seoPageBySlug("burenie-skvazhiny-omsk")?.priceLabel
    : `Квадро — от ${formatPrice(Math.min(...saunas.map((model) => model.price)))}`;
  const priceNote = drilling
    ? "Цена за погонный метр, не итог за всю скважину. Глубина и состав оснащения уточняются по участку."
    : "Для стандартных Квадро доставка по Омску и установка на блоки входят в предложение. Особые условия согласуются отдельно.";
  const message = `${page.operationPrompt} Страница: ${SITE_BASE}${page.slug}/`;

  return (
    <section className="bg-bark-800 py-14 text-cream-50 sm:py-20" aria-label="Три шага по подготовке и обращению">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Без анкеты и сложных расчётов</p>
        <h2 className="mt-3 max-w-4xl font-display text-3xl leading-tight sm:text-4xl">{page.operationHeading}</h2>
        {page.operationIntro && <p className="mt-4 max-w-3xl leading-relaxed text-cream-200">{page.operationIntro}</p>}
        {priceLabel && <div className="mt-6 max-w-3xl rounded-2xl border border-cedar-300/35 bg-bark-950 p-5">
          <p className="font-display text-2xl text-cedar-300">{priceLabel}</p>
          <p className="mt-2 text-sm leading-relaxed text-cream-200">{priceNote}</p>
        </div>}
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {page.operationSteps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-cream-50/20 bg-bark-950 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-cedar-300">Шаг {index + 1}</p>
              <h3 className="mt-2 font-display text-xl">{step.title}</h3>
              <dl className="mt-5 space-y-4 text-sm leading-relaxed sm:text-base">
                <div><dt className="font-semibold text-cedar-300">Что сделать</dt><dd className="mt-1 text-cream-100">{step.do}</dd></div>
                <div><dt className="font-semibold text-cedar-300">Что прислать или показать</dt><dd className="mt-1 text-cream-100">{step.send}</dd></div>
                <div><dt className="font-semibold text-cedar-300">Что получите</dt><dd className="mt-1 text-cream-100">{step.outcome}</dd></div>
              </dl>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <LinkButton to={whatsappUrl(message)} external size="lg" onClick={() => track("cta_click", { type: "whatsapp", where: "r6-operational-guide", slug: page.slug })}>
            {page.operationCtaLabel ?? "Уточнить следующий шаг"} <ArrowIcon />
          </LinkButton>
          {page.printChecklistPath && (
            <a href={`${import.meta.env.BASE_URL}${page.printChecklistPath}/`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-cedar-300/60 px-5 py-3 font-semibold text-cedar-300 hover:bg-cedar-300 hover:text-bark-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300">Открыть чек-лист для печати ↗</a>
          )}
        </div>
        {page.operationLinks?.length ? <nav aria-label="Следующие шаги по участку" className="mt-10 border-t border-cream-50/15 pt-6">
          <h3 className="font-display text-xl">Что полезно посмотреть дальше</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{page.operationLinks.map((link) => (
            <li key={link.slug}><Link to={`/${link.slug}/`} className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-cream-50/20 px-4 py-3 text-sm text-cream-100 hover:border-cedar-300 hover:text-cedar-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300">{link.label} <ArrowIcon /></Link></li>
          ))}</ul>
        </nav> : null}
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
      </div>
    </section>
  );
}
