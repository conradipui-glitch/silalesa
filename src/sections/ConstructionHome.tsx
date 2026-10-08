import { ArrowIcon, CheckIcon, LinkButton, PhoneIcon, SectionHead } from "../components/Brand";
import { company, whatsappUrl } from "../data/products";
import { Link } from "../lib/router";
import { track } from "../lib/utils";
const heroConstruction = `${import.meta.env.BASE_URL}assets/construction-hero-mixed.webp`;
const plasterPhotoBase = "https://images.unsplash.com/photo-1761986757577-140af8859587?auto=format&fit=crop&fm=webp&q=80";
const screedPhotoBase = "https://images.unsplash.com/photo-1743130940796-7a8e6e8b998e?auto=format&fit=crop&fm=webp&q=80";
const plasterPhoto = `${plasterPhotoBase}&w=1400`;
const screedPhoto = `${screedPhotoBase}&w=1400`;
const plasterPhotoSrcSet = [640, 960, 1400].map((width) => `${plasterPhotoBase}&w=${width} ${width}w`).join(", ");
const screedPhotoSrcSet = [640, 960, 1400].map((width) => `${screedPhotoBase}&w=${width} ${width}w`).join(", ");

type ServiceGroup = "Генподряд" | "Конструктив" | "Отделка и полы" | "Спецработы";

type ConstructionService = {
  title: string;
  group: ServiceGroup;
  text: string;
  accent?: string;
};

export const constructionServices: ConstructionService[] = [
  { title: "Коттеджи под ключ", group: "Генподряд", text: "Организация полного цикла строительства частного дома — от подготовительных работ до внешнего контура и отделочных этапов.", accent: "Под ключ" },
  { title: "Жилое и нежилое строительство", group: "Генподряд", text: "Частные, коммерческие и производственные объекты с возможностью вести весь комплекс работ или отдельный этап." },
  { title: "Возведение многоэтажных сооружений и зданий", group: "Генподряд", text: "Комплекс общестроительных работ для многоэтажных объектов в составе согласованного проекта и графика." },
  { title: "Строительство ангаров", group: "Генподряд", text: "Каркас, ограждающие конструкции и сопутствующие работы для складских и производственных зданий." },
  { title: "Монолитные работы", group: "Конструктив", text: "Фундаменты, плиты, стены, колонны, перекрытия и другие железобетонные конструкции по проекту." },
  { title: "Кладочные работы", group: "Конструктив", text: "Кладка из блока, кирпича и других стеновых материалов с привязкой к проектной геометрии объекта." },
  { title: "Металлоконструкции", group: "Конструктив", text: "Изготовление и монтаж металлических элементов и каркасов для строительных и производственных задач." },
  { title: "Механизированная штукатурка", group: "Отделка и полы", text: "Машинное нанесение штукатурных составов для выравнивания стен на жилых и коммерческих объектах.", accent: "Ровные стены" },
  { title: "Полусухая стяжка", group: "Отделка и полы", text: "Устройство ровного основания пола механизированным способом с подготовкой под последующие покрытия.", accent: "Ровное основание" },
  { title: "Бетонная стяжка", group: "Отделка и полы", text: "Устройство цементно-бетонного основания с подбором решения под нагрузку и дальнейшую эксплуатацию." },
  { title: "Промышленные полы (топпинг)", group: "Отделка и полы", text: "Упрочнённые бетонные полы для складов, цехов, паркингов и других помещений с повышенной нагрузкой." },
  { title: "Кровельные работы", group: "Спецработы", text: "Монтаж и ремонт кровельных систем, узлов примыкания и водоотведения в составе общего комплекса." },
  { title: "Фасадные работы", group: "Спецработы", text: "Устройство и обновление фасадов: подготовка основания, утепление и финишные решения по проекту." },
  { title: "Демонтажные работы", group: "Спецработы", text: "Разбор конструкций и подготовка площадки к следующему этапу строительства или реконструкции." },
];

const serviceGroups: { title: ServiceGroup; id: string; intro: string }[] = [
  { title: "Генподряд", id: "services-general", intro: "Весь объект, новое здание или строительство по этапам." },
  { title: "Конструктив", id: "services-structure", intro: "Основания, несущие конструкции, стены и каркасы." },
  { title: "Отделка и полы", id: "services-finishing", intro: "Подготовка стен и полов для дальнейшей отделки и эксплуатации." },
  { title: "Спецработы", id: "services-special", intro: "Кровля, фасады и подготовка объекта к следующему этапу." },
];

