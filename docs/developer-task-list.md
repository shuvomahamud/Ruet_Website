# RUETIAN USA Website Developer Task List

Updated: 2026-07-14

## 1. Purpose

This document breaks the approved RUETIAN USA website scope into developer-facing implementation tasks.

It is intended to be used as:

- the initial engineering backlog
- the implementation sequencing guide
- the handoff document for frontend, backend, CMS, and integration work

This task list is based on:

- [master-requirements-and-assumptions.md](/Users/shuvomahamud/Projects/RUET_Website/docs/master-requirements-and-assumptions.md)
- [technical-architecture-payload.md](/Users/shuvomahamud/Projects/RUET_Website/docs/technical-architecture-payload.md)
- [asme-inspired-design-system.md](/Users/shuvomahamud/Projects/RUET_Website/docs/asme-inspired-design-system.md)
- [asme-inspired-page-blueprints.md](/Users/shuvomahamud/Projects/RUET_Website/docs/asme-inspired-page-blueprints.md)

## 2. How To Use This Document

Each task contains:

- `Task ID`
- objective
- detailed scope
- concrete deliverables
- dependencies
- acceptance criteria

Suggested execution model:

1. finish the foundation and schema tasks first
2. repair the development/test baseline before expanding transactional work
3. implement the remaining tasks in the gated phases defined in [remaining-implementation-roadmap.md](/Users/shuvomahamud/Projects/RUET_Website/docs/remaining-implementation-roadmap.md)
4. preserve the approved `2026-07-14` legal-policy version and use a new dated version for future revisions
5. use `Zelle` as the only payment method for memberships and paid events

## 3. Delivery Principles

The developer should preserve these project rules during implementation:

- use `Next.js` for the site frontend
- use `Payload CMS` as the main content, auth, workflow, and admin layer
- use local `PostgreSQL` as the primary database
- keep business rules configurable where required
- prefer structured data models over hard-coded content
- keep the public site visually closer to the information density and hierarchy of `asme.org`

## 4. Definition Of Done

A task should be considered done only when:

- code is implemented
- schema or UI changes are wired into the actual app
- basic validation and error states are handled
- access rules are enforced where relevant
- admin editability is preserved where required
- the feature has at least the necessary local verification or test coverage
- documentation or seed data is added if the feature needs it

## 5. Recommended Workstreams

This project breaks naturally into these workstreams:

- `A. Foundation and platform setup`
- `B. Payload schema and access control`
- `C. Public site shell and design system`
- `D. Membership and payments`
- `E. Chapters and governance`
- `F. Events and registrations`
- `G. Communications and newsletters`
- `H. Member dashboard and account management`
- `I. Content and publishing`
- `J. QA, launch prep, and deployment`

The workstreams can overlap, but tasks inside each stream should still follow dependency order.

## 6. Phase Overview

The authoritative gated sequence is maintained in [remaining-implementation-roadmap.md](/Users/shuvomahamud/Projects/RUET_Website/docs/remaining-implementation-roadmap.md):

- Phase 0: scope normalization and engineering recovery — completed
- Phase 1: data integrity, authorization, and workflow primitives — completed
- Phase 2: authentication and account lifecycle — completed
- Phase 3: shared public experience and institutional content — completed
- Phase 4: chapters, history, and governance — completed
- Phase 5: email and background-job foundation — completed
- Phase 6: membership, promotions, and Zelle payments — completed
- Phase 7: events, registration, waitlists, and shared manual review — completed
- Phase 8: announcements, newsletters, footer completion, and preferences — completed
- Phase 9: member dashboard, history, and reporting — completed
- Phase 10: homepage, publishing workflow, seeds, and admin usability — technical implementation and comprehensive editable sample content complete; final approved content remains required
- Phase 11: full validation, launch hardening, and deployment readiness

## 6.1 Sequencing decision

The current implementation plan is:

- use `Zelle` as the only payment method
- support transaction ID, screenshot, or both as proof
- keep paid memberships and registrations pending until authorized approval
- treat each resubmission as a new immutable payment attempt
- require manual annual renewal; the system may remind users but must not imply automatic debit

`F-03` and `H-04` are superseded by this decision. Stripe is not part of the remaining implementation scope.

## 6.2 Current Implementation Status Snapshot

Status baseline for this document:

- `Completed` means the task deliverables are implemented strongly enough to count as done against the current codebase.
- `Partial` means there is meaningful implementation in code, but the task is not complete against its own scope or acceptance criteria.
- `Pending` means the task should still be treated as not done.
- `Superseded` means a later stakeholder decision removed the task from active scope while preserving its history in this backlog.

Strict status answer:

- the continuous fully completed block remains `A-01` through `C-04`
- roadmap Phase 3 additionally completes `D-01`, `D-03`, `E-02`, `E-05`, and `E-06`
- roadmap Phase 4 additionally completes `E-03`, `E-04`, and `G-01` through `G-04`
- roadmap Phase 5 additionally completes `J-01`
- roadmap Phase 6 additionally completes `F-01`, `F-02`, and `F-04` through `F-06`
- roadmap Phase 7 additionally completes `H-01` through `H-03`, `H-05` through `H-07`, `I-01`, `I-02`, and `J-02`
- roadmap Phase 8 additionally completes `D-02`, `J-03`, and `J-04`
- roadmap Phase 9 additionally completes `K-01`, `K-02`, and `K-03`
- roadmap Phase 10 technically completes `L-01` and `L-02`; the legal policies and comprehensive content-only sample dataset are installed, and `E-01` remains partial until final approved organization, chapter, committee, and launch content/assets replace the samples

Fully completed tasks:

- `A-01`
- `A-02`
- `A-03`
- `A-04`
- `B-01`
- `B-02`
- `B-03`
- `B-04`
- `B-05`
- `B-06`
- `B-07`
- `B-08`
- `C-01`
- `C-02`
- `C-03`
- `C-04`
- `D-01`
- `D-02`
- `D-03`
- `E-02`
- `E-03`
- `E-04`
- `E-05`
- `E-06`
- `F-01`
- `F-02`
- `F-04`
- `F-05`
- `F-06`
- `G-01`
- `G-02`
- `G-03`
- `G-04`
- `H-01`
- `H-02`
- `H-03`
- `H-05`
- `H-06`
- `H-07`
- `I-01`
- `I-02`
- `J-01`
- `J-02`
- `J-03`
- `J-04`
- `K-01`
- `K-02`
- `K-03`
- `L-01`
- `L-02`

