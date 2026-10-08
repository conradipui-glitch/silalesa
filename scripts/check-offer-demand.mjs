import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config=JSON.parse(fs.readFileSync(path.join(ROOT,"src/data/seasonal-demand.json"),"utf8"));
assert.equal(config.region,"Омская область");
assert.equal(config.source,null,"Real demand source must remain empty until collected");
assert.equal(config.verified,false,"Do not activate unmeasured seasonality");
assert.deepEqual(config.leaderByMonth,{},"Do not guess month winners");

const services=[
  "cottages","monolith","masonry","plaster","screed","concrete-screed","topping",
  "metalworks","hangars","multistory","buildings","demolition","roofing","facades",
];
// Synthetic fixture exists only in a temporary test file, never in production configuration.
const rows=["month,service,queries,region,phrase"];
for(const year of [2024,2025]) for(let month=1;month<=12;month++) for(const service of services){
  const value=month===1&&service==="monolith"?300:100;
  rows.push(`${year}-${String(month).padStart(2,"0")},${service},${value},Омская область,тестовая фраза ${service}`);
}
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"silalesa-demand-"));
try {
  const file=path.join(tmp,"test.csv");
  fs.writeFileSync(file,rows.join("\n")+"\n");
  const out=execFileSync(process.execPath,["scripts/compile-seasonal-demand.mjs",file,"--evidence-ref=automated-test-only","--dry-run"],{cwd:ROOT,encoding:"utf8"});
  const demand=JSON.parse(out);
  assert.equal(demand.leaderByMonth["01"],"monolith","Strong season should yield an offer");
  assert.ok(!demand.leaderByMonth["02"],"Equal/ambiguous season must remain general");
  assert.equal(Object.keys(demand.leaderByMonth).length,1);
  assert.ok(!fs.readFileSync(path.join(ROOT,"src/data/seasonal-demand.json"),"utf8").includes("automated-test-only"),"Synthetic test data must never publish");
  fs.writeFileSync(file,rows.join("\n").replace("Омская область","Москва")+"\n");
  assert.throws(()=>execFileSync(process.execPath,["scripts/compile-seasonal-demand.mjs",file,"--evidence-ref=automated-test-only","--dry-run"],{cwd:ROOT,stdio:"pipe"}),/Command failed/);
  console.log("OFFER DEMAND PASS: disabled until evidence, 14-service/24-month validation, ambiguous-month fallback, region guard");
} finally {
  fs.rmSync(tmp,{recursive:true,force:true});
}
