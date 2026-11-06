# SAFE-PARKS · CISO Portal

<p align="center"><img src="assets/img/safe-parks-logo.svg" alt="SAFE-PARKS CISO Portal" width="520"></p>

Bilingual (Türkçe / English) governance, compliance and security-assurance portal for the
**CISO function of Lotus Sirius** on the SAFE-PARKS Horizon Europe project (WP3 — Cybersecurity,
Secure Telemetry & NATO EFDI Connector).

No build step, no dependencies, no server-side code, no network calls. Open the page and work.

---

## 1. What is inside

| Section | Purpose |
| --- | --- |
| **Dashboard** | Live posture: readiness %, critical/high risks, deliverable status, 90-day progress, heat map. |
| **Project & budget** | 12 partners, €4.72 M, 4 × €285 k + 7 × €440 k + €500 k, reconciliation to 65.25 %, 7 WPs. |
| **Roles & RACI** | CISO / CTO / CEO / DPO / EPAB duties, RACI matrix, decision rights, escalation, and the six requested decisions with pending / approved / rejected status. |
| **CISO mandate** | Charter ready for CEO signature, risk appetite thresholds, 7 objectives, first-90-days plan. |
| **Compliance matrix** | ~50 controls across GDPR, KVKK (6698), NIS2, EU AI Act, ISO/IEC 27001:2022, CRA and NATO/STANAG, each with control text, evidence ID, evidence note, file reference, last verification date, verifier and editable status. Verifications older than 12 months carry an aging warning. |
| **Missing evidence** | Controls with neither an evidence reference nor a note, grouped by the responsible owner. Each row takes an inline reference and note; saving the record removes it from the list. A separate group lists controls that have evidence but no verification date or verifier, with a link to complete the record. The view exports the remaining rows as a CSV ordered by owner and framework. Live count in the sidebar. |
| **Privacy engineering** | 7-step data flow, retention matrix, ROPA, 20 TOMs, DPIA screening, 12 DPIA risks with residual scoring. |
| **Security architecture** | Five trust zones, cryptographic baseline, PQC migration phases, port policy, EFDI data-diode design, resilience targets. |
| **Risk register** | 22 risks with 5×5 scoring, treatment, owner, due date and editable status. |
| **Assurance** | Penetration-test calendar, audit cycle, certification roadmap, secure-SDLC gates, training plan. |
| **Incident response** | Severity matrix, notification matrix (GDPR 72 h, KVKK 72 h, NIS2 24/72 h/1 month, AI Act 15 days, defence), 72-hour timeline, 7 playbooks. |
| **WP3 plan** | €285 k breakdown, 19 PM, 6 tasks, 6 deliverables, interfaces to WP2/4/5/6/7, milestones. |
| **Go / no-go** | 8 gates × 34 items per pilot city, blocking criteria, automatic GO / conditional / NO-GO decision and a one-page printable decision record with linked control and risk IDs. |
| **Deliverables** | 12 deliverables with due month, dissemination level, CISO role and editable status. |
| **Policy library** | 9 policies + CISO charter, fully bilingual, printable and downloadable as Markdown. |
| **KPIs & reporting** | 14 KPIs, monthly/quarterly/steering pack contents, Markdown and JSON export. |
| **Management console** | Tasks, decision metadata, risk acceptance, KPI and budget actuals, document control, local snapshots, data health, audit trail and CSV/ICS exports. |
| **Settings** | CISO/DPO/GA fields, language, theme, export/import/reset, open items. |

All editable state (control status, risk status, deliverable status, 90-day ticks, names) is saved in
`localStorage` under `safeparks-ciso-v1` and can be exported to JSON.

The portal opens behind a password gate for three authorised users. Passwords are not stored in the
repository; only their SHA-256 digests are checked in the browser. The unlocked session lasts for the
current browser tab. This is a convenience gate, not a security boundary: GitHub Pages is static, so
the HTML, data files and generated PDFs remain readable by anyone who has a direct URL or the source.
Use a server-side access proxy (for example Cloudflare Access) if the content must be confidential.

### Management console

