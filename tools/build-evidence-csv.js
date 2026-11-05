#!/usr/bin/env node
/*
   Evidence ledger CSV from the exported portal state.
   Usage: node tools/build-evidence-csv.js [--state safeparks-brief-state.json] [--city M1] [--out SAFE-PARKS-Evidence-Ledger.csv]

   Reads the same compact state file as the brief and go/no-go builders (export "brief state" in the
   portal) and writes one row per compliance control: bilingual requirement, owner, responsible
   municipality, pilot wave, status, evidence reference, evidence note and whether anything is recorded.
   `--city M1` scopes every row to that pilot municipality and its wave; without it the ledger carries
   the aggregate all-city labels. The portal's "Download evidence ledger (CSV)" button produces the
   identical file through assets/js/evidence-csv.js.
*/
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const args = process.argv.slice(2);
let statePath = "safeparks-brief-state.json";
let outPath = "SAFE-PARKS-Evidence-Ledger.csv";
let cityArg = "";
let outExplicit = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--state") statePath = args[++i];
  else if (args[i] === "--city") cityArg = String(args[++i] || "").toUpperCase();
  else if (args[i] === "--out") { outPath = args[++i]; outExplicit = true; }
  else if (args[i] === "--help" || args[i] === "-h") {
    console.log("Usage: node tools/build-evidence-csv.js [--state safeparks-brief-state.json] [--city M1] [--out SAFE-PARKS-Evidence-Ledger.csv]");
    process.exit(0);
  } else {
    console.error("Unknown argument: " + args[i]);
    process.exit(2);
  }
}

global.window = global;
["data.js", "data-comp.js", "data-comp2.js", "evidence-csv.js"].forEach(function (f) {
  (0, eval)(fs.readFileSync(path.join(ROOT, "assets", "js", f), "utf8"));
});
const SP = global.window.SP;
const rows = SP.allCompliance || [].concat(SP.compliance || [], SP.compliance2 || []);
const cities = SP.pilotCities || [];
if (cityArg && !cities.some(function (c) { return c.id === cityArg; })) {
  console.error("unknown city: " + cityArg + " — available: " + cities.map(function (c) { return c.id; }).join(", "));
  process.exit(1);
}
if (cityArg && !outExplicit) outPath = "SAFE-PARKS-Evidence-Ledger-" + cityArg + ".csv";

if (!fs.existsSync(statePath)) {
  console.error("State file not found: " + statePath);
  console.error("Export “brief state (JSON)” from the portal first, or pass --state <file>.");
  process.exit(1);
}
let state;
try {
  state = JSON.parse(fs.readFileSync(statePath, "utf8"));
} catch (e) {
  console.error("Cannot parse " + statePath + ": " + e.message);
  process.exit(1);
}
/* The same command accepts either the compact export itself or a tracker-state wrapper. */
const data = state && state.state && state.state.data ? state.state.data : state;
const notes = data.notes || {};
const comp = data.comp || {};

const scope = SP.evidenceScope(cityArg);
const csv = SP.buildEvidenceCsv(rows, notes, function (id) { return comp[id] || ""; }, { city: cityArg });
fs.writeFileSync(outPath, csv, "utf8");

const recorded = rows.filter(function (r) {
  return notes["comp|" + r.id + "|ref"] || notes["comp|" + r.id + "|note"];
}).length;
const withRef = rows.filter(function (r) { return notes["comp|" + r.id + "|ref"]; }).length;
const verified = rows.filter(function (r) {
  return notes["comp|" + r.id + "|verifiedOn"] || notes["comp|" + r.id + "|verifiedBy"];
}).length;
console.log("Wrote " + outPath);
console.log("Controls " + rows.length + " · evidence recorded " + recorded + "/" + rows.length +
  " · with file reference " + withRef + " · verified " + verified);
console.log("Scope " + scope.municipality + " · " + scope.wave + " · state " + statePath);
