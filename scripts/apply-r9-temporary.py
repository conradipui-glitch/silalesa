"""One-time guarded R9 integration. Applied and removed by workflow after green CI."""
from pathlib import Path
import re


def change(file, old, new, count=1):
    path = Path(file)
    text = path.read_text(encoding='utf-8')
    actual = text.count(old)
    if actual != count:
        raise RuntimeError(f'{file}: expected {count} occurrences, got {actual}: {old[:90]!r}')
    path.write_text(text.replace(old, new), encoding='utf-8')
    print(f'R9: patched {file}: {actual}')


config = 'src/sections/Configurator.tsx'
quiz = 'src/sections/Quiz.tsx'

# Configurator: the frame model is NOT covered by Kvadro delivery or option rates.
change(config, 'import { cn } from "../utils/cn";', 'import { cn } from "../utils/cn";\nimport { seoPages } from "../data/seoPages";')
change(config, '  const isFrame = model === "f55";', '''  const isFrame = model === "f55";
  const deliveryKnown = !isFrame && opts.city === "omsk";
  const productHref = `/${seoPages.find((page) => page.productId === product.id)?.slug ?? `product/${product.id}`}/`;
  const quoteHasUnknownDelivery = !deliveryKnown;''')
change(config, '''    if (s && saunas.some((p) => p.modelKey === s.model)) {''', '''    if (s && saunas.some((p) => p.modelKey === s.model)
      && typeof s.sidePack === "boolean"
      && doorOptions.some((d) => d.id === s.door)
      && Number.isInteger(s.lamps) && s.lamps >= 0 && s.lamps <= 4
      && ["outside", "steam", "rest"].includes(s.vent)
      && (s.city === "omsk" || s.city === "other")) {''')
change(config, '''    if (opts.sidePack) {''', '''    if (!isFrame && (model === "k3" || model === "k4") && opts.sidePack) {''')
change(config, '''    if (door.price > 0) l.push({ label: door.label, price: door.price });
    if (opts.lamps > 0) l.push({ label: `Уличный светильник × ${opts.lamps}`, price: opts.lamps * lampPrice });''', '''    if (!isFrame && door.price > 0) l.push({ label: door.label, price: door.price });
    if (!isFrame && opts.lamps > 0) l.push({ label: `Уличный светильник × ${opts.lamps}`, price: opts.lamps * lampPrice });''')
change(config, '''  }, [product, opts, model]);''', '''  }, [product, opts, model, isFrame]);''')
change(config, '''  const hasUnpriced = lines.some((x) => x.price === null);''', '''  const hasUnpriced = lines.some((x) => x.price === null) || quoteHasUnknownDelivery;''')
change(config, '''    rows.push(`• Доставка: ${opts.city === "omsk" ? "Омск (бесплатно)" : "другой город — обсудить"}`);''', '''    rows.push(`• Доставка: ${isFrame ? "каркасная баня — условия и стоимость по запросу" : opts.city === "omsk" ? "по Омску входит в стандарт Квадро" : "другой город — стоимость по запросу"}`);
    if (isFrame) rows.push("• Установка каркасной бани: условия и стоимость по запросу");''')
change(config, '''      `Итого ориентировочно: ${formatPrice(total)}${hasUnpriced ? " + позиции по запросу" : ""}`,
      `Модель: ${product.originalUrl}`,''', '''      `Известная часть стоимости: ${formatPrice(total)}${hasUnpriced ? "; доставка, установка или опции по запросу, это не полная смета" : "; итог подтверждается до заказа"}`,
      `Модель: https://conradipui-glitch.github.io/silalesa${productHref}`,''')
change(config, '''  }, [lines, opts, product, total, hasUnpriced]);''', '''  }, [lines, opts, productHref, total, hasUnpriced, isFrame]);''')
change(config, '''    setOpts(DEFAULT);
    setRestored(false);''', '''    setOpts(DEFAULT);
    setModel("k2");
    setCopied("idle");
    setRestored(false);''')
