import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const site = "https://conradipui-glitch.github.io/silalesa/";
const source = await fs.readFile(path.join(root, "src/data/products.ts"), "utf8");
const match = source.match(/whatsapp:\s*"(\d+)"/);
if (!match) throw new Error("Canonical WhatsApp number not found");
const whatsapp = match[1];
const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const link = (slug, service, text, prompt) => {
  const msg = `Здравствуйте! ${prompt} Страница: ${site}${slug}/`;
  return `<p><a href="https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}">${escapeHtml(text)} в WhatsApp</a> · <a href="${site}${service}/">Открыть страницу услуги</a></p>`;
};
const blocks = [
  {
    slug: "guides/remont/gipsovaya-ili-tsementnaya-shtukaturka",
    html: `<section aria-label="Выбор гипсовой и цементной штукатурки без JavaScript"><h2>Быстрый выбор штукатурки: три ситуации</h2><table><caption>Условия применения — ориентиры, не замена паспорта конкретной смеси</caption><thead><tr><th scope="col">Где</th><th scope="col">С чего начать</th></tr></thead><tbody><tr><th scope="row">Сухой интерьер</th><td>Рассмотрите обе технологии. Проверьте основание и отделку.</td></tr><tr><th scope="row">Кухня или ванная</th><td>Выясните попадание воды, совместимость состава, защиту и гидроизоляцию мокрых зон.</td></tr><tr><th scope="row">Фасад</th><td>Нужна смесь, прямо разрешённая для наружного применения.</td></tr></tbody></table><h3>Что подготовить для подбора смеси и расчёта</h3><p>Площадь, фотографии стен, помещение, основание и предполагаемая отделка. Под плитку проверяют прочность, слой, клей и, при необходимости, гидроизоляцию. Доступна услуга механизированной штукатурки, не любой способ нанесения.</p>${link("guides/remont/gipsovaya-ili-tsementnaya-shtukaturka", "mehanizirovannaya-shtukaturka-omsk", "Обсудить материал и расчёт", "Нужно подобрать смесь и рассчитать механизированную штукатурку. Площадь и фотографии стен пришлю в чат.")}</section>`,
  },
  {
    slug: "guides/remont/polusuhaya-ili-mokraya-styazhka",
    html: `<section aria-label="Выбор стяжки без JavaScript"><h2>Какой пол у вас: с чего начинать сравнение</h2><ul><li><strong>Обычная комната:</strong> сравните полные конструкции и сметы на одну площадь и качество.</li><li><strong>Тёплый пол:</strong> проверьте проект, испытания системы до закрытия и требования к слоям.</li><li><strong>Санузел:</strong> отдельно согласуйте гидроизоляцию, уклоны и примыкания.</li><li><strong>Ограничена нагрузка:</strong> проектировщик проверяет массу всей конструкции.</li><li><strong>Есть проект:</strong> замена указанной технологии только после согласования.</li></ul><p>Для расчёта полусухой стяжки передайте площадь, этаж, фотографии основания, данные о подъезде, тёплом поле и будущем покрытии. Мокрая стяжка приведена только для сравнения: компания заявляет полусухую.</p>${link("guides/remont/polusuhaya-ili-mokraya-styazhka", "polusuhaya-styazhka-omsk", "Обсудить полусухую стяжку", "Хочу рассчитать полусухую стяжку. Площадь, этаж и фото основания пришлю в чат.")}</section>`,
  },
  {
    slug: "guides/remont/shtukaturka-ili-styazhka-chto-snachala",
    html: `<section aria-label="Следующий шаг для согласования порядка ремонта"><h2>Как передать работу между двумя бригадами</h2><p><strong>Обычный маршрут:</strong> согласовать отметки и коммуникации → при необходимости потолок → мокрая штукатурка стен → подготовка основания и скрытых работ → стяжка и уход. Если пол уже готов, до штукатурки проверьте допуск и защиту; для ГКЛ последовательность задаёт конкретная система.</p><p>Пришлите план, площади, фотографии стен и пола, состояние стяжки и сведения о тёплом поле. Отдельно согласуются объём и смета каждой услуги; единый пакет «под ключ» не предполагается.</p>${link("guides/remont/shtukaturka-ili-styazhka-chto-snachala", "mehanizirovannaya-shtukaturka-omsk", "Обсудить очередность работ", "Хочу согласовать очередность штукатурки и стяжки. План и фотографии пришлю в чат.")}<p><a href="${site}polusuhaya-styazhka-omsk/">Полусухая стяжка — отдельная услуга</a></p></section>`,
  },
];
for (const { slug, html: fallback } of blocks) {
  const file = path.join(root, "dist", slug, "index.html");
  const html = await fs.readFile(file, "utf8");
  if (!html.includes('data-prerendered="true"')) throw new Error(`Not a prerendered page: ${slug}`);
  if (html.includes('aria-label="Выбор стяжки без JavaScript"') || html.includes('aria-label="Выбор гипсовой и цементной штукатурки без JavaScript"') || html.includes('aria-label="Следующий шаг для согласования порядка ремонта"')) throw new Error(`R3 fallback already present: ${slug}`);
  const rootStart = html.indexOf('<div id="root" data-prerendered="true">');
  const firstListEnd = html.indexOf("</ul>", rootStart);
  if (rootStart < 0 || firstListEnd < 0) throw new Error(`Cannot locate opening summary: ${slug}`);
  const insertion = firstListEnd + "</ul>".length;
  await fs.writeFile(file, html.slice(0, insertion) + fallback + html.slice(insertion), "utf8");
}
console.log("R3: no-JS guides have matching first-answer scenarios and contextual WhatsApp/service links.");
