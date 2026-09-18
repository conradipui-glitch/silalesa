"""Temporary, guarded P02 integration; remove before merging."""
from pathlib import Path
import csv
import json

SLUG = 'guides/remont/gipsovaya-ili-tsementnaya-shtukaturka'

def edit(path, changes):
    file = Path(path)
    text = file.read_text(encoding='utf-8-sig')
    for old, new in changes:
        occurrences = text.count(old)
        if occurrences != 1:
            raise AssertionError(f'{path}: expected one anchor; found {occurrences}: {old[:105]}')
        text = text.replace(old, new, 1)
    file.write_text(text, encoding='utf-8', newline='\n')

edit('src/data/seoPages.ts', [
    ('import rawPlasterGuides from "./seo-page-guides-plaster.json";', 'import rawPlasterGuides from "./seo-page-guides-plaster.json";\nimport rawMaterialGuides from "./seo-page-guides-materials.json";'),
    ('...rawScreedGuides, ...rawPlasterGuides] as SeoPage[];', '...rawScreedGuides, ...rawPlasterGuides, ...rawMaterialGuides] as SeoPage[];'),
])

edit('scripts/prerender.mjs', [
    ('const PLASTER_GUIDE_SLUG = "guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka";', 'const PLASTER_GUIDE_SLUG = "guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka";\nconst MATERIAL_GUIDE_SLUG = "' + SLUG + '";'),
    ('  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-guides-plaster.json"), "utf8")),', '  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-guides-plaster.json"), "utf8")),\n  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-guides-materials.json"), "utf8")),'),
    ('  const isPlasterGuide = page.slug === PLASTER_GUIDE_SLUG;', '  const isPlasterGuide = page.slug === PLASTER_GUIDE_SLUG;\n  const isMaterialGuide = page.slug === MATERIAL_GUIDE_SLUG;'),
    ('  const screedServiceLink = page.slug === "polusuhaya-styazhka-omsk"', '  const materialServiceLink = page.slug === "mehanizirovannaya-shtukaturka-omsk" || isPlasterGuide\n    ? `<p><a href="${SITE_URL}${MATERIAL_GUIDE_SLUG}/">Гипсовая или цементная штукатурка: что выбрать?</a></p>`\n    : "";\n  const screedServiceLink = page.slug === "polusuhaya-styazhka-omsk"'),
    (': isPlasterGuide\n        ? `<p><a href="${SITE_URL}mehanizirovannaya-shtukaturka-omsk/">Механизированная штукатурка в Омске</a></p>`', ': isPlasterGuide || isMaterialGuide\n        ? `<p><a href="${SITE_URL}mehanizirovannaya-shtukaturka-omsk/">Механизированная штукатурка в Омске</a></p>`'),
    ('guide.slug !== PLASTER_GUIDE_SLUG).map', 'guide.slug !== PLASTER_GUIDE_SLUG && guide.slug !== MATERIAL_GUIDE_SLUG).map'),
    ('${guideLinks}${serviceGuideLink}${screedServiceLink}${plasterServiceLink}<section>', '${guideLinks}${serviceGuideLink}${screedServiceLink}${plasterServiceLink}${materialServiceLink}<section>'),
])

