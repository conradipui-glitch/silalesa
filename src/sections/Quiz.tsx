import { useEffect, useMemo, useState } from "react";
import { ArrowIcon, Button, CheckIcon, LinkButton, SectionHead } from "../components/Brand";
import { formatPrice, saunas, whatsappUrl, type Product } from "../data/products";
import { loadJSON, removeKey, saveJSON, storageAvailable, track } from "../lib/utils";
import { cn } from "../utils/cn";
import { seoPages } from "../data/seoPages";
import type { ModelKey } from "./Models";

const KEY = "silalesa.quiz.v2";

type SpaceKey = "2x2" | "3x2" | "4x2" | "6x3";
type AccessKey = "yes" | "unsure" | "no";
type Answers = { people?: number; rooms?: number; space?: SpaceKey; access?: AccessKey; budget?: number };
type Saved = { answers: Answers; result: string; ts: number };

const spaces: Record<SpaceKey, { l: number; w: number; label: string }> = {
  "2x2": { l: 2, w: 2, label: "около 2×2 м" },
  "3x2": { l: 3, w: 2, label: "до 3×2 м" },
  "4x2": { l: 4, w: 2, label: "до 4×2 м" },
  "6x3": { l: 6, w: 3, label: "6×3 м и больше" },
};

const peopleLabels: Record<number, string> = {
  2: "1–2 человека",
  4: "3–4 человека",
  6: "5–6 человек",
  8: "больше 6 человек",
};

const roomLabels: Record<number, string> = {
  1: "только парная",
  2: "парная и комната отдыха",
  3: "парная, отдых и помывочная",
};

const accessLabels: Record<AccessKey, string> = {
  yes: "подъезд доступен",
  unsure: "нужно проверить",
  no: "готовую баню не завезти",
};

const questions = [
  {
    id: "rooms" as const,
    title: "Что нужно, кроме парной?",
    hint: "От этого зависит длина бани и планировка.",
    options: [
      { v: 1, label: "Только парная", sub: "пришёл — попарился" },
      { v: 2, label: "Парная и комната отдыха", sub: "переодеться, попить чай" },
      { v: 3, label: "Парная, отдых и помывочная", sub: "полный банный цикл" },
    ],
  },
  {
    id: "space" as const,
    title: "Какой свободный габарит есть под баню?",
    hint: "Сравниваем длину и ширину самой модели. Отступы до границ и построек проверяются отдельно.",
    options: [
      { v: "2x2", label: "Около 2×2 м", sub: "совсем немного" },
      { v: "3x2", label: "До 3×2 м", sub: "компактное место" },
      { v: "4x2", label: "До 4×2 м", sub: "места больше" },
      { v: "6x3", label: "6×3 м и больше", sub: "есть запас" },
    ],
  },
  {
    id: "budget" as const,
    title: "Комфортный бюджет?",
    hint: "Необязательное уточнение. Квадро: доставка по Омску включена; каркасная — отдельно.",
    options: [
      { v: 250000, label: "До 250 тысяч" },
      { v: 350000, label: "До 350 тысяч" },
      { v: 400000, label: "До 400 тысяч" },
      { v: 650000, label: "До 650 тысяч" },
    ],
  },
  {
    id: "people" as const,
    title: "Сколько человек обычно будут париться?",
    hint: "Это ориентир по вместимости, а не обещание точного комфорта для любой компании.",
    options: [
      { v: 2, label: "1–2", sub: "вдвоём или в одиночку" },
      { v: 4, label: "3–4", sub: "семья" },
      { v: 6, label: "5–6", sub: "компания" },
      { v: 8, label: "Больше шести", sub: "большие посиделки" },
    ],
  },
  {
    id: "access" as const,
    title: "Манипулятор сможет подъехать к месту установки?",
    hint: "Это влияет на сценарий монтажа, но не отменяет покупку: для Квадро возможна сборка на участке.",
    options: [
      { v: "yes", label: "Да", sub: "заезд и разгрузка доступны" },
      { v: "unsure", label: "Не уверен", sub: "нужно проверить на месте" },
      { v: "no", label: "Нет", sub: "готовую баню не завезти" },
    ],
  },
] as const;

type Verdict = { product: Product; score: number; ok: string[]; warn: string[] };

