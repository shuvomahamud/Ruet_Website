# RUETIAN USA Website Master Requirements And Assumptions

Updated: 2026-07-13

## 1. Purpose

This is the pre-implementation source-of-truth document for the RUETIAN USA website.

It consolidates:

- all confirmed requirements agreed with the stakeholder
- the design and architecture direction already accepted
- implementation assumptions adopted to unblock execution
- the small set of items that are still open

If another document conflicts with this one, this document should take priority until a new stakeholder decision supersedes it.

## 1.1 Current Implementation Alignment

As of 2026-03-29, the current implementation reflects these additional alignment points:

- core public route copy for `about`, `membership`, `chapters`, `events`, `learning`, `contact`, and the placeholder legal pages is now CMS-managed through the `Pages` collection
- those route slugs have been seeded into the CMS and are expected to remain published unless intentionally unpublished
- the header logo now loads from [public/brand](/Users/shuvomahamud/Projects/RUET_Website/public/brand) using the standard `ruetian-usa-logo.*` naming convention
- implementation status and task completion are tracked in:
  - [developer-task-list.md](/Users/shuvomahamud/Projects/RUET_Website/docs/developer-task-list.md)
  - [developer-task-status.csv](/Users/shuvomahamud/Projects/RUET_Website/docs/developer-task-status.csv)

As of 2026-07-13, Zelle is the only approved payment method. Stripe checkout, subscriptions, and webhook processing are no longer in scope.

As of 2026-07-13, the remaining-roadmap Phase 1 data-security gate is implemented: public-owned records are server-stamped, chapter data is assigned-chapter scoped, payment proof is private, commerce mutation is service-only, and workflow transitions use legal state checks, PostgreSQL row locks, shared-request transactions, immutable snapshots, and audit records.

## 2. Inputs Reviewed

- `mynote.txt`
- `question.txt`
- prior baseline documents in `docs/`
- stakeholder clarifications captured on 2026-03-29

## 3. Product Vision

RUETIAN USA needs a professional alumni association website that functions as:

- a public institutional website
- a membership platform
- a chapter network platform
- an event and registration platform
- a communications and content publishing platform
- an admin-managed operational system

The site should feel closer to a professional society website than to a generic university club website.

## 4. Delivery Scope

## 4.1 In scope

- public marketing and information pages
- member authentication
- membership purchase, renewal, and reactivation
- chapter directory and chapter microsites
- free and paid event registration
- Zelle proof-based payment handling
- committee and history content
- blog / learning and development content
- admin announcements
- system-triggered emails
- scheduled newsletters
- chapter-admin workflows
- draft, review, and publish workflow

## 4.2 Out of scope for phase 1

- event check-in workflows
- QR code support
- barcode support
- self-service cancellation workflow
- automated refund workflow
- chapter payout splitting inside the payment gateway
- chapter merge workflow

## 5. Technology Baseline

These are agreed requirements, not assumptions:

- frontend: `Next.js`
- CMS, admin, auth, structured workflows: `Payload CMS`
- primary database: local `PostgreSQL`
- payments: `Zelle` with manual proof submission and authorized approval

Architecture rule:

- `Payload` is the source of truth for content, admin, auth, business records, and workflows
- `PostgreSQL` is the primary database

## 6. User Types And Roles

The system must support these roles:

- public visitor
- member
- chapter admin
- admin
- super admin

Role summary:

- public visitors can browse public content, sign up, buy membership, and register for events according to event rules
- members can manage their own profile, see their membership and event history, and delete their own accounts
- chapter admins can manage their own chapter content, chapter events, chapter galleries, chapter committee content, and first-review manual payment submissions for their chapter
- admins can manage organization-wide content and approvals
- super admins have full access, role assignment, chapter activation/deactivation, and global configuration powers

## 7. Public Website Sitemap

The accepted phase-1 sitemap is:

- home
- about RUETIAN USA
- mission / overview
- RUET history timeline
- current running committee
- current advisory committee
- committee history
- membership overview
- join membership
- renew / reactivate membership
- chapters directory
- chapter detail page
- request a chapter
- events listing
- event detail
- event archive / recap
- learning and development listing
- article detail
- contact
- privacy policy
- terms of use
- membership terms

Authenticated pages:

- sign up
- sign in
- forgot password
- reset password
- member dashboard
- profile and account settings
- membership status
- payment history
- event registrations
- communication preferences
- delete account

## 8. Requirements Register

