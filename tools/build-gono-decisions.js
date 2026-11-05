/* Build printable pilot go/no-go decision records (A4).
   Usage: node tools/build-gono-decisions.js [--state safeparks-brief-state.json] [--city M1] [--out file.html]
   Default: one consolidated page with every pilot city plus the portal sign-off area.
   --city M1: one detailed page for that city (gate results, blocking items and signatures).
   The same rules as the portal: any blocking item not passed means NO-GO, all blocking items passed
   with non-blocking gaps means CONDITIONAL GO, everything passed means GO. Without --state the
   delivered defaults are used, so every city is NO-GO. */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
global.window = global;

["data.js", "data-gono.js", "data-links.js"].forEach(function (f) {
  (0, eval)(fs.readFileSync(path.join(root, "assets", "js", f), "utf8"));
});

const S = global.window.SP;
const argv = process.argv.slice(2);
const argOf = function (name) {
  const i = argv.indexOf(name);
  return i === -1 ? "" : (argv[i + 1] || "");
};

/* ---------- formatting ---------- */
const esc = function (v) {
  return String(v === null || v === undefined ? "" : v).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
};
const bi = function (en, tr) {
  return '<span class="lang-en">' + esc(en) + '</span><span class="lang-tr">' + esc(tr) + "</span>";
};
const pctv = function (v) {
  const f = (Math.round(v * 10) / 10).toFixed(1);
  return bi(f + "%", f.replace(".", ",") + "%");
};
const today = new Date().toISOString().slice(0, 10);

/* ---------- optional portal state ---------- */
const stateFile = argOf("--state");
let state = null, statePath = "", stateStamp = "", settings = {};
if (stateFile) {
  statePath = path.resolve(stateFile);
  let raw;
  try { raw = JSON.parse(fs.readFileSync(statePath, "utf8")); }
  catch (e) { console.error("cannot read state file: " + statePath); process.exit(1); }
  const data = raw && raw.state && raw.state.data ? raw.state.data : (raw || {});
  state = data.gono || {};
  settings = (raw && raw.state && raw.state.settings) || (raw && raw.settings) || {};
  stateStamp = raw && raw.exportedAt ? String(raw.exportedAt).slice(0, 10) : "";
}

/* ---------- gates and cities ---------- */
const gates = S.gonoGates || [];
const items = [];
gates.forEach(function (g) { g.items.forEach(function (i) { items.push(i); }); });
const blockingTotal = items.filter(function (i) { return i.blocking; }).length;
const cities = (S.partners || []).filter(function (p) { return p.id.charAt(0) === "M"; });
const wanted = argOf("--city").toUpperCase();
const selected = wanted ? cities.filter(function (c) { return c.id === wanted; }) : cities;
if (!selected.length) {
  console.error("unknown city: " + wanted + " — available: " + cities.map(function (c) { return c.id; }).join(", "));
  process.exit(1);
}

const statusOf = function (cityId, itemId) {
  const v = state ? state[cityId + "|" + itemId] : "";
  return v || "open";
};
const decisionOf = function (cityId) {
  const out = { items: 0, pass: 0, partial: 0, fail: 0, na: 0, open: 0, blockingOpen: 0, blockingGates: [], score: 0, assessable: 0, gaps: [], soft: [] };
  gates.forEach(function (g) {
    let gateOpen = false;
    g.items.forEach(function (i) {
      const st = statusOf(cityId, i.id);
      out.items++;
      if (i.blocking && st !== "pass") gateOpen = true;
      if (st === "na") {
        out.na++;
        if (i.blocking) { out.blockingOpen++; out.gaps.push({ item: i, st: st }); }
        return;
      }
      out.assessable++;
      if (st === "pass") { out.pass++; out.score += 1; }
      else {
        if (i.blocking) { out.blockingOpen++; out.gaps.push({ item: i, st: st }); }
        else out.soft.push({ item: i, st: st });
        if (st === "partial") { out.partial++; out.score += 0.5; }
        else if (st === "fail") out.fail++;
        else out.open++;
      }
    });
    if (gateOpen) out.blockingGates.push(g.id);
  });
  out.readiness = out.assessable ? (out.score / out.assessable) * 100 : 0;
  out.decision = out.blockingOpen ? "nogo" : (out.fail || out.partial || out.open ? "conditional" : "go");
  return out;
};

