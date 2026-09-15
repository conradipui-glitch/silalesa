import { useEffect, useState } from "react";
import { Footer, Header, MobileBar } from "./components/Brand";
import { company } from "./data/products";
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

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: company.name,
  description: "Производство мобильных бань (бани-квадро, каркасные), строительные и отделочные работы в Омске.",
  telephone: [company.phonePrimary.tel, company.phoneSecondary.tel],
  address: { "@type": "PostalAddress", addressLocality: "Омск", streetAddress: "ул. Нефтезаводская, 49/1", addressCountry: "RU" },
  url: company.origin,
  sameAs: [company.vk, company.site],
};

function Home() {
  const [model, setModel] = useState<ModelKey>("k3");
  useDocumentTitle("Сила Леса — бани-квадро из кедра в Омске. Готовые мобильные бани с доставкой");
  const root = useRevealRoot<HTMLDivElement>([]);

  return (
    <div ref={root}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
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
  useDocumentTitle("Другие строительные услуги — Сила Леса, Омск");
  const root = useRevealRoot<HTMLDivElement>([]);
  return (
    <div ref={root} className="pt-16">
      <Services />
    </div>
  );
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
        {route.name === "product" && <ProductPage key={route.id} id={route.id} />}
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
