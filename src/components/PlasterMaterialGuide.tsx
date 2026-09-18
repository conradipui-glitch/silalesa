import { useState } from "react";

type Exposure = "normal" | "wet" | "water" | "outside";
type Base = "mineral" | "complex" | "unknown";
type Finish = "paint" | "wallpaper" | "tile";

const exposures: { value: Exposure; label: string }[] = [
  { value: "normal", label: "Обычная комната" },
  { value: "wet", label: "Кухня / ванная с защитой" },
  { value: "water", label: "Прямое или постоянное увлажнение" },
  { value: "outside", label: "Фасад / улица" },
];
const bases: { value: Base; label: string }[] = [
  { value: "mineral", label: "Бетон / кирпич / блок" },
  { value: "complex", label: "Листовая или сложная поверхность" },
  { value: "unknown", label: "Основание ещё не проверено" },
];
const finishes: { value: Finish; label: string }[] = [
  { value: "paint", label: "Окраска" },
  { value: "wallpaper", label: "Обои" },
  { value: "tile", label: "Плитка" },
];

function choice(exposure: Exposure, base: Base, finish: Finish) {
  if (base === "unknown") return {
    label: "Сначала проверить основание",
    text: "Нельзя выбирать смесь по названию помещения: нужна проверка прочности, старого покрытия, впитываемости и допустимых слоёв.",
  };
  if (base === "complex") return {
    label: "Нужна совместимая система",
    text: "Для листов и сложных оснований ищите специальную систему производителя. Обычная смесь для кирпича или бетона не становится подходящей автоматически.",
  };
  if (exposure === "water") return {
    label: "Проверить проект влагозащиты",
    text: "Постоянная вода и мокрые зоны требуют предусмотренной гидроизоляции и подходящего основания. Само слово «цементная» не заменяет эту систему.",
  };
  if (exposure === "outside") return {
    label: "Смотреть фасадные цементные системы",
    text: "Рассмотрите цементный состав, прямо разрешённый для фасада и данного основания. Обычная интерьерная гипсовая штукатурка сюда не подходит.",
  };
  if (exposure === "wet") return {
    label: "Решают паспорт смеси и защита от воды",
    text: "В кухне или ванной некоторые гипсовые составы разрешены только с защитным покрытием; цементные системы тоже требуют верной подготовки и, где нужно, гидроизоляции.",
  };
  return {
    label: "Возможны обе технологии",
    text: finish === "tile"
      ? "Под плитку проверяйте совместимость клея и штукатурки, минимальный слой, прочность и нагрузку облицовки по конкретной системе."
      : "Для сухого интерьера рассматривайте обе смеси. Под окраску или обои отдельно согласуйте требуемое качество поверхности и финишные операции.",
  };
}

function LayerDiagram({ material }: { material: "gypsum" | "cement" }) {
  const gypsum = material === "gypsum";
  return (
    <figure className="rounded-2xl border border-bark-950/10 bg-cream-50 p-4 sm:p-5">
      <figcaption className="mb-4 font-display text-xl">{gypsum ? "Гипсовая система" : "Цементная система"}</figcaption>
      <div role="img" aria-label="Условная схема: основание, подготовка, слой штукатурки и отделка; состав слоёв проверяют по документации" className="overflow-hidden rounded-xl border border-bark-950/15">
        <div className="bg-bark-800 px-3 py-3 text-xs font-medium text-cream-50">04 · Основание</div>
        <div className="bg-cedar-100 px-3 py-2 text-xs text-bark-950">03 · Подготовка по инструкции</div>
        <div className={gypsum ? "bg-cream-200 px-3 py-6 font-display text-base text-bark-950" : "bg-bark-600 px-3 py-6 font-display text-base text-cream-50"}>
          02 · {gypsum ? "Гипсовая штукатурка" : "Цементная штукатурка"}
        </div>
        <div className="bg-white px-3 py-3 text-xs text-bark-900">01 · Совместимая финишная отделка</div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-bark-600">Схема условная, не в масштабе. Грунтовка, гидроизоляция, армирование и финишные слои — по конкретной системе.</p>
    </figure>
  );
}

