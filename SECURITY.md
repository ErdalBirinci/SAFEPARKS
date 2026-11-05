# Security policy

## Scope

This repository is a static GitHub Pages application. The password gate is a convenience control: it
does not make the repository, its data files or generated documents confidential. Do not place personal
data, credentials, private keys or confidential project material in this repository.

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Use GitHub's private vulnerability
reporting flow on the repository's **Security** tab. Include the affected page, browser, steps to
reproduce and the impact. Do not include live personal data or credentials.

If private reporting is unavailable, contact the repository owner directly through the GitHub profile
before disclosing anything publicly.

## Supported version

Security fixes are applied to the current `main` branch and to the latest release tag. Older static
copies are not maintained.

## Known boundary

A static site cannot enforce access control, store a server-side session or provide a trustworthy
audit log. Treat the local management data as working state in one browser. For real multi-user access,
put the site behind a server-side access proxy and move state to an authenticated backend with
server-side authorisation and audit storage.
