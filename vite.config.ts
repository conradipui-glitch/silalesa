import path from "path";
import fs from "node:fs";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// На GitHub Pages проект живёт в /silalesa/. Локально Vite работает из корня.
const siteTargets = JSON.parse(fs.readFileSync(new URL("./config/site.json", import.meta.url), "utf8")) as { preview: { origin: string; basePath: string }; production: { basePath: string } };
const isProduction = process.env.SITE_TARGET === "production";
const siteOrigin = isProduction ? process.env.SITE_ORIGIN?.replace(/\/$/, "") : siteTargets.preview.origin;
if (!siteOrigin || !/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(siteOrigin)) throw new Error("SITE_ORIGIN must be set to the verified HTTPS client-owned domain for SITE_TARGET=production");
const siteBase = isProduction ? siteTargets.production.basePath : siteTargets.preview.basePath;
const siteUrl = siteOrigin + siteBase;
const base = isProduction ? siteBase : process.env.GITHUB_PAGES === "true" ? siteBase : "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    { name: "site-origin", transformIndexHtml(html: string) { return html.split("__SITE_URL__").join(siteUrl); } },
  ],
  define: {
    "import.meta.env.VITE_SITE_ORIGIN": JSON.stringify(siteOrigin),
    "import.meta.env.VITE_SITE_BASE_PATH": JSON.stringify(siteBase),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
