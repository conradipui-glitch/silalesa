"""Guarded one-time S04 integration. Delete before merging to main."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_once(text: str, old: str, new: str, filename: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"Expected exactly one S04 anchor in {filename}, found {count}: {old[:95]}")
    return text.replace(old, new, 1)


changes: dict[Path, str] = {}
landing = ROOT / "src/pages/SeoLandingPage.tsx"
source = landing.read_text(encoding="utf-8")
source = replace_once(
    source,
    'import { ScreedComparisonGuide } from "../components/ScreedComparisonGuide";',
    'import { ScreedComparisonGuide } from "../components/ScreedComparisonGuide";\nimport { RenovationSequenceGuide } from "../components/RenovationSequenceGuide";',
    landing.name,
)
source = replace_once(
    source,
    '      {isScreedGuide && <ScreedComparisonGuide />}',
    '      {isRepairGuide && <RenovationSequenceGuide />}\n\n      {isScreedGuide && <ScreedComparisonGuide />}',
    landing.name,
)
changes[landing] = source

prerender = ROOT / "scripts/prerender.mjs"
source = prerender.read_text(encoding="utf-8")
static_sequence = '''  const repairVisual = isRepairGuide
    ? `<section aria-label="Карта очередности ремонта"><h2>Карта очередности: штукатурка и стяжка</h2><p>Выберите сценарий в интерактивной схеме, если включён JavaScript. Здесь — доступный без него ориентир. Порядок всегда уточняют по проекту и техническим документам материалов.</p><h3>Типовой маршрут с мокрой штукатуркой</h3><ol><li>Согласовать уровни, проёмы и коммуникации.</li><li>Оштукатурить потолок, если предусмотрен, затем стены.</li><li>Проверить требования к передаче штукатурного этапа.</li><li>Подготовить основание, проверить скрытые работы и тёплый пол до закрытия.</li><li>Выполнить стяжку и обеспечить предусмотренный уход.</li><li>Передавать основание под покрытие после проверки требований системы.</li></ol><h3>Если стяжка уже готова</h3><p>Сначала проверить допустимость нагрузки и влаги, защитить пол от раствора и оборудования, выполнить штукатурку и осмотреть основание перед отделкой.</p><h3>Если вместо мокрой штукатурки — гипсокартон</h3><p>Очередность сухой облицовки может отличаться: в некоторых системах ГКЛ устанавливают после стяжки. Проверить проект и инструкцию конкретной системы.</p><p>Для мокрых зон отдельно согласовать гидроизоляцию; тёплый пол проверяет профильный специалист. Универсальных сроков в схеме нет.</p></section>`
    : "";
'''
source = replace_once(source, '  const sections = isGuide && page.sections\n', static_sequence + '  const sections = isGuide && page.sections\n', prerender.name)
source = replace_once(source, '${points}</ul>${comparison}${screedVisual}${sections}${printLink}', '${points}</ul>${comparison}${screedVisual}${repairVisual}${sections}${printLink}', prerender.name)
changes[prerender] = source

standard = ROOT / "docs/content-research/guide-visual-standard.md"
source = standard.read_text(encoding="utf-8")
source = replace_once(source, 'S04 — интерактивная схема очередности ремонта с исключениями.', 'S04 — выполнено: три маршрута (мокрая штукатурка сначала, готовая стяжка, система ГКЛ), кликабельные этапы, проверки перед передачей и условия тёплого пола/мокрой зоны. Без выдуманных сроков.', standard.name)
changes[standard] = source

plan = ROOT / "docs/MASTER-EXECUTION-PLAN.md"
source = plan.read_text(encoding="utf-8")
anchor = '- [x] Визуальное усиление S01 — интерактивное сравнение полусухой и мокрой стяжки с проверками по объекту; исходные фото, медиа и статья сохранены.'
source = replace_once(source, anchor, anchor + '\n- [x] Визуальное усиление S04 — интерактивная карта с тремя маршрутами, этапами передачи и исключениями для тёплого пола и влажных зон; основной текст и медиа сохранены.', plan.name)
changes[plan] = source

for path, updated in changes.items():
    if updated == path.read_text(encoding="utf-8"):
        raise RuntimeError(f"No change to {path}")
for path, updated in changes.items():
    path.write_text(updated, encoding="utf-8", newline="\n")
    print(f"integrated {path.relative_to(ROOT)}")
