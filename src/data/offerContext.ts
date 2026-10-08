import demandFile from "./seasonal-demand.json";

const demand = demandFile as { verified: boolean; region: string; source: string | null; period: string | null; leaderByMonth: Record<string, string> };

/**
 * Every explicit focus must correspond to an actual service on the homepage.
 * Parameters are editorial navigation hints, not organic-search keyword detection.
 * Changing an H1 here does not change the canonical URL or SEO metadata.
 */
export const offerContexts = {
  cottages: { title: "Коттеджи под ключ", subtitle: "Строительство частного дома: обсудим проект, объём, последовательность работ и исходные условия участка." },
  monolith: { title: "Монолитные работы", subtitle: "Фундаменты, плиты, колонны, стены и перекрытия по проекту — отдельно или в составе строительного комплекса." },
  masonry: { title: "Кладочные работы", subtitle: "Кирпич, блок и другие материалы. Определим объёмы кладки, условия площадки и требования по проекту." },
  plaster: { title: "Механизированная штукатурка", subtitle: "Выравнивание стен на жилых и коммерческих объектах. Для расчёта важны площадь, основание, слой и доступ." },
  screed: { title: "Полусухая стяжка", subtitle: "Механизированное устройство основания пола. Уточним площадь, конструкцию, этаж, подачу смеси и покрытие." },
  "concrete-screed": { title: "Бетонная стяжка", subtitle: "Устройство бетонного основания с учётом предполагаемой нагрузки, толщины и условий эксплуатации." },
  topping: { title: "Промышленные полы (топпинг)", subtitle: "Упрочнённые бетонные полы для складов, цехов и других объектов. Расчёт зависит от нагрузок и проекта." },
  metalworks: { title: "Металлоконструкции", subtitle: "Металлические каркасы и элементы: обсудим изготовление, монтаж и требования проектной документации." },
  hangars: { title: "Строительство ангаров", subtitle: "Каркас и ограждающие конструкции для складских и производственных зданий. Обсудим состав и этапы." },
  multistory: { title: "Работы на многоэтажных объектах", subtitle: "Отдельные строительные этапы на многоэтажных объектах в рамках согласованного проекта и объёма." },
  buildings: { title: "Жилое и нежилое строительство", subtitle: "Работы для жилых, коммерческих и производственных объектов — отдельные этапы или комплекс по задаче." },
  demolition: { title: "Демонтажные работы", subtitle: "Разбор конструкций и подготовка площадки к ремонту, реконструкции или следующему этапу строительства." },
  roofing: { title: "Кровельные работы", subtitle: "Монтаж и ремонт кровель, примыканий и водоотведения с учётом конструкции объекта." },
  facades: { title: "Фасадные работы", subtitle: "Подготовка оснований, утепление и наружная отделка в соответствии с проектом и условиями площадки." },
} as const;

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
