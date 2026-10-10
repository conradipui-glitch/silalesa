import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { company, openContactChoice } from "../data/products";
import { track } from "../lib/utils";

const dismissedKey = "silalesa-forest-master-prompt-dismissed-v1";
const visual = `${import.meta.env.BASE_URL}assets/forest-master-chibi.webp`;
type MascotPose = "wave" | "tip" | "estimate" | "success";
const mascotPosition: Record<MascotPose, string> = { wave: "0% 0%", tip: "100% 0%", estimate: "0% 100%", success: "100% 100%" };
function MascotSprite({ pose, className = "" }: { pose: MascotPose; className?: string }) {
  return <span aria-hidden="true" className={`block shrink-0 bg-no-repeat ${className}`} style={{ backgroundImage: `url("${visual}")`, backgroundSize: "200% 200%", backgroundPosition: mascotPosition[pose] }} />;
}
const services = ["Строительные работы", "Механизированная штукатурка", "Полусухая стяжка", "Кладочные работы", "Демонтажные работы", "Монолитные работы", "Кровля и фасады", "Другой вид работ"];
const fieldStyle = "mt-1.5 block w-full min-w-0 rounded-xl border border-bark-700/20 bg-white px-3.5 py-3 text-base text-bark-950 placeholder:text-bark-500/70 focus-visible:border-moss-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-moss-500";
const buttonStyle = "min-h-11 rounded-xl border border-bark-700/20 px-4 py-2 text-sm font-medium text-bark-950 transition hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss-500";

function suggestedService(source: string): string {
  if (/shtukatur|штукатур/i.test(source)) return "Механизированная штукатурка";
  if (/styazhk|стяжк/i.test(source)) return "Полусухая стяжка";
  if (/kladk|gazobeton|кирпич/i.test(source)) return "Кладочные работы";
  if (/demontazh|демонтаж/i.test(source)) return "Демонтажные работы";
  return "Строительные работы";
}

export function buildForestLeadMessage(service: string, notes: string, phone: string, email: string, source: string): string {
  const parts = [
    "Здравствуйте! Хочу обсудить предварительный расчёт строительных работ в Омске.",
    `Направление: ${service.trim() || "Строительные работы"}.`,
  ];
  if (notes.trim()) parts.push(`Объект и пожелания: ${notes.trim().slice(0,650)}`);
  if (phone.trim()) parts.push(`Телефон для связи: ${phone.trim().slice(0,36)}`);
  if (email.trim()) parts.push(`Почта для связи: ${email.trim().slice(0,120)}`);
  parts.push(`Страница сайта: ${source}`);
  parts.push("Подскажите, какие ещё данные нужны для расчёта?");
  return parts.join("\n");
}

type Props = { source: string };

