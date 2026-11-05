# Changelog

All notable changes to the SAFE-PARKS CISO portal are recorded here. Versions use
`MAJOR.MINOR.PATCH`; the generated briefs carry the same release state.

## 1.1.0 — 2026-11-05

### Added

- Management console with tasks, decision metadata, risk acceptance, KPI and budget actuals,
  document control, local snapshots, data-health summary and an audit trail.
- Named local sessions for the three authorised users, explicit sign-out and a 30-minute idle timeout.
- JSON import validation, automatic pre-import/pre-reset snapshots, audit CSV and task-calendar ICS export.
- Canonical `safeparks-brief-state.json`, a dependency-free data integrity check, Node unit tests and a
  stricter CI gate that includes the evidence ledger.
- Repository governance: changelog, security policy, contributing guide, code owners, issue/PR templates
  and an operator guide.
- Content Security Policy and release version alignment across `APP_VERSION`, CSS and artifacts.

### Changed

- WP3 decision D2 now states the correct personnel line (€168,000 within the €285,000 WP3 total).
- Report and document views read saved KPI and document-control values instead of fixed figures.
- Risk view shows the recorded acceptance owner and expiry date.
- The public-repository classification is stated explicitly; the password gate is documented as a
  usability control, not a confidentiality boundary.

### Security

- Passwords remain SHA-256 digests only; plaintext passphrases are not stored in the repository.
- Five failed attempts trigger a 60-second client-side lockout.
- All generated files remain static; a server-side proxy or backend is still required for real access
  control, shared multi-user editing and server-side audit records.