const statusLabel = function (st) {
  return { pass: ["passed", "geçti"], partial: ["partial", "kısmi"], fail: ["failed", "başarısız"], open: ["not evaluated", "değerlendirilmedi"], na: ["not applicable", "uygulanamaz"] }[st] || [st, st];
};
const decisionBadge = function (d) {
  const m = { go: ["b-go", "GO", "GO"], conditional: ["b-cond", "CONDITIONAL GO", "KOŞULLU GO"], nogo: ["b-no", "NO-GO", "NO-GO"] }[d];
  return '<span class="stamp ' + m[0] + '">' + bi(m[1], m[2]) + "</span>";
};
const gateById = {};
gates.forEach(function (g) { gateById[g.id] = g; });
const gateAnchorId = function (id) {
  return "gono-gate-" + String(id).replace(/[^A-Za-z0-9_-]/g, "");
};
const gateChips = function (ids) {
  if (!ids.length) return '<span class="gate-none">—</span>';
  return '<div class="gate-list">' + ids.map(function (id) {
    const g = gateById[id];
    const title = (g ? id + " · " + g.name.en + " / " + g.name.tr : id) + " — Open in full brief / Tam özette aç";
    return '<a class="gate-chip" href="SAFE-PARKS-Executive-Brief.html#' + esc(gateAnchorId(id)) + '" title="' + esc(title) + '" aria-label="' + esc(title) + '">' + esc(id) + "</a>";
  }).join("") + "</div>";
};
const linkOf = function (itemId) {
  const lk = (S.gonoLinks || {})[itemId] || {};
  return { comp: lk.comp || [], risks: lk.risks || [] };
};
const itemLinkLine = function (item) {
  const lk = linkOf(item.id);
  if (!lk.comp.length && !lk.risks.length) return "";
  return '<div class="links mono">' +
    (lk.comp.length ? bi("Controls: " + lk.comp.join(" "), "Kontroller: " + lk.comp.join(" ")) : "") +
    (lk.comp.length && lk.risks.length ? " · " : "") +
    (lk.risks.length ? bi("Risks: " + lk.risks.join(" "), "Riskler: " + lk.risks.join(" ")) : "") +
    "</div>";
};
const sourceLine = function () {
  return stateStamp
    ? bi("Figures from the portal state exported " + stateStamp + " (" + path.basename(statePath) + ") and the data files.",
      "Sayılar " + stateStamp + " tarihinde dışa aktarılan portal durumundan (" + path.basename(statePath) + ") ve veri dosyalarından üretilmiştir.")
    : bi("Figures from the delivered data defaults: no go/no-go item is evaluated, so this record reads NO-GO.",
      "Sayılar teslim edilen veri varsayılanlarından üretilmiştir: hiçbir go/no-go maddesi değerlendirilmediği için bu tutanak NO-GO okur.");
};
const reading = function (c, d) {
  if (d.decision === "nogo") {
    return bi(c.blockingOpen + " of " + blockingTotal + " blocking items are not passed; the site may not go live.",
      blockingTotal + " bloklayıcı maddenin " + c.blockingOpen + " tanesi geçmedi; saha devreye alınamaz.");
  }
  if (d.decision === "conditional") {
    return bi("Every blocking item is passed. " + d.soft.length + " non-blocking items remain open, partial or failed, so go-live is allowed only with the conditions on this record.",
      "Bloklayıcı maddelerin tümü geçti. Bloklayıcı olmayan " + d.soft.length + " madde açık, kısmi veya başarısız; devreye alma yalnızca bu tutanaktaki koşullarla mümkündür.");
  }
  return bi("All " + d.items + " items are passed, including all " + blockingTotal + " blocking items. The site may go live for the build hash recorded below.",
    "Bloklayıcı " + blockingTotal + " madde dahil " + d.items + " maddenin tümü geçti. Saha, aşağıda kayıtlı derleme hash'i için devreye alınabilir.");
};

