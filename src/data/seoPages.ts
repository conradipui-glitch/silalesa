import rawPages from "./seo-pages.json";
import rawGuides from "./seo-page-guides.json";
import rawRepairGuides from "./seo-page-guides-remont.json";
import rawScreedGuides from "./seo-page-guides-screed.json";
import rawOverrides from "./seo-page-overrides.json";
import rawNextOverrides from "./seo-page-overrides-next.json";

export type SeoFaq = [question: string, answer: string];
export type SeoGuideSection = { heading: string; paragraphs: string[]; bullets?: string[] };
export type SeoGuideComparison = { heading: string; intro: string; rows: [criterion: string, ready: string, build: string][] };

export type SeoPage = {
  slug: string;
  kind: "sauna" | "service" | "category" | "guide";
  productId?: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lead: string;
  points: string[];
  faq: SeoFaq[];
  comparison?: SeoGuideComparison;
  sections?: SeoGuideSection[];
  printChecklistPath?: string;
};

type SeoPageOverride = { slug: string } & Partial<Omit<SeoPage, "slug">>;

const overrideBySlug = new Map(
  ([...rawOverrides, ...rawNextOverrides] as SeoPageOverride[]).map((override) => [override.slug, override]),
);

const rawAllPages = [...rawPages, ...rawGuides, ...rawRepairGuides, ...rawScreedGuides] as SeoPage[];

export const seoPages = rawAllPages.map((page) => ({
  ...page,
  ...(overrideBySlug.get(page.slug) ?? {}),
})) as SeoPage[];

export const seoSlugs = seoPages.map((page) => page.slug);

export function seoPageBySlug(slug: string) {
  return seoPages.find((page) => page.slug === slug);
}
