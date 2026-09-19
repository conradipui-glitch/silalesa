import { useState } from "react";
import { ArrowIcon, LinkButton } from "./Brand";
import { whatsappUrl } from "../data/products";
import { track } from "../lib/utils";
import { estimateItems, exampleOffers, initialOffers, summarizeOffers } from "../lib/plasterOffers";
import type { EstimateMode, Method, Scope } from "../lib/plasterOffers";

export { summarizeOffers, estimateItems } from "../lib/plasterOffers";
export type { Scope, OfferPair } from "../lib/plasterOffers";

const stages = [
  {
    name: "Основание", tag: "01 / подготовка",
    shared: "В обоих случаях мастера осматривают основание, защищают соседние поверхности и готовят стены под выбранную смесь.",
    machine: "Проверяют место для станции и будущий маршрут подачи смеси; оборудование не заменяет подготовку стен.",
    hand: "Подготовка стен такая же; инструменты и перенос материалов организуют без станции.",
    check: "Указаны ли осмотр, защита, грунтование и работа с непрочными участками?",
  },
  {
    name: "Смесь и подача", tag: "02 / логистика",
    shared: "Смесь должна подходить для основания и разрешённого способа нанесения. Доставку и расход учитывают в смете.",
    machine: "Станция готовит и подаёт совместимую смесь. Нужны размещение, вода, питание по требованиям оборудования и маршрут шланга.",
    hand: "Раствор замешивают и доставляют к стене без станции; конкретный инструмент и подъём согласуют с бригадой.",
    check: "Сверены ли смесь, расход, доставка и подъём в предложениях?",
  },
  {
    name: "Нанесение", tag: "03 / поверхность",
    shared: "Основание, предполагаемый слой и все участки должны быть описаны одинаково. Сложные места требуют внимания мастеров.",
    machine: "Оборудование помогает подавать и наносить раствор на поверхность.",
    hand: "Мастера наносят раствор инструментом; совместимость ручного нанесения проверяют по инструкции смеси.",
    check: "Согласованы ли площадь, слой и откосы, а не только цена нанесения?",
  },
  {
    name: "Выравнивание", tag: "04 / геометрия",
    shared: "Мастера в обеих технологиях формируют плоскость, углы и примыкания и контролируют геометрию.",
    machine: "После машинной подачи мастера распределяют, подрезают и выравнивают смесь по принятой технологии.",
    hand: "После нанесения инструментом мастера выполняют такое же требуемое выравнивание и обработку.",
    check: "Одинаковы ли требования к плоскости, углам и будущей отделке?",
  },
  {
    name: "Приёмка", tag: "05 / передача",
    shared: "Результат проверяют по согласованным критериям, обеспечивают предусмотренный уход и допускают следующий этап по инструкции материала.",
    machine: "Само наличие станции не гарантирует ровность или готовность поверхности.",
    hand: "Ручное нанесение тоже не отменяет контроля и требований к дальнейшей отделке.",
    check: "Кто принимает работу, отвечает за уборку и подтверждает готовность под следующий этап?",
  },
] as const;

const baselineLabels = [
  "Одинаковая измеренная площадь стен, потолков и откосов",
  "Проверены перепады, предполагаемый слой и совместимость смеси",
  "Согласованы требования к поверхности под дальнейшую отделку",
] as const;
const scopeLabels: { value: Scope; label: string }[] = [
  { value: "unknown", label: "Надо уточнить" },
  { value: "included", label: "Включено в цену" },
  { value: "separate", label: "Отдельно / доплата" },
];

function DifferenceColumn({ method, text }: { method: Method; text: string }) {
  return (
    <div className={`rounded-2xl border p-5 sm:p-6 ${method === "machine" ? "border-cedar-300/30 bg-bark-800" : "border-cream-50/15 bg-bark-950"}`}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cedar-300">{method === "machine" ? "Станция" : "Без станции"}</p>
      <h4 className="mt-2 font-display text-xl text-cream-50">{method === "machine" ? "Механизированная" : "Ручная"}</h4>
      <p className="mt-3 text-sm leading-relaxed text-cream-200">{text}</p>
    </div>
  );
}

