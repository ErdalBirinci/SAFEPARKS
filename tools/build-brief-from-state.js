#!/usr/bin/env node
/*
   Build the state-driven deliverables from a portal state in one command.
   Usage:
     node tools/build-brief-from-state.js [url-or-file]
     node tools/build-brief-from-state.js --url https://example.org/safeparks-brief-state.json
     node tools/build-brief-from-state.js --state ./safeparks-brief-state.json

   With no source, the script uses safeparks-brief-state.json in the project root.
   An http(s) source is downloaded and saved as safeparks-brief-state.json; a local file is read,
   validated and copied to the same canonical path. The previous canonical state is backed up to
   safeparks-brief-state.previous.json and compared with the new state. build-brief.js --state,
   build-gono-decisions.js --state and build-evidence-csv.js --state are then run automatically.
*/
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const TARGET = path.join(ROOT, "safeparks-brief-state.json");
const BACKUP = path.join(ROOT, "safeparks-brief-state.previous.json");
const BUILD = path.join(__dirname, "build-brief.js");
const GONO_BUILD = path.join(__dirname, "build-gono-decisions.js");
const EVIDENCE_BUILD = path.join(__dirname, "build-evidence-csv.js");
const MAX_BYTES = 10 * 1024 * 1024;
const TIMEOUT_MS = 30000;
const FRAMEWORK_ORDER = [];
const FRAMEWORK_BY_CONTROL = {};
const RISK_BY_ID = {};
const DELIVERABLE_BY_ID = {};

/* The comparison uses the portal catalogue for framework and item labels. */
(function loadComparisonIndex() {
  try {
    global.window = global;
    ["data-comp.js", "data-comp2.js", "data-risk.js", "data-ops.js"].forEach(function (f) {
      (0, eval)(fs.readFileSync(path.join(__dirname, "..", "assets", "js", f), "utf8"));
    });
    const SP = global.window.SP || {};
    (SP.frameworks || []).forEach(function (f) {
      if (f && f.id) FRAMEWORK_ORDER.push(f.id);
    });
    (SP.compliance || []).concat(SP.compliance2 || []).forEach(function (row) {
      if (row && row.id && row.fw) FRAMEWORK_BY_CONTROL[row.id] = row.fw;
    });
    (SP.risks || []).forEach(function (row) {
      if (row && row.id) RISK_BY_ID[row.id] = row;
    });
    (SP.deliverables || []).forEach(function (row) {
      if (row && row.id) DELIVERABLE_BY_ID[row.id] = row;
    });
  } catch (e) {
    /* Fall back to IDs and section labels if the portal catalogue cannot be loaded. */
  }
})();

function usage() {
  console.log([
    "Usage:",
    "  node tools/build-brief-from-state.js [url-or-file]",
    "  node tools/build-brief-from-state.js --url <https-url>",
    "  node tools/build-brief-from-state.js --state <file>",
    "",
    "Downloads/reads a portal \"brief state\" export, saves it as",
    "safeparks-brief-state.json and regenerates the briefs, decision-table exports,",
    "go/no-go decision record and evidence ledger CSV from it.",
    "The previous canonical state is copied to safeparks-brief-state.previous.json",
    "and compared with the new state before the builds run. Changes are grouped by",
    "framework, with status changes separated from evidence additions/updates.",
    "With no argument it uses safeparks-brief-state.json in the project root."
  ].join("\n"));
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const DIFF_SECTIONS = ["comp", "risks", "deliv", "checks", "gono", "decisions", "cityRisks", "cityRiskMeta", "notes"];

function unwrapState(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value.state && value.state.data && typeof value.state.data === "object" && !Array.isArray(value.state.data)
    ? value.state.data
    : value;
}

function settingsOf(value) {
  if (!value || typeof value !== "object") return {};
  return value.settings || (value.state && value.state.settings) || {};
}

function exportedAtOf(value) {
  if (!value || typeof value !== "object") return "";
  return value.exportedAt ? String(value.exportedAt)
    : value.state && value.state.exportedAt ? String(value.state.exportedAt) : "";
}

function flatten(value, prefix, out) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    out[prefix] = value;
    return;
  }
  Object.keys(value).forEach(function (key) {
    const child = value[key];
    const next = prefix ? prefix + "." + key : key;
    if (child && typeof child === "object" && !Array.isArray(child)) flatten(child, next, out);
    else out[next] = child;
  });
}

