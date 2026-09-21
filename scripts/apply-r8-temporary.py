from pathlib import Path


def patch(file, old, new, expected=1):
    p = Path(file)
    text = p.read_text(encoding='utf-8')
    actual = text.count(old)
    if actual != expected:
        raise RuntimeError(f'{file}: expected {expected} occurrences, got {actual} for {old[:95]!r}')
    p.write_text(text.replace(old, new), encoding='utf-8')
    print(f'R8 PATCH {file}: {actual}')


def span(file, begin, end, new):
    p = Path(file)
    text = p.read_text(encoding='utf-8')
    if text.count(begin) != 1 or text.count(end) != 1:
        raise RuntimeError(f'{file}: span anchors not unique: {begin[:70]}, {end[:70]}')
    a = text.index(begin)
    b = text.index(end, a)
    if b <= a:
        raise RuntimeError(f'{file}: reversed span')
    p.write_text(text[:a] + new + text[b:], encoding='utf-8')
    print(f'R8 SPAN {file}: {b-a} bytes')

hero = 'src/sections/Hero.tsx'
patch(hero, 'company, facts, formatPrice, images, mapsUrl, saunas', 'company, formatPrice, images, mapsUrl, saunas, whatsappUrl')
patch(hero, 'className="order-2 lg:order-1"', 'className="order-1"')
patch(hero, 'className="order-1 lg:order-2 relative"', 'className="order-2 relative"')
patch(hero, 'Кедровая баня в Омске. <span className="text-cedar-400">Привезём готовой.</span>', 'Бани Квадро в Омске — <span className="text-cedar-400">от {formatPrice(minPrice)}</span>')
patch(hero, 'Квадро и каркасные модели от {formatPrice(minPrice)}. Выберите планировку, посмотрите комплектацию и рассчитайте стоимость.', 'Квадро 2×2 — одна парная от {formatPrice(minPrice)}. Есть варианты с комнатой отдыха и каркасная модель с помывочной. Сравните цены, планировки и комплектации без анкеты.')
patch(hero, '''              <LinkButton to="/#configurator" size="lg" onClick={() => track("cta_click", { type: "configurator", where: "hero" })}>
                Рассчитать стоимость <ArrowIcon />
              </LinkButton>
              <LinkButton to={mapsUrl(company.showroom)} variant="ghost" size="lg" external onClick={() => track("cta_click", { type: "map", where: "hero" })}>
                Посмотреть образцы
              </LinkButton>''', '''              <LinkButton to="/mobilnaya-banya-omsk/" size="lg" onClick={() => track("cta_click", { type: "catalog", where: "hero" })}>
                Модели и цены <ArrowIcon />
              </LinkButton>
              <LinkButton to={whatsappUrl("Здравствуйте! Хочу подобрать баню. Подскажите по модели, комплектации и доставке. Страница: https://conradipui-glitch.github.io/silalesa/")} variant="ghost" size="lg" external onClick={() => track("cta_click", { type: "whatsapp", where: "hero" })}>
                Спросить в WhatsApp
              </LinkButton>''')
patch(hero, 'Цена</dt>', 'Квадро 2×2</dt>')
patch(hero, 'Материал</dt>', 'Квадро</dt>')
patch(hero, 'Доставка</dt>', 'Доставка Квадро</dt>')
patch(hero, '>Омск — 0 ₽</dd>', '>по Омску включена</dd>')
patch(hero, 'Проверим подъезд и место установки до заказа. Если манипулятор не пройдёт — заранее согласуем сборку на участке.', 'Каркасная 5,5×2,2 — {formatPrice(saunas.find((s) => s.modelKey === "f55")!.price)}; её доставка и установка согласуются отдельно. <a href={mapsUrl(company.showroom)} target="_blank" rel="noopener noreferrer" className="text-cedar-300 underline underline-offset-4">Посмотреть образец на площадке ↗</a>.')
patch(hero, 'alt="Семья отдыхает рядом с кедровой баней и бассейном на дачном участке"', 'alt="Кедровая мобильная баня на дачном участке"')
patch(hero, '''                    <p className="font-display text-sm text-cream-50">Квадро 4×2</p>
                    <p className="text-xs text-cream-200/80">комната отдыха + парная · {formatPrice(saunas.find((s) => s.modelKey === "k4")!.price)}</p>''', '''                    <p className="font-display text-sm text-cream-50">Мобильные бани «Сила Леса»</p>
                    <p className="text-xs text-cream-200/80">Планировки, фото и цены — в каталоге</p>''')
