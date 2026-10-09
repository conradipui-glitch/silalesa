import { lazy, Suspense, useEffect } from "react";
import { ConstructionFooter, ConstructionHeader, ConstructionMobileBar } from "./components/ConstructionChrome";
import { NotFound } from "./pages/ConstructionNotFound";
import { landingByProductId } from "./data/routeManifest";
import { RouterProvider, useRouter } from "./lib/router";
import { track, useDocumentTitle, useRevealRoot } from "./lib/utils";
import { useSeasonalTheme } from "./seasonal/calendar";
import { ConstructionHome, ConstructionServicesPage } from "./sections/ConstructionHome";

const SeoLandingPage = lazy(() => import("./pages/SeoLandingPage").then((m) => ({ default: m.SeoLandingPage })));
const SeasonalDecor = lazy(() => import("./seasonal/SeasonalDecor"));
const ServiceBriefPage = lazy(() => import("./pages/ServiceBriefPage").then((m) => ({ default: m.ServiceBriefPage })));
const ScreedCalculatorPage = lazy(() => import("./pages/ScreedCalculatorPage").then((m) => ({ default: m.ScreedCalculatorPage })));
const PlasterCalculatorPage = lazy(() => import("./pages/PlasterCalculatorPage").then((m) => ({ default: m.PlasterCalculatorPage })));
const ForestLeadAssistant = lazy(() => import("./components/ForestLeadAssistant").then((m) => ({ default: m.ForestLeadAssistant })));

const SITE_URL = "https://conradipui-glitch.github.io/silalesa/";
const SERVICES_URL = `${SITE_URL}services/`;
const SERVICES_TITLE = "Строительные работы в Омске — Сила Леса";
const SERVICES_DESCRIPTION =
  "Строительные работы в Омске: коттеджи под ключ, монолит, кладка, штукатурка, стяжка, промышленные полы, металлоконструкции, ангары, кровля, фасады и демонтаж.";

function useServicesMeta() {
  useEffect(() => {
    const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');

    const prev = {
      title: document.title,
      description: descriptionMeta?.content,
      canonical: canonical?.href,
      ogTitle: ogTitle?.content,
      ogDescription: ogDescription?.content,
      ogUrl: ogUrl?.content,
    };

    document.title = SERVICES_TITLE;
    if (descriptionMeta) descriptionMeta.content = SERVICES_DESCRIPTION;
    if (canonical) canonical.href = SERVICES_URL;
    if (ogTitle) ogTitle.content = SERVICES_TITLE;
    if (ogDescription) ogDescription.content = SERVICES_DESCRIPTION;
    if (ogUrl) ogUrl.content = SERVICES_URL;

    return () => {
      document.title = prev.title;
      if (descriptionMeta && prev.description) descriptionMeta.content = prev.description;
      if (canonical && prev.canonical) canonical.href = prev.canonical;
      if (ogTitle && prev.ogTitle) ogTitle.content = prev.ogTitle;
      if (ogDescription && prev.ogDescription) ogDescription.content = prev.ogDescription;
      if (ogUrl && prev.ogUrl) ogUrl.content = prev.ogUrl;
    };
  }, []);
}

function Home() {
  useDocumentTitle("Сила Леса — строительные работы в Омске");
  const root = useRevealRoot<HTMLDivElement>([]);
  return (
    <div ref={root}>
      <ConstructionHome />
    </div>
  );
}

function ServicesScreen() {
  useServicesMeta();
  const root = useRevealRoot<HTMLDivElement>([]);
  return (
    <div ref={root}>
      <h1 className="sr-only">Строительные работы в Омске</h1>
      <ConstructionServicesPage />
    </div>
  );
}

function ProductRoute({ id }: { id: string }) {
  const landing = landingByProductId[id];
  // Numeric service URLs still resolve; archived sauna product IDs do not.
  return landing ? <SeoLandingPage key={landing.slug} slug={landing.slug} /> : <NotFound path={`/product/${id}`} />;
}

function Screen() {
  const { route } = useRouter();
  const seasonalTheme = useSeasonalTheme();

  useEffect(() => {
    track("page_view", {
      route: route.name,
      id: route.name === "product" ? route.id : route.name === "landing" ? route.slug : undefined,
    });
  }, [route]);

  if (route.name === "brief") {
    return (
      <>
        <a href="#brief-title" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-cedar-500 focus:px-4 focus:py-2 focus:text-bark-950">
          К содержимому
        </a>
        <Suspense fallback={<div role="status" className="min-h-dvh bg-bark-950 px-5 pt-24 text-cream-200">Загружаем форму для обращения…</div>}>
          <ServiceBriefPage code={route.code} />
        </Suspense>
      </>
    );
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-cedar-500 focus:px-4 focus:py-2 focus:text-bark-950"
      >
        К содержимому
      </a>
      <ConstructionHeader />
      {seasonalTheme === "halloween" && (
        <Suspense fallback={null}>
          <SeasonalDecor />
        </Suspense>
      )}
      <main id="main">
        <Suspense fallback={<div role="status" className="min-h-screen pt-24 text-center text-cream-200">Загружаем страницу…</div>}>
          {route.name === "home" && <Home />}
          {route.name === "product" && <ProductRoute id={route.id} />}
          {route.name === "services" && <ServicesScreen />}
          {route.name === "calculator" && <ScreedCalculatorPage />}
          {route.name === "plaster-calculator" && <PlasterCalculatorPage />}
          {route.name === "landing" && <SeoLandingPage key={route.slug} slug={route.slug} />}
          {route.name === "notfound" && <NotFound path={route.path} />}
        </Suspense>
      </main>
      <ConstructionFooter />
      <ConstructionMobileBar />
      {(route.name === "home" || route.name === "services" || route.name === "landing") && (
        <Suspense fallback={null}>
          <ForestLeadAssistant key={route.name === "landing" ? route.slug : route.name} source={window.location.pathname} />
        </Suspense>
      )}
    </>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <Screen />
    </RouterProvider>
  );
}