change(config, '''          lead="Цены опций — по прайсу компании. Итог ориентировочный: точную стоимость и срок подтверждает менеджер после разговора."''', '''          lead="Цена выбранной модели видна сразу. Известные доплаты прибавляются автоматически; неизвестную стоимость доставки, установки или опций не подменяем нулём. Итог подтверждает менеджер."''')
change(config, '''          {/* Левая колонка — выбор */}
          <div className="space-y-8">''', '''          {/* На телефоне сначала результат и контакт, затем необязательные параметры. */}
          <div className="order-2 space-y-8 lg:order-1">''')
change(config, '''<legend className="font-display text-xs uppercase tracking-[0.2em] text-cedar-300">Модель</legend>''', '''<legend className="font-display text-xs uppercase tracking-[0.2em] text-cedar-300">1. Выберите модель — цена уже рассчитана</legend>''')
change(config, '''                Каркасная баня 5,5×2,2 комплектуется индивидуально — три помещения, панорамное окно, печь со стеклянной дверцей уже входят в цену. Опции из прайса бань-квадро к ней не применяются: обсудите пожелания с менеджером.''', '''                Каркасная баня 5,5×2,2: три помещения, панорамное окно и печь со стеклянной дверцей. Опции и бесплатная доставка Квадро к ней не относятся. Условия доставки и установки каркасной модели уточняются отдельно.''')
change(config, '''                    {c === "omsk" ? "Омск — бесплатно" : "Другой город — обсудить"}''', '''                    {c === "omsk" ? (isFrame ? "Омск — стоимость по запросу" : "Омск — включено для Квадро") : "Другой город — стоимость по запросу"}''')
change(config, '''<aside className="reveal lg:sticky lg:top-24 rounded-3xl''', '''<aside className="reveal order-1 lg:order-2 lg:sticky lg:top-24 rounded-3xl''')
change(config, '''              {restored && (
                <button type="button" onClick={resetDraft} className="text-xs text-cream-300/70 hover:text-cream-50 underline underline-offset-4">
                  черновик восстановлен · сбросить
                </button>
              )}''', '''              <button type="button" onClick={resetDraft} className="text-xs text-cream-300/70 hover:text-cream-50 underline underline-offset-4">
                {restored ? "Черновик восстановлен · сбросить" : "Сбросить расчёт"}
              </button>''')
change(config, '''                <span className="text-cream-200/85">Доставка: {opts.city === "omsk" ? "Омск" : "другой город"}</span>
                <span className="font-display text-cream-300/70">{opts.city === "omsk" ? "0 ₽" : "по запросу"}</span>''', '''                <span className="text-cream-200/85">Доставка: {opts.city === "omsk" ? "Омск" : "другой город"}</span>
                <span className="font-display text-cream-300/70">{deliveryKnown ? "включена" : "по запросу"}</span>''')
change(config, '''            </ul>

            <div className="mt-4 flex items-end''', '''              {isFrame && <li className="flex items-start justify-between gap-4 py-2.5"><span className="text-cream-200/85">Установка каркасной бани</span><span className="text-cream-300/70">по запросу</span></li>}
            </ul>

            <div className="mt-4 flex items-end''')
change(config, '''<span className="text-sm text-cream-300/70">Итого ориентировочно</span>''', '''<span className="text-sm text-cream-300/70">{hasUnpriced ? "Известная часть цены, от" : "Ориентир по выбранным позициям"}</span>''')
change(config, '''            {hasUnpriced && <p className="mt-2 text-xs text-cream-300/70">Часть позиций — по запросу: цена уточняется у менеджера.</p>}''', '''            {hasUnpriced && <p className="mt-2 text-xs text-cream-300/70">Не полная смета: доставка, установка или выбранные опции требуют отдельного расчёта. Нельзя считать неизвестное нулевой доплатой.</p>}''')
change(config, '''              {standardIncluded.map((s) => (''', '''              {!isFrame && standardIncluded.map((s) => (''')
change(config, '''            <div ref={ctaRef} className="mt-6 grid gap-2">''', '''            {isFrame && <p className="mt-4 text-xs text-cream-300/75">Комплектация каркасной бани указана на странице модели. Доставка и установка — отдельное согласование.</p>}
            <div ref={ctaRef} className="mt-6 grid gap-2">''')

