# Final GA4 activation readiness — October 20, 2026

## Recovered state
Production main 149fec5feb6492c4b83ab2212b44a4adf175f214; successful Cloudflare version 0e6adeaa-66ae-48fa-b1bd-4ad558c66c15. Preview 9cb3ecb00d15d37335dc0da1f6154ee5b7cc903b. Preserve Park Savoy in production and Venetian only in preview. Do not merge the entire preview branch into main.

## New evidence
Owner verified stream 6089670506 / G-KD1ES061DH and retention; no further ownership proof requested. Live homepage and Contact DOM show enabled:false, no GA/Google Tag Manager script, and a Cloudflare Insights beacon. That beacon is not evidence of a GA4 installation. Repository source scan found the GA loader only, not another GTM/Measurement Protocol implementation in the scanned production source/public/Worker files. This cannot explain historical collection or exclude an external server, another hostname, tag destination or old installation. No source was removed.

Analytics account navigation reaches Google sign-in; no Realtime or DebugView access. Do not repeat login attempts or request credentials in chat.

## Concrete overlap
public/wedding-collection.js calls history.replaceState while viewing photographs. Google documents that Enhanced Measurement history page views remain active despite send_page_view:false. The proposed loader sends one explicit initial page_view, but does not suppress Google's history listener. Therefore the current account settings can produce extra gallery page views. This is a verified risk, not observed live duplicate delivery while production tracking is disabled.

## Smallest safe account alignment
In Admin > Data streams > giolinafilms.com > Enhanced measurement settings, turn off Page changes based on browser history events. Keep page loads enabled: send_page_view:false suppresses the config-triggered initial view and the loader sends exactly one explicit sanitized view.

For the initial minimal rollout, disable automatic Outbound clicks, Site search, Form interactions, and File downloads until their parameters have been audited. The existing custom contact_intent event already covers email, phone, Contact aliases and the exact scheduling destination without transmitting those destinations. Do not count form_submit or contact_intent as confirmed leads. Scrolls may remain enabled; automatic video tracking should not be represented as verified Vimeo tracking. The owner now explicitly approved these exact settings. No further approval is needed. Authenticated dashboard access or owner confirmation that these settings were saved is still required; neither is available. Do not repeat rejected sign-ins.

## Minimal owner evidence for existing collection
For the last 48 hours, inspect collected page_view data by Host name and Page location, with Stream ID and event count. Share only hostname/path summaries with query values and identifiers removed. Inspect this stream's Google tag installation/destinations and configured Measurement Protocol integrations; never share API secrets. If events are not page views, provide event names and counts. This will distinguish website-origin events from old/other-host/externally sent events; the generic active badge cannot do so.

## Existing preparation preserved
Compact nonmodal accept/decline; no tag before acceptance; six-month preference; footer control; withdrawal cleanup/reload; GPC; failed-storage denial; cross-tab withdrawal; sanitized external origin; Contact aliases; ad consent denied; no replay; public-production allowlist. Actual flags remain disabled. Consent signals marked inactive do not justify pre-consent Google requests.

## Publication and reception gate
Finalize the notice facts in ANALYTICS_PRIVACY_DRAFT_2026-10-20.md and integrate the notice beside the consent choice/footer before enabling. Stage only analytics changes on current production main, not venue files. Re-run build, public/protected/consent tests and controlled browser network verification. After activation, use Realtime/DebugView to observe one page_view per full page load, no gallery-history views, no requests before consent, and contact_intent without personal values. Verify withdrawal stops requests. Do not submit test inquiries. Confirmed lead tracking requires a verified provider success signal and is not implemented.

No production activation, account changes, infrastructure changes, or new venue publication performed in this follow-up.

## Latest follow-up

Owner-approved privacy contact and Enhanced Measurement configuration incorporated. Added /privacy/ preview notice with existing header/footer, footer Privacy link and consent-panel notice link. This route supports withdrawal but remains excluded from GA loading. Added tests for one explicit view across repeated initialization/history events and privacy-link/exclusion behavior. These tests do not execute Google vendor code or prove the dashboard history setting is off.

Main and its successful deployment remain 149fec5 / 0e6adeaa. No production change or repeat Google login. The historical activity indicator remains unresolved but is not an independent permanent activation blocker. Concrete remaining gate: approved Enhanced Measurement changes have not been observed saved, and post-consent vendor collection has not been tested under those settings. The notice is a reviewable preview; business inquiry-retention criteria remain unknown and are not invented.

Validation: cached-catalogue Astro production build passed; site and SEO checks passed; public/analytics/venue tests 66/66; protected-service tests 90/90. An initial link-check failure was corrected by including the real generated privacy route in validation; a test that selected the first anchor was corrected to target the actual Contact alias after the notice link was added. No Google vendor runtime or actual event reception tested.
