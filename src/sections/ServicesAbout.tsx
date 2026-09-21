import { ArrowIcon, LinkButton, LogoMark, PhoneIcon, SectionHead } from "../components/Brand";
import { company, formatPrice, mapsUrl, services, whatsappUrl } from "../data/products";
import { seoPages } from "../data/seoPages";
import { Link } from "../lib/router";
import { track } from "../lib/utils";

// Service thumbnails intentionally stay on the original product images.
// Before/after media is only used inside the dedicated service landing pages.
const serviceLandingByProductId = new Map(
  seoPages
    .filter((page) => page.kind === "service" && page.productId)
    .map((page) => [page.productId as string, page]),
);

export function Services() {
  return (
    <section id="services" className="scroll-mt-20 bg-bark-950 py-20 sm:py-28 border-t border-cream-50/6" aria-labelledby="services-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            index="Строительные услуги · Омск"
            title={<span id="services-title">Бурение и отделочные работы для дома и участка</span>}
            lead="Три самостоятельные услуги: бурение скважины, полусухая стяжка и механизированная штукатурка. Смотрите стартовую цену за единицу работ, условия и что прислать для расчёта."
          />
          <p className="reveal text-xs text-cream-300/60 lg:max-w-xs lg:text-right">Цены «от» указаны за м² или погонный метр. Итоговую смету уточняем по объёму и условиям вашего объекта.</p>
        </div>

        <ol className="mt-12 divide-y divide-cream-50/8 border-y border-cream-50/8">
          {services.map((s, i) => {
            const landing = serviceLandingByProductId.get(s.id);
            const target = landing ? `/${landing.slug}/` : `/product/${s.id}`;
            return (
              <li key={s.id} className="reveal" style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}>
                <Link
                  to={target}
                  className="group grid gap-4 py-6 sm:grid-cols-[120px_1fr_auto] sm:items-center sm:gap-8"
                  onClick={() => track("product_view", { id: s.id, from: "services" })}
                >
                  <div className="h-20 w-full sm:w-[120px] overflow-hidden rounded-2xl bg-bark-800">
                    <img src={s.image} alt={s.imageAlt} loading="lazy" decoding="async" width={1200} height={627} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-cedar-300/80">{s.category}</p>
                    <h3 className="mt-1 font-display text-lg text-cream-50 group-hover:text-cedar-300 transition-colors">{s.name}</h3>
                    <p className="mt-1 text-sm text-cream-300/75 max-w-2xl">{landing?.lead ?? s.tagline}</p>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                    <span className="font-display text-lg text-cream-50">{landing?.priceLabel ?? `от ${formatPrice(s.price)}`}</span>
                    <span className="inline-flex items-center gap-1 text-sm text-cream-300/70 group-hover:text-cream-50">
                      Условия и расчёт <ArrowIcon />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="features" className="scroll-mt-20 bg-cream-50 text-bark-950 py-20 sm:py-28" aria-labelledby="about-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <SectionHead light index="08 — Площадка и контакты" title={<span id="about-title">Посмотреть образец и уточнить условия</span>} />
          <div className="reveal mt-8 flex items-start gap-5">
            <LogoMark size={64} className="ring-cedar-500/40 shrink-0" />
            <div className="space-y-4 text-base leading-relaxed text-bark-700">
              <p>
                На площадке в Омске можно осмотреть образец, сравнить размеры и планировку с карточкой выбранной бани. Время визита согласуйте заранее.
              </p>
              <p>
                До заказа подтвердите выбранную комплектацию, опции, срок, итоговую цену и условия доставки письменно. Способ установки зависит от модели и подъезда.
              </p>
            </div>
          </div>
          <div className="reveal mt-8 rounded-2xl border border-bark-950/15 bg-white p-5 sm:p-6">
            <h3 className="font-display text-lg text-bark-950">Что можно проверить до заказа</h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-bark-700 sm:text-base">
              <li>Фотографии, цены и планировки — <Link to="/mobilnaya-banya-omsk/" className="font-medium text-cedar-700 underline underline-offset-2">в каталоге бань</Link>.</li>
              <li>Осмотр образцов — на Нефтезаводской, 49/1. Заранее согласуйте время визита по телефону.</li>
              <li>Сверьте с заказом опции, сроки, гарантийные условия, доставку и итоговую цену.</li>
            </ul>
          </div>
        </div>

        <div className="reveal rounded-3xl bg-bark-950 text-cream-50 p-6 sm:p-8 shadow-card">
          <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Контакты</p>
          <div className="mt-5 space-y-4">
            <a href={`tel:${company.phonePrimary.tel}`} className="flex items-center gap-3 font-display text-xl sm:text-2xl hover:text-cedar-300 transition-colors" onClick={() => track("cta_click", { type: "call", where: "contacts" })}>
              <PhoneIcon className="h-5 w-5 text-cedar-400" /> {company.phonePrimary.display}
            </a>
            <a href={`tel:${company.phoneSecondary.tel}`} className="flex items-center gap-3 font-display text-xl sm:text-2xl hover:text-cedar-300 transition-colors" onClick={() => track("cta_click", { type: "call2", where: "contacts" })}>
              <PhoneIcon className="h-5 w-5 text-cedar-400" /> {company.phoneSecondary.display}
              <span className="text-sm font-sans text-cream-300/70">{company.phoneSecondary.person}</span>
            </a>
          </div>

          <dl className="mt-8 space-y-5 text-sm">
            <div>
              <dt className="text-cream-300/60">Посмотреть образцы</dt>
              <dd className="mt-1 text-cream-50">{company.showroom}</dd>
              <dd>
                <a href={mapsUrl(company.showroom)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-cedar-300 hover:text-cedar-200" onClick={() => track("cta_click", { type: "map", where: "contacts" })}>
                  Открыть в Яндекс Картах <ArrowIcon className="h-3.5 w-3.5" />
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-cream-300/60">Когда приехать</dt>
              <dd className="mt-1 text-cream-50">Осмотр образцов — по предварительной договорённости. Время визита уточните по телефону.</dd>
            </div>
            <div>
              <dt className="text-cream-300/60">Онлайн</dt>
              <dd className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <a href={company.vk} target="_blank" rel="noopener noreferrer" className="text-cedar-300 hover:text-cedar-200" onClick={() => track("cta_click", { type: "vk", where: "contacts" })}>
                  vk.com/silalesa55
                </a>
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton to={`tel:${company.phonePrimary.tel}`} onClick={() => track("cta_click", { type: "call", where: "contacts-btn" })}>
              <PhoneIcon /> Позвонить
            </LinkButton>
            <LinkButton to={whatsappUrl("Здравствуйте! Хочу посмотреть баню и уточнить комплектацию. Страница: https://conradipui-glitch.github.io/silalesa/")} variant="ghost" external onClick={() => track("cta_click", { type: "whatsapp", where: "contacts" })}>
              Написать в WhatsApp
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