patch(hero, 'to="/product/10407084"', 'to="/mobilnaya-banya-omsk/"')
span(hero, '      <div className="marquee relative', '    </section>\n  );', '''      <div className="relative mt-12 border-y border-cream-50/10 bg-bark-950/60 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-8 gap-y-2 px-4 text-sm text-cream-200 sm:px-6 lg:px-8">
          <span>Квадро: установка на блоки включена</span>
          <span>Квадро: доставка по Омску включена</span>
          <span>Опции и нестандартный подъезд — по согласованию</span>
        </div>
      </div>
''')

models = 'src/sections/Models.tsx'
patch(models, 'index="02 — Модели"', 'index="01 — Модели"')
patch(models, 'index="03 — Что входит"', 'index="02 — Что входит"')
patch(models, 'index="04 — Планировка"', 'index="03 — Планировка"')
patch(models, 'const useCase = p.modelKey === "k2" ? "Вечер вдвоём" : p.modelKey === "k3" ? "Выходные с семьёй" : p.modelKey === "k4" ? "Встреча с друзьями" : "Полный банный цикл";', 'const useCase = p.modelKey === "k2" ? "Одна парная" : p.modelKey === "k3" ? "Парная + комната отдыха" : p.modelKey === "k4" ? "Два помещения" : "Три помещения с помывочной";')
patch(models, '''          {p.capacity && (
            <li className="rounded-full border border-cream-50/12 px-2.5 py-1 text-[11px] text-cream-200/80" title={p.capacity.note}>
              ориентир: до {p.capacity.people} чел.
            </li>
          )}''', '')
patch(models, '        <div className="mt-auto pt-5 flex items-center justify-between">', '''        <p className="mt-3 text-xs leading-relaxed text-cream-300/70">{p.modelKey === "f55" ? "Каркасная: доставку и монтаж уточняем отдельно." : p.modelKey === "k4" ? "Вход сбоку и увеличенное окно на фото — опции; в стандарте вход с торца." : "Стандарт Квадро: установка на блоки и доставка по Омску включены."}</p>
        <div className="mt-auto pt-5 flex items-center justify-between">''')
patch(models, 'lead="Переключайте модель: планировка перестраивается в пропорциях. Видно не только длину бани, но и сколько места остаётся под отдых, парную и помывочную."', 'lead="Выберите модель и посмотрите помещения, их размеры и состав. Планировка каркасной показана условно; боковой вход Квадро 4×2 — дополнительная опция."')
patch(models, '                    role="tab"\n                    aria-selected={active}\n                    aria-controls="layout-panel"', '                    aria-pressed={active}')
patch(models, 'role="tablist" aria-label="Модели бань в масштабе"', 'role="group" aria-label="Модели бань в масштабе"')
patch(models, 'role="tablist" aria-label="Выбор модели для планировки"', 'role="group" aria-label="Выбор модели для планировки"')
patch(models, '                role="tab"\n                aria-selected={active}', '                aria-pressed={active}')
patch(models, '<div id="layout-panel" role="tabpanel"', '<div id="layout-panel"')
patch(models, 'До покупки понятно, что поместится внутри', 'Планировка каждой модели — до обращения')
patch(models, 'lead="До заказа видно, что уже включено: конструкция, печь, дымоход, бак, электрика, мебель по модели, установка и доставка по Омску. Дополнительные опции считаются отдельно."', 'lead="В стандарт Квадро входят конструкция, печь, дымоход, бак и элементы по спецификации модели. Доставка по Омску и установка на блоки включены. У каркасной бани другой состав и отдельные условия логистики."')
patch(models, '''          <div className="mt-10 space-y-8">
            {std.map''', '''          <details className="mt-8 rounded-2xl border border-bark-950/15 p-5 sm:p-6">
            <summary className="cursor-pointer font-display text-lg font-medium text-bark-950">Полные характеристики Квадро 3×2</summary>
          <div className="mt-8 space-y-8">
            {std.map''')
patch(models, '''          <div className="reveal mt-10 rounded-3xl bg-bark-950''', '''          </details>
          <div className="reveal mt-10 rounded-3xl bg-bark-950''')