function shortValue(value) {
  if (value === undefined) return "—";
  if (value === null) return "null";
  let text;
  if (typeof value === "string") text = value;
  else if (typeof value === "object") {
    try { text = JSON.stringify(value); } catch (e) { text = String(value); }
  } else text = String(value);
  if (!text) return "—";
  return text.length > 80 ? text.slice(0, 77) + "…" : text;
}

function isEmptyValue(value) {
  return value === undefined || value === null || (typeof value === "string" && !value.trim());
}

const SECTION_GROUPS = {
  risks: "Risk register",
  deliv: "Deliverables",
  checks: "90-day plan",
  gono: "Go/no-go gates",
  decisions: "Decisions",
  cityRisks: "City site scores",
  cityRiskMeta: "City site-risk records",
  settings: "Settings"
};
const EVIDENCE_LABELS = {
  note: "evidence note",
  ref: "evidence reference",
  verifiedOn: "verified on",
  verifiedBy: "verified by"
};
const OTHER_GROUP_ORDER = Object.keys(SECTION_GROUPS).map(function (key) { return SECTION_GROUPS[key]; }).concat(["Other notes"]);

function frameworkOf(controlId) {
  return FRAMEWORK_BY_CONTROL[controlId] || "Other";
}

function shortText(value, max) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

function describeChange(section, key, before, after) {
  if (section === "comp") {
    const id = key.slice(5);
    return { kind: "status", group: frameworkOf(id), label: id };
  }
  if (section === "notes") {
    const evidence = /^notes\.comp\|([^|]+)\|(note|ref|verifiedOn|verifiedBy)$/.exec(key);
    if (evidence) {
      return {
        kind: "evidence",
        group: frameworkOf(evidence[1]),
        label: evidence[1] + " · " + EVIDENCE_LABELS[evidence[2]],
        marker: isEmptyValue(before) && !isEmptyValue(after) ? "+" : isEmptyValue(after) ? "−" : "~"
      };
    }
    const gonoNote = /^notes\.gono\|([^|]+)$/.exec(key);
    if (gonoNote) {
      return { kind: "note", group: "Go/no-go gates", label: gonoNote[1] + " · sign-off note" };
    }
    return { kind: "note", group: "Other notes", label: key.slice(6) };
  }
  if (section === "risks") {
    const id = key.slice(6);
    const risk = RISK_BY_ID[id] || {};
    const context = [];
    if (risk.t && risk.t.en) context.push(shortText(risk.t.en, 58));
    if (risk.cat) context.push(risk.cat);
    if (risk.l && risk.i) context.push("L" + risk.l + "×I" + risk.i);
    if (risk.owner) context.push(risk.owner);
    return { kind: "status", group: "Risk register", label: id + (context.length ? " · " + context.join(" · ") : "") };
  }
  if (section === "deliv") {
    const id = key.slice(6);
    const deliverable = DELIVERABLE_BY_ID[id] || {};
    const context = [];
    if (deliverable.t && deliverable.t.en) context.push(shortText(deliverable.t.en, 58));
    if (deliverable.wp) context.push(deliverable.wp);
    if (deliverable.lead) context.push(shortText(deliverable.lead, 24));
    if (deliverable.due) context.push(deliverable.due);
    return { kind: "status", group: "Deliverables", label: id + (context.length ? " · " + context.join(" · ") : "") };
  }
  return { kind: "status", group: SECTION_GROUPS[section] || section, label: key.slice(section.length + 1) || key };
}

function compareStates(previous, current) {
  const before = unwrapState(previous), after = unwrapState(current);
  const result = { total: 0, counts: {}, details: [] };
  const sections = DIFF_SECTIONS.slice();
  sections.push("settings");
  sections.forEach(function (section) {
    const flatBefore = {}, flatAfter = {};
    flatten(section === "settings" ? settingsOf(previous) : before[section], section, flatBefore);
    flatten(section === "settings" ? settingsOf(current) : after[section], section, flatAfter);
    const keys = Object.keys(Object.assign({}, flatBefore, flatAfter));
    keys.forEach(function (key) {
      if (JSON.stringify(flatBefore[key]) === JSON.stringify(flatAfter[key])) return;
      result.total++;
      result.counts[section] = (result.counts[section] || 0) + 1;
      result.details.push(Object.assign(describeChange(section, key, flatBefore[key], flatAfter[key]), {
        key: key,
        before: shortValue(flatBefore[key]),
        after: shortValue(flatAfter[key])
      }));
    });
  });
  return result;
}

