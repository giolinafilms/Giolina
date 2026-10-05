# GioLina Phase 2B review — October 5, 2026

## Completed

Recovered clean Phase 2A commit d5a24eb; retained existing records, code, preview and Phase 1/2 foundations. No rebuilding, reseeding or rollback.

- Fixed selectable coverage groups across browser controls, authoritative server validation, saved D1 selections and reload behavior. Admin explicitly controls whether a group may be removed. Required groups still need exactly one choice; fixed inclusions cannot be removed. Removable groups allow zero or one choice; independent optional services/add-ons support multi-selection.
- Generated Lead/Project proposals now configure offered coverage groups as removable. Checking an alternative unchecks its peer; checking the same offering again removes it. Removing coverage clears incompatible dependent add-ons. Selected cards and touch controls explain selected/unselected state.
- Existing published snapshots remain intact. Old required groups are not silently converted. Admin can explicitly mark a group removable and regenerate its DEMO link; the new review links below already use the fix.
- Optional cards are more concise, with readable prices and touch controls. Photography cards no longer display unrelated cinema playback buttons. Wedding desktop presentation and phone reflow remain intact.
- Added two reusable Corporate Event baselines and three exact source service records: historical 2025 five-hour photography $1,600; four-hour candid photographer $1,300; five-hour video $2,700. Preserved all original 47 source variants. Protected setup appends only missing records; existing originals/edits are preserved. Originals are read-only, duplicates editable. No new LKQ/current 2026 pricing inferred.
- Corporate proposals use company/event identity, historical coverage options, authorized Atlas and Preferred Healthcare short recap buttons, and private-delivery explanation. No complete private corporate presentation, private source invoice, client contact, invoice identifier, tax or payment history is published/imported.
- Added protected contextual Lead/Project/Package Source links and links to existing related draft invoices in proposal review. Project history now receives stored audit details and displays named selected/removed items and trusted totals in Eastern time. Public projections do not include these private navigation/history fields.

## Authoritative corporate sources

Read both supplied corporate PDFs. Preferred Healthcare pages 1–2 explicitly confirm the three services/prices and full deliverables. The file named `Atlas_Corporate 12_09_25 Smart File _ HoneyBook.pdf` contains the same Preferred Healthcare invoice text, so it does not independently establish Atlas pricing. The baseline uses verified Preferred Healthcare service facts, without copying the client’s personal/payment/invoice information. The two authorized recap URLs are separate portfolio examples, not permission to reveal complete private deliveries.

Wedding and Sweet Sixteen baseline originals remain unchanged: wedding Feature Film $3,150/8h, wedding photography $2,300/8h, Sweet Sixteen photography $1,650/6h and cinema $1,800/6h. Their historical 2024/2026 distinctions and source descriptions remain preserved.

## Verified

38 automated tests pass, including actual Worker/D1 persistence, stale edits, forged-price rejection, required item protection, revoked DEMO links, organization isolation, catalog snapshot boundaries, baseline duplication, dependent add-ons and browser select/deselect/reselect. Build, public-route and SEO checks pass: 36 built pages, 101 redirects, 15 sitemap URLs and preserved GA4 configuration. Preview tracking remains disabled.

Final code commit `2aa29c3421e2e632c040290fb9cda6650b790b3a` also deployed successfully. Hosted corporate introduction order and protected named selection history verified: candid selection $5,600, removal $4,300; restored $4,300 for review.

Hosted native preview builds succeeded for correction commit `2c5dd580dbc41c91b66d4d8eea3092b19f052c15` and corporate commit `ddd926792ba88374c84e0938e771297038980a5d`.

| Hosted walkthrough | Verified result |
| --- | --- |
| Wedding coverage | $5,450 → remove cinema $2,300 → reselect $5,450 |
| Wedding drone | $5,450 → select $6,000 → deselect $5,450 |
| Wedding save/reload | Removed cinema remained unchecked and $2,300 persisted; restored $5,450 for review |
| Sweet Sixteen coverage | $3,450 → remove photo $1,800 → reselect $3,450 |
| Sweet candid add-on | $3,450 → select $4,100 → deselect $3,450 |
| Sweet save/reload | Removed photo remained unchecked and $1,800 persisted; restored $3,450 for review |
| Corporate baseline/duplicate | Protected original $1,600 preserved; editable duplicate used in synthetic Lead → Project → Proposal |
| Corporate choices | Photo/video $4,300 → candid $5,600 → remove photo and dependent candid $2,700 |
| Corporate save/reload | $2,700 persisted; restored $4,300 for review |

