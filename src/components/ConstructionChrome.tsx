import { useEffect, useRef, useState } from "react";
import { ArrowIcon, LinkButton, LogoMark, PhoneIcon } from "./Brand";
import { company, whatsappUrl } from "../data/products";
import { Link, useRouter } from "../lib/router";
import { track } from "../lib/utils";
import { cn } from "../utils/cn";

const NAV = [
  { id: "services", label: "Услуги" },
  { id: "format", label: "Формат работы" },
  { id: "process", label: "Этапы" },
  { id: "estimate", label: "Расчёт" },
  { id: "contact", label: "Контакты" },
];

function ConstructionLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="Сила Леса — на главную">
      <LogoMark size={compact ? 48 : 58} />
      <span className="leading-none">
        <span className="block font-display text-[15px] font-semibold tracking-tight text-cream-50 transition-colors group-hover:text-cedar-300 sm:text-base">
          СИЛА ЛЕСА
        </span>
        <span className="mt-1 block text-[10px] uppercase tracking-[0.16em] text-cream-300/80 sm:text-[11px]">
          строительные работы · Омск
        </span>
      </span>
    </Link>
  );
}

export function ConstructionHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { route } = useRouter();
  const firstLink = useRef<HTMLAnchorElement | null>(null);
  const burger = useRef<HTMLButtonElement | null>(null);
  const menu = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    firstLink.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        menu.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.offsetParent !== null);

      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      burger.current?.focus();
    };
  }, [open]);

  useEffect(() => setOpen(false), [route]);

  const wa = whatsappUrl("Здравствуйте! Хочу обсудить строительные работы. Подскажите, какие данные нужны для предварительного расчёта?");

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-colors duration-300", scrolled || open ? "border-b border-cream-50/8 bg-bark-900/90 backdrop-blur-md" : "bg-transparent")}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div data-qa="header-logo"><ConstructionLogo compact /></div>
        <nav data-qa="header-nav" className="hidden items-center gap-1 xl:flex" aria-label="Разделы">
          {NAV.map((item) => (
            <Link
              key={item.id}
              to={`/#${item.id}`}
              className="rounded-full px-3 py-2 text-[13.5px] text-cream-200/80 transition-colors hover:bg-cream-50/6 hover:text-cream-50"
              onClick={() => track("nav", { to: item.id, from: "construction-header" })}
            >
              {item.label}
            </Link>
          ))}
          <Link to="/kalkulyator-styazhki-pola/" className="rounded-full px-3 py-2 text-[13.5px] font-medium text-cedar-300 transition-colors hover:bg-cream-50/6 hover:text-cream-50" onClick={() => track("nav", { to: "screed-calculator", from: "construction-header" })}>Калькулятор</Link>
        </nav>
        <div data-qa="header-actions" className="flex items-center gap-2">
          <a
            href={`tel:${company.phonePrimary.tel}`}
            className="hidden min-h-11 items-center gap-2 rounded-full px-3 text-sm text-cream-100 transition-colors hover:text-cedar-300 md:inline-flex"
            onClick={() => track("cta_click", { type: "call", where: "construction-header" })}
          >
            <PhoneIcon /> {company.phonePrimary.display}
          </a>
          <LinkButton
            to={wa}
            external
            size="sm"
            className="hidden h-11 sm:inline-flex"
            onClick={() => track("cta_click", { type: "whatsapp", where: "construction-header" })}
          >
            Обсудить объект
          </LinkButton>
          <button
            ref={burger}
            type="button"
            className="inline-flex h-11 w-11 cursor-pointer touch-manipulation items-center justify-center rounded-full border border-cream-50/15 text-cream-50 xl:hidden"
            aria-expanded={open}
            aria-controls="construction-mobile-menu"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setOpen((value) => !value)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div ref={menu} id="construction-mobile-menu" className="fixed inset-x-0 top-16 z-40 block h-[calc(100dvh-4rem)] overflow-y-auto bg-bark-900/98 backdrop-blur-xl xl:hidden" role="dialog" aria-modal="true" aria-label="Меню">
          <nav className="flex flex-col px-6 py-6" aria-label="Разделы">
            {NAV.map((item, index) => (
              <Link
                key={item.id}
                ref={index === 0 ? firstLink : undefined}
                to={`/#${item.id}`}
                className="flex items-center justify-between border-b border-cream-50/8 py-4 font-display text-2xl font-medium text-cream-50"
                onClick={() => setOpen(false)}
              >
                {item.label}
                <ArrowIcon className="text-cedar-400" />
              </Link>
            ))}
            <Link to="/kalkulyator-styazhki-pola/" className="flex items-center justify-between border-b border-cream-50/8 py-4 font-display text-2xl font-medium text-cedar-300" onClick={() => setOpen(false)}>Калькулятор стяжки <ArrowIcon /></Link>
          </nav>
          <div className="space-y-3 px-6 pb-10">
            <a href={`tel:${company.phonePrimary.tel}`} className="flex min-h-11 items-center gap-3 text-lg text-cream-50">
              <PhoneIcon className="text-cedar-400" /> {company.phonePrimary.display}
            </a>
            <a href={`tel:${company.phoneSecondary.tel}`} className="flex min-h-11 items-center gap-3 text-lg text-cream-50">
              <PhoneIcon className="text-cedar-400" /> {company.phoneSecondary.display}
            </a>
            <LinkButton to={wa} external size="md" className="mt-4 w-full" onClick={() => setOpen(false)}>
              Написать в WhatsApp
            </LinkButton>
          </div>
        </div>
      )}
    </header>
  );
}

