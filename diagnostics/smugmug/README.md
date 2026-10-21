# Isolated SmugMug diagnostic

## Phase 3G — status reporting correction

The old “Outcome not confirmed” text was a catch-all for every non-401 server
failure, fetch/timeout failure, invalid JSON and unexpected state. It did not prove
arming, consumption or SmugMug authentication failure. The password cleared before
fetch as a security measure; clearing it never proved a successful response.

No hosted authorization history was accessible to Work without the diagnostic
password. The owner's reported failure alone cannot identify which server/network
condition occurred. No live run is authorized in this phase.

Authenticated status is now independent of execution-configuration prerequisites:
it only reads the existing fixed owner record, reports safe configuration booleans,
and never writes storage, signs OAuth or contacts SmugMug. Arm/run retain their
exact configuration, Bearer, Origin, Fetch Metadata, custom-header and replay gates.
A configuration mismatch cannot hide an existing consumed record. No record reset,
new run ID or migration is introduced. Missing/altered settings still block execution.

The owner now only needs to open the existing webpage, enter the existing diagnostic
password in the test section, click Check Test Status, and read the message directly
under that button. Do not arm or run during this phase. Each action has its own
focusable live-region result. Passwords still clear immediately; keyboard focus
moves to the result to make mobile feedback visible. Copy explains why it is disabled.

Known errors are distinguished by safe HTTP status/reason codes (password rejected,
origin/Fetch Metadata/CSRF rejection, configuration lock or unavailable durable
storage). Timeout, network failure, invalid response and unknown state have separate
messages. No raw server error body, header value or exception text is echoed.
Status errors explicitly say they cannot arm or run OAuth; they do not imply that
an authorization was consumed. No automatic retry occurs.

Unarmed means no record exists for this fixed owner-test object, not a global audit
of every historical legacy diagnostic run. Consumed means the durable claim exists;
it does not prove the upstream request reached SmugMug. Completed reports only saved
sanitized evidence. Legacy configuration flags alone do not establish owner state.

Regression coverage includes these UI cases, same-origin rejection reasons,
read-only status with mismatched/missing configuration, and durable consumed-state
preservation. All workerd upstream calls use the existing network-isolated mocks.
Physical iPhone/Safari validation and hosted authenticated state remain separate
checks; unit/runtime tests do not substitute for those observations.

## Current owner workflow — Phase 3F

The existing isolated Worker is deployed through its existing GitHub connection.
The historical CLI/deployment handoffs below are archived context, not owner tasks.
Do not recreate the Worker or change its secrets, routes or disabled variables.

This phase adds the one-test interface; it does **not** authorize a live request.
Only after separate explicit owner authorization:

1. Open https://giolina-smugmug-diagnostic.dawn-math-f4b1.workers.dev/ .
2. In SmugMug Authentication Test, enter the existing diagnostic password and
   click Check Test Status. It must say unarmed. This action never sends OAuth.
3. Re-enter that password, check the explicit October 2 application/one-test
   confirmation, and click Arm One Test. Arming sends no SmugMug request.
4. Within ten minutes, re-enter the password, confirm again, and click
   Run One OAuth Test exactly once.
5. Copy the sanitized support report. If the outcome is unclear, use only
   Check Test Status to retrieve the saved result. Never rearm or retry.

No Cloudflare edits, API-key entry, terminal, or manual HTTP headers are required.
Expired grants remain locked and require technical review; there is no reset route.
The API key is withheld from reports and can be supplied privately to Sebastian.
Success proves the request-token step only, never account or gallery access.

### Security boundary

The legacy `/diagnostic` route and its browser rejection are preserved. The new
`/owner-test/status`, `/owner-test/arm`, `/owner-test/run` POST routes require
Bearer authentication, exact Origin, Sec-Fetch-Site same-origin, a custom header,
JSON, no cookies and no CORS. They reject query strings, unexpected fields and
oversized input. Owner routes require all three legacy configuration values to
remain exactly false/false/empty; they never change those values.

The owner flow is a separate explicit durable grant, not an automatic enabling
of legacy configuration. A fixed RunGate object has unarmed → armed → consumed
→ completed states. Arm and consume use atomic transactions. The grant expires
in ten minutes and can be created only once. Consumption commits before signing
or fetch; concurrent requests, failures, timeout, lost responses and restarts
cannot repeat it. No browser route can delete state or choose another object/run ID.
Only sanitized evidence is stored, for authenticated recovery after a reload.
A consumed state without evidence is deliberately treated as uncertain and locked.

