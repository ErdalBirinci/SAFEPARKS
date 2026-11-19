# System architecture

## 1. Purpose and scope

This document explains how the SAFE-PARKS CISO Portal is assembled, how a request becomes a rendered
view, where state lives, how release artifacts are produced and which parts are deliberately absent.

It covers:

- the browser application;
- the static hosting model;
- the client-side access gate;
- the state and export model;
- the Node build and validation tools;
- the GitHub Actions and Pages delivery path;
- the security boundaries and extension points.

It does not describe a server-side application because none exists in this repository.

## 2. Architectural summary

```text
┌──────────────────────────────────────────────────────────────────────┐
│ GitHub repository (public)                                           │
│  index.html · assets/ · tools/ · tests/ · docs/ · workflows/         │
│  safeparks-brief-state.json · generated SAFE-PARKS-* artifacts       │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ push to main / Pages build
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│ GitHub Pages (static HTTPS)                                          │
│  HTML + CSS + JavaScript + SVG/PNG/ICO + generated documents          │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ browser downloads files
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Operator browser                                                     │
│  auth.js gate → app.js router → view modules → DOM                    │
│  localStorage: safeparks-ciso-v1                                      │
│  sessionStorage: safeparks-auth-v1                                    │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ explicit export
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Operator-controlled backup / review                                  │
│  full state JSON · brief state JSON · audit CSV · evidence CSV · ICS │
└──────────────────────────────────────────────────────────────────────┘

Build workstation / GitHub Actions
  source data + canonical state ──Node tools──► release artifacts ──commit──► repository
```

The important architectural property is that the **runtime has no server-side state**. Every shared
record is either committed source content or an operator-exported file. The browser is a local working
copy, not a multi-user database.

## 3. Design principles

1. **Static by default.** The application must work when opened from a static server without a build
   step, package manager or API.
2. **No hidden network dependency.** There are no third-party scripts, fonts, images, analytics or
   remote API calls.
3. **Explicit state.** Editable state is a JSON document with stable keys and versioning.
4. **Evidence over decoration.** Computed posture and generated reports are derived from the same source
   data; they are not separate manually maintained copies.
5. **Reviewable releases.** Generated artifacts and the state that produced them are committed and
   checked by CI.
6. **Honest boundaries.** The portal states that the client-side gate, local audit trail and local
   storage are not a security or multi-user platform.

## 4. Runtime components

| Component | File(s) | Responsibility |
| --- | --- | --- |
| Shell | `index.html` | Access gate markup, sidebar, topbar, mount point, script order, favicon/logo links |
| Design system | `assets/css/style.css` | Dark/light themes, layout, components, print rules, responsive rules |
| Access gate | `assets/js/auth.js` | SHA-256 passphrase check, attempt lockout, tab session, sign-out |
| Turkish dictionary | `assets/js/i18n.js` | Turkish UI strings |
| English dictionary | `assets/js/i18n-en.js` | English UI strings |
| Source data | `assets/js/data*.js` | Facts, compliance, risks, privacy, architecture, incidents, gates, decisions, policies |
| Management helpers | `assets/js/management.js` | State normalisation, validation, audit, snapshots, health, CSV/ICS |
| Evidence CSV | `assets/js/evidence-csv.js` | Browser-side evidence ledger builder |
| View modules | `assets/js/app-views*.js` | Route-specific rendering and interactions |
| Core application | `assets/js/app.js` | State, persistence, i18n binding, router, dashboard, exports, global events |
| Node tools | `tools/*.js` | Data validation, state hashing, artifact generation, CI gate, static server |
| Tests | `tests/*.test.js` | Management and state-hash unit tests |

`window.SP` is the shared namespace. Data files populate it; view modules register `SP.views.<route>`;
`app.js` owns the state, renderer and global event delegation.

## 5. Script load order

The order is part of the architecture because scripts are classic browser scripts, not ES modules.

```text
index.html
  → auth.js            (gate and session)
  → i18n.js
  → i18n-en.js
  → data.js
  → data-gov.js
  → data-decisions.js
  → data-comp.js
  → data-comp2.js
  → data-priv.js
  → data-arch.js
  → data-risk.js
  → data-ops.js
  → data-gono.js
  → data-links.js
  → management.js
  → evidence-csv.js
  → docs.js
  → docs2.js
  → app-views.js
  → app-views2.js
  → app-views3.js
  → app-views4.js
  → app.js
```

Consequences:

