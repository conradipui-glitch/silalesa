import fs from 'node:fs';
const change = (file, edits) => {
 let s=fs.readFileSync(file,'utf8');
 for(const [oldText,newText,label] of edits){
  const count=s.split(oldText).length-1;
  if(count!==1) throw Error(`${file}: ${label}: expected one match, found ${count}`);
  s=s.replace(oldText,newText);
 }
 fs.writeFileSync(file,s);
 console.log(`Patched ${file}`);
};
change('src/data/seoPages.ts', [
 ['import rawR4Overrides from "./seo-page-overrides-r4.json";', 'import rawR4Overrides from "./seo-page-overrides-r4.json";\nimport rawR5Overrides from "./seo-page-overrides-r5.json";', 'R5 import'],
 ['  requestPrompt?: string;\n};','  requestPrompt?: string;\n  choiceHeading?: string;\n  choiceIntro?: string;\n  choiceModels?: string[];\n  choicePaths?: { title: string; benefit: string; condition: string }[];\n  choiceChecklist?: string[];\n  choicePrompt?: string;\n  choiceCtaLabel?: string;\n};','R5 typed fields'],
 ['...rawR3Overrides, ...rawR4Overrides] as SeoPageOverride[]','...rawR3Overrides, ...rawR4Overrides, ...rawR5Overrides] as SeoPageOverride[]','R5 override order'],
]);
change('src/pages/SeoLandingPage.tsx', [
 ['import { PlasterProcessGuide } from "../components/PlasterProcessGuide";','import { PlasterProcessGuide } from "../components/PlasterProcessGuide";\nimport { SaunaChoiceGuide } from "../components/SaunaChoiceGuide";\nimport saunaChoiceModels from "../data/sauna-choice-models.json";','R5 imports'],
 ['  const isGuide = page.kind === "guide";','  const isGuide = page.kind === "guide";\n  const isSaunaChoiceGuide = Boolean(page.choiceModels?.length);\n  const firstChoice = page.choiceModels?.length ? saunaChoiceModels.find((model) => model.key === page.choiceModels?.[0]) : undefined;\n  const lastChoice = page.choiceModels?.length ? saunaChoiceModels.find((model) => model.key === page.choiceModels?.at(-1)) : undefined;','R5 route and model data'],
 [': isGuide\n      ? `Здравствуйте! Хочу уточнить информацию по гайду «${page.h1}». Страница: ${SITE_BASE}${page.slug}/`',': isGuide && page.choicePrompt\n      ? `${page.choicePrompt} Страница: ${SITE_BASE}${page.slug}/`\n      : isGuide\n      ? `Здравствуйте! Хочу уточнить информацию по гайду «${page.h1}». Страница: ${SITE_BASE}${page.slug}/`','contextual WhatsApp'],
 ['            {!isGuide && (','            {isSaunaChoiceGuide && firstChoice && lastChoice && (\n              <div className="mt-6 rounded-2xl border border-cedar-300/30 bg-bark-800 p-4 sm:p-5">\n                <p className="font-display text-xl text-cedar-300">{firstChoice.name} — от {formatPrice(firstChoice.price)}{firstChoice.key !== lastChoice.key ? ` · ${lastChoice.name} — от ${formatPrice(lastChoice.price)}` : ""}</p>\n                <p className="mt-2 text-sm leading-relaxed text-cream-200">Выберите планировку ниже. Условия доставки и итоговый состав уточним под ваш участок.</p>\n              </div>\n            )}\n            {!isGuide && (','early visible model price'],
 [') : isGuide ? (\n                <LinkButton to={isDrillingGuide',') : isSaunaChoiceGuide ? (\n                <>\n                  <LinkButton to={whatsappUrl(waText)} size="lg" external onClick={() => track("cta_click", { type: "whatsapp", where: "r5-guide-hero", slug })}>{page.choiceCtaLabel ?? "Помогите выбрать баню"} <ArrowIcon /></LinkButton>\n                  <LinkButton to="/mobilnaya-banya-omsk/" size="lg" variant="ghost">Каталог моделей <ArrowIcon /></LinkButton>\n                </>\n              ) : isGuide ? (\n                <LinkButton to={isDrillingGuide','hero buyer action'],
 ['      {isPlasterGuide && <PlasterProcessGuide />}','      {isSaunaChoiceGuide && <SaunaChoiceGuide page={page} />}\n\n      {isPlasterGuide && <PlasterProcessGuide />}','buyer model cards'],
 ['      {isGuide && page.comparison && (\n        <section','      {isGuide && page.comparison && (\n        <details open={!isSaunaChoiceGuide} className="bg-bark-800 text-cream-50">\n          <summary className="mx-auto max-w-7xl cursor-pointer px-4 py-5 font-display text-xl font-semibold sm:px-6">Подробная таблица сравнения готовой бани и строительства</summary>\n        <section','comparison optional open'],
 ['        </section>\n      )}\n      {isGuide && page.sections &&','        </section>\n        </details>\n      )}\n      {isGuide && page.sections &&','comparison closing'],
]);
change('scripts/prerender.mjs', [
 ['import { renderPlasterFallback } from "./plaster-fallback.mjs";','import { renderPlasterFallback } from "./plaster-fallback.mjs";\nimport { saunaChoiceFallback } from "./sauna-choice-fallback.mjs";','static helper import'],
 ['const pageOverrides = [','const saunaChoiceModels = JSON.parse(await fs.readFile(path.join(ROOT, "src/data/sauna-choice-models.json"), "utf8"));\nconst pageOverrides = [','static canonical models'],
 ['  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r4.json"), "utf8")),','  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r4.json"), "utf8")),\n  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-overrides-r5.json"), "utf8")),','R5 static overrides'],
 ['  const isMaterialGuide = page.slug === MATERIAL_GUIDE_SLUG;','  const isMaterialGuide = page.slug === MATERIAL_GUIDE_SLUG;\n  const saunaChoice = saunaChoiceFallback(page, saunaChoiceModels, SITE_URL, whatsappMatch[1]);','R5 static block'],
 ['  const comparison = isGuide && page.comparison\n    ? `<section><h2>','  const comparison = isGuide && page.comparison\n    ? `${page.choiceModels?.length ? \'<details><summary>Подробная таблица сравнения готовой бани и строительства</summary>\' : \'\'}<section><h2>','static comparison open'],
 ['.join("")}</tbody></table></section>`\n    : "";','.join("")}</tbody></table></section>${page.choiceModels?.length ? \'</details>\' : \'\'}`\n    : "";','static comparison close'],
 ['${plasterFirstAnswer}<ul>${points}</ul>${serviceBlock}${plasterCta}${comparison}','${plasterFirstAnswer}${saunaChoice.first}<ul>${points}</ul>${serviceBlock}${saunaChoice.panel}${plasterCta}${comparison}','static order'],
]);
change('scripts/check-r1.mjs', [
 ['const P01 = \'guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka\';','const P01 = \'guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka\';\nconst r5Slugs = new Set(JSON.parse(read("src/data/seo-page-overrides-r5.json")).map((page) => page.slug));','R1 defer R5 content'],
 ['    assert(html.includes(escapeHtml(page.lead)), `lead ${page.slug}`);','    if (!r5Slugs.has(page.slug)) assert(html.includes(escapeHtml(page.lead)), `lead ${page.slug}`);','R1 guide lead'],
 ['    for (const item of page.summary ?? page.points) assert(html.includes(escapeHtml(item)), `summary/points ${page.slug}`);','    if (!r5Slugs.has(page.slug)) for (const item of page.summary ?? page.points) assert(html.includes(escapeHtml(item)), `summary/points ${page.slug}`);','R1 guide points'],
]);
change('package.json', [['node scripts/check-r4-1.mjs",','node scripts/check-r4-1.mjs && node scripts/check-r5.mjs",','register regression']]);
console.log('R5 integration patches applied');