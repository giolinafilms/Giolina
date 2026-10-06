# Public typography inventory — 2026-10-06

No fonts have been standardized or replaced in this pass.

## Complete inventory and measured review

The review page is `/qa/font-inventory/`. Its downloadable `inventory.json` covers all 35 public page sources plus the 404 page, including legacy/redirected pages, all matching typography selectors, stylesheet source, media conditions, section names/examples, font family, weight/style, size, spacing and line-height declarations. Matching rules include overrides; they must not be mistaken for the final cascade.

The review page also measures every non-redirected public route in browser frames at 390×844, 430×932, 768×1024, 1024×768 or 1440×900. It records computed typography for headings, script spans/emphasis, body text, links, navigation, buttons, labels, fields, captions and lists; matching source rules accompany each element in the downloadable measured JSON. Frames disable scripts and do not submit forms. Web-font status is recorded after `document.fonts.ready`. System fallback glyph selection remains browser/OS-dependent; computed family names alone do not prove a face was rendered.

The final declaration inventory includes inline style blocks and element styles as well as linked CSS (36 sources / 1,946 matching declarations). The 404 route has been added to runtime coverage.

Regenerate declarations after a build: `node scripts/font-inventory.mjs`.

## Named treatments

| Treatment | Family / selector | Source / behavior |
|---|---|---|
| Love in a Minute | Allura 400 normal; `.gl-cinema-step-one .gl-love-intro h2`, inherited by `em` | `love-minute.css`; fluid size and several later phone overrides; `migration.css` registers Allura from fonts.gstatic.com (external Google Fonts); cursive fallback if unavailable |
| Client Wedding Films | Allura 400 normal; `#gl-client-films-title` | `brand-refinement.css`; clamp(48px,5.5vw,70px), 46px phone override, line-height 1.15, spacing 0 |
| Beautiful moments honestly captured | Allura 400 normal; `.gl-photo-page .gl-photo-intro h1` | `brand-refinement.css`; clamp(52px,5.4vw,72px); phone clamp(44px,10vw,56px), line-height 1.08, spacing 0 |
| GioLina logo | Original image/SVG artwork, not browser text | Authentic supplied mark; no identified matching font file. Do not replace with Allura or label Allura the logo font. |
| Tenor Sans experiment | Tenor Sans 400 normal; `.gl-experience #our-approach .gl-tenor-test` | `tenor-test.css`; local `/fonts/tenor-sans-regular.woff2`; only “Room to enjoy being”; inherited responsive size, spacing −.025em |
| Script elsewhere | Primarily Allura; some legacy Muster declarations | All matching script selectors/pages are in the inventory. Experience “together.” retains its existing treatment. CTA “story” was deliberately left unchanged in the prior approved pass because the true logo typeface is unavailable. |
| Primary/secondary headings | Mainly Georgia/serif or Allura/cursive, with page-specific variations | Homepage, cinema, photography, Experience, About, Reviews, Sweet Sixteen and RTG have different rules; inspect measured table rather than assuming one universal heading style. |
| Body/nav/buttons/kickers | Mainly Arial/sans-serif; legacy pages retain other families | Page-specific sizes, letter-spacing and uppercase treatment; shared header/mobile controls introduce further overrides. |

**Love in a Minute and Client Wedding Films use the same family: Allura.** Their size, line-height and layout differ. **Beautiful moments honestly captured also uses Allura** under the current photography override; visual differences are sizing/layout, not a separate intended family.

## Sources and drift

The legacy stylesheet set contains AvenirNextLTPro, Muster, Poppins, Questrial, Montserrat, Open Sans, Cormorant Garamond and Roboto registrations in addition to Allura and the isolated Tenor Sans test. Icon families (Font Awesome, eicons, swiper-icons) are not editorial typography. A registered face is not necessarily used or loaded: the declaration inventory and runtime status deliberately distinguish these.

Drift comes from retained Elementor/legacy page CSS, many layered overrides, differing Allura scales and inconsistent Georgia/Arial sizing and tracking. Several mobile selectors are overridden again later in the same file. Logo artwork, script text and italic serif are three different things and should not be conflated.

Allura is the closest existing *text-script candidate* for a future system, but it is not an exact match to the GioLina wordmark. The authentic artwork should remain the logo. A genuine original font/vector source is needed before claiming exact logo-style text.

## Recommendation — approval required, not implemented

Use approximately three editorial families: Tenor Sans for modern display headings if Frank approves the single-section test; Arial/system sans for body, navigation and controls; Allura only for a few intentional script accents if Frank approves that distinction from the logo. Alternatively retain Georgia instead of Tenor Sans for a more traditional direction. Keep icons separate. Consolidate sizes/spacing into shared tokens and retire unused legacy font declarations only after visual approval. Do not propagate Tenor Sans or invent another script now.

## Hosted computed verification — 2026-10-06

The hosted audit completed all 23 non-redirect public routes at **1440 × 900** and **390 × 844**. It records computed stacks separately from FontFace loading status; a CSS stack alone is not proof that its first family rendered. The live report supplies every text element’s weight, style, size, line-height, letter-spacing, matching selector/source and font-face status. Download its measured JSON for a full viewport-specific record. External scheduler/media content is outside the public page font cascade.

| Treatment | Desktop 1440px | Phone 390px | Loaded face |
|---|---|---|---|
| Love in a Minute | 114px / 111.72px | 50.7px / 54.756px | Allura 400 normal |
| Client Wedding Films | 70px / 80.5px | 46px / 52.9px | Allura 400 normal |
| Beautiful moments. Honestly captured. | 72px / 77.76px | 44px / 47.52px | Allura 400 normal |
| Room to enjoy being | 76.32px / 88.531px | 46px / 53.36px | Tenor Sans 400 normal |
| together. | 87.768px / 101.811px | 52.9px / 61.364px | Allura 400 normal |

The three named script headlines use **the same Allura family**, with different sizes and line heights. Tenor Sans is loaded only for the approved experiment. The GioLina logo is artwork, not a font registration; Allura is the closest existing text treatment, not a verified exact match.

**Font drift confirmed:** Arial/Georgia on recovered homepage sections; Poppins on inherited navigation/footer/button rules; Allura script; Tenor Sans experiment; Montserrat declared on Experience without a loaded Montserrat face in this browser (Arial/sans-serif fallback); legacy AvenirNextLTPro, Muster and Muli declarations without those loaded faces; Questrial actually loaded on legacy service pages. Font Awesome faces are icons, not editorial families. Browser/system font availability can affect fallbacks.

Future approval proposal: Tenor Sans for display headings, one consistent sans-serif for body/navigation/buttons (retain Poppins or choose Arial), and existing Allura for sparse script accents. That is three editorial families. Keep the authentic logo artwork. Do not normalize until Frank reviews.
