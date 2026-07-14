# Phase 9 Member Dashboard, History, And Reporting Verification

Updated: 2026-07-14

## Result

Roadmap Phase 9 is complete. Signed-in members now land on a private dashboard, can inspect filtered and paginated payment and event-registration histories, and authorized operators can reconcile membership, payment, event, waitlist, renewal/reactivation, and promotion activity without exposing member data in exports.

Completed tasks:

- `K-01` Member dashboard
- `K-02` Payment and registration history views
- `K-03` Admin reporting views

## Member Dashboard

- `/dashboard` is the default destination after password or Google sign-in when no safe explicit return destination was supplied.
- The dashboard shows the latest membership term and its status, term type and expiration, plus the correct join, renew, reactivate, resubmit, pending-status, or support action.
- Primary chapter name, summary, chapter destination, upcoming pending/confirmed registrations, active waitlist entries, recent Zelle attempts, and active authenticated announcements appear in one account view.
- Dashboard, membership, payments, registrations, communication preferences, and profile/security destinations share one reusable account navigation. Elevated users additionally receive reports and payment-review links.
- The footer and fallback membership navigation now expose the dashboard as the member home.

## Private Histories

- `/account/payments` provides purpose, Zelle status, and submitted-date filters with ten attempts per page.
- Each attempt shows its immutable amount, currency, purpose, submitted time, transaction-ID/image-proof state, approval time, pending-review state, or rejection reason.
- `/events/registrations` provides registration-status and upcoming/past filters with eight registrations per page.
- Registration cards retain event, chapter, attendee quantity, price/discount, payment state, and associated immutable Zelle attempt snapshots. Waitlist history remains visible with offer-expiration details.
- Empty states provide a clear reset or browse action, tables scroll within their own responsive shell, and account navigation remains horizontally available on narrow screens.
- Every personal membership, order, payment, registration, and waitlist query includes `user = authenticated user`. This is intentionally stricter than relying only on collection access because a chapter administrator's operational read scope must never broaden their personal-history view.

## Operational Reports

- `/reports` is available only to active chapter administrators, administrators, and super administrators.
- Administrators and super administrators can report organization-wide or select one chapter. Chapter administrators can select only a managed chapter or aggregate all of their managed chapters.
- `/api/reports` returns the same private summary contract. `/api/reports/export` produces a summary-only CSV with no names, email addresses, transaction IDs, proof links, or other member-level data.
- A requested unmanaged chapter receives `403` even when supplied directly to either report endpoint. A standard member receives `403` for reports.
- CSV cells are quoted and values beginning with spreadsheet formula markers are prefixed defensively.

The report includes:

- membership counts for every workflow status
- join, renewal, and reactivation totals with pending, active/grace, failed, and expired outcomes
- pending, approved, and failed manual-payment outcomes
- approved Zelle revenue split between membership and events and grouped by immutable chapter attribution
- event capacity, pending/confirmed attendee quantities, active waitlist quantity, and remaining capacity
- aggregate registration and waitlist outcomes
- promotion code uses, paid/pending/failed outcomes, discounts, and paid revenue

Revenue is recognized only from approved payment attempts. Date filters apply to membership creation, payment submission, order creation, event start, and the corresponding event-start registration scope. Reports traverse all result pages rather than truncating to a UI-sized record limit.

## Reconciliation And Security Evidence

- Integration fixtures create two chapters and prove that one selected chapter reconciles to exactly `$58` approved revenue (`$40` membership plus `$18` event), one failed renewal/payment, two registered attendees, one waitlist attendee, three remaining event seats, and one paid promotion use.
- The same fixture proves a chapter administrator receives only managed-chapter totals, cannot request the other chapter, and a member cannot call the reporting service.
- Dashboard fixtures prove the returned payments and registrations belong only to the authenticated member and another member cannot retrieve a payment by a direct Local API query.
- Browser coverage proves the member sees only their own transaction and registration, a member receives `403` from the direct report endpoint, the chapter administrator sees only the managed event/totals, and an unmanaged chapter parameter receives `403`.

## Database Changes

Phase 9 requires no schema change. It reports from the immutable membership, order, payment, event-registration, waitlist, event, promotion, and chapter fields delivered in earlier phases. Generated Payload types remain current, all existing migrations remain applied, and the schema drift check produces no new migration.

## Automated Verification

| Command | Result |
| --- | --- |
| `pnpm generate:types` | Passed; generated Payload types are current |
| `pnpm lint` | Passed with no errors or warnings |
| `pnpm typecheck` | Passed |
| `pnpm test:int` | Passed: 12 files, 57 tests |
| `pnpm build` | Passed: optimized Next.js production build includes dashboard, histories, reports, JSON, and CSV routes |
| `pnpm test:e2e` | Passed: 34 Chromium tests |
| `pnpm jobs:run` | Passed; scheduled work drained without a final failed job |
| `pnpm payload migrate:status` | Passed; every migration shows `Ran: Yes` |
| `pnpm payload migrate:create phase_9_drift_check` | No schema changes detected; no blank migration created |

Phase 9-specific coverage is in `tests/int/member-reporting.int.spec.ts` and `tests/e2e/dashboard-reporting.e2e.spec.ts`. Existing authentication, membership, event, communications, governance, public-experience, and admin tests run in the same gates.
