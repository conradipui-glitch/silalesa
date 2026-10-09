/** Planning geometry, not a technical specification or a binding contractor quote. */
export const PLASTER_START_PRICE = 550; // published Silalesa starting price, ₽/m²
export const MAX_PLASTER_ROOMS = 10;
export const MAX_PLASTER_OPENINGS = 30;

export type PlasterOpening = {
  id: number;
  label: string;
  width: number; // metres
  height: number; // metres
  count: number;
};

export type PlasterRoom = {
  id: number;
  name: string;
  length: number; // metres
  width: number; // metres
  height: number; // metres
  thickness: number; // mm, user's planning assumption
  openings: PlasterOpening[];
};

export type PlasterMaterial = {
  enabled: boolean;
  consumption: number; // kg / m² at 10 mm, from package
  bagWeight: number; // kg/bag, from package
  reserve: number; // 0-20%, planning allowance
};

export const initialPlasterRooms: PlasterRoom[] = [{
  id: 1, name: "Комната", length: 5, width: 4, height: 2.7, thickness: 15,
  openings: [
    { id: 1, label: "Окно", width: 1.5, height: 1, count: 1 },
    { id: 2, label: "Дверь", width: 0.9, height: 2, count: 1 },
  ],
}];

export const initialPlasterMaterial: PlasterMaterial = {
  enabled: false, consumption: 8.5, bagWeight: 30, reserve: 5,
};

const inRange = (value: number, min: number, max: number) =>
  Number.isFinite(value) && value >= min && value <= max;

export function plasterRoomMetrics(room: PlasterRoom) {
  const dimensionsValid = inRange(room.length, 0.1, 100)
    && inRange(room.width, 0.1, 100)
    && inRange(room.height, 1, 20)
    && inRange(room.thickness, 1, 150);
  const openingsValid = Array.isArray(room.openings)
    && room.openings.length <= MAX_PLASTER_OPENINGS
    && room.openings.every((opening) =>
      inRange(opening.width, 0.1, 20) && inRange(opening.height, 0.1, 20)
      && Number.isInteger(opening.count) && inRange(opening.count, 1, 30)
      );
  // Opening width can run along either of two room dimensions.
  const openingDimensionsValid = Array.isArray(room.openings)
    && room.openings.every((opening) =>
      (opening.width <= room.length || opening.width <= room.width)
      && opening.height <= room.height);
  const grossArea = dimensionsValid ? 2 * (room.length + room.width) * room.height : 0;
  const openingsArea = openingsValid && openingDimensionsValid
    ? room.openings.reduce((sum, opening) => sum + opening.width * opening.height * opening.count, 0)
    : 0;
  const valid = dimensionsValid && openingsValid && openingDimensionsValid
    && openingsArea < grossArea && grossArea > 0;
  const netArea = valid ? grossArea - openingsArea : 0;
  return {
    valid, grossArea: valid ? grossArea : 0, openingsArea: valid ? openingsArea : 0,
    netArea, volume: netArea * room.thickness / 1000,
  };
}

export function calculatePlaster(rooms: PlasterRoom[], material: PlasterMaterial = initialPlasterMaterial) {
  const metrics = rooms.map((room) => ({ room, ...plasterRoomMetrics(room) }));
  const valid = rooms.length > 0 && rooms.length <= MAX_PLASTER_ROOMS
    && metrics.every((value) => value.valid)
    && (!material.enabled || (
      inRange(material.consumption, 0.01, 100)
      && inRange(material.bagWeight, 0.1, 100)
      && inRange(material.reserve, 0, 20)
    ));
  const grossArea = metrics.reduce((sum, item) => sum + item.grossArea, 0);
  const openingsArea = metrics.reduce((sum, item) => sum + item.openingsArea, 0);
  const netArea = metrics.reduce((sum, item) => sum + item.netArea, 0);
  const volume = metrics.reduce((sum, item) => sum + item.volume, 0);
  const materialKg = material.enabled && valid
    ? metrics.reduce((sum, item) => sum + item.netArea * (item.room.thickness / 10) * material.consumption, 0)
      * (1 + material.reserve / 100)
    : null;
  const bags = materialKg === null ? null : Math.ceil(materialKg / material.bagWeight);
  return {
    valid, metrics, grossArea, openingsArea, netArea, volume,
    averageThickness: netArea > 0 ? volume * 1000 / netArea : 0,
    budgetFrom: netArea * PLASTER_START_PRICE,
    materialKg, bags,
  };
}

export const plasterNumber = (value: number, digits = 2) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: digits }).format(value);

export function describePlasterEstimate(rooms: PlasterRoom[], material: PlasterMaterial): string {
  const calc = calculatePlaster(rooms, material);
  if (!calc.valid) return "Нужны корректные размеры, толщина и параметры проёмов.";
  const lines = calc.metrics.map(({ room, netArea, openingsArea, volume }) =>
    `• ${room.name || "Помещение"}: стены ${plasterNumber(netArea)} м² после вычета ${plasterNumber(openingsArea)} м² проёмов, слой ${plasterNumber(room.thickness, 1)} мм, объём ${plasterNumber(volume, 4)} м³.`);
  return [
    "Здравствуйте! Нужен расчёт механизированной штукатурки стен в Омске.",
    ...lines,
    `Площадь до вычета: ${plasterNumber(calc.grossArea)} м²; проёмы: ${plasterNumber(calc.openingsArea)} м²; под штукатурку: ${plasterNumber(calc.netArea)} м².`,
    `Геометрический объём слоя: ${plasterNumber(calc.volume, 4)} м³.`,
    `Предварительный ориентир работ — от ${plasterNumber(calc.budgetFrom, 0)} ₽ по стартовой ставке ${PLASTER_START_PRICE} ₽/м²; это не смета.`,
    ...(material.enabled ? [`По введённому паспортному расходу ${plasterNumber(material.consumption)} кг/м² на 10 мм: ${plasterNumber(calc.materialKg!, 1)} кг с запасом ${material.reserve}% ≈ ${calc.bags} мешков по ${plasterNumber(material.bagWeight)} кг (не подтверждённая комплектация).`] : []),
    "Нужно уточнить основание, состав работ, материал, доступ и итоговую стоимость для объекта. Откосы отдельно не учитывались.",
    "Калькулятор: https://conradipui-glitch.github.io/silalesa/kalkulyator-shtukaturki-sten/",
  ].join("\n");
}