Partially implemented tasks already started in code:

- `E-01`
- `M-01`
- `M-02`
- `M-03`
- `M-04`

Pending tasks:

- none

Superseded tasks:

- `F-03`
- `H-04`

## 6.3 Remaining Implementation Roadmap

The complete phase plan for all partial and pending work is maintained in:

- [remaining-implementation-roadmap.md](/Users/shuvomahamud/Projects/RUET_Website/docs/remaining-implementation-roadmap.md)

That roadmap assigns every remaining task to one completion-owner phase and adds mandatory gates for runtime repair, dependency/test recovery, access-control regression, migrations, content, UAT, security, performance, and launch operations. A phase cannot be closed with undocumented follow-up work.

## 7. Detailed Task List

## 7.1 Foundation And Platform Setup

### Task A-01: Repository and application bootstrap

Objective:

Set up the project baseline for a `Next.js + Payload + PostgreSQL` application.

Detailed scope:

- initialize or normalize the project structure
- configure `Next.js` App Router
- integrate `Payload`
- define environment variable strategy
- set up local development configuration for `PostgreSQL`
- add linting, formatting, and basic type-checking setup

Deliverables:

- working local application scaffold
- environment variable template
- development startup instructions
- base directory structure for app, payload config, components, styles, and utilities

Dependencies:

- none

Acceptance criteria:

- the app starts locally
- Payload admin is reachable
- the app connects successfully to local `PostgreSQL`
- the codebase has a consistent project layout

### Task A-02: Environment and secret management

Objective:

Define all required environment variables and secret boundaries before feature work starts.

Detailed scope:

- identify required vars for database, auth, Zelle instructions, Google auth, email provider, and storage
- create `.env.example`
- define required local vs production variables
- ensure no secrets are hard-coded in the repo

Deliverables:

- environment variable inventory
- `.env.example`
- startup validation for missing critical variables

Dependencies:

- `A-01`

Acceptance criteria:

- missing required env vars fail clearly
- secrets are not committed
- developer onboarding can be performed from the example env file

### Task A-03: Core project architecture and utility layer

Objective:

Create the shared technical foundation needed by both frontend and backend work.

Detailed scope:

- define shared types for roles, statuses, and common enums
- create helper modules for auth guards, server queries, formatting, and date/time handling
- establish file conventions for Payload collections and Next.js routes
- set up logging and error utility patterns

Deliverables:

- shared constants and enum layer
- utility modules
- server-side data access conventions

Dependencies:

- `A-01`

Acceptance criteria:

- repeated business enums are not scattered throughout the codebase
- developers can add new collections and pages using consistent patterns

### Task A-04: Base styling and design token setup

Objective:

Implement the design-system foundation so all public pages can reuse one visual language.

Detailed scope:

- add CSS variables for color, spacing, radius, shadows, and typography
- load the selected fonts
- define base layout containers
- create typography styles for headings, body text, labels, and section titles
- establish button, link, and card primitives

Deliverables:

- theme token file
- global CSS or design-system foundation
- reusable base primitives

Dependencies:

- `A-01`
- design guidance in [asme-inspired-design-system.md](/Users/shuvomahamud/Projects/RUET_Website/docs/asme-inspired-design-system.md)

Acceptance criteria:

- the site uses the RUETIAN-USA-specific token system
- the base UI already reflects the intended ASME-inspired hierarchy

## 7.2 Payload Schema And Access Control

### Task B-01: Define Payload globals

Objective:

Create singleton-managed site settings and shared public content controls.

Detailed scope:

- create globals for site settings, navigation, footer, homepage settings, SEO defaults, and legal publishing controls
- define admin fields for repeated CTA labels and contact data

Deliverables:

- Payload globals
- validation and default values

Dependencies:

- `A-01`
- `A-03`

Acceptance criteria:

- header and footer can be driven from admin data
- site-wide metadata is manageable without code changes

### Task B-02: Implement the `users` collection

Objective:

Create the auth-backed user model for public users, members, and admins.

Detailed scope:

- implement the `users` collection with Payload auth
- add role, profile, RUET, chapter, and communication-preference fields
- support soft-delete or anonymization-ready fields
- define default signup role behavior

Deliverables:

- `users` collection
- user field validation
- role defaults and account-status handling

Dependencies:

- `A-01`
- `A-03`

Acceptance criteria:

- new public signups create valid user records
- admin roles are not publicly assignable
- user records include the agreed profile fields

### Task B-03: Implement the `chapters` and `chapterRequests` collections

Objective:

Model chapters and the chapter-request workflow.

Detailed scope:

- create `chapters`
- create `chapterRequests`
- add fields for chapter summary, status, admins, galleries, and local content
- add review fields for requested chapters

Deliverables:

- collections for chapters and chapter requests
- admin forms for chapter approval and deactivation

Dependencies:

- `B-02`

Acceptance criteria:

- a chapter can be created with the minimum required information
- a chapter can be deactivated
- request-to-create-chapter records can be reviewed and approved by super admin

### Task B-04: Implement membership collections

Objective:

Model the global launch membership plan and member lifecycle records.

Detailed scope:

- create `membershipPlans`
- create `memberships`
- include pricing snapshots, renewal dates, grace-period fields, and status fields
- enforce one public annual plan at launch while keeping the schema configurable

Deliverables:

- membership collections
- status definitions
- admin-editable plan fields

Dependencies:

- `B-02`

Acceptance criteria:

- the membership plan price can be edited from admin
- membership records store snapshot values
- grace-period and renewal fields are present

### Task B-05: Implement event and registration collections

Objective:

Create the structured event model, registration model, and waitlist support.

Detailed scope:

- create `events`
- create `eventRegistrations`
- create `waitlistEntries`
- add fields for mode, timezone, capacity, waitlist, pricing, and archived media
- include group quantity on registrations and waitlist entries

