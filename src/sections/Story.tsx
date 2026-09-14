import { ArrowIcon, LinkButton, SectionHead } from "../components/Brand";
import { company, images, mapsUrl } from "../data/products";
import { track } from "../lib/utils";

const scenes = [
  {
    title: "Семейные выходные",
    text: "Комната отдыха на 90–170 см — как раз чтобы переодеть детей, а парная 200 × 180 прогревается быстро за счёт малого объёма.",
    img: images.hero,
    alt: "Семья с ребёнком у бани Квадро 4×2",
    model: "Квадро 3×2 и 4×2",
    to: "/product/10645551",
  },
  {
    title: "Мужская компания",
    text: "Боковой вход, стол и скамейки в комнате отдыха, печь с выносом топки — подкидывать дрова, не заходя в парную.",
    img: images.k4,
    alt: "Трое мужчин за столом у бани Квадро с боковым входом",
    model: "Квадро 4×2",
    to: "/product/10407084",
  },
  {
    title: "Женский день",
    text: "Ретро-проводка на изоляторах, окно в комнате отдыха и стол для чая с травами. Кедр даёт аромат без пропиток.",
    img: images.otdyh,
    alt: "Две подруги пьют чай в комнате отдыха кедровой бани",
    model: "любая Квадро с комнатой отдыха",
    to: "/#layout",
  },
];

export function Scenes() {
  return (
    <section className="bg-bark-900 py-20 sm:py-28" aria-labelledby="scenes-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          index="04 — Сценарии"
          title={<span id="scenes-title">Одна баня — три разных вечера</span>}
          lead="Квадро — не «дачный компромисс», а полноценная баня, которую просто привезли готовой. Вот как её используют."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {scenes.map((s, i) => (
            <article key={s.title} className="reveal group relative overflow-hidden rounded-3xl bg-bark-800 border border-cream-50/8" style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}>
              <div className={i === 1 ? "aspect-[4/5]" : "aspect-[4/5]"}>
                <img src={s.img} alt={s.alt} loading="lazy" decoding="async" width={1200} height={1500} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-bark-950 via-bark-950/40 to-transparent" aria-hidden="true" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-[11px] uppercase tracking-[0.18em] text-cedar-300">{s.model}</p>
                <h3 className="mt-2 font-display text-xl text-cream-50">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream-200/80">{s.text}</p>
                <LinkButton to={s.to} variant="subtle" size="sm" className="mt-4" onClick={() => track("nav", { to: s.to, from: "scenes" })}>
                  Смотреть <ArrowIcon />
                </LinkButton>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs text-cream-300/50">Сцены — художественная визуализация моделей. Реальные фотографии бань и производства — в сообществе VK (более 50 фото).</p>
      </div>
    </section>
  );
}

export function WinterBand() {
  return (
    <section className="relative overflow-hidden bg-bark-950" aria-labelledby="winter-title">
      <div className="absolute inset-0">
        <img src={images.winter} alt="" aria-hidden="true" loading="lazy" decoding="async" width={1536} height={1024} className="h-full w-full object-cover object-[60%_center] opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-bark-950 via-bark-950/70 to-bark-950/20" aria-hidden="true" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-36">
        <div className="max-w-xl">
          <p className="reveal text-xs uppercase tracking-[0.22em] text-cedar-300">Сибирская зима</p>
          <h2 id="winter-title" className="reveal mt-4 font-display font-semibold text-[28px] leading-[1.1] sm:text-4xl lg:text-5xl text-cream-50 text-balance" style={{ ["--reveal-delay" as string]: "80ms" }}>
            Форма квадро меньше по объёму — <span className="text-cedar-400">быстрее прогрев</span>, меньше дров
          </h2>
          <ul className="reveal mt-8 space-y-3 text-cream-200/85" style={{ ["--reveal-delay" as string]: "160ms" }}>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cedar-400" aria-hidden="true" />
              Брус 45 мм камерной сушки (влажность 10–12 %) — стены не ведёт от перепадов температуры.
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cedar-400" aria-hidden="true" />
              Проход печи проложен каолиновой ватой, дымоход — сэндвич: безопасно топить и в −30.
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cedar-400" aria-hidden="true" />
              Шибер регулирует скорость горения, бак на 50 л греется вместе с парной.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

const steps = [
  { n: "01", t: "Звонок или заявка", d: "Обсуждаем размер, количество помещений, вход (с торца или сбоку) и куда выводить топку печи.", link: { label: company.phonePrimary.display, to: `tel:${company.phonePrimary.tel}` } },
  { n: "02", t: "Посмотреть вживую", d: `Образцы стоят на площадке — ${company.showroom}. Можно зайти внутрь, потрогать кедр и посидеть на полке.`, link: { label: "Открыть в картах", to: mapsUrl(company.showroom) } },
  { n: "03", t: "Сборка", d: "Собираем баню в цеху или, если заезд на участок невозможен, поэтапно у вас на месте." },
  { n: "04", t: "Доставка и установка", d: "Привозим готовую, ставим на блоки, кладём трапики и ступеньку. По Омску — бесплатно; в другие города — по договорённости." },
  { n: "05", t: "Первый пар", d: "Подключаете электричество (по желанию — воду) — и можно топить. Никакого стройматериала и мусора на участке." },
];

export function Process() {
  return (
    <section id="process" className="scroll-mt-20 bg-bark-900 py-20 sm:py-28" aria-labelledby="process-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead index="05 — Как это происходит" title={<span id="process-title">От звонка до первого пара — пять шагов</span>} />
        <ol className="relative mt-12 grid gap-8 md:grid-cols-5">
          <div className="strap absolute left-0 right-0 top-5 hidden md:block opacity-70" aria-hidden="true" />
          {steps.map((s, i) => (
            <li key={s.n} className="reveal relative md:pt-12" style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}>
              <span className="absolute left-0 top-0 md:left-0 md:top-1 flex h-10 w-10 items-center justify-center rounded-full bg-bark-900 border border-cedar-500/50 font-display text-xs text-cedar-300 shadow-[0_0_0_6px_var(--color-bark-900)]">{s.n}</span>
              <div className="pl-14 md:pl-0">
                <h3 className="font-display text-base text-cream-50">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream-200/75">{s.d}</p>
                {s.link && (
                  <a
                    href={s.link.to}
                    target={s.link.to.startsWith("http") ? "_blank" : undefined}
                    rel={s.link.to.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-3 inline-flex items-center gap-1 text-sm text-cedar-300 hover:text-cedar-200"
                    onClick={() => track("cta_click", { type: s.link!.to.startsWith("tel") ? "call" : "map", where: "process" })}
                  >
                    {s.link.label} <ArrowIcon className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
