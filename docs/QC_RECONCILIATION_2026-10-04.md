# Preview QC reconciliation — October 4, 2026

Branch: `preview/homepage-photography-rotation`
Preview: https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/
Starting commit: `fd64e9d53d70d88266dd539654f6b9ce7065030f`

| Requested section | Status | Reconciliation result |
| --- | --- | --- |
| 1. Reviews | FIXED NOW | Added the three missing matching video actions for Christina & Danny, Stephanie & Danny and Deanna & Anthony. All six requested video couples now have a film within their existing photo/review/name module. Existing approved quotes, photos, ordering and other reviews preserved. Julia & Mina remains without video. |
| 2. Experience | FIXED NOW | Exact new caption; larger Polaroid rotated 3.5 degrees clockwise on desktop / 2 degrees on mobile; pale statement treatment; larger quote photograph; two SDEs preserved together and the existing Phil & Sarah engagement source separated under The Beginning of Something. Closing margins balanced. |
| 3. RTG | STILL BLOCKED | Finished top company context and beginning Corporate / Specialty Experiences / Creative Films & Events organization using identified example links. Existing microsite, Are You Ready, text wordmark, palette and 17 working-reference cards retained. Two provider-restricted cards archived outside public layout. Actual logo unavailable; clean text fallback retained. |
| 4. About Us | FIXED NOW | Combined Frank's preserved bio and name story in the editorial text column beside the original family film. Removed the empty reserved-portrait rectangle. Completed cyan We’d Love to Get to Know You heading band. RTG history already secondary near the bottom, left alone. |
| 5. Cinematography closing | FIXED NOW | Established cyan closing band, readable dark title/copy and differentiated white inquiry CTA. Approved wording, all client-film cards, sources and posters preserved. |
| 6. Photography gallery feature | FIXED NOW | Existing Stephanie & Danny image is now full-width landscape with centered cyan editorial copy. Existing exact gallery destination and new-tab behavior retained. Hosted verification identified and corrected an inherited 375px figure limit. |
| 7. Love in a Minute | STILL BLOCKED | Existing RTG context retained; missing Explore Ready To Go Productions link added and verified. All short sources, public titles, order and recap films preserved. Lauren & Tommy anniversary asset unavailable after repeated workspace and Git-history search. |
| 8. Sweet Sixteen | FIXED NOW | Explicit blush Cinematography / Photography links scroll to real film/photo anchors. Removed only redundant portrait FAQ. Real supplied pink-gown photograph fills question column. Existing presentation finished as full-width landscape hero/blush caption. Five films, 2 + 2 + 1 layout, stages and intentionally disabled presentation CTA preserved. |
| 9. Contact | STILL BLOCKED | Name + Email only required, optional selections functional, one rotating image, aligned desktop image/inquiry bounds, no image borders, correct scheduling destination and native Formspree action preserved. End-to-end Formspree acceptance/delivery remains unverified; prior browser submissions did not return a response. No redesign or routing/configuration change. |
| 10. Sitewide visual QC | STILL BLOCKED | Hosted desktop and scoped responsive rules reviewed; no horizontal overflow on nine main pages. Brand palettes and shared footer preserved. Actual mobile viewport/device visual verification unavailable in the current browser; Frank should review phone/laptop presentation. |
| 11. Functional / performance QC | STILL BLOCKED | Hosted lazy film loading, selected-player count, unmuted Vimeo/MediaZilla/local playback, local film switching, close/Escape unload, real anchors and asset references passed. Remaining Vimeo restrictions and uncertain existing duplicate Nicole & Philip assignments require owner review. No shared player changes. |

## Already correct and left alone

- Existing review module structure, all approved quotes/photos and three existing film pairings.
- Client Wedding Films markup was byte-for-byte unchanged after DOM normalization against the starting commit; no inventory, order, posters or layout changes.
- Love in a Minute opening/editorial inventory, anniversary grouping, source aspect ratios, poster treatment, script styling and logo.
- RTG palette, featured Atlas, Preferred, existing spotlight/reel presentation, Are You Ready identity, back-to-GioLina link and correct mailto/tel contacts.
- Sweet Sixteen source IDs, five-film inventory, 2 + 2 + 1 desktop layout, single-column mobile rules and existing three-stage approved content.
- Original Giovanni + Michaelina family film, wedding pages' existing metadata and route structure, shared footer, Contact configuration and scheduler.
- The homepage's previously approved muted background hero remains unchanged; click-to-play portfolio films on the eight other main pages have zero iframe/video players while browsing. This audit does not relabel the intentional homepage background as a lazy click-to-play film.

## Unresolved assets, names and provider access

