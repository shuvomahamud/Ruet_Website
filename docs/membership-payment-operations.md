# Membership And Zelle Operations

Updated: 2026-07-13

## Configuration Before Enrollment

1. In `Membership Plans`, keep exactly one annual plan active. Configure price, benefits, FAQs, renewal wording, reminder lead time, and grace days.
2. In `Site Settings`, install the approved Zelle recipient name and email/phone, payment instructions, manual-review wording, and no-refund notice.
3. Assign at least one active chapter admin to every chapter that may receive a checkout. If no assigned reviewer exists, submission email falls back to active admins/super admins.
4. Keep `pnpm jobs:run` scheduled as described in [email-and-jobs-operations.md](/Users/shuvomahamud/Projects/RUET_Website/docs/email-and-jobs-operations.md). The daily `membershipLifecycle` task runs in the `reminders` queue.

Checkout is intentionally disabled when the Zelle recipient is blank. Do not use a fictitious production recipient to bypass this safeguard.

## Daily Review

- Open `/membership/payments/review` or filter `Payments` to membership + pending.
- Match the exact order total, transaction ID, uploaded proof, payer, and chapter.
- Approve only after independently confirming receipt in the authorized Zelle account.
- Reject with a clear, non-sensitive reason when the attempt cannot be verified. The original attempt remains immutable and the member can resubmit.
- Never edit orders, payments, membership snapshots, or proof files to force an outcome.

## Monitoring

- Confirm the `membershipLifecycle` scheduled job completes daily.
- Review failed `reminders` and `transactional` jobs and their private `Email Deliveries` audits.
- Monitor pending payment age against the approved manual-review SLA. Until an SLA is approved, public wording must not promise a turnaround time.
- Reconcile approved membership payments to paid orders, active membership terms, and the external Zelle ledger.
- Investigate any database rejection of `membership_plans_single_active_idx`; deactivate the current plan before activating another.

## Recovery Rules

- Re-run a failed lifecycle job safely; transitions and reminder keys are idempotent.
- Repeating the same payment decision is a no-op. A different terminal decision is rejected.
- Do not delete a failed attempt. Ask the member to use resubmission, which creates a new payment attempt.
- If email queueing fails after a committed payment transition, the financial state remains authoritative. Repair/requeue the delivery from the private audit without replaying approval.
- Before any manual data repair, take a backup and record the reason, affected IDs, authorizer, and reconciliation outcome.

## Security

- Payment proof is private to its owner, assigned chapter reviewers, and organization admins.
- Do not copy proof images into public media, email bodies, chat, logs, or issue trackers.
- Never request bank credentials. The website records only the Zelle reference/proof and immutable audit snapshots.
- Reviewer accounts must remain individual; do not share credentials.
