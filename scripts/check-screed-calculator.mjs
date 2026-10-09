// Domain regression: test the exact TypeScript calculator logic, not copied formulas.
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

const source = fs.readFileSync("src/lib/screedCalculator.ts", "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const lib = await import("data:text/javascript;base64," + Buffer.from(compiled).toString("base64"));
const assertNear = (actual, expected, label) => assert.ok(Math.abs(actual - expected) < 1e-9, `${label}: ${actual} != ${expected}`);

const initial = lib.calculateScreed(lib.initialScreedRooms, 5);
assert.equal(initial.valid, true);
assertNear(initial.area, 32, "Two room area");
assertNear(initial.volume, 1.6, "Two room layer volume");
assertNear(initial.reserveVolume, 1.68, "5% reserve volume");
assertNear(initial.averageThickness, 50, "Weighted average thickness");
assertNear(initial.budgetFrom, 19200, "Published 600 ₽/m² starting budget");

const corners = { ...lib.initialScreedRooms[0], mode: "corners", corners: [40, 50, 60, 70] };
const cornersResult = lib.calculateScreed([corners], 0);
assert.equal(cornersResult.valid, true);
assertNear(cornersResult.averageThickness, 55, "Four corner estimate");
assertNear(cornersResult.volume, 1.1, "Four corner volume");

const asymmetric = { ...lib.initialScreedRooms[1], thickness: 90 };
const weighted = lib.calculateScreed([corners, asymmetric], 5);
assertNear(weighted.area, 32, "Asymmetric room area");
assertNear(weighted.averageThickness, 68.125, "Area-weighted thickness");
assertNear(weighted.volume, 2.18, "Mixed rooms volume");
assert.equal(lib.calculateScreed([{ ...corners, length: 0 }]).valid, false);
assert.equal(lib.calculateScreed([{ ...corners, corners: [20, 30, 40, Infinity] }]).valid, false);
assert.equal(lib.calculateScreed(lib.initialScreedRooms, -1).valid, false);
assert.equal(lib.calculateScreed(lib.initialScreedRooms, 21).valid, false);
assert.equal(lib.calculateScreed(Array.from({length: 13}, (_, i) => ({ ...corners, id: i + 1 }))).valid, false);
assert.ok(lib.describeScreedEstimate(lib.initialScreedRooms).includes("19 200") || lib.describeScreedEstimate(lib.initialScreedRooms).includes("19 200"));
assert.ok(lib.describeScreedEstimate(lib.initialScreedRooms).includes("не смета"));
console.log("SCREED_CALCULATOR_MATH_PASS: two rooms, 4 corner thicknesses, weighted layer, optional reserve, 600 ₽/m² baseline, invalid inputs.");
