# Data model

## 1. Two data surfaces

The portal has two distinct JSON surfaces:

| Surface | Location | Purpose | Authoritative for |
| --- | --- | --- | --- |
| Runtime browser state | `localStorage["safeparks-ciso-v1"]` | Edits in one browser profile | Working copy only |
| Canonical brief state | `safeparks-brief-state.json` | Reviewed baseline for generated artifacts | Release artifacts and state hash |

A third, session-only surface is `sessionStorage["safeparks-auth-v1"]`; it contains the access session,
not project data.

The runtime state is exported as `safeparks-ciso-state.json`. The compact state is exported as
`safeparks-brief-state.json`. They are not interchangeable in every tool: the full export preserves
management data; the compact export preserves only what the briefs consume.

## 2. Runtime state envelope

```json
{
  "schemaVersion": 2,
  "appVersion": "1.1.1",
  "updatedAt": "2026-11-06T00:00:00.000Z",
  "updatedBy": "Yetkili 1",
  "lang": "tr",
  "theme": "dark",
  "data": {},
  "settings": {},
  "t": 1760000000000
}
```

| Field | Type | Persisted | Meaning |
| --- | --- | --- | --- |
| `schemaVersion` | number | yes | Runtime state schema; currently `2` |
| `appVersion` | string | yes | Application version that last saved the state |
| `updatedAt` | ISO string | yes | Last save time |
| `updatedBy` | string | yes | Session label of the last saver |
| `lang` | `tr` / `en` | yes | UI language |
| `theme` | `dark` / `light` | yes | Theme |
| `data` | object | yes | Project and management data |
| `settings` | object | yes | CISO, DPO and Grant Agreement display fields |
| `t` | number | yes | Save timestamp in milliseconds, used as a lightweight freshness marker |

`state.route` and `state.ui` exist in memory but are not written by `save()`.

## 3. Data object

```json
{
  "comp": {},
  "risks": {},
  "deliv": {},
  "checks": {},
  "notes": {},
  "gono": {},
  "gonoArchive": [],
  "decisions": {},
  "cityRisks": {},
  "cityRiskMeta": {},
  "decisionMeta": {},
  "riskAcceptance": {},
  "kpi": {},
  "budgetActual": {},
  "docMeta": {},
  "tasks": [],
  "audit": [],
  "snapshots": [],
  "meta": {}
}
```

`SP.manage.ensure(data)` creates missing collections with these defaults. It does not delete unknown
keys. `SP.manage.validate(raw)` deep-clones and normalises a candidate and checks the supported status
enums and task/date shapes.

## 4. Field reference

### 4.1 `comp` — compliance status overrides

- Type: object `{ [controlId]: status }`.
- Status: `ready`, `partial`, `gap`, `na`.
- Default: the status in the source compliance catalogue.
- Used by: compliance matrix, dashboard, briefs, evidence CSV.
- `tom.*` keys are excluded from the compact brief state; `comp` still stores TOM statuses for the
  portal.

### 4.2 `risks` — risk status overrides

- Type: object `{ [riskId]: status }`.
- Status: `open`, `treating`, `accepted`, `closed`.
- Risk acceptance writes `accepted` and removal resets an accepted risk to `treating`.

### 4.3 `deliv` — deliverable status overrides

- Type: object `{ [deliverableId]: status }`.
- Status: `planned`, `in-progress`, `done`.

### 4.4 `checks` — first-90-days action ticks

- Type: object `{ [actionId]: boolean }`.
- The IDs come from `SP.plan90[].actions[].id`.

### 4.5 `notes` — evidence key/value store

Evidence keys are namespaced strings:

```text
comp|<controlId>|ref
comp|<controlId>|note
comp|<controlId>|verifiedOn
comp|<controlId>|verifiedBy
```

- `ref`: evidence file/reference text.
- `note`: evidence summary.
- `verifiedOn`: date in `YYYY-MM-DD` format.
- `verifiedBy`: verifier name/role.

The brief export keeps only keys beginning `comp|`. The full export keeps all notes.

### 4.6 `gono` — pilot gate results