Deliverables:

- event-related collections
- validation rules
- event-mode and capacity configuration fields

Dependencies:

- `B-02`
- `B-03`

Acceptance criteria:

- an event can be created as in-person, virtual, or hybrid
- capacity and timezone are configurable
- waitlist entries can store requested quantity

### Task B-06: Implement commerce collections

Objective:

Model orders, payments, and promotions for both membership and events.

Detailed scope:

- create `orders`
- create `payments`
- create `promotions`
- add fields for manual proof, immutable payment attempts, discount snapshots, chapter attribution, reviewer metadata, and payment statuses

Deliverables:

- commerce collections
- consistent status enums

Dependencies:

- `B-04`
- `B-05`

Acceptance criteria:

- both membership and event purchases can be represented in the model
- manual payment proof data is stored cleanly
- promotion records can target membership, events, or both

### Task B-07: Implement content collections

Objective:

Create the structured content system for public publishing.

Detailed scope:

- create `posts`
- create `historyEntries`
- create `committeeTerms`
- create `announcements`
- create `newsletterCampaigns`
- create `media`

Deliverables:

- content collections
- draft/version support where needed

Dependencies:

- `A-01`

Acceptance criteria:

- history, committee, and learning content can be managed from Payload
- announcements and newsletters have structured records

### Task B-08: Role-based access control

Objective:

Apply access rules across collections and fields.

Detailed scope:

- define permissions for public, member, chapter admin, admin, and super admin
- restrict chapter-admin access to assigned chapter data
- limit self-edit permissions on users and account records
- guard admin-only approval and configuration actions

Deliverables:

- Payload access control logic
- field-level and collection-level restrictions

Dependencies:

- `B-02`
- `B-03`
- `B-04`
- `B-05`
- `B-06`
- `B-07`

Acceptance criteria:

- a chapter admin cannot edit another chapter's data
- members can only view or edit their own allowed records
- super admin retains full system control

Verification update (2026-07-13): the remaining-roadmap Phase 1 security gate re-audited every collection, added direct-API role/ownership regression coverage, private payment proofs, service-only commerce mutation, row-locked workflow transitions, idempotent Zelle review, immutable snapshots, and forward migrations. See [phase-1-security-workflow-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-1-security-workflow-verification.md).

## 7.3 Authentication And Account Management

### Task C-01: Local auth flows

Objective:

Implement email/password sign-up, sign-in, password reset, and verification.

Detailed scope:

- build sign-up and sign-in routes
- wire Payload auth endpoints or server actions
- implement password-reset flow
- implement local account verification flow if included

Deliverables:

- auth pages
- auth actions
- validation and error handling

Dependencies:

- `B-02`

Acceptance criteria:

- a new user can sign up and sign in successfully
- invalid credentials show clear errors
- password reset is functional

Verification update (2026-07-13): completed with public signup/sign-in/sign-out pages, verification and resend handling, forgot/reset password, strong-password enforcement, session protection, rate limits, protected-route redirects, and browser lifecycle coverage. See [phase-2-auth-account-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-2-auth-account-verification.md).

### Task C-02: Google sign-in integration

Objective:

Provide Google sign-in as a first-class auth option.

Detailed scope:

- configure Google OAuth
- map Google identities into the `users` model
- handle account linking or duplicate-email cases safely

Deliverables:

- Google auth integration
- login UI

Dependencies:

- `A-02`
- `B-02`

Acceptance criteria:

- Google sign-in creates or reuses the correct user record
- duplicate account behavior is predictable and safe

Verification update (2026-07-13): completed with Authorization Code + PKCE, signed state, nonce-verified ID tokens, hashed revocable sessions, explicit same-email linking, and safe duplicate-email rejection. Live provider verification still requires the production Google credentials already identified as an external launch input.

### Task C-03: Profile management

Objective:

Allow users to manage their own profile and preferences.

Detailed scope:

- create account settings UI
- allow editing of permitted fields
- support chapter change if allowed by business rules
- support communication preference updates

Deliverables:

- profile/settings page
- profile update actions

Dependencies:

- `C-01`
- `B-03`

Acceptance criteria:

- users can update their own profile fields
- users cannot edit restricted admin-only fields

Verification update (2026-07-13): completed with a protected settings page, server-side field allowlist, active-chapter validation, profile-completeness derivation, communication preferences, immutable email/elevated-role fields, and direct-API regression tests.

### Task C-04: Self-service account deletion

Objective:

Allow users to delete their own accounts without breaking audit data.

Detailed scope:

- create delete-account UI
- implement logical delete or anonymization workflow
- ensure financial and historical relations remain intact

Deliverables:

- delete-account flow
- backend deletion/anonymization logic

Dependencies:

- `C-03`

Acceptance criteria:

- users can trigger account deletion from settings
- required business records are preserved for audit
- deleted users lose active access

Verification update (2026-07-13): completed as transactional in-place anonymization. Personal and authentication data are revoked, hard self-deletion is denied, financial relationships retain the stable user ID, and an append-only audit event records the action.

## 7.4 Public Site Shell And Shared UI

### Task D-01: Header, navigation, and mega-menu system

Objective:

Build the ASME-inspired public-site navigation shell.

Detailed scope:

- implement two-level header
- build desktop mega-menus
- build mobile navigation drawer
- wire header links from Payload globals

Deliverables:

- header component system
- responsive nav behavior

Dependencies:

- `A-04`
- `B-01`

Acceptance criteria:

- navigation scales to the approved sitemap
- mobile and desktop navigation both function cleanly
- join-membership CTA remains visible

Verification update (2026-07-13): completed with CMS-driven child navigation and featured panels, desktop click/hover mega-menus, current-section states, a focus-contained mobile drawer, escape/focus restoration, body-scroll locking, keyboard regression coverage, and the visible membership CTA at desktop and mobile breakpoints.

### Task D-02: Footer system

Objective:

Build the large institutional footer.

Detailed scope:

- implement multi-column footer
- include navigation groups, newsletter signup, legal links, and contact info
- wire footer content from admin data

Deliverables:

