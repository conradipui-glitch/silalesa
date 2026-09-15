import { useEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import type { Layout, Product, RoomKey } from "../data/products";

const ORDER: RoomKey[] = ["rest", "wash", "steam"];
const SHORT: Record<RoomKey, string> = { rest: "Отдых", wash: "Мойка", steam: "Парная" };

/* ------------------------------------------------------------------ */
/* Вид сверху: помещения перестраиваются при смене модели               */
/* ------------------------------------------------------------------ */
export function PlanDiagram({
  layout,
  className,
  highlight,
  onHover,
  compact = false,
}: {
  layout: Layout;
  className?: string;
  highlight?: RoomKey | null;
  onHover?: (k: RoomKey | null) => void;
  compact?: boolean;
}) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(100);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth - 56;
      // Модели до 4 м рисуются в одном масштабе; более длинные ужимаются по ширине контейнера
      setScale(Math.max(40, Math.min(compact ? 96 : 124, w / Math.max(4, layout.outer.l))));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [compact, layout.outer.l]);

  const total = layout.rooms.reduce((s, r) => s + r.len, 0);
  const bodyW = layout.outer.l * scale;
  const bodyH = layout.outer.w * scale;
  const present = new Map(layout.rooms.map((r) => [r.key, r]));
  const firstKey = ORDER.find((k) => present.has(k))!;
  const singleSteamEndDoor = layout.entrance === "end" && layout.rooms.length === 1 && firstKey === "steam";

  const describe = `План ${layout.outer.l} на ${layout.outer.w} м: ${layout.rooms
    .map((r) => `${r.name}${r.size ? ` ${r.size}` : ""}`)
    .join(", ")}. ${layout.entranceNote}.`;

  return (
    <div ref={wrap} className={cn("w-full", className)}>
      <div className="relative mx-auto" style={{ width: bodyW + 56, height: bodyH + 76 }} role="img" aria-label={describe}>
        {/* Размер по ширине (слева) */}
        <div className="absolute left-0 top-[36px] flex items-center plan-anim" style={{ height: bodyH }} aria-hidden="true">
          <div className="relative h-full w-px bg-cream-300/40">
            <span className="absolute -left-[3px] top-0 h-px w-[7px] bg-cream-300/60" />
            <span className="absolute -left-[3px] bottom-0 h-px w-[7px] bg-cream-300/60" />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-left text-[11px] tracking-wide text-cream-300/80 whitespace-nowrap font-display">
              {layout.outer.w.toLocaleString("ru-RU")} м
            </span>
          </div>
        </div>

        {/* Подписи длин помещений (сверху) */}
        <div className="absolute left-[56px] top-0 flex h-[30px] plan-anim" style={{ width: bodyW }} aria-hidden="true">
          {ORDER.map((k) => {
            const r = present.get(k);
            const w = r ? (r.len / total) * 100 : 0;
            return (
              <div key={k} className="plan-anim overflow-hidden flex items-end justify-center pb-1" style={{ width: `${w}%`, opacity: r ? 1 : 0 }}>
                <span className="text-[11px] text-cream-300/80 whitespace-nowrap font-display">{r?.size ?? (layout.approximate ? "≈" : "")}</span>
              </div>
            );
          })}
        </div>

        {/* Корпус */}
        <div
          className="absolute left-[56px] top-[36px] plan-anim rounded-[6px] wood shadow-card"
          style={{ width: bodyW, height: bodyH, boxShadow: "inset 0 0 0 5px #3a2717, 0 20px 50px -20px rgba(0,0,0,.6)" }}
        >
          <div className="absolute inset-[5px] flex overflow-hidden rounded-[2px]">
            {ORDER.map((k, i) => {
              const r = present.get(k);
              const w = r ? (r.len / total) * 100 : 0;
              const isFirst = k === firstKey;
              const prevPresent = ORDER.slice(0, i).some((p) => present.has(p));
              const active = highlight === k;
              return (
                <div
                  key={k}
                  className={cn("relative plan-anim overflow-hidden h-full", prevPresent && r && "border-l-[4px] border-[#3a2717]")}
                  style={{ width: `${w}%`, opacity: r ? 1 : 0 }}
                  onMouseEnter={() => r && onHover?.(k)}
                  onMouseLeave={() => onHover?.(null)}
                >
                  {r && (
                    <>
                      <div className={cn("absolute inset-0 transition-colors duration-300", active ? "bg-cream-50/18" : "bg-transparent")} />
                      {/* Окна на верхней стене */}
                      <Windows roomKey={k} layout={layout} />
                      {/* Скамейка вдоль верхней стены */}
                      <div className="absolute left-[10%] right-[10%] top-[6px] h-[7%] min-h-[6px] rounded-sm bg-[#e9c48d] shadow-[inset_0_-2px_0_rgba(0,0,0,.2)]" />
                      {k === "steam" && (
                        <>
                          {/* Полок у дальней стены */}
                          <div className="absolute right-[6px] top-[18%] bottom-[10%] w-[22%] max-w-[36px] rounded-sm bg-[#e9c48d] shadow-[inset_-2px_0_0_rgba(0,0,0,.2)]" />
                          {/* Печь */}
                          <div className="absolute left-[8%] bottom-[12%] h-[26%] w-[20%] max-w-[34px] max-h-[34px] rounded-[3px] bg-[#1e1a17] shadow-[0_0_18px_4px_rgba(240,115,63,.45)]">
                            <div className="absolute inset-[22%] rounded-[2px] bg-gradient-to-t from-ember-500 to-cedar-300 opacity-90" />
                          </div>
                          {/* Бак */}
                          <div className="absolute left-[32%] bottom-[12%] h-[16%] w-[12%] max-w-[18px] max-h-[18px] rounded-full bg-steel-300 shadow-[inset_-2px_-2px_0_rgba(0,0,0,.25)]" />
                        </>
                      )}
                      {k === "rest" && (
                        <div className="absolute left-1/2 top-1/2 h-[26%] w-[28%] max-w-[44px] max-h-[30px] -translate-x-1/2 -translate-y-1/3 rounded-[3px] bg-[#f1d3a5] shadow-[inset_0_-3px_0_rgba(0,0,0,.18)]" />
                      )}
                      {k === "wash" && (
                        <div className="absolute left-1/2 bottom-[14%] h-[12%] w-[12%] max-w-[16px] max-h-[16px] -translate-x-1/2 rounded-full border-2 border-steel-300/80" />
                      )}
                      {/* Дверь */}
                      {isFirst && layout.entrance === "end" && (
                        <div
                          className={cn(
                            "absolute left-0 aspect-square border-r-2 border-t-2 border-cream-50/70 rounded-tr-full",
                            singleSteamEndDoor ? "top-[34%] h-[24%] max-h-[40px]" : "bottom-[16%] h-[36%] max-h-[56px]",
                          )}
                          style={{ borderLeft: "3px solid #f8f3ea" }}
                        />
                      )}
                      {isFirst && layout.entrance === "side" && (
                        <div className="absolute bottom-0 left-[18%] w-[36%] max-w-[56px] aspect-square border-l-2 border-t-2 border-cream-50/70 rounded-tl-full" style={{ borderBottom: "3px solid #f8f3ea" }} />
                      )}
                      {/* Подпись: полная, короткая или одна буква — по ширине помещения */}
                      {(() => {
                        const px = (r.len / total) * (bodyW - 10);
                        const label = px > 150 ? r.name : px > 60 ? SHORT[k] : SHORT[k][0];
                        return (
                          <div className="absolute left-[8%] top-[24%] right-[6%] font-display leading-tight text-bark-950/85 drop-shadow-[0_1px_0_rgba(255,255,255,.35)]">
                            <span className="block text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase truncate" title={r.name}>
                              {label}
                            </span>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Размер по длине (снизу) */}
        <div className="absolute left-[56px] plan-anim" style={{ width: bodyW, top: bodyH + 46 }} aria-hidden="true">
          <div className="relative h-px bg-cream-300/40">
            <span className="absolute left-0 -top-[3px] h-[7px] w-px bg-cream-300/60" />
            <span className="absolute right-0 -top-[3px] h-[7px] w-px bg-cream-300/60" />
            <span className="absolute left-1/2 top-2 -translate-x-1/2 text-[11px] tracking-wide text-cream-300/80 whitespace-nowrap font-display">
              {layout.outer.l.toLocaleString("ru-RU")} м
            </span>
          </div>
        </div>
      </div>

      <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-cream-300/70" aria-hidden="true">
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-[#1e1a17] shadow-[0_0_6px_2px_rgba(240,115,63,.5)]" /> печь
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-steel-300" /> бак
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 rounded-sm bg-[#e9c48d]" /> полок и скамейки
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-4 rounded-sm bg-sky-200" /> окно
        </li>
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-tr-full border-t-2 border-r-2 border-cream-50/80" /> вход
        </li>
      </ul>
    </div>
  );
}

function Windows({ roomKey, layout }: { roomKey: RoomKey; layout: Layout }) {
  // Окна условно на верхней (длинной) стене
  const marks: { left: string; width: string }[] = [];
  const l = layout.outer.l;
  if (roomKey === "steam") {
    if (l >= 4 && l < 5) marks.push({ left: "22%", width: "18%" }, { left: "60%", width: "18%" });
    else marks.push({ left: "40%", width: "22%" });
  }
  if (roomKey === "rest") {
    if (l >= 5) marks.push({ left: "12%", width: "76%" });
    else if (l >= 4) marks.push({ left: "28%", width: "44%" });
    else marks.push({ left: "30%", width: "40%" });
  }
  if (roomKey === "wash") marks.push({ left: "35%", width: "30%" });
  return (
    <>
      {marks.map((m, i) => (
        <span key={i} className="absolute top-0 h-[4px] rounded-b-sm bg-sky-200 shadow-[0_0_8px_rgba(186,230,253,.7)]" style={{ left: m.left, width: m.width }} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Боковой силуэт для линейки «в масштабе»                              */
/* ------------------------------------------------------------------ */
export function Silhouette({ product, active = false, className }: { product: Product; active?: boolean; className?: string }) {
  const L = product.footprint?.l ?? 2;
  const frame = product.modelKey === "f55";
  const U = 100; // px на метр в viewBox
  const W = L * U;
  const H = 260;
  const bodyTop = 70;
  const bodyBottom = 232;
  const r = frame ? 6 : 58;
  const id = `wood-${product.id}`;
  const path = frame
    ? `M0 ${bodyTop + 26} L${W} ${bodyTop} L${W} ${bodyBottom} L0 ${bodyBottom} Z`
    : `M0 ${bodyBottom} L0 ${bodyTop + r} Q0 ${bodyTop} ${r} ${bodyTop} L${W - r} ${bodyTop} Q${W} ${bodyTop} ${W} ${bodyTop + r} L${W} ${bodyBottom} Z`;
  const roofPath = frame
    ? `M-6 ${bodyTop + 26} L${W + 6} ${bodyTop - 2} L${W + 6} ${bodyTop + 6} L-6 ${bodyTop + 34} Z`
    : `M-4 ${bodyTop + r} Q-4 ${bodyTop - 4} ${r} ${bodyTop - 4} L${W - r} ${bodyTop - 4} Q${W + 4} ${bodyTop - 4} ${W + 4} ${bodyTop + r} L${W + 4} ${bodyTop + r + 8} L${W - 8} ${bodyTop + r + 8} Q${W - 8} ${bodyTop + 8} ${W - r} ${bodyTop + 8} L${r} ${bodyTop + 8} Q8 ${bodyTop + 8} 8 ${bodyTop + r + 8} L-4 ${bodyTop + r + 8} Z`;
  const straps = Array.from({ length: Math.max(2, Math.round(L)) }, (_, i) => ((i + 0.5) / Math.max(2, Math.round(L))) * W);
  const planks = Array.from({ length: 7 }, (_, i) => bodyTop + 30 + i * 26);
  const side = product.layout?.entrance === "side";

  return (
    <svg viewBox={`-8 0 ${W + 16} ${H}`} className={cn("w-full h-auto overflow-visible", className)} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={active ? "#e8b26f" : "#cf9558"} />
          <stop offset="1" stopColor={active ? "#c47f3f" : "#a8672f"} />
        </linearGradient>
      </defs>
      {/* Блоки */}
      {[0.18, 0.82].map((p) => (
        <rect key={p} x={p * W - 14} y={bodyBottom} width="28" height="12" fill="#5b5a56" />
      ))}
      {/* Дымоход */}
      <rect x={W * (frame ? 0.82 : 0.78) - 5} y={bodyTop - 30} width="10" height="36" fill="#9aa0a1" />
      {/* Корпус */}
      <path d={path} fill={`url(#${id})`} />
      {planks.map((y) => y < bodyBottom - 4 && <line key={y} x1={2} x2={W - 2} y1={y} y2={y} stroke="rgba(70,35,10,.28)" strokeWidth="1.2" />)}
      {/* Кровля */}
      <path d={roofPath} fill={frame ? "#2a2622" : "#3b2f28"} />
      {/* Стяжки */}
      {!frame &&
        straps.map((x) => (
          <path key={x} d={`M${x} ${bodyTop - 4} L${x} ${bodyBottom}`} stroke="#d8dcdc" strokeWidth="3" opacity="0.9" />
        ))}
      {/* Окна */}
      {frame ? (
        <>
          <rect x={W * 0.08} y={bodyTop + 50} width={W * 0.28} height="78" fill="#f6dfa8" stroke="#3b2f28" strokeWidth="4" />
          <rect x={W * 0.52} y={bodyTop + 66} width="26" height="26" fill="#f6dfa8" stroke="#3b2f28" strokeWidth="3" />
          <rect x={W * 0.78} y={bodyTop + 66} width="26" height="26" fill="#f6dfa8" stroke="#3b2f28" strokeWidth="3" />
        </>
      ) : (
        <>
          {L >= 3 && <rect x={W * (side ? 0.3 : 0.24)} y={bodyTop + 66} width={side && L >= 4 ? 44 : 26} height={side && L >= 4 ? 56 : 26} fill="#f6dfa8" stroke="#3b2f28" strokeWidth="3" />}
          <rect x={W * 0.66} y={bodyTop + 66} width="26" height="26" fill="#f6dfa8" stroke="#3b2f28" strokeWidth="3" />
        </>
      )}
      {/* Дверь при боковом входе */}
      {side && !frame && <rect x={W * 0.08} y={bodyTop + 62} width="46" height={bodyBottom - bodyTop - 62} rx="3" fill="#7f4c22" stroke="#3b2f28" strokeWidth="3" />}
      {side && frame && <rect x={W * 0.4} y={bodyTop + 60} width="42" height={bodyBottom - bodyTop - 60} rx="3" fill="#7f4c22" stroke="#2a2622" strokeWidth="3" />}
      {/* Ступенька */}
      <rect x={side ? W * 0.08 - 6 : -6} y={bodyBottom} width={side ? 58 : 30} height="7" fill="#7f4c22" />
    </svg>
  );
}
