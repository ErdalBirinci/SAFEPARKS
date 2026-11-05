"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { hashState } = require("../tools/state-hash.js");

test("state hash ignores key order and export timestamps", function () {
  const a = {
    exportedAt: "2026-11-05T00:00:00.000Z",
    comp: { G1: "ready", G2: "partial" },
    risks: { R1: "open" },
    gonoArchive: []
  };
  const b = {
    risks: { R1: "open" },
    comp: { G2: "partial", G1: "ready" },
    gonoArchive: [],
    exportedAt: "2026-11-06T00:00:00.000Z"
  };
  assert.equal(hashState(a), hashState(b));
});

test("state hash changes when a value changes", function () {
  const a = { comp: { G1: "ready" }, risks: {}, gonoArchive: [] };
  const b = { comp: { G1: "gap" }, risks: {}, gonoArchive: [] };
  assert.notEqual(hashState(a), hashState(b));
});

test("state hash covers the go/no-go archive", function () {
  const a = { comp: {}, risks: {}, gonoArchive: [] };
  const b = { comp: {}, risks: {}, gonoArchive: [{ city: "M1", at: "2026-11-05" }] };
  assert.notEqual(hashState(a), hashState(b));
});
