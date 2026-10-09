import { useMemo, useState } from "react";
import {
  calculatePlaster, describePlasterEstimate, initialPlasterMaterial, initialPlasterRooms,
  MAX_PLASTER_OPENINGS, MAX_PLASTER_ROOMS, PLASTER_START_PRICE, plasterNumber,
  type PlasterMaterial, type PlasterOpening, type PlasterRoom,
} from "../lib/plasterCalculator";
import { whatsappUrl } from "../data/products";
import { track } from "../lib/utils";

const inputClass = "mt-1 block w-full min-w-0 rounded-xl border border-cream-50/20 bg-bark-950 px-3 py-3 text-base text-cream-50 outline-none focus-visible:border-cedar-300 focus-visible:ring-2 focus-visible:ring-cedar-300/35";
const outlineButton = "inline-flex min-h-11 items-center justify-center rounded-xl border border-cream-50/20 px-4 py-2 text-sm font-medium text-cream-100 transition hover:border-cedar-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300 disabled:cursor-not-allowed disabled:opacity-40";

function sharedRooms(): PlasterRoom[] | null {
  try {
    const raw = new URLSearchParams(window.location.search).get("walls");
    if (!raw || raw.length > 6500) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length || parsed.length > MAX_PLASTER_ROOMS) return null;
    const rooms: PlasterRoom[] = parsed.map((item: unknown, index) => {
      if (!item || typeof item !== "object") throw Error("Invalid room");
      const obj = item as Record<string, unknown>;
      if (typeof obj.name !== "string" || obj.name.length > 60 || !Array.isArray(obj.openings) || obj.openings.length > MAX_PLASTER_OPENINGS) throw Error("Invalid room values");
      return {
        id: index + 1, name: obj.name, length: Number(obj.length), width: Number(obj.width),
        height: Number(obj.height), thickness: Number(obj.thickness),
        openings: obj.openings.map((opening: unknown, j) => {
          if (!opening || typeof opening !== "object") throw Error("Invalid opening");
          const x = opening as Record<string, unknown>;
          if (typeof x.label !== "string" || x.label.length > 50) throw Error("Invalid opening name");
          return { id: j + 1, label: x.label, width: Number(x.width), height: Number(x.height), count: Number(x.count) };
        }),
      };
    });
    return calculatePlaster(rooms).valid ? rooms : null;
  } catch { return null; }
}

