import { useState } from "react";
import { RepairGuideAction } from "./RepairGuideAction";
import { materialAdvice, type Base, type Exposure, type Finish } from "../lib/repairGuideDecisions";

const exposures: { value: Exposure; label: string }[] = [
  { value: "normal", label: "Сухая комната" }, { value: "wet", label: "Кухня или ванная с защитой" },
  { value: "water", label: "Прямое / постоянное попадание воды" }, { value: "outside", label: "Фасад, улица" },
];
const bases: { value: Base; label: string }[] = [
  { value: "mineral", label: "Бетон, кирпич, блок" }, { value: "complex", label: "Листы / сложная поверхность" },
  { value: "unknown", label: "Основание ещё не проверено" },
];
const finishes: { value: Finish; label: string }[] = [
  { value: "paint", label: "Окраска" }, { value: "wallpaper", label: "Обои" }, { value: "tile", label: "Плитка" },
];

function MaterialCard({ type }: { type: "gypsum" | "cement" }) {
  const gypsum = type === "gypsum";
  return (
    <article className="rounded-3xl border border-bark-950/10 bg-white p-5 shadow-sm sm:p-7">
      <span className="text-xs font-bold uppercase tracking-widest text-cedar-700">{gypsum ? "01 · В первую очередь интерьер" : "02 · Есть фасадные и влагостойкие составы"}</span>
      <h3 className="mt-2 font-display text-2xl">{gypsum ? "Гипсовая штукатурка" : "Цементная штукатурка"}</h3>
      <p className="mt-3 min-h-16 text-sm leading-relaxed text-bark-700">{gypsum ? "Выбирайте для разрешённых внутренних условий. Для кухни или ванной проверьте допуск конкретной смеси и защиту от влаги." : "Существуют продукты для фасада и влажных зон. Но не любая цементная смесь подходит для улицы, плитки или сложного основания."}</p>
      <figure className="mt-5 overflow-hidden rounded-2xl border border-bark-950/15">
        <figcaption className="bg-cream-50 px-4 py-3 text-sm font-semibold">Условный разрез · от основания к отделке</figcaption>
        <div className="bg-bark-800 p-3 text-sm text-cream-50">1. Проверенное основание</div>
        <div className="bg-cedar-100 p-3 text-sm">2. Подготовка по техкарте</div>
        <div className={gypsum ? "bg-cream-200 p-4 font-display text-lg" : "bg-bark-600 p-4 font-display text-lg text-cream-50"}>3. {gypsum ? "Гипсовый" : "Цементный"} штукатурный слой</div>
        <div className="bg-white p-3 text-sm">4. Совместимая финишная система</div>
      </figure>
      <p className="mt-3 text-xs leading-relaxed text-bark-600">Не в масштабе: грунтовку, армирование и гидроизоляцию определяют по выбранной системе.</p>
    </article>
  );
}

