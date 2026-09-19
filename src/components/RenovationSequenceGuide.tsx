import { useState } from "react";
import { RepairGuideAction } from "./RepairGuideAction";
import { renovationSteps, type Route, type Stage } from "../lib/repairGuideDecisions";

const scenarios: { value: Route; title: string; description: string; chain: string }[] = [
  { value: "wet-first", title: "Штукатурка ещё впереди", description: "Обычный маршрут мокрой штукатурки стен и, если нужно, потолка.", chain: "Согласовать отметки → штукатурка → подготовка пола → стяжка" },
  { value: "screed-ready", title: "Стяжка уже готова", description: "Сначала допуск и защита пола от раствора, воды и оборудования.", chain: "Проверить пол → защитить → штукатурить → осмотреть" },
  { value: "dry-lining", title: "Вместо штукатурки — ГКЛ", description: "Порядок зависит от системы сухой облицовки и проекта.", chain: "Проверить проект → подготовить пол → стяжка → ГКЛ, если допускает система" },
];

function Detail({ stage, number, total }: { stage: Stage; number: number; total: number }) {
  return (
    <div id="s04-stage-detail" className="rounded-2xl border border-cedar-300/40 bg-bark-800 p-5 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-widest text-cedar-300">Этап {number} из {total}</p>
      <h4 className="mt-2 font-display text-xl sm:text-2xl">{stage.title}</h4>
      <p className="mt-3 text-sm leading-relaxed text-cream-100">{stage.detail}</p>
      <h5 className="mt-5 text-sm font-bold text-cedar-300">Что проверить</h5>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-cream-100">{stage.checks.map((check) => <li key={check}>{check}</li>)}</ul>
      <p className="mt-5 rounded-xl bg-bark-900 p-4 text-sm leading-relaxed text-cream-100"><strong className="mb-1 block text-cedar-300">Условие передачи этапа</strong>{stage.handoff}</p>
    </div>
  );
}

