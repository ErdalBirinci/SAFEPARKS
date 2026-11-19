# Workflows

This document describes the repeatable workflows the system supports. Each workflow names its trigger,
actor, steps, outputs, audit events and failure handling. The portal is local-first: all editing
workflows run in one browser profile and become shared only when a human exports, reviews and commits the
state or artifacts.

## 1. Workflow catalogue

| ID | Workflow | Primary actor | Frequency |
| --- | --- | --- | --- |
| W-01 | Start the portal locally | Operator | As needed |
| W-02 | Sign in and sign out | Authorised user | Every session |
| W-03 | Update compliance evidence | CISO editor | Continuous |
| W-04 | Change a compliance status | CISO editor | Continuous |
| W-05 | Review or score a risk | CISO editor | Continuous |
| W-06 | Record residual-risk acceptance | Approver + CISO editor | Per acceptance |
| W-07 | Record a governance decision | Approver + CISO editor | Per decision |
| W-08 | Manage a task | CISO editor | Daily/weekly |
| W-09 | Create and restore a snapshot | CISO editor | Before major changes |
| W-10 | Export, review and import state | CISO editor / release owner | Weekly and at release |
| W-11 | Reset local working data | CISO editor | Exceptional |
| W-12 | Produce a reporting pack | CISO editor | Monthly/quarterly |
| W-13 | Prepare a pilot go/no-go record | CISO editor + DPO | Per pilot wave |
| W-14 | Change source data or content | Developer/editor | Per change |
| W-15 | Build, validate and release | Release owner | Per release |
| W-16 | Rotate access passphrases | Repository owner | On join/leave or suspicion |
| W-17 | Handle a security or data incident | Incident lead | On incident |

## 2. W-01 — Start the portal locally

**Trigger:** an operator needs to work without using the public Pages URL.

**Steps:**

1. Open a terminal at the repository root.
2. Run one of:
   ```bash
   node tools/serve.js 4173
   # or
   python -m http.server 4173
   ```
3. Open `http://127.0.0.1:4173`.
4. Confirm the access gate appears and the browser console has no errors.
5. Sign in with an authorised passphrase.

**Output:** a local origin with its own `localStorage` and `sessionStorage`. Local state does not
automatically transfer to the GitHub Pages origin or another browser profile.

**Do not** use `file://` for normal work: storage is scoped per origin and WebCrypto secure-context
behaviour varies.

## 3. W-02 — Sign in and sign out

**Trigger:** opening the portal or ending a session.

**Sign-in steps:**

1. Enter an authorised passphrase.
2. The browser computes SHA-256 with WebCrypto and compares it with the three stored digests.
3. On success, a tab-scoped session is created and the shell is shown.
4. The session label is carried into audit entries.

**Failure handling:**

- A wrong passphrase shows the remaining attempt count.
- Five failures trigger a 60-second lock.
- A missing WebCrypto implementation shows a secure-context error; use HTTPS or localhost.
- A blocked `sessionStorage` may prevent a durable tab session; use a normal browser profile.

**Sign-out steps:**

1. Use the topbar sign-out button or **Management → Sign out**.
2. The session key is removed and the page reloads to the gate.
3. Closing the tab also ends the session.

**Idle behaviour:** after 30 minutes without pointer or keyboard activity the app calls sign-out. The
session record also has a 12-hour maximum age, checked when the session is read.

## 4. W-03 — Update compliance evidence

**Trigger:** a control gains a reference, note, verification date or verifier.

**Steps:**

1. Open **Compliance** or **Missing evidence**.
2. Locate the control by ID, framework, owner or search.
3. Enter the evidence reference and summary.
4. Enter `verifiedOn` and `verifiedBy` when the evidence has been independently checked.
5. Save the evidence row or move focus out of the evidence entry.
6. Review the **Missing evidence** count and the control’s aging warning.
7. Create a snapshot if the change is part of a review pack.
8. Export full state before leaving the browser.

**Expected audit:** `evidence.save` with the changed keys.

**Quality rule:** a control is not “ready” merely because a status was selected. Readiness should be
supported by evidence and an independent verification record.

## 5. W-04 — Change a compliance status

**Trigger:** evidence or implementation changes the control posture.

**Steps:**

1. Open **Compliance matrix**.
2. Use the status selector for the control: `ready`, `partial`, `gap` or `na`.
3. Confirm the dashboard readiness and framework bars update.
4. Add or update the supporting evidence.
5. Export full state and/or rebuild release artifacts if this is a review baseline.