This section separates confirmed requirements from assumptions.

## 8.1 Product and platform decisions

### Agreed

- The project is no longer based on `Supabase`.
- `Payload CMS` manages content, admin, auth, workflow, and structured business data.
- The database is local `PostgreSQL`.
- The build should be configurable where practical rather than hard-coded.

### Assumptions

- `Payload` will be integrated into the same Next.js codebase rather than deployed as a fully separate application unless operational constraints later require separation.

## 8.2 Design direction

### Agreed

- The website should take strong inspiration from `asme.org`.
- The RUETIAN USA logo is the brand anchor.
- The site should feel modern, professional, chapter-centered, and membership-oriented.

### Assumptions

- The implementation will borrow ASME-like structure, density, and hierarchy without copying content or visuals directly.
- The final UI should use a blue-dominant institutional palette derived from the RUETIAN USA logo.

## 8.3 Authentication and account access

### Agreed

- Self-signup is open to everyone.
- Email/password auth is supported.
- Google sign-in is supported.
- Users can delete their own accounts.

### Assumptions

- Public self-signup creates only the default member-capable account type.
- Self-service account deletion should behave as logical deletion plus data anonymization where possible rather than unsafe hard deletion of financial history.

### Implementation status

- Completed in remaining-roadmap Phase 2 with local verified auth, Google sign-in and explicit linking, protected profile/preferences management, and in-place anonymization that preserves financial and audit relationships.
- Production Google credentials and production email delivery remain environment/launch inputs, not missing application logic.

## 8.4 Recommended signup fields

### Agreed

- Exact stakeholder-approved field list was not provided.

### Assumptions adopted for implementation planning

- first name
- last name
- email
- password for local auth
- phone number optional
- RUET department / program
- graduation year
- student ID or alumni reference optional
- current city
- current state
- current country
- primary chapter
- employer optional
- professional title optional
- communication preferences and consent

## 8.5 Membership model

### Agreed

- One membership type at launch.
- Annual only.
- The membership type is global, not chapter-priced.
- The price can be edited by super admin from admin without code changes.
- Membership renewal is annual and manual through a new Zelle proof submission; the system sends reminders but does not automatically debit members.
- Membership starts on payment date.
- Price changes apply at the next annual renewal.
- Expired users can pay to reactivate.
- There is no website cancellation flow.
- Cancellation is handled manually by email to admin.
- No refunds.

### Assumptions

- Placeholder launch membership price: `USD 50 / year`
- Failed payment grace period: `7 days`, configurable by super admin
- renewal reminders should begin before expiration and continue during the configurable grace period

## 8.6 Membership lifecycle rules

### Agreed

- Membership remains pending until manual payment approval when Zelle is used.
- Reactivation happens by paying again after expiration.

### Assumptions

- Recommended states:
  - `pending_payment`
  - `pending_manual_approval`
  - `active`
  - `grace_period`
  - `expired`
  - `failed_manual_payment`
  - `cancelled_by_admin`
  - `suspended`

## 8.7 Chapters

### Agreed

- Members belong to one primary chapter at a time.
- Members may change chapters later.
- A chapter can have multiple chapter admins.
- The minimum chapter creation input is `name`.
- Chapters can be deactivated.
- Chapter merge is not supported right now.
- Chapters need their own galleries, announcements, and local committee pages.
- Chapter leadership is managed by chapter admins.

### Agreed from earlier clarification that remains compatible with the new direction

- Users can request a new chapter.
- Super admin approval is required before a requested chapter becomes a published chapter.

### Assumptions

- The request-a-chapter form should ask only for chapter name plus requester context rather than a long launch form.

## 8.8 Events

### Agreed

- The website supports free and paid events.
- The website supports virtual, in-person, and hybrid events.
- Paid and unpaid users can register for events where event rules allow it.
- Event capacity is configurable.
- Waitlist is required.
- If a seat opens, the system promotes the earliest waitlisted registration whose group size fits the available seats.
- If the earliest waitlisted group does not fit, the system checks the next eligible group.
- Event check-in is out of scope.
- QR and barcode support are out of scope.
- Chapter admin can configure the event timezone.
- Chapter admin can upload event media galleries after completion.
- No refunds.

### Assumptions

- Event registration quantity must support group-size logic because the waitlist rule depends on it.
- Archived events should convert into recap-style pages rather than becoming invisible list items.

## 8.9 Conference and Zoom access

### Agreed

