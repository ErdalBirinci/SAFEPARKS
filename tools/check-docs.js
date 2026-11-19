#!/usr/bin/env node
/*
 * Documentation integrity check.
 * - required documents exist and are non-trivial;
 * - every relative Markdown link/image resolves;
 * - external links and same-page anchors are skipped;
 * - path casing is checked so Windows does not hide a Linux/Pages failure.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const REQUIRED_DOCS = [
  "AGENTS.md",
  "docs/README.md",
  "docs/ARCHITECTURE.md",
  "docs/DATA-MODEL.md",
  "docs/WORKFLOWS.md",
  "docs/OPERATIONS.md",
  "docs/SECURITY.md",
  "docs/TESTING-AND-RELEASE.md",
  "docs/INCIDENT-RECOVERY.md",
  "docs/ROLES-RACI.md",
  "docs/GLOSSARY.md"
];

const REQUIRED_SUPPORT = [
  ".github/workflows/brief-state-gate.yml",
  ".github/workflows/pages-health.yml",
  "tools/check-docs.js",
  "tools/check-live.js",
  "tools/ci-gate.js"
];

const failures = [];

function fail(message) {
  failures.push(message);
}

function existsExact(relativePath) {
  const parts = relativePath.split(/[\\/]+/).filter(Boolean);
  let current = ROOT;
  for (const part of parts) {
    let entries;
    try {
      entries = fs.readdirSync(current);
    } catch {
      return false;
    }
    if (!entries.includes(part)) return false;
    current = path.join(current, part);
  }
  return true;
}

function walkMarkdown(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMarkdown(full));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) out.push(full);
  }
  return out;
}

for (const relativePath of REQUIRED_DOCS) {
  const full = path.join(ROOT, relativePath);
  if (!existsExact(relativePath)) {
    fail(`missing required document: ${relativePath}`);
    continue;
  }
  const content = fs.readFileSync(full, "utf8");
  if (content.trim().length < 250) {
    fail(`required document is too short: ${relativePath}`);
  }
  if (!/^#\s+\S/m.test(content)) {
    fail(`required document has no top-level heading: ${relativePath}`);
  }
}

for (const relativePath of REQUIRED_SUPPORT) {
  if (!existsExact(relativePath)) fail(`missing required support file: ${relativePath}`);
}

const markdownFiles = [
  ...walkMarkdown(ROOT)
];

const linkPattern = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
let linkCount = 0;

for (const file of markdownFiles) {
  const content = fs.readFileSync(file, "utf8");
  const relativeFile = path.relative(ROOT, file).split(path.sep).join("/");
  let match;
  while ((match = linkPattern.exec(content)) !== null) {
    let target = match[1].trim();
    if (!target || target.startsWith("#")) continue;
    if (/^(https?:|mailto:|tel:|data:|javascript:)/i.test(target)) continue;
    if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1);
    target = target.split("#")[0].split("?")[0];
    if (!target) continue;

    try {
      target = decodeURIComponent(target);
    } catch {
      fail(`${relativeFile}: invalid URL encoding in link ${match[1]}`);
      continue;
    }

    if (path.isAbsolute(target)) {
      fail(`${relativeFile}: absolute local link is not allowed: ${target}`);
      continue;
    }

    const resolved = path.resolve(path.dirname(file), target);
    const relativeResolved = path.relative(ROOT, resolved).split(path.sep).join("/");
    if (relativeResolved.startsWith("../")) {
      fail(`${relativeFile}: link escapes the repository: ${target}`);
      continue;
    }
    if (!existsExact(relativeResolved)) {
      fail(`${relativeFile}: broken link -> ${target}`);
    }
    linkCount += 1;
  }
}

if (failures.length) {
  console.error("Documentation check failed:");
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exit(1);
}

console.log(`Documentation check passed: ${markdownFiles.length} Markdown files, ${linkCount} internal links.`);
