# Payment integration plan — Phase 1, inactive

No payment provider, credentials, webhook endpoint, live charge, bank/card collection, client Pay button or receipt generator is enabled. Current invoice records are private drafts; manual history is bookkeeping entered by an administrator, not processor confirmation. Do not treat these records as a production accounting ledger.

## Ownership and replaceable adapter

GioLina owns project/contact IDs, line-item snapshots, integer USD cents, invoice versions, discounts, explicit tax amounts, schedule and internal status. A provider adapter later owns checkout-session creation, signed-event normalization, payment lookup, refund requests and provider receipt references. Store provider name and opaque external IDs separately from GioLina IDs. Never send private notes to the provider or store raw card/bank data in D1, frontend code or logs.

Candidate adapter contract (design only): `createCheckout(invoiceVersion, installmentId, idempotencyKey)`, `verifyAndNormalizeWebhook(rawBody, signature)`, `lookupPayment(providerPaymentId)`, `requestRefund(paymentId, amountCents, idempotencyKey)`. Credentials belong in Worker secrets, separately for sandbox and production. No adapter is implemented in this checkpoint.

## Invoice and event model

Before financial activation, add immutable issued invoice snapshots and an append-only payment/refund ledger with organization/project/invoice IDs. Allocate final sequential business invoice numbers atomically after the numbering policy is approved. Current `GL-DRAFT-<UUID>` identifiers remain draft identifiers.

Future invoice states: Draft → Sent → Viewed; confirmed ledger entries derive Partially Paid / Paid; due dates derive Overdue for an unpaid issued obligation; Cancelled/Void requires an explicit audited action. Opening a page does not mark a payment received. Refunds and disputes are separate events rather than deleting or rewriting history. Manual adjustments require an actor, reason and audit event. An issued invoice edit creates a revision/credit adjustment, not silent rewriting.

Each installment stores a stable ID, due date and amount. Create one checkout for the approved remaining installment or balance, with a server-validated amount and revision. Do not implement automatic off-session charges until consent and retry rules are approved. Prevent two concurrent sessions from over-collecting the same obligation; reconcile pending sessions and serialize ledger posting. Deduplicate signed webhook events with a unique provider/event ID, tolerate retries and out-of-order events, and compare currency, amount, invoice/version and environment before posting. Preserve unresolved events for review. Reconcile processor payments and payouts separately: a successful customer payment is not the same as a bank deposit.

## Client experience and authorization

Invoice → secure provider checkout → confirmation/receipt. The invoice view should show total, paid, balance, due date and installments. Use reviewed client identity plus explicit organization/project grants; IDs alone never authorize access. No public invoice-by-ID route. If expiring invoice links are approved later, store hashed high-entropy scoped tokens with revocation and rate limits. Proposal DEMO links do not authorize invoice access.

The return URL may say payment is being confirmed; only trusted provider state can show Paid. Bank payments need a visible pending state. A receipt appears only for a confirmed payment and contains the correct refund status. Downloads need the same invoice authorization. No receipt email or payment reminder until transactional sending is approved.

## Provider research, checked 2026-10-05

Stripe is one candidate, not a selected or activated provider. Its hosted Checkout provides a payment page where the provider collects payment details. ACH Direct Debit requires authorization and bank verification and has delayed success/failure notification; this is why a redirect cannot settle GioLina's invoice. Signed webhook verification and retry-safe processing are required in the proposed adapter. Refunds need explicit provider confirmation and corresponding ledger entries. Account eligibility, fees and business terms must be reviewed before selection.

Official references:
- https://docs.stripe.com/payments/checkout
- https://docs.stripe.com/payments/ach-direct-debit
- https://docs.stripe.com/webhooks
- https://support.stripe.com/questions/refunds-for-ach-direct-debit-payments

## Decisions and release gates

Frank must approve provider, card/ACH methods, retainer/installment rules, refund/cancellation rules, final invoice numbering and accountant-reviewed tax handling. Then implement in sandbox with signed/replayed/duplicate/delayed webhook tests, decline/refund/dispute cases, tenant isolation, audit retention, backup/restore and real-device review. Client security review precedes client login or invoice exposure. Separate approval is required for production activation. HoneyBook remains the live operational system throughout Phase 1.
