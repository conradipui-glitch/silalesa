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

const SITE_URL = "https://conradipui-glitch.github.io/silalesa/";

const entityGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}#organization`,
      name: company.name,
      alternateName: company.fullName,
      description: "Производство и продажа мобильных бань в Омске: кедровые бани Квадро, каркасные бани и дополнительные строительные услуги.",
      url: SITE_URL,
      telephone: [company.phonePrimary.tel, company.phoneSecondary.tel],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Омск",
        streetAddress: "ул. Заозерная, 11/1И",
        addressCountry: "RU",
      },
      areaServed: [
        { "@type": "City", name: "Омск" },
        { "@type": "AdministrativeArea", name: "Омская область" },
      ],
      sameAs: [company.vk, company.origin, company.site],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: company.phonePrimary.tel,
          contactType: "sales",
          areaServed: "RU-OMS",
          availableLanguage: "ru",
        },
        {
          "@type": "ContactPoint",
          telephone: company.phoneSecondary.tel,
          contactType: "sales",
          areaServed: "RU-OMS",
          availableLanguage: "ru",
        },
      ],
      knowsAbout: [
        "мобильные бани",
        "кедровые бани",
        "бани Квадро",
        "каркасные бани",
        "доставка и установка бань",
        "полусухая стяжка пола",
        "механизированная штукатурка",
        "бурение скважин",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      url: SITE_URL,
      name: "Сила Леса",
      inLanguage: "ru-RU",
      publisher: { "@id": `${SITE_URL}#organization` },
    },
  ],
};

function Home() {
  const [model, setModel] = useState<ModelKey>("k3");
  useDocumentTitle("Сила Леса — бани-квадро из кедра в Омске. Готовые мобильные бани с доставкой");
  const root = useRevealRoot<HTMLDivElement>([]);

  return (
    <div ref={root}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(entityGraph) }} />
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
