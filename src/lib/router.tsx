import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import { seoSlugs } from "../data/routeManifest";
import { track } from "./utils";

export type Route =
  | { name: "home"; anchor?: string }
  | { name: "product"; id: string }
  | { name: "services" }
  | { name: "landing"; slug: string }
  | { name: "notfound"; path: string };

/**
 * Базовый путь приложения. Вычисляется один раз из стартового URL:
 *  /                                  → /
 *  /product/10645551                  → /
 *  /banya-kvadro-3x2-omsk/           → /
 *  /preview/x/banya-kvadro-3x2-omsk/ → /preview/x/
 * Это сохраняет нормальные адреса и позволяет работать из подпапки GitHub Pages.
 */
function computeBase(): string {
  let p = window.location.pathname;
  const normalized = p.replace(/\/+$/, "");

  const productMatch = normalized.match(/^(.*?)\/product\/[^/]+$/);
  if (productMatch) return `${productMatch[1]}/` || "/";

  if (normalized.endsWith("/services")) {
    const base = normalized.slice(0, -"services".length);
    return base || "/";
  }

  for (const slug of seoSlugs) {
    const suffix = `/${slug}`;
    if (normalized.endsWith(suffix)) {
      const base = normalized.slice(0, -slug.length);
      return base || "/";
    }
  }

  if (p.endsWith("index.html")) p = p.slice(0, -"index.html".length);
  if (!p.endsWith("/")) p += "/";
  return p;
}

function parseRoute(base: string): Route {
  const path = window.location.pathname;
  const rel = path.startsWith(base) ? path.slice(base.length) : path.replace(/^\//, "");
  const cleanRel = rel.replace(/\/+$/, "");
  const hash = window.location.hash;
  const hashProduct = hash.match(/^#\/?product\/([^/?#]+)/);
  const pathProduct = cleanRel.match(/^product\/([^/?#]+)$/);
  if (pathProduct) return { name: "product", id: decodeURIComponent(pathProduct[1]) };
  if (hashProduct) return { name: "product", id: decodeURIComponent(hashProduct[1]) };
  if (cleanRel === "services") return { name: "services" };
  if (seoSlugs.includes(cleanRel)) return { name: "landing", slug: cleanRel };
  if (cleanRel === "" || cleanRel === "index.html") {
    const anchor = hash.replace(/^#\/?/, "");
    return { name: "home", anchor: anchor || undefined };
  }
  return { name: "notfound", path };
}

type RouterCtx = {
  route: Route;
  base: string;
  href: (to: string) => string;
  navigate: (to: string) => void;
  scrollToId: (id: string) => void;
};

const Ctx = createContext<RouterCtx | null>(null);

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToElement(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  return true;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const base = useMemo(computeBase, []);
  const [route, setRoute] = useState<Route>(() => parseRoute(base));

  const href = useCallback(
    (to: string) => {
      if (/^(https?:|tel:|mailto:)/.test(to)) return to;
      if (to.startsWith("#")) return `${base}${to}`;
      return `${base}${to.replace(/^\//, "")}`;
    },
    [base],
  );

  const navigate = useCallback(
    (to: string) => {
      const target = href(to);
      const current = `${window.location.pathname}${window.location.hash}`;
      if (target !== current) window.history.pushState({}, "", target);
      const next = parseRoute(base);
      setRoute(next);
      track("nav", { to });
    },
    [base, href],
  );

  const scrollToId = useCallback(
    (id: string) => {
      if (route.name !== "home") {
        navigate(`/#${id}`);
        return;
      }
      window.history.replaceState({}, "", `${base}#${id}`);
      requestAnimationFrame(() => scrollToElement(id));
    },
    [route.name, navigate, base],
  );

  useEffect(() => {
    const onPop = () => setRoute(parseRoute(base));
    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", onPop);
    };
  }, [base]);

  useEffect(() => {
    if (route.name === "home" && route.anchor) {
      const id = route.anchor;
      let tries = 0;
      const tick = () => {
        if (scrollToElement(id) || tries++ > 20) return;
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [route]);

  const value = useMemo(() => ({ route, base, href, navigate, scrollToId }), [route, base, href, navigate, scrollToId]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRouter() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useRouter outside RouterProvider");
  return ctx;
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
  ref?: Ref<HTMLAnchorElement>;
};

/** Внутренняя ссылка: настоящий href (можно копировать/открывать в новой вкладке) + SPA-переход. */
export function Link({ to, onClick, children, ref, ...rest }: LinkProps) {
  const { href, navigate, scrollToId } = useRouter();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || rest.target === "_blank") return;
    if (/^(https?:|tel:|mailto:)/.test(to)) return;
    e.preventDefault();
    const anchor = to.match(/^\/?#(.+)$/);
    if (anchor) {
      scrollToId(anchor[1]);
      return;
    }
    navigate(to);
  };
  return (
    <a ref={ref} href={href(to)} onClick={handle} {...rest}>
      {children}
    </a>
  );
}
