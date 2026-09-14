import { ArrowIcon, SectionHead } from "../components/Brand";
import { company, images, mapsUrl } from "../data/products";
import { track } from "../lib/utils";

export function WinterBand() {
  return (
    <section className="relative overflow-hidden bg-bark-950" aria-labelledby="winter-title">
      <div className="absolute inset-0">
        <img src={images.winter} alt="" aria-hidden="true" loading="lazy" decoding="async" width={1536} height={1024} className="h-full w-full object-cover object-[60%_center] opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-bark-950 via-bark-950/70 to-bark-950/20" aria-hidden="true" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-36">
        <div className="max-w-xl">
          <p className="reveal text-xs uppercase tracking-[0.22em] text-cedar-300">Эксплуатация зимой</p>
          <h2 id="winter-title" className="reveal mt-4 font-display font-semibold text-[28px] leading-[1.1] sm:text-4xl lg:text-5xl text-cream-50 text-balance" style={{ ["--reveal-delay" as string]: "80ms" }}>
            Что предусмотрено в конструкции <span className="text-cedar-400">для холодного времени</span>
          </h2>
          <ul className="reveal mt-8 space-y-3 text-cream-200/85" style={{ ["--reveal-delay" as string]: "160ms" }}>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cedar-400" aria-hidden="true" />
              Кедровый брус 45 мм камерной сушки; рабочая влажность материала в спецификации — 10–12 %.
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cedar-400" aria-hidden="true" />
              Проход между печью и деревом проложен каолиновой ватой, дымоход выполнен по схеме «сэндвич».
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cedar-400" aria-hidden="true" />
              Шибер позволяет регулировать тягу; бак из нержавеющей стали на 50 л установлен в системе печи.
            </li>
          </ul>
          <p className="reveal mt-6 text-sm leading-relaxed text-cream-300/70" style={{ ["--reveal-delay" as string]: "220ms" }}>
            Время прогрева и расход дров зависят от наружной температуры, режима топки и эксплуатации — универсальные цифры для всех участков не обещаем.
          </p>
        </div>
      </div>
    </section>
  );
}

const steps = [
  { n: "01", t: "Звонок или заявка", d: "Обсуждаем размер, количество помещений, вход (с торца или сбоку) и куда выводить топку печи.", link: { label: company.phonePrimary.display, to: `tel:${company.phonePrimary.tel}` } },
  { n: "02", t: "Посмотреть вживую", d: `Образцы стоят на площадке — ${company.showroom}. Можно зайти внутрь, потрогать кедр и посидеть на полке.`, link: { label: "Открыть в картах", to: mapsUrl(company.showroom) } },
  { n: "03", t: "Проверить участок", d: "Сверяем место установки, основание, подъезд и точку разгрузки. Если манипулятор не проходит, заранее согласуем сборку на участке." },
  { n: "04", t: "Сборка, доставка и установка", d: "При доступном подъезде собираем в цеху, привозим готовую и ставим на блоки. По Омску доставка Квадро бесплатна; другой город рассчитываем отдельно." },
  { n: "05", t: "Подготовка к эксплуатации", d: "После установки остаётся подключить электричество и, при необходимости, воду — затем баню можно готовить к первой топке." },
];

export function Process() {
  return (
    <section id="process" className="scroll-mt-20 bg-bark-900 py-20 sm:py-28" aria-labelledby="process-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead index="05 — От выбора до установки" title={<span id="process-title">От выбора модели до первой топки — пять понятных шагов</span>} />
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
