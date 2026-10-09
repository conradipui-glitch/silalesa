import { useState } from "react";
import { ArrowIcon, LogoMark, PhoneIcon } from "../components/Brand";
import { company, contactDraftUrl } from "../data/products";
import { offerContexts, type OfferCode } from "../data/offerContext";
import { Link, useRouter } from "../lib/router";
import { track, useDocumentTitle } from "../lib/utils";

const services = Object.entries(offerContexts) as [OfferCode, (typeof offerContexts)[OfferCode]][];

/**
 * Campaign attribution stays inside the opt-in contact draft.
 * Only allow published channel labels and short non-personal campaign slugs.
 * No persistent identity, IP, referral URL, message body or phone stored.
 */
const supportedSources: Record<string, string> = {
  telegram: "Telegram", tg: "Telegram", vk: "ВКонтакте", vkontakte: "ВКонтакте",
  ok: "Одноклассники", yandex: "Яндекс", direct: "Яндекс Директ",
  qr: "QR", partner: "Партнёрская публикация",
};
const supportedMediums = new Set(["social", "post", "story", "cpc", "paid_social", "organic_social", "referral", "qr"]);
function campaignFromSearch(search: string) {
  const params = new URLSearchParams(search);
  const sourceCode = (params.get("utm_source") ?? "").toLowerCase();
  const medium = (params.get("utm_medium") ?? "").toLowerCase();
  const campaign = params.get("utm_campaign") ?? "";
  if (!Object.prototype.hasOwnProperty.call(supportedSources, sourceCode)) return null;
  const label = supportedSources[sourceCode];
  const checkedMedium = supportedMediums.has(medium) ? medium : null;
  const checkedCampaign = /^[a-zA-Z0-9_-]{1,48}$/.test(campaign) ? campaign : null;
  return { source: sourceCode, label, medium: checkedMedium, campaign: checkedCampaign };
}

const briefGuidance: Partial<Record<OfferCode, { note: string; placeholder: string }>> = {
  roofing: {
    note: "Новая кровля или ремонт? Полезно указать покрытие, примерную площадь и приложить фотографии проблемного участка.",
    placeholder: "Монтаж или ремонт? Тип покрытия, состояние кровли, есть ли фото протечки...",
  },
  screed: {
    note: "Для обсуждения стяжки пригодятся площадь, этаж, состояние основания, предполагаемая толщина и будущее покрытие.",
    placeholder: "Площадь, этаж, основание, толщина, тёплый пол и будущее покрытие, если известны...",
  },
  facades: {
    note: "Для фасадных работ уточните тип здания, материал стен, площадь, нужна ли теплоизоляция и как организован доступ.",
    placeholder: "Тип здания, состояние стен, фасадная отделка или утепление, площадь и доступ...",
  },
};

function limited(value: string, max = 600) {
  return value.trim().replace(/[\r\n]+/g, " ").slice(0, max);
}

