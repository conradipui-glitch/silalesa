import { useMemo, useState } from "react";
import {
  calculateScreed, describeScreedEstimate, formatScreedNumber, initialScreedRooms,
  MAX_ROOMS, SCREED_START_PRICE, type ScreedRoom,
} from "../lib/screedCalculator";
import { contactDraftUrl } from "../data/products";
import { track } from "../lib/utils";

const currency = (value: number) => formatScreedNumber(value, 0);
const fieldClass = "mt-1 block w-full min-w-0 rounded-xl border border-cream-50/20 bg-bark-950 px-3 py-3 text-base text-cream-50 shadow-inner outline-none transition focus-visible:border-cedar-300 focus-visible:ring-2 focus-visible:ring-cedar-300/35";
const secondaryButton = "inline-flex min-h-11 items-center justify-center rounded-xl border border-cream-50/20 px-4 py-2 text-sm font-medium text-cream-100 transition hover:border-cedar-300/70 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300";

function validSharedRooms(): ScreedRoom[] | null {
  try {
    const raw = new URLSearchParams(window.location.search).get("rooms");
    if (!raw || raw.length > 4000) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.length || parsed.length > MAX_ROOMS) return null;
    const rooms = parsed.map((item: unknown, index): ScreedRoom => {
      if (!item || typeof item !== "object") throw new Error("invalid room");
      const x = item as Record<string, unknown>;
      if (typeof x.name !== "string" || x.name.length > 60 || (x.mode !== "corners" && x.mode !== "average")
        || !Array.isArray(x.corners) || x.corners.length !== 4) throw new Error("invalid values");
      return {
        id: index + 1, name: x.name, length: Number(x.length), width: Number(x.width),
        thickness: Number(x.thickness), mode: x.mode,
        corners: x.corners.map(Number) as [number, number, number, number],
      };
    });
    return calculateScreed(rooms, 5).valid ? rooms : null;
  } catch {
    return null;
  }
}

