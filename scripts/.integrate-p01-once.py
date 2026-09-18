"""Guarded one-time P01 integration; remove after its PR is ready."""
from pathlib import Path
import csv
import json

SLUG = 'guides/remont/mehanizirovannaya-ili-ruchnaya-shtukaturka'
SERVICE = 'mehanizirovannaya-shtukaturka-omsk'
URL = f'https://conradipui-glitch.github.io/silalesa/{SLUG}/'

def edit(path, changes):
    target = Path(path)
    text = target.read_text(encoding='utf-8')
    for old, new in changes:
        count = text.count(old)
        if count != 1:
            raise AssertionError(f'{path}: expected one occurrence, got {count}: {old[:95]}')
        text = text.replace(old, new, 1)
    target.write_text(text, encoding='utf-8', newline='\n')

page = json.loads(Path('src/data/seo-page-guides-plaster.json').read_text(encoding='utf-8'))
assert len(page) == 1 and page[0]['slug'] == SLUG and page[0]['kind'] == 'guide'
assert len(page[0]['sections']) >= 7 and len(page[0]['faq']) >= 7

edit('src/data/seoPages.ts', [
    ('import rawScreedGuides from "./seo-page-guides-screed.json";', 'import rawScreedGuides from "./seo-page-guides-screed.json";\nimport rawPlasterGuides from "./seo-page-guides-plaster.json";'),
    ('...rawRepairGuides, ...rawScreedGuides] as SeoPage[]', '...rawRepairGuides, ...rawScreedGuides, ...rawPlasterGuides] as SeoPage[]'),
])

edit('scripts/prerender.mjs', [
    ('const SCREED_GUIDE_SLUG = "guides/remont/polusuhaya-ili-mokraya-styazhka";', 'const SCREED_GUIDE_SLUG = "guides/remont/polusuhaya-ili-mokraya-styazhka";\nconst PLASTER_GUIDE_SLUG = "' + SLUG + '";'),
    ('  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-guides-screed.json"), "utf8")),', '  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-guides-screed.json"), "utf8")),\n  ...JSON.parse(await fs.readFile(path.join(ROOT, "src/data/seo-page-guides-plaster.json"), "utf8")),'),
    ('  const isScreedGuide = page.slug === SCREED_GUIDE_SLUG;', '  const isScreedGuide = page.slug === SCREED_GUIDE_SLUG;\n  const isPlasterGuide = page.slug === PLASTER_GUIDE_SLUG;'),
    ('    : isScreedGuide\n      ? { path: "polusuhaya-styazhka-omsk", label: "Об услуге полусухой стяжки" }', '    : isPlasterGuide\n      ? { path: "mehanizirovannaya-shtukaturka-omsk", label: "Об услуге механизированной штукатурки" }\n    : isScreedGuide\n      ? { path: "polusuhaya-styazhka-omsk", label: "Об услуге полусухой стяжки" }'),
    ('  const screedServiceLink = page.slug === "polusuhaya-styazhka-omsk"', '  const plasterServiceLink = page.slug === "mehanizirovannaya-shtukaturka-omsk"\n    ? `<p><a href="${SITE_URL}${PLASTER_GUIDE_SLUG}/">Механизированная или ручная штукатурка: что выбрать?</a></p>`\n    : "";\n  const screedServiceLink = page.slug === "polusuhaya-styazhka-omsk"'),
    ('      : isScreedGuide\n        ? `<p><a href="${SITE_URL}polusuhaya-styazhka-omsk/">Полусухая стяжка в Омске</a></p>`', '      : isPlasterGuide\n        ? `<p><a href="${SITE_URL}mehanizirovannaya-shtukaturka-omsk/">Механизированная штукатурка в Омске</a></p>`\n      : isScreedGuide\n        ? `<p><a href="${SITE_URL}polusuhaya-styazhka-omsk/">Полусухая стяжка в Омске</a></p>`'),
    ('guide.slug !== REPAIR_GUIDE_SLUG && guide.slug !== SCREED_GUIDE_SLUG', 'guide.slug !== REPAIR_GUIDE_SLUG && guide.slug !== SCREED_GUIDE_SLUG && guide.slug !== PLASTER_GUIDE_SLUG'),
    ('${guideLinks}${screedServiceLink}${serviceGuideLink}', '${guideLinks}${screedServiceLink}${plasterServiceLink}${serviceGuideLink}'),
])