**Expected audit:** `status.change` with kind `comp`, the control ID, before and after values.

**Review gate:** a release that includes changed controls must rebuild the briefs and pass
`npm run gate`.

## 6. W-05 — Review or score a risk

**Trigger:** risk treatment, likelihood, impact or site context changes.

**Steps:**

1. Open **Risk register**.
2. Review score, category, owner, treatment and due milestone.
3. Change the risk status: `open`, `treating`, `accepted`, `closed`.
4. For city-specific scoring, select a pilot city and adjust likelihood/impact.
5. Add a city risk owner, note and last verification date where required.
6. Use **Reset site scores** only when the city overrides should return to the baseline.
7. Export or rebuild if the result is part of a release.

**Expected audit:** `status.change` for the register status; `risk.cityscore` and `risk.citymeta` for
city overrides.

**Quantitative rule:** scores are 1–5 on both axes; the register is project-wide, while city scores are
overrides. A city without an override inherits the baseline.

## 7. W-06 — Record residual-risk acceptance

**Trigger:** a risk above tolerance is accepted with compensating controls and an expiry.

**Preconditions:**

- named acceptor with authority;
- acceptance date;
- expiry date;
- residual score;
- written rationale;
- evidence of compensating controls.

**Steps:**

1. Open **Management console → Risk acceptance**.
2. Select the risk.
3. Enter acceptor, acceptance date, expiry, residual score and rationale.
4. Save.
5. Confirm the risk status changed to `accepted` and the system health count updates.
6. Export full state.
7. If the acceptance affects a release, rebuild the artifacts and update the relevant report.

**Expected audit:** `risk.accept` with the acceptance object.

**Removal:** removing an acceptance deletes the acceptance record and changes the risk back to
`treating` when it was `accepted`.

**Control:** expiry is a reporting trigger, not an automatic legal decision. The CISO/CEO must review it.

## 8. W-07 — Record a governance decision

**Trigger:** a CEO or consortium decision is requested, approved or rejected.

**Steps:**

1. Open **Management console → Decision register**.
2. Review all six decisions and their due milestones.
3. Set the status: `pending`, `approved` or `rejected`.
4. Record approver, decision date and rationale.
5. Save decisions.
6. Confirm the pending count on the dashboard and management health.
7. Export or rebuild the decision table/brief if this is a release baseline.

**Expected audit:** `decision.status` (when status changes) and `decision.metadata` (when metadata is
saved).

**Evidence quality:** a status without approver/date/rationale is incomplete for an audit pack.

## 9. W-08 — Manage a task

**Trigger:** an action needs an owner and due date.

**Steps:**

1. Open **Management console → Tasks and actions**.
2. Enter title, owner, due date and optional note.
3. Add the task.
4. Change status as work progresses: `open`, `in-progress`, `blocked`, `done`.
5. Delete a task only when it is genuinely withdrawn; deletion is audited.
6. Download the task calendar (`.ics`) when the tasks need to move to a calendar.

**Expected audit:** `task.create`, `task.status`, `task.delete`.

**Use:** tasks are for local chase work. They are not a server-side ticketing system and are not
included in the generated briefs.

## 10. W-09 — Create and restore a snapshot

**Trigger:** before import, reset, bulk evidence work or a major status change.

**Create:**

1. Open **Management console → Backups and restore**.
2. Enter a meaningful label such as `before Q4 evidence review`.
3. Create the snapshot.
4. Export full state for an off-device copy.

**Restore:**

1. Choose the snapshot.
2. Confirm replacement of current data.
3. The current audit trail and snapshot list are preserved; the data is replaced.
4. Review the result and export again.

**Limits:** at most eight snapshots; each is a local copy and does not survive browser data eviction.
Snapshots are not encrypted.

## 11. W-10 — Export, review and import state

**Trigger:** backup, handover, migration or release preparation.

**Export:**

1. Use **Download full state** for the complete backup (`safeparks-ciso-state.json`).
2. Use **Download brief state** for the compact artifact input (`safeparks-brief-state.json`).
3. Store the full export outside the public repository if it contains local notes.

**Review:**

1. Open the JSON in a trusted editor.
2. Check `schemaVersion`, `appVersion`, `exportedAt`, `updatedAt` and `updatedBy`.
3. Confirm no unexpected personal or confidential data is present.
4. For a release, replace the canonical `safeparks-brief-state.json` only after review.

**Import:**

1. Use **Import** and select the JSON.
2. The importer validates statuses and structures, takes a pre-import snapshot and preserves existing
   audit/snapshots when absent from the payload.
