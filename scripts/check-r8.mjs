import assert from 'node:assert/strict';
import fs from 'node:fs';
import { homeFallback } from './home-fallback.mjs';

const read = (file) => fs.readFileSync(file, 'utf8');
const base = 'https://conradipui-glitch.github.io/silalesa/';
const models = JSON.parse(read('src/data/sauna-choice-models.json'));
const products = read('src/data/products.ts');
const phone = products.match(/whatsapp:\s*"(\d+)"/)?.[1];
assert(phone && models.length === 4);
const hero = read('src/sections/Hero.tsx');
const modelSection = read('src/sections/Models.tsx');
const story = read('src/sections/Story.tsx');
const trust = read('src/sections/Trust.tsx');
const about = read('src/sections/ServicesAbout.tsx');
const app = read('src/App.tsx');
const brand = read('src/components/Brand.tsx');
const html = read('dist/index.html');

assert(hero.includes('Бани Квадро в Омске') && hero.includes('от {formatPrice(minPrice)}'), 'H1 scopes minimum price to Kvadro');
assert(hero.includes('className="order-1"') && hero.includes('className="order-2 relative"'), 'Mobile first text and action, then image');
assert(hero.includes('to="/mobilnaya-banya-omsk/"') && hero.includes('Спросить в WhatsApp') && hero.includes('where: "hero"'), 'First screen offers direct catalogue and contextual WA');
assert(!hero.includes('Квадро и каркасные модели от') && !hero.includes('Омск — 0 ₽') && !hero.includes('Привезём готовой.'), 'No misleading universal price, freight or assembled promise');
assert(hero.includes('modelKey === "f55"') && hero.includes('доставка и установка согласуются отдельно'), 'Frame logistics separately stated');
assert(!hero.includes('marquee-track') && hero.includes('Опции и нестандартный подъезд'), 'Nonrepeating factual inclusion strip');
assert(!modelSection.includes('p.capacity') && !modelSection.includes('до {p.capacity.people}'), 'No estimated people capacity in home cards');
assert(modelSection.includes('Вход сбоку и увеличенное окно на фото — опции') && modelSection.includes('Каркасная: доставку и монтаж уточняем отдельно'), 'Photo options and frame scope in cards');
assert(modelSection.includes('Полные характеристики Квадро 3×2') && modelSection.includes('Что включено и какие бывают доплаты'), 'Simple first answer, optional specs, factual guide');
assert(modelSection.includes('aria-pressed={active}') && !modelSection.includes('role="tab"') && !modelSection.includes('role="tabpanel"'), 'Buttons avoid broken tab semantics');
assert(story.includes('три шага') && story.includes('md:grid-cols-3') && story.includes('Чек-лист приёмки') && story.includes('со специалистом'), 'Three operational steps, acceptance and professional safety');
assert(story.includes('проверяйте') || story.includes('соблюдайте'), 'Winter safety context');
assert(trust.includes('const faqs = [') && trust.includes('Каркасная 5,5×2,2') && trust.includes('Практические инструкции') && trust.includes('Спросить в WhatsApp'), 'Trust, six practical FAQ and direct contact');
assert(about.includes('Уточнить') || about.includes('уточнить'), 'About/contact real visitor action');
assert(about.includes('company.showroom') && about.includes('whatsappUrl('), 'Location and WA offer');
const sections = ['<Hero />', '<Lineup model=', '<StandardSection />', '<LayoutSection model=', '<Process />', '<ReadyPromise />', '<Configurator model=', '<Quiz setModel=', '<WinterBand />', '<Faq />', '<About />'];
for (let i = 1; i < sections.length; i++) assert(app.indexOf(sections[i - 1]) < app.indexOf(sections[i]), `Home section order: ${sections[i]}`);
assert(brand.includes('const isService =') && brand.includes('route.name === "landing"') && brand.includes('whatsappUrl(`Здравствуйте! Интересует ${subject}') && brand.includes('Написать в WhatsApp'), 'Mobile sticky CTA follows service/product route, not generic bath calculator');
assert(brand.includes('to="/mobilnaya-banya-omsk/"') && brand.includes('Строительные услуги'), 'Header/footer catalogue and services links');
assert(html.includes('<div id="root" data-prerendered="true">') && html.includes('<h1>Бани Квадро в Омске — от 230 000 ₽</h1>') || html.includes('<div id="root" data-prerendered="true">') && html.includes('<h1>Бани Квадро в Омске — от 230 000 ₽</h1>'), 'Buyer-first readable home without JavaScript');
assert(html.includes('<link rel="canonical" href="' + base + '"') && html.includes('LocalBusiness'), 'Root canonical and structured business');
assert(html.includes('https://wa.me/' + phone + '?text=') && html.includes('tel:+79136884533') && html.includes('Спросить о бане в WhatsApp'), 'No-JS buyer contact paths');
const homeBody = html.slice(html.indexOf('<div id="root" data-prerendered="true">'));
assert(homeBody.indexOf('<h1>') < homeBody.indexOf('<h2>Четыре модели') && homeBody.indexOf('Спросить о бане в WhatsApp') < homeBody.indexOf('<h2>Четыре модели'), 'Price and direct CTA precede catalogue in the actual page, not document metadata');
for (const model of models) {
  assert(html.includes(`${base}${model.slug}/`), `Canonical model href ${model.slug}`);
  assert(html.includes(`${Number(model.price).toLocaleString('ru-RU')} ₽`), `Source price ${model.key}`);
  const stem = model.key === 'f55' ? 'karkasnaya-5-5-' : model.key === 'k2' ? 'kvadro-2x2-' : model.key === 'k3' ? 'kvadro-3x2-' : 'kvadro-4x2-';
  const asset = read('dist/index.html').match(new RegExp(`assets/(${stem}[^" ]+\\.webp)`))?.[1];
  assert(asset && fs.existsSync(`dist/assets/${asset}`), `Bundled model photo ${model.key}`);
}
for (const slug of ['mobilnaya-banya-omsk','services','guides/bani/chto-vhodit-v-tsenu','guides/bani/podgotovka-uchastka-dostavka-manipulyator','guides/bani/chek-list-priemki-gotovoy-bani','guides/bani/fundament-dlya-mobilnoy-bani','guides/bani/kak-vybrat-razmer-2x2-3x2-4x2']) {
  assert(html.includes(`${base}${slug}/`), `Useful navigable static guide: ${slug}`);
  assert(fs.existsSync(`dist/${slug}/index.html`), `Page is actually generated: ${slug}`);
}
assert(!html.includes('href="/product/'), 'No old numeric product links from home');
const sitemap = read('dist/sitemap.xml');
assert.equal((sitemap.match(/<loc>/g) ?? []).length, 22, 'All 22 canonical URLs retained');
assert(read('index.html').includes('Квадро 2×2 от 230 000 ₽; каркасная'), 'Social preview does not misattribute entry price');
const assets = {k2:'kvadro-2x2-example.webp',k3:'kvadro-3x2-example.webp',k4:'kvadro-4x2-example.webp',f55:'karkasnaya-5-5-example.webp'};
assert(homeFallback(models, assets, base, phone, '+79136884533', 'Омск, ул. Нефтезаводская, 49/1').includes('Квадро 2×2'), 'Fallback is derived from model registry');
assert.throws(() => homeFallback([models[0],models[0],models[2],models[3]], assets, base, phone, '+79136884533', 'Омск'), /distinct/, 'No duplicate model fallback');
console.log('R8 PASS: mobile-first factual home, four sourced products and photos, compact journey, scoped options and freight, contact by route, no-JS page, guides and all 22 SEO canonicals.');