patch(models, '            <p className="mt-4 text-xs text-cream-300/60">Для каркасной 5,5×2,2 комплектация своя — она описана на странице модели. Спецификации приведены по данным производителя.</p>', '''            <p className="mt-4 text-xs text-cream-300/70">Для каркасной 5,5×2,2 комплектация и доставка указаны отдельно на странице модели.</p>
            <Link to="/guides/bani/chto-vhodit-v-tsenu/" className="mt-4 inline-flex min-h-11 items-center text-sm text-cedar-300 underline underline-offset-4">Что включено и какие бывают доплаты →</Link>''')
patch(models, '''        </ul>
      </div>
    </section>
  );
}

function ModelCard''', '''        </ul>
        <p className="mt-4 text-sm text-cream-300/70">Листайте карточки по горизонтали на телефоне. Все четыре модели с ценами и планировками есть также в <Link to="/mobilnaya-banya-omsk/" className="font-medium text-cedar-300 underline underline-offset-4">общем каталоге</Link>.</p>
      </div>
    </section>
  );
}

function ModelCard''')

story = 'src/sections/Story.tsx'
patch(story, 'import { ArrowIcon, SectionHead } from "../components/Brand";', 'import { ArrowIcon, SectionHead } from "../components/Brand";\nimport { Link } from "../lib/router";')
span(story, 'const steps = [', 'export function Process()', '''const steps = [
  { n: "01", t: "Выберите планировку", d: "Сравните реальные цены, комнаты и опции в карточках моделей. Начинать с конфигуратора необязательно.", link: { label: "Каталог четырёх моделей", to: "/mobilnaya-banya-omsk/" } },
  { n: "02", t: "Согласуйте участок", d: "Сообщите адрес, пришлите фото въезда и места установки. До заказа определим способ доставки и основание без универсальных обещаний.", link: { label: "Как подготовить доставку", to: "/guides/bani/podgotovka-uchastka-dostavka-manipulyator/" } },
  { n: "03", t: "Подтвердите заказ и примите баню", d: "Сверьте модель, цену, комплектацию, дату и доставку письменно. При приёмке проверьте комплект; печь, дымоход и электрику — со специалистом.", link: { label: "Чек-лист приёмки", to: "/guides/bani/chek-list-priemki-gotovoy-bani/" } },
];

''')
patch(story, 'index="05 — От выбора до установки" title={<span id="process-title">От выбора модели до первой топки — пять понятных шагов</span>}', 'index="04 — Как заказать" title={<span id="process-title">От выбора бани до приёмки — три шага</span>} lead="Сначала модель, затем условия участка и согласование заказа. Без обязательной анкеты перед первым ответом."')
patch(story, 'className="relative mt-12 grid gap-8 md:grid-cols-5"', 'className="relative mt-12 grid gap-8 md:grid-cols-3"')
patch(story, '''                  <a
                    href={s.link.to}
                    target={s.link.to.startsWith("http") ? "_blank" : undefined}
                    rel={s.link.to.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="mt-3 inline-flex items-center gap-1 text-sm text-cedar-300 hover:text-cedar-200"
                    onClick={() => track("cta_click", { type: s.link!.to.startsWith("tel") ? "call" : "map", where: "process" })}
                  >
                    {s.link.label} <ArrowIcon className="h-3.5 w-3.5" />
                  </a>''', '''                  <Link to={s.link.to} className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm text-cedar-300 hover:text-cedar-200" onClick={() => track("nav", { to: s.link!.to, from: "process" })}>
                    {s.link.label} <ArrowIcon className="h-3.5 w-3.5" />
                  </Link>''')
patch(story, 'index="05 — От выбора до установки"', 'index="04 — Как заказать"', expected=0) if False else None
patch(story, '            Время прогрева и расход дров зависят от наружной температуры, режима топки и эксплуатации — универсальные цифры для всех участков не обещаем.', '            Прогрев зависит от погоды и режима топки. Перед использованием соблюдайте инструкцию печи и рекомендации специалиста по дымоходу и электрике; срок прогрева не фиксирован.')
patch(story, '''          </p>
        </div>
      </div>
    </section>
  );
}

const steps''', '''          </p>
          <Link to="/guides/bani/chek-list-priemki-gotovoy-bani/" className="mt-5 inline-flex min-h-11 items-center text-sm text-cedar-300 underline underline-offset-4">Что проверить перед первым использованием →</Link>
        </div>
      </div>
    </section>
  );
}

const steps''')