# Quiz: show factual prices before questions; two required answers, three optional refinements.
change(quiz, 'import { cn } from "../utils/cn";', 'import { cn } from "../utils/cn";\nimport { seoPages } from "../data/seoPages";')
change(quiz, '''function evaluate(a: Required<Answers>): Verdict[] {
  const site = spaces[a.space];''', '''function evaluate(a: Answers): Verdict[] {
  const site = a.space ? spaces[a.space] : null;
  if (!site || !a.rooms) return [];''')
start = '    const cap = p.capacity?.people ?? 4;'
end = '\n\n    const have = p.roomsList?.length ?? 1;'
text = Path(quiz).read_text(encoding='utf-8')
assert text.count(start) == 1 and text.count(end) == 1
begin = text.index(start)
finish = text.index(end, begin)
text = text[:begin] + '''    if (a.people && p.capacity?.people && a.people > p.capacity.people) {
      warn.push("Количество гостей необходимо обсудить по планировке и размеру парной; вместимость не гарантируется автоматически.");
    }''' + text[finish:]
Path(quiz).write_text(text, encoding='utf-8')
change(quiz, '''if (have === a.rooms)''', '''if (have === a.rooms)''') if False else None
change(quiz, '''    if (a.access === "yes") {''', '''    if (a.access === "yes") {''') if False else None
change(quiz, '''    } else {
      warn.push(p.modelKey?.startsWith("k") ? "готовую баню не завезти; для Квадро можно обсудить сборку на участке" : "сценарий монтажа нужно отдельно согласовать");
    }

    if (p.price <= a.budget) {''', '''    } else if (a.access === "no") {
      warn.push(p.modelKey?.startsWith("k") ? "готовую баню не завезти; для Квадро можно обсудить сборку на участке" : "сценарий монтажа нужно отдельно согласовать");
    }

    if (a.budget === undefined) {
      // The budget is optional: the first result must not invent one.
    } else if (p.price <= a.budget) {''')
change(quiz, '''  return list.sort((x, y) => y.score - x.score || x.product.price - y.product.price);''', '''  // A model that does not fit the stated site or lacks required rooms is never recommended.
  // Setbacks, unloading space and permits are still verified separately by a specialist.
  return list.filter(({ product }) =>
    (product.roomsList?.length ?? 1) >= a.rooms!
    && (product.footprint?.l ?? Infinity) <= site.l
    && (product.footprint?.w ?? Infinity) <= site.w,
  ).sort((x, y) => y.score - x.score || x.product.price - y.product.price);''')
# Reorder existing typed question objects without rewriting their verified copy.
p = Path(quiz)
s = p.read_text(encoding='utf-8')
a = s.index('const questions = [\n')
b = s.index('] as const;', a)
block = s[a + len('const questions = [\n'):b]
matches = list(re.finditer(r'^  \{\n    id: "(people|rooms|space|access|budget)" as const,', block, re.M))
if len(matches) != 5 or [m.group(1) for m in matches] != ['people', 'rooms', 'space', 'access', 'budget']:
    raise RuntimeError('Unexpected quiz question structure')
