import siteConfig from "../../config/site.json";
const origin = import.meta.env.VITE_SITE_ORIGIN || siteConfig.preview.origin;
const basePath = import.meta.env.VITE_SITE_BASE_PATH || siteConfig.preview.basePath;
export const SITE_URL = `${origin.replace(/\/$/, "")}${basePath}`;
export function siteUrl(slug = ""): string {
  return new URL(slug.replace(/^\//, ""), SITE_URL).href;
}
