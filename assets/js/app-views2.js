/* SAFE-PARKS CISO Portal — views: assurance, incidents, WP3, deliverables, docs, reporting, settings */
(function () {
  "use strict";
  var SP = window.SP;
  SP.views = SP.views || {};

  function H() { return SP.h; }

  /* ================= ASSURANCE ================= */
  SP.views.assurance = {
    render: function () {
      var h = H(), t = h.t, esc = h.esc, L = h.L, A = SP.assurance;
      var out = h.head(t("asr.eyebrow"), t("asr.title"), t("asr.lede"));

      out += h.card(h.cardHead(t("asr.pentest"), t("asr.pentestSub")) +
        h.table([{ label: t("common.id") }, { label: t("common.month") }, { label: t("common.scope") }, { label: t("asr.type") }, { label: t("common.status") }],
          A.pentests.map(function (p) {
            return '<td class="col-id">' + esc(p.id) + '</td><td class="nowrap">' + esc(p.when) + "</td><td>" + esc(L(p.scope)) + "</td><td>" + esc(L(p.type)) + "</td><td>" + h.badge(p.status) + "</td>";
          })) +
        '<div style="margin-top:10px">' + h.callout(esc(t("asr.pentestNote")), "", "i") + "</div>");

      out += '<div class="grid g2" style="margin-top:14px">';
      out += h.card(h.cardHead(t("asr.audits"), t("asr.auditsSub")) +
        h.table([{ label: t("common.id") }, { label: t("common.month") }, { label: t("asr.auditTitle") }, { label: t("asr.output") }],
          A.audits.map(function (a) {
            return '<td class="col-id">' + esc(a.id) + '</td><td class="nowrap">' + esc(a.when) + "</td><td>" + esc(L(a.t)) + '</td><td class="tiny t-muted">' + esc(L(a.out)) + "</td>";
          })));
      out += h.card(h.cardHead(t("asr.cert"), t("asr.certSub")) + '<div class="timeline">' + A.certRoadmap.map(function (c) {
        return '<div class="tl-item"><div class="tl-when">' + esc(c.m) + "</div><h4>" + esc(L(c.s)) + "</h4></div>";
      }).join("") + "</div>" + h.tags(["ISO/IEC 27001:2022", "ISO/IEC 27701", "ISO/IEC 42001"]) + "</div>");
      out += "</div>";

      out += '<div style="margin-top:14px">' + h.card(h.cardHead(t("asr.sdlc"), t("asr.sdlcSub")) +
        h.table([{ label: t("asr.gate") }, { label: t("asr.when") }, { label: t("common.evidence") }],
          A.sdlc.map(function (g) {
            return "<td><strong>" + esc(L(g.g)) + "</strong></td><td>" + esc(L(g.when)) + '</td><td><span class="tag">' + esc(g.ev) + "</span></td>";
          }))) + "</div>";

      out += '<div style="margin-top:14px">' + h.card(h.cardHead(t("asr.training"), t("asr.trainingSub")) +
        h.table([{ label: t("asr.who") }, { label: t("asr.what") }, { label: t("asr.freq") }],
          A.training.map(function (x) {
            return "<td><strong>" + esc(L(x.who)) + "</strong></td><td>" + esc(L(x.what)) + "</td><td class=\"nowrap\">" + esc(L(x.when)) + "</td>";
          }))) + "</div>";

      return out;
    }
  };

  /* ================= INCIDENTS ================= */
  SP.views.incidents = {
    render: function () {
      var h = H(), t = h.t, esc = h.esc, L = h.L, I = SP.incidents;
      var out = h.head(t("ir.eyebrow"), t("ir.title"), t("ir.lede"));

      out += '<div class="grid g4" style="margin-bottom:14px">' +
        h.kpi(t("ir.kpi.ack"), "15 min", t("ir.kpi.ackNote"), true) +
        h.kpi(t("ir.kpi.contain"), "1 h", t("ir.kpi.containNote"), true) +
        h.kpi(t("ir.kpi.notify"), "72 h", t("ir.kpi.notifyNote"), false) +
        h.kpi(t("ir.kpi.drills"), "2 / " + t("ir.kpi.year"), t("ir.kpi.drillsNote"), false) +
        "</div>";

      out += h.card(h.cardHead(t("ir.severity"), t("ir.severitySub")) +
        h.table([{ label: t("ir.level") }, { label: t("ir.ack") }, { label: t("ir.contain") }, { label: t("ir.notify") }, { label: t("ir.examples") }],
          I.severity.map(function (s) {
            return '<td><span class="badge badge-' + (s.tone === "danger" ? "gap" : s.tone === "warn" ? "partial" : s.tone === "info" ? "info" : "ready") + '">' + esc(s.lvl) + "</span></td>" +
              '<td class="nowrap mono tiny">' + esc(s.ack) + '</td><td class="nowrap mono tiny">' + esc(s.contain) + "</td>" +
              '<td class="tiny">' + esc(L(s.notify)) + '</td><td class="tiny t-muted">' + esc(L(s.ex)) + "</td>";
          })));

      out += '<div style="margin-top:14px">' + h.card(h.cardHead(t("ir.notifyTitle"), t("ir.notifySub")) +
        h.table([{ label: t("ir.recipient") }, { label: t("ir.deadline") }, { label: t("ir.content") }, { label: t("ir.owner") }],
          I.notification.map(function (n) {
            return "<td><strong>" + esc(L(n.to)) + "</strong></td><td>" + esc(L(n.when)) + "</td><td>" + esc(L(n.what)) + '</td><td class="nowrap">' + esc(n.owner) + "</td>";
          })) +
        '<div style="margin-top:10px">' + h.callout(esc(t("ir.notifyNote")), "warn", "!") + "</div>") + "</div>";

      out += '<div class="grid g-2-1" style="margin-top:14px">';
      out += h.card(h.cardHead(t("ir.timeline"), t("ir.timelineSub")) + '<div class="timeline">' + I.timeline.map(function (x) {
        return '<div class="tl-item"><div class="tl-when">' + esc(x.t) + "</div><h4 style=\"font-weight:500;font-size:12.6px\">" + esc(L(x.a)) + "</h4></div>";
      }).join("") + "</div>");
      out += h.card(h.cardHead(t("ir.contacts"), t("ir.contactsSub")) +
        '<div class="split-list">' +
        '<div><div class="k">CISO</div><div class="v mono">' + esc(h.state.settings.ciso || "—") + "</div></div>" +
        '<div><div class="k">CSIRT</div><div class="v mono">' + esc(t("ir.tbd")) + "</div></div>" +
        '<div><div class="k">KVKK</div><div class="v mono">' + esc(t("ir.tbd")) + "</div></div>" +
        '<div><div class="k">DPO</div><div class="v mono">' + esc(h.state.settings.dpo || "—") + "</div></div>" +
        '<div><div class="k">NATO/Defence</div><div class="v mono">' + esc(t("ir.tbd")) + "</div></div>" +
        "</div>" + h.callout(esc(t("ir.contactsNote")), "warn", "!"));
      out += "</div>";

      out += '<div style="margin-top:14px">' + h.cardHead(t("ir.playbooks"), t("ir.playbooksSub")) +
        I.playbooks.map(function (p) {
          return '<details class="acc"><summary><span class="col-id">' + esc(p.id) + "</span> " + esc(L(p.t)) + "</summary><div class=\"acc-body\"><ol>" +
            p.steps.map(function (s) { return "<li>" + esc(L(s)) + "</li>"; }).join("") + "</ol></div></details>";
        }).join("") + "</div>";

      return out;
    }
  };

  /* ================= WP3 ================= */
  SP.views.wp3 = {
    render: function () {
      var h = H(), t = h.t, esc = h.esc, L = h.L;
      var out = h.head(t("wp3.eyebrow"), t("wp3.title"), t("wp3.lede"));

      var tot = 0;
      SP.wp3Budget.forEach(function (b) { tot += b.amount; });
      var pm = 0, amt = 0;
      SP.wp3Tasks.forEach(function (x) { pm += x.pm; amt += x.amount; });

      out += '<div class="grid g4" style="margin-bottom:14px">' +
        h.kpi(t("wp3.kpi.budget"), h.money(SP.meta.wp3Budget), t("wp3.kpi.budgetNote"), true) +
        h.kpi(t("wp3.kpi.pm"), pm + " PM", t("wp3.kpi.pmNote"), false) +
        h.kpi(t("wp3.kpi.tasks"), String(SP.wp3Tasks.length), t("wp3.kpi.tasksNote"), false) +
        h.kpi(t("wp3.kpi.interfaces"), String(SP.wp3Interfaces.length), t("wp3.kpi.interfacesNote"), false) +
        "</div>";

      out += '<div class="grid g-1-2">';
      out += h.card(h.cardHead(t("wp3.budgetTitle"), t("wp3.budgetSub")) +
        h.table([{ label: t("wp3.cat") }, { label: t("wp3.amount"), num: true }],
          SP.wp3Budget.map(function (b) {
            return "<td><strong>" + esc(L(b.cat)) + '</strong><div class="tiny t-muted" style="margin-top:3px">' + esc(L(b.note)) + "</div></td><td class=\"num\">" + h.money(b.amount) + "</td>";
          })) +
        '<div class="split-list" style="margin-top:6px"><div><div class="k">' + esc(t("wp3.total")) + '</div><div class="v mono"><strong>' + h.money(tot) + "</strong> / " + h.money(SP.meta.wp3Budget) + " " +
        (tot === SP.meta.wp3Budget ? '<span class="badge badge-ready">OK</span>' : '<span class="badge badge-gap">!</span>') + "</div></div></div>" +
        h.callout(esc(t("wp3.budgetNote")), "", "i"));

      out += h.card(h.cardHead(t("wp3.tasksTitle"), t("wp3.tasksSub")) +
        h.table([{ label: t("common.id") }, { label: t("wp3.task") }, { label: t("common.month") }, { label: t("wp3.pm"), num: true }, { label: t("wp3.amount"), num: true }, { label: t("wp3.out") }],
          SP.wp3Tasks.map(function (x) {
            return '<td class="col-id">' + esc(x.id) + "</td><td><strong>" + esc(L(x.name)) + "</strong></td><td class=\"nowrap tiny\">" + esc(x.months) + "</td>" +
              '<td class="num">' + x.pm + '</td><td class="num">' + h.money(x.amount) + '</td><td><a href="#deliverables" class="tag">' + esc(x.out) + "</a></td>";
          })) +
        '<div class="row" style="margin-top:9px;gap:14px"><span class="tiny t-muted mono">' + esc(t("wp3.sumPM")) + ": " + pm + "</span>" +
        '<span class="tiny t-muted mono">' + esc(t("wp3.sumAmt")) + ": " + h.money(amt) + "</span></div>");
      out += "</div>";

      out += '<div class="grid g2" style="margin-top:14px">';
      out += h.card(h.cardHead(t("wp3.interfaces"), t("wp3.interfacesSub")) + '<div class="stack-sm">' + SP.wp3Interfaces.map(function (i) {
        return '<div style="border-bottom:1px solid var(--line-soft);padding-bottom:8px"><div class="row-between"><strong style="font-size:12.5px">' + esc(i.with) + "</strong></div>" +
          '<p class="tiny" style="color:var(--text-2);margin-top:3px">' + esc(L(i.item)) + '</p>' +
          '<p class="tiny" style="color:var(--muted);margin-top:3px"><span class="mono">' + esc(t("wp3.mech")) + ":</span> " + esc(L(i.mech)) + "</p></div>";
      }).join("") + "</div>");
      out += h.card(h.cardHead(t("wp3.msTitle"), t("wp3.msSub")) + '<div class="timeline">' + SP.milestones.map(function (m) {
        return '<div class="tl-item"><div class="tl-when">' + esc(m.id) + " · " + esc(m.m) + "</div><h4>" + esc(L(m.t)) + '</h4><p>' + esc(L(m.crit)) + "</p></div>";
      }).join("") + "</div>");
      out += "</div>";

      return out;
    }
  };

  /* ================= DELIVERABLES ================= */
  SP.views.deliverables = {
    render: function () {
      var h = H(), st = h.state, t = h.t, esc = h.esc, L = h.L;
      var ds = h.delivStats();
      var out = h.head(t("del.eyebrow"), t("del.title"), t("del.lede"));

      out += '<div class="grid g4" style="margin-bottom:14px">' +
        h.kpi(t("del.kpi.all"), String(ds.total), t("del.kpi.allNote"), true) +
        h.kpi(t("status.inProgress"), String(ds["in-progress"]), t("del.kpi.inProgressNote"), false) +
        h.kpi(t("status.done"), String(ds.done), t("del.kpi.doneNote"), false) +
        h.kpi(t("del.kpi.wp3"), "6", t("del.kpi.wp3Note"), false) +
        "</div>";

      var wps = [{ v: "", l: t("del.allWp") }];
      ["WP1", "WP2", "WP3", "WP5", "WP6", "WP7"].forEach(function (w) { wps.push({ v: w, l: w }); });
      out += '<div class="toolbar">' + wps.map(function (c) {
        return '<button class="filter-chip" data-chip="delwp" data-val="' + esc(c.v) + '" aria-pressed="' + (st.ui.delwp === c.v ? "true" : "false") + '">' + esc(c.l) + "</button>";
      }).join("") + '<input class="search" type="search" data-filter="delq" placeholder="' + esc(t("del.search")) + '" value="' + esc(st.ui.delq || "") + '"></div>';

      var q = (st.ui.delq || "").toLowerCase();
      var rows = SP.deliverables.filter(function (d) {
        if (st.ui.delwp && d.wp !== st.ui.delwp) return false;
        if (q && (d.id + " " + L(d.t) + " " + d.lead).toLowerCase().indexOf(q) < 0) return false;
        return true;
      }).sort(function (a, b) { return parseInt(a.due.slice(1), 10) - parseInt(b.due.slice(1), 10); });

      var body = rows.map(function (d) {
        var cur = st.data.deliv[d.id] || d.status;
        return '<td class="col-id">' + esc(d.id) + "</td><td><strong>" + esc(L(d.t)) + '</strong><div class="tiny t-muted" style="margin-top:3px">' + esc(L(d.role)) + "</div></td>" +
          "<td>" + esc(d.wp) + '</td><td class="nowrap">' + esc(d.lead) + '</td><td class="nowrap">' + esc(d.due) + "</td>" +
          '<td><span class="pill">' + esc(d.level) + '</span> <span class="tiny t-muted">' + esc(d.type) + "</span></td>" +
          "<td>" + h.statusSelect("deliv", d.id, cur, ["planned", "in-progress", "done"]) + "</td>";
      });

      out += h.table([{ label: t("common.id") }, { label: t("common.title") }, { label: t("del.wp") }, { label: t("del.lead") },
        { label: t("del.due") }, { label: t("del.dissem") }, { label: t("common.status") }], body, { foot: esc(t("del.foot")) });

      out += '<div class="grid g2" style="margin-top:14px">';
      out += h.card(h.cardHead(t("del.gates"), t("del.gatesSub")) + '<div class="checklist">' +
        ["del.gate1", "del.gate2", "del.gate3", "del.gate4", "del.gate5"].map(function (k) {
          return '<div class="check"><span class="badge badge-ready">✓</span><span>' + esc(t(k)) + "</span></div>";
        }).join("") + "</div>");
      out += h.card(h.cardHead(t("del.risks"), t("del.risksSub")) + '<div class="stack-sm" style="font-size:12.6px;color:var(--text-2)">' +
        '<p>• ' + esc(t("del.risk1")) + "</p><p>• " + esc(t("del.risk2")) + "</p><p>• " + esc(t("del.risk3")) + "</p></div>" +
        h.callout(esc(t("del.riskNote")), "warn", "!"));
      out += "</div>";

      return out;
    }
  };

  /* ================= DOCS ================= */
  SP.views.docs = {
    render: function (id) {
      var h = H(), t = h.t, esc = h.esc, L = h.L;
      if (id) {
        var doc = SP.docById(id);
        var dm = doc ? ((h.state.data.docMeta || {})[doc.id] || {}) : {};
        if (!doc) return h.head("", t("doc.notFound"), "") + '<a class="btn" href="#docs">' + esc(t("doc.back")) + "</a>";
        var secs = doc.sections.map(function (s) {
          var inner = "<h2>" + esc(L(s.h)) + "</h2>";
          (s.p || []).forEach(function (p) { inner += "<p>" + esc(L(p)) + "</p>"; });
          if (s.list && s.list.length) inner += "<ul>" + s.list.map(function (li) { return "<li>" + esc(L(li)) + "</li>"; }).join("") + "</ul>";
          return inner;
        }).join("");
        return '<div class="no-print" style="margin-bottom:12px"><a class="btn btn-sm" href="#docs">← ' + esc(t("doc.back")) + "</a></div>" +
          '<div class="view-head"><div class="eyebrow">' + esc(doc.code) + " · " + esc(t("doc.library")) + "</div><h1>" + esc(L(doc.title)) + "</h1></div>" +
          '<div class="doc-meta">' +
          '<div>' + esc(t("doc.field.code")) + "<strong>" + esc(doc.code) + "</strong></div>" +
          '<div>' + esc(t("doc.field.owner")) + "<strong>" + esc(doc.owner) + "</strong></div>" +
          '<div>' + esc(t("doc.field.version")) + "<strong>v" + esc(dm.version || doc.version) + "</strong></div>" +
          '<div>' + esc(t("doc.field.approval")) + "<strong>" + esc(dm.approval || doc.approval) + "</strong></div>" +
          '<div>' + esc(t("doc.field.review")) + "<strong>" + esc(dm.review || doc.review) + "</strong></div>" +
          "</div>" +
          '<div class="card no-print" style="margin-bottom:14px"><div class="row-between"><span class="tiny t-muted">' + esc(t("doc.purpose")) + ": " + esc(L(doc.purpose)) + "</span>" +
          '<span class="row" style="gap:8px"><button class="btn btn-sm" data-doc-md="' + esc(doc.id) + '">' + esc(t("doc.downloadMd")) + "</button>" +
          '<button class="btn btn-sm" onclick="window.print()">' + esc(t("doc.print")) + "</button></span></div></div>" +
          '<article class="prose">' + secs + "</article>";
      }

      var out = h.head(t("doc.eyebrow"), t("doc.title"), t("doc.lede"));
      out += '<div class="grid g3">' + SP.docs.map(function (d) {
        return '<a class="card" href="#docs/' + esc(d.id) + '">' +
          '<div class="card-head"><div><div class="tiny mono" style="color:var(--accent)">' + esc(d.code) + "</div><h3 style=\"margin-top:4px\">" + esc(L(d.title)) + "</h3>" +
          '<p>' + esc(L(d.purpose)) + "</p></div></div>" +
          '<div class="row-between"><span class="tiny t-muted">' + esc(t("doc.field.version")) + " v" + esc(((h.state.data.docMeta || {})[d.id] || {}).version || d.version) + " · " + esc(d.owner) + "</span>" +
          '<span class="tiny" style="color:var(--accent)">' + esc(t("common.openView")) + " →</span></div></a>";
      }).join("") + "</div>";
      out += '<div style="margin-top:14px">' + h.callout(esc(t("doc.note")), "warn", "!") + "</div>";
      return out;
    }
  };

  /* ================= REPORTING ================= */
  SP.views.reporting = {
    render: function () {
      var h = H(), t = h.t, esc = h.esc, L = h.L, st = h.state;
      var cs = h.compStats(), rs = h.riskStats(), ds = h.delivStats(), pd = h.planDone();
      var out = h.head(t("rep.eyebrow"), t("rep.title"), t("rep.lede"));

      out += '<div class="grid g4" style="margin-bottom:14px">' +
        h.kpi(t("dash.kpi.readiness"), h.pct(cs.overall), t("rep.kpi.readinessNote"), true) +
        h.kpi("Sev-1 / Sev-2", "0 / 0", t("rep.kpi.incNote"), false) +
        h.kpi(t("rep.kpi.gaps"), String(cs.counts.gap), t("rep.kpi.gapsNote"), false) +
        h.kpi(t("rep.kpi.plan"), h.pct(pd.p), pd.done + "/" + pd.all, false) +
        "</div>";

      var evCity = st.ui.evidenceCity || "";
      var evCityObj = (SP.pilotCities || []).filter(function (c) { return c.id === evCity; })[0];
      if (!evCityObj) evCity = "";
      var evWave = evCityObj && SP.pilotWaveOf ? SP.pilotWaveOf(evCityObj.id) : null;
      var evScope = evCityObj ? evCityObj.id + " · " + evCityObj.name + (evWave ? " · " + L(evWave.label) : "") : t("rep.evidenceAllNote");
      out += '<div class="toolbar" style="margin-bottom:10px"><label class="tiny t-muted" for="evidenceCityPick">' + esc(t("rep.evidenceCity")) + "</label>" +
        '<select id="evidenceCityPick" class="status-select" data-evidencecity aria-label="' + esc(t("rep.evidenceCity")) + '">' +
        '<option value="">' + esc(t("rep.evidenceAll")) + "</option>" +
        (SP.pilotCities || []).map(function (c) {
          var w = SP.pilotWaveOf ? SP.pilotWaveOf(c.id) : null;
          return '<option value="' + esc(c.id) + '"' + (evCity === c.id ? " selected" : "") + ">" + esc(c.id + " · " + c.name + (w ? " · " + L(w.label) : "")) + "</option>";
        }).join("") + "</select>" +
        '<span class="count-note">|</span><span class="tiny t-muted">' + esc(evScope) + "</span></div>" +
        '<p class="tiny t-muted" style="margin:-4px 0 10px">' + esc(t("rep.evidenceScopeNote")) + "</p>";

      out += '<div class="row" style="margin-bottom:12px"><button class="btn btn-primary" data-act="export-md">' + esc(t("rep.download")) + "</button>" +
        '<button class="btn" data-act="export-json">' + esc(t("rep.downloadJson")) + "</button>" +
        '<button class="btn" data-act="export-csv">' + esc(t("rep.downloadCsv")) + "</button>" +
        '<button class="btn" onclick="window.print()">' + esc(t("doc.print")) + "</button></div>";

      var kpis = SP.kpis.map(function (k) {
        var val = "—";
        var actual = (st.data.kpi || {})[k.id];
        if (actual !== undefined && String(actual).trim() !== "") val = String(actual);
        else if (k.auto === "compliance") val = h.pct(cs.overall);
        else if (k.auto === "dpia") val = "0 / 7";
        else if (k.auto === "oversight") val = "100%";
        return '<td class="col-id">' + esc(k.id) + "</td><td><strong>" + esc(L(k.name)) + '</strong><div class="tiny t-muted" style="margin-top:3px">' + esc(L(k.def)) + "</div></td>" +
          '<td class="nowrap mono tiny">' + esc(val) + '</td><td class="nowrap tiny">' + esc(k.target) + "</td><td class=\"tiny t-muted\">" + esc(L(k.freq)) + "</td><td class=\"tiny\">" + esc(k.owner) + "</td>";
      });
      out += h.card(h.cardHead(t("rep.kpis"), t("rep.kpisSub")) +
        h.table([{ label: t("common.id") }, { label: t("rep.kpi") }, { label: t("rep.current") }, { label: t("man.target") }, { label: t("rep.freq") }, { label: t("common.owner") }], kpis));

      out += '<div class="grid g3" style="margin-top:14px">';
      out += h.card(h.cardHead(t("rep.monthly"), "") + '<ul style="color:var(--text-2);font-size:12.7px;padding-left:1.1rem">' +
        SP.reporting.monthly.map(function (x) { return "<li style=\"margin-bottom:6px\">" + esc(L(x)) + "</li>"; }).join("") + "</ul>");
      out += h.card(h.cardHead(t("rep.quarterly"), "") + '<ul style="color:var(--text-2);font-size:12.7px;padding-left:1.1rem">' +
        SP.reporting.quarterly.map(function (x) { return "<li style=\"margin-bottom:6px\">" + esc(L(x)) + "</li>"; }).join("") + "</ul>");
      out += h.card(h.cardHead(t("rep.steering"), "") + '<ul style="color:var(--text-2);font-size:12.7px;padding-left:1.1rem">' +
        SP.reporting.steering.map(function (x) { return "<li style=\"margin-bottom:6px\">" + esc(L(x)) + "</li>"; }).join("") + "</ul>");
      out += "</div>";

      out += '<div class="grid g2" style="margin-top:14px">';
      out += h.card(h.cardHead(t("rep.snapshot"), t("rep.snapshotSub")) + '<div class="split-list">' +
        '<div><div class="k">' + esc(t("rep.fw")) + '</div><div class="v">' + Object.keys(cs.by).map(function (k) { return esc(k) + " " + h.pct(cs.by[k].p); }).join(" · ") + "</div></div>" +
        '<div><div class="k">' + esc(t("rep.risks")) + '</div><div class="v">' + rs.critical + " " + esc(t("risk.critical")) + " · " + rs.high + " " + esc(t("risk.high")) + " · " + rs.medium + " " + esc(t("risk.medium")) + "</div></div>" +
        '<div><div class="k">' + esc(t("rep.deliv")) + '</div><div class="v">' + ds.done + "/" + ds.total + " " + esc(t("status.done")) + " · " + ds["in-progress"] + " " + esc(t("status.inProgress")) + "</div></div>" +
        '<div><div class="k">' + esc(t("rep.generated")) + '</div><div class="v mono">' + new Date().toISOString().slice(0, 10) + "</div></div>" +
        "</div>");
      out += h.card(h.cardHead(t("rep.ritual"), t("rep.ritualSub")) + '<div class="timeline">' +
        [{ m: "M1", k: "rep.ritual1" }, { m: "M6", k: "rep.ritual2" }, { m: "M12", k: "rep.ritual3" }, { m: "M30", k: "rep.ritual4" }].map(function (x) {
          return '<div class="tl-item"><div class="tl-when">' + esc(x.m) + "</div><h4>" + esc(t(x.k)) + "</h4></div>";
        }).join("") + "</div>");
      out += "</div>";

      return out;
    }
  };

  /* ================= SETTINGS ================= */
  SP.views.settings = {
    render: function () {
      var h = H(), t = h.t, esc = h.esc, L = h.L, s = h.state.settings;
      var out = h.head(t("set.eyebrow"), t("set.title"), t("set.lede"));

      out += '<div class="grid g-1-2">';
      out += h.card(h.cardHead(t("set.identity"), t("set.identitySub")) +
        '<div class="stack-sm">' +
        '<label class="tiny t-muted">' + esc(t("set.ciso")) + '<input type="text" data-setting="ciso" value="' + esc(s.ciso) + '" placeholder="' + esc(t("set.cisoPh")) + '" style="width:100%;margin-top:4px"></label>' +
        '<label class="tiny t-muted">' + esc(t("set.dpo")) + '<input type="text" data-setting="dpo" value="' + esc(s.dpo) + '" placeholder="' + esc(t("set.dpoPh")) + '" style="width:100%;margin-top:4px"></label>' +
        '<label class="tiny t-muted">' + esc(t("set.ga")) + '<input type="text" data-setting="ga" value="' + esc(s.ga) + '" placeholder="101XXXXXX" style="width:100%;margin-top:4px"></label>' +
        "</div>" + h.callout(esc(t("set.localNote")), "", "i"));

      out += h.card(h.cardHead(t("set.data"), t("set.dataSub")) +
        '<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn" data-act="export-json">' + esc(t("set.export")) + "</button>" +
        '<button class="btn" data-act="export-brief">' + esc(t("set.exportBrief")) + "</button>" +
        '<button class="btn" data-act="import-json">' + esc(t("set.import")) + "</button>" +
        '<button class="btn" data-act="reset">' + esc(t("set.reset")) + "</button></div>" +
        '<p class="tiny t-muted" style="margin-top:8px">' + esc(t("set.briefHint")) + "</p>" +
        '<div style="margin-top:12px">' + h.callout(esc(t("set.resetNote")), "warn", "!") + "</div>" +
        '<div class="split-list" style="margin-top:10px">' +
        '<div><div class="k">' + esc(t("set.storage")) + '</div><div class="v mono tiny">localStorage · safeparks-ciso-v1</div></div>' +
        '<div><div class="k">' + esc(t("set.lang")) + '</div><div class="v">' + esc(s.lang || (h.state.lang === "tr" ? "Türkçe" : "English")) + "</div></div>" +
        "</div>");
      out += "</div>";

      out += '<div style="margin-top:14px">' + h.card(h.cardHead(t("set.open"), t("set.openSub")) +
        '<div class="stack-sm">' + (SP.meta.assumptions || []).map(function (a) {
          return '<div class="row" style="gap:9px;align-items:flex-start"><span class="badge badge-partial">!</span><span style="font-size:12.6px;color:var(--text-2)">' + esc(L(a)) + "</span></div>";
        }).join("") + "</div>") + "</div>";

      out += '<div class="grid g2" style="margin-top:14px">';
      out += h.card(h.cardHead(t("set.scope"), "") + '<div class="split-list">' +
        '<div><div class="k">' + esc(t("set.version")) + '</div><div class="v mono">1.0.0</div></div>' +
        '<div><div class="k">' + esc(t("set.files")) + '</div><div class="v mono tiny">index.html · assets/css · assets/js</div></div>' +
        '<div><div class="k">' + esc(t("set.deps")) + '</div><div class="v">' + esc(t("set.depsV")) + "</div></div>" +
        '<div><div class="k">' + esc(t("set.class")) + '</div><div class="v">' + esc(SP.meta.classification) + "</div></div>" +
        "</div>");
      out += h.card(h.cardHead(t("set.legal"), "") + '<p style="font-size:12.6px;color:var(--text-2)">' + esc(t("set.legalBody")) + "</p>");
      out += "</div>";

      return out;
    }
  };
})();
