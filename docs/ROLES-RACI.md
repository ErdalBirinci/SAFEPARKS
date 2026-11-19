# Roles, decision rights and RACI

## 1. Role definitions

| Role | Purpose | Current implementation |
| --- | --- | --- |
| Repository owner | Owns repository settings, releases, branch protection, Pages, access decisions and license | GitHub owner `@ErdalBirinci` |
| CISO | Owns the risk register, evidence base, security posture, release veto and incident command | Operational role; use the CISO editor session |
| CISO editor | Enters evidence, risks, tasks, decisions, actuals and document metadata | One of the three local sessions |
| CTO / security engineering | Supplies technical control evidence and remediation | Reviewer/contributor; no separate local role |
| DPO | Reviews DPIA/privacy evidence and residual-risk implications | Reviewer; no separate local role |
| CEO / approver | Approves charter, budget, above-tolerance risk and major decisions | Approver; no separate local role |
| EPAB | Independent ethics/privacy opinion | External governance body |
| Release owner | Runs checks, regenerates artifacts, tags and verifies Pages | Usually the repository owner |
| Incident lead | Coordinates containment, communications and recovery | CISO or delegate |
| Operator | Uses the portal and exports backups | Any authorised session |

The browser currently labels all three sessions as `editor`. That is a **UI label**, not an authorization
system. Do not infer separation of duties from the local role field.

## 2. Decision rights

| Decision | Accountable | Consulted | Informed |
| --- | --- | --- | --- |
| CISO charter and mandate | CEO | CISO, coordinator, EPAB | Consortium |
| WP3 security budget lines | CEO | CISO, coordinator | Consortium |
| Residual risk above tolerance | CEO | CISO, DPO, legal | EPAB/coordinator |
| Risk acceptance below tolerance | CISO | Risk owner, DPO where privacy-relevant | CEO |
| Release veto | CISO | CTO, release owner | CEO/coordinator |
| Pilot go/no-go | CISO + DPO/municipality | Operations, legal, EPAB | Steering committee |
| Evidence readiness claim | CISO | Control owner, independent verifier | Auditor |
| Public disclosure of a vulnerability | Repository owner + CISO | Legal/coordinator | Affected parties as required |
| Repository access and release settings | Repository owner | CISO | Consortium as needed |

## 3. RACI matrix

**R** = responsible, **A** = accountable, **C** = consulted, **I** = informed.

| Activity | Repo owner | CISO | CISO editor | DPO | CEO/approver | Release owner |
| --- | --- | --- | --- | --- | --- | --- |
| Maintain repository settings | A/R | I | I | I | I | C |
| Maintain source data | C | A | R | C | I | C |
| Record evidence | I | A | R | C | I | I |
| Select compliance status | I | A | R | C | I | I |
| Own risk register | I | A | R | C | I | I |
| Accept risk above tolerance | I | C | R (record) | C | A | I |
| Record decision metadata | I | C | R | I | A | I |
| Manage local tasks | I | A | R | I | I | I |
| Create local snapshot/export | I | A | R | I | I | C |
| Review full-state export | C | A | R | C | I | C |
| Build artifacts | I | C | I | I | I | A/R |
| Run release gate | I | C | I | I | I | A/R |
| Tag and publish release | A | C | I | I | I | R |
| Verify Pages build | A | I | I | I | I | R |
| Rotate passphrases | A/R | C | I | I | I | C |
| Handle security incident | C | A | R (operate) | C | I | C |
| Approve public vulnerability disclosure | A | C | I | C | I | I |

## 4. Approval rules

1. **No self-approval of above-tolerance risk.** The acceptor must have the delegated authority and the
   acceptance must have an expiry and compensating controls.
2. **No release with unresolved critical/high findings** unless the CISO documents a time-limited
   exception and the CEO accepts the residual risk.
3. **No pilot go-live** with a blocking gate that is not passed. Conditional go requires the explicitly
   permitted non-blocking gaps.
4. **No evidence claim** without a reference, note or verification adequate to the claim.
5. **No source-of-truth change** without review of the generated artifact diff and the canonical state.
6. **No public disclosure** of a suspected vulnerability before the repository owner and CISO agree.

## 5. Separation-of-duties limitations

The current static portal cannot enforce:

- distinct approver and editor identities;
- server-side maker/checker;
- role-based access to management screens;
- dual control for decisions or risk acceptance;
- immutable audit.

Those controls must be implemented in a backend or through an external workflow. Until then, separation
of duties is procedural: use Git review, signed documents and explicit approval records outside the
portal.

## 6. Access review

At least quarterly, the repository owner should:

- confirm which people know the three access passphrases;
- remove leavers by rotating the affected digest immediately;
- review GitHub collaborators, deploy keys, sessions and tokens;
- confirm branch protection still requires `brief-state-gate`;
- review the latest release, Pages build and CI status;
- confirm exported backups are stored in an approved location.
