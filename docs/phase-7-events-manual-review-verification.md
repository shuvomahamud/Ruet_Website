# Phase 7 Events And Manual Review Verification

Verified: 2026-07-13

## Completion Statement

Roadmap Phase 7 is implemented for tasks `H-01`, `H-02`, `H-03`, `H-05`, `H-06`, `H-07`, `I-01`, `I-02`, and `J-02`. `H-04` remains explicitly `Superseded` by the Zelle-only payment decision.

The delivered workflow covers public event discovery, free and paid registration, transaction-safe capacity, quantity-aware waitlists, immutable Zelle attempts, shared role-scoped payment review, completed-event recaps, protected virtual access, and deduplicated operational email.

## Delivered Behavior

### Public event experience

- `/events` filters published events by date range, chapter, mode, price, upcoming/archive state, and availability.
- Cards expose schedule, timezone, mode, chapter, price, and useful capacity states on desktop and mobile.
- `/events/[slug]` renders schedule, venue/virtual information, authoritative pricing, remaining capacity, the user's registration/waitlist state, and the correct register, waitlist, accept-offer, or resubmit action.
- Completed events remain useful in the archive with recap text and valid same-chapter public gallery media.
- Gallery assignment is rejected until an event has ended.

### Registration, payment, and capacity integrity

- Direct public writes to registrations and waitlist records are denied; all mutations use validated workflow services and authenticated routes.
- Free registration confirms atomically.
- Paid registration creates a pending registration, order, and immutable payment attempt using server-authoritative event and promotion totals.
- Proof accepts a transaction ID, image, or both. Proof media remains private and role-scoped.
- Row locks serialize capacity-sensitive registration, waitlist, cancellation, promotion, and approval transitions.
- Confirmed registrations, pending paid registrations, and unexpired promoted offers reserve their quantities.
- Payment approval rechecks capacity and cannot overbook the event.
- Rejection preserves the failed attempt; resubmission creates a new attempt and never rewrites the old evidence.

### Waitlist lifecycle

- A full event supports an explicit quantity-aware waitlist.
- Capacity release selects the earliest waiting group that fits, skipping earlier oversized groups without deleting them.
- The offer duration is editable per event and defaults to `48 hours`.
- An unexpired offer reserves its quantity. Acceptance produces either a confirmed free registration or a pending paid registration.
- Expired offers release capacity and trigger another earliest-fitting pass.
- Authorized cancellation releases capacity and reprocesses the waitlist; it never performs or promises an automated refund.
- The `eventLifecycle` task runs every 15 minutes through the `waitlist` queue.

### Review scope and notifications

- `/payments/review` combines membership and event Zelle attempts with transaction-type, status, and chapter filters.
- Chapter admins can review only proofs assigned to their chapters. Admins and super admins have organization-wide oversight.
- Approve/reject routes are idempotent, record reviewer metadata, and update the appropriate membership or event records.
- Stable delivery keys deduplicate registration, payment-pending, reviewer, approval, rejection, waitlist-joined, promotion, expiry, and cancellation notices.
- Non-public virtual links are returned only to confirmed registrants or authorized event/chapter managers.

## Data And Migration

- Forward migration: `20260714_061936_phase_7_events_registration_waitlists`.
- Registration snapshots preserve event title, start time, chapter name, unit amount, currency, and related waitlist entry.
- Event configuration adds registration windows, offer duration, recap content, and protected virtual-access behavior.
- Waitlist state supports accepted offers and accepted timestamps.
- Purpose-built indexes cover capacity lookups and one active registration/waitlist position per user and event.
- Payload schema push is disabled so migration-owned partial/composite indexes are not silently removed in development.
- Generated Payload types include all Phase 7 fields and states.

## Automated Evidence

The focused Phase 7 suites verify:

- concurrent free registration cannot overbook
- paid seats remain reserved through review and approval
- promotion snapshots and totals are server-authoritative
- chapter proof visibility is isolated
- rejection/resubmission preserves immutable attempts
- cancellation releases capacity
- earliest-fitting waitlist behavior skips oversized groups
- offer expiry and acceptance are safe
- private virtual links and completed galleries obey visibility rules
- operational notifications are deduplicated
- the browser experience covers filtering/archive, free registration/history/responsiveness, paid approval/private access, and rejection/resubmission

Focused browser result:

```text
pnpm test:e2e -- tests/e2e/events.e2e.spec.ts
4 passed
```

Full phase gate:

| Command | Result |
| --- | --- |
| `pnpm generate:types` | Passed; generated Payload types are current |
| `pnpm lint` | Passed with no errors or warnings |
| `pnpm typecheck` | Passed |
| `pnpm test:int` | Passed: 10 files, 49 tests |
| `pnpm build` | Passed: optimized Next.js production build |
| `pnpm test:e2e` | Passed: 28 Chromium tests |
| `pnpm jobs:run` | Passed after schedules were handled; no failed due jobs |
| `pnpm payload migrate:status` | Passed; all migrations through the Phase 7 migration show `Ran: Yes` |
| `pnpm payload migrate:create phase_7_drift_check` | No schema changes detected; no blank migration created |

The full gate initially exposed and then verified fixes for long CMS values overflowing the mobile event catalog, nondeterministic browser fixtures racing over the singleton Site Settings global, and integration cleanup deleting email audits before their queued test jobs. The final run uses responsive intrinsic-size constraints, serial browser workers for the shared test database/global, and job-before-delivery cleanup. No gate defect was deferred.

## Operational Defaults And External Inputs

The implemented defaults are intentional and documented in the requirements baseline:

- pending paid registrations reserve capacity
- unexpired waitlist offers reserve capacity
- offer validity defaults to 48 hours and is event-configurable
- private virtual links require confirmation or management authority
- no self-service cancellation or automated refund is provided

Production launch still requires the stakeholder's final Zelle recipient details, payment/no-refund wording, event email wording, manual-review SLA decision, verified sender, and email-provider credentials.

Operations are documented in [event-payment-waitlist-operations.md](/Users/shuvomahamud/Projects/RUET_Website/docs/event-payment-waitlist-operations.md). Manual UAT is documented in [uat-phase-1-2-guide.md](/Users/shuvomahamud/Projects/RUET_Website/docs/uat-phase-1-2-guide.md).
