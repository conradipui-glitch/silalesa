import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

type BeforeAfterProps = {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
};

export function BeforeAfter({ before, after, beforeAlt, afterAlt }: BeforeAfterProps) {
  const [position, setPosition] = useState(50);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const updateFromClientX = (clientX: number) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, next)));
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromClientX(event.clientX);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) updateFromClientX(event.clientX);
  };

  const onPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") setPosition((value) => Math.max(0, value - 5));
    else if (event.key === "ArrowRight") setPosition((value) => Math.min(100, value + 5));
    else if (event.key === "Home") setPosition(0);
    else if (event.key === "End") setPosition(100);
    else return;
    event.preventDefault();
  };

  return (
    <div
      ref={rootRef}
      className="relative aspect-[16/10] cursor-ew-resize touch-none select-none overflow-hidden rounded-3xl bg-bark-800 shadow-card"
      role="slider"
      tabIndex={0}
      aria-label="Сравнение результата до и после"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      aria-valuetext={`${Math.round(position)}% изображения до`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onKeyDown={onKeyDown}
    >
      <img src={after} alt={afterAlt} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <img src={before} alt={beforeAlt} className="h-full w-full object-cover" draggable={false} />
      </div>

      <span className="absolute left-4 top-4 rounded-full bg-bark-950/75 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-cream-50 backdrop-blur">До</span>
      <span className="absolute right-4 top-4 rounded-full bg-cream-50/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-bark-950 backdrop-blur">После</span>

      <div className="pointer-events-none absolute inset-y-0 w-px bg-cream-50/90 shadow-[0_0_12px_rgba(0,0,0,0.35)]" style={{ left: `${position}%` }} aria-hidden="true">
        <span className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cream-50/60 bg-bark-950/85 text-lg text-cream-50 shadow-lg backdrop-blur">↔</span>
      </div>
      <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-bark-950/60 px-3 py-1 text-[10px] text-cream-100/80 backdrop-blur">Потяните разделитель</span>
    </div>
  );
}
