# Phase 1 Security And Workflow Verification

Date: 2026-07-13

Status: `Completed`

## Scope Result

Phase 1 of the remaining implementation roadmap is complete. The Payload schema is now safe for the public authentication and transaction features that follow.

The implementation provides:

- server-owned user relationships for registrations, waitlists, chapter requests, and payment proofs
- chapter-scoped draft, media, registration, waitlist, membership, order, payment, and proof visibility
- service-only transaction record creation and mutation
- legal state machines for orders, payments, memberships, registrations, and waitlists
- transaction-scoped PostgreSQL row locks for workflow transitions
- idempotent Zelle approval and rejection
- immutable pricing, promotion, chapter, proof, and reviewer snapshots
- private payment-proof storage separate from public editorial media
- super-admin-only audit records plus secret-free structured workflow logs
- relationship, quantity, date, capacity, currency, and monetary validation
- forward-only Zelle schema migrations and current generated Payload types

## Access Audit

The following matrix records the effective collection rules. `Admin` means `admin` or `superAdmin` unless the row explicitly says otherwise.

| Collection            | Public / member                                                              | Chapter admin                                    | Admin / super admin                                              | Mutation safeguards                                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`               | Public signup; members read/update/delete only themselves                    | Self plus users whose primary chapter is managed | Admins manage non-super-admin users; super admin has full access | Public signup is always `member`; first super admin is limited to Payload's first-register route; role hierarchy and active published primary chapter are validated |
| `media`               | Public records only                                                          | Public records plus assigned-chapter records     | Full access                                                      | Owner is server-stamped; chapter admins can mutate only assigned-chapter records                                                                                    |
| `paymentProofs`       | Authenticated owner only                                                     | Owner or assigned-chapter proof                  | Full read                                                        | Owner/chapter are server-derived; update and delete are denied; files are not public editorial media                                                                |
| `categories`          | Read                                                                         | Read                                             | Manage                                                           | No sensitive fields                                                                                                                                                 |
| `pages`               | Published only                                                               | Published only                                   | Draft and published; manage                                      | Drafts no longer leak to chapter admins                                                                                                                             |
| `posts`               | Published only                                                               | Published only                                   | Draft and published; manage                                      | Drafts no longer leak to chapter admins                                                                                                                             |
| `announcements`       | Public sees published public audience; members see published member audience | Published audience plus assigned-chapter drafts  | Full access                                                      | Chapter hook prevents creating or moving records outside assigned chapters                                                                                          |
| `chapters`            | Published only                                                               | Published plus assigned chapters                 | Admin reads/updates; super admin creates/deletes                 | Chapter admins cannot change name, status, or admin assignments                                                                                                     |
| `chapterRequests`     | Authenticated requester sees own requests                                    | Own requests                                     | Admin reads; super admin reviews/deletes                         | Requester is server-stamped; public status/reviewer input is reset to pending/empty                                                                                 |
| `membershipPlans`     | Active plans only                                                            | Active plans only                                | Admin reads all; super admin manages                             | Price, currency, reminders, grace period, and sort order are validated                                                                                              |
| `memberships`         | Owner only                                                                   | Owner or attributed assigned chapter             | Full read                                                        | Direct create/update/delete denied; state and immutable snapshot hooks apply to privileged services                                                                 |
| `events`              | Published only                                                               | Published plus assigned-chapter drafts           | Full access                                                      | Chapter scope, date order, price, currency, capacity, and quantity limits are validated                                                                             |
| `eventRegistrations`  | Authenticated owner creates/reads own                                        | Owner plus assigned-event chapter reads          | Full read                                                        | Owner/status/price are server-derived; duplicates rejected; direct update/delete denied                                                                             |
| `waitlistEntries`     | Authenticated owner creates/reads own                                        | Owner plus assigned-event chapter reads          | Full read                                                        | Owner/status/join time are server-derived; duplicates rejected; direct update/delete denied                                                                         |
| `orders`              | Owner reads                                                                  | Owner or attributed assigned chapter reads       | Full read                                                        | Service-only create/update/delete; totals, target ownership, Zelle method, promotion and chapter snapshots validated                                                |
| `payments`            | Owner reads                                                                  | Owner or first-review assigned chapter reads     | Full read                                                        | Service-only create/update/delete; private proof ownership, order ownership, amount/currency/type snapshots, and reviewer snapshots validated                       |
| `auditLogs`           | No access                                                                    | No access                                        | Super admin reads only                                           | Application services create append-only audit rows; direct create/update/delete denied                                                                              |
| `promotions`          | No enumeration                                                               | No enumeration                                   | Manage                                                           | Unique codes; positive discount; percentage cap; date and usage-limit validation                                                                                    |
| `committeeTerms`      | Published only                                                               | Published plus assigned-chapter drafts           | Full access                                                      | Assigned-chapter mutation hook                                                                                                                                      |
| `historyEntries`      | Published only                                                               | Published only                                   | Manage                                                           | Drafts are admin-only                                                                                                                                               |
| `newsletterCampaigns` | No access                                                                    | No access                                        | Manage                                                           | Admin-only operational data                                                                                                                                         |

All five globals (`siteSettings`, `header`, `footer`, `home`, and `seoDefaults`) remain publicly readable and admin-only mutable.

## Workflow Rules

| Workflow           | Legal forward paths                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Order              | `pending -> paid / failed / cancelled`; terminal records cannot be reopened                                                                 |
| Payment attempt    | `pending -> approved / failed`; approved and failed attempts are immutable terminal evidence                                                |
| Membership         | Pending payment and manual-review paths lead to active, failed, cancelled, grace, expired, or suspended states through explicit transitions |
| Event registration | `pending -> confirmed / waitlisted / cancelled`; confirmed and waitlisted records can only take their defined forward actions               |
| Waitlist           | `waiting -> promoted / expired`; promoted entries can expire                                                                                |

Every workflow transition:

- checks the expected current state
- rejects stale or illegal requests with a conflict error
- runs inside the caller's Payload request transaction
- obtains a PostgreSQL row lock before mutation
- passes the same `req` to nested Payload operations

Zelle payment review additionally locks the payment attempt before authorization and decision processing. Approval updates the payment, order, and membership/registration atomically. Rejection preserves the failed attempt and leaves the order available for a later, new proof attempt. A repeated identical decision records a no-change audit outcome and cannot activate the target twice.

## Zelle-Only Migrations

Two new forward migrations were created without modifying either previously applied migration:

- `20260714_032237_phase1_security_zelle`
  - adds private payment proofs, audit logs, media scope fields, order/payment snapshots, and active Zelle-only enums
  - removes obsolete active Stripe and automatic-debit fields
  - refuses to run if transactional records exist, preventing silent historical-provider data loss
- `20260714_033351_phase1_required_snapshots`
  - makes required audit snapshots non-null
  - backfills a missing zero discount safely
  - refuses to guess any missing historical price or plan snapshot

The local preflight found `0` orders, `0` payments, `0` memberships, and `0` Stripe-valued transaction rows before migration. Payload migration status confirms all four repository migrations have run.

## Automated Evidence

The Phase 1 gate passed on Node `22.22.0` and pnpm `10.29.2`:

| Command                       | Result                             |
| ----------------------------- | ---------------------------------- |
| `pnpm lint`                   | Passed                             |
| `pnpm typecheck`              | Passed                             |
| `pnpm test:int`               | Passed: `4` files, `15` tests      |
| `pnpm build`                  | Passed                             |
| `pnpm test:e2e`               | Passed: `6` tests                  |
| `pnpm payload migrate:status` | Passed: all `4` migrations applied |
| `git diff --check`            | Passed                             |

Regression coverage proves:

- public role escalation input is ignored
- submitted registration, waitlist, and chapter-request owners are replaced with the authenticated user
- submitted registration status and price snapshots are replaced with server values
- members cannot mutate another profile or read another transaction
- public users and unrelated chapter admins cannot read private or draft data
- chapter admins cannot mutate another chapter's event
- direct commerce creation/update is denied
- payment/order/membership reads are owner or assigned-chapter scoped
- unauthorized reviewers cannot change payment state
- approval and rejection are idempotent
- simultaneous duplicate approvals produce one change and one no-op
- an invalid downstream membership state rolls back payment and order changes
- illegal and stale transitions fail

## Later-Phase Ownership

This phase establishes safe primitives; it does not prematurely claim later user-facing work. The roadmap still owns:

- Phase 2: authentication pages, verification/reset, Google sign-in, profile UX, and account anonymization
- Phase 6: membership join/renew/reactivate UI and creation services
- Phase 7: capacity-safe event registration, paid-event flow, and earliest-fitting waitlist promotion
- Phase 9: manual-review queue and reviewer action UI
- Phase 11: final upload abuse testing, production operations, and full security verification
