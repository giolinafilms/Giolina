# GioLina Admin UX / draft communications checkpoint

Continued from clean Events hotfix 98221ad and preserved Phase 2B final review 463982e. Wedding screenshots are excluded from this repository following Frank's explicit instruction. No Phase 2B implementation or existing data was restarted.

## Implemented

- Five primary navigation links: Dashboard, Leads/Inquiries, Projects, Contacts, Calendar. Packages/drafts and secondary tools are expandable; all sixteen existing destinations remain accessible. Mobile selector groups the same destinations.
- Four primary dashboard totals, expandable secondary counts and financial/history panels, and clear links into Projects and inquiries. Counts continue to come from stored records.
- Project Overview opens first, with next steps, friendly stage labels, reminders and appointments. Related proposals, contracts and invoice plans use progressive disclosure. Communications, Activity, Files, Notes and Details remain separate.
- Breadcrumbs at page/record level, protected Back to project links from linked records, and existing proposal context links remain private.
- Stage labels such as Planning, Editing and Payment plan are display labels only; existing stored values and stages are preserved.
- Advanced project editor fields are expandable; no field values removed or reseeded.
- Project message composer offers existing email templates or a custom draft, fills selected-project context only, flags missing values and previews escaped plain text. Saving creates a linked Draft message using the existing protected API and audit history. No Send button, outbound call or notification is introduced.

## Validation

41 tests pass, including client package choices/persistence, JWT/Access, CSRF, organization isolation, baseline immutability, template preview escaping, cross-project invoice exclusion, draft-only storage and advanced-field retention. Public build and route/SEO checks pass. All six Events legacy redirects and removal of visible Events navigation/CTAs remain checked.

Hosted commit 3fb41b3 passed the native preview build. Verified grouped navigation and Project Overview/Communications/Activity; existing Payment Reminder template flags missing balance/due date without guessing. Saved one synthetic DEMO communications draft, reloaded and verified persistence, Draft status, project association and created activity. Advanced project fields remain disclosed and editing was cancelled without changing the project. Visual walkthrough found grouped sidebar links wrapping inline; follow-up CSS makes each link a separate row and uses two phone columns for the six Project tabs. No screenshot is committed. Physical Admin phone/tablet and client iPhone/iPad/Safari acceptance remain open; browser checks do not certify physical devices.

## Review destinations

- Dashboard: https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/admin/
- Existing synthetic Corporate project: https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/admin/projects/?record=5b99fff3-6c12-4c60-8ea5-68fba0329f6b
- Email templates: https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/admin/templates/
- Public preview: https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev/

Within Project, use Communications → Use email template, preview, then Save draft. Nothing is sent. Unfilled template facts remain labeled for confirmation; draft previews are not acceptance, bookings or payment requests.

## Remains inactive / unresolved

Production Formspree ingestion remains manual. HoneyBook remains operational for scheduling, correspondence, contracts, payments and client history. No mail delivery, inbox sync, automated follow-ups, binding signatures, live payments, production launch, DNS/email changes or provider credential updates. SmugMug support remains pending. Physical-device acceptance, matching Christina/Stephanie shorts and the approved external hosting destination for verified Deanna/Lauren shorts remain open.
