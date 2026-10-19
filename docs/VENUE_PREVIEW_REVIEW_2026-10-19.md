# North Jersey venue preview review

## Release boundary
Production baseline d26d052ae3a01792ed9d1241e2c9a805266fec6b / Worker b56b226b-91f9-4e06-ab90-f540dbd245f4 is unchanged. Existing preview head before this work: 58f07fdeed06a4079236c5f27442835788da972b. Prior preview design/media content equals the production content; production additionally contains indexing policy, disabled analytics preparation and the 10-URL sitemap. Preview update preserves both histories and its existing isolated CRM preview configuration.

The two new pages are PREVIEW ONLY. Neither is added to the sitemap, video sitemap, main navigation, production indexing allowlist or analytics allowlist. Even accidental later deployment cannot make these routes indexable through the existing policy. This is not publication approval. Before an eventual production merge, remove preview-only environment configuration from the production diff and obtain owner approval for final pages/media.

## Review links and content
- /weddings/the-venetian-garfield/: Stephanie & Danny, film 331322129. Existing staircase photograph is the film cover; the four-photo story uses staircase, evening portrait, entrance and first dance, with existing 640/1024px WebP assets and viewer. Dance-floor image was inspected but omitted for a tighter selection.
- /weddings/the-park-savoy-florham-park/: Deanna & Anthony, owner-specified film 759600674. Cover downloaded from that exact video's Vimeo oEmbed response, author GioLina Films, 1280x533, 572-second duration. No independent still-photography assignment is implied. The current broader portfolio uses another edit of this couple (768293139); it is untouched. Confirm final edit choice for marketplace uploads.

Canonical URLs are proposed eventual production URLs; they do not exist on production yet. Pages have unique metadata, one H1, WebPage/Place/MediaObject and BreadcrumbList schema, real media dimensions/alt text, service links and Contact actions. Venue Place markup is about the venue, never a GioLina office or endorsement. No wedding dates, vendor credits, testimonials or awards invented. No VideoObject rich-result claim or fabricated publication timezone.

Existing header/footer, film dialog and photo viewer are reused. A direct Vimeo watch link provides a non-JavaScript fallback. Before production approval, consider a visible inline player if maximizing Google video discovery is a priority: the current site-standard modal requires a click to instantiate the iframe, and schema alone does not guarantee video indexing. No new autoplay or tracking behavior.

## Media provenance and permission review
Stephanie/Danny images were already publicly approved in this repository. Park Savoy cover is the exact user-authorized film's provider thumbnail, downloaded unchanged; no generated or stock content. Owner must approve final media/context for these new venue pages and confirm releases permit this reuse before production. Public availability alone is not treated as a new release.

## Google and measurement continuation
Use docs/SEO_DIAGNOSTICS_AND_GROWTH_2026-10-19.md as the completed diagnostic baseline. No new authenticated Search Console/GA4 or Cloudflare security-log evidence was available; no repeat login attempts. Do not label the sitemap accepted. Existing property: Domain giolinafilms.com, info@giolina.co. Owner: expand sitemap error details, record last-read timestamp/code, resubmit existing sitemap once, inspect homepage and primary service URLs, submit video sitemap if absent, and share processing results. Actual crawler/security logs are needed before WAF recommendations.

GA4 remains disabled. Owner must verify Admin > Data streams > website URL/ID G-KD1ES061DH and approve consent/privacy requirements. Smallest future implementation: basic consent gate around existing loader, advertising consent denied; normalize existing Contact aliases before intent classification; preserve approved origin-only external referral information for source attribution rather than a blank referrer; strip queries and customer information. Review Enhanced Measurement to avoid duplicate page views/form events. Test reject/accept/revoke/reload/multi-page navigation and preview exclusions, then Realtime/DebugView. No activation now.

Measure organic landing page -> contact visit -> contact_intent -> independently confirmed inquiry -> qualified lead -> consultation -> booking. HoneyBook navigation is intent, not proof of submission. Only implement a confirmed inquiry event after verifying a supported provider success callback/webhook or authenticated success destination. Do not submit fake inquiries or transmit PII. A manual inquiry-source log is the immediate fallback.

## Focused redirects and proposed owner-approved action
Independent web retrieval normalized HTTP apex to HTTPS content but exposed no HTTP chain; both www URLs were inaccessible to that service. This does not establish a status-level permanent redirect. Prior curl observations were HTTP apex200 and www intermediary503. No routing/DNS/SSL changes.

If independent network tests confirm failure, first inspect whether www is already routed and covered by TLS. Proposed narrow rule, subject to specific approval: match only giolinafilms.com or www.giolinafilms.com AND (HTTP scheme OR www host), redirect permanently to https://giolinafilms.com plus unchanged path and query. Do not include subdomains or giolina.co. If www DNS/custom-domain/TLS changes are needed, report exact current records and proposal before changes. Do not redirect POST/inquiry requests without separately verifying method handling.

## Marketplace and growth review
Full drafts are supplied separately in GioLina-Marketplace-Review.md for owner review.
Research, official venue sources, legitimate service-area business policy and 60–90-day plan: docs/NORTH_JERSEY_GROWTH_2026-10-19.md.
No marketplace accounts edited, ads purchased, contracts accepted, reviews altered or messages sent. North Jersey is primary. Staten Island means client origin, not claimed wedding-venue history. Madison family address is not a staffed office; hiding it does not establish eligibility if it is not the real operating base.

Owner decisions: approve page design/copy/media; confirm actual business base and permitted service areas; resolve prices/crew/deliverables/secondary phone in listings; approve proposed profile descriptions; verify GA4 ownership and consent requirements; supply Search Console error details. New venue publication requires separate explicit approval.
