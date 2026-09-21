import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";
import { company } from "../data/products";
import { Link, useRouter } from "../lib/router";
import { track } from "../lib/utils";

const logoSvg = `${import.meta.env.BASE_URL}brand/sila-lesa-logo.svg`;
const logoPng = `${import.meta.env.BASE_URL}brand/sila-lesa-logo.png`;

export function LogoMark({ size = 44, className }: { size?: number; className?: string }) {
  return <img src={logoSvg} alt="" width={size} height={size} loading="eager" decoding="async" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = logoPng; }} className={cn("shrink-0 object-contain", className)} style={{ width: size, height: size }} />;
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return <Link to="/" className="flex items-center gap-3 group" aria-label="Сила Леса — на главную"><LogoMark size={compact ? 48 : 58} /><span className="leading-none"><span className="block font-display font-semibold tracking-tight text-cream-50 text-[15px] sm:text-base group-hover:text-cedar-300 transition-colors">СИЛА ЛЕСА</span><span className="block mt-1 text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-cream-300/70">мобильные бани · Омск</span></span></Link>;
}

type BtnVariant = "primary" | "ghost" | "light" | "subtle";
const btnBase = "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-cedar-500 text-bark-950 hover:bg-cedar-400 shadow-[0_10px_30px_-10px_rgba(200,129,63,0.7)]",
  ghost: "border border-cream-100/20 text-cream-50 hover:border-cream-100/50 hover:bg-cream-50/5",
  light: "bg-cream-50 text-bark-950 hover:bg-white",
  subtle: "bg-cream-50/8 text-cream-50 hover:bg-cream-50/14",
};
const btnSizes = { sm: "h-9 px-4 text-sm", md: "h-11 px-5 text-[15px]", lg: "h-13 px-7 text-base" };

export function Button({ variant = "primary", size = "md", className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: keyof typeof btnSizes }) {
  return <button className={cn(btnBase, btnVariants[variant], btnSizes[size], className)} {...rest} />;
}

export function LinkButton({ to, variant = "primary", size = "md", className, children, onClick, external, ariaLabel }: { to: string; variant?: BtnVariant; size?: keyof typeof btnSizes; className?: string; children: ReactNode; onClick?: () => void; external?: boolean; ariaLabel?: string; }) {
  const cls = cn(btnBase, btnVariants[variant], btnSizes[size], className);
  if (external || /^(https?:|tel:|mailto:)/.test(to)) {
    const isHttp = /^https?:/.test(to);
    return <a href={to} className={cls} onClick={onClick} aria-label={ariaLabel} target={isHttp ? "_blank" : undefined} rel={isHttp ? "noopener noreferrer" : undefined}>{children}</a>;
  }
  return <Link to={to} className={cls} onClick={onClick} aria-label={ariaLabel}>{children}</Link>;
}

export function SectionHead({ index, title, lead, align = "left", light = false, className }: { index: string; title: ReactNode; lead?: ReactNode; align?: "left" | "center"; light?: boolean; className?: string; }) {
  return <div className={cn("reveal max-w-3xl", align === "center" && "mx-auto text-center", className)}><div className={cn("flex items-center gap-3 text-xs uppercase tracking-[0.22em]", align === "center" && "justify-center", light ? "text-bark-600" : "text-cedar-300/80")}><span className="font-display">{index}</span><span className={cn("h-px w-10", light ? "bg-bark-600/40" : "bg-cedar-300/40")} aria-hidden="true" /></div><h2 className={cn("mt-4 font-display font-semibold tracking-tight text-balance text-[26px] leading-[1.12] sm:text-4xl lg:text-[44px]", light ? "text-bark-950" : "text-cream-50")}>{title}</h2>{lead && <p className={cn("mt-5 text-base sm:text-lg leading-relaxed", light ? "text-bark-600" : "text-cream-200/80")}>{lead}</p>}</div>;
}

export const PhoneIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" className={cn("h-4 w-4", className)} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" strokeLinejoin="round" /></svg>;
export const ArrowIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" className={cn("h-4 w-4", className)} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
export const CheckIcon = ({ className }: { className?: string }) => <svg viewBox="0 0 24 24" className={cn("h-4 w-4", className)} fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;

