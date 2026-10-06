# Project-centered Admin foundation — 2026-10-06

Preview only. Existing records, catalog sources, supplied videos and production integrations are preserved. No seed/setup action ran against hosted data during this pass.

## Document workspace and correspondence

Project → Documents contains Proposal, Contract and Invoice, with contextual Create actions. Client Portal access remains in the project header. Contracts and invoices are both in the main Packages & drafts navigation group.

Use Template opens an editable email draft after selecting its project. The composer has To, subject, body, template picker, preview, signature and a per-draft signature toggle. Project context supplies recipient and merge values. Share → Create email with PDF draft creates a frozen document attachment, then opens the composer. Editing preserves the snapshot; an attached draft cannot move to another project. Saves are audited. There is no send endpoint, mailbox connection or upload attachment feature. Existing document PDFs are the supported attachments.

Settings stores a versioned organization-scoped default signature, default inclusion, invoice tax rate/presets and notification categories. Security and delivery failure preferences cannot be disabled. Preferences do not activate delivery. The signature starts blank until Frank enters approved details.

## Contracts and future e-signature boundary

Reusable templates use `templates.templateType = contract`; existing email templates remain compatible. Project-linked contracts copy template body/required merge fields/signature field labels, retaining their own editable draft. Supported merge fields: clientName, partnerName, eventDate, eventType, venue, location, services, price, paymentSchedule. Missing fields are visibly marked in generated draft HTML/PDF. Language supplied by the create flow is explicitly DEMO workflow text, not approved legal language.

Actual contract `status` remains Draft. Separate `reviewState` supports Draft/Sent/Viewed/Signed **simulation only**, with non-Draft simulation rejected for non-DEMO projects. Signature field labels are inert: no signature capture, binding acceptance or provider callback exists. A future provider integration must supply verified signer email, consent, immutable document hash/version, envelope and signer IDs, provider-verified event/webhook signatures, idempotency keys, timestamps, evidence/certificate retention and an auditable transition state machine. Only verified provider events may ever set a real Signed status. Frank must approve provider and legal templates before enabling that phase.

All three documents offer Copy client link, Download PDF and Create email with PDF draft. Public links are isolated DEMO snapshots, expire and revoke; non-DEMO sharing remains blocked. Reset Client Link lives in advanced security options and explains invalidation of previous links.

## Invoice and payment planning

Invoice controls separate Add Package, Add Add-on and Add Custom Item. Active source offerings retain their prices; Sweet Sixteen photo and film are separate choices. Duplicate catalog clicks direct the user to adjust quantity instead. Client invoices omit proposal marketing descriptions.

Server totals use integer cents and basis-point arithmetic: subtotal − percentage/fixed discount + tax = total; manual received payments reduce remaining balance. Tax supports none, percentage, legacy fixed amount. Percentage labels show `%`. Tax is calculated after discount. This is an explicit preview calculation policy, not tax advice or a jurisdictional determination.

Named installments support deposit/retainer, further payments and custom due dates. An incomplete draft may be saved; `scheduleComplete` requires exact allocation of the invoice total. Over-allocation, overpayment and discounts exceeding subtotal are rejected. Manual payment records never process money.

## Scheduling and remaining integration limits

Project scheduling carries the client/project automatically. Session choices are Consultation Call, Planning Call, Client Meeting and Other. Existing type IDs/records are preserved, including legacy names. Duration, location/call type, confirmation preference and reminder hours are editable; existing availability/overlap/buffer validation remains active. Session-type settings can hold an existing scheduling URL. No new public self-booking flow or Google Calendar connection is activated. Confirmation/reminder delivery remains inactive.

Client access states already supported Not Invited, Invited, Active and Disabled for DEMO identities; invite/resend/revoke/re-enable remain test-only. Real client email identity/password self-management will require a separately selected authentication provider, with no plain-text passwords stored or exposed to Admin.

## Verification and limits

Checkpoint: 58 Admin tests, build, 35 route checks, 107 redirects, 15 sitemap URLs and five public homepage/media tests passed. Newly added tests cover settings versioning/isolation, mandatory preferences, invoice rounding/schedule allocation, contract merge/escaping/draft restrictions, DEMO share/PDF/revocation, frozen draft attachments, contextual Documents/Create and invoice/composer UI actions.

Hosted Admin currently redirects this browser to Cloudflare Access sign-in. No protection was weakened. Signed-in hosted acceptance and physical device review remain open. Public homepage/font audit verified live; audit completed 23 non-redirect routes at 1440×900 and 390×844. No private wedding screenshots committed.

## Project Home portal completion

The DEMO portal retains a neutral project identity hero and now provides stable Overview, Documents, Schedule, Payments and Files navigation with useful empty states. Its proposal lives inside Documents; contract drafts join proposals and invoices with view/PDF routes. Public contract views are escaped, bounded by the existing DEMO project/email identity and revocation checks, and explicitly nonbinding. Client-visible appointment location/call type is included; internal notes stay excluded.

Resending a DEMO invitation records the request without invalidating an active session or sending email. An explicit advanced **Refresh DEMO documents** action publishes current snapshots and warns that it resets proposal choices; existing links/snapshots remain unchanged until that action is selected. It does not seed, overwrite source records or run automatically. Legacy grants without contracts continue to work.

No hosted access states, documents or records were changed during this implementation. The existing passwordless DEMO link is not a real client account/password implementation. Real identity-provider selection, client-controlled password setup and invitation delivery remain deferred.

## Review destinations

Use the existing hosted preview origin, then:

- `/admin/` — Dashboard
- `/admin/projects/?record=demo-presentation-wedding-cinema` — existing Wedding DEMO Project
- `/admin/projects/?record=demo-presentation-wedding-cinema&section=Documents` — Documents
- `/admin/projects/?record=demo-presentation-wedding-cinema&compose=1` — editable unsaved draft
- `/admin/templates/?type=contract&example=1` — unsaved DEMO contract template example (no automatic save)
- `/admin/projects/?record=demo-presentation-wedding-cinema&invoice=1` — new unsaved invoice in Project context
- `/admin/projects/?record=demo-presentation-wedding-cinema&portal=1` — existing access status and portal preview action
- `/admin/calendar/` — Scheduler
- `/admin/settings/` — signature, tax presets, notifications and template/planning links

These Admin paths require Cloudflare Access. IDs are the existing application DEMO IDs; no replacement records were seeded. Hosted signed-in verification is blocked in this browser by the sign-in requirement, so these deep-link flows are covered locally and remain for Frank's signed-in review. A public client-token URL is deliberately not invented or regenerated for this report.
