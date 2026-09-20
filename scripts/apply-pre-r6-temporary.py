from pathlib import Path


def patch(name, before, after, count=1):
    path = Path(name)
    text = path.read_text(encoding='utf-8')
    actual = text.count(before)
    if actual != count:
        raise RuntimeError(f'{name}: expected {count} matches, got {actual}: {before[:90]}')
    path.write_text(text.replace(before, after), encoding='utf-8')
    print(f'PATCH {name}: {actual} guarded occurrence(s)')

patch('src/data/products.ts', '  address: "Омск, ул. Заозерная, 11/1И",\n', '')
patch('src/components/Brand.tsx', '<li className="text-cream-300/70">Адрес: {company.address}</li>', '<li className="text-cream-300/70">Осмотр по предварительной договорённости; время уточните по телефону.</li>')
patch('src/sections/ServicesAbout.tsx', '''              <dt className="text-cream-300/60">Адрес</dt>
              <dd className="mt-1 text-cream-50">{company.address}</dd>''', '''              <dt className="text-cream-300/60">Когда приехать</dt>
              <dd className="mt-1 text-cream-50">Осмотр образцов — по предварительной договорённости. Время визита уточните по телефону.</dd>''')
patch('index.html', '"streetAddress": "ул. Заозерная, 11/1И"', '"streetAddress": "ул. Нефтезаводская, 49/1"')
patch('scripts/prerender.mjs', '- Производственная/контактная точка из данных компании: Омск, ул. Заозерная, 11/1И.', '- Осмотр образцов — по предварительной договорённости, время уточните по телефону.')

model_file = 'src/sections/Models.tsx'
patch(model_file, 'import { Link } from "../lib/router";', 'import { Link } from "../lib/router";\nimport { seoPages } from "../data/seoPages";')
patch(model_file, '  const useCase = p.modelKey === "k2"', '  const landing = seoPages.find((page) => page.productId === p.id);\n  const productUrl = landing ? `/${landing.slug}/` : `/product/${p.id}/`;\n  const useCase = p.modelKey === "k2"')
patch(model_file, 'to={`/product/${p.id}`}', 'to={productUrl}', 2)

alias = '''
// GitHub Pages serves its SPA fallback with an HTTP 404 for unknown paths.
// Give legacy numeric product links a real static file (HTTP 200), and direct
// both users and crawlers to the unique descriptive product/service URL.
// GitHub Pages cannot issue an HTTP 301 redirect without another host layer.
for (const page of pages.filter((entry) => entry.productId)) {
  if (!/^\\d+$/.test(page.productId)) throw new Error(`Invalid legacy product ID: ${page.productId}`);
  const canonical = `${SITE_URL}${page.slug}/`;
  let html = applyPageMeta(template, { title: page.title, description: page.description, canonical });
  html = html.replace(/<meta name="robots" content="index, follow" \\/>/i, '<meta name="robots" content="noindex, follow" />');
  html = html.replace('</head>', `<meta http-equiv="refresh" content="0;url=${canonical}" />\\n</head>`);
  html = html.replace(/<div id="root"><\\/div>/i, `<div id="root"><main><h1>${escapeHtml(page.h1)}</h1><p>У страницы новый адрес: <a href="${canonical}">открыть модель или услугу</a>.</p></main></div>`);
  const directory = path.join(DIST, 'product', page.productId);
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, 'index.html'), html, 'utf8');
}

'''
patch('scripts/prerender.mjs', '\n{\n  const canonical = `${SITE_URL}${servicesHub.slug}/`;', '\n' + alias + '{\n  const canonical = `${SITE_URL}${servicesHub.slug}/`;')

trust = '''          <div className="reveal mt-8 rounded-2xl border border-bark-950/15 bg-white p-5 sm:p-6">
            <h3 className="font-display text-lg text-bark-950">Что можно проверить до заказа</h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-bark-700 sm:text-base">
              <li>Модели, фотографии и планировки — <Link to="/mobilnaya-banya-omsk/" className="font-medium text-cedar-700 underline underline-offset-2">в каталоге бань</Link>. Фотографии моделей не выдаём за отзывы или отчёты о стройках клиентов.</li>
              <li>Осмотр образцов — на Нефтезаводской, 49/1. Заранее согласуйте время визита по телефону.</li>
              <li>Перед оформлением заказа попросите письменно подтвердить срок изготовления, условия гарантии, комплектацию, доставку и итоговую стоимость для вашей модели.</li>
            </ul>
          </div>
'''
patch('src/sections/ServicesAbout.tsx', '          <div className="reveal mt-10">', trust + '          <div className="reveal mt-10">')

for base in (Path('src'), Path('scripts')):
    for filename in base.rglob('*'):
        if filename.is_file() and filename.suffix in ('.ts', '.tsx', '.js', '.mjs', '.json') and filename.name != 'apply-pre-r6-temporary.py':
            contents = filename.read_text(encoding='utf-8')
            if 'Заозерн' in contents or 'Заозёрн' in contents or 'company.address' in contents:
                raise RuntimeError(f'Outdated public address still present in {filename}')
print('GUARDED PATCH PASS: obsolete public address references gone; numeric product aliases and canonical links added')