trust = 'src/sections/Trust.tsx'
patch(trust, 'company, mapsUrl', 'company, mapsUrl, whatsappUrl')
patch(trust, 'import { track } from "../lib/utils";', 'import { track } from "../lib/utils";\nimport { Link } from "../lib/router";')
span(trust, 'const readyPoints = [', 'export function ReadyPromise()', '''const readyPoints = [
  { title: "Планировки и цены без заявки", text: "Четыре карточки моделей показывают размер, комнаты и цену. Для Квадро 4×2 вход сбоку на фото — дополнительная опция." },
  { title: "Стандарт Квадро указан открыто", text: "На блоки устанавливаем и по Омску доставляем в рамках стандартной комплектации Квадро. Для каркасной модели условия другие — уточняются отдельно." },
  { title: "Образец можно осмотреть", text: `Площадка: ${company.showroom}. Уточните время визита, сравните комплектацию и планировку выбранной модели с заказом.` },
];

''')
patch(trust, 'Готовая баня — <span className="text-cedar-700">без лишней неопределённости.</span>', 'Модель, цена и условия — <span className="text-cedar-700">до оформления заказа.</span>')
patch(trust, 'Сначала проверяем модель, комплектацию и условия участка. Потом понятен сценарий: привезти готовой или собрать на месте, если подъезд ограничен.', 'Выберите баню по помещениям и цене. Обсудим подъезд, основание и монтаж под конкретный участок; для каркасной и нестандартной доставки условия отдельно.')
patch(trust, '''            <LinkButton to="/#configurator" onClick={() => track("cta_click", { type: "configurator", where: "why-ready" })}>
              Рассчитать свою баню <ArrowIcon />
            </LinkButton>''', '''            <LinkButton to="/mobilnaya-banya-omsk/" onClick={() => track("cta_click", { type: "catalog", where: "why-ready" })}>
              Сравнить модели <ArrowIcon />
            </LinkButton>''')
span(trust, 'const faqs = [', 'export function Faq()', '''const faqs = [
  { q: "Что входит в цену Квадро?", a: "Базовая комплектация модели, установка на блоки и доставка по Омску. У Квадро 4×2 вход сбоку, увеличенное окно и стеклянная дверца печи на фото — опции. Окончательный состав подтвердите в заказе." },
  { q: "А у каркасной бани те же условия?", a: "Нет. Каркасная 5,5×2,2 имеет три помещения и собственную комплектацию. Условия доставки и установки согласуются отдельно; стандарт Квадро автоматически на неё не распространяется." },
  { q: "Что подготовить для доставки?", a: "Адрес, фотографии подъезда и места установки. До заказа согласуйте основание, возможность подъезда техники, место разгрузки и способ монтажа." },
  { q: "Подойдёт ли баня для зимы?", a: "В характеристиках Квадро указаны кедровый брус 45 мм, печь Aston 16 и сэндвич-дымоход. Время прогрева зависит от условий. Перед топкой проверьте безопасную установку со специалистом и следуйте инструкции производителя." },
  { q: "Где посмотреть готовый образец?", a: `На выставочной площадке: ${company.showroom}. Время осмотра предварительно согласуйте по телефону.` },
  { q: "Как согласовать сроки, гарантию и итоговую цену?", a: "Попросите письменно указать выбранную комплектацию, дополнительные опции, дату, условия доставки/монтажа, гарантийные условия и итоговую стоимость до оформления заказа." },
];

''')
patch(trust, 'index="08 — До заказа"', 'index="07 — Вопросы"')
patch(trust, 'lead="Без маркетинговых сюрпризов: основание, заезд на участок, вода, зима, доставка и то, что действительно входит в цену."', 'lead="Короткие ответы о комплектации, доставке, зиме и том, что нужно подтвердить в заказе."')
patch(trust, '''          <div className="divide-y divide-bark-950/10 border-y border-bark-950/10">''', '''          <div className="divide-y divide-bark-950/10 border-y border-bark-950/10">''', expected=2)
patch(trust, '''        <div className="reveal mt-12 flex flex-col gap-5''', '''        <nav aria-label="Практические инструкции" className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <Link to="/guides/bani/chto-vhodit-v-tsenu/" className="text-cedar-700 underline underline-offset-4">Состав цены и доплаты</Link>
          <Link to="/guides/bani/podgotovka-uchastka-dostavka-manipulyator/" className="text-cedar-700 underline underline-offset-4">Подготовка к доставке</Link>
          <Link to="/guides/bani/chek-list-priemki-gotovoy-bani/" className="text-cedar-700 underline underline-offset-4">Приёмка бани</Link>
        </nav>
        <div className="reveal mt-12 flex flex-col gap-5''')
