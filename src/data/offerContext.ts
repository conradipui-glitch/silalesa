import demandFile from "./seasonal-demand.json";
import offerContextsData from "./offer-contexts.json";

const demand = demandFile as { verified: boolean; region: string; source: string | null; period: string | null; leaderByMonth: Record<string, string> };

/**
 * Every explicit focus must correspond to an actual service on the homepage.
 * Parameters are editorial navigation hints, not organic-search keyword detection.
 * Changing an H1 here does not change the canonical URL or SEO metadata.
 */
export const offerContexts = offerContextsData;

export type OfferCode = keyof typeof offerContexts;
export type OfferMode = "direct" | "verified-season" | "general";

export type HomepageOffer = {
  mode: OfferMode;
  code: OfferCode | null;
  title: string;
  subtitle: string;
};

export const defaultHomepageOffer: HomepageOffer = {
  mode: "general",
  code: null,
  title: "Строительные работы в Омске",
  subtitle: "Монолит, кладка, штукатурка, стяжка, промышленные полы, металлоконструкции, кровля и фасады. Можно заказать отдельный этап или обсудить строительство объекта под ключ.",
};

function isOfferCode(value: string | null): value is OfferCode {
  return value !== null && Object.prototype.hasOwnProperty.call(offerContexts, value);
}

/** Client's local calendar month, only when regional data is explicitly verified. */
export function getHomepageOffer(search: string, date: Date = new Date()): HomepageOffer {
  const code = new URLSearchParams(search).get("service");
  if (isOfferCode(code)) {
    const item = offerContexts[code];
    return { mode: "direct", code, title: item.title + " в Омске", subtitle: item.subtitle };
  }

  if (
    !code &&
    demand.verified === true &&
    demand.region === "Омская область" &&
    demand.source === "Yandex Wordstat" &&
    typeof demand.period === "string" &&
    demand.period.length > 0
  ) {
    const monthly = demand.leaderByMonth as Record<string, string>;
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const seasonalCode = monthly[month] ?? null;
    if (isOfferCode(seasonalCode)) {
      const item = offerContexts[seasonalCode];
      return { mode: "verified-season", code: seasonalCode, title: item.title + " в Омске", subtitle: item.subtitle };
    }
  }

  return defaultHomepageOffer;
}