const detailedServicePages: Partial<Record<string, string>> = {
  "Механизированная штукатурка": "/mehanizirovannaya-shtukaturka-omsk/",
  "Полусухая стяжка": "/polusuhaya-styazhka-omsk/",
};

const processSteps = [
  { n: "01", title: "Задача и исходные данные", text: "Получаем проект, объёмы, адрес объекта и желаемые сроки. Если проект ещё формируется — фиксируем, что нужно уточнить до сметы." },
  { n: "02", title: "Осмотр и объёмы", text: "Проверяем условия площадки, доступ техники, фактические размеры и ограничения, которые влияют на технологию и стоимость." },
  { n: "03", title: "Смета и этапность", text: "Разбиваем работы на понятные этапы: конструктив, коробка, инженерно-подготовительные и отделочные работы." },
  { n: "04", title: "Производство работ", text: "Организуем людей, материалы и последовательность операций в рамках согласованного объёма." },
  { n: "05", title: "Приёмка этапа", text: "Сверяем выполненный объём с согласованной задачей и переходим к следующему этапу либо закрываем работы." },
];

function ServiceGrid({ standalone = false }: { standalone?: boolean }) {
  return (
    <section id="services" className={standalone ? "bg-bark-950 pb-24 pt-28 sm:pb-28 sm:pt-32" : "scroll-mt-20 bg-bark-950 py-20 sm:py-24"} aria-labelledby="construction-services-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
          <SectionHead
            index={standalone ? "Строительные работы · Омск" : "01 — Направления"}
            title={<span id="construction-services-title">Строительные работы под вашу задачу</span>}
            lead="От частного дома до производственного объекта. Выберите нужный комплекс или конкретный этап."
          />
          <p className="reveal max-w-md text-base leading-relaxed text-cream-300/80 lg:justify-self-end">
            Не знаете, с какого направления начать? Пришлите описание объекта — поможем определить состав работ для предварительного расчёта.
          </p>
        </div>

        <nav className="mt-9 flex flex-wrap gap-2" aria-label="Группы строительных работ">
          {serviceGroups.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cream-50/15 bg-cream-50/[0.04] px-4 text-sm font-medium text-cream-100 transition-colors hover:border-cedar-300/60 hover:bg-cream-50/10 focus-visible:outline-offset-2"
            >
              {group.title}
              <span className="text-xs text-cedar-300">{constructionServices.filter((service) => service.group === group.title).length}</span>
            </a>
          ))}
        </nav>

        {serviceGroups.map((group, groupIndex) => (
          <div key={group.id} id={group.id} className="scroll-mt-24 mt-12 sm:mt-14" data-qa="service-group">
            <div className="mb-5 flex flex-col gap-3 border-b border-cream-50/10 pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
              <div className="flex items-baseline gap-4">
                <span className="font-display text-sm text-cedar-300">0{groupIndex + 1}</span>
                <h3 className="font-display text-xl font-medium text-cream-50 sm:text-2xl">{group.title}</h3>
              </div>
              <p className="max-w-lg text-base leading-relaxed text-cream-300/80">{group.intro}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {constructionServices.filter((service) => service.group === group.title).map((service, index) => {
                const detailPath = detailedServicePages[service.title];
                return (
                  <article
                    key={service.title}
                    className="reveal group flex h-full flex-col rounded-3xl border border-cream-50/10 bg-bark-900 p-6 transition-colors hover:border-cedar-400/35 hover:bg-bark-800"
                  >
                    <div className="flex min-h-6 items-start justify-between gap-3">
                      <span className="font-display text-xs text-cream-300/75">{String(index + 1).padStart(2, "0")}</span>
                      {service.accent && <span className="rounded-full bg-cedar-500/12 px-3 py-1 text-xs text-cedar-300">{service.accent}</span>}
                    </div>
                    <h4 className="mt-4 font-display text-lg font-medium leading-snug text-cream-50 sm:text-xl">{service.title}</h4>
                    <p className="mt-3 flex-1 text-base leading-relaxed text-cream-300/80">{service.text}</p>
                    <div className="mt-6 border-t border-cream-50/10 pt-2">
                      {detailPath ? (
                        <Link
                          to={detailPath}
                          className="inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-md text-sm font-medium text-cedar-300 transition-colors hover:text-cedar-200"
                          aria-label={`Подробнее об услуге «${service.title}»`}
                          onClick={() => track("service_detail_click", { service: service.title, where: standalone ? "services-page" : "services-grid" })}
                        >
                          Подробнее и расчёт <ArrowIcon />
                        </Link>
                      ) : (
                        <a
                          href={whatsappUrl(`Здравствуйте! Интересует направление «${service.title}». Хочу обсудить объём работ и предварительный расчёт.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 w-full items-center justify-between gap-3 rounded-md text-sm font-medium text-cedar-300 transition-colors hover:text-cedar-200"
                          aria-label={`Обсудить работы: ${service.title}`}
                          onClick={() => track("cta_click", { type: "whatsapp", service: service.title, where: standalone ? "services-page" : "services-grid" })}
                        >
                          Обсудить работы <ArrowIcon />
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}

        <div className="reveal mt-12 flex flex-col gap-4 rounded-3xl border border-cedar-400/25 bg-cedar-500/[0.07] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h3 className="font-display text-lg text-cream-50">Несколько видов работ на одном объекте?</h3>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-cream-300/80">
              Расскажите об объекте целиком — обсудим последовательность и какие данные нужны для расчёта.
            </p>
          </div>
          <LinkButton
            to={whatsappUrl("Здравствуйте! Нужен комплекс строительных работ. Хочу прислать данные объекта для предварительного расчёта.")}
            external
            className="shrink-0"
            onClick={() => track("cta_click", { type: "whatsapp", where: standalone ? "services-page" : "services-grid" })}
          >
            Отправить задачу <ArrowIcon />
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

export function ConstructionServicesPage() {
  return <ServiceGrid standalone />;
}

export function ConstructionHome() {
  return (
    <>
      <section className="relative overflow-hidden bg-bark-900 pt-24 sm:pt-28 lg:pt-32" aria-labelledby="construction-hero-title">
        <div className="absolute inset-0 grid-paper opacity-55 [mask-image:radial-gradient(75%_70%_at_28%_20%,#000,transparent)]" aria-hidden="true" />
        <div className="absolute -left-24 top-24 h-96 w-96 rounded-full bg-moss-500/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-20 top-0 h-[440px] w-[440px] rounded-full bg-cedar-500/10 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 xl:grid-cols-[1.04fr_.96fr] xl:gap-12">
            <div data-qa="hero-copy">
              <p className="reveal flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-cedar-300/90">
                <span className="h-px w-8 bg-cedar-400" aria-hidden="true" />
                Омск · строительные работы полного цикла
              </p>
              <h1 id="construction-hero-title" className="reveal mt-6 text-balance font-display text-[36px] font-semibold leading-[1.03] tracking-tight text-cream-50 sm:text-5xl lg:text-[54px] xl:text-[62px]" style={{ ["--reveal-delay" as string]: "70ms" }}>
                Строительство <span className="text-cedar-400">под ключ</span> — от коттеджа до многоэтажного объекта
              </h1>
              <p className="reveal mt-6 max-w-2xl text-base leading-relaxed text-cream-200/85 sm:text-lg" style={{ ["--reveal-delay" as string]: "140ms" }}>
                Строим жилые, коммерческие и производственные объекты: берём весь комплекс работ или подключаемся на нужном этапе — от монолита и кладки до фасада, кровли и чистого основания под отделку.
              </p>

              <div className="reveal mt-8 flex flex-wrap items-center gap-3" style={{ ["--reveal-delay" as string]: "210ms" }}>
                <LinkButton
                  to={whatsappUrl("Здравствуйте! Хочу обсудить строительный объект и получить предварительный расчёт.")}
                  external
                  size="lg"
                  onClick={() => track("cta_click", { type: "whatsapp", where: "construction-hero" })}
                >
                  Обсудить объект <ArrowIcon />
                </LinkButton>
                <LinkButton to="/#services" variant="ghost" size="lg" onClick={() => track("cta_click", { type: "services", where: "construction-hero" })}>
                  Все направления
                </LinkButton>
              </div>

              <dl className="reveal mt-10 grid max-w-2xl grid-cols-3 gap-3 border-t border-cream-50/10 pt-6" style={{ ["--reveal-delay" as string]: "280ms" }}>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-cream-300/75">Направлений</dt>
                  <dd className="mt-1 font-display text-xl text-cream-50 sm:text-2xl">14</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-cream-300/75">Формат</dt>
                  <dd className="mt-1 font-display text-base text-cream-50 sm:text-xl">под ключ / этап</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-cream-300/75">Объекты</dt>
                  <dd className="mt-1 font-display text-base text-cream-50 sm:text-xl">жилые / нежилые</dd>
                </div>
              </dl>
            </div>

            <div data-qa="hero-media" className="reveal relative" style={{ ["--reveal-delay" as string]: "170ms" }}>
              <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-cream-50/10 bg-bark-800 shadow-card">
                <img data-construction-hero src={heroConstruction} alt="Строительство современного объекта: монолит, кладка и бригада на площадке" className="h-full w-full object-cover" width={1280} height={801} fetchPriority="high" />
                <div className="absolute inset-0 bg-gradient-to-t from-bark-950/75 via-bark-950/5 to-transparent" aria-hidden="true" />
                <div data-qa="hero-overlay-cards" className="absolute inset-x-5 bottom-5 hidden gap-3 sm:grid sm:grid-cols-2">
                  <div data-qa="hero-card-private" className="rounded-2xl border border-cream-50/10 bg-bark-950/88 p-4 backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-cedar-300">Частное строительство</p>
                    <p className="mt-1 font-display text-sm text-cream-50">Коттеджи · дома · фасады · кровля</p>
                  </div>
                  <div data-qa="hero-card-commercial" className="rounded-2xl border border-cream-50/10 bg-bark-950/75 p-4 backdrop-blur">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-cedar-300">Коммерческие объекты</p>
                    <p className="mt-1 font-display text-sm text-cream-50">Ангары · монолит · металл · промполы</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-14 border-y border-cream-50/10 bg-bark-950/60 py-4">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-x-8 gap-y-2 px-4 text-sm text-cream-200/85 sm:px-6 lg:px-8">
            <span>Коттеджи и дома</span>
            <span>Монолит и кладка</span>
            <span>Ангары и металлоконструкции</span>
            <span>Штукатурка, стяжка и промышленные полы</span>
            <span>Кровля, фасад и демонтаж</span>
          </div>
        </div>
      </section>

      <ServiceGrid />

      <section id="format" className="scroll-mt-20 bg-cream-50 py-20 text-bark-950 sm:py-28" aria-labelledby="format-title">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:gap-16 lg:px-8">
          <div>
            <SectionHead
              light
              index="02 — Формат работы"
              title={<span id="format-title">Можно отдать весь объект или один сложный этап</span>}
              lead="Можно передать нам весь комплекс работ или привлечь команду только на нужный этап — с заранее согласованным объёмом, сроками и точками приёмки."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="reveal rounded-3xl border border-bark-950/10 bg-white p-6 sm:p-7">
              <p className="text-xs uppercase tracking-[0.2em] text-cedar-700">Под ключ</p>
              <h3 className="mt-4 font-display text-2xl font-medium">Один подрядчик на весь контур</h3>
              <ul className="mt-6 space-y-4 text-base leading-relaxed text-bark-700">
                {["Комплектуем этапы в одну последовательность работ", "Сводим конструктив, коробку и отделочные этапы", "Согласуем объём и точки приёмки до начала работ"].map((item) => (
                  <li key={item} className="flex gap-3"><CheckIcon className="mt-0.5 shrink-0 text-moss-600" />{item}</li>
                ))}
              </ul>
            </article>
            <article className="reveal rounded-3xl border border-bark-950/10 bg-bark-900 p-6 text-cream-50 sm:p-7" style={{ ["--reveal-delay" as string]: "80ms" }}>
              <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Отдельный этап</p>
              <h3 className="mt-4 font-display text-2xl font-medium">Подключаемся там, где нужны руки и технология</h3>
              <ul className="mt-6 space-y-4 text-base leading-relaxed text-cream-200/85">
                {["Монолит и кладка", "Штукатурка, стяжка и промышленные полы", "Металл, кровля, фасад или демонтаж"].map((item) => (
                  <li key={item} className="flex gap-3"><CheckIcon className="mt-0.5 shrink-0 text-cedar-300" />{item}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section id="process" className="scroll-mt-20 bg-bark-900 py-20 sm:py-28" aria-labelledby="process-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHead
            index="03 — От задачи к работам"
            title={<span id="process-title">Понятная последовательность до выхода на объект</span>}
            lead="Главная цель — быстро понять объём, границы ответственности и состав работ, прежде чем обсуждать итоговую стоимость."
          />
          <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-cream-50/8 bg-cream-50/8 lg:grid-cols-5">
            {processSteps.map((step, index) => (
              <li key={step.n} className="reveal bg-bark-900 p-6" style={{ ["--reveal-delay" as string]: `${index * 70}ms` }}>
                <span className="font-display text-sm text-cedar-300">{step.n}</span>
                <h3 className="mt-6 font-display text-lg leading-tight text-cream-50">{step.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-cream-300/80">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="specialties" className="scroll-mt-20 bg-bark-950 py-20 sm:py-28" aria-labelledby="specialties-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-end">
            <SectionHead
              index="04 — Отделка и полы"
              title={<span id="specialties-title">Штукатурка и стяжка — отдельно или в составе комплекса</span>}
              lead="Выполняем механизированную штукатурку и полусухую стяжку как самостоятельные работы для квартир, домов и коммерческих объектов."
            />
            <p className="reveal max-w-xl text-base leading-relaxed text-cream-300/80 lg:justify-self-end">
              Для крупных объектов эти работы можно включать в общий комплекс. Для частного заказчика — заказывать отдельно, без строительства всего здания.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <Link to="/mehanizirovannaya-shtukaturka-omsk/" data-qa="specialty-card" className="reveal group overflow-hidden rounded-3xl border border-cream-50/10 bg-bark-900">
              <div className="aspect-[16/9] overflow-hidden bg-bark-800">
                <img src={plasterPhoto} srcSet={plasterPhotoSrcSet} sizes="(min-width: 1024px) 50vw, 100vw" alt="Мастер наносит штукатурку на стену" referrerPolicy="no-referrer" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" decoding="async" width={1200} height={675} />
              </div>
              <div className="p-6 sm:p-7">
                <p className="text-xs uppercase tracking-[0.18em] text-cedar-300">Отделка стен</p>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <h3 className="font-display text-2xl text-cream-50">Механизированная штукатурка</h3>
                  <ArrowIcon className="shrink-0 text-cedar-300" />
                </div>
                <p className="mt-3 text-base leading-relaxed text-cream-300/80">Машинное нанесение и выравнивание стен с расчётом по площади, состоянию основания и условиям объекта.</p>
              </div>
            </Link>

            <Link to="/polusuhaya-styazhka-omsk/" data-qa="specialty-card" className="reveal group overflow-hidden rounded-3xl border border-cream-50/10 bg-bark-900" style={{ ["--reveal-delay" as string]: "80ms" }}>
              <div className="aspect-[16/9] overflow-hidden bg-bark-800">
                <img src={screedPhoto} srcSet={screedPhotoSrcSet} sizes="(min-width: 1024px) 50vw, 100vw" alt="Строители выравнивают бетонное основание пола" referrerPolicy="no-referrer" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy" decoding="async" width={1200} height={675} />
              </div>
              <div className="p-6 sm:p-7">
                <p className="text-xs uppercase tracking-[0.18em] text-cedar-300">Подготовка пола</p>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <h3 className="font-display text-2xl text-cream-50">Полусухая стяжка</h3>
                  <ArrowIcon className="shrink-0 text-cedar-300" />
                </div>
                <p className="mt-3 text-base leading-relaxed text-cream-300/80">Ровное основание под напольные покрытия с механизированной подачей смеси и выравниванием по отметкам.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-20 bg-cream-50 py-20 text-bark-950 sm:py-28" aria-labelledby="contact-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] bg-bark-900 p-7 text-cream-50 sm:p-10 lg:p-12">
            <div className="absolute inset-0 grid-paper opacity-35" aria-hidden="true" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cedar-300">Следующий шаг</p>
                <h2 id="contact-title" className="mt-4 max-w-3xl text-balance font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                  Пришлите проект, план или просто опишите объект
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-cream-300/80">
                  Для старта нужны тип объекта, адрес, ориентировочная площадь и перечень работ. Если исходных данных не хватает, подскажем, что уточнить для предварительного расчёта.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <LinkButton
                  to={whatsappUrl("Здравствуйте! Хочу отправить данные строительного объекта для предварительного расчёта.")}
                  external
                  size="lg"
                  onClick={() => track("cta_click", { type: "whatsapp", where: "construction-contact" })}
                >
                  Отправить объект <ArrowIcon />
                </LinkButton>
                <a
                  href={`tel:${company.phonePrimary.tel}`}
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-cream-50/20 px-7 text-base font-medium text-cream-50 transition-colors hover:bg-cream-50/8"
                  onClick={() => track("cta_click", { type: "call", where: "construction-contact" })}
                >
                  <PhoneIcon /> {company.phonePrimary.display}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