- A missing data file can make downstream views fail because the shared `SP` object is incomplete.
- A missing `management.js` disables validation, snapshots, health, audit CSV and task ICS.
- `app.js` must load last; it starts the router after the view registry is complete.
- New scripts must be added to `index.html` with the same cache version as the release.
- New views must register before `app.js` runs.

## 6. Browser lifecycle

```text
1. HTML parser reads the <head>.
2. Inline head script checks sessionStorage("safeparks-auth-v1").
3. If a valid session object is present, html.auth-locked is removed immediately.
4. CSS and scripts load. The shell is hidden while auth-locked is present.
5. auth.js reads/validates the session and publishes window.SP_AUTH.
6. Data and view scripts populate window.SP.
7. app.js load() merges localStorage("safeparks-ciso-v1") into its default state.
8. SP.manage.ensure() fills new collections so old states remain usable.
9. app.js binds delegated click/change/input/focusout/keydown handlers.
10. render() parses location.hash, chooses a view and injects HTML into #view.
11. applyChrome() refreshes navigation, language, theme, GA label and document title.
12. A 60-second timer checks the last pointer/keyboard activity for the 30-minute idle sign-out.
```

The shell is hidden, not removed, when locked. This protects against accidental display but is not a
confidentiality control: the underlying static files remain public.

## 7. Routing model

The hash router uses `location.hash`. Unknown routes fall back to the dashboard. The second path
segment is passed to the view for detail screens such as a policy document.

| Route | View module | Main content |
| --- | --- | --- |
| `dashboard` | `app.js` | Posture, framework readiness, attention cards, upcoming deliverables, heat map |
| `project` | `app.js` | Partners, budget, WP structure, reconciliation |
| `governance` | `app.js` | Roles, RACI, decision rights, decision status |
| `mandate` | `app.js` | CISO charter, objectives, risk appetite, 90-day plan |
| `reporting` | `app-views2.js` | KPIs, monthly/quarterly packs, reporting ritual, evidence scope |
| `compliance` | `app-views.js` | Compliance matrix, filters, evidence, status edits |
| `evidence` | `app-views.js` | Missing-evidence work queue |
| `privacy` | `app-views.js` | Data flow, retention, ROPA, TOMs, DPIA |
| `architecture` | `app-views.js` | Trust zones, cryptography, PQC, ports, EFDI, resilience |
| `risks` | `app-views.js` | Risk register, heat map, city risk overrides |
| `assurance` | `app-views2.js` | Pentests, audits, certification, SDLC, training |
| `incidents` | `app-views2.js` | Severity, notification duties, timeline, playbooks |
| `gono` | `app-views3.js` | Pilot gates, city checklist, decision record |
| `wp3` | `app-views2.js` | WP3 budget, tasks, deliverables, interfaces |
| `deliverables` | `app-views2.js` | Deliverable register and status |
| `docs` | `app-views2.js` | Policy library and document reading |
| `management` | `app-views4.js` | Tasks, decisions, risk acceptance, KPI/budget actuals, metadata, snapshots, audit |
| `settings` | `app-views2.js` | Identity fields, language/theme, import/export/reset |

`docs` accepts an optional second segment, for example `#docs/POL-01`, to open a document.

## 8. State lifecycle

```text
defaults
  → load(): merge saved state from localStorage
  → ensure(): add missing collections and schema version
  → user interaction
  → audit(): append local audit entry
  → save(): update timestamps, serialize localStorage
  → render(): recompute visible posture and controls
  → export: full state / brief state / CSV / ICS
  → review and optional import into another browser
```

State fields and validation rules are in [DATA-MODEL.md](DATA-MODEL.md).

Key points:

- `localStorage` is the runtime source of edits for one origin and browser profile.
- `sessionStorage` is the access-session source and disappears when the tab closes.
- `state.ui` stores transient filters and is not persisted.
- `state.route` is derived from the hash and is not persisted.
- `state.data.meta` records the schema and the last save author/time inside the data object.
- The canonical generated-artifact input is `safeparks-brief-state.json`, not the raw browser store.

## 9. Access-gate architecture

```text
Password input
  → WebCrypto SHA-256
  → compare with three stored digests
  → success: sessionStorage JSON session + window.SP_AUTH
  → failure: attempt counter in localStorage; 5 failures → 60 s lock
```

Properties:

- Passphrases are never stored; only SHA-256 digests are in `auth.js`.
- WebCrypto requires a secure context: HTTPS or localhost.
- The session is tab-scoped and has a 12-hour maximum age.
- The app signs out after 30 minutes without pointer or keyboard activity.
- Session labels are `Yetkili 1`, `Yetkili 2`, `Yetkili 3`; all currently have the `editor` role.
- A direct request to any static asset bypasses the UI gate. This is the central limitation of a static
  site and is documented in [SECURITY.md](SECURITY.md).

