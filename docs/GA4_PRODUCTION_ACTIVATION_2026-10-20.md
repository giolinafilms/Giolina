# GA4 consent-based production activation

Baseline main: 149fec5feb6492c4b83ab2212b44a4adf175f214. Rollback Worker: 0e6adeaa-66ae-48fa-b1bd-4ad558c66c15.

Authenticated Google Analytics using the owner's secure login and tablet approval. Verified account GioLina Films, property giolinafilms.com (406223007), stream 6089670506, measurement ID G-KD1ES061DH. All Enhanced Measurement options and both page-view options were initially enabled. Saved and reopened settings to verify page loads/scrolls/video ON; history changes/outbound clicks/search/forms/downloads OFF. No changes to retention, Google Signals or advertising features. No connected site tags shown.

Integrated existing preview consent and sanitized loader into current production source. Static default enabled:false; Worker enables only canonical HTTPS public routes when GIOLINA_ANALYTICS_ENABLED=true. privacyApproved:true reflects the approved consent behavior and scoped notice; preview/private origins and routes stay excluded. One explicit initial page_view with send_page_view:false; dashboard history views OFF. Contact events are intent only, not completed leads. No customer form values transmitted by custom events.

Privacy notice at /privacy/ linked in footer and consent panel. It describes confirmed analytics configuration and verified Formspree / owner-confirmed HoneyBook usage, links official provider policies, and identifies info@giolina.co for requests. It makes no fixed inquiry-retention or deletion promise, no anonymity claim and no legal-compliance certification. The business's own inquiry retention schedule remains unspecified; the notice explicitly distinguishes it from GA4 retention. Privacy page is noindex and does not load GA4, but supports consent withdrawal.

Historical GA Home reports showed 27 views over the last 7 days under older page titles (25 Home Page, 1 Contact Us, 1 Experience). These titles are consistent with older content but do not establish hostname/source; no historical data or tags removed. No active users in the last 30 minutes before activation testing.

Executed candidate validation: Astro production build using retained generated catalogue; public/analytics tests 58/58; protected-service tests 90/90; site checks 36 routes, 97 redirects, 11 sitemap URLs. All venue/media/integration files and production sitemap unchanged. Full catalogue-refresh build is performed by established Cloudflare workflow; no local repeat of previously blocked gallery fetches.

Rollback: revert this scoped activation release via normal GitHub workflow or redeploy the baseline Worker. Dashboard measurement changes are separate and would not be reversed by GitHub/Worker rollback. Do not restore broader automatic tracking merely to roll back the website.

Deployment and live reception must be reported from actual post-deployment evidence, not inferred from these local tests.
