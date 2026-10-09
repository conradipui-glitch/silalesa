import { useEffect } from "react";
import { ScreedCalculator } from "../components/ScreedCalculator";
import { Link } from "../lib/router";
import { track } from "../lib/utils";

const url = "https://conradipui-glitch.github.io/silalesa/kalkulyator-styazhki-pola/";
const title = "Калькулятор стяжки пола онлайн: площадь, объём, цена — Сила Леса";
const description = "Рассчитайте площадь, толщину и объём стяжки по нескольким помещениям. Ориентир стоимости в Омске, четыре точки замера, запас и результат без регистрации.";

export function ScreedCalculatorPage() {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    const previous = {
      title: document.title, desc: meta?.content, canonical: canonical?.href,
      ogTitle: ogTitle?.content, ogDesc: ogDesc?.content, ogUrl: ogUrl?.content,
    };
    document.title = title;
    if (meta) meta.content = description;
    if (canonical) canonical.href = url;
    if (ogTitle) ogTitle.content = title;
    if (ogDesc) ogDesc.content = description;
    if (ogUrl) ogUrl.content = url;
    return () => {
      document.title = previous.title;
      if (meta && previous.desc !== undefined) meta.content = previous.desc;
      if (canonical && previous.canonical) canonical.href = previous.canonical;
      if (ogTitle && previous.ogTitle !== undefined) ogTitle.content = previous.ogTitle;
      if (ogDesc && previous.ogDesc !== undefined) ogDesc.content = previous.ogDesc;
      if (ogUrl && previous.ogUrl !== undefined) ogUrl.content = previous.ogUrl;
    };
  }, []);

  return <div className="bg-bark-950 text-cream-50">
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-28 sm:px-6 sm:pt-36 lg:px-8">
      <nav aria-label="Хлебные крошки" className="text-xs text-cream-300/75">
        <Link to="/" className="hover:text-cedar-300">Главная</Link>
        <span aria-hidden="true" className="mx-2">/</span>
        <span>Калькулятор стяжки</span>
      </nav>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_0.65fr] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cedar-300">Строительный инструмент · Омск</p>
          <h1 className="mt-4 max-w-4xl font-display text-[clamp(30px,5vw,62px)] font-semibold leading-[1.06] tracking-tight [overflow-wrap:anywhere]">Калькулятор стяжки пола</h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-cream-200 sm:text-lg">Сколько понадобится объёма и с какой суммы начать планирование? Укажите размеры и толщину — получите наглядный расчёт по каждому помещению, общую площадь и стартовый бюджет. Бесплатно, без телефона.</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-cream-300">
            <span className="rounded-full border border-cream-50/15 px-3 py-2">Несколько помещений</span>
            <span className="rounded-full border border-cream-50/15 px-3 py-2">4 точки замера</span>
            <span className="rounded-full border border-cream-50/15 px-3 py-2">Результат сразу</span>
          </div>
        </div>
        <div className="rounded-2xl border border-cream-50/10 bg-bark-900 p-5 text-sm leading-relaxed text-cream-200">
          <p className="font-display text-lg text-cedar-300">Что получите</p>
          <p className="mt-2">Площадь в м², геометрический объём в м³, объём с запасом, распределение по помещениям и ориентир стоимости по стартовой ставке услуги.</p>
        </div>
      </div>
    </div>
    <section id="raschet" aria-label="Интерактивный калькулятор" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <ScreedCalculator />
    </section>
    <section className="bg-cream-50 py-14 text-bark-950 sm:py-20" aria-labelledby="formula-title">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cedar-700">Прозрачная формула</p>
          <h2 id="formula-title" className="mt-3 font-display text-3xl leading-tight sm:text-4xl">Как получается результат</h2>
          <p className="mt-5 text-base leading-relaxed text-bark-700">Площадь прямоугольного помещения равна длине, умноженной на ширину. Геометрический объём стяжки — площадь × средняя толщина слоя в метрах. Если толщина указана в миллиметрах, делим её на 1000.</p>
          <p className="mt-4 text-base leading-relaxed text-bark-700">Для комнаты 5 × 4 м при слое 50 мм: площадь 20 м², объём 1 м³, а с запасом 5% — 1,05 м³. Это объём будущего слоя, а не готовая ведомость цемента, песка или мешков: фактический расход компонентов определяется рецептурой и паспортными данными смеси.</p>
          <p className="mt-4 text-base leading-relaxed text-bark-700">При замерах четырёх углов калькулятор берёт среднее значение как упрощённую оценку. Сложное основание с перепадами, выступами и коммуникациями необходимо измерять подробнее; расчёт не назначает допустимую толщину конструкции.</p>
        </div>
        <div className="self-start rounded-2xl border border-bark-950/10 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-cedar-700">Пример</p>
          <p className="mt-4 font-display text-2xl">20 м² × 50 мм ÷ 1000</p>
          <p className="mt-2 font-display text-4xl text-bark-900">= 1 м³</p>
          <div className="my-5 border-t border-bark-950/10"/>
          <p className="text-base leading-relaxed text-bark-700">Базовый ориентир по опубликованной ставке услуги <strong>от 600 ₽/м²</strong>: от 12 000 ₽. Это не итоговая стоимость объекта: она уточняется по толщине, основанию, условиям подачи, работам и материалам.</p>
          <Link to="/polusuhaya-styazhka-omsk/" className="mt-5 inline-flex min-h-11 items-center font-semibold text-cedar-700 underline underline-offset-4 hover:text-bark-950" onClick={() => track("cta_click", { type:"calculator_to_service" })}>Что входит в полусухую стяжку →</Link>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20" aria-labelledby="questions-title">
      <h2 id="questions-title" className="font-display text-3xl sm:text-4xl">Вопросы перед заказом</h2>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {[
          ["Как узнать среднюю толщину?", "Определите предполагаемую плоскость готового основания и замерьте требуемый слой в нескольких точках. Четыре угла дают приближение, особенно если внутри комнаты есть перепады."],
          ["Почему цена «от», а не точная?", "Площадь — только один фактор. Имеют значение основание, конструкция пола, средняя и максимальная толщина, этаж, подъезд, подача материалов и состав работ."],
          ["Можно ли рассчитать цемент и песок?", "Для сметы материалов нужны состав смеси, плотность, рецептура, влажность и технологические потери. Калькулятор намеренно не подменяет эти параметры универсальной цифрой."],
          ["Можно отправить расчёт подрядчику?", "Да. Кнопка откроет варианты связи, а подготовленный расчёт можно скопировать и отправить в MAX самостоятельно."],
        ].map(([question, answer]) => <div key={question} className="rounded-2xl border border-cream-50/10 bg-bark-900 p-5 sm:p-6">
          <h3 className="font-display text-lg">{question}</h3>
          <p className="mt-2 text-sm leading-relaxed text-cream-200/80">{answer}</p>
        </div>)}
      </div>
      <p className="mt-10 text-center text-sm text-cream-300">Нужна помощь с технологией? <Link to="/guides/remont/polusuhaya-ili-mokraya-styazhka/" className="font-semibold text-cedar-300 underline underline-offset-4">Сравните полусухую и мокрую стяжку</Link>.</p>
    </section>
  </div>;
}