/* ---------- page ---------- */
const gateRows = function (cityId) {
  return gates.map(function (g) {
    const rows = g.items.map(function (i) { return statusOf(cityId, i.id); });
    const passed = rows.filter(function (s) { return s === "pass"; }).length;
    const blockingOpen = g.items.filter(function (i) { return i.blocking && statusOf(cityId, i.id) !== "pass"; }).length;
    return [
      '<span class="mono">' + esc(g.id) + "</span>",
      "<strong>" + bi(g.name.en, g.name.tr) + "</strong>",
      '<span class="num">' + passed + " / " + g.items.length + "</span>",
      '<span class="num">' + (blockingOpen || "0") + "</span>",
      blockingOpen ? '<span class="pill open">' + bi("Open", "Açık") + "</span>" : '<span class="pill clear">' + bi("Clear", "Temiz") + "</span>"
    ];
  });
};

const gapRows = function (c) {
  if (!c.gaps.length) {
    return '<p class="none">' + bi("No blocking item is open for this city.", "Bu şehir için açık bloklayıcı madde yok.") + "</p>";
  }
  return '<div class="gaps">' + c.gaps.map(function (x) {
    const l = statusLabel(x.st);
    return '<div class="gap"><div class="gap-top"><span class="mono gid">' + esc(x.item.id) + "</span>" +
      '<span class="own">' + esc(x.item.owner) + "</span>" +
      '<span class="st">' + bi(l[0], l[1]) + "</span></div>" +
      '<div class="ref mono">' + esc(x.item.ref) + "</div>" + itemLinkLine(x.item) + "</div>";
  }).join("") + "</div>";
};

const softLine = function (c) {
  if (!c.soft.length) return "";
  const text = function (lang) {
    return c.soft.map(function (x) {
      const lk = linkOf(x.item.id);
      const parts = [];
      if (lk.comp.length) parts.push((lang === "en" ? "Controls" : "Kontroller") + ": " + lk.comp.join(" "));
      if (lk.risks.length) parts.push((lang === "en" ? "Risks" : "Riskler") + ": " + lk.risks.join(" "));
      return x.item.id + (parts.length ? " [" + parts.join(" · ") + "]" : "");
    }).join(", ");
  };
  return '<p class="tiny">' + bi("Non-blocking items not passed: " + text("en") + ".",
    "Geçmeyen bloklayıcı olmayan maddeler: " + text("tr") + ".") + "</p>";
};

