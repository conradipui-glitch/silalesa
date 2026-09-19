import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const source = await fs.readFile(path.join(root, "src/lib/repairGuideDecisions.ts"), "utf8");
const transpiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { materialAdvice, screedAdvice, renovationSteps } = await import(`data:text/javascript;charset=utf-8,${encodeURIComponent(transpiled)}`);
assert.equal(materialAdvice("", "", ""), null, "P02 must not assume initial values");
assert.match(materialAdvice("normal", "", "").heading, /оба/);
assert.match(materialAdvice("outside", "mineral", "paint").heading, /фасад/);
assert.match(materialAdvice("water", "mineral", "tile").explanation, /гидроизоляц/);
assert.match(materialAdvice("wet", "mineral", "tile").heading, /ванн/);
assert.match(materialAdvice("normal", "unknown", "tile").heading, /основан/);
assert.match(materialAdvice("normal", "complex", "tile").heading, /сложн/);
assert.match(materialAdvice("normal", "mineral", "tile").checks.join(" "), /плитк/);
assert.match(materialAdvice("normal", "mineral", "paint").checks.join(" "), /окраск/);
assert.match(materialAdvice("normal", "mineral", "wallpaper").checks.join(" "), /обои/);
assert.equal(screedAdvice("", "", ""), null, "S01 must not assume initial conditions");
for (const floor of ["ordinary", "heated", "wet", "limited", "project"]) assert.equal(screedAdvice(floor, "", "").checks.length, 3, `S01 ${floor} must be immediately useful`);
assert.match(screedAdvice("heated", "unknown", "wood").checks.join(" "), /влажност/);
assert.match(screedAdvice("wet", "restricted", "tile").checks.join(" "), /логистик/);
assert.match(screedAdvice("limited", "", "").heading, /нагрузк/);
const regular = renovationSteps("wet-first", false, false, false);
assert.deepEqual(regular.map((step) => step.id), ["scope", "plaster", "floorprep", "screed", "finish"]);
assert.ok(!regular[1].title.includes("потолок"), "do not infer a ceiling");
const customised = renovationSteps("wet-first", true, true, true);
assert.match(customised[1].title, /потолок/);
assert.match(customised.flatMap((step) => step.checks).join(" "), /гидроизоляц/);
assert.match(customised.flatMap((step) => step.checks).join(" "), /тёплый пол/);
assert.ok(renovationSteps("screed-ready", false, false, false).some((step) => step.id === "protection"));
assert.ok(renovationSteps("dry-lining", true, false, false).some((step) => step.id === "lining"));
for (const route of ["wet-first", "screed-ready", "dry-lining"]) {
  const steps = renovationSteps(route, false, false, false);
  assert.equal(new Set(steps.map((step) => step.id)).size, steps.length, `${route}: unique stage IDs`);
  for (const stage of steps) assert.ok(stage.title && stage.detail && stage.checks.length && stage.handoff);
}
const overrides = JSON.parse(await fs.readFile(path.join(root, "src/data/seo-page-overrides-r3.json"), "utf8"));
assert.equal(overrides.length, 3);
assert.equal(new Set(overrides.map((page) => page.slug)).size, 3);
const components = ["PlasterMaterialGuide.tsx", "ScreedComparisonGuide.tsx", "RenovationSequenceGuide.tsx"];
for (const name of components) {
  const content = await fs.readFile(path.join(root, "src/components", name), "utf8");
  for (const required of ["RepairGuideAction", 'useState', 'aria-live="polite"']) assert.ok(content.includes(required), `${name} missing ${required}`);
}
const material = await fs.readFile(path.join(root, "src/components/PlasterMaterialGuide.tsx"), "utf8");
const screed = await fs.readFile(path.join(root, "src/components/ScreedComparisonGuide.tsx"), "utf8");
const sequence = await fs.readFile(path.join(root, "src/components/RenovationSequenceGuide.tsx"), "utf8");
for (const component of [material, screed]) assert.ok(component.includes('useState<') && component.includes('>("")'), "initial form values must be unanswered");
assert.ok(sequence.includes('useState<Route | "">("")'), "S04 must not pretend a scenario was selected");
assert.ok(!sequence.includes('route === "dry-lining" && <label'), "S04 should not offer a meaningless ceiling control in GKL flow");
const contact = await fs.readFile(path.join(root, "src/components/RepairGuideAction.tsx"), "utf8");
for (const phrase of ["whatsappUrl(message)", "mehanizirovannaya-shtukaturka-omsk", "polusuhaya-styazhka-omsk", "Страница:", "context"]) assert.ok(contact.includes(phrase), `Missing CTA feature ${phrase}`);
const products = await fs.readFile(path.join(root, "src/data/products.ts"), "utf8");
const number = products.match(/whatsapp:\s*"(\d+)"/);
assert.ok(number, "canonical contact number");
const sitemap = await fs.readFile(path.join(root, "dist/sitemap.xml"), "utf8");
for (const page of overrides) {
  const html = await fs.readFile(path.join(root, "dist", page.slug, "index.html"), "utf8");
  for (const requirement of ["data-prerendered", page.lead, page.summary[0], page.sections[0].heading, "FAQPage", "Article", 'rel="canonical"', `https://wa.me/${number[1]}?text=`, "Обсудить", "Открыть страницу услуги"]) assert.ok(html.includes(requirement), `R3 static HTML missing ${requirement} in ${page.slug}`);
  assert.ok(html.includes(`https://conradipui-glitch.github.io/silalesa/${page.slug}/`));
  assert.ok(sitemap.includes(`${page.slug}/`));
  assert.ok(html.includes(`content="${page.description}"`), `outdated metadata ${page.slug}`);
  for (const section of page.sections) assert.ok(html.includes(section.heading), `Missing R3 section ${section.heading}`);
  for (const service of page.slug.includes("polusuhaya-ili") ? ["polusuhaya-styazhka-omsk"] : page.slug.includes("chto-snachala") ? ["mehanizirovannaya-shtukaturka-omsk", "polusuhaya-styazhka-omsk"] : ["mehanizirovannaya-shtukaturka-omsk"]) {
    assert.ok(html.includes(`${service}/`));
    await fs.access(path.join(root, "dist", service, "index.html"));
  }
}
console.log("R3 PASS: material, floor and route scenarios; unanswered defaults, stages, CTA and 3 static/SEO pages.");
