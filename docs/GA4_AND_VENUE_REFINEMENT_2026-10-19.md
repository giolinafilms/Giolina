# GA4 readiness and approved venue refinements — October 19, 2026

## Recovered state and completed Cloudflare work
Production main d26d052ae3a01792ed9d1241e2c9a805266fec6b; Cloudflare GitHub check reports successful production build and Worker version b56b226b-91f9-4e06-ab90-f540dbd245f4. Preview baseline 539ca2d792eed9e263d7c9ec2d747f8b96eb1bb2. No production release in this change.

Owner now confirms Search/Agent Allow, Training Disallow, Bot Preference Sync enabled; Googlebot blocking off, main sitemap Success with 10 discovered pages, video sitemap Success. This supersedes earlier unresolved sitemap reports. Do not repeat that investigation or change bot policies. Sitemap success is not individual-page indexing evidence.

## Venue implementation — preview only
Remove visible runtime labels and separate Watch on Vimeo links from the two existing stories. Preserve duration in the source metadata, existing VideoObject data, exact film IDs 331322129 and 759600674, established embedded dialog/player and all provider controls. Preserve alternate Park Savoy portfolio film 768293139 elsewhere. Relabel the existing reciprocal links Explore more wedding stories; retain descriptive couple/venue anchor text, relative paths and unobtrusive bottom position. No new routes, navigation, sitemap entries, production gallery edits or client presentation links.

The Venetian retains the established four-image varied grid and accessible lightbox. Recovered fifth image stephanie-danny-dance-floor.webp was visually reviewed: a casual reception moment with busy background and strongly magenta lighting; it does not improve this concise selection enough to add. Existing four approved images remain: staircase, evening portrait, entrance and first dance. A request for the documented StephanieDanny/Wedding source was blocked by automatic approval review as potentially private media. No retry or alternative access was attempted. Additional curation needs explicit gallery-access authorization or owner-supplied exports; never substitute other events. Park Savoy remains video-only.

Existing owner-review catalogue GioLina-Marketplace-Review.md recovered: 18 wedding event entries / 17 venues; 4 confirmed Sweet Sixteen events / 3 venues, with Devynn separately retained. Jen & Mike promotional hold, Megan & Ralph venue ambiguity and Julianna/Devynn film identity question remain unresolved and preserved. No new event pages.

## Analytics verification and constraints
Repository ID G-KD1ES061DH is not proof of property ownership. Existing Google browser tab was inspected and remains at sign-in; no repeated login attempt. Account/property/web stream URL, Enhanced Measurement and key-event settings remain unverified. No activation, tracking-code changes or consent UI was deployed. Both existing feature flags remain false for analytics.

Recovered loader: production-origin/public-path allowlist, duplicate guard, manual single page_view with send_page_view:false, clean page_location without query/hash, signals/ad personalization disabled. It currently blanks page_referrer, losing the original referral source; intent matching misses legacy contact aliases. These should be corrected with consent-gated activation, not by flipping the flag alone.

## Exact proposed consent behavior — owner approval required
Use basic opt-in analytics consistently across visitors, avoiding location inference. A compact nonmodal panel with equal Accept analytics and Decline actions; no tracking if ignored. Suggested text: “Allow optional analytics cookies to help us understand how this website is used? Your choice will not affect browsing or inquiries.” Include a Privacy notice link. No Google analytics script, cookies or consent-denied pings before acceptance. Keep ad_storage, ad_user_data and ad_personalization denied; grant only analytics_storage after acceptance. Keep Google Signals and advertising personalization off. Respect an available Global Privacy Control signal as a decline for this optional analytics implementation.

Remember acceptance or rejection with a versioned first-party preference (proposed six months); provide a persistent footer Analytics preferences control. Withdrawal must immediately stop future analytics events, disable the tag, remove accessible first-party GA cookies and reload without analytics. No retrospective replay of clicks before consent. No blanket compliance claim: applicability depends on visitor geography, processing volumes and business data practices not established here. Google's EEA/UK/Swiss policy requires disclosures and consent where legally required. No existing dedicated privacy/consent implementation was found in the public source scan. Prepare an accurate analytics notice and owner-confirmed retention/contact/data practices before launch; do not invent policy statements about other integrations.

After approval, preserve external referrer origin only (HTTPS/HTTP, no path/query/hash/userinfo; empty for private GioLina client subdomains), rather than the current always-empty referrer. Keep page_location canonical and free of query/hash. Normalize same-origin /contact/, /contact-us/ and /contact-us-2/ click targets to inquiry_page without changing navigation or recording raw URLs. Preserve phone/email intent without recording addresses or numbers. Identify HoneyBook navigation only from existing verified destinations. Contact page_view and contact_intent are not leads. HoneyBook's embedded form success requires a documented, verified completion signal; otherwise reconcile real inquiries manually.

Account-side review before activation: check Enhanced Measurement history pageviews, outbound clicks, forms, search terms and file events; disable unneeded automatic collection that duplicates deliberate events or transmits raw query/link data. Current site uses normal document navigation; maintain one explicit page_view per allowed document after consent. Do not mark generic form_submit, contact visits or inquiry clicks as completed inquiries. No fake test inquiries.

## Minimum owner evidence
1. Existing Analytics account: Admin > Data streams > existing web stream. Confirm account/property names, website https://giolinafilms.com/ and G-KD1ES061DH. Provide stream details and Enhanced Measurement/key-event settings, or secure authenticated access. No secrets in chat.
2. Approve the consent behavior above, preference duration and an accurate analytics privacy notice. Confirm relevant business/data practices for privacy review. Activation follows implementation/testing, not approval alone.
3. Existing Search Console Domain property: inspect /, /photography/, /cinematography/, /sweet-sixteen/, /photography/wedding-collection/, /about-us/, /contact/. Capture indexed status, last crawl, crawl/index permission, both canonicals, exclusion reason and video result when present. Request indexing only for eligible important pages absent from Google; do not resubmit successful sitemaps repeatedly.
4. Review both venue previews; production publication remains separately gated. If expanding Venetian photos, authorize read-only access to the specific gallery if private, or supply selected original exports with event/venue identity. No need to repeat the complete venue catalogue.

## Verification plan and sources
Run normal build, public/venue tests, protected-service suite, asset decode checks and live preview/indexing checks. DOM player/lightbox tests verify wiring and lifecycle, not real provider playback or physical-device rendering. Realtime/DebugView and actual Google indexing cannot be inferred from public responses.

Official references consulted:
- https://developers.google.com/tag-platform/security/concepts/consent-mode
- https://developers.google.com/tag-platform/gtagjs/reference#consent
- https://www.google.com/about/company/user-consent-policy/

## Executed verification
Normal npm run build passed: 37 pages. npm run check passed: 36 checked routes, 1006 asset references, 9 main pages, 97 redirects and 10 sitemap URLs. Public suite: 56/56. Protected-service suite: 90/90. Nine selected image derivatives decoded successfully. Live public checks on all seven priority URLs returned 200, index/follow, matching self-canonicals and no analytics script. These results do not establish Google-selected canonicals, indexing, Realtime reception or physical-device behavior.

The first normal build was rejected by automatic review for uncertain client-domain scope. After inspecting the exact nine already-approved public /Media/Wedding-Photography feed paths and prior approved build documentation, the unchanged normal build passed normal review. The separate potentially private StephanieDanny gallery request remains blocked and was not retried.