No live grant was created during implementation/testing. Runtime tests use synthetic
bindings and intercept every upstream fetch, with no network fallback. Wrangler
config and migration v1 are unchanged. The public page alone reveals no configured
state. Check Readiness still checks legacy settings; Check Test Status separately
reports the durable owner authorization. Do not interpret a legacy disabled flag
as proof that an owner grant is unarmed after someone explicitly arms it.

Password fields clear on dispatch and page hide; no cookies, URL credentials,
browser storage, logs, external scripts or fonts. Copy handles only sanitized
report text. The browser never retries, follows redirects, or executes on reload.

## Historical implementation notes


Selected registration: **GioLina Films, October 2, 2026**, confirmed by owner.
This is a new isolated Worker in the existing repository, not a replacement website.
The older application and bindings remain untouched. No live OAuth test is authorized
in this implementation phase.

## Scope and isolation

Only deploy `diagnostics/smugmug/wrangler.jsonc`. Its Worker name is
`giolina-smugmug-diagnostic`; it has no custom domains, routes, assets, production
bindings, scheduled triggers, or gallery operations. The sole storage resource is
its own SQLite-backed `RunGate` Durable Object. Do not change subscriptions or
accept an upgrade/payment prompt. Stop if the account cannot provision this on its
existing plan.

The existing `vendor/oauth-sign-webcrypto.mjs` and Apache-2.0 license are reused
without changes. One header-based OAuth request signs and sends the same constant
URL: `https://api.smugmug.com/services/oauth/1.0a/getRequestToken`.
`oauth_callback=oob` is supported by SmugMug's non-web OAuth flow; no callback URL
is added to the registration. This Worker never visits authorization or access-token
endpoints. Success means request-token acquisition only, not account authentication.

## Secure defaults

- `GET /readiness`: requires an Authorization Bearer token; returns presence flags,
  never values; performs no outbound request. Unauthenticated visitors receive only
  a generic 401. No query-string token, cookie login or CORS access is provided.
- `POST /diagnostic`: requires that same token, matching `X-Diagnostic-Run` header,
  `DIAGNOSTIC_ENABLED=true`, `CREDENTIAL_APPLICATION_CONFIRMED=2026-10-02`, both
  nonempty unpadded SmugMug credentials and a configured run ID. Browser Origin/Cookie
  requests are rejected. Wrong hostname, HTTP or query strings are rejected.
- Committed defaults keep the action disabled, application confirmation false and
  run ID empty. Merely entering secrets cannot enable a test.
- A durable transaction marks the run consumed BEFORE the outbound fetch. Concurrent
  calls, retries, isolate restarts and network failures cannot reuse that run ID.
  Do not delete its durable state. Each new run ID requires new owner authorization.
- No automatic retries or redirect following. Twenty-second fetch timeout; response
  body limit 64 KiB. Tokens are discarded; no account grant or gallery access occurs.
- Diagnostic access secret must be independently generated: 32 random bytes encoded
  as unpadded base64url (43 characters). Never reuse either SmugMug credential.
- No application logging. Observability is deliberately disabled to keep auth-bearing
  diagnostic invocations out of Worker logs/traces. No raw captures are stored.

## Evidence and limitations

Reports distinguish application-constructed headers from actual transmitted headers:
transport-level observation is unavailable. UTC timestamp is recorded immediately
before fetch, after signing. Response status, all runtime-visible header names,
sanitized values, correlation IDs, redirect presence, and sanitized body are returned
only to the authenticated caller. Known credentials and signature values are removed
from retained header values. Other potentially sensitive headers are withheld.

Form-urlencoded response bodies retain every field with only enumerated protocol
values disclosed; sensitive/unknown values and unknown field names are redacted.
They are explicitly labeled reserialized, not raw bytes. Unsupported formats,
oversized bodies and capture failures are labeled incomplete/withheld, never a full
capture. Unexpected transport exception text is not exposed. Provider receipt is
not independently verified merely because a response was received. Correlation IDs
can be supplied to Sebastian for confirmation.

The report contains an API-key placeholder for the owner to complete through the
existing private SmugMug support channel. Never commit real support captures or keys.

## Offline validation

From the repository root, after installing the existing lockfile dependencies:

    node scripts/test-smugmug.mjs
    node --test diagnostics/smugmug/worker.test.mjs
    npx --no-install wrangler deploy --config diagnostics/smugmug/wrangler.jsonc --dry-run

