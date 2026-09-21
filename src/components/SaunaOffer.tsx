import { ArrowIcon, LinkButton } from "./Brand";
import models from "../data/sauna-choice-models.json";
import { byId, formatPrice, whatsappUrl } from "../data/products";
import type { SeoPage } from "../data/seoPages";
import { Link } from "../lib/router";
import { track } from "../lib/utils";

const SITE_BASE = "https://conradipui-glitch.github.io/silalesa/";

export function SaunaOffer({ page }: { page: SeoPage }) {
  if (!page.offerHeading || !page.offerPrompt) return null;
  const selected = page.offerModel ? models.find((model) => model.key === page.offerModel) : undefined;
  const current = selected ? byId(selected.productId) : undefined;
  const catalogue = Boolean(page.offerModels?.length);
  const cards = page.offerModels?.map((key) => models.find((model) => model.key === key)).filter((model): model is (typeof models)[number] => Boolean(model)) ?? [];
  const contact = `${page.offerPrompt} Страница: ${SITE_BASE}${page.slug}/`;

  return (
    <section id="models" className="bg-bark-800 py-14 text-cream-50 sm:py-20" aria-label="Модели, комплектация и следующий шаг">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">{catalogue ? "Выбор модели" : "В этой модели"}</p>
        <h2 className="mt-3 max-w-4xl font-display text-3xl leading-tight sm:text-4xl">{page.offerHeading}</h2>
        {selected && current && (
          <div className="mt-7 grid gap-5 rounded-3xl border border-cream-50/20 bg-bark-950 p-5 sm:p-7 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <p className="text-xs uppercase tracking-wider text-cream-300">{selected.size} · {selected.plan}</p>
              <p className="mt-3 font-display text-3xl text-cedar-300">{selected.key === "f55" ? "от " : ""}{formatPrice(current.price)}</p>
              <p className="mt-3 leading-relaxed text-cream-100">{selected.detail}</p>
              {selected.key === "k4" && <p className="mt-3 text-sm font-semibold leading-relaxed text-cedar-300">Внимание: на фото показаны дополнительные опции; они не входят в стандарт за 365 000 ₽.</p>}
              {selected.key === "f55" && <p className="mt-3 text-sm leading-relaxed text-cream-200">Планировка условная; габариты помещений уточняйте при осмотре. Условия доставки Квадро не переносим на эту модель.</p>}
            </div>
            <img src={current.image} alt={current.imageAlt} loading="lazy" decoding="async" className="aspect-[16/10] w-full rounded-2xl object-cover" />
          </div>
        )}
        {catalogue && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((model) => {
              const product = byId(model.productId);
              if (!product) return null;
              return <article key={model.key} className="flex flex-col overflow-hidden rounded-2xl border border-cream-50/20 bg-bark-950">
                <img src={product.image} alt={product.imageAlt} loading="lazy" decoding="async" className="aspect-[16/10] w-full object-cover" />
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs uppercase tracking-wider text-cream-300">{model.size}</p>
                  <h3 className="mt-2 font-display text-xl">{model.name}</h3>
                  <p className="mt-2 font-display text-2xl text-cedar-300">{model.key === "f55" ? "от " : ""}{formatPrice(product.price)}</p>
                  <p className="mt-3 text-sm font-semibold leading-relaxed text-cream-100">{model.plan}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-cream-300">{model.detail}</p>
                  <Link to={`/${model.slug}/`} className="mt-5 inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-cedar-300/60 px-4 py-2 text-sm font-semibold text-cedar-300 hover:bg-cedar-300 hover:text-bark-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300" onClick={() => track("product_view", { id: model.productId, from: "r7-catalogue", slug: page.slug })}>Планировка и комплектация <ArrowIcon /></Link>
                </div>
              </article>;
            })}
          </div>
        )}
        {(page.offerIncluded?.length || page.offerOptions?.length) && (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {page.offerIncluded?.length ? <article className="rounded-2xl border border-cream-50/20 bg-bark-950 p-5 sm:p-7">
              <h3 className="font-display text-2xl text-cedar-300">Что входит в предложение</h3>
              <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-relaxed text-cream-100 sm:text-base">{page.offerIncluded.map((line) => <li key={line}>{line}</li>)}</ul>
            </article> : null}
            {page.offerOptions?.length ? <article className="rounded-2xl border border-cream-50/20 bg-bark-950 p-5 sm:p-7">
              <h3 className="font-display text-2xl text-cedar-300">Что проверить отдельно</h3>
              <ul className="mt-5 list-disc space-y-3 pl-5 text-sm leading-relaxed text-cream-100 sm:text-base">{page.offerOptions.map((line) => <li key={line}>{line}</li>)}</ul>
            </article> : null}
          </div>
        )}
        <div className="mt-8 grid gap-6 rounded-3xl border border-cedar-300/35 bg-bark-950 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h3 className="font-display text-2xl">Что сообщить для следующего шага</h3>
            <p className="mt-2 text-sm text-cream-300">Достаточно того, что уже знаете. Заполнять анкету необязательно.</p>
            <ol className="mt-5 space-y-3">{page.offerChecklist?.map((item, index) => <li key={item} className="flex gap-3 text-sm leading-relaxed text-cream-100 sm:text-base"><span className="font-semibold text-cedar-300">{index + 1}.</span><span>{item}</span></li>)}</ol>
          </div>
          <LinkButton to={whatsappUrl(contact)} external size="lg" className="shrink-0" onClick={() => track("cta_click", { type: "whatsapp", where: "r7-offer", slug: page.slug })}>{page.offerCtaLabel ?? "Уточнить предложение"} <ArrowIcon /></LinkButton>
        </div>
        {!catalogue && <nav className="mt-9 border-t border-cream-50/15 pt-6" aria-label="Другие модели">
          <h3 className="font-display text-xl">Сравнить с другими моделями</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{models.filter((model) => model.key !== page.offerModel).map((model) => <li key={model.key}><Link to={`/${model.slug}/`} className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-cream-50/20 px-4 py-3 text-sm text-cream-100 hover:border-cedar-300 hover:text-cedar-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300">{model.name} <ArrowIcon /></Link></li>)}<li><Link to="/mobilnaya-banya-omsk/" className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-cedar-300/40 px-4 py-3 text-sm font-semibold text-cedar-300 hover:bg-bark-950">Все модели <ArrowIcon /></Link></li></ul>
        </nav>}
      </div>
    </section>
  );
}