| Item | Evidence / next requirement |
| --- | --- |
| RTG Film 6 | Vimeo `102347867`; hosted player says “Because of its privacy settings, this video cannot be played here.” Correct embed syntax is used. Owner must inspect Vimeo viewing/embed permissions. Title remains unidentified; original card/ID retained in `src/content/rtg-pending-films.json`, hidden from public browsing. |
| RTG Film 10 | Vimeo `87439618`; hosted player requires Vimeo sign-in. Title remains unidentified; original card/ID retained in the same archive and hidden publicly. Owner must confirm film identity and public/embed access. |
| Julianna | Correct Vimeo `385087191` retained; fresh hosted test still displays the same privacy restriction. No replacement video used. Account-side viewing/embed settings require review. |
| Lauren & Tommy anniversary short | `rg --files /workspace/scratch/7074563bc634` filename search, local `.mp4/.mov/.m4v` inventory (13 files), and `git log --all --name-only --pretty=format:` checked case-insensitively for Lauren/Tommy/recap/anniversary. Only `public/assets/lauren-tommy.png` and `public/assets/lauren-tommy-poster.webp` were found for their names. No anniversary MP4/MOV exists in current workspace/reachable history. Their long-form film was not substituted. |
| RTG logo | Current workspace/repo and reachable Git filename history searched for RTG/Ready To Go/production logo names. `rtg-logo-inventory.jpg` is a contact-sheet inventory, not a logo asset. No actual RTG logo found. Text fallback retained. |
| Frank photograph | Actual approved portrait is still unavailable. Empty reserved-photo rectangle removed; biography retained with no invented substitute. |
| Julia & Mina / Julie & Nina | Current approved source/content/photo are Julia & Mina (`julia-mina.png`); checklist says Julie & Nina. Kept current approved name and no video rather than guessing a rename. Owner confirmation needed if intended to change. |
| Nicole & Philip | Cinematography currently has two distinct preserved sources (`425185852` and MediaZilla `XDcajHQdhs`) under this name. Existing source/client identity requires Frank's confirmation before either is renamed/removed. No visible Cole & Philip label remains. |
| Sweet Sixteen presentation | Final URL not supplied. Disabled View Full Presentation and visible coming-soon notice remain; no dummy hash or invented destination. |
| Contact delivery | Formspree action remains `https://formspree.io/f/xbglbbpo`, method POST. Native validation and optional controls verified; provider acceptance/email delivery not established by this browser. |
| Mobile visual review | Responsive source rules checked, but current browser exposes no supported viewport resize. A real phone/laptop visual review remains required. |

## Verification evidence

- Build and repo/SEO checks passed at each published code checkpoint: 29 routes, 9 main-page SEO records, 101 redirects, 9 sitemap URLs, GA4 `G-KD1ES061DH`; preview tracking disabled as intended.
- Titles/meta/canonical metadata keys unchanged against starting commit for all touched pages. Automatic film schema follows current visible film triggers; restricted RTG cards no longer create public metadata.
- Hosted Gianna: Vimeo `793523768`, one-click autoplay, Pause control, Mute control and volume 100 displayed. One iframe/open modal, zero after close.
- Hosted Julia: MediaZilla `8baRrhNAed?autoplay=1`, playing (`paused:false`) and unmuted after a single site Play Film click. Escape removed iframe/open modal completely.
- Hosted Falling in Love: exact `/assets/shorts/falling-in-love.mp4`, selected at time 0, playing/unmuted. Next switched to `/assets/shorts/week-2.mp4` (public title Together), exactly one player, near-zero start, unmuted. Close left zero players.
- Hosted About family: exact `/assets/giovanni-michaelina.mp4`, single selected player, time 0, playing/unmuted; close left zero players.
- Hosted Sweet entry points reached `#sweet-photography` and `#sweet-films` with target top approximately 24px. All five poster images loaded correctly. FAQ/presentation photographs and wide crop visually checked.
- All nine main hosted pages: one H1, no observed broken local hash anchors, no loaded-image errors and no document-level horizontal overflow. Eight portfolio/content routes have zero players before click; homepage background exception recorded above.

## Published code checkpoints in order

1. `d2544c80a5476b8b57213933c4c8b03cdcfde35a` — Reviews / Experience.
2. `3ea45d5ef141093ffc6dfd3e274a7b317e23d287` — RTG context / organization / restricted-card archive.
3. `2d7e926b9ae37788e79af5c6952f345f8438fa95` — wedding editorial bands / gallery feature / RTG context link.
4. `0356710a39b63943fac7ecdc62073075d379ea9a` — Sweet Sixteen completion / inherited gallery sizing correction.

Each checkpoint was pushed to the current preview branch, built successfully by native Cloudflare Workers Builds and verified on the hosted preview. A final documentation checkpoint records this report; its hash is available from branch HEAD.

Production has NOT been launched. giolinafilms.com DNS/routing, clients.giolina.co, email/Google Workspace, SmugMug, Search Console and Google Business Profile have NOT been changed.
