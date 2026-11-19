# Contributing

## Before you change anything

- Read `README.md`, [`docs/README.md`](docs/README.md), [`docs/OPERATIONS.md`](docs/OPERATIONS.md) and [`AGENTS.md`](AGENTS.md).
- Keep the portal dependency-free and static unless a backend change is explicitly approved.
- Never add plaintext passwords, tokens, personal data or production credentials.
- Do not edit generated artifacts by hand. Change the source or the canonical state and rebuild.

## Local checks

```bash
npm test                 # unit tests for management/state helpers
npm run check            # data counts, required fields, links and budget totals
npm run docs:check       # required docs and internal Markdown links
npm run build:artifacts  # regenerate briefs, go/no-go record and evidence CSV
npm run gate             # requires the state and artifacts to be tracked by Git
npm run live:check       # public Pages and required static assets
```

`npm run gate` is intended to run after `git add` because it verifies tracked files.

## Documentation changes

- Update the affected document under `docs/` when behaviour changes.
- Add new documents to [`docs/README.md`](docs/README.md) and keep internal links valid.
- Run `npm run docs:check` before committing.
- Do not claim a visual or live check passed unless it was actually performed.

## Content changes

- Bilingual content is maintained in parallel: edit both `en` and `tr`.
- Keep IDs stable; other views, briefs and links depend on them.
- When a budget, date or ownership fact is uncertain, label it as indicative instead of presenting it
  as authoritative.
- Update `safeparks-brief-state.json` only through the portal export or a deliberate reviewed change,
  then rebuild the artifacts.

## Pull requests

Use the pull-request template. A change that affects generated artifacts must include the regenerated
files and the state used to produce them. Keep unrelated changes in separate pull requests.

The required CI context is `brief-state-gate`; do not rename that job. It now runs the JavaScript syntax
check, unit tests, data integrity, documentation-link check and the artifact/state gate.
