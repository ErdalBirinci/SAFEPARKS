/* SAFE-PARKS CISO Portal — views: compliance, privacy, architecture, risks */
(function () {
  "use strict";
  var SP = window.SP;
  SP.views = SP.views || {};

  function H() { return SP.h; }

  /* ================= COMPLIANCE ================= */
  SP.views.compliance = {
    render: function () {
      var h = H(), st = h.state, L = h.L, t = h.t, esc = h.esc;
      var cs = h.compStats();
      var out = h.head(t("comp.eyebrow"), t("comp.title"), t("comp.lede"));

      out += '<div class="grid g4" style="margin-bottom:14px">' +
        h.kpi(t("comp.kpi.overall"), h.pct(cs.overall), cs.applicable + " " + t("comp.kpi.applicable"), true) +
        h.kpi(t("status.ready"), String(cs.counts.ready), t("comp.kpi.readyNote"), false) +
        h.kpi(t("status.partial"), String(cs.counts.partial), t("comp.kpi.partialNote"), false) +
        h.kpi(t("status.gap"), String(cs.counts.gap), t("comp.kpi.gapNote"), false) +
        "</div>";

      var fwBars = Object.keys(cs.by).map(function (k) {
        return '<div style="margin-bottom:9px"><div class="row-between" style="margin-bottom:3px"><span class="tiny t-strong">' + esc(k) + '</span><span class="tiny mono t-muted">' + h.pct(cs.by[k].p) + '</span></div>' + h.meter(cs.by[k].p) + "</div>";
      }).join("");
      out += '<div class="grid g-2-1" style="margin-bottom:14px">' +
        h.card(h.cardHead(t("comp.fwTitle"), t("comp.fwSub")) + fwBars + h.callout(esc(t("comp.fwNote")), "", "i")) +
        h.card(h.cardHead(t("comp.legend"), "") +
          '<div class="stack-sm" style="font-size:12.3px;color:var(--text-2)">' +
          '<div><span class="badge badge-ready">' + esc(t("status.ready")) + "</span> " + esc(t("comp.legReady")) + "</div>" +
          '<div><span class="badge badge-partial">' + esc(t("status.partial")) + "</span> " + esc(t("comp.legPartial")) + "</div>" +
          '<div><span class="badge badge-gap">' + esc(t("status.gap")) + "</span> " + esc(t("comp.legGap")) + "</div>" +
          '<div><span class="badge badge-na">' + esc(t("status.na")) + "</span> " + esc(t("comp.legNa")) + "</div>" +
          "</div>" + h.callout(esc(t("comp.saveNote")), "warn", "!"));
      out += "</div>";

      /* filters */
      var chips = [{ v: "", l: t("comp.all") }].concat((SP.frameworks || []).map(function (f) { return { v: f.id, l: f.id }; }));
      var chipHtml = chips.map(function (c) {
        return '<button class="filter-chip" data-chip="compfw" data-val="' + esc(c.v) + '" aria-pressed="' + (st.ui.compfw === c.v ? "true" : "false") + '">' + esc(c.l) + "</button>";
      }).join("");
      var stChips = ["", "ready", "partial", "gap"].map(function (v) {
        return '<button class="filter-chip" data-chip="compst" data-val="' + v + '" aria-pressed="' + (st.ui.compst === v ? "true" : "false") + '">' + esc(v ? t("status." + v) : t("comp.anyStatus")) + "</button>";
      }).join("");

      out += '<div class="toolbar"><input class="search" type="search" data-filter="compq" placeholder="' + esc(t("comp.search")) + '" value="' + esc(st.ui.compq || "") + '">' +
        chipHtml + '<span class="count-note">|</span>' + stChips + "</div>";

      var notes = st.data.notes || {};
      function evRef(id) { return notes["comp|" + id + "|ref"] || ""; }
      function evNote(id) { return notes["comp|" + id + "|note"] || ""; }
      function evDate(id) { return notes["comp|" + id + "|verifiedOn"] || ""; }
      function evBy(id) { return notes["comp|" + id + "|verifiedBy"] || ""; }
      var EVIDENCE_AGING_DAYS = 365;
      function evAgeDays(id) {
        var d = evDate(id);
        if (!d) return null;
        var t = Date.parse(d + "T00:00:00Z");
        if (!isFinite(t)) return null;
        var now = new Date();
        var today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
        var days = Math.floor((today - t) / 86400000);
        return days >= 0 ? days : null;
      }
      function gonoLinksOf(id) {
        var items = (SP.gonoByComp || {})[id] || [];
        return items.length
          ? '<div class="tiny link-row">' + esc(t("link.gono")) + ": " + SP.chipLinks("gono", items) + "</div>"
          : '<div class="tiny t-muted link-row">' + esc(t("link.none")) + "</div>";
      }
      var evCount = SP.allCompliance.filter(function (r) { return evRef(r.id) || evNote(r.id); }).length;
      var agingRows = SP.allCompliance.filter(function (r) { return evAgeDays(r.id) > EVIDENCE_AGING_DAYS; });
      if (agingRows.length) {
        out += '<div style="margin-bottom:12px">' + h.callout("<strong>" + agingRows.length + "</strong> " + esc(t("comp.evAgingSummary")) + " " + esc(t("comp.evAgingNote")), "warn", "!") + "</div>";
      }

      var q = (st.ui.compq || "").toLowerCase();
      var rows = SP.allCompliance.filter(function (r) {
        if (st.ui.compfw && r.fw !== st.ui.compfw) return false;
        var cur = h.compStatus(r);
        if (st.ui.compst && cur !== st.ui.compst) return false;
        if (q) {
          var hay = (r.id + " " + r.fw + " " + r.ref + " " + L(r.req) + " " + L(r.ctrl) + " " + r.ev + " " + r.owner + " " + evRef(r.id) + " " + evNote(r.id) + " " + evDate(r.id) + " " + evBy(r.id)).toLowerCase();
          if (hay.indexOf(q) < 0) return false;
        }
        return true;
      }).sort(function (a, b) {
        var fa = SP.frameworks.findIndex(function (f) { return f.id === a.fw; });
        var fb = SP.frameworks.findIndex(function (f) { return f.id === b.fw; });
        if (fa !== fb) return fa - fb;
        return a.id.localeCompare(b.id);
      });

      var body = rows.map(function (r) {
        var cur = h.compStatus(r);
        var age = evAgeDays(r.id);
        var aging = age !== null && age > EVIDENCE_AGING_DAYS
          ? '<div class="tiny ev-age"><span class="badge badge-partial">' + esc(t("comp.evAging")) + "</span> " + esc(age + " " + t("comp.evDays")) + "</div>"
          : "";
        return '<td class="col-id">' + esc(r.id) + "</td>" +
          "<td><span class=\"pill\">" + esc(r.fw) + "</span><div class=\"tiny mono t-muted\" style=\"margin-top:3px\">" + esc(r.ref) + "</div></td>" +
          "<td><div class=\"t-strong\">" + esc(L(r.req)) + "</div>" + gonoLinksOf(r.id) + "</td>" +
          "<td>" + esc(L(r.ctrl)) + "</td>" +
          "<td class=\"ev-cell\"><span class=\"tag\">" + esc(r.ev) + "</span>" +
            '<input class="ev-input mono" type="text" data-note="comp|' + esc(r.id) + '|ref" value="' + esc(evRef(r.id)) + '" placeholder="' + esc(t("comp.evRefPh")) + '" aria-label="' + esc(t("comp.evRef")) + '">' +
            '<input class="ev-input" type="text" data-note="comp|' + esc(r.id) + '|note" value="' + esc(evNote(r.id)) + '" placeholder="' + esc(t("comp.evNotePh")) + '" aria-label="' + esc(t("comp.evNote")) + '">' +
            '<input class="ev-input mono" type="date" data-note="comp|' + esc(r.id) + '|verifiedOn" value="' + esc(evDate(r.id)) + '" aria-label="' + esc(t("comp.evDate")) + '" title="' + esc(t("comp.evDate")) + '">' +
            aging +
            '<input class="ev-input" type="text" data-note="comp|' + esc(r.id) + '|verifiedBy" value="' + esc(evBy(r.id)) + '" placeholder="' + esc(t("comp.evVerifiedByPh")) + '" aria-label="' + esc(t("comp.evVerifiedBy")) + '">' +
            "</td>" +
          "<td class=\"nowrap\">" + esc(r.owner) + "</td>" +
          "<td>" + h.statusSelect("comp", r.id, cur) + "</td>";
      });

      out += h.table([
        { label: t("common.id") }, { label: t("common.framework") }, { label: t("common.requirement") },
        { label: t("common.control") }, { label: t("common.evidence") }, { label: t("common.owner") }, { label: t("common.status") }
      ], body, { foot: esc(t("comp.tableFoot")) + " · <strong>" + evCount + "/" + SP.allCompliance.length + "</strong> " + esc(t("comp.evCoverage")) +
        " · <strong>" + SP.allCompliance.filter(function (r) { return ((SP.gonoByComp || {})[r.id] || []).length; }).length + "/" + SP.allCompliance.length + "</strong> " + esc(t("link.compCovered")) });

      out += '<div style="margin-top:12px">' + h.callout("<strong>" + esc(t("comp.prioTitle")) + "</strong> " + esc(t("comp.prioBody")), "", "→") + "</div>";
      return out;
    }
  };

  /* ================= PRIVACY ================= */
  SP.views.privacy = {
    render: function () {
      var h = H(), t = h.t, esc = h.esc, L = h.L;
      var out = h.head(t("priv.eyebrow"), t("priv.title"), t("priv.lede"));

      out += '<div class="grid g3" style="margin-bottom:14px">' +
        h.kpi(t("priv.kpi.buffer"), "60 s", t("priv.kpi.bufferNote"), true) +
        h.kpi(t("priv.kpi.window"), "30 s", t("priv.kpi.windowNote"), true) +
        h.kpi(t("priv.kpi.purge"), "≤ 5 s", t("priv.kpi.purgeNote"), true) +
        "</div>";

      /* dataflow */
      var flow = SP.dataflow.map(function (s) {
        return '<div class="flow-step"><div class="flow-num">' + esc(s.n) + "</div>" +
          "<div><h4>" + esc(L(s.t)) + "</h4><p>" + esc(L(s.d)) + "</p></div>" +
          '<div class="flow-meta">' + s.meta.map(function (m) { return '<span class="tag">' + esc(m) + "</span>"; }).join("") + "</div></div>";
      }).join("");
      out += h.card(h.cardHead(t("priv.flowTitle"), t("priv.flowSub")) + '<div class="flow">' + flow + "</div>");

      /* retention */
      out += '<div style="margin-top:14px">' + h.card(h.cardHead(t("priv.retTitle"), t("priv.retSub")) +
        h.table([{ label: t("priv.retData") }, { label: t("priv.retPeriod") }, { label: t("priv.retWhere") }, { label: t("priv.retLegal") }],
          SP.retention.map(function (r) {
            return "<td><strong>" + esc(L(r.d)) + "</strong></td><td class=\"nowrap\"><span class=\"tag\">" + esc(r.p) + "</span></td><td>" + esc(L(r.w)) + "</td><td class=\"tiny t-muted\">" + esc(L(r.legal)) + "</td>";
          }))) + "</div>";

      /* ROPA */
      out += '<div style="margin-top:14px">' + h.card(h.cardHead(t("priv.ropaTitle"), t("priv.ropaSub")) +
        h.table([
          { label: t("common.id") }, { label: t("priv.ropaAct") }, { label: t("priv.ropaPurpose") }, { label: t("priv.ropaSubjects") },
          { label: t("priv.ropaCat") }, { label: t("priv.ropaBasis") }, { label: t("priv.ropaRet") }, { label: t("priv.ropaTrans") }
        ], SP.ropa.map(function (r) {
          return '<td class="col-id">' + esc(r.id) + "</td><td><strong>" + esc(L(r.act)) + "</strong></td><td>" + esc(L(r.purpose)) + "</td>" +
            "<td>" + esc(L(r.subj)) + "</td><td>" + esc(L(r.cat)) + "</td><td>" + esc(L(r.basis)) + "</td>" +
            '<td class="nowrap">' + esc(r.ret) + "</td><td>" + esc(L(r.trans)) + "</td>";
        }))) + "</div>";

      /* TOMs */
      var tomRows = SP.toms.map(function (x) {
        var cur = h.state.data.comp["tom." + x.id] || x.st;
        return '<td class="col-id">' + esc(x.id) + "</td><td><strong>" + esc(L(x.c)) + "</strong></td><td>" + esc(L(x.d)) +
          "</td><td class=\"tiny mono t-muted\">" + esc(x.a) + "</td><td>" + h.statusSelect("comp", "tom." + x.id, cur) + "</td>";
      });
      out += '<div style="margin-top:14px">' + h.card(h.cardHead(t("priv.tomTitle"), t("priv.tomSub")) +
        h.table([{ label: t("common.id") }, { label: t("priv.tomMeasure") }, { label: t("priv.tomDesc") }, { label: t("priv.tomArt") }, { label: t("common.status") }], tomRows)) + "</div>";

      /* DPIA */
      out += '<div class="grid g2" style="margin-top:14px">';
      out += h.card(h.cardHead(t("priv.screenTitle"), t("priv.screenSub")) +
        '<div class="stack-sm">' + SP.dpia.screening.map(function (s) {
          return '<div class="row" style="align-items:flex-start;gap:9px">' +
            '<span class="badge ' + (s.flag ? "badge-gap" : "badge-na") + '">' + (s.flag ? "DPIA" : "—") + "</span>" +
            '<div><div style="font-size:12.6px" class="t-strong">' + esc(L(s.q)) + '</div><div class="tiny t-muted">' + esc(L(s.a)) + "</div></div></div>";
        }).join("") + "</div>" +
        '<div style="margin-top:11px">' + h.callout("<strong>" + esc(t("priv.conclusion")) + ":</strong> " + esc(L(SP.dpia.conclusion)), "warn", "!") + "</div>");
      out += h.card(h.cardHead(t("priv.reviewTitle"), t("priv.reviewSub")) +
        '<p style="font-size:12.8px;color:var(--text-2)">' + esc(L(SP.dpia.review)) + "</p>" +
        '<div class="split-list" style="margin-top:11px">' +
        '<div><div class="k">' + esc(t("priv.art35")) + '</div><div class="v">' + esc(t("priv.art35v")) + "</div></div>" +
        '<div><div class="k">' + esc(t("priv.art36")) + '</div><div class="v">' + esc(t("priv.art36v")) + "</div></div>" +
        '<div><div class="k">' + esc(t("priv.dsr")) + '</div><div class="v">' + esc(t("priv.dsrv")) + "</div></div>" +
        "</div>");
      out += "</div>";

      /* DPIA risks */
      var dpRows = SP.dpia.risks.map(function (r) {
        var risk = r.l * r.s, res = r.r * r.s;
        return '<td class="col-id">' + esc(r.id) + "</td><td><strong>" + esc(L(r.t)) + "</strong></td>" +
          '<td class="num">' + r.l + "×" + r.s + ' <span class="score-chip">' + risk + "</span></td>" +
          "<td>" + esc(L(r.mit)) + "</td>" +
          '<td class="num"><span class="score-chip">' + res + "</span></td>";
      });
      out += '<div style="margin-top:14px">' + h.card(h.cardHead(t("priv.dpiaRisks"), t("priv.dpiaRisksSub")) +
        h.table([{ label: t("common.id") }, { label: t("priv.dpiaThreat") }, { label: t("common.score") + " (L×I)", num: true }, { label: t("priv.dpiaMit") }, { label: t("priv.dpiaResidual"), num: true }], dpRows)) + "</div>";

      return out;
    }
  };

  /* ================= ARCHITECTURE ================= */
  SP.views.architecture = {
    render: function () {
      var h = H(), t = h.t, esc = h.esc, L = h.L, A = SP.arch;
      var out = h.head(t("arch.eyebrow"), t("arch.title"), t("arch.lede"));

      out += h.card(h.cardHead(t("arch.principles"), t("arch.principlesSub")) +
        '<div class="grid g2">' + A.principles.map(function (p) {
          return '<div style="display:grid;grid-template-columns:16px minmax(0,1fr);gap:8px;font-size:12.5px;color:var(--text-2)">' +
            '<span style="color:var(--accent)">▸</span><span>' + esc(L(p)) + "</span></div>";
        }).join("") + "</div>");

      var zones = A.zones.map(function (z) {
        var tone = z.tone === "warn" ? "pill-warn" : z.tone === "info" ? "pill-info" : z.tone === "violet" ? "badge-violet" : "pill-accent";
        return '<div class="zone"><div class="zone-head"><span class="pill ' + (z.tone === "violet" ? "" : tone) + '">' + esc(z.id) + "</span>" +
          "<h4>" + esc(L(z.name)) + "</h4></div>" +
          '<p style="font-size:12.4px;color:var(--muted);margin-bottom:8px">' + esc(L(z.desc)) + "</p>" +
          '<div class="zone-nodes">' + z.nodes.map(function (n) { return '<span class="node">' + esc(n) + "</span>"; }).join("") + "</div></div>";
      }).join("");
      out += '<div style="margin-top:14px">' + h.card(h.cardHead(t("arch.zones"), t("arch.zonesSub")) + '<div class="zones">' + zones + "</div>") + "</div>";

      out += '<div style="margin-top:14px">' + h.card(h.cardHead(t("arch.crypto"), t("arch.cryptoSub")) +
        h.table([{ label: t("arch.use") }, { label: t("arch.alg") }, { label: t("arch.key") }, { label: t("arch.life") }, { label: t("arch.note") }],
          A.crypto.map(function (c) {
            return "<td><strong>" + esc(L(c.use)) + "</strong></td><td class=\"mono tiny\">" + esc(c.alg) + "</td><td class=\"tiny\">" + esc(c.key) + "</td><td class=\"nowrap tiny\">" + esc(c.life) + "</td><td class=\"tiny t-muted\">" + esc(L(c.note)) + "</td>";
          }))) + "</div>";

      out += '<div class="grid g-1-2" style="margin-top:14px">';
      out += h.card(h.cardHead(t("arch.pqc"), t("arch.pqcSub")) + '<div class="timeline">' + A.pqc.map(function (p) {
        return '<div class="tl-item"><div class="tl-when">' + esc(p.phase) + "</div><h4>" + esc(L(p.t)) + "</h4><p>" + esc(L(p.d)) + "</p></div>";
      }).join("") + "</div>" + '<div style="margin-top:6px">' + h.tags(["FIPS 203 · ML-KEM", "FIPS 204 · ML-DSA", "FIPS 205 · SLH-DSA", "CNSA 2.0"]) + "</div>");
      out += h.card(h.cardHead(t("arch.efdi"), t("arch.efdiSub")) + '<div class="split-list">' + A.efdi.map(function (e) {
        return '<div><div class="k">' + esc(L(e.k)) + '</div><div class="v">' + esc(L(e.v)) + "</div></div>";
      }).join("") + "</div>");
      out += "</div>";

      out += '<div style="margin-top:14px">' + h.card(h.cardHead(t("arch.ports"), t("arch.portsSub")) +
        h.table([{ label: t("arch.from") }, { label: t("arch.to") }, { label: t("arch.proto") }, { label: t("arch.port") }, { label: t("arch.auth") }, { label: t("arch.policy") }],
          A.ports.map(function (p) {
            return "<td>" + esc(p.from) + "</td><td>" + esc(p.to) + "</td><td class=\"tiny\">" + esc(p.proto) + "</td><td class=\"mono tiny\">" + esc(p.port) + "</td><td class=\"tiny\">" + esc(p.auth) + "</td><td class=\"tiny t-muted\">" + esc(L(p.policy)) + "</td>";
          }))) + "</div>";

      out += '<div style="margin-top:14px">' + h.card(h.cardHead(t("arch.resilience"), t("arch.resilienceSub")) +
        '<div class="split-list">' + A.resilience.map(function (r) {
          return '<div><div class="k">' + esc(L(r.k)) + '</div><div class="v">' + esc(L(r.v)) + "</div></div>";
        }).join("") + "</div>") + "</div>";

      return out;
    }
  };

  /* ================= RISKS ================= */
  SP.views.risks = {
    render: function () {
      var h = H(), st = h.state, t = h.t, esc = h.esc, L = h.L;
      var cities = SP.pilotCities || [];
      var cityId = st.ui.riskCity || "";
      var city = cities.filter(function (c) { return c.id === cityId; })[0];
      if (!city) cityId = "";
      var adjCount = city ? h.cityRiskAdj(city.id) : 0;
      var cellFilter = st.ui.riskCell || "";
      var cellParts = cellFilter.split("-");
      var cellL = parseInt(cellParts[0], 10), cellI = parseInt(cellParts[1], 10);
      var cellOn = cellL >= 1 && cellL <= 5 && cellI >= 1 && cellI <= 5;
      function scoreOf(cid) {
        return function (r) { return h.cityRiskScore(cid, r); };
      }
      function countsFor(cid) {
        var c = { critical: 0, high: 0, medium: 0, low: 0, total: 0, open: 0 };
        SP.risks.forEach(function (r) {
          var s = h.cityRiskScore(cid, r), score = s.l * s.i;
          if (cellOn && (s.l !== cellL || s.i !== cellI)) return;
          c[h.riskTone(score)]++;
          c.total++;
          var status = st.data.risks[r.id] || r.status;
          if (status !== "closed" && status !== "accepted") c.open++;
        });
        return c;
      }
      function axisSelect(cid, rid, axis, val) {
        var html = '<select class="status-select" data-cityrisk="' + esc(cid + "|" + rid + "|" + axis) + '" aria-label="' + axis.toUpperCase() + '">';
        for (var n = 1; n <= 5; n++) html += '<option value="' + n + '"' + (n === val ? " selected" : "") + ">" + n + "</option>";
        return html + "</select>";
      }
      var kc = countsFor(city ? city.id : "");
      var out = h.head(t("risk.eyebrow"), t("risk.title"), t("risk.lede"),
        city ? '<div style="margin-top:8px"><span class="pill pill-accent">' + esc(city.id + " · " + city.country) + " · " + esc(adjCount ? t("risk.cityAdjShort") : t("risk.cityBaseline")) + "</span></div>" : "");

      out += '<div class="grid g4" style="margin-bottom:14px">' +
        h.kpi(t("risk.kpi.crit"), String(kc.critical), "20–25", true) +
        h.kpi(t("risk.kpi.high"), String(kc.high), "12–19", false) +
        h.kpi(t("risk.kpi.med"), String(kc.medium), "6–11", false) +
        h.kpi(t("risk.kpi.open"), String(kc.open) + " / " + kc.total, t("risk.kpi.openNote"), false) +
        "</div>";

      out += '<div class="toolbar" style="margin-bottom:12px"><label class="tiny t-muted" for="riskCityPick">' + esc(t("risk.cityPick")) + "</label>" +
        '<select id="riskCityPick" class="status-select" data-citypick aria-label="' + esc(t("risk.cityPick")) + '">' +
        '<option value="">' + esc(t("risk.cityAll")) + "</option>" +
        cities.map(function (c) {
          return '<option value="' + esc(c.id) + '"' + (cityId === c.id ? " selected" : "") + ">" + esc(c.id + " · " + c.country) + "</option>";
        }).join("") + "</select>" +
        (city
          ? '<span class="count-note">|</span><span class="tiny t-muted">' + esc(adjCount ? adjCount + " " + t("risk.cityAdjShort") : t("risk.cityBaseline")) + "</span>" +
            '<button class="btn btn-sm btn-primary" data-print-heat="' + esc(city.id) + '" title="' + esc(t("risk.printHint")) + '">' + esc(t("risk.printHeat")) + "</button>" +
            '<button class="btn btn-sm" data-cityreset="' + esc(city.id) + '">' + esc(t("risk.cityReset")) + "</button>"
          : "") +
        "</div>";

      var heatTitle = city ? t("risk.heat") + " · " + city.id : t("risk.heat");
      var heatSub = city ? city.country + " · " + (adjCount ? adjCount + " " + t("risk.cityAdjShort") : t("risk.cityBaseline")) : t("risk.heatSub");
      out += '<div class="grid g-1-2" style="margin-bottom:14px">';
      out += h.card(h.cardHead(heatTitle, heatSub, cellOn ? '<span class="pill pill-accent">L' + cellL + " × I" + cellI + "</span>" : "") +
        heatMap(scoreOf(cityId), { interactive: true, active: cellFilter }) +
        '<div class="legend" style="margin-top:9px"><span><i style="background:color-mix(in srgb,var(--ok) 40%,transparent)"></i>' + esc(t("risk.low")) + "</span>" +
        '<span><i style="background:color-mix(in srgb,var(--warn) 45%,transparent)"></i>' + esc(t("risk.med")) + "</span>" +
        '<span><i style="background:color-mix(in srgb,var(--danger) 45%,transparent)"></i>' + esc(t("risk.high")) + "</span></div>" +
        '<p class="hint" style="margin-top:8px">' + esc(cellOn ? t("risk.cellActive") : t("risk.cellHint")) + "</p>" +
        (city ? '<p class="hint" style="margin-top:4px">' + esc(t("risk.cityNote")) + "</p>" : ""));
      out += h.card(h.cardHead(t("risk.appetite"), t("risk.appetiteSub")) +
        '<p style="font-size:12.6px;color:var(--text-2)">' + esc(L(SP.risksAppetite.statement)) + "</p>" +
        '<div class="stack-sm" style="margin-top:10px">' + SP.risksAppetite.thresholds.map(function (x) {
          return '<div class="row" style="gap:8px;align-items:flex-start"><span class="pill pill-' + (x.tone === "danger" ? "danger" : x.tone === "warn" ? "warn" : x.tone === "info" ? "info" : "ok") + '">' + esc(L(x.band)) + "</span>" +
            '<span class="tiny t-muted" style="flex:1">' + esc(L(x.action)) + "</span></div>";
        }).join("") + "</div>");
      out += "</div>";

      /* one heat map per pilot city */
      var cityCards = cities.map(function (c) {
        var n = h.cityRiskAdj(c.id), cc = countsFor(c.id), on = cityId === c.id;
        var cellPill = cellOn
          ? cc.total + " " + esc(t("risk." + h.riskTone(cellL * cellI)))
          : cc.critical + " " + esc(t("risk.critical")) + " · " + cc.high + " " + esc(t("risk.high"));
        return '<div class="card city-heat' + (on ? " active" : "") + '" role="button" tabindex="0" data-chip="riskCity" data-val="' + esc(c.id) + '" aria-pressed="' + (on ? "true" : "false") + '">' +
          '<div class="card-head"><div><h3>' + esc(c.id + " · " + c.country) + "</h3><p>" + esc(n ? n + " " + t("risk.cityAdjShort") : t("risk.cityBaseline")) + "</p></div>" +
          '<span class="pill">' + cellPill + "</span></div>" +
          heatMap(scoreOf(c.id), { small: true, ids: false }) + "</div>";
      });
      out += '<div style="margin-bottom:14px">' +
        h.cardHead(t("risk.cityGrid"), t("risk.cityGridSub")) +
        '<div class="city-heat-grid">' + cityCards.join("") + "</div>" +
        '<p class="hint" style="margin-top:10px">' + esc(t("risk.cityNote")) + "</p></div>";

      /* filters */
      var cats = [{ v: "", l: t("risk.allCats") }];
      Object.keys(SP.riskCats).forEach(function (k) { cats.push({ v: k, l: t("cat." + k) }); });
      out += '<div class="toolbar"><input class="search" type="search" data-filter="riskq" placeholder="' + esc(t("risk.search")) + '" value="' + esc(st.ui.riskq || "") + '">' +
        (cellOn ? '<button class="filter-chip" data-chip="riskCell" data-val="' + esc(cellFilter) + '" aria-pressed="true" title="' + esc(t("risk.cellClear")) + '">L' + cellL + " × I" + cellI + " ✕</button>" : "") +
        cats.map(function (c) {
          return '<button class="filter-chip" data-chip="riskcat" data-val="' + esc(c.v) + '" aria-pressed="' + (st.ui.riskcat === c.v ? "true" : "false") + '">' + esc(c.l) + "</button>";
        }).join("") + "</div>";

      var q = (st.ui.riskq || "").toLowerCase();
      var sOf = scoreOf(cityId);
      var rows = SP.risks.filter(function (r) {
        if (st.ui.riskcat && r.cat !== st.ui.riskcat) return false;
        if (cellOn) {
          var cs = sOf(r);
          if (cs.l !== cellL || cs.i !== cellI) return false;
        }
        if (q) {
          var hay = (r.id + " " + L(r.t) + " " + L(r.d) + " " + L(r.m) + " " + r.owner + " " + t("cat." + r.cat)).toLowerCase();
          if (hay.indexOf(q) < 0) return false;
        }
        return true;
      }).sort(function (a, b) {
        var sa = sOf(a), sb = sOf(b);
        return sb.l * sb.i - sa.l * sa.i;
      });

      var body = rows.map(function (r) {
        var sc = sOf(r), score = sc.l * sc.i, tone = h.riskTone(score);
        var cityAdj = city && (sc.l !== r.l || sc.i !== r.i);
        var cur = st.data.risks[r.id] || r.status;
        return '<td class="col-id">' + esc(r.id) + "</td>" +
          "<td><strong>" + esc(L(r.t)) + '</strong><div class="tiny t-muted" style="margin-top:3px">' + esc(L(r.d)) + "</div>" +
          (((SP.gonoByRisk || {})[r.id] || []).length
            ? '<div class="tiny link-row">' + esc(t("link.gono")) + ": " + SP.chipLinks("gono", SP.gonoByRisk[r.id]) + "</div>"
            : '<div class="tiny t-muted link-row">' + esc(t("link.none")) + "</div>") + "</td>" +
          '<td><span class="pill">' + esc(t("cat." + r.cat)) + "</span></td>" +
          '<td class="num">' + sc.l + " × " + sc.i + '<div class="score-chip" style="margin-top:3px">' + score + "</div>" +
            (cityAdj ? '<div class="tiny t-muted">' + esc(t("risk.cityAdj")) + "</div>" : "") + "</td>" +
          '<td><span class="badge badge-' + (tone === "critical" ? "gap" : tone === "high" ? "partial" : tone === "medium" ? "info" : "ready") + '">' + esc(t("risk." + tone)) + "</span></td>" +
          '<td><div class="tiny">' + esc(L(r.m)) + '</div><div class="tiny t-muted" style="margin-top:4px">' + esc(t("risk.due")) + ": " + esc(r.due) + " · " + esc(r.owner) + "</div></td>" +
          "<td>" + h.statusSelect("risks", r.id, cur, ["open", "treating", "accepted", "closed"]) + "</td>";
      });

      out += '<div class="no-print">' + h.table([{ label: t("common.id") }, { label: t("common.description") }, { label: t("common.category") },
        { label: "L × I", num: true }, { label: t("risk.band") }, { label: t("common.treatment") }, { label: t("common.status") }], body,
        { foot: (cellOn ? "L" + cellL + " × I" + cellI + " · " : "") + (city ? esc(city.id) + " · " : "") + esc(t("risk.foot")) + " · <strong>" + SP.risks.filter(function (r) { return ((SP.gonoByRisk || {})[r.id] || []).length; }).length + "/" + SP.risks.length + "</strong> " + esc(t("link.riskCovered")) }) + "</div>";

      /* site score adjustment for the selected city */
      var printFilterBits = [];
      if (city) printFilterBits.push(t("risk.printCity") + ": " + city.id + " · " + city.country);
      if (cellOn) printFilterBits.push(t("risk.printCell") + ": L" + cellL + " × I" + cellI);
      if (st.ui.riskcat) printFilterBits.push(t("common.category") + ": " + t("cat." + st.ui.riskcat));
      if ((st.ui.riskq || "").trim()) printFilterBits.push(t("risk.printQuery") + ": " + st.ui.riskq.trim());
      if (!printFilterBits.length) printFilterBits.push(t("risk.printAll"));
      var printBadge = { open: "badge-gap", treating: "badge-partial", accepted: "badge-info", closed: "badge-ready" };
      var printBody = rows.map(function (r) {
        var sc = sOf(r), score = sc.l * sc.i, tone = h.riskTone(score);
        var cur = st.data.risks[r.id] || r.status;
        return '<td class="col-id">' + esc(r.id) + "</td>" +
          '<td><strong>' + esc(L(r.t)) + '</strong><div class="tiny">' + esc(L(r.d)) + "</div></td>" +
          '<td>' + esc(t("cat." + r.cat)) + "</td>" +
          '<td class="num">' + sc.l + " × " + sc.i + '<div class="score-chip" style="margin-top:2px">' + score + "</div></td>" +
          '<td><span class="badge ' + (tone === "critical" ? "badge-gap" : tone === "high" ? "badge-partial" : tone === "medium" ? "badge-info" : "badge-ready") + '">' + esc(t("risk." + tone)) + "</span></td>" +
          '<td>' + esc(L(r.m)) + '<div class="tiny">' + esc(t("risk.due")) + ": " + esc(r.due) + " · " + esc(r.owner) + "</div></td>" +
          '<td><span class="badge ' + (printBadge[cur] || "badge-na") + '">' + esc(t("status." + cur)) + "</span></td>";
      });

      if (city) {
        var cityMeta = h.cityRiskMeta(city.id);
        var editBody = SP.risks.map(function (r) {
          var cur = h.cityRiskScore(city.id, r), sc = cur.l * cur.i;
          var adjusted = cur.l !== r.l || cur.i !== r.i;
          return '<td class="col-id">' + esc(r.id) + "</td>" +
            "<td><strong>" + esc(L(r.t)) + "</strong>" + (adjusted ? ' <span class="pill pill-warn">' + esc(t("risk.cityAdj")) + "</span>" : "") + "</td>" +
            '<td class="num mono">' + r.l + " × " + r.i + "</td>" +
            "<td>" + axisSelect(city.id, r.id, "l", cur.l) + "</td>" +
            "<td>" + axisSelect(city.id, r.id, "i", cur.i) + "</td>" +
            '<td class="num"><span class="score-chip">' + sc + "</span></td>";
        });
        out += '<div style="margin-top:14px">' + h.card(h.cardHead(t("risk.cityScoreTitle"), t("risk.cityScoreSub")) +
          h.table([{ label: t("common.id") }, { label: t("common.description") }, { label: t("risk.cityBaseCol"), num: true },
            { label: "L" }, { label: "I" }, { label: t("risk.cityScore"), num: true }], editBody, { foot: esc(t("risk.cityScoreFoot")) })) + "</div>";
        out += '<div data-citymeta-card="' + esc(city.id) + '" style="margin-top:14px">' + h.card(
          h.cardHead(t("risk.cityMetaTitle"), t("risk.cityMetaSub")) +
          '<div class="grid g3" style="gap:10px">' +
            '<label class="tiny t-muted">' + esc(t("risk.cityMetaOwner")) +
              '<input class="input" style="width:100%" type="text" data-citymeta="' + esc(city.id + "|owner") + '" value="' + esc(cityMeta.owner || "") + '" placeholder="' + esc(t("risk.cityMetaOwnerPh")) + '"></label>' +
            '<label class="tiny t-muted">' + esc(t("risk.cityMetaVerified")) +
              '<input class="input" style="width:100%" type="date" data-citymeta="' + esc(city.id + "|verifiedOn") + '" value="' + esc(cityMeta.verifiedOn || "") + '"></label>' +
            '<label class="tiny t-muted" style="grid-column:1/-1">' + esc(t("risk.cityMetaNote")) +
              '<textarea class="input" style="width:100%" rows="2" data-citymeta="' + esc(city.id + "|note") + '" placeholder="' + esc(t("risk.cityMetaNotePh")) + '">' + esc(cityMeta.note || "") + "</textarea></label>" +
          "</div>" +
          '<div class="row" style="margin-top:10px;justify-content:flex-end"><button class="btn btn-primary btn-sm" type="button" data-citymeta-save="' + esc(city.id) + '">' + esc(t("risk.cityMetaSave")) + "</button></div>"
        ) + "</div>";
      }

      /* A print/PDF-only section: the interactive table is hidden on paper and the
         currently filtered rows are reproduced with static status labels. */
      out += '<section class="print-only risk-print">' +
        '<div class="print-head"><div class="eyebrow">SAFE-PARKS · WP3</div>' +
        '<h2>' + esc(t("risk.printTitle")) + "</h2>" +
        '<p>' + esc(t("risk.printSub")) + "</p>" +
        '<p class="print-filter"><strong>' + esc(t("risk.printFilter")) + ":</strong> " + esc(printFilterBits.join(" · ")) +
        ' · <strong>' + rows.length + "</strong> " + esc(t("risk.printRows")) + "</p></div>" +
        h.table([{ label: t("common.id") }, { label: t("common.description") }, { label: t("common.category") },
          { label: "L × I", num: true }, { label: t("risk.band") }, { label: t("common.treatment") }, { label: t("common.status") }], printBody,
          { foot: esc(t("risk.printFoot")) }) + "</section>";

      return out;
    }
  };

  /* ================= MISSING EVIDENCE ================= */
  SP.views.evidence = {
    render: function () {
      var h = H(), t = h.t, esc = h.esc, L = h.L, st = h.state;
      var notes = st.data.notes || {};
      function evRef(id) { return String(notes["comp|" + id + "|ref"] || "").trim(); }
      function evNote(id) { return String(notes["comp|" + id + "|note"] || "").trim(); }
      function evDate(id) { return String(notes["comp|" + id + "|verifiedOn"] || "").trim(); }
      function evBy(id) { return String(notes["comp|" + id + "|verifiedBy"] || "").trim(); }
      function short(s, n) { s = String(s || "").trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; }

      var all = SP.allCompliance || [];
      var missing = all.filter(function (r) { return !evRef(r.id) && !evNote(r.id); });
      var recorded = all.length - missing.length;

      var fwOrder = {};
      (SP.frameworks || []).forEach(function (f, i) { fwOrder[f.id] = i; });
      function byFwThenId(a, b) {
        var fa = fwOrder[a.fw] === undefined ? 99 : fwOrder[a.fw];
        var fb = fwOrder[b.fw] === undefined ? 99 : fwOrder[b.fw];
        return fa - fb || a.id.localeCompare(b.id);
      }

      var byOwner = {};
      all.forEach(function (r) {
        var o = r.owner || "—";
        byOwner[o] = byOwner[o] || { owner: o, total: 0, missing: [] };
        byOwner[o].total++;
      });
      missing.forEach(function (r) {
        var o = r.owner || "—";
        if (!byOwner[o]) byOwner[o] = { owner: o, total: 0, missing: [] };
        byOwner[o].missing.push(r);
      });
      var groups = Object.keys(byOwner).map(function (k) { return byOwner[k]; })
        .filter(function (g) { return g.missing.length; })
        .sort(function (a, b) { return b.missing.length - a.missing.length || a.owner.localeCompare(b.owner); });
      groups.forEach(function (g) { g.missing.sort(byFwThenId); });
      var pending = all.filter(function (r) {
        var hasEvidence = evRef(r.id) || evNote(r.id);
        var hasVerification = evDate(r.id) || evBy(r.id);
        return hasEvidence && !hasVerification;
      }).sort(function (a, b) {
        return (a.owner || "").localeCompare(b.owner || "") || byFwThenId(a, b);
      });

      var out = h.head(t("evp.eyebrow"), t("evp.title"), t("evp.lede"));
      out += '<div class="row" style="margin-bottom:12px"><button class="btn" data-act="export-missing-csv">' + esc(t("evp.downloadCsv")) + "</button></div>";
      out += '<div class="grid g4" style="margin-bottom:14px">' +
        h.kpi(t("evp.kpi.missing"), String(missing.length), missing.length ? t("evp.kpi.missingNote") : t("evp.kpi.noneNote"), true) +
        h.kpi(t("evp.kpi.coverage"), h.pct((recorded / all.length) * 100), recorded + "/" + all.length, false) +
        h.kpi(t("evp.kpi.owners"), String(groups.length), t("evp.kpi.ownersNote"), false) +
        h.kpi(t("evp.kpi.worst"), groups.length ? esc(groups[0].owner) : "—",
          groups.length ? groups[0].missing.length + " " + t("evp.missingShort") : t("evp.kpi.noneNote"), false) +
        "</div>";
      out += '<div style="margin-bottom:14px">' + h.callout(esc(t("evp.defNote")), "", "i") + "</div>";

      var badgeCls = { ready: "badge-ready", partial: "badge-partial", gap: "badge-gap", na: "badge-na" };
      if (pending.length) {
        var pendingBody = pending.map(function (r) {
          var cur = h.compStatus(r);
          var evidence = "";
          if (evRef(r.id)) evidence += '<div class="tiny mono">' + esc(short(evRef(r.id), 90)) + "</div>";
          if (evNote(r.id)) evidence += '<div class="tiny t-muted">' + esc(short(evNote(r.id), 140)) + "</div>";
          return '<td class="col-id mono">' + esc(r.id) + "</td>" +
            '<td class="nowrap"><span class="pill">' + esc(r.fw) + "</span></td>" +
            "<td><div class=\"t-strong\">" + esc(L(r.req)) + '</div><div class="tiny t-muted" style="margin-top:3px">' + esc(r.ev) + "</div></td>" +
            '<td class="nowrap">' + esc(r.owner) + "</td>" +
            "<td>" + (evidence || "—") + "</td>" +
            '<td><span class="badge ' + (badgeCls[cur] || "badge-na") + '">' + esc(t("status." + cur)) + "</span></td>" +
            '<td class="nowrap"><a class="btn btn-sm" href="#compliance" data-link="comp:' + esc(r.id) + '">' + esc(t("evp.open")) + "</a></td>";
        });
        out += '<div style="margin-top:12px">' + h.card(
          h.cardHead(esc(t("evp.pendingTitle")), pending.length + " " + t("evp.pendingShort")) +
          '<p class="tiny t-muted" style="margin:-4px 0 10px">' + esc(t("evp.pendingNote")) + "</p>" +
          h.table([{ label: t("common.id") }, { label: t("common.framework") }, { label: t("common.requirement") },
            { label: t("common.owner") }, { label: t("evp.pendingEvidence") }, { label: t("common.status") }, { label: "" }], pendingBody,
            { foot: esc(t("evp.pendingFoot")) })) + "</div>";
      }

      if (!missing.length) {
        out += h.card(h.cardHead(t("evp.title"), recorded + "/" + all.length) +
          h.callout("<strong>" + esc(t("evp.empty")) + "</strong> " + esc(t("evp.emptyNote")), "", "✓"));
        return out;
      }

      groups.forEach(function (g) {
        var total = g.total, miss = g.missing.length;
        var body = g.missing.map(function (r) {
          var cur = h.compStatus(r);
          return '<td class="col-id mono">' + esc(r.id) + "</td>" +
            '<td class="nowrap"><span class="pill">' + esc(r.fw) + "</span></td>" +
            "<td><div class=\"t-strong\">" + esc(L(r.req)) + '</div><div class="tiny t-muted" style="margin-top:3px">' + esc(r.ev) + "</div></td>" +
            '<td><span class="badge ' + (badgeCls[cur] || "badge-na") + '">' + esc(t("status." + cur)) + "</span></td>" +
            '<td class="ev-cell" data-evidence-entry="' + esc(r.id) + '">' +
              '<input class="ev-input mono" type="text" data-note="comp|' + esc(r.id) + '|ref" value="' + esc(evRef(r.id)) + '" placeholder="' + esc(t("comp.evRefPh")) + '" aria-label="' + esc(t("comp.evRef")) + '">' +
              '<input class="ev-input" type="text" data-note="comp|' + esc(r.id) + '|note" value="' + esc(evNote(r.id)) + '" placeholder="' + esc(t("comp.evNotePh")) + '" aria-label="' + esc(t("comp.evNote")) + '">' +
              '<button type="button" class="btn btn-sm" data-evidence-save="' + esc(r.id) + '">' + esc(t("evp.save")) + "</button>" +
              '<div class="tiny link-row"><a href="#compliance" data-link="comp:' + esc(r.id) + '">' + esc(t("evp.open")) + "</a></div>" +
            "</td>";
        });
        out += '<div style="margin-top:12px">' + h.card(
          h.cardHead(esc(g.owner), miss + " / " + total + " " + t("evp.missingShort")) +
          '<div style="margin-bottom:10px">' + h.meter(((total - miss) / total) * 100) + "</div>" +
          h.table([{ label: t("common.id") }, { label: t("common.framework") }, { label: t("common.requirement") },
            { label: t("common.status") }, { label: t("common.evidence") }], body,
            { foot: miss + "/" + total + " " + esc(t("evp.missingShort")) + " · " + esc(t("evp.ownerFoot")) })) + "</div>";
      });
      return out;
    }
  };

  /* One-page A4 landscape heat map for the selected pilot city. */
  function cityHeatDoc(cityId) {
    var h = H();
    if (!h) return "";
    var city = (SP.pilotCities || []).filter(function (c) { return c.id === cityId; })[0];
    if (!city) return "";
    var lang = h.state.lang === "en" ? "en" : "tr";
    var tx = function (en, tr) { return lang === "en" ? en : tr; };
    var t = h.t, esc = h.esc, L = h.L;
    var scoreOf = function (r) { return h.cityRiskScore(city.id, r); };
    var bands = { critical: 0, high: 0, medium: 0, low: 0 };
    var adjusted = 0;
    var all = SP.risks.map(function (r) {
      var s = scoreOf(r), score = s.l * s.i, tone = h.riskTone(score);
      bands[tone]++;
      if (s.l !== r.l || s.i !== r.i) adjusted++;
      return { r: r, s: s, score: score, tone: tone, status: h.state.data.risks[r.id] || r.status };
    }).sort(function (a, b) { return b.score - a.score || a.r.id.localeCompare(b.r.id); });
    var top = all.slice(0, 10);
    var topRows = top.map(function (x) {
      return "<tr><td class=\"mono rid\">" + esc(x.r.id) + "</td>" +
        "<td><div class=\"risk-title\">" + esc(L(x.r.t)) + "</div><div class=\"risk-meta\">" + esc(x.r.owner) + " · " + esc(t("status." + x.status)) + "</div></td>" +
        "<td class=\"num\">" + x.s.l + " × " + x.s.i + "</td><td class=\"num score\">" + x.score + "</td></tr>";
    }).join("");
    var meta = h.cityRiskMeta(city.id);
    var metaOwner = String(meta.owner || "").trim() || "—";
    var metaNote = String(meta.note || "").trim() || tx("Not recorded", "Kaydedilmedi");
    var metaVerified = String(meta.verifiedOn || "").trim() || "—";
    var today = new Date().toISOString().slice(0, 10);
    var ciso = h.state.settings.ciso || tx("CISO function, Lotus Sirius", "CISO fonksiyonu, Lotus Sirius");
    var classification = (SP.meta && SP.meta.classification) || tx("Internal", "Dahili");
    var source = adjusted
      ? tx(adjusted + " of " + all.length + " risks use site scores for this city.", all.length + " riskten " + adjusted + " tanesi bu şehrin saha puanlarını kullanıyor.")
      : tx("All risks use the project baseline; no site score is set for this city.", "Tüm riskler proje tabanını kullanıyor; bu şehir için saha puanı girilmemiş.");
    var css = `
:root{--ink:#101828;--muted:#5b6472;--line:#d8dde5;--soft:#f7f9fb;--accent:#0f766e}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:#eef1f5;color:var(--ink);font:8.4pt/1.3 "Segoe UI",system-ui,Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.toolbar{max-width:297mm;margin:0 auto;background:#fff;border-bottom:1px solid var(--line);padding:6px 10mm;display:flex;justify-content:flex-end}
.toolbar button{font:inherit;border:1px solid var(--ink);background:var(--ink);color:#fff;padding:5px 10px;border-radius:5px;cursor:pointer}
main{width:297mm;max-width:100%;min-height:210mm;margin:0 auto;background:#fff;padding:9mm 10mm 7mm;display:flex;flex-direction:column}
.sheet-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10mm;border-bottom:2.5px solid var(--ink);padding-bottom:3.5mm;margin-bottom:4mm}
.kicker{font-size:7.4pt;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);font-weight:700}
h1{font-size:18pt;line-height:1.1;margin:1mm 0 1mm;letter-spacing:-.2px}
.meta{display:flex;flex-wrap:wrap;gap:1.2mm 4mm;justify-content:flex-end;max-width:120mm;font-size:7.2pt;color:var(--muted);text-align:right}
.meta b{color:var(--ink);font-weight:600}
.layout{display:grid;grid-template-columns:98mm minmax(0,1fr);gap:7mm;flex:1;min-height:0}
.map-panel{border:1px solid var(--line);border-radius:5px;padding:3.5mm;background:#fff}
h2{font-size:9pt;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin:0 0 2mm}
.heat{display:grid;grid-template-columns:7mm repeat(5,minmax(0,1fr));gap:1.2mm}
.heat-axis{display:flex;align-items:center;justify-content:center;font:7pt/1.1 ui-monospace,"Cascadia Mono",Consolas,monospace;color:var(--muted)}
.heat-cell{min-height:16mm;border:1px solid var(--line);border-radius:3px;padding:1.2mm 1.3mm;display:flex;flex-direction:column;justify-content:flex-start;overflow:hidden}
.heat-cell.empty{background:#fafbfc;color:#9aa4b2}
.heat-cell .count{font-size:9pt;font-weight:800;line-height:1}
.heat-cell .hc-list{font:6.2pt/1.15 ui-monospace,"Cascadia Mono",Consolas,monospace;margin-top:1mm;overflow-wrap:anywhere}
.h1{background:#e8f5ee;border-color:#b5dfc6;color:#14663a}
.h2{background:#f1f7e7;border-color:#cfdfb7;color:#3f631b}
.h3{background:#fdf3d9;border-color:#ead19a;color:#77520d}
.h4{background:#fbe6dd;border-color:#e8b9a6;color:#8f3c25}
.h5{background:#f7d5d2;border-color:#dba39d;color:#8f231a}
.legend{display:flex;flex-wrap:wrap;gap:1.5mm 4mm;margin-top:3mm;font-size:7.2pt;color:var(--muted)}
.legend span{display:inline-flex;align-items:center;gap:1.2mm}
.legend i{display:inline-block;width:3mm;height:3mm;border-radius:1px;border:1px solid rgba(16,24,40,.14)}
.note{font-size:7pt;line-height:1.3;color:var(--muted);margin:3mm 0 0}
.summary{display:flex;flex-direction:column;min-height:0}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:2mm;margin-bottom:3mm}
.kpi{border:1px solid var(--line);border-radius:4px;padding:2mm;background:var(--soft)}
.kpi b{display:block;font-size:14pt;line-height:1}.kpi span{display:block;font-size:6.8pt;color:var(--muted);margin-top:1mm}
.risk-table{width:100%;border-collapse:collapse;font-size:7pt;line-height:1.2}
.risk-table th{text-align:left;font-size:6.3pt;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);border-bottom:1.3px solid var(--ink);padding:1.2mm 1.4mm}
.risk-table td{padding:1.15mm 1.4mm;border-bottom:1px solid var(--line);vertical-align:top}
.risk-table tbody tr:nth-child(even){background:var(--soft)}
.risk-table .rid{white-space:nowrap;color:var(--muted);font-size:6.8pt}
.mono{font-family:ui-monospace,"Cascadia Mono",Consolas,monospace;font-size:7pt}
.risk-title{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:94mm}
.risk-meta{font-size:6.3pt;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:94mm;margin-top:.3mm}
.num{text-align:right;white-space:nowrap}.score{font-weight:800}
.site-record{display:flex;flex-wrap:wrap;gap:1.2mm 4mm;border:1px solid var(--line);border-radius:4px;background:var(--soft);padding:2mm 2.4mm;margin-bottom:3mm;font-size:6.8pt;color:var(--muted)}
.site-record b{color:var(--ink);font-weight:600}
.site-record .record-note{flex-basis:100%;line-height:1.3}
.table-note{font-size:6.8pt;color:var(--muted);margin:2mm 0 0}
.foot{border-top:1px solid var(--line);margin-top:4mm;padding-top:2mm;display:flex;justify-content:space-between;gap:5mm;font-size:6.7pt;color:var(--muted)}
@page{size:A4 landscape;margin:8mm 9mm 7mm}
@media print{body{background:#fff}.toolbar{display:none!important}main{width:auto;min-height:auto;margin:0;padding:0}.layout,.map-panel,.summary,.sheet-head{break-inside:avoid;page-break-inside:avoid}}
`;
    var doc = `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc("SAFE-PARKS — " + city.name + " · " + tx("pilot city heat map", "pilot şehir ısı haritası"))}</title><style>${css}</style></head><body>
<div class="toolbar"><button type="button" onclick="window.print()">${esc(tx("Print / PDF", "Yazdır / PDF"))}</button></div>
<main><section class="sheet">
<header class="sheet-head"><div><div class="kicker">SAFE-PARKS · WP3 · ${esc(tx("Pilot city risk", "Pilot şehir riski"))}</div>
<h1>${esc(tx("Pilot city risk heat map", "Pilot şehir risk ısı haritası"))}</h1></div>
<div class="meta"><span><b>${esc(tx("Site", "Saha"))}</b> ${esc(city.name)} · ${esc(city.id)} · ${esc(city.country)}</span>
<span><b>${esc(tx("Date", "Tarih"))}</b> <span class="mono">${today}</span></span>
<span><b>${esc(tx("Prepared by", "Hazırlayan"))}</b> ${esc(ciso)}</span>
<span><b>${esc(tx("Classification", "Sınıflandırma"))}</b> ${esc(classification)}</span></div></header>
<div class="layout"><section class="map-panel"><h2>${esc(tx("Heat map", "Isı haritası"))} · L × I</h2>${heatMap(scoreOf, { interactive: false })}
<div class="legend"><span><i style="background:#e8f5ee"></i>${esc(t("risk.low"))}</span><span><i style="background:#f1f7e7"></i>${esc(t("risk.medium"))}</span><span><i style="background:#fbe6dd"></i>${esc(t("risk.high"))}</span><span><i style="background:#f7d5d2"></i>${esc(t("risk.critical"))}</span></div>
<p class="note">${esc(tx("Counts show risk identifiers in each Likelihood × Impact cell. Site scores apply only to this city.", "Sayılar her Olasılık × Etki hücresindeki risk kimliklerini gösterir. Saha puanları yalnızca bu şehir için geçerlidir."))}</p></section>
<aside class="summary"><h2>${esc(tx("Risk profile", "Risk profili"))}</h2>
<div class="site-record"><span><b>${esc(tx("Site risk owner", "Saha riski sahibi"))}</b> ${esc(metaOwner)}</span><span><b>${esc(tx("Last verified", "Son doğrulama"))}</b> <span class="mono">${esc(metaVerified)}</span></span><div class="record-note"><b>${esc(tx("Note", "Not"))}</b> ${esc(metaNote)}</div></div>
<div class="kpis"><div class="kpi"><b>${bands.critical}</b><span>${esc(t("risk.critical"))}</span></div><div class="kpi"><b>${bands.high}</b><span>${esc(t("risk.high"))}</span></div><div class="kpi"><b>${bands.medium}</b><span>${esc(t("risk.medium"))}</span></div><div class="kpi"><b>${bands.low}</b><span>${esc(t("risk.low"))}</span></div></div>
<table class="risk-table"><thead><tr><th>${esc(t("common.id"))}</th><th>${esc(tx("Risk / owner / status", "Risk / sahip / durum"))}</th><th class="num">L × I</th><th class="num">${esc(tx("Score", "Puan"))}</th></tr></thead><tbody>${topRows}</tbody></table>
<p class="table-note">${esc(tx("Top " + top.length + " of " + all.length + " risks by score. The heat map lists every risk.", "Puan sırasına göre " + all.length + " riskten ilk " + top.length + ". Isı haritası tüm riskleri listeler."))}</p>
<p class="table-note">${esc(source)}</p></aside></div>
<footer class="foot"><span>SAFE-PARKS · WP3 · ${esc(city.id)} · ${esc(today)}</span><span>${esc(tx("Page 1 / 1 · A4 landscape", "Sayfa 1 / 1 · A4 yatay"))}</span></footer>
</section></main></body></html>`;
    return doc;
  }

  function printCityHeat(cityId) {
    var h = H();
    if (!h) return;
    var doc = cityHeatDoc(cityId);
    if (!doc) return;
    var win = window.open("", "_blank");
    if (!win) { h.toast(h.t("risk.printBlocked")); return; }
    win.document.open();
    win.document.write(doc);
    win.document.close();
    win.focus();
    setTimeout(function () { try { win.print(); } catch (e) { /* user can print from the window */ } }, 350);
  }
  SP.cityHeatPrintDoc = cityHeatDoc;
  SP.printCityHeat = printCityHeat;

  function heatMap(scoreOf, opts) {
    var o = opts || {};
    var esc = SP.h.esc;
    var map = {};
    SP.risks.forEach(function (r) {
      var s = scoreOf(r), k = s.l + "-" + s.i;
      (map[k] = map[k] || []).push(r.id);
    });
    var html = "";
    for (var i = 5; i >= 1; i--) {
      html += '<div class="heat-axis">I' + i + "</div>";
      for (var j = 1; j <= 5; j++) {
        var s = i * j, ids = map[j + "-" + i] || [];
        var cls = s >= 20 ? "h5" : s >= 12 ? "h4" : s >= 6 ? "h3" : s >= 3 ? "h2" : "h1";
        var label = "L" + j + " × I" + i + " = " + s + (ids.length ? " · " + ids.join(" ") : "");
        var body = (ids.length ? ids.length : "·") +
          (!o.small && ids.length ? '<span class="hc-list">' + ids.join(" ") + "</span>" : "");
        if (o.interactive && ids.length) {
          var on = o.active === j + "-" + i;
          html += '<button type="button" class="heat-cell heat-btn ' + cls + '" data-heat="' + j + '-' + i + '" aria-pressed="' + (on ? "true" : "false") + '" aria-label="' + esc(label + " · " + SP.h.t("risk.cellFilterHint")) + '" title="' + esc(label + " · " + SP.h.t("risk.cellFilterHint")) + '">' + body + "</button>";
        } else {
          html += '<div class="heat-cell ' + cls + (ids.length ? "" : " empty") + '" title="' + esc(label) + '">' + body + "</div>";
        }
      }
    }
    html += '<div class="heat-axis"></div>';
    for (var k = 1; k <= 5; k++) html += '<div class="heat-axis">L' + k + "</div>";
    return '<div class="heat' + (o.small ? " heat-sm" : "") + '">' + html + "</div>";
  }
})();
