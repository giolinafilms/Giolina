# GioLina correction / reviewability checkpoint — October 5, 2026

## Recovered and preserved

Started on clean preview/homepage-photography-rotation at 8de745b9a406a5e98e624df08dfd6553229daddf. Read current migration log, commits, Phase 1 QA and implementation before editing. Existing dashboard, Leads, Contacts, Projects/workspaces/stages, catalog/Active Packages, Proposal Builder/sharing, invoice drafts/manual history, portal foundation, audit/history and Access/D1 checks survive. No reseed or broad Phase 2. Public metadata, URLs, SEO checks, GA4, redirects, scheduler, Formspree and playback controllers are preserved.

## Completed corrections

Admin's default client preview iframe had a fixed desktop width of 1280px inside the dialog. It now uses Fit this screen by default and caps explicit review frames to available space. Client CSS reflows hero names and typography, intrinsic grid widths, tablet/phone cards, prices, summary rows and vertical phone galleries. Hero images retain intentional portrait cropping. Details/gallery links and film close controls have 48px touch targets. No content/package/price changes and no client-selection activation. Desktop introduction retains its original 1:1.3 column ratio.

First correction commit 602bccdb09c7af54f76a9401a3cc36c1f7be1610 passed build, 32 Admin tests, public route/asset and SEO checks; native Cloudflare preview build succeeded. Screenshots capture actual hosted snapshot documents, not local mocks. Temporary noindex layout harness used only already-public DEMO snapshots and is removed after QA.

## Hosted responsive evidence

| Proposal | Frame width × height | Root client / scroll width | Horizontal overflow |
| --- | --- | --- | --- |
| Jamie + Taylor Wedding photography | 390 × 844 | 375 / 375 | None |
| Jamie + Taylor Wedding photography | 430 × 932 | 415 / 415 | None |
| Jamie + Taylor Wedding photography | 768 × 1024 | 753 / 753 | None |
| Jamie + Taylor Wedding photography | 1024 × 768 | 1009 / 1009 | None |
| Jamie + Taylor Wedding photography | 1280 × 800 | 1265 / 1265 | None |
| Avery Sweet Sixteen | 390 × 844 | 375 / 375 | None |
| Avery Sweet Sixteen | 430 × 932 | 415 / 415 | None |
| Avery Sweet Sixteen | 768 × 1024 | 753 / 753 | None |
| Avery Sweet Sixteen | 1024 × 768 | 1009 / 1009 | None |
| Avery Sweet Sixteen | 1280 × 800 | 1265 / 1265 | None |

Chrome's vertical scrollbar takes 15px; frame innerWidth/innerHeight match the stated dimensions. Element bounds inspection found no off-screen horizontal content. Full name is readable, phone cards stack, $2,300 total fits, phone gallery images load with no sideways track. Sweet film dialog fits 375px content width (351px dialog), Close is 48px high, click adds one iframe and closing removes it. Existing player controls loaded and film footage was visible. Physical iPhone/Safari acceptance, physical iPad footer and real-device Admin acceptance remain open.

Hosted screenshot evidence (hero, services, summary, gallery, tablet, desktop, plus large phone and film): /qa/proposal-mobile-2026-10-05/. Screenshots contain only DEMO client details and public portfolio media. Shared CSS affects all existing proposal themes. No actual physical device certification is claimed. This pass did not access private hosted Admin records or change D1 data; Admin fit correction is inspected in code and covered by the general build/test gate.

## Package / client-selection capability audit

| Capability | Actual current behavior |
| --- | --- |
| Client package selection | Read-only presentation; no package picker/radio/checkbox |
| Multiple packages | Admin can add multiple catalog lines; no mutually exclusive client choice |
| Optional add-ons | Admin can mark lines optional; client can read details, cannot select |
| Totals | Trusted saved total displayed; optional lines excluded; no live client recalculation |
| Client interactions | Open details, view gallery, play/close supported film |
| Admin edits | Catalog activation, package components/options, item quantity/price/description, discount, order, event/client/presentation fields |
| Lead/project associations | Proposal has leadId/projectId/contactId; Project has packageId/serviceIds; Lead has serviceIds |
| Active Packages | Preserved catalog distinction/filter; non-archived records with active !== false appear in builder |
| Reusable proposal templates | Shared event treatments + package catalog; no first-class proposal-template entity/assignment workflow |
| Later progression | Questionnaire collection, binding acceptance/contracts/signatures, real proposal delivery and payments remain inactive |