patch(trust, '''            <p className="mt-2 text-sm text-cream-300/75">Позвоните — проще за несколько минут проверить заезд, место установки и подходящую модель.</p>''', '''            <p className="mt-2 text-sm text-cream-300/75">Пришлите модель, адрес и фото въезда, если они уже есть. Остальное уточним в чате.</p>''')
patch(trust, '''          <LinkButton to={`tel:${company.phonePrimary.tel}`} className="shrink-0" onClick={() => track("cta_click", { type: "call", where: "faq" })}>
            Позвонить {company.phonePrimary.display}
          </LinkButton>''', '''          <LinkButton to={whatsappUrl("Здравствуйте! Есть вопрос по бане и условиям установки. Страница: https://conradipui-glitch.github.io/silalesa/")} external className="shrink-0" onClick={() => track("cta_click", { type: "whatsapp", where: "faq" })}>
            Спросить в WhatsApp
          </LinkButton>''')

about = 'src/sections/ServicesAbout.tsx'
patch(about, 'company, formatPrice, mapsUrl, services', 'company, formatPrice, mapsUrl, services, whatsappUrl')
patch(about, 'index="09 — Производство и контакты"', 'index="08 — Площадка и контакты"')
patch(about, 'Баню можно проверить не по обещаниям, а вживую', 'Посмотреть образец и уточнить условия')
patch(about, '«Сила Леса» производит мобильные бани в Омске. До заказа можно приехать на площадку, зайти внутрь готового образца, посмотреть узлы печи и дымохода, оценить размеры помещений и фактуру кедра.', 'На площадке в Омске можно осмотреть образец, сравнить размеры и планировку с карточкой выбранной бани. Время визита согласуйте заранее.')
patch(about, 'Мы не прячем техническую часть за красивой картинкой: на сайте открыты планировки, состав стандартной комплектации, базовые цены и известные доплаты. Если участок сложный для доставки, вариант монтажа обсуждается заранее.', 'До заказа подтвердите выбранную комплектацию, опции, срок, итоговую цену и условия доставки письменно. Способ установки зависит от модели и подъезда.')
patch(about, 'Модели, фотографии и планировки — <Link to="/mobilnaya-banya-omsk/" className="font-medium text-cedar-700 underline underline-offset-2">в каталоге бань</Link>. Фотографии моделей не выдаём за отзывы или отчёты о стройках клиентов.', 'Фотографии, цены и планировки — <Link to="/mobilnaya-banya-omsk/" className="font-medium text-cedar-700 underline underline-offset-2">в каталоге бань</Link>.')
patch(about, 'Перед оформлением заказа попросите письменно подтвердить срок изготовления, условия гарантии, комплектацию, доставку и итоговую стоимость для вашей модели.', 'Сверьте с заказом опции, сроки, гарантийные условия, доставку и итоговую цену.')
span(about, '''          <div className="reveal mt-10">
            <h3 className="font-display text-xs uppercase tracking-[0.2em] text-cedar-700">Что можно проверить на площадке''', '''        </div>

        <div className="reveal rounded-3xl bg-bark-950''', '')
patch(about, '''            <LinkButton to="/#configurator" variant="ghost" onClick={() => track("cta_click", { type: "configurator", where: "contacts" })}>
              Рассчитать баню
            </LinkButton>''', '''            <LinkButton to={whatsappUrl("Здравствуйте! Хочу посмотреть баню и уточнить комплектацию. Страница: https://conradipui-glitch.github.io/silalesa/")} variant="ghost" external onClick={() => track("cta_click", { type: "whatsapp", where: "contacts" })}>
              Написать в WhatsApp
            </LinkButton>''')