## 10. Content Security Policy

`index.html` sets a meta CSP:

```text
default-src 'self' blob:
script-src 'self' 'unsafe-inline'
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob:
font-src 'self'
connect-src 'self'
object-src 'none'
base-uri 'none'
form-action 'self'
```

The app needs inline bootstrap and inline styles in the current static design, so `'unsafe-inline'` is
present. Because this is a meta tag rather than a response header, some directives have no effect; the
enforcement limits and the hosting options for stronger CSP are in [SECURITY.md](SECURITY.md).

## 11. Build and artifact pipeline

```text
assets/js/data*.js
        +
safeparks-brief-state.json (optional but canonical for releases)
        │
        ├── tools/build-brief.js ─────────────► two executive briefs
        │                                      decision table HTML/DOCX/XLSX/TSV
        ├── tools/build-gono-decisions.js ────► consolidated go/no-go decision record
        └── tools/build-evidence-csv.js ──────► evidence ledger CSV
                    │
                    ▼
          tools/state-hash.js + check-brief-state.js
                    │
                    ▼
             tools/ci-gate.js
```

The build tools are dependency-free CommonJS and load data files in Node by evaluating the browser data
scripts with a `global.window` shim. They do not query a server.

`tools/build-brief-from-state.js` is the one-command wrapper: it can download a state over HTTP(S) or use
a local state, backs up the previous canonical state to `safeparks-brief-state.previous.json`, compares
the changes and runs the three builders.

## 12. Hosting and delivery

| Layer | Provider | Configuration |
| --- | --- | --- |
| Source | GitHub | Public repository `ErdalBirinci/SAFEPARKS` |
| CI | GitHub Actions | `brief-state-gate` workflow, Node 20, read-only contents |
| Hosting | GitHub Pages | Legacy build from `main`, repository root, HTTPS enforced |
| Protection | GitHub branch protection | Required check `brief-state-gate`; force-push and deletion disabled |
| Cache control | GitHub Pages defaults | Assets are referenced with `?v=` query strings at release boundaries |

The Pages build is a hosting action, not a repository workflow. A successful Action does not itself
publish; the Pages build must be checked separately.

## 13. Security boundaries

| Boundary | Inside | Outside |
| --- | --- | --- |
| Static origin | HTML, data, generated artifacts | Server-side access control |
| Browser storage | One origin's localStorage/sessionStorage | Cross-device, multi-user state |
| Client gate | Casual access control | Confidentiality, identity assurance |
| Local audit | User-visible change history | Tamper-evident server audit |
| CI | Source/artifact consistency | Production authorization |
| GitHub | Repository permissions | Application user permissions |

The correct statement is: **the portal is a public static working instrument with a local-first
management layer**. It is not an access-controlled case-management system.

## 14. Failure modes and architecture responses

| Failure | User-visible effect | Recovery |
| --- | --- | --- |
| One data script fails to load | Route may render incomplete or fail | Check network/console, restore file, reload |
| `management.js` missing | Management and validation helpers unavailable | Restore file and script order |
| Corrupt `localStorage` JSON | App starts with defaults | Restore full-state export |
| Browser storage blocked | Edits cannot persist; toast appears | Use a normal browser profile with storage enabled |
| WebCrypto unavailable | Sign-in shows secure-context error | Use HTTPS or localhost |
| Stale generated brief | CI gate fails | Rebuild and commit artifacts |
| GitHub Pages build fails | Live URL remains on previous build | Inspect Pages build, fix, rebuild |
| User clears site data | Local edits and snapshots disappear | Import last full-state export |

## 15. Extension path

A future multi-user version would need at least:

1. an authenticated backend with server-side roles;
2. a database with row-level ownership or tenant scoping;
3. server-authoritative audit records;
4. authenticated APIs for state changes;
5. a migration/export path from existing local JSON;
6. a server-side access proxy or authenticated hosting layer;
7. CSRF/origin protections and rate limits;
8. backup, retention and restore operations.

Until those exist, do not describe the portal as a system of record for shared compliance evidence.

## 16. Related documents

- [Data model](DATA-MODEL.md)
- [Workflows](WORKFLOWS.md)
- [Security](SECURITY.md)
- [Operations](OPERATIONS.md)
- [Testing and release](TESTING-AND-RELEASE.md)
- [Incident and recovery](INCIDENT-RECOVERY.md)