function groupChanges(changes) {
  const groups = {};
  changes.forEach(function (change) {
    if (!groups[change.group]) groups[change.group] = [];
    groups[change.group].push(change);
  });
  return Object.keys(groups).sort(function (a, b) {
    const ai = FRAMEWORK_ORDER.indexOf(a), bi = FRAMEWORK_ORDER.indexOf(b);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.localeCompare(b);
    const ao = OTHER_GROUP_ORDER.indexOf(a), bo = OTHER_GROUP_ORDER.indexOf(b);
    return (ao === -1 ? 99 : ao) - (bo === -1 ? 99 : bo) || a.localeCompare(b);
  }).map(function (group) {
    return { group: group, changes: groups[group] };
  });
}

function printGroupedChanges(title, changes, showMarker) {
  console.log("  " + title);
  groupChanges(changes).forEach(function (group) {
    console.log("    " + group.group + " (" + group.changes.length + ")");
    group.changes.forEach(function (change) {
      console.log("      " + (showMarker ? change.marker + " " : "") + change.label + ": " + change.before + " → " + change.after);
    });
  });
}

function printComparison(previous, current) {
  const diff = compareStates(previous, current);
  const beforeStamp = exportedAtOf(previous) || "unknown";
  const afterStamp = exportedAtOf(current) || "unknown";
  console.log("State comparison: " + (diff.total ? diff.total + " changes" : "no changes") +
    " · previous " + beforeStamp + " → new " + afterStamp);
  if (!diff.total) {
    console.log("  New state is identical to the previous version.");
    return;
  }
  const statusChanges = diff.details.filter(function (change) { return change.kind === "status"; });
  const evidenceChanges = diff.details.filter(function (change) { return change.kind === "evidence"; });
  const notes = diff.details.filter(function (change) { return change.kind === "note"; });
  console.log("  Status changes: " + statusChanges.length + " · Evidence added/updated: " + evidenceChanges.length +
    (notes.length ? " · Other notes: " + notes.length : ""));
  if (statusChanges.length) printGroupedChanges("STATUS CHANGES", statusChanges, false);
  if (evidenceChanges.length) printGroupedChanges("EVIDENCE ADDED / UPDATED", evidenceChanges, true);
  if (notes.length) printGroupedChanges("OTHER NOTES", notes, false);
}

function runBuild(label, script) {
  console.log(label + "...");
  const result = spawnSync(process.execPath, [script, "--state", TARGET], { cwd: ROOT, stdio: "inherit" });
  if (result.error) fail("Cannot start " + path.basename(script) + ": " + result.error.message);
  if (result.status !== 0) {
    console.error(path.basename(script) + " failed" + (result.signal ? " (" + result.signal + ")" : " with exit code " + result.status) + ".");
    process.exit(result.status || 1);
  }
}

function parseArgs(argv) {
  const out = { source: "", fromUrl: false, fromState: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
    if (arg === "--url" || arg === "--state") {
      if (out.source) fail("Only one state source can be given.");
      const value = argv[++i];
      if (!value) fail(arg + " requires a value.");
      out.source = value;
      if (arg === "--url") out.fromUrl = true;
      else out.fromState = true;
      continue;
    }
    if (arg.charAt(0) === "-") fail("Unknown option: " + arg);
    if (out.source) fail("Only one state source can be given.");
    out.source = arg;
  }
  return out;
}

