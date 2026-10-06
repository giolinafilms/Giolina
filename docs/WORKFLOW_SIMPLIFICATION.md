# Workflow continuation — preview only

## Lifecycle and appointments checkpoint

Lead is the inquiry; Contact is the shared identity; Project is the managed event. New Lead creation reuses the same organization/DEMO-scoped Contact by email or creates it atomically. Conversion preserves the Lead, marks it Active and opens the inherited Project. Project links both Contact and original inquiry. Finishing a Project marks its unarchived Leads Finished. Intentional archives are separate; old automatically archived converted Leads can be recovered only when audit history proves conversion was their latest change.

Normal workflow displays Lead / Active / Finished / Archived while stored detailed stages remain available. Finished records remain retrievable. Project/Contact appointment entry carries identity and offers Consultation, Client Meeting, Production Meeting and Other. Date/time is explicitly Eastern; DST gaps/ambiguous clock-change times are rejected. Existing duration/buffer/conflict and public scheduler behavior are preserved. No notifications are sent.

Validation: 45 Admin tests and public build/SEO checks pass. Hosted verification follows native preview deployment. No reseeding, deletions, production routing or integration changes.

## Upcoming checkpoints

Three current source-backed template families; historical archive preservation; draft sharing/PDF; DEMO-only project portal with revocation. Production client password provider, real invitations and production Formspree ingestion remain separate decisions.

Current selling templates are curated once from the existing PDF catalogue. The three current masters are Wedding Cinematography, Wedding Photography, and Sweet Sixteen. Sweet Sixteen retains independently selectable photography ($1,650) and film ($1,800) offerings, rather than presenting a new combined package. Appropriate source add-ons require their matching offering. Historical packages are archived without deleting prices or references, and older client proposals receive a frozen catalogue snapshot before archive. Later master edits do not rewrite client copies.

The contextual appointment picker deduplicates historical type names and shows Consultation, Client Meeting, Production Meeting, Other in that order. Project appointments distinguish upcoming appointments from history.

## Draft document sharing

Proposal and Invoice Draft use the same Share actions: Copy client link, Download PDF, Create email with PDF draft, regenerate and revoke. Public links remain bounded, expiring DEMO snapshots on the preview Worker. Real-client invoice links are rejected. Protected PDF downloads include only client-facing document fields; private notes and catalogue controls are excluded. Email drafts store a frozen document snapshot and expose its PDF attachment for download. Nothing is sent.

PDF output embeds the existing public-site Roboto font, includes GioLina branding, client/event identity, source descriptions, service prices and a draft summary. Invoice schedules and manually recorded balances remain planning records. Optional proposal amounts are identified as offered options, without implying acceptance. Production delivery and live payment collection remain inactive.
