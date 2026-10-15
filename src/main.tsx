import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// The counter ID is provided by the site owner during launch. No ID => no analytics script.
const metrikaId = Number(import.meta.env.VITE_YM_COUNTER_ID || 0);
if (Number.isSafeInteger(metrikaId) && metrikaId > 0) {
  window.ym = window.ym || ((...args: unknown[]) => {
    const queued = window.ym as ((...args: unknown[]) => void) & { a?: unknown[][] };
    (queued.a ??= []).push(args);
  });
  window.ym(metrikaId, "init", { clickmap: false, trackLinks: true, webvisor: false, accurateTrackBounce: true });
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://mc.yandex.ru/metrika/tag.js";
  document.head.appendChild(script);
}

const rootElement = document.getElementById("root")!;
if (rootElement.dataset.prerendered === "true") rootElement.replaceChildren();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