export function ForestLeadAssistant({ source }: Props) {
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [service, setService] = useState(() => suggestedService(source));
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [emailError, setEmailError] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstRef = useRef<HTMLSelectElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const url = useMemo(() => {
    try {
      const u = new URL(source, window.location.origin);
      return u.origin + u.pathname;
    } catch { return "https://conradipui-glitch.github.io/silalesa/"; }
  }, [source]);

  const message = useMemo(() => buildForestLeadMessage(service, notes, phone, email, url), [service, notes, phone, email, url]);

  useEffect(() => {
    // Do not auto-open or obscure searchable content. Only a small, dismissible
    // desktop hint appears after both actual reading time and scroll engagement.
    let dismissed = false;
    try { dismissed = sessionStorage.getItem(dismissedKey) === "1"; } catch { /* unavailable */ }
    if (dismissed || matchMedia("(max-width: 767px)").matches) return;
    let hasWaited = false;
    const maybeShow = () => {
      try { if (sessionStorage.getItem(dismissedKey) === "1") return; } catch { /* unavailable */ }
      if (hasWaited && window.scrollY > Math.min(700, window.innerHeight * .7) && !document.hidden) {
        setShowHint(true);
        window.removeEventListener("scroll", maybeShow);
      }
    };
    const timer = window.setTimeout(() => { hasWaited = true; maybeShow(); }, 18000);
    window.addEventListener("scroll", maybeShow, { passive: true });
    return () => { window.clearTimeout(timer); window.removeEventListener("scroll", maybeShow); };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement;
    const saved = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => firstRef.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setIsOpen(false); return; }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const all = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
      )).filter((el) => el.getClientRects().length > 0);
      if (!all.length) return;
      if (event.shiftKey && document.activeElement === all[0]) { event.preventDefault(); all.at(-1)?.focus(); }
      if (!event.shiftKey && document.activeElement === all.at(-1)) { event.preventDefault(); all[0].focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = saved;
      document.removeEventListener("keydown", onKey);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
      else triggerRef.current?.focus();
    };
  }, [isOpen]);

  const dismiss = () => {
    setShowHint(false);
    try { sessionStorage.setItem(dismissedKey, "1"); } catch { /* unavailable */ }
    track("cta_click", { type: "forest_helper_hint_dismissed" });
  };

  const open = () => {
    setShowHint(false);
    try { sessionStorage.setItem(dismissedKey, "1"); } catch { /* unavailable */ }
    setIsOpen(true);
    track("quiz_start", { type: "forest_lead_helper", service, source: "floating" });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Проверьте адрес электронной почты или оставьте поле пустым.");
      return;
    }
    setEmailError("");
    track("cta_click", { type: "contact_choice", where: "forest_lead_helper", service });
    track("quiz_complete", { type: "forest_lead_helper", channel: "contact_choice", service });
    // Explicit handoff: no contact details are stored or sent to a server.
    // The user chooses phone or MAX. Nothing is submitted automatically.
    setIsOpen(false);
    openContactChoice(message);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      track("copy", { type: "forest_lead_helper", service });
    } catch { setCopied(false); }
  };

  return (
    <>
      <div data-qa="forest-lead-assistant" className="pointer-events-none fixed bottom-[80px] right-3 z-[44] flex flex-col items-end gap-3 md:bottom-1 md:right-4 lg:right-6">
        {showHint && !isOpen && (
          <div role="status" data-qa="forest-lead-hint" className="pointer-events-auto hidden max-w-[260px] rounded-2xl border border-cedar-400/40 bg-bark-900 p-4 text-cream-50 shadow-card md:block">
            <div className="flex items-start gap-2">
              <MascotSprite pose="tip" className="mt-1 h-10 w-10" />
              <div className="min-w-0 flex-1">
                <strong className="block font-display text-sm">Нужно прикинуть объём работ?</strong>
                <p className="mt-1 text-xs leading-relaxed text-cream-200">Подскажем, что указать в запросе на расчёт.</p>
                <button type="button" className="mt-2 min-h-9 text-sm font-semibold text-cedar-300 underline underline-offset-4 hover:text-cream-50" onClick={open}>Подготовить запрос →</button>
              </div>
              <button type="button" aria-label="Не показывать подсказку" className="shrink-0 rounded-lg p-1 text-cream-300 hover:text-cream-50 focus-visible:outline-2 focus-visible:outline-cedar-300" onClick={dismiss}>×</button>
            </div>
          </div>
        )}
        {!isOpen && (
          <button ref={triggerRef} type="button" onClick={open} aria-label="Помощник Силы Леса: подготовить запрос на расчёт"
            aria-haspopup="dialog" aria-expanded={false} data-qa="forest-lead-trigger"
            className="pointer-events-auto group relative flex h-[64px] w-[64px] items-center justify-center rounded-full border-[3px] border-cedar-300 bg-bark-800 shadow-[0_9px_35px_rgba(0,0,0,.38)] transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cedar-300 md:h-[150px] md:w-[150px] md:rounded-none md:border-0 md:bg-transparent md:shadow-none md:hover:-translate-y-1 md:hover:scale-100">
            <MascotSprite pose="wave" className="h-[58px] w-[58px] md:h-[146px] md:w-[146px] forest-master-idle" />
            <span aria-hidden="true" className="pointer-events-none absolute bottom-7 right-[125px] hidden whitespace-nowrap rounded-xl border border-cedar-400/35 bg-bark-900/95 px-3 py-2 text-xs font-semibold text-cream-100 shadow-card transition-colors md:block group-hover:border-cedar-300">Нужен расчёт?</span>
            <span aria-hidden="true" className="absolute -left-2 -top-1 h-3 w-3 rounded-full border-2 border-bark-900 bg-moss-400 md:hidden"/>
          </button>
        )}
      </div>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-bark-950/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} data-qa="forest-lead-dialog"
            className="relative flex max-h-[min(88dvh,760px)] w-full max-w-[480px] flex-col overflow-hidden rounded-t-[28px] border border-cream-300/25 bg-cream-50 text-bark-950 shadow-2xl sm:rounded-[28px]">
            <div className="relative flex min-h-[142px] items-center gap-3 overflow-hidden bg-bark-900 px-5 py-5 text-cream-50 sm:px-7">
              <MascotSprite pose={copied ? "success" : "estimate"} className="h-[112px] w-[112px]" />
              <div className="min-w-0 pr-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cedar-300">Лесной мастер · Сила Леса</p>
                <h2 id={titleId} className="mt-2 font-display text-lg leading-snug sm:text-xl">Помогу подготовить расчёт</h2>
                <p className="mt-2 text-xs leading-relaxed text-cream-200">Немного об объекте — и сообщение для мастера готово.</p>
              </div>
              <button type="button" aria-label="Закрыть помощника" onClick={() => setIsOpen(false)}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-cream-50/15 text-xl text-cream-100 hover:bg-bark-800 focus-visible:outline-2 focus-visible:outline-cedar-300">×</button>
            </div>
            <form onSubmit={submit} className="min-h-0 space-y-3 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
              <label className="block text-sm font-semibold">Какие работы планируете?
                <select ref={firstRef} name="service" className={fieldStyle} value={service} onChange={(e) => setService(e.target.value)}>
                  {services.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold">Что нужно сделать? <span className="font-normal text-bark-600">(по желанию)</span>
                <textarea name="notes" rows={2} maxLength={650} className={fieldStyle+" resize-y"} placeholder="Например: квартира 60 м², нужна штукатурка стен..." value={notes} onChange={(e) => { setNotes(e.target.value); setCopied(false); }} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold">Телефон <span className="block text-xs font-normal text-bark-600">необязательно</span>
                  <input name="phone" type="tel" autoComplete="tel" maxLength={36} className={fieldStyle} placeholder="+7 …" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </label>
                <label className="block text-sm font-semibold">Эл. почта <span className="block text-xs font-normal text-bark-600">необязательно</span>
                  <input name="email" type="email" autoComplete="email" maxLength={120} className={fieldStyle} placeholder="mail@example.ru" value={email} aria-invalid={!!emailError} onChange={(e) => { setEmail(e.target.value); setEmailError(""); }} />
                </label>
              </div>
              {emailError && <p role="alert" className="text-sm text-ember-500">{emailError}</p>}
              <button type="submit" data-qa="forest-lead-contact" className="flex min-h-[50px] w-full items-center justify-center rounded-full bg-moss-600 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-moss-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss-600">
                Выбрать способ связи ↗
              </button>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={() => { void copy(); }} className={buttonStyle}>Скопировать запрос</button>
                <a href={`tel:${company.phonePrimary.tel}`} onClick={() => track("cta_click", { type: "call", where: "forest_lead_helper" })} className={buttonStyle+" inline-flex items-center justify-center"}>Позвонить</a>
              </div>
              <p aria-live="polite" role="status" className="text-center text-xs text-moss-600">{copied ? "Запрос скопирован" : ""}</p>
              <p className="pb-1 text-center text-xs leading-relaxed text-bark-600">Подготовим сообщение для MAX или звонка. Ничего не отправляем без вашего действия и не сохраняем данные на сервере.</p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