The **Management** view adds a local-first operating layer on top of the existing portal: tasks with
owner/due/status, decision metadata and approvers, risk acceptance with expiry, KPI and WP3 budget
actuals, document versions and review dates, snapshots/restore, a data-health summary, an audit trail,
an audit CSV and a task calendar (ICS). Successful sign-in carries a user label and role into the audit
entries, and the session ends on sign-out or after 30 minutes without input.

A canonical `safeparks-brief-state.json` is versioned so the briefs, go/no-go record and evidence CSV
have a reviewed baseline. The repository also ships dependency-free unit tests, a data-integrity check
and a CI gate that refuses stale or untracked artifacts. See `docs/OPERATIONS.md` for the routine and
release procedure.

These controls remain local to one browser. Shared multi-user editing, server-side roles, trustworthy
audit storage and automatic reminders require a backend and are deliberately **not** claimed here.

---

## 2. Run it

Directly:

```bash
# any static server works
python -m http.server 4173
# or the bundled dependency-free helper
node tools/serve.js 4173
# then open http://127.0.0.1:4173
```

or simply open `index.html` in a browser. (A local server is recommended so that `localStorage`
is scoped to an origin instead of a `file://` path.)

---

## 3. Structure

```
index.html                  shell, sidebar, topbar, script order
assets/css/style.css        design system, dark/light themes, print styles
assets/img/                 SAFE-PARKS mark, logo lockup, favicon and Apple touch icon
assets/js/auth.js          client-side password gate for authorised portal users
assets/js/i18n.js           Turkish UI dictionary
assets/js/i18n-en.js        English UI dictionary
assets/js/data.js           meta, partners, WPs, WP3 budget/tasks/interfaces, governance
assets/js/data-gov.js       CISO mandate, objectives, 90-day plan, KPIs, reporting
assets/js/data-comp.js      compliance: GDPR + KVKK
assets/js/data-comp2.js     compliance: NIS2 + AI Act + ISO 27001 + CRA + NATO
assets/js/data-priv.js      data flow, retention, ROPA, TOMs, DPIA
assets/js/data-arch.js      zones, crypto, ports, PQC, EFDI, resilience
assets/js/data-risk.js      risk register + STRIDE threat model
assets/js/data-ops.js       incidents, assurance, deliverables, milestones
assets/js/data-gono.js      pilot go/no-go gates: 8 gates, 34 items, evidence and legal references
assets/js/data-links.js     bidirectional links: go/no-go item ↔ control ↔ risk
assets/js/evidence-csv.js   shared evidence-ledger CSV builder (portal + CLI)
assets/js/docs.js           policies POL-01 … POL-05
assets/js/docs2.js          policies POL-06 … POL-09 + CH-01, doc index
assets/js/app-views.js      compliance, missing-evidence, privacy, architecture, risk views
assets/js/app-views2.js     assurance, incidents, WP3, deliverables, docs, reporting, settings
assets/js/app-views3.js     pilot go/no-go view (checklist, overview, decision record)
assets/js/app-views4.js     management console (tasks, approvals, snapshots, audit, health)
assets/js/management.js     dependency-free management helpers shared by the portal and tests
assets/js/app.js            state, i18n binding, router, shared UI, dashboard, project, governance, mandate
tools/serve.js              dependency-free static server for local preview (development only)
SAFE-PARKS-Executive-Brief.html  generated A4 executive brief (CEO / consortium, TR+EN)
SAFE-PARKS-Executive-Brief-2p.html  two-page version: cover, status, decisions, pilot-city decisions and city risk view (site scores, owner, note and last verification)
SAFE-PARKS-GoNoGo-Decision.html  one-page consolidated go/no-go decision record (all pilot cities)
SAFE-PARKS-Decision-Table.docx  directly openable bilingual Word decision table
SAFE-PARKS-Decision-Table.xlsx  directly openable bilingual Excel decision workbook

tools/build-brief.js        regenerates both briefs and the decision-table exports from the data files
tools/ooxml.js              dependency-free DOCX/XLSX package writer for the decision table
tools/build-brief-from-state.js  downloads a state and regenerates briefs, decision table, go/no-go record and evidence CSV
tools/check-brief-state.js  verifies a brief's state timestamp and content hash
tools/state-hash.js        canonical SHA-256 hash of the state fields used by the briefs
tools/ci-gate.js            required CI gate: tracked state/artifacts + current brief set
.github/workflows/brief-state-gate.yml  runs the gate on pull requests, main pushes and manual runs
tools/build-gono-decisions.js  regenerates the signed go/no-go decision records
tools/build-evidence-csv.js    writes the evidence ledger CSV from an exported portal state
tools/check-data.js          validates source counts, required fields, links and budget totals
tests/management.test.js     unit tests for audit, snapshots, tasks, validation and exports
tests/state-hash.test.js     state-hash stability tests
safeparks-brief-state.json   canonical reviewed state used to regenerate release artifacts
docs/OPERATIONS.md           roles, routine work, release, recovery and static-site limits
```