async function downloadState(url) {
  if (typeof fetch !== "function") {
    fail("This script needs Node 18 or later for URL downloads.");
  }
  const controller = new AbortController();
  const timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);
  let response;
  try {
    response = await fetch(url, { redirect: "follow", signal: controller.signal });
  } catch (e) {
    clearTimeout(timer);
    const reason = e && e.name === "AbortError" ? "timed out after " + TIMEOUT_MS / 1000 + " s" : (e && e.message ? e.message : String(e));
    fail("Cannot download state: " + reason);
  }
  clearTimeout(timer);
  if (!response.ok) {
    fail("Cannot download state: HTTP " + response.status + " " + response.statusText);
  }
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_BYTES) {
    fail("State file is too large: " + declared + " bytes (limit " + MAX_BYTES + ").");
  }
  let buffer;
  try {
    buffer = Buffer.from(await response.arrayBuffer());
  } catch (e) {
    fail("Cannot read the downloaded state: " + (e && e.message ? e.message : String(e)));
  }
  if (buffer.length > MAX_BYTES) {
    fail("State file is too large: " + buffer.length + " bytes (limit " + MAX_BYTES + ").");
  }
  return buffer.toString("utf8");
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  const sourceArg = parsed.source || TARGET;
  const isUrl = /^https?:\/\//i.test(sourceArg);
  const hasOtherProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(sourceArg) && !isUrl;

  if (parsed.fromUrl && !isUrl) fail("--url requires an http(s) URL.");
  if (parsed.fromState && isUrl) fail("--state requires a local file path.");
  if (hasOtherProtocol) fail("Only http(s) URLs or local file paths are supported.");

  let text;
  let label;
  if (isUrl) {
    let parsedUrl;
    try { parsedUrl = new URL(sourceArg); }
    catch (e) { fail("Invalid URL: " + sourceArg); }
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      fail("Only http(s) URLs are supported.");
    }
    text = await downloadState(parsedUrl.href);
    label = parsedUrl.href;
    console.log("Downloaded state from " + label);
  } else {
    const sourcePath = path.resolve(ROOT, sourceArg);
    if (!fs.existsSync(sourcePath)) {
      if (!parsed.source) {
        fail("No state file found: " + TARGET + "\n" +
          "Export \"brief state (JSON)\" from the portal, then run this command again,\n" +
          "or pass a URL/file: node tools/build-brief-from-state.js <url-or-file>");
      }
      fail("State file not found: " + sourcePath);
    }
    let stat;
    try { stat = fs.statSync(sourcePath); }
    catch (e) { fail("Cannot inspect state file: " + sourcePath + " (" + e.message + ")"); }
    if (!stat.isFile()) fail("State source is not a file: " + sourcePath);
    try { text = fs.readFileSync(sourcePath, "utf8"); }
    catch (e) { fail("Cannot read state file: " + sourcePath + " (" + e.message + ")"); }
    label = path.relative(ROOT, sourcePath) || sourcePath;
    console.log("Read state from " + label);
  }

  let state;
  try {
    state = JSON.parse(text.replace(/^\uFEFF/, ""));
  } catch (e) {
    fail("Cannot parse state JSON from " + label + ": " + e.message);
  }
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    fail("State JSON must be an object: " + label);
  }

  const sourcePath = !isUrl ? path.resolve(ROOT, sourceArg) : "";
  const sourceIsTarget = !isUrl && sourcePath === TARGET;
  if (fs.existsSync(TARGET) && !sourceIsTarget) {
    try {
      fs.copyFileSync(TARGET, BACKUP);
    } catch (e) {
      fail("Cannot back up previous state to " + BACKUP + ": " + e.message);
    }
    console.log("Previous state backed up to " + path.relative(ROOT, BACKUP));
    let previous = null;
    try {
      previous = JSON.parse(fs.readFileSync(BACKUP, "utf8").replace(/^\uFEFF/, ""));
    } catch (e) {
      console.warn("Previous state was backed up but cannot be parsed; comparison skipped.");
    }
    if (previous) printComparison(previous, state);
  } else if (!fs.existsSync(TARGET)) {
    console.log("No previous state file; comparison skipped.");
  } else {
    console.log("State source is already the canonical state file; previous backup left unchanged.");
  }

  const serialized = JSON.stringify(state, null, 2) + "\n";
  try {
    fs.writeFileSync(TARGET, serialized, "utf8");
  } catch (e) {
    fail("Cannot write " + TARGET + ": " + e.message);
  }
  console.log("Saved state to " + TARGET);
  runBuild("Building briefs and decision-table exports", BUILD);
  runBuild("Building go/no-go decision record", GONO_BUILD);
  runBuild("Building evidence ledger CSV", EVIDENCE_BUILD);
  console.log("Done: briefs, decision-table exports, go/no-go decision record and evidence ledger are up to date.");
}

main().catch(function (e) {
  fail(e && e.stack ? e.stack : String(e));
});
