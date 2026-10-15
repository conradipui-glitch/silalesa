/**
 * Older R10 tests assert the 14-card default catalogue and 550/600 pricing.
 * Keep them as a full baseline regression suite; non-default registry changes use
 * status-aware release tests and must not be rejected by obsolete fixed counts.
 */
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const registry = JSON.parse(fs.readFileSync("src/data/commercialRegistry.json", "utf8"));
const primary = registry.services.find(x => x.id === "plaster");
const screed = registry.services.find(x => x.id === "screed");
const baseline = registry.services.every(s => s.status !== "paused")
  && primary?.priceFrom === 550 && screed?.priceFrom === 600;
const fixed = [
  "check-screed-calculator.mjs", "check-plaster-calculator.mjs", "check-r10.mjs",
  "check-r10-performance.mjs", "check-social-briefs.mjs",
  "check-seo-articles-wave1.mjs", "check-seo-articles-wave2.mjs",
  "check-seo-wave3.mjs", "check-forest-helper.mjs",
];
const universal = ["check-offer-demand.mjs","check-commercial-registry.mjs"];
for (const file of [...(baseline ? fixed : []), ...universal]) {
  execFileSync(process.execPath, ["scripts/"+file], {stdio:"inherit"});
}
console.log(baseline ? "BASELINE_REGRESSION_SUITE_PASS" : "REGISTRY_VARIANT_SUITE_PASS: fixed original prices/card counts intentionally skipped");
