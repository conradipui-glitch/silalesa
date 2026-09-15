import { useEffect, useState } from "react";
import { Footer, Header, MobileBar } from "./components/Brand";
import { seoPages } from "./data/seoPages";
import { RouterProvider, useRouter } from "./lib/router";
import { track, useDocumentTitle, useRevealRoot } from "./lib/utils";
import { NotFound, ProductPage } from "./pages/ProductPage";
import { SeoLandingPage } from "./pages/SeoLandingPage";
import { Configurator } from "./sections/Configurator";
import { Hero } from "./sections/Hero";
import { LayoutSection, Lineup, StandardSection, type ModelKey } from "./sections/Models";
import { Quiz } from "./sections/Quiz";
import { About, Services } from "./sections/ServicesAbout";
import { Process, WinterBand } from "./sections/Story";
import { Faq, ReadyPromise } from "./sections/Trust";

const SITE_URL = "https://conradipui-glitch.github.io/silalesa/";
const SERVICES_URL = `${SITE_URL}services/`;
const SERVICES_TITLE = "Строительные услуги в Омске — Сила Леса";
const SERVICES_DESCRIPTION = "Строительные услуги Сила Леса в Омске: бурение скважин, полусухая стяжка пола и механизированная штукатурка. Стартовые цены и отдельные страницы услуг.";

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
  const [model, setModel] = useState<ModelKey>("k3");
  useDocumentTitle("Сила Леса — бани-квадро из кедра в Омске. Готовые мобильные бани с доставкой");
  const root = useRevealRoot<HTMLDivElement>([]);

  return (
    <div ref={root}>
      <Hero />
      <ReadyPromise />
      <Lineup model={model} setModel={setModel} />
      <StandardSection />
      <LayoutSection model={model} setModel={setModel} />
      <Process />
      <Configurator model={model} setModel={setModel} />
      <Quiz setModel={setModel} />
      <WinterBand />
      <Faq />
      <About />
    </div>
  );
}

function ServicesScreen() {
  useServicesMeta();
  const root = useRevealRoot<HTMLDivElement>([]);
  return (
    <div ref={root} className="pt-16">
      <Services />
    </div>
  );
}

function ProductRoute({ id }: { id: string }) {
  const landing = seoPages.find((page) => page.productId === id);
  return landing ? <SeoLandingPage key={landing.slug} slug={landing.slug} /> : <ProductPage key={id} id={id} />;
}

function Screen() {
  const { route } = useRouter();

  useEffect(() => {
    track("page_view", {
      route: route.name,
      id: route.name === "product" ? route.id : route.name === "landing" ? route.slug : undefined,
    });
  }, [route]);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-cedar-500 focus:px-4 focus:py-2 focus:text-bark-950">
        К содержимому
      </a>
      <Header />
      <main id="main">
        {route.name === "home" && <Home />}
        {route.name === "product" && <ProductRoute id={route.id} />}
        {route.name === "services" && <ServicesScreen />}
        {route.name === "landing" && <SeoLandingPage key={route.slug} slug={route.slug} />}
        {route.name === "notfound" && <NotFound path={route.path} />}
      </main>
      <Footer />
      <MobileBar />
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