app = 'src/App.tsx'
patch(app, '''      <Hero />
      <ReadyPromise />
      <Lineup model={model} setModel={setModel} />''', '''      <Hero />
      <Lineup model={model} setModel={setModel} />''')
patch(app, '''      <Process />
      <Configurator model={model} setModel={setModel} />''', '''      <Process />
      <ReadyPromise />
      <Configurator model={model} setModel={setModel} />''')

brand = 'src/components/Brand.tsx'
patch(brand, 'import { company } from "../data/products";', 'import { byId, company, whatsappUrl } from "../data/products";\nimport { seoPageBySlug } from "../data/seoPages";')
patch(brand, '''      <nav className="hidden lg:flex items-center gap-1" aria-label="Разделы">{NAV.map((n) => <Link key={n.id} to={`/#${n.id}`} className="px-3 py-2 text-[13.5px] text-cream-200/80 hover:text-cream-50 rounded-full hover:bg-cream-50/6 transition-colors" onClick={() => track("nav", { to: n.id, from: "header" })}>{n.label}</Link>)}</nav>''', '''      <nav className="hidden lg:flex items-center gap-1" aria-label="Разделы"><Link to="/mobilnaya-banya-omsk/" className="px-3 py-2 text-[13.5px] text-cream-200/80 hover:text-cream-50 rounded-full hover:bg-cream-50/6">Каталог</Link>{NAV.map((n) => <Link key={n.id} to={`/#${n.id}`} className="px-3 py-2 text-[13.5px] text-cream-200/80 hover:text-cream-50 rounded-full hover:bg-cream-50/6 transition-colors" onClick={() => track("nav", { to: n.id, from: "header" })}>{n.label}</Link>)}</nav>''')
patch(brand, '''        <LinkButton to="/#configurator" size="sm" className="hidden sm:inline-flex" onClick={() => track("cta_click", { type: "configurator", where: "header" })}>Рассчитать баню</LinkButton>''', '''        <LinkButton to={whatsappUrl("Здравствуйте! Хочу узнать о бане и комплектации. Сайт: https://conradipui-glitch.github.io/silalesa/")} external size="sm" className="hidden sm:inline-flex" onClick={() => track("cta_click", { type: "whatsapp", where: "header" })}>Написать в WhatsApp</LinkButton>''')
patch(brand, '''aria-label="Разделы">{NAV.map((n, i) => <Link''', '''aria-label="Разделы"><Link to="/mobilnaya-banya-omsk/" className="py-4 text-2xl font-display font-medium text-cream-50 border-b border-cream-50/8 flex items-center justify-between" onClick={() => setOpen(false)}>Каталог моделей <ArrowIcon className="text-cedar-400" /></Link>{NAV.map((n, i) => <Link''')
patch(brand, '''export function MobileBar() {
  return <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-cream-50/10 bg-bark-900/92 backdrop-blur-md px-3 pt-2 pb-[max(env(safe-area-inset-bottom),8px)]"><div className="grid grid-cols-2 gap-2"><a href={`tel:${company.phonePrimary.tel}`} className={cn(btnBase, btnVariants.ghost, "h-11 text-sm")} onClick={() => track("cta_click", { type: "call", where: "mobile-bar" })}><PhoneIcon /> Позвонить</a><LinkButton to="/#configurator" size="md" className="h-11 text-sm" onClick={() => track("cta_click", { type: "configurator", where: "mobile-bar" })}>Рассчитать баню</LinkButton></div></div>;
}''', '''export function MobileBar() {
  const { route } = useRouter();
  const page = route.name === "landing" ? seoPageBySlug(route.slug) : undefined;
  const product = route.name === "product" ? byId(route.id) : undefined;
  const isService = page?.kind === "service" || product?.kind === "service" || route.name === "services";
  const subject = page?.h1 ?? product?.name ?? (isService ? "строительные услуги" : "мобильная баня");
  const path = route.name === "landing" ? `${route.slug}/` : route.name === "product" ? `product/${route.id}/` : route.name === "services" ? "services/" : "";
  const wa = whatsappUrl(`Здравствуйте! Интересует ${subject}. Страница: https://conradipui-glitch.github.io/silalesa/${path}`);
  return <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-cream-50/10 bg-bark-900/92 backdrop-blur-md px-3 pt-2 pb-[max(env(safe-area-inset-bottom),8px)]"><div className="grid grid-cols-2 gap-2"><a href={`tel:${company.phonePrimary.tel}`} className={cn(btnBase, btnVariants.ghost, "h-11 text-sm")} onClick={() => track("cta_click", { type: "call", where: "mobile-bar" })}><PhoneIcon /> Позвонить</a><LinkButton to={wa} external size="md" className="h-11 text-sm" onClick={() => track("cta_click", { type: "whatsapp", where: "mobile-bar", subject })}>Написать в WhatsApp</LinkButton></div></div>;
}''')
patch(brand, '''<Link to="/services" className="text-sm text-cream-300/70 hover:text-cream-50 underline-offset-4 hover:underline">Другие строительные услуги</Link>''', '''<Link to="/services/" className="text-sm text-cream-300/70 hover:text-cream-50 underline-offset-4 hover:underline">Строительные услуги</Link><Link to="/mobilnaya-banya-omsk/" className="text-sm text-cream-300/70 hover:text-cream-50 underline-offset-4 hover:underline">Каталог бань</Link>''')
patch(brand, '''<li className="text-cream-300/70">Осмотр по предварительной договорённости; время уточните по телефону.</li>''', '''<li className="text-cream-300/70">Осмотр по предварительной договорённости; время уточните по телефону.</li><li><a href={whatsappUrl("Здравствуйте! Хочу уточнить комплектацию бани. Сайт: https://conradipui-glitch.github.io/silalesa/")} target="_blank" rel="noopener noreferrer" className="text-cedar-300 hover:text-cedar-200">Написать в WhatsApp</a></li>''')

