import { ArrowIcon, LinkButton, SectionHead } from "../components/Brand";
import { company, mapsUrl, whatsappUrl } from "../data/products";
import { track } from "../lib/utils";
import { Link } from "../lib/router";

const readyPoints = [
  { title: "Планировки и цены без заявки", text: "Четыре карточки моделей показывают размер, комнаты и цену. Для Квадро 4×2 вход сбоку на фото — дополнительная опция." },
  { title: "Стандарт Квадро указан открыто", text: "На блоки устанавливаем и по Омску доставляем в рамках стандартной комплектации Квадро. Для каркасной модели условия другие — уточняются отдельно." },
  { title: "Образец можно осмотреть", text: `Площадка: ${company.showroom}. Уточните время визита, сравните комплектацию и планировку выбранной модели с заказом.` },
];

export function ReadyPromise() {
  return (
    <section id="why-ready" className="bg-cream-50 py-20 text-bark-950 sm:py-28" aria-labelledby="ready-title">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20 lg:px-8">
        <div className="reveal lg:sticky lg:top-24 lg:self-start">
          <p className="font-display text-xs uppercase tracking-[0.22em] text-cedar-700">Почему готовая баня</p>
          <h2 id="ready-title" className="mt-4 max-w-xl font-display text-[30px] font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-[48px]">
            Модель, цена и условия — <span className="text-cedar-700">до оформления заказа.</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-bark-600 sm:text-lg">
            Выберите баню по помещениям и цене. Обсудим подъезд, основание и монтаж под конкретный участок; для каркасной и нестандартной доставки условия отдельно.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton to="/mobilnaya-banya-omsk/" onClick={() => track("cta_click", { type: "catalog", where: "why-ready" })}>
              Сравнить модели <ArrowIcon />
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
  { q: "Что входит в цену Квадро?", a: "Базовая комплектация модели, установка на блоки и доставка по Омску. У Квадро 4×2 вход сбоку, увеличенное окно и стеклянная дверца печи на фото — опции. Окончательный состав подтвердите в заказе." },
  { q: "А у каркасной бани те же условия?", a: "Нет. Каркасная 5,5×2,2 имеет три помещения и собственную комплектацию. Условия доставки и установки согласуются отдельно; стандарт Квадро автоматически на неё не распространяется." },
  { q: "Что подготовить для доставки?", a: "Адрес, фотографии подъезда и места установки. До заказа согласуйте основание, возможность подъезда техники, место разгрузки и способ монтажа." },
  { q: "Подойдёт ли баня для зимы?", a: "В характеристиках Квадро указаны кедровый брус 45 мм, печь Aston 16 и сэндвич-дымоход. Время прогрева зависит от условий. Перед топкой проверьте безопасную установку со специалистом и следуйте инструкции производителя." },
  { q: "Где посмотреть готовый образец?", a: `На выставочной площадке: ${company.showroom}. Время осмотра предварительно согласуйте по телефону.` },
  { q: "Как согласовать сроки, гарантию и итоговую цену?", a: "Попросите письменно указать выбранную комплектацию, дополнительные опции, дату, условия доставки/монтажа, гарантийные условия и итоговую стоимость до оформления заказа." },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-cream-50 py-20 text-bark-950 sm:py-28" aria-labelledby="faq-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div>
            <SectionHead
              light
              index="07 — Вопросы"
              title={<span id="faq-title">Вопросы, которые лучше закрыть до доставки</span>}
              lead="Короткие ответы о комплектации, доставке, зиме и том, что нужно подтвердить в заказе."
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

        <nav aria-label="Практические инструкции" className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <Link to="/guides/bani/chto-vhodit-v-tsenu/" className="text-cedar-700 underline underline-offset-4">Состав цены и доплаты</Link>
          <Link to="/guides/bani/podgotovka-uchastka-dostavka-manipulyator/" className="text-cedar-700 underline underline-offset-4">Подготовка к доставке</Link>
          <Link to="/guides/bani/chek-list-priemki-gotovoy-bani/" className="text-cedar-700 underline underline-offset-4">Приёмка бани</Link>
        </nav>
        <div className="reveal mt-12 flex flex-col gap-5 rounded-3xl bg-bark-950 p-6 text-cream-50 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="font-display text-xl">Остался вопрос по вашему участку?</p>
            <p className="mt-2 text-sm text-cream-300/75">Пришлите модель, адрес и фото въезда, если они уже есть. Остальное уточним в чате.</p>
          </div>
          <LinkButton to={whatsappUrl("Здравствуйте! Есть вопрос по бане и условиям установки. Страница: https://conradipui-glitch.github.io/silalesa/")} external className="shrink-0" onClick={() => track("cta_click", { type: "whatsapp", where: "faq" })}>
            Спросить в WhatsApp
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
