/** Client-side planning geometry, NOT a material recipe or contractor quote. */
export type ThicknessMode = "average" | "corners";

export type ScreedRoom = {
  id: number;
  name: string;
  length: number; // metres
  width: number; // metres
  thickness: number; // mm, measured proposed average layer
  mode: ThicknessMode;
  corners: [number, number, number, number]; // layer thickness at four corners, mm
};

export const SCREED_START_PRICE = 600; // existing Silalesa published "от 600 ₽/м²"
export const DEFAULT_RESERVE_PERCENT = 5;
export const MAX_ROOMS = 12;

export const initialScreedRooms: ScreedRoom[] = [
  { id: 1, name: "Гостиная", length: 5, width: 4, thickness: 50, mode: "average", corners: [50, 50, 50, 50] },
  { id: 2, name: "Спальня", length: 4, width: 3, thickness: 50, mode: "average", corners: [50, 50, 50, 50] },
];

export function validRoom(room: ScreedRoom): boolean {
  const measurements = room.mode === "corners" ? room.corners : [room.thickness];
  return Number.isFinite(room.length) && room.length > 0 && room.length <= 100
    && Number.isFinite(room.width) && room.width > 0 && room.width <= 100
    && measurements.every((x) => Number.isFinite(x) && x > 0 && x <= 400);
}

export function roomMetrics(room: ScreedRoom) {
  const area = validRoom(room) ? room.length * room.width : 0;
  // Four corner samples only give a rough average, not a full surface survey.
  const thickness = room.mode === "corners"
    ? room.corners.reduce((sum, val) => sum + val, 0) / 4
    : room.thickness;
  return { area, thickness, volume: area * thickness / 1000, valid: validRoom(room) };
}

export function calculateScreed(rooms: ScreedRoom[], reservePercent = DEFAULT_RESERVE_PERCENT) {
  const metrics = rooms.map((room) => ({ room, ...roomMetrics(room) }));
  const valid = rooms.length > 0 && rooms.length <= MAX_ROOMS && metrics.every((item) => item.valid)
    && Number.isFinite(reservePercent) && reservePercent >= 0 && reservePercent <= 20;
  const area = metrics.reduce((sum, item) => sum + item.area, 0);
  const volume = metrics.reduce((sum, item) => sum + item.volume, 0);
  const reserveVolume = volume * (1 + reservePercent / 100);
  return {
    valid, metrics, area, volume, reserveVolume,
    budgetFrom: area * SCREED_START_PRICE,
    averageThickness: area > 0 ? volume * 1000 / area : 0,
    reservePercent,
  };
}

export function formatScreedNumber(value: number, digits = 2): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: digits }).format(value);
}

export function describeScreedEstimate(rooms: ScreedRoom[], reservePercent = DEFAULT_RESERVE_PERCENT): string {
  const data = calculateScreed(rooms, reservePercent);
  if (!data.valid) return "Нужны корректные размеры и толщина для расчёта.";
  const details = data.metrics.map(({ room, area, thickness, volume }) =>
    `• ${room.name || "Помещение"}: ${formatScreedNumber(area)} м², средняя толщина ${formatScreedNumber(thickness, 1)} мм, объём ${formatScreedNumber(volume, 3)} м³`
  );
  return [
    "Здравствуйте! Нужен предварительный расчёт полусухой стяжки в Омске.",
    ...details,
    `Общая площадь: ${formatScreedNumber(data.area)} м².`,
    `Геометрический объём: ${formatScreedNumber(data.volume, 3)} м³; с запасом ${reservePercent}%: ${formatScreedNumber(data.reserveVolume, 3)} м³.`,
    `Ценовой ориентир от ${formatScreedNumber(data.budgetFrom, 0)} ₽ (по опубликованной стартовой ставке ${SCREED_START_PRICE} ₽/м²; не смета).`,
    "Уточните, пожалуйста, состав работ, доставку, условия и итоговую стоимость для объекта.",
    "Калькулятор: https://conradipui-glitch.github.io/silalesa/kalkulyator-styazhki-pola/",
  ].join("\n");
}
