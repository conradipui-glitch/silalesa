"""Move one existing model selector beside the live quote for mobile users."""
from pathlib import Path

path = Path('src/sections/Configurator.tsx')
source = path.read_text(encoding='utf-8')
lead = '            <fieldset className="reveal">\n              <legend className="font-display text-xs uppercase tracking-[0.2em] text-cedar-300">1. Выберите модель — цена уже рассчитана</legend>'
if source.count(lead) != 1:
    raise RuntimeError('Model fieldset differs from reviewed version')
start = source.index(lead)
end = source.index('            {isFrame ? (', start)
chooser = source[start:end]
if chooser.count('saunas.map') != 1 or chooser.count('setModel(s.modelKey!)') != 1:
    raise RuntimeError('Expected intact model selector')
source = source[:start] + source[end:]
chooser = (chooser.replace('className="reveal"', 'className="mt-5"', 1)
          .replace('1. Выберите модель — цена уже рассчитана', 'Выберите модель — цена обновится сразу', 1)
          .replace('mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4', 'mt-3 grid grid-cols-2 gap-2', 1))
anchor = '            </div>\n\n            <ul className="mt-6 divide-y divide-cream-50/8 text-sm">'
if source.count(anchor) != 1:
    raise RuntimeError('Quote header is not unique')
quick = '''            <div className="mt-4">
              <LinkButton to={whatsappUrl(message)} size="sm" external onClick={() => track("cta_click", { type: "whatsapp", where: "configurator-quick", model })}>Уточнить стоимость в WhatsApp <ArrowIcon /></LinkButton>
            </div>
'''
source = source.replace(anchor, '            </div>\n\n' + chooser + quick + '            <ul className="mt-6 divide-y divide-cream-50/8 text-sm">', 1)
path.write_text(source, encoding='utf-8')

path = Path('src/sections/Quiz.tsx')
source = path.read_text(encoding='utf-8')
old = 'gridTemplateColumns: `repeat(${questions.length}, minmax(0, 1fr))`'
if source.count(old) != 1:
    raise RuntimeError('Unexpected quiz progress bar')
path.write_text(source.replace(old, 'gridTemplateColumns: `repeat(${step < 2 ? 2 : 5}, minmax(0, 1fr))`'), encoding='utf-8')
print('R9 polish: immediate model switch, live quote/contact and honest quick-flow progress')