type Props = { compact?: boolean };
export function ScreedCalculator({ compact = false }: Props) {
  const [rooms, setRooms] = useState<ScreedRoom[]>(() => typeof window === "undefined" ? initialScreedRooms : validSharedRooms() ?? initialScreedRooms);
  const [reserve, setReserve] = useState(5);
  const [copied, setCopied] = useState<"summary" | "link" | null>(null);
  const total = useMemo(() => calculateScreed(rooms, reserve), [rooms, reserve]);
  const report = useMemo(() => describeScreedEstimate(rooms, reserve), [rooms, reserve]);

  function updateRoom(id: number, patch: Partial<ScreedRoom>) {
    setCopied(null);
    setRooms((previous) => previous.map((room) => room.id === id ? { ...room, ...patch } : room));
  }

  function updateCorner(room: ScreedRoom, index: number, value: number) {
    const corners = [...room.corners] as [number, number, number, number];
    corners[index] = value;
    updateRoom(room.id, { corners });
  }

  async function copy(text: string, type: "summary" | "link") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      track("cta_click", { type: `calculator_copy_${type}`, where: "screed-calculator" });
    } catch {
      setCopied(null);
    }
  }

  function shareLink() {
    const url = new URL("kalkulyator-styazhki-pola/", "https://conradipui-glitch.github.io/silalesa/");
    url.searchParams.set("rooms", JSON.stringify(rooms.map(({ name, length, width, thickness, mode, corners }) => ({ name, length, width, thickness, mode, corners }))));
    return url.toString();
  }

  const missing = !total.valid;
  return (
    <div data-qa="screed-calculator" className="overflow-hidden rounded-[28px] border border-cream-50/15 bg-bark-900 text-cream-50 shadow-2xl">
      <div className="border-b border-cream-50/10 bg-gradient-to-r from-bark-900 via-bark-800 to-bark-900 px-4 py-6 sm:px-7 sm:py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cedar-300">Интерактивный расчёт · Омск</p>
        <h2 className="mt-3 font-display text-2xl leading-tight sm:text-3xl">{compact ? "Рассчитайте свою стяжку" : "Ваш пол — в цифрах"}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream-200/80 sm:text-base">
          Добавьте помещения, укажите размеры и толщину слоя. Объём, площадь и ценовой ориентир пересчитаются сразу — без регистрации и телефона.
        </p>
      </div>
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
        <div className="min-w-0 space-y-5 p-4 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-xl">01 / Помещения</h3>
            <span className="rounded-full border border-cream-50/15 px-3 py-1 text-xs text-cream-300">{rooms.length} из {MAX_ROOMS}</span>
          </div>
          {rooms.map((room, i) => (
            <fieldset key={room.id} data-qa="calculator-room" className="min-w-0 rounded-2xl border border-cream-50/12 bg-bark-950/55 p-4 sm:p-5">
              <legend className="sr-only">Помещение {i + 1}</legend>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cedar-300">Помещение {String(i + 1).padStart(2, "0")}</p>
                <button type="button" className="text-sm text-cream-300 underline-offset-4 hover:text-cream-50 hover:underline disabled:opacity-30" disabled={rooms.length === 1}
                  onClick={() => { setCopied(null); setRooms((previous) => previous.filter((item) => item.id !== room.id)); }} aria-label={`Удалить помещение ${i + 1}`}>
                  Удалить
                </button>
              </div>
              <label className="mt-3 block text-sm text-cream-200" htmlFor={`room-name-${room.id}`}>Название помещения</label>
              <input id={`room-name-${room.id}`} className={fieldClass} value={room.name} maxLength={60} onChange={(event) => updateRoom(room.id, { name: event.target.value })} />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="block min-w-0 text-sm text-cream-200">Длина, м
                  <input type="number" min="0.1" max="100" step="0.1" inputMode="decimal" className={fieldClass} value={room.length || ""} onChange={(event) => updateRoom(room.id, { length: Number(event.target.value) })} aria-label={`Длина: ${room.name || i + 1}`}/>
                </label>
                <label className="block min-w-0 text-sm text-cream-200">Ширина, м
                  <input type="number" min="0.1" max="100" step="0.1" inputMode="decimal" className={fieldClass} value={room.width || ""} onChange={(event) => updateRoom(room.id, { width: Number(event.target.value) })} aria-label={`Ширина: ${room.name || i + 1}`}/>
                </label>
              </div>
              <div className="mt-4 rounded-xl bg-bark-800/75 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Толщина будущего слоя</p>
                  <div className="flex rounded-full border border-cream-50/15 p-0.5 text-xs" role="group" aria-label={`Способ ввода толщины: ${room.name || i + 1}`}>
                    <button type="button" aria-pressed={room.mode === "average"} onClick={() => updateRoom(room.id, { mode: "average" })}
                      className={`min-h-9 rounded-full px-3 ${room.mode === "average" ? "bg-cedar-400 font-semibold text-bark-950" : "text-cream-200"}`}>Средняя</button>
                    <button type="button" aria-pressed={room.mode === "corners"} onClick={() => updateRoom(room.id, { mode: "corners" })}
                      className={`min-h-9 rounded-full px-3 ${room.mode === "corners" ? "bg-cedar-400 font-semibold text-bark-950" : "text-cream-200"}`}>4 точки</button>
                  </div>
                </div>
                {room.mode === "average" ? (
                  <label className="mt-3 block text-sm text-cream-200">Средняя толщина, мм
                    <input type="number" min="1" max="400" step="5" inputMode="numeric" className={fieldClass} value={room.thickness || ""} onChange={(event) => updateRoom(room.id, { thickness: Number(event.target.value) })} aria-label={`Средняя толщина: ${room.name || i + 1}`} />
                  </label>
                ) : (
                  <>
                    <p className="mt-3 text-xs leading-relaxed text-cream-300/85">Укажите толщину будущей стяжки в четырёх углах, измеренную относительно планируемой плоскости пола. Среднее приблизительное.</p>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {room.corners.map((val, index) => (
                        <label key={index} className="min-w-0 text-xs text-cream-200">Угол {index + 1}, мм
                          <input type="number" min="1" max="400" step="5" inputMode="numeric" value={val || ""} className={fieldClass} onChange={(event) => updateCorner(room, index, Number(event.target.value))}/>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-cream-50/10 pt-3 text-sm">
                <span className="text-cream-300">Площадь помещения</span>
                <span className="font-display text-lg text-cream-50">{formatScreedNumber(total.metrics[i].area)} м²</span>
              </div>
            </fieldset>
          ))}
          <button type="button" disabled={rooms.length >= MAX_ROOMS} className={secondaryButton+" w-full disabled:cursor-not-allowed disabled:opacity-40"} onClick={() => {
            const id = Math.max(0, ...rooms.map((room) => room.id)) + 1;
            setCopied(null);
            setRooms((prev) => [...prev, { id, name: `Помещение ${prev.length + 1}`, length: 4, width: 3, thickness: 50, mode: "average", corners: [50, 50, 50, 50] }]);
          }}>+ Добавить помещение</button>
          <div className="rounded-xl border border-cream-50/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="screed-reserve" className="text-sm font-medium">Запас по объёму</label>
              <span className="font-display text-lg">{reserve}%</span>
            </div>
            <input id="screed-reserve" className="mt-3 w-full accent-cedar-400" type="range" min="0" max="15" step="1" value={reserve} onChange={(event) => { setCopied(null); setReserve(Number(event.target.value)); }} />
            <p className="mt-2 text-xs leading-relaxed text-cream-300/75">Только для планирования объёма, не норма расхода. Условия подачи и потери уточняет подрядчик.</p>
          </div>
          {missing && <p role="alert" className="rounded-xl border border-orange-400/50 bg-orange-400/10 p-4 text-sm text-orange-100">Проверьте размеры и толщину: они должны быть больше нуля. Длина и ширина — не более 100 м, толщина — до 400 мм.</p>}
        </div>
        <aside className="min-w-0 border-t border-cream-50/10 bg-bark-950 p-4 sm:p-7 xl:border-l xl:border-t-0" aria-label="Результат расчёта">
          <div className="xl:sticky xl:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cedar-300">02 / Ваш результат</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-bark-800 p-4">
                <p className="text-xs text-cream-300">Общая площадь</p>
                <p data-qa="calculator-area" className="mt-2 font-display text-2xl tabular-nums text-cream-50 sm:text-3xl">{missing ? "—" : formatScreedNumber(total.area)}</p>
                <p className="text-xs text-cream-300">м²</p>
              </div>
              <div className="rounded-2xl bg-bark-800 p-4">
                <p className="text-xs text-cream-300">Геометрический объём</p>
                <p data-qa="calculator-volume" className="mt-2 font-display text-2xl tabular-nums text-cream-50 sm:text-3xl">{missing ? "—" : formatScreedNumber(total.volume, 3)}</p>
                <p className="text-xs text-cream-300">м³ без запаса</p>
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-cedar-300/35 bg-cedar-400/10 p-5">
              <p className="text-sm text-cream-200">Базовый ценовой ориентир</p>
              <p data-qa="calculator-budget" className="mt-2 font-display text-3xl font-semibold tabular-nums text-cedar-300 sm:text-4xl">{missing ? "—" : `от ${currency(total.budgetFrom)} ₽`}</p>
              <p className="mt-2 text-xs leading-relaxed text-cream-300/85">По опубликованной ставке от {currency(SCREED_START_PRICE)} ₽/м². Не окончательная смета: объём, толщина, основание, этаж, материалы и подача могут менять цену.</p>
            </div>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-4 border-b border-cream-50/10 pb-3 text-sm">
                <span className="text-cream-300">Средняя толщина</span>
                <strong data-qa="calculator-thickness" className="font-display text-lg">{missing ? "—" : `${formatScreedNumber(total.averageThickness, 1)} мм`}</strong>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-cream-50/10 pb-3 text-sm">
                <span className="text-cream-300">Объём с запасом {reserve}%</span>
                <strong data-qa="calculator-with-reserve" className="font-display text-lg">{missing ? "—" : `${formatScreedNumber(total.reserveVolume, 3)} м³`}</strong>
              </div>
            </div>
            {!missing && <div className="mt-6" aria-label="Вклад помещений в общий объём">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cream-300">Где больше объём</p>
              <ul className="mt-3 space-y-3">
                {total.metrics.map((item) => <li key={item.room.id}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate text-cream-200">{item.room.name || "Помещение"}</span>
                    <span className="shrink-0 tabular-nums text-cream-50">{formatScreedNumber(item.volume, 3)} м³</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-cream-50/10"><div className="h-full rounded-full bg-cedar-400" style={{ width: `${total.volume > 0 ? item.volume / total.volume * 100 : 0}%` }}/></div>
                </li>)}
              </ul>
            </div>}
            <div className="mt-6 space-y-3">
              <a data-qa="calculator-contact" href={missing ? undefined : contactDraftUrl(report)} aria-disabled={missing}
                tabIndex={missing ? -1 : undefined} target="_blank" rel="noopener noreferrer"
                onClick={(event) => { if (missing) { event.preventDefault(); return; } track("cta_click", { type: "calculator_contact_choice", where: "screed-calculator", rooms: rooms.length }); }}
                className={`flex min-h-12 w-full items-center justify-center rounded-full bg-cedar-400 px-5 py-3 text-center font-semibold text-bark-950 shadow-lg transition hover:bg-cedar-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-300 ${missing ? "pointer-events-none opacity-45" : ""}`}>
                Обсудить расчёт с мастером ↗
              </a>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={missing} className={secondaryButton+" disabled:opacity-40"} onClick={() => { void copy(report, "summary"); }}>Скопировать итог</button>
                <button type="button" disabled={missing} className={secondaryButton+" disabled:opacity-40"} onClick={() => { void copy(shareLink(), "link"); }}>Ссылка на расчёт</button>
              </div>
              <p role="status" aria-live="polite" className="min-h-5 text-center text-xs text-cedar-300">{copied === "summary" ? "Результат скопирован" : copied === "link" ? "Ссылка скопирована: размеры можно открыть на другом устройстве" : ""}</p>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-cream-300/70">Это расчёт геометрического объёма, не рецептура ЦПС. Четыре точки дают ориентировочное среднее. Реальную толщину, влажность и состав стяжки определяют по конструкции пола и требованиям материалов.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