const summaryPage = function () {
  const tally = { go: 0, conditional: 0, nogo: 0 };
  const rows = cities.map(function (city) {
    const c = decisionOf(city.id);
    tally[c.decision]++;
    return [
      "<strong>" + esc(city.name) + '</strong><div class="tiny">' + esc(city.id) + " · " + esc(city.country) + "</div>",
      decisionBadge(c.decision),
      '<div class="gate-cell"><span class="num">' + c.blockingOpen + "</span>" + gateChips(c.blockingGates) + "</div>",
      '<span class="num">' + c.pass + " / " + c.items + "</span>",
      '<span class="num">' + pctv(c.readiness) + "</span>"
    ];
  });
  const signRows = [
    { role: bi("CISO, Lotus Sirius (WP3 lead)", "CISO, Lotus Sirius (WP3 lideri)"), name: settings.ciso || "" },
    { role: bi("Data protection officer", "Veri koruma görevlisi"), name: settings.dpo || "" },
    { role: bi("CEO — residual risk acceptance", "CEO — artık risk kabulü"), name: "" }
  ].concat(cities.map(function (city) {
    return { role: bi("Municipality representative — " + city.id, "Belediye temsilcisi — " + city.id), name: "" };
  }));
  const countBox = function (n, label, cls) {
    return '<div class="dc ' + cls + '"><span class="dc-num">' + n + '</span><span class="dc-label">' + label + "</span></div>";
  };
  const ga = settings.ga || S.meta.gaNumber;
  const ciso = settings.ciso || "";
  const recordNo = "SP-GONO-ALL-" + today;
  const gateLinkIndex = '<p class="gate-link-index"><b>' + bi("Gate links", "Kapı bağlantıları") + ':</b> ' +
    '<a class="mono" href="SAFE-PARKS-Executive-Brief.html">SAFE-PARKS-Executive-Brief.html</a> · ' +
    gates.map(function (g) {
      return '<a href="SAFE-PARKS-Executive-Brief.html#' + esc(gateAnchorId(g.id)) + '">' + esc(g.id) + " #" + esc(gateAnchorId(g.id)) + "</a>";
    }).join(" · ") + "</p>";
  return '<section class="record summary">' +
    '<div class="rec-head">' +
    '<div class="kicker">SAFE-PARKS · WP3 · ' + bi("CISO decision record", "CISO karar tutanağı") + "</div>" +
    "<h1>" + bi("Pilot go/no-go decision record", "Pilot go/no-go karar tutanağı") + "</h1>" +
    '<div class="meta">' +
    "<span><b>" + bi("Scope", "Kapsam") + "</b> " + bi(cities.length + " pilot municipalities", cities.length + " pilot belediye") + "</span>" +
    "<span><b>" + bi("Record", "Tutanak") + '</b> <span class="mono">' + esc(recordNo) + "</span></span>" +
    "<span><b>" + bi("Date", "Tarih") + '</b> <span class="mono">' + today + "</span></span>" +
    "<span><b>" + bi("Classification", "Sınıflandırma") + "</b> " + esc(S.meta.classification) + "</span>" +
    "<span><b>" + bi("Grant Agreement", "Grant Agreement") + "</b> " + (ga ? esc(ga) : bi("not recorded", "henüz girilmedi")) + "</span>" +
    "<span><b>" + bi("Prepared by", "Hazırlayan") + "</b> " + (ciso ? esc(ciso) : bi("CISO function, Lotus Sirius", "CISO fonksiyonu, Lotus Sirius")) + "</span>" +
    "</div></div>" +
    '<div class="decision-counts">' +
    countBox(tally.go, bi("GO", "GO"), "is-go") +
    countBox(tally.conditional, bi("CONDITIONAL", "KOŞULLU"), "is-cond") +
    countBox(tally.nogo, bi("NO-GO", "NO-GO"), "is-no") +
    "</div>" +
    '<p class="reading">' + bi("Each row is a separate site decision. A GO for one site does not authorise another site; the CISO veto and the open blocking gates in the table remain authoritative.",
      "Her satır ayrı bir saha kararıdır. Bir sahanın GO olması başka bir sahayı yetkilendirmez; CISO vetosu ve tablodaki açık bloklayıcı kapılar esastır.") + "</p>" +
    '<h2 class="h">' + bi("Site decisions", "Saha kararları") + "</h2>" +
    '<table class="gates summary-table"><thead><tr><th>' + bi("City", "Şehir") + "</th><th>" + bi("Decision", "Karar") + "</th><th>" + bi("Open blocking gates", "Açık bloklayıcı kapılar") + "</th><th>" + bi("Passed", "Geçen") + "</th><th>" + bi("Readiness", "Hazırlık") + "</th></tr></thead><tbody>" +
    rows.map(function (r) { return "<tr>" + r.map(function (x) { return "<td>" + x + "</td>"; }).join("") + "</tr>"; }).join("") +
    "</tbody></table>" +
    '<p class="tiny">' + bi("Gate chips name gates with at least one blocking item not passed; select one to open the full brief at that gate's go/no-go items. Printing adds a gate-link index with the full target for each gate. Any open blocking item makes that site NO-GO.",
      "Kapı etiketleri en az bir bloklayıcı maddesi geçmeyen kapıları gösterir; birine basınca tam özet o kapının go/no-go maddelerinde açılır. Yazdırma, her kapı için tam hedefi içeren bir kapı bağlantı dizini ekler. Açık bloklayıcı madde bulunan saha NO-GO'dur.") + "</p>" +
    gateLinkIndex +
    '<p class="attest">' + bi("We confirm that we reviewed the site decisions and open blocking gates above against the portal state on the date of signature. A site may go live only when its own row reads GO, or when the conditions recorded for that site are met. The CISO veto remains absolute for unresolved critical or high findings. Item-level evidence and site-level sign-off remain in the portal and in the per-site detail record.",
      "Yukarıdaki saha kararlarını ve açık bloklayıcı kapıları imza tarihindeki portal durumuyla karşılaştırarak incelediğimizi teyit ederiz. Bir saha yalnızca kendi satırı GO okuduğunda veya o saha için kayıtlı koşullar yerine getirildiğinde devreye alınabilir. Çözülmemiş kritik veya yüksek bulgularda CISO vetosu mutlaktır. Madde düzeyindeki kanıt ve saha imzası portalda ve saha ayrıntı tutanağında kalır.") + "</p>" +
    '<div class="sign-fields">' +
    "<span><b>" + bi("Build hash", "Derleme hash'i") + "</b> <i class=\"blank\"></i></span>" +
    "<span><b>" + bi("Next review", "Sonraki gözden geçirme") + "</b> <i class=\"blank short\"></i></span>" +
    "</div>" +
    '<h2 class="h">' + bi("Consolidated sign-off", "Konsolide imza") + "</h2>" +
    '<table class="sign"><thead><tr><th>' + bi("Role", "Rol") + "</th><th>" + bi("Name", "Ad soyad") + "</th><th>" + bi("Signature", "İmza") + "</th><th>" + bi("Date", "Tarih") + "</th></tr></thead><tbody>" +
    signRows.map(function (r) {
      return "<tr><td>" + r.role + '</td><td class="fill">' + (r.name ? '<span class="prefill">' + esc(r.name) + "</span>" : "") + '</td><td class="fill"></td><td class="fill"></td></tr>';
    }).join("") +
    "</tbody></table>" +
    '<div class="rec-foot">' +
    "<span>" + sourceLine() + "</span>" +
    "<span>" + bi("Page ", "Sayfa ") + "1 / 1</span>" +
    "</div>" +
    "</section>";
};

