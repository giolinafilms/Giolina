# GioLina Admin / Client Portal — Phase 1

## Current status

Implemented alongside the existing Astro marketing site. Worker-served private application and JSON API; **not statically exported into public assets**. All private paths fail closed without the preview-only origin, verified Cloudflare Access JWT, administrator allowlist and D1 binding. No public-site forms, player controllers, scheduler, client domains or production routing changed.

The preview is deployed through the existing native Cloudflare/GitHub build. Frank configured One-time PIN, the exact administrator allowlist, and the preview-only D1 database. Authenticated hosted CRUD and proposal QA from the earlier session are recorded in `qa/proposals-2026-10-05/REVIEW.md`. The current project/invoice checkpoint has 32 passing tests; its hosted verification is tracked in the migration log. This remains a private development prototype, not a production client portal or financial ledger.

## Architecture

- Existing Astro marketing pages and Worker asset handling preserved.
- `/admin/`: operational SPA served only after verified administrator authorization.
- `/api/admin/*`: server validation, same-origin CSRF checks, JSON-only writes, organization-scoped queries, optimistic versions and atomic D1 batches.
- D1 SQL migration in `migrations/0001_foundation.sql`: typed/validated JSON records indexed by organization, kind, project and timestamp; immutable change-event records; reserved client grants; atomic appointment reservations and write guards.
- Cloudflare Access RS256 signatures validated with JOSE against the configured team key set. Issuer, audience, expiry, issued-at and exact email allowlist checked. Email headers alone are not trusted. Origin must match the configured preview `.workers.dev` host; `CRM_STAGE=preview` required.
- Private application responses have no-store, noindex, restrictive CSP and no-referrer headers. Admin pages deny framing; client proposal previews permit only the existing same-origin preview wrapper. Browser DOM uses textContent for saved values. No localStorage authentication or client-record persistence.
- `/portal/`: authenticated **admin-only** project preview. `/api/portal/*` intentionally unavailable (501 after admin verification); no client sign-in, invitations or client grants activated. Client-scoped authorization and private file downloads are Phase 2, not claimed complete.

## Routes

`/admin/`, `/admin/leads/`, `/admin/contacts/`, `/admin/projects/`, `/admin/services/`, `/admin/proposals/`, `/admin/contracts/`, `/admin/invoices/`, `/admin/calendar/`, `/admin/messages/`, `/admin/templates/`, `/admin/files/`, `/admin/automations/`, `/admin/client-portal/`, `/admin/settings/`, `/portal/`.

## Working prototype capabilities

- Contacts: create/edit/duplicate/archive/restore/search; optional demo label.
- Leads/projects: contact association, event type/date/venue, shared configurable workflow stages, follow-up dates, notes; lead-to-project conversion archives the original lead atomically. Projects can select package/services/price/delivery URL, lead source, tags and a local cover image. A dedicated project screen groups Activity, Files, private Notes and Details, with draft-message and proposal actions. Changes are logged.
- Services: import source-backed catalog once, edit/create/duplicate/archive/restore/search. All versions retain source/page references, explicit prices/hours and descriptions/rules. Packages select included services and optional add-ons; pricing manually controlled, not calculated or guessed.
- Templates: editable reusable subject/body drafts, duplication and archive.
- Scheduler: appointment types, duration/buffer, weekly hours and blocked-date configuration, manual create/reschedule/cancel/complete, contact/project association. Selected reservations include buffers, reject overlapping bookings atomically, and respect blocked dates. Display timezone America/New_York; date editors explicitly use device timezone and submit ISO timestamps. Public slots, automatic weekly-window enforcement, event-date blackout protection, external calendar sync, invitations/confirmations and reminders are **not activated**.
- Dashboard: stored-record counts, due follow-ups, upcoming appointments/events, manual tasks/reminders and change activity. No fictitious client records or fabricated finance totals seeded.
- Proposals: catalog/custom snapshots, quantities, optional add-ons, discounts, server totals, editable presentation sections, photographs/film examples and client preview. DEMO-only expiring/revocable share links publish a scoped snapshot; no real sending or signatures.
- Invoices: stable server-assigned draft identifiers, issue/due dates, catalog/custom lines, quantities, discounts and explicit tax amount, server totals/paid/balance, installment plans and manual history. Legacy total-only drafts remain supported. Draft only; manual entries are not payment verification.
- Contracts/messages/files/automations: private draft/foundation records. Files are references only, not uploads. No email, contract execution, automated payments, receipts or automation execution. See `PAYMENTS_ARCHITECTURE.md` for the inactive provider plan.

