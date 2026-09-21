import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const read = (name) => fs.readFileSync(name, 'utf8');
const quiz = read('src/sections/Quiz.tsx');
const config = read('src/sections/Configurator.tsx');
const models = JSON.parse(read('src/data/sauna-choice-models.json'));
const catalog = read('src/data/products.ts');
const home = read('dist/index.html');
const root = read('src/App.tsx');
const pages = JSON.parse(read('src/data/seo-pages.json'));

assert.equal(models.length, 4, 'Source catalogue contains four actual models');
assert(quiz.includes('step === 1 || step === questions.length - 1'), 'First recommendation comes after two required answers');
assert(quiz.includes('Уточнить бюджет, гостей и подъезд (необязательно)'), 'Additional inputs are clearly optional');
assert(quiz.includes('saunas.map((p) => <li key={p.id}>') && quiz.includes('modelHref(p)'), 'Prices and canonical product links visible before any questionnaire');
assert(quiz.includes('stage === "result" && !best'), 'No-match result is never an empty screen');
assert(quiz.includes('res[0]?.product.modelKey ?? "none"'), 'No-match does not dereference a missing suggestion');
assert(quiz.includes('to={modelHref(best.product)}') && !quiz.includes('to={`/product/${best.product.id}`}'), 'Recommendation uses canonical commercial URL');
assert(quiz.includes('s.answers?.rooms && s.answers?.space'), 'Corrupt legacy quiz result is not reopened');
assert(!quiz.includes('function evaluate(a: Required<Answers>)'), 'Two-question result does not force fabricated answers');
assert(config.includes('const deliveryKnown = !isFrame && opts.city === "omsk"'), 'Free freight limited to Kvadro in Omsk');
assert(config.includes('const hasUnpriced = lines.some((x) => x.price === null) || quoteHasUnknownDelivery'), 'Unknown freight keeps quote incomplete');
assert(config.includes('!isFrame && standardIncluded.map') && config.includes('!isFrame && door.price > 0'), 'Kvadro inclusion and add-ons never attach to frame sauna');
assert(config.includes('Установка каркасной бани') && config.includes('по запросу'), 'Frame freight and installation are not free by implication');
assert(config.includes('productHref') && !config.includes('product.originalUrl'), 'WhatsApp quote links to current commercial page, not old domain');
assert(config.includes('order-1 lg:order-2 lg:sticky') && config.includes('order-2 space-y-8 lg:order-1'), 'Price and contact precede long options on phones');
assert(config.includes('setModel("k2")') && config.includes('Сбросить расчёт'), 'Reset is always accessible and resets model and options');
assert(config.includes('Number.isInteger(s.lamps)') && config.includes('doorOptions.some((d) => d.id === s.door)'), 'Malformed persisted configuration is ignored');
assert(root.includes('<Configurator model=') && root.includes('<Quiz setModel='), 'Both interactive journeys remain mounted');
assert(home.includes('data-prerendered="true"') && home.includes('230') && home.includes('WhatsApp'), 'Published homepage still useful without JavaScript');
assert.equal((read('dist/sitemap.xml').match(/<loc>/g) ?? []).length, 22, 'No SEO URL regression');

// Exercise the ACTUAL production recommendation function (not a test-only copy).
// TypeScript transpilation strips TS syntax; vm supplies a small sourced model fixture.
const match = quiz.match(/function evaluate\(a: Answers\): Verdict\[\] \{[\s\S]*?\n\}\n(?=\nexport function Quiz)/);
assert(match, 'The production matching function must be independently testable');
const fixture = models.map((m) => {
  const properties = {
    k2: { footprint: { l: 2, w: 2 }, rooms: 1 },
    k3: { footprint: { l: 3, w: 2 }, rooms: 2 },
    k4: { footprint: { l: 4, w: 2 }, rooms: 2 },
    f55: { footprint: { l: 5.5, w: 2.2 }, rooms: 3 },
  }[m.key];
  assert(properties && catalog.includes(`id: "${m.productId}"`), `Source product exists: ${m.key}`);
  return { id: m.productId, modelKey: m.key, name: m.name, price: m.price, footprint: properties.footprint, roomsList: Array(properties.rooms).fill('room') };
});
const source = `const spaces = ${JSON.stringify({ '2x2': {l:2,w:2,label:'2×2'}, '3x2': {l:3,w:2,label:'3×2'}, '4x2': {l:4,w:2,label:'4×2'}, '6x3': {l:6,w:3,label:'6×3'} })};\nconst saunas = ${JSON.stringify(fixture)};\nconst formatPrice = (n) => String(n) + ' ₽';\n${match[0]}\nevaluate;`;
const javascript = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
const evaluate = vm.runInNewContext(javascript, {}, { timeout: 1500 });
assert.equal(evaluate({rooms:1,space:'2x2'})[0].product.modelKey,'k2','Single room and 2×2 offers physically fitting small sauna');
assert.deepEqual(Array.from(evaluate({rooms:2,space:'3x2'}).map((v)=>v.product.modelKey)),['k3'],'Rest room and 3×2 must never offer oversized 4×2');
assert.equal(evaluate({rooms:3,space:'4x2'}).length,0,'Three rooms on 4×2 are explicitly no-match');
assert.equal(evaluate({rooms:3,space:'6x3'})[0].product.modelKey,'f55','Three rooms and fitting footprint identify frame model');
assert.equal(evaluate({rooms:2,space:'3x2',budget:250000})[0].product.modelKey,'k3','Budget below all matching models does not force physically impossible suggestion');
assert(evaluate({rooms:2,space:'3x2',budget:250000})[0].warn.some((line)=>line.includes('дороже бюджета')),'Budget shortfall is shown');
assert(evaluate({rooms:2,space:'3x2',access:'no'})[0].warn.some((line)=>line.includes('сборку на участке')),'No truck access gets explicit alternative');
assert.deepEqual(Array.from(evaluate({rooms:2})),[],'Incomplete dimensions produce no fabricated match');
for (const p of fixture) {
  const matchPage = pages.find((page) => page.productId === p.id);
  assert(matchPage && matchPage.slug, `Canonical URL exists for ${p.name}`);
}
console.log('R9 PASS: two-step initial recommendation, zero-result branch, physical/room/budget/access scenarios, canonical links, frame logistics/installation unknown, source-bound prices and mobile-first quote, saved-state validation, SEO.');