export function ServiceBriefPage({ code }: { code: OfferCode | null }) {
  const { navigate } = useRouter();
  const [location, setLocation] = useState("");
  const [volume, setVolume] = useState("");
  const [timing, setTiming] = useState("");
  const [details, setDetails] = useState("");

  const service = code ? offerContexts[code] : null;
  const name = service?.title ?? "Строительные работы";
  const campaign = campaignFromSearch(typeof window === "undefined" ? "" : window.location.search);
  const guidance = code ? briefGuidance[code] : null;
  useDocumentTitle(`${name} в Омске — заявка на расчёт | Сила Леса`);

  const message = [
    "Здравствуйте! Хочу обсудить строительные работы в Омске.",
    `Направление: ${name}.`,
    location.trim() ? `Объект: ${limited(location, 120)}.` : "",
    volume.trim() ? `Площадь / объём: ${limited(volume, 120)}.` : "",
    timing.trim() ? `Когда планируем: ${timing}.` : "",
    details.trim() ? `Описание задачи: ${limited(details)}.` : "",
    campaign ? `Публикация: ${campaign.label}${campaign.campaign ? " / " + campaign.campaign : ""}.` : "",
    "Подскажите, какие данные нужны для предварительного расчёта и что будет входить в смету.",
  ].filter(Boolean).join("\n");

  return (
    <div className="min-h-dvh bg-bark-950 text-cream-50" data-qa="social-brief" data-service-code={code ?? "all"}>
      <div className="mx-auto max-w-5xl px-4 pb-14 pt-5 sm:px-6 sm:pt-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-cream-50/10 pb-5">
          <Link to="/" className="inline-flex min-h-11 items-center gap-3 rounded-lg focus-visible:outline-offset-4" aria-label="Сила Леса — открыть основной сайт">
            <LogoMark size={44} />
            <span className="font-display text-base font-semibold tracking-tight text-cream-50">СИЛА ЛЕСА</span>
          </Link>
          <span className="rounded-full border border-cream-50/15 bg-cream-50/[0.05] px-4 py-2 text-xs font-medium text-cream-200">
            Омск · Строительные работы
          </span>
        </header>

        <main className="pt-9 sm:pt-12" aria-labelledby="brief-title">
          <div className="grid items-start gap-8 lg:grid-cols-[.95fr_1.05fr] lg:gap-10">
            <section className="lg:sticky lg:top-8">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-cedar-300">Короткая заявка на расчёт</p>
              <h1 id="brief-title" className="mt-5 text-balance font-display text-[32px] font-semibold leading-[1.11] tracking-tight text-cream-50 sm:text-[42px]">
                {name} <span className="text-cedar-300">в Омске</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-cream-200/90">
                {service?.subtitle ?? "Выберите работы и опишите объект. Подготовим сообщение для MAX или звонка. Можно обсудить отдельный этап или комплекс работ."}
              </p>
              <div className="mt-7 rounded-2xl border border-cream-50/10 bg-bark-900/70 p-5">
                <h2 className="font-display text-base font-medium text-cream-50">Как это работает</h2>
                <ol className="mt-4 space-y-3 text-sm leading-relaxed text-cream-200/90">
                  <li><span className="mr-3 font-semibold text-cedar-300">01</span> Вы выбираете вид работ.</li>
                  <li><span className="mr-3 font-semibold text-cedar-300">02</span> Указываете известные данные объекта.</li>
                  <li><span className="mr-3 font-semibold text-cedar-300">03</span> Проверяете сообщение и отправляете его сами.</li>
                </ol>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-cream-300/80">
                Это не автоматическая смета и не бронирование бригады. Стоимость, сроки и состав работ определяются после уточнения задачи.
              </p>
            </section>

            <section className="rounded-[28px] bg-cream-50 p-5 text-bark-950 shadow-card sm:p-7" aria-label="Данные для обращения">
              <h2 className="font-display text-xl font-semibold leading-tight sm:text-2xl">Расскажите о задаче</h2>
              <p className="mt-2 text-sm leading-relaxed text-bark-700">Заполните только то, что уже знаете. Обязательных полей нет.</p>
              {guidance && (
                <p data-qa="brief-service-guidance" className="mt-4 rounded-xl border border-cedar-600/20 bg-cedar-500/10 p-4 text-sm leading-relaxed text-bark-800">
                  <strong className="font-semibold">Что поможет обсудить расчёт:</strong> {guidance.note}
                </p>
              )}
              <div className="mt-6 space-y-5">
                <div>
                  <label htmlFor="brief-service" className="mb-2 block text-sm font-semibold text-bark-950">Вид работ</label>
                  <select id="brief-service" value={code ?? ""} onChange={(event) => {
                    const next = event.target.value ? `/brief/${event.target.value}/` : "/brief/";
                    // Preserve only safe campaign tags across service switches.
                    const tags = new URLSearchParams();
                    if (campaign) {
                      tags.set("utm_source", campaign.source);
                      if (campaign.medium) tags.set("utm_medium", campaign.medium);
                      if (campaign.campaign) tags.set("utm_campaign", campaign.campaign);
                    }
                    navigate(next + (tags.size ? "?" + tags.toString() : ""));
                  }} className="min-h-12 w-full cursor-pointer rounded-xl border border-bark-950/20 bg-white px-4 text-base text-bark-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-500">
                    <option value="">Несколько работ / пока не определился</option>
                    {services.map(([serviceCode, entry]) => <option key={serviceCode} value={serviceCode}>{entry.title}</option>)}
                  </select>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="brief-location" className="mb-2 block text-sm font-semibold text-bark-950">Где находится объект</label>
                    <input id="brief-location" value={location} maxLength={120} onChange={(event) => setLocation(event.target.value)} placeholder="Омск или населённый пункт" autoComplete="off" className="min-h-12 w-full rounded-xl border border-bark-950/20 bg-white px-4 text-base text-bark-950 placeholder:text-bark-600/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-500" />
                  </div>
                  <div>
                    <label htmlFor="brief-volume" className="mb-2 block text-sm font-semibold text-bark-950">Объём, если известен</label>
                    <input id="brief-volume" value={volume} maxLength={120} onChange={(event) => setVolume(event.target.value)} placeholder="Например, 80 м²" autoComplete="off" className="min-h-12 w-full rounded-xl border border-bark-950/20 bg-white px-4 text-base text-bark-950 placeholder:text-bark-600/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-500" />
                  </div>
                </div>
                <div>
                  <label htmlFor="brief-timing" className="mb-2 block text-sm font-semibold text-bark-950">Когда планируете работы</label>
                  <select id="brief-timing" value={timing} onChange={(event) => setTiming(event.target.value)} className="min-h-12 w-full cursor-pointer rounded-xl border border-bark-950/20 bg-white px-4 text-base text-bark-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-500">
                    <option value="">Пока не определились</option>
                    <option value="В ближайшее время">В ближайшее время</option>
                    <option value="В течение 1–3 месяцев">В течение 1–3 месяцев</option>
                    <option value="Позднее">Позднее</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="brief-details" className="mb-2 block text-sm font-semibold text-bark-950">Что ещё важно знать</label>
                  <textarea id="brief-details" value={details} maxLength={600} rows={4} onChange={(event) => setDetails(event.target.value)} placeholder={guidance?.placeholder ?? "Состояние площадки, проект, особые условия, что требуется сделать..."} className="w-full resize-y rounded-xl border border-bark-950/20 bg-white px-4 py-3 text-base text-bark-950 placeholder:text-bark-600/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cedar-500" />
                </div>
              </div>

              <details className="mt-5 rounded-xl border border-bark-950/10 bg-white/80 px-4 py-3">
                <summary className="cursor-pointer text-sm font-semibold text-bark-950">Посмотреть текст сообщения</summary>
                <p data-qa="brief-message-preview" className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-bark-700">{message}</p>
              </details>

              <a data-qa="brief-whatsapp" href={contactDraftUrl(message)} target="_blank" rel="noopener noreferrer" onClick={() => track("cta_click", { type: "contact_choice", where: "social-brief", service: code ?? "all", campaignSource: campaign?.source ?? "unattributed", campaignMedium: campaign?.medium ?? undefined, campaignName: campaign?.campaign ?? undefined })} className="mt-6 inline-flex min-h-13 w-full touch-manipulation items-center justify-center gap-3 rounded-full bg-cedar-500 px-6 py-3 text-center text-base font-semibold text-bark-950 shadow-[0_10px_25px_-15px_rgba(90,46,6,.6)] transition-colors hover:bg-cedar-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bark-950">
                Выбрать способ связи <ArrowIcon />
              </a>
              <p className="mt-3 text-center text-xs leading-relaxed text-bark-700">
                Подготовленный текст можно скопировать и самостоятельно отправить в MAX. На сайте данные не сохраняются на сервере.
              </p>
              <a href={`tel:${company.phonePrimary.tel}`} onClick={() => track("cta_click", { type: "call", where: "social-brief", service: code ?? "all", campaignSource: campaign?.source ?? "unattributed", campaignMedium: campaign?.medium ?? undefined, campaignName: campaign?.campaign ?? undefined })} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-bark-950/20 px-5 text-sm font-semibold text-bark-950 hover:bg-bark-950/[0.05]">
                <PhoneIcon /> Позвонить: {company.phonePrimary.display}
              </a>
            </section>
          </div>
        </main>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-cream-50/10 pt-5 text-sm text-cream-200/85">
          <p>«Сила Леса» · строительные работы в Омске</p>
          <Link to="/services/" className="inline-flex min-h-11 items-center gap-2 rounded-md font-medium text-cedar-300 hover:text-cedar-200">Все направления <ArrowIcon /></Link>
        </footer>
      </div>
    </div>
  );
}