const pageOf = function (city, index) {
  const c = decisionOf(city.id);
  const recordNo = "SP-GONO-" + city.id + "-" + today;
  return '<section class="record">' +
    '<div class="rec-head">' +
    '<div class="kicker">SAFE-PARKS · WP3 · ' + bi("CISO decision record", "CISO karar tutanağı") + "</div>" +
    "<h1>" + bi("Pilot go/no-go decision", "Pilot go/no-go kararı") + "</h1>" +
    '<div class="meta">' +
    "<span><b>" + bi("Site", "Saha") + "</b> " + esc(city.name) + " · " + esc(city.id) + " · " + esc(city.country) + "</span>" +
    "<span><b>" + bi("Record", "Tutanak") + "</b> <span class=\"mono\">" + esc(recordNo) + "</span></span>" +
    "<span><b>" + bi("Date", "Tarih") + "</b> <span class=\"mono\">" + today + "</span></span>" +
    "<span><b>" + bi("Classification", "Sınıflandırma") + "</b> " + esc(S.meta.classification) + "</span>" +
    "<span><b>" + bi("Grant Agreement", "Grant Agreement") + "</b> " + (S.meta.gaNumber ? esc(S.meta.gaNumber) : bi("not recorded", "henüz girilmedi")) + "</span>" +
    "</div></div>" +
    '<div class="verdict ' + (c.decision === "nogo" ? "v-no" : c.decision === "conditional" ? "v-cond" : "v-go") + '">' +
    decisionBadge(c.decision) +
    '<div class="reading">' + reading(c, c) + "</div>" +
    '<div class="tally">' + bi("Passed " + c.pass + " of " + c.items + " · blocking open " + c.blockingOpen + " of " + blockingTotal + " · readiness ",
      c.items + " maddenin " + c.pass + " tanesi geçti · açık bloklayıcı " + blockingTotal + " maddenin " + c.blockingOpen + " tanesi · hazırlık ") + pctv(c.readiness) + "</div>" +
    "</div>" +
    '<h2 class="h">' + bi("Gate results", "Kapı sonuçları") + "</h2>" +
    '<table class="gates"><thead><tr><th>' + bi("Gate", "Kapı") + "</th><th>" + bi("Scope", "Kapsam") + "</th><th>" + bi("Passed", "Geçen") + "</th><th>" + bi("Blocking open", "Açık bloklayıcı") + "</th><th>" + bi("Verdict", "Sonuç") + "</th></tr></thead><tbody>" +
    gateRows(city.id).map(function (r) { return "<tr>" + r.map(function (x) { return "<td>" + x + "</td>"; }).join("") + "</tr>"; }).join("") +
    "</tbody></table>" +
    '<h2 class="h">' + bi("Blocking items not passed", "Geçmeyen bloklayıcı maddeler") + "</h2>" +
    gapRows(c) + softLine(c) +
    '<p class="attest">' + bi("I confirm that I reviewed the gate results above against the build hash recorded on this page, that the listed evidence exists for every item marked as passed, and that this decision reflects the evidence available on the date of signature. The CISO veto remains absolute for unresolved critical or high findings. Requirement text and evidence expectations are held in the portal and in section 4 of the executive brief.",
      "Yukarıdaki kapı sonuçlarını bu sayfada kayıtlı derleme hash'i ile birlikte incelediğimi, geçti olarak işaretlenen her madde için listelenen kanıtın mevcut olduğunu ve bu kararın imza tarihindeki kanıtı yansıttığını teyit ederim. Çözülmemiş kritik veya yüksek bulgularda CISO vetosu mutlaktır. Gereklilik metinleri ve kanıt beklentileri portalda ve yönetici özetinin 4. bölümünde tutulur.") + "</p>" +
    '<div class="sign-fields">' +
    '<span><b>' + bi("Build hash", "Derleme hash'i") + "</b> <i class=\"blank\"></i></span>" +
    '<span><b>' + bi("Next review", "Sonraki gözden geçirme") + "</b> <i class=\"blank short\"></i></span>" +
    "</div>" +
    '<table class="sign"><thead><tr><th>' + bi("Role", "Rol") + "</th><th>" + bi("Name", "Ad soyad") + "</th><th>" + bi("Signature", "İmza") + "</th><th>" + bi("Date", "Tarih") + "</th></tr></thead><tbody>" +
    [
      [bi("CISO, Lotus Sirius (WP3 lead)", "CISO, Lotus Sirius (WP3 lideri)")],
      [bi("Municipality representative", "Belediye temsilcisi")],
      [bi("Data protection officer", "Veri koruma görevlisi")],
      [bi("CEO — residual risk acceptance", "CEO — artık risk kabulü")]
    ].map(function (r) {
      return "<tr><td>" + r[0] + '</td><td class="fill"></td><td class="fill"></td><td class="fill"></td></tr>';
    }).join("") + "</tbody></table>" +
    '<div class="rec-foot">' +
    "<span>" + (stateStamp
      ? bi("Figures from the portal state exported " + stateStamp + " (" + path.basename(statePath) + ") and the data files.",
        "Sayılar " + stateStamp + " tarihinde dışa aktarılan portal durumundan (" + path.basename(statePath) + ") ve veri dosyalarından üretilmiştir.")
      : bi("Figures from the delivered data defaults: no go/no-go item is evaluated, so this record reads NO-GO.",
        "Sayılar teslim edilen veri varsayılanlarından üretilmiştir: hiçbir go/no-go maddesi değerlendirilmediği için bu tutanak NO-GO okur.")) + "</span>" +
    "<span>" + bi("Page ", "Sayfa ") + (index + 1) + " / " + selected.length + "</span>" +
    "</div>" +
    "</section>";
};

