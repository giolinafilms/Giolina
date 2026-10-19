# Reconciled production candidate, not launched

Approved preview baseline: f2a16eb59e8b5c7744d43f4f9f2f79744153e11a.
Previous preparation checkpoint: 62f9bddbb811d7ab97c02b3b02fea260d3c56516.
Main remains 00e7e81c9fe9ae5bf88ed0ed9c8b8acc3a82d83b.

This candidate takes the approved preview content unchanged and restores the narrow runtime production policy, analytics loader and tests. Clean public URLs and all 97 redirects are retained. Sweet Sixteen has 40 collage photographs, eight per event, and five unchanged films. Wedding Collection remains nine categories, 713 placements and 709 unique photographs.

The approved week-14.mp4 is 10,721,131 bytes, SHA-256 460c1941cbd2c2ff2ca4df7097c5039110946ab464ca7d77dd3576c8396e51c5. No media replacement is included.

## Controls

GIOLINA_INDEXING_ENABLED and GIOLINA_ANALYTICS_ENABLED default off and require the exact string true, HTTPS and the exact giolinafilms.com origin. Only the approved public route allowlist can activate them. Preview, www, private, retired and error routes stay protected. The www host requires a separately approved canonical redirect.

GA4 G-KD1ES061DH sends one manually configured page view without query, fragment or referrer and reports contact intent, not a fabricated successful lead. Advertising signals are disabled. Before activation verify account ownership, consent requirements and Enhanced Measurement settings; account-side auto events must not undermine sanitized payloads. No Google event delivery is claimed by local tests.

Production has only the declared ASSETS binding. This release uses an empty previews configuration so its candidate does not inherit the CRM database or authentication configuration used by the approved website development preview. No production routes or activation variables are added. The approved preview branch is untouched.

## Validation and deployment boundaries

Run npm run build, npm run check, node --test scripts/*.test.mjs and npm run check:admin. The normal portfolio feed build is explicitly authorized read-only. Runtime production-policy tests use Miniflare and do not activate public indexing or analytics. A hosted branch Preview must additionally be checked.

Updating prep/production-readiness is authorized for isolated candidate hosting. Updating main, running a production deployment, proxying DNS, modifying TLS/DNSSEC or attaching routes is not authorized.

## Future launch, separate approval required

1. Freeze the reviewed candidate SHA and record full current production and candidate version IDs, current routes/redirect rules and DNS export. Retain WordPress hosting and the owner-downloaded October 15 files/database backup; restoration has not been tested.
2. Verify active certificates for apex/www, origin certificate compatibility and current TLS mode. Do not infer edge certificate readiness from origin HTTPS.
3. After explicit launch approval, promote the reconciled candidate while preserving main history. Confirm main's configured build npm run build and deploy npx wrangler deploy. Verify the resulting active Worker version before public routing.
4. Keep A apex 160.153.0.49 and www CNAME giolinafilms.com. Proxy only those website records; attach exactly giolinafilms.com/* and www.giolinafilms.com/* to the verified Worker. No wildcard subdomain route. No additional nameserver migration.
5. Apply the reviewed HTTPS/non-www redirect with path/query preservation, checking for existing-rule conflicts. Preserve every mail, verification and protected client-service record, and the whole giolina.co zone.
6. Verify clean/legacy URLs, HTTPS, photos, films, contact, scheduler, client services and Google Workspace. Enable production indexing/analytics only after separate approval; verify preview noindex, GA4 behavior and Search Console ownership before production sitemap submission.

## Rollback

Remove only the two new website Worker routes and restore launch-specific redirect/proxy settings to return traffic to retained WordPress origin 160.153.0.49. Verify apex/www and protected services. For Worker-only faults use the full recorded previously verified production version, and reconcile Git so a later build cannot overwrite the rollback. Do not treat a short version prefix or build ID as a rollback version. Keep DNS authority and email intact; nameserver rollback is not the first website rollback mechanism.
