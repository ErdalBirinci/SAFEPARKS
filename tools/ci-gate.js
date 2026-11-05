#!/usr/bin/env node
/*
   Required CI gate for the generated brief set.
   Usage: node tools/ci-gate.js [--state safeparks-brief-state.json]

   The gate refuses to pass unless:
     1. it runs inside a Git worktree;
     2. the brief state and every generated release artifact are tracked by Git;
     3. tools/check-brief-state.js confirms both briefs match the state version.

   A failed stale check exits 1. Missing state, missing artifacts, an untracked file or a
   non-Git checkout exits 2, so a production pipeline cannot skip the gate silently.
*/
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const CHECK = path.join(__dirname, "check-brief-state.js");
const ARTIFACTS = [
  "SAFE-PARKS-Executive-Brief.html",
  "SAFE-PARKS-Executive-Brief-2p.html",
  "SAFE-PARKS-GoNoGo-Decision.html",
  "SAFE-PARKS-Decision-Table.html",
  "SAFE-PARKS-Decision-Table.docx",
  "SAFE-PARKS-Decision-Table.xlsx",
  "SAFE-PARKS-Decision-Table-EN.tsv",
  "SAFE-PARKS-Decision-Table-TR.tsv"
];

let stateArg = "safeparks-brief-state.json";
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--help" || args[i] === "-h") {
    console.log("Usage: node tools/ci-gate.js [--state safeparks-brief-state.json]");
    process.exit(0);
  }
  if (args[i] === "--state") {
    stateArg = args[++i];
    if (!stateArg) fail("--state requires a file path.", 2);
    continue;
  }
  fail("Unknown argument: " + args[i], 2);
}

function fail(message, code) {
  console.error(message);
  process.exit(code || 1);
}

function git(args) {
  const result = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
  if (result.error) fail("Cannot run Git: " + result.error.message, 2);
  return result;
}

function gitPath(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function requireTracked(file, label) {
  const relative = gitPath(file);
  if (!relative || relative.startsWith("../")) {
    fail((label || relative) + " must live inside the repository: " + file, 2);
  }
  if (!fs.existsSync(file)) fail((label || relative) + " is missing: " + relative, 2);
  const result = git(["ls-files", "--error-unmatch", "--", relative]);
  if (result.status !== 0) {
    fail((label || relative) + " is not tracked by Git: " + relative +
      "\nCommit the generated artifact and the state file before running the gate.", 2);
  }
}

const inside = git(["rev-parse", "--is-inside-work-tree"]);
if (inside.status !== 0 || inside.stdout.trim() !== "true") {
  fail("CI gate requires a Git checkout. Run it from the versioned project root.", 2);
}

const statePath = path.resolve(ROOT, stateArg);
requireTracked(statePath, "brief state");
ARTIFACTS.forEach(function (file) {
  requireTracked(path.join(ROOT, file));
});

const check = spawnSync(process.execPath, [CHECK, "--state", statePath], {
  cwd: ROOT,
  stdio: "inherit"
});
if (check.error) fail("Cannot start check-brief-state.js: " + check.error.message, 2);
if (check.status !== 0) {
  console.error("Pipeline stopped: the generated brief set is stale or mismatched.");
  process.exit(check.status || 1);
}

console.log("CI gate passed: versioned brief state and generated artifacts are current.");
