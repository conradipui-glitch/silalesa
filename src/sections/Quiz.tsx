import { useEffect, useMemo, useState } from "react";
import { ArrowIcon, Button, CheckIcon, LinkButton, SectionHead } from "../components/Brand";
import { formatPrice, saunas, type Product } from "../data/products";
import { loadJSON, removeKey, saveJSON, storageAvailable, track } from "../lib/utils";
import { cn } from "../utils/cn";
import type { ModelKey } from "./Models";

const KEY = "silalesa.quiz.v1";

type Answers = { people?: number; rooms?: number; space?: number; budget?: number };
type Saved = { answers: Answers; result: string; ts: number };

const questions = [
  {
    id: "people" as const,
    title: "Сколько человек обычно будут париться?",
    hint: "Считаем тех, кто одновременно сидит в парной.",
    options: [
      { v: 2, label: "1–2", sub: "вдвоём или в одиночку" },
      { v: 4, label: "3–4", sub: "семья" },
      { v: 6, label: "5–6", sub: "компания" },
      { v: 8, label: "Больше шести", sub: "большие посиделки" },
    ],
  },
  {
    id: "rooms" as const,
    title: "Что нужно, кроме парной?",
    hint: "От этого зависит длина бани и цена.",
    options: [
      { v: 1, label: "Только парная", sub: "пришёл — попарился" },
      { v: 2, label: "Парная и комната отдыха", sub: "переодеться, попить чай" },
      { v: 3, label: "Парная, отдых и помывочная", sub: "полный банный цикл" },
    ],
  },
  {
    id: "space" as const,
    title: "Сколько места под баню на участке?",
    hint: "Считайте ровную площадку плюс подъезд для манипулятора.",
    options: [
      { v: 2, label: "Около 2×2 м", sub: "совсем немного" },
      { v: 3, label: "До 3×2 м", sub: "угол участка" },
      { v: 4, label: "До 4×2 м", sub: "вдоль забора" },
      { v: 6, label: "6×3 м и больше", sub: "места хватает" },
    ],
  },
  {
    id: "budget" as const,
    title: "Комфортный бюджет?",
    hint: "Цены — за комплектацию «Стандарт» с доставкой по Омску.",
    options: [
      { v: 250000, label: "До 250 тысяч" },
      { v: 350000, label: "До 350 тысяч" },
      { v: 400000, label: "До 400 тысяч" },
      { v: 650000, label: "До 650 тысяч" },
    ],
  },
];

type Verdict = { product: Product; score: number; ok: string[]; warn: string[] };

function evaluate(a: Required<Answers>): Verdict[] {
  const list = saunas.map((p): Verdict => {
    let score = 0;
    const ok: string[] = [];
    const warn: string[] = [];
    const cap = p.capacity?.people ?? 4;
    if (cap >= a.people) {
      score += 3;
      ok.push(`вмещает до ${cap} человек`);
    } else {
      score -= 2 * (a.people - cap);
      warn.push(`рассчитана примерно на ${cap} человек — для ${a.people} будет тесно`);
    }
    const have = p.roomsList?.length ?? 1;
    if (have === a.rooms) {
      score += 3;
      ok.push("ровно нужный набор помещений");
    } else if (have > a.rooms) {
      score += 1;
      ok.push("помещений больше, чем вы просили — просторнее, но дороже");
    } else {
      score -= 3;
      warn.push(a.rooms === 3 ? "нет помывочной — она есть только в каркасной 5,5×2,2" : "нет комнаты отдыха");
    }
    const l = p.footprint?.l ?? 2;
    if (l <= a.space) {
      score += 2;
      ok.push(`поместится: длина ${l.toLocaleString("ru-RU")} м`);
    } else {
      score -= 5;
      warn.push(`не поместится на выбранное место: длина ${l.toLocaleString("ru-RU")} м`);
    }
    if (p.price <= a.budget) {
      score += 2;
      ok.push(`в бюджете: ${formatPrice(p.price)}`);
    } else {
      const over = p.price - a.budget;
      score -= Math.min(4, Math.ceil(over / 50000));
      warn.push(`дороже бюджета на ${formatPrice(over)}`);
    }
    return { product: p, score, ok, warn };
  });
  return list.sort((x, y) => y.score - x.score || x.product.price - y.product.price);
}

