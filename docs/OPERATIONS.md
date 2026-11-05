# Operator guide

## Roles

| Role | Responsibility |
| --- | --- |
| Repository owner | Merge control, releases, branch protection, Pages settings, secrets and access decisions. |
| CISO editor | Compliance evidence, risks, decisions, tasks, KPI actuals and document control. |
| DPO reviewer | DPIA/privacy review and risk-acceptance input; does not need to edit technical controls. |
| Approver | Signs decision metadata and risk acceptance above tolerance. |

The current password gate identifies three local users only. It does not create server-side roles,
shared state or an authoritative audit log.

## Routine work

1. Open the portal over HTTPS (GitHub Pages) or a local server.
2. Record changes in the management console. Use the task owner and due date for anything that must
   be chased.
3. Before an import, reset or major status change, create a snapshot and export the full state.
4. Use **Audit CSV** for review and **Task calendar** to move open tasks into a calendar.
5. Download the full state after a review; keep the copy outside the browser and outside the public
   repository if it contains working notes.

## Release routine

```bash
npm test
npm run check
npm run build:artifacts
git add safeparks-brief-state.json SAFE-PARKS-*.html SAFE-PARKS-*.docx SAFE-PARKS-*.xlsx SAFE-PARKS-*.tsv SAFE-PARKS-Evidence-Ledger.csv
npm run gate
```

Then update `CHANGELOG.md`, commit, tag `vX.Y.Z` and push. The GitHub Pages workflow publishes the
static files from `main`; the CI gate separately verifies that the canonical state and generated
artifacts are current.

## Recovery

- **Undo a bad edit:** restore the latest local snapshot in the management console.
- **Move browsers:** export the full state and import it in the other browser.
- **Lost browser state:** import the last full-state JSON export. If none exists, use the canonical
  state in the repository as the baseline and re-enter local notes.
- **Stale brief:** rebuild with `npm run build:artifacts` and rerun `npm run gate`.

## Limits to state plainly

The portal is a static site. It cannot provide real access control, a trusted audit trail, shared
multi-user state, server-side approval workflow or automatic reminders. For those, deploy behind a
server-side access proxy and move state to an authenticated backend with server-side authorisation,
audit storage and a scheduler. Until then, the management console is a disciplined local-first tool,
not a compliance system of record.