chunks = {match.group(1): block[match.start():matches[i + 1].start() if i < 4 else len(block)] for i, match in enumerate(matches)}
s = s[:a] + 'const questions = [\n' + ''.join(chunks[k] for k in ['rooms', 'space', 'budget', 'people', 'access']) + s[b:]
p.write_text(s, encoding='utf-8')
change(quiz, '''    if (s?.result) setSaved(s);''', '''    if (s?.result && s.answers?.rooms && s.answers?.space && saunas.some((p) => p.id === s.result)) setSaved(s);''')
change(quiz, '''  const complete = answers.people && answers.rooms && answers.space && answers.access && answers.budget;
  const verdicts = useMemo(() => (complete ? evaluate(answers as Required<Answers>) : []), [answers, complete]);''', '''  const complete = Boolean(answers.rooms && answers.space);
  const verdicts = useMemo(() => (complete ? evaluate(answers) : []), [answers, complete]);''')
change(quiz, '''    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      const res = evaluate(next as Required<Answers>);
      setStage("result");
      track("quiz_complete", { result: res[0].product.modelKey ?? "", score: res[0].score });
      if (canStore) {
        const savedNext: Saved = { answers: next, result: res[0].product.id, ts: Date.now() };
        saveJSON(KEY, savedNext);
        setSaved(savedNext);
      }
    }''', '''    if (step === 1 || step === questions.length - 1) {
      const res = evaluate(next);
      setStage("result");
      track("quiz_complete", { result: res[0]?.product.modelKey ?? "none", score: res[0]?.score ?? 0 });
      if (canStore && res[0]) {
        const savedNext: Saved = { answers: next, result: res[0].product.id, ts: Date.now() };
        saveJSON(KEY, savedNext);
        setSaved(savedNext);
      } else if (!res[0]) {
        removeKey(KEY);
        setSaved(null);
      }
    } else {
      setStep(step + 1);
    }''')
change(quiz, '''  const savedProduct = saved ? saunas.find((p) => p.id === saved.result) : null;''', '''  const savedProduct = saved ? saunas.find((p) => p.id === saved.result) : null;
  const modelHref = (p: Product) => `/${seoPages.find((page) => page.productId === p.id)?.slug ?? `product/${p.id}`}/`;''')
change(quiz, '''      lead="Сопоставим людей, помещения, габарит площадки, подъезд и бюджет. Это предварительный подбор: он не заменяет проверку отступов, основания и точки разгрузки."''', '''      lead="Сначала два ответа — нужные помещения и место под баню. Сразу покажем подходящие по этим условиям модели и цены. Бюджет, количество гостей и подъезд можно уточнить после первого результата."''')
change(quiz, '''              После подбора можно одним нажатием отправить результат менеджеру в WhatsApp — модель и ваши ответы подставятся в сообщение автоматически.''', '''              Это ориентир по габаритам самой бани, а не проект установки: отступы, основание и подъезд проверяются отдельно. Сообщение откроется в WhatsApp, отправите его вы сами.''')
change(quiz, '''                  <h3 className="mt-3 font-display text-2xl sm:text-3xl text-cream-50">Покажем подходящую модель и отдельно отметим, что ещё нужно проверить на участке</h3>
                  <ul className="mt-6 grid gap-2 text-sm text-cream-200/80 sm:grid-cols-2">
                    {questions.map((q, i) => (
                      <li key={q.id} className="flex items-center gap-2">
                        <span className="font-display text-xs text-cedar-400">0{i + 1}</span> {q.title}
                      </li>
                    ))}
                  </ul>''', '''                  <h3 className="mt-3 font-display text-2xl sm:text-3xl text-cream-50">Два ответа — и видны подходящие по помещениям и размеру варианты</h3>
                  <p className="mt-3 text-sm text-cream-200/80">Без анкеты можно сразу открыть любую модель с известной стартовой ценой:</p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {saunas.map((p) => <li key={p.id}><LinkButton to={modelHref(p)} variant="ghost" className="w-full justify-between text-xs" onClick={() => track("product_view", { id: p.id, from: "quiz-before-questions" })}>{p.shortName} · {formatPrice(p.price)}</LinkButton></li>)}
                  </ul>
                  <p className="mt-4 text-xs text-cream-300/70">Нужны только помещения и габарит места. Остальные три вопроса — по желанию.</p>''')
