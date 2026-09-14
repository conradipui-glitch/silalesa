import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowIcon, Button, CheckIcon, LinkButton, PhoneIcon, SectionHead } from "../components/Brand";
import { byModel, company, doorOptions, formatPrice, lampPrice, saunas, sidePackPriceK4, standardIncluded, whatsappUrl } from "../data/products";
import { copyText, loadJSON, removeKey, saveJSON, storageAvailable, track, useInViewOnce } from "../lib/utils";
import { cn } from "../utils/cn";
import type { ModelKey } from "./Models";

const KEY = "silalesa.config.v1";

type DoorId = (typeof doorOptions)[number]["id"];
type Vent = "outside" | "steam" | "rest";
type Config = { model: ModelKey; sidePack: boolean; door: DoorId; lamps: number; vent: Vent; city: "omsk" | "other" };

const DEFAULT: Omit<Config, "model"> = { sidePack: false, door: "wood", lamps: 0, vent: "outside", city: "omsk" };

const ventLabels: Record<Vent, string> = { outside: "на улицу", steam: "в парную", rest: "в комнату отдыха" };
const ventsFor = (m: ModelKey): Vent[] => (m === "k4" ? ["rest", "outside"] : m === "f55" ? ["steam"] : ["outside", "steam"]);

export function Configurator({ model, setModel }: { model: ModelKey; setModel: (k: ModelKey) => void }) {
  const [opts, setOpts] = useState<Omit<Config, "model">>(DEFAULT);
  const [restored, setRestored] = useState(false);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");
  const canStore = useMemo(() => storageAvailable(), []);
  const product = byModel(model);
  const isFrame = model === "f55";

  // Восстановление черновика
  useEffect(() => {
    const s = loadJSON<Config>(KEY);
    if (s && saunas.some((p) => p.modelKey === s.model)) {
      const { model: m, ...rest } = s;
      setOpts({ ...DEFAULT, ...rest });
      setModel(m);
      setRestored(true);
      track("config_restore", { model: m });
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Сохранение — только после попытки восстановления
  useEffect(() => {
    if (!canStore || !ready) return;
    saveJSON(KEY, { model, ...opts });
  }, [model, opts, canStore, ready]);

  // Корректировка недопустимых сочетаний при смене модели
  useEffect(() => {
    const vents = ventsFor(model);
    setOpts((o) => ({
      ...o,
      vent: vents.includes(o.vent) ? o.vent : vents[0],
      sidePack: model === "k3" || model === "k4" ? o.sidePack : false,
      door: isFrame ? "wood" : o.door,
      lamps: isFrame ? 0 : o.lamps,
    }));
  }, [model, isFrame]);

  const update = <K extends keyof typeof opts>(k: K, v: (typeof opts)[K]) => {
    setOpts((o) => ({ ...o, [k]: v }));
    track("config_change", { field: k, value: String(v), model });
  };

  const lines = useMemo(() => {
    const l: { label: string; price: number | null }[] = [{ label: `${product.name} — «Стандарт»`, price: product.price }];
    if (opts.sidePack) {
      l.push({
        label: "Пакет «Боковой вход»: вход сбоку, окно 60×80 в комнате отдыха, стеклянная дверца печи",
        price: model === "k4" ? sidePackPriceK4 : null,
      });
    }
    const door = doorOptions.find((d) => d.id === opts.door) ?? doorOptions[0];
    if (door.price > 0) l.push({ label: door.label, price: door.price });
    if (opts.lamps > 0) l.push({ label: `Уличный светильник × ${opts.lamps}`, price: opts.lamps * lampPrice });
    return l;
  }, [product, opts, model]);

  const total = lines.reduce((s, x) => s + (x.price ?? 0), 0);
  const hasUnpriced = lines.some((x) => x.price === null);

  const message = useMemo(() => {
    const rows = lines.map((x) => `• ${x.label} — ${x.price === null ? "цена по запросу" : x.price === product.price ? formatPrice(x.price) : `+${formatPrice(x.price)}`}`);
    rows.push(`• Вынос топки: ${ventLabels[opts.vent]}`);
    rows.push(`• Доставка: ${opts.city === "omsk" ? "Омск (бесплатно)" : "другой город — обсудить"}`);
    return [
      "Здравствуйте! Хочу рассчитать баню «Сила Леса»:",
      ...rows,
      `Итого ориентировочно: ${formatPrice(total)}${hasUnpriced ? " + позиции по запросу" : ""}`,
      `Модель: ${product.originalUrl}`,
    ].join("\n");
  }, [lines, opts, product, total, hasUnpriced]);

  const onCopy = async () => {
    const ok = await copyText(message);
    setCopied(ok ? "ok" : "fail");
    track("copy", { ok, model });
    setTimeout(() => setCopied("idle"), 2200);
  };

  const resetDraft = () => {
    removeKey(KEY);
    setOpts(DEFAULT);
    setRestored(false);
    track("config_change", { field: "reset", value: "1", model });
  };

  const onCtaView = useCallback(() => track("cta_view", { where: "configurator" }), []);
  const ctaRef = useInViewOnce<HTMLDivElement>(onCtaView);

  return (
    <section id="configurator" className="scroll-mt-20 bg-bark-900 py-20 sm:py-28" aria-labelledby="config-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHead
          index="07 — Расчёт"
          title={<span id="config-title">Соберите комплектацию и отправьте расчёт</span>}
          lead="Цены опций — по прайсу компании. Итог ориентировочный: точную стоимость и срок подтверждает менеджер после разговора."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 items-start">
          {/* Левая колонка — выбор */}
          <div className="space-y-8">
            <fieldset className="reveal">
              <legend className="font-display text-xs uppercase tracking-[0.2em] text-cedar-300">Модель</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {saunas.map((s) => {
                  const active = s.modelKey === model;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setModel(s.modelKey!);
                        track("config_change", { field: "model", value: s.modelKey!, where: "configurator" });
                      }}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-left transition-colors",
                        active ? "border-cedar-400 bg-cedar-500/15" : "border-cream-50/12 hover:border-cream-50/35",
                      )}
                    >
                      <span className="block font-display text-sm text-cream-50">{s.shortName}</span>
                      <span className="block text-xs text-cream-300/70">{formatPrice(s.price)}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {isFrame ? (
              <div className="reveal rounded-2xl border border-cream-50/12 p-5 text-sm text-cream-200/80">
                Каркасная баня 5,5×2,2 комплектуется индивидуально — три помещения, панорамное окно, печь со стеклянной дверцей уже входят в цену. Опции из прайса бань-квадро к ней не применяются: обсудите пожелания с менеджером.
              </div>
            ) : (
              <>
                {(model === "k3" || model === "k4") && (
                  <fieldset className="reveal">
                    <legend className="font-display text-xs uppercase tracking-[0.2em] text-cedar-300">Вход и окна</legend>
                    <label className={cn("mt-3 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors", opts.sidePack ? "border-cedar-400 bg-cedar-500/15" : "border-cream-50/12 hover:border-cream-50/35")}>
                      <input type="checkbox" className="mt-1 h-4 w-4 accent-cedar-500" checked={opts.sidePack} onChange={(e) => update("sidePack", e.target.checked)} />
                      <span className="flex-1">
                        <span className="block font-display text-sm text-cream-50">Пакет «Боковой вход»</span>
                        <span className="block text-xs text-cream-300/70 mt-0.5">Вход сбоку вместо торца, увеличенное окно 60×80 в комнате отдыха, стеклянная дверца на печи</span>
                      </span>
                      <span className="font-display text-sm text-cedar-300 whitespace-nowrap">{model === "k4" ? `+${formatPrice(sidePackPriceK4)}` : "по запросу"}</span>
                    </label>
                  </fieldset>
                )}

                <fieldset className="reveal">
                  <legend className="font-display text-xs uppercase tracking-[0.2em] text-cedar-300">Входная дверь</legend>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {doorOptions.map((d) => {
                      const active = opts.door === d.id;
                      return (
                        <label key={d.id} className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors", active ? "border-cedar-400 bg-cedar-500/15" : "border-cream-50/12 hover:border-cream-50/35")}>
                          <input type="radio" name="door" className="h-4 w-4 accent-cedar-500" checked={active} onChange={() => update("door", d.id)} />
                          <span className="flex-1 text-sm text-cream-50">{d.label}</span>
                          <span className="text-xs font-display text-cedar-300 whitespace-nowrap">{d.price ? `+${formatPrice(d.price)}` : "0 ₽"}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="reveal grid gap-6 sm:grid-cols-2">
                  <fieldset>
                    <legend className="font-display text-xs uppercase tracking-[0.2em] text-cedar-300">Уличные светильники</legend>
                    <div className="mt-3 inline-flex items-center rounded-full border border-cream-50/12">
                      <button type="button" aria-label="Меньше светильников" className="h-11 w-11 text-lg text-cream-50 disabled:opacity-30" disabled={opts.lamps === 0} onClick={() => update("lamps", Math.max(0, opts.lamps - 1))}>
                        −
                      </button>
                      <span className="w-10 text-center font-display text-sm text-cream-50" aria-live="polite">
                        {opts.lamps}
                      </span>
                      <button type="button" aria-label="Больше светильников" className="h-11 w-11 text-lg text-cream-50 disabled:opacity-30" disabled={opts.lamps === 4} onClick={() => update("lamps", Math.min(4, opts.lamps + 1))}>
                        +
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-cream-300/70">{formatPrice(lampPrice)} за штуку</p>
                  </fieldset>

                  <fieldset>
                    <legend className="font-display text-xs uppercase tracking-[0.2em] text-cedar-300">Вынос топки печи</legend>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ventsFor(model).map((v) => (
                        <button key={v} type="button" aria-pressed={opts.vent === v} onClick={() => update("vent", v)} className={cn("rounded-full border px-4 py-2 text-sm transition-colors", opts.vent === v ? "border-cedar-400 bg-cedar-500/15 text-cream-50" : "border-cream-50/12 text-cream-200/80 hover:border-cream-50/35")}>
                          {ventLabels[v]}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-cream-300/70">Без доплаты — выбор в стандарте</p>
                  </fieldset>
                </div>
              </>
            )}

            <fieldset className="reveal">
              <legend className="font-display text-xs uppercase tracking-[0.2em] text-cedar-300">Доставка</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["omsk", "other"] as const).map((c) => (
                  <button key={c} type="button" aria-pressed={opts.city === c} onClick={() => update("city", c)} className={cn("rounded-full border px-4 py-2 text-sm transition-colors", opts.city === c ? "border-cedar-400 bg-cedar-500/15 text-cream-50" : "border-cream-50/12 text-cream-200/80 hover:border-cream-50/35")}>
                    {c === "omsk" ? "Омск — бесплатно" : "Другой город — обсудить"}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Правая колонка — итог */}
          <aside className="reveal lg:sticky lg:top-24 rounded-3xl border border-cream-50/10 bg-bark-800 p-6 sm:p-8" aria-label="Итог расчёта">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Ваш расчёт</p>
                <h3 className="mt-2 font-display text-xl text-cream-50">{product.name}</h3>
              </div>
              {restored && (
                <button type="button" onClick={resetDraft} className="text-xs text-cream-300/70 hover:text-cream-50 underline underline-offset-4">
                  черновик восстановлен · сбросить
                </button>
              )}
            </div>

            <ul className="mt-6 divide-y divide-cream-50/8 text-sm">
              {lines.map((x) => (
                <li key={x.label} className="flex items-start justify-between gap-4 py-2.5">
                  <span className="text-cream-200/85">{x.label}</span>
                  <span className="font-display whitespace-nowrap text-cream-50">{x.price === null ? "по запросу" : x.price === product.price ? formatPrice(x.price) : `+${formatPrice(x.price)}`}</span>
                </li>
              ))}
              <li className="flex items-start justify-between gap-4 py-2.5">
                <span className="text-cream-200/85">Вынос топки: {ventLabels[opts.vent]}</span>
                <span className="font-display text-cream-300/70">0 ₽</span>
              </li>
              <li className="flex items-start justify-between gap-4 py-2.5">
                <span className="text-cream-200/85">Доставка: {opts.city === "omsk" ? "Омск" : "другой город"}</span>
                <span className="font-display text-cream-300/70">{opts.city === "omsk" ? "0 ₽" : "по запросу"}</span>
              </li>
            </ul>

            <div className="mt-4 flex items-end justify-between gap-4 border-t border-cream-50/12 pt-4">
              <span className="text-sm text-cream-300/70">Итого ориентировочно</span>
              <span className="font-display text-2xl sm:text-3xl text-cedar-300 whitespace-nowrap">
                {formatPrice(total)}
                {hasUnpriced && <span className="text-sm text-cream-300/70"> +</span>}
              </span>
            </div>
            {hasUnpriced && <p className="mt-2 text-xs text-cream-300/70">Часть позиций — по запросу: цена уточняется у менеджера.</p>}

            <ul className="mt-5 grid gap-1.5 text-xs text-cream-300/75">
              {standardIncluded.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <CheckIcon className="h-3.5 w-3.5 text-moss-400" /> {s}
                </li>
              ))}
            </ul>

            <div ref={ctaRef} className="mt-6 grid gap-2">
              <LinkButton to={whatsappUrl(message)} size="lg" external onClick={() => track("cta_click", { type: "whatsapp", where: "configurator", model })}>
                Отправить расчёт в WhatsApp <ArrowIcon />
              </LinkButton>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" onClick={onCopy} aria-live="polite">
                  {copied === "ok" ? "Скопировано ✓" : copied === "fail" ? "Не удалось" : "Скопировать расчёт"}
                </Button>
                <LinkButton to={company.vk} variant="ghost" external onClick={() => track("cta_click", { type: "vk", where: "configurator", model })}>
                  Написать в VK
                </LinkButton>
              </div>
              <LinkButton to={`tel:${company.phonePrimary.tel}`} variant="subtle" onClick={() => track("cta_click", { type: "call", where: "configurator", model })}>
                <PhoneIcon /> Позвонить {company.phonePrimary.display}
              </LinkButton>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed text-cream-300/55">
              Заявка не отправляется автоматически: вы сами отправляете сообщение в WhatsApp ({company.phoneSecondary.display}, {company.phoneSecondary.person}) или VK, а менеджер подтверждает цену и срок.
              {canStore ? " Черновик расчёта хранится только в этом браузере." : " Хранилище браузера недоступно — черновик не сохранится."}
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