edit('src/pages/SeoLandingPage.tsx', [
    ('import { BeforeAfter } from "../components/BeforeAfter";', 'import { BeforeAfter } from "../components/BeforeAfter";\nimport { PlasterMaterialGuide } from "../components/PlasterMaterialGuide";'),
    ('const PLASTER_GUIDE_SLUG = "guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka";', 'const PLASTER_GUIDE_SLUG = "guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka";\nconst MATERIAL_GUIDE_SLUG = "' + SLUG + '";'),
    ('  const isPlasterGuide = page.slug === PLASTER_GUIDE_SLUG;', '  const isPlasterGuide = page.slug === PLASTER_GUIDE_SLUG;\n  const isMaterialGuide = page.slug === MATERIAL_GUIDE_SLUG;'),
    ('  const image = isDrillingGuide', '  const image = isMaterialGuide\n    ? serviceComparisonBySlug["mehanizirovannaya-shtukaturka-omsk"].before\n    : isDrillingGuide'),
    ('  const imageAlt = isDrillingGuide', '  const imageAlt = isMaterialGuide\n    ? serviceComparisonBySlug["mehanizirovannaya-shtukaturka-omsk"].beforeAlt\n    : isDrillingGuide'),
    ('const otherGuides = isGuide && !isRepairGuide && !isScreedGuide && !isPlasterGuide', 'const otherGuides = isGuide && !isRepairGuide && !isScreedGuide && !isPlasterGuide && !isMaterialGuide'),
    ('  const related = isRepairGuide', '  const related = isMaterialGuide\n    ? seoPages.filter((item) => item.slug === "mehanizirovannaya-shtukaturka-omsk" || item.slug === PLASTER_GUIDE_SLUG)\n    : isRepairGuide'),
    (') : isPlasterGuide ? (\n                <LinkButton', ') : isPlasterGuide || isMaterialGuide ? (\n                <LinkButton'),
    ('          {page.slug === "polusuhaya-styazhka-omsk" && (\n            <p className="mt-6 text-sm">', '          {page.slug === "mehanizirovannaya-shtukaturka-omsk" && (\n            <p className="mt-6 text-sm"><Link to={`/${MATERIAL_GUIDE_SLUG}/`} className="font-medium text-cedar-700 underline underline-offset-4 hover:text-bark-900">Гипсовая или цементная штукатурка: что выбрать? →</Link></p>\n          )}\n          {page.slug === "polusuhaya-styazhka-omsk" && (\n            <p className="mt-6 text-sm">'),
    ('      {isGuide && page.comparison && (', '      {isMaterialGuide && <PlasterMaterialGuide />}\n\n      {isGuide && page.comparison && ('),
    ('{isPlasterGuide ? "Нужно выбрать способ штукатурки стен?"', '{isMaterialGuide ? "Нужно подобрать штукатурную систему?" : isPlasterGuide ? "Нужно выбрать способ штукатурки стен?"'),
    (': isPlasterGuide ? <LinkButton to="/mehanizirovannaya-shtukaturka-omsk/" variant="ghost">', ': isPlasterGuide || isMaterialGuide ? <LinkButton to="/mehanizirovannaya-shtukaturka-omsk/" variant="ghost">'),
])

planner_path = Path('research/yaai/planners/silalesa.json')
planner = json.loads(planner_path.read_text(encoding='utf-8-sig'))
assert not any('P02' in target.get('intentIds', []) for target in planner['targets'])
assert not any(target['id'] == 'guide-plaster-materials' for target in planner['targets'])
planner['targets'].append({
    'id': 'guide-plaster-materials', 'title': 'Гипсовая или цементная штукатурка',
    'kind': 'guide', 'status': 'existing', 'mode': 'primary',
    'path': '/' + SLUG + '/', 'priority': 'P2', 'focusWeight': 1,
    'intentIds': ['P02'],
    'note': 'Информационный выбор штукатурной системы; интерактивный ориентир и переход на услугу. P01 — отдельный выбор способа нанесения.',
})
planner_path.write_text(json.dumps(planner, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')

csv_path = Path('docs/content-research/content-intents.csv')
lines = csv_path.read_text(encoding='utf-8-sig').splitlines()
assert len(lines) == 37
selected = [index for index, line in enumerate(lines) if line.startswith('P02,')]
assert len(selected) == 1 and lines[selected[0]].endswith(',research')
lines[selected[0]] = lines[selected[0]][:-len('research')] + 'published'
csv_path.write_text('\ufeff' + '\n'.join(lines) + '\n', encoding='utf-8', newline='\n')
with csv_path.open(encoding='utf-8-sig', newline='') as handle:
    rows = list(csv.DictReader(handle))
assert len(rows) == 36
assert next(row for row in rows if row['intent_id'] == 'P02')['publication_status'] == 'published'
assert next(row for row in rows if row['intent_id'] == 'P03')['publication_status'] == 'research'

edit('docs/MASTER-EXECUTION-PLAN.md', [
    ('- [ ] Остальной Page Planner — продолжать редакционную проверку пересечений без ожидания данных поисковиков.', '- [x] «Гипсовая или цементная штукатурка» — гайд P02 с подтверждёнными примерами техкарт, сравнительной схемой и интерактивным выбором условий; без универсальных обещаний и подмены гидроизоляции.\n- [ ] Остальной Page Planner — продолжать редакционную проверку пересечений без ожидания данных поисковиков.'),
])
print('P02_INTEGRATION_OK: guide, selector, backlinks, planner, 36 intents')
