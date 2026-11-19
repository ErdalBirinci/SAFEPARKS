# SAFE-PARKS CISO Portal — documentation

This directory is the operating and engineering documentation set for the SAFE-PARKS CISO Portal.
It describes the system as implemented, not an intended future platform. Where a capability depends on
a backend, an access proxy or a GitHub setting, that dependency is stated explicitly.

**Documentation baseline:** 2026-11-18 · **Application:** 1.1.1 · **Schema:** 2

## Start here

| If you need to… | Read |
| --- | --- |
| Understand the whole system and its boundaries | [Architecture](ARCHITECTURE.md) |
| Change data, state, exports or imports safely | [Data model](DATA-MODEL.md) |
| Perform a recurring portal task | [Workflows](WORKFLOWS.md) |
| Run the portal day to day | [Operations](OPERATIONS.md) |
| Review the security model and risks | [Security](SECURITY.md) |
| Run tests, build artifacts or publish a release | [Testing and release](TESTING-AND-RELEASE.md) |
| Handle a failure, lost data or suspected compromise | [Incident and recovery](INCIDENT-RECOVERY.md) |
| Confirm who decides what | [Roles and RACI](ROLES-RACI.md) |
| Look up a term | [Glossary](GLOSSARY.md) |
| Give an AI coding agent repository rules | [`AGENTS.md`](../AGENTS.md) |
| Read the short project introduction | [`README.md`](../README.md) |
| See version history | [`CHANGELOG.md`](../CHANGELOG.md) |

## What the system is

The portal is a static, bilingual governance and assurance application for the CISO function of Lotus
Sirius on SAFE-PARKS WP3. It runs entirely in the browser from static files:

- no application server;
- no database connection;
- no API calls;
- no third-party JavaScript, fonts or analytics;
- no build step required to open the portal;
- state stored in `localStorage` for the current origin;
- a three-user client-side access gate stored as SHA-256 digests;
- generated HTML, DOCX, XLSX, TSV and CSV release artifacts built by dependency-free Node tools.

GitHub Pages serves the static files. GitHub Actions validates the repository; it does not host the
application runtime.

## Canonical project facts

| Fact | Value |
| --- | --- |
| Project | SAFE-PARKS |
| Work package | WP3 — Cybersecurity, Secure Telemetry & NATO EFDI Connector |
| WP3 lead | Lotus Sirius |
| Consortium | 12 partners |
| Pilot cities | 7 |
| Total budget | €4,720,000 |
| WP3 budget | €285,000 |
| WP3 personnel | €168,000 (19 PM) |
| Compliance controls | 49 across 7 frameworks |
| Risks | 22 |
| Deliverables | 12 |
| First-90-days actions | 19 |
| Pilot go/no-go gates | 8 gates, 34 items |
| Governance decisions | 6 |
| Policies and charter | 10 documents |
| KPIs | 14 |

These are the values used by the source data and the generated release artifacts. Facts marked ⚠ in the
portal remain subject to confirmation against the signed Grant Agreement.

## Non-negotiable boundaries

1. **The repository is public.** The password gate does not make the source, static data or generated
   artifacts confidential. Do not put personal data, credentials or confidential material in it.
2. **The session and audit trail are local.** `sessionStorage` and `localStorage` are controlled by the
   browser user. They are not a server-side identity or evidence system.
3. **There is one canonical state file.** `safeparks-brief-state.json` is the reviewed baseline for the
   generated artifacts. Browser state is working state until exported and reviewed.
4. **Generated files are not edited by hand.** Change data or state and rebuild.
5. **Release checks are required.** `npm test`, `npm run check`, `npm run docs:check` and the artifact
   gate must pass before a release. The repository's `main` branch is protected by the
   `brief-state-gate` check.
6. **No secrets in the repository.** This includes passwords, tokens, private keys and production data.

## Environment map

| Environment | Purpose | Source of truth | Access |
| --- | --- | --- | --- |
| Local static server | Development and smoke testing | Working tree + browser `localStorage` | Local machine |
| GitHub repository | Source, review and history | `main` branch and tags | GitHub permissions |
| GitHub Pages | Public web delivery | Files on `main` | Public internet |
| CI runner | Validation only | Checked-out commit | GitHub Actions |
| Operator backup | Recovery | Downloaded full-state JSON | Operator-controlled storage |

## Documentation maintenance

- Update the affected document in the same change as the behaviour it describes.
- Update `CHANGELOG.md` for user-visible changes.
- Run `npm run docs:check` before committing documentation changes.
- Internal links are checked by `tools/check-docs.js`; external URLs are not fetched by that check.
- If a capability is removed or becomes unavailable, mark it as removed rather than leaving an
  optimistic description in place.
- The generated artifacts and `safeparks-brief-state.json` are part of the release surface and must be
  reviewed together.

## Related repository policies

- [`CONTRIBUTING.md`](../CONTRIBUTING.md) — change and pull-request expectations
- [`SECURITY.md`](../SECURITY.md) — public vulnerability-reporting policy
- [`CODEOWNERS`](../.github/CODEOWNERS) — review ownership
- [`LICENSE`](../LICENSE) — rights notice
