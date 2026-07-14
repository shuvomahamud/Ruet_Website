# Phase 8 Announcements, Newsletters, And Footer Verification

Updated: 2026-07-14

## Result

Roadmap Phase 8 is complete. The application now provides audience-aware organization and chapter announcements, an audited newsletter authoring/scheduling/sending workflow, protected communication preferences, and a complete admin-driven institutional footer.

Completed tasks:

- `D-02` Footer system
- `J-03` Admin announcements
- `J-04` Scheduled newsletters

## Announcement Delivery

- Published public announcements are visible only while their optional `activeFrom`/`activeTo` window is active.
- Signed-in active users additionally see member-only organization notices and member-only notices for their primary chapter.
- Chapter admins can author and manage only records assigned to one of their managed chapters; they cannot create site-wide notices or move a notice to another chapter.
- Admins and super admins retain full management visibility.
- Active-window and audience restrictions are enforced in collection access, so direct REST, GraphQL, and Local API reads cannot bypass the public rules.
- CTA label/href pairs, safe link schemes, active-window ordering, and publish timestamps are validated server-side.
- The reusable announcement feed renders on the home page, chapter pages, and `/announcements`. Phase 9 task `K-01` owns assembly of the member dashboard and will consume the same authenticated query/component rather than duplicate announcement logic.

## Newsletter Operations

- Admins author drafts in Payload and use `/communications/newsletters` to preview the exact HTML/plain-text output, schedule or reschedule, cancel, send immediately, retry a failed dispatch, and inspect history.
- Campaign states are `draft`, `scheduled`, `sending`, `sent`, `cancelled`, and `failed`.
- Content is editable only while a campaign is a draft. Workflow fields are service-controlled and cannot be forged through normal collection access.
- Schedule, cancel, claim, send, and recovery actions use a PostgreSQL row lock and audit records. Repeated actions are idempotent.
- The one-minute `newsletterLifecycle` job claims due schedules. A campaign left in `sending` for 15 minutes after an interrupted worker is recoverable by the same lifecycle.
- `all` selects active, verified accounts. `members` selects users with an `active` or `grace_period` membership.
- Each selected user receives one stable key in the form `newsletter:<campaign>:user:<user>`. Repeated sends cannot create a duplicate delivery.
- `allowNewsletters=false` creates a private `suppressed` delivery audit with no job. Opted-in recipients receive a queued delivery associated with the campaign.
- Recipient, queued, suppressed, and initial-failure counts are stored on the campaign. Live sent/failed delivery counts remain visible from `emailDeliveries` on the operations page.
- Initial queue failures place the campaign in `failed` with a sanitized error and expose a retry action. Provider delivery retries use the existing three-attempt email job policy.

## Footer And Preferences

- The footer renders admin-managed navigation groups, organization contact data, newsletter copy/action, legal links, optional social links, and the institutional legal notice.
- Every configured href uses the shared safe-link validator. External web links open in a separate tab with an appropriate `rel` value.
- The default legal destinations are `/privacy`, `/terms-of-use`, and `/membership-terms`.
- The newsletter action leads to `/communications/preferences`. Signed-in users can immediately change newsletter, optional-announcement-email, and optional-system-email preferences. Anonymous visitors receive verified-account sign-in/signup actions rather than an unverified address collection.
- Required security, payment, registration, and account-state messages remain unaffected by optional preferences.
- Narrow-screen browser coverage verifies the footer does not overflow at 390px and that contact, legal, account, announcement, and preference links remain accessible.

## Security And Failure Review

- Announcement visibility is query-enforced and date-window enforced before records reach a rendering surface.
- Newsletter collection and workflow endpoints are admin-only; standard members are redirected or receive `403` from direct action requests.
- Workflow status, schedule, counts, actor fields, timestamps, and errors are server-only.
- Campaign sending never stores the newsletter body in a delivery audit and never logs provider credentials.
- Preference changes are authenticated and write only the caller's three allowed communication flags.
- Campaign claim/recovery, semantic delivery keys, job concurrency, and provider idempotency prevent double sends during repeats or worker restarts.

## Database Changes

- `20260714_065657_phase_8_communications_footer` adds campaign workflow/accounting fields, campaign-linked delivery audits, newsletter lifecycle job types, footer newsletter actions, legal/social link arrays, indexes, and foreign keys.
- `20260714_070100_phase_8_footer_content_backfill` updates only exact legacy placeholder copy and seeds default legal links only when a stored footer has no legal links. It does not overwrite stakeholder-authored content and is intentionally forward-only.
- Generated Payload types are current and all Phase 8 migrations are applied.

## Automated Verification

| Command | Result |
| --- | --- |
| `pnpm generate:types` | Passed; generated Payload types are current |
| `pnpm lint` | Passed with no errors or warnings |
| `pnpm typecheck` | Passed |
| `pnpm test:int` | Passed: 11 files, 54 tests |
| `pnpm build` | Passed: optimized Next.js production build |
| `pnpm test:e2e` | Passed: 32 Chromium tests |
| `pnpm jobs:run` | Passed; due schedules and queues drained without a final failed job |
| `pnpm payload migrate:status` | Passed; every migration through the Phase 8 content backfill shows `Ran: Yes` |
| `pnpm payload migrate:create phase_8_drift_check` | No schema changes detected; no blank migration created |

Phase 8-specific tests cover active/future/expired/draft visibility, public/member/chapter audiences, chapter-admin authoring isolation, CTA/window validation, service-owned campaign states, idempotent schedule/cancel/send behavior, partial queue-write recovery, due lifecycle dispatch, membership audience selection, opted-out suppression, exact subject rendering, delivery history, footer destinations, preference updates, preview, scheduling, cancellation, immediate dispatch, and responsive overflow.

## Operations And Remaining Launch Inputs

Day-to-day instructions are in [communications-operations.md](/Users/shuvomahamud/Projects/RUET_Website/docs/communications-operations.md), with transport/job details in [email-and-jobs-operations.md](/Users/shuvomahamud/Projects/RUET_Website/docs/email-and-jobs-operations.md).

Production launch still requires the verified email sender and provider credentials already assigned to the launch phase. Final stakeholder-approved legal text is also a launch input; the footer destinations and CMS legal templates are functional now.
