/** Build-level adversarial smoke: pause one SEO service and another catalogue direction. */
import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const file="src/data/commercialRegistry.json";
const original=fs.readFileSync(file,"utf8");
try {
  const r=JSON.parse(original);
  for(const id of ["plaster","roofing"])r.services.find(s=>s.id===id).status="paused";
  fs.writeFileSync(file,JSON.stringify(r,null,2)+"\n");
  execFileSync("npm",["run","build"],{stdio:"inherit",env:process.env});
  const noindex=fs.readFileSync("dist/mehanizirovannaya-shtukaturka-omsk/index.html","utf8");
  const listing=fs.readFileSync("dist/services/index.html","utf8");
  const brief=fs.readFileSync("dist/brief/plaster/index.html","utf8");
  const map=fs.readFileSync("dist/sitemap.xml","utf8");
  assert.match(noindex,/noindex, follow/);
  assert.match(noindex,/Приём новых обращений временно приостановлен/);
  assert.ok(!map.includes("/mehanizirovannaya-shtukaturka-omsk/"));
  assert.ok(!listing.includes("<strong>Кровельные работы</strong>"));
  assert.match(brief,/приём обращений приостановлен/);
  console.log("PAUSED_SERVICES_RELEASE_SMOKE_PASS");
} finally {
  fs.writeFileSync(file,original);
}