- footer component
- admin-driven footer content

Dependencies:

- `B-01`
- `A-04`

Acceptance criteria:

- footer supports the required link density
- footer content can be updated from Payload

Verification update (2026-07-14): completed with CMS-driven navigation groups, organization contact data, newsletter/preference action, safe social/legal links, working legal/account/announcement destinations, legacy-placeholder backfill, external-link handling, and 390px responsive browser coverage.

### Task D-03: Shared public components

Objective:

Create the reusable component library needed for all public pages.

Detailed scope:

- build buttons, badges, cards, CTA bands, stats strip, section headers, filters, timeline components, and content rails
- create responsive variants
- ensure visual consistency with the design-system document

Deliverables:

- reusable component set
- component usage patterns

Dependencies:

- `A-04`

Acceptance criteria:

- page templates can be assembled without one-off styling each time
- the visual system is coherent across page types

Verification update (2026-07-13): completed with reusable badges, content cards and rails, CTA bands, stats, filters, pagination, galleries, timelines, loading skeletons, and empty/error states, plus responsive styles and reduced-motion behavior shared across public templates.

## 7.5 Public Pages And Content Rendering

### Task E-01: Home page implementation

Objective:

Build the modular homepage described in the page blueprints.

Detailed scope:

- implement hero rail
- add stats strip
- add modules for featured events, chapter spotlight, history preview, committee preview, learning content, and announcement banner
- wire sections to Payload-managed data

Deliverables:

- homepage route
- dynamic home modules

Dependencies:

- `D-01`
- `D-02`
- `D-03`
- `B-01`
- `B-05`
- `B-07`

Acceptance criteria:

- homepage sections render dynamic content correctly
- the page feels structurally aligned with the ASME-inspired design direction

Verification update (2026-07-14): the technical homepage is complete with CMS-managed hero/network content, credibility metrics, active announcements, membership, featured events, chapter spotlight, history, current committee, and learning modules plus page-level SEO. The final standard legal policies and a safe content-only sample dataset are installed; `E-01` remains `Partial` only until stakeholder-approved organization, chapter, committee, and other launch content/assets replace those samples. See [phase-10-content-readiness-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-10-content-readiness-verification.md) and [sample-content-guide.md](/Users/shuvomahamud/Projects/RUET_Website/docs/sample-content-guide.md).

### Task E-02: About, mission, and contact pages

Objective:

Implement institutional informational pages.

Detailed scope:

- build About RUETIAN USA
- build mission/overview content sections if separate
- build Contact page
- render content from globals or structured collections

Deliverables:

- about page
- contact page

Dependencies:

- `D-01`
- `D-02`
- `D-03`
- `B-01`

Acceptance criteria:

- informational pages are editable through admin-managed content
- contact information is not hard-coded

Verification update (2026-07-13): completed with a CMS-driven institutional About layout, mission/vision/governance sections, global contact details, and a validated, rate-limited contact form whose submissions are private and admin-readable.

### Task E-03: History timeline page

Objective:

Render history entries as a structured timeline.

Detailed scope:

- build history route
- implement timeline component
- render images, documents, and links
- support a scalable archive-friendly layout

Deliverables:

- history timeline page

Dependencies:

- `B-07`
- `D-03`

Acceptance criteria:

- timeline entries render in correct order
- media and document links work

Verification update (2026-07-13): completed with a published-only, explicitly ordered timeline; decade archive filtering; images, downloadable documents, and external links; seeded CMS page content; generated metadata; and loading, empty, error, responsive, and browser-tested states.

### Task E-04: Committee pages

Objective:

Implement current and historical committee pages using structured data.

Detailed scope:

- build pages for current running committee, current advisory committee, and committee history
- support term-based filtering or archive navigation
- show committee members and committee-event recaps

Deliverables:

- committee page templates
- term switcher or archive controls

Dependencies:

- `B-07`
- `D-03`

Acceptance criteria:

- both advisory and running committees use the same underlying structure
- committee-event recaps can render photo galleries and summaries

Verification update (2026-07-13): completed with shared running, advisory, current, and historical committee routes; term/archive filters; member roles, photos, and bios; recap dates and summaries; and recap galleries capped at six photos in the schema and covered by integration/browser tests.

### Task E-05: Learning and development pages

Objective:

Implement the public content hub for articles and learning material.

Detailed scope:

- build article listing
- build article detail page
- add category filtering and search UI
- wire article cards and content layouts

Deliverables:

- listing and detail routes for learning content

Dependencies:

- `B-07`
- `D-03`

Acceptance criteria:

- articles are filterable and searchable
- article detail pages support rich content and metadata

Verification update (2026-07-13): completed with published-only listing/detail queries, GET-based search, category and content-type filters, pagination, rich-text rendering with legacy fallback, related content, authored/read-time metadata, canonical/Open Graph/Twitter metadata, and browser coverage.

### Task E-06: Legal page templates

Objective:

Prepare legal page templates before final copy arrives.

Detailed scope:

- build reusable legal-content layout
- wire placeholder globals or pages for privacy policy, terms of use, and membership terms
- mark content as placeholder until finalized

Deliverables:

- legal page template
- placeholder routes

Dependencies:

- `B-01`
- `D-03`

Acceptance criteria:

- legal pages exist in the site structure
- approved legal copy can be published and revised without layout changes

Verification update (2026-07-13): completed with CMS-managed legal page types, explicit placeholder/approved status, last-reviewed dates, generated tables of contents, stable section anchors, readable legal layout, and structured seeded templates for privacy, website terms, and membership terms.

Legal-content update (2026-07-14): stakeholder-authorized standard Privacy Policy, Terms of Use, Membership Agreement, Zelle disclosures, and no-refund language are published as version `2026-07-14`. New paid membership and event attempts require explicit agreement and retain the accepted version and timestamp. See [legal-policy-review-record.md](/Users/shuvomahamud/Projects/RUET_Website/docs/legal-policy-review-record.md).

## 7.6 Membership And Checkout

### Task F-01: Membership overview page

Objective:

Build the public membership landing page.

Detailed scope:

