# Event Payment And Waitlist Operations

Updated: 2026-07-13

## Purpose

This runbook covers event publishing, Zelle review, capacity release, waitlist offers, lifecycle execution, proof privacy, and recovery for the Phase 7 event workflow.

## Event Setup And Publishing

Create and publish events from Payload admin. Before publishing, verify:

- chapter, title, unique slug, summary, start/end, and timezone
- in-person, virtual, or hybrid mode plus the appropriate venue/access fields
- `virtualAccessVisibility`: public only when the link is safe for every visitor
- capacity and whether waitlisting is enabled
- free or paid pricing, currency, and any eligible event promotions
- optional registration-open and registration-close dates
- waitlist offer hours; the default is `48`
- Zelle recipient details and event payment terms in Site Settings

Set both the business event status and Payload publication status correctly. Draft records never appear publicly. A recap summary and gallery may be added only after the event end time; use public media assigned to the same chapter.

## Zelle Payment Review

Open `/payments/review` and filter by transaction type, status, or chapter.

- Chapter admins see only payment attempts attributed to assigned chapters.
- Admins and super admins can use the organization-wide queue.
- Compare the immutable order total and transaction details with the private evidence.
- Approve only valid proof. The server rechecks event capacity before confirming.
- Reject invalid proof with a useful reason. Rejection releases reserved capacity and notifies the payer.
- Ask the payer to resubmit from the event page. Resubmission creates a new attempt; never edit or delete the failed attempt.

Review actions are idempotent. Repeating the same terminal action does not create another business transition or notification.

## Capacity And Cancellation

Capacity is reserved by:

- confirmed registrations
- pending paid registrations
- unexpired promoted waitlist offers

Authorized admins can cancel registrations from `/events/registrations/manage`. Cancellation releases the registration quantity and immediately attempts to promote the earliest waiting group that fits. An oversized earlier group remains queued while a later fitting group may receive the offer.

Cancellation does not issue a refund. Any off-site financial resolution follows the organization's no-refund policy and approved operational wording.

## Waitlist Offer Lifecycle

Members join or accept a waitlist offer from the public event detail page.

- The offer expiry is calculated from the event's `waitlistOfferHours` value.
- A live offer reserves its entire quantity.
- A free offer confirms on acceptance.
- A paid offer creates the pending Zelle transaction on acceptance.
- Expiry releases capacity and evaluates the queue again.

The lifecycle task is scheduled every 15 minutes on the `waitlist` queue. Production must run either:

```bash
nvm use
pnpm jobs:run
```

from an external scheduler, or one designated persistent Payload job runner as described in [email-and-jobs-operations.md](/Users/shuvomahamud/Projects/RUET_Website/docs/email-and-jobs-operations.md). Do not run overlapping unmanaged workers.

## Monitoring

At minimum, monitor:

- waitlist offers whose `offerExpiresAt` is in the past but whose state is still `promoted`
- failed `eventLifecycle` jobs or a waitlist queue older than 15 minutes
- pending event payments older than the approved manual-review SLA
- confirmed/pending/offered quantities approaching or exceeding event capacity
- failed email deliveries for event/payment deduplication keys
- repeated review, cancellation, or registration authorization failures

Inspect private records only while signed in with an authorized role. Never copy proof images, transaction IDs, virtual links, API credentials, or email bodies into public logs or issue trackers.

## Recovery

If the job worker was unavailable, restore it and run `pnpm jobs:run`. Expiry and notification transitions are idempotent, so recovery can safely process overdue work.

If approval reports that capacity is unavailable, do not change the database manually. Reject/cancel the stale pending attempt through the normal workflow, confirm the capacity state, and allow waitlist processing to select the next eligible group.

If a reviewer acted on the wrong proof, preserve the audit trail. Do not rewrite or delete the attempt; escalate to an admin and use supported cancellation/resubmission actions. Automated refunds remain out of scope.

## Pre-Launch Inputs

Replace placeholder configuration before launch:

- final Zelle recipient identity and instructions
- approved event payment, proof, cancellation, and no-refund wording
- approved manual-review response-time wording
- verified sender and production email credentials
- named event/payment operational owners and escalation contacts
