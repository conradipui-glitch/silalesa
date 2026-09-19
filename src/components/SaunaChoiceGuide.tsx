import { ArrowIcon, LinkButton } from "./Brand";
import models from "../data/sauna-choice-models.json";
import { byId, formatPrice, whatsappUrl } from "../data/products";
import type { SeoPage } from "../data/seoPages";
import { Link } from "../lib/router";
import { track } from "../lib/utils";

const SITE_BASE = "https://conradipui-glitch.github.io/silalesa/";

export function SaunaChoiceGuide({ page }: { page: SeoPage }) {
  if (!page.choiceModels?.length || !page.choiceHeading || !page.choicePrompt) return null;
  const selected = page.choiceModels.map((key) => models.find((model) => model.key === key)).filter((model): model is (typeof models)[number] => Boolean(model));
  const contact = `${page.choicePrompt} Страница: ${SITE_BASE}${page.slug}/`;

  return (
    <section className="bg-bark-800 py-14 text-cream-50 sm:py-20" aria-label="Подбор модели и обращение">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Выбор без анкеты</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight sm:text-4xl">{page.choiceHeading}</h2>
        {page.choiceIntro && <p className="mt-4 max-w-3xl text-base leading-relaxed text-cream-200">{page.choiceIntro}</p>}

        {page.choicePaths && (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {page.choicePaths.map((item) => (
              <article key={item.title} className="rounded-2xl border border-cream-50/20 bg-bark-950 p-5 sm:p-6">
                <h3 className="font-display text-xl text-cedar-300">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-cream-100">{item.benefit}</p>
                <p className="mt-3 text-sm leading-relaxed text-cream-300">{item.condition}</p>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {selected.map((model) => {
            const product = byId(model.productId);
            return (
              <article key={model.key} className="flex flex-col overflow-hidden rounded-2xl border border-cream-50/20 bg-bark-950">
                {product && <img src={product.image} alt={product.imageAlt} loading="lazy" className="aspect-[16/10] w-full object-cover" />}
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs uppercase tracking-wider text-cream-300">{model.size}</p>
                  <h3 className="mt-2 font-display text-xl">{model.name}</h3>
                  <p className="mt-2 font-display text-2xl text-cedar-300">от {formatPrice(product?.price ?? model.price)}</p>
                  <p className="mt-4 text-sm font-semibold leading-relaxed text-cream-100">{model.plan}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-cream-300">{model.detail}</p>
                  <Link to={`/${model.slug}/`} className="mt-5 inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-cedar-300/60 px-4 py-2 text-sm font-semibold text-cedar-300 hover:bg-cedar-300 hover:text-bark-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300" onClick={() => track("product_view", { id: model.productId, from: "r5-sauna-guide", slug: page.slug })}>
                    Планировка и комплектация <ArrowIcon />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-9 grid gap-8 rounded-3xl border border-cream-50/20 bg-bark-950 p-6 md:grid-cols-[1fr_auto] md:items-end sm:p-8">
          <div>
            <h3 className="font-display text-2xl">Что сообщить для расчёта</h3>
            <p className="mt-2 text-sm text-cream-300">Можно начать с того, что уже известно: заполнять таблицу не нужно.</p>
            <ol className="mt-5 space-y-3">
              {page.choiceChecklist?.map((item, index) => <li key={item} className="flex gap-3 text-sm leading-relaxed text-cream-100 sm:text-base"><span className="font-semibold text-cedar-300">{index + 1}.</span><span>{item}</span></li>)}
            </ol>
          </div>
          <LinkButton to={whatsappUrl(contact)} external size="lg" className="shrink-0" onClick={() => track("cta_click", { type: "whatsapp", where: "r5-model-guide", slug: page.slug })}>
            {page.choiceCtaLabel ?? "Обсудить модель"} <ArrowIcon />
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