type Props = { compact?: boolean };
export function PlasterCalculator({ compact = false }: Props) {
  const [rooms, setRooms] = useState<PlasterRoom[]>(() =>
    typeof window === "undefined" ? initialPlasterRooms : sharedRooms() ?? initialPlasterRooms);
  const [material, setMaterial] = useState<PlasterMaterial>(initialPlasterMaterial);
  const [copied, setCopied] = useState<"report" | "link" | null>(null);
  const result = useMemo(() => calculatePlaster(rooms, material), [rooms, material]);
  const summary = useMemo(() => describePlasterEstimate(rooms, material), [rooms, material]);

  function updateRoom(id: number, patch: Partial<PlasterRoom>) {
    setCopied(null);
    setRooms((current) => current.map((room) => room.id === id ? { ...room, ...patch } : room));
  }
  function updateOpening(room: PlasterRoom, openingId: number, patch: Partial<PlasterOpening>) {
    updateRoom(room.id, { openings: room.openings.map((opening) => opening.id === openingId ? { ...opening, ...patch } : opening) });
  }
  async function copy(text: string, kind: "report" | "link") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      track("cta_click", { type: `plaster_calculator_copy_${kind}`, where: "plaster-calculator" });
    } catch { setCopied(null); }
  }
  function sharedLink() {
    const u = new URL("kalkulyator-shtukaturki-sten/", "https://conradipui-glitch.github.io/silalesa/");
    u.searchParams.set("walls", JSON.stringify(rooms.map(({ name, length, width, height, thickness, openings }) => ({
      name, length, width, height, thickness,
      openings: openings.map(({ label, width: openingWidth, height: openingHeight, count }) => ({ label, width: openingWidth, height: openingHeight, count })),
    }))));
    return u.toString();
  }
  const invalid = !result.valid;
  return (
    <div data-qa="plaster-calculator" className="overflow-hidden rounded-[28px] border border-cream-50/15 bg-bark-900 text-cream-50 shadow-2xl">
      <div className="border-b border-cream-50/10 bg-gradient-to-r from-bark-900 via-bark-800 to-bark-900 px-4 py-6 sm:px-7 sm:py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cedar-300">Строительный калькулятор · Омск</p>
        <h2 className="mt-3 font-display text-2xl leading-tight sm:text-3xl">{compact ? "Сколько квадратов под штукатурку?" : "Ваши стены — в цифрах"}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream-200/85 sm:text-base">Размеры комнат, проёмы, толщина слоя — расчёт сразу на экране. Телефон не нужен.</p>
      </div>
      <div className="grid min-w-0 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="min-w-0 space-y-5 p-4 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-xl">01 / Помещения</h3>
            <span className="rounded-full border border-cream-50/15 px-3 py-1 text-xs text-cream-300">{rooms.length} из {MAX_PLASTER_ROOMS}</span>
          </div>
          {rooms.map((room, i) => (
            <fieldset key={room.id} data-qa="plaster-room" className="min-w-0 rounded-2xl border border-cream-50/15 bg-bark-950/50 px-4 pb-5 pt-4 sm:px-5">
              <legend className="sr-only">Помещение {i + 1}</legend>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-cedar-300">Помещение {String(i + 1).padStart(2, "0")}</span>
                <button type="button" disabled={rooms.length === 1} aria-label={`Удалить помещение ${i + 1}`}
                  className="min-h-10 text-sm text-cream-300 hover:text-cream-50 disabled:opacity-30"
                  onClick={() => { setCopied(null); setRooms((current) => current.filter((item) => item.id !== room.id)); }}>Удалить</button>
              </div>
              <label className="mt-3 block text-sm text-cream-200">Название
                <input className={inputClass} maxLength={60} value={room.name} onChange={(e) => updateRoom(room.id, { name: e.target.value })} />
              </label>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {([
                  ["length", "Длина, м", room.length],
                  ["width", "Ширина, м", room.width],
                  ["height", "Высота стен, м", room.height],
                ] as const).map(([key, label, val]) => (
                  <label key={key} className="min-w-0 text-sm text-cream-200">{label}
                    <input type="number" inputMode="decimal" min={key === "height" ? 1 : 0.1} max={key === "height" ? 20 : 100} step="0.1"
                      value={val || ""} className={inputClass} onChange={(e) => updateRoom(room.id, { [key]: Number(e.target.value) })} />
                  </label>
                ))}
              </div>
              <label className="mt-3 block text-sm text-cream-200">Средняя толщина слоя, мм
                <input type="number" inputMode="decimal" min="1" max="150" step="1"
                  value={room.thickness || ""} className={inputClass}
                  onChange={(e) => updateRoom(room.id, { thickness: Number(e.target.value) })} />
              </label>
              <div className="mt-5 rounded-xl bg-bark-800/75 p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-cream-50">Вычесть окна и двери</p>
                  <span className="text-xs text-cream-300">{room.openings.length} проёмов</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-cream-300/85">Добавьте площадь проёмов. Откосы считаются отдельно, без скрытых коэффициентов.</p>
                {room.openings.map((opening, j) => (
                  <div key={opening.id} data-qa="plaster-opening" className="mt-3 rounded-xl border border-cream-50/10 bg-bark-950/60 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <label className="min-w-0 flex-1 text-xs text-cream-300">Название проёма
                        <input aria-label={`Проём ${j + 1}: название`} maxLength={50} className={inputClass}
                          value={opening.label} onChange={(e) => updateOpening(room, opening.id, { label: e.target.value })} />
                      </label>
                      <button type="button" aria-label={`Удалить проём ${j + 1}`} className="min-h-11 text-sm text-cream-300 hover:text-cream-50"
                        onClick={() => updateRoom(room.id, { openings: room.openings.filter((o) => o.id !== opening.id) })}>Убрать</button>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {([
                        ["width", "Ширина, м", opening.width],
                        ["height", "Высота, м", opening.height],
                        ["count", "Штук", opening.count],
                      ] as const).map(([key, label, val]) => (
                        <label key={key} className="min-w-0 text-xs text-cream-200">{label}
                          <input type="number" min={key === "count" ? 1 : 0.1} max={key === "count" ? 30 : 20}
                            step={key === "count" ? 1 : 0.1} inputMode="decimal" value={val || ""} className={inputClass}
                            onChange={(e) => updateOpening(room, opening.id, { [key]: Number(e.target.value) })} />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button type="button" disabled={room.openings.length >= MAX_PLASTER_OPENINGS}
                  className={outlineButton+" mt-3 w-full"} onClick={() => {
                    updateRoom(room.id, { openings: [...room.openings, { id: Math.max(0, ...room.openings.map((x) => x.id)) + 1, label: "Проём", width: 1, height: 1.5, count: 1 }] });
                  }}>+ Добавить проём</button>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-cream-50/10 pt-3">
                <span className="text-sm text-cream-300">Чистая площадь стен</span>
                <strong className="font-display text-xl">{!result.metrics[i]?.valid ? "Проверьте размеры" : `${plasterNumber(result.metrics[i].netArea)} м²`}</strong>
              </div>
            </fieldset>
          ))}
          <button type="button" disabled={rooms.length >= MAX_PLASTER_ROOMS} className={outlineButton+" w-full"}
            onClick={() => { const id = Math.max(0, ...rooms.map((room) => room.id)) + 1; setCopied(null); setRooms((current) => [...current, { id, name: `Помещение ${current.length + 1}`, length: 4, width: 3, height: 2.7, thickness: 15, openings: [] }]); }}>
            + Добавить помещение
          </button>
          <div className="rounded-2xl border border-cream-50/15 bg-bark-950/60 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg">Опционально: мешки смеси</h3>
                <p className="mt-1 text-xs leading-relaxed text-cream-300">Только если знаете паспортный расход своей смеси. По умолчанию расчёт материалов выключен.</p>
              </div>
              <label className="flex shrink-0 items-center gap-2 text-sm text-cream-200">
                <input type="checkbox" checked={material.enabled} className="h-5 w-5 accent-cedar-400"
                  onChange={(e) => { setCopied(null); setMaterial((x) => ({ ...x, enabled: e.target.checked })); }} />
                Включить
              </label>
            </div>
            {material.enabled && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {([
                  ["consumption", "Расход на упаковке, кг/м² при 10 мм", material.consumption],
                  ["bagWeight", "Вес мешка, кг", material.bagWeight],
                  ["reserve", "Запас, %", material.reserve],
                ] as const).map(([key, label, val]) => (
                  <label key={key} className="min-w-0 text-sm text-cream-200">{label}
                    <input type="number" className={inputClass} inputMode="decimal" value={val === 0 ? 0 : val || ""}
                      min={key === "reserve" ? 0 : 0.1} max={key === "reserve" ? 20 : 100} step={key === "reserve" ? 1 : 0.1}
                      onChange={(e) => { setCopied(null); setMaterial((x) => ({ ...x, [key]: Number(e.target.value) })); }}/>
                  </label>
                ))}
              </div>
            )}
            {material.enabled && <p className="mt-3 text-xs leading-relaxed text-cream-300">Формула: площадь × толщина / 10 × паспортный расход, затем выбранный запас. Массу округляем вверх до целого мешка. Не переносите расход с одной марки на другую.</p>}
          </div>
          {invalid && <p role="alert" className="rounded-xl border border-orange-400/40 bg-orange-400/10 p-4 text-sm text-orange-100">Проверьте размеры помещений и проёмов: площадь проёмов должна быть меньше площади стен. Толщина — 1–150 мм, высота — 1–20 м. Для материалов нужны значения с упаковки.</p>}
        </div>
        <aside aria-label="Результат расчёта штукатурки" className="min-w-0 border-t border-cream-50/10 bg-bark-950 p-4 sm:p-7 xl:border-l xl:border-t-0">
          <div className="xl:sticky xl:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cedar-300">02 / Результат</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-bark-800 p-4"><p className="text-xs text-cream-300">Площадь стен до вычета</p><p data-qa="plaster-gross" className="mt-2 font-display text-2xl tabular-nums">{invalid ? "—" : plasterNumber(result.grossArea)}</p><p className="text-xs text-cream-300">м²</p></div>
              <div className="rounded-2xl bg-bark-800 p-4"><p className="text-xs text-cream-300">Площадь проёмов</p><p data-qa="plaster-openings" className="mt-2 font-display text-2xl tabular-nums">{invalid ? "—" : plasterNumber(result.openingsArea)}</p><p className="text-xs text-cream-300">м²</p></div>
            </div>
            <div className="mt-3 rounded-2xl border border-cedar-300/35 bg-cedar-400/10 p-5">
              <p className="text-sm text-cream-200">Под штукатурку</p>
              <p data-qa="plaster-net" className="mt-1 font-display text-4xl tabular-nums text-cedar-300">{invalid ? "—" : `${plasterNumber(result.netArea)} м²`}</p>
              <p className="mt-4 text-sm text-cream-200">Базовый ориентир стоимости работ</p>
              <p data-qa="plaster-budget" className="mt-2 font-display text-3xl tabular-nums text-cedar-300">{invalid ? "—" : `от ${plasterNumber(result.budgetFrom, 0)} ₽`}</p>
              <p className="mt-2 text-xs leading-relaxed text-cream-300">По стартовой ставке от {PLASTER_START_PRICE} ₽/м², без согласованной сметы. Толщина, основание, подготовка и доступ меняют цену.</p>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 border-b border-cream-50/10 pb-3 text-sm"><span className="text-cream-300">Геометрический объём слоя</span><strong data-qa="plaster-volume" className="font-display text-xl">{invalid ? "—" : `${plasterNumber(result.volume, 4)} м³`}</strong></div>
            <div className="mt-4 flex items-center justify-between gap-3 border-b border-cream-50/10 pb-3 text-sm"><span className="text-cream-300">Средняя толщина</span><strong className="font-display text-lg">{invalid ? "—" : `${plasterNumber(result.averageThickness, 1)} мм`}</strong></div>
            {material.enabled && !invalid && <div className="mt-4 rounded-xl border border-cream-50/10 bg-bark-800 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cedar-300">По вашей упаковке</p>
              <p data-qa="plaster-bags" className="mt-2 font-display text-2xl">{result.bags} мешков</p>
              <p className="mt-1 text-sm text-cream-300">{plasterNumber(result.materialKg ?? 0, 1)} кг с запасом {material.reserve}%</p>
            </div>}
            {!invalid && <div className="mt-6" aria-label="Площадь штукатурки по помещениям">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cream-300">По помещениям</p>
              <ul className="mt-3 space-y-3">{result.metrics.map((x) => <li key={x.room.id}>
                <div className="flex justify-between gap-3 text-sm"><span className="min-w-0 truncate">{x.room.name || "Комната"}</span><span className="shrink-0">{plasterNumber(x.netArea)} м²</span></div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream-50/10"><div className="h-full rounded-full bg-cedar-400" style={{ width: `${result.netArea ? 100 * x.netArea / result.netArea : 0}%` }}/></div>
              </li>)}</ul>
            </div>}
            <div className="mt-6 space-y-3">
              <a data-qa="plaster-whatsapp" href={invalid ? undefined : whatsappUrl(summary)}
                aria-disabled={invalid} tabIndex={invalid ? -1 : undefined} target="_blank" rel="noopener noreferrer"
                onClick={(event) => { if (invalid) { event.preventDefault(); return; } track("cta_click", { type: "plaster_calculator_whatsapp", where: "plaster-calculator", rooms: rooms.length }); }}
                className={`flex min-h-12 w-full items-center justify-center rounded-full bg-cedar-400 px-5 py-3 text-center font-semibold text-bark-950 transition hover:bg-cedar-300 ${invalid ? "pointer-events-none opacity-40" : ""}`}>
                Обсудить расчёт с мастером ↗
              </a>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={invalid} className={outlineButton} onClick={() => { void copy(summary, "report"); }}>Скопировать итог</button>
                <button type="button" disabled={invalid} className={outlineButton} onClick={() => { void copy(sharedLink(), "link"); }}>Ссылка на расчёт</button>
              </div>
              <p role="status" aria-live="polite" className="min-h-5 text-center text-xs text-cedar-300">{copied === "report" ? "Расчёт скопирован" : copied === "link" ? "Ссылка скопирована" : ""}</p>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-cream-300/75">Вычет относится только к площади стены: откосы и сложные поверхности рассчитывают отдельно. Результат ориентировочный, конструкцию и окончательную смету согласуют по объекту.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
