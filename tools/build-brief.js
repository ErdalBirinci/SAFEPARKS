/* Build self-contained, print-ready bilingual briefs (A4).
   Usage: node tools/build-brief.js [--state safeparks-brief-state.json]
   --state applies the portal's "brief state" export (localStorage edits) before any figure is computed.
   Output: SAFE-PARKS-Executive-Brief.html, SAFE-PARKS-Executive-Brief-2p.html and, from the two-page
   brief's decision table, SAFE-PARKS-Decision-Table.html (decision and pilot-city go/no-go tables,
   each with copy for Excel / Word), SAFE-PARKS-Decision-Table-EN.tsv, SAFE-PARKS-Decision-Table-TR.tsv,
   plus directly openable SAFE-PARKS-Decision-Table.docx and SAFE-PARKS-Decision-Table.xlsx
   (no external assets or dependencies).
   All figures are computed from the portal's data files with the same formulas as the dashboard. */
const fs = require("fs");
const path = require("path");
const office = require("./ooxml");
const stateHash = require("./state-hash");

const root = path.resolve(__dirname, "..");
global.window = global;

["data.js", "data-gov.js", "data-comp.js", "data-comp2.js", "data-priv.js",
  "data-arch.js", "data-risk.js", "data-ops.js", "data-gono.js", "data-links.js", "data-decisions.js", "docs.js", "docs2.js"].forEach(function (f) {
  (0, eval)(fs.readFileSync(path.join(root, "assets", "js", f), "utf8"));
});

const S = global.window.SP;

/* ---------- optional overlay: portal state exported from localStorage ---------- */
const argv = process.argv.slice(2);
const stateFlag = argv.indexOf("--state");
let overlay = null, overlayPath = "";
let compChanges = [];
let stateHashValue = "";
if (stateFlag !== -1) {
  const file = argv[stateFlag + 1];
  if (!file) { console.error("--state requires a JSON file path"); process.exit(1); }
  overlayPath = path.resolve(file);
  let raw;
  try { raw = JSON.parse(fs.readFileSync(overlayPath, "utf8")); }
  catch (e) { console.error("cannot read state file: " + overlayPath); process.exit(1); }
  const data = raw && raw.state && raw.state.data ? raw.state.data : (raw || {});
  stateHashValue = stateHash.hashState(raw);
  overlay = {
    exportedAt: raw && raw.exportedAt ? String(raw.exportedAt) : "",
    comp: data.comp || {}, risks: data.risks || {}, deliv: data.deliv || {},
    checks: data.checks || {}, notes: data.notes || {}, gono: data.gono || {},
    decisions: data.decisions || {}, cityRisks: data.cityRisks || {}, cityRiskMeta: data.cityRiskMeta || {}
  };
  const evidenceIds = {};
  Object.keys(overlay.notes).forEach(function (k) {
    const m = /^comp\|([^|]+)\|(?:note|ref|verifiedOn|verifiedBy)$/.exec(k);
    if (m && String(overlay.notes[k] || "").trim()) evidenceIds[m[1]] = true;
  });
  const matched = { comp: 0, risks: 0, deliv: 0, gono: 0, decisions: 0, cityRisks: 0, cityRiskMeta: 0 };
  (S.compliance || []).concat(S.compliance2 || []).forEach(function (r) {
    const to = overlay.comp[r.id];
    if (to) {
      if (to !== r.status || evidenceIds[r.id]) {
        compChanges.push({ id: r.id, fw: r.fw, from: r.status, to: to, evidence: !!evidenceIds[r.id] });
      }
      r.status = to; matched.comp++;
    } else if (evidenceIds[r.id]) {
      compChanges.push({ id: r.id, fw: r.fw, from: r.status, to: r.status, evidence: true });
    }
  });
  (S.risks || []).forEach(function (r) {
    if (overlay.risks[r.id]) { r.status = overlay.risks[r.id]; matched.risks++; }
  });
  (S.deliverables || []).forEach(function (d) {
    if (overlay.deliv[d.id]) { d.status = overlay.deliv[d.id]; matched.deliv++; }
  });
  const gonoIds = {}, cityIds = {}, riskIds = {};
  (S.gonoGates || []).forEach(function (g) { g.items.forEach(function (i) { gonoIds[i.id] = 1; }); });
  (S.partners || []).forEach(function (p) { if (p.id.charAt(0) === "M") cityIds[p.id] = 1; });
  (S.risks || []).forEach(function (r) { riskIds[r.id] = 1; });
  let cityRiskSupplied = 0, cityRiskMatched = 0;
  Object.keys(overlay.cityRisks).forEach(function (cid) {
    const scores = overlay.cityRisks[cid] || {};
    Object.keys(scores).forEach(function (rid) {
      cityRiskSupplied++;
      const ov = scores[rid] || {};
      const l = parseInt(ov.l, 10), i = parseInt(ov.i, 10);
      if (cityIds[cid] && riskIds[rid] && l >= 1 && l <= 5 && i >= 1 && i <= 5) cityRiskMatched++;
    });
  });
  matched.cityRisks = cityRiskMatched;
  let cityMetaSupplied = 0, cityMetaMatched = 0;
  Object.keys(overlay.cityRiskMeta).forEach(function (cid) {
    const m = overlay.cityRiskMeta[cid] || {};
    const owner = String(m.owner || "").trim();
    const note = String(m.note || "").trim();
    const verifiedOn = String(m.verifiedOn || "").trim();
    if (!owner && !note && !verifiedOn) return;
    cityMetaSupplied++;
    if (cityIds[cid] && (!verifiedOn || /^\d{4}-\d{2}-\d{2}$/.test(verifiedOn))) cityMetaMatched++;
  });
  matched.cityRiskMeta = cityMetaMatched;
  Object.keys(overlay.gono).forEach(function (k) {
    const parts = String(k).split("|");
    if (parts.length === 2 && cityIds[parts[0]] && gonoIds[parts[1]]) matched.gono++;
  });
  const decisionIds = {};
  (S.decisions || []).forEach(function (d) { decisionIds[d.id] = 1; });
  Object.keys(overlay.decisions).forEach(function (k) {
    if (decisionIds[k] && ["pending", "approved", "rejected"].indexOf(overlay.decisions[k]) >= 0) matched.decisions++;
  });
  overlay.matched = matched;
  overlay.compChanges = compChanges;
  overlay.supplied = {
    comp: Object.keys(overlay.comp).length,
    risks: Object.keys(overlay.risks).length,
    deliv: Object.keys(overlay.deliv).length,
    gono: Object.keys(overlay.gono).length,
    decisions: Object.keys(overlay.decisions).length,
    cityRisks: cityRiskSupplied,
    cityRiskMeta: cityMetaSupplied
  };
  overlay.unmatched = (overlay.supplied.comp - matched.comp) + (overlay.supplied.risks - matched.risks) +
    (overlay.supplied.deliv - matched.deliv) + (overlay.supplied.gono - matched.gono) +
    (overlay.supplied.decisions - matched.decisions) + (overlay.supplied.cityRisks - matched.cityRisks) +
    (overlay.supplied.cityRiskMeta - matched.cityRiskMeta);
}

const stateExportedAt = overlay ? overlay.exportedAt : "";

