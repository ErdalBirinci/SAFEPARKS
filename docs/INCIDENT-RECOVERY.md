# Incident response and recovery

## 1. Scope

This runbook covers incidents affecting the portal, its static delivery, its repository, its local
working data or its access gate. It does not replace the project’s formal incident-response plan or
legal notification duties. The portal’s own incident-response content is advisory and must be validated
against the signed agreements and applicable law.

## 2. Severity model

| Severity | Examples | Target response |
| --- | --- | --- |
| Sev-1 | Public site serves malicious/wrong content; repository compromise; exposed credential; personal data published | Immediate containment; notify owner/CISO; preserve evidence |
| Sev-2 | Live site unavailable for an extended period; canonical artifact set inconsistent; access gate broken | Same business day |
| Sev-3 | One route broken; management action fails; docs/CI failure without production impact | Next working day |
| Sev-4 | Cosmetic issue, stale non-critical content, minor documentation error | Scheduled fix |

## 3. First 15 minutes

1. **Stop and preserve.** Do not overwrite the only export or delete the local state.
2. **Classify.** Use the severity model and note the affected environment.
3. **Contain.**
   - Wrong public content: revert/unpublish Pages.
   - Suspected passphrase disclosure: rotate the digest.
   - Suspected account compromise: revoke GitHub sessions/tokens.
   - Corrupt local state: stop editing; export if possible.
4. **Notify.** Repository owner and CISO; add legal/DPO if personal data or a legal duty may be involved.
5. **Record.** Time, detector, symptoms, affected URL/commit, actions taken, evidence location.

Do not publish exploit details, passwords or personal data in a public issue.

## 4. Detection sources

- user report through the approved channel;
- failed `pages-health` workflow;
- failed `brief-state-gate` workflow;
- browser console errors;
- Pages build failure;
- Git diff/review;
- GitHub security alerts;
- operator observation.

## 5. Scenario runbooks

### 5.1 Live page is unavailable

1. Check GitHub Status and the repository Pages settings.
2. Inspect the latest Pages build for the current commit.
3. If the build failed, inspect the first useful error and rebuild after fixing.
4. If the build is `building`, wait; do not repeatedly trigger.
5. If the site was unpublished, confirm whether that was intentional before republishing.
6. Verify the live URL and required assets with `npm run live:check`.
7. Record the outage window and cause.

### 5.2 Live page serves an old version

1. Check the Pages build commit. A successful build for an older commit means the new push did not
   reach the Pages source or the build has not completed.
2. Confirm `main` and `origin/main` point to the intended commit.
3. Check the build status and wait for completion.
4. Open with a cache-busting query; browsers cache favicons and assets aggressively.
5. If the build is stale after completion, trigger a Pages rebuild.
6. Do not hand-edit deployed files; redeploy from source.

### 5.3 Wrong or malicious content is live

1. Treat as Sev-1 if malicious or privacy-impacting.
2. Identify the commit and the changed files.
3. Revert the commit or restore the previous known-good commit.
4. If immediate removal is required, unpublish the Pages environment.
5. Preserve logs, screenshots, commit hashes and the affected export.
6. Rotate credentials if there is any sign of repository compromise.
7. Rebuild, verify and only then republish.
8. Conduct a post-incident review.

### 5.4 Suspected passphrase disclosure

Remember: the digest is public and the gate is not confidentiality.

1. Generate a new passphrase offline.
2. Compute its SHA-256 digest in a trusted environment.
3. Replace the affected digest in `assets/js/auth.js`.
4. Bump the patch version and asset query strings.
5. Run tests, build, gate and browser smoke test.
6. Release.
7. Tell the authorised user through a separate secure channel.
8. Review local exports and public artefacts for anything that should not have been exposed.
9. If the disclosed passphrase was reused elsewhere, rotate it there too.

There is no server-side session revocation. Closing tabs and reloading forces the new digest check.

### 5.5 Lost or corrupt browser state

1. Do not reset until an export has been attempted.
2. Try **Download full state**.
3. Try a local snapshot if the application still renders.
4. Import the latest reviewed full-state JSON.
5. If none exists, use the canonical state as a baseline; local-only notes may be unrecoverable.
6. Record what was lost and the recovery source.
7. Improve the export cadence if the loss was avoidable.

### 5.6 Bad import

1. Do not continue editing.
2. Restore the automatic `before import` snapshot if available.
3. Otherwise import the last full-state export.
4. If the bad import included audit/snapshots, inspect them before restoring.
5. Validate the JSON and document the error.
6. Add a regression test if the validator missed a real malformed case.

### 5.7 Corrupt canonical state or stale artifacts

1. Stop the release.
2. Inspect `safeparks-brief-state.json` against the schema in [DATA-MODEL.md](DATA-MODEL.md).
3. Restore the last known-good state from Git or a reviewed export.
4. Rebuild:
   ```bash
   npm run build:artifacts
   git add -A
   npm run gate
   ```
5. Do not patch generated artifacts manually.
6. If the hash mismatch persists, inspect the state fields included in the hash.

### 5.8 CI failure

1. Read the failed step, not only the summary.
2. Reproduce locally with the same command.
3. Distinguish a source error from a tracked/artifact error.
4. Fix the cause; do not skip the check or weaken the assertion to get green.
5. Re-run and record the resolution.

### 5.9 Suspected repository/account compromise

1. Revoke GitHub sessions and tokens.
2. Change the account password and enable/confirm strong MFA.
3. Review recent commits, tags, releases, Pages builds, collaborators and deploy keys.
4. Revert unauthorised changes.
5. Rotate access digests.
6. Preserve evidence.
7. Notify the owner/CISO and follow GitHub security guidance.
8. Rebuild and verify the site only after the repository is trusted again.

### 5.10 Personal data was published

1. Treat as Sev-1.
2. Remove the content from the live site and repository history as appropriate.
3. Do not repeat the data in the incident channel.
4. Notify the DPO and repository owner immediately.
5. Follow the project’s legal notification assessment; the portal cannot decide this.
6. Preserve only the minimum evidence needed.
7. Review how the data entered the repository and add a preventative control.

## 6. Recovery priorities

1. Stop further harm.
2. Preserve evidence.
3. Restore a known-good public state.
4. Restore local working data.
5. Verify access, content and assets.
6. Document and learn.

## 7. Recovery targets

These are targets, not guarantees:

| Scenario | Target |
| --- | --- |
| Roll back a bad static release | Same business day |
| Restore a local state from export | 1–2 hours |
| Rotate an access digest | Same business day |
| Recover from Pages outage | Dependent on GitHub |
| Recover from lost local-only notes | May be impossible |

## 8. Verification after recovery

- [ ] `npm test` passes.
- [ ] `npm run check` passes.
- [ ] `npm run docs:check` passes.
- [ ] `npm run gate` passes.
- [ ] CI is green for the recovery commit.
- [ ] Pages build is `built` for that commit.
- [ ] Live URL and assets return 200.
- [ ] Access gate is present.
- [ ] Changed routes render with no console errors.
- [ ] The canonical state and artifacts correspond to the intended version.
- [ ] The incident record names the recovery source and remaining risk.

## 9. Post-incident review

Within five working days for Sev-1/2:

- timeline;
- root cause;
- detection gap;
- containment and recovery effectiveness;
- data/security impact;
- what changed in docs, tests or controls;
- owner and due date for each action;
- whether the residual risk is accepted.

Do not close an incident solely because the site is back online.
