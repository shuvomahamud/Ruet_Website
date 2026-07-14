# Phase 6 Membership And Zelle Verification

Updated: 2026-07-13

## Outcome

Roadmap Phase 6 is complete. RUETIAN USA now has one configurable annual membership plan and a complete Zelle-only join, manual-review, renewal, grace, expiration, and reactivation lifecycle.

Completed tasks:

- `F-01` Membership overview page
- `F-02` Join membership flow
- `F-04` Zelle membership payment flow
- `F-05` Membership renewal and reactivation flows
- `F-06` Membership admin controls

`F-03` remains `Superseded`; no Stripe or card-payment path was added.

## Implemented Experience

- The public membership page renders the single active plan's price, benefits, FAQs, renewal policy, terms summary, and join/renew/status calls to action.
- Authenticated join requires a complete alumni profile and active primary chapter.
- Promotion codes are normalized and evaluated on the server for active dates, membership scope, member-only eligibility, type/value, and usage limit.
- Site Settings owns the Zelle recipient name, email/phone, instructions, manual-review wording, and no-refund notice.
- Checkout accepts a transaction ID, a JPG/PNG/WebP/PDF proof up to 8 MB, or both.
- Members see pending, active, grace, expired, failed-attempt, order, price, term, and payment-attempt history on a private status route.
- Active/grace members renew through a new annual Zelle attempt; expired members receive a pay-to-reactivate path; failed attempts receive a resubmit path that creates a new immutable payment.
- Chapter admins review only their managed chapter's pending proofs. Admins and super admins retain organization-wide access. Rejections require a reason.
- Required submission, approval, and rejection email notices are deduplicated. The assigned chapter reviewer is notified first, with an admin fallback when no chapter reviewer exists.

## Integrity And Lifecycle Controls

- A Payload validation hook plus a partial unique PostgreSQL index enforce at most one active plan, including concurrent writes.
- Checkout locks the user, active plan, and applied promotion in one database transaction.
- The database, not browser input, creates subtotal, discount, total, currency, plan, chapter, order, payment, and membership snapshots.
- New memberships remain `pending_manual_approval` until an authorized payment approval commits.
- Rejection preserves the failed payment and pending order. Resubmission creates a distinct payment attempt and serializes concurrent requests.
- Approval dates determine membership dates. Early renewal begins when the current paid term ends; renewal during grace closes the previous term and restores an active current term.
- A scheduled daily `membershipLifecycle` task sends optional pre-expiration and grace reminders, begins the plan-snapshot grace period, expires overdue records, and deduplicates repeat runs.
- Every annual term requires a new Zelle submission. No bank credentials, automatic debit, auto-renew claim, refund automation, or self-service cancellation was introduced.

## Admin And Configuration

- Super admins can edit plan content, annual price, currency, reminder timing, grace days, sort order, and active state in Payload.
- Admins can manage membership-scoped promotions and inspect membership, order, payment, proof, reviewer, and status history using useful default columns and Payload filters.
- The dedicated review screen supports chapter-first pending review; failed attempts remain inspectable in Payload and member history.
- The CMS seed updates or creates one rich annual plan without fabricating a Zelle recipient credential.
- Configuration, review, monitoring, recovery, reconciliation, and proof-handling guidance is documented in [membership-payment-operations.md](/Users/shuvomahamud/Projects/RUET_Website/docs/membership-payment-operations.md).

## Data And Migration Verification

- Forward migration: `20260714_054208`.
- Adds plan FAQs and policy fields, membership kind/previous-term links, immutable reminder/grace snapshots, Site Settings Zelle/payment wording, scheduled-job metadata/stats, and the `membershipLifecycle` task enum values.
- Deterministically normalizes any pre-existing multiple-active-plan data before creating the single-active partial unique index.
- Generated Payload types are current and the migration is applied locally.

## Automated Verification

Phase-specific coverage includes:

- single active plan and incomplete-profile rejection
- server-authoritative fixed discount and promotion usage limit
- transaction-ID-only, proof-only, combined-proof, and missing-proof cases
- configurable price/grace snapshots that remain unchanged after plan edits
- concurrent duplicate checkout and concurrent resubmission serialization
- rejection preservation, new-attempt resubmission, approval, and idempotent duplicate approval
- early annual renewal, duplicate future renewal prevention, grace recovery, expiration, reminder deduplication, and reactivation
- member, assigned-reviewer, status-history, notification, and narrow-screen browser flows
- direct chapter isolation and unauthorized payment-review regression coverage

Phase gate commands:

```bash
nvm use
pnpm lint
pnpm typecheck
pnpm test:int
pnpm build
pnpm test:e2e
pnpm jobs:run
pnpm payload migrate:status
pnpm payload migrate:create
```

Verified result:

- lint passed
- TypeScript passed
- `43` integration tests passed
- production build passed, with the membership and homepage routes dynamically reading current plan data
- `24` Chromium browser tests passed
- the all-queue worker/scheduler command completed
- every migration through `20260714_054208` is applied
- schema-drift check reported no changes

## Required External Inputs

Before public launch, an authorized stakeholder must install:

- the final Zelle recipient email address or US phone number
- approved Zelle instructions and payment memo wording
- approved membership, payment, and no-refund terms
- either an approved manual-review SLA or final wording that intentionally makes no timing promise

The checkout UI remains safely disabled when the Zelle recipient is blank. These are stakeholder/configuration inputs, not missing Phase 6 application code.
