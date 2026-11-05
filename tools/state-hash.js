/*
   Canonical content hash for the brief state.
   The hash covers the state fields consumed by the briefs, not the export timestamp. It is stable
   across JSON key order and formatting changes, so it catches manual value edits rather than noise.
*/
"use strict";

const crypto = require("crypto");

const FIELDS = ["comp", "risks", "deliv", "checks", "notes", "gono", "gonoArchive", "decisions", "cityRisks", "cityRiskMeta"];

function unwrapState(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value.state && value.state.data && typeof value.state.data === "object" && !Array.isArray(value.state.data)
    ? value.state.data
    : value;
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    const out = {};
    Object.keys(value).sort().forEach(function (key) {
      out[key] = canonical(value[key]);
    });
    return out;
  }
  return value;
}

function payload(raw) {
  const data = unwrapState(raw);
  const out = {};
  FIELDS.forEach(function (field) {
    const value = data[field];
    if (Array.isArray(value)) out[field] = value;
    else if (value && typeof value === "object") out[field] = value;
    else out[field] = {};
  });
  return out;
}

function hashState(raw) {
  return "sha256:" + crypto.createHash("sha256").update(JSON.stringify(canonical(payload(raw))), "utf8").digest("hex");
}

module.exports = { FIELDS, hashState };
