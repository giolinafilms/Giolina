# Public typography inventory — 2026-10-06

No fonts have been standardized or replaced in this pass.

## Complete inventory and measured review

The review page is `/qa/font-inventory/`. Its downloadable `inventory.json` covers all 35 public page sources, including legacy/redirected pages, all matching typography selectors, stylesheet source, media conditions, section names/examples, font family, weight/style, size, spacing and line-height declarations. Matching rules include overrides; they must not be mistaken for the final cascade.

The review page also measures every non-redirected public route in browser frames at 390×844, 430×932, 768×1024, 1024×768 or 1440×900. It records computed typography for headings, script spans/emphasis, body text, links, navigation, buttons, labels, fields, captions and lists; matching source rules accompany each element in the downloadable measured JSON. Frames disable scripts and do not submit forms. Web-font status is recorded after `document.fonts.ready`. System fallback glyph selection remains browser/OS-dependent; computed family names alone do not prove a face was rendered.

Regenerate declarations after a build: `node scripts/font-inventory.mjs`.

## Named treatments

| Treatment | Family / selector | Source / behavior |
|---|---|---|
| Love in a Minute | Allura 400 normal; `.gl-cinema-step-one .gl-love-intro h2`, inherited by `em` | `love-minute.css`; fluid size and several later phone overrides; `migration.css` supplies local Allura plus older external registration |
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
