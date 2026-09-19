import { whatsappUrl } from "../data/products";
import { track } from "../lib/utils";

const SITE = "https://conradipui-glitch.github.io/silalesa/";

type Props = {
  guide: "p02" | "s01" | "s04";
  title: string;
  prompt: string;
  context: string;
};

export function RepairGuideAction({ guide, title, prompt, context }: Props) {
  const plaster = guide !== "s01";
  const slug = guide === "p02" ? "guides/remont/gipsovaya-ili-tsementnaya-shtukaturka" : guide === "s01" ? "guides/remont/polusuhaya-ili-mokraya-styazhka" : "guides/remont/shtukaturka-ili-styazhka-chto-snachala";
  const message = `Здравствуйте! Хочу обсудить ${guide === "p02" ? "материал и расчёт механизированной штукатурки" : guide === "s01" ? "расчёт полусухой стяжки" : "очередность штукатурки и стяжки"}. ${context}. Страница: ${SITE}${slug}/`;
  return (
    <aside aria-label="Следующий шаг по вашему сценарию" className="mt-6 rounded-2xl border border-cedar-300/45 bg-bark-800 p-5 text-cream-50 sm:p-7">
      <p className="text-xs font-bold uppercase tracking-widest text-cedar-300">Ваш следующий шаг</p>
      <h4 className="mt-2 font-display text-xl sm:text-2xl">{title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-cream-100">{prompt}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href={whatsappUrl(message)} target="_blank" rel="noopener noreferrer" onClick={() => track("cta_click", { type: "whatsapp", where: `r3-${guide}`, slug })} className="inline-flex min-h-12 items-center justify-center rounded-full bg-cedar-300 px-5 py-3 text-center text-sm font-semibold text-bark-950 hover:bg-cream-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300">Обсудить объект в WhatsApp ↗</a>
        <a href={`${import.meta.env.BASE_URL}${plaster ? "mehanizirovannaya-shtukaturka-omsk" : "polusuhaya-styazhka-omsk"}/`} onClick={() => track("cta_click", { type: "guide_to_service", where: `r3-${guide}`, slug })} className="inline-flex min-h-12 items-center justify-center rounded-full border border-cream-50/40 px-5 py-3 text-center text-sm font-medium text-cream-50 hover:border-cedar-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300">{plaster ? "Услуга штукатурки" : "Услуга полусухой стяжки"} →</a>
        {guide === "s04" && <a href={`${import.meta.env.BASE_URL}polusuhaya-styazhka-omsk/`} onClick={() => track("cta_click", { type: "guide_to_screed", where: "r3-s04", slug })} className="inline-flex min-h-12 items-center justify-center rounded-full border border-cream-50/40 px-5 py-3 text-sm font-medium text-cream-50 hover:border-cedar-300">Услуга стяжки →</a>}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-cream-200">Информация из подсказки — ориентир. Состав работ и итоговую стоимость согласуем после уточнения объекта; заявлены механизированная штукатурка и полусухая стяжка, не любые альтернативные технологии.</p>
    </aside>
  );
}