## Catalog reconciliation

47 distinct source-backed service versions: 12 from 2026 wedding material, 10 from the 2024 Sweet Sixteen material, 25 visible saved-list entries. Two saved-list PDFs are duplicate snapshots, not a second import. The exports advertise **44 saved services but show only 25**; 19 entries and some subitems are unavailable. Several saved descriptions/titles are visibly clipped/interleaved. No missing text/prices are fabricated.

Historical/saved variants require review. Coverage conflicts (including 6/8/10-hour additional cinematographer variants), drone/overtime prices, and dated corporate offerings remain separately labelled. Null prices mean missing/needs confirmation; zero is never inferred from an unset source quantity. Original parsed pages preserved in `data/honeybook-source.json`; reproducible importer `scripts/import-catalog.py`. Raw source wording retained without marketing proofreading.

## Preview-only account setup — completed

The saved Access application protects the preview's private Admin/API/portal paths; administrator email is `info@giolina.co`, login uses One-time PIN and the app session lasts 24 hours. `wrangler.jsonc` declares CRM variables and `CRM_DB` only under native `previews`. Production bindings and DNS are unchanged. The public marketing site stays available.

The initial foundation SQL was applied by Frank. Do not repeat setup or reseed existing records. Use only labelled DEMO data for further tests. Client authentication, project grants, private file storage, real sending and financial processing need a separate Phase 2 security review.

### D1 migration command once a preview-specific config exists

`npx wrangler d1 execute CRM_DB --remote --file=admin/migrations/0001_foundation.sql --config=wrangler.preview-migrations.jsonc`

`wrangler.preview-migrations.jsonc` targets the same preview database as `previews.d1_databases`. The initial SQL was applied by Frank through the dashboard; do not unnecessarily repeat it. Future migrations must target this preview database. Plain `/admin`, `/api/admin`, `/portal`, `/api/portal` Access paths cover their descendants. The saved login method is One-time PIN only, instant authentication enabled, with a 24-hour app session. Team: `sweet-salad-fb3f.cloudflareaccess.com`. No production migration is authorized.

## Checks

`node admin/scripts/build-assets.mjs` rebuilds authenticated client/CSS strings. `npm run check:admin` checks generated assets, syntax, validated catalog, CRUD/audit/conflicts/tenant isolation, scheduling locks/blocked dates, JWT validation and UI DOM workflows (SQLite adapter and jsdom; no real clients). `npm run build && npm run check` validates unchanged marketing pages/SEO. `npx wrangler deploy --dry-run` checks bundling without deployment changes.

## Phase 2 decisions

Production client identity/security review; complete saved-service export and authoritative current versions; appointment types/hours/buffers; client identity and project grants; private R2 document storage; transactional email provider; payment processor such as Stripe; secure e-signature provider. Contracts/pricing terms require Frank's supplied approved content. HoneyBook stays active; no historic-client import, live emails, payments, signatures, public booking switch or domain cutover in Phase 1.

## Working CRM checkpoint 1 — Services & Packages

Catalog categories cover Weddings, Sweet Sixteen, Events/Corporate, general add-ons/fees and Needs classification. They organize the existing 47 versions without replacing source categories. Known imported IDs expose immutable source name/description/price/hours/page metadata from the supplied catalog. Working price/description and separate client-facing copy remain editable. Legacy saved records acquire view defaults without a data migration or price rewrite.

Added full read views, category/state/review filtering, separate deactivate/activate and archive/restore, and touch-friendly included/optional service checkboxes. Packages require included services, reject overlapping included/optional IDs, and preserve manual pricing. Inactive/archived services are excluded from new selection while existing selections stay visible. No new packages, inferred prices or missing business terms are invented. Earlier hosted catalog/proposal QA is documented in `qa/proposals-2026-10-05/REVIEW.md`; current changes are tracked in `MIGRATION_LOG.md`. Physical-device acceptance remains required.
