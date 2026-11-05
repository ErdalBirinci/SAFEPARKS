/* SAFE-PARKS CISO Portal — pilot go/no-go view */
(function () {
  "use strict";

  function H() { return window.SP.h; }
  function SP() { return window.SP; }

  function cities() {
    return (SP().partners || []).filter(function (p) { return p.id.charAt(0) === "M"; });
  }
  function gonoStore() {
    var h = H();
    if (!h) return {};
    h.state.data.gono = h.state.data.gono || {};
    return h.state.data.gono;
  }
  function statusOf(store, city, itemId) {
    return store[city + "|" + itemId] || "open";
  }
  function itemLinks(itemId) {
    var lk = (SP().gonoLinks || {})[itemId] || {};
    return { comp: (lk.comp || []).slice(), risks: (lk.risks || []).slice() };
  }
  function cityStats(city) {
    var store = gonoStore();
    var out = { items: 0, pass: 0, partial: 0, fail: 0, na: 0, open: 0, blockingOpen: 0, blockingPartial: 0, blockingFail: 0, blockingGates: [], score: 0, assessable: 0 };
    (SP().gonoGates || []).forEach(function (g) {
      var gateOpen = false;
      g.items.forEach(function (i) {
        var st = statusOf(store, city, i.id);
        out.items++;
        if (i.blocking && st !== "pass") gateOpen = true;
        if (st === "na") { out.na++; if (i.blocking) out.blockingOpen++; return; }
        out.assessable++;
        if (st === "pass") { out.pass++; out.score += 1; }
        else if (st === "partial") { out.partial++; out.score += 0.5; if (i.blocking) { out.blockingPartial++; out.blockingOpen++; } }
        else if (st === "fail") { out.fail++; if (i.blocking) { out.blockingFail++; out.blockingOpen++; } }
        else { out.open++; if (i.blocking) out.blockingOpen++; }
      });
      if (gateOpen) out.blockingGates.push(g.id);
    });
    out.readiness = out.assessable ? (out.score / out.assessable) * 100 : 0;
    out.decision = out.blockingOpen ? "nogo" : (out.fail || out.partial || out.open ? "conditional" : "go");
    return out;
  }
  function gateStats(city, gate) {
    var store = gonoStore();
    var out = { n: gate.items.length, pass: 0, blockingOpen: 0 };
    gate.items.forEach(function (i) {
      var st = statusOf(store, city, i.id);
      if (st === "pass") out.pass++;
      if (i.blocking && st !== "pass") out.blockingOpen++;
    });
    return out;
  }
  function decisionBadge(t, decision, big) {
    var map = { go: ["badge-ready", "gono.go"], conditional: ["badge-partial", "gono.conditional"], nogo: ["badge-gap", "gono.nogo"] };
    var m = map[decision] || map.nogo;
    return '<span class="badge ' + m[0] + (big ? " badge-lg" : "") + '">' + t(m[1]) + "</span>";
  }

  function printGonoRecord(cityId) {
    var h = H();
    if (!h) return;
    var city = cities().filter(function (c) { return c.id === cityId; })[0];
    if (!city) return;
    var lang = h.state.lang === "en" ? "en" : "tr";
    var tx = function (en, tr) { return lang === "en" ? en : tr; };
    var t = h.t, esc = h.esc, L = h.L;
    var store = h.state.data.gono || {};
    var stats = cityStats(city.id);
    var blockingTotal = 0;
    (SP().gonoGates || []).forEach(function (g) {
      g.items.forEach(function (i) { if (i.blocking) blockingTotal++; });
    });
    var gateRows = (SP().gonoGates || []).map(function (g) {
      var pass = 0, open = 0;
      g.items.forEach(function (i) {
        var st = store[city.id + "|" + i.id] || "open";
        if (st === "pass") pass++;
        if (i.blocking && st !== "pass") open++;
      });
      return { id: g.id, name: L(g.name), pass: pass, total: g.items.length, open: open };
    });
    var statusLabel = function (st) {
      return {
        pass: tx("passed", "geçti"), partial: tx("partial", "kısmi"), fail: tx("failed", "başarısız"),
        open: tx("not evaluated", "değerlendirilmedi"), na: tx("not applicable", "uygulanamaz")
      }[st] || st;
    };
    var shortReq = function (s) {
      s = String(s || "").replace(/\s+/g, " ").trim();
      if (s.length <= 118) return s;
      return s.slice(0, 115).replace(/\s+\S*$/, "") + "…";
    };
    var linkText = function (x) {
      var out = [];
      if (x.comp.length) out.push("C: " + x.comp.join(" "));
      if (x.risks.length) out.push("R: " + x.risks.join(" "));
      return out.join(" · ");
    };
    var gaps = [], soft = [];
    (SP().gonoGates || []).forEach(function (g) {
      g.items.forEach(function (i) {
        var st = store[city.id + "|" + i.id] || "open";
        var lk = itemLinks(i.id);
        if (i.blocking && st !== "pass") gaps.push({ id: i.id, owner: i.owner, ref: i.ref, req: shortReq(L(i.req)), label: statusLabel(st), comp: lk.comp, risks: lk.risks });
        if (!i.blocking && st !== "pass" && st !== "na") soft.push({ id: i.id, comp: lk.comp, risks: lk.risks });
      });
    });
    var gateHtml = gateRows.map(function (g) {
      return "<tr><td class=\"mono\">" + esc(g.id) + "</td><td><strong>" + esc(g.name) + "</strong></td>" +
        "<td class=\"num\">" + g.pass + " / " + g.total + "</td><td class=\"num\">" + g.open + "</td>" +
        "<td>" + (g.open ? '<span class="pill open">' + tx("Open", "Açık") + "</span>" : '<span class="pill clear">' + tx("Clear", "Temiz") + "</span>") + "</td></tr>";
    }).join("");
    var gapsHtml = gaps.length
      ? '<div class="gaps">' + gaps.map(function (x) {
        return '<div class="gap"><div class="gap-req"><span class="mono gid">' + esc(x.id) + '</span><span class="req">' + esc(x.req) + '</span></div>' +
          '<div class="gap-meta"><span class="own">' + esc(x.owner) + '</span><span class="ref mono">' + esc(x.ref) + '</span><span class="st">' + esc(x.label) + '</span>' +
          (linkText(x) ? '<span class="gap-links mono" title="' + esc(tx("Controls / Risks", "Kontroller / Riskler")) + '">' + esc(linkText(x)) + '</span>' : "") + '</div></div>';
      }).join("") + "</div>"
      : '<p class="none">' + tx("No blocking item is open for this city.", "Bu şehir için açık bloklayıcı madde yok.") + "</p>";
    var softText = soft.map(function (x) {
      var links = linkText(x);
      return x.id + (links ? " [" + links + "]" : "");
    }).join(", ");
    var signRows = [
      [tx("CISO, Lotus Sirius (WP3 lead)", "CISO, Lotus Sirius (WP3 lideri)"), h.state.settings.ciso || ""],
      [tx("Municipality representative", "Belediye temsilcisi"), ""],
      [tx("Data protection officer", "Veri koruma görevlisi"), h.state.settings.dpo || ""],
      [tx("CEO — residual risk acceptance", "CEO — artık risk kabulü"), ""]
    ].map(function (r) {
      return "<tr><td>" + esc(r[0]) + '</td><td class="fill">' + (r[1] ? '<span class="prefill">' + esc(r[1]) + "</span>" : "") + '</td><td class="fill"></td><td class="fill"></td></tr>';
    }).join("");
    var ga = h.state.settings.ga || SP().meta.gaNumber || tx("not recorded", "henüz girilmedi");
    var decisionLabel = stats.decision === "go" ? "GO" : stats.decision === "conditional" ? tx("CONDITIONAL GO", "KOŞULLU GO") : "NO-GO";
    var decisionClass = stats.decision === "go" ? "b-go" : stats.decision === "conditional" ? "b-cond" : "b-no";
    var verdictClass = stats.decision === "go" ? "v-go" : stats.decision === "conditional" ? "v-cond" : "v-no";
    var reading = stats.decision === "nogo"
      ? tx(stats.blockingOpen + " of " + blockingTotal + " blocking items are not passed; the site may not go live.",
        blockingTotal + " bloklayıcı maddenin " + stats.blockingOpen + " tanesi geçmedi; saha devreye alınamaz.")
      : stats.decision === "conditional"
        ? tx("Every blocking item is passed. Non-blocking items remain open, partial or failed, so go-live is allowed only with the conditions on this record.",
          "Bloklayıcı maddelerin tümü geçti. Bloklayıcı olmayan maddeler açık, kısmi veya başarısız; devreye alma yalnızca bu tutanaktaki koşullarla mümkündür.")
        : tx("All " + stats.items + " items are passed, including all " + blockingTotal + " blocking items. The site may go live.",
          "Bloklayıcı " + blockingTotal + " madde dahil " + stats.items + " maddenin tümü geçti. Saha devreye alınabilir.");
    var pct = h.pct(stats.readiness);
    var today = new Date().toISOString().slice(0, 10);
    var recordNo = "SP-GONO-" + city.id + "-" + today;
    var printCss = `
:root{--ink:#101828;--muted:#5b6472;--line:#d8dde5;--soft:#f7f9fb;--accent:#0f766e}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:#eef1f5;color:var(--ink);font:11px/1.42 "Segoe UI",system-ui,Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
main{max-width:794px;margin:0 auto;background:#fff;padding:22px 26px 26px}
.toolbar{position:sticky;top:0;z-index:5;max-width:794px;margin:0 auto;background:#fff;border-bottom:1px solid var(--line);padding:7px 26px;display:flex;justify-content:flex-end;font-size:11px;color:var(--muted)}
.toolbar button{font:inherit;border:1px solid var(--ink);background:var(--ink);color:#fff;padding:5px 10px;border-radius:5px;cursor:pointer}
.rec-head{border-bottom:2.5px solid var(--ink);padding-bottom:6px;margin-bottom:8px}
.kicker{font-size:9.2px;letter-spacing:.12em;color:var(--accent);font-weight:700}
h1{font-size:19px;margin:4px 0 5px;letter-spacing:-.2px}
.meta{display:flex;flex-wrap:wrap;gap:3px 14px;font-size:9.4px;color:var(--muted)}
.meta b{color:var(--ink);font-weight:600}
.verdict{border:1.5px solid var(--line);border-radius:6px;padding:6px 9px;margin:0 0 7px}
.v-no{border-color:#cf8f7f;background:#fdf3f1}
.v-cond{border-color:#dfae9f;background:#fdf6ec}
.v-go{border-color:#b5dfc6;background:#f0f8f2}
.stamp{display:inline-block;font-size:15px;font-weight:800;letter-spacing:.06em;padding:3px 10px;border-radius:4px;border:1.5px solid}
.b-no{color:#8f231a;border-color:#c98878;background:#fff}
.b-cond{color:#8a5312;border-color:#d8a35c;background:#fff}
.b-go{color:#14663a;border-color:#7cbb96;background:#fff}
.reading{font-size:11px;margin:6px 0 4px}
.tally{font-size:9.6px;color:var(--muted)}
h2.h{font-size:10.4px;letter-spacing:.05em;margin:7px 0 3px;color:var(--muted);font-weight:700}
table{width:100%;border-collapse:collapse;margin:0 0 4px;font-size:9.4px}
th{text-align:left;font-size:8.5px;color:var(--muted);font-weight:700;border-bottom:1.3px solid var(--ink);padding:3px 5px}
td{padding:2px 5px;border-bottom:1px solid var(--line);vertical-align:top}
tbody tr:nth-child(even){background:var(--soft)}
td.num,th.num{text-align:right;white-space:nowrap}
.mono{font-family:ui-monospace,"Cascadia Mono",Consolas,monospace;font-size:8.7px}
.tiny{font-size:8.7px;color:var(--muted);margin:2px 0 5px}
.pill{display:inline-block;font-size:8.4px;font-weight:700;padding:1px 6px;border-radius:8px;border:1px solid var(--line)}
.pill.open{background:#fdeceb;border-color:#f3c2be;color:#8f231a}
.pill.clear{background:#e8f5ee;border-color:#b5dfc6;color:#14663a}
.none{font-size:9.5px;color:var(--muted);margin:0 0 5px;padding:5px 7px;border:1px dashed var(--line);border-radius:5px}
.gaps{display:grid;grid-template-columns:1fr 1fr;gap:0 16px;margin:0 0 4px}
.gap{border-bottom:1px solid var(--line);padding:0 0 1px;break-inside:avoid;page-break-inside:avoid}
.gap-req{display:flex;gap:6px;align-items:baseline;font-size:8.2px;line-height:1.2;color:#2b3442}
.gap-req .req{flex:1;max-height:2.45em;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.gid{min-width:32px}
.gap-meta{display:flex;gap:5px;align-items:baseline;font-size:7.3px;line-height:1.15;color:var(--muted);margin-top:1px}
.gap-meta .own{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gap-meta .ref{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gap-meta .gap-links{flex:0 1 auto;min-width:0;font-size:7.1px;line-height:1.15;color:#3c4654;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.st{white-space:nowrap;color:var(--muted)}
.ref{font-size:7.8px;color:var(--muted);line-height:1.25}
.attest{font-size:8.8px;line-height:1.3;color:#2b3442;border-left:3px solid var(--accent);padding:4px 8px;background:#f5faf9;margin:5px 0}
.sign-fields{display:flex;gap:24px;font-size:9px;margin:5px 0}
.blank{display:inline-block;min-width:150px;border-bottom:1px solid var(--ink);height:11px;vertical-align:-1px}
.blank.short{min-width:80px}
table.sign{font-size:9px;margin-bottom:4px}
table.sign td.fill{height:21px;border-bottom:1px solid var(--ink)}
table.sign tbody tr:last-child td{border-bottom:1px solid var(--ink)}
.rec-foot{display:flex;justify-content:space-between;gap:14px;border-top:1px solid var(--line);padding-top:5px;font-size:8.4px;color:var(--muted)}
@page{size:A4;margin:11mm 11mm 10mm}
@media print{body{background:#fff}main{max-width:none;padding:0}.toolbar{display:none!important}.record{padding:0}table,.attest,.verdict,.sign,.gaps{break-inside:avoid;page-break-inside:avoid}}
`;
    var doc = `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc("SAFE-PARKS — " + city.name + " · " + recordNo)}</title><style>${printCss}</style></head><body>
<div class="toolbar"><button type="button" onclick="window.print()">${esc(tx("Print / PDF", "Yazdır / PDF"))}</button></div>
<main><section class="record">
<div class="rec-head"><div class="kicker">SAFE-PARKS · WP3 · ${esc(tx("CISO decision record", "CISO karar tutanağı"))}</div>
<h1>${esc(tx("Pilot go/no-go decision", "Pilot go/no-go kararı"))}</h1>
<div class="meta">
<span><b>${esc(tx("Site", "Saha"))}</b> ${esc(city.name)} · ${esc(city.id)} · ${esc(city.country)}</span>
<span><b>${esc(tx("Record", "Tutanak"))}</b> <span class="mono">${esc(recordNo)}</span></span>
<span><b>${esc(tx("Date", "Tarih"))}</b> <span class="mono">${today}</span></span>
<span><b>${esc(tx("Classification", "Sınıflandırma"))}</b> ${esc(SP().meta.classification)}</span>
<span><b>${esc(tx("Grant Agreement", "Grant Agreement"))}</b> ${esc(ga)}</span>
<span><b>${esc(tx("Prepared by", "Hazırlayan"))}</b> ${esc(h.state.settings.ciso || tx("CISO function, Lotus Sirius", "CISO fonksiyonu, Lotus Sirius"))}</span>
</div></div>
<div class="verdict ${verdictClass}"><span class="stamp ${decisionClass}">${esc(decisionLabel)}</span>
<div class="reading">${esc(reading)}</div>
<div class="tally">${esc(tx("Passed " + stats.pass + " of " + stats.items + " · blocking open " + stats.blockingOpen + " of " + blockingTotal + " · readiness " + pct, stats.items + " maddenin " + stats.pass + " tanesi geçti · açık bloklayıcı " + blockingTotal + " maddenin " + stats.blockingOpen + " tanesi · hazırlık " + pct))}</div></div>
<h2 class="h">${esc(tx("Gate results", "Kapı sonuçları"))}</h2>
<table><thead><tr><th>${esc(tx("Gate", "Kapı"))}</th><th>${esc(tx("Scope", "Kapsam"))}</th><th>${esc(tx("Passed", "Geçen"))}</th><th>${esc(tx("Blocking open", "Açık bloklayıcı"))}</th><th>${esc(tx("Verdict", "Sonuç"))}</th></tr></thead><tbody>${gateHtml}</tbody></table>
<h2 class="h">${esc(tx("Blocking items not passed", "Geçmeyen bloklayıcı maddeler"))}</h2>${gapsHtml}
${soft.length ? '<p class="tiny">' + esc(tx("Non-blocking items not passed: " + softText + ".", "Geçmeyen bloklayıcı olmayan maddeler: " + softText + ".")) + '</p>' : ""}
<p class="attest">${esc(tx("I confirm that I reviewed the gate results above against the build hash recorded on this page, that the listed evidence exists for every item marked as passed, and that this decision reflects the evidence available on the date of signature. The CISO veto remains absolute for unresolved critical or high findings.", "Yukarıdaki kapı sonuçlarını bu sayfada kayıtlı derleme hash'i ile birlikte incelediğimi, geçti olarak işaretlenen her madde için listelenen kanıtın mevcut olduğunu ve bu kararın imza tarihindeki kanıtı yansıttığını teyit ederim. Çözülmemiş kritik veya yüksek bulgularda CISO vetosu mutlaktır."))}</p>
<div class="sign-fields"><span><b>${esc(tx("Build hash", "Derleme hash'i"))}</b> <i class="blank"></i></span><span><b>${esc(tx("Next review", "Sonraki gözden geçirme"))}</b> <i class="blank short"></i></span></div>
<table class="sign"><thead><tr><th>${esc(tx("Role", "Rol"))}</th><th>${esc(tx("Name", "Ad soyad"))}</th><th>${esc(tx("Signature", "İmza"))}</th><th>${esc(tx("Date", "Tarih"))}</th></tr></thead><tbody>${signRows}</tbody></table>
<div class="rec-foot"><span>${esc(tx("Figures from the current portal state.", "Sayılar güncel portal durumundan üretilmiştir."))}</span><span>${esc(tx("Page 1 / 1", "Sayfa 1 / 1"))}</span></div>
</section></main></body></html>`;
    var win = window.open("", "_blank");
    if (!win) { h.toast(t("gono.printBlocked")); return; }
    win.document.open();
    win.document.write(doc);
    win.document.close();
    win.focus();
    setTimeout(function () { try { win.focus(); win.print(); } catch (e) { /* user can print from the window */ } }, 350);
  }

  function archiveGonoRecord(cityId, signer, signedDate, note) {
    var h = H();
    if (!h) return false;
    var city = cities().filter(function (c) { return c.id === cityId; })[0];
    if (!city) return false;
    var store = h.state.data.gono || {};
    var stats = cityStats(city.id);
    var blockingTotal = 0;
    var gates = (SP().gonoGates || []).map(function (g) {
      var pass = 0, open = 0;
      g.items.forEach(function (i) {
        var st = store[city.id + "|" + i.id] || "open";
        if (st === "pass") pass++;
        if (i.blocking) {
          blockingTotal++;
          if (st !== "pass") open++;
        }
      });
      return {
        id: g.id, name: h.L(g.name), pass: pass, total: g.items.length, open: open,
        items: g.items.map(function (i) {
          var lk = itemLinks(i.id);
          return { id: i.id, blocking: !!i.blocking, status: statusOf(store, city.id, i.id), comp: lk.comp, risks: lk.risks };
        })
      };
    });
    var blocking = [];
    (SP().gonoGates || []).forEach(function (g) {
      g.items.forEach(function (i) {
        var st = store[city.id + "|" + i.id] || "open";
        if (i.blocking && st !== "pass") {
          var lk = itemLinks(i.id);
          blocking.push({ id: i.id, owner: i.owner, ref: i.ref, requirement: h.L(i.req), status: st, comp: lk.comp, risks: lk.risks });
        }
      });
    });
    var archive = h.state.data.gonoArchive;
    if (!Array.isArray(archive)) archive = h.state.data.gonoArchive = [];
    archive.unshift({
      id: "gar-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6),
      savedAt: new Date().toISOString(),
      signedDate: signedDate,
      signer: signer,
      note: note,
      recordNo: "SP-GONO-" + city.id + "-" + signedDate,
      cityId: city.id,
      cityName: city.name,
      country: city.country,
      decision: stats.decision,
      readiness: stats.readiness,
      pass: stats.pass,
      items: stats.items,
      blockingOpen: stats.blockingOpen,
      blockingTotal: blockingTotal,
      gates: gates,
      blocking: blocking,
      lang: h.state.lang
    });
    h.save();
    h.toast(h.t("gono.archiveSaved"));
    return true;
  }

  function rerender() {
    var h = H();
    if (!h || h.state.route.split("/")[0] !== "gono") return;
    var host = document.getElementById("view");
    if (host) host.innerHTML = SP().views.gono.render("");
  }

  /* own listeners: keep the decision panel in sync while the user assesses items */
  document.addEventListener("change", function (e) {
    if (e.target && e.target.closest && e.target.closest("[data-gono-city]")) {
      var h = H();
      if (!h) return;
      h.state.ui.gonoCity = e.target.value;
      h.state.ui.gonoGate = "";
      h.state.ui.gonoItem = "";
      rerender();
    }
  });
  document.addEventListener("change", function (e) {
    if (!e.target || !e.target.closest || !e.target.closest('[data-status="gono"]')) return;
    setTimeout(rerender, 0);
  });
  document.addEventListener("click", function (e) {
    if (!e.target || !e.target.closest) return;
    var printBtn = e.target.closest("[data-print-gono]");
    if (printBtn) { printGonoRecord(printBtn.getAttribute("data-print-gono")); return; }
    var archiveSave = e.target.closest("[data-gono-archive-save]");
    if (archiveSave) {
      var h = H();
      if (!h) return;
      var box = archiveSave.closest("details");
      var signerInput = box ? box.querySelector("[data-gono-archive-signer]") : null;
      var dateInput = box ? box.querySelector("[data-gono-archive-date]") : null;
      var noteInput = box ? box.querySelector("[data-gono-archive-note]") : null;
      var signer = signerInput ? String(signerInput.value || "").trim() : "";
      var signedDate = dateInput ? String(dateInput.value || "").trim() : "";
      var note = noteInput ? String(noteInput.value || "").trim() : "";
      if (!signer) {
        h.toast(h.t("gono.archiveSignerRequired"));
        if (signerInput) signerInput.focus();
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(signedDate)) {
        h.toast(h.t("gono.archiveDateRequired"));
        if (dateInput) dateInput.focus();
        return;
      }
      if (archiveGonoRecord(archiveSave.getAttribute("data-gono-archive-save"), signer, signedDate, note)) rerender();
      return;
    }
    var gateChip = e.target.closest("[data-gono-gate]");
    if (gateChip) {
      var h = H();
      if (!h) return;
      var gateId = gateChip.getAttribute("data-gono-gate");
      h.state.ui.gonoCity = gateChip.getAttribute("data-gono-city");
      h.state.ui.gonoGate = gateId;
      h.state.ui.gonoItem = "";
      rerender();
      setTimeout(function () {
        var anchor = document.getElementById("gono-gate-" + String(gateId).replace(/[^A-Za-z0-9_-]/g, ""));
        if (!anchor) return;
        anchor.scrollIntoView({ block: "start", behavior: "smooth" });
        try { anchor.focus({ preventScroll: true }); } catch (err) { /* older browsers */ }
      }, 0);
      return;
    }
    var pick = e.target.closest("[data-gono-pick]");
    if (!pick) return;
    var h = H();
    if (!h) return;
    h.state.ui.gonoCity = pick.getAttribute("data-gono-pick");
    h.state.ui.gonoGate = "";
    h.state.ui.gonoItem = "";
    rerender();
  });

  SP().views = SP().views || {};
  SP().views.gono = {
    render: function () {
      var h = H(), t = h.t, esc = h.esc, L = h.L, state = h.state;
      var hh = h.state.data;
      hh.gono = hh.gono || {};

      var list = cities();
      var sel = state.ui.gonoCity || (list[0] ? list[0].id : "M1");
      var city = list.filter(function (c) { return c.id === sel; })[0] || list[0];
      if (!city) return h.head(t("gono.eyebrow"), t("gono.title"), t("gono.lede")) + h.callout(esc(t("common.none")), "warn", "!");

      var st = cityStats(city.id);
      var gateById = {};
      (SP().gonoGates || []).forEach(function (g) { gateById[g.id] = g; });
      function gateChips(ids, cityId) {
        if (!ids.length) return '<span class="gate-none">—</span>';
        return '<div class="gate-list">' + ids.map(function (id) {
          var g = gateById[id];
          var label = (g ? g.id + " · " + L(g.name) : id) + " — " + t("gono.gateJump");
          return '<button type="button" class="gate-chip" data-gono-gate="' + esc(id) + '" data-gono-city="' + esc(cityId) + '" title="' + esc(label) + '" aria-label="' + esc(label) + '">' + esc(id) + "</button>";
        }).join("") + "</div>";
      }
      var out = h.head(t("gono.eyebrow"), t("gono.title"), t("gono.lede"));
      function linkStatsText() {
        var allC = SP().allCompliance || [];
        var unC = allC.filter(function (r) { return !((SP().gonoByComp || {})[r.id] || []).length; }).length;
        var unR = (SP().risks || []).filter(function (r) { return !((SP().gonoByRisk || {})[r.id] || []).length; }).length;
        return esc(t("link.summary")) + ": " + (allC.length - unC) + "/" + allC.length + " " + esc(t("link.compShort")) + " · " +
          ((SP().risks || []).length - unR) + "/" + (SP().risks || []).length + " " + esc(t("link.riskShort")) +
          (unC || unR ? " · " + esc(t("link.unlinkedComp")) + ": " + unC + " · " + esc(t("link.unlinkedRisk")) + ": " + unR : "");
      }

      /* decision panel */
      out += h.card(h.cardHead(t("gono.decideTitle"), t("gono.decideSub"),
        '<select class="status-select" data-gono-city aria-label="' + esc(t("gono.city")) + '">' +
        list.map(function (c) {
          return '<option value="' + esc(c.id) + '"' + (c.id === city.id ? " selected" : "") + ">" + esc(c.name) + " · " + esc(c.country) + "</option>";
        }).join("") + "</select>") +
        '<div class="grid g-2-1" style="gap:16px;align-items:start">' +
        '<div>' +
        '<div class="row" style="gap:12px;align-items:center;margin-bottom:8px">' + decisionBadge(t, st.decision, true) +
        '<span class="tiny t-muted">' + esc(t("gono.assessed")) + " " + (st.items - st.open) + "/" + st.items + "</span></div>" +
        '<p class="tiny" style="color:var(--text-2);margin-bottom:8px">' + esc(st.decision === "go" ? t("gono.goDef") : st.decision === "conditional" ? t("gono.condDef") : t("gono.nogoDef")) + "</p>" +
        h.meterRow(st.readiness) +
        '<div class="legend" style="margin-top:10px">' +
        '<span class="pill">' + esc(t("gono.readiness")) + " " + h.pct(st.readiness) + "</span>" +
        '<span class="pill ' + (st.blockingOpen ? "pill-danger" : "") + '">' + esc(t("gono.blockingOpen")) + " " + st.blockingOpen + "</span>" +
        '<span class="pill ' + (st.fail ? "pill-danger" : "") + '">' + esc(t("gono.fail")) + " " + st.fail + "</span>" +
        '<span class="pill">' + esc(t("gono.partial")) + " " + st.partial + "</span>" +
        "</div></div>" +
        '<div><label class="tiny t-muted">' + esc(t("gono.note")) +
        '<textarea data-note="gono|' + esc(city.id) + '" rows="4" placeholder="' + esc(t("gono.notePh")) + '" style="width:100%;margin-top:4px">' +
        esc(state.data.notes["gono|" + city.id] || "") + "</textarea></label>" +
        '<p class="tiny t-muted" style="margin-top:6px">' + esc(t("gono.signoff")) + ": " +
        esc(state.settings.ciso || "CISO") + " · " + new Date().toISOString().slice(0, 10) + "</p></div>" +
        "</div>");

      /* rule */
      out += h.card(cardRule(t, h));

      /* overview */
      var rows = list.map(function (c) {
        var s = cityStats(c.id);
        var active = c.id === city.id;
        return "<td>" + (active ? "<strong>" : "") + esc(c.name) + (active ? "</strong>" : "") +
          '<div class="tiny t-muted">' + esc(c.country) + "</div></td>" +
          '<td class="nowrap">' + esc(c.country) + "</td>" +
          '<td><div class="gate-cell"><span class="num">' + s.blockingOpen + "</span>" + gateChips(s.blockingGates, c.id) + "</div></td>" +
          '<td class="num">' + s.fail + "</td>" +
          '<td class="num">' + s.pass + "/" + s.items + "</td>" +
          '<td class="num">' + h.pct(s.readiness) + "</td>" +
          "<td>" + decisionBadge(t, s.decision, false) + "</td>" +
          '<td class="nowrap"><button class="btn btn-sm" data-gono-pick="' + esc(c.id) + '">' + esc(t("gono.pick")) + "</button></td>";
      });
      out += h.card(h.cardHead(t("gono.overview"), t("gono.overviewSub")) +
        h.table([{ label: t("gono.cityCol") }, { label: t("gono.country") }, { label: t("gono.blockingGatesCol") },
          { label: t("gono.fail") }, { label: t("gono.passCol") }, { label: t("gono.readiness") }, { label: t("gono.decision") }, { label: "" }], rows) +
        '<p class="hint" style="margin-top:8px">' + esc(t("gono.overviewNote")) + "</p>" +
        '<p class="hint" style="margin-top:6px">' + linkStatsText() + "</p>");

      /* gates */
      (SP().gonoGates || []).forEach(function (g) {
        var gs = gateStats(city.id, g);
        var gateAnchor = "gono-gate-" + String(g.id).replace(/[^A-Za-z0-9_-]/g, "");
        var gateFocused = state.ui.gonoGate === g.id;
        var body = '<div class="table-wrap"><table><thead><tr>' +
          '<th class="col-id">' + esc(t("common.id")) + "</th>" +
          "<th>" + esc(t("gono.requirement")) + "</th>" +
          "<th>" + esc(t("gono.evidence")) + "</th>" +
          "<th>" + esc(t("gono.owner")) + "</th>" +
          "<th>" + esc(t("common.status")) + "</th>" +
          "<th>" + esc(t("gono.blocking")) + "</th>" +
          "</tr></thead><tbody>" +
          g.items.map(function (i) {
            var cur = statusOf(hh.gono, city.id, i.id);
            var lk = (SP().gonoLinks || {})[i.id] || { comp: [], risks: [] };
            var lkHtml = (lk.comp.length || lk.risks.length)
              ? '<div class="tiny link-row">' +
                (lk.comp.length ? esc(t("link.comp")) + ": " + SP().chipLinks("comp", lk.comp) : "") +
                (lk.comp.length && lk.risks.length ? " · " : "") +
                (lk.risks.length ? esc(t("link.risk")) + ": " + SP().chipLinks("risk", lk.risks) : "") + "</div>"
              : '<div class="tiny t-muted link-row">' + esc(t("link.none")) + "</div>";
            return "<tr" + (state.ui.gonoItem === i.id ? ' class="row-focus"' : "") + ">" +
              '<td class="col-id mono">' + esc(i.id) + "</td>" +
              "<td><strong>" + esc(L(i.req)) + '</strong><div class="tiny t-muted" style="margin-top:3px">' + esc(i.ref) + "</div>" + lkHtml + "</td>" +
              '<td class="tiny">' + esc(L(i.ev)) + "</td>" +
              '<td class="tiny nowrap">' + esc(i.owner) + "</td>" +
              "<td>" + h.statusSelect("gono", city.id + "|" + i.id, cur, ["pass", "partial", "fail", "na", "open"]) + "</td>" +
              "<td>" + (i.blocking ? '<span class="badge badge-gap">' + esc(t("gono.blockingYes")) + "</span>" : '<span class="badge badge-na">—</span>') + "</td>" +
              "</tr>";
          }).join("") +
          "</tbody></table></div>";
        out += '<div id="' + esc(gateAnchor) + '" class="gate-section' + (gateFocused ? " gate-focus" : "") + '" tabindex="-1" style="margin-top:14px">' + h.card(h.cardHead(esc(g.id + " · " + L(g.name)),
          gs.pass + "/" + gs.n + " " + t("gono.gatePass") + (gs.blockingOpen ? " · " + gs.blockingOpen + " " + t("gono.blockingOpenShort") : ""))) + body + "</div>";
      });

      /* sign-off */
      out += h.card(h.cardHead(t("gono.recordTitle"), t("gono.recordSub")) +
        '<div class="split-list">' +
        '<div><div class="k">' + esc(t("gono.cityCol")) + '</div><div class="v">' + esc(city.name) + " · " + esc(city.country) + "</div></div>" +
        '<div><div class="k">' + esc(t("gono.decision")) + "</div><div class=\"v\">" + decisionBadge(t, st.decision, false) + "</div></div>" +
        '<div><div class="k">' + esc(t("gono.readiness")) + '</div><div class="v mono">' + h.pct(st.readiness) + "</div></div>" +
        '<div><div class="k">' + esc(t("gono.blockingOpen")) + '</div><div class="v mono">' + st.blockingOpen + "</div></div>" +
        '<div><div class="k">' + esc(t("gono.signoffName")) + '</div><div class="v">' + esc(state.settings.ciso || "CISO") + " · " + new Date().toISOString().slice(0, 10) + "</div></div>" +
        "</div>" +
        h.callout(esc(t("gono.printHint")), "warn", "!") +
        '<div class="row" style="gap:8px;margin-top:10px"><button type="button" class="btn btn-primary" data-print-gono="' + esc(city.id) + '">' + esc(t("gono.printRecord")) + "</button></div>" +
        '<details class="acc" style="margin-top:10px"><summary>' + esc(t("gono.archiveAction")) + "</summary>" +
        '<div class="acc-body"><p class="tiny t-muted" style="margin-bottom:8px">' + esc(t("gono.archiveHint")) + "</p>" +
        '<div class="grid g2" style="gap:10px">' +
        '<label class="tiny t-muted">' + esc(t("gono.archiveSigner")) + '<input type="text" data-gono-archive-signer value="' + esc(state.settings.ciso || "") + '" style="width:100%;margin-top:4px"></label>' +
        '<label class="tiny t-muted">' + esc(t("gono.archiveDate")) + '<input type="date" data-gono-archive-date value="' + new Date().toISOString().slice(0, 10) + '" style="width:100%;margin-top:4px"></label>' +
        '<label class="tiny t-muted" style="grid-column:1/-1">' + esc(t("gono.archiveNote")) + '<textarea data-gono-archive-note rows="2" style="margin-top:4px">' + esc(state.data.notes["gono|" + city.id] || "") + "</textarea></label>" +
        "</div>" +
        '<div class="row" style="margin-top:9px"><button type="button" class="btn btn-primary" data-gono-archive-save="' + esc(city.id) + '">' + esc(t("gono.archiveSave")) + "</button></div>" +
        "</div></details>");

      var archive = Array.isArray(hh.gonoArchive) ? hh.gonoArchive.slice() : [];
      archive.sort(function (a, b) { return String(b.savedAt || "").localeCompare(String(a.savedAt || "")); });
      var archiveRows = archive.map(function (a) {
        return '<td class="nowrap">' + esc(a.signedDate || "—") + "</td>" +
          "<td><strong>" + esc(a.cityName || a.cityId || "—") + '</strong><div class="tiny t-muted">' + esc((a.cityId || "") + " · " + (a.country || "")) + "</div></td>" +
          "<td>" + decisionBadge(t, a.decision || "nogo", false) + "</td>" +
          '<td class="num">' + h.pct(Number(a.readiness) || 0) + "</td>" +
          '<td class="num">' + (Number(a.blockingOpen) || 0) + "</td>" +
          "<td>" + esc(a.signer || "—") + (a.note ? '<div class="tiny t-muted">' + esc(a.note) + "</div>" : "") + "</td>" +
          '<td class="mono tiny">' + esc(a.recordNo || "—") + "</td>";
      });
      out += '<div style="margin-top:14px">' + h.card(h.cardHead(t("gono.archiveTitle"), t("gono.archiveSub")) +
        (archive.length ? h.table([{ label: t("gono.archiveDate") }, { label: t("gono.cityCol") }, { label: t("gono.decision") },
          { label: t("gono.readiness") }, { label: t("gono.blockingOpen") }, { label: t("gono.archiveSigner") }, { label: t("gono.archiveRecord") }], archiveRows)
          : '<div class="empty">' + esc(t("gono.archiveEmpty")) + "</div>")) + "</div>";

      return out;
    }
  };

  function cardRule(t, h) {
    return h.cardHead(t("gono.ruleTitle"), t("gono.ruleSub")) +
      '<div class="grid g3" style="gap:12px">' +
      '<div><strong style="font-size:12.5px">' + decisionBadge(t, "go", false) + "</strong>" +
      '<p class="tiny" style="color:var(--text-2);margin-top:5px">' + t("gono.goRule") + "</p></div>" +
      '<div><strong style="font-size:12.5px">' + decisionBadge(t, "conditional", false) + "</strong>" +
      '<p class="tiny" style="color:var(--text-2);margin-top:5px">' + t("gono.condRule") + "</p></div>" +
      '<div><strong style="font-size:12.5px">' + decisionBadge(t, "nogo", false) + "</strong>" +
      '<p class="tiny" style="color:var(--text-2);margin-top:5px">' + t("gono.nogoRule") + "</p></div>" +
      "</div>" +
      '<p class="tiny t-muted" style="margin-top:10px">' + t("gono.ruleNote") + "</p>";
  }
})();
