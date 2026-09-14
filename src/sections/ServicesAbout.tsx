import { ArrowIcon, LinkButton, LogoMark, PhoneIcon, SectionHead } from "../components/Brand";
import { company, formatPrice, mapsUrl, services } from "../data/products";
import { Link } from "../lib/router";
import { track } from "../lib/utils";

export function Services() {
  return (
    <section id="services" className="scroll-mt-20 bg-bark-950 py-20 sm:py-28 border-t border-cream-50/6" aria-labelledby="services-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            index="Другие услуги"
            title={<span id="services-title">Строительные работы — отдельно от банной линейки</span>}
            lead="Эти направления не смешиваем с выбором бани на главной странице. Здесь собраны отдельные услуги компании: бурение, стяжка и механизированная штукатурка."
          />
          <p className="reveal text-xs text-cream-300/60 lg:max-w-xs lg:text-right">Цены услуг — стартовые ориентиры с сайта компании; расчёт после выезда мастера или замерщика.</p>
        </div>

        <ol className="mt-12 divide-y divide-cream-50/8 border-y border-cream-50/8">
          {services.map((s, i) => (
            <li key={s.id} className="reveal" style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}>
              <Link
                to={`/product/${s.id}`}
                className="group grid gap-4 py-6 sm:grid-cols-[120px_1fr_auto] sm:items-center sm:gap-8"
                onClick={() => track("product_view", { id: s.id, from: "services" })}
              >
                <div className="h-20 w-full sm:w-[120px] overflow-hidden rounded-2xl bg-bark-800">
                  <img src={s.image} alt={s.imageAlt} loading="lazy" decoding="async" width={1200} height={627} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-cedar-300/80">{s.category}</p>
                  <h3 className="mt-1 font-display text-lg text-cream-50 group-hover:text-cedar-300 transition-colors">{s.name}</h3>
                  <p className="mt-1 text-sm text-cream-300/75 max-w-2xl">{s.tagline}</p>
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                  <span className="font-display text-lg text-cream-50">от {formatPrice(s.price)}</span>
                  <span className="inline-flex items-center gap-1 text-sm text-cream-300/70 group-hover:text-cream-50">
                    Подробнее <ArrowIcon />
                  </span>
                </div>
              </Link>
            </li>
          ))}
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
          <SectionHead light index="09 — Производство и контакты" title={<span id="about-title">Баню можно проверить не по обещаниям, а вживую</span>} />
          <div className="reveal mt-8 flex items-start gap-5">
            <LogoMark size={64} className="ring-cedar-500/40 shrink-0" />
            <div className="space-y-4 text-base leading-relaxed text-bark-700">
              <p>
                «Сила Леса» производит мобильные бани в Омске. До заказа можно приехать на площадку, зайти внутрь готового образца, посмотреть узлы печи и дымохода, оценить размеры помещений и фактуру кедра.
              </p>
              <p>
                Мы не прячем техническую часть за красивой картинкой: на сайте открыты планировки, состав стандартной комплектации, базовые цены и известные доплаты. Если участок сложный для доставки, вариант монтажа обсуждается заранее.
              </p>
            </div>
          </div>
          <div className="reveal mt-10">
            <h3 className="font-display text-xs uppercase tracking-[0.2em] text-cedar-700">Что можно проверить на площадке</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                "реальные размеры парной и комнаты отдыха",
                "кедровый брус и качество сборки",
                "печь Aston 16, бак и дымоход",
                "полки, скамейки, двери и окна",
                "варианты входа и расположения топки",
                "как баня устанавливается на основание",
              ].map((a) => (
                <li key={a} className="flex gap-2 text-sm text-bark-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cedar-500" aria-hidden="true" /> {a}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-bark-600/70">Лучший способ выбрать размер — постоять внутри бань вживую, а не сравнивать только цифры на экране.</p>
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
              <dt className="text-cream-300/60">Адрес</dt>
              <dd className="mt-1 text-cream-50">{company.address}</dd>
            </div>
            <div>
              <dt className="text-cream-300/60">Онлайн</dt>
              <dd className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <a href={company.vk} target="_blank" rel="noopener noreferrer" className="text-cedar-300 hover:text-cedar-200" onClick={() => track("cta_click", { type: "vk", where: "contacts" })}>
                  vk.com/silalesa55
                </a>
                <a href={company.site} target="_blank" rel="noopener noreferrer" className="text-cedar-300 hover:text-cedar-200">
                  silalesa55.ru
                </a>
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton to={`tel:${company.phonePrimary.tel}`} onClick={() => track("cta_click", { type: "call", where: "contacts-btn" })}>
              <PhoneIcon /> Позвонить
            </LinkButton>
            <LinkButton to="/#configurator" variant="ghost" onClick={() => track("cta_click", { type: "configurator", where: "contacts" })}>
              Рассчитать баню
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