Tests use synthetic values and mocked fetch only. The dedicated configuration was
packaged using the branch-pinned Wrangler 4.83.0 and also Wrangler 4.135.0. Website
Astro assets are not part of this bundle. Root website code/config is not changed.

### Phase 3A: reproducible real-runtime validation

Install and run the isolated, locked harness from the repository root:

    npm ci --prefix diagnostics/smugmug/runtime-tests
    npm test --prefix diagnostics/smugmug/runtime-tests

The harness pins Miniflare 4.20260730.0, workerd 1.20261019.1 (including the
transitive override) and esbuild 0.25.4. It does not change root dependencies.
The compatibility date remains 2026-10-20. All outbound Worker fetches terminate
at a synthetic in-process service with no network fallback. No real credentials
are used. Local SQLite storage is created in temporary test directories.

The previous old binary supported only 2026-04-22. The installed Miniflare 5 alpha
required a different constructor API; even after using its official converter,
its binary supported only 2026-09-25. The pinned stable harness and newer workerd
resolve both problems without changing the deployment date or security settings.

Real-runtime testing also exposed an invalid exported ENDPOINT constant in the
Worker entry module. The deployment entry now exports only the fetch handler and
RunGate class; testable implementation exports live in core.mjs. Security logic
is otherwise unchanged. Node unit tests import core.mjs; runtime tests bundle the
actual deployment entry worker.mjs.

The suite validates configured defaults, private readiness, binding presence,
SQLite single-use claims, 12 concurrent requests, replay, consumption across full
runtime restart, sanitized evidence, request-token-only success, redirects, 503,
unknown/oversized responses, the actual 20-second fetch timeout and no retries.
A thrown Node mock callback becomes an HTTP response in Miniflare, so the transport
failure test instead exercises the Worker's real abort deadline against a delayed
mock response. It does not mislabel a mock HTTP 500 as a connection failure.

## Deployment handoff (not performed)

Cloudflare CLI access was checked: `You are not authenticated. Please run wrangler login.`
No Cloudflare account-management connector or environment API token was available.
Do not use Wrangler temporary/claim deployments: expected account ownership is required.

1. Use a checkout of the new verified smugmug-discovery checkpoint, preserving newer
   changes. Run `npm ci` if dependencies are missing.
2. On an owner-controlled machine, authenticate Wrangler securely to the intended
   Cloudflare account. Run `npx --no-install wrangler whoami` and verify the account.
   Set `CLOUDFLARE_ACCOUNT_ID` to that verified account ID if selection is ambiguous.
   Never paste a Cloudflare API token or SmugMug credentials into ChatGPT.
3. Verify this dedicated config still has `DIAGNOSTIC_ENABLED=false` and no routes.
   Deploy ONLY with this explicit command from the repository root:

       npx --no-install wrangler deploy --config diagnostics/smugmug/wrangler.jsonc

4. Verify **giolina-smugmug-diagnostic** exists in the expected account under
   Workers & Pages. Record its actual workers.dev URL and deployment/version ID.
   Do not assume the account subdomain from the old diagnostic URL.
5. In that NEW Worker's Settings > Variables and Secrets > Add, choose Secret and
   enter these separately, directly from the October 2 SmugMug registration:
   `SMUGMUG_API_KEY`, `SMUGMUG_API_SECRET`.
   Add a separately generated `DIAGNOSTIC_ACCESS_TOKEN` as another Secret.
   Save/deploy only this new Worker. Do not edit the production giolina settings.
6. Leave the three configuration variables at their committed disabled defaults.
   Verify authorized readiness using a secure HTTP client with the access token in
   its Authorization header, never URL/query string. Public readiness must return 401.
   The authenticated report must show actionEnabled=false. Record deployment evidence.

Entering dashboard secrets may create a deployment. Always check the selected Worker
name. Configuration deployments reset the arming variables to these safe defaults.

## Later live-test phase: separately authorized, NOT part of this handoff

First confirm owner-entered credentials came from October 2; readiness only proves
presence. After explicit permission for exactly one test, choose a fresh 16–80 character
alphanumeric/hyphen run ID, set confirmation to `2026-10-02`, and enable diagnostics
only on this Worker. Use a protected POST with the access token and matching run header.
Save its sanitized response privately; disable immediately afterward. Do not repeat a
failed/ambiguous run. A lost response still consumes the run; stop and report that gap.
Do not automate rearming or change run IDs to retry. Do not retire either registration
based solely on request-token success.