export const NAV = [
  { id: "product-section", label: "Модели" },
  { id: "standard", label: "Что входит" },
  { id: "process", label: "Как это работает" },
  { id: "configurator", label: "Рассчитать" },
  { id: "faq", label: "Вопросы" },
  { id: "features", label: "Контакты" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { route } = useRouter();
  const firstLink = useRef<HTMLAnchorElement | null>(null);
  const burger = useRef<HTMLButtonElement | null>(null);

  useEffect(() => { const fn = () => setScrolled(window.scrollY > 24); fn(); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  useEffect(() => { if (!open) return; document.body.style.overflow = "hidden"; firstLink.current?.focus(); const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false); window.addEventListener("keydown", onKey); return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); burger.current?.focus(); }; }, [open]);
  useEffect(() => setOpen(false), [route]);

  return <header className={cn("fixed inset-x-0 top-0 z-50 transition-colors duration-300", scrolled || open ? "bg-bark-900/85 backdrop-blur-md border-b border-cream-50/8" : "bg-transparent")}>
    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
      <Logo compact />
      <nav className="hidden lg:flex items-center gap-1" aria-label="Разделы">{NAV.map((n) => <Link key={n.id} to={`/#${n.id}`} className="px-3 py-2 text-[13.5px] text-cream-200/80 hover:text-cream-50 rounded-full hover:bg-cream-50/6 transition-colors" onClick={() => track("nav", { to: n.id, from: "header" })}>{n.label}</Link>)}</nav>
      <div className="flex items-center gap-2">
        <a href={`tel:${company.phonePrimary.tel}`} className="hidden md:inline-flex items-center gap-2 text-sm text-cream-100 hover:text-cedar-300 transition-colors px-2" onClick={() => track("cta_click", { type: "call", where: "header" })}><PhoneIcon /> {company.phonePrimary.display}</a>
        <LinkButton to="/#configurator" size="sm" className="hidden sm:inline-flex" onClick={() => track("cta_click", { type: "configurator", where: "header" })}>Рассчитать баню</LinkButton>
        <button ref={burger} type="button" className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream-50/15 text-cream-50" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Закрыть меню" : "Открыть меню"} onClick={() => setOpen((v) => !v)}><svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{open ? <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}</svg></button>
      </div>
    </div>
    {open && <div id="mobile-menu" className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-bark-900/97 backdrop-blur-xl overflow-y-auto" role="dialog" aria-modal="true" aria-label="Меню"><nav className="px-6 py-6 flex flex-col" aria-label="Разделы">{NAV.map((n, i) => <Link key={n.id} ref={i === 0 ? firstLink : undefined} to={`/#${n.id}`} className="py-4 text-2xl font-display font-medium text-cream-50 border-b border-cream-50/8 flex items-center justify-between" onClick={() => { setOpen(false); track("nav", { to: n.id, from: "mobile-menu" }); }}>{n.label}<ArrowIcon className="text-cedar-400" /></Link>)}</nav><div className="px-6 pb-10 space-y-3"><a href={`tel:${company.phonePrimary.tel}`} className="flex items-center gap-3 text-lg text-cream-50"><PhoneIcon className="text-cedar-400" /> {company.phonePrimary.display}</a><a href={`tel:${company.phoneSecondary.tel}`} className="flex items-center gap-3 text-lg text-cream-50"><PhoneIcon className="text-cedar-400" /> {company.phoneSecondary.display}<span className="text-sm text-cream-300/70">{company.phoneSecondary.person}</span></a><p className="text-sm text-cream-300/70 pt-2">Показ образцов: {company.showroom}</p></div></div>}
  </header>;
}

export function MobileBar() {
  return <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-cream-50/10 bg-bark-900/92 backdrop-blur-md px-3 pt-2 pb-[max(env(safe-area-inset-bottom),8px)]"><div className="grid grid-cols-2 gap-2"><a href={`tel:${company.phonePrimary.tel}`} className={cn(btnBase, btnVariants.ghost, "h-11 text-sm")} onClick={() => track("cta_click", { type: "call", where: "mobile-bar" })}><PhoneIcon /> Позвонить</a><LinkButton to="/#configurator" size="md" className="h-11 text-sm" onClick={() => track("cta_click", { type: "configurator", where: "mobile-bar" })}>Рассчитать баню</LinkButton></div></div>;
}

export function Footer() {
  return <footer className="border-t border-cream-50/8 bg-bark-950 pb-24 md:pb-10">
    <div className="strap" aria-hidden="true" />
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
      <div><Logo /><p className="mt-5 max-w-sm text-sm leading-relaxed text-cream-300/70">{company.fullName}. Готовые мобильные бани в Омске: модели, комплектация, расчёт и просмотр образцов на площадке.</p><div className="mt-5 flex flex-wrap gap-3"><a href={company.vk} target="_blank" rel="noopener noreferrer" className="text-sm text-cedar-300 hover:text-cedar-200 underline-offset-4 hover:underline">Сообщество VK</a><a href={company.site} target="_blank" rel="noopener noreferrer" className="text-sm text-cedar-300 hover:text-cedar-200 underline-offset-4 hover:underline">silalesa55.ru</a><Link to="/services" className="text-sm text-cream-300/70 hover:text-cream-50 underline-offset-4 hover:underline">Другие строительные услуги</Link></div></div>
      <div><h3 className="text-xs uppercase tracking-[0.2em] text-cream-300/60">Разделы</h3><ul className="mt-4 space-y-2">{NAV.map((n) => <li key={n.id}><Link to={`/#${n.id}`} className="text-sm text-cream-200/80 hover:text-cream-50">{n.label}</Link></li>)}</ul></div>
      <div><h3 className="text-xs uppercase tracking-[0.2em] text-cream-300/60">Связаться</h3><ul className="mt-4 space-y-2 text-sm text-cream-200/80"><li><a href={`tel:${company.phonePrimary.tel}`} className="hover:text-cream-50">{company.phonePrimary.display}</a></li><li><a href={`tel:${company.phoneSecondary.tel}`} className="hover:text-cream-50">{company.phoneSecondary.display}</a> <span className="text-cream-300/60">— {company.phoneSecondary.person}</span></li><li className="pt-2 text-cream-300/70">Показ образцов: {company.showroom}</li><li className="text-cream-300/70">Осмотр по предварительной договорённости; время уточните по телефону.</li></ul></div>
    </div>
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-cream-50/8 flex flex-col sm:flex-row gap-3 justify-between text-xs text-cream-300/50"><span>© {new Date().getFullYear()} «Сила Леса», Омск. Цены указаны в рублях по данным компании; точную стоимость подтверждает менеджер.</span><span>Изображения части моделей — визуализация. Баню можно посмотреть вживую на площадке в Омске.</span></div>
  </footer>;
}