/* ---------- formatting helpers (TR / EN in one document) ---------- */
const esc = function (v) {
  return String(v === null || v === undefined ? "" : v).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
};
const bi = function (en, tr) {
  return '<span class="lang-en">' + esc(en) + '</span><span class="lang-tr">' + esc(tr) + "</span>";
};
const T = function (o) { return o && typeof o === "object" ? bi(o.en, o.tr) : esc(o); };
const nf = function (lang) { return new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-GB"); };
const money = function (n) { return bi("€" + nf("en").format(n), "€" + nf("tr").format(n)); };
const pctv = function (v) {
  const f = function (x) { return (Math.round(x * 10) / 10).toFixed(1); };
  return bi(f(v) + "%", f(v).replace(".", ",") + "%");
};
/* plain single-language formatters: use these inside bi() so no markup is escaped into the text */
const pctEn = function (v) { return (Math.round(v * 10) / 10).toFixed(1) + "%"; };
const pctTr = function (v) { return (Math.round(v * 10) / 10).toFixed(1).replace(".", ",") + "%"; };
const moneyEn = function (n) { return "€" + nf("en").format(n); };
const moneyTr = function (n) { return "€" + nf("tr").format(n); };
const generatedAt = new Date().toISOString();
const today = generatedAt.slice(0, 10);

/* ---------- computed posture (identical to the portal) ---------- */
const allComp = (S.compliance || []).concat(S.compliance2 || []);
const fw = {};
let totW = 0, gotW = 0;
const counts = { ready: 0, partial: 0, gap: 0, na: 0 };
allComp.forEach(function (r) {
  const st = r.status;
  if (!fw[r.fw]) fw[r.fw] = { n: 0, ready: 0, partial: 0, gap: 0, tot: 0, got: 0 };
  fw[r.fw].n++;
  if (st === "na") { counts.na++; return; }
  const w = st === "ready" ? 1 : st === "partial" ? 0.5 : 0;
  counts[st] = (counts[st] || 0) + 1;
  fw[r.fw].tot++; fw[r.fw].got += w; fw[r.fw][st]++;
  totW++; gotW += w;
});
Object.keys(fw).forEach(function (k) { fw[k].p = fw[k].tot ? (fw[k].got / fw[k].tot) * 100 : 0; });
const overall = totW ? (gotW / totW) * 100 : 0;

const bandOf = function (s) { return s >= 20 ? "critical" : s >= 12 ? "high" : s >= 6 ? "medium" : "low"; };
const risks = (S.risks || []).slice().sort(function (a, b) { return b.l * b.i - a.l * a.i; });
const rstat = { critical: 0, high: 0, medium: 0, low: 0, open: 0 };
risks.forEach(function (r) {
  rstat[bandOf(r.l * r.i)]++;
  if (r.status !== "closed" && r.status !== "accepted") rstat.open++;
});
const deliv = S.deliverables || [];
const dstat = { planned: 0, "in-progress": 0, done: 0 };
deliv.forEach(function (d) { dstat[d.status] = (dstat[d.status] || 0) + 1; });
const planActions = (S.plan90 || []).reduce(function (a, p) { return a + p.actions.length; }, 0);
const planDoneCount = overlay ? (S.plan90 || []).reduce(function (a, p) {
  return a + p.actions.filter(function (x) { return !!overlay.checks[x.id]; }).length;
}, 0) : 0;
const evidenceCount = overlay ? Object.keys(overlay.notes).filter(function (k) {
  return /^comp\|[^|]+\|note$/.test(k) && String(overlay.notes[k] || "").trim();
}).length : 0;
const stateStamp = overlay ? (overlay.exportedAt ? overlay.exportedAt.slice(0, 10) : "—") : "";
const stateBase = overlay ? path.basename(overlayPath) : "";
const stateSummaryEn = overlay ? (overlay.matched.comp + " compliance statuses, " + overlay.matched.risks + " risks, " +
  overlay.matched.deliv + " deliverables" + (overlay.matched.gono ? ", " + overlay.matched.gono + " go/no-go item statuses" : "") +
  (overlay.matched.decisions ? ", " + overlay.matched.decisions + " decision statuses" : "") +
  (overlay.matched.cityRisks ? ", " + overlay.matched.cityRisks + " site score overrides" : "") +
  (overlay.matched.cityRiskMeta ? ", " + overlay.matched.cityRiskMeta + " site risk records" : "") +
  (evidenceCount ? ", " + evidenceCount + " evidence notes" : "")) : "";
const wp3Total = (S.wp3Budget || []).reduce(function (a, x) { return a + x.amount; }, 0);
const wp3Personnel = (S.wp3Budget || [])[0] ? S.wp3Budget[0].amount : 0;
const wp3PM = (S.wp3Tasks || []).reduce(function (a, x) { return a + x.pm; }, 0);
const partnerTotal = (S.partners || []).reduce(function (a, p) { return a + p.budget; }, 0);
const muni = (S.partners || []).filter(function (p) { return p.id.charAt(0) === "M"; });
const muniTotal = muni.reduce(function (a, p) { return a + p.budget; }, 0);
const dpiaRisks = (S.dpia && (S.dpia.risks || S.dpia.risk)) || [];
const retention = S.retention || [];

const table = function (heads, rows, cls) {
  return '<table class="' + (cls || "") + '"><thead><tr>' +
    heads.map(function (h) { return "<th>" + h + "</th>"; }).join("") +
    "</tr></thead><tbody>" +
    rows.map(function (r) {
      return "<tr>" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>";
    }).join("") +
    "</tbody></table>";
};
const sheet = function (n, en, tr, body) {
  return '<section class="sheet"><h2><span class="num">' + n + "</span>" + bi(en, tr) + "</h2>" + body + "</section>";
};
const kpiCard = function (labelEn, labelTr, value, noteEn, noteTr) {
  return '<div class="kpi"><div class="lab">' + bi(labelEn, labelTr) + '</div><div class="val">' + value +
    '</div><div class="note">' + bi(noteEn, noteTr) + "</div></div>";
};
const statusBadge = function (st) {
  const map = {
    ready: ["b-ready", "Ready", "Hazır"], partial: ["b-partial", "Partial", "Kısmi"],
    gap: ["b-gap", "Gap", "Boşluk"], planned: ["b-planned", "Planned", "Planlı"],
    "in-progress": ["b-prog", "In progress", "Devam ediyor"], done: ["b-ready", "Done", "Tamam"],
    open: ["b-prog", "Open", "Açık"], treating: ["b-partial", "Treating", "İşlemde"],
    accepted: ["b-planned", "Accepted", "Kabul"], closed: ["b-ready", "Closed", "Kapalı"]
  };
  const m = map[st] || ["b-planned", st, st];
  return '<span class="badge ' + m[0] + '">' + bi(m[1], m[2]) + "</span>";
};
const STATUS_WORD = {
  ready: ["ready", "hazır"], partial: ["partial", "kısmi"], gap: ["gap", "boşluk"],
  na: ["not applicable", "kapsam dışı"]
};
const statusWord = function (st) {
  const m = STATUS_WORD[st];
  return m ? bi(m[0], m[1]) : esc(st);
};
const changedControls = overlay ? (overlay.compChanges || []) : [];
const changedBox = overlay && changedControls.length
  ? '<div class="changes">' +
    '<h4>' + bi("Changed controls in the local state", "Yerel durumda değişen kontroller") +
    ' <span class="count">' + changedControls.length + "</span></h4>" +
    '<ul>' + changedControls.map(function (c) {
      return '<li><span class="mono">' + esc(c.id) + '</span> <span class="fw">' + esc(c.fw) + "</span> " +
        (c.to !== c.from ? '<span class="delta">' + statusWord(c.from) + " → " + statusWord(c.to) + "</span> " : "") +
        (c.evidence ? '<span class="ev">' + bi("evidence", "kanıt") + "</span>" : "") + "</li>";
    }).join("") + "</ul>" +
    '<p class="tiny">' + bi("Status changes and local evidence only; the full control text stays in the portal.",
      "Yalnızca durum değişiklikleri ve yerel kanıtlar; tam kontrol metni portalda kalır.") + "</p></div>"
  : "";

/* recorded evidence ledger: only rows with at least one evidence field, using the same keys as the CSV */
const evidenceShort = function (v, max) {
  const s = String(v || "").replace(/\s+/g, " ").trim();
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
};
const evidenceField = function (id, field) {
  return overlay && overlay.notes ? String(overlay.notes["comp|" + id + "|" + field] || "").trim() : "";
};
const evidenceRows = [];
allComp.forEach(function (r) {
  const ref = evidenceField(r.id, "ref");
  const note = evidenceField(r.id, "note");
  const verifiedOn = evidenceField(r.id, "verifiedOn");
  const verifiedBy = evidenceField(r.id, "verifiedBy");
  if (ref || note || verifiedOn || verifiedBy) {
    evidenceRows.push({ r: r, ref: ref, note: note, verifiedOn: verifiedOn, verifiedBy: verifiedBy });
  }
});
const evidenceFwOrder = {};
(S.frameworks || []).forEach(function (f, i) { evidenceFwOrder[f.id] = i; });
evidenceRows.sort(function (a, b) {
  const fa = evidenceFwOrder[a.r.fw] === undefined ? 99 : evidenceFwOrder[a.r.fw];
  const fb = evidenceFwOrder[b.r.fw] === undefined ? 99 : evidenceFwOrder[b.r.fw];
  return fa - fb || a.r.id.localeCompare(b.r.id);
});
const evidenceRefCount = evidenceRows.filter(function (x) { return x.ref; }).length;
const evidenceVerifiedCount = evidenceRows.filter(function (x) { return x.verifiedOn || x.verifiedBy; }).length;
const evidenceFrameworkCount = Object.keys(evidenceRows.reduce(function (a, x) { a[x.r.fw] = true; return a; }, {})).length;
const evidenceEmpty = overlay
  ? bi("No evidence reference, note or verification is recorded in the exported portal state. Record evidence in the portal and rebuild this brief with --state to populate the table.",
    "Dışa aktarılan portal durumunda kayıtlı kanıt referansı, notu veya doğrulaması yok. Portalda kanıt kaydedin ve tabloyu doldurmak için bu özeti --state ile yeniden üretin.")
  : bi("This copy was built without a portal state export, so no recorded evidence is available. Export “brief state (JSON)” from the portal and rebuild with --state to populate the table.",
    "Bu kopya portal durumu dışa aktarılmadan üretildiği için kayıtlı kanıt yok. Tabloyu doldurmak için portaldan “brief state (JSON)” dışa aktarın ve --state ile yeniden üretin.");
const evidenceTable = evidenceRows.length
  ? table([bi("Control", "Kontrol"), bi("Framework", "Çerçeve"), bi("Owner", "Sahip"), bi("Status", "Durum"),
    bi("Evidence reference", "Kanıt referansı"), bi("Evidence summary", "Kanıt özeti"), bi("Verified", "Doğrulama")],
    evidenceRows.map(function (x) {
      const verified = [x.verifiedOn, x.verifiedBy].filter(Boolean).join(" · ");
      return [
        '<span class="mono">' + esc(x.r.id) + "</span>",
        esc(x.r.fw),
        esc(x.r.owner),
        statusBadge(x.r.status),
        x.ref ? '<span class="mono ev-ref">' + esc(evidenceShort(x.ref, 70)) + "</span>" : "—",
        x.note ? '<span class="ev-note">' + esc(evidenceShort(x.note, 180)) + "</span>" : "—",
        verified ? esc(verified) : "—"
      ];
    }), "evidence") +
    '<p class="tiny">' + bi("Only controls with at least one recorded evidence field appear. Status is the effective status in this copy; the city-scoped CSV ledger remains the full export of all controls.",
      "Yalnızca en az bir kanıt alanı kayıtlı kontroller görünür. Durum bu kopyadaki geçerli durumdur; şehir kapsamlı CSV defteri tüm kontrollerin tam dışa aktarımıdır.") + "</p>"
  : '<div class="callout">' + evidenceEmpty + "</div>";
const evidenceSection = sheet(5, "Recorded evidence ledger", "Kayıtlı kanıt defteri",
  '<p class="lede">' + bi("Controls with a reference, note or verification recorded in the exported portal state. This table summarizes what exists; the evidence ledger CSV remains the detailed, city-scoped export.",
    "Dışa aktarılan portal durumunda referansı, notu veya doğrulaması kayıtlı kontroller. Bu tablo mevcut kanıtı özetler; ayrıntılı ve şehir kapsamlı dışa aktarım kanıt defteri CSV'sidir.") + "</p>" +
  '<div class="kpis">' +
  kpiCard("Controls with evidence", "Kanıtlı kontrol", String(evidenceRows.length), "of " + allComp.length + " controls", allComp.length + " kontrol içinde") +
  kpiCard("File references", "Dosya referansı", String(evidenceRefCount), "notes or verification may exist without a reference", "referans olmadan not veya doğrulama olabilir") +
  kpiCard("Verified", "Doğrulanmış", String(evidenceVerifiedCount), evidenceFrameworkCount + " frameworks represented", evidenceFrameworkCount + " çerçeve temsil ediliyor") +
  "</div>" +
  evidenceTable);

/* ---------- document ---------- */
let body = "";

/* 1 — cover */
body += '<section class="cover">' +
  '<div class="kicker">' + bi("Horizon Europe · Cluster 3 — Civil Security for Society", "Horizon Europe · Cluster 3 — Civil Security for Society") + "</div>" +
  "<h1>" + bi("Security and Compliance Executive Brief", "Güvenlik ve Uyum Yönetici Özeti") + "</h1>" +
  '<p class="sub">' + bi("Lotus Sirius CISO function — posture, decisions requested and next milestones", "Lotus Sirius CISO fonksiyonu — durum, istenen kararlar ve sonraki kilometre taşları") + "</p>" +
  '<dl class="cover-grid">' +
  "<div><dt>" + bi("Project", "Proje") + "</dt><dd>" + esc(S.meta.project) + " · WP3 " + esc(S.meta.wp3Lead) + "</dd></div>" +
  "<div><dt>" + bi("Audience", "Hedef kitle") + "</dt><dd>" + bi("CEO and consortium steering committee", "CEO ve konsorsiyum yönetim komitesi") + "</dd></div>" +
  "<div><dt>" + bi("Prepared by", "Hazırlayan") + "</dt><dd>" + bi("CISO function, Lotus Sirius", "CISO fonksiyonu, Lotus Sirius") + "</dd></div>" +
  "<div><dt>" + bi("Date", "Tarih") + "</dt><dd class=\"mono\">" + today + "</dd></div>" +
  "<div><dt>" + bi("Programme", "Program") + "</dt><dd>" + esc(S.meta.programme) + " · " + esc(S.meta.call) + "</dd></div>" +
  "<div><dt>" + bi("Grant Agreement", "Grant Agreement") + "</dt><dd>" + (S.meta.gaNumber ? esc(S.meta.gaNumber) : bi("Not yet recorded — to be confirmed", "Henüz girilmedi — doğrulanacak")) + "</dd></div>" +
  "<div><dt>" + bi("Total budget", "Toplam bütçe") + "</dt><dd>" + money(S.meta.totalBudget) + " · " + bi(S.meta.partnerCount + " partners, " + S.meta.cityCount + " pilot cities", S.meta.partnerCount + " ortak, " + S.meta.cityCount + " pilot şehir") + "</dd></div>" +
  "<div><dt>" + bi("WP3 budget", "WP3 bütçesi") + "</dt><dd>" + money(S.meta.wp3Budget) + " · " + wp3PM + " PM</dd></div>" +
  "<div><dt>" + bi("Classification", "Sınıflandırma") + "</dt><dd>" + esc(S.meta.classification) + "</dd></div>" +
  "<div><dt>" + bi("Model", "Model") + "</dt><dd>" + bi("Zero-biometric, on-demand triage · 60 s / 30 s / 5 s", "Sıfır biyometrik, talep üzerine analiz · 60 sn / 30 sn / 5 sn") + "</dd></div>" +
  "</dl>" +
  '<p class="cover-note">' + bi("Single self-contained file. Use the TR / EN buttons; printing keeps the selected language. Figures are generated from the portal's data files on the date above.",
    "Tek dosya, kendi kendine yeterli. TR / EN düğmelerini kullanın; baskı seçili dili korur. Sayılar yukarıdaki tarihte portalın veri dosyalarından üretilmiştir.") + "</p>" +
  (overlay ? '<p class="cover-note"><strong>' + bi("Local portal edits applied", "Yerel portal düzenlemeleri uygulandı") + "</strong> · " +
    bi(stateSummaryEn + " · exported " + stateStamp + " · " + stateBase,
      overlay.matched.comp + " uyum durumu, " + overlay.matched.risks + " risk, " + overlay.matched.deliv + " çıktı" +
      (overlay.matched.gono ? ", " + overlay.matched.gono + " go/no-go madde durumu" : "") +
      (overlay.matched.decisions ? ", " + overlay.matched.decisions + " karar durumu" : "") +
      (overlay.matched.cityRisks ? ", " + overlay.matched.cityRisks + " saha puanı" : "") +
      (overlay.matched.cityRiskMeta ? ", " + overlay.matched.cityRiskMeta + " saha riski kaydı" : "") +
      (evidenceCount ? ", " + evidenceCount + " kanıt notu" : "") + " · dışa aktarım " + stateStamp + " · " + stateBase) +
    (overlay.unmatched ? " · " + bi(overlay.unmatched + " supplied keys are not used by the brief and were ignored.",
      overlay.unmatched + " anahtar özette kullanılmadığı için yok sayıldı.") : "") + "</p>" : "") +
  "</section>";

/* 2 — executive summary */
body += sheet(1, "Executive summary", "Yönetici özeti",
  '<div class="kpis">' +
  kpiCard("Compliance readiness", "Uyum hazırlığı", pctv(overall), allComp.length + " controls · " + counts.ready + " ready / " + counts.partial + " partial / " + counts.gap + " gap",
    allComp.length + " kontrol · " + counts.ready + " hazır / " + counts.partial + " kısmi / " + counts.gap + " boşluk") +
  kpiCard("Critical / high risks", "Kritik / yüksek risk", String(rstat.critical + rstat.high), rstat.critical + " critical · " + rstat.high + " high · " + rstat.open + " open of " + risks.length,
    rstat.critical + " kritik · " + rstat.high + " yüksek · " + risks.length + " riskten " + rstat.open + " açık") +
  kpiCard("Deliverables", "Çıktılar", dstat.done + "/" + deliv.length, dstat["in-progress"] + " in progress · next D3.1 at M6",
    dstat["in-progress"] + " devam ediyor · sıradaki D3.1, M6") +
  "</div>" +
  "<ul class=\"bullets\">" +
  "<li>" + bi("The platform analyses nothing continuously: frames live in a 60-second ring buffer, a 30-second window is analysed only when a citizen report, acoustic event or sensor triggers it, and the material is destroyed with a verifiable purge within 5 seconds. No biometric identification exists in the pipeline.",
    "Platform hiçbir şeyi sürekli analiz etmez: kareler 60 saniyelik halka tamponda durur, yalnızca vatandaş ihbarı, akustik olay veya sensör tetiklediğinde 30 saniyelik pencere analiz edilir ve veri 5 saniye içinde doğrulanabilir bir imha ile yok edilir. Hatta biyometrik tanımlama yoktur.") + "</li>" +
  "<li>" + bi("Readiness is " + pctEn(overall) + " across " + totW + " applicable controls in seven frameworks; the M12 target is ≥90%. " + counts.gap + " controls are still gaps and must close before the first pilot wave.",
    "Hazırlık, yedi çerçevedeki " + totW + " uygulanabilir kontrolde " + pctTr(overall) + "; M12 hedefi ≥%90. " + counts.gap + " kontrol hâlâ boşlukta ve ilk pilot dalgasından önce kapatılmalıdır.") + "</li>" +
  "<li>" + bi("The register holds " + risks.length + " risks (" + rstat.critical + " critical, " + rstat.high + " high). Highest-scoring: " + esc(risks.slice(0, 3).map(function (r) { return r.id + " " + (r.t ? r.t.en : ""); }).join("; ")) + ".",
    "Kayıtta " + risks.length + " risk var (" + rstat.critical + " kritik, " + rstat.high + " yüksek). En yüksek skorlular: " + esc(risks.slice(0, 3).map(function (r) { return r.id + " " + (r.t ? r.t.tr : ""); }).join("; ")) + ".") + "</li>" +
  "<li>" + bi("WP3 delivers security architecture, secure telemetry, air-gap resilience, the EFDI/NATO connector, the post-quantum roadmap and the assurance pack, with " + wp3PM + " person-months and " + moneyEn(wp3Total) + ". Personnel alone is " + moneyEn(wp3Personnel) + "; equipment, subcontracting, travel and other costs are not allocated per task.",
    "WP3 güvenlik mimarisini, güvenli telemetriyi, izole ağ dayanıklılığını, EFDI/NATO bağlayıcısını, kuantum sonrası yol haritasını ve güvence paketini " + wp3PM + " adam-ay ve " + moneyTr(wp3Total) + " ile teslim eder. Yalnızca personel " + moneyTr(wp3Personnel) + "; ekipman, alt yüklenici, seyahat ve diğer kalemler görev bazında dağıtılmamıştır.") + "</li>" +
  "<li>" + bi("Governance is already defined: the CISO holds an independent release veto, commands Sev-1/2 incidents and owns the evidence base; the CEO remains accountable for budget and residual risk; DPOs of the municipalities remain the lawful decision-makers for processing.",
    "Yönetişim tanımlıdır: CISO bağımsız sürüm vetosuna sahiptir, Sev-1/2 olaylarını yönetir ve kanıt tabanının sahibidir; bütçe ve artık risk için hesap verebilirlik CEO'dadır; işlemenin hukuka uygunluğunda karar verici, belediyelerin DPO'larıdır.") + "</li>" +
  "</ul>" +
  '<div class="callout">' + bi("No personal data is transferred across borders in this architecture. Any request to change that is a programme-level decision, not an engineering choice.",
    "Bu mimaride sınır ötesi kişisel veri aktarımı yoktur. Bunu değiştirme talebi mühendislik tercihi değil, program düzeyinde bir karardır.") + "</div>");

/* 3 — decisions */
body += sheet(2, "Decisions requested", "İstenen kararlar",
  '<p class="lede">' + bi("Six decisions are needed from the CEO and the consortium steering committee. Each is dated to a milestone so that delay is visible.",
    "CEO ve konsorsiyum yönetim komitesinden altı karar gerekiyor. Her biri bir kilometre taşına bağlanmıştır; böylece gecikme görünür olur.") + "</p>" +
  table([bi("Decision", "Karar"), bi("Owner", "Karar veren"), bi("Needed by", "Son tarih"), bi("Consequence of delay", "Gecikmenin sonucu")], [
    ["<strong>" + bi("Sign the CISO charter and notify the consortium", "CISO tüzüğünü imzala ve konsorsiyuma bildir") + "</strong><div class=\"tiny\">" + bi("Independent veto, incident command, unfiltered reporting to coordinator and EPAB.", "Bağımsız veto, olay komutanlığı, koordinatör ve EPAB'a filtresiz raporlama.") + "</div>",
      "CEO", "M1", bi("Security decisions stay advisory; release control is not enforceable.", "Güvenlik kararları tavsiye niteliğinde kalır; sürüm kontrolü uygulanabilir olmaz.")],
    ["<strong>" + bi("Approve the WP3 security budget lines", "WP3 güvenlik bütçe kalemlerini onayla") + "</strong><div class=\"tiny\">" + bi("Personnel " + moneyEn(wp3Personnel) + ", equipment, subcontracting (pentest, certification), travel, other — total " + moneyEn(wp3Total) + ".", "Personel " + moneyTr(wp3Personnel) + ", ekipman, alt yüklenici (sızma testi, belgelendirme), seyahat, diğer — toplam " + moneyTr(wp3Total) + ".") + "</div>",
      "CEO", "M1", bi("Assurance work cannot be contracted; ISO 27001 and pentest milestones slip.", "Güvence işi sözleşmeye bağlanamaz; ISO 27001 ve sızma testi kilometre taşları kayar.")],
    ["<strong>" + bi("Adopt “no cross-border personal data” as a contractual principle", "“Sınır ötesi kişisel veri yok” ilkesini sözleşmesel ilke olarak kabul et") + "</strong><div class=\"tiny\">" + bi("Local processing only; EFDI exports are aggregate and non-personal.", "Yalnızca yerel işleme; EFDI ihraçları toplu ve kişisel veri içermez.") + "</div>",
      "CEO + consortium", "M3", bi("Pilot agreements reopen later; Ukraine/Türkiye transfers become a legal exposure.", "Pilot sözleşmeleri sonradan yeniden açılır; Ukrayna/Türkiye aktarımları hukuki riske dönüşür.")],
    ["<strong>" + bi("Nominate the EPAB and confirm its 20-working-day opinion cycle", "EPAB'ı atа ve 20 iş günü görüş döngüsünü teyit et") + "</strong><div class=\"tiny\">" + bi("Independent ethics and privacy review before each pilot wave.", "Her pilot dalgası öncesi bağımsız etik ve gizlilik incelemesi.") + "</div>",
      "Consortium", "M4", bi("DPIA sign-off has no independent opinion; pilot go-live is blocked.", "DPIA onayında bağımsız görüş olmaz; pilot devreye alma bloke olur.")],
    ["<strong>" + bi("Approve the assurance calendar", "Güvence takvimini onayla") + "</strong><div class=\"tiny\">" + bi("Penetration test before field data exists; ISO 27001 Stage 1 at M10, Stage 2 at M12.", "Sahada veri oluşmadan sızma testi; ISO 27001 Aşama 1 M10, Aşama 2 M12.") + "</div>",
      "CEO", "M6", bi("First pilot is evidenced by tests run on a different build.", "İlk pilot, farklı bir derlemede yapılmış testlerle kanıtlanır.")],
    ["<strong>" + bi("Confirm the residual-risk acceptance route", "Artık risk kabul yolunu teyit et") + "</strong><div class=\"tiny\">" + bi("Any risk above tolerance is signed by the CEO with an expiry date and compensating controls. Nothing is submitted for acceptance today.", "Tolerans üstü her risk, son kullanma tarihi ve telafi edici kontrollerle CEO tarafından imzalanır. Bugün kabul için sunulan bir kalem yoktur.") + "</div>",
      "CEO", "M1", bi("Risks stay open without a decision owner; audit findings accumulate.", "Riskler karar sahibi olmadan açık kalır; denetim bulguları birikir.")]
  ]) +
  '<div class="callout warn">' + bi("The CISO veto is absolute for releases with unresolved critical or high findings. Overturning it requires a written CEO decision notified to the coordinator and EPAB within five working days, recorded in the risk register.",
    "Çözülmemiş kritik veya yüksek bulgu içeren sürümlerde CISO vetosu mutlaktır. Bunun kaldırılması, koordinatör ve EPAB'a beş iş günü içinde bildirilen ve risk kaydına işlenen yazılı bir CEO kararı gerektirir.") + "</div>");

/* 4 — programme and budget */
const partnerRows = (S.partners || []).map(function (p) {
  return [
    '<span class="mono">' + esc(p.id) + "</span>",
    "<strong>" + esc(p.name) + "</strong>",
    esc(p.country),
    T(p.role),
    '<span class="num">' + money(p.budget) + "</span>",
    '<span class="num">' + pctv((p.budget / partnerTotal) * 100) + "</span>"
  ];
});
const wp3Rows = (S.wp3Budget || []).map(function (x) {
  return [T(x.k || x.cat || x.label), '<span class="num">' + money(x.amount) + "</span>", '<span class="num">' + pctv((x.amount / wp3Total) * 100) + "</span>"];
});
body += sheet(3, "Programme, budget and reconciliation", "Program, bütçe ve mutabakat",
  '<p class="lede">' + bi("The consortium is " + S.meta.partnerCount + " partners: one coordinator, three industry and research partners beside Lotus Sirius, and seven pilot municipalities in five countries.",
    "Konsorsiyum " + S.meta.partnerCount + " ortaktan oluşur: bir koordinatör, Lotus Sirius ile birlikte üç sanayi/araştırma ortağı ve beş ülkedeki yedi pilot belediye.") + "</p>" +
  table([bi("ID", "No"), bi("Partner", "Ortak"), bi("Country", "Ülke"), bi("Role", "Görev"), bi("Budget", "Bütçe"), bi("Share", "Pay")], partnerRows) +
  '<div class="grid2">' +
  '<div class="box"><h3>' + bi("Reconciliation", "Mutabakat") + "</h3>" +
  table([bi("Line", "Kalem"), bi("Amount", "Tutar"), bi("Share", "Pay")], [
    [bi("7 municipalities × €440,000", "7 belediye × 440.000 €"), '<span class="num">' + money(muniTotal) + "</span>", '<span class="num">' + pctv((muniTotal / partnerTotal) * 100) + "</span>"],
    [bi("Coordinator (Xena Vision)", "Koordinatör (Xena Vision)"), '<span class="num">' + money(500000) + "</span>", '<span class="num">' + pctv((500000 / partnerTotal) * 100) + "</span>"],
    [bi("4 partners × €285,000", "4 ortak × 285.000 €"), '<span class="num">' + money(4 * 285000) + "</span>", '<span class="num">' + pctv(((4 * 285000) / partnerTotal) * 100) + "</span>"],
    ["<strong>" + bi("Total", "Toplam") + "</strong>", '<span class="num"><strong>' + money(partnerTotal) + "</strong></span>", '<span class="num">100.0%</span>']
  ]) +
  '<p class="tiny">' + bi("Check: " + moneyEn(partnerTotal) + " equals the declared total of " + moneyEn(S.meta.totalBudget) + " and WP3 of " + moneyEn(wp3Total) + " is included, not additional.",
    "Kontrol: " + moneyTr(partnerTotal) + ", beyan edilen " + moneyTr(S.meta.totalBudget) + " toplamına eşittir ve " + moneyTr(wp3Total) + " WP3 bütçesi bu toplamın içindedir, ek değildir.") + "</p></div>" +
  '<div class="box"><h3>' + bi("WP3 cost breakdown", "WP3 maliyet kırılımı") + "</h3>" +
  table([bi("Category", "Kategori"), bi("Amount", "Tutar"), bi("Share", "Pay")], wp3Rows) +
  '<p class="tiny">' + bi("19 person-months at an average of €8,842/PM give €168,000 of personnel. Equipment, subcontracting, travel and other are not allocated per task.",
    "19 adam-ay × ortalama 8.842 €/AD = 168.000 € personel. Ekipman, alt yüklenici, seyahat ve diğer kalemler görev bazında dağıtılmamıştır.") + "</p></div>" +
  "</div>" +
  '<div class="callout">' + bi("Authoritative: total €4,720,000, 12 partners, 7 cities, €285,000 per partner, WP3 lead. Indicative until the signed DoA is supplied: task months, deliverable months, WP1/2/4–7 budgets.",
    "Esas olan: 4.720.000 € toplam, 12 ortak, 7 şehir, ortak başına 285.000 €, WP3 liderliği. İmzalı DoA verilene kadar göstergesel: görev ayları, çıktı ayları, WP1/2/4–7 bütçeleri.") + "</div>");

/* 5 — posture */
const fwLegend = '<div class="fwlegend">' +
  '<span><i class="chip fw-ready"></i>' + bi("ready", "hazır") + " " + counts.ready + "</span>" +
  '<span><i class="chip fw-partial"></i>' + bi("partial", "kısmi") + " " + counts.partial + "</span>" +
  '<span><i class="chip fw-gap"></i>' + bi("gap", "boşluk") + " " + counts.gap + "</span>" +
  '</div>';
const fwBars = '<div class="fwbars">' + Object.keys(fw).map(function (k) {
  const f = fw[k];
  const meta = (S.frameworks || []).filter(function (x) { return x.id === k; })[0];
  const share = function (n) { return f.tot ? ((n / f.tot) * 100).toFixed(2) : "0"; };
  return '<div class="fwbar">' +
    '<div class="fwbar-top"><span class="fwbar-name">' + (meta ? bi(meta.name.en, meta.name.tr) : esc(k)) + '</span>' +
    '<span class="fwbar-pct">' + pctv(f.p) + "</span></div>" +
    '<div class="fwtrack" role="img" aria-label="' + esc((meta ? meta.name.en : k) + ": " + f.ready + " ready, " + f.partial + " partial, " + f.gap + " gap") + '">' +
    '<span class="fwseg fw-ready" style="width:' + share(f.ready) + '%"></span>' +
    '<span class="fwseg fw-partial" style="width:' + share(f.partial) + '%"></span>' +
    '<span class="fwseg fw-gap" style="width:' + share(f.gap) + '%"></span>' +
    "</div></div>";
}).join("") + "</div>";

/* risk heat map: likelihood (rows, 5 top) × impact (columns, 5 right) */
const LIK = { 5: ["Almost certain", "Neredeyse kesin"], 4: ["Likely", "Olası"], 3: ["Possible", "Mümkün"], 2: ["Unlikely", "Olası değil"], 1: ["Rare", "Nadir"] };
const IMP = { 1: ["Minimal", "Çok düşük"], 2: ["Minor", "Düşük"], 3: ["Moderate", "Orta"], 4: ["Major", "Yüksek"], 5: ["Severe", "Çok yüksek"] };
const heat = {};
risks.forEach(function (r) {
  const l = Math.max(1, Math.min(5, Math.round(r.l)));
  const i = Math.max(1, Math.min(5, Math.round(r.i)));
  const key = l + "|" + i;
  (heat[key] = heat[key] || []).push(r);
});
const heatCell = function (l, i) {
  const list = heat[l + "|" + i] || [];
  const band = bandOf(l * i);
  const cls = { critical: "hm-crit", high: "hm-high", medium: "hm-med", low: "hm-low" }[band];
  return '<td class="hm ' + cls + (list.length ? "" : " hm-empty") + '">' +
    '<div class="hm-n">' + (list.length ? list.length : "·") + "</div>" +
    (list.length ? '<div class="hm-ids">' + list.map(function (r) { return esc(r.id); }).join(" ") + "</div>" : "") +
    "</td>";
};
const heatTable = '<div class="box heat-wrap">' +
  '<div class="heat-head"><div>' +
  "<h3>" + bi("Risk heat map — likelihood × impact", "Risk ısı haritası — olasılık × etki") + "</h3>" +
  '<p class="tiny">' + bi(risks.length + " risks placed by likelihood (rows) and impact (columns); the number in a cell is the count and the identifiers follow. Bands: critical 20–25, high 12–19, medium 6–11, low 1–5.",
    risks.length + " risk, olasılık (satır) ve etki (sütun) eksenine yerleştirilmiştir; hücredeki sayı risk adedidir, ardından kimlikler gelir. Bantlar: kritik 20–25, yüksek 12–19, orta 6–11, düşük 1–5.") + "</p></div>" +
  '<ul class="heat-legend">' +
  [["hm-crit", "critical", "kritik"], ["hm-high", "high", "yüksek"], ["hm-med", "medium", "orta"], ["hm-low", "low", "düşük"]].map(function (b) {
    const n = risks.filter(function (r) { return bandOf(r.l * r.i) === b[1]; }).length;
    return '<li><i class="chip ' + b[0] + '"></i>' + bi(b[1], b[2]) + " " + n + "</li>";
  }).join("") + "</ul></div>" +
  '<table class="heat"><caption>' + bi("Risk counts by likelihood and impact", "Olasılık ve etkiye göre risk sayıları") + "</caption>" +
  '<thead><tr><th class="hm-corner">' + bi("Likelihood ↓ / impact →", "Olasılık ↓ / etki →") + "</th>" +
  [1, 2, 3, 4, 5].map(function (i) { return "<th>" + bi(i + " " + IMP[i][0], i + " " + IMP[i][1]) + "</th>"; }).join("") +
  "</tr></thead><tbody>" +
  [5, 4, 3, 2, 1].map(function (l) {
    return '<tr><th class="hm-rowh">' + bi(l + " " + LIK[l][0], l + " " + LIK[l][1]) + "</th>" +
      [1, 2, 3, 4, 5].map(function (i) { return heatCell(l, i); }).join("") + "</tr>";
  }).join("") + "</tbody></table>" +
  '<p class="tiny">' + bi("Hatched cells are critical (score ≥ 20); the hatch survives black-and-white printing. Cell numbers are counts; identifiers are risk register IDs.",
    "Taranmış hücreler kritiktir (skor ≥ 20); tarama deseni siyah-beyaz baskıda da ayrılır. Hücredeki sayılar adet, kimlikler risk kaydı numaralarıdır.") + "</p></div>";

/* pilot go/no-go by city — same rules as the portal's go/no-go view */
const gonoGates = S.gonoGates || [];
const gonoBlocking = gonoGates.reduce(function (a, g) {
  return a + g.items.filter(function (i) { return i.blocking; }).length;
}, 0);
const gonoCities = (S.partners || []).filter(function (p) { return p.id.charAt(0) === "M"; });
const gonoStatus = function (cityId, itemId) {
  const v = overlay && overlay.gono ? overlay.gono[cityId + "|" + itemId] : "";
  return v || "open";
};
const cityDecision = function (cityId) {
  const out = { items: 0, pass: 0, partial: 0, fail: 0, na: 0, open: 0, blockingOpen: 0, blockingGates: [], score: 0, assessable: 0 };
  gonoGates.forEach(function (g) {
    let gateOpen = false;
    g.items.forEach(function (i) {
      const st = gonoStatus(cityId, i.id);
      out.items++;
      if (i.blocking && st !== "pass") gateOpen = true;
      if (st === "na") { out.na++; if (i.blocking) out.blockingOpen++; return; }
      out.assessable++;
      if (st === "pass") { out.pass++; out.score += 1; }
      else if (st === "partial") { out.partial++; out.score += 0.5; if (i.blocking) out.blockingOpen++; }
      else if (st === "fail") { out.fail++; if (i.blocking) out.blockingOpen++; }
      else { out.open++; if (i.blocking) out.blockingOpen++; }
    });
    if (gateOpen) out.blockingGates.push(g.id);
  });
  out.readiness = out.assessable ? (out.score / out.assessable) * 100 : 0;
  out.decision = out.blockingOpen ? "nogo" : (out.fail || out.partial || out.open ? "conditional" : "go");
  return out;
};
const gonoRowsData = gonoCities.map(function (c) { return { city: c, s: cityDecision(c.id) }; });
const gonoTally = { go: 0, conditional: 0, nogo: 0 };
gonoRowsData.forEach(function (x) { gonoTally[x.s.decision]++; });
const gonoAnyEvaluated = gonoRowsData.some(function (x) { return x.s.items - x.s.open > 0; });
const gonoBadge = function (d) {
  const m = { go: ["b-ready", "GO", "GO"], conditional: ["b-partial", "Conditional GO", "KOŞULLU GO"], nogo: ["b-gap", "NO-GO", "NO-GO"] }[d];
  return '<span class="badge ' + m[0] + '" data-decision="' + d + '">' + bi(m[1], m[2]) + "</span>";
};
const gonoGateById = {};
gonoGates.forEach(function (g) { gonoGateById[g.id] = g; });
const gateTitle = function (id) {
  const g = gonoGateById[id];
  return g ? id + " · " + g.name.en + " / " + g.name.tr : id;
};
const gateAnchorId = function (id) {
  return "gono-gate-" + String(id).replace(/[^A-Za-z0-9_-]/g, "");
};
const gateChips = function (ids, base) {
  if (!ids.length) return '<div class="gate-list"><span class="gate-none">—</span></div>';
  const jump = base ? "Open in full brief / Tam özette aç" : "Go to gate items / Kapı maddelerine git";
  return '<div class="gate-list">' + ids.map(function (id) {
    const label = gateTitle(id) + " — " + jump;
    return '<a class="gate-chip" href="' + esc((base || "") + "#" + gateAnchorId(id)) + '" title="' + esc(label) + '" aria-label="' + esc(label) + '">' + esc(id) + "</a>";
  }).join("") + "</div>";
};
const gonoLinkOf = function (itemId) {
  const lk = (S.gonoLinks || {})[itemId] || {};
  return { comp: lk.comp || [], risks: lk.risks || [] };
};
const linkCell = function (ids) {
  return ids.length ? ids.map(function (id) { return '<span class="mono">' + esc(id) + "</span>"; }).join(" ") : "—";
};
const gonoTraceRows = [];
const gonoGateAnchored = {};
gonoGates.forEach(function (g) {
  g.items.forEach(function (i) {
    const lk = gonoLinkOf(i.id);
    const gateCell = gonoGateAnchored[g.id]
      ? '<span class="mono">' + esc(g.id) + "</span>"
      : '<span class="mono gate-anchor" id="' + esc(gateAnchorId(g.id)) + '" tabindex="-1">' + esc(g.id) + "</span>";
    gonoGateAnchored[g.id] = true;
    gonoTraceRows.push([
      gateCell,
      '<span class="mono">' + esc(i.id) + "</span>",
      i.blocking ? bi("Blocking", "Bloklayıcı") : "—",
      linkCell(lk.comp),
      linkCell(lk.risks)
    ]);
  });
});
const gonoTrace = '<h3 class="mt">' + bi("Gate item control and risk references", "Kapı maddesi kontrol ve risk bağlantıları") + "</h3>" +
  '<p class="tiny">' + bi("One row per go/no-go item. Control IDs resolve in the compliance matrix and risk IDs in the risk register; the portal reads the same bidirectional link table. City-table gate chips jump to the first row of that gate.",
    "Her go/no-go maddesi için bir satır. Kontrol kimlikleri uyum matrisinde, risk kimlikleri risk kaydında çözülür; portal aynı çift yönlü bağlantı tablosunu okur. Şehir tablosundaki kapı etiketleri o kapının ilk satırına gider.") + "</p>" +
  table([bi("Gate", "Kapı"), bi("Item", "Madde"), bi("Type", "Tür"), bi("Controls", "Kontroller"), bi("Risks", "Riskler")], gonoTraceRows, "trace");
const gonoTable = '<h3 class="mt">' + bi("Pilot go/no-go by city", "Şehir bazında pilot go/no-go") + "</h3>" +
  '<p class="lede">' + bi(gonoTally.nogo + " of " + gonoCities.length + " cities are NO-GO, " + gonoTally.conditional + " conditional and " + gonoTally.go + " GO. A site may go live only when all " + gonoBlocking + " blocking items pass; a non-blocking gap makes the decision conditional.",
    gonoCities.length + " şehirden " + gonoTally.nogo + " tanesi NO-GO, " + gonoTally.conditional + " koşullu, " + gonoTally.go + " GO. Bir saha ancak " + gonoBlocking + " bloklayıcı maddenin tümü geçtiğinde devreye alınabilir; bloklayıcı olmayan bir boşluk kararı koşullu yapar.") + "</p>" +
  table([bi("City", "Şehir"), bi("Decision", "Karar"), bi("Blocking / open gates", "Bloklayıcı / açık kapılar"), bi("Items passed", "Geçen madde"), bi("Readiness", "Hazırlık")],
    gonoRowsData.map(function (x) {
      const s = x.s;
      return [
        "<strong>" + esc(x.city.name) + '</strong><div class="tiny">' + esc(x.city.id) + " · " + esc(x.city.country) + "</div>",
        gonoBadge(s.decision),
        '<div class="gate-cell"><span class="num">' + s.blockingOpen + " / " + gonoBlocking + "</span>" + gateChips(s.blockingGates) + "</div>",
        '<span class="num">' + s.pass + " / " + s.items + "</span>",
        '<span class="num">' + pctv(s.readiness) + "</span>"
      ];
    })) +
  '<p class="tiny">' + (gonoAnyEvaluated
    ? bi("Decisions are read from the exported portal state (" + stateStamp + "). Columns show blocking items not passed, items passed and readiness over assessable items.",
      "Kararlar dışa aktarılan portal durumundan okunur (" + stateStamp + "). Sütunlar geçmeyen bloklayıcıyı, geçen maddeyi ve değerlendirilebilir maddelerdeki hazırlığı gösterir.")
    : bi("No go/no-go item is evaluated in the delivered data, so every city is NO-GO until the checklist is signed off in the portal; export the portal state to print evaluated decisions.",
      "Teslim edilen veride hiçbir go/no-go maddesi değerlendirilmemiş, bu yüzden kontrol listesi portalda onaylanana kadar her şehir NO-GO; değerlendirilmiş kararları basmak için portal durumunu dışa aktarın.")) + "</p>" +
  '<p class="tiny gate-note">' + bi("Gate chips name gates with at least one blocking item not passed; select one to jump to its go/no-go items.",
    "Kapı etiketleri en az bir bloklayıcı maddesi geçmeyen kapıları gösterir; birine basınca o kapının go/no-go maddelerine gider.") + "</p>";

const fwRows = Object.keys(fw).map(function (k) {
  const f = fw[k];
  const meta = (S.frameworks || []).filter(function (x) { return x.id === k; })[0];
  return [
    "<strong>" + esc(meta ? meta.name.en : k) + "</strong>",
    '<span class="num">' + f.n + "</span>",
    '<span class="num">' + f.ready + "</span>",
    '<span class="num">' + f.partial + "</span>",
    '<span class="num">' + f.gap + "</span>",
    '<span class="num">' + pctv(f.p) + "</span>"
  ];
});
body += sheet(4, "Security posture: compliance, risk and pilot readiness", "Güvenlik durumu: uyum, risk ve pilot hazırlığı",
  '<div class="grid2">' +
  '<div class="box"><h3>' + bi("Readiness by framework", "Çerçeve bazında hazırlık") + "</h3>" +
  table([bi("Framework", "Çerçeve"), bi("n", "n"), bi("Ready", "Hazır"), bi("Part.", "Kısmı"), bi("Gap", "Boşluk"), bi("%", "%")], fwRows) +
  fwLegend + fwBars +
  '<p class="tiny">' + bi("Weighted: ready = 1, partial = 0.5, gap = 0; not-applicable controls are excluded. Overall " + pctEn(overall) + " of " + totW + " applicable controls.",
    "Ağırlıklı: hazır = 1, kısmi = 0,5, boşluk = 0; uygulanamaz kontroller hariç. " + totW + " uygulanabilir kontrolde genel " + pctTr(overall) + ".") + "</p>" +
  (overlay && evidenceCount ? '<p class="tiny">' + bi("Evidence recorded locally for " + evidenceCount + " of " + totW + " applicable controls; the notes and file references stay in the portal state and are counted here, not reproduced.",
    "Yerel olarak " + totW + " uygulanabilir kontrolün " + evidenceCount + " tanesi için kanıt kaydı var; notlar ve dosya referansları portal durumunda kalır, burada sayılır, aynen basılmaz.") + "</p>" : "") + "</div>" +
  '<div class="box"><h3>' + bi("Risk register — top 8 of " + risks.length, "Risk kaydı — " + risks.length + " riskten ilk 8") + "</h3>" +
  table([bi("ID", "No"), bi("Risk", "Risk"), bi("Score", "Skor"), bi("Owner", "Sahip"), bi("Status", "Durum")],
    risks.slice(0, 8).map(function (r) {
      return ["<span class=\"mono\">" + esc(r.id) + "</span>", T(r.t), '<span class="num">' + (r.l * r.i) + "</span>", esc(r.owner), statusBadge(r.status)];
    })) +
  '<p class="tiny">' + bi("Bands: critical 20–25, high 12–19, medium 6–11, low 1–5. " + rstat.open + " risks are open or under treatment.",
    "Bantlar: kritik 20–25, yüksek 12–19, orta 6–11, düşük 1–5. " + rstat.open + " risk açık veya işlem altında.") + "</p></div>" +
  "</div>" +
  heatTable +
  gonoTable +
  gonoTrace +
  "<h3 class=\"mt\">" + bi("Deliverables and milestones", "Çıktılar ve kilometre taşları") + "</h3>" +
  table([bi("ID", "No"), bi("Deliverable", "Çıktı"), bi("Lead", "Sorumlu"), bi("Due", "Ay"), bi("Level", "Düzey"), bi("Status", "Durum")],
    deliv.map(function (d) {
      return ["<span class=\"mono\">" + esc(d.id) + "</span>", T(d.t), esc(d.lead), esc(d.due), esc(d.level), statusBadge(d.status)];
    })) +
  table([bi("Milestone", "Kilometre taşı"), bi("Month", "Ay"), bi("Criterion", "Kriter")],
    (S.milestones || []).map(function (m) {
      return ["<span class=\"mono\">" + esc(m.id) + "</span> · " + T(m.t), esc(m.m), T(m.crit)];
    })));

body += evidenceSection;

/* 6 — WP3 plan */
const taskRows = (S.wp3Tasks || []).map(function (x) {
  return ["<span class=\"mono\">" + esc(x.id) + "</span>", T(x.name), esc(x.months), '<span class="num">' + x.pm + "</span>",
    '<span class="num">' + money(x.amount) + "</span>", '<span class="mono">' + esc(x.out) + "</span>"];
});
body += sheet(6, "WP3 delivery plan", "WP3 teslim planı",
  '<p class="lede">' + bi("Six tasks, " + wp3PM + " person-months and six deliverables. Blueprint: mTLS everywhere, one-way EFDI diode, signed artefacts, offline update chain.",
    "Altı görev, " + wp3PM + " adam-ay ve altı çıktı. Temel: her yerde mTLS, tek yönlü EFDI diyotu, imzalı artefaktlar, çevrimdışı güncelleme zinciri.") + "</p>" +
  table([bi("Task", "Görev"), bi("Title", "Başlık"), bi("Months", "Aylar"), bi("PM", "AD"), bi("Personnel cost", "Personel maliyeti"), bi("Output", "Çıktı")], taskRows) +
  '<p class="tiny">' + bi("Task amounts are personnel only and sum to " + moneyEn(wp3Personnel) + ", which is the personnel line of the WP3 budget; the remaining " + moneyEn(wp3Total - wp3Personnel) + " is held at category level.",
    "Görev tutarları yalnızca personeldir ve WP3 bütçesinin personel satırı olan " + moneyTr(wp3Personnel) + " toplamına eşittir; kalan " + moneyTr(wp3Total - wp3Personnel) + " kategori düzeyinde tutulur.") + "</p>" +
  "<h3 class=\"mt\">" + bi("Interfaces to other work packages", "Diğer iş paketleriyle arayüzler") + "</h3>" +
  table([bi("Work package", "İş paketi"), bi("What WP3 owes or receives", "WP3'ün verdiği veya aldığı")],
    (S.wp3Interfaces || []).map(function (i) { return ["<strong>" + esc(i.with) + "</strong>", T(i.item)]; })) +
  '<div class="callout">' + bi("Air-gap promise: a park node keeps analysing through a 60-minute WAN and grid interruption. This is demonstrated in a live park at M16 and is a site acceptance criterion, not a claim.",
    "İzole ağ taahhüdü: park düğümü 60 dakikalık WAN ve elektrik kesintisi boyunca analize devam eder. Bu, M16'da canlı parkta gösterilir ve saha kabul kriteridir, iddia değildir.") + "</div>");

/* 7 — privacy / incident */
body += sheet(7, "Privacy engineering and incident readiness", "Gizlilik mühendisliği ve olay hazırlığı",
  '<div class="grid2">' +
  '<div class="box"><h3>' + bi("The 60 / 30 / 5 rule", "60 / 30 / 5 kuralı") + "</h3>" +
  table([bi("Stage", "Aşama"), bi("Guarantee", "Garanti")], [
    [bi("Capture", "Kayıt"), bi("Frames overwrite in a 60-second ring buffer; nothing is archived.", "Kareler 60 saniyelik halka tamponda üzerine yazılır; hiçbir şey arşivlenmez.")],
    [bi("Analysis", "Analiz"), bi("A 30-second window is analysed only on a trigger: citizen report, acoustic event, smoke/fire sensor, operator request.", "30 saniyelik pencere yalnızca tetikle analiz edilir: vatandaş ihbarı, akustik olay, duman/yangın sensörü, operatör talebi.")],
    [bi("Destruction", "İmha"), bi("Verified purge within 5 seconds, logged as metadata only; the node stops if the purge test fails.", "5 saniye içinde doğrulanmış imha, yalnızca üstveri olarak kaydedilir; imha testi başarısızsa düğüm durur.")],
    [bi("Transfer", "Aktarım"), bi("No personal data leaves the premises; EFDI exports are aggregate and non-personal.", "Kişisel veri tesisten çıkmaz; EFDI ihraçları toplu ve kişisel veri içermez.")]
  ]) +
  '<p class="tiny">' + bi("20 technical and organisational measures, " + retention.length + " retention rules and " + (dpiaRisks.length || 0) + " DPIA risks are maintained in the portal.",
    "Portalda 20 teknik ve idari tedbir, " + retention.length + " saklama kuralı ve " + (dpiaRisks.length || 0) + " DPIA riski tutulur.") + "</p></div>" +
  '<div class="box"><h3>' + bi("Notification duties", "Bildirim yükümlülükleri") + "</h3>" +
  table([bi("Recipient", "Muhatap"), bi("Deadline", "Süre"), bi("Owner", "Sorumlu")],
    (S.incidents && S.incidents.notification ? S.incidents.notification : []).map(function (n) {
      return [T(n.to), T(n.when), esc(n.owner)];
    })) + "</div>" +
  "</div>" +
  "<h3 class=\"mt\">" + bi("Severity and response", "Şiddet ve müdahale") + "</h3>" +
  table([bi("Level", "Seviye"), bi("Acknowledge", "Kabul"), bi("Contain", "Kontrol"), bi("Notify", "Bildirim")],
    (S.incidents && S.incidents.severity ? S.incidents.severity : []).map(function (s) {
      return ["<strong>" + esc(s.lvl) + "</strong>", esc(s.ack), esc(s.contain), T(s.notify)];
    })) +
  '<p class="tiny">' + bi("Seven playbooks cover unauthorised access, credential compromise, data spill to EFDI, ransomware, model integrity, insider misuse and loss of triage. Sev-1 MTTR target is under 4 hours.",
    "Yedi playbook yetkisiz erişim, kimlik bilgisi ihlali, EFDI'ya veri sızması, fidye yazılımı, model bütünlüğü, içeriden kötüye kullanım ve analiz kaybını kapsar. Sev-1 hedef MTTR 4 saatin altındadır.") + "</p>");

/* 8 — 90 days, KPIs, governance */
const planRows = (S.plan90 || []).map(function (p) {
  return [T(p.phase), T(p.goal), '<span class="num">' + p.actions.length + "</span>"];
});
const kpiRows = (S.kpis || []).map(function (k) {
  return ["<span class=\"mono\">" + esc(k.id) + "</span>", T(k.name), esc(k.target), esc(k.owner)];
});
const roleRows = (S.governance.roles || []).map(function (r) {
  return ["<strong>" + T(r.role) + "</strong>", esc(r.org), T(r.kpi)];
});
const drRows = (S.governance.decisionRights || []).map(function (d) {
  return [T(d.d), "<strong>" + esc(d.who) + "</strong>"];
});
body += sheet(8, "First 90 days, KPIs and governance", "İlk 90 gün, KPI'lar ve yönetişim",
  '<div class="grid2">' +
  '<div class="box"><h3>' + bi("90-day plan — " + planActions + " actions", "90 günlük plan — " + planActions + " eylem") + "</h3>" +
  table([bi("Phase", "Aşama"), bi("Goal", "Hedef"), bi("Actions", "Eylem")], planRows) +
  '<p class="tiny">' + (overlay
    ? bi(planDoneCount + " of " + planActions + " plan actions are marked complete in the exported portal state (" + stateStamp + ").",
      "Dışa aktarılan portal durumunda " + planActions + " eylemden " + planDoneCount + " tanesi tamamlandı olarak işaretli (" + stateStamp + ").")
    : bi("Progress is tracked in the portal; the baseline is 0 of " + planActions + " because no action is marked complete yet.",
      "İlerleme portalda izlenir; hiçbir eylem tamamlandı olarak işaretlenmediği için taban çizgisi " + planActions + " eylemde 0'dır.")) + "</p></div>" +
  '<div class="box"><h3>' + bi("Key performance indicators", "Temel performans göstergeleri") + "</h3>" +
  table([bi("ID", "No"), bi("KPI", "Gösterge"), bi("Target", "Hedef"), bi("Owner", "Sahip")], kpiRows) + "</div>" +
  "</div>" +
  "<h3 class=\"mt\">" + bi("Who decides what", "Kim neye karar verir") + "</h3>" +
  '<div class="grid2">' +
  '<div class="box">' + table([bi("Role", "Rol"), bi("Organisation", "Kurum"), bi("KPI", "Gösterge")], roleRows) + "</div>" +
  '<div class="box">' + table([bi("Decision", "Karar"), bi("Decision owner", "Karar sahibi")], drRows) + "</div>" +
  "</div>" +
  '<div class="callout">' + bi("Reporting cadence: monthly one-page posture to the coordinator, quarterly EPAB and KPI pack, steering pack for decisions and residual-risk acceptance.",
    "Raporlama sıklığı: koordinatöre aylık tek sayfa durum, üç aylık EPAB ve KPI paketi, kararlar ve artık risk kabulü için yönetim paketi.") + "</div>");

/* 9 — open items, annex, provenance */
const assumptionRows = (S.meta.assumptions || []).map(function (a) {
  return ['<span class="badge b-plan">!</span>', T(a)];
});
body += sheet(9, "Open items, annex and provenance", "Açık konular, ekler ve kaynak",
  "<h3>" + bi("Must be confirmed before official use", "Resmî kullanımdan önce doğrulanmalı") + "</h3>" +
  table([bi("", ""), bi("Item", "Kalem")], assumptionRows.concat([
    ['<span class="badge b-plan">!</span>', bi("AI Act high-risk timeline: a pending omnibus proposal may defer Annex III obligations — verify before each conformity milestone.",
      "AI Act yüksek risk takvimi: bekleyen omnibus önerisi Ek III yükümlülüklerini erteleyebilir — her uygunluk kilometre taşından önce teyit et.")],
    ['<span class="badge b-plan">!</span>', bi("STANAG classification scheme: confirm 4774/4778 metadata and the label policy table with the defence counterpart.",
      "STANAG sınıflandırma şeması: 4774/4778 üstverisini ve etiket politikası tablosunu savunma muhatabıyla doğrula.")]
  ])) +
  "<h3 class=\"mt\">" + bi("Policy library (annex)", "Politika kütüphanesi (ek)") + "</h3>" +
  table([bi("Code", "Kod"), bi("Document", "Doküman"), bi("Owner", "Sahip"), bi("Ver.", "Sür.")],
    (S.docs || []).map(function (d) {
      return ["<span class=\"mono\">" + esc(d.code) + "</span>", T(d.title), esc(d.owner), esc(d.version)];
    })) +
  "<h3 class=\"mt\">" + bi("Provenance and limits", "Kaynak ve sınırlar") + "</h3>" +
  '<ul class="bullets tight">' +
  "<li>" + bi("Every figure is computed by " + "tools/build-brief.js" + " from the portal's data files, using the same formulas as the dashboard (" + today + ").",
    "Her sayı, " + "tools/build-brief.js" + " tarafından portalın veri dosyalarından ve panel ile aynı formüllerle üretilmiştir (" + today + ").") + "</li>" +
  (overlay
    ? "<li>" + bi("Statuses in this copy come from the exported portal state " + stateBase + " (" + stateStamp + "): " + stateSummaryEn + ". Evidence notes are counted, not reproduced; TOMs and interface settings are not part of the brief.",
      "Bu kopyadaki durumlar dışa aktarılan portal durumundan gelir: " + stateBase + " (" + stateStamp + ") — " + overlay.matched.comp + " uyum durumu, " + overlay.matched.risks + " risk, " + overlay.matched.deliv + " çıktı" + (overlay.matched.decisions ? ", " + overlay.matched.decisions + " karar durumu" : "") + (evidenceCount ? ", " + evidenceCount + " kanıt notu" : "") + ". Kanıt notları sayılır, aynen basılmaz; TOM'lar ve arayüz ayarları özete dahil değildir.") + "</li>"
    : "<li>" + bi("Statuses shown are the data defaults. Local edits made in a browser (localStorage) are not included; export the portal state to brief the committee on edited values.",
      "Görünen durumlar veri varsayılanlarıdır. Tarayıcıda yapılan yerel düzenlemeler (localStorage) dahil değildir; düzenlenmiş değerleri komiteye sunmak için portal durumunu dışa aktarın.") + "</li>") +
  "<li>" + bi("This is a working management instrument, not a certified system, legal opinion or audit report. The municipalities and their DPOs remain responsible for lawfulness of processing.",
    "Bu bir çalışma aracıdır; sertifikalı sistem, hukuki görüş veya denetim raporu değildir. İşlemenin hukuka uygunluğundan belediyeler ve DPO'ları sorumludur.") + "</li>" +
  "<li>" + bi("Contacts for CSIRT, the KVKK Board and the defence counterpart are not recorded yet and must be supplied by the coordinator and carried offline.",
    "CSIRT, KVKK Kurulu ve savunma muhatabı irtibatları henüz kayıtlı değildir; koordinatör tarafından sağlanmalı ve çevrimdışı taşınmalıdır.") + "</li>" +  "</ul>" +
  changedBox +
  '<p class="sign">' + bi("Prepared by the CISO function, Lotus Sirius — WP3 lead. For decision by the CEO and the consortium steering committee.", "Lotus Sirius WP3 liderliği CISO fonksiyonu tarafından hazırlanmıştır. CEO ve konsorsiyum yönetim komitesi kararı içindir.") + "</p>");

/* ---------- styles ---------- */
const css = `
:root{--ink:#101828;--muted:#5b6472;--line:#d8dde5;--soft:#f6f8fa;--accent:#0f766e;--warn:#b45309;--bad:#b42318}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:#eef1f5;color:var(--ink);font:12.4px/1.5 "Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
main{max-width:920px;margin:0 auto;background:#fff;padding:26px 34px 34px}
html[data-lang="en"] .lang-tr{display:none}
html[data-lang="tr"] .lang-en{display:none}
a{color:inherit}
.toolbar{position:sticky;top:0;z-index:9;max-width:920px;margin:0 auto;background:#fff;border-bottom:1px solid var(--line);padding:8px 34px;display:flex;align-items:center;gap:10px;font-size:11.5px;color:var(--muted)}
.toolbar .grow{flex:1}
.toolbar button{font:inherit;border:1px solid var(--line);background:#fff;color:var(--ink);padding:5px 10px;border-radius:6px;cursor:pointer}
.toolbar button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:#fff}
.toolbar .print{background:var(--ink);color:#fff;border-color:var(--ink)}
.cover{padding:52px 0 30px;border-bottom:3px solid var(--ink);margin-bottom:26px}
.kicker{font-size:10.5px;letter-spacing:.14em;text-transform:none;color:var(--accent);font-weight:700}
.cover h1{font-size:33px;line-height:1.14;margin:12px 0 8px;letter-spacing:-.5px}
.cover .sub{font-size:13.5px;color:var(--muted);margin:0 0 26px;max-width:640px}
.cover-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 26px;margin:0;padding:0}
.cover-grid div{border-top:1px solid var(--line);padding-top:7px}
.cover-grid dt{font-size:9.6px;letter-spacing:.11em;color:var(--muted);font-weight:700}
.cover-grid dd{margin:2px 0 0;font-size:12.2px}
.cover-note{font-size:10.4px;color:var(--muted);margin-top:24px}
.sheet{break-before:page;page-break-before:always}
.sheet h2{display:flex;gap:10px;align-items:baseline;font-size:17.5px;margin:0 0 14px;padding-bottom:8px;border-bottom:2px solid var(--ink)}
.sheet h2 .num{font-size:11px;font-weight:700;color:#fff;background:var(--accent);border-radius:4px;padding:2px 7px;letter-spacing:.02em}
h3{font-size:12.6px;margin:14px 0 6px}
h3.mt{margin-top:20px}
p{margin:0 0 9px}
.lede{color:var(--muted);margin-bottom:14px;max-width:720px}
.bullets{margin:0 0 12px;padding-left:18px}
.bullets li{margin-bottom:7px}
.bullets.tight li{margin-bottom:4px}
.changes{margin:10px 0 12px;border:1px solid var(--line);border-radius:6px;padding:8px 10px;background:var(--soft);break-inside:avoid;page-break-inside:avoid}
.changes h4{margin:0 0 5px;font-size:10.7px}
.changes h4 .count{display:inline-block;min-width:17px;text-align:center;background:var(--ink);color:#fff;border-radius:9px;padding:0 5px;font-size:9.4px;margin-left:4px}
.changes ul{columns:2;column-gap:18px;margin:0;padding-left:15px;font-size:9.9px}
.changes li{margin:0 0 2px;break-inside:avoid;page-break-inside:avoid}
.changes .fw{font-size:9.2px;color:var(--muted)}
.changes .delta{white-space:nowrap}
.changes .ev{display:inline-block;font-size:8.8px;color:var(--accent);border:1px solid currentColor;border-radius:8px;padding:0 4px;margin-left:4px;white-space:nowrap}
.changes p.tiny{margin:5px 0 0}
.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 16px}
.kpi{border:1px solid var(--line);border-top:3px solid var(--accent);border-radius:8px;padding:10px 11px}
.kpi .lab{font-size:9.6px;letter-spacing:.09em;color:var(--muted);font-weight:700}
.kpi .val{font-size:23px;font-weight:700;margin:3px 0 3px;letter-spacing:-.5px}
.kpi .note{font-size:10.2px;color:var(--muted);line-height:1.35}
table{width:100%;border-collapse:collapse;margin:4px 0 10px;font-size:10.9px}
th{text-align:left;font-size:9.4px;letter-spacing:.06em;color:var(--muted);font-weight:700;border-bottom:1.5px solid var(--ink);padding:5px 6px}
td{padding:5px 6px;border-bottom:1px solid var(--line);vertical-align:top}
tbody tr:nth-child(even){background:var(--soft)}
td.num,th.num{text-align:right;white-space:nowrap}
.gate-cell{text-align:right}
.gate-list{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:2px;margin-top:3px}
.gate-chip{display:inline-block;font:700 8.2px/1.35 ui-monospace,"Cascadia Mono",Consolas,monospace;border:1px solid var(--line);border-radius:3px;padding:0 3px;background:#fff;color:var(--ink);white-space:nowrap;text-decoration:none;cursor:pointer}
.gate-chip:hover,.gate-chip:focus-visible{border-color:var(--accent);color:var(--accent);text-decoration:underline}
.gate-chip:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.gate-anchor{display:inline-block;scroll-margin-top:64px;outline:none}
.gate-anchor:target{background:#fff3bf;box-shadow:0 0 0 2px #f0d68a;border-radius:2px}
.gate-none{font-size:8.6px;color:var(--muted)}
.gate-note{margin-top:4px}
.mono{font-family:ui-monospace,"Cascadia Mono",Consolas,monospace;font-size:10.2px}
.tiny{font-size:10.1px;color:var(--muted);margin:2px 0 8px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}
.box{break-inside:avoid-page;page-break-inside:avoid}
.callout{border-left:3px solid var(--accent);background:#f2f8f7;padding:9px 12px;font-size:11.4px;margin:12px 0;border-radius:0 6px 6px 0}
.callout.warn{border-left-color:var(--warn);background:#fdf6ec}
.badge{display:inline-block;font-size:9.4px;font-weight:700;padding:1px 6px;border-radius:9px;border:1px solid var(--line);white-space:nowrap}
.b-ready{background:#e8f5ee;border-color:#b5dfc6;color:#14663a}
.b-partial{background:#fdf6ec;border-color:#f0d6a8;color:#8a5312}
.b-gap{background:#fdeceb;border-color:#f3c2be;color:#8f231a}
.b-planned{background:#f1f3f6;color:#4a5563}
.b-prog{background:#eaf2fd;border-color:#c0d8f5;color:#1c4f8a}
.sign{margin-top:22px;padding-top:12px;border-top:1px solid var(--line);font-size:10.6px;color:var(--muted)}
/* framework readiness bars — segment order and hatching also read in greyscale */
.fwlegend{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:9.6px;color:var(--muted);margin:2px 0 7px}
.fwlegend i.chip,.heat-legend i.chip{display:inline-block;width:11px;height:11px;border:1px solid var(--line);border-radius:3px;vertical-align:-1px;margin-right:5px}
.fwbars{display:grid;gap:5px;margin:0 0 7px}
.fwbar{break-inside:avoid;page-break-inside:avoid}
.fwbar-top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:10.3px;line-height:1.25}
.fwbar-name{font-weight:600}
.fwbar-pct{font-weight:700;white-space:nowrap;font-variant-numeric:tabular-nums}
.fwtrack{display:flex;height:9px;border:1px solid #9aa4b2;border-radius:3px;overflow:hidden;background:#fff;margin-top:2px}
.fwseg{display:block;height:100%}
.fw-ready{background:#0f766e}
.fw-partial{background:#c98a1e}
.fw-gap{background:repeating-linear-gradient(135deg,#c3c9d4 0 3px,#eef0f4 3px 6px)}
/* risk heat map */
.heat-wrap{break-inside:avoid;page-break-inside:avoid;margin:14px 0 4px}
.heat-head{display:flex;flex-wrap:wrap;gap:6px 16px;align-items:flex-start;justify-content:space-between}
.heat-head .tiny{max-width:620px;margin:2px 0 8px}
.heat-legend{display:flex;flex-wrap:wrap;gap:3px 13px;list-style:none;margin:2px 0 8px;padding:0;font-size:9.7px;color:var(--muted)}
table.heat{border-collapse:separate;border-spacing:3px;table-layout:fixed;margin:0 0 4px}
table.heat caption{caption-side:top;text-align:left;font-size:9.4px;color:var(--muted);padding:0 0 5px}
table.heat th{border:0;padding:3px 4px;font-size:9px;vertical-align:bottom}
table.heat th.hm-corner{text-align:left;width:118px;color:var(--muted);vertical-align:bottom}
table.heat th.hm-rowh{text-align:right;width:118px;color:var(--ink);font-weight:600;border-right:1.5px solid var(--ink)}
table.heat thead th{text-align:center;border-bottom:1.5px solid var(--ink)}
table.heat td.hm{border:1px solid var(--line);border-radius:4px;padding:4px 5px;vertical-align:top;height:52px}
table.heat .hm-n{font-size:9.4px;font-weight:700;color:#3c4654;line-height:1.1}
table.heat .hm-ids{font-family:ui-monospace,"Cascadia Mono",Consolas,monospace;font-size:8.7px;line-height:1.35;color:var(--ink);margin-top:2px;word-spacing:1px}
table.heat td.hm-empty .hm-n{color:#b7bec8;font-weight:400}
.hm-low{background:#f7f9fb}
.hm-med{background:#fdf3e2;border-color:#e2c79b!important}
.hm-high{background:#fbe6df;border-color:#dfae9f!important}
.hm-crit{background:repeating-linear-gradient(135deg,#f4cfc6 0 4px,#fbe6df 4px 8px);border-color:#c98878!important}
table.heat td.hm-crit{border-width:1.5px}
table.trace{font-size:9.7px}
table.trace td{padding:3px 5px}
table.trace .mono{font-size:9.1px}
table.evidence{font-size:9.7px}
table.evidence td{padding:3px 5px}
table.evidence .mono{font-size:9.1px}
table.evidence .ev-ref{word-break:break-all}
table.evidence .ev-note{display:block;max-width:270px;word-break:break-word}
@page{size:A4;margin:14mm 13mm 15mm}
@media print{
  body{background:#fff;font-size:9.4pt;line-height:1.42}
  main{max-width:none;padding:0}
  .no-print{display:none!important}
  .cover{padding:0 0 18px;margin-bottom:16px}
  .cover h1{font-size:26pt}
  .sheet{break-before:page;page-break-before:always}
  table{font-size:8.3pt}
  th{font-size:7.2pt}
  tr{break-inside:avoid;page-break-inside:avoid}
  h2,h3{break-after:avoid;page-break-after:avoid}
  .callout{break-inside:avoid;page-break-inside:avoid}
  .heat-head{display:block}
  .heat-legend{margin-top:2px}
  table.heat td.hm{height:auto;min-height:34px;padding:3px 4px}
  table.heat .hm-ids{font-size:6.9pt}
  table.heat th.hm-corner,table.heat th.hm-rowh{width:34mm}
  table.trace{font-size:7.6pt}
  table.trace td{padding:2px 3px}
  table.trace .mono{font-size:7.2pt}
  table.evidence{font-size:7.6pt}
  table.evidence td{padding:2px 3px}
  table.evidence .mono{font-size:7.1pt}
  table.evidence .ev-note{max-width:none}
  .fwlegend{font-size:7.6pt}
  .fwbar-top{font-size:8pt}
  .fwtrack{height:7px}
}
`;

const html = '<!doctype html>\n<html lang="tr" data-lang="tr">\n<head>\n<meta charset="utf-8">\n' +
  '<meta name="safeparks-brief-generated-at" content="' + esc(generatedAt) + '">\n' +
  '<meta name="safeparks-brief-state-exported-at" content="' + esc(stateExportedAt) + '">\n' +
  '<meta name="safeparks-brief-state-hash" content="' + esc(stateHashValue) + '">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
  "<title>" + bi("SAFE-PARKS — Security & Compliance Executive Brief", "SAFE-PARKS — Güvenlik ve Uyum Yönetici Özeti").replace(/<[^>]+>/g, "") + "</title>\n" +
  "<style>" + css + "</style>\n</head>\n<body>\n" +
  '<div class="toolbar no-print">' +
  '<span class="grow">' + bi("Single-file executive brief · prints in the selected language", "Tek dosya yönetici özeti · seçili dilde yazdırır") + "</span>" +
  '<div role="group" aria-label="Language">' +
  '<button type="button" data-lang-btn="tr" aria-pressed="true">TR</button> ' +
  '<button type="button" data-lang-btn="en" aria-pressed="false">EN</button></div>' +
  '<button type="button" class="print" onclick="window.print()">' + bi("Print / PDF", "Yazdır / PDF") + "</button>" +
  "</div>\n<main>\n" + body + "\n</main>\n" +
  "<script>(function(){var btns=document.querySelectorAll('[data-lang-btn]');function set(l){var h=document.documentElement;h.setAttribute('data-lang',l);h.setAttribute('lang',l);for(var i=0;i<btns.length;i++){btns[i].setAttribute('aria-pressed',btns[i].getAttribute('data-lang-btn')===l?'true':'false');}}for(var i=0;i<btns.length;i++){(function(b){b.addEventListener('click',function(){set(b.getAttribute('data-lang-btn'));});})(btns[i]);}})();</script>\n" +
  "</body>\n</html>\n";

/* Title keeps both languages without the span markup */
const titleEn = "SAFE-PARKS — Security & Compliance Executive Brief";
const titleTr = "SAFE-PARKS — Güvenlik ve Uyum Yönetici Özeti";
const finalHtml = html.replace(/<title>[\s\S]*?<\/title>/, "<title>" + esc(titleEn) + " · " + esc(titleTr) + "</title>");

const outPath = path.join(root, "SAFE-PARKS-Executive-Brief.html");
fs.writeFileSync(outPath, finalHtml, "utf8");
console.log("written " + outPath);
console.log("size " + finalHtml.length + " chars");
console.log("posture " + (Math.round(overall * 10) / 10) + "% · risks " + risks.length + " · deliverables " + deliv.length + " · WP3 " + wp3Total + " / " + wp3PM + " PM");

/* ---------- two-page version: cover, status, decisions only ---------- */
const shortCss = css + `
.short{max-width:920px}
.short-cover{padding:6px 0 12px;margin:0 0 16px;border-bottom:2px solid var(--ink)}
.short-cover h1{font-size:26px;line-height:1.16;margin:8px 0 6px}
.short-cover .sub{margin:0 0 14px;font-size:12.4px;max-width:680px;color:var(--muted)}
.short-meta{display:flex;flex-wrap:wrap;gap:4px 18px;font-size:10.5px;color:var(--muted);margin-bottom:14px}
.short-bullets{margin:0;padding-left:17px;font-size:11.5px}
.short-bullets li{margin-bottom:6px}
.short-changed{margin:8px 0 0;font-size:9.4px;color:var(--muted)}
.short-changed .mono{font-size:8.9px}
.city-summary{display:flex;flex-wrap:wrap;align-items:center;gap:4px 14px;margin:12px 0 0;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--soft);break-inside:avoid;page-break-inside:avoid}
.city-summary-title{font-size:10px;font-weight:700;letter-spacing:.04em;color:var(--muted)}
.city-summary-stats{display:flex;flex-wrap:wrap;gap:4px 14px}
.city-stat{display:inline-flex;align-items:baseline;gap:4px}
.city-stat strong{font-size:15px;line-height:1}
.city-stat span{font-size:9.6px;color:var(--muted)}
.city-stat.go strong{color:#14663a}
.city-stat.cond strong{color:#8a5312}
.city-stat.no strong{color:#8f231a}
.city-risk{font-size:9.8px;margin:2px 0 5px}
.city-risk th{font-size:8.5px;padding:3px 4px}
.city-risk td{padding:1.5px 4px}
.city-risk td:nth-child(2){white-space:nowrap}
.city-risk .tiny{font-size:8.2px;margin:0}
.city-risk .city-record{font-size:8px;line-height:1.2;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}
.city-risk .city-record.empty{color:#8a94a3}
@media print{.short-changed{font-size:8.2pt;margin-top:6px}.city-summary{margin-top:8px;padding:5px 8px;gap:3px 12px}.city-summary-title{font-size:7.8pt}.city-summary-stats{gap:3px 12px}.city-stat strong{font-size:13px}.city-stat span{font-size:7.5pt}.city-risk{font-size:7.2pt}.city-risk th{font-size:6.5pt;padding:1.5px 3px}.city-risk td{padding:1px 3px}.city-risk .tiny{font-size:6.4pt}.city-risk .city-record{font-size:6.3pt}}
.fwblock{margin-top:10px;break-inside:avoid;page-break-inside:avoid}
.fwblock-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:3px 12px;margin:0 0 5px}
.fwblock-head strong{font-size:10.6px;letter-spacing:.01em}
.fwblock-legend{display:flex;flex-wrap:wrap;align-items:center;gap:2px 9px;font-size:9.2px;color:var(--muted)}
.fwblock-legend span{display:inline-flex;align-items:center;gap:3px;white-space:nowrap}
.fwblock-legend i.chip{display:inline-block;width:8px;height:8px;border:1px solid var(--line);border-radius:2px}
.fwblock-legend i.fw-ready{background:#0f766e}
.fwblock-legend i.fw-partial{background:#c98a1e}
.fwblock-legend i.fw-gap{background:repeating-linear-gradient(135deg,#c3c9d4 0 2px,#eef0f4 2px 4px)}
.fwblock-target{font-weight:700;color:var(--ink)}
.fwbars.compact{grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 18px;margin:0}
.fwbars.compact .fwbar-top{font-size:9.4px;line-height:1.2}
.fwbars.compact .fwtrack{height:6px;margin-top:1px}
.fwbars.compact .fwbar-name{font-weight:700}
@media print{.short-cover{padding:0 0 10px;margin-bottom:12px}.short-cover h1{font-size:19pt}.short-cover .sub{font-size:9.6pt;margin-bottom:10px}.short-bullets{font-size:9.1pt}.short-bullets li{margin-bottom:4px}.short-meta{font-size:8.4pt}.fwblock{margin-top:8px}.fwblock-head strong{font-size:7.9pt}.fwblock-legend{font-size:7.3pt}.fwbars.compact{gap:3px 14px}.fwbars.compact .fwbar-top{font-size:7.5pt}.fwbars.compact .fwtrack{height:5px}}
`;

const topTwo = risks.slice(0, 2).map(function (r) { return r.id + " " + (r.t ? r.t.en : ""); }).join("; ");
const topTwoTr = risks.slice(0, 2).map(function (r) { return r.id + " " + (r.t ? r.t.tr : ""); }).join("; ");
/* compact framework readiness bars for the two-page brief: short labels, two columns, 6 px tracks */
const shortFwBars = '<div class="fwbars compact">' + Object.keys(fw).map(function (k) {
  const f = fw[k];
  const meta = (S.frameworks || []).filter(function (x) { return x.id === k; })[0];
  const share = function (n) { return f.tot ? ((n / f.tot) * 100).toFixed(2) : "0"; };
  return '<div class="fwbar" title="' + esc(meta ? meta.name.en : k) + '">' +
    '<div class="fwbar-top"><span class="fwbar-name">' + esc(k) + '</span>' +
    '<span class="fwbar-pct">' + pctv(f.p) + '</span></div>' +
    '<div class="fwtrack" role="img" aria-label="' + esc((meta ? meta.name.en : k) + ": " + f.ready + " ready, " + f.partial + " partial, " + f.gap + " gap") + '">' +
    '<span class="fwseg fw-ready" style="width:' + share(f.ready) + '%"></span>' +
    '<span class="fwseg fw-partial" style="width:' + share(f.partial) + '%"></span>' +
    '<span class="fwseg fw-gap" style="width:' + share(f.gap) + '%"></span>' +
    '</div></div>';
}).join("") + "</div>";
const shortFwBlock = '<div class="fwblock">' +
  '<div class="fwblock-head"><strong>' + bi("Framework readiness", "Çerçeve hazırlığı") + '</strong>' +
  '<span class="fwblock-legend">' +
  '<span><i class="chip fw-ready"></i>' + bi("ready", "hazır") + " " + counts.ready + "</span>" +
  '<span><i class="chip fw-partial"></i>' + bi("partial", "kısmi") + " " + counts.partial + "</span>" +
  '<span><i class="chip fw-gap"></i>' + bi("gap", "boşluk") + " " + counts.gap + "</span>" +
  '<span class="fwblock-target">' + bi("M12 target ≥90%", "M12 hedefi ≥%90") + "</span></span></div>" +
  shortFwBars + "</div>";

/* top three risks for the two-page brief: score, owner, mitigation status */
const topRisks = risks.slice(0, 3);
const shortRiskBlock = '<h3 style="margin-top:16px">' + bi("Highest risks — top 3 by score", "En yüksek riskler — skora göre ilk 3") + "</h3>" +
  table([bi("Risk", "Risk"), bi("Score", "Skor"), bi("Owner", "Sahip"), bi("Mitigation status", "Azaltma durumu")],
    topRisks.map(function (r) {
      return [
        '<span class="mono">' + esc(r.id) + "</span> " + T(r.t),
        '<span class="num">' + (r.l * r.i) + "</span>",
        esc(r.owner),
        statusBadge(r.status)
      ];
    })) +
  '<p class="tiny">' + bi("Score = likelihood × impact (1–5 each); equal scores keep register order. Status: open, treating, accepted or closed — the treatment measure and due date are in the risk register.",
    "Skor = olasılık × etki (her biri 1–5); eşit skorda kayıt sırası geçerlidir. Durum: açık, işlemde, kabul veya kapalı — tedbir ve termin risk kaydındadır.") + "</p>";

/* City-based risk view for the short brief. Site overrides come from the exported brief state; */
/* a city without an entry keeps the project baseline, exactly as in the portal risk view. */
const cityRiskOverride = function (cityId, r) {
  if (!overlay || !overlay.cityRisks) return null;
  const cityMap = overlay.cityRisks[cityId];
  const ov = cityMap && cityMap[r.id];
  if (!ov) return null;
  const l = parseInt(ov.l, 10), i = parseInt(ov.i, 10);
  if (l < 1 || l > 5 || i < 1 || i > 5) return null;
  return { l: l, i: i };
};
const cityRiskRows = (S.pilotCities || []).map(function (city) {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  let adjusted = 0;
  const scored = risks.map(function (r) {
    const ov = cityRiskOverride(city.id, r);
    const l = ov ? ov.l : r.l;
    const i = ov ? ov.i : r.i;
    const score = l * i;
    if (ov) adjusted++;
    counts[bandOf(score)]++;
    return { r: r, l: l, i: i, score: score };
  }).sort(function (a, b) { return b.score - a.score || a.r.id.localeCompare(b.r.id); });
  const rawMeta = (overlay && overlay.cityRiskMeta && overlay.cityRiskMeta[city.id]) || {};
  const verifiedOn = String(rawMeta.verifiedOn || "").trim();
  const dateOk = !verifiedOn || /^\d{4}-\d{2}-\d{2}$/.test(verifiedOn);
  const meta = dateOk ? {
    owner: String(rawMeta.owner || "").trim(),
    note: String(rawMeta.note || "").trim(),
    verifiedOn: verifiedOn
  } : { owner: "", note: "", verifiedOn: "" };
  return { city: city, counts: counts, adjusted: adjusted, top: scored[0], meta: meta };
});
const cityRiskOverrideCount = cityRiskRows.reduce(function (n, x) { return n + x.adjusted; }, 0);
const cityRiskMetaCount = cityRiskRows.filter(function (x) { return x.meta.owner || x.meta.note || x.meta.verifiedOn; }).length;
const cityRiskTableRows = cityRiskRows.map(function (x) {
  const hasMeta = x.meta.owner || x.meta.note || x.meta.verifiedOn;
  const recordTitle = hasMeta
    ? [x.meta.owner || "—", x.meta.verifiedOn || "—", x.meta.note || ""].join(" · ")
    : "";
  const recordHtml = hasMeta
    ? esc(x.meta.owner || "—") + " · " + esc(x.meta.verifiedOn || "—") + " · " +
      (x.meta.note ? esc(x.meta.note) : bi("no note", "not yok"))
    : bi("No site record", "Saha kaydı yok");
  return [
    '<strong>' + esc(x.city.id) + '</strong><div class="tiny">' + esc(x.city.country) + "</div>",
    x.adjusted ? '<span class="num">' + x.adjusted + "</span> " + bi("site scores", "saha puanı") : bi("baseline", "taban"),
    '<span class="num">' + x.counts.critical + "</span>",
    '<span class="num">' + x.counts.high + "</span>",
    '<span class="num">' + x.counts.medium + "</span>",
    '<span class="mono">' + esc(x.top.r.id) + '</span> <span class="num">' + x.top.score + "</span> " + T(x.top.r.t) +
      '<div class="city-record' + (hasMeta ? "" : " empty") + '" title="' + esc(recordTitle) + '">' + recordHtml + "</div>"
  ];
});
const shortCityRiskBlock = '<h3 style="margin-top:14px">' + bi("Pilot city risk view", "Pilot şehir risk görünümü") + "</h3>" +
  '<p class="tiny">' + bi("Likelihood × impact after each city's site scores; critical, high and medium counts follow the same bands as the risk register. A city without overrides shows the project baseline. The site record reads owner · last verified · note; blank fields show —.",
    "Her şehrin saha puanları sonrası olasılık × etki; kritik, yüksek ve orta sayıları risk kaydıyla aynı bantları kullanır. Saha puanı olmayan şehir proje tabanını gösterir. Saha kaydı sahip · son doğrulama · not sırasındadır; boş alanlar — görünür.") + "</p>" +
  table([bi("City", "Şehir"), bi("Site scores", "Saha puanları"), bi("Critical", "Kritik"), bi("High", "Yüksek"), bi("Medium", "Orta"), bi("Top risk / site record", "En yüksek risk / saha kaydı")],
    cityRiskTableRows, "city-risk") +
  '<p class="tiny">' + (cityRiskOverrideCount
    ? bi(cityRiskOverrideCount + " site score overrides are applied from the portal state across " + cityRiskRows.filter(function (x) { return x.adjusted; }).length + " cities.",
      "Portal durumundan " + cityRiskRows.filter(function (x) { return x.adjusted; }).length + " şehirde " + cityRiskOverrideCount + " saha puanı uygulanıyor.")
    : bi("No site score is set; every city uses the project baseline.",
      "Saha puanı girilmemiş; her şehir proje tabanını kullanıyor.")) +
  (cityRiskMetaCount ? " " + bi(cityRiskMetaCount + " cities have a site risk record.", cityRiskMetaCount + " şehirde saha riski kaydı var.") : "") + "</p>";
const shortChanged = changedControls.length
  ? '<p class="short-changed">' + bi("Changed controls", "Değişen kontroller") + ": " +
    '<span class="mono">' + changedControls.slice(0, 8).map(function (c) { return esc(c.id); }).join(", ") + "</span>" +
    (changedControls.length > 8 ? " +" + (changedControls.length - 8) : "") + "</p>"
  : "";

const shortBullets = [
  bi("Model: frames live in a 60-second ring buffer, a 30-second window is analysed only on a trigger and destroyed with a verified purge within 5 seconds. No biometrics, no continuous analytics, no personal data crossing borders.",
    "Model: kareler 60 saniyelik halka tamponda durur, yalnızca tetikle 30 saniyelik pencere analiz edilir ve 5 saniye içinde doğrulanmış imha ile yok edilir. Biyometri yok, sürekli analiz yok, sınır ötesi kişisel veri yok."),
  bi("Readiness is " + pctEn(overall) + " of " + totW + " applicable controls: " + counts.ready + " ready, " + counts.partial + " partial, " + counts.gap + " gaps. The M12 target is at least 90%.",
    "Hazırlık, " + totW + " uygulanabilir kontrolde " + pctTr(overall) + ": " + counts.ready + " hazır, " + counts.partial + " kısmi, " + counts.gap + " boşluk. M12 hedefi en az %90."),
  bi("Risk register: " + risks.length + " risks — " + rstat.critical + " critical, " + rstat.high + " high, " + rstat.open + " open. Highest-scoring: " + topTwo + ".",
    "Risk kaydı: " + risks.length + " risk — " + rstat.critical + " kritik, " + rstat.high + " yüksek, " + rstat.open + " açık. En yüksek skorlular: " + topTwoTr + "."),
  bi("Delivery: " + deliv.length + " deliverables, " + dstat.done + " done, " + dstat["in-progress"] + " in progress. Next is D3.1 at M6 (security architecture and threat model), then ISO 27001 Stage 1 at M10 and Stage 2 at M12.",
    "Teslim: " + deliv.length + " çıktı, " + dstat.done + " tamam, " + dstat["in-progress"] + " devam ediyor. Sıradaki D3.1, M6 (güvenlik mimarisi ve tehdit modeli); ardından ISO 27001 Aşama 1 M10, Aşama 2 M12."),
  bi("WP3: " + moneyEn(wp3Total) + ", " + wp3PM + " person-months, 6 tasks. The air-gap promise — a 60-minute WAN and grid interruption with triage continuing — is demonstrated in a live park at M16.",
    "WP3: " + moneyTr(wp3Total) + ", " + wp3PM + " adam-ay, 6 görev. İzole ağ taahhüdü — 60 dakikalık WAN ve elektrik kesintisinde analizin sürmesi — M16'da canlı parkta gösterilir.")
];

const decisions = S.decisions || [];
const decisionStatus = function (id) {
  const st = overlay && overlay.decisions ? overlay.decisions[id] : "";
  return ["pending", "approved", "rejected"].indexOf(st) >= 0 ? st : "pending";
};
const decisionBadge = function (st) {
  const m = {
    pending: ["b-planned", "Pending", "Bekliyor"],
    approved: ["b-ready", "Approved", "Onaylandı"],
    rejected: ["b-gap", "Rejected", "Reddedildi"]
  }[st] || ["b-planned", "Pending", "Bekliyor"];
  return '<span class="badge ' + m[0] + '" data-decision-status="' + st + '">' + bi(m[1], m[2]) + "</span>";
};
const decisionTally = { pending: 0, approved: 0, rejected: 0 };
decisions.forEach(function (d) { decisionTally[decisionStatus(d.id)]++; });
const shortDecisions = decisions.map(function (d) {
  return [
    bi(d.t.en, d.t.tr) + '<div class="tiny">' + bi(d.detail.en, d.detail.tr) + "</div>",
    T(d.owner),
    esc(d.due),
    decisionBadge(decisionStatus(d.id))
  ];
});
const decisionSummary = bi(
  decisionTally.approved + " of " + decisions.length + " approved, " + decisionTally.rejected + " rejected, " + decisionTally.pending + " pending.",
  decisions.length + " karardan " + decisionTally.approved + " onaylandı, " + decisionTally.rejected + " reddedildi, " + decisionTally.pending + " bekliyor."
);
const shortCityBlock = '<div class="city-summary">' +
  '<span class="city-summary-title">' + bi("Pilot city decisions", "Pilot şehir kararları") + "</span>" +
  '<span class="city-summary-stats">' +
  '<span class="city-stat"><strong>' + gonoCities.length + "</strong><span>" + bi("cities", "şehir") + "</span></span>" +
  '<span class="city-stat go"><strong>' + gonoTally.go + "</strong><span>GO</span></span>" +
  '<span class="city-stat cond"><strong>' + gonoTally.conditional + "</strong><span>" + bi("conditional", "koşullu") + "</span></span>" +
  '<span class="city-stat no"><strong>' + gonoTally.nogo + "</strong><span>NO-GO</span></span>" +
  "</span></div>";

const shortToolbar = '<div class="toolbar no-print"><span class="grow">' +
  bi("Two pages · prints in the selected language", "İki sayfa · seçili dilde yazdırır") + '</span>' +
  '<div role="group" aria-label="Language">' +
  '<button type="button" data-lang-btn="tr" aria-pressed="true">TR</button> ' +
  '<button type="button" data-lang-btn="en" aria-pressed="false">EN</button></div>' +
  '<button type="button" class="print" onclick="window.print()">' + bi("Print / PDF", "Yazdır / PDF") + "</button></div>";

const shortBody1 = '<section class="short-cover">' +
  '<div class="kicker">' + bi("Horizon Europe · Cluster 3 — Civil Security for Society", "Horizon Europe · Cluster 3 — Civil Security for Society") + "</div>" +
  "<h1>" + bi("Executive brief — status and decisions", "Yönetici özeti — durum ve kararlar") + "</h1>" +
  '<p class="sub">' + bi("Where the programme stands today and what the CEO and consortium must decide now. WP3 security workstream, Lotus Sirius.", "Programın bugünkü durumu ve CEO ile konsorsiyumun şimdi vermesi gereken kararlar. WP3 güvenlik iş akışı, Lotus Sirius.") + "</p>" +
  '<div class="short-meta">' +
  "<span>" + bi("Date", "Tarih") + ": " + today + "</span>" +
  "<span>" + bi("Prepared by", "Hazırlayan") + ": " + bi("CISO function, Lotus Sirius", "CISO fonksiyonu, Lotus Sirius") + "</span>" +
  "<span>" + bi("Audience", "Hedef kitle") + ": " + bi("CEO and consortium steering committee", "CEO ve konsorsiyum yönetim komitesi") + "</span>" +
  "<span>" + bi("Classification", "Sınıflandırma") + ": " + esc(S.meta.classification) + "</span>" +
  "<span>" + bi("Grant Agreement", "Grant Agreement") + ": " + (S.meta.gaNumber ? esc(S.meta.gaNumber) : bi("not recorded", "henüz girilmedi")) + "</span>" +
  "</div>" +
  '<div class="kpis">' +
  kpiCard("Compliance readiness", "Uyum hazırlığı", pctv(overall), totW + " applicable controls · " + counts.gap + " gaps", totW + " uygulanabilir kontrol · " + counts.gap + " boşluk") +
  kpiCard("Critical / high risks", "Kritik / yüksek risk", String(rstat.critical + rstat.high), rstat.open + " of " + risks.length + " open", risks.length + " riskten " + rstat.open + " açık") +
  kpiCard("Deliverables", "Çıktılar", dstat.done + "/" + deliv.length, dstat["in-progress"] + " in progress", dstat["in-progress"] + " devam ediyor") +
  "</div>" +
  "<h3>" + bi("Status", "Durum") + "</h3>" +
  '<ul class="short-bullets">' + shortBullets.map(function (b) { return "<li>" + b + "</li>"; }).join("") + "</ul>" +
  shortFwBlock +
  shortRiskBlock +
  shortChanged +
  "</section>";

const shortBody2 = '<section class="sheet">' +
  '<h2><span class="num">2</span>' + bi("Decisions requested", "İstenen kararlar") + "</h2>" +
  '<p class="lede">' + decisionSummary +
  (overlay ? " " + bi("Status read from the portal state exported " + stateStamp + ".", "Durumlar " + stateStamp + " tarihli portal durumundan okunur.") : "") + "</p>" +
  table([bi("Decision", "Karar"), bi("Owner", "Karar veren"), bi("By", "Son tarih"), bi("Status", "Durum")], shortDecisions) +
  '<div class="callout warn">' + bi("The CISO veto is absolute for releases with unresolved critical or high findings. Overturning it requires a written CEO decision notified to the coordinator and EPAB within five working days, recorded in the risk register.",
    "Çözülmemiş kritik veya yüksek bulgu içeren sürümlerde CISO vetosu mutlaktır. Bunun kaldırılması, koordinatör ve EPAB'a beş iş günü içinde bildirilen ve risk kaydına işlenen yazılı bir CEO kararı gerektirir.") + "</div>" +
  shortCityRiskBlock +
  shortCityBlock +
  '<p class="tiny">' + bi("Full rationale, budget reconciliation, risk register, WP3 plan and annexes: SAFE-PARKS-Executive-Brief.html (9 pages).", "Tam gerekçe, bütçe mutabakatı, risk kaydı, WP3 planı ve ekler: SAFE-PARKS-Executive-Brief.html (9 sayfa).") +
  (overlay ? " " + bi("Figures include the portal state exported " + stateStamp + " from " + stateBase + ".", "Sayılar " + stateStamp + " tarihinde " + stateBase + " dosyasından alınan portal durumunu içerir.") : "") + "</p>" +
  '<p class="sign">' + bi("Prepared by the CISO function, Lotus Sirius — WP3 lead. For decision by the CEO and the consortium steering committee.", "Lotus Sirius WP3 liderliği CISO fonksiyonu tarafından hazırlanmıştır. CEO ve konsorsiyum yönetim komitesi kararı içindir.") + "</p>" +
  "</section>";

const shortScript = "<script>(function(){var btns=document.querySelectorAll('[data-lang-btn]');function set(l){var h=document.documentElement;h.setAttribute('data-lang',l);h.setAttribute('lang',l);for(var i=0;i<btns.length;i++){btns[i].setAttribute('aria-pressed',btns[i].getAttribute('data-lang-btn')===l?'true':'false');}}for(var i=0;i<btns.length;i++){(function(b){b.addEventListener('click',function(){set(b.getAttribute('data-lang-btn'));});})(btns[i]);}})();<\/script>";

const shortHtml = '<!doctype html>\n<html lang="tr" data-lang="tr">\n<head>\n<meta charset="utf-8">\n' +
  '<meta name="safeparks-brief-generated-at" content="' + esc(generatedAt) + '">\n' +
  '<meta name="safeparks-brief-state-exported-at" content="' + esc(stateExportedAt) + '">\n' +
  '<meta name="safeparks-brief-state-hash" content="' + esc(stateHashValue) + '">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
  "<title>" + esc("SAFE-PARKS — Executive Brief, 2 pages · Yönetici Özeti, 2 sayfa") + "</title>\n" +
  "<style>" + shortCss + "</style>\n</head>\n<body>\n" + shortToolbar + '\n<main class="short">\n' + shortBody1 + shortBody2 + "\n</main>\n" + shortScript + "\n</body>\n</html>\n";

const shortPath = path.join(root, "SAFE-PARKS-Executive-Brief-2p.html");
fs.writeFileSync(shortPath, shortHtml, "utf8");
console.log("written " + shortPath + " (" + shortHtml.length + " chars)");

/* ---------- decision table exports: paste into Excel (TSV) and Word (HTML table) ----------
   Same source as the two-page brief's section 2. The detail line is lifted out of the decision cell so
   every decision stays exactly one spreadsheet row; both languages come from the same markup. */
const plainCell = function (html, lang) {
  let s = String(html);
  s = s.replace(/<span class="lang-(en|tr)">([\s\S]*?)<\/span>/g, function (m, l, body) {
    return l === lang ? body : "";
  });
  s = s.replace(/<div class="tiny">([\s\S]*?)<\/div>/g, function (m, body) { return "\u0001" + body + "\u0002"; });
  s = s.replace(/<br\s*\/?>/gi, "\u0003").replace(/<\/(p|div|li|tr)>/gi, "\u0003");
  s = s.replace(/<[^>]+>/g, "");
  s = s.replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  return s.split(/[\u0001-\u0003]/).map(function (p) { return p.replace(/\s+/g, " ").trim(); }).filter(Boolean);
};
const dtData = function (row, lang) {
  const parts = plainCell(row[0], lang);
  return {
    decision: parts[0] || "",
    detail: parts.slice(1).join(" "),
    owner: plainCell(row[1], lang).join(" "),
    by: plainCell(row[2], lang).join(" "),
    status: plainCell(row[3] || "", lang).join(" ")
  };
};
const dtRows = {
  en: shortDecisions.map(function (r) { return dtData(r, "en"); }),
  tr: shortDecisions.map(function (r) { return dtData(r, "tr"); })
};
const dtHead = {
  en: ["Decision", "Detail", "Owner", "Needed by", "Status"],
  tr: ["Karar", "Ayrıntı", "Karar veren", "Son tarih", "Durum"]
};
const dtTsv = function (lang) {
  const lines = [dtHead[lang].join("\t")];
  dtRows[lang].forEach(function (r) {
    lines.push([r.decision, r.detail, r.owner, r.by, r.status].map(function (v) {
      return String(v).replace(/\s+/g, " ").replace(/\t/g, " ").trim();
    }).join("\t"));
  });
  return "\ufeff" + lines.join("\r\n") + "\r\n";
};
const dtTsvEn = dtTsv("en"), dtTsvTr = dtTsv("tr");
fs.writeFileSync(path.join(root, "SAFE-PARKS-Decision-Table-EN.tsv"), dtTsvEn, "utf8");
fs.writeFileSync(path.join(root, "SAFE-PARKS-Decision-Table-TR.tsv"), dtTsvTr, "utf8");

/* Directly openable bilingual Office files. Word gets one section per language; Excel gets one sheet per language. */
const dtOfficeRows = function (lang) {
  return dtRows[lang].map(function (r) { return [r.decision, r.detail, r.owner, r.by, r.status]; });
};
const officeSource = overlay
  ? "Status read from the portal state exported " + stateStamp + " (" + stateBase + "). / Durumlar " + stateStamp + " tarihli portal durumundan okunur."
  : "Status from the delivered data defaults; all decisions are pending. / Durumlar teslim edilen veri varsayılanlarından; tüm kararlar bekliyor.";
const officeDocxPath = path.join(root, "SAFE-PARKS-Decision-Table.docx");
const officeXlsxPath = path.join(root, "SAFE-PARKS-Decision-Table.xlsx");
office.writeDocx(officeDocxPath, {
  title: "SAFE-PARKS — Karar tablosu / Decision table",
  subtitle: "WP3 security workstream · CISO function, Lotus Sirius · " + today,
  source: officeSource,
  sections: [
    { heading: "Türkçe", columns: dtHead.tr, rows: dtOfficeRows("tr") },
    { heading: "English", columns: dtHead.en, rows: dtOfficeRows("en") }
  ]
});
office.writeXlsx(officeXlsxPath, {
  title: "SAFE-PARKS — Karar tablosu / Decision table",
  sheets: [
    { name: "Karar Tablosu", columns: dtHead.tr, rows: dtOfficeRows("tr"), widths: [44, 80, 22, 10, 13] },
    { name: "Decision Table", columns: dtHead.en, rows: dtOfficeRows("en"), widths: [44, 80, 22, 10, 13] }
  ]
});
console.log("written " + officeDocxPath + " and " + officeXlsxPath);

const dtCss = `
:root{--ink:#12202b;--muted:#5d6b7a;--line:#d7dee6;--soft:#f6f8fa;--accent:#0f766e;--warn:#8a5312}
*{box-sizing:border-box}
body{margin:0;background:#eef1f5;color:var(--ink);font:14px/1.5 -apple-system,"Segoe UI",Roboto,Arial,sans-serif}
main{max-width:1240px;margin:26px auto;background:#fff;border:1px solid var(--line);border-radius:10px;padding:24px 28px 28px}
.kicker{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);font-weight:700}
h1{font-size:23px;line-height:1.2;margin:8px 0 6px;letter-spacing:-.2px}
.sub{margin:0 0 16px;color:var(--muted);font-size:12.8px;max-width:760px}
.bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 8px}
.bar .langs{margin-left:auto;display:flex;gap:4px}
button{font:inherit;font-size:12.5px;padding:7px 12px;border-radius:7px;border:1px solid var(--line);background:var(--soft);color:var(--ink);cursor:pointer}
button:hover{border-color:var(--accent);color:var(--accent)}
button.primary{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:600}
button.primary:hover{background:#0b5f59;color:#fff}
button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:#fff}
.status{min-height:18px;margin:0 0 10px;font-size:12px;color:var(--accent);font-weight:600}
.status.err{color:var(--warn)}
table{border-collapse:collapse;width:100%;font-size:12.6px}
th{text-align:left;font-size:10.5px;letter-spacing:.05em;color:var(--muted);border-bottom:2px solid var(--ink);padding:7px 8px;background:#fff}
td{padding:8px 8px;border-bottom:1px solid var(--line);vertical-align:top}
tbody tr:nth-child(even){background:var(--soft)}
td:first-child{font-weight:600;min-width:210px}
td:nth-child(3),td:nth-child(4){white-space:nowrap}
.hint{margin:12px 0 0;font-size:11.3px;color:var(--muted);line-height:1.55}
.tables{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:24px;align-items:start;margin-top:18px}
.table-block{min-width:0}
.table-block + .table-block{border-left:1px solid var(--line);padding-left:24px}
.block-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:4px}
.block-head h2{font-size:16px;line-height:1.25;margin:0;letter-spacing:-.1px}
.mini-bar{display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-end}
.mini-bar button{font-size:11.5px;padding:5px 9px}
.block-sub{margin:0 0 8px;font-size:12px;color:var(--muted);line-height:1.45}
.gn td:first-child{min-width:0}
.gn td:nth-child(2){white-space:nowrap}
.gate-cell{text-align:right}
.gate-list{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:2px;margin-top:3px}
.gate-chip{display:inline-block;font:700 9px/1.3 ui-monospace,"Cascadia Mono",Consolas,monospace;border:1px solid var(--line);border-radius:3px;padding:0 3px;background:#fff;color:var(--ink);white-space:nowrap;text-decoration:none;cursor:pointer}
.gate-chip:hover,.gate-chip:focus-visible{border-color:var(--accent);color:var(--accent);text-decoration:underline}
.gate-chip:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.gate-none{color:var(--muted)}
.badge{display:inline-block;font-size:10px;font-weight:700;padding:2px 6px;border-radius:9px;border:1px solid;white-space:nowrap}
.b-ready{border-color:#b5dfc6;background:#e8f5ee;color:#14663a}
.b-partial{border-color:#e5c28d;background:#fdf6ec;color:#8a5312}
.b-gap{border-color:#f3c2be;background:#fdeceb;color:#8f231a}
html[data-lang="en"] .lang-tr{display:none}
html[data-lang="tr"] .lang-en{display:none}
@media(max-width:1099px){main{max-width:1000px}.tables{display:block}.table-block + .table-block{border-left:0;border-top:1px solid var(--line);margin-top:20px;padding:16px 0 0}}
@media print{body{background:#fff}main{border:0;margin:0;max-width:none;padding:0}.bar,.mini-bar{display:none}.tables{display:block}.table-block + .table-block{border-left:0;border-top:1px solid var(--line);margin-top:18px;padding:14px 0 0}.table-block{break-inside:avoid}}
`;

const dtTableRows = dtRows.en.map(function (r, i) {
  const tr = dtRows.tr[i];
  return [bi(r.decision, tr.decision), bi(r.detail, tr.detail), bi(r.owner, tr.owner), bi(r.by, tr.by), bi(r.status, tr.status)];
});
const dtHeads = dtHead.en.map(function (h, i) { return bi(h, dtHead.tr[i]); });
const dtTable = table(dtHeads, dtTableRows).replace(/^<table/, '<table id="dt"');
const gnTableRows = gonoRowsData.map(function (x) {
  const s = x.s;
  return [
    "<strong>" + esc(x.city.name) + '</strong><div class="tiny">' + esc(x.city.id) + " · " + esc(x.city.country) + "</div>",
    gonoBadge(s.decision),
    '<div class="gate-cell"><span class="num">' + s.blockingOpen + " / " + gonoBlocking + "</span>" + gateChips(s.blockingGates, "SAFE-PARKS-Executive-Brief.html") + "</div>",
    '<span class="num">' + s.pass + " / " + s.items + "</span>",
    '<span class="num">' + pctv(s.readiness) + "</span>"
  ];
});
const gnTable = table([bi("City", "Şehir"), bi("Decision", "Karar"), bi("Open blocking / total", "Açık bloklayıcı / toplam"), bi("Items passed", "Geçen madde"), bi("Readiness", "Hazırlık")], gnTableRows, "gn").replace(/^<table/, '<table id="gn"');
const gnSummary = bi(
  gonoTally.nogo + " of " + gonoCities.length + " cities are NO-GO, " + gonoTally.conditional + " conditional and " + gonoTally.go + " GO.",
  gonoCities.length + " şehirden " + gonoTally.nogo + " tanesi NO-GO, " + gonoTally.conditional + " koşullu, " + gonoTally.go + " GO."
);
const gnSource = gonoAnyEvaluated
  ? bi("Verdicts read from the portal state exported " + stateStamp + ".", "Kararlar " + stateStamp + " tarihli portal durumundan okunur.")
  : bi("No go/no-go item is evaluated in the delivered data, so every city reads NO-GO until the checklist is signed off in the portal.",
    "Teslim edilen veride hiçbir go/no-go maddesi değerlendirilmemiş, bu yüzden kontrol listesi portalda onaylanana kadar her şehir NO-GO.");

const dtBody = '<div class="kicker">' + bi("SAFE-PARKS · WP3 security workstream", "SAFE-PARKS · WP3 güvenlik iş akışı") + "</div>" +
  "<h1>" + bi("Decision and go/no-go tables — paste into Excel or Word", "Karar ve go/no-go tabloları — Excel veya Word'e yapıştır") + "</h1>" +
  '<p class="sub">' + bi("Six decisions and the pilot-city go/no-go verdicts on one page. Excel receives tab-separated text so cells split automatically; Word receives formatted tables with a header row.",
    "Altı karar ve pilot şehir go/no-go sonuçları tek sayfada. Excel'e sekme ayrımlı metin gider ve hücreler otomatik ayrılır; Word'e başlık satırı biçimlendirilmiş tablolar gider.") + "</p>" +
  '<div class="bar"><div class="langs" role="group" aria-label="Language">' +
  '<button type="button" data-lang-btn="tr" aria-pressed="true">TR</button> ' +
  '<button type="button" data-lang-btn="en" aria-pressed="false">EN</button></div></div>' +
  '<div class="tables">' +
  '<section class="table-block"><div class="block-head"><h2>' + bi("Decision table", "Karar tablosu") + '</h2><div class="mini-bar">' +
  '<button type="button" id="dtExcel" class="primary">' + bi("Copy for Excel (TSV)", "Excel için kopyala (TSV)") + "</button>" +
  '<button type="button" id="dtWord">' + bi("Copy for Word (table)", "Word için kopyala (tablo)") + "</button></div></div>" +
  '<p class="block-sub">' + decisionSummary + "</p>" +
  '<p id="dtStatus" class="status" role="status" aria-live="polite"></p>' +
  dtTable +
  '<p class="hint">' + bi("Excel: paste into A1 — one decision per row, five columns. Word: paste with Ctrl+V and keep the table. Standalone files: SAFE-PARKS-Decision-Table-EN.tsv and -TR.tsv (UTF-8 with BOM). Regenerate with node tools/build-brief.js.",
    "Excel: A1 hücresine yapıştırın — karar başına bir satır, beş sütun. Word: Ctrl+V ile yapıştırın ve tabloyu koruyun. Ayrı dosyalar: SAFE-PARKS-Decision-Table-EN.tsv ve -TR.tsv (BOM'lu UTF-8). node tools/build-brief.js ile yeniden üretilir.") +
  ' <a href="SAFE-PARKS-Decision-Table-TR.tsv" download>TR TSV</a> · <a href="SAFE-PARKS-Decision-Table-EN.tsv" download>EN TSV</a>' +
  ' · <a href="SAFE-PARKS-Decision-Table.docx" download>Word (.docx)</a> · <a href="SAFE-PARKS-Decision-Table.xlsx" download>Excel (.xlsx)</a>' + "</p></section>" +
  '<section class="table-block"><div class="block-head"><h2>' + bi("Pilot city go/no-go", "Pilot şehir go/no-go") + '</h2><div class="mini-bar">' +
  '<button type="button" id="gnExcel" class="primary">' + bi("Copy for Excel (TSV)", "Excel için kopyala (TSV)") + "</button>" +
  '<button type="button" id="gnWord">' + bi("Copy for Word (table)", "Word için kopyala (tablo)") + "</button></div></div>" +
  '<p class="block-sub">' + gnSummary + "</p>" +
  '<p id="gnStatus" class="status" role="status" aria-live="polite"></p>' +
  gnTable +
  '<p class="hint">' + gnSource + " " + bi("Gate chips name gates with at least one blocking item not passed; select one to open the full brief at that gate's go/no-go items. Any open blocking item makes that city NO-GO.",
    "Kapı etiketleri en az bir bloklayıcı maddesi geçmeyen kapıları gösterir; birine basınca tam özet o kapının go/no-go maddelerinde açılır. Açık bloklayıcı madde bulunan şehir NO-GO'dur.") + "</p></section></div>";

const dtScript = String.raw`<script>(function(){
  var table=document.getElementById('dt');
  var statusEl=document.getElementById('dtStatus');
  function lang(){return document.documentElement.getAttribute('data-lang')==='en'?'en':'tr';}
  function esc(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
  function grid(){return [].map.call(table.rows,function(tr){return [].map.call(tr.cells,function(c){return c.innerText.replace(/\s+/g,' ').trim();});});}
  function tsv(){return grid().map(function(r){return r.join('\t');}).join('\r\n');}
  function html(){var g=grid();var h='<table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;font-family:Calibri,Arial,sans-serif;font-size:11pt"><thead><tr>';g[0].forEach(function(c){h+='<th style="background:#eef2f6;text-align:left">'+esc(c)+'</th>';});h+='</tr></thead><tbody>';for(var i=1;i<g.length;i++){h+='<tr>';g[i].forEach(function(c){h+='<td>'+esc(c)+'</td>';});h+='</tr>';}return h+'</tbody></table>';}
  window.dtTsv=tsv;window.dtHtml=html;
  function status(msg,err){statusEl.textContent=msg;statusEl.className='status'+(err?' err':'');}
  function selectTable(){var sel=window.getSelection();sel.removeAllRanges();var r=document.createRange();r.selectNode(table);sel.addRange(r);status(lang()==='en'?'Clipboard blocked. The table is selected; press Ctrl+C.':'Pano izni yok. Tablo seçildi; Ctrl+C ile kopyalayın.',true);}
  function copyText(t,msg){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){status(msg);},selectTable);}else{var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');status(msg);}catch(e){selectTable();}ta.remove();}}
  function copyWord(){var h=html(),t=tsv();if(navigator.clipboard&&window.ClipboardItem){var item=new ClipboardItem({'text/html':new Blob([h],{type:'text/html'}),'text/plain':new Blob([t],{type:'text/plain'})});navigator.clipboard.write([item]).then(function(){status(lang()==='en'?'Table copied. Paste into Word with Ctrl+V.':'Tablo kopyalandı. Word içine Ctrl+V ile yapıştırın.');},selectTable);}else{selectTable();}}
  document.getElementById('dtExcel').addEventListener('click',function(){copyText(tsv(),lang()==='en'?'TSV copied. Paste into Excel: one decision per row.':'TSV kopyalandı. Excel içine yapıştırın: karar başına bir satır.');});
  document.getElementById('dtWord').addEventListener('click',copyWord);
  var table2=document.getElementById('gn');
  var statusEl2=document.getElementById('gnStatus');
  function grid2(){return [].map.call(table2.rows,function(tr){return [].map.call(tr.cells,function(c){return c.innerText.replace(/\s+/g,' ').trim();});});}
  function tsv2(){return grid2().map(function(r){return r.join('\t');}).join('\r\n');}
  function html2(){var g=grid2();var h='<table border="1" cellspacing="0" cellpadding="4" style="border-collapse:collapse;font-family:Calibri,Arial,sans-serif;font-size:11pt"><thead><tr>';g[0].forEach(function(c){h+='<th style="background:#eef2f6;text-align:left">'+esc(c)+'</th>';});h+='</tr></thead><tbody>';for(var i=1;i<g.length;i++){h+='<tr>';g[i].forEach(function(c){h+='<td>'+esc(c)+'</td>';});h+='</tr>';}return h+'</tbody></table>';}
  window.gnTsv=tsv2;window.gnHtml=html2;
  function status2(msg,err){statusEl2.textContent=msg;statusEl2.className='status'+(err?' err':'');}
  function selectTable2(){var sel=window.getSelection();sel.removeAllRanges();var r=document.createRange();r.selectNode(table2);sel.addRange(r);status2(lang()==='en'?'Clipboard blocked. The table is selected; press Ctrl+C.':'Pano izni yok. Tablo seçildi; Ctrl+C ile kopyalayın.',true);}
  function copyText2(t,msg){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){status2(msg);},selectTable2);}else{var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');status2(msg);}catch(e){selectTable2();}ta.remove();}}
  function copyWord2(){var h=html2(),t=tsv2();if(navigator.clipboard&&window.ClipboardItem){var item=new ClipboardItem({'text/html':new Blob([h],{type:'text/html'}),'text/plain':new Blob([t],{type:'text/plain'})});navigator.clipboard.write([item]).then(function(){status2(lang()==='en'?'City go/no-go table copied. Paste into Word with Ctrl+V.':'Şehir go/no-go tablosu kopyalandı. Word içine Ctrl+V ile yapıştırın.');},selectTable2);}else{selectTable2();}}
  document.getElementById('gnExcel').addEventListener('click',function(){copyText2(tsv2(),lang()==='en'?'TSV copied. Paste into Excel: one city per row.':'TSV kopyalandı. Excel içine yapıştırın: şehir başına bir satır.');});
  document.getElementById('gnWord').addEventListener('click',copyWord2);
  var btns=document.querySelectorAll('[data-lang-btn]');
  function setLang(l){var h=document.documentElement;h.setAttribute('data-lang',l);h.setAttribute('lang',l);for(var i=0;i<btns.length;i++){btns[i].setAttribute('aria-pressed',btns[i].getAttribute('data-lang-btn')===l?'true':'false');}}
  for(var i=0;i<btns.length;i++){(function(b){b.addEventListener('click',function(){setLang(b.getAttribute('data-lang-btn'));});})(btns[i]);}
})();</script>`;

const dtPage = '<!doctype html>\n<html lang="tr" data-lang="tr">\n<head>\n<meta charset="utf-8">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
  "<title>" + esc("SAFE-PARKS — Decision and go/no-go tables · Karar ve go/no-go tabloları") + "</title>\n" +
  "<style>" + dtCss + "</style>\n</head>\n<body>\n<main>\n" + dtBody + "\n</main>\n" + dtScript + "\n</body>\n</html>\n";
const dtPath = path.join(root, "SAFE-PARKS-Decision-Table.html");
fs.writeFileSync(dtPath, dtPage, "utf8");
console.log("written " + dtPath + " (" + dtPage.length + " chars)");
console.log("decision rows " + dtRows.en.length + " · city go/no-go rows " + gonoRowsData.length + " · detail column " + dtRows.en.filter(function (r) { return r.detail; }).length + "/" + dtRows.en.length +
  " · EN → SAFE-PARKS-Decision-Table-EN.tsv · TR → SAFE-PARKS-Decision-Table-TR.tsv");
if (overlay) {
  console.log("state " + stateBase + " (" + stateStamp + ") · applied comp " + overlay.matched.comp + "/" + overlay.supplied.comp +
    " · risks " + overlay.matched.risks + "/" + overlay.supplied.risks + " · deliv " + overlay.matched.deliv + "/" + overlay.supplied.deliv +
    " · gono " + overlay.matched.gono + "/" + overlay.supplied.gono +
    " · decisions " + overlay.matched.decisions + "/" + overlay.supplied.decisions +
    " · ignored " + overlay.unmatched + " · evidence " + evidenceCount + " · plan done " + planDoneCount);
}
