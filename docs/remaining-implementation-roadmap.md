# RUETIAN USA Remaining Implementation Roadmap

Updated: 2026-07-13

## 1. Purpose

This is the execution plan for all work that remains after the completed `A-01` through `B-08` foundation block.

The roadmap is deliberately exhaustive. It covers:

- every task currently marked `Partial` or `Pending`
- the stakeholder decision to use `Zelle` as the only payment method
- engineering-readiness problems found during the current repository audit
- cross-cutting security, migration, testing, documentation, content, and launch work
- external decisions and credentials that must be supplied before production launch

The roadmap is complete only when every active task is `Completed`, every superseded task is explicitly recorded as `Superseded`, all phase gates pass, and no undocumented follow-up work remains.

## 2. Scope Baseline

### 2.1 Payment decision

The website will support `Zelle` only for paid memberships and paid event registrations.

This means:

- `F-03` Stripe membership checkout is `Superseded`
- `H-04` event Stripe checkout is `Superseded`
- no card checkout, Stripe customer, subscription, checkout-session, or webhook flow is required
- Zelle payment instructions must be editable by authorized admins
- users submit a transaction ID, screenshot, or both
- every paid record remains pending until an authorized reviewer approves the proof
- Zelle memberships renew manually each year; the system sends reminders but never claims that it will automatically debit the member
- chapter attribution remains stored for reporting and operational distribution
- rejection preserves the original attempt, and resubmission creates a new immutable payment attempt

Historical migration files must not be rewritten after they have been applied. Stripe-specific active schema, configuration, UI, and generated types will be removed through normal forward migrations and code changes. If production data exists before that cleanup, preservation rules must be confirmed before any field is dropped.

### 2.2 Active backlog

After completion of roadmap Phase 6, the tracked backlog contains:

- `33` completed tasks
- `6` partially implemented tasks
- `16` pending tasks
- `2` superseded Stripe tasks

There are `22` active remaining tasks. Each one has exactly one completion-owner phase in the traceability matrix below.

### 2.3 Work excluded from the approved launch scope

The following remain intentionally out of scope unless the stakeholder adds them later:

- Stripe or any other card-payment processor
- event check-in
- QR codes and barcodes
- automated refunds
- self-service membership cancellation
- payment-gateway chapter payout splitting
- chapter merging

## 3. Non-Negotiable Completion Contract

A phase may be marked complete only when all of the following are true for the work owned by that phase:

1. All listed functionality is implemented in the actual application, not only represented by schema fields or placeholder UI.
2. Required database changes use forward migrations and generated Payload types are current.
3. Loading, empty, validation, success, authorization, and failure states are implemented.
4. Direct API/server-action access is protected in addition to hiding controls in the UI.
5. Relevant unit, integration, and end-to-end tests exist and pass.
6. `pnpm lint`, `pnpm typecheck`, relevant tests, and `pnpm build` pass with the supported Node version.
7. Accessibility and responsive behavior are verified for changed user-facing screens.
8. Seed data or fixtures exist where the feature cannot otherwise be tested meaningfully.
9. Related requirements, UAT instructions, and task statuses are updated in the same phase.
10. Every defect found while verifying the phase is fixed or explicitly moved into a later named phase with a task owner and acceptance gate. Untracked follow-up work is not allowed.

The entire roadmap is complete only when:

- all `43` tasks that were active when this roadmap began are `Completed`
- `F-03` and `H-04` remain explicitly `Superseded`
- there are no tasks left in `Partial` or `Pending`
- all final UAT, security, performance, migration, backup, and deployment gates pass
- stakeholder-owned launch inputs are supplied and installed

## 4. Delivery Phases

## Phase 0: Scope Normalization And Engineering Recovery

Status: `Completed` on 2026-07-13. Evidence: [phase-0-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-0-verification.md).

Goal: establish a reliable implementation baseline before feature work expands.

Work:

- normalize all project documentation to the Zelle-only decision
- mark `F-03` and `H-04` as `Superseded`
- identify and remove active Stripe requirements, UI choices, environment requirements, and future-work statements
- select a supported project Node version and make it reproducible for developers and CI
- repair the dependency installation so lint can load all required parsers
- add/configure the environment-loading dependency required by Vitest and Playwright
- update stale automated assertions to match the actual site
- define one repeatable clean-install verification path
- ensure the project is under version control before feature implementation; connect the correct remote if one exists
- establish the phase quality-gate commands and baseline their results

