# Contributing

## Before you change anything

- Read `README.md` and `docs/OPERATIONS.md`.
- Keep the portal dependency-free and static unless a backend change is explicitly approved.
- Never add plaintext passwords, tokens, personal data or production credentials.
- Do not edit generated artifacts by hand. Change the source or the canonical state and rebuild.

## Local checks

```bash
npm test                 # unit tests for management/state helpers
npm run check            # data counts, required fields, links and budget totals
npm run build:artifacts  # regenerate briefs, go/no-go record and evidence CSV
npm run gate             # requires the state and artifacts to be tracked by Git
```

`npm run gate` is intended to run after `git add` because it verifies tracked files.

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
