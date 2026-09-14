import { ArrowIcon, LinkButton, SectionHead } from "../components/Brand";
import { company, mapsUrl } from "../data/products";
import { track } from "../lib/utils";

const readyPoints = [
  {
    title: "Без отдельной стройки",
    text: "Основную сборку делаем в цеху. Если манипулятор не может заехать на участок, баню можно собрать поэтапно на месте.",
  },
  {
    title: "Понятно, что входит в цену",
    text: "Печь, бак, дымоход, электрика, полки, трапики, ступенька, установка на блоки и доставка по Омску уже описаны до заказа.",
  },
  {
    title: "Можно проверить до покупки",
    text: `На площадке ${company.showroom} можно зайти внутрь, увидеть планировку, потрогать кедр и спокойно задать технические вопросы.`,
  },
  {
    title: "Подходит для сибирского климата",
    text: "Кедровый брус 45 мм камерной сушки, безопасный проход печи, сэндвич-дымоход и регулируемое горение — не декоративные опции, а рабочая конструкция.",
  },
];

export function ReadyPromise() {
  return (
    <section id="why-ready" className="bg-cream-50 py-20 text-bark-950 sm:py-28" aria-labelledby="ready-title">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20 lg:px-8">
        <div className="reveal lg:sticky lg:top-24 lg:self-start">
          <p className="font-display text-xs uppercase tracking-[0.22em] text-cedar-700">Почему готовая баня</p>
          <h2 id="ready-title" className="mt-4 max-w-xl font-display text-[30px] font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-[48px]">
            Вам нужна баня. <span className="text-cedar-700">Не ещё одна стройка.</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-bark-600 sm:text-lg">
            Вы выбираете размер и комплектацию. Мы собираем, привозим и устанавливаем. На участке не остаётся куча пиломатериала, недель монтажа и десятка отдельных подрядчиков.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton to="/#configurator" onClick={() => track("cta_click", { type: "configurator", where: "why-ready" })}>
              Рассчитать свою баню <ArrowIcon />
            </LinkButton>
            <a
              href={mapsUrl(company.showroom)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-bark-950/15 px-5 text-[15px] font-medium text-bark-950 transition-colors hover:border-bark-950/35 hover:bg-bark-950/5"
              onClick={() => track("cta_click", { type: "map", where: "why-ready" })}
            >
              Посмотреть вживую
            </a>
          </div>
        </div>

        <ol className="divide-y divide-bark-950/10 border-y border-bark-950/10">
          {readyPoints.map((point, index) => (
            <li key={point.title} className="reveal grid gap-3 py-7 sm:grid-cols-[64px_1fr] sm:gap-6" style={{ ["--reveal-delay" as string]: `${index * 60}ms` }}>
              <span className="font-display text-sm text-cedar-700">0{index + 1}</span>
              <div>
                <h3 className="font-display text-lg text-bark-950">{point.title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-bark-600 sm:text-base">{point.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const faqs = [
  {
    q: "Нужен ли капитальный фундамент?",
    a: "Для моделей Квадро в стандарт входит установка на блоки. Главное — заранее выбрать место и подготовить ровное основание. Если участок сложный, условия лучше обсудить до доставки.",
  },
  {
    q: "Что если манипулятор не сможет заехать на участок?",
    a: "Это не тупик: баню можно собирать не только в цеху, но и поэтапно непосредственно на участке. Способ установки определяем до заказа.",
  },
  {
    q: "Можно ли пользоваться зимой?",
    a: "Да. Квадро рассчитана на круглогодичную эксплуатацию: брус 45 мм камерной сушки, проход печи защищён каолиновой ватой, дымоход — сэндвич. Как и у любой дровяной бани, важны правильная топка, просушка и уход.",
  },
  {
    q: "Нужно ли подводить воду?",
    a: "Нет, это не обязательное условие для первого запуска. В стандартной комплектации есть бак из нержавеющей стали на 50 л. Водопрод можно подключить по желанию.",
  },
  {
    q: "Цена на сайте — это вся баня или только коробка?",
    a: "Для Квадро указана цена стандартной комплектаци. В неё входят конструкция, печь Aston 16, дымоход, бак 50 л, базовая электрика и мебель по модели, трапики, ступенька, установка на блоки и бесплатная доставка по Омску. Дополнительные опции считаются отдельно.",
  },
  {
    q: "Можно сначала посмотреть баню вживую?",
    a: `Да. Образцы можно посмотреть на площадке: ${company.showroom}. Это лучший способ понять реальный размер комнат, высоту полков и ощущение от кедра до заказа.`,
  },
  {
    q: "Доставляете только по Омску?",
    a: "По Омску доставка стандартной Квадро бесплатна. Доставку в другой город можно рассчитать отдельно — стоимость зависит от направления и логистики.",
  },
  {
    q: "Сколько ждать изготовления?",
    a: "Срок зависит от выбранной модели, опций и текущей загрузки производства. Мы не фиксируем выдуманный универсальный срок на сайте: менеджер подтверждает актуальную дату до оформления заказа.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-cream-50 py-20 text-bark-950 sm:py-28" aria-labelledby="faq-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div>
            <SectionHead
              light
              index="08 — До заказа"
              title={<span id="faq-title">Вопросы, которые лучше закрыть до доставки</span>}
              lead="Без маркетинговых сюрпризов: основание, заезд на участок, вода, зима, доставка и то, что действительно входит в цену."
            />
          </div>
          <div className="divide-y divide-bark-950/10 border-y border-bark-950/10">
            {faqs.map((item, index) => (
              <details key={item.q} className="reveal group py-5" style={{ ["--reveal-delay" as string]: `${index * 40}ms` }}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-base text-bark-950 marker:hidden sm:text-lg">
                  <span>{item.q}</span>
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-bark-950/15 text-lg font-sans font-normal transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="max-w-2xl pt-3 pr-10 text-sm leading-relaxed text-bark-600 sm:text-base">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="reveal mt-12 flex flex-col gap-5 rounded-3xl bg-bark-950 p-6 text-cream-50 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-display text-xl">Остался вопрос по вашему участку?</p>
            <p className="mt-2 text-sm text-cream-300/75">Позвоните — проще за несколько минут проверить заезд, место установки и подходящую модель.</p>
          </div>
          <LinkButton to={`tel:${company.phonePrimary.tel}`} className="shrink-0" onClick={() => track("cta_click", { type: "call", where: "faq" })}>
            Позвонить {company.phonePrimary.display}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