3. Review the resulting data and export again.

**Expected audit:** `state.import`.

**Prohibited:** do not import an unreviewed file from an untrusted source, and do not commit a full
state containing working notes or personal data.

## 12. W-11 — Reset local working data

**Trigger:** the working copy is corrupt or a clean start is required.

**Steps:**

1. Create and export a full snapshot first.
2. Use **Reset** in the data menu.
3. Confirm the warning.
4. The reset keeps audit and snapshots, clears editable data and adds `state.reset`.
5. Re-enter settings and evidence as needed, or import a reviewed backup.

**Do not** use reset as a substitute for an incident investigation.

## 13. W-12 — Produce a reporting pack

**Trigger:** monthly, quarterly, steering or board reporting.

**Steps:**

1. Update evidence, risks, decisions, KPI actuals and budget actuals.
2. Open **KPIs & reporting**.
3. Review readiness, gaps, open incidents, KPI values and the 90-day plan.
4. Review **Management → Data health**.
5. Export the Markdown report and/or evidence CSV.
6. If a formal brief is needed, update the canonical state and run the release workflow.
7. Reconcile figures with the coordinator’s records before official use.

**Outputs:** Markdown status report, evidence CSV, brief artifacts, audit CSV, task calendar.

**Caution:** a generated brief is only as current as the state used to build it.

## 14. W-13 — Prepare a pilot go/no-go record

**Trigger:** a pilot wave approaches a decision point.

**Steps:**

1. Open **Go / no-go**.
2. Select the city and review all 8 gates and 34 items.
3. Mark each item `pass`, `partial`, `fail`, `na` or `open`.
4. Check blocking items and the computed decision: any blocking item not passed is NO-GO; passed
   blocking items with non-blocking gaps are conditional; all passed is GO.
5. Collect evidence and linked control/risk IDs.
6. Save/export state.
7. Rebuild the consolidated record:
   ```bash
   node tools/build-gono-decisions.js --state safeparks-brief-state.json
   ```
8. Print/sign the record only after the CISO and DPO review it.

**Control:** do not override a blocking failure by editing presentation text. Change the underlying
evidence or record the exception through governance.

## 15. W-14 — Change source data or content

**Trigger:** a fact, policy, control, risk, deliverable, budget line or translation changes.

**Steps:**

1. Identify the owning source file under `assets/js/data*.js`, `docs.js` or `docs2.js`.
2. Preserve stable IDs.
3. Update both `en` and `tr` content.
4. Run `npm test`, `npm run check`, `npm run docs:check` and the static syntax check.
5. Rebuild generated artifacts.
6. Review the diffs for accidental data changes.
7. Update `CHANGELOG.md`.
8. Follow the release workflow.

**Do not** edit generated HTML/DOCX/XLSX/TSV/CSV by hand.

## 16. W-15 — Build, validate and release

Follow [TESTING-AND-RELEASE.md](TESTING-AND-RELEASE.md) for the exact command sequence, gate
expectations, tagging and post-deploy verification. The workflow is not finished at commit: the Pages
build for the release commit must report `built` and the live check must pass before the release is
announced.

## 17. W-16 — Rotate access passphrases

**Trigger:** user change, suspected disclosure, periodic review.

**Steps:**

1. Repository owner generates a new passphrase offline.
2. Compute its SHA-256 digest in a trusted environment, for example:
   ```bash
   printf '%s' 'new-passphrase' | sha256sum
   ```
   On PowerShell use a trusted equivalent; never paste a passphrase into a chat or issue.
3. Replace the relevant `hash` value in `assets/js/auth.js`.
4. Keep labels/roles aligned with the actual authorised person.
5. Bump the patch version and cache query strings.
6. Run tests, build artifacts, gate and browser smoke test.
7. Release and inform the user through a separate secure channel.
8. Never commit the plaintext passphrase or put it in repository history.

**Note:** client-side hashes are public. A determined visitor can brute-force weak passphrases offline.
Use long random passphrases and understand that this gate is not confidentiality.

## 18. W-17 — Handle a security or data incident

Use [INCIDENT-RECOVERY.md](INCIDENT-RECOVERY.md). Immediate actions:

1. Stop editing and preserve exports/logs.
2. Do not publish suspected secrets or personal data.
3. If a passphrase is exposed, rotate it and treat the local state as untrusted.
4. If the repository/account is compromised, revoke sessions/tokens and use GitHub security settings.
5. If the Pages site serves wrong content, unpublish the Pages site or revert the commit, then rebuild.
6. Record what happened and the recovery evidence.
