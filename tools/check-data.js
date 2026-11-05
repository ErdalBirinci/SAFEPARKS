#!/usr/bin/env node
/* Dependency-free data integrity check for the portal's source data.
   Usage: node tools/check-data.js */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
global.window = global;

[
  "data.js", "data-gov.js", "data-comp.js", "data-comp2.js", "data-priv.js",
  "data-arch.js", "data-risk.js", "data-ops.js", "data-gono.js", "data-links.js",
  "data-decisions.js", "docs.js", "docs2.js"
].forEach(function (file) {
  (0, eval)(fs.readFileSync(path.join(ROOT, "assets", "js", file), "utf8"));
});

const S = global.window.SP;
const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function need(condition, message) {
  if (!condition) fail(message);
}

function text(value) {
  return value && typeof value === "object" ? value.en && value.tr : typeof value === "string" && value.trim();
}

function uniqueIds(list, label, key) {
  const seen = {};
  (list || []).forEach(function (item, index) {
    const id = item && item[key || "id"];
    need(!!id, label + "[" + index + "] has no id");
    if (!id) return;
    need(!seen[id], label + " has a duplicate id: " + id);
    seen[id] = true;
  });
  return seen;
}

const partners = S.partners || [];
const cities = partners.filter(function (p) { return String(p.id).charAt(0) === "M"; });
const compliance = (S.compliance || []).concat(S.compliance2 || []);
const risks = S.risks || [];
const deliverables = S.deliverables || [];
const gates = S.gonoGates || [];
const gateItems = gates.reduce(function (all, gate) { return all.concat(gate.items || []); }, []);
const actions = (S.plan90 || []).reduce(function (all, phase) { return all.concat(phase.actions || []); }, []);
const wp3Total = (S.wp3Budget || []).reduce(function (sum, row) { return sum + Number(row.amount || 0); }, 0);
const wp3PM = (S.wp3Tasks || []).reduce(function (sum, task) { return sum + Number(task.pm || 0); }, 0);

need(partners.length === 12, "expected 12 partners, found " + partners.length);
need(cities.length === 7, "expected 7 pilot cities, found " + cities.length);
need(compliance.length === 49, "expected 49 compliance controls, found " + compliance.length);
need(risks.length === 22, "expected 22 risks, found " + risks.length);
need(deliverables.length === 12, "expected 12 deliverables, found " + deliverables.length);
need(actions.length === 19, "expected 19 first-90-days actions, found " + actions.length);
need(gates.length === 8, "expected 8 go/no-go gates, found " + gates.length);
need(gateItems.length === 34, "expected 34 go/no-go items, found " + gateItems.length);
need((S.decisions || []).length === 6, "expected 6 decisions, found " + (S.decisions || []).length);
need((S.docs || []).length === 10, "expected 10 policy documents, found " + (S.docs || []).length);
need((S.frameworks || []).length === 7, "expected 7 frameworks, found " + (S.frameworks || []).length);
need((S.kpis || []).length === 14, "expected 14 KPIs, found " + (S.kpis || []).length);
need(wp3Total === 285000, "WP3 budget must total 285000, found " + wp3Total);
need(wp3PM === 19, "WP3 must total 19 person-months, found " + wp3PM);

uniqueIds(partners, "partners");
uniqueIds(compliance, "compliance");
uniqueIds(risks, "risks");
uniqueIds(deliverables, "deliverables");
uniqueIds(gates, "gonoGates");
uniqueIds(gateItems, "gonoItems");
uniqueIds(S.decisions || [], "decisions");
uniqueIds(S.docs || [], "docs");

const frameworks = {};
(S.frameworks || []).forEach(function (f) { frameworks[f.id] = true; });
const riskIds = {};
risks.forEach(function (risk) {
  need(!!risk.id, "risk has no id");
  riskIds[risk.id] = true;
  need(text(risk.t), "risk " + risk.id + " has no bilingual title");
  need(text(risk.d), "risk " + risk.id + " has no bilingual description");
  need(text(risk.m), "risk " + risk.id + " has no treatment");
  need(Number(risk.l) >= 1 && Number(risk.l) <= 5, "risk " + risk.id + " likelihood is outside 1..5");
  need(Number(risk.i) >= 1 && Number(risk.i) <= 5, "risk " + risk.id + " impact is outside 1..5");
  need(["open", "treating", "accepted", "closed"].indexOf(risk.status) >= 0, "risk " + risk.id + " has an invalid status");
  need(!!risk.owner, "risk " + risk.id + " has no owner");
  need(!!risk.due, "risk " + risk.id + " has no due milestone");
});

compliance.forEach(function (control) {
  need(!!control.id, "compliance control has no id");
  need(!!control.fw, "control " + control.id + " has no framework");
  if (control.fw) need(!!frameworks[control.fw], "control " + control.id + " references unknown framework " + control.fw);
  need(text(control.req), "control " + control.id + " has no bilingual requirement");
  need(text(control.ctrl), "control " + control.id + " has no bilingual control text");
  need(["ready", "partial", "gap", "na"].indexOf(control.status) >= 0, "control " + control.id + " has an invalid status");
  need(!!control.owner, "control " + control.id + " has no owner");
});

deliverables.forEach(function (deliverable) {
  need(text(deliverable.t), "deliverable " + deliverable.id + " has no bilingual title");
  need(/^M\d+$/.test(String(deliverable.due || "")), "deliverable " + deliverable.id + " has no valid due month");
  need(["planned", "in-progress", "done"].indexOf(deliverable.status) >= 0, "deliverable " + deliverable.id + " has an invalid status");
});

gateItems.forEach(function (item) {
  need(!!item.id, "go/no-go item has no id");
  need(typeof item.blocking === "boolean", "go/no-go item " + item.id + " has no blocking flag");
  need(text(item.req), "go/no-go item " + item.id + " has no bilingual requirement");
  need(!!item.owner, "go/no-go item " + item.id + " has no owner");
});

Object.keys(S.gonoByRisk || {}).forEach(function (rid) {
  need(!!riskIds[rid], "risk/gate link references unknown risk " + rid);
});

const compIds = {};
compliance.forEach(function (c) { compIds[c.id] = true; });
gateItems.forEach(function (item) {
  (item.links || []).forEach(function (link) {
    if (link && link.comp) need(!!compIds[link.comp], "go/no-go item " + item.id + " links unknown control " + link.comp);
    if (link && link.risk) need(!!riskIds[link.risk], "go/no-go item " + item.id + " links unknown risk " + link.risk);
  });
});

if (errors.length) {
  console.error("Data integrity check failed with " + errors.length + " error(s):");
  errors.forEach(function (error) { console.error("  - " + error); });
  process.exit(1);
}

console.log("Data integrity check passed:");
console.log("  " + partners.length + " partners · " + cities.length + " pilot cities · " + compliance.length + " controls");
console.log("  " + risks.length + " risks · " + deliverables.length + " deliverables · " + actions.length + " actions");
console.log("  " + gates.length + " gates · " + gateItems.length + " items · " + (S.decisions || []).length + " decisions");
console.log("  WP3 €" + wp3Total + " · " + wp3PM + " person-months");
if (warnings.length) warnings.forEach(function (warning) { console.warn("  WARNING: " + warning); });