Local checks:

```bash
npm test
npm run check
npm run build:artifacts
npm run gate
```

### Adding or changing content

* **Bilingual text** is an object: `{ en: "…", tr: "…" }`. Every view resolves it with `L()`.
* **Compliance rows** live in `data-comp.js` / `data-comp2.js`; keep `id`, `fw`, `ref`, `req`, `ctrl`,
  `ev`, `owner`, `status` intact. New framework → add it to `SP.frameworks`.
* **Risks** use `l` (likelihood) and `i` (impact), both 1–5. Score is computed.
* **UI strings** are keys in `i18n.js` and `i18n-en.js`; a missing key falls back to English.
* **Documents** are structured objects (`sections` → `h` + `p[]` / `list[]`), so they render as
  prose, print cleanly and export to Markdown.

---

## 4. Facts, placeholders and what must be verified

Authoritative and used as given: total budget €4,720,000; 12 partners; 7 pilot cities in Belgium,
Ukraine, Türkiye, Italy and Romania; 7 municipalities × €440,000 = €3,080,000 (65.25 %); coordinator
Xena Vision €500,000; UNIROMA1 / 3S Holding / CEPS / Lotus Sirius €285,000 each; WP3 led by Lotus
Sirius; the 60 s / 30 s zero-biometric model.

Marked with ⚠ and to be confirmed before any official use:

* Grant Agreement number, call ID and project duration (36 months assumed).
* Country assignment of the seven municipalities (the per-city split is indicative).
* WP1, WP2, WP4–WP7 budgets (only the total, WP3 and partner figures are shown).
* CSIRT, KVKK Board and NATO/defence contacts.
* STANAG classification scheme required by the defence counterpart.
* AI Act high-risk timeline: a pending omnibus proposal may defer Annex III obligations — verify the
  current legal text before each conformity milestone.

The CISO figures (19 PM, cost split, deliverable months, pentest schedule) are a defensible plan,
not a transcription of the signed DoA. Replace them with the negotiated values.

---

## 5. Limits of this instrument

* It is **not** a certified system: the password gate is client-side only, there is no server-side
  session, and local audit entries can be edited or cleared by whoever controls the browser. A direct
  URL bypasses the portal screen, and the repository itself is public. Do not store personal data or
  confidential material in it.
* Legal text is a working interpretation, not legal advice; the controller municipalities and their
  DPOs remain responsible for lawfulness.
* Bilingual content is maintained in parallel; when you edit one language, edit the other.

---

## 6. Print / export

* `Print / PDF` in the topbar prints the current view (sidebar, topbar and toolbars are hidden;
  collapsed sections are expanded).
