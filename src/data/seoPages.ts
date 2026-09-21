import rawPages from "./seo-pages.json";
import rawGuides from "./seo-page-guides.json";
import rawRepairGuides from "./seo-page-guides-remont.json";
import rawScreedGuides from "./seo-page-guides-screed.json";
import rawPlasterGuides from "./seo-page-guides-plaster.json";
import rawMaterialGuides from "./seo-page-guides-materials.json";
import rawOverrides from "./seo-page-overrides.json";
import rawNextOverrides from "./seo-page-overrides-next.json";
import rawR3Overrides from "./seo-page-overrides-r3.json";
import rawR4Overrides from "./seo-page-overrides-r4.json";
import rawR5Overrides from "./seo-page-overrides-r5.json";
import rawR6Overrides from "./seo-page-overrides-r6.json";
import rawR7Overrides from "./seo-page-overrides-r7.json";

export type SeoFaq = [question: string, answer: string];
export type SeoGuideSection = { heading: string; paragraphs: string[]; bullets?: string[] };
export type SeoGuideComparison = { heading: string; intro: string; rows: [criterion: string, ready: string, build: string][] };
export type SeoMethodComparison = { heading: string; intro: string; columns: [string, string]; rows: [string, string, string][] };

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
  summary?: string[];
  methodComparison?: SeoMethodComparison;
  faq: SeoFaq[];
  comparison?: SeoGuideComparison;
  sections?: SeoGuideSection[];
  printChecklistPath?: string;
  priceLabel?: string;
  priceNote?: string;
  serviceResults?: string[];
  requestChecklist?: string[];
  requestPrompt?: string;
  choiceHeading?: string;
  choiceIntro?: string;
  choiceModels?: string[];
  choicePaths?: { title: string; benefit: string; condition: string }[];
  choiceChecklist?: string[];
  choicePrompt?: string;
  choiceCtaLabel?: string;
  operationHeading?: string;
  operationIntro?: string;
  operationSteps?: { title: string; do: string; send: string; outcome: string }[];
  operationPrompt?: string;
  operationCtaLabel?: string;
  operationLinks?: { slug: string; label: string }[];
  offerModel?: string;
  offerModels?: string[];
  offerHeading?: string;
  offerIncluded?: string[];
  offerOptions?: string[];
  offerChecklist?: string[];
  offerPrompt?: string;
  offerCtaLabel?: string;
};

type SeoPageOverride = { slug: string } & Partial<Omit<SeoPage, "slug">>;

const overrideBySlug = new Map<string, SeoPageOverride>();
for (const override of [...rawOverrides, ...rawNextOverrides, ...rawR3Overrides, ...rawR4Overrides, ...rawR5Overrides, ...rawR6Overrides, ...rawR7Overrides] as SeoPageOverride[]) {
  overrideBySlug.set(override.slug, { ...(overrideBySlug.get(override.slug) ?? {}), ...override });
}

const rawAllPages = [...rawPages, ...rawGuides, ...rawRepairGuides, ...rawScreedGuides, ...rawPlasterGuides, ...rawMaterialGuides] as SeoPage[];

export const seoPages = rawAllPages.map((page) => ({
  ...page,
  ...(overrideBySlug.get(page.slug) ?? {}),
})) as SeoPage[];

export const seoSlugs = seoPages.map((page) => page.slug);

export function seoPageBySlug(slug: string) {
  return seoPages.find((page) => page.slug === slug);
}
