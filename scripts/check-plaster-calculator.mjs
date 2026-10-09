import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

const input = fs.readFileSync("src/lib/plasterCalculator.ts", "utf8");
const js = ts.transpileModule(input, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const lib = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
const near = (got, expected, label) => assert.ok(Math.abs(got - expected) < 1e-8, `${label}: got ${got}, expected ${expected}`);

const room = lib.initialPlasterRooms[0];
const result = lib.calculatePlaster([room]);
assert.equal(result.valid, true);
near(result.grossArea, 48.6, "Gross rectangular walls");
near(result.openingsArea, 3.3, "Window and door deductions");
near(result.netArea, 45.3, "Net wall area");
near(result.volume, .6795, "15mm layer volume");
near(result.averageThickness, 15, "Average weighted depth");
near(result.budgetFrom, 24915, "Only documented 550 rub per square metre");

const withMaterial = lib.calculatePlaster([room], { enabled: true, consumption: 8.5, bagWeight: 30, reserve: 5 });
near(withMaterial.materialKg, 606.45375, "Manufacturer consumption scaled to 15mm with reserve");
assert.equal(withMaterial.bags, 21, "Bags rounded up");
assert.equal(result.bags, null, "Never invent bag count without user-supplied package values");
const unfilled = lib.calculatePlaster([room], { enabled: true, consumption: 0, bagWeight: 0, reserve: 5 });
assert.equal(unfilled.valid, true, "Geometry works even if material fields are blank");
assert.equal(unfilled.materialValid, false, "Bag result needs actual manufacturer data");
assert.equal(unfilled.bags, null, "Empty manufacturer data cannot produce bag count");
const added = { ...room, id: 2, name: "Спальня", length: 4, width: 3, height: 2.5, thickness: 20, openings: [] };
const both = lib.calculatePlaster([room, added]);
near(both.grossArea, 83.6, "Multiroom gross");
near(both.netArea, 80.3, "Multiroom net");
near(both.volume, 1.3795, "Different room thicknesses");
near(both.budgetFrom, 44165, "Multiroom price");

assert.equal(lib.calculatePlaster([{ ...room, height: 0 }]).valid, false);
assert.equal(lib.calculatePlaster([{ ...room, thickness: Infinity }]).valid, false);
assert.equal(lib.calculatePlaster([{ ...room, openings: [{ id: 9, label: "Impossible", width: 8, height: 1, count: 1 }] }]).valid, false);
assert.equal(lib.calculatePlaster([{ ...room, openings: [{ id: 9, label: "Impossible", width: 1, height: 1, count: 300 }] }]).valid, false);
assert.equal(lib.calculatePlaster([{ ...room, openings: [{ id: 9, label: "Too many doors", width: 2, height: 2, count: 30 }] }]).valid, false);
assert.equal(lib.calculatePlaster([room], { enabled: true, consumption: 0, bagWeight: 30, reserve: 5 }).materialValid, false);
assert.equal(lib.calculatePlaster([room], { enabled: true, consumption: 8.5, bagWeight: 0, reserve: 5 }).materialValid, false);
assert.equal(lib.calculatePlaster(Array.from({ length: 11 }, (_, i) => ({ ...room, id: i + 1 }))).valid, false);
const message = lib.describePlasterEstimate([room], { enabled: false, consumption: 8.5, bagWeight: 30, reserve: 5 });
assert.ok(message.includes("45,3") && message.includes("24") && message.includes("не смета"));
assert.ok(!message.includes("мешков"), "No unsupported bag claims in default report");
console.log("PLASTER_CALCULATOR_MATH_PASS: room geometry, openings, depth, optional package consumption, rounded bags, bounds and transparent estimate.");
