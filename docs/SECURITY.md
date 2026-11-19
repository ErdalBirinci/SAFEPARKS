# Security model

This document is the detailed security reference. The public reporting policy is [`SECURITY.md`](../SECURITY.md).

## 1. Security objectives

1. Do not leak secrets or personal data through the public repository.
2. Keep the static application free of remote code, trackers and unnecessary supply-chain surface.
3. Make the limits of the client-side gate unmistakable.
4. Preserve the integrity of the canonical release state and generated artifacts.
5. Give operators a defensible, reviewable local workflow even when a backend is unavailable.

## 2. Assets

| Asset | Sensitivity | Where it lives |
| --- | --- | --- |
| Source code and data | Public | GitHub repository |
| Generated briefs and reports | Public | GitHub Pages / repository |
| Passphrase digests | Public by design | `assets/js/auth.js` |
| Plaintext passphrases | Secret | Operator memory/secure store; never repository |
| Browser working state | Internal working copy | `localStorage` on operator device |
| Session token | Low-assurance tab state | `sessionStorage` |
| Audit trail | Internal/local | `localStorage` and explicit exports |
| Full-state backups | Internal | Operator-controlled storage |
| GitHub account/tokens | High | GitHub account and local credential store |
| CI secrets | None currently required | N/A |

## 3. Data classification

The repository and Pages site are **public**. Do not place the following in source, state, commits,
generated artifacts, issues, pull requests or screenshots:

- personal data;
- confidential consortium material;
- credentials or private keys;
- incident details that identify a person;
- unpublished legal advice;
- contact details that are not already approved for publication.

The CISO portal contains project governance and assurance material. A public repository is not a
confidential channel.

## 4. Trust boundaries and threats

```text
Internet visitor
   │ can fetch every static file
   ▼
GitHub Pages ── public static content
   │
   ▼
Browser ── can modify JS, DOM, sessionStorage and localStorage
   │
   ├── local state (not trusted by any server)
   └── exported files (must be reviewed by a human)
```

### 4.1 Spoofing

- The password gate is not an identity provider.
- A visitor can forge `sessionStorage` and call the application without the gate.
- Anyone can fetch the HTML and data by direct URL.
- There is no server-side session to steal, but there is also no server-side identity to trust.

### 4.2 Tampering

- Local state, audit entries and snapshots can be edited in browser developer tools.
- Imported JSON can contain arbitrary text.
- A reviewer must treat local audit output as a working record, not tamper-evident evidence.
- The canonical state is protected only by Git review and branch protection, not by a signature.

### 4.3 Repudiation

- Client-side audit labels are self-asserted.
- There is no cryptographic signature or trusted timestamp.
- A user can clear or modify their local audit log.
- Use Git commits, signed releases and external review records for stronger attribution.

### 4.4 Information disclosure

- All static files are public.
- The UI gate does not hide source, data or generated PDFs.
- Browser localStorage may contain working notes.
- Exported full state can contain more than the compact brief state.
- A server-side access proxy or hosting-layer authentication is required for confidentiality.

### 4.5 Denial of service

- A browser can block local storage or clear it.
- GitHub Pages outages affect availability.
- A broken JavaScript file can blank a route.
- Repo corruption is recoverable from Git history and exported state.

### 4.6 Elevation of privilege

- All three local labels currently have the `editor` role.
- There is no server-side role enforcement.
- Management features are visible to anyone who unlocks or bypasses the gate.
- The local role label does not grant or deny API permissions.

## 5. Access gate: exact properties

| Property | Implementation |
| --- | --- |
| Credential storage | SHA-256 digest in `assets/js/auth.js` |
| Hash comparison | Browser WebCrypto `crypto.subtle.digest` |
| Plaintext storage | None |
| Session storage | `sessionStorage["safeparks-auth-v1"]` JSON |
| Session lifetime | Tab-scoped; 12-hour maximum age check |
| Idle timeout | 30 minutes without pointer/key activity |
| Attempt limit | 5 failures per stored counter |
| Lockout | 60 seconds |
| Attempt store | `localStorage["safeparks-auth-attempts-v1"]` |
| Users | Three labels, currently all `editor` |
| Sign-out | Remove session and reload |
| Server enforcement | None |

### What the gate is good for

- preventing casual viewing by someone who picks up an unlocked device;
- separating named local working labels;
- making the public nature of the content explicit to users.

### What it is not good for

- confidentiality;
- authorization;
- identity proofing;
- non-repudiation;
- protecting against a visitor who reads the repository;
- protecting data at rest;
- multi-user access control.