function evaluate(a: Answers): Verdict[] {
  const site = a.space ? spaces[a.space] : null;
  if (!site || !a.rooms) return [];
  const list = saunas.map((p): Verdict => {
    let score = 0;
    const ok: string[] = [];
    const warn: string[] = [];
    if (a.people && p.capacity?.people && a.people > p.capacity.people) {
      warn.push("Количество гостей необходимо обсудить по планировке и размеру парной; вместимость не гарантируется автоматически.");
    }

    const have = p.roomsList?.length ?? 1;
    if (have === a.rooms!) {
      score += 3;
      ok.push("нужный набор помещений");
    } else if (have > a.rooms!) {
      score += 1;
      ok.push("помещений больше, чем вы указали");
    } else {
      score -= 3;
      warn.push(a.rooms === 3 ? "нет отдельной помывочной" : "нет комнаты отдыха");
    }

    const l = p.footprint?.l ?? 2;
    const w = p.footprint?.w ?? 2;
    if (l <= site.l && w <= site.w) {
      score += 2;
      ok.push(`по габаритам модели: ${l.toLocaleString("ru-RU")}×${w.toLocaleString("ru-RU")} м на площадке ${site.label}`);
    } else {
      score -= 5;
      warn.push(`по габаритам не проходит: модель ${l.toLocaleString("ru-RU")}×${w.toLocaleString("ru-RU")} м, площадка ${site.label}`);
    }

    if (a.access === "yes") {
      ok.push("вы указали доступный подъезд для готовой установки");
    } else if (a.access === "unsure") {
      warn.push("подъезд и точку разгрузки нужно проверить до заказа");
    } else if (a.access === "no") {
      warn.push(p.modelKey?.startsWith("k") ? "готовую баню не завезти; для Квадро можно обсудить сборку на участке" : "сценарий монтажа нужно отдельно согласовать");
    }

    if (a.budget === undefined) {
      // The budget is optional: the first result must not invent one.
    } else if (p.price <= a.budget) {
      score += 2;
      ok.push(`в бюджете: ${formatPrice(p.price)}`);
    } else {
      const over = p.price - a.budget;
      score -= Math.min(4, Math.ceil(over / 50000));
      warn.push(`дороже бюджета на ${formatPrice(over)}`);
    }
    return { product: p, score, ok, warn };
  });
  // A model that does not fit the stated site or lacks required rooms is never recommended.
  // Setbacks, unloading space and permits are still verified separately by a specialist.
  return list.filter(({ product }) =>
    (product.roomsList?.length ?? 1) >= a.rooms!
    && (product.footprint?.l ?? Infinity) <= site.l
    && (product.footprint?.w ?? Infinity) <= site.w,
  ).sort((x, y) => y.score - x.score || x.product.price - y.product.price);
}

