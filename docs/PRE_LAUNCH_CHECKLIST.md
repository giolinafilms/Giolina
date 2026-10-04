# GioLina preview pre-launch checklist

Preview only. Production canonical origin remains https://giolinafilms.com. No production cutover, DNS, email, Search Console or SmugMug changes are authorized by this audit.

## SEO and migration checks

- [x] Nine main pages: unique title/description, one H1, appropriate alt attributes and key-page navigation.
- [x] Current assets in main-page social/structured metadata; JSON-LD syntax and graph IDs checked.
- [x] Nine-main-page sitemap prepared; not submitted.
- [x] Six known legacy page equivalents, two sitemap endpoints, 90 captured uploads and three live-sitemap image references mapped (101 redirects); no guessed destinations.
- [x] Preview meta and response noindex protections retained. robots allows crawlers to read them.
- [x] GA4 G-KD1ES061DH preserved in inactive configuration.
- [ ] Approve production indexing configuration separately; current preview cannot be used as an indexable production deployment.
- [ ] Install/verify production GA4 tracking separately; preserving the ID is not evidence of event delivery.
- [ ] Decide whether to retain, redirect or retire legacy services*, schedule-a-meeting*, bianca-bobby* routes and old post/archive routes. No guesses were applied.
- [ ] Verify production canonical/domain choice, redirect mapping completeness and formerly indexed URLs against current Search Console data during the separately authorized launch phase.

## Functional/manual review

- [x] Hosted navigation and footer links across nine main pages; no desktop horizontal overflow at 1348px.
- [x] All 62 distinct local image URLs used by main pages return HTTP 200.
- [x] Contact required-email/message validation blocks an empty submission; Formspree configuration unchanged.
- [x] Scheduler loads 30-minute Consultation Call and availability, without making a booking.
- [x] Vimeo, MediaZilla, Love in a Minute, Sweet Sixteen and RTG film playback checked; observed videos playing unmuted; selected-player replacement/close cleanup checked.
- [x] Removed six blank future-gallery cards and unfilled Experience starting-price lines; no real media removed or prices invented.
- [ ] Test all nine main pages on real iPhone/Android portrait and tablet. Browser has no supported mobile viewport; responsive source review is not a visual/device pass.
- [ ] Perform a separately authorized genuine Contact submission and verify receipt/auto-response; no test email was sent here.
- [ ] Confirm whether the two Nicole & Philip Client Wedding Films cards (Vimeo 425185852 and MediaZilla XDcajHQdhs) are different cuts or a duplicate. No source/title guesses made.
- [ ] Supply/approve Frank's portrait for the About Us reserved position.
- [ ] RTG Vimeo 102347867 rejects preview embedding due to privacy settings; 87439618 requires Vimeo sign-in. Owner must confirm public access and actual film titles/posters. Both existing cards remain intact.
- [ ] Lauren & Tommy anniversary short is unavailable; no substitute added. Collection is functional without it.
- [x] Previous accessibility pass resolved cyan text contrast: established readable teal #128087 on white (4.71:1); deeper #126c72 remains on cream. Decorative brand cyan is preserved where appropriate.

## Assessment

Not ready for production yet. The preview is suitable for final review; functional checks pass within the limits above. Complete the manual/content decisions and the separate production tracking/indexing configuration before any approved launch. No Search Console or DNS action has been taken.

Checkpoint commits before this checklist's final publication: 62a81a8efe45d504eec1cacda6a0e11c830e4033 (page SEO), 9559efa4a3183def383b8dac41b335fb45f2469a (technical readiness). Final QA commit is in repository history.

## Final preparation pass — 3 October 2026

- [x] Current live WordPress page sitemap: all 22 page URLs preserved or redirected; hosted checks passed for all 213 previously configured routes/redirects/destinations.
- [x] Two original sitemap JPEGs recovered; their old paths and the captured Elementor placeholder path now redirect correctly. New destinations match captured bytes on the hosted preview.
- [x] Fifteen RTG generic numbered player labels replaced with verified provider titles; no film source/order/playback changes.
- [x] Cutover and rollback procedure documented; not executed.

See [visual audit](FINAL_VISUAL_QA.md), [complete redirect map](REDIRECT_MAP.md) and [production cutover plan](PRODUCTION_CUTOVER_PLAN.md). Remaining mobile/content/production configuration gates above still apply.

## Functional and content checkpoint — 4 October 2026

Baseline reviewed: `933f2336cc1be4848bd635a7a686e59fa1d0a40d`, branch `preview/homepage-photography-rotation`.
Preview: https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/ .

- Build/check passed: 29 audited routes, 1120 asset references, nine main SEO pages, 101 redirects and 49 catalogued films.
- All nine main hosted pages and 40 distinct internal navigation/CTA/image-link targets returned HTTP 200. Navigation and footer destinations were preserved.
- Actual one-click playback verified with unmuted advancing video for Vimeo Christina & Danny and Nicole & Philip, MediaZilla Nicolette & Tyler and RTG Atlas, local Falling in Love / Together, and Sweet Sixteen Gianna. Modal close removes the iframe/video; local Next film replaces the selected player without adding a second player. RTG reel Next advances after its smooth scroll settles; Sweet Sixteen FAQ expands.
- Vimeo fullscreen button entered and exited its fullscreen control state. MediaZilla exposes a fullscreen button and iframe permission, but its fullscreen interaction could not be completed reliably in this cloud browser; real-device review remains required. No workaround added.
- Empty Contact submission blocked without a page reload; endpoint unchanged. Scheduling CTA opened the actual 30-minute consultation calendar in a separate tab. No genuine inquiry or booking was submitted.
- RTG film 6 (102347867): hosted player says “Because of its privacy settings, this video cannot be played here.” Film 10 (87439618): hosted player says “Sign in to Vimeo to watch this video.” These are provider access blockers, not missing modal wiring. No inventory removal, substitute or access-setting change.
- Visible public titles include eight editorial shorts (Falling in Love, Together, Before the Vows, In the Details, Into the Night, The Celebration, Among Friends, The Whole Day) and three recaps (Bianca & Bobby, Sara & Phil, Nicole & Philip). No visible short filenames/week-number labels. Five Sweet Sixteen films remain Gianna, Gabby, Julianna, Julia and Gina Marie.
- Nicole & Philip currently labels two distinct sources: Vimeo 425185852 and MediaZilla XDcajHQdhs. Earlier records called the latter Cole & Philip, but a subsequent explicit instruction approved Nicole & Philip. Source records conflict; correct client identity must be confirmed by Frank. No invented name or unilateral reversal.
- Nicolette & Tyler, Seleena & Dashmir, Lauren & Tommy and Bianca & Bobby source/poster assignments remain unchanged from approved records. Matching filenames/assignments alone cannot prove client identity; final owner review is required. Lauren & Tommy anniversary short remains unavailable.
- No application, design, media, SEO, route or playback change was needed. This checkpoint corrects stale documentation and records newly verified provider restrictions.

Assessment remains **NOT READY FOR PRODUCTION** until provider access/client identity, genuine inquiry delivery, real-device/laptop review, legacy-route decisions and separately authorized production indexing/analytics gates are resolved. Production was not launched; giolinafilms.com DNS/routing, clients.giolina.co and email/Google Workspace were not changed.
