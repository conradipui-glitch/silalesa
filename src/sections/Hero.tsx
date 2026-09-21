import { useEffect, useRef } from "react";
import { ArrowIcon, LinkButton, PhoneIcon } from "../components/Brand";
import { company, formatPrice, images, mapsUrl, saunas, whatsappUrl } from "../data/products";
import { Link } from "../lib/router";
import { track, useReducedMotion } from "../lib/utils";

export function Hero() {
  const imgRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const minPrice = Math.min(...saunas.map((s) => s.price));

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 800);
        if (imgRef.current) imgRef.current.style.transform = `translate3d(0, ${y * 0.12}px, 0)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <section className="relative overflow-hidden bg-bark-900 pt-24 sm:pt-28 lg:pt-32" aria-labelledby="hero-title">
      <div className="absolute inset-0 grid-paper opacity-60 [mask-image:radial-gradient(70%_60%_at_30%_20%,#000,transparent)]" aria-hidden="true" />
      <div className="absolute -top-40 left-1/3 h-[520px] w-[520px] rounded-full bg-cedar-500/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
          <div className="order-1">
            <p className="reveal flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-cedar-300/90">
              <span className="h-px w-8 bg-cedar-400" aria-hidden="true" />
              Омск · производство мобильных бань
            </p>
            <h1
              id="hero-title"
              className="reveal mt-6 font-display font-semibold tracking-tight text-cream-50 text-[34px] leading-[1.06] sm:text-5xl lg:text-[60px] xl:text-[66px] text-balance"
              style={{ ["--reveal-delay" as string]: "80ms" }}
            >
              Бани Квадро в Омске — <span className="text-cedar-400">от {formatPrice(minPrice)}</span>
            </h1>
            <p className="reveal mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-cream-200/85" style={{ ["--reveal-delay" as string]: "160ms" }}>
              Квадро 2×2 — одна парная от {formatPrice(minPrice)}. Есть варианты с комнатой отдыха и каркасная модель с помывочной. Сравните цены, планировки и комплектации без анкеты.
            </p>

            <div className="reveal mt-8 flex flex-wrap items-center gap-3" style={{ ["--reveal-delay" as string]: "240ms" }}>
              <LinkButton to="/mobilnaya-banya-omsk/" size="lg" onClick={() => track("cta_click", { type: "catalog", where: "hero" })}>
                Модели и цены <ArrowIcon />
              </LinkButton>
              <LinkButton to={whatsappUrl("Здравствуйте! Хочу подобрать баню. Подскажите по модели, комплектации и доставке. Страница: https://conradipui-glitch.github.io/silalesa/")} variant="ghost" size="lg" external onClick={() => track("cta_click", { type: "whatsapp", where: "hero" })}>
                Спросить в WhatsApp
              </LinkButton>
              <a href={`tel:${company.phonePrimary.tel}`} className="inline-flex items-center gap-2 px-2 text-sm text-cream-200/80 hover:text-cedar-300" onClick={() => track("cta_click", { type: "call", where: "hero" })}>
                <PhoneIcon /> {company.phonePrimary.display}
              </a>
            </div>

            <dl className="reveal mt-10 grid grid-cols-3 gap-4 border-t border-cream-50/10 pt-6 max-w-xl" style={{ ["--reveal-delay" as string]: "320ms" }}>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.16em] text-cream-300/60">Квадро 2×2</dt>
                <dd className="mt-1 font-display text-lg sm:text-2xl text-cream-50">от {formatPrice(minPrice)}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.16em] text-cream-300/60">Квадро</dt>
                <dd className="mt-1 font-display text-lg sm:text-2xl text-cream-50">кедр 45 мм</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.16em] text-cream-300/60">Доставка Квадро</dt>
                <dd className="mt-1 font-display text-lg sm:text-2xl text-cream-50">по Омску включена</dd>
              </div>
            </dl>

            <p className="reveal mt-6 text-sm leading-relaxed text-cream-300/70" style={{ ["--reveal-delay" as string]: "380ms" }}>
              Каркасная 5,5×2,2 — {formatPrice(saunas.find((s) => s.modelKey === "f55")!.price)}; её доставка и установка согласуются отдельно. <a href={mapsUrl(company.showroom)} target="_blank" rel="noopener noreferrer" className="text-cedar-300 underline underline-offset-4">Посмотреть образец на площадке ↗</a>.
            </p>
          </div>

          <div className="order-2 relative">
            <div ref={imgRef} className="relative will-change-transform">
              <div className="kvadro-mask relative overflow-hidden shadow-card aspect-[4/3] bg-bark-800">
                <img
                  src={images.hero}
                  alt="Кедровая мобильная баня на дачном участке"
                  className="h-full w-full object-cover"
                  width={1536}
                  height={1024}
                  fetchPriority="high"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bark-950/70 to-transparent" aria-hidden="true" />
                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="font-display text-sm text-cream-50">Мобильные бани «Сила Леса»</p>
                    <p className="text-xs text-cream-200/80">Планировки, фото и цены — в каталоге</p>
                  </div>
                  <Link to="/mobilnaya-banya-omsk/" className="hidden sm:inline-flex items-center gap-1 rounded-full bg-cream-50/12 px-3 py-1.5 text-xs text-cream-50 backdrop-blur hover:bg-cream-50/20">
                    Подробнее <ArrowIcon className="h-3 w-3" />
                  </Link>
                </div>
              </div>
              {!reduced && (
                <div className="pointer-events-none absolute -top-6 right-[22%] hidden lg:block" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="steam-puff absolute h-10 w-10 rounded-full bg-cream-50/25 blur-lg"
                      style={{ animationDelay: `${i * 2}s`, left: i * 10 }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-12 border-y border-cream-50/10 bg-bark-950/60 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-8 gap-y-2 px-4 text-sm text-cream-200 sm:px-6 lg:px-8">
          <span>Квадро: установка на блоки включена</span>
          <span>Квадро: доставка по Омску включена</span>
          <span>Опции и нестандартный подъезд — по согласованию</span>
        </div>
      </div>
    </section>
  );
}