* Policy pages have `Download Markdown` and `Print / PDF`.
* `Export status report (Markdown)` produces an executive summary of the current local state, including the evidence log (note + file reference per control).
* `Export tracker state (JSON)` is the backup format; `Import` restores it on another machine.
* `Export brief state (JSON)` (topbar data menu or Settings) writes `safeparks-brief-state.json` with only
  what the briefs consume: compliance statuses, risk statuses, deliverable statuses, go/no-go item
  statuses, 90-day action ticks, evidence notes, decision statuses, city site scores and city site-risk
  records (`cityRiskMeta`: risk owner, note and last verification date per pilot city). Place it in the project root and run
  `node tools/build-brief.js --state safeparks-brief-state.json`; both briefs then carry the local edits
  and state it on the cover and in the provenance section (file, export date, number of edits applied).
  The full brief prints a per-city go/no-go decision table built from these statuses, with open blocking
  gates listed beside each blocking count. Each gate chip links to the first row for that gate in the
  gate-item reference table; on the decision-table page the same chips open the full brief at that anchor.
  TOMs and interface settings are excluded; any unmatched keys are reported as ignored by the CLI.
  For a single command, run `node tools/build-brief-from-state.js <url>`: it downloads the state to
  `safeparks-brief-state.json` and regenerates both briefs, the decision-table exports, the consolidated
  `SAFE-PARKS-GoNoGo-Decision.html` record and `SAFE-PARKS-Evidence-Ledger.csv`. Before overwriting an
  existing canonical state, it copies that file to `safeparks-brief-state.previous.json` and prints a
  comparison summary grouped by framework. Status changes are listed separately from evidence
  additions/updates; changes outside the compliance matrix use programme-section groups such as
  `Risk register`, `Deliverables` and `Go/no-go gates`. Risk entries include the risk title, category,
  score and owner; deliverable entries include the deliverable title, work package, lead and due month.
  With no argument it uses that file from the project root; a local path is accepted instead of a URL.
  Both briefs mark the local state: the full brief's provenance section lists changed controls (status or
  evidence), and the two-page cover names their IDs. Each brief embeds the state timestamp and a
  canonical SHA-256 hash of the state values consumed by the briefs. To check that both briefs still match
  the current state, run `node tools/check-brief-state.js [--state file]`; it exits 1 with a per-file
  warning when a brief is older, was built without a state, or its content hash no longer matches the
  state file. The hash is stable across JSON formatting and key order, so it catches manual value edits
  that keep the old timestamp. The required CI gate is
  `node tools/ci-gate.js [--state file]`: it refuses to run outside a Git checkout, requires the state
  file and all generated release artifacts to be tracked, then runs the stale-brief check. The
  `brief-state-gate` workflow runs it on pull requests and pushes to `main`; mark that job as a required
  status check in branch protection. The gate deliberately fails while `safeparks-brief-state.json` is
  missing or untracked, so production cannot ship without a versioned state and current briefs.
* `Download evidence ledger (CSV)` (reporting view and topbar data menu) writes a city-scoped ledger.
  The reporting view's **Evidence ledger city** selector filters/scopes the download; with no city it
  writes `safeparks-evidence-ledger.csv` with aggregate labels, and with a city it writes
  `safeparks-evidence-ledger-m1.csv` (for example). Each row carries the requirement in both languages,
  control owner, **Responsible municipality**, **Pilot wave**, effective status, evidence reference,
  evidence note, last verification date, verifier and a `Recorded` yes/no column. Evidence notes remain
  project-wide; the city selector provides the controller/municipality and wave context.
* `Download missing evidence (CSV)` in the missing evidence view writes
  `safeparks-missing-evidence.csv`: one row per control with neither an evidence reference nor a note,
  ordered by owner and then framework, with the bilingual requirement and effective status. It uses the
  same UTF-8 BOM, CRLF and quoted-field conventions as the evidence ledger.
  The full evidence ledger can also be produced offline from an exported state:
  `node tools/build-evidence-csv.js [--state file] [--city M1] [--out file]`. UTF-8 with BOM and CRLF,
  quoted fields, so Excel and LibreOffice open it directly. The builder in `assets/js/evidence-csv.js`
  is shared by the portal and the CLI, so both paths stay identical. Pilot waves are an indicative
  mapping in `assets/js/data.js` (W1: M1–M3, W2: M4–M5, W3: M6–M7, aligned to WP6 M10–M34); edit that
  single mapping if the grant's deployment schedule changes.
