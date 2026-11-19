#!/usr/bin/env node
/*
 * Live Pages smoke check. Verifies the public origin and the static assets that
 * make the portal usable. It does not validate visual rendering or portal data.
 *
 * Usage:
 *   node tools/check-live.js
 *   PORTAL_BASE_URL=https://example.test/portal/ node tools/check-live.js
 */
"use strict";

const BASE = (process.env.PORTAL_BASE_URL || "https://erdalbirinci.github.io/SAFEPARKS/").replace(/\/+$/, "");
const TIMEOUT_MS = Number(process.env.LIVE_CHECK_TIMEOUT_MS || 20000);

const CHECKS = [
  { path: "/", type: "text/html", mustContain: ['id="authGate"', "assets/js/app.js", "APP_VERSION"] },
  { path: "/assets/css/style.css", type: "text/css" },
  { path: "/assets/js/auth.js", type: "javascript" },
  { path: "/assets/js/app.js", type: "javascript" },
  { path: "/assets/js/management.js", type: "javascript" },
  { path: "/assets/img/safe-parks-logo.svg", type: "svg" },
  { path: "/assets/img/safe-parks-mark.svg", type: "svg" },
  { path: "/assets/img/favicon-32.png", type: "png" },
  { path: "/assets/img/favicon.ico", type: "icon" },
  { path: "/assets/img/apple-touch-icon.png", type: "png" },
  { path: "/SAFE-PARKS-Executive-Brief.html", type: "text/html" },
  { path: "/SAFE-PARKS-GoNoGo-Decision.html", type: "text/html" }
];

function withTimeout() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return { controller, timer };
}

async function checkOne(item) {
  const url = `${BASE}${item.path}${item.path.includes("?") ? "&" : "?"}live-check=${Date.now()}`;
  const { controller, timer } = withTimeout();
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "cache-control": "no-cache", "user-agent": "SAFE-PARKS-live-check/1" }
    });
    if (!response.ok) {
      return { ok: false, url, detail: `HTTP ${response.status}` };
    }
    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    if (item.type && !contentType.includes(item.type)) {
      return { ok: false, url, detail: `content-type ${contentType || "(missing)"}, expected ${item.type}` };
    }
    if (item.mustContain) {
      const body = await response.text();
      for (const needle of item.mustContain) {
        if (!body.includes(needle)) {
          return { ok: false, url, detail: `missing marker: ${needle}` };
        }
      }
    }
    return { ok: true, url, detail: `${response.status} ${contentType || ""}`.trim() };
  } catch (error) {
    return { ok: false, url, detail: error.name === "AbortError" ? `timeout after ${TIMEOUT_MS} ms` : error.message };
  } finally {
    clearTimeout(timer);
  }
}

(async () => {
  console.log(`Live check: ${BASE}`);
  const results = await Promise.all(CHECKS.map(checkOne));
  let failed = 0;
  for (const result of results) {
    if (result.ok) {
      console.log(`  ✓ ${result.url} — ${result.detail}`);
    } else {
      failed += 1;
      console.error(`  ✗ ${result.url} — ${result.detail}`);
    }
  }
  if (failed) {
    console.error(`Live check failed: ${failed}/${results.length} checks failed.`);
    process.exit(1);
  }
  console.log(`Live check passed: ${results.length}/${results.length} checks.`);
})();
