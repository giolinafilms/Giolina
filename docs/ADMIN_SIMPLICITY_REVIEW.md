# Public navigation and Admin simplicity review

## Reviews checkpoint

The shared header already omitted Reviews before the Events hotfix. The hotfix removed only Events; the Reviews footer link, canonical /client-reviews/ page and /reviews/ redirect survived. Restored Reviews to shared desktop/mobile navigation before Experience, with Cinematography before Photography. Reviews content is unchanged. Added checks for Reviews presence, ordering and Events absence in all shared menus. Legacy Events redirects remain intact. Hosted verification passed: /reviews/ resolves to /client-reviews/, both shared menus contain Reviews, and /events/ resolves to /ready-to-go-productions/.

Further work: simplify Lead entry, Lead to Project conversion and next actions without changing production or enabling sending/payments/signatures.

## Admin simplicity checkpoint

New Lead now starts with client names, partner, email/phone, event type/date, venue/location, source and notes. The internal name is derived from first/last name. Follow-up, associations, services, DEMO flags and other advanced values remain under additional details. Existing values are preserved on edits. Business labels replace New Record and Current Records; search/filter and secondary actions are disclosed on demand.

Open Lead shows client/event context and Create Project. Conversion uses the existing atomic, duplicate-guarded API and immediately opens the inherited Project. Already linked Leads open the same Project. Project retains all six workspace sections, private notes, files, activity and draft communications. Overview prioritizes Create Proposal, or Preview as Client and Edit Proposal when a proposal exists; invoice drafts and secondary actions remain accessible. Dashboard counts link to their work areas and response items link to Leads or associated Projects. Existing QA data is retained; normal UI uses DEMO / TEST terminology.

Validation: 43 Admin tests passed, including simple Lead entry, derived naming, conversion navigation, reuse of an existing Project, data isolation and draft-only communications. Public build, route/link, SEO and redirect checks passed. Hosted acceptance is pending this checkpoint's native preview build.

## Future login recommendation — not activated

Keep Cloudflare Access protecting Admin and retain server-side JWT verification and exact administrator authorization. Recommend Google Workspace SSO for approved staff, with Workspace MFA and explicit staff permissions; do not add a separate GioLina password database. Choose Access global, policy and application session durations deliberately (they are separate settings). A 24-hour staff session is a starting proposal, with any longer owner-device session requiring a decision about device loss and revocation. No authentication configuration changed.

Official references: https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/google-workspace/ and https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/.

## Future website inquiry → Lead — not activated

The current public contact form remains Formspree. Production inquiries do not automatically enter this CRM. Manual Lead entry and the protected DEMO inquiry simulator exist. Recommend a separate signed Formspree webhook receiver: verify HMAC against the raw request body using its signing secret, enforce timestamp/replay limits, deduplicate by submission identifier, validate/map only expected client/event fields, scope writes to the correct organization and record activity. Review Formspree plan/webhook availability and retry handling before activation. Do not expose the Admin API or enable automatic client messages. HoneyBook and the scheduler remain operational.

Official references: https://help.formspree.io/articles/advanced-features/verify-webhook-signatures and https://help.formspree.io/articles/plugins/webhooks.

## Still open / deferred

Physical-device Admin and proposal acceptance and the physical iPad/Safari footer gap remain open. Missing authentic Christina & Danny and Stephanie & Danny short films remain open. Payments, signatures, live delivery, production inquiry ingestion and production launch are deferred. Screenshots remain private and outside Git history. Full operational migration updates are maintained in the private migration copy; this public document contains only implementation review notes.
