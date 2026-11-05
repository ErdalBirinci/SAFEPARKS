#!/usr/bin/env node
/*
   Check whether the generated briefs match the current brief state export.
   Usage: node tools/check-brief-state.js [--state safeparks-brief-state.json]

   The checker reads the state file's exportedAt value and content hash, then compares both with the
   metadata embedded in SAFE-PARKS-Executive-Brief.html and SAFE-PARKS-Executive-Brief-2p.html.
   It exits 1 when either brief is older, has a different content hash or was built without a state
   file, 2 on a usage/IO error, and 0 when both briefs match the state.
*/
"use strict";

const fs = require("fs");
const path = require("path");
const { hashState } = require("./state-hash");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
let stateArg = "safeparks-brief-state.json";

function usage() {
  console.log("Usage: node tools/check-brief-state.js [--state safeparks-brief-state.json]");
}

function fail(message, code) {
  console.error(message);
  process.exit(code || 1);
}

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--help" || args[i] === "-h") {
    usage();
    process.exit(0);
  }
  if (args[i] === "--state") {
    stateArg = args[++i];
    if (!stateArg) fail("--state requires a file path.", 2);
    continue;
  }
  fail("Unknown argument: " + args[i], 2);
}

const statePath = path.resolve(ROOT, stateArg);
const briefs = [
  { name: "full brief", file: "SAFE-PARKS-Executive-Brief.html" },
  { name: "two-page brief", file: "SAFE-PARKS-Executive-Brief-2p.html" }
];

function metaContent(html, name) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const nameMatch = tag.match(/\bname=["']([^"']+)["']/i);
    if (!nameMatch || nameMatch[1] !== name) continue;
    const contentMatch = tag.match(/\bcontent=["']([^"']*)["']/i);
    return contentMatch ? contentMatch[1] : "";
  }
  return null;
}

function iso(ms) {
  return new Date(ms).toISOString();
}

function shortHash(value) {
  return String(value || "").replace(/^sha256:/, "").slice(0, 12) || "—";
}

if (!fs.existsSync(statePath)) {
  fail("State file not found: " + statePath + "\nExport \"brief state (JSON)\" from the portal, or pass --state <file>.", 2);
}

let state;
try {
  state = JSON.parse(fs.readFileSync(statePath, "utf8").replace(/^\uFEFF/, ""));
} catch (e) {
  fail("Cannot parse state file: " + statePath + " (" + e.message + ")", 2);
}
if (!state || typeof state !== "object" || Array.isArray(state)) {
  fail("State JSON must be an object: " + statePath, 2);
}

let stateStamp = state.exportedAt || (state.state && state.state.exportedAt) || "";
let stateTime = Date.parse(stateStamp);
let stateBasis = "exportedAt";
if (!Number.isFinite(stateTime)) {
  try {
    stateTime = fs.statSync(statePath).mtime.getTime();
  } catch (e) {
    fail("Cannot read state file timestamp: " + statePath + " (" + e.message + ")", 2);
  }
  stateBasis = "file mtime (exportedAt is missing or invalid)";
  console.warn("WARNING: state file has no valid exportedAt; using its modification time.");
}

const stateHashValue = hashState(state);
console.log("State: " + statePath);
console.log("  " + iso(stateTime) + " (" + stateBasis + ")");
console.log("  content hash " + shortHash(stateHashValue) + " (sha256)");
console.log("");

let stale = 0;
briefs.forEach(function (brief) {
  const file = path.join(ROOT, brief.file);
  if (!fs.existsSync(file)) {
    fail("Brief not found: " + file + "\nRun node tools/build-brief-from-state.js first.", 2);
  }
  const html = fs.readFileSync(file, "utf8");
  const briefStamp = metaContent(html, "safeparks-brief-state-exported-at");
  const briefHash = metaContent(html, "safeparks-brief-state-hash");
  const builtAt = metaContent(html, "safeparks-brief-generated-at");

  if (briefStamp === null) {
    stale++;
    console.error("STALE  " + brief.file + " — no state version metadata; regenerate it.");
    return;
  }
  if (!briefStamp) {
    stale++;
    console.error("STALE  " + brief.file + " — built without local state; regenerate with the state file.");
    return;
  }
  const briefTime = Date.parse(briefStamp);
  if (!Number.isFinite(briefTime)) {
    stale++;
    console.error("STALE  " + brief.file + " — unreadable state version '" + briefStamp + "'.");
    return;
  }
  if (briefTime < stateTime) {
    stale++;
    console.error("STALE  " + brief.file);
    console.error("  brief state: " + briefStamp + (builtAt ? " · generated " + builtAt : ""));
    console.error("  state file:  " + iso(stateTime));
    return;
  }
  if (briefTime > stateTime) {
    stale++;
    console.error("MISMATCH  " + brief.file);
    console.error("  brief state: " + briefStamp + (builtAt ? " · generated " + builtAt : ""));
    console.error("  state file:  " + iso(stateTime));
    console.error("  The brief is newer than the state file; verify which copy is current.");
    return;
  }
  if (briefHash === null) {
    stale++;
    console.error("STALE  " + brief.file + " — no state content hash; regenerate it.");
    return;
  }
  if (!briefHash) {
    stale++;
    console.error("STALE  " + brief.file + " — built without a state content hash; regenerate with the state file.");
    return;
  }
  if (briefHash !== stateHashValue) {
    stale++;
    console.error("HASH MISMATCH  " + brief.file);
    console.error("  brief hash: " + briefHash);
    console.error("  state hash: " + stateHashValue);
    console.error("  The state values changed without regenerating this brief, or the file was edited manually.");
    return;
  }
  console.log("OK     " + brief.file + " · state " + briefStamp + " · hash " + shortHash(briefHash) + (builtAt ? " · generated " + builtAt : ""));
});

console.log("");
if (stale) {
  console.error(stale + " brief(s) stale or mismatched. Regenerate or reconcile with:");
  console.error("  node tools/build-brief-from-state.js" +
    (stateArg === "safeparks-brief-state.json" ? "" : " --state \"" + stateArg + "\""));
  process.exit(1);
}
console.log("Both briefs match the state export.");
