# GioLina proposal presentation — review checkpoint

Date: October 5, 2026. Status: implemented, deployed to preview, and verified on the hosted preview. Stop here for Frank's review. Production and the public marketing website remain unchanged.

## 1. Services & Packages

The compact catalog now includes thumbnails, category, primary-package/add-on distinction, short excerpts, price, coverage, and active/archive status. Search, filters, and sorting remain available. Create, edit, duplicate, archive, activation, pricing, descriptions, categories, inclusions, and components remain editable. The original 47 source-backed entries were preserved. Hosted QA found Wedding Photography / Premier / 8 hours / $2,300, duplicated it into an explicitly labeled DEMO copy, and archived only that copy.

## 2. Client presentation system

One shared renderer feeds both Admin preview and standalone proposal links. It uses the real GioLina logo and local portfolio imagery, editorial typography, personalized hero, introduction, selected packages, optional add-ons, galleries/films, and clearly visible investment. Reusable wedding, Sweet Sixteen, and event/corporate treatments use the same service data rather than separate hard-coded package pages.

Service presentation fields support hero, thumbnail, gallery images, example film/gallery URLs, icon, background treatment, headline, and short description. Improved client copy is separate from the preserved original source description.

## 3. Proposal Builder

Select a client, lead, or project; set event details; choose actual catalog services; adjust quantities, prices, discounts, and custom items; and reorder both items and sections. Only selected services appear. Optional items are identified separately and excluded from the displayed total. Source facts and historical variants are retained.

## 4. Preview

Preview as Client uses the same renderer as the share page, with desktop/laptop/tablet/mobile width selectors and an Edit return path. Preview is available before creating a link. Hosted QA edited the photography proposal to revision 2, saved Ready for Review, and confirmed the changed client copy while its internal QA note remained absent from the client view.

## 5. Share links and revisions

Create, Copy, Disable, and Regenerate controls are implemented. Links use 256-bit random tokens with hashed lookup, expire after 30 days, and publish a fixed client-only snapshot. Editing does not silently change an already published snapshot. Admin shows current versus published revision, an unpublished-changes warning, share history, view count, and last viewed. Regeneration invalidates prior links; disabling removes access. Hosted create/copy/regenerate/disable/history were exercised. Revoked-link HTTP 404 behavior was verified in automated tests; the hosted browser displayed its own error page after revocation, so no hosted HTTP status is claimed.

Draft, Ready for Review, Declined, Expired, and Archived are supported; Shared/Viewed are derived from sharing activity. Accepted remains explicitly test-only. Created/modified timestamps, revisions, and audit history are retained.

## 6–10. Four development-only examples

All linked contacts, projects, and proposals are labeled DEMO, use demonstration event details, and contain no real client data. Links below were opened successfully in the hosted browser; they expire November 4, 2026 unless disabled or regenerated earlier. Anyone holding a link can view that demo snapshot; these are capability links, not authenticated client accounts.

| Example | Source-backed investment | Presentation and caveat |
| --- | ---: | --- |
| Wedding — Cinematography / Alex + Jordan DEMO | $3,150 | Wedding 2026 source `hb-0-01`: up to 8 hours, one cinematographer, 7–10 minute highlight, online chapters. Elegant pale blue/neutral treatment with real cinematic wedding imagery. Optional $550 drone is excluded. |
| Wedding — Photography / Jamie + Taylor DEMO | $2,300 | Wedding 2026 source `hb-0-06`: 8 hours, custom editing, high-resolution gallery. Real wedding portraits and gallery, visible key inclusions, concise client copy. Optional $1,000 / 3-hour engagement session is excluded. |
| Sweet Sixteen / Avery DEMO | $1,800 | Historical 2024 source `hb-1-17`: 6 hours, 4–6 minute highlight, online chapters. Real teal-gown imagery and brighter accents. Optional $350 drone is excluded. Historical price requires Frank's confirmation before real use. |
| Event / Corporate / Your team DEMO | $2,700 | Historical December 8, 2025 source `hb-2-24`: 5 hours, 2–3 minute highlight plus 30-second deliverable. Neutral professional treatment and real event imagery. Source is clipped; full scope and historical price require review. |

Verified hosted links:

- [Wedding cinematography](https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/proposal/305c3f7863dd3bb7aca5b19386f437b0c3eeacb8ff60a93a059004c09b702b48)
- [Wedding photography](https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/proposal/5baebc95fe5860bfd06786b2498e17a490c024ed6d0f949d170ec3d596e8b753)
- [Sweet Sixteen](https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/proposal/70fdca796e736a484291ac1b9ca713beb13b7c966c5aba84d099016abddd6dc4)
- [Event / Corporate](https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/proposal/aefc7295fef5dbdad1ecd38733a2545842b21614e9f4d45a3f45f01684c92fc5)

## 11. Media