prerender = 'scripts/prerender.mjs'
patch(prerender, 'import { operationalGuideFallback } from "./operational-guide-fallback.mjs";', 'import { operationalGuideFallback } from "./operational-guide-fallback.mjs";\nimport { homeFallback } from "./home-fallback.mjs";')
patch(prerender, '''const sitemapUrls = [SITE_URL, `${SITE_URL}${servicesHub.slug}/`, ...pages.map((page) => `${SITE_URL}${page.slug}/`)];''', '''// Give the home page the same meaningful first answer and canonical product links without JavaScript.
{
  const prefix = { k2: "kvadro-2x2-", k3: "kvadro-3x2-", k4: "kvadro-4x2-", f55: "karkasnaya-5-5-" };
  const builtAssets = await fs.readdir(path.join(DIST, "assets"));
  const assets = Object.fromEntries(Object.entries(prefix).map(([key, stem]) => {
    const match = builtAssets.filter((name) => name.startsWith(stem) && name.endsWith(".webp"));
    if (match.length !== 1) throw new Error(`Home static image ambiguous or missing: ${key}`);
    return [key, match[0]];
  }));
  const home = homeFallback(saunaChoiceModels, assets, SITE_URL, whatsappMatch[1], "+79136884533", "Омск, ул. Нефтезаводская, 49/1");
  if (!template.includes('<div id="root"></div>')) throw new Error('Home root placeholder missing');
  await fs.writeFile(path.join(DIST, "index.html"), template.replace('<div id="root"></div>', home), "utf8");
}

const sitemapUrls = [SITE_URL, `${SITE_URL}${servicesHub.slug}/`, ...pages.map((page) => `${SITE_URL}${page.slug}/`)];''')
patch(prerender, 'console.log(`Prerendered ${pages.length} SEO pages + services hub and generated sitemap.xml + llms.txt.`);', 'console.log(`Prerendered home + ${pages.length} SEO pages + services hub and generated sitemap.xml + llms.txt.`);')

index = 'index.html'
patch(index, 'Готовые кедровые бани в Омске. Квадро 2×2, 3×2 и 4×2 м от 230 000 ₽: планировки, стандартная комплектация, расчёт стоимости и просмотр образцов на площадке.', 'Бани Квадро в Омске от 230 000 ₽ за модель 2×2. Четыре модели с ценами и планировками, состав стандарта Квадро, условия доставки и просмотр образца на площадке.')
patch(index, 'Кедровые Квадро и каркасные бани от 230 000 ₽. Планировки, комплектация, расчёт стоимости и образцы на площадке в Омске.', 'Квадро 2×2 от 230 000 ₽; каркасная 5,5×2,2 — 630 000 ₽. Планировки, условия и адрес выставочной площадки в Омске.')
print('R8 INTEGRATION COMPLETE')
