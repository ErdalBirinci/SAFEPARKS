/* SAFE-PARKS CISO Portal — bidirectional links: go/no-go gate items ↔ compliance controls ↔ risks.
   One link table, read in both directions:
     SP.gonoLinks[itemId] = { comp: [control ids], risks: [risk ids] }
     SP.gonoByComp[controlId] = [item ids]   ·   SP.gonoByRisk[riskId] = [item ids]
   Ids are the ids used in data-comp*.js, data-risk.js and data-gono.js. */
window.SP = window.SP || {};

SP.gonoLinks = {
  /* G1 — legal basis and controllership */
  "G1-1": { comp: ["G4", "G14", "K8"], risks: ["R15", "R17"] },
  "G1-2": { comp: ["G12", "G7", "A3", "A2"], risks: ["R15", "R1"] },
  "G1-3": { comp: ["G9", "K7"], risks: ["R17"] },
  "G1-4": { comp: ["G8", "G10"], risks: ["R16", "R19"] },
  "G1-5": { comp: ["G3", "K8", "K6"], risks: ["R18", "R15"] },

  /* G2 — privacy engineering */
  "G2-1": { comp: ["G1", "G2"], risks: ["R1"] },
  "G2-2": { comp: ["G2", "I5"], risks: ["R1", "R21"] },
  "G2-3": { comp: ["G5", "K2", "A1"], risks: ["R2"] },
  "G2-4": { comp: ["I7", "G1"], risks: ["R3"] },
  "G2-5": { comp: ["G2", "K1", "A5"], risks: ["R1", "R21"] },

  /* G3 — identity, access and keys */
  "G3-1": { comp: ["N6", "I6", "I4"], risks: ["R6", "R9"] },
  "G3-2": { comp: ["N5", "I5"], risks: ["R4", "R6"] },
  "G3-3": { comp: ["N6", "I6"], risks: ["R9", "R22"] },
  "G3-4": { comp: ["N5", "I8"], risks: ["R19", "R6"] },

  /* G4 — network and isolation */
  "G4-1": { comp: ["I3", "I4"], risks: ["R12"] },
  "G4-2": { comp: ["G13", "K3", "D2", "D1"], risks: ["R10", "R16", "R11"] },
  "G4-3": { comp: ["N3", "C1"], risks: ["R7", "R8"] },
  "G4-4": { comp: ["G13", "I4"], risks: ["R6"] },

  /* G5 — edge node and supply chain */
  "G5-1": { comp: ["I4", "C1"], risks: ["R7", "R6"] },
  "G5-2": { comp: ["N2", "I2", "C1"], risks: ["R7", "R19"] },
  "G5-3": { comp: ["I7", "I5"], risks: ["R4", "R7"] },
  "G5-4": { comp: ["I7", "D3"], risks: ["R3", "R7"] },

  /* G6 — operators, runbooks and exercises */
  "G6-1": { comp: ["I8", "N5", "A6", "G6"], risks: ["R12", "R14"] },
  "G6-2": { comp: ["I8", "G11", "K5"], risks: ["R5", "R12"] },
  "G6-3": { comp: ["I8", "I3"], risks: ["R5", "R6"] },
  "G6-4": { comp: ["G11", "K5", "N7"], risks: ["R5", "R17"] },

  /* G7 — assurance and acceptance */
  "G7-1": { comp: ["G10", "I4"], risks: ["R6", "R8"] },
  "G7-2": { comp: ["G10", "I1", "A7", "A4", "A8"], risks: ["R13", "R20"] },
  "G7-3": { comp: ["I3"], risks: ["R5", "R12"] },
  "G7-4": { comp: ["I5", "A5", "K4"], risks: ["R10", "R21"] },

  /* G8 — governance and continuity */
  "G8-1": { comp: ["I1", "N4", "N1"], risks: ["R20", "R15"] },
  "G8-2": { comp: ["I1"], risks: ["R20", "R18"] },
  "G8-3": { comp: ["N2", "I2"], risks: ["R7", "R8"] },
  "G8-4": { comp: ["K8", "G11", "G6"], risks: ["R18", "R5"] }
};

SP.buildLinkIndex = function () {
  var byComp = {}, byRisk = {};
  Object.keys(SP.gonoLinks).forEach(function (id) {
    var l = SP.gonoLinks[id] || {};
    (l.comp || []).forEach(function (c) { (byComp[c] = byComp[c] || []).push(id); });
    (l.risks || []).forEach(function (r) { (byRisk[r] = byRisk[r] || []).push(id); });
  });
  SP.gonoByComp = byComp;
  SP.gonoByRisk = byRisk;
};
SP.buildLinkIndex();

/* small anchor chip that the portal turns into a filtered jump (data-link="comp|risk|gono:id") */
SP.chipLinks = function (kind, ids) {
  var target = kind === "comp" ? "compliance" : kind === "risk" ? "risks" : "gono";
  return (ids || []).map(function (id) {
    var v = String(id).replace(/[^A-Za-z0-9_-]/g, "");
    return '<a class="tag link-chip mono" href="#' + target + '" data-link="' + kind + ":" + v + '">' + v + "</a>";
  }).join("");
};