- show the single membership plan
- render benefits, FAQs, pricing, renewal summary, and CTA blocks
- wire plan content from Payload

Deliverables:

- membership overview page

Dependencies:

- `B-04`
- `D-03`

Acceptance criteria:

- plan price and benefits are admin-editable
- the page clearly presents one annual plan

Verification update (2026-07-13): completed with a single-active-plan invariant, CMS-managed benefits/FAQs/policies, live annual pricing, join/renew/status CTAs, unavailable-plan state, responsive layout, and explicit Zelle-only/manual-renewal language.

### Task F-02: Join membership flow

Objective:

Implement the membership purchase flow from account entry to payment.

Detailed scope:

- build multistep or staged join flow
- support sign-in and create-account states
- collect required signup/profile fields
- integrate promotion-code application
- show live order summary

Deliverables:

- join membership route and forms
- validation logic

Dependencies:

- `C-01`
- `C-02`
- `B-04`
- `B-06`

Acceptance criteria:

- a public user can successfully proceed from signup to the Zelle payment step
- one promo code can be applied
- order totals calculate correctly

Verification update (2026-07-13): completed with authenticated profile gating, active-chapter enforcement, server-authoritative promotion eligibility/totals, one immutable membership/order/payment transaction, live order summary, validation, and browser-tested pending-state navigation.

### Task F-03: Stripe membership checkout — Superseded

This task is retained only for backlog history. The 2026-07-13 stakeholder decision makes Zelle the only membership payment method, so no Stripe membership checkout or webhook implementation is required.

### Task F-04: Zelle membership payment flow

Objective:

Implement manual membership payment proof submission and approval states.

Detailed scope:

- add Zelle payment option in join/renew flow
- collect transaction ID and/or screenshot
- create pending payment and order records
- notify relevant admins

Deliverables:

- Zelle payment submission flow
- pending-state UI

Dependencies:

- `F-02`
- `B-06`

Acceptance criteria:

- a user can submit proof with transaction ID, screenshot, or both
- membership remains pending until approved

Verification update (2026-07-13): completed with centrally managed Zelle recipient/instructions, transaction-ID-only, proof-only, and combined submissions, private validated uploads, row-locked checkout, immutable resubmission attempts, payer/reviewer notifications, pending status/history, and chapter-scoped review UI/API.

### Task F-05: Membership renewal and reactivation flows

Objective:

Support annual renewals, grace-period recovery, and reactivation after expiration.

Detailed scope:

- build renew/reactivate page
- render current status and renewal price
- use the Zelle proof-and-approval path for every renewal and reactivation
- update membership lifecycle correctly on success or approval

Deliverables:

- renew/reactivate route
- lifecycle handling logic

Dependencies:

- `F-04`
- `B-04`

Acceptance criteria:

- expired users are shown a pay-to-reactivate path
- grace-period users can recover membership without duplicate state corruption

Verification update (2026-07-13): completed with annual renewal and pay-to-reactivate routes, approval-derived term dates, prior-term linking, scheduled pre-expiration and grace reminders, configurable grace transitions, expiration, grace recovery, and prevention of duplicate future-term renewal.

### Task F-06: Membership admin controls

Objective:

Provide the admin-side controls needed to manage the membership system.

Detailed scope:

- membership plan editing
- grace-period setting
- view memberships by status
- review failed and pending payments
- promotion management

Deliverables:

- admin configuration screens in Payload
- membership filters and admin views

Dependencies:

- `B-04`
- `B-06`
- `B-08`

Acceptance criteria:

- super admin can edit plan price and content without code changes
- admins can inspect pending and failed membership payments

Verification update (2026-07-13): completed with super-admin plan editing, configurable price/reminder/grace fields, database-enforced single-active-plan behavior, promotion management, useful membership/order/payment admin columns and filters, and a role/chapter-scoped pending review screen with preserved failed attempts.

## 7.7 Chapters And Governance

### Task G-01: Chapters directory page

Objective:

Build the public chapter discovery experience.

Detailed scope:

- implement chapter search and filters
- render chapter cards
- include request-a-chapter CTA

Deliverables:

- chapters listing page

Dependencies:

- `B-03`
- `D-03`

Acceptance criteria:

- users can browse and find chapters
- deactivated chapters do not appear publicly

Verification update (2026-07-13): completed with GET-based name/region search, region filtering, pagination, chapter cards, request-a-chapter CTA, metadata, and published-active-only visibility verified against inactive and draft records.

### Task G-02: Chapter detail pages

Objective:

Build chapter-level public landing pages.

Detailed scope:

- render overview, leadership, announcements, events, galleries, and local committees
- support multiple chapter admins operationally while keeping the public page unified

Deliverables:

- chapter detail page template

Dependencies:

- `G-01`
- `B-03`
- `B-05`
- `B-07`

Acceptance criteria:

- each chapter can render its own localized content
- the structure remains consistent across chapters

Verification update (2026-07-13): completed with a consistent chapter template for overview/contact, leadership and local committees, active public announcements, upcoming events, and public gallery media; inactive chapters return not-found and all modules are integration/browser tested.

### Task G-03: Chapter request workflow

Objective:

Allow users to request new chapters and route approvals correctly.

Detailed scope:

- build request-a-chapter page or form
- create request records
- support super-admin review state

Deliverables:

- request-a-chapter UI
- chapter request admin workflow

Dependencies:

- `B-03`
- `C-01`

Acceptance criteria:

- a user can submit a chapter request
- a super admin can review and act on it

Verification update (2026-07-13): completed with an authenticated, rate-limited request form; duplicate-pending protection; member-visible request status; super-admin-only review UI/API; required rejection reasons; transactional row locking; idempotent terminal decisions; exactly-one-chapter provisioning; and append-only audit evidence.

### Task G-04: Chapter-admin content workflow

Objective:

Enable chapter admins to manage only their chapter’s data.

Detailed scope:

- configure chapter-scoped access to announcements, galleries, events, and committee content
- verify chapter isolation rules in admin UI

Deliverables:

- chapter-admin access rules and admin usability refinements

Dependencies:

- `B-08`
- `B-03`
- `B-05`
- `B-07`

Acceptance criteria:

