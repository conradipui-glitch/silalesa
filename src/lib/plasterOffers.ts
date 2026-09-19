export type Method = "machine" | "hand";
export type EstimateMode = "single" | "compare";
export type Scope = "unknown" | "included" | "separate";
export type OfferPair = { machine: Scope; hand: Scope };

export const estimateItems = [
  { id: "preparation", name: "Подготовка и защита", hint: "Очистка основания, укрытие соседних поверхностей и демонтаж, если нужен." },
  { id: "primer", name: "Грунтование и специальные слои", hint: "Только по требованиям выбранной смеси и состоянию основания." },
  { id: "geometry", name: "Маяки, углы и примыкания", hint: "Плоскость, откосы и сложные участки — с отдельным объёмом, если требуется." },
  { id: "mix", name: "Смесь и расчёт расхода", hint: "Марка, разрешённый способ нанесения и поправки при перепадах." },
  { id: "delivery", name: "Доставка и подъём материалов", hint: "Подача на этаж, разгрузка и маршруты доступа." },
  { id: "equipment", name: "Оборудование и подключения", hint: "Для станции — размещение, вода и питание; для ручного способа — фактические инструменты и логистика." },
  { id: "finish", name: "Выравнивание и обработка", hint: "Подрезка, затирка и требуемая готовность под плитку, обои или окраску." },
  { id: "handoff", name: "Уборка, уход и приёмка", hint: "Защита, критерии результата и ответственность до передачи следующей бригаде." },
] as const;

export function initialOffers(): Record<string, OfferPair> {
  return Object.fromEntries(estimateItems.map((item) => [item.id, { machine: "unknown", hand: "unknown" }])) as Record<string, OfferPair>;
}

// Only values explicitly transcribed from an actual offer may enter the real check.
// This example is synthetic and is never loaded automatically.
export function exampleOffers(): Record<string, OfferPair> {
  const offers = Object.fromEntries(estimateItems.map((item) => [item.id, { machine: "included", hand: "included" }])) as Record<string, OfferPair>;
  offers.delivery = { machine: "separate", hand: "separate" };
  offers.equipment = { machine: "separate", hand: "included" };
  return offers;
}

export function summarizeOffers(offers: Record<string, OfferPair>, baseline: readonly boolean[], mode: EstimateMode = "compare") {
  const methods: readonly Method[] = mode === "single" ? ["machine"] : ["machine", "hand"];
  const unresolved = estimateItems.filter((item) => methods.some((method) => !offers[item.id] || offers[item.id][method] === "unknown"));
  const separate = estimateItems.filter((item) => methods.some((method) => offers[item.id]?.[method] === "separate"));
  const different = mode === "compare"
    ? estimateItems.filter((item) => offers[item.id] && offers[item.id].machine !== "unknown" && offers[item.id].hand !== "unknown" && offers[item.id].machine !== offers[item.id].hand)
    : [];
  const clarified = estimateItems.length - unresolved.length;
  const baselineMissing = mode === "compare" ? baseline.filter((value) => !value).length : 0;
  const compositionReady = unresolved.length === 0 && baselineMissing === 0;
  // A known separately charged item is a known scope, NOT a known total cost.
  // Different inclusion labels can also be reconciled once amounts are added.
  const status: "empty" | "incomplete" | "baseline" | "additions" | "complete" =
    clarified === 0 ? "empty" : unresolved.length ? "incomplete" : baselineMissing ? "baseline" : separate.length ? "additions" : "complete";
  return { unresolved, separate, different, clarified, baselineMissing, compositionReady, status, mode };
}
