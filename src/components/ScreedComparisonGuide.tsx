import { useState } from "react";

type Floor = "ordinary" | "heated" | "wet" | "limited" | "project";
type Access = "ready" | "restricted" | "unknown";
type Finish = "tile" | "laminate" | "wood" | "unknown";

const floors: { value: Floor; label: string }[] = [
  { value: "ordinary", label: "Обычная комната" },
  { value: "heated", label: "Водяной / электрический тёплый пол" },
  { value: "wet", label: "Санузел или зона с водой" },
  { value: "limited", label: "Перекрытие с ограничением нагрузки" },
  { value: "project", label: "Конструкция задана проектом" },
];
const accesses: { value: Access; label: string }[] = [
  { value: "ready", label: "Подачу смеси и оборудование можно организовать" },
  { value: "restricted", label: "Подъезд / подача смеси затруднены" },
  { value: "unknown", label: "Доступ ещё не проверяли" },
];
const finishes: { value: Finish; label: string }[] = [
  { value: "tile", label: "Плитка" },
  { value: "laminate", label: "Ламинат" },
  { value: "wood", label: "Паркет / древесное покрытие" },
  { value: "unknown", label: "Покрытие ещё не выбрано" },
];

const criteria = [
  {
    label: "Смесь и укладка",
    semidry: "Цементно-песчаная смесь с меньшим количеством воды: распределение, уплотнение и выравнивание.",
    wet: "Более подвижный раствор: укладка и выравнивание по инструкции конкретного состава.",
  },
  {
    label: "Организация работ",
    semidry: "Часто применяют механизированную подачу; заранее проверяют доступ, воду, питание и размещение оборудования.",
    wet: "Способ приготовления и подачи определяется выбранной технологией, объёмом и условиями объекта.",
  },
  {
    label: "Основание и слои",
    semidry: "Конструкция, швы, изоляция и нагрузка — по проекту и требованиям материалов.",
    wet: "Те же проектные проверки; специальный наливной состав не равен любой мокрой стяжке.",
  },
  {
    label: "Покрытие и готовность",
    semidry: "Проверяют прочность, состояние поверхности и влажность по требованиям покрытия; не по рекламному сроку.",
    wet: "Проверяют те же критерии, но по документации своей системы и фактическим условиям.",
  },
  {
    label: "Смета",
    semidry: "Считают полную конструкцию, материалы, подачу, подготовку, швы и уход.",
    wet: "Для сравнения берут ту же площадь, проект и полноту работ; одной цены «за м²» недостаточно.",
  },
];

const floorAdvice: Record<Floor, { heading: string; detail: string; check: string }> = {
  ordinary: {
    heading: "Сравнить две полные конструкции",
    detail: "В обычной комнате нельзя назначить технологию по одному названию. Проверьте основание, требуемую геометрию, состав слоёв и проектные требования.",
    check: "Запросите сопоставимые сметы на одинаковую площадь, конструкцию и качество поверхности.",
  },
  heated: {
    heading: "Сначала требования системы тёплого пола",
    detail: "Положение труб или кабеля, совместимость состава, слои, швы и первый запуск определяются проектом и инструкциями системы. Автоматический выбор технологии здесь был бы неверным.",
    check: "Уточните модель системы, документацию, положение элементов и кто проверяет её перед заливкой.",
  },
  wet: {
    heading: "Отдельно спроектировать защиту от воды",
    detail: "Стяжка сама по себе не заменяет гидроизоляцию санузла. Согласуйте примыкания, уклоны и допустимую конструкцию для конкретной мокрой зоны.",
    check: "Попросите схему гидроизоляции и согласование стяжки с последующей облицовкой.",
  },
  limited: {
    heading: "Начать с несущей способности перекрытия",
    detail: "Меньшее количество воды в смеси не делает полусухую стяжку автоматически лёгкой. Нагрузку оценивают по всей конструкции и состоянию перекрытия.",
    check: "Получите проверку допустимой нагрузки и массы выбранного решения у проектировщика.",
  },
  project: {
    heading: "Следовать проектной технологии",
    detail: "Если конструкция уже определена проектом или документацией системы, замену мокрой стяжки на полусухую — или наоборот — нужно согласовать до работ.",
    check: "Сверьте конкретную смесь, условия устройства, швы, уход и требования к приёмке.",
  },
};

