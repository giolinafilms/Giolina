# Venue films and video discovery — preview release

## Scope and recovered state
Main 8b9d1142312a7ab4a2388cf14576c532dd893ec7; production Worker version 9e4b6759-41a9-4751-a455-869fdf0b15b9 confirmed by the successful Cloudflare GitHub check. Preview baseline 77fe364d080bbe7278cae285ca88e7d6b26998e1. No production changes authorized.

Giando stays one venue page. Alexandria & James: video only. Selena & Dashmir: photography and video, owner correction. Each film has its own heading, accessible section name and coverage statement. No matching approved photography recovered. Two old private-review candidates remain unapproved and unmapped; no rejected gallery access retried.

Stroudsmoor / Christina & Danny: video only, Vimeo 425184212, existing christina-danny.png inspected. Boscobel / Jazz & Trevor: video only, MediaZilla gjx8Km0Irn, existing jazz-trevor-poster.png inspected. Existing cinematic layout reused with unique metadata, planned canonical URLs and restrained cross-links. No invented dates, testimonials or photographs.

## Vimeo versus MediaZilla
Recommendation: retain current film IDs and hosts. Vimeo has better documented Google integration, not demonstrated better rankings for GioLina. Google's Vimeo case study documents player VideoObject markup and noindex,indexifembedded. MediaZilla documents responsive public embeds; private/password settings restrict viewers. No equivalent Google integration was established in the reviewed MediaZilla documentation. That absence is not evidence that its public films are unindexable.

Public research retrieval succeeded for Vimeo 331322129 and 759600674. Vimeo 799295947 and all three MediaZilla share pages were unavailable to the search retrieval tool; this is not a Googlebot test or proof of blocking. Prior browser checks loaded Alexandria & James and Nicolette & Tyler; current browser interaction loaded Bianca & Bobby's titled MediaZilla player. Actual account privacy settings and Googlebot server logs were not inspected. Prior Vimeo playback tests succeeded for Francesca & Chris and Sara & Phil.

Both platforms can be referenced by a video sitemap player_loc and structured-data embedUrl if the exact public player is verified. Stable local thumbnails already exist. No production sitemap changes. No fabricated video-file URLs, publication dates or durations. Current MediaObject metadata does not establish VideoObject rich-result eligibility; verified first-publication dates are still needed for our own complete VideoObject markup.

Google requires an indexed watch page with prominent, discoverable video. Current JS creates the iframe only after a click, a discovery weakness Google specifically warns against. JSON-LD or a sitemap alone does not remove it. Giando is an intentional two-film venue collection, so single-video watch-page eligibility is weaker; do not split the owner's venue page merely for SEO. Single-film Gargiulo's, Laurita, Stroudsmoor and Boscobel are better candidates for a future inline-player trial.

## Player recommendation — not implemented
A visible, responsive iframe in initial HTML, no autoplay, exact existing film ID, reserved aspect ratio and accessible title is the appropriate discovery experiment. Do not hide an iframe behind a poster merely for crawlers. Native lazy loading may help performance but must be checked in Google's rendered HTML. Vimeo dnt=1 disables session analytics but still allows essential cookies and initial provider requests. MediaZilla equivalent privacy behavior has not been verified. Existing player creation on visitor click is therefore retained to preserve the current third-party request boundary. Owner review of the privacy tradeoff and technical validation are needed before an inline-player experiment. No production player changes.

No new Search Console inspection or indexing request was made. Prior evidence remains: no verified video indexing for these preview stories; Photography and Park Savoy indexing requests must not be repeated. Preview noindex is intentional, so it cannot establish Google indexing success.

## Vimeo metadata proposals — owner review only
Preserve IDs, URLs, views, embeds and privacy. No metadata saved.

331322129:
Observed title: Stephanie & Danny Wedding @The Venetian, Garfield NJ
Observed description: venue website link only.
Proposed title: Stephanie & Danny | The Venetian Wedding Film | Garfield, NJ
Proposed description: Stephanie and Danny's wedding film at The Venetian in Garfield, New Jersey, by GioLina Films. Explore wedding cinematography and photography at https://giolinafilms.com/ and inquire at https://giolinafilms.com/contact/.
Do not link the unpublished Venetian route yet.

759600674:
Observed title: Deanna + Anthony Wedding @The Park Savoy, Florham Park, New Jersey
Observed description: appreciative paragraph about the couple, families and venue.
Proposed title: Deanna & Anthony | The Park Savoy Wedding Film | Florham Park, NJ
Proposed description: Deanna and Anthony's wedding at The Park Savoy in Florham Park, New Jersey, filmed by GioLina Films. Watch their wedding story at https://giolinafilms.com/weddings/the-park-savoy-florham-park/. Inquiries: https://giolinafilms.com/contact/.

799295947:
Current public title/description could not be verified by research retrieval; do not invent a before state.
Proposed title: Francesca & Chris | Gargiulo's Wedding Film | Brooklyn, NY
Proposed description: Francesca and Chris's wedding at Gargiulo's in Brooklyn, New York, in a film by GioLina Films. Explore wedding cinematography at https://giolinafilms.com/cinematography/. Inquiries: https://giolinafilms.com/contact/.
Do not link the unpublished venue route yet.

Benefits: clearer event/venue association and useful inquiry links. Risks: search snippets can change and take time to refresh; existing audience recognition may change. No ranking promise. Editing metadata in place avoids replacing the underlying film, but verify each edit in the account and preserve existing IDs/URLs. Keep existing thumbnails pending visual owner review; no provider thumbnail changes.

## Media recovery and holds
No additional approved event-attributed photography recovered this release. Current counts: Venetian4; Nanina5; Rockleigh1; Buttonwood0; Vanderbilt Gabby1/GinaMarie1; Island Chateau Julia1; Ariana Gianna2. Current Sweet Sixteen28-photo production montage unchanged. Historical40-photo inventory does not map the current28 except the already recovered Gianna match. Local admin/catalogue additions have no named attribution for Selena/Dashmir or other missing wedding collections. Do not infer identity from filenames/order.
Waterside missing verified film and asset mapping. Jacques, Old Bermuda Inn and Eagle Oaks lack sufficient mapped approved selections. Liberty House/Addison Park attribution unresolved. Palace promotional hold unchanged.

## Validation
Local Astro production-compatible build used retained generated collection; no private-source fetch retried. Public/SEO checks passed including97 legacy redirects. Existing70 script tests passed, plus2 new batch tests. Protected admin90 tests passed. New tests cover corrected event coverage, both film IDs, no fabricated photos, canonical/noindex, schema JSON, local assets and sitemap/analytics exclusion. Browser/live deployment results recorded in final report. No physical-device testing.

## Sources reviewed
https://developers.google.com/search/docs/appearance/video
https://developers.google.com/search/case-studies/vimeo-case-study
https://developers.google.com/search/docs/appearance/structured-data/video
https://help.vimeo.com/hc/en-us/articles/28881094710545-About-video-SEO-on-Vimeo
https://help.vimeo.com/hc/en-us/articles/12426260232977-About-Player-Parameters
https://help.vimeo.com/hc/en-us/articles/26080940921361-Vimeo-Player-Cookies/
https://support.mediazilla.com/en/articles/5479820-how-do-i-embed-mediazilla-videos-or-presentations-on-my-website
https://www.stroudsmoor.com/
https://www.boscobel.org/