export function Quiz({ setModel }: { setModel: (k: ModelKey) => void }) {
  const [stage, setStage] = useState<"idle" | "q" | "result">("idle");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [saved, setSaved] = useState<Saved | null>(null);
  const canStore = useMemo(() => storageAvailable(), []);

  useEffect(() => {
    const s = loadJSON<Saved>(KEY);
    if (s?.result) setSaved(s);
  }, []);

  const complete = answers.people && answers.rooms && answers.space && answers.budget;
  const verdicts = useMemo(() => (complete ? evaluate(answers as Required<Answers>) : []), [answers, complete]);

  const start = () => {
    setAnswers({});
    setStep(0);
    setStage("q");
    track("quiz_start");
  };

  const choose = (v: number) => {
    const q = questions[step];
    const next = { ...answers, [q.id]: v };
    setAnswers(next);
    track("quiz_step", { step: q.id, value: v });
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      const res = evaluate(next as Required<Answers>);
      setStage("result");
      track("quiz_complete", { result: res[0].product.modelKey ?? "", score: res[0].score });
      if (canStore) {
        const s: Saved = { answers: next, result: res[0].product.id, ts: Date.now() };
        saveJSON(KEY, s);
        setSaved(s);
      }
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

  return (
    <section id="quiz" className="scroll-mt-20 bg-cream-50 text-bark-950 py-20 sm:py-28" aria-labelledby="quiz-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHead
              light
              index="06 — Подбор"
              title={<span id="quiz-title">Какая баня ваша? Четыре вопроса — одна минута</span>}
              lead="Сопоставим вместимость, набор помещений, место на участке и бюджет с четырьмя моделями. Результат — не оценка вас, а честное сравнение по данным производителя, включая то, что не сойдётся."
            />
            <p className="reveal mt-6 text-xs text-bark-600/70">
              {canStore ? "Результат сохраняется только в этом браузере — можно вернуться позже." : "Хранилище браузера недоступно: результат не сохранится после перезагрузки."}
            </p>
          </div>

          <div className="reveal rounded-3xl bg-bark-950 text-cream-50 p-6 sm:p-10 shadow-card min-h-[420px] flex flex-col" aria-live="polite">
            {stage === "idle" && (
              <div className="flex flex-1 flex-col justify-between gap-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Подбор модели</p>
                  <h3 className="mt-3 font-display text-2xl sm:text-3xl text-cream-50">Ответьте на четыре вопроса — покажем модель и объясним почему</h3>
                  <ul className="mt-6 grid gap-2 text-sm text-cream-200/80 sm:grid-cols-2">
                    {questions.map((q, i) => (
                      <li key={q.id} className="flex items-center gap-2">
                        <span className="font-display text-xs text-cedar-400">0{i + 1}</span> {q.title}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="lg" onClick={start}>
                    Начать подбор <ArrowIcon />
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
                  <span className="font-display">
                    Вопрос {step + 1} из {questions.length}
                  </span>
                  <button type="button" onClick={() => (step === 0 ? setStage("idle") : setStep(step - 1))} className="hover:text-cream-50">
                    ← {step === 0 ? "Отмена" : "Назад"}
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">
                  {questions.map((q, i) => (
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
                        key={o.v}
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

            {stage === "result" && best && (
              <div className="flex flex-1 flex-col">
                <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Подходит лучше всего</p>
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
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ember-500/25 text-[10px] font-bold text-ember-400" aria-hidden="true">
                        !
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>

                {alt && alt.score > -6 && (
                  <p className="mt-4 text-xs text-cream-300/70">
                    Альтернатива: <span className="text-cream-100">{alt.product.name}</span> — {formatPrice(alt.product.price)}
                    {alt.warn[0] ? `, но ${alt.warn[0]}` : ""}.
                  </p>
                )}
                {best.warn.length > 0 && (
                  <p className="mt-3 text-xs text-cream-300/70">
                    Идеального совпадения нет — это нормально: обсудите с менеджером доп. опции или доставку в другой город, часто это решает вопрос.
                  </p>
                )}

                <div className="mt-auto pt-8 flex flex-wrap gap-3">
                  <LinkButton to={`/product/${best.product.id}`} onClick={() => track("product_view", { id: best.product.id, from: "quiz" })}>
                    Открыть модель <ArrowIcon />
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
                  <button type="button" onClick={reset} className="text-sm text-cream-300/70 hover:text-cream-50 px-2">
                    Пройти заново
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
