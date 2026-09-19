import fs from "node:fs/promises";

async function replace(file, oldText, newText, label) {
  const source = await fs.readFile(file, "utf8");
  const first = source.indexOf(oldText);
  if (first < 0 || source.indexOf(oldText, first + oldText.length) >= 0) {
    throw new Error(`R4 patch ${label}: expected exactly one match in ${file}`);
  }
  await fs.writeFile(file, source.slice(0, first) + newText + source.slice(first + oldText.length), "utf8");
  console.log(`R4 patched ${file}: ${label}`);
}

const seo = "src/pages/SeoLandingPage.tsx";
await replace(seo,
  '  const waText = product\n    ? `Здравствуйте! Интересует ${product.name}. Страница: ${SITE_BASE}${page.slug}/`',
  '  const waText = isService && page.requestPrompt\n    ? page.requestPrompt + " Страница: " + SITE_BASE + page.slug + "/"\n    : product\n    ? `Здравствуйте! Интересует ${product.name}. Страница: ${SITE_BASE}${page.slug}/`',
  "contextual service message");
await replace(seo,
  '{isService ? "от " : isCategory ? "от " : ""}{formatPrice(price)}',
  '{page.priceLabel ?? ((isService || isCategory ? "от " : "") + formatPrice(price))}',
  "verified unit prices");
await replace(seo,
  '                {product?.dims && <span className="text-sm text-cream-300/70">{product.dims}</span>}\n              </div>\n            )}',
  '                {product?.dims && <span className="text-sm text-cream-300/70">{product.dims}</span>}\n              </div>\n            )}\n            {isService && page.priceNote && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cream-300/85">{page.priceNote}</p>}',
  "pricing scope beside price");
await replace(seo,
  'Получить расчёт в WhatsApp <ArrowIcon />',
  'Отправить данные для расчёта <ArrowIcon />',
  "first-screen CTA");
await replace(seo, '          {product && (', '          {product && !isService && (', "remove self-linking service card");
await replace(seo,
  '      {page.methodComparison && (',
  `      {isService && page.serviceResults && page.requestChecklist && (
        <section className="bg-bark-800 py-16 text-cream-50 sm:py-20" aria-label="Что получите и как рассчитать услугу">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Результат и условия</p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl">Что входит в обсуждение заказа</h2>
              <ul className="mt-6 space-y-4 text-base leading-relaxed text-cream-100">
                {page.serviceResults.map((result) => <li key={result} className="flex gap-3"><CheckIcon className="mt-1 h-4 w-4 shrink-0 text-cedar-300" /><span>{result}</span></li>)}
              </ul>
              {page.priceNote && <p className="mt-6 rounded-xl border border-cream-50/15 p-4 text-sm leading-relaxed text-cream-200">{page.priceNote}</p>}
            </div>
            <div className="rounded-3xl border border-cream-50/15 bg-bark-950 p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Следующий шаг</p>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl">Что прислать для расчёта</h2>
              <ol className="mt-6 space-y-4">
                {page.requestChecklist.map((item, index) => <li key={item} className="flex gap-3 text-sm leading-relaxed text-cream-100 sm:text-base"><span className="shrink-0 font-display text-cedar-300">{index + 1}.</span><span>{item}</span></li>)}
              </ol>
              <p className="mt-6 text-sm leading-relaxed text-cream-300/85">Отправьте то, что уже известно. Остальные параметры уточним в разговоре — заполнение формы не требуется.</p>
              <LinkButton to={whatsappUrl(waText)} external className="mt-6" onClick={() => track("cta_click", { type: "whatsapp", where: "service-request", slug })}>Отправить параметры <ArrowIcon /></LinkButton>
            </div>
          </div>
        </section>
      )}

      {page.methodComparison && (`,
  "service outcomes and quote checklist");
await replace(seo,
  'isPlasterGuide ? "Пришлите площадь, высоту и фото стен. Обсудим объём, доступ и состав работ перед расчётом." : "Позвоните или отправьте сообщение — уточним условия и следующий шаг без обязательства оформлять заказ сразу."',
  'isPlasterGuide ? "Пришлите площадь, высоту и фото стен. Обсудим объём, доступ и состав работ перед расчётом." : isService ? "Пришлите параметры объекта и фотографии, которые есть под рукой. Уточним остальные данные и состав работ перед итоговой сметой." : "Позвоните или отправьте сообщение — уточним условия и следующий шаг без обязательства оформлять заказ сразу."',
  "bottom service guidance");
await replace(seo,
  '{isPlasterGuide ? "Отправить площадь и фото" : "Написать в WhatsApp"}',
  '{isPlasterGuide ? "Отправить площадь и фото" : isService ? "Отправить данные для расчёта" : "Написать в WhatsApp"}',
  "bottom service CTA");

const hub = "src/sections/ServicesAbout.tsx";
await replace(hub,
  'import { company, formatPrice, mapsUrl, services } from "../data/products";',
  'import { company, formatPrice, mapsUrl, services } from "../data/products";',
  "hub import verified");
await replace(hub,
  '    .map((page) => [page.productId as string, page.slug]),',
  '    .map((page) => [page.productId as string, page]),',
  "hub canonical page records");
await replace(hub,
  'index="Другие услуги"\n            title={<span id="services-title">Строительные работы — отдельно от банной линейки</span>}\n            lead="Эти направления не смешиваем с выбором бани на главной странице. Здесь собраны отдельные услуги компании: бурение, стяжка и механизированная штукатурка."',
  'index="Строительные услуги · Омск"\n            title={<span id="services-title">Бурение и отделочные работы для дома и участка</span>}\n            lead="Три самостоятельные услуги: бурение скважины, полусухая стяжка и механизированная штукатурка. Смотрите стартовую цену за единицу работ, условия и что прислать для расчёта."',
  "hub offer");
