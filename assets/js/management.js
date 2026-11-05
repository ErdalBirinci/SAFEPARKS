/* SAFE-PARKS CISO Portal — management utilities.
   Shared by the browser console, exports and the dependency-free test suite.
   Everything here is pure or operates on a caller-supplied state object, so it can be
   tested without a DOM. */
(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root && root.SP) root.SP.manage = api;
  if (root) root.SPManage = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var SCHEMA_VERSION = 2;
  var MAX_AUDIT = 2000;
  var MAX_SNAPSHOTS = 8;
  var DAY = 86400000;

  var STATUS = {
    comp: ["ready", "partial", "gap", "na"],
    risks: ["open", "treating", "accepted", "closed"],
    deliv: ["planned", "in-progress", "done"],
    gono: ["open", "pass", "partial", "fail", "na"],
    decisions: ["pending", "approved", "rejected"],
    tasks: ["open", "in-progress", "blocked", "done"]
  };

  function isObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function isPlainObject(value) {
    if (!isObject(value)) return false;
    var proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }

  function clone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function uid(prefix) {
    return (prefix || "id") + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function ensure(data) {
    if (!isObject(data)) throw new Error("state data must be an object");
    var objectKeys = [
      "comp", "risks", "deliv", "checks", "notes", "gono", "decisions",
      "cityRisks", "cityRiskMeta", "decisionMeta", "riskAcceptance", "kpi",
      "budgetActual", "docMeta"
    ];
    objectKeys.forEach(function (key) {
      if (!isPlainObject(data[key])) data[key] = {};
    });
    ["gonoArchive", "tasks", "audit", "snapshots"].forEach(function (key) {
      if (!Array.isArray(data[key])) data[key] = [];
    });
    if (!isPlainObject(data.meta)) data.meta = {};
    data.meta.schemaVersion = SCHEMA_VERSION;
    return data;
  }

  function actor(user) {
    var u = user || (typeof window !== "undefined" && window.SP_AUTH) || {};
    return {
      id: String(u.id || "local"),
      label: String(u.label || "Local user"),
      role: String(u.role || "editor")
    };
  }

  function audit(data, action, detail, user) {
    ensure(data);
    var who = actor(user);
    var entry = {
      id: uid("audit"),
      at: nowIso(),
      user: who.label,
      userId: who.id,
      role: who.role,
      action: String(action || "state.change"),
      detail: detail && typeof detail === "object" ? clone(detail) : { value: String(detail === undefined ? "" : detail) }
    };
    data.audit.push(entry);
    if (data.audit.length > MAX_AUDIT) data.audit.splice(0, data.audit.length - MAX_AUDIT);
    return entry;
  }

  function createSnapshot(data, label, user) {
    ensure(data);
    var snapshotData = clone(data);
    delete snapshotData.snapshots;
    delete snapshotData.audit;
    var snap = {
      id: uid("snap"),
      at: nowIso(),
      label: String(label || "Manual backup"),
      user: actor(user).label,
      data: snapshotData
    };
    data.snapshots.unshift(snap);
    if (data.snapshots.length > MAX_SNAPSHOTS) data.snapshots.length = MAX_SNAPSHOTS;
    return snap;
  }

  function restoreSnapshot(data, id) {
    ensure(data);
    var snap = data.snapshots.filter(function (item) { return item && item.id === id; })[0];
    if (!snap || !isObject(snap.data)) return false;
    var auditLog = data.audit.slice();
    var snapshots = data.snapshots.slice();
    var restored = clone(snap.data);
    Object.keys(data).forEach(function (key) { delete data[key]; });
    Object.assign(data, restored);
    data.audit = auditLog;
    data.snapshots = snapshots;
    ensure(data);
    return true;
  }

  function removeSnapshot(data, id) {
    ensure(data);
    var before = data.snapshots.length;
    data.snapshots = data.snapshots.filter(function (item) { return item && item.id !== id; });
    return data.snapshots.length !== before;
  }

  function dayStart(value) {
    var d = value ? new Date(value) : new Date();
    if (isNaN(d.getTime())) return null;
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }

  function taskStats(data, today) {
    ensure(data);
    var todayMs = dayStart(today);
    var out = { total: 0, open: 0, inProgress: 0, blocked: 0, done: 0, overdue: 0, dueSoon: 0 };
    data.tasks.forEach(function (task) {
      if (!task || !task.title) return;
      out.total++;
      var st = String(task.status || "open");
      if (st === "done") out.done++;
      else if (st === "blocked") out.blocked++;
      else if (st === "in-progress") out.inProgress++;
      else out.open++;
      if (st !== "done" && task.due) {
        var due = dayStart(task.due);
        if (due !== null) {
          var diff = due - todayMs;
          if (diff < 0) out.overdue++;
          else if (diff <= 7 * DAY) out.dueSoon++;
        }
      }
    });
    return out;
  }

  function pendingDecisions(data, ids) {
    ensure(data);
    var keys = Array.isArray(ids) && ids.length ? ids : Object.keys(data.decisions || {});
    return keys.filter(function (id) {
      return data.decisions[id] === "pending" || data.decisions[id] === undefined;
    }).length;
  }

  function expiredAcceptances(data, today) {
    ensure(data);
    var todayMs = dayStart(today);
    return Object.keys(data.riskAcceptance || {}).filter(function (id) {
      var acc = data.riskAcceptance[id] || {};
      if (!acc.expires) return false;
      var exp = dayStart(acc.expires);
      return exp !== null && exp < todayMs;
    });
  }

  function health(data, today, decisionIds) {
    ensure(data);
    var ts = taskStats(data, today);
    return {
      schemaVersion: SCHEMA_VERSION,
      auditEntries: data.audit.length,
      snapshots: data.snapshots.length,
      tasks: ts,
      pendingDecisions: pendingDecisions(data, decisionIds),
      riskAcceptances: Object.keys(data.riskAcceptance || {}).length,
      expiredAcceptances: expiredAcceptances(data, today).length,
      kpiActuals: Object.keys(data.kpi || {}).length,
      budgetActuals: Object.keys(data.budgetActual || {}).length
    };
  }

  function unwrap(raw) {
    if (!isPlainObject(raw)) return null;
    if (isPlainObject(raw.state) && isPlainObject(raw.state.data)) {
      return {
        data: raw.state.data,
        settings: isPlainObject(raw.state.settings) ? raw.state.settings : {},
        lang: raw.state.lang,
        theme: raw.state.theme,
        wrapper: true
      };
    }
    if (raw.kind === "safeparks-brief-state") {
      return {
        data: raw,
        settings: isPlainObject(raw.settings) ? raw.settings : {},
        lang: raw.lang,
        theme: raw.theme,
        wrapper: false
      };
    }
    if (isPlainObject(raw.data)) {
      return {
        data: raw.data,
        settings: isPlainObject(raw.settings) ? raw.settings : {},
        lang: raw.lang,
        theme: raw.theme,
        wrapper: false
      };
    }
    return null;
  }

  function validate(raw) {
    var errors = [];
    var source = unwrap(raw);
    if (!source) {
      return { ok: false, errors: ["State must be an object with a data object or a safeparks-brief-state export."] };
    }
    if (!isPlainObject(source.data)) {
      return { ok: false, errors: ["State data must be an object."] };
    }
    var data = clone(source.data);
    try {
      ensure(data);
    } catch (e) {
      return { ok: false, errors: [e.message] };
    }
    var objectKeys = [
      "comp", "risks", "deliv", "checks", "notes", "gono", "decisions",
      "cityRisks", "cityRiskMeta", "decisionMeta", "riskAcceptance", "kpi",
      "budgetActual", "docMeta"
    ];
    objectKeys.forEach(function (key) {
      if (data[key] !== undefined && !isPlainObject(data[key])) {
        errors.push(key + " must be an object.");
      }
    });
    ["gonoArchive", "tasks", "audit", "snapshots"].forEach(function (key) {
      if (data[key] !== undefined && !Array.isArray(data[key])) {
        errors.push(key + " must be an array.");
      }
    });
    Object.keys(STATUS).forEach(function (key) {
      var map = data[key];
      if (!isPlainObject(map)) return;
      Object.keys(map).forEach(function (id) {
        if (STATUS[key].indexOf(map[id]) < 0) {
          errors.push(key + "." + id + " has an unsupported status: " + map[id]);
        }
      });
    });
    data.tasks.forEach(function (task, index) {
      if (!isPlainObject(task)) {
        errors.push("tasks[" + index + "] must be an object.");
        return;
      }
      if (!task.title) errors.push("tasks[" + index + "] needs a title.");
      if (task.status && STATUS.tasks.indexOf(task.status) < 0) {
        errors.push("tasks[" + index + "] has an unsupported status: " + task.status);
      }
      if (task.due && !/^\d{4}-\d{2}-\d{2}$/.test(task.due)) {
        errors.push("tasks[" + index + "] due date must be YYYY-MM-DD.");
      }
    });
    data.riskAcceptance && Object.keys(data.riskAcceptance).forEach(function (id) {
      var acc = data.riskAcceptance[id];
      if (!isPlainObject(acc)) {
        errors.push("riskAcceptance." + id + " must be an object.");
        return;
      }
      ["date", "expires"].forEach(function (field) {
        if (acc[field] && !/^\d{4}-\d{2}-\d{2}$/.test(acc[field])) {
          errors.push("riskAcceptance." + id + "." + field + " must be YYYY-MM-DD.");
        }
      });
    });
    return {
      ok: errors.length === 0,
      errors: errors,
      data: data,
      settings: isPlainObject(source.settings) ? clone(source.settings) : {},
      lang: source.lang === "en" || source.lang === "tr" ? source.lang : "",
      theme: source.theme === "light" || source.theme === "dark" ? source.theme : "",
      wrapper: !!source.wrapper,
      hasAudit: Array.isArray(source.data.audit),
      hasSnapshots: Array.isArray(source.data.snapshots)
    };
  }

  function csvCell(value) {
    return '"' + String(value === undefined || value === null ? "" : value).replace(/"/g, '""') + '"';
  }

  function auditCsv(data) {
    ensure(data);
    var head = ["id", "at", "user", "userId", "role", "action", "detail"];
    var lines = [head.map(csvCell).join(",")];
    data.audit.forEach(function (entry) {
      lines.push([
        entry.id, entry.at, entry.user, entry.userId, entry.role, entry.action,
        typeof entry.detail === "object" ? JSON.stringify(entry.detail) : entry.detail
      ].map(csvCell).join(","));
    });
    return "\uFEFF" + lines.join("\r\n") + "\r\n";
  }

  function icsEscape(value) {
    return String(value === undefined || value === null ? "" : value)
      .replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  }

  function icsDate(value) {
    var d = new Date(value);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  }

  function tasksIcs(data, stamp) {
    ensure(data);
    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SAFE-PARKS//CISO Portal//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH"
    ];
    data.tasks.forEach(function (task) {
      if (!task || !task.title || !task.due || task.status === "done") return;
      var date = String(task.due).replace(/-/g, "");
      if (!/^\d{8}$/.test(date)) return;
      lines.push("BEGIN:VEVENT");
      lines.push("UID:" + icsEscape(task.id || uid("task")) + "@safeparks.local");
      lines.push("DTSTAMP:" + (stamp || icsDate(new Date())));
      lines.push("DTSTART;VALUE=DATE:" + date);
      lines.push("SUMMARY:" + icsEscape(task.title));
      lines.push("DESCRIPTION:" + icsEscape([task.owner, task.note].filter(Boolean).join(" — ")));
      lines.push("STATUS:" + (task.status === "blocked" ? "CANCELLED" : "CONFIRMED"));
      lines.push("END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n") + "\r\n";
  }

  return {
    SCHEMA_VERSION: SCHEMA_VERSION,
    MAX_AUDIT: MAX_AUDIT,
    MAX_SNAPSHOTS: MAX_SNAPSHOTS,
    STATUS: STATUS,
    ensure: ensure,
    clone: clone,
    nowIso: nowIso,
    uid: uid,
    actor: actor,
    audit: audit,
    createSnapshot: createSnapshot,
    restoreSnapshot: restoreSnapshot,
    removeSnapshot: removeSnapshot,
    taskStats: taskStats,
    pendingDecisions: pendingDecisions,
    expiredAcceptances: expiredAcceptances,
    health: health,
    validate: validate,
    auditCsv: auditCsv,
    tasksIcs: tasksIcs
  };
});
