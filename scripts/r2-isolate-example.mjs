import fs from 'node:fs/promises';

const replaceOnce = (text, before, after, label) => {
  if (text.split(before).length !== 2) throw new Error(`Expected exactly one ${label} anchor`);
  return text.replace(before, after);
};

const componentPath = 'src/components/PlasterProcessGuide.tsx';
let component = await fs.readFile(componentPath, 'utf8');
component = replaceOnce(component,
`  const showExample = () => {
    setMode("compare");
    setBaseline([true, true, true]);
    setOffers(exampleOffers());
    setVisibleCount(estimateItems.length);
    setIsExample(true);
  };`,
`  const exampleSummary = summarizeOffers(exampleOffers(), [true, true, true], "compare");
  const showExample = () => setIsExample((previous) => !previous);`,
'showExample handler');
component = replaceOnce(component,
`>Показать условный пример</button>`,
`>{isExample ? "Скрыть условный пример" : "Показать условный пример"}</button>`,
'example button');
component = replaceOnce(component,
`          {isExample && <p role="note" className="mt-4 rounded-xl border border-cedar-700 bg-cream-100 p-4 text-sm font-semibold text-bark-900">Условный пример, НЕ реальная смета и НЕ предложение «Силы Леса» или другого подрядчика. Доплаты приведены только как типы позиций, без сумм. Измените любую отметку, чтобы вернуться к проверке своих данных.</p>}`,
`          {isExample && <aside role="note" aria-label="Условный пример смет" className="mt-4 rounded-xl border border-cedar-700 bg-cream-100 p-4 text-sm text-bark-900">
            <p className="font-semibold">Условный пример — НЕ реальные сметы и НЕ предложение «Силы Леса» или другого подрядчика. Он не заполняет ваши поля и не изменяет ваши ответы.</p>
            <ul className="mt-3 list-disc space-y-1 pl-5 leading-relaxed">
              <li>Подготовка включена в обеих сметах.</li>
              <li>Доставка оплачивается отдельно в обеих сметах.</li>
              <li>Оборудование отдельно при механизации, но включено при ручном способе.</li>
              <li>Остальные пять позиций включены в обеих сметах; три общих условия условно согласованы.</li>
            </ul>
            <p className="mt-3 leading-relaxed">В этом примере понятны {exampleSummary.clarified} из {estimateItems.length} позиций, но {exampleSummary.separate.length} позиции с доплатами требуют реальных сумм. Разница в включении также устраняется приведением полной цены к одному составу. Это не расчёт цены.</p>
          </aside>}`,
'example display');
component = replaceOnce(component,
`Вводите отметки по документам. {isExample ? "Сейчас показан условный пример, не реальные предложения. " : ""}«Сила Леса» предлагает`,
`Вводите отметки по документам. «Сила Леса» предлагает`,
'real results disclosure');
await fs.writeFile(componentPath, component);

const testPath = 'scripts/check-r2.mjs';
let tests = await fs.readFile(testPath, 'utf8');
const testAnchor = `assert.ok(!component.includes("summary.ready"), "old all-included gating must be removed");`;
tests = replaceOnce(tests, testAnchor, `${testAnchor}
assert.ok(component.includes('const showExample = () => setIsExample((previous) => !previous)'), 'demo toggles independent panel');
assert.ok(!component.includes('setOffers(exampleOffers())') && !component.includes('setBaseline([true, true, true])'), 'demo never overwrites real answers');
assert.ok(component.includes('не заполняет ваши поля и не изменяет ваши ответы'), 'explicit demonstration isolation');
assert.ok(component.includes('exampleSummary.separate.length'), 'demonstration shows unpaid additions without pretending a total');`, 'R2 test anchor');
await fs.writeFile(testPath, tests);
console.log('Separated demonstration from live estimate state and added isolation checks');