const finishChecks: Record<Finish, string> = {
  tile: "Под плитку проверьте требуемую прочность, ровность и совместимость клея и основания; во влажной зоне — гидроизоляцию.",
  laminate: "Под ламинат уточните ровность и допустимую остаточную влажность по инструкциям покрытия и подложки.",
  wood: "Для древесного покрытия согласуйте особенно тщательно допустимую влажность, измерение и требования производителя.",
  unknown: "Сначала определитесь с покрытием: у плитки, ламината и древесины могут различаться требования к основанию.",
};

function MethodCard({ variant }: { variant: "semidry" | "wet" }) {
  const semidry = variant === "semidry";
  const steps = semidry
    ? ["Приготовить и подать", "Распределить смесь", "Уплотнить и выровнять", "Обеспечить уход и контроль"]
    : ["Приготовить и подать", "Уложить раствор", "Выровнять по технологии", "Обеспечить уход и контроль"];
  return (
    <figure className="rounded-3xl border border-bark-950/10 bg-white p-5 shadow-sm sm:p-7">
      <figcaption>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cedar-700">{semidry ? "01 · Меньше воды" : "02 · Более подвижная смесь"}</span>
        <h3 className="mt-2 font-display text-2xl text-bark-950">{semidry ? "Полусухая стяжка" : "Мокрая стяжка"}</h3>
        <p className="mt-2 text-sm leading-relaxed text-bark-700">{semidry
          ? "Цементно-песчаная смесь остаётся влажной: без правильного уплотнения и ухода результата не получить."
          : "Более пластичный раствор укладывают по технологии конкретного состава; это не обязательно наливной пол."}</p>
      </figcaption>
      <ol className="mt-6 space-y-2" aria-label={semidry ? "Условные этапы полусухой стяжки" : "Условные этапы мокрой стяжки"}>
        {steps.map((step, index) => (
          <li key={step} className="flex min-h-12 items-center gap-3 rounded-xl border border-bark-950/10 bg-cream-50 p-3 text-sm text-bark-900">
            <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bark-800 font-display text-xs text-cream-50">{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs leading-relaxed text-bark-600">Этапы показаны условно: операции и оборудование зависят от проекта и смеси.</p>
    </figure>
  );
}

export function ScreedComparisonGuide() {
  const [floor, setFloor] = useState<Floor>("ordinary");
  const [access, setAccess] = useState<Access>("unknown");
  const [finish, setFinish] = useState<Finish>("unknown");
  const advice = floorAdvice[floor];
  const accessCheck = access === "restricted"
    ? "Доступ ограничен: сравните логистику обеих технологий и возможность подачи материалов без предположений о стоимости."
    : access === "unknown"
      ? "Проверьте этаж, подъезд, место оборудования, электропитание, воду и маршрут подачи смеси до расчёта."
      : "Доступ возможен: всё равно согласуйте оборудование, размещение и условия подачи с исполнителем.";

  return (
    <section aria-labelledby="s01-visual-title" className="bg-cream-100 py-16 text-bark-950 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cedar-700">Визуальный гайд · сравнение стяжек</p>
        <h2 id="s01-visual-title" className="mt-3 max-w-4xl font-display text-3xl font-semibold leading-tight sm:text-4xl">Две технологии. Выбор начинается с конструкции пола</h2>
        <p className="mt-4 max-w-3xl leading-relaxed text-bark-700">Проследите этапы, сравните критерии и укажите условия помещения. Интерактив выдаёт список проверок, а не выдуманные сроки, стоимость или проектное решение.</p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <MethodCard variant="semidry" />
          <MethodCard variant="wet" />
        </div>

        <figure className="mt-8 grid gap-7 rounded-3xl border border-bark-950/10 bg-white p-5 shadow-sm md:grid-cols-[1fr_0.85fr] sm:p-7">
          <div>
            <figcaption className="font-display text-2xl">Условный разрез пола</figcaption>
            <p className="mt-2 text-sm leading-relaxed text-bark-700">Одинаковая логика проверки слоёв для обеих технологий; фактическая конструкция может отличаться.</p>
            <div aria-label="Схема слоёв снизу вверх: основание, опциональная изоляция, стяжка, финиш" className="mt-5 overflow-hidden rounded-2xl border border-bark-950/15">
              <div className="bg-white px-4 py-3 text-sm font-medium text-bark-950">04 · Покрытие и подложка по требованиям производителя</div>
              <div className="bg-cedar-200 px-4 py-6 font-display text-lg text-bark-950">03 · Стяжка выбранной технологии</div>
              <div className="border-y border-dashed border-bark-950/30 bg-cream-200 px-4 py-3 text-sm text-bark-900">02 · Разделительный / изоляционный слой — если предусмотрен</div>
              <div className="bg-bark-800 px-4 py-4 text-sm font-medium text-cream-50">01 · Проверенное основание / перекрытие</div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-bark-600">Порядок подписан снизу вверх; на рисунке — сверху вниз. Не в масштабе, без толщин. Связанную конструкцию или тёплый пол проектируют отдельно.</p>
          </div>
          <aside aria-label="Проверки до выбора слоёв" className="rounded-2xl bg-cream-50 p-5">
            <h3 className="font-display text-xl">Что нельзя пропустить</h3>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-bark-700">
              <li>Нагрузку и состояние перекрытия.</li>
              <li>Трубы, кабели, тепло- и звукоизоляцию по проекту.</li>
              <li>Швы, примыкания и уклоны при необходимости.</li>
              <li>Гидроизоляцию мокрых зон как отдельную систему.</li>
              <li>Совместимость с финишным покрытием.</li>
            </ul>
          </aside>
        </figure>

        <div className="mt-10 rounded-3xl border border-bark-950/10 bg-white p-5 sm:p-7">
          <h3 className="font-display text-2xl">Сравнение по делу</h3>
          <p className="mt-2 text-sm text-bark-700">Одинаковые исходные условия обязательны: проект, площадь, требования к результату и полный перечень работ.</p>
          <div className="mt-5 grid gap-3">
            {criteria.map((row) => (
              <div key={row.label} className="rounded-2xl border border-bark-950/10 bg-cream-50 p-4 sm:p-5">
                <h4 className="font-display text-lg text-bark-950">{row.label}</h4>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <p className="text-sm leading-relaxed text-bark-700"><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-cedar-700">Полусухая</span>{row.semidry}</p>
                  <p className="text-sm leading-relaxed text-bark-700"><span className="mb-1 block text-xs font-bold uppercase tracking-wide text-cedar-700">Мокрая</span>{row.wet}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-3xl bg-bark-900 p-5 text-cream-50 shadow-card sm:p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-cedar-300">Интерактив · условия вашего объекта</p>
          <h3 className="mt-2 font-display text-2xl sm:text-3xl">На что обратить внимание перед выбором?</h3>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-cream-200/85">Измените три параметра. Подсказка обновится сразу, но не заменит инженерный проект, паспорт смеси и осмотр.</p>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            <label htmlFor="s01-floor" className="block text-sm font-medium">1 · Тип объекта
              <select id="s01-floor" value={floor} onChange={(event) => setFloor(event.target.value as Floor)} className="mt-2 min-h-12 w-full rounded-xl border border-cream-50/30 bg-bark-800 px-3 py-3 text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300">
                {floors.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label htmlFor="s01-access" className="block text-sm font-medium">2 · Доступ и оборудование
              <select id="s01-access" value={access} onChange={(event) => setAccess(event.target.value as Access)} className="mt-2 min-h-12 w-full rounded-xl border border-cream-50/30 bg-bark-800 px-3 py-3 text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300">
                {accesses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label htmlFor="s01-finish" className="block text-sm font-medium">3 · Планируемое покрытие
              <select id="s01-finish" value={finish} onChange={(event) => setFinish(event.target.value as Finish)} className="mt-2 min-h-12 w-full rounded-xl border border-cream-50/30 bg-bark-800 px-3 py-3 text-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300">
                {finishes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
          </div>
          <div role="status" aria-live="polite" aria-atomic="true" className="mt-7 rounded-2xl border border-cedar-300/40 bg-bark-800 p-5 sm:p-7">
            <span className="text-xs uppercase tracking-widest text-cedar-300">План проверки · не автоматический вердикт</span>
            <h4 className="mt-2 font-display text-xl sm:text-2xl">{advice.heading}</h4>
            <p className="mt-3 text-sm leading-relaxed text-cream-100 sm:text-base">{advice.detail}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-cream-100">
              <li>{advice.check}</li>
              <li>{accessCheck}</li>
              <li>{finishChecks[finish]}</li>
            </ul>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-cream-200/80">«Сила Леса» заявляет полусухую стяжку. Мокрая показана для объективного сравнения, не как вторая услуга. Скорость укладки нельзя путать с готовностью основания под покрытие.</p>
        </div>
      </div>
    </section>
  );
}
