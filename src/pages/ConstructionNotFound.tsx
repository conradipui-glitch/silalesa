import { useEffect } from "react";
import { Link } from "../lib/router";

const serviceLinks = [
  { to: "/services/", label: "Все строительные работы" },
  { to: "/mehanizirovannaya-shtukaturka-omsk/", label: "Механизированная штукатурка" },
  { to: "/polusuhaya-styazhka-omsk/", label: "Полусухая стяжка" },
  { to: "/burenie-skvazhiny-omsk/", label: "Бурение скважин" },
];

export function NotFound({ path }: { path: string }) {
  useEffect(() => {
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const previousRobots = robots?.content;
    const previousTitle = document.title;
    if (robots) robots.content = "noindex, follow";
    document.title = "Страница не найдена — Сила Леса";
    return () => {
      if (robots && previousRobots !== undefined) robots.content = previousRobots;
      document.title = previousTitle;
    };
  }, [path]);
  return (
    <section className="min-h-[70vh] bg-bark-900 pb-24 pt-32">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">404</p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-cream-50 sm:text-5xl">Такой страницы нет</h1>
        <p className="mt-4 text-cream-200/75">Адрес <code className="rounded bg-cream-50/8 px-1.5 py-0.5 text-sm">{path}</code> не найден. Выберите строительную услугу:</p>
        <ul className="mt-8 grid gap-2 text-left sm:grid-cols-2">
          {serviceLinks.map((item) => (
            <li key={item.to}>
              <Link to={item.to} className="flex min-h-12 items-center rounded-2xl border border-cream-50/10 px-4 py-3 text-sm text-cream-100 hover:border-cream-50/30 focus-visible:outline-2 focus-visible:outline-cedar-300">{item.label}</Link>
            </li>
          ))}
        </ul>
        <p className="mt-8"><Link to="/" className="inline-flex min-h-11 items-center rounded-full bg-cedar-400 px-6 py-3 font-semibold text-bark-950">На главную</Link></p>
      </div>
    </section>
  );
}
