# Glossary

| Term | Meaning in this repository |
| --- | --- |
| **SAFE-PARKS** | Horizon Europe project for safe, privacy-preserving public-space security; the portal supports its CISO function. |
| **WP3** | Work package 3 — Cybersecurity, Secure Telemetry & NATO EFDI Connector; led by Lotus Sirius. |
| **CISO** | Chief Information Security Officer; owns the security posture, risk register and release veto. |
| **DPO** | Data Protection Officer; reviews privacy evidence, DPIA and residual-risk implications. |
| **EPAB** | Ethics and Privacy Advisory Board; provides an independent ethics/privacy opinion. |
| **EFDI** | European Framework for Defence Interoperability context used by the WP3 connector design. |
| **KVKK** | Turkish Personal Data Protection Law No. 6698. |
| **GDPR** | EU General Data Protection Regulation. |
| **NIS2** | EU directive on measures for a high common level of cybersecurity. |
| **CRA** | EU Cyber Resilience Act. |
| **EU AI Act** | EU regulation on artificial intelligence; high-risk timelines remain subject to legal verification. |
| **ISO/IEC 27001:2022** | Information security management system standard used as a control framework. |
| **NATO/STANAG** | NATO standardisation agreements relevant to the defence connector; the exact classification scheme is still to be confirmed. |
| **PQC** | Post-quantum cryptography; the architecture describes migration phases, not a completed deployment. |
| **ROPA** | Record of processing activities. |
| **DPIA** | Data protection impact assessment. |
| **TOM** | Technical and organisational measure. |
| **RACI** | Responsible, accountable, consulted, informed. |
| **RBAC** | Role-based access control; not implemented server-side in this portal. |
| **Evidence ledger** | CSV export of controls, evidence references, verification dates and verifiers. |
| **Readiness** | Share of controls assessed as ready; a derived indicator, not a certification. |
| **Risk acceptance** | A documented decision to tolerate a residual risk with an owner, expiry and rationale. |
| **Residual risk** | Risk remaining after treatment/compensating controls. |
| **Go/no-go gate** | A pilot-readiness checkpoint with blocking and non-blocking items. |
| **Pilot wave** | The indicative deployment grouping of the seven municipalities (W1–W3). |
| **Blocking item** | A gate item that prevents GO unless it passes. |
| **Conditional GO** | A decision where blocking items pass but explicitly permitted non-blocking gaps remain. |
| **Canonical state** | `safeparks-brief-state.json`, the reviewed compact state used to build release artifacts. |
| **Full state** | `safeparks-ciso-state.json`, the complete local backup including management data. |
| **Brief state** | The compact export consumed by the executive briefs and evidence ledger. |
| **Runtime state** | The data in `localStorage["safeparks-ciso-v1"]` for one browser origin. |
| **Snapshot** | A local restore point stored inside runtime state; maximum 8. |
| **Audit entry** | A local record of a change, capped at 2000; editable and not tamper-evident. |
| **Session** | The tab-scoped access record in `sessionStorage["safeparks-auth-v1"]`; maximum age 12 hours. |
| **Access gate** | The client-side SHA-256 passphrase screen; convenience control, not confidentiality. |
| **CSP** | Content Security Policy declared in a meta tag in `index.html`. |
| **SHA-256** | Hash algorithm used for passphrase digests and the canonical state hash. |
| **WebCrypto** | Browser `crypto.subtle` API used for hashing; requires HTTPS or localhost. |
| **`brief-state-gate`** | The required GitHub Actions check and branch-protection context. |
| **Pages build** | GitHub’s static deployment of the `main` branch; separate from the CI workflow. |
| **RPO** | Recovery point objective; here, the last full-state export. |
| **RTO** | Recovery time objective; a target, not a contractual guarantee. |
| **Static site** | No server-side execution, database or session authority. |
| **Local-first** | Edits happen in one browser and are shared only through explicit export/import or commits. |
