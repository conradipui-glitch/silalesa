import { useState } from "react";
import { ArrowIcon, CheckIcon, LinkButton, SectionHead } from "../components/Brand";
import { PlanDiagram, Silhouette } from "../components/PlanDiagram";
import { byModel, formatPrice, images, saunas, standardIncluded, type Product, type RoomKey } from "../data/products";
import { Link } from "../lib/router";
import { landingByProductId } from "../data/routeManifest";
import { cn } from "../utils/cn";
import { track } from "../lib/utils";

export type ModelKey = NonNullable<Product["modelKey"]>;

/* ------------------------------------------------------------------ */
/* 01 — Модели в масштабе                                               */
/* ------------------------------------------------------------------ */
export function Lineup({ model, setModel }: { model: ModelKey; setModel: (k: ModelKey) => void }) {
  const totalL = saunas.reduce((s, p) => s + (p.footprint?.l ?? 0), 0);

  return (
    <section id="product-section" className="relative scroll-mt-20 bg-bark-900 py-20 sm:py-28" aria-labelledby="models-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            index="01 — Модели"
            title={
              <span id="models-title">
                Выберите баню по тому, <span className="text-cedar-400">как будете ей пользоваться</span>
              </span>
            }
            lead="От компактной парной до трёх помещений. Размеры показаны в одном масштабе, а цена — сразу рядом: без формы «оставьте телефон, чтобы узнать стоимость»."
          />
          <p className="reveal text-sm text-cream-300/70 lg:max-w-xs lg:text-right">
            2×2 — компактная парная. 3×2 — отдых + парная. 4×2 — больше комнаты отдыха. 5,5×2,2 — три помещения с отдельной помывочной.
          </p>
        </div>

        <div className="reveal mt-12 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[640px]">
            <div className="flex items-end gap-4 sm:gap-6" role="group" aria-label="Модели бань в масштабе">
              {saunas.map((p) => {
                const key = p.modelKey!;
                const active = model === key;
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setModel(key);
                      track("config_change", { field: "model", value: key, where: "lineup" });
                    }}
                    className={cn(
                      "group relative flex flex-col items-stretch rounded-2xl px-2 pt-3 pb-2 transition-colors",
                      active ? "bg-cream-50/6" : "hover:bg-cream-50/4",
                    )}
                    style={{ flex: `${p.footprint?.l ?? 2} 1 0%` }}
                  >
                    <Silhouette product={p} active={active} className={cn("transition-transform duration-500", active ? "scale-[1.02]" : "group-hover:scale-[1.01]")} />
                    <span className="mt-2 h-px w-full bg-cream-300/30 relative" aria-hidden="true">
                      <span className="absolute left-0 -top-1 h-2 w-px bg-cream-300/60" />
                      <span className="absolute right-0 -top-1 h-2 w-px bg-cream-300/60" />
                    </span>
                    <span className={cn("mt-2 font-display text-xs sm:text-sm text-center transition-colors", active ? "text-cedar-300" : "text-cream-200/80")}>
                      {p.dims}
                    </span>
                    <span className="text-[11px] text-center text-cream-300/60 truncate">{p.shortName}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.18em] text-cream-300/40">
              <span>2 м</span>
              <span>суммарно {totalL.toLocaleString("ru-RU")} м по длине</span>
              <span>5,5 м</span>
            </div>
          </div>
        </div>

        <ul className="mt-12 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 pb-2 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 xl:grid-cols-4 sm:overflow-visible" aria-label="Каталог бань">
          {saunas.map((p, i) => (
            <li key={p.id} className="reveal snap-start shrink-0 w-[82vw] max-w-[360px] sm:w-auto sm:max-w-none" style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}>
              <ModelCard product={p} active={model === p.modelKey} onSelect={() => setModel(p.modelKey!)} />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-cream-300/70">Листайте карточки по горизонтали на телефоне. Все четыре модели с ценами и планировками есть также в <Link to="/mobilnaya-banya-omsk/" className="font-medium text-cedar-300 underline underline-offset-4">общем каталоге</Link>.</p>
      </div>
    </section>
  );
}

function ModelCard({ product: p, active, onSelect }: { product: Product; active: boolean; onSelect: () => void }) {
  const landing = landingByProductId[p.id];
  const productUrl = landing ? `/${landing.slug}/` : `/product/${p.id}/`;
  const useCase = p.modelKey === "k2" ? "Одна парная" : p.modelKey === "k3" ? "Парная + комната отдыха" : p.modelKey === "k4" ? "Два помещения" : "Три помещения с помывочной";
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-bark-800 transition-colors",
        active ? "border-cedar-500/60" : "border-cream-50/8 hover:border-cream-50/20",
      )}
    >
      <Link to={productUrl} className="block" aria-label={`${p.name} — подробнее`} onClick={() => track("product_view", { id: p.id, from: "card" })}>
        <div className="relative aspect-[4/3] overflow-hidden bg-bark-700">
          <img src={p.image} alt={p.imageAlt} loading="lazy" decoding="async" width={1536} height={1024} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
          <span className="absolute left-3 top-3 rounded-full bg-bark-950/70 px-2.5 py-1 text-[11px] font-display text-cream-50 backdrop-blur">{p.dims}</span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-cedar-300/80">{useCase}</p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg text-cream-50">{p.shortName}</h3>
          <p className="font-display text-base text-cedar-300 whitespace-nowrap">{formatPrice(p.price)}</p>
        </div>
        <p className="mt-1 text-sm text-cream-300/70">{p.tagline}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {p.roomsList?.map((r) => (
            <li key={r} className="rounded-full border border-cream-50/12 px-2.5 py-1 text-[11px] text-cream-200/80">
              {r}
            </li>
          ))}

        </ul>
        <p className="mt-3 text-xs leading-relaxed text-cream-300/70">{p.modelKey === "f55" ? "Каркасная: доставку и монтаж уточняем отдельно." : p.modelKey === "k4" ? "Вход сбоку и увеличенное окно на фото — опции; в стандарте вход с торца." : "Стандарт Квадро: установка на блоки и доставка по Омску включены."}</p>
        <div className="mt-auto pt-5 flex items-center justify-between">
          <Link to={productUrl} className="inline-flex items-center gap-1.5 text-sm text-cream-50 hover:text-cedar-300" onClick={() => track("product_view", { id: p.id, from: "card-link" })}>
            Подробнее <ArrowIcon />
          </Link>
          <Link to="/#layout" className="text-xs text-cream-300/60 hover:text-cream-100" onClick={onSelect}>
            план →
          </Link>
        </div>
      </div>
    </article>
  );
}

