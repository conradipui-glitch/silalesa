import rawPages from "./seo-pages.json";

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

export const seoPages = rawPages as SeoPage[];
export const seoSlugs = seoPages.map((page) => page.slug);

export function seoPageBySlug(slug: string) {
  return seoPages.find((page) => page.slug === slug);
}
