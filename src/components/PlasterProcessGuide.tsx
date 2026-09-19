import { ArrowIcon, LinkButton } from "./Brand";
import { whatsappUrl } from "../data/products";
import { track } from "../lib/utils";

const guideSlug = "guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka";
const serviceUrl = "/mehanizirovannaya-shtukaturka-omsk/";
const contactText = `Здравствуйте! Интересует механизированная штукатурка. Хочу обсудить стоимость работ; площадь и фотографии стен пришлю в чат. Страница: https://conradipui-glitch.github.io/silalesa/${guideSlug}/`;

const differences = [
  {
    title: "Когда рассмотреть станцию",
    text: "Если предстоит штукатурить много доступных стен или потолков, имеет смысл запросить расчёт механизированного способа. Сначала проверим условия объекта.",
  },
  {
    title: "Когда сравнить ручной способ",
    text: "Одна стена, локальный ремонт или сложный доступ? Сравните стоимость всего объёма работ с ручным вариантом. «Сила Леса» предлагает механизированную штукатурку.",
  },
  {
    title: "Кто делает стены ровными",
    text: "Станция готовит и подаёт раствор, а мастера готовят основание, выравнивают поверхность и проверяют результат. Оборудование не заменяет работу мастера.",
  },
  {
    title: "Как сравнивать цену",
    text: "Смотрите не только на цену за квадратный метр: уточните подготовку, смесь, доставку и возможные доплаты. Две сметы должны описывать одинаковый объём.",
  },
] as const;

const questions = [
  { title: "Что входит в названную цену?", text: "Уточните, включены ли подготовка стен, грунтование, выравнивание и обработка поверхности." },
  { title: "Какие материалы и объём учтены?", text: "Спросите, какая смесь предусмотрена, сколько квадратных метров и какой слой заложены в расчёт." },
  { title: "Что с доставкой и оборудованием?", text: "Уточните доставку и подъём материалов, размещение станции и необходимые подключения." },
  { title: "За что может потребоваться доплата?", text: "Обсудите откосы, сложные участки, дополнительные слои и порядок согласования изменений." },
  { title: "Какой результат принимаем?", text: "Согласуйте требования к поверхности под будущую отделку, уборку и порядок приёмки." },
] as const;

const stages = [
  { title: "Подготовка стен", text: "Оба способа требуют осмотра, защиты соседних поверхностей и подготовки основания. Для станции отдельно проверяют место и маршрут подачи раствора." },
  { title: "Смесь и подача", text: "Смесь подбирают под основание и допустимый способ нанесения. Станция готовит и подаёт совместимый раствор; при ручном способе замес и перенос организуют без неё." },
  { title: "Нанесение", text: "Станция помогает подавать и наносить раствор, при ручном способе используют инструмент. Площадь, слой и сложные участки нужно согласовать в обоих случаях." },
  { title: "Выравнивание", text: "В любом случае мастера формируют плоскость, углы и примыкания. Сам способ подачи не гарантирует ровную стену." },
  { title: "Приёмка", text: "Результат проверяют по согласованным критериям. Переход к следующей отделке зависит от инструкции смеси и состояния поверхности, а не от наличия станции." },
] as const;

