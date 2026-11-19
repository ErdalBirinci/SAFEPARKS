# AGENTS.md — repository rules for coding agents

## 1. Project

SAFE-PARKS CISO Portal: a static, bilingual (TR/EN) governance, compliance and assurance application
for Lotus Sirius on SAFE-PARKS WP3. It runs from GitHub Pages with no server, database, bundler or
runtime npm dependency.

Read these first:

- [`README.md`](README.md) — user-facing feature summary
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — runtime and boundaries
- [`docs/DATA-MODEL.md`](docs/DATA-MODEL.md) — state and canonical data
- [`docs/OPERATIONS.md`](docs/OPERATIONS.md) — operating rules
- [`docs/TESTING-AND-RELEASE.md`](docs/TESTING-AND-RELEASE.md) — checks and release

## 2. Non-negotiable constraints

1. **Keep the runtime static and dependency-free.** Do not add a framework, bundler, runtime package,
   remote API, third-party script, font, analytics or service worker without explicit approval.
2. **No secrets or personal data.** Never add plaintext passwords, tokens, private keys, personal data
   or confidential material. The repository and Pages site are public.
3. **Do not edit generated artifacts by hand.** Edit source data or the canonical state and rebuild.
4. **Keep the required CI context name `brief-state-gate`.** Branch protection depends on it.
5. **Do not change authentication semantics casually.** The gate is convenience-only; do not describe
   it as access control or confidentiality.
6. **Do not weaken tests or checks** to make a change pass. Fix the cause.
7. **Do not commit, tag, push, publish or rotate credentials unless the user explicitly asks.**
8. **Do not add a backend claim.** Multi-user state, server-side roles and tamper-evident audit are
   explicitly out of scope until implemented.

## 3. Commands

```bash
npm test                 # unit tests
npm run check            # source-data integrity
npm run docs:check       # docs and internal links
npm run build:artifacts  # regenerate release artifacts
npm run gate             # tracked state + current briefs
npm run live:check       # public Pages smoke check
node tools/serve.js 4173 # local preview
```

`npm run gate` expects files to be tracked. Run `git add` first when checking a new artifact set.

Static syntax check:

```bash
for f in assets/js/*.js tools/*.js tests/*.js; do node --check "$f"; done
```

## 4. Architecture rules

- Browser scripts are classic scripts loaded in a strict order from `index.html`.
- All shared globals are on `window.SP`; view modules register `SP.views.<route>`.
- `app.js` loads last and owns routing, state merge, save and global event delegation.
- `assets/js/management.js` is shared by the browser and Node tests; keep it dependency-free and
  environment-neutral.
- Data files under `assets/js/data*.js` populate `SP`; stable IDs are part of the interface.
- Hash routes: `#route` or `#route/id`. Unknown routes fall back to `dashboard`.
- `localStorage` key: `safeparks-ciso-v1`. Session key: `safeparks-auth-v1`.
- UI state (`state.ui`, `state.route`) is not persisted. Do not start persisting it without a migration.

## 5. Content rules

- Bilingual values use `{ en: "…", tr: "…" }` and render through `L()`.
- Update both languages in the same change.
- Keep IDs stable across source, state, links, gates and generated briefs.
- Do not silently change project facts. If a figure is indicative, keep the existing ⚠ treatment.
- When adding a framework, control, risk, gate, decision, KPI or document, update the data check counts
  and any dependent links.
- Escape untrusted text before inserting it into HTML.

## 6. State rules

- `state.schemaVersion` is `2`; new state needs an explicit migration/ensure path.
- `SP.manage.ensure()` only adds defaults; it must not delete unknown keys.
- Snapshot limit: 8. Audit limit: 2000.
- Full export: `safeparks-ciso-state.json`. Compact release state: `safeparks-brief-state.json`.
- The compact state excludes management fields; do not assume tasks, audit, KPI actuals, budget
  actuals, document metadata, decision metadata or risk acceptance are in it.
- State hash covers `comp, risks, deliv, checks, notes, gono, gonoArchive, decisions, cityRisks,
  cityRiskMeta` only. Changing the hash contract requires updating tests, brief metadata and docs.
- Import validation is structural, not a trust boundary.

## 7. Generated files

Never hand-edit:

- `SAFE-PARKS-Executive-Brief.html`
- `SAFE-PARKS-Executive-Brief-2p.html`
- `SAFE-PARKS-GoNoGo-Decision.html`
- `SAFE-PARKS-Decision-Table.html`
- `SAFE-PARKS-Decision-Table.docx`
- `SAFE-PARKS-Decision-Table.xlsx`
- `SAFE-PARKS-Decision-Table-EN.tsv`
- `SAFE-PARKS-Decision-Table-TR.tsv`
- `SAFE-PARKS-Evidence-Ledger.csv`

`SAFE-PARKS-GoNoGo-Decision.pdf` is legacy/manual and is not part of the current build/gate.

## 8. Security rules

- Do not build string HTML from imported data without `esc()`.
- Do not add external origins to CSP without a documented reason.
- Do not weaken the CSP or add `unsafe-eval`.
- Do not store secrets in `localStorage`, `sessionStorage`, source or generated artifacts.
- Do not put passphrases in commits, issues, PRs, screenshots or chat.
- When changing auth, verify both wrong-passphrase and successful-session paths, or state clearly that
  the correct-passphrase path was not tested.
- Treat CSV formula injection as a known residual risk until it is fixed deliberately.

## 9. Documentation rules

- Update the affected docs in the same change as the behaviour.
- Add new documents to [`docs/README.md`](docs/README.md).
- Add internal links only to files that exist; `npm run docs:check` validates them.
- Keep version references aligned when a release occurs.
- Do not claim a check passed if it was not run, and do not describe visual checks that were not viewed.

## 10. Release rules

- Update `CHANGELOG.md`.
- Align `package.json`, `APP_VERSION`, asset query strings, `safeparks-brief-state.json` and the tag.
- Rebuild artifacts from the reviewed canonical state.
- Run all checks, then inspect the generated diff.
- After Pages reports `built`, verify the live URL and required assets.
- Prefer a forward fix or `git revert`; never edit the deployed files directly.
- Branch protection: required check `brief-state-gate`; force-push and deletion disabled.

## 11. Definition of done

A change is done when:

- the requested behaviour works;
- the smallest relevant checks pass;
- data/docs/state are consistent;
- no secret or personal data was introduced;
- generated artifacts are current if applicable;
- the final response states what was checked and what was not.
