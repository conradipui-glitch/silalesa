import { useState } from "react";

type Method = "machine" | "hand";
export type Scope = "unknown" | "included" | "separate";
export type OfferPair = { machine: Scope; hand: Scope };

const stages = [
  {
    name: "Основание", tag: "01 / подготовка",
    machine: "Мастера оценивают стены, защищают соседние поверхности и готовят основание под выбранную смесь. Станция не выполняет эту работу за них.",
    hand: "Мастера проверяют то же основание и выполняют подготовку. Способ последующего нанесения не отменяет требования к поверхности.",
    check: "Есть ли осмотр, защита, грунтование и решение по непрочным местам в обоих предложениях?",
  },
  {
    name: "Смесь и подача", tag: "02 / логистика",
    machine: "Совместимую смесь готовит и подаёт штукатурная станция. Требуются согласованные подключения, размещение оборудования и маршрут шланга.",
    hand: "Замес, перемещение и подачу раствора организуют без штукатурной станции. Конкретные инструменты и способ доставки уточняют у бригады.",
    check: "Одинаковы ли выбранная смесь, расчёт расхода, доставка и подъём материалов?",
  },
  {
    name: "Нанесение", tag: "03 / поверхность",
    machine: "Оборудование помогает подавать и наносить раствор. Углы, сложные участки и распределение слоя по-прежнему требуют работы мастеров.",
    hand: "Раствор наносят инструментом. Возможность ручного нанесения выбранного продукта нужно проверить по его технической документации.",
    check: "Согласованы ли основание, предполагаемый слой и перечень участков в обоих расчётах?",
  },
  {
    name: "Выравнивание", tag: "04 / геометрия",
    machine: "Мастера формируют плоскость, работают с маяками или ориентирами, углами и примыканиями по согласованной технологии.",
    hand: "Мастера выполняют аналогичный контроль геометрии и требуемую обработку поверхности. Метод подачи сам по себе не задаёт качество.",
    check: "Одинаковы ли требования к плоскости, углам и подготовке под будущую отделку?",
  },
  {
    name: "Приёмка", tag: "05 / передача",
    machine: "Проверяют согласованные критерии качества, предусмотренный уход и готовность к следующему этапу по инструкции материала.",
    hand: "Те же критерии: поверхность, состояние основания и требования следующей отделки. Универсальный срок готовности не назначают.",
    check: "Кто принимает результат, отвечает за уборку и подтверждает допуск следующей бригады?",
  },
] as const;

export const estimateItems = [
  { id: "preparation", name: "Подготовка и защита", hint: "Очистка основания, укрытие соседних поверхностей и демонтаж, если нужен." },
  { id: "primer", name: "Грунтование и специальные слои", hint: "Только по требованиям выбранной смеси и состоянию основания." },
  { id: "geometry", name: "Маяки, углы и примыкания", hint: "Плоскость, откосы и сложные участки — с отдельным объёмом, если требуется." },
  { id: "mix", name: "Смесь и расчёт расхода", hint: "Марка, разрешённый способ нанесения и поправки при перепадах." },
  { id: "delivery", name: "Доставка и подъём материалов", hint: "Подача на этаж, разгрузка и маршруты доступа." },
  { id: "equipment", name: "Оборудование и подключения", hint: "Для станции — размещение, вода и питание; для ручного способа — фактические инструменты и логистика." },
  { id: "finish", name: "Выравнивание и обработка", hint: "Подрезка, затирка и требуемая готовность под плитку, обои или окраску." },
  { id: "handoff", name: "Уборка, уход и приёмка", hint: "Защита, критерии результата и ответственность до передачи следующей бригаде." },
] as const;

const initialOffers = (): Record<string, OfferPair> =>
  Object.fromEntries(estimateItems.map((item) => [item.id, { machine: "unknown", hand: "unknown" }])) as Record<string, OfferPair>;

export function summarizeOffers(offers: Record<string, OfferPair>, baseline: readonly boolean[]) {
  const unresolved = estimateItems.filter((item) => offers[item.id]?.machine === "unknown" || offers[item.id]?.hand === "unknown" || !offers[item.id]);
  const different = estimateItems.filter((item) => offers[item.id] && offers[item.id].machine !== "unknown" && offers[item.id].hand !== "unknown" && offers[item.id].machine !== offers[item.id].hand);
  const separate = estimateItems.filter((item) => offers[item.id]?.machine === "separate" || offers[item.id]?.hand === "separate");
  const clarified = estimateItems.length - unresolved.length;
  const ready = baseline.every(Boolean) && unresolved.length === 0 && different.length === 0 && separate.length === 0;
  return { unresolved, different, separate, clarified, ready, baselineMissing: baseline.filter((item) => !item).length };
}