Vimeo and MediaZilla examples use a click-to-load player. No video iframe loads initially; one click creates one player; closing or Escape unloads it. Hosted Vimeo playback controls and actual MediaZilla video playback were observed. Closing returned the iframe count to zero. Photography galleries and local image assets loaded successfully. URLs are restricted to supported providers for embeds; images use local asset paths.

## 12. Responsive verification

The actual hosted renderer was inspected inside fixed-width preview frames: wedding cinema at 1280, 1100, 1024, 768, and 375 pixels; the other three at 1280, 1024, 768, and 375 pixels. All 17 measurements had equal root scroll and client widths: no page-level horizontal overflow. Scrollbars reduce content width by 15 pixels. Prices remained 34px. Desktop hero crops, tablet Sweet Sixteen imagery, mobile photography cards/inclusions, and corporate cards were visually inspected. Galleries intentionally support internal horizontal swiping. This is browser-width simulation, not physical iPad/iPhone Safari certification.

## 13. Public Site button

The Admin link now uses a new tab with `noopener noreferrer`. Hosted clicking opened the public site in a separate tab while Admin stayed on its Proposals page.

## 14. Security and privacy

Admin remains Cloudflare Access protected with JWT and organization validation. Mutation routes require same-origin JSON requests and optimistic version checks. Sharing is limited to DEMO records and the exact preview environment/origin. The public projection excludes internal notes, internal pricing history, private record IDs, unrelated clients/projects, and archived snapshots. Text is escaped; responses use no-store/noindex and restrictive security headers. Share storage is a dedicated D1 table unavailable through generic record CRUD. Production proposal routes fail closed without preview configuration. A public proposal view cannot accept, sign, pay, or mutate records.

## 15. Intentionally disabled

No live outbound client email, production proposal sending, automatic/binding acceptance, electronic signatures, payment provider, public portal login, real-client import, scheduler replacement, or HoneyBook migration. No production DNS/routing, marketing redesign, Google Workspace, Search Console, Formspree, email configuration, or HoneyBook changes were made. Optional add-ons are presentation-only during this checkpoint.

## 16. Tests and hosted QA

- `npm run check:admin`: 29 tests passed, including existing CRM behavior, share redaction, escaped hostile text, token snapshots, views, HEAD behavior, regeneration/revocation, expiry, wrong organization, production gating, public POST rejection, DEMO-only sharing, idempotent demo creation, validation, optional totals, builder ordering, safe new-tab link, and player lifecycle.
- `npm run build`: passed.
- `npm run check`: passed public-site asset/link/SEO checks (35 routes, 1,147 asset references, 15 main pages, 101 redirects); preview tracking remained disabled.
- `npx wrangler deploy --dry-run`: bundle passed; this was not a production deployment.
- Native Cloudflare preview deployments for all implementation commits completed successfully.
- Hosted Admin: catalog search/filter/sort/edit/duplicate/archive; proposal reorder/save/preview/back-to-edit; snapshot revision warning; share create/copy/regenerate/disable/history; all four final client links; media playback; Public Site new tab.
- Earlier financial checkpoint also verified Draft contract/signature placeholders and a DEMO manual invoice calculation of $500 minus $125 recorded test reference = $375 remaining. No money moved.

## 17. Implementation commits

Branch: `preview/homepage-photography-rotation`, repository: `giolinafilms/Giolina`.

| Commit | Checkpoint |
| --- | --- |
| `419ac9ab32dae9a241cbc7fcfd25e4bf5f032eaa` | Branded renderer, secure sharing, DEMO setup |
| `537d06c7580993b24d442736b06811f2687f2c04` | Authentic branding, preview sizing, media/UI tests |
| `c18f468e83224a9668eba757cf20a591c17d08c2` | Source-backed visible highlights and compact editor disclosures |
| `60330f382e250242e2cb0297ca9bf5a83d4e3645` | Photography catalog thumbnail and readable excerpts |

This report and the five adjacent screenshots are saved in a subsequent documentation-only commit.

## 18–19. Review access and screenshots

[Open hosted Admin → Proposals](https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/admin/proposals/). Use the existing authorized Cloudflare Access login. The four independent client-view test URLs are above.

- [Wedding desktop](giolina-wedding-final.jpg)
- [Photography mobile preview](giolina-photo-mobile-final.jpg)
- [Sweet Sixteen](giolina-sweet-final.jpg)
- [Event / Corporate package](giolina-corporate-final.jpg)
- [Filtered catalog](giolina-catalog-review.jpg)

## 20. Exact next phase

Frank personally reviews the four demonstrations, including mobile presentation, and confirms the historical Sweet Sixteen and corporate pricing/scope. Implement his review-driven refinements next. Only after that checkpoint and separate authorization should controlled email testing be considered. Do not automatically proceed into live email, acceptance, signatures, payments, portal activation, or production.