export function PlasterMaterialGuide() {
  const [exposure, setExposure] = useState<Exposure | "">("");
  const [base, setBase] = useState<Base | "">("");
  const [finish, setFinish] = useState<Finish | "">("");
  const advice = materialAdvice(exposure, base, finish);
  const context = `Условия: ${exposures.find((item) => item.value === exposure)?.label ?? "помещение не указано"}; основание: ${bases.find((item) => item.value === base)?.label ?? "не указано"}; отделка: ${finishes.find((item) => item.value === finish)?.label ?? "не указана"}`;
  return (
    <section aria-labelledby="plaster-material-visual" className="bg-cream-100 py-16 text-bark-950 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cedar-700">P02 · Наглядное сравнение</p>
        <h2 id="plaster-material-visual" className="mt-3 max-w-4xl font-display text-3xl font-semibold sm:text-4xl">Сначала условия, потом конкретная смесь</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-bark-700">Для сухой комнаты возможны обе системы. Для фасада нужна смесь с допуском к наружным работам. В ванной решают вода и защита. Посмотрите устройство и выберите свой сценарий — первый ответ появится после одного выбора.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2"><MaterialCard type="gypsum" /><MaterialCard type="cement" /></div>
        <div className="mt-10 rounded-3xl bg-bark-900 p-5 text-cream-50 shadow-card sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cedar-300">Интерактив · без угадывания ваших условий</p>
          <h3 className="mt-2 font-display text-2xl sm:text-3xl">Какая штукатурка подойдёт под вашу задачу?</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-cream-200">Укажите помещение — сразу увидите ориентир. Основание и отделка уточнят результат; незаполненные поля не считаются ответами.</p>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <label className="block text-sm font-medium" htmlFor="p02-exposure">1. Помещение и вода
              <select id="p02-exposure" value={exposure} onChange={(event) => setExposure(event.target.value as Exposure | "")} className="mt-2 min-h-12 w-full rounded-xl border border-cream-50/30 bg-bark-800 px-3 py-3 text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300"><option value="">Выберите помещение</option>{exposures.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
            </label>
            <label className="block text-sm font-medium" htmlFor="p02-base">2. Основание · можно позже
              <select id="p02-base" value={base} onChange={(event) => setBase(event.target.value as Base | "")} className="mt-2 min-h-12 w-full rounded-xl border border-cream-50/30 bg-bark-800 px-3 py-3 text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300"><option value="">Пока не указано</option>{bases.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
            </label>
            <label className="block text-sm font-medium" htmlFor="p02-finish">3. Будущая отделка · можно позже
              <select id="p02-finish" value={finish} onChange={(event) => setFinish(event.target.value as Finish | "")} className="mt-2 min-h-12 w-full rounded-xl border border-cream-50/30 bg-bark-800 px-3 py-3 text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300"><option value="">Пока не указана</option>{finishes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
            </label>
          </div>
          <div role="status" aria-live="polite" aria-atomic="true" className="mt-6 rounded-2xl border border-cedar-300/40 bg-bark-800 p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-cedar-300">{advice ? "Ориентир для вашего сценария" : "Начните с одного ответа"}</p>
            <h4 className="mt-2 font-display text-xl sm:text-2xl">{advice?.heading ?? "Где будет штукатурка?"}</h4>
            <p className="mt-3 text-sm leading-relaxed text-cream-100">{advice?.explanation ?? "Выберите помещение в первом поле. Никакой тип стены или смеси заранее не предполагаем."}</p>
            {advice && <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-cream-100">{advice.checks.map((check) => <li key={check}>{check}</li>)}</ul>}
          </div>
          <RepairGuideAction guide="p02" title={advice ? "Обсудим смесь для этих условий" : "Пришлите условия — обсудим материал"} prompt="Напишите площадь, тип помещения и приложите фотографии стен. Уточним основание, допустимый состав и расчёт механизированной штукатурки." context={context} />
        </div>
        <aside aria-label="Документы для выбора" className="mt-8 rounded-2xl border border-bark-950/10 bg-white p-5 text-sm leading-relaxed text-bark-700 sm:p-6">
          <h3 className="font-display text-xl text-bark-950">Сравнивайте паспорт конкретной смеси</h3>
          <p className="mt-2">Примеры документации — не универсальные свойства всех гипсовых и цементных составов:</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li><a href="https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/shtukaturki/knauf-rotband/" target="_blank" rel="noopener noreferrer" className="text-cedar-700 underline">КНАУФ-Ротбанд: интерьер и условия применения</a></li>
            <li><a href="https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-unterputts/" target="_blank" rel="noopener noreferrer" className="text-cedar-700 underline">КНАУФ-Унтерпутц: цементная штукатурка</a></li>
            <li><a href="https://ceresit.ru/ru/products/vnutrennyay-otdelka/shtukaturki/ct_24_light" target="_blank" rel="noopener noreferrer" className="text-cedar-700 underline">Ceresit CT 24 Light: области применения и основания</a></li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