export function PlasterProcessGuide() {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<EstimateMode>("single");
  const [baseline, setBaseline] = useState<boolean[]>([false, false, false]);
  const [offers, setOffers] = useState(initialOffers);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isExample, setIsExample] = useState(false);
  const stage = stages[active];
  const summary = summarizeOffers(offers, baseline, mode);
  const updateScope = (id: string, method: Method, value: Scope) => {
    setIsExample(false);
    setOffers((previous) => ({ ...previous, [id]: { ...previous[id], [method]: value } }));
  };
  const reset = () => {
    setMode("single");
    setBaseline([false, false, false]);
    setOffers(initialOffers());
    setVisibleCount(3);
    setIsExample(false);
  };
  const exampleSummary = summarizeOffers(exampleOffers(), [true, true, true], "compare");
  const showExample = () => setIsExample((previous) => !previous);
  const title = summary.status === "empty" ? "Начните с одной позиции"
    : summary.status === "incomplete" ? "Уже видно, что нужно уточнить"
    : summary.status === "baseline" ? "Состав известен — сверьте исходные условия"
    : summary.status === "additions" ? "Состав ясен — включите суммы доплат"
    : mode === "single" ? "Состав ясен — запросите полную сумму"
    : "Состав ясен — сравните итоговые суммы";
  const contactText = `Здравствуйте! Хочу обсудить расчёт механизированной штукатурки. Проверяю ${mode === "single" ? "одну смету" : "две сметы"}; площадь и фотографии стен пришлю в чат. Страница: https://conradipui-glitch.github.io/silalesa/guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka/`;

  return (
    <section aria-labelledby="p01-visual-title" className="bg-cream-100 py-16 text-bark-950 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cedar-700">Визуальный гайд · штукатурка</p>
        <h2 id="p01-visual-title" className="mt-3 max-w-4xl font-display text-3xl font-semibold leading-tight sm:text-4xl">Две технологии. Пять этапов. Одна задача.</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-bark-700">Посмотрите, что одинаково для обеих технологий, где помогает станция и за что отвечают мастера. Затем проверьте одну смету или сравните две.</p>

        <div className="mt-9 overflow-hidden rounded-3xl bg-bark-900 text-cream-50 shadow-card">
          <div className="border-b border-cream-50/15 px-5 py-6 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cedar-300">01 / Карта процесса</p>
            <h3 className="mt-2 font-display text-2xl sm:text-3xl">Что общее и где разница?</h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-cream-200">Выберите этап: сначала увидите общие работы, затем особенности двух способов и вопрос к смете.</p>
          </div>
          <div className="grid gap-2 p-4 sm:grid-cols-2 sm:gap-3 sm:p-6 lg:grid-cols-5" role="group" aria-label="Этапы сравнения технологий">
            {stages.map((item, index) => <button key={item.name} type="button" aria-pressed={active === index} aria-controls="p01-stage-detail" onClick={() => setActive(index)} className={`min-h-20 rounded-2xl border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300 ${active === index ? "border-cedar-300 bg-cedar-300 text-bark-950" : "border-cream-50/15 bg-bark-800 text-cream-50 hover:border-cedar-300/60"}`}>
              <span className={`block text-xs font-bold uppercase tracking-[0.13em] ${active === index ? "text-bark-700" : "text-cedar-300"}`}>{item.tag}</span>
              <span className="mt-2 block font-display text-base leading-snug">{item.name}</span>
              <span aria-hidden="true" className="mt-2 block text-xs">{active === index ? "● Сейчас" : "→ Открыть"}</span>
            </button>)}
          </div>
          <div id="p01-stage-detail" aria-live="polite" aria-atomic="true" className="border-t border-cream-50/15 p-4 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cedar-300">Этап {active + 1} из {stages.length}</p>
            <h4 className="mt-2 font-display text-2xl">{stage.name}</h4>
            <div className="mt-5 rounded-2xl border border-cedar-300/40 bg-bark-800 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cedar-300">Общее для двух способов</p>
              <p className="mt-2 text-sm leading-relaxed text-cream-100 sm:text-base">{stage.shared}</p>
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-cedar-300">Чем отличаются способы</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <DifferenceColumn method="machine" text={stage.machine} />
              <DifferenceColumn method="hand" text={stage.hand} />
            </div>
            <div className="mt-4 rounded-2xl border border-cream-50/15 p-5 text-sm leading-relaxed text-cream-100"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-cedar-300">Спросите подрядчика</span>{stage.check}</div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-cream-50/15 px-5 py-5 sm:px-8">
            <p className="max-w-xl text-xs leading-relaxed text-cream-200">Схема не задаёт сроки: качество, уход и готовность определяют по конкретной смеси и требованиям отделки.</p>
            <a href="#p01-estimate-title" className="inline-flex min-h-11 items-center rounded-full bg-cedar-300 px-5 py-3 text-sm font-semibold text-bark-950 hover:bg-cedar-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream-50">Перейти к проверке сметы ↓</a>
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-bark-950/10 bg-white p-5 shadow-sm sm:p-8" aria-labelledby="p01-estimate-title">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cedar-700">02 / Проверка состава</p>
          <h3 id="p01-estimate-title" className="mt-2 scroll-mt-28 font-display text-2xl sm:text-3xl">Одна смета или две — начните с того, что есть</h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-bark-700">Не нужно собирать два предложения заранее. Отметьте известное из своей сметы, а если сравниваете подрядчиков — переключитесь на две. Неизвестные условия остаются «Надо уточнить».</p>
          <fieldset className="mt-7 rounded-2xl border border-bark-950/10 bg-cream-50 p-4 sm:p-5">
            <legend className="px-2 font-display text-lg">Сколько смет проверяем?</legend>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {([{ value: "single", title: "Одна смета", detail: "Проверить состав механизированной штукатурки" }, { value: "compare", title: "Две сметы", detail: "Сопоставить механизированный и ручной способы" }] as const).map((option) => <label key={option.value} className={`flex min-h-20 cursor-pointer items-start gap-3 rounded-xl border p-4 focus-within:ring-2 focus-within:ring-cedar-600 ${mode === option.value ? "border-cedar-600 bg-white" : "border-bark-950/15 bg-cream-50"}`}>
                <input type="radio" name="p01-offer-mode" checked={mode === option.value} onChange={() => { setMode(option.value); setIsExample(false); }} className="mt-1 h-5 w-5 shrink-0 accent-cedar-600" />
                <span><strong className="block font-display text-base">{option.title}</strong><span className="mt-1 block text-xs leading-relaxed text-bark-600">{option.detail}</span></span>
              </label>)}
            </div>
          </fieldset>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={showExample} className="min-h-11 rounded-full border border-cedar-700 px-5 py-2 text-sm font-semibold text-cedar-800 hover:bg-cream-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-600">{isExample ? "Скрыть условный пример" : "Показать условный пример"}</button>
            <button type="button" onClick={reset} className="min-h-11 rounded-full border border-bark-950/20 px-5 py-2 text-sm font-semibold text-bark-900 hover:border-cedar-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-600">Сбросить и начать заново</button>
          </div>
          {isExample && <aside role="note" aria-label="Условный пример смет" className="mt-4 rounded-xl border border-cedar-700 bg-cream-100 p-4 text-sm text-bark-900">
            <p className="font-semibold">Условный пример — НЕ реальные сметы и НЕ предложение «Силы Леса» или другого подрядчика. Он не заполняет ваши поля и не изменяет ваши ответы.</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
              <li>Подготовка включена в обеих сметах.</li>
              <li>Доставка оплачивается отдельно в обеих сметах.</li>
              <li>Оборудование отдельно при механизации, но включено при ручном способе.</li>
              <li>Остальные пять позиций включены в обеих сметах; три общих условия условно согласованы.</li>
            </ul>
            <p className="mt-3 leading-relaxed">В этом примере понятны {exampleSummary.clarified} из {estimateItems.length} позиций, но {exampleSummary.separate.length} позиции с доплатами требуют реальных сумм. Разница в включении также устраняется приведением полной цены к одному составу. Это не расчёт цены.</p>
          </aside>}

          <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cedar-700">Ваш прогресс</p>
              <h4 className="mt-1 font-display text-xl">Уточнено {summary.clarified} из {estimateItems.length} позиций</h4>
              <p className="mt-1 text-xs text-bark-600">{mode === "single" ? "Считаются ответы по одной смете." : "Позиция засчитывается, когда ответ известен в обеих сметах."}</p>
            </div>
            <p className="text-sm text-bark-700">Показано {visibleCount} из {estimateItems.length}</p>
          </div>
          <div role="progressbar" aria-label="Уточнённые позиции смет" aria-valuenow={summary.clarified} aria-valuemin={0} aria-valuemax={estimateItems.length} className="mt-3 h-2 overflow-hidden rounded-full bg-cream-200"><div className="h-full rounded-full bg-cedar-600 transition-[width]" style={{ width: `${summary.clarified / estimateItems.length * 100}%` }} /></div>
          <div className="mt-5 grid gap-3">
            {estimateItems.slice(0, visibleCount).map((item, index) => {
              const pair = offers[item.id];
              const unknown = pair.machine === "unknown" || (mode === "compare" && pair.hand === "unknown");
              const separate = pair.machine === "separate" || (mode === "compare" && pair.hand === "separate");
              const different = mode === "compare" && pair.machine !== pair.hand;
              const badge = unknown ? "Надо уточнить" : separate ? "Состав известен · есть доплата" : different ? "Разные условия · сверьте суммы" : "Состав известен";
              return <fieldset key={item.id} className="rounded-2xl border border-bark-950/10 bg-cream-50 p-4 sm:p-5">
                <legend className="sr-only">{item.name}</legend>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="max-w-2xl"><h4 className="font-display text-base sm:text-lg"><span className="mr-2 text-xs text-cedar-700">{String(index + 1).padStart(2, "0")}</span>{item.name}</h4><p className="mt-1 text-xs leading-relaxed text-bark-600">{item.hint}</p></div>
                  <span className="rounded-full border border-bark-950/15 bg-white px-3 py-1 text-xs font-semibold text-bark-700">{badge}</span>
                </div>
                <div className={`mt-4 grid gap-3 ${mode === "compare" ? "md:grid-cols-2" : ""}`}>
                  {(["machine", ...(mode === "compare" ? ["hand"] as const : [])] as Method[]).map((method) => <label key={method} className="block text-xs font-semibold text-bark-700">{method === "machine" ? "Механизированная" : "Ручная"}
                    <select aria-label={`${item.name}: ${method === "machine" ? "механизированное" : "ручное"} предложение`} value={pair[method]} onChange={(event) => updateScope(item.id, method, event.target.value as Scope)} className="mt-2 min-h-12 w-full rounded-xl border border-bark-950/20 bg-white px-3 py-3 text-sm text-bark-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-600">
                      {scopeLabels.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>)}
                </div>
              </fieldset>;
            })}
          </div>
          {visibleCount < estimateItems.length && <button type="button" onClick={() => setVisibleCount((count) => Math.min(count + 3, estimateItems.length))} className="mt-5 min-h-11 w-full rounded-full border border-cedar-700 px-5 py-3 text-sm font-semibold text-cedar-800 hover:bg-cream-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-600">Показать следующие позиции ({estimateItems.length - visibleCount} осталось) ↓</button>}

          {mode === "compare" && <details className="mt-7 rounded-2xl border border-bark-950/15 bg-cream-50 p-4 sm:p-5">
            <summary className="min-h-11 cursor-pointer font-display text-base font-semibold">Перед сравнением сумм: проверьте общие условия ({baselineLabels.length - summary.baselineMissing} из {baselineLabels.length})</summary>
            <p className="mt-3 text-sm text-bark-600">Эти условия нужны для сравнения двух сумм; отсутствие отметки не обнуляет уже выясненные позиции.</p>
            <div className="mt-4 grid gap-3">
              {baselineLabels.map((label, index) => <label key={label} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-bark-950/10 bg-white p-3 text-sm leading-snug focus-within:ring-2 focus-within:ring-cedar-600">
                <input type="checkbox" checked={baseline[index]} onChange={(event) => { setIsExample(false); setBaseline((previous) => previous.map((checked, i) => i === index ? event.target.checked : checked)); }} className="h-5 w-5 shrink-0 accent-cedar-600" />{label}
              </label>)}
            </div>
          </details>}

          <div role="status" aria-live="polite" aria-atomic="true" className="mt-7 rounded-2xl bg-bark-900 p-5 text-cream-50 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cedar-300">Промежуточный итог · не калькулятор стоимости</p>
            <h4 className="mt-2 font-display text-xl sm:text-2xl">{title}</h4>
            <p className="mt-3 text-sm leading-relaxed text-cream-100">{summary.clarified} из {estimateItems.length} позиций понятны. {summary.compositionReady ? "Состав проверен; суммы и условия оплаты нужно получить из реальных предложений." : "Можно продолжить с неизвестных пунктов — даже частичная проверка показывает, что спросить подрядчика."}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-cream-100">
              {summary.unresolved.length > 0 && <li>Надо уточнить: {summary.unresolved.map((item) => item.name).join("; ")}.</li>}
              {summary.baselineMissing > 0 && <li>Сверьте ещё {summary.baselineMissing} из {baselineLabels.length} общих условий перед сравнением итоговых сумм.</li>}
              {summary.separate.length > 0 && <li>Отдельная оплата: {summary.separate.map((item) => item.name).join("; ")}. Включите реальные суммы доплат в полную цену; без них стоимость неизвестна.</li>}
              {summary.different.length > 0 && <li>Разные условия включения: {summary.different.map((item) => item.name).join("; ")}. Это можно сравнить после приведения полной стоимости к одному составу.</li>}
              {summary.compositionReady && summary.separate.length === 0 && <li>{mode === "compare" ? "Запросите две итоговые суммы за одинаковый состав, включая возможные изменения объёма." : "Запросите полную стоимость и порядок оформления дополнительных работ."}</li>}
            </ul>
            <div className="mt-6 border-t border-cream-50/15 pt-5">
              <p className="max-w-2xl text-sm leading-relaxed text-cream-100">Пришлите площадь и фотографии стен — обсудим расчёт механизированной штукатурки и неизвестные позиции вашей сметы.</p>
              <LinkButton to={whatsappUrl(contactText)} external className="mt-4" onClick={() => track("cta_click", { type: "whatsapp", where: "p01-estimate", mode, slug: "guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka" })}>Обсудить расчёт в WhatsApp <ArrowIcon /></LinkButton>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-cream-200">Вводите отметки по документам. «Сила Леса» предлагает механизированную штукатурку; ручная здесь только для сравнения. Проверка не заменяет смету, осмотр и инструкцию смеси.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