Fully loaded hosted proposal canvases tested at 390×844, 430×932, 768×1024, 1024×768 and 1280×760. No horizontal overflow: document scrollWidth equals clientWidth (the cloud browser uses a 15px vertical scrollbar). Phone and tablet Wedding touch toggles also recalculated correctly. These are cloud Chromium/iframe checks, not physical Safari certification. Public link persistence was tested separately from the protected Admin preview, which intentionally does not save.

Existing two draft invoices remain unchanged; no additional invoice issued or payment flow activated. Hosted Photography remains the simple Stephanie & Danny presentation link; Cinematography remains simple Ally & James linking to MediaZilla FY22EfWIt8, with no image feature. Formspree/scheduler, public playback/swipe code, SEO/metadata/GA4/sitemap/robots/redirects and production routes remain preserved. Playback regression tests pass; Phase 2A hosted playback observations remain applicable, with real-device acceptance still open.

## Direct hosted review destinations

All client links below are new synthetic DEMO snapshots. They are non-binding and do not deliver proposals to a real client.

| Review | Destination |
| --- | --- |
| Wedding client proposal | https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/proposal/ff41a8b84c9e7e2e43de1d2588ec2d28ec4e0e9ce316c351e5d374ca0969381c |
| Sweet Sixteen client proposal | https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/proposal/f59ddd3b1ecddf0e71ae16c0aae679134ba14d54ecb22c081ea3a203a73ecd3e |
| Corporate client DEMO | https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/proposal/8bf05bdef01eb6363c03655b43ead4ffb54b027c549f5a4d2d3357e5615e3d1e |
| Active Packages | https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/admin/packages/ |
| Wedding baseline | https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/admin/packages/baseline-wedding-cinema/preview |
| Sweet Sixteen baseline | https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/admin/packages/baseline-sweet-photo/preview |
| Corporate baseline | https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/admin/packages/baseline-corporate-photo/preview |
| Corporate Project | https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/admin/projects/?record=5b99fff3-6c12-4c60-8ea5-68fba0329f6b |
| Leads | https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/admin/leads/ |
| Invoices | https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/admin/invoices/ |

## Hosted screenshot evidence

Ten screenshots were captured from the hosted preview and visually inspected, covering phone hero, package controls, pricing, gallery, tablet, desktop, Sweet Sixteen and Corporate. They are supplied as session artifacts rather than committed images. Automatic approval review rejected uploading the tablet wedding imagery to the public GitHub repository without explicit approval for that disclosure. No screenshot tree was published. The code and report checkpoint proceed independently; public screenshot publication remains pending Frank's approval.

Protected preview screenshots show the intentionally inactive Save control; live DEMO saves were verified independently above.

## Still unresolved / Frank’s visual review

- Physical iPhone/iPad/Safari client proposal acceptance, including scrolling, provider playback/audio and finger swipe; cloud tests do not close this.
- Physical-device Admin phone/tablet acceptance and physical iPad/Safari footer gap.
- Authentic matching Christina & Danny and Stephanie & Danny shorts.
- Deanna & Anthony and Lauren & Tommy authentic bytes verified earlier; still need Frank’s approved external video hosting destination. No substitution or oversized repository upload.
- SmugMug support response pending; OAuth/credentials/integration left unchanged.

## Frank’s decisions

Confirm source-backed corporate scope and future/current pricing before real use, including any LKQ customization. Confirm approved hosting for the two supplied shorts. Review all three DEMOs on real devices; these are not client-ready legal delivery or booking flows.

## Deferred / inactive

Formspree production inquiries still require manual CRM entry; the protected simulator is synthetic only, not production ingestion. HoneyBook remains operational for scheduling, correspondence, contracts, payments and client history. No communications phase, real emails/proposals, contracts, binding signatures, issued invoices, Stripe/ACH/checkout/webhooks/refunds/receipts, DNS changes or production launch. Discounts remain fixed server-validated amounts: a selection below its configured discount is rejected, rather than inventing a negative or altered discount.