* The risks view has a **Print A4 heat map** button when a pilot city is selected. It builds a one-page landscape A4 sheet from the selected city's site scores and site-risk record, with the 5×5 heat map, severity counts, top risks, owner, note, last verification date and source note, then opens the browser print dialog; pop-ups must be allowed.
* The go/no-go sign-off card has a **Print decision record** button. It builds a one-page record for the selected city from the current browser state, pre-fills the portal CISO/DPO/GA fields and opens the browser print dialog; pop-ups must be allowed. Each open blocking item is listed with its short requirement, owner, reference, status and the IDs of the controls it discharges and risks it treats; non-blocking gaps carry the same IDs.
* The same card has an **Archive as signed** workflow: the signer, signature date and optional note are recorded together with an immutable snapshot of the decision, readiness, gate counts and every item's linked control and risk IDs. The **Decision history** table below lists every archived record across all cities and persists with the portal state.
* Go/no-go items are linked both ways with the compliance matrix and the risk register
  (`assets/js/data-links.js`). Each gate item names the controls it discharges and the risks it treats; the
  compliance table shows the gate items that depend on a control, and the risk table shows the gate items
  that treat a risk. Clicking an id jumps to the other view (controls and risks arrive pre-filtered, gate
  items are highlighted) and both tables state how many records are linked.
* The risk heat map is filtered per pilot city (`Pilot city` selector). The **Pilot city heat maps** grid
  renders one 5×5 map for each of M1–M7; clicking a card selects that city. Because the register is
  project-wide, every city starts from the project baseline; use the **Site score adjustment** card to set
  city-specific likelihood/impact (local crime pattern, power quality, vendor dependence, notice language).
  Site scores are stored in the browser (included in the JSON export) and do not alter the project register.
  The **Site risk record** card below it stores a risk owner, note and last verification date for each
  city; these fields are included in the brief state and shown in the city risk table and A4 heat map.
* Risk heat-map cells are clickable: selecting a cell filters the risk register table to that L×I band
  (using the selected city's site scores), and the active cell chip clears it. The KPI cards and the
  critical/high summary on each city card follow the same cell filter; with a cell selected, each city
  card shows the number of risks in that cell. City mini-maps stay selectors. Printing the risk view
  hides the interactive table and adds a dedicated **Filtered risk table** section on a new print page,
  with the active city, cell, category and search filters, static status labels and the filtered rows.
* `node tools/build-brief.js` writes two self-contained files, both bilingual (TR / EN toggle) and laid
  out for A4 print: `SAFE-PARKS-Executive-Brief.html` (9 sections, full pack, with a 5×5 risk heat
  map, segmented framework readiness bars that stay legible in greyscale, an item-level table of each
  go/no-go item's linked control and risk IDs, and a recorded-evidence table populated from the exported
  portal state) and
  `SAFE-PARKS-Executive-Brief-2p.html` (two pages: cover, status with compact per-framework readiness bars, decisions, compact pilot-city decision counts, and a city-based risk view using the site scores plus owner, note and last verification date from the state export). Open either, pick the
  language and use `Print / PDF`. Figures are computed from the data files, so regenerate after changes.
* `node tools/build-brief.js` also writes the two-page brief's decision table in paste-ready form:
  `SAFE-PARKS-Decision-Table.html` (language toggle; the decision table and the city-based go/no-go
  table sit on the same page, each with **Copy for Excel** TSV and **Copy for Word** table buttons, and
  a blocked clipboard falls back to a selected table for Ctrl+C) plus `SAFE-PARKS-Decision-Table-EN.tsv`
  and `-TR.tsv` (UTF-8 with BOM, one decision per row: Decision, Detail, Owner, Needed by, Status). The
  detail line is split out of the decision cell so every decision stays a single spreadsheet row. The
  same source also produces directly openable `SAFE-PARKS-Decision-Table.docx` (TR and EN sections) and
  `SAFE-PARKS-Decision-Table.xlsx` (TR and EN worksheets) using the dependency-free OOXML writer in
  `tools/ooxml.js`.
* `node tools/build-gono-decisions.js [--state safeparks-brief-state.json] [--city M1]` writes
  `SAFE-PARKS-GoNoGo-Decision.html`: by default one A4 page with every pilot city, its decision, open
  blocking gates, pass/readiness counts, an attestation and a consolidated signature block. City gate
  chips open the full brief at that gate's go/no-go items; printing or saving as PDF adds a compact
  gate-link index with the full target for every gate. The block
  pre-fills the CISO and DPO names and the Grant Agreement number from the portal state, and includes
  one municipality representative line per site. `--city M1` limits it to one detailed A4 page for that
  site, including gate results and every blocking or non-blocking item not passed, each with its linked
  control and risk IDs; `--out` changes the file name. Without `--state` the delivered defaults read
  NO-GO, because no gate is evaluated.