export function PlasterMaterialGuide() {
  const [exposure, setExposure] = useState<Exposure>("normal");
  const [base, setBase] = useState<Base>("mineral");
  const [finish, setFinish] = useState<Finish>("paint");
  const result = choice(exposure, base, finish);

  return (
    <section aria-labelledby="plaster-material-visual" className="bg-cream-100 py-16 text-bark-950 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cedar-700">Визуальный гайд · материалы</p>
        <h2 id="plaster-material-visual" className="mt-3 max-w-3xl font-display text-3xl font-semibold sm:text-4xl">Одна задача — две разные системы</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-bark-700">Сравните назначение, а не рекламные обещания. Ни один материал не подходит для любого основания и любой отделки.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-cedar-600/20 bg-white p-5 shadow-sm sm:p-7">
            <span className="text-xs font-semibold uppercase tracking-widest text-cedar-700">01 / Интерьер</span>
            <h3 className="mt-2 font-display text-2xl">Гипсовая</h3>
            <p className="mt-2 min-h-20 text-sm leading-relaxed text-bark-700">Для внутренних работ по разрешённым основаниям. Некоторые продукты допускают кухни и ванные при защите от увлажнения; проверяйте паспорт именно своей смеси.</p>
            <LayerDiagram material="gypsum" />
          </div>
          <div className="rounded-3xl border border-bark-700/20 bg-white p-5 shadow-sm sm:p-7">
            <span className="text-xs font-semibold uppercase tracking-widest text-cedar-700">02 / Влажность и фасады</span>
            <h3 className="mt-2 font-display text-2xl">Цементная</h3>
            <p className="mt-2 min-h-20 text-sm leading-relaxed text-bark-700">Существуют составы для влажных помещений и наружных работ. Это не делает любую цементную смесь фасадной или заменой гидроизоляции.</p>
            <LayerDiagram material="cement" />
          </div>
        </div>
        <div className="mt-10 rounded-3xl bg-bark-900 p-5 text-cream-50 shadow-card sm:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-cedar-300">Интерактивный ориентир</p>
          <h3 className="mt-2 font-display text-2xl sm:text-3xl">Проверьте условия своего объекта</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream-200/85">Выберите три параметра. Подсказка объяснит, что проверить дальше; она не заменяет проект и паспорт материала.</p>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            <label className="block text-sm font-medium" htmlFor="p02-exposure">1 · Помещение и вода
              <select id="p02-exposure" value={exposure} onChange={(event) => setExposure(event.target.value as Exposure)} className="mt-2 min-h-12 w-full rounded-xl border border-cream-50/30 bg-bark-800 px-3 py-3 text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300">
                {exposures.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium" htmlFor="p02-base">2 · Основание
              <select id="p02-base" value={base} onChange={(event) => setBase(event.target.value as Base)} className="mt-2 min-h-12 w-full rounded-xl border border-cream-50/30 bg-bark-800 px-3 py-3 text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300">
                {bases.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium" htmlFor="p02-finish">3 · Отделка
              <select id="p02-finish" value={finish} onChange={(event) => setFinish(event.target.value as Finish)} className="mt-2 min-h-12 w-full rounded-xl border border-cream-50/30 bg-bark-800 px-3 py-3 text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300">
                {finishes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>
          <div aria-live="polite" aria-atomic="true" className="mt-7 rounded-2xl border border-cedar-300/40 bg-bark-800 p-5 sm:p-7">
            <span className="text-xs uppercase tracking-widest text-cedar-300">Ваш следующий шаг</span>
            <h4 className="mt-2 font-display text-xl sm:text-2xl">{result.label}</h4>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-cream-100 sm:text-base">{result.text}</p>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-cream-200/75">Правило выбора: назначение продукта → совместимость с основанием → защита от влаги → требования к облицовке. Для расчёта и подбора системы потребуется осмотр объекта.</p>
        </div>
        <aside className="mt-8 rounded-2xl border border-bark-950/10 bg-white p-5 text-sm leading-relaxed text-bark-700 sm:p-6" aria-label="Документация для проверки">
          <h3 className="font-display text-lg text-bark-950">Примеры документации производителей</h3>
          <p className="mt-2">Свойства ниже не распространяются автоматически на все смеси. Сверьте паспорт выбранного продукта и инструкцию всей отделочной системы.</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li><a className="text-cedar-700 underline underline-offset-4" href="https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/shtukaturki/knauf-rotband/" target="_blank" rel="noopener noreferrer">КНАУФ-Ротбанд: условия применения гипсовой штукатурки</a></li>
            <li><a className="text-cedar-700 underline underline-offset-4" href="https://www.knauf.ru/catalog/sukhie-stroitelnye-smesi-i-gotovye-sostavy/knauf-unterputts/" target="_blank" rel="noopener noreferrer">КНАУФ-Унтерпутц: цементная штукатурка для влажных зон и фасада</a></li>
            <li><a className="text-cedar-700 underline underline-offset-4" href="https://ceresit.ru/ru/products/vnutrennyay-otdelka/shtukaturki/ct_24_light" target="_blank" rel="noopener noreferrer">Ceresit CT 24 Light: основания и области применения</a></li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
