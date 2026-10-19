# Cinematic venue stories — preview refinement

## Scope and current design

Continue the two pages introduced in 662e64c, with existing navigation, footer, photography viewer, film dialog and exact media preserved. Compact couple/venue headings lead to the film, concise factual context and an unobtrusive inquiry action. The Venetian retains four selected photographs; the staircase and first dance receive full-width positions, with the two intervening photographs paired on desktop and stacked on narrow screens. Park Savoy remains film-only using the 759600674 edit and its exact provider thumbnail. The existing 768293139 portfolio edit is unchanged. No animation, stock imagery or fabricated event narrative.

## Reusable content contract

- `src/content/venue-stories.json` holds only the two approved preview configurations.
- `src/content/venue-story.mjs` renders the existing markup conventions.
- `scripts/build-venue-stories.mjs` updates only the two explicitly allowed existing page JSON files; it cannot generate routes from the research catalogue.
- Run `node scripts/build-venue-stories.mjs` after an approved draft edit. Regression tests enforce equality between the configurations and checked-in generated content.
- Photo + video requires a verified film and actual selected photographs.
- Video only requires a film and refuses a photographic collection. A film thumbnail is not a photography assignment.
- Photo only requires photographs and refuses an event film. Service navigation may still link to GioLina's wider services.
- Any status other than `preview-approved`, including `hold`, refuses rendering. A preview status never confers production permission. Unknown media, coverage, permission or attribution must be resolved before preparing another event configuration.
- Existing per-page SEO metadata and canonical plans remain intact. Review them individually for every future story; this is not a metadata or location-page factory.

## Publication boundaries

Only these two existing preview routes are included. No sitemap, production indexing allowlist, navigation, redirect, production gallery, shared player, analytics, Worker configuration or protected-service changes. Existing noindex/nofollow rules still apply. Preview URL access is public but nonindexable; it is not private authentication. No private provenance or original source photos are published.

## Proposed internal linking, after approval

Wedding Collection → selected wedding stories → relevant Photography/Cinematography → existing Contact/HoneyBook process. Sweet Sixteen → selected Staten Island Sweet Sixteen stories → existing Contact. Add no top-level navigation item. The two current previews link to each other and existing services; inbound production links and sitemap changes await separate owner approval.

## Research and permission handling

Complete owner-confirmed media catalogue and refined marketplace proposals are maintained in the separate owner-review document, GioLina-Marketplace-Review.md. Research records never create pages. Wedding priorities are North Jersey; Sweet Sixteen priorities are Staten Island. Other confirmed regions remain evidence-led secondary markets. A family address is not a staffed office. Events on hold stay excluded from all new promotional production, without removing previously approved existing content.

## Verification and limitations

Normal build initially stopped by automatic approval review because its public portfolio GET was classified as a protected client-gallery request. The existing approved nine-category public-feed scope was recovered from docs/superpowers/plans/2026-10-09-wedding-collection.md and scripts/build-wedding-collection.mjs. A subsequent explicitly reviewed normal build passed using that evidence, without changing network paths, authorization, build code or security protections. An offline Astro build using the recovered generated catalogue also passed.

Public and protected tests, coverage contracts, noindex protections, unchanged player behavior, image integrity and responsive CSS checks are required. Browser rendering and physical-device playback remain unverified after prior browser timeouts; DOM tests and CSS review do not establish device rendering or provider playback.

Search Console and GA4 account blockers remain unchanged; no repeated sign-in attempts or speculative production fixes. Obtain current sitemap error status, verify the existing GA4 web stream, and approve consent requirements before activation. No claims of Google sitemap acceptance, ranking or received analytics events.
