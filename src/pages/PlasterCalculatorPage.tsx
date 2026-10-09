import { useEffect } from "react";
import { Link } from "../lib/router";
import { PlasterCalculator } from "../components/PlasterCalculator";
import { track } from "../lib/utils";

const site = "https://conradipui-glitch.github.io/silalesa/";
const title = "Калькулятор штукатурки стен онлайн: площадь, проёмы, цена — Сила Леса";
const description = "Посчитайте штукатурку стен онлайн: комнаты, окна, двери, толщина слоя, площадь, объём и ориентир цены в Омске. Расход мешков — по данным с упаковки.";

export function PlasterCalculatorPage() {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    const previous = { title: document.title, desc: meta?.content, url: canonical?.href, ogTitle: ogTitle?.content, ogDescription: ogDescription?.content, ogUrl: ogUrl?.content };
    const url = site + "kalkulyator-shtukaturki-sten/";
    document.title = title;
    if (meta) meta.content = description;
    if (canonical) canonical.href = url;
    if (ogTitle) ogTitle.content = title;
    if (ogDescription) ogDescription.content = description;
    if (ogUrl) ogUrl.content = url;
    return () => {
      document.title = previous.title;
      if (meta && previous.desc !== undefined) meta.content = previous.desc;
      if (canonical && previous.url) canonical.href = previous.url;
      if (ogTitle && previous.ogTitle !== undefined) ogTitle.content = previous.ogTitle;
      if (ogDescription && previous.ogDescription !== undefined) ogDescription.content = previous.ogDescription;
      if (ogUrl && previous.ogUrl !== undefined) ogUrl.content = previous.ogUrl;
    };
  }, []);
  return <div className="bg-bark-950 text-cream-50">
    <header className="mx-auto max-w-7xl px-4 pb-8 pt-28 sm:px-6 sm:pt-36 lg:px-8">
      <nav aria-label="Хлебные крошки" className="text-xs text-cream-300/80"><Link to="/" className="hover:text-cedar-300">Главная</Link><span aria-hidden="true" className="mx-2">/</span>Калькулятор штукатурки</nav>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.65fr)] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cedar-300">Бесплатный строительный инструмент · Омск</p>
          <h1 className="mt-4 max-w-4xl font-display text-[clamp(30px,4.6vw,60px)] font-semibold leading-[1.07] tracking-tight [overflow-wrap:anywhere]">Калькулятор штукатурки стен</h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-cream-200 sm:text-lg">Сколько квадратных метров нужно оштукатурить, сколько объёма займёт слой и на какую сумму работ ориентироваться? Введите размеры помещений и проёмов — результат появится сразу.</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-cream-300">
            <span className="rounded-full border border-cream-50/15 px-3 py-2">Несколько комнат</span>
            <span className="rounded-full border border-cream-50/15 px-3 py-2">Окна и двери</span>
            <span className="rounded-full border border-cream-50/15 px-3 py-2">Без регистрации</span>
          </div>
        </div>
        <div className="rounded-2xl border border-cream-50/10 bg-bark-900 p-5">
          <p className="font-display text-lg text-cedar-300">Ваш результат</p>
          <p className="mt-2 text-sm leading-relaxed text-cream-200">Чистая площадь стен, объём слоя, стартовая стоимость работ и, если введёте паспортный расход смеси, количество мешков.</p>
        </div>
      </div>
    </header>
    <section id="raschet" aria-label="Калькулятор штукатурки стен" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"><PlasterCalculator /></section>
    <section className="bg-cream-50 py-14 text-bark-950 sm:py-20" aria-labelledby="method">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cedar-700">Понятная математика</p>
          <h2 id="method" className="mt-3 font-display text-3xl leading-tight sm:text-4xl">Как считается штукатурка</h2>
          <p className="mt-5 leading-relaxed text-bark-700">Для прямоугольной комнаты площадь стен до проёмов — <strong>2 × (длина + ширина) × высота</strong>. Из неё вычитаем площади окон и дверей. Средняя толщина слоя позволяет получить геометрический объём: чистая площадь × толщина в мм ÷ 1000.</p>
          <p className="mt-4 leading-relaxed text-bark-700">Расчёт количества сухой смеси включается отдельно. Укажите расход <strong>с упаковки конкретной смеси в кг/м² на 10 мм</strong> и вес мешка. Тогда калькулятор учтёт толщину и ваш запас. Без этих данных количество мешков не вычисляем.</p>
          <p className="mt-4 leading-relaxed text-bark-700">Реальная работа может включать откосы, армирование, подготовку основания, маяки и другие операции. Они не спрятаны в коэффициенты: объём и итоговая смета зависят от осмотра и выбранной технологии.</p>
        </div>
        <aside className="self-start rounded-2xl border border-bark-950/10 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cedar-700">Пример без регистрации</p>
          <p className="mt-3 font-display text-lg">Комната 5 × 4 × 2,7 м</p>
          <p className="mt-2 text-sm leading-relaxed text-bark-700">Стены: 48,6 м². Окно 1,5 м² и дверь 1,8 м². После вычета — <strong>45,3 м²</strong>. При слое 15 мм геометрический объём <strong>0,6795 м³</strong>.</p>
          <p className="mt-4 font-display text-3xl text-bark-950">от 24 915 ₽</p>
          <p className="mt-2 text-sm leading-relaxed text-bark-700">По опубликованной стартовой ставке 550 ₽/м². Это ориентир, а не готовая смета. Толщина и дополнительные работы могут изменить стоимость.</p>
          <Link to="/mehanizirovannaya-shtukaturka-omsk/" className="mt-5 inline-flex min-h-11 items-center font-semibold text-cedar-700 underline underline-offset-4 hover:text-bark-950" onClick={() => track("cta_click", { type: "plaster_calculator_to_service" })}>Условия механизированной штукатурки →</Link>
        </aside>
      </div>
    </section>
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20" aria-labelledby="plaster-questions">
      <h2 id="plaster-questions" className="font-display text-3xl leading-tight sm:text-4xl">Частые вопросы</h2>
      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {[
          ["Нужно ли вычитать окна и двери?", "Да, для геометрии гладких стен. Но откосы, перемычки и дополнительные поверхности не входят в результат и учитываются при уточнении объёма работ."],
          ["Как узнать толщину штукатурки?", "Ориентируются на обследование поверхности и проектную плоскость стены. В калькулятор вводят предполагаемое среднее значение, а не обязательную норму."],
          ["Почему мешки не показываются сразу?", "Разные смеси имеют разный паспортный расход и фасовку. Универсальное количество мешков без марки, расхода и толщины дало бы ложную точность."],
          ["Можно отправить расчёт подрядчику?", "Да. Кнопка подготовит сообщение с размерами и площадями для WhatsApp. Вы проверите и отправите его сами, без автоматической передачи данных."],
        ].map(([question, answer]) => <article key={question} className="rounded-2xl border border-cream-50/10 bg-bark-900 p-5 sm:p-6">
          <h3 className="font-display text-lg">{question}</h3><p className="mt-2 text-sm leading-relaxed text-cream-200/85">{answer}</p>
        </article>)}
      </div>
      <p className="mt-10 text-sm text-cream-300">Читайте также: <Link to="/guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka/" className="font-semibold text-cedar-300 underline underline-offset-4">механизированная или ручная штукатурка</Link> и <Link to="/guides/remont/gipsovaya-ili-tsementnaya-shtukaturka/" className="font-semibold text-cedar-300 underline underline-offset-4">гипсовая или цементная смесь</Link>.</p>
    </section>
  </div>;
}