export function LayoutSection({ model, setModel }: { model: ModelKey; setModel: (k: ModelKey) => void }) {
  const p = byModel(model);
  const layoutLanding = landingByProductId[p.id];
  const productUrl = layoutLanding ? `/${layoutLanding.slug}/` : `/product/${p.id}/`;
  const [hover, setHover] = useState<RoomKey | null>(null);
  const layout = p.layout!;

  return (
    <section id="layout" className="relative scroll-mt-20 bg-bark-950 py-20 sm:py-28 overflow-hidden" aria-labelledby="layout-title">
      <div className="absolute inset-0 grid-paper opacity-40" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          index="03 — Планировка"
          title={<span id="layout-title">Планировка каждой модели — до обращения</span>}
          lead="Выберите модель и посмотрите помещения, их размеры и состав. Планировка каркасной показана условно; боковой вход Квадро 4×2 — дополнительная опция."
        />

        <div className="reveal mt-10 inline-flex flex-wrap gap-1 rounded-full border border-cream-50/10 bg-bark-900/80 p-1" role="group" aria-label="Выбор модели для планировки">
          {saunas.map((s) => {
            const active = s.modelKey === model;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setModel(s.modelKey!);
                  track("config_change", { field: "model", value: s.modelKey!, where: "layout" });
                }}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-display transition-colors",
                  active ? "bg-cedar-500 text-bark-950" : "text-cream-200/80 hover:text-cream-50 hover:bg-cream-50/6",
                )}
              >
                {s.dims}
              </button>
            );
          })}
        </div>

        <div id="layout-panel" className="mt-8 grid min-w-0 gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14 items-start">
          <div className="reveal min-w-0 overflow-hidden rounded-3xl border border-cream-50/8 bg-bark-900/70 p-4 sm:p-8">
            <PlanDiagram layout={layout} highlight={hover} onHover={setHover} className="min-w-0" />
            <p className="mt-4 text-center text-xs text-cream-300/60">
              {layout.entranceNote}
              {layout.inner && <> · внутри {layout.inner}</>}
            </p>
          </div>

          <div className="reveal min-w-0" style={{ ["--reveal-delay" as string]: "120ms" }}>
            <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-4">
              <h3 className="min-w-0 break-words font-display text-2xl text-cream-50">{p.name}</h3>
              <p className="font-display text-xl text-cedar-300 whitespace-nowrap">{formatPrice(p.price)}</p>
            </div>
            <p className="mt-2 text-sm text-cream-300/70">{p.tagline}</p>

            <ul className="mt-6 divide-y divide-cream-50/8 border-y border-cream-50/8">
              {layout.rooms.map((r) => (
                <li
                  key={r.key}
                  className={cn("py-4 transition-colors -mx-3 px-3 rounded-lg cursor-default", hover === r.key && "bg-cream-50/5")}
                  onMouseEnter={() => setHover(r.key)}
                  onMouseLeave={() => setHover(null)}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-sm text-cream-50">{r.name}</span>
                    {r.size && <span className="text-xs text-cream-300/70">{r.size} по длине</span>}
                  </div>
                  <p className="mt-1 text-sm text-cream-200/75">{r.items.join(" · ")}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-6 grid gap-3 text-sm">
              <div className="grid grid-cols-[96px_1fr] gap-3">
                <dt className="text-cream-300/60">Вход</dt>
                <dd className="min-w-0 break-words text-cream-100">{layout.entrance === "end" ? "с торца" : "сбоку"} · {layout.entranceNote}</dd>
              </div>
              <div className="grid grid-cols-[96px_1fr] gap-3">
                <dt className="text-cream-300/60">Печь</dt>
                <dd className="min-w-0 break-words text-cream-100">{layout.stove}</dd>
              </div>
              <div className="grid grid-cols-[96px_1fr] gap-3">
                <dt className="text-cream-300/60">Окна</dt>
                <dd className="min-w-0 break-words text-cream-100">{layout.windows}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton to={productUrl} onClick={() => track("product_view", { id: p.id, from: "layout" })}>
                Открыть модель <ArrowIcon />
              </LinkButton>
              <LinkButton to="/#configurator" variant="ghost" onClick={() => track("cta_click", { type: "configurator", where: "layout" })}>
                Собрать комплектацию
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StandardSection() {
  const std = byModel("k3").specs!;
  return (
    <section id="standard" className="scroll-mt-20 bg-cream-50 text-bark-950 py-20 sm:py-28" aria-labelledby="standard-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 items-start">
        <div className="reveal lg:sticky lg:top-24">
          <div className="kvadro-mask relative overflow-hidden aspect-[4/5] max-h-[640px] bg-cream-200 shadow-card">
            <img src={images.parnaya} alt="парной бани-квадро: кедровые полки, печь Aston, бак и ковш" loading="lazy" decoding="async" width={1024} height={1365} className="h-full w-full object-cover" />
          </div>
          <p className="mt-3 text-xs text-bark-600/70">Схема комплектации: печь со стеклянной дверцей — опция; бак 50 л, полок и выдвижная скамейка входят в стандарт.</p>
        </div>

        <div>
          <SectionHead
            light
            index="02 — Что входит"
            title={<span id="standard-title">Цена — за готовую баню, а не за пустую коробку</span>}
            lead="В стандарт Квадро входят конструкция, печь, дымоход, бак и элементы по спецификации модели. Доставка по Омску и установка на блоки включены. У каркасной бани другой состав и отдельные условия логистики."
          />

          <details className="mt-8 rounded-2xl border border-bark-950/15 p-5 sm:p-6">
            <summary className="cursor-pointer font-display text-lg font-medium text-bark-950">Полные характеристики Квадро 3×2</summary>
          <div className="mt-8 space-y-8">
            {std.map((g, gi) => (
              <div key={g.title} className="reveal" style={{ ["--reveal-delay" as string]: `${gi * 60}ms` }}>
                <h3 className="font-display text-xs uppercase tracking-[0.2em] text-cedar-700">{g.title}</h3>
                <dl className="mt-3 divide-y divide-bark-950/10 border-y border-bark-950/10">
                  {g.rows.map((r) => (
                    <div key={r.k} className="grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] gap-4 py-3 text-sm">
                      <dt className="text-bark-600">{r.k}</dt>
                      <dd className="text-bark-950">{r.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          </details>
          <div className="reveal mt-10 rounded-3xl bg-bark-950 text-cream-50 p-6 sm:p-8">
            <p className="font-display text-sm uppercase tracking-[0.18em] text-cedar-300">Уже входит в цену любой Квадро</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {standardIncluded.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm">
                  <CheckIcon className="text-cedar-400 shrink-0" /> {s}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-cream-300/70">Для каркасной 5,5×2,2 комплектация и доставка указаны отдельно на странице модели.</p>
            <Link to="/guides/bani/chto-vhodit-v-tsenu/" className="mt-4 inline-flex min-h-11 items-center text-sm text-cedar-300 underline underline-offset-4">Что включено и какие бывают доплаты →</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
