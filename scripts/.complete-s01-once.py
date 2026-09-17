"""One-time S01 integration. Remove this script after successful publication."""
from pathlib import Path
import csv
import json

ROOT = Path(__file__).resolve().parents[1]
SLUG = 'guides/remont/polusuhaya-ili-mokraya-styazhka'

def replace_once(name, before, after):
    target = ROOT / name
    text = target.read_text(encoding='utf-8')
    count = text.count(before)
    assert count == 1, f'{name}: expected one insertion point, found {count}: {before[:65]!r}'
    target.write_text(text.replace(before, after), encoding='utf-8')

replace_once('src/data/seoPages.ts', 'import rawRepairGuides from "./seo-page-guides-remont.json";', 'import rawRepairGuides from "./seo-page-guides-remont.json";\nimport rawScreedGuides from "./seo-page-guides-screed.json";')
replace_once('src/data/seoPages.ts', '...rawGuides, ...rawRepairGuides] as SeoPage[]', '...rawGuides, ...rawRepairGuides, ...rawScreedGuides] as SeoPage[]')

file = 'scripts/prerender.mjs'
replace_once(file, 'const REPAIR_GUIDE_SLUG = "guides/remont/shtukaturka-ili-styazhka-chto-snachala";', 'const REPAIR_GUIDE_SLUG = "guides/remont/shtukaturka-ili-styazhka-chto-snachala";\nconst SCREED_GUIDE_SLUG = "' + SLUG + '";')
replace_once(file, '  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-guides-remont.json"), "utf8")),', '  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-guides-remont.json"), "utf8")),\n  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-guides-screed.json"), "utf8")),')
replace_once(file, '  const isRepairGuide = page.slug === REPAIR_GUIDE_SLUG;', '  const isRepairGuide = page.slug === REPAIR_GUIDE_SLUG;\n  const isScreedGuide = page.slug === SCREED_GUIDE_SLUG;')
replace_once(file, '    : { path: "mobilnaya-banya-omsk", label: "Смотреть готовые бани" };', '    : isScreedGuide\n      ? { path: "polusuhaya-styazhka-omsk", label: "Об услуге полусухой стяжки" }\n      : { path: "mobilnaya-banya-omsk", label: "Смотреть готовые бани" };')
replace_once(file, '  const guideLinks = isGuide\n    ? isRepairGuide\n      ? repairServiceLinks', '  const guideLinks = isGuide\n    ? isRepairGuide\n      ? repairServiceLinks\n      : isScreedGuide\n        ? `<p><a href="${SITE_URL}polusuhaya-styazhka-omsk/">Полусухая стяжка в Омске</a></p>`')
replace_once(file, 'guide.slug !== page.slug && guide.slug !== REPAIR_GUIDE_SLUG', 'guide.slug !== page.slug && guide.slug !== REPAIR_GUIDE_SLUG && guide.slug !== SCREED_GUIDE_SLUG')
replace_once(file, '  const serviceGuideLink = page.slug === "burenie-skvazhiny-omsk"', '  const screedServiceLink = page.slug === "polusuhaya-styazhka-omsk"\n    ? `<p><a href="${SITE_URL}${SCREED_GUIDE_SLUG}/">Полусухая или мокрая стяжка: в чём разница?</a></p>`\n    : "";\n  const serviceGuideLink = page.slug === "burenie-skvazhiny-omsk"')
replace_once(file, '${guideLinks}${serviceGuideLink}<section>', '${guideLinks}${serviceGuideLink}${screedServiceLink}<section>')