- chapter admins can manage their own chapter content
- chapter admins cannot see or edit restricted data from other chapters

Verification update (2026-07-13): completed with server-enforced chapter scope across chapter records, announcements, events, galleries/media, and committee content. Direct-API tests use two chapters to prove authorized create/update behavior and cross-chapter read/write denial.

## 7.8 Events And Registrations

### Task H-01: Events listing page

Objective:

Build the public events index.

Detailed scope:

- implement filters for date, chapter, mode, price, and archive state
- render event cards with date, timezone, mode, and chapter labels

Deliverables:

- events listing page

Dependencies:

- `B-05`
- `D-03`

Acceptance criteria:

- events are filterable and easy to scan
- free, paid, virtual, hybrid, and in-person events are visually distinct

Verification update (2026-07-13): completed with a database-backed catalog supporting date, chapter, mode, price, upcoming/archive, and availability filters; clear free/paid and event-mode states; capacity labels; responsive cards; and published-only visibility.

### Task H-02: Event detail page

Objective:

Build the main event registration destination page.

Detailed scope:

- render title, summary, schedule/body, venue or virtual block, timezone, price, capacity, and CTA
- include sticky registration summary on desktop if practical
- switch to waitlist CTA when full

Deliverables:

- event detail page

Dependencies:

- `H-01`
- `B-05`

Acceptance criteria:

- the page clearly shows event mode and timezone
- full events present a waitlist path rather than a dead end

Verification update (2026-07-13): completed with schedule/timezone, venue or protected virtual-access, authoritative pricing, capacity and remaining-seat states, registration history links, responsive sticky registration summary, full-event waitlist CTA, and post-event recap/gallery rendering.

### Task H-03: Event registration flow

Objective:

Allow users to register for free and paid events.

Detailed scope:

- implement event registration forms
- support registration quantity
- support free registration confirmation
- support paid checkout path

Deliverables:

- event registration flow
- confirmation states

Dependencies:

- `H-02`
- `C-01`
- `B-06`

Acceptance criteria:

- free event registration creates valid registration records
- paid event registration creates pending order/payment records

Verification update (2026-07-13): completed through transactional service-only registration routes with immutable event/price snapshots, server-authoritative totals and promotions, free confirmation, paid pending state, quantity support, row locking, and concurrent no-overbooking coverage.

### Task H-04: Event Stripe checkout — Superseded

This task is retained only for backlog history. The 2026-07-13 stakeholder decision makes Zelle the only paid-event payment method, so no Stripe event checkout or webhook implementation is required.

### Task H-05: Event Zelle payment flow

Objective:

Support manual proof-based event payment.

Detailed scope:

- add Zelle option to paid event registration
- create pending registration and payment records
- notify reviewers

Deliverables:

- event Zelle proof flow

Dependencies:

- `H-03`
- `B-06`

Acceptance criteria:

- event tickets remain pending until proof approval
- proof submission supports transaction ID, screenshot, or both

Verification update (2026-07-13): completed with Zelle-only instructions, transaction-ID/image/both proof validation, private proof media, immutable payment attempts, failed-attempt resubmission, pending capacity reservation, and chapter-first reviewer notification.

### Task H-06: Waitlist logic

Objective:

Implement the required waitlist behavior for capacity-limited events.

Detailed scope:

- create logic to move users from waitlist to offered/confirmed status when capacity changes
- account for registration quantity
- skip the earliest waitlist entry if its quantity does not fit the newly open seat count
- notify promoted users

Deliverables:

- waitlist-processing logic
- waitlist notifications

Dependencies:

- `B-05`
- `H-03`

Acceptance criteria:

- the system promotes the earliest fitting waitlist entry
- quantity-sensitive promotion works correctly

Verification update (2026-07-13): completed with quantity-aware earliest-fitting selection, oversized-group skipping, configurable offer windows, promotion expiry/reprocessing, accepted-offer registration, cancellation capacity release, reserved offered capacity, and deduplicated promotion/expiry notices.

### Task H-07: Post-event galleries and archive behavior

Objective:

Support post-event media and archive presentation.

Detailed scope:

- allow chapter admin to upload post-event galleries
- render archived event recap pages
- keep past events visible in archive views

Deliverables:

- event archive / recap UI
- gallery upload integration

Dependencies:

- `B-05`
- `B-07`
- `H-02`

Acceptance criteria:

- completed events can display gallery media
- archived events remain publicly useful

Verification update (2026-07-13): completed with future-gallery validation, chapter-scoped public media enforcement, archived/past catalog filtering, recap summaries, gallery rendering, and useful public detail pages after completion.

## 7.9 Manual Approval Workflow

### Task I-01: Manual payment review queue

Objective:

Create the admin-side review flow for Zelle proofs.

Detailed scope:

- build admin views for pending manual payments
- group or filter by chapter attribution, status, and transaction type
- prioritize first visibility for chapter admin

Deliverables:

- manual payment review queue

Dependencies:

- `B-06`
- `B-08`

Acceptance criteria:

- chapter admin sees relevant pending proofs first
- admins and super admins can review all required proofs

Verification update (2026-07-13): completed with one `/payments/review` queue for memberships and events, type/status/chapter filters, chapter-scoped proof visibility for chapter reviewers, and organization-wide admin/super-admin oversight.

### Task I-02: Approve / reject manual payment actions

Objective:

Implement approval and rejection flows for manual payment records.

Detailed scope:

- approve payment
- reject payment
- store reviewer metadata
- update related membership or registration state
- send status email

Deliverables:

- approval/rejection actions
- payment-state transition logic

Dependencies:

- `I-01`
- `F-04`
- `H-05`

Acceptance criteria:

- approved proof activates the related pending record
- rejected proof marks payment failed and triggers notification
- resubmission produces a new payment attempt

Verification update (2026-07-13): completed with shared idempotent approve/reject actions, reviewer metadata, correct membership/event transitions, approval-time event capacity enforcement, immutable failed attempts, resubmission, and deduplicated outcome notifications.

## 7.10 Communications And Newsletters

### Task J-01: Transactional email foundation

Objective:

Set up the email infrastructure used by system-triggered events.

