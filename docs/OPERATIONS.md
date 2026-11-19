# Operations guide

This is the day-to-day runbook for the SAFE-PARKS CISO Portal. It assumes the reader has read
[Architecture](ARCHITECTURE.md) and understands the static-site boundary.

## 1. Service summary

| Item | Value |
| --- | --- |
| Service | SAFE-PARKS CISO Portal |
| Live URL | https://erdalbirinci.github.io/SAFEPARKS/ |
| Repository | https://github.com/ErdalBirinci/SAFEPARKS |
| Hosting | GitHub Pages, `main` branch, root |
| Runtime | Static browser application |
| State | Browser `localStorage` + exported JSON |
| Access | Three local passphrases; not a security boundary |
| Release gate | GitHub Actions `brief-state-gate` |
| Monitoring | Scheduled Pages health workflow |
| Owner | Repository owner / CISO function |

## 2. Operating model

There are three distinct planes:

1. **Authoring plane** — the operator’s browser. Edits live in `localStorage`; they are not shared.
2. **Release plane** — reviewed `safeparks-brief-state.json`, generated artifacts, Git history and CI.
3. **Delivery plane** — GitHub Pages serving the committed static files.

Never treat a browser tab as the only copy of an important record. The operating rule is:

> Local work → explicit export → review → canonical state/commit → rebuild → verify.

## 3. Roles in operation

| Role | Operational duty |
| --- | --- |
| Repository owner | GitHub access, Pages, branch protection, releases, passphrase rotation, backups |
| CISO | Approves security content, risk posture, evidence claims and release veto |
| CISO editor | Performs evidence, risk, task, decision and actuals updates |
| DPO reviewer | Reviews privacy/DPIA content and residual-risk implications |
| CEO/approver | Approves charter, budget, decisions and above-tolerance risk |
| Release owner | Runs checks, builds artifacts, tags and verifies deployment |
| All operators | Export before major changes; never store secrets in the portal |

Detailed rights are in [ROLES-RACI.md](ROLES-RACI.md).

## 4. Environments

| Environment | URL / location | State | Use |
| --- | --- | --- | --- |
| Local | `http://127.0.0.1:4173` | Separate browser origin | Development and draft work |
| Live | `https://erdalbirinci.github.io/SAFEPARKS/` | Separate browser origin | Official public view |
| CI | GitHub Actions | Checked-out commit | Tests and artifact consistency |
| Backup | Operator-selected storage | Exported files | Recovery and review |

Local and live state do **not** synchronize. Moving work requires an export/import.

## 5. Start and stop

### Local preview

```bash
node tools/serve.js 4173
```

Open `http://127.0.0.1:4173`. Stop the server with `Ctrl+C`.

### No server required for the live site

GitHub Pages serves the files. There is no process to restart, database to start or container to
orchestrate.

### Build and maintenance workstation

Requirements:

- Node.js 18 or newer;
- Git;
- a modern browser with WebCrypto;
- no npm install required for the current runtime or tools.

## 6. Routine calendar

### Daily (working day)

- Open the portal and sign in.
- Review **Management → Data health**.
- Review overdue tasks and pending decisions.
- Record new evidence and status changes.
- Export full state at the end of substantive work.

### Weekly

- Review missing evidence and expired risk acceptances.
- Review open risks and decisions due within the next two weeks.
- Export full state to the approved backup location.
- Confirm the latest CI run and Pages health check are green.
- Check that the live page still shows the gate and loads without console errors.

### Monthly

- Produce the monthly report pack.
- Reconcile KPI actuals with the coordinator/PMO.
- Review audit CSV and task calendar.
- Check for stale briefs and rerun the build/gate if needed.
- Review repository access and open pull requests.

### Quarterly

- Review access passphrases and GitHub sessions/tokens.
- Review residual risks and expiring acceptances.
- Review backup restore capability using a test browser profile.
- Review the documentation set against the current system.
- Review whether a server-side access proxy/backend is now justified.

### Per release

Follow [TESTING-AND-RELEASE.md](TESTING-AND-RELEASE.md).

## 7. Access operations