file = 'src/pages/SeoLandingPage.tsx'
replace_once(file, 'const REPAIR_GUIDE_SLUG = "guides/remont/shtukaturka-ili-styazhka-chto-snachala";', 'const REPAIR_GUIDE_SLUG = "guides/remont/shtukaturka-ili-styazhka-chto-snachala";\nconst SCREED_GUIDE_SLUG = "' + SLUG + '";')
replace_once(file, '  const isRepairGuide = page.slug === REPAIR_GUIDE_SLUG;', '  const isRepairGuide = page.slug === REPAIR_GUIDE_SLUG;\n  const isScreedGuide = page.slug === SCREED_GUIDE_SLUG;')
replace_once(file, '      : product?.image ?? images.hero;', '      : isScreedGuide\n        ? serviceComparisonBySlug["polusuhaya-styazhka-omsk"].before\n        : product?.image ?? images.hero;')
replace_once(file, '      : product?.imageAlt ?? "Мобильная кедровая баня Сила Леса в Омске";', '      : isScreedGuide\n        ? serviceComparisonBySlug["polusuhaya-styazhka-omsk"].beforeAlt\n        : product?.imageAlt ?? "Мобильная кедровая баня Сила Леса в Омске";')
replace_once(file, 'const otherGuides = isGuide && !isRepairGuide', 'const otherGuides = isGuide && !isRepairGuide && !isScreedGuide')
replace_once(file, '  const related = isRepairGuide\n    ? seoPages.filter((item) => item.slug === "mehanizirovannaya-shtukaturka-omsk" || item.slug === "polusuhaya-styazhka-omsk")', '  const related = isRepairGuide\n    ? seoPages.filter((item) => item.slug === "mehanizirovannaya-shtukaturka-omsk" || item.slug === "polusuhaya-styazhka-omsk")\n    : isScreedGuide\n      ? seoPages.filter((item) => item.slug === "polusuhaya-styazhka-omsk")')
replace_once(file, '              ) : isRepairGuide ? (', '              ) : isScreedGuide ? (\n                <LinkButton to="/polusuhaya-styazhka-omsk/" size="lg" onClick={() => track("cta_click", { type: "guide_to_screed", where: "seo-landing", slug })}>\n                  Об услуге полусухой стяжки <ArrowIcon />\n                </LinkButton>\n              ) : isRepairGuide ? (')
replace_once(file, '          {product && (', '          {page.slug === "polusuhaya-styazhka-omsk" && (\n            <p className="mt-6 text-sm"><Link to={`/${SCREED_GUIDE_SLUG}/`} className="font-medium text-cedar-700 underline underline-offset-4 hover:text-bark-900">Полусухая или мокрая стяжка: в чём разница? →</Link></p>\n          )}\n          {product && (')
replace_once(file, '{isRepairGuide ? "Нужно согласовать штукатурку и стяжку?"', '{isScreedGuide ? "Нужно подобрать технологию стяжки?" : isRepairGuide ? "Нужно согласовать штукатурку и стяжку?"')
replace_once(file, ') : isDrillingGuide ? <LinkButton to="/burenie-skvazhiny-omsk/"', ') : isScreedGuide ? <LinkButton to="/polusuhaya-styazhka-omsk/" variant="ghost">Полусухая стяжка</LinkButton> : isDrillingGuide ? <LinkButton to="/burenie-skvazhiny-omsk/"')
replace_once(file, 'Ниже — практические ориентиры: что проверить заранее и какие вопросы согласовать для вашего участка и выбранной модели.', 'Ниже — практические ориентиры: что проверить заранее и какие вопросы согласовать для вашего объекта.')

planner_file = ROOT / 'research/yaai/planners/silalesa.json'
planner = json.loads(planner_file.read_text(encoding='utf-8'))
assert not any(t.get('id') == 'guide-screed-comparison' for t in planner['targets'])
commercial = next(t for t in planner['targets'] if t['id'] == 'service-screed')
assert commercial['intentIds'] == ['S01']
commercial['intentIds'] = []
commercial['note'] = 'Коммерческая страница услуги; информационный intent S01 закреплён за отдельным сравнительным гайдом.'
planner['targets'].append({'id': 'guide-screed-comparison', 'title': 'Полусухая или мокрая стяжка', 'kind': 'guide', 'status': 'existing', 'mode': 'primary', 'path': '/' + SLUG + '/', 'priority': 'P1', 'focusWeight': 1, 'intentIds': ['S01'], 'note': 'Отдельное информационное сравнение; CTA ведёт на коммерческую страницу полусухой стяжки.'})
planner_file.write_text(json.dumps(planner, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

csv_file = ROOT / 'docs/content-research/content-intents.csv'
with csv_file.open(encoding='utf-8-sig', newline='') as stream:
    reader = csv.DictReader(stream)
    columns = reader.fieldnames
    rows = list(reader)
assert len(rows) == 36
matched = [row for row in rows if row['intent_id'] == 'S01']
assert len(matched) == 1 and matched[0]['publication_status'] == 'research' and matched[0]['target_url'] == '/' + SLUG + '/'
matched[0]['publication_status'] = 'published'
with csv_file.open('w', encoding='utf-8-sig', newline='') as stream:
    writer = csv.DictWriter(stream, fieldnames=columns)
    writer.writeheader()
    writer.writerows(rows)

file = 'docs/MASTER-EXECUTION-PLAN.md'
replace_once(file, '- [ ] Остальной Page Planner — только после проверки intent и каннибализации.', '- [x] «Полусухая или мокрая стяжка» — отдельный гайд S01 с сопоставлением технологий, условиями применения и ссылкой на услугу; реальные фото объекта и схема слоёв остаются задачами по медиадоказательствам.\n- [ ] Остальной Page Planner — продолжать редакционную проверку пересечений без ожидания данных поисковиков.')
print('S01_INTEGRATION_OK: registry, runtime, static links, planner, 36 intents and plan updated')
