import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/* Аналитика: локальный адаптер. Внешней отправки нет.                  */
/* Подключение: при наличии window.ym / gtag / dataLayer события        */
/* пробрасываются туда автоматически. Локальные события — не статистика */
/* аудитории, а отладочный буфер (window.__silalesaEvents).             */
/* ------------------------------------------------------------------ */
export type AnalyticsEvent =
  | "page_view"
  | "product_view"
  | "nav"
  | "quiz_start"
  | "quiz_step"
  | "quiz_complete"
  | "quiz_restart"
  | "saved_result_reuse"
  | "config_change"
  | "config_restore"
  | "cta_view"
  | "cta_click"
  | "copy";

type Payload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    __silalesaEvents?: { name: string; payload: Payload; ts: number }[];
    ym?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(name: AnalyticsEvent, payload: Payload = {}) {
  if (typeof window === "undefined") return;
  const ev = { name, payload, ts: Date.now() };
  const buf = (window.__silalesaEvents ??= []);
  buf.push(ev);
  if (buf.length > 300) buf.shift();
  try {
    window.dataLayer?.push({ event: `silalesa_${name}`, ...payload });
    window.gtag?.("event", name, payload);
    // Для Яндекс Метрики нужно подставить номер счётчика: window.ym(COUNTER_ID, 'reachGoal', name, payload)
  } catch {
    /* адаптер не должен ломать интерфейс */
  }
  if (import.meta.env.DEV) console.debug("[analytics]", name, payload);
}

/* ------------------------------------------------------------------ */
/* Хранилище: только текущее устройство, с защитой от недоступности      */
/* ------------------------------------------------------------------ */
export function storageAvailable(): boolean {
  try {
    const k = "__sl_test__";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function loadJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/* Хуки                                                                 */
/* ------------------------------------------------------------------ */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setReduced(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

/** Появление блоков при прокрутке: добавляет .is-in элементам .reveal внутри корня. */
export function useRevealRoot<T extends HTMLElement>(deps: unknown[] = []) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (!("IntersectionObserver" in window)) {
      root.querySelectorAll<HTMLElement>(".reveal").forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 },
    );
    const observe = (el: HTMLElement) => {
      if (!el.classList.contains("is-in")) io.observe(el);
    };
    root.querySelectorAll<HTMLElement>(".reveal").forEach(observe);
    // Элементы, появляющиеся позже (шаги квиза, условные поля конфигуратора)
    const mo = new MutationObserver((muts) => {
      muts.forEach((m) =>
        m.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.classList.contains("reveal")) observe(n);
          n.querySelectorAll<HTMLElement>(".reveal").forEach(observe);
        }),
      );
    });
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

/** Однократное срабатывание при попадании в область видимости (для cta_view). */
export function useInViewOnce<T extends HTMLElement>(onIn: () => void) {
  const ref = useRef<T | null>(null);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || fired.current || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && !fired.current) {
        fired.current = true;
        onIn();
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [onIn]);
  return ref;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
