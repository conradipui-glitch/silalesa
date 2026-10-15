import raw from "./commercialRegistry.json";

export type ServiceStatus = "primary" | "consultation" | "paused";
export type ServiceAction = "details" | "contact";
export type CommercialService = {
  id: string; title: string; group?: string; text?: string; accent?: string; requestHint?: string;
  status: ServiceStatus; landingSlug: string | null; priceFrom: number | null; priceUnit: string | null; action: ServiceAction;
};

// Single source of truth for catalogue, price display, status, and service landing availability.
export const commercialServices = raw.services as CommercialService[];
export const standaloneServices = raw.standalonePages as CommercialService[];
export const allCommercialServices = [...commercialServices, ...standaloneServices];

export function serviceBySlug(slug: string) {
  return allCommercialServices.find((service) => service.landingSlug === slug);
}
export function serviceByTitle(title: string) {
  return allCommercialServices.find((service) => service.title === title);
}
export function servicePriceLabel(service: CommercialService | undefined): string | null {
  return service?.priceFrom != null && service.priceUnit
    ? `от ${service.priceFrom.toLocaleString("ru-RU")} ₽/${service.priceUnit}`
    : null;
}
export const availableCommercialServices = commercialServices.filter((service) => service.status !== "paused");
export function serviceAvailabilityText(status: ServiceStatus) {
  if (status === "primary") return "Основное направление";
  if (status === "consultation") return "По согласованию";
  return "Приём обращений приостановлен";
}
