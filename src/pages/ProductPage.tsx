import { useEffect } from "react";
import { ArrowIcon, CheckIcon, LinkButton, PhoneIcon } from "../components/Brand";
import { PlanDiagram } from "../components/PlanDiagram";
import { byId, company, formatPrice, products, saunas, services, standardIncluded, whatsappUrl } from "../data/products";
import { Link } from "../lib/router";
import { track, useDocumentTitle, useRevealRoot } from "../lib/utils";

export function ProductPage({ id }: { id: string }) {
  const p = byId(id);
  useDocumentTitle(p ? `${p.name} | Омск — Сила Леса` : "Страница не найдена — Сила Леса");
  const root = useRevealRoot<HTMLDivElement>([id]);

  useEffect(() => {
    if (p) track("product_view", { id: p.id, from: "page" });
  }, [p]);

  if (!p) return <NotFound path={`/product/${id}`} />;

  const isSauna = p.kind === "sauna";
  const others = isSauna ? saunas.filter((s) => s.id !== p.id) : services.filter((s) => s.id !== p.id);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.intro,
    image: p.image.startsWith("http") ? p.image : undefined,
    brand: { "@type": "Brand", name: company.name },
    url: p.originalUrl,
    offers: { "@type": "Offer", priceCurrency: "RUB", price: p.price, url: p.originalUrl },
  };
  const waText = `Здравствуйте! Интересует «${p.name}» (${formatPrice(p.price)}). ${p.originalUrl}`;
  const safeOutro = p.modelKey === "k2"
    ? [p.outro?.[0], "Квадро 2×2 — самая маленькая и мобильная модель серии. Ориентир по вместимости — до 4 человек; фактический комфорт зависит от сценария использования и количества людей одновременно в парной."].filter(Boolean) as string[]
    : p.outro;

  return (
    <div ref={root} className="bg-bark-900 pt-24 sm:pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Хлебные крошки" className="text-xs text-cream-300/60">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link to="/" className="hover:text-cream-50">Главная</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to={isSauna ? "/#product-section" : "/services"} className="hover:text-cream-50">{isSauna ? "Модели" : "Услуги"}</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-cream-200" aria-current="page">{p.name}</li>
          </ol>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 items-start">
          <div className="reveal">
            <div className={isSauna ? "kvadro-mask overflow-hidden aspect-[4/3] bg-bark-800 shadow-card" : "overflow-hidden rounded-3xl aspect-[16/10] bg-bark-800 shadow-card"}>
              <img src={p.image} alt={p.imageAlt} width={1536} height={1024} className="h-full w-full object-cover" fetchPriority="high" />
            </div>
            {isSauna && <p className="mt-3 text-xs text-cream-300/55">Художественная визуализация модели. Реальный образец и узлы можно проверить на площадке {company.showroom}.</p>}
          </div>

          <div className="reveal" style={{ ["--reveal-delay" as string]: "100ms" }}>
            <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">{p.category}</p>
            <h1 className="mt-3 font-display font-semibold tracking-tight text-cream-50 text-3xl sm:text-4xl lg:text-5xl leading-[1.08]">{p.name}</h1>
            <p className="mt-3 text-lg text-cream-200/80">{p.tagline}</p>
            <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-display text-3xl sm:text-4xl text-cedar-300">{isSauna ? "" : "от "}{formatPrice(p.price)}</span>
              {p.dims && <span className="text-sm text-cream-300/70">{p.dims}</span>}
            </div>
            {p.priceNote && <p className="mt-2 text-xs text-cream-300/60">{p.priceNote}</p>}

            {isSauna && <ul className="mt-6 flex flex-wrap gap-2" aria-label="Входит в цену">{standardIncluded.map((s) => <li key={s} className="inline-flex items-center gap-1.5 rounded-full border border-cream-50/12 px-3 py-1 text-xs text-cream-200/85"><CheckIcon className="h-3.5 w-3.5 text-moss-400" /> {s}</li>)}</ul>}

            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton to={`tel:${company.phonePrimary.tel}`} size="lg" onClick={() => track("cta_click", { type: "call", where: "product", id: p.id })}><PhoneIcon /> Позвонить {company.phonePrimary.display}</LinkButton>
              <LinkButton to={whatsappUrl(waText)} variant="ghost" size="lg" external onClick={() => track("cta_click", { type: "whatsapp", where: "product", id: p.id })}>Написать в WhatsApp</LinkButton>
            </div>
            {isSauna && <Link to="/#configurator" className="mt-4 inline-flex items-center gap-1.5 text-sm text-cedar-300 hover:text-cedar-200" onClick={() => track("cta_click", { type: "configurator", where: "product", id: p.id })}>Собрать комплектацию с опциями <ArrowIcon /></Link>}
          </div>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
          <article className="reveal max-w-2xl">
            <h2 className="font-display text-xs uppercase tracking-[0.2em] text-cedar-300">Описание</h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-cream-100">{p.intro}</p>
            <h3 className="mt-8 font-display text-lg text-cream-50">{isSauna ? "Комплектация" : "Как проходит работа"}</h3>
            <ul className="mt-4 space-y-2.5">{p.bullets.map((b) => <li key={b} className="flex gap-3 text-sm sm:text-[15px] leading-relaxed text-cream-200/85"><CheckIcon className="mt-1 shrink-0 text-cedar-400" /> {b}</li>)}</ul>
            {safeOutro?.map((o) => <p key={o} className="mt-5 text-sm sm:text-[15px] leading-relaxed text-cream-200/80">{o}</p>)}
            <p className="mt-8 text-xs text-cream-300/50">Данные — с исходной страницы <a href={p.originalUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-cream-100">{p.originalUrl.replace("https://", "")}</a>.</p>
          </article>

          <aside className="space-y-8">
            {!p.layout && !p.specs && <div className="reveal rounded-3xl border border-cream-50/8 bg-bark-950/60 p-6 sm:p-8"><h2 className="font-display text-xs uppercase tracking-[0.2em] text-cedar-300">Как заказать</h2><ol className="mt-4 space-y-3 text-sm text-cream-200/85"><li className="flex gap-3"><span className="font-display text-cedar-400">01</span> Позвоните или напишите — уточним объём работ и адрес объекта.</li><li className="flex gap-3"><span className="font-display text-cedar-400">02</span> Мастер или замерщик выезжает на место и считает точную стоимость.</li><li className="flex gap-3"><span className="font-display text-cedar-400">03</span> Согласуем срок и приступаем к работе.</li></ol><p className="mt-4 text-xs text-cream-300/60">Цена «от {formatPrice(p.price)}» — стартовый ориентир с исходного сайта; итог зависит от объёма и условий на объекте.</p><div className="mt-6 flex flex-wrap gap-3"><LinkButton to={`tel:${company.phoneSecondary.tel}`} variant="ghost" size="sm" onClick={() => track("cta_click", { type: "call2", where: "product", id: p.id })}><PhoneIcon /> {company.phoneSecondary.display} · {company.phoneSecondary.person}</LinkButton></div></div>}
            {p.layout && <div className="reveal rounded-3xl border border-cream-50/8 bg-bark-950/60 p-4 sm:p-6"><h2 className="font-display text-xs uppercase tracking-[0.2em] text-cedar-300 mb-4">Планировка</h2><PlanDiagram layout={p.layout} compact /><ul className="mt-4 divide-y divide-cream-50/8 border-t border-cream-50/8 text-sm">{p.layout.rooms.map((r) => <li key={r.key} className="py-3"><div className="flex justify-between"><span className="font-display text-cream-50">{r.name}</span>{r.size && <span className="text-xs text-cream-300/70">{r.size}</span>}</div><p className="mt-1 text-cream-200/75">{r.items.join(" · ")}</p></li>)}</ul><p className="mt-3 text-xs text-cream-300/60">{p.layout.entranceNote}</p></div>}
            {p.specs && <div className="reveal space-y-6">{p.specs.map((g) => <div key={g.title}><h3 className="font-display text-xs uppercase tracking-[0.2em] text-cedar-300">{g.title}</h3><dl className="mt-2 divide-y divide-cream-50/8 border-y border-cream-50/8">{g.rows.map((r) => <div key={r.k} className="grid grid-cols-[120px_1fr] gap-3 py-2.5 text-sm"><dt className="text-cream-300/60">{r.k}</dt><dd className="text-cream-100">{r.v}</dd></div>)}</dl></div>)}</div>}
          </aside>
        </div>

        <div className="mt-20 border-t border-cream-50/8 pt-12 pb-20">
          <h2 className="reveal font-display text-xl text-cream-50">{isSauna ? "Другие модели" : "Другие услуги"}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">{others.map((o) => <li key={o.id} className="reveal"><Link to={`/product/${o.id}`} className="group flex items-center gap-4 rounded-2xl border border-cream-50/8 bg-bark-800 p-3 hover:border-cream-50/25 transition-colors" onClick={() => track("product_view", { id: o.id, from: "related" })}><div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-bark-700"><img src={o.image} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" /></div><div className="min-w-0"><p className="font-display text-sm text-cream-50 truncate group-hover:text-cedar-300 transition-colors">{o.shortName}</p><p className="text-xs text-cream-300/70">{o.kind === "service" ? "от " : ""}{formatPrice(o.price)}</p></div><ArrowIcon className="ml-auto text-cream-300/50 group-hover:text-cream-50" /></Link></li>)}</ul>
          {isSauna && <p className="mt-6 text-sm text-cream-300/70">Не уверены в размере? <Link to="/#quiz" className="text-cedar-300 hover:text-cedar-200 underline underline-offset-4">Пройдите подбор за 5 вопросов</Link>.</p>}
        </div>
      </div>
    </div>
  );
}

export function NotFound({ path }: { path: string }) {
  useDocumentTitle("Страница не найдена — Сила Леса");
  return <div className="bg-bark-900 pt-32 pb-24 min-h-[70vh]"><div className="mx-auto max-w-3xl px-4 sm:px-6 text-center"><p className="text-xs uppercase tracking-[0.2em] text-cedar-300">404</p><h1 className="mt-4 font-display font-semibold text-3xl sm:text-5xl text-cream-50">Такой страницы нет</h1><p className="mt-4 text-cream-200/75">Адрес <code className="rounded bg-cream-50/8 px-1.5 py-0.5 text-sm">{path}</code> не найден. Вот что есть на сайте:</p><ul className="mt-8 grid gap-2 sm:grid-cols-2 text-left">{products.map((p) => <li key={p.id}><Link to={`/product/${p.id}`} className="flex items-center justify-between rounded-2xl border border-cream-50/10 px-4 py-3 text-sm text-cream-100 hover:border-cream-50/30">{p.name} <ArrowIcon className="text-cream-300/60" /></Link></li>)}</ul><div className="mt-8"><LinkButton to="/">На главную</LinkButton></div></div></div>;
}
