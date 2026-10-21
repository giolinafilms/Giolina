# Recovery validation — 2026-10-21

Validated source: d477f5bab763b01642a8d96f271beac0a142f2d4.

Fresh execution results:
- Node v24.19.0: node --test diagnostics/smugmug/worker.test.mjs — 22 passed, zero failures.
- Locked runtime dependencies installed with npm ci --prefix diagnostics/smugmug/runtime-tests --ignore-scripts.
- npm test --prefix diagnostics/smugmug/runtime-tests — 18 passed, zero failures, actual workerd/SQLite runtime; synthetic credentials and intercepted upstream only.
- Dedicated Wrangler deploy --dry-run packaging produced a 37.63 KiB bundle. RUN_GATE binding and disabled variables were displayed. No deployment was performed by that command.
- Strict origin cases include rejection of missing, null, cross-origin and noncanonical Origin values. Durable consumption/replay/concurrency, restart persistence, failure/timeout redaction and no retries were tested.

Hosted observation before this checkpoint:
- Public /readiness returned HTTP 401 and {"error":"unauthorized"}.
- Public /test.js still lacked referrerPolicy:'same-origin'. The correction was therefore not verified live.
- GitHub returned zero check runs for d477f5b.

This documentation checkpoint records newly completed validation and provides one normal branch push for the existing Git-connected build. Do not infer deployment success from the commit. No repeated trigger should be made without investigating a failed or missing build.

Limits:
- No installed Chromium/WebKit executable was available for fresh real-browser tests. Node UI tests and workerd origin tests passed; physical Safari is untested.
- Actual historical iPad request headers remain unavailable; the specific observed cause is not proven.
- Authenticated hosted state, deployed binding values and current deployment version are not verified.
- No OAuth request, arming, secret change, authorization reset, gallery access or production operation occurred.
- Existing defaults remain DIAGNOSTIC_ENABLED=false, CREDENTIAL_APPLICATION_CONFIRMED=false and AUTHORIZED_RUN_ID empty.
