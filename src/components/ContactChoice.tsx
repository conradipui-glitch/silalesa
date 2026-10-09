import { useEffect, useId, useRef, useState } from "react";
import { company, CONTACT_DRAFT_PREFIX, CONTACT_OPEN_EVENT } from "../data/products";
import { track } from "../lib/utils";

/**
 * Shared contact chooser for all service, calculator and sauna CTAs.
 * MAX does not support the WhatsApp ?text= handoff. The visitor copies
 * the draft and explicitly sends it, or calls. No form data is uploaded.
 */
export function ContactChoice() {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<"message" | "phone" | "error" | null>(null);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const draft = (event as CustomEvent<{ message?: string }>).detail?.message ?? "";
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setCopied(null);
      setMessage(draft);
    };
    const onLink = (event: MouseEvent) => {
      const element = event.target instanceof Element ? event.target : null;
      const link = element?.closest<HTMLAnchorElement>("a[href^='#contact-draft=']");
      if (!link) return;
      event.preventDefault();
      const href = link.getAttribute("href") ?? "";
      try {
        const draft = decodeURIComponent(href.slice(CONTACT_DRAFT_PREFIX.length));
        window.dispatchEvent(new CustomEvent(CONTACT_OPEN_EVENT, { detail: { message: draft } }));
      } catch {
        window.dispatchEvent(new CustomEvent(CONTACT_OPEN_EVENT, { detail: { message: "" } }));
      }
    };
    window.addEventListener(CONTACT_OPEN_EVENT, onOpen);
    document.addEventListener("click", onLink, true);
    return () => {
      window.removeEventListener(CONTACT_OPEN_EVENT, onOpen);
      document.removeEventListener("click", onLink, true);
    };
  }, []);

  useEffect(() => {
    if (message === null) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMessage(null);
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusables = [...dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], textarea:not([disabled])')];
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", onKey);
      openerRef.current?.focus();
    };
  }, [message !== null]);

  async function copy(value: string, kind: "message" | "phone") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      track("copy", { type: kind === "message" ? "contact_draft" : "contact_phone" });
    } catch {
      setCopied("error");
    }
  }

  if (message === null) return null;
  const maxProfileUrl = company.maxProfileUrl.trim();
  const maxNumber = company.phoneSecondary;
  const close = () => setMessage(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bark-950/75 p-3 backdrop-blur-sm sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} data-qa="contact-choice-dialog" className="max-h-[min(92dvh,760px)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-[26px] border border-cream-50/15 bg-cream-50 p-5 text-bark-950 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-moss-600">Сила Леса · Омск</p>
            <h2 id={titleId} className="mt-2 font-display text-2xl font-semibold leading-tight">Как удобнее связаться?</h2>
            <p className="mt-2 text-sm leading-relaxed text-bark-700">Позвоните мастеру или напишите в MAX. Вы сами выбираете, что отправлять.</p>
          </div>
          <button ref={closeRef} type="button" onClick={close} aria-label="Закрыть выбор связи" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-bark-950/15 text-xl hover:bg-bark-950/5">×</button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a href={"tel:" + company.phonePrimary.tel} data-qa="contact-choice-call" onClick={() => track("cta_click", { type: "call", where: "contact-choice" })} className="flex min-h-14 items-center justify-center rounded-2xl bg-moss-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-moss-500">Позвонить</a>
          <a href={maxProfileUrl || "https://max.ru/"} data-qa="contact-choice-max" target="_blank" rel="noopener noreferrer" onClick={() => track("cta_click", { type: "max", where: "contact-choice", direct: Boolean(maxProfileUrl) })} className="flex min-h-14 items-center justify-center rounded-2xl border border-moss-600 px-4 py-3 text-center text-sm font-semibold text-moss-700 transition hover:bg-moss-600/10">{maxProfileUrl ? "Написать в MAX ↗" : "Открыть MAX ↗"}</a>
        </div>
        <p className="mt-2 text-center text-sm text-bark-700">Звонок: <a href={"tel:" + company.phonePrimary.tel} className="font-semibold underline underline-offset-2">{company.phonePrimary.display}</a></p>

        {!maxProfileUrl && (
          <div className="mt-5 rounded-2xl border border-bark-950/10 bg-white p-4">
            <p className="text-sm font-semibold">Как найти мастера в MAX</p>
            <p className="mt-1 text-sm leading-relaxed text-bark-700">Откройте MAX и выберите «Найти по номеру». Попробуйте номер {maxNumber.display} ({maxNumber.person}). Если профиль недоступен, позвоните по телефону выше.</p>
            <button type="button" onClick={() => { void copy(maxNumber.tel, "phone"); }} className="mt-3 min-h-11 rounded-full border border-bark-950/20 px-4 text-sm font-semibold hover:bg-cream-100">Скопировать номер для поиска</button>
          </div>
        )}

        {message.trim() && (
          <div className="mt-5 rounded-2xl border border-bark-950/10 bg-white p-4">
            <p className="text-sm font-semibold">Готовый текст обращения</p>
            <p className="mt-1 text-xs leading-relaxed text-bark-700">MAX не подставляет сообщение автоматически. Скопируйте текст и вставьте его в чат перед отправкой.</p>
            <textarea readOnly value={message} aria-label="Подготовленный текст обращения" rows={4} className="mt-3 w-full resize-y rounded-xl border border-bark-950/15 bg-cream-50 p-3 text-sm leading-relaxed text-bark-950" />
            <button type="button" onClick={() => { void copy(message, "message"); }} data-qa="contact-choice-copy" className="mt-3 min-h-11 w-full rounded-full bg-bark-900 px-4 text-sm font-semibold text-white hover:bg-bark-800">{copied === "message" ? "Текст скопирован ✓" : "Скопировать текст обращения"}</button>
          </div>
        )}
        <p role="status" aria-live="polite" className="mt-3 min-h-5 text-center text-xs text-bark-700">{copied === "phone" ? "Номер скопирован" : copied === "error" ? "Не удалось скопировать. Выделите текст вручную." : ""}</p>
        <p className="mt-1 text-center text-xs leading-relaxed text-bark-600">Сайт не отправляет сообщение и не сохраняет данные из обращения на сервере.</p>
      </div>
    </div>
  );
}