await replace(hub,
  'Цены услуг — стартовые ориентиры с сайта компании; расчёт после выезда мастера или замерщика.',
  'Цены «от» указаны за м² или погонный метр. Итоговую смету уточняем по объёму и условиям вашего объекта.',
  "honest hub price note");
await replace(hub,
  '            const landingSlug = serviceLandingByProductId.get(s.id);\n            const target = landingSlug ? `/${landingSlug}/` : `/product/${s.id}`;',
  '            const landing = serviceLandingByProductId.get(s.id);\n            const target = landing ? `/${landing.slug}/` : `/product/${s.id}`;',
  "hub target");
await replace(hub,
  '<p className="mt-1 text-sm text-cream-300/75 max-w-2xl">{s.tagline}</p>',
  '<p className="mt-1 text-sm text-cream-300/75 max-w-2xl">{landing?.lead ?? s.tagline}</p>',
  "hub customer-facing value");
await replace(hub,
  '<span className="font-display text-lg text-cream-50">от {formatPrice(s.price)}</span>',
  '<span className="font-display text-lg text-cream-50">{landing?.priceLabel ?? `от ${formatPrice(s.price)}`}</span>',
  "hub per-unit prices");
await replace(hub, 'Подробнее <ArrowIcon />', 'Условия и расчёт <ArrowIcon />', "hub action label");

const app = "src/App.tsx";
const servicesDescription = "Строительные услуги в Омске: механизированная штукатурка от 550 ₽/м², полусухая стяжка от 600 ₽/м², бурение скважин от 2 500 ₽/пог. м. Условия и расчёт.";
await replace(app,
  'const SERVICES_DESCRIPTION = "Строительные услуги Сила Леса в Омске: бурение скважин, полусухая стяжка пола и механизированная штукатурка. Стартовые цены и отдельные страницы услуг.";',
  'const SERVICES_DESCRIPTION = ' + JSON.stringify(servicesDescription) + ';',
  "hub SEO description");
await replace(app,
  '    <div ref={root} className="pt-16">\n      <Services />',
  '    <div ref={root} className="pt-16">\n      <h1 className="sr-only">Строительные услуги в Омске</h1>\n      <Services />',
  "hub semantic h1");

const prerender = "scripts/prerender.mjs";
await replace(prerender,
  '  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-next.json"), "utf8")),\n];',
  '  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-next.json"), "utf8")),\n  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r4.json"), "utf8")),\n];',
  "R4 server-side registry parity");
await replace(prerender,
  '  description: "Строительные услуги Сила Леса в Омске: бурение скважин, полусухая стяжка пола и механизированная штукатурка. Стартовые цены и отдельные страницы услуг.",',
  '  description: ' + JSON.stringify(servicesDescription) + ',',
  "hub prerender SEO parity");
await replace(prerender,
  '  lead: "Отдельные направления компании: бурение скважин, полусухая стяжка пола и механизированная штукатурка. Каждая услуга вынесена на свою страницу с условиями и стартовой ценой.",',
  '  lead: "Бурение скважин, полусухая стяжка и механизированная штукатурка: стартовые цены за единицу работ, условия и перечень данных для расчёта на каждой странице услуги.",',
  "hub prerender lead");
await replace(prerender,
  '  const about = page.kind === "service"',
  `  const serviceBlock = page.kind === "service" && page.priceLabel && page.requestChecklist && page.serviceResults && page.requestPrompt
    ? \`<section aria-label="Стоимость и расчёт услуги"><h2>Цена и условия</h2><p><strong>\${escapeHtml(page.priceLabel)}</strong> — \${escapeHtml(page.priceNote ?? "Стоимость уточняется по объекту.")}</p><h2>Что получит клиент</h2><ul>\${page.serviceResults.map((item) => \`<li>\${escapeHtml(item)}</li>\`).join("")}</ul><h2>Что прислать для расчёта</h2><ol>\${page.requestChecklist.map((item) => \`<li>\${escapeHtml(item)}</li>\`).join("")}</ol><p><a href="https://wa.me/\${whatsappMatch[1]}?text=\${encodeURIComponent(page.requestPrompt + " Страница: " + SITE_URL + page.slug + "/")}">Отправить данные для расчёта в WhatsApp</a></p></section>\`
    : "";

  const about = page.kind === "service"`,
  "prerender first-class service offer");
await replace(prerender,
  '<ul>\${points}</ul>\${methodComparison}',
  '<ul>\${points}</ul>\${serviceBlock}\${methodComparison}',
  "prerender service content and CTA");
await replace(prerender,
  '<li><a href="\${SITE_URL}\${page.slug}/">\${escapeHtml(page.h1)}</a><p>\${escapeHtml(page.description)}</p></li>',
  '<li><a href="\${SITE_URL}\${page.slug}/">\${escapeHtml(page.h1)}</a><p>\${escapeHtml(page.priceLabel ?? "")}</p><p>\${escapeHtml(page.lead)}</p></li>',
  "hub prerender real prices and leads");

const packageFile = "package.json";
await replace(packageFile, 'node scripts/check-r3.mjs"', 'node scripts/check-r3.mjs && node scripts/check-r4.mjs"', "R4 build gate");
console.log("R4 patch complete.");
