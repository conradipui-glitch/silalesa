import rawPages from "./seo-pages.json";
import rawOverrides from "./seo-page-overrides.json";

export type SeoFaq = [question: string, answer: string];

export type SeoPage = {
  slug: string;
  kind: "sauna" | "service" | "category";
  productId?: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lead: string;
  points: string[];
  faq: SeoFaq[];
};

type SeoPageOverride = { slug: string } & Partial<Omit<SeoPage, "slug">>;

const overrideBySlug = new Map(
  (rawOverrides as SeoPageOverride[]).map((override) => [override.slug, override]),
);

export const seoPages = (rawPages as SeoPage[]).map((page) => ({
  ...page,
  ...(overrideBySlug.get(page.slug) ?? {}),
})) as SeoPage[];

export const seoSlugs = seoPages.map((page) => page.slug);

export function seoPageBySlug(slug: string) {
  return seoPages.find((page) => page.slug === slug);
}
