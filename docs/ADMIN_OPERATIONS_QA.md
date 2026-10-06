# Admin operations and automated QA — 2026-10-06

## Scope and recovered baseline

Started from clean, synchronized `5c38c2d0eb660255dce5d932c8daa3f32d5adb4a` on `preview/homepage-photography-rotation`. The native Cloudflare build for that commit was successful. Existing homepage, supplied video mappings, typography audit, source prices and prior Admin foundations were preserved. No seed, credential/configuration change, production deployment or hosted client-record mutation was performed.

## Changes in this pass

- **Tasks:** repaired the missing protected `/admin/tasks/` route, added daily navigation, TO DO / IN PROGRESS / DONE, Normal / High / Low priority, Contact association, soft archive and trusted completion timestamps. Existing boolean reminders remain compatible. Completion/reopen is explicit; repeated edits of a completed task do not create repeated completion events.
- **Lead handoff:** inquiry and private notes are retained together when a new Contact is created. Existing email matching respects organization, DEMO and archived boundaries. A matching Contact/event type/event date Project blocks an accidental new conversion and directs Admin to the existing association action. The check is repeated inside the atomic write batch. Original Lead and related proposals/history remain linked. Undated events are not guessed to be the same event.
- **Project:** at-a-glance stage, draft invoice totals, manual payments, planned balance, outstanding installment, next appointment, open tasks, document states and DEMO portal access. Recommended attention is derived from existing tasks/payment plans/drafts; it does not perform delivery. Create Task preserves client/project context. Invoice/task/contract editors return to the Project section on save/cancel; contextual proposal preview returns to Documents.
- **Dashboard:** terminal accepted/declined/expired proposals no longer count as waiting drafts. Outstanding scheduled installments work even without a parent invoice due date. Open tasks show priority/status/due date and overdue labels; done/archived tasks are excluded.
- **Communications:** saved custom drafts and document-PDF drafts carry trusted Project Contact identity. History shows draft timestamp and PDF attachment presence. Draft is the only delivery state permitted; no queued/sent/failed delivery is fabricated.
- **Audit:** completion, document state changes, DEMO contract-state simulation, manual payment-history changes and schedule changes receive explicit events. Newly created Lead Contacts receive history. Events record IDs/state labels, not message bodies or financial references.
- **Find records:** protected `/admin/finder/` searches names, partner names, email, phone, venue, event/date and invoice number across Contacts, Leads, Projects and documents, joining Project/Contact context. No draft-email body retrieval. Results show DEMO/archived labels and record links. Limit: latest 500 records per area, 60 displayed matches.
- **Settings:** Business, Email, Invoices/Tax, Notifications, Templates/Scheduling, Integrations and Security/Client access are separated with inactive delivery/integration wording. No business/tax/legal/provider policy was invented.

## Objective verification

75/75 Admin tests pass (63 baseline + 12 new tests). The new tests cover task creation/edit/completion/reopen/archive, trusted timestamps/contact identity, stale edits, organization isolation, duplicate dated-event prevention/association, communication identity/Draft enforcement, audit transitions, Project totals/context/save/cancel, task filters, record finder, Dashboard document filtering and installment derivation.

A new connected in-memory SQLite/D1-adapter test exercises:

Lead → Contact → Project → source-backed proposal → demo contract → discounted invoice with balanced installments → all three document PDFs → editable frozen PDF email drafts → invoice-link reset/old-link invalidation → Project appointment → scoped DEMO portal → access revocation.

This is a local application/API integration test. It does not seed or update the hosted database. Existing tests also reverify JWT/Access boundaries, origin checks, proposal/invoice math, stale revisions, portal isolation, PDF privacy and playback rules. Passing existing tests is regression evidence, not completion of new features.

5/5 public regression tests, Astro build (36 pages), source-route checks (35), redirects (107), sitemap URLs (15) and preview analytics-disabled checks pass. No public content or font changes in this pass.

## Hosted verification limitation

The browser opens the hosted Admin and reaches Cloudflare Access sign-in. There is no authenticated Admin session available. No login code was requested, and no Access bypass or security weakening was attempted. Signed-in hosted buttons/layout/persistence cannot be certified from this session. Local UI tests use JSDOM, which checks DOM behavior but does not establish actual mobile rendering or physical-device acceptance. Responsive CSS was reviewed and new summary/finder rows wrap; physical phone/tablet and hosted authenticated layout review remain open.

## Review destinations

Base: `https://preview-homepage-photography-rotation-giolina.dawn-math-f4b1.workers.dev`

- Dashboard `/admin/`
- Leads `/admin/leads/`
- Contacts `/admin/contacts/`
- Existing DEMO Project `/admin/projects/?record=demo-presentation-wedding-cinema`
- Documents `/admin/projects/?record=demo-presentation-wedding-cinema&section=Documents`
- Tasks `/admin/tasks/`
- Finder `/admin/finder/`
- Email composer `/admin/projects/?record=demo-presentation-wedding-cinema&compose=1`
- Unsaved demo contract example `/admin/templates/?type=contract&example=1`
- Unsaved contextual invoice `/admin/projects/?record=demo-presentation-wedding-cinema&invoice=1`
- Portal controls `/admin/projects/?record=demo-presentation-wedding-cinema&portal=1`
- Calendar `/admin/calendar/`
- Settings `/admin/settings/`
- Informational font inventory `/qa/font-inventory/`

Admin destinations require Access. No new public portal token is created for this report. Hosted signed-in acceptance remains pending.

## Deferred and decisions

HoneyBook, Formspree and existing scheduler destinations remain operational and unchanged. Public inquiry→CRM intake is still manual/preview simulation; no automatic Formspree intake was activated. Live Gmail/Calendar, transactional email, invitation delivery, production notifications, payments, binding signatures and real client authentication remain inactive. Legal wording, tax policy/rates, signature wording, provider choices, video hosting and font normalization require Frank's decisions.

Still open: physical iPad/Safari footer gap; real-device Admin/proposal/swipe/audio acceptance; Christina & Danny and Stephanie & Danny authentic shorts; production master-video hosting; SmugMug OAuth/support follow-up.

## Native preview verification

Code checkpoint `8609b0c08451f9c664ef289a3dd11a1fc0c8200e` published through the GitHub connector; remote tree SHA matched the locally staged tree exactly. Local branch fast-forwarded cleanly. Cloudflare `Workers Builds: giolina` completed successfully.

Browser verification after deployment confirms the restored homepage and Reviews, Cinematography before Photography in both navigation DOM variants, no Events link, desktop homepage/Reviews/Cinematography without horizontal overflow, Formspree action and existing HoneyBook scheduler, Deanna's native short on Reviews, anniversary entries Bianca & Bobby / Sara & Phil / Nicole & Philip / Lauren & Tommy, Events redirect and the informational font inventory. No video placement was repeated. New Tasks and Finder destinations both reach Cloudflare Access sign-in; authenticated application rendering remains unverified. Terminal HTTP access to the preview returned 403 in this environment, so public hosted verification used the browser instead; this is not reported as a site outage or bot block.

No screenshots or private client imagery were added to Git. No production routing, DNS, email, provider credentials, real sending/signing/payment or hosted DEMO record changes occurred. This pass stops at the verified preview checkpoint; real-device/signed-in acceptance remains open without blocking completion of the objective QA work.

Final QA correction: editing an older already-completed reminder without a known completion timestamp leaves that timestamp unknown instead of inventing today as the completion date. Newly completed tasks still receive server time. A dedicated regression covers this boundary; final Admin suite is 75 tests.
