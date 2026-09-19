import { useState } from "react";
import { RepairGuideAction } from "./RepairGuideAction";
import { screedAdvice, type Access, type Floor, type FloorFinish } from "../lib/repairGuideDecisions";

const floors: { value: Floor; label: string }[] = [
  { value: "ordinary", label: "Обычная комната" },
  { value: "heated", label: "Тёплый пол" },
  { value: "wet", label: "Санузел / мокрая зона" },
  { value: "limited", label: "Ограничена нагрузка на перекрытие" },
  { value: "project", label: "Технология задана проектом" },
];
const accesses: { value: Access; label: string }[] = [
  { value: "ready", label: "Подъезд и подачу можно организовать" },
  { value: "restricted", label: "Подъезд или подача затруднены" },
  { value: "unknown", label: "Доступ пока не проверяли" },
];
const finishes: { value: FloorFinish; label: string }[] = [
  { value: "tile", label: "Плитка" }, { value: "laminate", label: "Ламинат" },
  { value: "wood", label: "Паркет / древесное покрытие" },
  { value: "unknown", label: "Покрытие ещё не выбрано" },
];
const comparisons = [
  ["Смесь", "Меньше воды, но это не сухой сборный пол.", "Более подвижный раствор, не обязательно наливной пол."],
  ["Укладка", "Распределение, обязательное уплотнение и выравнивание.", "Укладка и выравнивание по техкарте материала."],
  ["Слои и нагрузка", "Проект задаёт толщину, швы, изоляцию и нагрузки.", "Те же проверки проекта и основания."],
  ["Покрытие и смета", "Влажность, ровность и полный состав работ проверяются отдельно.", "Те же критерии, но по конкретной системе и смете."],
];