## 6. CSP and browser controls

The meta CSP is intentionally restrictive except for inline script/style required by the static shell.
It blocks object embedding, base URI changes and cross-origin form submission. It does not replace a
server response header. GitHub Pages cannot set project-specific response headers; use a proxy or a
different hosting layer if header-based CSP, HSTS preload, frame-ancestors or reporting are required.

Additional browser expectations:

- HTTPS is enforced for the live Pages origin.
- WebCrypto requires a secure context.
- Session data is tab-scoped.
- No service worker is registered.
- No third-party scripts, fonts or analytics are loaded.
- The page uses same-origin assets with a release query string.

## 7. Content and injection

- Data files are static, reviewed JavaScript.
- Rendered strings are passed through `esc()` before insertion into HTML in the view code.
- Imported state is validated structurally but is not a trusted content source.
- Do not import state from an untrusted party.
- If a new view inserts imported values into HTML without escaping, that is a regression.
- The CSP allows inline scripts because the current shell needs them; this reduces defense in depth
  against a successful DOM injection. Treat content review as a control.

### CSV formula injection

CSV exports quote cells and escape double quotes, but a cell beginning with `=`, `+`, `-` or `@` can be
interpreted as a formula by spreadsheet software. This is a residual risk for audit, evidence and task
exports that contain operator-entered text. Open exported CSV in a trusted tool, inspect it before
sharing, and do not open unreviewed exports with macros enabled. A future hardening change should prefix
dangerous leading characters in `tools`/`management.js` CSV output.

## 8. Repository and supply chain

- The application runtime has no npm dependencies.
- Build and test scripts use Node built-ins only.
- The package is `private` and `UNLICENSED`.
- The CI workflow uses pinned major versions of `actions/checkout` and `actions/setup-node`.
- `npm install` is not required for normal use.
- Do not add a dependency without a documented reason, lockfile review and vulnerability assessment.
- Do not commit `.env`, tokens, private keys or generated source maps containing secrets.
- Keep the GitHub account protected with strong authentication and review active sessions/tokens.
- Branch protection requires `brief-state-gate`; force-push and deletion are disabled.
- CODEOWNERS assigns review ownership to the repository owner.

## 9. Passphrase management

The rotation procedure is [W-16](WORKFLOWS.md#17-w-16--rotate-access-passphrases). Security-specific
requirements on top of it:

1. Use a long, unique, randomly generated passphrase and compute its digest offline.
2. Replace the old digest in the same change; never keep a retired digest in the file.
3. Communicate the passphrase only through a separate secure channel — never in chat, an issue, a commit
   message or a screenshot.

A weak passphrase can be brute-forced offline because the digest is public. The gate is a convenience
control, not a password vault.

## 10. Secure development checklist

- [ ] No plaintext credentials, tokens or personal data added.
- [ ] New source data is bilingual and uses stable IDs.
- [ ] New rendering escapes untrusted text.
- [ ] No external scripts/fonts/analytics introduced without review.
- [ ] No new runtime dependency without approval.
- [ ] No generated artifact edited by hand.
- [ ] `npm test`, `npm run check`, `npm run docs:check` and `npm run gate` pass.
- [ ] Browser smoke test covers the changed route, theme and language.
- [ ] Release notes and rollback path are recorded.

## 11. Residual risks

| Risk | Severity | Mitigation / status |
| --- | --- | --- |
| Direct URL bypasses the UI gate | High for confidentiality | Accepted; use an access proxy if confidential |
| Local audit can be edited | High for evidence integrity | Accepted; use Git/external records for formal evidence |
| Client-side hashes allow offline guessing | Medium | Use long random passphrases; rotate on suspicion |
| CSV formula injection | Medium | Documented; review exports; future hardening |
| Meta CSP has limited enforcement | Medium | Static-host limitation; proxy/header hosting for stronger control |
| Browser storage eviction | Medium | Weekly full-state export; snapshots are not durable |
| No server-side role separation | High for multi-user | Accepted until backend exists |
| GitHub account compromise | High | Strong auth, review sessions, branch protection |
| Generated artifacts can become stale | Medium | `brief-state-gate` and release checklist |
| Public repo exposes all data | High | Accepted by design; do not store sensitive material |

## 12. Incident reporting

For a vulnerability, follow [`SECURITY.md`](../SECURITY.md). For an operational or data incident, use
[INCIDENT-RECOVERY.md](INCIDENT-RECOVERY.md). Do not publish exploit details, credentials or personal data
in a public issue.