change(quiz, '''                  <Button size="lg" onClick={start}>
                    Начать подбор <ArrowIcon />''', '''                  <Button size="lg" onClick={start}>
                    Подобрать за два ответа <ArrowIcon />''')
change(quiz, '''                  <span className="font-display">Вопрос {step + 1} из {questions.length}</span>
                  <button type="button" onClick={() => (step === 0 ? setStage("idle") : setStep(step - 1))} className="hover:text-cream-50">''', '''                  <span className="font-display">{step < 2 ? `Основной вопрос ${step + 1} из 2` : `Уточнение ${step - 1} из 3`}</span>
                  <button type="button" onClick={() => (step === 0 ? setStage("idle") : step === 2 && complete ? setStage("result") : setStep(step - 1))} className="hover:text-cream-50">''')
change(quiz, '''                  {questions.map((q, i) => (
                    <span key={q.id} className={cn("h-1 rounded-full transition-colors", i <= step ? "bg-cedar-400" : "bg-cream-50/15")} />
                  ))}''', '''                  {questions.slice(0, step < 2 ? 2 : 5).map((q, i) => (
                    <span key={q.id} className={cn("h-1 rounded-full transition-colors", i <= step ? "bg-cedar-400" : "bg-cream-50/15")} />
                  ))}''')
change(quiz, '''                <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Лучшее совпадение по ответам</p>''', '''                <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Предварительный вариант по вашим условиям</p>''')
change(quiz, '''                <div className="mt-auto pt-8 flex flex-wrap gap-3">''', '''                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={() => { setStep(2); setStage("q"); }} className="rounded-full border border-cedar-400/60 px-4 py-2 text-sm text-cream-50 hover:bg-cream-50/10">{answers.access ? "Изменить уточнения" : "Уточнить бюджет, гостей и подъезд (необязательно)"}</button>
                  <button type="button" onClick={() => { setStep(0); setStage("q"); }} className="rounded-full border border-cream-50/20 px-4 py-2 text-sm text-cream-50 hover:bg-cream-50/10">Изменить помещения или размер</button>
                </div>
                <div className="mt-auto pt-8 flex flex-wrap gap-3">''')
change(quiz, '''to={`/product/${best.product.id}`}''', '''to={modelHref(best.product)}''')
change(quiz, '''            {stage === "result" && best && (''', '''            {stage === "result" && !best && (
              <div className="flex flex-1 flex-col gap-5">
                <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Нужна проверка условий</p>
                <h3 className="font-display text-2xl text-cream-50">По указанным помещениям и габариту места подходящей модели в каталоге нет</h3>
                <p className="text-sm text-cream-200/85">Не предлагаем баню, которая физически не помещается или не содержит нужные помещения. Проверьте размеры площадки и свободное место для установки с менеджером.</p>
                <div className="mt-auto flex flex-wrap gap-3">
                  <LinkButton to={whatsappUrl(`Здравствуйте! Не нашёл подходящую баню: помещения — ${answers.rooms ? roomLabels[answers.rooms] : "не указаны"}, место — ${answers.space ? spaces[answers.space].label : "не указано"}. Помогите уточнить вариант и условия установки.`)} external>Уточнить в WhatsApp <ArrowIcon /></LinkButton>
                  <button type="button" onClick={() => { setStep(0); setStage("q"); }} className="rounded-full border border-cream-50/20 px-4 py-2 text-sm">Изменить ответы</button>
                  <LinkButton to="/mobilnaya-banya-omsk/" variant="ghost">Посмотреть каталог</LinkButton>
                </div>
              </div>
            )}
            {stage === "result" && best && (''')
change(quiz, '''  const start = () => {''', '''  const start = () => {''') if False else None
print('R9: guarded configurator + quiz integration ready')