export function ScreedComparisonGuide() {
  const [floor, setFloor] = useState<Floor | "">("");
  const [access, setAccess] = useState<Access | "">("");
  const [finish, setFinish] = useState<FloorFinish | "">("");
  const advice = screedAdvice(floor, access, finish);
  const context = `Помещение: ${floors.find((item) => item.value === floor)?.label ?? "не указано"}; доступ: ${accesses.find((item) => item.value === access)?.label ?? "не указан"}; покрытие: ${finishes.find((item) => item.value === finish)?.label ?? "не указано"}`;
  return (
    <section aria-labelledby="s01-visual-title" className="bg-cream-100 py-16 text-bark-950 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cedar-700">S01 · Сравнение технологий</p>
        <h2 id="s01-visual-title" className="mt-3 max-w-4xl font-display text-3xl font-semibold sm:text-4xl">Разница видна в смеси и укладке. Решение — в конструкции пола</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-bark-700">Полусухую смесь распределяют и уплотняют, мокрый раствор укладывают по своей технологии. Для обычной комнаты сравните полные конструкции, а для тёплого пола или санузла начните с проекта. Ни один способ не обещает готовность под покрытие «завтра».</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-cedar-600/20 bg-white p-5 shadow-sm sm:p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-cedar-700">01 / Предлагаемая услуга</p>
            <h3 className="mt-2 font-display text-2xl">Полусухая стяжка</h3>
            <p className="mt-3 text-sm leading-relaxed text-bark-700">Цементно-песчаная смесь с меньшим количеством воды. Подача, распределение, уплотнение, выравнивание и предусмотренный уход.</p>
            <ol className="mt-5 space-y-2 text-sm"><li className="rounded-xl bg-cream-50 p-3">1 · Подать смесь</li><li className="rounded-xl bg-cream-50 p-3">2 · Распределить и уплотнить</li><li className="rounded-xl bg-cream-50 p-3">3 · Выровнять, обеспечить уход</li></ol>
          </article>
          <article className="rounded-3xl border border-bark-950/10 bg-white p-5 shadow-sm sm:p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-cedar-700">02 / Для сравнения, не услуга компании</p>
            <h3 className="mt-2 font-display text-2xl">Мокрая стяжка</h3>
            <p className="mt-3 text-sm leading-relaxed text-bark-700">Более подвижный раствор. Конкретный способ приготовления, укладки, выравнивания и ухода определяет выбранный материал.</p>
            <ol className="mt-5 space-y-2 text-sm"><li className="rounded-xl bg-cream-50 p-3">1 · Приготовить и подать раствор</li><li className="rounded-xl bg-cream-50 p-3">2 · Уложить и выровнять</li><li className="rounded-xl bg-cream-50 p-3">3 · Обеспечить уход и контроль</li></ol>
          </article>
        </div>
        <div className="mt-8 rounded-3xl border border-bark-950/10 bg-white p-5 sm:p-7">
          <h3 className="font-display text-2xl">Что сравнивать в сметах</h3>
          <p className="mt-2 text-sm text-bark-700">Одинаковая площадь, проектная конструкция и требования к поверхности — иначе две цены за м² несопоставимы.</p>
          <div className="mt-5 grid gap-3">{comparisons.map(([name, semidry, wet]) => <article key={name} className="rounded-2xl bg-cream-50 p-4"><h4 className="font-display text-lg">{name}</h4><div className="mt-3 grid gap-3 md:grid-cols-2"><p className="text-sm leading-relaxed text-bark-700"><strong className="block text-cedar-700">Полусухая</strong>{semidry}</p><p className="text-sm leading-relaxed text-bark-700"><strong className="block text-cedar-700">Мокрая</strong>{wet}</p></div></article>)}</div>
          <p className="mt-5 rounded-xl border border-bark-950/10 p-4 text-sm text-bark-700"><strong>Слои пола снизу вверх:</strong> проверенное основание → проектная изоляция, если предусмотрена → стяжка → совместимое покрытие. Для тёплого пола, гидроизоляции и ограниченной нагрузки схему уточняют отдельно.</p>
        </div>
        <div className="mt-10 rounded-3xl bg-bark-900 p-5 text-cream-50 shadow-card sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cedar-300">Интерактив · первый ориентир за один выбор</p>
          <h3 className="mt-2 font-display text-2xl sm:text-3xl">Какие условия проверить на вашем объекте?</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-cream-200">Выберите тип помещения. Дополните доступ и покрытие, если знаете: незаполненные поля не считаются ответами.</p>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <label htmlFor="s01-floor" className="block text-sm font-medium">1. Тип пола
              <select id="s01-floor" value={floor} onChange={(event) => setFloor(event.target.value as Floor | "")} className="mt-2 min-h-12 w-full rounded-xl border border-cream-50/30 bg-bark-800 px-3 py-3 text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300"><option value="">Выберите сценарий</option>{floors.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
            </label>
            <label htmlFor="s01-access" className="block text-sm font-medium">2. Подъезд · можно позже
              <select id="s01-access" value={access} onChange={(event) => setAccess(event.target.value as Access | "")} className="mt-2 min-h-12 w-full rounded-xl border border-cream-50/30 bg-bark-800 px-3 py-3 text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300"><option value="">Пока не указан</option>{accesses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
            </label>
            <label htmlFor="s01-finish" className="block text-sm font-medium">3. Покрытие · можно позже
              <select id="s01-finish" value={finish} onChange={(event) => setFinish(event.target.value as FloorFinish | "")} className="mt-2 min-h-12 w-full rounded-xl border border-cream-50/30 bg-bark-800 px-3 py-3 text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300"><option value="">Пока не указано</option>{finishes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
            </label>
          </div>
          <div role="status" aria-live="polite" aria-atomic="true" className="mt-6 rounded-2xl border border-cedar-300/40 bg-bark-800 p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-cedar-300">{advice ? "Ваш список проверок" : "Начните с одного ответа"}</p>
            <h4 className="mt-2 font-display text-xl sm:text-2xl">{advice?.heading ?? "Какой у вас пол?"}</h4>
            <p className="mt-3 text-sm leading-relaxed text-cream-100">{advice?.explanation ?? "Выберите тип пола в первом поле. Мы не подставляем условия вашего объекта автоматически."}</p>
            {advice && <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-cream-100">{advice.checks.map((check) => <li key={check}>{check}</li>)}</ul>}
          </div>
          <RepairGuideAction guide="s01" title={advice ? "Обсудим стяжку под эти условия" : "Рассчитаем ваш вариант полусухой стяжки"} prompt="Пришлите площадь, этаж, фото основания и сведения о тёплом поле. Уточним конструкцию, подачу смеси и состав расчёта." context={context} />
        </div>
      </div>
    </section>
  );
}