export function PlasterProcessGuide() {
  return (
    <section aria-labelledby="p01-visual-title" className="bg-cream-100 py-14 text-bark-950 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cedar-700">Выбор штукатурки · коротко и понятно</p>
        <h2 id="p01-visual-title" className="mt-3 max-w-4xl font-display text-3xl font-semibold leading-tight sm:text-4xl">Что выбрать для ваших стен?</h2>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-bark-700">Для большого доступного объёма запросите расчёт со станцией; для одной стены или сложного доступа сравните ручной способ. «Сила Леса» выполняет механизированную штукатурку в Омске.</p>
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-cedar-700/20 bg-white p-5 sm:p-6">
          <div className="min-w-[200px] flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-cedar-700">Стоимость механизированной штукатурки</p>
            <p className="mt-1 font-display text-3xl font-semibold">от 550 ₽/м²</p>
            <p className="mt-1 text-sm text-bark-600">Ориентир, не окончательная смета: сумма зависит от площади и условий объекта.</p>
          </div>
          <LinkButton to={whatsappUrl(contactText)} external onClick={() => track("cta_click", { type: "whatsapp", where: "p01-simple-top", slug: guideSlug })}>Пришлите площадь и фото стен <ArrowIcon /></LinkButton>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2" aria-label="Практические различия способов штукатурки">
          {differences.map((item) => (
            <article key={item.title} className="rounded-2xl border border-bark-950/10 bg-white p-5 sm:p-6">
              <h3 className="font-display text-xl font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-bark-700 sm:text-base">{item.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-bark-950/10 bg-white p-5 sm:p-8" aria-labelledby="p01-estimate-title">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cedar-700">Перед заказом · без анкеты</p>
          <h3 id="p01-estimate-title" className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Пять вопросов, чтобы понять смету</h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-bark-700 sm:text-base">Ничего заполнять не нужно. Пройдитесь по вопросам с подрядчиком — так понятнее, за что вы платите. Если предложения ещё нет, просто пришлите площадь и фотографии стен для расчёта.</p>
          <ol className="mt-7 grid gap-3">
            {questions.map((item, index) => (
              <li key={item.title} className="flex gap-4 rounded-xl bg-cream-50 p-4 sm:p-5">
                <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cedar-700 font-semibold text-white">{index + 1}</span>
                <div><h4 className="font-display text-lg font-semibold">{item.title}</h4><p className="mt-1 text-sm leading-relaxed text-bark-700">{item.text}</p></div>
              </li>
            ))}
          </ol>
          <div className="mt-6 rounded-2xl bg-bark-900 p-5 text-cream-50 sm:p-6">
            <h4 className="font-display text-xl">Что делать дальше?</h4>
            <p className="mt-2 text-sm leading-relaxed text-cream-100">Попросите указать состав работ и полную сумму с возможными доплатами. Неизвестные пункты — повод задать вопрос, а не обязательные поля для заполнения. Мы можем обсудить механизированную штукатурку по площади и фото объекта.</p>
            <LinkButton to={whatsappUrl(contactText)} external className="mt-5" onClick={() => track("cta_click", { type: "whatsapp", where: "p01-simple-bottom", slug: guideSlug })}>Обсудить расчёт в WhatsApp <ArrowIcon /></LinkButton>
            <p className="mt-3 text-xs text-cream-200">Начальная ставка не включает автоматически все возможные работы. Конкретный состав согласуем до заказа.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <details className="rounded-2xl border border-bark-950/10 bg-cream-50 p-5 sm:p-6">
            <summary className="min-h-11 cursor-pointer font-display text-lg font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-700">Подробнее: как проходят работы</summary>
            <p className="mt-3 text-sm leading-relaxed text-bark-700">Эти технические детали не нужны для первого обращения. Они пригодятся, когда будете обсуждать работы с мастером.</p>
            <ol className="mt-4 space-y-4">
              {stages.map((item) => <li key={item.title}><h4 className="font-semibold">{item.title}</h4><p className="mt-1 text-sm leading-relaxed text-bark-700">{item.text}</p></li>)}
            </ol>
          </details>
          <details className="rounded-2xl border border-bark-950/10 bg-cream-50 p-5 sm:p-6">
            <summary className="min-h-11 cursor-pointer font-display text-lg font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-700">У меня две сметы — как их сравнить?</summary>
            <p className="mt-3 text-sm leading-relaxed text-bark-700">Сначала сравните одну и ту же площадь, слой, подготовку и результат. Затем попросите по каждой смете полную сумму: включите материалы, доставку и все отдельные работы. Если одна позиция указана «отдельно», её стоимость нельзя считать нулевой.</p>
            <p className="mt-3 text-sm leading-relaxed text-bark-700">Если в предложении чего-то нет, уточните это у подрядчика. Сравнивать итоговую стоимость можно только после приведения обеих смет к одному составу. Это памятка, а не калькулятор стоимости.</p>
          </details>
        </div>
        <p className="mt-7 text-sm leading-relaxed text-bark-700">Подробности об условиях работы, материалах и цене — на <a className="font-semibold text-cedar-800 underline underline-offset-4" href={serviceUrl}>странице механизированной штукатурки</a>. Ручной метод приведён для сравнения, не как отдельная услуга «Силы Леса».</p>
      </div>
    </section>
  );
}
