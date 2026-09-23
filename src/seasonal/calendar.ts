import { useEffect, useState } from "react";

export type SeasonalTheme = "halloween";

const OMSK_TIMEZONE = "Asia/Omsk";
const AUTOMATIC_HALLOWEEN_ENABLED = false;

function datePartsInOmsk(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: OMSK_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { year: read("year"), month: read("month"), day: read("day") };
}


function halloweenCalendarWindow({ month, day }: ReturnType<typeof datePartsInOmsk>) {
  const mmdd = month * 100 + day;
  return mmdd >= 1020 && mmdd <= 1102;
}

export function resolveSeasonalTheme(now = new Date(), search = ""): SeasonalTheme | null {
  const params = new URLSearchParams(search);
  const forced = params.get("decor");
  if (forced === "off") return null;
  if (forced === "halloween") return "halloween";

  const parts = datePartsInOmsk(now);
  // Автоматический календарь будет включён после визуального согласования версии 2.
  if (AUTOMATIC_HALLOWEEN_ENABLED && halloweenCalendarWindow(parts)) return "halloween";

  return null;
}

export function useSeasonalTheme() {
  const [theme, setTheme] = useState<SeasonalTheme | null>(null);

  useEffect(() => {
    const update = () => setTheme(resolveSeasonalTheme(new Date(), window.location.search));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return theme;
}
