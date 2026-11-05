"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const manage = require("../assets/js/management.js");

function blank() {
  return { comp: {}, risks: {}, deliv: {}, checks: {}, notes: {}, gono: {}, decisions: {}, cityRisks: {}, cityRiskMeta: {} };
}

test("ensure adds every management collection without replacing existing values", function () {
  const data = blank();
  data.comp.G1 = "ready";
  manage.ensure(data);
  ["decisionMeta", "riskAcceptance", "kpi", "budgetActual", "docMeta"].forEach(function (key) {
    assert.equal(typeof data[key], "object");
    assert.equal(Array.isArray(data[key]), false);
  });
  ["gonoArchive", "tasks", "audit", "snapshots"].forEach(function (key) {
    assert.ok(Array.isArray(data[key]));
  });
  assert.equal(data.comp.G1, "ready");
  assert.equal(data.meta.schemaVersion, manage.SCHEMA_VERSION);
});

test("audit records who changed what and caps the log", function () {
  const data = blank();
  manage.ensure(data);
  const entry = manage.audit(data, "status.change", { id: "G1", after: "ready" }, { id: "u1", label: "Yetkili 1", role: "editor" });
  assert.equal(entry.user, "Yetkili 1");
  assert.equal(entry.action, "status.change");
  assert.equal(data.audit.length, 1);
  assert.equal(data.audit[0].detail.after, "ready");
});

test("snapshot create and restore preserve audit and snapshot history", function () {
  const data = blank();
  manage.ensure(data);
  data.risks.R1 = "open";
  const snap = manage.createSnapshot(data, "before review", { label: "Yetkili 1" });
  data.risks.R1 = "closed";
  manage.audit(data, "risk.change", { id: "R1" });
  assert.equal(manage.restoreSnapshot(data, snap.id), true);
  assert.equal(data.risks.R1, "open");
  assert.equal(data.audit.length, 1);
  assert.equal(data.snapshots.length, 1);
});

test("task statistics identify overdue and completed work", function () {
  const data = blank();
  manage.ensure(data);
  data.tasks = [
    { id: "t1", title: "Overdue", due: "2026-01-01", status: "open" },
    { id: "t2", title: "Done", due: "2026-01-01", status: "done" },
    { id: "t3", title: "Blocked", status: "blocked" }
  ];
  const stats = manage.taskStats(data, "2026-11-05");
  assert.equal(stats.total, 3);
  assert.equal(stats.done, 1);
  assert.equal(stats.blocked, 1);
  assert.equal(stats.overdue, 1);
});

test("health reports open management work", function () {
  const data = blank();
  manage.ensure(data);
  data.decisions.D1 = "pending";
  data.riskAcceptance.R1 = { acceptedBy: "CEO", expires: "2025-01-01" };
  const health = manage.health(data, "2026-11-05");
  assert.equal(health.pendingDecisions, 1);
  assert.equal(health.riskAcceptances, 1);
  assert.equal(health.expiredAcceptances, 1);
});

test("health counts default decision ids supplied by the portal", function () {
  const data = blank();
  manage.ensure(data);
  data.decisions.D1 = "approved";
  const health = manage.health(data, "2026-11-05", ["D1", "D2", "D3"]);
  assert.equal(health.pendingDecisions, 2);
});

test("validate accepts a brief state export and rejects an invalid status", function () {
  const good = {
    kind: "safeparks-brief-state",
    version: 2,
    exportedAt: "2026-11-05T00:00:00.000Z",
    comp: { G1: "ready" },
    risks: { R1: "open" },
    tasks: [{ id: "t1", title: "Review", status: "open", due: "2026-12-01" }],
    audit: [],
    snapshots: []
  };
  const valid = manage.validate(good);
  assert.equal(valid.ok, true);
  assert.equal(valid.data.kpi && typeof valid.data.kpi, "object");

  const bad = JSON.parse(JSON.stringify(good));
  bad.comp.G1 = "almost-ready";
  const invalid = manage.validate(bad);
  assert.equal(invalid.ok, false);
  assert.match(invalid.errors.join(" "), /unsupported status/);
});

test("CSV and calendar exports are machine-readable", function () {
  const data = blank();
  manage.ensure(data);
  manage.audit(data, "test", { ok: true });
  data.tasks = [{ id: "t1", title: "Review, approve", due: "2026-12-01", status: "open", owner: "CISO" }];
  const csv = manage.auditCsv(data);
  const ics = manage.tasksIcs(data, "20261105T000000Z");
  assert.ok(csv.startsWith("\uFEFF"));
  assert.match(csv, /"action"/);
  assert.match(ics, /BEGIN:VEVENT/);
  assert.match(ics, /SUMMARY:Review\\, approve/);
});
