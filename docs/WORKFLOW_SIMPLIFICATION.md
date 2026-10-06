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

## DEMO project portal

Portal access is controlled from Contact or Project with Not Invited, Invited, Active, Disabled states. Enable/resend/re-enable records a DEMO invitation only; activation is an explicit simulation. No email is sent and no client password exists. Activation publishes frozen client-facing document snapshots. Refresh through a new DEMO invitation/activation when new document revisions are ready.

The portal starts with event identity/date/venue and one next action. Useful sections only: Overview, Documents, Schedule, Payments and explicitly shared Files. The proposal is a document within the event portal. No private notes, draft communications, internal activity, service catalogue or settings are exposed. Meeting notes remain private. Files require an explicit client-visible flag and an approved client URL; storage keys remain private.

Every portal/document/PDF/selection request revalidates a current DEMO Project, matching DEMO Contact, @example.test email identity and unexpired active access. Resend/re-enable rotates access; disable immediately revokes the old portal and its documents/PDFs. Changing identity invalidates old access. Production stage and non-DEMO contacts fail closed. Selections use snapshot prices, bounded input and optimistic transaction guards. No acceptance, signatures or payments are created.

Future production account flow needs an approved managed identity provider for verified email, client-created password, reset, sessions and revocation. Admin controls access and never displays passwords. Existing Admin Cloudflare Access remains unchanged. Separate standalone DEMO Share links have their own Share/revoke controls; portal revocation applies to portal URLs.

The future website inquiry path remains Formspree -> authenticated, verified intake -> idempotent Lead/Contact transaction -> manual review/Project. Production intake is not activated. The public scheduler, HoneyBook, email and existing forms remain operational.

Open website backlog: mobile Call/Inquire bar; physical iPad/Safari footer gap; physical-device proposal/Admin/audio/swipe acceptance; Christina & Danny and Stephanie & Danny authentic shorts; approved hosting for verified Deanna & Anthony and Lauren & Tommy shorts; SmugMug support follow-up.