Exit gate:

- clean dependency installation succeeds
- lint, typecheck, current tests, and production build all run successfully
- existing public and admin smoke tests pass
- documentation contains no active requirement to implement Stripe
- the repository has a recoverable version-control baseline

Tracked disposition:

- `F-03` -> `Superseded`
- `H-04` -> `Superseded`

## Phase 1: Data Integrity, Authorization, And Workflow Primitives

Status: `Completed` on 2026-07-13. Evidence: [phase-1-security-workflow-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-1-security-workflow-verification.md).

Goal: make the existing schema safe enough for public authentication and transactional workflows.

Work:

- re-audit every Payload collection and sensitive field against member, chapter-admin, admin, and super-admin permissions
- force user-owned records to the authenticated user on the server; never trust a submitted user ID
- close direct-API authorization gaps for registrations, waitlists, profiles, media, payments, orders, and memberships
- verify chapter admins can manage only assigned chapter records and cannot read or mutate another chapter's protected data
- define centralized state-transition services for orders, payments, memberships, registrations, and waitlists
- enforce legal state transitions and reject duplicate or stale actions
- make payment approval/rejection idempotent and transaction-safe
- preserve immutable pricing, chapter, promotion, proof, and reviewer snapshots
- add relationship, quantity, date, capacity, and monetary validation
- define audit metadata and structured logs without exposing secrets or payment proof publicly
- create forward migrations for the Zelle-only active model while preserving applied migration history
- add negative access tests and state-machine tests before public flows use these primitives

Exit gate:

- ownership and role-isolation tests pass through direct API calls
- duplicate approval cannot activate a membership or registration twice
- invalid state transitions fail without partial updates
- generated types and migrations are current
- the completed `B-08` access groundwork has regression coverage sufficient for later phases

## Phase 2: Authentication And Account Lifecycle

Status: `Completed` on 2026-07-13. Evidence: [phase-2-auth-account-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-2-auth-account-verification.md).

Goal: complete public account access and safe self-service account management.

Tasks completed in this phase:

- `C-01` Local auth flows
- `C-02` Google sign-in integration
- `C-03` Profile management
- `C-04` Self-service account deletion

Work:

- signup, sign-in, sign-out, session handling, and protected-route behavior
- email verification and resend-verification behavior
- forgot-password and reset-password flows
- Google OAuth, duplicate-email handling, and safe account linking
- all approved alumni/profile fields and communication consent
- primary-chapter change behavior
- logical deletion/anonymization that preserves financial and operational audit records
- account-status enforcement so suspended/deleted users cannot retain access
- auth abuse controls, validation, accessible forms, and complete error states

Exit gate:

- every local and Google auth path passes end-to-end tests
- members can edit only permitted profile fields
- deleted accounts lose access while required audit records remain intact
- unauthenticated users are redirected safely from all protected routes

Required external input before production verification:

- Google OAuth client credentials and approved callback URLs
- production email sender/domain configuration for verification and reset messages

## Phase 3: Shared Public Experience And Institutional Content

Status: `Completed` on 2026-07-13. Evidence: [phase-3-public-experience-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-3-public-experience-verification.md).

Goal: finish the reusable public UI and non-transactional institutional pages.

Tasks completed in this phase:

- `D-01` Header, navigation, and mega-menu system
- `D-03` Shared public components
- `E-02` About, mission, and contact pages
- `E-05` Learning and development pages
- `E-06` Legal page templates

Work:

- desktop mega-menus and a keyboard-accessible mobile navigation drawer
- active navigation states, focus handling, escape behavior, and visible membership CTA
- reusable filters, pagination, search, badges, cards, CTA bands, stats, rails, galleries, timelines, empty states, errors, and skeleton/loading states
- CMS-driven About, mission/overview, and Contact content
- learning listing/detail pages with category filters, search, metadata, media, and rich content
- reusable legal layout with placeholder labeling until approved copy is installed
- page-level metadata generation using CMS records and SEO defaults
- responsive and accessibility checks for the shared component system

Exit gate:

- desktop and mobile navigation cover the approved sitemap
- shared components replace page-specific duplicates
- learning search/filter and article detail flows pass end-to-end tests
- institutional and legal templates contain no route-level fallback copy

