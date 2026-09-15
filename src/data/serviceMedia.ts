import drillingBefore from "../assets/img/iteration-5-1/drilling-before.webp";
import drillingAfter from "../assets/img/iteration-5-1/drilling-after.webp";
import plasterBefore from "../assets/img/iteration-5-1/plaster-before.webp";
import plasterAfter from "../assets/img/iteration-5-1/plaster-after.webp";
import screedBefore from "../assets/img/iteration-5-1/screed-before.webp";
import screedAfter from "../assets/img/iteration-5-1/screed-after.webp";

export type ServiceComparison = {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
};

export const serviceComparisonBySlug: Record<string, ServiceComparison> = {
  "burenie-skvazhiny-omsk": {
    before: drillingBefore,
    after: drillingAfter,
    beforeAlt: "Буровая установка и мастер во время бурения скважины на участке",
    afterAlt: "Готовая скважина на участке с подачей воды",
  },
  "mehanizirovannaya-shtukaturka-omsk": {
    before: plasterBefore,
    after: plasterAfter,
    beforeAlt: "Мастера наносят механизированную штукатурку на стены и потолок помещения",
    afterAlt: "Помещение после завершения штукатурных работ",
  },
  "polusuhaya-styazhka-omsk": {
    before: screedBefore,
    after: screedAfter,
    beforeAlt: "Мастер выравнивает стяжку пола над системой тёплого пола",
    afterAlt: "Готовый ровный пол после устройства стяжки",
  },
};