Sign-in, sign-out, lockout and session limits are specified once, in
[W-02](WORKFLOWS.md#3-w-02--sign-in-and-sign-out). Two rules matter for operations:

- Do not share a session tab or leave it unlocked on a shared device.
- If a passphrase is unknown, do not attempt to bypass the gate; ask the repository owner to rotate it
  through a secure channel.

### Leaver / role change

Rotate the affected digest and release a new patch version. There is no remote session revocation:
other tabs may retain a valid session for up to the session maximum age, so close/rotate and instruct
users to reload.

## 8. Data operations

### Before a substantial change

Follow [W-09](WORKFLOWS.md#10-w-09--create-and-restore-a-snapshot) and
[W-10](WORKFLOWS.md#11-w-10--export-review-and-import-state). In short: create a labelled snapshot,
export **Download full state**, store the export outside the public repository if it contains notes, and
note why and when it was taken.

### During work

- Use the management console for tasks and approvals.
- Use evidence fields for references and verification.
- Keep IDs stable.
- Do not put personal data in free-text fields.
- Watch for browser storage warnings.

### After work

1. Export full state.
2. Review the data health card.
3. If a release baseline is intended, replace the canonical compact state after review.
4. Rebuild artifacts and run the gate.

### Browser storage failure

If storage is blocked or full:

- the portal shows a storage warning;
- edits may not persist;
- export immediately if possible;
- free browser storage or use a normal profile;
- restore the last reviewed full-state export.

## 9. Backup and restore

### Backup tiers

| Tier | Method | Location | Frequency |
| --- | --- | --- | --- |
| 1 | Browser localStorage | Operator device | Continuous while working |
| 2 | Local snapshots | Browser | Before major changes |
| 3 | Full-state JSON | Approved operator storage | Daily/weekly |
| 4 | Canonical state + artifacts | Git history | At release |
| 5 | Release tag/Pages build | GitHub | At release |

### Restore order

1. Try the latest local snapshot for a small mistake.
2. Import the latest reviewed full-state JSON.
3. If neither exists, use the canonical state from Git as the baseline and re-enter local notes.
4. If the repository itself is wrong, use `git revert`/the previous tag and rebuild.

### Restore test

Quarterly, in a separate browser profile: import the latest full-state JSON, confirm that dashboard
counts, tasks, decisions, risk acceptance and audit are present, then export again and compare key
counts. Never test against the only production copy.

## 10. Change management

| Change | Required review | Required checks |
| --- | --- | --- |
| Text/translation | Content owner | `npm run docs:check` if docs; data check if data |
| Source data/facts | CISO + owner of the fact | `npm test`, `npm run check` |
| State/artifact baseline | CISO/release owner | Build, `npm run gate` |
| Authentication digest | Repository owner | Browser smoke test, release |
| Workflow/CI | Repository owner | Run the workflow and inspect result |
| Hosting/settings | Repository owner | Pages build and live check |
| Dependency | Owner + security review | Vulnerability and license review |

## 11. Health indicators

| Indicator | Healthy | Warning | Action |
| --- | --- | --- | --- |
| CI `brief-state-gate` | Success on HEAD | Failure/queued | Inspect run, fix, rebuild |
| Pages build | `built` for current commit | `building` > 10 min, `errored` | Inspect build, rebuild |
| Live HTTP | 200 | 4xx/5xx | Check Pages, DNS, repository |
| Console | No errors | Errors on route load | Inspect asset/script |
| Data health | No overdue high-priority work | Growing expiry/pending count | Review with CISO |
| Backup age | Within 7 days | > 7 days | Export full state |
| Passphrase review | Within quarter | Overdue | Rotate/confirm |
| Docs check | Passing | Broken links/missing docs | Fix docs |

## 12. Monitoring

### Manual

```bash
npm run live:check
```

The live check verifies the main page and required static assets, and checks for the access-gate markup.

### Automated

`.github/workflows/pages-health.yml` runs weekly and can be dispatched manually. A failed run is an
operational signal to inspect Pages, not proof that the application logic is broken.

### What is not monitored

- individual user sessions;
- localStorage contents;
- server-side errors (none);
- personal device health;
- content accuracy;
- legal/regulatory changes.

## 13. Release operations

See [TESTING-AND-RELEASE.md](TESTING-AND-RELEASE.md) for the command sequence, gate expectations,
tagging and rollback. A release is complete only when the Pages build for the release commit is
`built`, `npm run live:check` passes and the changed routes have been smoke-tested.

## 14. Incident operations

See [INCIDENT-RECOVERY.md](INCIDENT-RECOVERY.md) for severity, first-15-minutes actions and scenario
runbooks. The first operational move is always to stop editing and preserve evidence before containing
or restoring anything.

## 15. Service levels and recovery targets

These are operational targets, not contractual guarantees:

| Target | Target value | Notes |
| --- | --- | --- |
| Static page availability | Best effort via GitHub Pages | No self-hosted SLA |
| RPO for local work | Last full-state export | Export at least weekly, daily on active work |
| RTO for a static rollback | Same business day | Revert commit/unpublish or rebuild |
| RTO for local data restore | 1–2 hours | Depends on export availability |
| Audit retention | 2000 entries local | Export before it rolls over |
| Snapshot retention | 8 local snapshots | Export for durable retention |

## 16. Decommissioning

If the portal is retired:

1. Export the final full state and all generated artifacts.
2. Archive the repository and release tag.
3. Unpublish the Pages site if public access is no longer intended.
4. Record where the archived evidence and state are stored.
5. Remove repository secrets/tokens and review access.
6. Do not delete data without the owner’s explicit instruction.

## 17. Operating constraints to repeat in every handover

- The public repository is not confidential.
- The password gate can be bypassed by a direct URL.
- The audit log is local and editable.
- There is no server-side multi-user state.
- The canonical state is Git-reviewed, not cryptographically signed.
- Generated artifacts must be rebuilt after state changes.
- The portal is a working instrument, not a certified system of record.
