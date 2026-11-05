/* SAFE-PARKS CISO Portal — core app: state, i18n binding, router, shared UI, dashboard, project, governance, mandate */
(function () {
  "use strict";

  var SP = window.SP;
  SP.views = SP.views || {};
  SP.allCompliance = (SP.compliance || []).concat(SP.compliance2 || []);

  var STORE_KEY = "safeparks-ciso-v1";

  function actor() {
    return window.SP_AUTH || { id: "local", label: "Yerel kullanıcı", role: "editor" };
  }

  var state = {
    schemaVersion: 2,
    appVersion: window.APP_VERSION || "1.1.0",
    updatedAt: "",
    updatedBy: "",
    lang: "tr",
    theme: "dark",
    route: "dashboard",
    ui: {},
    data: {
      comp: {}, risks: {}, deliv: {}, checks: {}, notes: {}, gono: {}, gonoArchive: [], decisions: {},
      cityRisks: {}, cityRiskMeta: {}, decisionMeta: {}, riskAcceptance: {}, kpi: {}, budgetActual: {},
      docMeta: {}, tasks: [], audit: [], snapshots: [], meta: { schemaVersion: 2 }
    },
    settings: { ciso: "", dpo: "", ga: "" }
  };

  /* ---------------- persistence ---------------- */
  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      var saved = JSON.parse(raw);
      if (saved && typeof saved === "object") {
        if (saved.schemaVersion) state.schemaVersion = saved.schemaVersion;
        if (saved.appVersion) state.appVersion = saved.appVersion;
        if (saved.updatedAt) state.updatedAt = saved.updatedAt;
        if (saved.updatedBy) state.updatedBy = saved.updatedBy;
        if (saved.lang) state.lang = saved.lang;
        if (saved.theme) state.theme = saved.theme;
        if (saved.data) state.data = Object.assign(state.data, saved.data);
        if (saved.settings) state.settings = Object.assign(state.settings, saved.settings);
        if (SP.manage) SP.manage.ensure(state.data);
      }
    } catch (e) { /* corrupted storage: start clean */ }
  }
  function save() {
    try {
      if (SP.manage) SP.manage.ensure(state.data);
      var at = new Date().toISOString();
      state.updatedAt = at;
      state.updatedBy = actor().label;
      state.schemaVersion = (SP.manage && SP.manage.SCHEMA_VERSION) || 2;
      state.appVersion = window.APP_VERSION || "1.1.0";
      state.data.meta = state.data.meta || {};
      state.data.meta.schemaVersion = state.schemaVersion;
      state.data.meta.updatedAt = at;
      state.data.meta.updatedBy = state.updatedBy;
      localStorage.setItem(STORE_KEY, JSON.stringify({
        schemaVersion: state.schemaVersion, appVersion: state.appVersion, updatedAt: at,
        updatedBy: state.updatedBy, lang: state.lang, theme: state.theme,
        data: state.data, settings: state.settings, t: Date.now()
      }));
    } catch (e) { toast(t("common.storageBlocked")); }
  }

  function audit(action, detail) {
    if (SP.manage) SP.manage.audit(state.data, action, detail, actor());
  }

  function signOut() {
    if (window.SP_AUTH_SIGNOUT) window.SP_AUTH_SIGNOUT();
  }

  /* ---------------- helpers ---------------- */
  function L(o) {
    if (o === null || o === undefined) return "";
    if (typeof o === "string") return o;
    return o[state.lang] || o.en || o.tr || "";
  }
  function t(k) {
    var d = (window.I18N && (window.I18N[state.lang] || window.I18N.en)) || {};
    var f = (window.I18N && window.I18N.en) || {};
    return d[k] !== undefined ? d[k] : (f[k] !== undefined ? f[k] : k);
  }
  function esc(s) {
    return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function num(n) {
    try { return new Intl.NumberFormat(state.lang === "tr" ? "tr-TR" : "en-GB").format(n); }
    catch (e) { return String(n); }
  }
  function money(n) { return "€" + num(n); }
  function pct(n) {
    var v = Math.round(n * 10) / 10;
    return String(v).replace(".", state.lang === "tr" ? "," : ".") + "%";
  }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function el(id) { return document.getElementById(id); }

  var toastTimer = null;
  function toast(msg) {
    var box = el("toast");
    if (!box) return;
    box.textContent = msg;
    box.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { box.hidden = true; }, 2600);
  }

  /* ---------------- status model ---------------- */
  var STATUS = {
    ready: { cls: "badge-ready", key: "status.ready" },
    pass: { cls: "badge-ready", key: "status.pass" },
    fail: { cls: "badge-gap", key: "status.fail" },
    partial: { cls: "badge-partial", key: "status.partial" },
    gap: { cls: "badge-gap", key: "status.gap" },
    na: { cls: "badge-na", key: "status.na" },
    planned: { cls: "badge-na", key: "status.planned" },
    "in-progress": { cls: "badge-info", key: "status.inProgress" },
    done: { cls: "badge-ready", key: "status.done" },
    open: { cls: "badge-info", key: "status.open" },
    treating: { cls: "badge-partial", key: "status.treating" },
    accepted: { cls: "badge-na", key: "status.accepted" },
    closed: { cls: "badge-ready", key: "status.closed" },
    pending: { cls: "badge-na", key: "status.pending" },
    approved: { cls: "badge-ready", key: "status.approved" },
    rejected: { cls: "badge-gap", key: "status.rejected" }
  };
  function badge(v) {
    var s = STATUS[v] || { cls: "badge-na", key: v };
    return '<span class="badge ' + s.cls + '">' + esc(t(s.key)) + "</span>";
  }
  function statusSelect(kind, id, cur, opts) {
    var list = opts || ["ready", "partial", "gap", "na"];
    var html = '<select class="status-select" data-status="' + kind + '" data-id="' + esc(id) + '" data-v="' + esc(cur) + '" aria-label="' + esc(t("common.status")) + '">';
    list.forEach(function (o) {
      html += '<option value="' + o + '"' + (o === cur ? " selected" : "") + ">" + esc(t((STATUS[o] || {}).key || o)) + "</option>";
    });
    return html + "</select>";
  }

  /* ---------------- computed metrics ---------------- */
  function compStatus(row) {
    return state.data.comp[row.id] || row.status;
  }
  function compStats() {
    var by = {};
    var totW = 0, gotW = 0, counts = { ready: 0, partial: 0, gap: 0, na: 0 };
    SP.allCompliance.forEach(function (r) {
      var st = compStatus(r);
      if (!by[r.fw]) by[r.fw] = { tot: 0, got: 0, n: 0, ready: 0, partial: 0, gap: 0 };
      if (st === "na") { counts.na++; by[r.fw].n++; return; }
      var w = st === "ready" ? 1 : st === "partial" ? 0.5 : 0;
      counts[st] = (counts[st] || 0) + 1;
      by[r.fw].tot += 1; by[r.fw].got += w; by[r.fw].n++;
      by[r.fw][st] = (by[r.fw][st] || 0) + 1;
      totW += 1; gotW += w;
    });
    Object.keys(by).forEach(function (k) {
      by[k].p = by[k].tot ? (by[k].got / by[k].tot) * 100 : 0;
    });
    return { by: by, overall: totW ? (gotW / totW) * 100 : 0, counts: counts, applicable: totW };
  }
  function riskScore(r) { return r.l * r.i; }
  /* Per-city likelihood/impact overrides. The register is project-wide; a city without an entry uses the baseline. */
  function cityRiskScore(cityId, r) {
    var map = cityId && state.data.cityRisks ? state.data.cityRisks[cityId] : null;
    var ov = map && map[r.id];
    var l = ov ? parseInt(ov.l, 10) : NaN;
    var i = ov ? parseInt(ov.i, 10) : NaN;
    return {
      l: l >= 1 && l <= 5 ? l : r.l,
      i: i >= 1 && i <= 5 ? i : r.i
    };
  }
  function cityRiskAdj(cityId) {
    var map = (state.data.cityRisks || {})[cityId] || {};
    return Object.keys(map).filter(function (id) {
      var ov = map[id] || {};
      return (ov.l >= 1 && ov.l <= 5) || (ov.i >= 1 && ov.i <= 5);
    }).length;
  }
  function cityRiskMeta(cityId) {
    return (state.data.cityRiskMeta || {})[cityId] || {};
  }
  function riskTone(score) {
    if (score >= 20) return "critical";
    if (score >= 12) return "high";
    if (score >= 6) return "medium";
    return "low";
  }
  function riskStats() {
    var out = { critical: 0, high: 0, medium: 0, low: 0, total: SP.risks.length, open: 0 };
    SP.risks.forEach(function (r) {
      out[riskTone(riskScore(r))]++;
      var st = state.data.risks[r.id] || r.status;
      if (st !== "closed" && st !== "accepted") out.open++;
    });
    return out;
  }
  function delivStats() {
    var out = { planned: 0, "in-progress": 0, done: 0, total: SP.deliverables.length };
    SP.deliverables.forEach(function (d) {
      var st = state.data.deliv[d.id] || d.status;
      out[st] = (out[st] || 0) + 1;
    });
    return out;
  }
  function planDone() {
    var all = 0, done = 0;
    (SP.plan90 || []).forEach(function (p) {
      p.actions.forEach(function (a) { all++; if (state.data.checks[a.id]) done++; });
    });
    return { all: all, done: done, p: all ? (done / all) * 100 : 0 };
  }

  /* ---------------- shared UI ---------------- */
  function head(eyebrow, title, lede, extra) {
    return '<div class="view-head"><div class="eyebrow">' + esc(eyebrow) + "</div><h1>" + esc(title) + "</h1>" +
      (lede ? '<p class="lede">' + esc(lede) + "</p>" : "") + (extra || "") + "</div>";
  }
  function card(inner, cls) { return '<section class="card ' + (cls || "") + '">' + inner + "</section>"; }
  function cardHead(title, sub, right) {
    return '<div class="card-head"><div><h3>' + esc(title) + "</h3>" + (sub ? "<p>" + esc(sub) + "</p>" : "") + "</div>" + (right || "") + "</div>";
  }
  function meter(p, tone) {
    var cls = tone || (p < 40 ? "danger" : p < 70 ? "warn" : "");
    return '<div class="meter ' + cls + '"><span style="width:' + clamp(p, 0, 100).toFixed(1) + '%"></span></div>';
  }
  function meterRow(p) {
    return '<div class="meter-row">' + meter(p) + '<span class="meter-val">' + pct(p) + "</span></div>";
  }
  function kpi(label, value, note, accent) {
    return '<div class="card kpi"><div class="kpi-label">' + esc(label) + "</div>" +
      '<div class="kpi-value ' + (accent ? "kpi-accent" : "") + '">' + value + "</div>" +
      '<div class="kpi-note">' + esc(note || "") + "</div></div>";
  }
  function table(cols, rows, opts) {
    var o = opts || {};
    var h = '<div class="table-wrap"><table><thead><tr>';
    cols.forEach(function (c) { h += '<th class="' + (c.num ? "num" : "") + '">' + esc(c.label) + "</th>"; });
    h += "</tr></thead><tbody>";
    if (!rows.length) {
      h += '<tr><td colspan="' + cols.length + '"><div class="empty">' + esc(t("common.none")) + "</div></td></tr>";
    }
    rows.forEach(function (r) { h += "<tr>" + r + "</tr>"; });
    return h + "</tbody></table></div>" + (o.foot ? '<p class="hint" style="margin-top:8px">' + o.foot + "</p>" : "");
  }
  function tags(list) {
    return '<div class="tag-list">' + list.map(function (x) { return '<span class="tag">' + esc(x) + "</span>"; }).join("") + "</div>";
  }
  function callout(text, tone, mark) {
    return '<div class="callout ' + (tone || "") + '"><span class="ci">' + esc(mark || "i") + "</span><div>" + text + "</div></div>";
  }

  SP.h = { L: L, t: t, esc: esc, num: num, money: money, pct: pct, badge: badge, card: card,
    cardHead: cardHead, meter: meter, meterRow: meterRow, kpi: kpi, table: table, head: head, tags: tags, callout: callout,
    state: state, save: save, audit: audit, manage: SP.manage, download: download, render: render,
    compStats: compStats, compStatus: compStatus, riskScore: riskScore,
    cityRiskScore: cityRiskScore, cityRiskAdj: cityRiskAdj, cityRiskMeta: cityRiskMeta,
    riskTone: riskTone, riskStats: riskStats, delivStats: delivStats, planDone: planDone, toast: toast, el: el,
    statusSelect: statusSelect, toastOk: function (m) { toast(m); } };

  /* ---------------- navigation ---------------- */
  var ICONS = {
    dashboard: '<path d="M4 13h7V4H4v9zm0 7h7v-5H4v5zm9 0h7V11h-7v9zm0-16v5h7V4h-7z"/>',
    project: '<path d="M3 7h7l2 2h9v10H3z"/><path d="M3 7V5h7l2 2"/>',
    governance: '<circle cx="12" cy="8" r="3"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/><path d="M17 4h4M19 2v4"/>',
    mandate: '<path d="M12 3l8 3v6c0 4.6-3.2 8.4-8 10-4.8-1.6-8-5.4-8-10V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
    compliance: '<path d="M9 4h9a2 2 0 012 2v14H7V6a2 2 0 012-2z"/><path d="M9 4V3h6v1M10 11l2 2 4-4M10 17h6"/>',
    evidence: '<path d="M7 3h10a2 2 0 012 2v16l-7-3-7 3V5a2 2 0 012-2z"/><path d="M9 9h6M9 13h4"/>',
    privacy: '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/><circle cx="12" cy="15" r="1.2"/>',
    architecture: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4"/>',
    risks: '<path d="M12 3l9 17H3L12 3z"/><path d="M12 9v5M12 17h.01"/>',
    assurance: '<circle cx="11" cy="11" r="6"/><path d="M15.5 15.5L21 21"/><path d="M8.5 11l2 2 4-4"/>',
    incidents: '<path d="M12 3v6M12 15v.01"/><circle cx="12" cy="12" r="9"/><path d="M12 18h.01"/>',
    wp3: '<path d="M4 19V5h16v14z"/><path d="M4 9h16M9 5v14"/>',
    deliverables: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h7M9 17h5"/>',
    docs: '<path d="M4 5a2 2 0 012-2h8l6 6v12a2 2 0 01-2 2H6a2 2 0 01-2-2z"/><path d="M14 3v6h6"/><path d="M8 13h8M8 17h6"/>',
    management: '<path d="M4 5h16M4 12h16M4 19h16"/><circle cx="7" cy="5" r="2"/><circle cx="7" cy="12" r="2"/><circle cx="7" cy="19" r="2"/>',
    gono: '<path d="M8 4h8a2 2 0 012 2v14H6V6a2 2 0 012-2z"/><path d="M9 3h6v3H9z"/><path d="M9 11l2.2 2.2L16 8.4"/><path d="M9 17h6"/>',
    reporting: '<path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="12" width="3" height="5"/><rect x="12" y="8" width="3" height="9"/><rect x="17" y="5" width="3" height="12"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-2.9 1.2 2 2 0 11-4 0 1.7 1.7 0 00-2.9-1.2l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.7 1.7 0 003 15a2 2 0 010-4 1.7 1.7 0 001.2-2.9l-.1-.1a2 2 0 112.8-2.8l.1.1A1.7 1.7 0 0010 4.6a2 2 0 014 0 1.7 1.7 0 002.9 1.2l.1-.1a2 2 0 112.8 2.8l-.1.1A1.7 1.7 0 0021 11a2 2 0 010 4z"/>'
  };

  var NAV = [
    { group: "nav.group.overview", items: ["dashboard", "project"] },
    { group: "nav.group.govern", items: ["governance", "mandate", "reporting"] },
    { group: "nav.group.comply", items: ["compliance", "evidence", "privacy"] },
    { group: "nav.group.assure", items: ["architecture", "risks", "assurance", "incidents"] },
    { group: "nav.group.operate", items: ["gono", "wp3", "deliverables", "docs"] },
    { group: "nav.group.ref", items: ["management", "settings"] }
  ];

  function evidenceGapCount() {
    var notes = state.data.notes || {};
    return (SP.allCompliance || []).filter(function (r) {
      return !String(notes["comp|" + r.id + "|ref"] || "").trim() && !String(notes["comp|" + r.id + "|note"] || "").trim();
    }).length;
  }

  function navHtml() {
    var h = "";
    NAV.forEach(function (g) {
      h += '<div class="nav-group-label">' + esc(t(g.group)) + "</div>";
      g.items.forEach(function (id) {
        var count = "";
        if (id === "risks") count = '<span class="nav-count">' + riskStats().open + "</span>";
        if (id === "evidence") count = '<span class="nav-count">' + evidenceGapCount() + "</span>";
        if (id === "deliverables") count = '<span class="nav-count">' + delivStats().total + "</span>";
        if (id === "docs") count = '<span class="nav-count">' + SP.docs.length + "</span>";
        h += '<a class="nav-item" href="#' + id + '" data-nav="' + id + '">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + ICONS[id] + "</svg>" +
          "<span>" + esc(t("nav." + id)) + "</span>" + count + "</a>";
      });
    });
    return h;
  }

  function applyChrome() {
    var nl = el("nav");
    if (nl) nl.innerHTML = navHtml();
    document.querySelectorAll("[data-i18n]").forEach(function (n) {
      var k = n.getAttribute("data-i18n");
      var txt = t(k);
      if (txt && txt !== k) n.textContent = txt;
    });
    document.querySelectorAll(".seg-btn").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === state.lang ? "true" : "false");
    });
    document.documentElement.lang = state.lang;
    document.documentElement.setAttribute("data-theme", state.theme);
    var ga = state.settings.ga || SP.meta.gaNumber || "—";
    if (el("gaLabel")) el("gaLabel").textContent = ga === "—" ? "—" : "GA " + ga;
    if (el("sfMeta")) el("sfMeta").textContent = ((window.SP_AUTH && window.SP_AUTH.label) || state.settings.ciso || SP.meta.ownerRole) + " · v" + (window.APP_VERSION || "1.1.0");
    var cur = state.route.split("/")[0];
    var crumb = el("crumbCurrent");
    if (crumb) crumb.textContent = t("nav." + cur);
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-nav") === cur);
      if (a.classList.contains("nav-item")) a.setAttribute("aria-current", a.getAttribute("data-nav") === cur ? "page" : "false");
    });
    document.title = "SAFE-PARKS · " + t("nav." + cur);
  }

  /* ---------------- router ---------------- */
  function parseHash() {
    var h = (location.hash || "").replace(/^#/, "");
    if (!h) h = "dashboard";
    var parts = h.split("/");
    if (!SP.views[parts[0]]) parts = ["dashboard"];
    state.route = parts.join("/");
    return parts;
  }

  function render() {
    var parts = parseHash();
    var view = SP.views[parts[0]];
    var host = el("view");
    if (!host) return;
    host.innerHTML = view.render(parts[1] || "");
    applyChrome();
    closeMenu();
    closeSidebar();
  }

  /* ---------------- topbar interactions ---------------- */
  function closeMenu() {
    var m = el("dataMenu"), b = el("dataBtn");
    if (m) m.hidden = true;
    if (b) b.setAttribute("aria-expanded", "false");
  }
  function closeSidebar() {
    var s = el("sidebar"), sc = el("scrim"), b = el("menuBtn");
    if (s) s.classList.remove("open");
    if (sc) sc.hidden = true;
    if (b) b.setAttribute("aria-expanded", "false");
  }

  /* ---------------- exports ---------------- */
  function download(name, text, mime) {
    var blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }
  function exportJson() {
    download("safeparks-ciso-state.json", JSON.stringify({
      exportedAt: new Date().toISOString(), project: SP.meta.project,
      schemaVersion: state.schemaVersion, appVersion: state.appVersion,
      updatedAt: state.updatedAt, updatedBy: state.updatedBy,
      state: {
        schemaVersion: state.schemaVersion, appVersion: state.appVersion,
        lang: state.lang, theme: state.theme, data: state.data, settings: state.settings
      }
    }, null, 2), "application/json");
    toast(t("toast.exported"));
  }
  /* compact state file for tools/build-brief.js — only the fields the briefs use */
  function briefState() {
    var comp = {}, notes = {};
    Object.keys(state.data.comp || {}).forEach(function (k) {
      if (k.indexOf("tom.") !== 0) comp[k] = state.data.comp[k];
    });
    Object.keys(state.data.notes || {}).forEach(function (k) {
      if (k.indexOf("comp|") === 0) notes[k] = state.data.notes[k];
    });
    return {
      kind: "safeparks-brief-state",
      version: 2,
      schemaVersion: state.schemaVersion || 2,
      appVersion: state.appVersion || window.APP_VERSION || "1.1.0",
      exportedAt: new Date().toISOString(),
      project: SP.meta.project,
      lang: state.lang,
      settings: { ciso: state.settings.ciso || "", dpo: state.settings.dpo || "", ga: state.settings.ga || "" },
      comp: comp,
      risks: state.data.risks || {},
      deliv: state.data.deliv || {},
      checks: state.data.checks || {},
      gono: state.data.gono || {},
      decisions: state.data.decisions || {},
      cityRisks: state.data.cityRisks || {},
      cityRiskMeta: state.data.cityRiskMeta || {},
      gonoArchive: state.data.gonoArchive || [],
      notes: notes
    };
  }
  function exportBriefState() {
    download("safeparks-brief-state.json", JSON.stringify(briefState(), null, 2), "application/json");
    toast(t("toast.briefExported"));
  }
  SP.briefState = briefState;

  /* evidence ledger: same rows as the compliance matrix and the Markdown evidence log, as CSV */
  function evidenceCity() {
    var id = state.ui.evidenceCity || "";
    return (SP.pilotCities || []).some(function (c) { return c.id === id; }) ? id : "";
  }
  function exportEvidenceCsv() {
    var city = evidenceCity();
    var file = "safeparks-evidence-ledger" + (city ? "-" + city.toLowerCase() : "") + ".csv";
    download(file,
      SP.buildEvidenceCsv(SP.allCompliance, state.data.notes, function (id) { return state.data.comp[id] || ""; }, { city: city }),
      "text/csv;charset=utf-8");
    toast(t("toast.csvExported"));
  }
  SP.evidenceCsv = function () {
    return SP.buildEvidenceCsv(SP.allCompliance, state.data.notes, function (id) { return state.data.comp[id] || ""; }, { city: evidenceCity() });
  };
  function exportMissingEvidenceCsv() {
    download("safeparks-missing-evidence.csv",
      SP.buildMissingEvidenceCsv(SP.allCompliance, state.data.notes, function (id) { return state.data.comp[id] || ""; }),
      "text/csv;charset=utf-8");
    toast(t("evp.csvExported"));
  }
  SP.missingEvidenceCsv = function () {
    return SP.buildMissingEvidenceCsv(SP.allCompliance, state.data.notes, function (id) { return state.data.comp[id] || ""; });
  };

  function importJson(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var obj = JSON.parse(String(reader.result));
        if (!SP.manage) throw new Error("management module missing");
        var result = SP.manage.validate(obj);
        if (!result.ok) {
          toast(t("toast.importFailed") + " " + (result.errors[0] || ""));
          return;
        }
        SP.manage.createSnapshot(state.data, "before import", actor());
        var keepAudit = (state.data.audit || []).slice();
        var keepSnapshots = (state.data.snapshots || []).slice();
        state.data = SP.manage.ensure(result.data);
        if (!result.hasAudit) state.data.audit = keepAudit;
        if (!result.hasSnapshots) state.data.snapshots = keepSnapshots;
        state.settings = Object.assign(state.settings, result.settings || {});
        if (result.lang) state.lang = result.lang;
        if (result.theme) state.theme = result.theme;
        audit("state.import", { tasks: state.data.tasks.length, auditEntries: state.data.audit.length });
        save(); render(); toast(t("toast.imported"));
      } catch (e) { toast(t("toast.importFailed")); }
    };
    reader.readAsText(file);
  }

  function mdReport() {
    var cs = compStats(), rs = riskStats(), ds = delivStats(), pd = planDone();
    var lines = [];
    lines.push("# " + SP.meta.project + " — " + (state.lang === "tr" ? "CISO Durum Raporu" : "CISO Status Report"));
    lines.push("");
    lines.push("_" + new Date().toISOString().slice(0, 10) + " · " + (state.settings.ciso || "CISO") + " · Lotus Sirius · WP3_");
    lines.push("");
    lines.push("## " + (state.lang === "tr" ? "Yönetici özeti" : "Executive summary"));
    lines.push("- " + (state.lang === "tr" ? "Uyum hazırlığı" : "Compliance readiness") + ": " + pct(cs.overall) + " (" + cs.applicable + " " + (state.lang === "tr" ? "uygulanabilir kontrol" : "applicable controls") + ")");
    lines.push("- " + (state.lang === "tr" ? "Riskler" : "Risks") + ": " + rs.critical + " " + (state.lang === "tr" ? "kritik" : "critical") + ", " + rs.high + " " + (state.lang === "tr" ? "yüksek" : "high") + ", " + rs.open + " " + (state.lang === "tr" ? "açık" : "open"));
    lines.push("- " + (state.lang === "tr" ? "Çıktılar" : "Deliverables") + ": " + ds.done + "/" + ds.total + " " + (state.lang === "tr" ? "tamam" : "done") + ", " + ds["in-progress"] + " " + (state.lang === "tr" ? "devam" : "in progress"));
    lines.push("- " + (state.lang === "tr" ? "90 günlük plan" : "90-day plan") + ": " + pd.done + "/" + pd.all + " (" + pct(pd.p) + ")");
    lines.push("");
    lines.push("## " + (state.lang === "tr" ? "Çerçeve bazında hazırlık" : "Readiness by framework"));
    Object.keys(cs.by).forEach(function (k) {
      lines.push("- " + k + ": " + pct(cs.by[k].p) + " (" + cs.by[k].n + " " + (state.lang === "tr" ? "kontrol" : "controls") + ")");
    });
    lines.push("");
    lines.push("## " + (state.lang === "tr" ? "En yüksek riskler" : "Top risks"));
    SP.risks.slice().sort(function (a, b) { return riskScore(b) - riskScore(a); }).slice(0, 8).forEach(function (r) {
      lines.push("- **" + r.id + "** (" + riskScore(r) + ", " + (state.lang === "tr" ? "sahip" : "owner") + ": " + r.owner + ") " + L(r.t));
    });
    lines.push("");
    lines.push("## " + (state.lang === "tr" ? "Kanıt kaydı" : "Evidence log"));
    var evRows = SP.allCompliance.map(function (r) {
      var k = "comp|" + r.id + "|";
      return {
        r: r,
        ref: state.data.notes[k + "ref"] || "",
        note: state.data.notes[k + "note"] || "",
        date: state.data.notes[k + "verifiedOn"] || "",
        by: state.data.notes[k + "verifiedBy"] || ""
      };
    }).filter(function (x) { return x.ref || x.note || x.date || x.by; });
    if (!evRows.length) {
      lines.push("- " + (state.lang === "tr" ? "Kayıtlı kanıt notu yok." : "No evidence recorded."));
    }
    evRows.forEach(function (x) {
      lines.push("- **" + x.r.id + "** (" + x.r.fw + ") " + L(x.r.req));
      if (x.ref) lines.push("  - " + (state.lang === "tr" ? "Referans" : "Reference") + ": `" + x.ref + "`");
      if (x.note) lines.push("  - " + (state.lang === "tr" ? "Not" : "Note") + ": " + x.note);
      if (x.date) lines.push("  - " + (state.lang === "tr" ? "Doğrulama tarihi" : "Verified on") + ": `" + x.date + "`");
      if (x.by) lines.push("  - " + (state.lang === "tr" ? "Doğrulayan" : "Verified by") + ": " + x.by);
    });
    lines.push("");
    lines.push("## " + (state.lang === "tr" ? "Sonraki teslim tarihleri" : "Next due dates"));
    SP.deliverables.slice().sort(function (a, b) { return parseInt(a.due.slice(1), 10) - parseInt(b.due.slice(1), 10); }).forEach(function (d) {
      lines.push("- " + d.id + " — " + L(d.t) + " (" + d.due + ", " + (state.lang === "tr" ? "sorumlu" : "lead") + ": " + d.lead + ")");
    });
    lines.push("");
    lines.push("> " + (state.lang === "tr" ? "Yerel portal durumundan üretilmiştir; resmî raporlama öncesi koordinatörle doğrulayın." : "Generated from the local portal state; verify with the coordinator before official reporting."));
    return lines.join("\n");
  }
  SP.statusReport = mdReport;

  /* ---------------- document helpers ---------------- */
  SP.docById = function (id) {
    return (SP.docs || []).filter(function (d) { return d.id === id; })[0];
  };
  SP.docMarkdown = function (doc) {
    var dm = (state.data.docMeta || {})[doc.id] || {};
    var out = [];
    out.push("# " + L(doc.title));
    out.push("");
    out.push("| " + t("doc.field.code") + " | " + doc.code + " |");
    out.push("| --- | --- |");
    out.push("| " + t("doc.field.owner") + " | " + doc.owner + " |");
    out.push("| " + t("doc.field.version") + " | " + (dm.version || doc.version) + " |");
    out.push("| " + t("doc.field.approval") + " | " + (dm.approval || doc.approval) + " |");
    out.push("| " + t("doc.field.review") + " | " + (dm.review || doc.review) + " |");
    out.push("");
    out.push("**" + t("doc.field.purpose") + ":** " + L(doc.purpose));
    out.push("");
    doc.sections.forEach(function (s) {
      out.push("## " + L(s.h));
      out.push("");
      (s.p || []).forEach(function (p) { out.push(L(p)); out.push(""); });
      (s.list || []).forEach(function (li) { out.push("- " + L(li)); });
      out.push("");
    });
    out.push("---");
    out.push("SAFE-PARKS · Lotus Sirius · " + (state.settings.ciso || "CISO"));
    return out.join("\n");
  };

  /* ---------------- views: dashboard ---------------- */
  SP.views.dashboard = {
    render: function () {
      var cs = compStats(), rs = riskStats(), ds = delivStats(), pd = planDone();
      var h = '<div class="hero">' +
        '<div class="eyebrow" lang="en" style="text-transform:none">' + esc(SP.meta.programme + " · " + SP.meta.call) + "</div>" +
        "<h1>" + esc(SP.meta.project) + " — " + esc(t("dash.h1")) + "</h1>" +
        '<p class="lede">' + esc(L(SP.meta.tagline)) + "</p>" +
        '<div class="hero-tags">' +
        '<span class="pill pill-accent">' + esc(t("dash.role")) + "</span>" +
        '<span class="pill">WP3 ' + esc(t("dash.lead")) + "</span>" +
        '<span class="pill">' + num(SP.meta.partnerCount) + " " + esc(t("dash.partners")) + "</span>" +
        '<span class="pill">' + num(SP.meta.cityCount) + " " + esc(t("dash.cities")) + "</span>" +
        '<span class="pill">' + esc(money(SP.meta.totalBudget)) + "</span>" +
        '<span class="pill">' + esc(money(SP.meta.wp3Budget)) + " WP3</span>" +
        "</div></div>";

      h += '<div class="grid g4" style="margin-bottom:14px">' +
        kpi(t("dash.kpi.readiness"), pct(cs.overall), cs.applicable + " " + t("dash.kpi.controls"), true) +
        kpi(t("dash.kpi.risk"), String(rs.critical + rs.high), rs.critical + " " + t("dash.crit") + " · " + rs.open + " " + t("dash.open"), false) +
        kpi(t("dash.kpi.deliv"), ds.done + "/" + ds.total, ds["in-progress"] + " " + t("dash.inProgress"), false) +
        kpi(t("dash.kpi.plan"), pct(pd.p), pd.done + "/" + pd.all + " " + t("dash.actions"), false) +
        "</div>";

      h += '<div class="grid g-2-1">';

      /* posture */
      var fwKeys = Object.keys(cs.by);
      var bars = fwKeys.map(function (k) {
        return '<div style="margin-bottom:11px"><div class="row-between" style="margin-bottom:4px">' +
          '<span class="t-strong tiny">' + esc(k) + '</span><span class="tiny t-muted mono">' + pct(cs.by[k].p) + " · " + cs.by[k].n + "</span></div>" +
          meter(cs.by[k].p) + "</div>";
      }).join("");
      h += card(cardHead(t("dash.posture"), t("dash.postureSub"),
        '<a class="btn btn-sm" href="#compliance">' + esc(t("dash.openMatrix")) + "</a>") + bars +
        '<div class="legend" style="margin-top:6px"><span><i style="background:var(--ok)"></i>' + esc(t("status.ready")) + "</span>" +
        '<span><i style="background:var(--warn)"></i>' + esc(t("status.partial")) + "</span>" +
        '<span><i style="background:var(--danger)"></i>' + esc(t("status.gap")) + "</span></div>");

      /* attention */
      var att = [];
      if (cs.counts.gap) att.push('<div class="row" style="gap:8px"><span class="badge badge-gap">' + cs.counts.gap + "</span><span>" + esc(t("dash.att.gap")) + "</span></div>");
      if (rs.critical) att.push('<div class="row" style="gap:8px"><span class="badge badge-gap">' + rs.critical + "</span><span>" + esc(t("dash.att.critRisk")) + "</span></div>");
      var dueSoon = SP.deliverables.filter(function (d) { return ["D3.1", "D2.2", "D1.2"].indexOf(d.id) >= 0; });
      att.push('<div class="row" style="gap:8px"><span class="badge badge-info">' + dueSoon.length + "</span><span>" + esc(t("dash.att.nearTerm")) + "</span></div>");
      att.push('<div class="row" style="gap:8px"><span class="badge badge-partial">' + cs.counts.partial + "</span><span>" + esc(t("dash.att.partial")) + "</span></div>");
      h += card(cardHead(t("dash.attention"), t("dash.attentionSub")) +
        '<div class="stack-sm">' + att.join("") + "</div>" +
        '<div style="margin-top:12px">' + callout(esc(t("dash.att.note")), "", "!") + "</div>");

      h += "</div>";

      /* next deadlines + heat */
      h += '<div class="grid g2" style="margin-top:14px">';
      var sorted = SP.deliverables.slice().sort(function (a, b) { return parseInt(a.due.slice(1), 10) - parseInt(b.due.slice(1), 10); }).slice(0, 6);
      h += card(cardHead(t("dash.nextDue"), t("dash.nextDueSub"),
        '<a class="btn btn-sm" href="#deliverables">' + esc(t("dash.allDeliv")) + "</a>") +
        '<div class="timeline">' + sorted.map(function (d) {
          return '<div class="tl-item"><div class="tl-when">' + esc(d.due) + " · " + esc(d.id) + "</div><h4>" + esc(L(d.t)) +
            '</h4><p>' + esc(d.lead) + " · " + esc(L(d.role)) + "</p></div>";
        }).join("") + "</div>");

      h += card(cardHead(t("dash.heat"), t("dash.heatSub"),
        '<a class="btn btn-sm" href="#risks">' + esc(t("dash.openRegister")) + "</a>") + heatMini() +
        '<p class="hint" style="margin-top:10px">' + esc(t("dash.heatNote")) + "</p>");
      h += "</div>";

      /* quick modules */
      h += '<div class="grid g3" style="margin-top:14px">';
      var quick = [
        { r: "privacy", k: "dash.q.privacy", d: "dash.q.privacySub" },
        { r: "architecture", k: "dash.q.arch", d: "dash.q.archSub" },
        { r: "incidents", k: "dash.q.ir", d: "dash.q.irSub" }
      ];
      quick.forEach(function (q) {
        h += '<a class="card" href="#' + q.r + '"><div class="card-head"><div><h3>' + esc(t(q.k)) + "</h3><p>" + esc(t(q.d)) + "</p></div>" +
          '<span class="card-ico"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8">' + ICONS[q.r] + "</svg></span></div>" +
          '<span class="tiny" style="color:var(--accent)">' + esc(t("common.openView")) + " →</span></a>";
      });
      h += "</div>";

      if (SP.manage) {
        var mh = SP.manage.health(state.data, null, SP.decisions.map(function (d) { return d.id; }));
        var mgmtRows = [
          [mh.tasks.overdue, L({ en: "Overdue tasks", tr: "Gecikmiş görev" })],
          [mh.pendingDecisions, L({ en: "Pending decisions", tr: "Bekleyen karar" })],
          [mh.expiredAcceptances, L({ en: "Expired risk acceptances", tr: "Süresi geçmiş risk kabulü" })],
          [mh.auditEntries, L({ en: "Audit entries", tr: "Denetim kaydı" })]
        ].map(function (x) {
          return '<div class="row-between"><span class="tiny t-muted">' + esc(x[1]) + '</span><strong class="mono">' + x[0] + "</strong></div>";
        }).join("");
        h += '<div style="margin-top:14px">' + card(cardHead(
          L({ en: "Management attention", tr: "Yönetim gündemi" }),
          L({ en: "Tasks, approvals and audit", tr: "Görevler, onaylar ve denetim" }),
          '<a class="btn btn-sm" href="#management">' + esc(L({ en: "Open console", tr: "Konsolu aç" })) + "</a>") +
          '<div class="stack-sm">' + mgmtRows + "</div>" +
          '<p class="hint" style="margin-top:9px">' + esc(L({ en: "Local-first console. A server-side backend is still required for shared multi-user editing.", tr: "Yerel öncelikli konsol. Ortak çok kullanıcılı düzenleme için hâlâ sunucu tarafı backend gerekir." })) + "</p></div>");
      }

      h += '<div style="margin-top:14px">' + callout("<strong>" + esc(t("dash.provenance")) + "</strong> " + esc(t("dash.provenanceBody")), "", "i") + "</div>";
      return h;
    }
  };

  function heatMini() {
    var cells = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 12: 0, 15: 0, 16: 0, 20: 0, 25: 0, 4: 0, 5: 0 };
    SP.risks.forEach(function (r) { cells[riskScore(r)] = (cells[riskScore(r)] || 0) + 1; });
    var html = "";
    for (var i = 5; i >= 1; i--) {
      html += '<div class="heat-axis">' + i + "</div>";
      for (var j = 1; j <= 5; j++) {
        var s = i * j, n = cells[s] || 0;
        html += '<div class="heat-cell h' + (s >= 20 ? 5 : s >= 12 ? 4 : s >= 6 ? 3 : s >= 3 ? 2 : 1) + (n ? "" : " empty") + '" title="L' + i + " × I" + j + ' = ' + s + '">' + (n ? n : "·") + "</div>";
      }
    }
    html += '<div class="heat-axis"></div>';
    for (var k = 1; k <= 5; k++) html += '<div class="heat-axis">' + k + "</div>";
    return '<div class="heat">' + html + "</div>";
  }

  /* ---------------- views: project ---------------- */
  SP.views.project = {
    render: function () {
      var b = SP.budgetCheck;
      var total = b.total;
      var parts = SP.partners.slice().sort(function (a, c) { return c.budget - a.budget; });
      var max = parts[0].budget;
      var h = head(t("proj.eyebrow"), t("proj.title"), t("proj.lede"));

      h += '<div class="grid g4" style="margin-bottom:14px">' +
        kpi(t("proj.kpi.total"), money(total), t("proj.kpi.totalNote"), true) +
        kpi(t("proj.kpi.wp3"), money(SP.meta.wp3Budget), pct((SP.meta.wp3Budget / total) * 100) + " " + t("proj.kpi.ofTotal"), false) +
        kpi(t("proj.kpi.muni"), money(b.municipalities), pct((b.municipalities / total) * 100) + " · 7 × " + money(440000), false) +
        kpi(t("proj.kpi.partners"), money(b.partners * b.partnerCount), b.partnerCount + " × " + money(285000), false) +
        "</div>";

      h += '<div class="grid g-2-1">';
      var rows = parts.map(function (p) {
        return "<td>" + esc(p.id) + "</td><td><strong>" + esc(p.name) + "</strong></td><td>" + esc(p.country) + "</td>" +
          "<td>" + esc(L(p.type)) + "</td><td class=\"num\">" + money(p.budget) + "</td>" +
          '<td style="min-width:120px">' + meter((p.budget / max) * 100) + "</td>";
      });
      h += card(cardHead(t("proj.budgetTitle"), t("proj.budgetSub")) +
        table([{ label: t("common.id") }, { label: t("common.name") }, { label: t("proj.country") }, { label: t("proj.type") }, { label: t("proj.budget"), num: true }, { label: t("proj.share") }], rows) +
        '<div class="legend" style="margin-top:10px"><span>' + esc(t("proj.muniNote")) + "</span></div>");

      h += '<div class="stack">';
      h += card(cardHead(t("proj.check.title"), t("proj.check.sub")) +
        '<div class="split-list">' +
        '<div><div class="k">' + esc(t("proj.check.muni")) + '</div><div class="v mono">' + money(b.municipalities) + " = " + pct((b.municipalities / total) * 100) + "</div></div>" +
        '<div><div class="k">' + esc(t("proj.check.coord")) + '</div><div class="v mono">' + money(b.coordinator) + " = " + pct((b.coordinator / total) * 100) + "</div></div>" +
        '<div><div class="k">' + esc(t("proj.check.partners")) + '</div><div class="v mono">4 × ' + money(285000) + " = " + money(1140000) + " = " + pct((1140000 / total) * 100) + "</div></div>" +
        '<div><div class="k">' + esc(t("proj.check.total")) + '</div><div class="v mono"><strong>' + money(total) + "</strong></div></div>" +
        "</div>" + callout(esc(t("proj.check.note")), "", "✓"));

      var asm = (SP.meta.assumptions || []).map(function (a) {
        return '<li>' + esc(L(a)) + "</li>";
      }).join("");
      h += card(cardHead(t("proj.assume.title"), t("proj.assume.sub")) +
        '<div class="callout warn"><span class="ci">!</span><div><ul style="margin:0;padding-left:1rem">' + asm + "</ul></div></div>" +
        '<div style="margin-top:10px">' + tags([t("proj.assume.tag1"), t("proj.assume.tag2"), t("proj.assume.tag3")]) + "</div>");
      h += "</div></div>";

      var wps = SP.wps.map(function (w) {
        return "<td class=\"col-id\">" + esc(w.id) + "</td><td><strong>" + esc(L(w.name)) + "</strong></td><td>" + esc(typeof w.lead === "string" ? w.lead : L(w.lead)) + "</td>" +
          "<td>" + esc(L(w.ls)) + "</td><td class=\"nowrap\">" + esc(w.months) + "</td>";
      });
      h += '<div style="margin-top:14px">' + card(cardHead(t("proj.wpTitle"), t("proj.wpSub")) +
        table([{ label: t("common.id") }, { label: t("proj.wpName") }, { label: t("proj.lead") }, { label: t("proj.lsRole") }, { label: t("proj.months") }], wps)) + "</div>";

      h += '<div class="grid g3" style="margin-top:14px">';
      h += card(cardHead(t("proj.model.title"), "") + '<p style="color:var(--text-2);font-size:12.8px">' + esc(t("proj.model.body")) + "</p>");
      h += card(cardHead(t("proj.govern.title"), "") + '<p style="color:var(--text-2);font-size:12.8px">' + esc(t("proj.govern.body")) + "</p>");
      h += card(cardHead(t("proj.countries.title"), "") + tags(SP.meta.countries));
      h += "</div>";
      return h;
    }
  };

  /* ---------------- views: governance ---------------- */
  SP.views.governance = {
    render: function () {
      var g = SP.governance;
      var h = head(t("gov.eyebrow"), t("gov.title"), t("gov.lede"));

      h += '<div class="grid g2" style="margin-bottom:14px">';
      h += card(cardHead(t("gov.roles"), t("gov.rolesSub")) +
        '<div class="stack-sm">' + g.roles.map(function (r) {
          return '<div style="border:1px solid var(--line);border-radius:10px;padding:11px 13px">' +
            '<div class="row-between"><strong style="font-size:13px">' + esc(typeof r.role === "string" ? r.role : L(r.role)) + "</strong>" +
            '<span class="pill">' + esc(r.org) + "</span></div>" +
            '<p class="tiny" style="color:var(--muted);margin-top:5px">' + esc(L(r.duty)) + "</p>" +
            '<p class="tiny" style="margin-top:5px"><span class="mono" style="color:var(--accent)">KPI</span> ' + esc(L(r.kpi)) + "</p></div>";
        }).join("") + "</div>");
      h += card(cardHead(t("gov.decisions"), t("gov.decisionsSub")) +
        table([{ label: t("gov.decision") }, { label: t("gov.who") }],
          g.decisionRights.map(function (d) {
            return "<td><strong>" + esc(L(d.d)) + "</strong><div class=\"tiny t-muted\" style=\"margin-top:3px\">" + esc(L(d.note)) + "</div></td><td class=\"nowrap\">" + esc(d.who) + "</td>";
          })) +
        '<div class="legend" style="margin-top:10px"><span class="pill pill-warn">' + esc(t("gov.escalation")) + "</span></div>");
      h += "</div>";

      /* decisions requested — status flows into the two-page brief and its Excel/Word table */
      var decRows = (SP.decisions || []).map(function (d) {
        var cur = (state.data.decisions || {})[d.id] || "pending";
        return "<td><strong>" + esc(L(d.t)) + '</strong><div class="tiny t-muted" style="margin-top:3px">' + esc(L(d.detail)) + "</div></td>" +
          '<td class="nowrap">' + esc(L(d.owner)) + "</td>" +
          '<td class="nowrap mono">' + esc(d.due) + "</td>" +
          "<td>" + statusSelect("decisions", d.id, cur, ["pending", "approved", "rejected"]) + "</td>";
      });
      h += '<div style="margin-bottom:14px">' + card(cardHead(t("gov.decisionsReq"), t("gov.decisionsReqSub")) +
        table([{ label: t("gov.decision") }, { label: t("gov.decisionsOwner") }, { label: t("gov.decisionsBy") }, { label: t("common.status") }], decRows) +
        '<div class="legend" style="margin-top:8px"><span>' + esc(t("gov.decisionsNote")) + "</span></div>") + "</div>";

      var cols = [{ label: t("gov.activity") }].concat(g.raci.cols.map(function (c) { return { label: c }; }));
      var rows = g.raci.rows.map(function (r) {
        return "<td>" + esc(L(r.a)) + "</td>" + r.v.map(function (v) {
          var tone = v.indexOf("A") >= 0 ? "badge-gap" : v.indexOf("R") >= 0 ? "badge-info" : v.indexOf("C") >= 0 ? "badge-partial" : "badge-na";
          return '<td><span class="badge ' + tone + '">' + esc(v) + "</span></td>";
        }).join("");
      });
      h += card(cardHead(t("gov.raci"), t("gov.raciSub")) + table(cols, rows) +
        '<div class="legend" style="margin-top:10px">' + Object.keys(g.raci.legend).map(function (k) {
          return "<span><strong class=\"mono\">" + esc(k) + "</strong> " + esc(L(g.raci.legend[k])) + "</span>";
        }).join("") + "</div>");

      h += '<div class="grid g2" style="margin-top:14px">';
      h += card(cardHead(t("gov.epab"), t("gov.epabSub")) +
        '<div class="split-list">' +
        '<div><div class="k">' + esc(t("gov.epabMandate")) + '</div><div class="v">' + esc(L(g.epab.mandate)) + "</div></div>" +
        '<div><div class="k">' + esc(t("gov.epabComp")) + '</div><div class="v">' + esc(L(g.epab.composition)) + "</div></div>" +
        '<div><div class="k">' + esc(t("gov.epabCadence")) + '</div><div class="v">' + esc(L(g.epab.cadence)) + "</div></div>" +
        '<div><div class="k">' + esc(t("gov.epabQuorum")) + '</div><div class="v">' + esc(L(g.epab.quorum)) + "</div></div>" +
        '<div><div class="k">' + esc(t("gov.epabCiso")) + '</div><div class="v">' + esc(L(g.epab.cisoObligations)) + "</div></div>" +
        "</div>");
      h += card(cardHead(t("gov.interfaces"), t("gov.interfacesSub")) +
        SP.wp3Interfaces.map(function (i) {
          return '<div style="padding:9px 0;border-bottom:1px solid var(--line-soft)"><div class="row-between"><strong style="font-size:12.5px">' + esc(i.with) + "</strong></div>" +
            '<p class="tiny" style="color:var(--muted);margin-top:3px">' + esc(L(i.item)) + "</p>" +
            '<p class="tiny" style="margin-top:3px"><span class="mono" style="color:var(--accent)">' + esc(t("gov.interfacesMech")) + '</span> ' + esc(L(i.mech)) + "</p></div>";
        }).join(""));
      h += "</div>";
      return h;
    }
  };

  /* ---------------- views: mandate ---------------- */
  SP.views.mandate = {
    render: function () {
      var m = SP.mandate, pd = planDone();
      var h = head(t("man.eyebrow"), t("man.title"), t("man.lede"));

      h += '<div class="grid g-2-1">';
      h += card(cardHead(t("man.charter"), t("man.charterSub")) +
        '<ol style="padding-left:1.15rem;color:var(--text-2);font-size:12.8px">' + m.charter.map(function (c) {
          return "<li style=\"margin-bottom:7px\">" + esc(L(c)) + "</li>";
        }).join("") + "</ol>");
      h += card(cardHead(t("man.appetite"), t("man.appetiteSub")) +
        '<p style="color:var(--text-2);font-size:12.6px">' + esc(L(SP.risksAppetite.statement)) + "</p>" +
        '<div class="stack-sm" style="margin-top:12px">' + SP.risksAppetite.thresholds.map(function (x) {
          return '<div class="row" style="gap:9px"><span class="pill pill-' + (x.tone === "danger" ? "danger" : x.tone === "warn" ? "warn" : x.tone === "info" ? "info" : "ok") + '">' + esc(L(x.band)) + "</span>" +
            '<span class="tiny t-muted">' + esc(L(x.action)) + "</span></div>";
        }).join("") + "</div>");
      h += "</div>";

      h += '<div style="margin-top:14px">' + card(cardHead(t("man.objectives"), t("man.objectivesSub")) +
        table([{ label: t("common.id") }, { label: t("man.objective") }, { label: t("man.target") }, { label: t("man.kpi") }],
          m.objectives.map(function (o, i) {
            return '<td class="col-id">O' + (i + 1) + "</td><td><strong>" + esc(L(o.o)) + "</strong></td><td class=\"nowrap\">" + esc(o.target) + "</td><td>" + esc(L(o.kpi)) + "</td>";
          }))) + "</div>";

      h += '<div class="grid g-1-2" style="margin-top:14px">';
      h += card(cardHead(t("man.plan"), t("man.planSub")) +
        '<div class="row" style="gap:12px;margin-bottom:10px"><div style="flex:1">' + meterRow(pd.p) + "</div></div>" +
        '<p class="tiny t-muted">' + pd.done + " / " + pd.all + " " + esc(t("man.actionsDone")) + "</p>" +
        callout(esc(t("man.planNote")), "", "→"));
      var phases = m ? SP.plan90.map(function (p) {
        return '<div style="margin-bottom:16px"><div class="row-between" style="margin-bottom:6px">' +
          '<strong style="font-size:12.8px">' + esc(L(p.phase)) + "</strong></div>" +
          '<p class="tiny t-muted" style="margin-bottom:7px">' + esc(L(p.goal)) + "</p>" +
          '<div class="checklist">' + p.actions.map(function (a) {
            var on = !!state.data.checks[a.id];
            return '<label class="check ' + (on ? "done" : "") + '"><input type="checkbox" data-check="' + esc(a.id) + '"' + (on ? " checked" : "") + "><span>" + esc(L(a.t)) + "</span></label>";
          }).join("") + "</div></div>";
      }).join("") : "";
      h += card(phases);
      h += "</div>";
      return h;
    }
  };

  /* ---------------- global events ---------------- */
  function bindEvents() {
    document.addEventListener("click", function (e) {
      var langBtn = e.target.closest("[data-lang]");
      if (langBtn) {
        state.lang = langBtn.getAttribute("data-lang");
        save(); render();
        return;
      }
      var navA = e.target.closest("[data-nav]");
      if (navA && navA.tagName === "A") {
        state.ui = {};
        return; /* hash router handles it */
      }
      var theme = e.target.closest("#themeBtn");
      if (theme) {
        state.theme = state.theme === "dark" ? "light" : "dark";
        applyChrome(); save();
        return;
      }
      if (e.target.closest("#printBtn")) { window.print(); return; }
      var menuBtn = e.target.closest("#dataBtn");
      if (menuBtn) {
        var m = el("dataMenu");
        var open = m.hasAttribute("hidden");
        if (open) { m.hidden = false; menuBtn.setAttribute("aria-expanded", "true"); }
        else closeMenu();
        return;
      }
      var act = e.target.closest("[data-act]");
      if (act) {
        var a = act.getAttribute("data-act");
        closeMenu();
        if (a === "export-json") exportJson();
        if (a === "import-json") el("importFile").click();
        if (a === "export-md") download("safeparks-ciso-report.md", mdReport(), "text/markdown;charset=utf-8");
        if (a === "export-csv") exportEvidenceCsv();
        if (a === "export-missing-csv") exportMissingEvidenceCsv();
        if (a === "export-brief") exportBriefState();
        if (a === "reset") {
          if (window.confirm(t("menu.resetConfirm"))) {
            SP.manage.createSnapshot(state.data, "before reset", actor());
            var keepAudit = (state.data.audit || []).slice();
            var keepSnapshots = (state.data.snapshots || []).slice();
            state.data = { comp: {}, risks: {}, deliv: {}, checks: {}, notes: {}, gono: {}, gonoArchive: [], decisions: {}, cityRisks: {}, cityRiskMeta: {}, decisionMeta: {}, riskAcceptance: {}, kpi: {}, budgetActual: {}, docMeta: {}, tasks: [], audit: keepAudit, snapshots: keepSnapshots, meta: { schemaVersion: 2 } };
            audit("state.reset", {});
            save(); render(); toast(t("toast.reset"));
          }
        }
        return;
      }
      var evSave = e.target.closest("[data-evidence-save]");
      if (evSave) {
        var evCell = evSave.closest("[data-evidence-entry]");
        var evKeys = [];
        if (evCell) {
          evCell.querySelectorAll("[data-note]").forEach(function (n) {
            var key = n.getAttribute("data-note");
            state.data.notes[key] = n.value;
            evKeys.push(key);
          });
        }
        audit("evidence.save", { keys: evKeys });
        save();
        render();
        toast(t("evp.saved"));
        return;
      }
      if (e.target.closest("#logoutBtn")) { signOut(); return; }
      var linkChip = e.target.closest("[data-link]");
      if (linkChip) {
        var lk = String(linkChip.getAttribute("data-link")).split(":");
        var lkKind = lk[0], lkId = lk[1];
        if (lkKind === "comp") { state.ui.compq = lkId; state.ui.compfw = ""; state.ui.compst = ""; }
        else if (lkKind === "risk") { state.ui.riskq = lkId; state.ui.riskcat = ""; state.ui.riskCity = ""; state.ui.riskCell = ""; }
        else { state.ui.gonoItem = lkId; }
        var target = lkKind === "comp" ? "compliance" : lkKind === "risk" ? "risks" : "gono";
        if (location.hash === "#" + target) window.dispatchEvent(new Event("hashchange"));
        else location.hash = target;
        setTimeout(function () {
          var row = document.querySelector("tr.row-focus");
          if (row) row.scrollIntoView({ block: "center" });
        }, 90);
        return;
      }
      var docDl = e.target.closest("[data-doc-md]");
      if (docDl) {
        var doc = SP.docById(docDl.getAttribute("data-doc-md"));
        if (doc) download(doc.id + "-" + state.lang + ".md", SP.docMarkdown(doc), "text/markdown;charset=utf-8");
        return;
      }
      var heatPrint = e.target.closest("[data-print-heat]");
      if (heatPrint) {
        SP.printCityHeat(heatPrint.getAttribute("data-print-heat"));
        return;
      }
      var heatCell = e.target.closest("[data-heat]");
      if (heatCell) {
        var heatVal = heatCell.getAttribute("data-heat");
        state.ui.riskCell = state.ui.riskCell === heatVal ? "" : heatVal;
        render();
        return;
      }
      var cityMetaSave = e.target.closest("[data-citymeta-save]");
      if (cityMetaSave) {
        var cmId = cityMetaSave.getAttribute("data-citymeta-save");
        var cmCard = cityMetaSave.closest("[data-citymeta-card]");
        var cm = {};
        if (cmCard) {
          cmCard.querySelectorAll("[data-citymeta]").forEach(function (n) {
            var field = String(n.getAttribute("data-citymeta")).split("|")[1];
            var value = String(n.value || "").trim();
            if (value) cm[field] = value;
          });
        }
        if (!state.data.cityRiskMeta) state.data.cityRiskMeta = {};
        if (Object.keys(cm).length) state.data.cityRiskMeta[cmId] = cm;
        else delete state.data.cityRiskMeta[cmId];
        audit("risk.citymeta", { city: cmId, fields: Object.keys(cm) });
        save();
        render();
        toast(t("risk.cityMetaSaved"));
        return;
      }
      var cityReset = e.target.closest("[data-cityreset]");
      if (cityReset) {
        var resetId = cityReset.getAttribute("data-cityreset");
        if (state.data.cityRisks) {
          delete state.data.cityRisks[resetId];
          save();
          render();
        }
        return;
      }
      var chip = e.target.closest("[data-chip]");
      if (chip) {
        var key = chip.getAttribute("data-chip");
        var val = chip.getAttribute("data-val");
        state.ui[key] = state.ui[key] === val ? "" : val;
        if (key === "riskCity") state.ui.riskCell = "";
        render();
        return;
      }
      if (!e.target.closest(".menu-wrap")) closeMenu();
      if (e.target.closest("#menuBtn")) {
        var sb = el("sidebar"), sc = el("scrim");
        var isOpen = sb.classList.toggle("open");
        sc.hidden = !isOpen;
        e.target.closest("#menuBtn").setAttribute("aria-expanded", String(isOpen));
        return;
      }
      if (e.target.closest("#scrim")) { closeSidebar(); return; }
      if (e.target.closest("#docBack")) { location.hash = "docs"; return; }
    });

    document.addEventListener("change", function (e) {
      var ec = e.target.closest("[data-evidencecity]");
      if (ec) { state.ui.evidenceCity = ec.value; render(); return; }
      var cp = e.target.closest("[data-citypick]");
      if (cp) { state.ui.riskCity = cp.value; state.ui.riskCell = ""; render(); return; }
      var cr = e.target.closest("[data-cityrisk]");
      if (cr) {
        var parts = cr.getAttribute("data-cityrisk").split("|");
        var cid = parts[0], rid = parts[1], axis = parts[2];
        var risk = SP.risks.filter(function (r) { return r.id === rid; })[0];
        if (risk) {
          var cur = cityRiskScore(cid, risk);
          var val = parseInt(cr.value, 10);
          var next = { l: axis === "l" ? val : cur.l, i: axis === "i" ? val : cur.i };
          if (!state.data.cityRisks) state.data.cityRisks = {};
          if (!state.data.cityRisks[cid]) state.data.cityRisks[cid] = {};
          if (next.l === risk.l && next.i === risk.i) {
            delete state.data.cityRisks[cid][rid];
            if (!Object.keys(state.data.cityRisks[cid]).length) delete state.data.cityRisks[cid];
          } else {
            state.data.cityRisks[cid][rid] = next;
          }
          audit("risk.cityscore", { city: cid, risk: rid, before: cur, after: next });
          save();
          render();
        }
        return;
      }
      var s = e.target.closest("[data-status]");
      if (s) {
        var kind = s.getAttribute("data-status");
        var id = s.getAttribute("data-id");
        if (!state.data[kind]) state.data[kind] = {};
        var statusBefore = state.data[kind][id] || "(default)";
        state.data[kind][id] = s.value;
        audit("status.change", { kind: kind, id: id, before: statusBefore, after: s.value });
        s.setAttribute("data-v", s.value);
        save();
        applyChrome();
        return;
      }
      var c = e.target.closest("[data-check]");
      if (c) {
        var checkId = c.getAttribute("data-check");
        state.data.checks[checkId] = c.checked;
        audit("action.toggle", { id: checkId, done: c.checked });
        var lab = c.closest(".check");
        if (lab) lab.classList.toggle("done", c.checked);
        save();
        var p = state.route.split("/")[0];
        if (p === "mandate") applyChrome();
        return;
      }
      var imp = e.target.closest("#importFile");
      if (imp && imp.files && imp.files[0]) { importJson(imp.files[0]); imp.value = ""; return; }
    });

    document.addEventListener("input", function (e) {
      var f = e.target.closest("[data-filter]");
      if (f) {
        state.ui[f.getAttribute("data-filter")] = f.value;
        var v = state.route.split("/")[0];
        clearTimeout(f._t);
        f._t = setTimeout(function () {
          var host = el("view");
          var pos = f.selectionStart;
          host.innerHTML = SP.views[v].render(state.route.split("/")[1] || "");
          var again = host.querySelector('[data-filter="' + f.getAttribute("data-filter") + '"]');
          if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (err) {} }
        }, 180);
        return;
      }
      var st = e.target.closest("[data-setting]");
      if (st) {
        state.settings[st.getAttribute("data-setting")] = st.value;
        save(); applyChrome();
        return;
      }
      var nt = e.target.closest("[data-note]");
      if (nt) {
        state.data.notes[nt.getAttribute("data-note")] = nt.value;
        save();
      }
    });

    document.addEventListener("focusout", function (e) {
      var setting = e.target.closest("[data-setting]");
      if (setting) {
        audit("settings.change", { field: setting.getAttribute("data-setting"), value: setting.value });
        save();
        return;
      }
      var cell = e.target.closest("[data-evidence-entry]");
      if (!cell || state.route.split("/")[0] !== "evidence") return;
      var next = e.relatedTarget;
      if (next && next.closest && next.closest("[data-evidence-entry]")) return;
      var id = cell.getAttribute("data-evidence-entry");
      var notes = state.data.notes || {};
      var ref = String(notes["comp|" + id + "|ref"] || "").trim();
      var note = String(notes["comp|" + id + "|note"] || "").trim();
      if (ref || note) render();
    });

    document.addEventListener("keydown", function (e) {
      var evInput = e.target.closest("[data-evidence-entry] [data-note]");
      if (evInput && e.key === "Enter") {
        e.preventDefault();
        evInput.blur();
        return;
      }
      if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-chip][role='button']")) {
        e.preventDefault();
        e.target.click();
      }
    });

    window.addEventListener("hashchange", render);
  }

  /* ---------------- boot ---------------- */
  function boot() {
    load();
    document.documentElement.setAttribute("data-theme", state.theme);
    document.documentElement.lang = state.lang;
    bindEvents();
    render();
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches && !localStorage.getItem(STORE_KEY)) {
      state.theme = "dark";
    }
    var lastActivity = Date.now();
    function touch() { lastActivity = Date.now(); }
    document.addEventListener("pointerdown", touch, { passive: true });
    document.addEventListener("keydown", touch);
    setInterval(function () {
      if (Date.now() - lastActivity > 30 * 60 * 1000) signOut();
    }, 60000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