const css = `
:root{--ink:#101828;--muted:#5b6472;--line:#d8dde5;--soft:#f7f9fb;--accent:#0f766e}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:#eef1f5;color:var(--ink);font:11.6px/1.42 "Segoe UI",system-ui,-apple-system,Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
main{max-width:794px;margin:0 auto;background:#fff;padding:22px 26px 26px}
html[data-lang="en"] .lang-tr{display:none}
html[data-lang="tr"] .lang-en{display:none}
.toolbar{position:sticky;top:0;z-index:5;max-width:794px;margin:0 auto;background:#fff;border-bottom:1px solid var(--line);padding:7px 26px;display:flex;gap:9px;align-items:center;font-size:11px;color:var(--muted)}
.toolbar .grow{flex:1}
.toolbar button{font:inherit;border:1px solid var(--line);background:#fff;color:var(--ink);padding:4px 9px;border-radius:5px;cursor:pointer}
.toolbar button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:#fff}
.toolbar .print{background:var(--ink);color:#fff;border-color:var(--ink)}
.record{padding:0 0 6px;break-after:page;page-break-after:always}
.record:last-child{break-after:auto;page-break-after:auto}
.rec-head{border-bottom:2.5px solid var(--ink);padding-bottom:6px;margin-bottom:8px}
.kicker{font-size:9.2px;letter-spacing:.12em;color:var(--accent);font-weight:700}
h1{font-size:19px;margin:4px 0 5px;letter-spacing:-.2px}
.meta{display:flex;flex-wrap:wrap;gap:3px 14px;font-size:9.6px;color:var(--muted)}
.meta b{color:var(--ink);font-weight:600}
.verdict{border:1.5px solid var(--line);border-radius:6px;padding:6px 9px;margin:0 0 7px}
.v-no{border-color:#cf8f7f;background:#fdf3f1}
.v-cond{border-color:#dfae9f;background:#fdf6ec}
.v-go{border-color:#b5dfc6;background:#f0f8f2}
.stamp{display:inline-block;font-size:15px;font-weight:800;letter-spacing:.06em;padding:3px 10px;border-radius:4px;border:1.5px solid}
.b-no{color:#8f231a;border-color:#c98878;background:#fff}
.b-cond{color:#8a5312;border-color:#d8a35c;background:#fff}
.b-go{color:#14663a;border-color:#7cbb96;background:#fff}
.reading{font-size:11.2px;margin:6px 0 4px}
.tally{font-size:9.8px;color:var(--muted)}
h2.h{font-size:10.6px;letter-spacing:.05em;text-transform:none;margin:10px 0 4px;color:var(--muted);font-weight:700}
table{width:100%;border-collapse:collapse;margin:0 0 6px;font-size:9.8px}
th{text-align:left;font-size:8.6px;color:var(--muted);font-weight:700;border-bottom:1.3px solid var(--ink);padding:3px 5px}
td{padding:2px 5px;border-bottom:1px solid var(--line);vertical-align:top}
table.gates tbody tr:nth-child(even),table.tight tbody tr:nth-child(even){background:var(--soft)}
td.num,th.num{text-align:right;white-space:nowrap}
.mono{font-family:ui-monospace,"Cascadia Mono",Consolas,monospace;font-size:9px}
.tiny{font-size:8.9px;color:var(--muted);margin:2px 0 6px}
.nowrap{white-space:nowrap}
.pill{display:inline-block;font-size:8.6px;font-weight:700;padding:1px 6px;border-radius:8px;border:1px solid var(--line)}
.pill.open{background:#fdeceb;border-color:#f3c2be;color:#8f231a}
.pill.clear{background:#e8f5ee;border-color:#b5dfc6;color:#14663a}
.none{font-size:10px;color:var(--muted);margin:0 0 6px;padding:5px 7px;border:1px dashed var(--line);border-radius:5px}
.gaps{display:grid;grid-template-columns:1fr 1fr;gap:0 16px;margin:0 0 5px}
.gap{border-bottom:1px solid var(--line);padding:1px 0 2px;break-inside:avoid;page-break-inside:avoid}
.gap-top{display:flex;gap:6px;align-items:baseline;font-size:8.9px}
.gid{min-width:32px}
.own{flex:1;color:#2b3442}
.st{white-space:nowrap;color:var(--muted)}
.ref{font-size:8px;color:var(--muted);line-height:1.25}
.links{font-size:8px;color:#3b4654;line-height:1.2;margin-top:1px}
.attest{font-size:9.1px;line-height:1.32;color:#2b3442;border-left:3px solid var(--accent);padding:4px 8px;background:#f5faf9;margin:6px 0}
.sign-fields{display:flex;gap:24px;font-size:9.4px;margin:6px 0}
.blank{display:inline-block;min-width:150px;border-bottom:1px solid var(--ink);height:11px;vertical-align:-1px}
.blank.short{min-width:80px}
table.sign{font-size:9.4px;margin-bottom:4px}
table.sign td.fill{height:24px;border-bottom:1px solid var(--ink)}
table.sign td{border-bottom:1px solid var(--line)}
table.sign tbody tr:last-child td{border-bottom:1px solid var(--ink)}
.record.summary{break-after:auto;page-break-after:auto;font-size:10.6px}
.summary h1{font-size:18px}
.summary .rec-head{margin-bottom:7px}
.summary .reading{font-size:10.2px}
.summary .h{margin-top:8px}
.summary table{font-size:9.1px}
.summary .sign{font-size:8.6px}
.summary .sign td.fill{height:18px}
.summary .attest{font-size:8.8px;margin:5px 0}
.decision-counts{display:flex;gap:8px;margin:0 0 6px}
.dc{flex:1;display:flex;align-items:baseline;gap:6px;border:1px solid var(--line);border-left:3px solid var(--line);border-radius:5px;background:var(--soft);padding:5px 7px}
.dc-num{font-size:20px;font-weight:800;line-height:1}
.dc-label{font-size:8.8px;color:var(--muted);font-weight:700;letter-spacing:.04em}
.is-go{border-left-color:#2f8f5b}
.is-cond{border-left-color:#c98a1e}
.is-no{border-left-color:#b4453a}
.gate-cell{text-align:right}
.gate-list{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:2px;margin-top:2px}
.gate-chip{display:inline-block;font:700 7.8px/1.3 ui-monospace,"Cascadia Mono",Consolas,monospace;border:1px solid var(--line);border-radius:3px;padding:0 3px;background:#fff;color:var(--ink);white-space:nowrap;text-decoration:none;cursor:pointer}
.gate-chip:hover,.gate-chip:focus-visible{border-color:var(--accent);color:var(--accent);text-decoration:underline}
.gate-chip:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.gate-none{font-size:8.6px;color:var(--muted)}
.gate-link-index{display:none}
.prefill{font-weight:600}
.rec-foot{display:flex;justify-content:space-between;gap:14px;border-top:1px solid var(--line);padding-top:5px;font-size:8.6px;color:var(--muted)}
@page{size:A4;margin:11mm 11mm 10mm}
@media print{
  body{background:#fff}
  main{max-width:none;padding:0}
  .no-print{display:none!important}
  .record{padding:0}
  table,.attest,.verdict,.sign{break-inside:avoid;page-break-inside:avoid}
  .gate-link-index{display:block;font-size:7.4px;line-height:1.35;color:var(--muted);border-top:1px solid var(--line);padding-top:3px;margin:3px 0 4px;word-break:break-word}
  .gate-link-index a{color:var(--ink);text-decoration:underline}
}
`;