Detailed scope:

- integrate email provider
- define email utility layer
- create base templates

Deliverables:

- email provider integration
- base email layout

Dependencies:

- `A-02`

Acceptance criteria:

- the app can send test emails
- templates are reusable across system events

Verification update (2026-07-13): completed with a Payload email adapter supporting safe local/test capture and the Resend API; shared responsive typed templates used by verification/reset email; private delivery audits; unique business/provider idempotency; preference enforcement; exponential retry and sanitized failure recording; transactional, reminder, waitlist, and newsletter queues; scheduled execution; super-admin job access; and a documented worker/monitoring runbook.

### Task J-02: System-triggered emails

Objective:

Implement the required system notifications.

Detailed scope:

- sign-up or verification emails
- password reset
- membership payment success/failure
- manual payment pending/approved/rejected
- event registration confirmation
- waitlist promotion
- renewal reminders

Deliverables:

- event-driven email handlers

Dependencies:

- `J-01`
- `F-04`
- `H-03`
- `H-06`
- `I-02`

Acceptance criteria:

- all critical system states trigger the correct email
- email content reflects the correct status and next action

Verification update (2026-07-13): completed across authentication, membership, event registration, payment pending/approved/rejected, waitlist joined/promoted/expired, authorized cancellation, lifecycle reminders, and account-state messages using stable deduplication keys and required operational delivery rules.

### Task J-03: Admin announcements

Objective:

Allow admins to publish manual announcements.

Detailed scope:

- build admin-managed announcement records
- support site-wide and chapter-scoped announcements
- render announcement surfaces on relevant pages

Deliverables:

- announcements admin workflow
- frontend announcement rendering

Dependencies:

- `B-07`
- `D-03`

Acceptance criteria:

- announcements can be created from admin
- relevant pages display the correct announcements

Verification update (2026-07-14): completed with site-wide and chapter-scoped authoring, public/member audiences, active date windows, safe CTA validation, direct-API visibility enforcement, assigned-chapter isolation, reusable home/chapter/dedicated feeds, and integration/browser targeting coverage. The Phase 9 dashboard consumes this authenticated feed contract.

### Task J-04: Scheduled newsletters

Objective:

Support authoring and scheduling newsletters.

Detailed scope:

- create newsletter campaign model and admin flow
- support draft, scheduled, and sent states
- connect send job to the email provider

Deliverables:

- newsletter campaign workflow
- scheduling integration

Dependencies:

- `B-07`
- `J-01`

Acceptance criteria:

- newsletters can be scheduled
- send history is recorded

Verification update (2026-07-14): completed with admin draft authoring, exact HTML/plain-text preview, row-locked schedule/reschedule/cancel/send/retry actions, minute lifecycle dispatch and stale recovery, verified-account and active/grace-member audiences, preference suppression, stable per-user deduplication, private delivery audits, sanitized failure visibility, and campaign history metrics.

## 7.11 Member Dashboard And Reporting

### Task K-01: Member dashboard

Objective:

Build the member home after login.

Detailed scope:

- show membership status
- show renew/reactivate CTA
- show upcoming registered events
- show recent payments
- show chapter info and announcements

Deliverables:

- member dashboard page

Dependencies:

- `C-03`
- `F-05`
- `H-03`
- `J-03`

Acceptance criteria:

- dashboard surfaces the most important member information in one place

Verification update (2026-07-14): completed with `/dashboard` as the post-login member home, actionable current membership state, renew/reactivate/resubmit routing, primary-chapter context, upcoming registrations, active waitlist entries, recent immutable Zelle attempts, and authenticated organization/chapter announcements. All member queries include an explicit owner constraint even when the caller also has a chapter-admin role.

### Task K-02: Payment and registration history views

Objective:

Let users see their own financial and registration records.

Detailed scope:

- build payment history view
- build event registration history view
- show manual-payment status where relevant

Deliverables:

- payment-history page
- registration-history page

Dependencies:

- `B-06`
- `H-03`
- `F-04`

Acceptance criteria:

- users can view their own records only
- statuses are clear and consistent

Verification update (2026-07-14): completed with a filtered, paginated `/account/payments` attempt ledger and an enhanced filtered, paginated `/events/registrations` history. Both pages show human-readable Zelle/payment decisions, rejection reasons, immutable attempt dates and amounts, registration snapshots, and waitlist history; direct queries constrain `user` to the authenticated account to prevent elevated-role access rules from widening a personal view.

### Task K-03: Admin reporting views

Objective:

Provide the initial reporting surfaces required for operations.

Detailed scope:

- membership counts by status
- chapter-attributed revenue summaries
- event registration counts
- failed manual payment counts
- promotion usage summaries

Deliverables:

- admin reporting queries or dashboard views

Dependencies:

- `B-06`
- `H-03`
- `I-02`

Acceptance criteria:

- admins can retrieve the core operational reports listed in the requirements

Verification update (2026-07-14): completed with `/reports`, private JSON and CSV endpoints, organization/admin and managed-chapter scopes, date/chapter filters, membership status and join/renewal/reactivation outcomes (including failed renewals), approved membership/event revenue by chapter, manual-payment outcomes, event registration/capacity/waitlist totals, and promotion usage. Fixture reconciliation and browser tests prove exact totals, member denial, and unmanaged-chapter denial. See [phase-9-dashboard-reporting-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-9-dashboard-reporting-verification.md).

## 7.12 Publishing Workflow And Content QA

### Task L-01: Draft, review, and publish workflow

Objective:

Apply the required editorial workflow to major public content types.

Detailed scope:

- enable drafts and versions where appropriate
- verify review and publish paths in Payload
- ensure published content is what the public site reads

Deliverables:

- draft/review/publish behavior

Dependencies:

- `B-01`
- `B-07`

Acceptance criteria:

- editors can save draft content
- reviewers can publish approved content

Verification update (2026-07-14): completed across every public collection and public global with versions, draft isolation, chapter-editor submission, elevated review/approval, secure previews, publish enforcement, and path/tag revalidation. Anonymous draft and version access is denied. See [phase-10-content-readiness-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-10-content-readiness-verification.md).

