/* SAFE-PARKS CISO Portal — evidence ledger CSV.
   One builder shared by the portal export and tools/build-evidence-csv.js so both produce identical files.
   Inputs: compliance rows, the notes map (`comp|<id>|ref` / `note` / `verifiedOn` / `verifiedBy`), an
   optional status lookup and an optional `{ city }` scope (`M1` … `M7`).
   A city scope stamps every row with that municipality and its pilot wave; without a scope the ledger
   carries the project-wide aggregate labels. Evidence notes remain project-wide.
   Output: UTF-8 with BOM, CRLF line endings, RFC 4180 quoting — opens cleanly in Excel and is pipe-friendly. */
window.SP = window.SP || {};

SP.evidenceCsvColumns = [
  "Control ID", "Framework", "Requirement (EN)", "Requirement (TR)",
  "Owner", "Responsible municipality", "Pilot wave", "Status", "Evidence reference", "Evidence note",
  "Verified on", "Verified by", "Recorded"
];

SP.evidenceScope = function (cityId) {
  var id = String(cityId || "").toUpperCase();
  var cities = SP.pilotCities || [];
  if (!id) {
    return { city: "", municipality: "All pilot municipalities", wave: "All pilot waves (W1–W3)" };
  }
  var city = cities.filter(function (c) { return c.id === id; })[0];
  if (!city) throw new Error("Unknown pilot city: " + id);
  var wave = SP.pilotWaveOf ? SP.pilotWaveOf(city.id) : null;
  return {
    city: city.id,
    municipality: city.id + " · " + city.name,
    wave: wave ? wave.id + " · " + wave.label.en + " (" + wave.months.en + ")" : "Unassigned"
  };
};

SP.csvCell = function (value) {
  var s = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

SP.buildEvidenceCsv = function (rows, notes, statusOf, options) {
  var scope = SP.evidenceScope((options || {}).city || "");
  var lines = [SP.evidenceCsvColumns.join(",")];
  (rows || []).forEach(function (r) {
    var ref = (notes || {})["comp|" + r.id + "|ref"] || "";
    var note = (notes || {})["comp|" + r.id + "|note"] || "";
    var verifiedOn = (notes || {})["comp|" + r.id + "|verifiedOn"] || "";
    var verifiedBy = (notes || {})["comp|" + r.id + "|verifiedBy"] || "";
    var status = (statusOf && statusOf(r.id)) || r.status || "";
    lines.push([
      r.id,
      r.fw,
      r.req && r.req.en,
      r.req && r.req.tr,
      r.owner,
      scope.municipality,
      scope.wave,
      status,
      ref,
      note,
      verifiedOn,
      verifiedBy,
      ref || note ? "yes" : "no"
    ].map(SP.csvCell).join(","));
  });
  return "\ufeff" + lines.join("\r\n") + "\r\n";
};

/* Missing-evidence export: one row per control with neither a reference nor a note,
   ordered by owner and then by the framework order used in the portal. */
SP.missingEvidenceCsvColumns = [
  "Owner", "Framework", "Control ID", "Requirement (EN)", "Requirement (TR)", "Status"
];

SP.buildMissingEvidenceCsv = function (rows, notes, statusOf) {
  var fwOrder = {};
  (SP.frameworks || []).forEach(function (f, i) { fwOrder[f.id] = i; });
  var missing = (rows || []).filter(function (r) {
    var ref = (notes || {})["comp|" + r.id + "|ref"] || "";
    var note = (notes || {})["comp|" + r.id + "|note"] || "";
    return !String(ref).trim() && !String(note).trim();
  }).sort(function (a, b) {
    var oa = a.owner || "";
    var ob = b.owner || "";
    if (oa !== ob) return oa.localeCompare(ob);
    var fa = fwOrder[a.fw] === undefined ? 99 : fwOrder[a.fw];
    var fb = fwOrder[b.fw] === undefined ? 99 : fwOrder[b.fw];
    return fa - fb || a.id.localeCompare(b.id);
  });
  var lines = [SP.missingEvidenceCsvColumns.join(",")];
  missing.forEach(function (r) {
    lines.push([
      r.owner,
      r.fw,
      r.id,
      r.req && r.req.en,
      r.req && r.req.tr,
      (statusOf && statusOf(r.id)) || r.status || ""
    ].map(SP.csvCell).join(","));
  });
  return "\ufeff" + lines.join("\r\n") + "\r\n";
};