const toolbar = '<div class="toolbar no-print"><span class="grow">' +
  (wanted
    ? bi("One page per city · prints in the selected language", "Her şehir için bir sayfa · seçili dilde yazdırır")
    : bi("One page · all pilot cities · prints in the selected language", "Tek sayfa · tüm pilot şehirler · seçili dilde yazdırır")) + "</span>" +
  '<div role="group" aria-label="Language">' +
  '<button type="button" data-lang-btn="tr" aria-pressed="true">TR</button> ' +
  '<button type="button" data-lang-btn="en" aria-pressed="false">EN</button></div>' +
  '<button type="button" class="print" onclick="window.print()">' + bi("Print / PDF", "Yazdır / PDF") + "</button></div>";

const script = "<script>(function(){var b=document.querySelectorAll('[data-lang-btn]');function set(l){var h=document.documentElement;h.setAttribute('data-lang',l);h.setAttribute('lang',l);for(var i=0;i<b.length;i++){b[i].setAttribute('aria-pressed',b[i].getAttribute('data-lang-btn')===l?'true':'false');}}for(var i=0;i<b.length;i++){(function(x){x.addEventListener('click',function(){set(x.getAttribute('data-lang-btn'));});})(b[i]);}})();<\/script>";

const html = '<!doctype html>\n<html lang="tr" data-lang="tr">\n<head>\n<meta charset="utf-8">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
  "<title>" + esc("SAFE-PARKS — Pilot go/no-go decision record · Pilot go/no-go karar tutanağı") + "</title>\n" +
  "<style>" + css + "</style>\n</head>\n<body>\n" + toolbar + "\n<main>\n" +
  (wanted ? selected.map(function (c, i) { return pageOf(c, i); }).join("\n") : summaryPage()) +
  "\n</main>\n" + script + "\n</body>\n</html>\n";

const outFile = argOf("--out") || "SAFE-PARKS-GoNoGo-Decision.html";
const outPath = path.resolve(root, outFile);
fs.writeFileSync(outPath, html, "utf8");

const tally = { go: 0, conditional: 0, nogo: 0 };
selected.forEach(function (c) { tally[decisionOf(c.id).decision]++; });
console.log("written " + outPath);
if (wanted) {
  console.log("1 detailed record (" + selected[0].id + ") · GO " + tally.go + " · conditional " + tally.conditional + " · NO-GO " + tally.nogo +
    (stateStamp ? " · state " + path.basename(statePath) + " (" + stateStamp + ")" : " · delivered defaults (nothing evaluated)"));
} else {
  console.log("1 consolidated record · " + selected.length + " sites · GO " + tally.go + " · conditional " + tally.conditional + " · NO-GO " + tally.nogo +
    (stateStamp ? " · state " + path.basename(statePath) + " (" + stateStamp + ")" : " · delivered defaults (nothing evaluated)"));
}
