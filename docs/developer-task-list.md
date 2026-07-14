# RUETIAN USA Website Developer Task List

Updated: 2026-07-13

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
4. delay final legal-copy integration until legal text is provided
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

### Phase 0

Project setup, architecture, environment, and base design system.

### Phase 1

Payload collections, auth, roles, access control, and admin groundwork.

### Phase 2

Public site shell, navigation, footer, home page framework, and content templates.

### Phase 3

Membership, Zelle manual payments, promotions, and member lifecycle flows.

### Phase 4

Chapters, events, waitlists, galleries, chapter-admin workflows, and Zelle registration flows.

### Phase 5

Communications, dashboard, reporting, QA, and launch hardening.

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

- the continuous fully completed block is `A-01` through `B-08`
- in other words, the project is fully complete through letter `B`, task `08`

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

Partially implemented tasks already started in code:

- `D-01`
- `D-02`
- `D-03`
- `E-01`
- `E-02`
- `E-05`
- `E-06`
- `F-01`
- `G-01`
- `G-02`
- `G-04`
- `H-01`
- `H-02`
- `J-03`
- `L-01`

Pending tasks:

- `C-01`
- `C-02`
- `C-03`
- `C-04`
- `E-03`
- `E-04`
- `F-02`
- `F-04`
- `F-05`
- `F-06`
- `G-03`
- `H-03`
- `H-05`
- `H-06`
- `H-07`
- `I-01`
- `I-02`
- `J-01`
- `J-02`
- `J-04`
- `K-01`
- `K-02`
- `K-03`
- `L-02`
- `M-01`
- `M-02`
- `M-03`
- `M-04`

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

- create globals for site settings, navigation, footer, homepage settings, SEO defaults, and legal placeholders
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
- legal copy can be inserted later without layout changes

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

These items are still open and may require small follow-up changes later:

- final legal page copy
- expected SLA language for manual payment approval
- final production media/storage policy

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