- Conference and Zoom events are allowed.
- Zoom or conference access can be public when configured that way.

### Assumptions

- Event records should include an explicit virtual-access visibility setting rather than hiding this logic inside free/paid flags.

## 8.10 Payment routing and payment methods

### Agreed

- `Zelle` is the only required payment method.
- Zelle recipient details and payment instructions are centrally managed and admin-editable.
- Chapter attribution is stored in the application data model.
- Chapter-level distribution is handled operationally outside the website.

### Assumptions

- The order model should already support both membership and event transactions, even if mixed carts are not enabled at launch.

## 8.11 Manual payment workflow

### Agreed

- Proof may be transaction ID, screenshot, or both.
- The chapter admin receives the submission first.
- Chapter admin, admin, and super admin can approve.
- Membership or ticket stays pending until approval.
- Invalid proof triggers email notification to the payer.
- Invalid proof marks the payment failed.
- Resubmission is treated as a new transaction or payment attempt.

### Assumptions

- Rejection should preserve the original proof record for audit purposes.
- The UI should display a clear pending, approved, or failed state at all times.

## 8.12 Promotions and discounts

### Agreed

- Promotions can apply to membership, events, or both.
- One promotion code per checkout.
- Automatic member discounts may exist if configured by admin.

### Assumptions

- Promotion logic should be centralized so the same code path can support both membership and event checkout.

## 8.13 Committee and history content

### Agreed

- Committee term length is 2 years by default.
- Start and end dates are configurable.
- Advisory and running committees follow the same structure.
- Each committee term needs committee members and role assignments.
- Each committee term stores events done by the committee and a summary of those events.
- History entries support documents, images, and links.
- RUET history should be shown as timeline entries.

### Assumptions

- Each committee-event recap should support up to `6` photos.
- Committee member cards may support optional photo and short bio.

## 8.14 Communications

### Agreed

- System-triggered emails are required.
- Manual admin announcements are required.
- Scheduled newsletters are required.

### Assumptions

- Email events should include sign-up verification, password reset, payment status, membership renewal, waitlist promotion, and event registration updates.

## 8.15 Content governance and approvals

### Agreed

- Draft, review, and publish workflow is required.

### Assumptions

- Draft and versioning should be enabled for high-value public content types such as events, chapters, pages, committee terms, history entries, and posts.

## 9. Structured Data And Admin Configuration Requirements

The admin must be able to manage at least:

- site settings
- navigation and footer
- home page modules
- membership plan content and pricing
- chapter records
- chapter announcements
- chapter galleries
- chapter committee terms
- events and event galleries
- promotion codes
- manual payment approvals
- history timeline entries
- blog / learning content
- newsletters and announcements

## 10. Reporting Requirements

The system should support reporting for:

- active members
- memberships in grace period
- expired members
- membership renewals
- membership reactivations
- event registrations
- waitlist promotion outcomes
- revenue by payment type
- revenue with chapter attribution
- failed manual payments
- promotion usage

## 11. Non-Functional Requirements

- public pages should be SEO-friendly
- admin configuration should avoid code changes for routine content updates
- payment records must remain auditable
- role boundaries must be enforced
- the system should support a chapter-scoped admin experience
- date/time rendering must respect event timezone settings
- the design must be responsive for desktop and mobile

## 12. Assumption Log

These assumptions were introduced to unblock planning and should be reviewed during implementation kickoff:

1. Placeholder membership launch price is `USD 50 / year`.
2. Grace period after failed renewal is `7 days`.
3. Account deletion is logical/anonymized rather than hard delete.
4. Signup field set is the recommended list in section `8.4`.
5. Committee-event gallery cap is `6` photos.
6. Chapter-request workflow remains in scope because it was approved earlier and still fits the current product direction.
7. Archived events should be recap pages rather than plain hidden records.
8. Payload and Next.js will live in one integrated application unless operations later require separation.

## 13. Remaining Open Items

Only these items remain open:

1. Final legal page copy:
   - privacy policy
   - terms of use
   - membership terms
   - final no-refund wording
2. Expected SLA for manual payment approval.
3. Media and storage policy:
   - production storage backend
   - file size limits
   - retention and archival rules

## 14. Final Implementation Position

Engineering can begin from this document without waiting for additional discovery.

The product is defined enough to proceed with:

- schema design
- frontend information architecture
- admin collection planning
- role and permission implementation
- payment workflow implementation
- page and component design