edit('src/pages/SeoLandingPage.tsx', [
    ('const SCREED_GUIDE_SLUG = "guides/remont/polusuhaya-ili-mokraya-styazhka";', 'const SCREED_GUIDE_SLUG = "guides/remont/polusuhaya-ili-mokraya-styazhka";\nconst PLASTER_GUIDE_SLUG = "' + SLUG + '";'),
    ('  const isScreedGuide = page.slug === SCREED_GUIDE_SLUG;', '  const isScreedGuide = page.slug === SCREED_GUIDE_SLUG;\n  const isPlasterGuide = page.slug === PLASTER_GUIDE_SLUG;'),
    ('    : isScreedGuide\n        ? serviceComparisonBySlug["polusuhaya-styazhka-omsk"].before', '    : isPlasterGuide\n        ? serviceComparisonBySlug["mehanizirovannaya-shtukaturka-omsk"].before\n    : isScreedGuide\n        ? serviceComparisonBySlug["polusuhaya-styazhka-omsk"].before'),
    ('    : isScreedGuide\n        ? serviceComparisonBySlug["polusuhaya-styazhka-omsk"].beforeAlt', '    : isPlasterGuide\n        ? serviceComparisonBySlug["mehanizirovannaya-shtukaturka-omsk"].beforeAlt\n    : isScreedGuide\n        ? serviceComparisonBySlug["polusuhaya-styazhka-omsk"].beforeAlt'),
    ('const otherGuides = isGuide && !isRepairGuide && !isScreedGuide', 'const otherGuides = isGuide && !isRepairGuide && !isScreedGuide && !isPlasterGuide'),
    ('    : isScreedGuide\n      ? seoPages.filter((item) => item.slug === "polusuhaya-styazhka-omsk")', '    : isPlasterGuide\n      ? seoPages.filter((item) => item.slug === "mehanizirovannaya-shtukaturka-omsk")\n    : isScreedGuide\n      ? seoPages.filter((item) => item.slug === "polusuhaya-styazhka-omsk")'),
    ('              ) : isScreedGuide ? (', '              ) : isPlasterGuide ? (\n                <LinkButton to="/mehanizirovannaya-shtukaturka-omsk/" size="lg" onClick={() => track("cta_click", { type: "guide_to_plaster", where: "seo-landing", slug })}>\n                  Об услуге механизированной штукатурки <ArrowIcon />\n                </LinkButton>\n              ) : isScreedGuide ? ('),
    ('          {page.slug === "polusuhaya-styazhka-omsk" && (', '          {page.slug === "mehanizirovannaya-shtukaturka-omsk" && (\n            <p className="mt-6 text-sm"><Link to={`/${PLASTER_GUIDE_SLUG}/`} className="font-medium text-cedar-700 underline underline-offset-4 hover:text-bark-900">Механизированная или ручная штукатурка: что выбрать? →</Link></p>\n          )}\n          {page.slug === "polusuhaya-styazhka-omsk" && ('),
    ('{isScreedGuide ? "Нужно подобрать технологию стяжки?"', '{isPlasterGuide ? "Нужно выбрать способ штукатурки стен?" : isScreedGuide ? "Нужно подобрать технологию стяжки?"'),
    (') : isScreedGuide ? <LinkButton to="/polusuhaya-styazhka-omsk/" variant="ghost">Полусухая стяжка</LinkButton>', ') : isPlasterGuide ? <LinkButton to="/mehanizirovannaya-shtukaturka-omsk/" variant="ghost">Механизированная штукатурка</LinkButton> : isScreedGuide ? <LinkButton to="/polusuhaya-styazhka-omsk/" variant="ghost">Полусухая стяжка</LinkButton>'),
])

planner_path = Path('research/yaai/planners/silalesa.json')
planner = json.loads(planner_path.read_text(encoding='utf-8'))
assert not any(x['id'] == 'guide-plaster-comparison' for x in planner['targets'])
service = next(x for x in planner['targets'] if x['id'] == 'service-plaster')
assert service['intentIds'] == ['P01', 'P03']
service['intentIds'] = ['P03']
service['note'] = 'Коммерческая страница услуги. Информационный P01 закреплён за сравнительным гайдом; P03 по цене не закрыт.'
planner['targets'].append({'id': 'guide-plaster-comparison', 'title': 'Механизированная или ручная штукатурка', 'kind': 'guide', 'status': 'existing', 'mode': 'primary', 'path': '/' + SLUG + '/', 'priority': 'P1', 'focusWeight': 1, 'intentIds': ['P01'], 'note': 'Информационное сравнение; CTA на коммерческую страницу механизированной штукатурки.'})
assert sum('P01' in x.get('intentIds', []) for x in planner['targets']) == 1
planner_path.write_text(json.dumps(planner, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')

csv_path = Path('docs/content-research/content-intents.csv')
rows = csv_path.read_text(encoding='utf-8-sig').splitlines(keepends=True)
assert len(rows) == 37
selected = [i for i, line in enumerate(rows) if line.startswith('P01,')]
assert len(selected) == 1 and rows[selected[0]].rstrip('\r\n').endswith(',research')
rows[selected[0]] = rows[selected[0]].replace(',research', ',published')
csv_path.write_text('\ufeff' + ''.join(rows).replace('\r\n', '\n'), encoding='utf-8', newline='\n')
with csv_path.open(encoding='utf-8-sig', newline='') as f:
    parsed = list(csv.DictReader(f))
assert len(parsed) == 36 and next(r for r in parsed if r['intent_id'] == 'P01')['publication_status'] == 'published'
assert next(r for r in parsed if r['intent_id'] == 'P03')['publication_status'] == 'research'

edit('docs/MASTER-EXECUTION-PLAN.md', [
    ('- [ ] Остальной Page Planner — продолжать редакционную проверку пересечений без ожидания данных поисковиков.', '- [x] «Механизированная или ручная штукатурка» — гайд P01: технология, доступ, контроль качества, сопоставимые сметы и переход на услугу; фото процесса и реальные сметы ещё нужны для усиления доказательств.\n- [ ] Остальной Page Planner — продолжать редакционную проверку пересечений без ожидания данных поисковиков.'),
])
print('P01_INTEGRATION_OK: registry, page CTAs, prerender, planner, intents and plan')