## Phase 4: Chapters, History, And Governance

Status: `Completed` on 2026-07-13. Evidence: [phase-4-chapters-governance-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-4-chapters-governance-verification.md).

Goal: complete public chapter/governance experiences and chapter-admin ownership.

Tasks completed in this phase:

- `E-03` History timeline page
- `E-04` Committee pages
- `G-01` Chapters directory page
- `G-02` Chapter detail pages
- `G-03` Chapter request workflow
- `G-04` Chapter-admin content workflow

Work:

- searchable/filterable chapter directory with inactive chapters excluded
- chapter detail pages with overview, leadership, contact, announcements, events, gallery, and local committee content
- authenticated request-a-chapter form and super-admin approve/reject workflow
- organizational history timeline with images, documents, external links, ordering, and archive behavior
- running/advisory/current/historical committee routes and filters
- committee members, roles, bios, event recaps, and the approved photo limit
- chapter-scoped admin management for chapters, events, announcements, galleries, media, and committee content
- direct-API isolation tests across two or more chapters

Exit gate:

- a chapter admin can complete every authorized task for an assigned chapter
- the same user cannot read or edit protected content belonging to another chapter
- chapter request, approval, deactivation, timeline, committee archive, and public visibility tests pass

## Phase 5: Email And Background-Job Foundation

Status: `Completed` on 2026-07-13. Evidence: [phase-5-email-jobs-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-5-email-jobs-verification.md).

Goal: provide the reliable communication infrastructure required by transactional phases.

Task completed in this phase:

- `J-01` Transactional email foundation

Work:

- production-capable Payload email adapter
- reusable responsive email layout and typed template helpers
- safe local/test transport and email capture for automated tests
- queued/scheduled job foundation for reminders, waitlist promotion, and newsletters
- retry, deduplication, failure logging, and delivery audit behavior
- preference rules that distinguish required system messages from optional announcements/newsletters

Exit gate:

- test and production-like email sends are verified
- retries cannot create duplicate business-state transitions
- templates render correctly and do not expose secrets
- background jobs have a documented execution and monitoring path

Required external input before production verification:

- email provider credentials
- verified sender domain/address

## Phase 6: Membership, Promotions, And Zelle Payments

Status: `Completed` on 2026-07-13. Evidence: [phase-6-membership-zelle-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-6-membership-zelle-verification.md).

Goal: deliver the complete annual membership lifecycle using Zelle only.

Tasks completed in this phase:

- `F-01` Membership overview page
- `F-02` Join membership flow
- `F-04` Zelle membership payment flow
- `F-05` Membership renewal and reactivation flows
- `F-06` Membership admin controls

Work:

- one active, annual, globally priced membership plan managed by super admin
- real membership overview content, benefits, FAQ, price, renewal policy, and CTA
- authenticated join flow with required profile completion
- one promotion code per order with server-authoritative eligibility and totals
- admin-managed Zelle recipient/instruction content
- transaction ID and/or screenshot proof submission
- immutable order and payment attempt records with price, discount, currency, and chapter snapshots
- pending manual-approval experience and status page
- annual renewal reminders, grace period, expiration, and pay-to-reactivate behavior
- no automatic debit or misleading auto-renew language
- membership activation dates based on approval time
- admin filters for plan, memberships, promotions, pending attempts, and failed attempts
- membership-specific approval/rejection integration and notifications

Exit gate:

- join, discount, proof-only, transaction-ID-only, combined-proof, approval, rejection, resubmission, renewal, grace, expiration, and reactivation tests pass
- duplicate approval and concurrent resubmission cannot corrupt the membership lifecycle
- a member never becomes active before payment approval
- plan price and grace period can be changed without code changes

Required external input before launch:

- final Zelle recipient details and payment instructions
- final membership/payment/no-refund wording
- approved manual-review SLA, or copy that intentionally makes no timing promise

## Phase 7: Events, Registration, Waitlists, And Shared Manual Review

Goal: complete free and paid event operations, then close the shared Zelle approval and notification tasks.

Tasks completed in this phase:

- `H-01` Events listing page
- `H-02` Event detail page
- `H-03` Event registration flow
- `H-05` Event Zelle payment flow
- `H-06` Waitlist logic
- `H-07` Post-event galleries and archive behavior
- `I-01` Manual payment review queue
- `I-02` Approve/reject manual payment actions
- `J-02` System-triggered emails