- Type: object `{ ["<cityId>|<itemId>"]: status }`.
- Status: `open`, `pass`, `partial`, `fail`, `na`.
- `cityId` is a pilot municipality ID such as `M1`.
- `itemId` is a gate item ID such as `G1-1`.
- Default: `open`.

### 4.7 `gonoArchive` — archived go/no-go records

- Type: array.
- Default: `[]`.
- Included in the compact brief state and the canonical state hash.
- The current portal does not provide a first-class editing screen for arbitrary archive entries; treat
  the array as a reserved, validated container and do not invent entry fields without a schema update.

### 4.8 `decisions` — governance decision status

- Type: object `{ [decisionId]: status }`.
- Status: `pending`, `approved`, `rejected`.
- Default: `pending` when a decision ID is absent.
- The management console displays all six source decisions and writes explicitly selected values.

### 4.9 `decisionMeta` — decision evidence

```json
{
  "D1": {
    "approver": "CEO",
    "date": "2026-11-06",
    "rationale": "Charter signed at steering committee"
  }
}
```

All fields are strings. The management console saves them independently of the status enum.

### 4.10 `riskAcceptance` — residual-risk record

```json
{
  "R1": {
    "acceptedBy": "CEO",
    "date": "2026-11-06",
    "expires": "2027-05-06",
    "residual": "6",
    "rationale": "Compensating controls verified"
  }
}
```

- Dates should be `YYYY-MM-DD`.
- `residual` is stored as text in the UI.
- `expires` drives the expired-acceptance health count.
- Saving an acceptance sets `risks[riskId] = "accepted"`.
- Removing it sets the risk back to `treating` only if it was `accepted`.

### 4.11 `kpi` — KPI actuals

- Type: object `{ [kpiId]: string }`.
- Empty values are deleted on save.
- Reporting uses a saved value when present; otherwise it falls back to a computed display value.

### 4.12 `budgetActual` — WP3 actuals

- Type: object with keys `b0` through `b4` mapped to numbers.
- The index corresponds to `SP.wp3Budget`.
- Empty values are deleted on save.
- The UI computes variance as actual minus planned.

### 4.13 `docMeta` — document control

```json
{
  "POL-01": {
    "version": "1.1",
    "approval": "CEO",
    "review": "2027-01-31"
  }
}
```

All values are strings. `review` is expected to be a date input value in `YYYY-MM-DD` format.

### 4.14 `tasks` — management tasks

```json
[
  {
    "id": "task-...",
    "title": "Review DPIA evidence",
    "owner": "CISO",
    "due": "2026-11-20",
    "note": "Check the signed pack",
    "status": "open",
    "createdAt": "2026-11-06T00:00:00.000Z",
    "createdBy": "Yetkili 1"
  }
]
```

Status: `open`, `in-progress`, `blocked`, `done`.
Tasks with a due date earlier than today and a status other than `done` count as overdue.

### 4.15 `audit` — local audit log

```json
[
  {
    "id": "audit-...",
    "at": "2026-11-06T00:00:00.000Z",
    "user": "Yetkili 1",
    "userId": "u1",
    "role": "editor",
    "action": "status.change",
    "detail": { "kind": "comp", "id": "G1", "before": "partial", "after": "ready" }
  }
]
```

- Newest entries are appended.
- The log is capped at `MAX_AUDIT = 2000`; oldest entries are discarded.
- It is local, editable and not cryptographically chained.
- Audit CSV is an export, not a server record.

Common actions include `status.change`, `risk.cityscore`, `risk.citymeta`, `action.toggle`,
`evidence.save`, `settings.change`, `state.import`, `state.reset`, `task.create`, `task.delete`,
`task.status`, `decision.status`, `decision.metadata`, `risk.accept`, `kpi.actuals`, `budget.actuals`,
`document.control`, `snapshot.create`, `snapshot.restore`, `snapshot.delete` and `state.export` where
applicable.

### 4.16 `snapshots` — local restore points

- Maximum `MAX_SNAPSHOTS = 8`; oldest entries are discarded.
- A snapshot contains a deep copy of data with `snapshots` and `audit` removed.
- Restoring preserves the current audit and snapshot list, then replaces the data.
- Snapshots are local until the full state is exported.

