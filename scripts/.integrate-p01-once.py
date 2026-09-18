"""Single-use P01 integration. Remove this script and its workflow before merging."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def replace_one(source: str, original: str, replacement: str, filename: str) -> str:
    count = source.count(original)
    if count != 1:
        raise RuntimeError(f"Expected exactly one anchor in {filename}; got {count}: {original[:85]}")
    return source.replace(original, replacement, 1)


changes: dict[Path, str] = {}
landing = ROOT / "src/pages/SeoLandingPage.tsx"
src = landing.read_text(encoding="utf-8")
src = replace_one(
    src,
    'import { RenovationSequenceGuide } from "../components/RenovationSequenceGuide";',
    'import { RenovationSequenceGuide } from "../components/RenovationSequenceGuide";\nimport { PlasterProcessGuide } from "../components/PlasterProcessGuide";',
    str(landing),
)
src = replace_one(
    src,
    '      {isRepairGuide && <RenovationSequenceGuide />}',
    '      {isPlasterGuide && <PlasterProcessGuide />}\n\n      {isRepairGuide && <RenovationSequenceGuide />}',
    str(landing),
)
changes[landing] = src

prerender = ROOT / "scripts/prerender.mjs"
src = prerender.read_text(encoding="utf-8")
visual = '''  const plasterVisual = isPlasterGuide
    ? `<section aria-label="Карта нанесения и проверки смет штукатурки"><h2>Механизированная и ручная штукатурка: карта пяти этапов</h2><p>Обе технологии требуют подготовки, мастеров, контроля и ухода. Станция помогает приготовить, подать и нанести совместимую смесь, но не заменяет выравнивание.</p><ol><li>Основание: осмотр, защита, подготовка.</li><li>Смесь и подача: станция с подключениями либо ручная организация замеса и доставки.</li><li>Нанесение: по документации смеси и способа.</li><li>Выравнивание: плоскость, углы и примыкания выполняют мастера.</li><li>Приёмка: проверка результата, уход и допуск следующей отделки.</li></ol><h3>Матрица сравнения смет</h3><p>Прежде чем сравнивать итоговые суммы, согласуйте одинаковые площадь, слой, материалы и требования к отделке.</p><ul><li>Подготовка и защита.</li><li>Грунтование и специальные слои.</li><li>Маяки, углы и примыкания.</li><li>Смесь и расход.</li><li>Доставка и подъём.</li><li>Оборудование и подключения.</li><li>Выравнивание и обработка.</li><li>Уборка, уход и приёмка.</li></ul><p>Для каждой строки уточните в обеих сметах: включено, оплачивается отдельно или не указано. Интерактивная матрица доступна с JavaScript. Неизвестные пункты и доплаты нельзя считать нулевой стоимостью. Ручная технология — сравнение, не заявленная услуга «Силы Леса».</p></section>`
    : "";
'''
src = replace_one(src, '  const sections = isGuide && page.sections\n', visual + '  const sections = isGuide && page.sections\n', str(prerender))
src = replace_one(src, '${comparison}${screedVisual}${repairVisual}${sections}', '${comparison}${screedVisual}${repairVisual}${plasterVisual}${sections}', str(prerender))
changes[prerender] = src

standard = ROOT / "docs/content-research/guide-visual-standard.md"
src = standard.read_text(encoding="utf-8")
src = replace_one(
    src,
    'P01 — диаграмма этапов нанесения и матрица сопоставления полной сметы.',
    'P01 — выполнено: пять синхронно переключаемых этапов двух технологий и интерактивная матрица состава смет с исходными условиями, пропусками и доплатами. Нет выдуманных цен и сроков.',
    str(standard),
)
changes[standard] = src

plan = ROOT / "docs/MASTER-EXECUTION-PLAN.md"
src = plan.read_text(encoding="utf-8")
anchor = '- [x] Визуальное усиление S04 — интерактивная карта с тремя маршрутами, этапами передачи и исключениями для тёплого пола и влажных зон; основной текст и медиа сохранены.'
src = replace_one(
    src,
    anchor,
    anchor + '\n- [x] Визуальное усиление P01 — параллельные этапы механизированной и ручной штукатурки, интерактивное сопоставление состава двух реальных смет; без выдуманных цен, старые фото и текст сохранены.',
    str(plan),
)
changes[plan] = src

for path, content in changes.items():
    if content == path.read_text(encoding="utf-8"):
        raise RuntimeError(f"Nothing changed: {path}")
for path, content in changes.items():
    path.write_text(content, encoding="utf-8", newline="\n")
    print(f"Integrated {path.relative_to(ROOT)}")