Work:

- event filters for date, chapter, mode, price, upcoming/archive state, and availability
- event details for time zone, venue/virtual access, price, capacity, remaining seats, and registration state
- free registration and confirmation
- paid Zelle registration with immutable order/payment attempts
- transaction-safe capacity reservation so pending/approved registrations cannot overbook
- quantity-aware waitlisting and earliest-fitting promotion
- promotion offer expiry and reprocessing
- chapter-first payment queue with admin/super-admin oversight
- idempotent approve/reject actions that update the correct membership or event record
- payment pending/approved/rejected, registration, waitlist, auth, renewal, and reminder emails
- completed-event archive/recap pages and chapter-admin galleries
- correct protection of non-public virtual links

Exit gate:

- free, paid, full-capacity, concurrent registration, rejection, resubmission, cancellation/capacity release, waitlist skip, promotion expiry, and archive tests pass
- no approval path can overbook an event
- chapter reviewers see only permitted proofs; admins see the organization-wide queue
- every required system state sends exactly the intended notification

## Phase 8: Announcements, Newsletters, And Footer Completion

Goal: complete organization communications and the footer experience that depends on them.

Tasks completed in this phase:

- `D-02` Footer system
- `J-03` Admin announcements
- `J-04` Scheduled newsletters

Work:

- site-wide and chapter-scoped announcements with active date windows and audience rules
- correct rendering on home, chapter, dashboard, and relevant public surfaces
- newsletter authoring, preview, scheduling, cancellation, sending, and send history
- recipient selection based on audience and communication preferences
- deduplication, retry, delivery logging, and failure visibility
- working newsletter subscription/preference destination in the institutional footer
- admin-driven footer navigation, contact, social/legal links, and final legal destinations

Exit gate:

- announcement targeting and date-window tests pass
- newsletters send once to the correct opted-in audience and record results
- footer links, preferences, contact data, and legal destinations are fully functional on mobile and desktop

## Phase 9: Member Dashboard, History, And Admin Reporting

Goal: expose complete self-service history and operational reporting.

Tasks completed in this phase:

- `K-01` Member dashboard
- `K-02` Payment and registration history views
- `K-03` Admin reporting views

Work:

- dashboard membership state, renewal/reactivation CTA, chapter information, announcements, events, and recent payments
- member payment-attempt and event-registration history with clear Zelle statuses
- filters, pagination, accessible empty states, and direct ownership enforcement
- membership counts by status
- chapter-attributed membership and event revenue
- registrations, capacity, waitlist, failed payment, approval outcome, promotion usage, renewal, and reactivation reports
- export behavior only where authorized and required for operations

Exit gate:

- member history cannot be accessed by another member through UI or direct requests
- report totals reconcile with source records in automated fixtures
- admins and chapter admins see only the reporting scope allowed by their roles

## Phase 10: Homepage, Publishing Workflow, Seed Content, And Content Readiness

Goal: close the remaining public/CMS tasks using realistic data and eliminate foundation-stage content.

Tasks completed in this phase:

- `E-01` Home page implementation
- `L-01` Draft, review, and publish workflow
- `L-02` Seed content and admin usability pass

Work:

- complete homepage hero, credibility stats, featured events, chapter spotlight, history, committees, learning, announcements, and membership modules
- validate draft/version/review/publish behavior for every public content type
- add preview behavior and cache invalidation/revalidation where needed
- organize Payload admin navigation, field groups, help text, validation, filters, and default columns
- replace development/foundation language with approved production-oriented copy
- create realistic seed fixtures for plans, chapters, committees, history, events, posts, announcements, promotions, and test users
- wire page-level SEO titles, descriptions, canonical URLs, social metadata, sitemap, and robots behavior
- install final legal text when supplied

Exit gate:

- no public route displays developer-handoff or foundation-stage wording
- draft records never leak publicly and published changes appear correctly
- an editor can perform routine content operations using the UAT guide without developer assistance
- seeded fresh-database UAT covers every public page and dashboard module

Required external input before phase completion for launch content:

- final privacy policy
- final terms of use
- final membership terms and payment/no-refund language
- approved organization, chapter, committee, and launch content/assets

## Phase 11: Full QA, Security, Performance, And Launch

Goal: validate the complete product and produce a deployable, supportable release.