export function RenovationSequenceGuide() {
  const [route, setRoute] = useState<Route | "">("");
  const [ceiling, setCeiling] = useState(false);
  const [heated, setHeated] = useState(false);
  const [wetZone, setWetZone] = useState(false);
  const [active, setActive] = useState("scope");
  const scenario = scenarios.find((item) => item.value === route);
  const steps = route ? renovationSteps(route, ceiling, heated, wetZone) : [];
  const selectedIndex = Math.max(0, steps.findIndex((step) => step.id === active));
  const selected = steps[selectedIndex];
  const context = `Ситуация: ${scenario?.title ?? "не указана"}; мокрая штукатурка потолка: ${route === "dry-lining" ? "не относится к маршруту ГКЛ" : route ? ceiling ? "да" : "не указана" : "не указана"}; тёплый пол: ${heated ? "есть" : "не указан"}; мокрая зона: ${wetZone ? "есть" : "не указана"}`;
  return (
    <section aria-labelledby="s04-map-title" className="bg-cream-100 py-16 text-bark-950 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cedar-700">S04 · Карта этапов ремонта</p>
        <h2 id="s04-map-title" className="mt-3 max-w-4xl font-display text-3xl font-semibold sm:text-4xl">Что сначала: штукатурка или стяжка?</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-bark-700">При мокрой штукатурке обычно начинают со стен и потолка, затем делают стяжку. Если пол уже готов — сначала защита. Для гипсокартона порядок устанавливают по проекту. Выберите свою ситуацию и сразу получите маршрут работ.</p>
        <fieldset className="mt-8">
          <legend className="font-display text-xl sm:text-2xl">1. Выберите исходную ситуацию</legend>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {scenarios.map((item) => <button key={item.value} type="button" aria-pressed={route === item.value} onClick={() => { setRoute(item.value); setActive("scope"); }} className={`min-h-32 rounded-2xl border p-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-600 ${route === item.value ? "border-cedar-600 bg-bark-900 text-cream-50" : "border-bark-950/15 bg-white text-bark-950 hover:border-cedar-600"}`}><span className="block font-display text-lg">{item.title}</span><span className={`mt-2 block text-sm leading-relaxed ${route === item.value ? "text-cream-200" : "text-bark-700"}`}>{item.description}</span></button>)}
          </div>
        </fieldset>
        {scenario ? <>
          <fieldset className="mt-8 rounded-3xl border border-bark-950/10 bg-white p-5 sm:p-7">
            <legend className="px-2 font-display text-xl sm:text-2xl">2. Уточните условия, если они известны</legend>
            <p className="mb-4 text-sm text-bark-700">Незнакомые условия не нужно угадывать. Схема работает и без дополнительных ответов.</p>
            <div className="grid gap-3 md:grid-cols-3">
              {route !== "dry-lining" && <label className="flex min-h-14 items-center gap-3 rounded-xl bg-cream-50 p-4 text-sm focus-within:ring-2 focus-within:ring-cedar-600"><input type="checkbox" checked={ceiling} onChange={(event) => setCeiling(event.target.checked)} className="h-5 w-5 shrink-0 accent-cedar-600" />Нужна мокрая штукатурка потолка</label>}
              <label className="flex min-h-14 items-center gap-3 rounded-xl bg-cream-50 p-4 text-sm focus-within:ring-2 focus-within:ring-cedar-600"><input type="checkbox" checked={heated} onChange={(event) => setHeated(event.target.checked)} className="h-5 w-5 shrink-0 accent-cedar-600" />Есть тёплый пол</label>
              <label className="flex min-h-14 items-center gap-3 rounded-xl bg-cream-50 p-4 text-sm focus-within:ring-2 focus-within:ring-cedar-600"><input type="checkbox" checked={wetZone} onChange={(event) => setWetZone(event.target.checked)} className="h-5 w-5 shrink-0 accent-cedar-600" />Есть мокрая зона</label>
            </div>
          </fieldset>
          <div className="mt-8 overflow-hidden rounded-3xl bg-bark-900 text-cream-50 shadow-card">
            <div className="border-b border-cream-50/15 p-5 sm:p-8"><p className="text-xs font-bold uppercase tracking-widest text-cedar-300">3. Ваш маршрут · {steps.length} этапов</p><h3 className="mt-2 font-display text-2xl sm:text-3xl">{scenario.chain}</h3><p className="mt-3 text-sm text-cream-200">Откройте любой этап: увидите проверки и условие передачи следующей бригаде.</p></div>
            <div className="grid gap-5 p-4 sm:p-8 lg:grid-cols-2 lg:gap-7">
              <ol className="space-y-3" aria-label="Последовательность работ">{steps.map((stage, index) => <li key={stage.id}><button type="button" aria-pressed={stage.id === selected.id} aria-controls="s04-stage-detail" onClick={() => setActive(stage.id)} className={`w-full rounded-2xl border p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300 ${stage.id === selected.id ? "border-cedar-300 bg-bark-800" : "border-cream-50/20 hover:border-cedar-300"}`}><span className="text-xs font-bold uppercase tracking-widest text-cedar-300">{index + 1} / {steps.length}</span><span className="mt-2 block font-display text-lg">{stage.title}</span><span className="mt-2 block text-sm leading-relaxed text-cream-200">{stage.detail}</span></button></li>)}</ol>
              <div role="status" aria-live="polite" aria-atomic="true"><Detail stage={selected} number={selectedIndex + 1} total={steps.length} /></div>
            </div>
            <p className="border-t border-cream-50/15 bg-bark-800 p-5 text-sm leading-relaxed text-cream-200 sm:px-8">ГКЛ не является заявленной услугой компании. Для любой схемы проект и инструкции материалов важнее типового порядка; ходьба по стяжке не равна готовности под покрытие.</p>
          </div>
        </> : <div role="status" className="mt-8 rounded-2xl border border-bark-950/10 bg-white p-5 sm:p-7"><h3 className="font-display text-xl">Первый шаг — один выбор</h3><p className="mt-2 text-sm leading-relaxed text-bark-700">Выберите сценарий выше. Никакие сведения об объекте не подставлены автоматически. Затем откроется схема с точками передачи работ.</p></div>}
        <div className="mt-8 rounded-3xl bg-bark-900 p-5 text-cream-50 sm:p-8"><RepairGuideAction guide="s04" title={scenario ? "Согласуем очередность двух этапов" : "Обсудим порядок работ на вашем объекте"} prompt="Пришлите план, площади и фотографии стен и пола; сообщите, готова ли стяжка и есть ли тёплый пол. Уточним, какие вопросы передать штукатурам и стяжечникам. Услуги и сметы согласуются отдельно." context={context} /></div>
      </div>
    </section>
  );
}