### Task L-02: Seed content and admin usability pass

Objective:

Prepare the system so content editors can begin real entry work.

Detailed scope:

- add initial seed data where helpful
- verify field labels, admin grouping, and form ergonomics
- reduce avoidable admin confusion in collection editing screens

Deliverables:

- seed content
- improved admin field organization

Dependencies:

- `L-01`
- `E-01`
- `E-02`
- `E-03`
- `E-04`
- `E-05`

Acceptance criteria:

- admin users can understand and manage the content model without developer intervention for routine updates

Verification update (2026-07-14): completed with functional admin groupings, editorial status/default columns, contextual labels/help, safe link validation, preview actions, the repeatable CMS baseline seed, and an idempotent realistic UAT seed covering public modules, users, membership/payment history, registrations, and waitlists. See [phase-10-content-readiness-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-10-content-readiness-verification.md).

## 7.13 QA, Security, And Launch Preparation

### Task M-01: End-to-end flow validation

Objective:

Verify the main user and admin workflows before launch.

Detailed scope:

- test sign-up and sign-in
- test membership proof submission with Zelle
- test chapter request flow
- test free event registration
- test paid event registration
- test waitlist promotion
- test account deletion

Deliverables:

- test checklist
- defect list and fixes

Dependencies:

- all critical user flows implemented

Acceptance criteria:

- no launch-blocking defects remain in the core flows

Verification update (2026-07-14): automated integration coverage passes all 68 scenarios, including authentication, Zelle membership/event payment, chapter requests, waitlists, lifecycle jobs, account deletion, and direct workflow access. Final role-based browser UAT and named acceptance remain open. See [phase-11-launch-readiness-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-11-launch-readiness-verification.md).

### Task M-02: Access control and security validation

Objective:

Verify that permissions and sensitive operations are properly restricted.

Detailed scope:

- test member-only pages
- test chapter-admin isolation
- test admin-only actions
- test manual payment approval permissions
- verify sensitive fields are not leaked publicly

Deliverables:

- security and access-control verification notes

Dependencies:

- `B-08`
- all role-sensitive flows

Acceptance criteria:

- role boundaries hold under direct-route and UI access tests

Verification update (2026-07-14): persistent rate limits, secret scanning, private proof access, upload limits, workflow authorization, and negative direct-API tests pass. Live production-provider and final role-based browser security checks remain open. See [phase-11-launch-readiness-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-11-launch-readiness-verification.md).

### Task M-03: Performance and responsive QA

Objective:

Ensure the public site works well across desktop and mobile.

Detailed scope:

- validate responsive navigation
- validate homepage module rendering
- verify key pages on mobile
- optimize obvious layout shifts or heavy components

Deliverables:

- responsive QA pass
- performance fixes where needed

Dependencies:

- public pages implemented

Acceptance criteria:

- the site is usable and visually coherent on mobile and desktop

Verification update (2026-07-14): automated desktop/mobile Axe coverage passes the public route matrix, and Lighthouse passes the configured performance, accessibility, best-practices, SEO, and layout-shift assertions. Final manual device, keyboard, and production-network QA remain open. See [phase-11-launch-readiness-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-11-launch-readiness-verification.md).

### Task M-04: Launch configuration and operational checklist

Objective:

Prepare the application for deployment and handoff.

Detailed scope:

- production env variable checklist
- webhook endpoint setup checklist
- email-domain setup checklist
- admin bootstrap checklist
- backup and database migration checklist

Deliverables:

- launch checklist
- deployment readiness notes

Dependencies:

- all major features implemented

Acceptance criteria:

- a developer can follow the documented checklist to deploy the application safely

Verification update (2026-07-14): Supabase runtime/migration connectivity, private Storage, migration/restore rehearsal, authenticated cron/health routes, Supabase Cron extensions and Vault-backed setup, production validation, exact Vercel build, and deployment/rollback documentation are complete. Vercel login/project linkage, activation against the final HTTPS URL, real email/Google configuration, final content, owners, and UAT sign-off remain open. See [vercel-supabase-launch-runbook.md](/Users/shuvomahamud/Projects/RUET_Website/docs/vercel-supabase-launch-runbook.md).

## 8. Suggested Implementation Order

Recommended critical path:

1. `A-01` to `A-04`
2. `B-01` to `B-08`
3. `C-01` to `C-04`
4. `D-01` to `D-03`
5. `E-01`, `F-01`, `F-02`, `G-01`, `H-01`
6. `F-04` to `F-06`
7. `G-02` to `G-04`
8. `H-02`, `H-03`, `H-05`, `H-06`, `H-07`
9. `I-01` to `I-02`
10. `J-01` to `J-04`
11. `K-01` to `K-03`
12. `L-01` to `L-02`
13. `M-01` to `M-04`

`F-03` and `H-04` are superseded and are not implementation steps.

## 9. Parallelization Guidance

These tasks can be developed in parallel after the schema stabilizes:

- public shell and design-system work
- homepage and informational pages
- membership flow UI
- chapters pages
- learning pages

These tasks should wait until data model and access rules are stable:

- manual payment approvals
- reporting
- waitlist automation
- chapter-admin isolation features
- Zelle state transitions and approval workflows until the access model and payment primitives are stable

## 10. Known Open Inputs That May Affect Later Tasks

This item is still open and may require a small copy change later:

- expected SLA language for manual payment approval

The production media policy is fixed: one private Supabase Storage bucket, a 4 MiB upload limit, collection-specific MIME validation, Payload-proxied access, and configurable finalized-proof retention that defaults to 180 days.

This payment decision should also be preserved:

- Zelle is the only payment method for membership and paid-event flows
- legacy Stripe placeholders in active configuration, schema, UI, and generated types are removed through forward implementation work rather than treated as future features

The developer should avoid hard-coding these items in ways that make later replacement difficult.

## 11. Final Note

This task list is intended to be detailed enough for implementation planning, sprint breakdown, and developer assignment.

If needed, the next level of breakdown would be:

- convert each task into GitHub issues
- assign estimates
- mark blockers and parallel candidates
- split backend, frontend, and CMS ownership per task
