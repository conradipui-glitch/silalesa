import { useState } from "react";

type Route = "wet-first" | "screed-ready" | "dry-lining";
type Step = {
  id: string;
  tag: string;
  title: string;
  summary: string;
  checks: string[];
  handoff: string;
};

const scenarios: { value: Route; number: string; title: string; description: string; chain: string }[] = [
  { value: "wet-first", number: "01", title: "Мокрая штукатурка ещё впереди", description: "Типовой порядок для оштукатуривания стен и, при необходимости, потолка.", chain: "Штукатурка → основание → стяжка" },
  { value: "screed-ready", number: "02", title: "Стяжка уже сделана", description: "Проверяем допуск и защиту пола, прежде чем заводить штукатуров.", chain: "Проверка → защита пола → штукатурка" },
  { value: "dry-lining", number: "03", title: "Вместо штукатурки — ГКЛ", description: "Отдельный маршрут для сухих облицовок, если его допускает выбранная система.", chain: "Основание пола → стяжка → ГКЛ" },
];

function makeSteps(route: Route, ceiling: boolean, heated: boolean, wetZone: boolean): Step[] {
  const commonFloorChecks = [
    "Уточнить отметку чистого пола, проёмы, состав слоёв и примыкания.",
    "Согласовать допустимую нагрузку и конструкцию по проекту.",
    ...(wetZone ? ["Согласовать гидроизоляцию, уклоны и примыкания влажной зоны: стяжка не заменяет защиту от воды."] : []),
  ];
  const finish: Step = {
    id: "finish", tag: "Финиш", title: "Передать основание под отделку", summary: "Следующие покрытия и чистовые операции планируют по критериям готовности конкретных материалов, а не по фиксированному числу дней.",
    checks: ["Проверить ровность, состояние и предусмотренную прочность основания.", "Сверить остаточную влажность и требования будущего покрытия.", "Согласовать допуск следующей бригады и защиту уже готовых поверхностей."],
    handoff: "Следующий этап разрешён только после проверки требований выбранной системы.",
  };
  if (route === "wet-first") return [
    { id: "scope", tag: "До начала", title: "Свести проект и отметки", summary: "Сначала обе бригады должны понимать конечную высоту пола, проёмы, трассы и границы отделки стен.", checks: ["Зафиксировать отметку чистого пола и состав слоёв.", "Согласовать трассы коммуникаций, перегородки и порядок доступа.", ...commonFloorChecks], handoff: "Обе бригады подтвердили общий план и границы работ." },
    { id: "plaster", tag: "Мокрые работы", title: ceiling ? "Оштукатурить потолок, затем стены" : "Оштукатурить стены", summary: "При мокрой технологии обычно сначала выполняют штукатурные работы, чтобы не загрязнить свежую стяжку раствором и оборудованием.", checks: [ceiling ? "Уточнить, что потолок входит в состав штукатурных работ." : "Убедиться, что потолок не требует отдельного мокрого этапа.", "Проверить подготовку основания и инструкции выбранной смеси.", "Согласовать нижнюю границу штукатурки относительно будущего пола."], handoff: "Возможность следующего этапа подтверждена по инструкции штукатурной смеси и состоянию стен." },
    { id: "floorprep", tag: "Подготовка пола", title: "Открыть и подготовить основание", summary: "После штукатурки проверить основание пола и выполнить предусмотренные проектом работы до закрытия его стяжкой.", checks: [...commonFloorChecks, "Проверить основание, швы и необходимые разделительные или изоляционные слои.", heated ? "До закрытия системы тёплого пола получить проверку и испытания у профильного специалиста." : "Проверить трассы и коммуникации, которые будут закрыты конструкцией пола."], handoff: "Основание, скрытые работы и система пола согласованы до устройства стяжки." },
    { id: "screed", tag: "Пол", title: "Устроить стяжку", summary: "Технологию, состав смеси, швы, укладку и выравнивание выбирают по проекту и техническим документам.", checks: ["Уточнить технологию стяжки и состав полной сметы.", "Сверить конструкцию, примыкания и отметки чистого пола.", "Зафиксировать контроль качества и предусмотренный уход."], handoff: "Стяжка принята по согласованным критериям; уход организован." },
    { id: "care", tag: "Передача", title: "Защитить результат и дождаться допуска", summary: "После устройства стяжки ограничить воздействие следующих работ и соблюдать режим ухода, предусмотренный материалом.", checks: ["Получить правила ухода и допустимых нагрузок от исполнителя.", "Согласовать защиту пола от следующих бригад.", "Не путать разрешение ходить с готовностью укладывать покрытие."], handoff: "Допуск следующего этапа подтверждён, а не назначен по календарю." },
    finish,
  ];
  if (route === "screed-ready") return [
    { id: "scope", tag: "Проверка", title: "Проверить готовую стяжку", summary: "Штукатурные работы после пола возможны не всегда: сначала выяснить, допустимы ли ходьба, нагрузки и воздействие влаги.", checks: ["Получить данные о материале, уходе и допустимых нагрузках.", "Зафиксировать состояние поверхности до прихода бригады.", heated ? "Уточнить состояние и протоколы проверки уже закрытой системы тёплого пола." : "Проверить скрытые коммуникации и ограничения по креплению оборудования.", ...commonFloorChecks], handoff: "Производитель системы и ответственный специалист допускают следующие работы." },
    { id: "protection", tag: "Защита", title: "Согласовать защиту пола", summary: "Продумать укрытие от раствора, воды, ударов, оборудования и последующей очистки — одна плёнка не гарантирует защиту.", checks: ["Выбрать укрытие, совместимое с состоянием стяжки.", "Обозначить маршруты перемещения и места оборудования.", "Зафиксировать ответственность за повреждения и уборку."], handoff: "Укрытие, доступ и ответственность согласованы до начала штукатурки." },
    { id: "plaster", tag: "Мокрые работы", title: ceiling ? "Оштукатурить потолок и стены" : "Оштукатурить стены", summary: "Порядок и оборудование выбирают так, чтобы не повредить уже готовое основание пола.", checks: ["Соблюдать инструкцию штукатурной системы.", ceiling ? "Согласовать потолочные работы и их защитные меры." : "Уточнить, что потолок не входит в мокрые работы.", "Не допускать бесконтрольного увлажнения и ударных нагрузок на пол."], handoff: "Штукатурка принята; защиту пола снимают и очищают по согласованной технологии." },
    { id: "inspection", tag: "Контроль", title: "Осмотреть стяжку после работ", summary: "Проверить, не появились ли повреждения и загрязнения, прежде чем переходить к финишной отделке.", checks: ["Осмотреть поверхность и места установки оборудования.", "Проверить чистоту, состояние и допустимость дальнейших работ.", wetZone ? "Проверить сохранность гидроизоляции и примыканий, если они уже выполнены." : "Зафиксировать устранение повреждений, если они обнаружены."], handoff: "Результат осмотра согласован с ответственными исполнителями." },
    finish,
  ];
  return [
    { id: "scope", tag: "Проект", title: "Сверить систему ГКЛ и конструкцию пола", summary: "Сухую облицовку нельзя автоматически приравнивать к мокрой штукатурке: порядок определяется конкретной системой и проектом.", checks: ["Проверить документацию облицовки и условия её монтажа.", ...commonFloorChecks, "Согласовать проёмы, коммуникации и положение направляющих."], handoff: "Проект и производитель системы допускают выбранную очередность." },
    { id: "floorprep", tag: "Основание", title: "Подготовить пол и скрытые работы", summary: "До закрытия пола согласовать инженерные трассы, изоляцию и требования к основанию.", checks: ["Проверить коммуникации и основание пола.", heated ? "Обеспечить предусмотренные испытания тёплого пола до закрытия системы." : "Уточнить, есть ли скрытые работы, которые стяжка закроет.", ...commonFloorChecks], handoff: "Скрытые работы проверены; конструкция пола согласована." },
    { id: "screed", tag: "Пол", title: "Выполнить стяжку по системе", summary: "В некоторых системных схемах облицовка ГКЛ следует после стяжки; это не универсальное правило для всех перегородок.", checks: ["Соблюдать выбранную технологию стяжки.", "Согласовать швы, примыкания, уход и передачу основания.", "Не переносить сроки и параметры с другой смеси."], handoff: "Подтверждён допуск к монтажу следующей системы." },
    { id: "lining", tag: "Сухая облицовка", title: "Смонтировать ГКЛ по техкарте", summary: "Монтаж, крепление, защита нижних кромок и влажных зон — по документации конкретной конструкции.", checks: ["Проверить совместимость крепежа и последовательность монтажа.", "Защитить готовое основание при работе.", wetZone ? "Согласовать влагостойкую систему и отдельную гидроизоляцию там, где она нужна." : "Сверить требования к влажности и последующей отделке."], handoff: "Облицовка принята; пол и примыкания не повреждены." },
    finish,
  ];
}