Tasks completed in this phase:

- `M-01` End-to-end flow validation
- `M-02` Access-control and security validation
- `M-03` Performance and responsive QA
- `M-04` Launch configuration and operational checklist

Work:

- full desktop/mobile/tablet UAT across public, member, chapter-admin, admin, and super-admin roles
- accessibility checks for keyboard use, focus, semantics, contrast, validation, and screen-reader-critical flows
- security tests for authorization bypass, IDOR, upload validation, session handling, CSRF, rate limiting, sensitive-field exposure, and secret leakage
- performance checks for public routes, images, fonts, database queries, caching, and layout shift
- clean-database and existing-database migration rehearsals with backup/restore tests
- production storage adapter, retention, size/type limits, and cleanup policy
- production email, jobs, domain, DNS, TLS, environment, logging, monitoring, alerting, and error-reporting configuration
- administrator bootstrap, least-privilege roles, operational runbooks, incident handling, and rollback procedure
- final UAT defect closure and launch sign-off

Exit gate:

- all active tasks are `Completed`; no task remains `Partial` or `Pending`
- lint, typecheck, all automated tests, and production build pass from a clean checkout
- no launch-blocking accessibility, security, performance, data-integrity, or responsive defects remain
- backup/restore, deployment, rollback, monitoring, and scheduled-job procedures are proven and documented
- the final UAT guide is executed and signed off

Required external inputs:

- production hosting and database targets
- domain/DNS access
- final media storage and retention policy
- production email credentials
- final manual-payment SLA decision
- named launch administrators and operational owners

## 5. Remaining Task Traceability Matrix

Every task that was `Partial` or `Pending` at the start of this roadmap appears below exactly once as an active completion assignment or an explicit superseded disposition.

| Task   | Starting status | Completion-owner phase | Required completion outcome                                               |
| ------ | --------------- | ---------------------- | ------------------------------------------------------------------------- |
| `C-01` | Pending         | Phase 2                | Local signup, login, verification, reset, and errors work end to end      |
| `C-02` | Pending         | Phase 2                | Google login and safe account linking work end to end                     |
| `C-03` | Pending         | Phase 2                | Members can safely manage allowed profile and preference fields           |
| `C-04` | Pending         | Phase 2                | Account anonymization/deletion preserves required audit records           |
| `D-01` | Partial         | Phase 3                | Desktop mega-menu and accessible mobile navigation are complete           |
| `D-02` | Partial         | Phase 8                | Full admin-driven footer and newsletter/preference destination work       |
| `D-03` | Partial         | Phase 3                | Reusable responsive component system covers all page patterns             |
| `E-01` | Partial         | Phase 10               | All required dynamic homepage modules and production content work         |
| `E-02` | Partial         | Phase 3                | About, mission, and contact content are fully CMS-driven                  |
| `E-03` | Pending         | Phase 4                | Structured history timeline and linked media archive work                 |
| `E-04` | Pending         | Phase 4                | Current and historical committee pages and recaps work                    |
| `E-05` | Partial         | Phase 3                | Learning listing/detail, category filters, search, and metadata work      |
| `E-06` | Partial         | Phase 3                | Legal templates are reusable and CMS-driven                               |
| `F-01` | Partial         | Phase 6                | Membership page uses the active plan, benefits, FAQ, and policies         |
| `F-02` | Pending         | Phase 6                | Account-to-order membership join flow works with promotions               |
| `F-03` | Pending         | Phase 0                | Superseded by the Zelle-only payment decision                             |
| `F-04` | Pending         | Phase 6                | Membership Zelle proof and pending-state flow works                       |
| `F-05` | Pending         | Phase 6                | Renewal, grace, expiration, and reactivation work safely                  |
| `F-06` | Pending         | Phase 6                | Plan, promotion, membership, and payment admin controls work              |
| `G-01` | Partial         | Phase 4                | Chapter directory search/filter and visibility rules work                 |
| `G-02` | Partial         | Phase 4                | Complete localized chapter pages render all required modules              |
| `G-03` | Pending         | Phase 4                | Member request and super-admin review workflow works                      |
| `G-04` | Partial         | Phase 4                | Chapter admins safely manage only assigned chapter content                |
| `H-01` | Partial         | Phase 7                | Event listing filters and visual states work                              |
| `H-02` | Partial         | Phase 7                | Event details, capacity, timezone, price, and CTAs work                   |
| `H-03` | Pending         | Phase 7                | Free and paid registration states work without overbooking                |
| `H-04` | Pending         | Phase 0                | Superseded by the Zelle-only payment decision                             |
| `H-05` | Pending         | Phase 7                | Event Zelle proof and pending-registration flow works                     |
| `H-06` | Pending         | Phase 7                | Quantity-aware earliest-fitting waitlist promotion works                  |
| `H-07` | Pending         | Phase 7                | Event archives, recaps, and galleries work                                |
| `I-01` | Pending         | Phase 7                | Chapter-first, role-scoped manual-payment queue works                     |
| `I-02` | Pending         | Phase 7                | Idempotent approval/rejection updates related records and notifies users  |
| `J-01` | Pending         | Phase 5                | Email adapter, templates, testing, retry, and jobs foundation work        |
| `J-02` | Pending         | Phase 7                | Every required system event sends the correct notification once           |
| `J-03` | Partial         | Phase 8                | Site-wide and chapter announcements target and render correctly           |
| `J-04` | Pending         | Phase 8                | Newsletter scheduling, sending, preferences, and history work             |
| `K-01` | Pending         | Phase 9                | Member dashboard presents complete actionable account state               |
| `K-02` | Pending         | Phase 9                | Members can view only their payment and registration history              |
| `K-03` | Pending         | Phase 9                | Required operational reports reconcile with source data                   |
| `L-01` | Partial         | Phase 10               | Draft, preview, review, publish, and public visibility work consistently  |
| `L-02` | Pending         | Phase 10               | Realistic seeds and editor-friendly admin configuration are complete      |
| `M-01` | Pending         | Phase 11               | Complete end-to-end product validation passes                             |
| `M-02` | Pending         | Phase 11               | Role, ownership, upload, session, and sensitive-operation security passes |
| `M-03` | Pending         | Phase 11               | Responsive, accessibility, and performance QA passes                      |
| `M-04` | Pending         | Phase 11               | Deployment, backup, monitoring, rollback, and operations are proven       |