export function ConstructionMobileBar() {
  const wa = whatsappUrl("Здравствуйте! Хочу обсудить строительные работы и получить предварительный расчёт.");
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cream-50/10 bg-bark-900/94 px-3 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur-md md:hidden">
      <div className="grid grid-cols-2 gap-2">
        <a
          href={`tel:${company.phonePrimary.tel}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-cream-100/20 text-sm font-medium text-cream-50"
          onClick={() => track("cta_click", { type: "call", where: "construction-mobile-bar" })}
        >
          <PhoneIcon /> Позвонить
        </a>
        <LinkButton to={wa} external size="md" className="h-11 text-sm" onClick={() => track("cta_click", { type: "whatsapp", where: "construction-mobile-bar" })}>
          Обсудить объект
        </LinkButton>
      </div>
    </div>
  );
}

export function ConstructionFooter() {
  const wa = whatsappUrl("Здравствуйте! Хочу обсудить строительный объект.");
  return (
    <footer className="border-t border-cream-50/8 bg-bark-950 pb-24 md:pb-10">
      <div className="strap" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-12 sm:px-6 md:grid-cols-[1.35fr_1fr_1fr] lg:px-8">
        <div>
          <ConstructionLogo />
          <p className="mt-5 max-w-md text-base leading-relaxed text-cream-300/80">
            {company.fullName}. Строительные работы в Омске: монолит, кладка, отделка, полы, металл, кровля, фасады и демонтаж. Также можно обсудить комплексное строительство объекта.
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-cream-300/80">Разделы</h3>
          <ul className="mt-4 space-y-2">
            {NAV.map((item) => (
              <li key={item.id}>
                <Link to={`/#${item.id}`} className="text-sm text-cream-200/80 hover:text-cream-50">
                  {item.label}
                </Link>
              </li>
            ))}
            <li><Link to="/services/" className="text-sm text-cream-200/80 hover:text-cream-50">Все строительные работы</Link></li>
            <li><Link to="/kalkulyator-styazhki-pola/" className="text-sm font-medium text-cedar-300 hover:text-cream-50">Калькулятор стяжки пола</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-cream-300/80">Связаться</h3>
          <ul className="mt-4 space-y-2 text-sm text-cream-200/80">
            <li><a href={`tel:${company.phonePrimary.tel}`} className="hover:text-cream-50">{company.phonePrimary.display}</a></li>
            <li><a href={`tel:${company.phoneSecondary.tel}`} className="hover:text-cream-50">{company.phoneSecondary.display}</a> <span className="text-cream-300/80">— {company.phoneSecondary.person}</span></li>
            <li className="pt-2 text-cream-300/80">{company.city}</li>
            <li><a href={wa} target="_blank" rel="noopener noreferrer" className="text-cedar-300 hover:text-cedar-200">Обсудить объект в WhatsApp</a></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col justify-between gap-3 border-t border-cream-50/8 px-4 pt-6 text-xs text-cream-300/80 sm:flex-row sm:px-6 lg:px-8">
        <span>© {new Date().getFullYear()} «Сила Леса», Омск.</span>
        <span>Стоимость и сроки рассчитываются после уточнения объёма, проекта и условий объекта.</span>
      </div>
    </footer>
  );
}