### 4.17 `meta` — data metadata

`meta.schemaVersion`, `meta.updatedAt` and `meta.updatedBy` are written on save. The top-level runtime
envelope also carries these values; `meta` makes them visible inside exported data.

## 5. Settings

```json
{
  "ciso": "",
  "dpo": "",
  "ga": ""
}
```

- `ciso`: display name for the CISO.
- `dpo`: display name for the DPO.
- `ga`: Grant Agreement number shown in the topbar and signed records.
- These are not identities or authentication claims.

## 6. Compact brief state

`safeparks-brief-state.json` has this shape:

```json
{
  "kind": "safeparks-brief-state",
  "version": 2,
  "schemaVersion": 2,
  "appVersion": "1.1.1",
  "exportedAt": "2026-11-06T00:00:00.000Z",
  "project": "SAFE-PARKS",
  "lang": "tr",
  "settings": { "ciso": "", "dpo": "", "ga": "" },
  "comp": {},
  "risks": {},
  "deliv": {},
  "checks": {},
  "gono": {},
  "decisions": {},
  "cityRisks": {},
  "cityRiskMeta": {},
  "gonoArchive": [],
  "notes": {}
}
```

It deliberately omits:

- tasks;
- audit;
- snapshots;
- `decisionMeta`;
- `riskAcceptance`;
- `kpi`;
- `budgetActual`;
- `docMeta`.

Those management fields are part of the full-state backup, not the generated briefs. If they need to
drive a brief, the schema and builders must be extended explicitly.

## 7. State hash

`tools/state-hash.js` computes a canonical SHA-256 over exactly these fields:

```text
comp, risks, deliv, checks, notes, gono, gonoArchive, decisions, cityRisks, cityRiskMeta
```

Properties:

- object keys are sorted recursively;
- array order is preserved;
- the export timestamp and formatting are excluded;
- missing or scalar values are normalised to `{}`; arrays are preserved as arrays when present;
- the management fields listed above are **not** hashed.

This is why a change to a task, KPI actual or audit entry does not invalidate a generated brief. A change
to a compliance status, evidence note, gate result or decision does.

## 8. Import semantics

`SP.manage.validate(raw)` accepts:

1. a full export with `raw.state.data`;
2. a compact brief state with `kind: "safeparks-brief-state"`;
3. a plain object with a `data` object.

Behaviour:

- invalid input is rejected with a list of errors;
- a pre-import snapshot is created;
- existing audit and snapshots are preserved when the imported payload does not contain them;
- imported settings/language/theme are applied if present;
- the import itself is audited and saved.

The importer is a convenience, not a security boundary. A malicious local file can still contain
untrusted text; the UI escapes rendered strings but does not guarantee that imported prose is accurate.

## 9. Reset semantics

Reset creates a `before reset` snapshot, keeps the current audit and snapshots, clears editable data,
adds a `state.reset` audit entry, saves and rerenders. It does not clear the access session or the
attempt counter.

## 10. Storage limits and retention

| Store | Key | Retention |
| --- | --- | --- |
| Runtime data | `safeparks-ciso-v1` | Until cleared, reset or evicted by the browser |
| Session | `safeparks-auth-v1` | Tab session; maximum age 12 hours |
| Attempts | `safeparks-auth-attempts-v1` | 5 failures trigger 60 s lock; successful sign-in clears it |
| Snapshots | inside runtime data | 8 most recent |
| Audit | inside runtime data | 2000 most recent entries |
| Canonical state | Git file | Repository history |
| Release artifacts | Git files | Repository history |

Browser storage is subject to origin quotas and can be evicted by browser policy or user action. It is
not a durable evidence archive; export full state to operator-controlled storage.

## 11. Data quality rules

`npm run check` enforces the source-data contract: expected counts per collection, unique IDs, bilingual
fields, valid statuses, 1–5 scoring and gate links to known risk and control IDs. The enumerated
checklist is in [TESTING-AND-RELEASE.md](TESTING-AND-RELEASE.md#4-data-integrity-checks).

The management validator additionally checks the supported runtime status enums, task titles, task
status and `YYYY-MM-DD` dates for tasks and risk acceptance.