const baselineLabels = [
  "Одинаковая измеренная площадь стен, потолков и откосов",
  "Проверены перепады, предполагаемый слой и совместимость смеси",
  "Согласованы требования к поверхности под дальнейшую отделку",
] as const;
const scopeLabels: { value: Scope; label: string }[] = [
  { value: "unknown", label: "Не указано в смете" },
  { value: "included", label: "Включено в цену" },
  { value: "separate", label: "Отдельно / доплата" },
];

function MethodColumn({ method, text }: { method: Method; text: string }) {
  return (
    <div className={`rounded-2xl border p-5 sm:p-6 ${method === "machine" ? "border-cedar-300/30 bg-bark-800" : "border-cream-50/15 bg-bark-950"}`}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cedar-300">{method === "machine" ? "01 / Станция" : "02 / Ручной способ"}</p>
      <h4 className="mt-2 font-display text-xl text-cream-50">{method === "machine" ? "Механизированная" : "Ручная"}</h4>
      <p className="mt-3 text-sm leading-relaxed text-cream-200">{text}</p>
    </div>
  );
}

export function PlasterProcessGuide() {
  const [active, setActive] = useState(0);
  const [baseline, setBaseline] = useState<boolean[]>([false, false, false]);
  const [offers, setOffers] = useState(initialOffers);
  const stage = stages[active];
  const summary = summarizeOffers(offers, baseline);
  const updateScope = (id: string, method: Method, value: Scope) => setOffers((previous) => ({
    ...previous,
    [id]: { ...previous[id], [method]: value },
  }));

  return (
    <section aria-labelledby="p01-visual-title" className="bg-cream-100 py-16 text-bark-950 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cedar-700">Визуальный гайд · штукатурка</p>
        <h2 id="p01-visual-title" className="mt-3 max-w-4xl font-display text-3xl font-semibold leading-tight sm:text-4xl">Две технологии. Пять этапов. Одна задача.</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-bark-700">Переключайте этапы и сравнивайте, что меняется при нанесении, а что остаётся ответственностью мастеров. Затем проверьте состав двух реальных смет — без придуманных цен и обещаний скорости.</p>

        <div className="mt-9 overflow-hidden rounded-3xl bg-bark-900 text-cream-50 shadow-card">
          <div className="border-b border-cream-50/15 px-5 py-6 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cedar-300">01 / Карта процесса</p>
            <h3 className="mt-2 font-display text-2xl sm:text-3xl">Где станция помогает, а где нужен мастер?</h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-cream-200">Выберите один из пяти этапов. Оба маршрута синхронно покажут разницу, а снизу появится вопрос для проверки предложения.</p>
          </div>
          <div className="grid gap-2 p-4 sm:grid-cols-2 sm:gap-3 sm:p-6 lg:grid-cols-5" role="group" aria-label="Этапы сравнения технологий">
            {stages.map((item, index) => <button key={item.name} type="button" aria-pressed={active === index} aria-controls="p01-stage-detail" onClick={() => setActive(index)} className={`min-h-24 rounded-2xl border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300 ${active === index ? "border-cedar-300 bg-cedar-300 text-bark-950" : "border-cream-50/15 bg-bark-800 text-cream-50 hover:border-cedar-300/60"}`}>
              <span className={`block text-xs font-bold uppercase tracking-[0.13em] ${active === index ? "text-bark-700" : "text-cedar-300"}`}>{item.tag}</span>
              <span className="mt-2 block font-display text-base leading-snug">{item.name}</span>
              <span aria-hidden="true" className="mt-3 block text-xs">{active === index ? "● Сейчас" : "→ Открыть"}</span>
            </button>)}
          </div>
          <div id="p01-stage-detail" aria-live="polite" aria-atomic="true" className="border-t border-cream-50/15 p-4 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cedar-300">Этап {active + 1} из {stages.length}</p>
            <h4 className="mt-2 font-display text-2xl">{stage.name}</h4>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <MethodColumn method="machine" text={stage.machine} />
              <MethodColumn method="hand" text={stage.hand} />
            </div>
            <div className="mt-4 rounded-2xl border border-cedar-300/30 bg-bark-800 p-5 text-sm leading-relaxed text-cream-100"><span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-cedar-300">Контрольная точка / вопрос подрядчику</span>{stage.check}</div>
          </div>
          <p className="border-t border-cream-50/15 px-5 py-5 text-xs leading-relaxed text-cream-200 sm:px-8">Это условная схема операций, не хронометраж. Качество и готовность поверхности проверяют по конкретной смеси и согласованным требованиям, а не по наличию станции.</p>
        </div>

        <div className="mt-12 rounded-3xl border border-bark-950/10 bg-white p-5 shadow-sm sm:p-8" aria-labelledby="p01-estimate-title">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cedar-700">02 / Сопоставимые сметы</p>
          <h3 id="p01-estimate-title" className="mt-2 font-display text-2xl sm:text-3xl">Две сметы: что действительно включено?</h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-bark-700">Откройте реальные предложения и отмечайте пункты. Исходно все ответы неизвестны — мы не выдаём демонстрационные отметки за условия «Силы Леса» или других подрядчиков.</p>
          <fieldset className="mt-7 rounded-2xl border border-bark-950/10 bg-cream-50 p-4 sm:p-6">
            <legend className="px-2 font-display text-lg">Сначала уравняйте исходные данные</legend>
            <div className="mt-2 grid gap-3">
              {baselineLabels.map((label, index) => <label key={label} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-bark-950/10 bg-white p-3 text-sm leading-snug focus-within:ring-2 focus-within:ring-cedar-600">
                <input type="checkbox" checked={baseline[index]} onChange={(event) => setBaseline((previous) => previous.map((checked, i) => i === index ? event.target.checked : checked))} className="h-5 w-5 shrink-0 accent-cedar-600" />{label}
              </label>)}
            </div>
          </fieldset>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cedar-700">Состав предложений</p>
              <h4 className="mt-1 font-display text-xl">Уточнено {summary.clarified} из {estimateItems.length} пунктов</h4>
            </div>
            <button type="button" onClick={() => { setBaseline([false, false, false]); setOffers(initialOffers()); }} className="min-h-11 rounded-full border border-bark-950/20 px-5 py-2 text-sm font-semibold text-bark-900 hover:border-cedar-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-600">Сбросить отметки</button>
          </div>
          <div role="progressbar" aria-label="Пункты, уточнённые в обоих предложениях" aria-valuenow={summary.clarified} aria-valuemin={0} aria-valuemax={estimateItems.length} className="mt-3 h-2 overflow-hidden rounded-full bg-cream-200"><div className="h-full rounded-full bg-cedar-600 transition-[width]" style={{ width: `${summary.clarified / estimateItems.length * 100}%` }} /></div>
          <div className="mt-5 grid gap-3">
            {estimateItems.map((item, index) => {
              const pair = offers[item.id];
              const badge = pair.machine === "unknown" || pair.hand === "unknown" ? "Требует уточнения" : pair.machine !== pair.hand ? "Разный состав" : pair.machine === "separate" ? "Оба отдельно: уточнить доплаты" : "Включено в обоих";
              return <fieldset key={item.id} className="rounded-2xl border border-bark-950/10 bg-cream-50 p-4 sm:p-5">
                <legend className="sr-only">{item.name}</legend>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="max-w-2xl"><h5 className="font-display text-base sm:text-lg"><span className="mr-2 text-xs text-cedar-700">{String(index + 1).padStart(2, "0")}</span>{item.name}</h5><p className="mt-1 text-xs leading-relaxed text-bark-600">{item.hint}</p></div>
                  <span className="rounded-full border border-bark-950/15 bg-white px-3 py-1 text-xs font-semibold text-bark-700">{badge}</span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {(["machine", "hand"] as const).map((method) => <label key={method} className="block text-xs font-semibold text-bark-700">{method === "machine" ? "Механизированная" : "Ручная"}
                    <select aria-label={`${item.name}: ${method === "machine" ? "механизированное" : "ручное"} предложение`} value={pair[method]} onChange={(event) => updateScope(item.id, method, event.target.value as Scope)} className="mt-2 min-h-12 w-full rounded-xl border border-bark-950/20 bg-white px-3 py-3 text-sm text-bark-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-600">
                      {scopeLabels.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>)}
                </div>
              </fieldset>;
            })}
          </div>
          <div role="status" aria-live="polite" aria-atomic="true" className="mt-7 rounded-2xl bg-bark-900 p-5 text-cream-50 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cedar-300">Итог проверки состава · не расчёт цены</p>
            <h4 className="mt-2 font-display text-xl sm:text-2xl">{summary.ready ? "Состав предложений сопоставим" : "Сравнение стоимости пока требует уточнений"}</h4>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-cream-100">
              {summary.baselineMissing > 0 && <li>Не подтверждены {summary.baselineMissing} из {baselineLabels.length} общих исходных условий.</li>}
              {summary.unresolved.length > 0 && <li>Не указаны позиции в одном или обоих предложениях: {summary.unresolved.map((item) => item.name).join("; ")}.</li>}
              {summary.different.length > 0 && <li>Разный состав предложений — сопоставьте и согласуйте: {summary.different.map((item) => item.name).join("; ")}.</li>}
              {summary.separate.length > 0 && <li>Уточните стоимость отдельно оплачиваемых работ: {summary.separate.map((item) => item.name).join("; ")}.</li>}
              {summary.ready && <li>Теперь запросите полные итоговые суммы и условия изменений объёма; одинаковый состав не означает одинаковую цену или качество.</li>}
            </ul>
            <p className="mt-5 border-t border-cream-50/15 pt-4 text-xs leading-relaxed text-cream-200">Отметки вводите только по документам. «Сила Леса» заявляет механизированную штукатурку; ручная приведена как альтернативный способ для сравнения, не как отдельная услуга компании. Калькулятор не подменяет смету, осмотр и требования материала.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
