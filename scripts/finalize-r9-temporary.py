from pathlib import Path

def replace(file, old, new, expected=1):
    p = Path(file)
    s = p.read_text(encoding='utf-8')
    if s.count(old) != expected:
        raise RuntimeError(f'{file}: expected {expected} instance(s) of {old[:75]!r}, got {s.count(old)}')
    p.write_text(s.replace(old, new), encoding='utf-8')

quiz = 'src/sections/Quiz.tsx'
config = 'src/sections/Configurator.tsx'
replace(quiz, 'title={<span id="quiz-title">Подберём модель по пяти ответам</span>}', 'title={<span id="quiz-title">Подбор бани: два ответа для первого результата</span>}')
replace(quiz, 'hint: "Цены Квадро — за комплектацию «Стандарт» с доставкой по Омску."', 'hint: "Необязательное уточнение. Квадро: доставка по Омску включена; каркасная — отдельно."')
replace(quiz, 'if (have > a.rooms)', 'if (have > a.rooms!)')
replace(quiz, 'if (have === a.rooms)', 'if (have === a.rooms!)')
replace(config, '    rows.push(`• Вынос топки: ${ventLabels[opts.vent]}`);', '    if (!isFrame) rows.push(`• Вынос топки: ${ventLabels[opts.vent]}`);')
replace(config, '''              <li className="flex items-start justify-between gap-4 py-2.5">
                <span className="text-cream-200/85">Вынос топки: {ventLabels[opts.vent]}</span>
                <span className="font-display text-cream-300/70">0 ₽</span>
              </li>''', '''              {!isFrame && <li className="flex items-start justify-between gap-4 py-2.5">
                <span className="text-cream-200/85">Вынос топки: {ventLabels[opts.vent]}</span>
                <span className="font-display text-cream-300/70">в стандарте</span>
              </li>}''')
print('R9 finalization complete: source-faithful labels, safe optional inputs and frame terms')