References:
- https://api.smugmug.com/api/v2/doc/tutorial/authorization.html
- https://developers.cloudflare.com/durable-objects/api/sqlite-storage-api/
- https://developers.cloudflare.com/workers/configuration/secrets/

## Simplest dashboard deployment (later phase; not performed)

Use Workers Builds with GitHub so the dedicated Wrangler config provisions the
Worker and its SQLite Durable Object together. Do not paste only worker.mjs into
the dashboard editor: it imports local modules and needs the storage migration.

In the expected Cloudflare account, Workers & Pages > Create application >
connect/import Git repository, select giolinafilms/Giolina, then configure the
NEW application before the first deploy:

- Worker/project name: giolina-smugmug-diagnostic
- Deployment branch: smugmug-discovery (never main)
- Root directory: repository root
- Build command:
  node --test diagnostics/smugmug/worker.test.mjs && npm ci --prefix diagnostics/smugmug/runtime-tests && npm test --prefix diagnostics/smugmug/runtime-tests
- Deploy command:
  npx --no-install wrangler deploy --config diagnostics/smugmug/wrangler.jsonc
- Disable automatic builds for other branches on this NEW Worker.
- Do not use the automatically suggested root Astro deployment command.

If the UI does not allow setting the branch and explicit config command before
first deployment, stop and use the explicit CLI handoff above. Do not launch a
root-config deployment and try to repair its target afterward.

The first deployment applies migration v1 and creates RUN_GATE backed by the
RunGate SQLite class in this new Worker. No existing namespace IDs are referenced.
Confirm this binding and the disabled variables after deployment. If Cloudflare
asks for an upgrade/payment, stop; no purchase is authorized.

Enter the three runtime secrets only under the NEW Worker's Settings > Variables
and Secrets, not its build-time secrets. Keep all arming variables disabled.
A normal browser visit to /readiness should return 401. Use a secure HTTP client
with a Bearer header for the private readiness result. Record its URL/version ID.
Do not enable or call /diagnostic in this deployment phase.

Cloudflare build documentation:
https://developers.cloudflare.com/workers/ci-cd/builds/configuration/

## Phase 3C: first Git-connected build trigger — October 20, 2026

The owner confirmed that the separate `giolina-smugmug-diagnostic` Worker is
connected to `giolinafilms/Giolina`, branch `smugmug-discovery`, with preview
builds disabled and the explicit `diagnostics/smugmug/wrangler.jsonc` deploy
command. This documentation-only commit requests the first connected build.
Build success, migration provisioning and hosted readiness must be verified
separately; this note does not establish deployment success. OAuth remains
disabled, and no credentials or production configuration are changed.


## Owner readiness page

Open the isolated Worker's root workers.dev URL, enter the existing diagnostic
access token in the masked **Diagnostic password** field, and select **Check
Readiness**. Never enter a SmugMug API key or API secret into this page.

This public static page reveals no runtime configuration. Its script sends a
same-origin GET to `/readiness` using the existing Bearer authentication and a
custom readiness header. Cross-origin browser requests, cookies and preflights
are rejected; no CORS permission is added. The browser omits cookies, refuses
redirects and does not automatically retry. Static assets and private responses
are non-cacheable. CSP limits scripts/styles/connections to this origin, blocks
forms and framing, and no third-party resources are used.

The password field clears before the request; the script drops its token
reference immediately after dispatch and again in cleanup. No browser storage,
cookies, URLs or logs retain it. Leaving/hiding the page clears the field/results
and aborts an in-flight check. JavaScript cannot guarantee physical memory erasure;
the token necessarily exists in browser request memory while the request runs.
Do not save it through a browser password-save prompt or export request traces.

Readiness checks binding presence and credential formatting only. RUN_GATE
presence does not exercise its storage. A passed readiness check is not successful
SmugMug authentication. This readiness action does not arm or execute OAuth; the separately reviewed
Phase 3F owner-test section above adds explicit controls for the later test. The protected diagnostic POST and its
browser-origin rejection remain unchanged. All Wrangler arming defaults remain
disabled, and existing runtime secrets are not changed by this implementation.

Tests in worker.test.mjs cover the owner page, same-origin/CSRF rejection,
unauthorized requests and browser-script lifecycle/error behavior using a minimal
DOM with synthetic fetch. The real workerd suite additionally checks the page and
readiness paths with all outbound calls intercepted; the existing durable replay,
concurrency, restart and OAuth-redaction cases remain in place.