export function Quiz({ setModel }: { setModel: (k: ModelKey) => void }) {
  const [stage, setStage] = useState<"idle" | "q" | "result">("idle");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [saved, setSaved] = useState<Saved | null>(null);
  const canStore = useMemo(() => storageAvailable(), []);

  useEffect(() => {
    const s = loadJSON<Saved>(KEY);
    if (s?.result && s.answers?.rooms && s.answers?.space && saunas.some((p) => p.id === s.result)) setSaved(s);
  }, []);

  const complete = Boolean(answers.rooms && answers.space);
  const verdicts = useMemo(() => (complete ? evaluate(answers) : []), [answers, complete]);

  const start = () => {
    setAnswers({});
    setStep(0);
    setStage("q");
    track("quiz_start");
  };

  const choose = (v: number | SpaceKey | AccessKey) => {
    const q = questions[step];
    const next = { ...answers, [q.id]: v } as Answers;
    setAnswers(next);
    track("quiz_step", { step: q.id, value: String(v) });
    if (step === 1 || step === questions.length - 1) {
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
    }
  };

  const reuse = () => {
    if (!saved) return;
    setAnswers(saved.answers);
    setStage("result");
    track("saved_result_reuse", { result: saved.result });
  };

  const reset = () => {
    removeKey(KEY);
    setSaved(null);
    setAnswers({});
    setStage("idle");
    track("quiz_restart");
  };

  const best = verdicts[0];
  const alt = verdicts[1];
  const savedProduct = saved ? saunas.find((p) => p.id === saved.result) : null;
  const modelHref = (p: Product) => `/${seoPages.find((page) => page.productId === p.id)?.slug ?? `product/${p.id}`}/`;

  const quizMessage = best
    ? [
        "Здравствуйте! Я прошёл подбор на сайте «Сила Леса».",
        `Подходящая модель: ${best.product.name} — ${formatPrice(best.product.price)}.`,
        `Обычно парятся: ${answers.people ? peopleLabels[answers.people] : "не указано"}.`,
        `Нужны помещения: ${answers.rooms ? roomLabels[answers.rooms] : "не указано"}.`,
        `Свободное место: ${answers.space ? spaces[answers.space].label : "не указано"}.`,
        `Подъезд манипулятора: ${answers.access ? accessLabels[answers.access] : "не указано"}.`,
        `Бюджет: ${answers.budget ? `до ${formatPrice(answers.budget)}` : "не указан"}.`,
        "Подскажите, пожалуйста, актуальную цену, ближайший срок и что нужно подготовить на участке.",
      ].join("\n")
    : "";

  return (
    <section id="quiz" className="scroll-mt-20 bg-cream-50 text-bark-950 py-20 sm:py-28" aria-labelledby="quiz-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHead
              light
              index="07 — Если не определились"
              title={<span id="quiz-title">Подбор бани: два ответа для первого результата</span>}
              lead="Сначала два ответа — нужные помещения и место под баню. Сразу покажем подходящие по этим условиям модели и цены. Бюджет, количество гостей и подъезд можно уточнить после первого результата."
            />
            <p className="reveal mt-6 text-xs text-bark-600/70">
              Это ориентир по габаритам самой бани, а не проект установки: отступы, основание и подъезд проверяются отдельно. Сообщение откроется в WhatsApp, отправите его вы сами.
            </p>
          </div>

          <div className="reveal rounded-3xl bg-bark-950 text-cream-50 p-6 sm:p-10 shadow-card min-h-[420px] flex flex-col" aria-live="polite">
            {stage === "idle" && (
              <div className="flex flex-1 flex-col justify-between gap-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Предварительный подбор</p>
                  <h3 className="mt-3 font-display text-2xl sm:text-3xl text-cream-50">Два ответа — и видны подходящие по помещениям и размеру варианты</h3>
                  <p className="mt-3 text-sm text-cream-200/80">Без анкеты можно сразу открыть любую модель с известной стартовой ценой:</p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {saunas.map((p) => <li key={p.id}><LinkButton to={modelHref(p)} variant="ghost" className="w-full justify-between text-xs" onClick={() => track("product_view", { id: p.id, from: "quiz-before-questions" })}>{p.shortName} · {formatPrice(p.price)}</LinkButton></li>)}
                  </ul>
                  <p className="mt-4 text-xs text-cream-300/70">Нужны только помещения и габарит места. Остальные три вопроса — по желанию.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="lg" onClick={start}>
                    Подобрать за два ответа <ArrowIcon />
                  </Button>
                  {savedProduct && (
                    <button type="button" onClick={reuse} className="text-sm text-cream-200/80 hover:text-cream-50 underline underline-offset-4">
                      Прошлый результат: {savedProduct.shortName}
                    </button>
                  )}
                </div>
              </div>
            )}

            {stage === "q" && (
              <div className="flex flex-1 flex-col">
                <div className="flex items-center justify-between text-xs text-cream-300/70">
                  <span className="font-display">{step < 2 ? `Основной вопрос ${step + 1} из 2` : `Уточнение ${step - 1} из 3`}</span>
                  <button type="button" onClick={() => (step === 0 ? setStage("idle") : step === 2 && complete ? setStage("result") : setStep(step - 1))} className="hover:text-cream-50">
                    ← {step === 0 ? "Отмена" : "Назад"}
                  </button>
                </div>
                <div className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${step < 2 ? 2 : 5}, minmax(0, 1fr))` }} aria-hidden="true">
                  {questions.slice(0, step < 2 ? 2 : 5).map((q, i) => (
                    <span key={q.id} className={cn("h-1 rounded-full transition-colors", i <= step ? "bg-cedar-400" : "bg-cream-50/15")} />
                  ))}
                </div>
                <h3 className="mt-8 font-display text-xl sm:text-2xl text-cream-50">{questions[step].title}</h3>
                <p className="mt-2 text-sm text-cream-300/70">{questions[step].hint}</p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {questions[step].options.map((o) => {
                    const selected = answers[questions[step].id] === o.v;
                    return (
                      <button
                        key={String(o.v)}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => choose(o.v)}
                        className={cn(
                          "text-left rounded-2xl border px-4 py-3.5 transition-colors",
                          selected ? "border-cedar-400 bg-cedar-500/15" : "border-cream-50/12 hover:border-cream-50/35 hover:bg-cream-50/5",
                        )}
                      >
                        <span className="block font-display text-sm text-cream-50">{o.label}</span>
                        {"sub" in o && o.sub && <span className="block mt-0.5 text-xs text-cream-300/70">{o.sub}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {stage === "result" && !best && (
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
            {stage === "result" && best && (
              <div className="flex flex-1 flex-col">
                <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Предварительный вариант по вашим условиям</p>
                <div className="mt-4 flex flex-col sm:flex-row gap-5">
                  <div className="kvadro-mask-sm overflow-hidden w-full sm:w-44 shrink-0 aspect-[4/3] bg-bark-800">
                    <img src={best.product.image} alt={best.product.imageAlt} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl text-cream-50">{best.product.name}</h3>
                    <p className="mt-1 font-display text-lg text-cedar-300">{formatPrice(best.product.price)}</p>
                    <p className="mt-1 text-sm text-cream-300/70">{best.product.tagline}</p>
                  </div>
                </div>

                <ul className="mt-6 space-y-2 text-sm">
                  {best.ok.map((r) => (
                    <li key={r} className="flex gap-2 text-cream-100">
                      <CheckIcon className="mt-0.5 shrink-0 text-moss-400" /> {r}
                    </li>
                  ))}
                  {best.warn.map((r) => (
                    <li key={r} className="flex gap-2 text-cedar-200">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ember-500/25 text-[10px] font-bold text-ember-400" aria-hidden="true">!</span>
                      {r}
                    </li>
                  ))}
                </ul>

                {alt && alt.score > -6 && (
                  <p className="mt-4 text-xs text-cream-300/70">
                    Альтернатива: <span className="text-cream-100">{alt.product.name}</span> — {formatPrice(alt.product.price)}{alt.warn[0] ? `, но ${alt.warn[0]}` : ""}.
                  </p>
                )}
                <p className="mt-4 text-xs leading-relaxed text-cream-300/70">
                  Это не заключение по участку. Перед заказом отдельно подтверждаем отступы, основание, подъезд/разгрузку и выбранный способ монтажа.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={() => { setStep(2); setStage("q"); }} className="rounded-full border border-cedar-400/60 px-4 py-2 text-sm text-cream-50 hover:bg-cream-50/10">{answers.access ? "Изменить уточнения" : "Уточнить бюджет, гостей и подъезд (необязательно)"}</button>
                  <button type="button" onClick={() => { setStep(0); setStage("q"); }} className="rounded-full border border-cream-50/20 px-4 py-2 text-sm text-cream-50 hover:bg-cream-50/10">Изменить помещения или размер</button>
                </div>
                <div className="mt-auto pt-8 flex flex-wrap gap-3">
                  <LinkButton
                    to={whatsappUrl(quizMessage)}
                    external
                    onClick={() => track("cta_click", { type: "whatsapp", where: "quiz", model: best.product.modelKey ?? "" })}
                  >
                    Отправить подбор в WhatsApp <ArrowIcon />
                  </LinkButton>
                  <LinkButton to={modelHref(best.product)} variant="ghost" onClick={() => track("product_view", { id: best.product.id, from: "quiz" })}>
                    Открыть модель
                  </LinkButton>
                  <LinkButton
                    to="/#configurator"
                    variant="ghost"
                    onClick={() => {
                      if (best.product.modelKey) setModel(best.product.modelKey);
                      track("cta_click", { type: "configurator", where: "quiz" });
                    }}
                  >
                    Собрать комплектацию
                  </LinkButton>
                  <button type="button" onClick={reset} className="text-sm text-cream-300/70 hover:text-cream-50 px-2">Пройти заново</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