## 6. Cross-Cutting Requirements Coverage

The task matrix is supplemented by these cross-cutting gates so requirements that span several tasks cannot be lost between phases.

| Requirement area                                   | Primary phases       | Final proof                                           |
| -------------------------------------------------- | -------------------- | ----------------------------------------------------- |
| Zelle-only scope and removal of Stripe obligations | 0, 1, 6, 7, 11       | No active Stripe UI/config/workflow; Zelle UAT passes |
| Member data ownership and chapter isolation        | 1, 2, 4, 6, 7, 9, 11 | Negative direct-API and role-based E2E tests          |
| Immutable financial history and audit snapshots    | 1, 6, 7, 9, 11       | Migration/state tests and reconciled reports          |
| Manual approval and resubmission                   | 1, 6, 7, 11          | Idempotency, rejection, and new-attempt tests         |
| Annual manual renewal, grace, and reactivation     | 6, 7, 9, 11          | Time-controlled lifecycle tests                       |
| Event capacity and quantity-aware waitlist         | 1, 7, 11             | Concurrent registration and earliest-fitting tests    |
| Content governance and public visibility           | 3, 4, 8, 10, 11      | Draft/public leakage tests and editor UAT             |
| Email, preferences, scheduling, and retries        | 5, 6, 7, 8, 11       | Captured-email and job-deduplication tests            |
| Accessibility and responsive behavior              | 3 through 11         | Automated checks plus final device/keyboard UAT       |
| SEO, production content, and legal copy            | 3, 10, 11            | Metadata validation and final content sign-off        |
| Storage, uploads, retention, and proof privacy     | 1, 4, 6, 7, 11       | File validation, access, retention, and cleanup tests |
| Deployment, backup, monitoring, and rollback       | 0, 5, 11             | Rehearsed operational checklist                       |

## 7. Phase Handoff Record

At the end of every phase, record the following in the repository:

- tasks closed and their acceptance evidence
- migrations added and migration rehearsal result
- commands run and their outcomes
- automated tests added
- UAT scenarios executed
- security/access cases verified
- documentation updated
- defects fixed
- any named dependency carried to a later phase

If a dependency is carried forward, it must already appear in this roadmap or be added with an owner phase and exit gate before the current phase can be closed.
