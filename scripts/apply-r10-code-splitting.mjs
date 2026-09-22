// One-time checked migration. Remove this file after applying it on the R10 branch.
import fs from 'node:fs/promises';

async function patch(file, replacements) {
  let value = await fs.readFile(file, 'utf8');
  for (const [before, after] of replacements) {
    const count = value.split(before).length - 1;
    if (count !== 1) throw new Error(`${file}: expected exactly one occurrence of ${JSON.stringify(before)}, got ${count}`);
    value = value.replace(before, after);
  }
  await fs.writeFile(file, value);
  console.log('R10_SPLIT_EDIT', file);
}
await patch('src/lib/router.tsx', [
  ['import { seoSlugs } from "../data/seoPages";', 'import { seoSlugs } from "../data/routeManifest";'],
]);
await patch('src/components/Brand.tsx', [
  ['import { seoPageBySlug } from "../data/seoPages";', 'import { landingMetaBySlug } from "../data/routeManifest";'],
  ['route.name === "landing" ? seoPageBySlug(route.slug) : undefined', 'route.name === "landing" ? landingMetaBySlug[route.slug] : undefined'],
]);
await patch('src/sections/Models.tsx', [
  ['import { seoPages } from "../data/seoPages";', 'import { landingByProductId } from "../data/routeManifest";'],
  ['const landing = seoPages.find((page) => page.productId === p.id);', 'const landing = landingByProductId[p.id];'],
  ['const layoutLanding = seoPages.find((page) => page.productId === p.id);', 'const layoutLanding = landingByProductId[p.id];'],
]);
await patch('src/sections/Configurator.tsx', [
  ['import { seoPages } from "../data/seoPages";', 'import { landingByProductId } from "../data/routeManifest";'],
  ['seoPages.find((page) => page.productId === product.id)?.slug', 'landingByProductId[product.id]?.slug'],
]);
await patch('src/sections/Quiz.tsx', [
  ['import { seoPages } from "../data/seoPages";', 'import { landingByProductId } from "../data/routeManifest";'],
  ['seoPages.find((page) => page.productId === p.id)?.slug', 'landingByProductId[p.id]?.slug'],
]);
await patch('src/sections/ServicesAbout.tsx', [
  ['import { seoPages } from "../data/seoPages";', 'import { landingByProductId } from "../data/routeManifest";'],
  ['const serviceLandingByProductId = new Map(\n  seoPages\n    .filter((page) => page.kind === "service" && page.productId)\n    .map((page) => [page.productId as string, page]),\n);', 'const serviceLandingByProductId = landingByProductId;'],
  ['const landing = serviceLandingByProductId.get(s.id);', 'const landing = serviceLandingByProductId[s.id]?.kind === "service" ? serviceLandingByProductId[s.id] : undefined;'],
]);
await patch('src/App.tsx', [
  ['import { useEffect, useState } from "react";', 'import { lazy, Suspense, useEffect, useState } from "react";'],
  ['import { seoPages } from "./data/seoPages";', 'import { landingByProductId } from "./data/routeManifest";'],
  ['import { NotFound, ProductPage } from "./pages/ProductPage";\nimport { SeoLandingPage } from "./pages/SeoLandingPage";', 'const ProductPage = lazy(() => import("./pages/ProductPage").then((m) => ({ default: m.ProductPage })));\nconst NotFound = lazy(() => import("./pages/ProductPage").then((m) => ({ default: m.NotFound })));\nconst SeoLandingPage = lazy(() => import("./pages/SeoLandingPage").then((m) => ({ default: m.SeoLandingPage })));'],
  ['const landing = seoPages.find((page) => page.productId === id);', 'const landing = landingByProductId[id];'],
  ['<main id="main">\n        {route.name', '<main id="main">\n        <Suspense fallback={<div role="status" className="min-h-screen pt-24 text-center text-cream-200">Загружаем страницу…</div>}>\n        {route.name'],
  ['{route.name === "notfound" && <NotFound path={route.path} />}\n      </main>', '{route.name === "notfound" && <NotFound path={route.path} />}\n        </Suspense>\n      </main>'],
]);
await patch('package.json', [
  ['"build": "tsc --noEmit && vite build', '"build": "node scripts/generate-route-manifest.mjs && tsc --noEmit && vite build'],
]);