HoneyBook source catalog is unchanged: 47 source-backed entries/historical variants and source metadata preserved. Wedding film DEMO uses source $3,150; Wedding photo DEMO uses $2,300 and optional $1,000 engagement; Sweet film DEMO uses its distinct historical source $1,800 with optional $350 drone. The source-backed Sweet Sixteen 6-hour photography $1,650 remains a separate service, not replaced by the film price. This correction pass does not approve any historical variant for live quoting. No invented packages/prices or restructuring of baseline treatments.

See CTA_AUDIT.md and CTA_AUDIT.json for every rendered inquiry/contact anchor, destinations, Formspree submission endpoint and CRM boundary. Automatic Formspree -> Lead ingestion is not implemented. Manual lead creation and atomic Contact/Project conversion exist. No live inquiry/email/scheduler submission was performed.

## Public presentation identities and treatment

| Area | Before correction | Image / thumbnail | Actual destination | Verified destination identity | Result |
| --- | --- | --- | --- | --- | --- |
| Photography | Simple Stephanie & Danny presentation link | None | https://clients.giolinafilms.com/StephanieDanny/Wedding | Heading Stephanie + Danny | Preserved simple link |
| Cinematography | Recent image-led Alexandria & James feature | /assets/ally-james-delivery-preview.jpg | https://mediazilla.com/FY22EfWIt8 | Actual presentation title Ally + James; expanded Alexandria not verified | Restored pre-feature simple Ally & James link; no thumbnail |

Git history shows the earlier safe cinema section at 6550285 and the later image-led change at bdc574c. Only that section is restored, not a broad rollback. Existing same destination/new-tab behavior remains. No Alexandria image/name is paired with an unverified expanded identity.

## Exact supplied review shorts

Recovered actual Library bytes using these exact supplied names; inspected ffprobe metadata and decoded frames. Matching identity is Frank's direct source verification, not a Vimeo/MediaZilla guess.

| Couple | File | Duration / format | Bytes | Status |
| --- | --- | --- | ---: | --- |
| Deanna & Anthony | deanaAnthony_instaCut_v03_published.mp4 | 111.653208s, H.264 1920×800, AAC 48kHz | 213599951 | Source supplied/verified; hosting integration pending |
| Lauren & Tommy | 1minuteClientRecap_LaurenTommy_1920x1080_published(1).mp4 | 59.059s, H.264 1920×1080, AAC 48kHz | 79071958 | Source supplied/verified; hosting integration pending |
| Christina & Danny | No authentic matching supplied source recovered | — | — | Unresolved |
| Stephanie & Danny | No authentic matching supplied short recovered | — | — | Unresolved; photography presentation is not a short-film source |

SHA256 Deanna: 5d26ec3f74543806e791acd1cc2c59dd68e70d9f2ca36cda7f777e8a4f8666e1.

SHA256 Lauren: 6e17c7457084011a406a895dbe5374cc4f84d84e792519315ecc172c84d447dc.

Both originals exceed the 25MiB Workers static asset per-file limit. No original MP4 entered Git, alternate long film was substituted, public playback mapping was changed, or unapproved hosting destination was created. Frank needs to specify an approved video delivery destination (for example the existing provider) and upload/authorize upload of these exact files; then supply matching URLs/player IDs. Reuse the existing click-to-load/unload player with verified matching posters after hosting exists. Source availability is resolved; integration is not falsely closed.

## Still unresolved / next review

Frank's real-device proposal mobile acceptance, Admin phone/tablet acceptance and physical iPad/Safari footer gap. Christina & Danny and Stephanie & Danny authentic shorts. Video host/delivery for the two verified new sources. Automatic public inquiry ingestion and client selection/price recalculation are future work, not activated here. Legacy CTA anomalies are documented but unchanged in this audit-only pass.

HoneyBook remains operational for scheduling, correspondence, contracts, payments and history. No production launch, DNS/routing, clients.giolina.co, email/Workspace, Search Console, signatures, payment processing or real outbound proposal/message changes.
