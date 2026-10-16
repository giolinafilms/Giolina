# Inactive production release candidate

Approved website baseline: `fcfe9a9cbb02a0eabd06422b9d73b7b59a5e7f61`.
Main branch examined: `00e7e81c9fe9ae5bf88ed0ed9c8b8acc3a82d83b`.
Their common ancestor is `be964b98e953c0a3038023fb3dded9091da4aba6`.
Preview has 191 unique commits; main has 16. Main-only changes are early page refinements and the older SmugMug discovery implementation. Preserve both histories, but use the approved preview tree as the content baseline. Do not resurrect old page copies, withdrawn assets or obsolete discovery routes by an automatic merge.

The previously reported local candidate `2f399fc2ebc108edfcac3463ef009ddfa3563aa3` was not present in the resumed local repository or available through GitHub. This candidate restores its narrow release controls from the session record and is independently tested. It is not represented as the same commit.

## Scope

Only `worker.js`, a production policy module, an inactive analytics script, release tests and these notes change. Approved pages, photography, media, protected handlers and Wrangler configuration remain unchanged.

The committed week-14 video is 10,721,131 bytes, SHA-256 `460c1941cbd2c2ff2ca4df7097c5039110946ab464ca7d77dd3576c8396e51c5`. Never include the smaller unexplained file from the original checkout.

## Runtime controls, disabled by default

- `GIOLINA_INDEXING_ENABLED="true"` changes robots metadata/headers only for successful allowlisted public routes on `https://giolinafilms.com`. It supplies production sitemap references in robots.txt.
- `GIOLINA_ANALYTICS_ENABLED="true"` enables the loader only for successful allowlisted public HTML on the same exact HTTPS origin. The client also checks origin and path.
- Missing flags, all other values, preview hosts, www, private routes and error responses remain protected. The www hostname requires a separately approved canonical redirect.
- Neither flag is added to Wrangler configuration or enabled by this candidate.
- GA4 measurement ID: `G-KD1ES061DH`. One manual page view, sanitized location without query/fragment, empty referrer, no form field values, advertising signals disabled. Contact links emit `contact_intent`, never a successful lead.
- Native hosted Formspree has no verified on-site success callback. Do not synthesize `generate_lead` or treat submission attempts as conversions. No form integration changes.

Before analytics activation, verify stream ownership, applicable consent requirements and Enhanced Measurement configuration. Automatic form/history events and unsanitized automatic URL collection must not undermine the controlled events. Verify actual event delivery only after separately authorized activation. Local tests do not contact Google.

## Release gates

Run `npm run build`, `npm run check`, `node --test scripts/*.test.mjs`, and `npm run check:admin`.

The locked local workerd supports 2026-09-25, so the runtime fixture uses that date. Deployment configuration stays at 2026-09-30. Hosted candidate verification is required before launch.

Confirm production configuration and current Worker version before updating main. The existing Worker is `giolina`, build `npm run build`, entry `worker.js`, static output `dist` with `ASSETS`. Do not copy preview CRM variables or database bindings into production. The asset binding is declared by the source configuration even if the previous production dashboard was empty.

Updating main can trigger production Worker deployment. It requires a separate reviewed release action; this candidate does not update main. No production routes, domains, DNS, indexing or analytics activation are authorized.

## Future routing and rollback

Preserve WordPress origin and full DNS zone exports. Verify backup restore capability, DNSSEC state, assigned Cloudflare nameservers, zone record parity, certificates and TLS before any routing change. Use exactly `giolinafilms.com/*` and `www.giolinafilms.com/*`, never a wildcard subdomain route. Do not attach a branch preview as production.

Route-based rollback removes only those two new routes and restores any launch-specific redirect rules, returning to the retained origin. Record the current production Worker version for Worker rollback. DNS-authority rollback requires the original zone, nameservers and matching DNSSEC state, with allowance for cached delegation. Verify email and every protected client-service hostname separately.

DNS export contents and private backup details are deliberately not included in this public source document.
