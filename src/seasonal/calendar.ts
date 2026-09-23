import { useEffect, useState } from "react";

export type SeasonalTheme = "halloween";

const OMSK_TIMEZONE = "Asia/Omsk";
const TEMP_HALLOWEEN_TEST_START = "2026-09-23";
const TEMP_HALLOWEEN_TEST_END = "2026-09-30";

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

function dateKey({ year, month, day }: ReturnType<typeof datePartsInOmsk>) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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
  const key = dateKey(parts);

  // Временный предпросмотр на опубликованном сайте. После 30.09 тема сама отключится,
  // а затем включится уже по постоянному календарю 20.10–02.11 каждого года.
  if (key >= TEMP_HALLOWEEN_TEST_START && key <= TEMP_HALLOWEEN_TEST_END) return "halloween";
  if (halloweenCalendarWindow(parts)) return "halloween";

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