function StepDetail({ step, number, total }: { step: Step; number: number; total: number }) {
  return (
    <div className="rounded-2xl border border-cedar-300/30 bg-bark-800 p-5 text-cream-50 sm:p-7">
      <span className="text-xs font-semibold uppercase tracking-[0.17em] text-cedar-300">Этап {number} из {total} · {step.tag}</span>
      <h4 className="mt-3 font-display text-xl leading-snug sm:text-2xl">{step.title}</h4>
      <p className="mt-3 text-sm leading-relaxed text-cream-200">{step.summary}</p>
      <h5 className="mt-6 text-sm font-semibold text-cedar-300">Проверить перед передачей</h5>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-cream-100">
        {step.checks.map((check) => <li key={check} className="flex gap-3"><span aria-hidden="true" className="mt-1 text-cedar-300">✓</span><span>{check}</span></li>)}
      </ul>
      <p className="mt-6 rounded-xl border border-cream-50/15 bg-bark-900 p-4 text-sm leading-relaxed text-cream-100"><span className="mb-1 block text-xs font-bold uppercase tracking-widest text-cedar-300">Условие перехода</span>{step.handoff}</p>
    </div>
  );
}

export function RenovationSequenceGuide() {
  const [route, setRoute] = useState<Route>("wet-first");
  const [ceiling, setCeiling] = useState(true);
  const [heated, setHeated] = useState(false);
  const [wetZone, setWetZone] = useState(false);
  const [active, setActive] = useState("scope");
  const steps = makeSteps(route, ceiling, heated, wetZone);
  const selectedIndex = Math.max(0, steps.findIndex((step) => step.id === active));
  const selected = steps[selectedIndex];
  const scenario = scenarios.find((item) => item.value === route) ?? scenarios[0];

  return (
    <section aria-labelledby="s04-map-title" className="bg-cream-100 py-16 text-bark-950 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cedar-700">Интерактивная схема · порядок ремонта</p>
        <h2 id="s04-map-title" className="mt-3 max-w-4xl font-display text-3xl font-semibold leading-tight sm:text-4xl">В каком порядке пойдут работы на вашем объекте?</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-bark-700">Выберите исходную ситуацию и откройте этапы маршрута. Схема показывает последовательность решений и точки передачи работ, а не универсальную технологическую карту.</p>

        <fieldset className="mt-8">
          <legend className="font-display text-xl sm:text-2xl">01 / Что уже известно об объекте?</legend>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {scenarios.map((item) => (
              <button key={item.value} type="button" aria-pressed={route === item.value} onClick={() => { setRoute(item.value); setActive("scope"); }} className={`min-h-36 rounded-2xl border p-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-600 ${route === item.value ? "border-cedar-600 bg-bark-900 text-cream-50 shadow-card" : "border-bark-950/15 bg-white text-bark-950 hover:border-cedar-600"}`}>
                <span className={`text-xs font-bold uppercase tracking-[0.2em] ${route === item.value ? "text-cedar-300" : "text-cedar-700"}`}>Сценарий {item.number}</span>
                <span className="mt-2 block font-display text-lg leading-snug">{item.title}</span>
                <span className={`mt-2 block text-sm leading-relaxed ${route === item.value ? "text-cream-200" : "text-bark-600"}`}>{item.description}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-8 rounded-3xl border border-bark-950/10 bg-white p-5 sm:p-7">
          <legend className="px-2 font-display text-xl sm:text-2xl">02 / Уточните условия</legend>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-bark-950/10 bg-cream-50 p-4 text-sm leading-snug text-bark-900 focus-within:ring-2 focus-within:ring-cedar-600"><input type="checkbox" checked={ceiling} onChange={(event) => setCeiling(event.target.checked)} className="h-5 w-5 shrink-0 accent-cedar-600" /><span>Нужна мокрая штукатурка потолка</span></label>
            <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-bark-950/10 bg-cream-50 p-4 text-sm leading-snug text-bark-900 focus-within:ring-2 focus-within:ring-cedar-600"><input type="checkbox" checked={heated} onChange={(event) => setHeated(event.target.checked)} className="h-5 w-5 shrink-0 accent-cedar-600" /><span>В конструкции есть тёплый пол</span></label>
            <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-bark-950/10 bg-cream-50 p-4 text-sm leading-snug text-bark-900 focus-within:ring-2 focus-within:ring-cedar-600"><input type="checkbox" checked={wetZone} onChange={(event) => setWetZone(event.target.checked)} className="h-5 w-5 shrink-0 accent-cedar-600" /><span>Есть санузел или мокрая зона</span></label>
          </div>
          {route === "dry-lining" && <p className="mt-4 text-xs leading-relaxed text-bark-600">ГКЛ — отдельная сухая технология; переключатель потолка относится только к мокрой штукатурке и в этом маршруте не влияет на очередность.</p>}
        </fieldset>

        <div className="mt-10 overflow-hidden rounded-3xl border border-bark-950/10 bg-bark-900 text-cream-50 shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-cream-50/15 p-5 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cedar-300">03 / Ваша карта работ</p>
              <h3 className="mt-2 max-w-2xl font-display text-2xl sm:text-3xl">{scenario.chain}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cream-200">Нажмите на этап: справа или прямо под ним откроются проверки и условие перехода к следующему.</p>
            </div>
            <span className="rounded-full border border-cedar-300/40 bg-bark-800 px-4 py-2 text-xs font-semibold text-cedar-300">{steps.length} этапов · без сроков</span>
          </div>
          <div className="grid gap-7 p-4 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.94fr)] lg:gap-8">
            <ol className="relative space-y-3 border-l border-cedar-300/35 pl-4 sm:pl-6" aria-label="Интерактивная последовательность работ">
              {steps.map((step, index) => {
                const chosen = selected.id === step.id;
                return <li key={step.id} className="relative">
                  <span aria-hidden="true" className={`absolute -left-[25px] top-5 flex h-5 w-5 items-center justify-center rounded-full border-2 sm:-left-[33px] ${chosen ? "border-cedar-300 bg-cedar-300" : "border-cedar-300/60 bg-bark-900"}`} />
                  <button type="button" aria-pressed={chosen} aria-controls="s04-stage-detail" onClick={() => setActive(step.id)} className={`w-full rounded-2xl border p-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300 sm:p-5 ${chosen ? "border-cedar-300 bg-bark-800" : "border-cream-50/15 bg-bark-900 hover:border-cedar-300/60 hover:bg-bark-800"}`}>
                    <span className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-cedar-300"><span>{String(index + 1).padStart(2, "0")} / {step.tag}</span><span aria-hidden="true">{chosen ? "●" : "+"}</span></span>
                    <span className="mt-2 block font-display text-lg leading-snug sm:text-xl">{step.title}</span>
                    <span className="mt-2 block text-sm leading-relaxed text-cream-200">{step.summary}</span>
                  </button>
                  {chosen && <div className="mt-2 lg:hidden" aria-live="polite"><StepDetail step={selected} number={selectedIndex + 1} total={steps.length} /></div>}
                </li>;
              })}
            </ol>
            <div className="hidden lg:block" id="s04-stage-detail" aria-live="polite" aria-atomic="true"><div className="sticky top-28"><StepDetail step={selected} number={selectedIndex + 1} total={steps.length} /></div></div>
          </div>
          <div className="border-t border-cream-50/15 bg-bark-800 px-5 py-5 sm:px-8">
            <p className="text-sm leading-relaxed text-cream-200"><span className="font-semibold text-cedar-300">Важно:</span> вариант зависит от проекта и инструкций смесей, стяжки и облицовки. Тёплый пол испытывают профильные специалисты до закрытия, а готовность к покрытию проверяют отдельно. Наличие на сайте двух услуг не означает автоматически единый подряд «под ключ».</p>
          </div>
        </div>
      </div>
    </section>
  );
}
