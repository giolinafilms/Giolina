# SEO Activation Implementation Plan

Goal: Enable indexing only for the approved production website, preserve private/preview exclusions, and record Google account blockers.
Architecture: Use the existing Worker productionPolicy allowlist and strict-string switches. Set the indexing variable in the existing Wrangler config; preserve dashboard variables with keep_vars. Keep analytics explicitly disabled until account and consent settings can be verified. No content, infrastructure, or route redesign.
Tech stack: Existing Astro 7, Cloudflare Worker, Wrangler 4, Node tests and Miniflare.
Spec: Owner's October 19 Google Search, SEO and Analytics Activation request.

## Constraints and review focus
- Preserve release 529846947efe798d42770e0bff4f28122f0cd77f and all 97 legacy redirects.
- Only exact HTTPS giolinafilms.com and existing public allowlist may be indexable; error responses stay noindex.
- Preview, aliases, private/admin/auth routes must never gain indexing or analytics.
- GA4 G-KD1ES061DH is repository evidence, not verified account ownership or realtime delivery. No consent mechanism found: do not activate tracking.
- Do not modify DNS, Worker routes/domains, email, galleries, contact/booking or WordPress hosting.

## Tasks
- [x] Verify main SHA/Cloudflare check and recover all 913 source files by Git blob hash.
- [x] Inspect current policy, Google access and hostname response chains.
- [ ] Add failing test that the deployed config enables public indexing, preserves dashboard vars, and leaves analytics off.
- [ ] Add config vars GIOLINA_INDEXING_ENABLED=true, GIOLINA_ANALYTICS_ENABLED=false and keep_vars=true; update the older no-vars assertion narrowly.
- [ ] Run real Worker tests using the actual config across all public pages, preview/private/error routes, robots/sitemaps and all legacy redirects.
- [ ] Build, audit nine-page SEO metadata, run all public and protected-service tests.
- [ ] Publish only scoped files to main using GitHub expected-head guard; verify Cloudflare completion and actual live directives.
- [ ] Report account access, consent, www, mobile/performance limitations and exact owner steps. Do not claim Google submissions.
