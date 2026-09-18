"""One-off, guarded S01 integration. Remove this file before merging."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def insert_once(text: str, needle: str, replacement: str, file: str) -> str:
    count = text.count(needle)
    if count != 1:
        raise RuntimeError(f"Expected exactly one anchor in {file}; found {count}: {needle[:110]}")
    return text.replace(needle, replacement, 1)


changes: dict[Path, str] = {}
landing = ROOT / "src/pages/SeoLandingPage.tsx"
source = landing.read_text(encoding="utf-8")
source = insert_once(
    source,
    'import { PlasterMaterialGuide } from "../components/PlasterMaterialGuide";',
    'import { PlasterMaterialGuide } from "../components/PlasterMaterialGuide";\nimport { ScreedComparisonGuide } from "../components/ScreedComparisonGuide";',
    landing.name,
)
source = insert_once(
    source,
    '      {isMaterialGuide && <PlasterMaterialGuide />}',
    '      {isScreedGuide && <ScreedComparisonGuide />}\n\n      {isMaterialGuide && <PlasterMaterialGuide />}',
    landing.name,
)
changes[landing] = source

prerender = ROOT / "scripts/prerender.mjs"
source = prerender.read_text(encoding="utf-8")
static_comparison = '''  const screedVisual = isScreedGuide
    ? `<section aria-label="Визуальное сравнение полусухой и мокрой стяжки"><h2>Полусухая и мокрая стяжка: что сравнивать</h2><p>Полусухая смесь содержит меньше воды, требует распределения и уплотнения; мокрый раствор более подвижен и укладывается по инструкции выбранного материала. Ни один метод сам по себе не гарантирует сроки или качество.</p><table><caption>Критерии выбора стяжки</caption><thead><tr><th>Критерий</th><th>Полусухая</th><th>Мокрая</th></tr></thead><tbody><tr><th>Укладка</th><td>Распределение, уплотнение, выравнивание</td><td>Укладка, выравнивание по техкарте</td></tr><tr><th>Слои и нагрузка</th><td>По проекту конструкции</td><td>По проекту конструкции</td></tr><tr><th>Готовность к покрытию</th><td>Проверка влажности и требований покрытия</td><td>Проверка влажности и требований покрытия</td></tr><tr><th>Смета</th><td>Полный состав и условия объекта</td><td>Тот же полный состав и условия объекта</td></tr></tbody></table><h3>Условная схема слоёв</h3><ol><li>Основание / перекрытие</li><li>Разделительный или изоляционный слой, если предусмотрен проектом</li><li>Стяжка выбранной технологии</li><li>Совместимое финишное покрытие</li></ol><p>Схема не в масштабе. Для тёплого пола, мокрой зоны и ограниченной несущей способности решение определяют отдельно. Интерактивная проверка условий доступна при включённом JavaScript.</p></section>`
    : "";
'''
source = insert_once(source, '  const sections = isGuide && page.sections\n', static_comparison + '  const sections = isGuide && page.sections\n', prerender.name)
source = insert_once(source, '${points}</ul>${comparison}${sections}${printLink}', '${points}</ul>${comparison}${screedVisual}${sections}${printLink}', prerender.name)
changes[prerender] = source

standard = ROOT / "docs/content-research/guide-visual-standard.md"
source = standard.read_text(encoding="utf-8")
source = insert_once(
    source,
    'S01 — сравнение полусухой и мокрой стяжки с условной схемой и перечнем проектных проверок, без выдуманных сроков.',
    'S01 — выполнено: сравнение двух технологий, условные этапы и разрез пола, интерактив условий объекта и список проектных проверок. Без выдуманных сроков, толщин и цены.',
    standard.name,
)
changes[standard] = source

plan = ROOT / "docs/MASTER-EXECUTION-PLAN.md"
source = plan.read_text(encoding="utf-8")
anchor = '- [x] «Гипсовая или цементная штукатурка» — гайд P02 с подтверждёнными примерами техкарт, сравнительной схемой и интерактивным выбором условий; без универсальных обещаний и подмены гидроизоляции.'
source = insert_once(
    source,
    anchor,
    anchor + '\n- [x] Визуальное усиление S01 — интерактивное сравнение полусухой и мокрой стяжки с проверками по объекту; исходные фото, медиа и статья сохранены.',
    plan.name,
)
changes[plan] = source

for path, content in changes.items():
    assert content != path.read_text(encoding="utf-8"), path
for path, content in changes.items():
    path.write_text(content, encoding="utf-8", newline="\n")
    print(f"integrated {path.relative_to(ROOT)}")
