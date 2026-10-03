# GioLina preview pre-launch checklist

Preview only. Production canonical origin remains https://giolinafilms.com. No production cutover, DNS, email, Search Console or SmugMug changes are authorized by this audit.

## SEO and migration checks

- [x] Nine main pages: unique title/description, one H1, appropriate alt attributes and key-page navigation.
- [x] Current assets in main-page social/structured metadata; JSON-LD syntax and graph IDs checked.
- [x] Nine-main-page sitemap prepared; not submitted.
- [x] Six known legacy page equivalents, two sitemap endpoints and 90 captured upload URLs mapped; no guesses.
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
- [ ] Supply/approve actual RTG poster frames for Vimeo 102347867 and 87439618; neutral placeholders remain.
- [ ] Lauren & Tommy anniversary short is unavailable; no substitute added. Collection is functional without it.
- [ ] Review brand-cyan script contrast on white: current #19b5bc is 2.50:1, below the 3:1 large-text target, intentionally unchanged following the approved exact-color instruction.

## Assessment

Not ready for production yet. The preview is suitable for final review; functional checks pass within the limits above. Complete the manual/content decisions and the separate production tracking/indexing configuration before any approved launch. No Search Console or DNS action has been taken.

Checkpoint commits before this checklist's final publication: 62a81a8efe45d504eec1cacda6a0e11c830e4033 (page SEO), 9559efa4a3183def383b8dac41b335fb45f2469a (technical readiness). Final QA commit is in repository history.
