# Workflow continuation — preview only

## Lifecycle and appointments checkpoint

Lead is the inquiry; Contact is the shared identity; Project is the managed event. New Lead creation reuses the same organization/DEMO-scoped Contact by email or creates it atomically. Conversion preserves the Lead, marks it Active and opens the inherited Project. Project links both Contact and original inquiry. Finishing a Project marks its unarchived Leads Finished. Intentional archives are separate; old automatically archived converted Leads can be recovered only when audit history proves conversion was their latest change.

Normal workflow displays Lead / Active / Finished / Archived while stored detailed stages remain available. Finished records remain retrievable. Project/Contact appointment entry carries identity and offers Consultation, Client Meeting, Production Meeting and Other. Date/time is explicitly Eastern; DST gaps/ambiguous clock-change times are rejected. Existing duration/buffer/conflict and public scheduler behavior are preserved. No notifications are sent.

Validation: 45 Admin tests and public build/SEO checks pass. Hosted verification follows native preview deployment. No reseeding, deletions, production routing or integration changes.

## Upcoming checkpoints

Three current source-backed template families; historical archive preservation; draft sharing/PDF; DEMO-only project portal with revocation. Production client password provider, real invitations and production Formspree ingestion remain separate decisions.
