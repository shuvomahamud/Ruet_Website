# RUETIAN USA Website Technical Architecture

Updated: 2026-07-13

## 1. Objective

Build the RUETIAN USA website on a single coherent platform:

- `Next.js` for the public website and member-facing frontend
- `Payload CMS` as the main content, admin, auth, workflow, and structured-data system
- local `PostgreSQL` as the primary database
- `Zelle` as the only payment method, using manual proof and approval
- email delivery for transactional emails, announcements, and scheduled newsletters

This replaces the earlier `Supabase` direction.

## 1.1 Current Implementation Alignment

The current codebase now follows these concrete implementation rules:

- public informational route copy is owned by Payload `pages` records, not hardcoded route text
- the seeded CMS slugs currently include `about`, `membership`, `chapters`, `events`, `learning`, `contact`, `history`, `running-committee`, `advisory-committee`, `committee-history`, `privacy-policy`, `terms-of-use`, and `membership-terms`
- `membershipPlans`, `chapters`, `events`, and `posts` still own the dynamic record-level content rendered inside those route templates
- the header logo asset is loaded from [public/brand](/Users/shuvomahamud/Projects/RUET_Website/public/brand)
- transaction collections are read-scoped but service-only for create/update/delete; state transitions share the Payload request transaction and lock the target PostgreSQL row
- payment screenshots/PDFs use the private `paymentProofs` collection rather than publicly readable editorial media
- immutable transaction snapshots and super-admin-readable `auditLogs` support operational traceability without logging proof contents or secrets
- Header rows support nested child links and featured content consumed by the accessible desktop mega-menu and mobile drawer
- Pages and posts carry reusable SEO groups; legal pages add approval state, review date, and stable section anchors
- posts support rich content, content type, featured ordering, author, and reading-time metadata while retaining the legacy plain-body fallback
- public contact writes pass through the validated and rate-limited `/api/contact` boundary into the private `contactSubmissions` collection
- public chapter/history/governance reads enforce published and active visibility, while chapter-admin writes remain assigned-chapter scoped
- chapter requests pass through authenticated, rate-limited creation and a transactional, row-locked, super-admin-only review service that provisions at most one chapter and records an audit entry
- email uses a Payload adapter with local/test capture and a Resend REST transport; queued business email records private delivery metadata without storing message bodies or credentials
- Payload jobs provide exclusive per-delivery concurrency, exponential retry, scheduled execution, and transactional/reminder/waitlist/newsletter queues; operating procedures are in [email-and-jobs-operations.md](/Users/shuvomahamud/Projects/RUET_Website/docs/email-and-jobs-operations.md)

## 2. Core Architecture Principles

### 2.1 One platform owns the core data model

`Payload` is the source of truth for:

- site content
- memberships
- chapters
- committee records
- history timeline entries
- events
- event registrations
- promotions
- orders and payments
- announcements and newsletter content
- user accounts and roles
- public page copy and approved, versioned legal policies

### 2.2 PostgreSQL is the primary database, but Payload owns the schema

- `PostgreSQL` stores production data
- `Payload` collections, globals, hooks, and migrations define the application schema
- direct SQL changes should be exceptional, not the main workflow

### 2.3 The system must remain configurable

The following items must be editable from admin without code changes:

- public membership plan content
- launch membership price
- membership active/inactive status
- grace-period length
- event capacity
- event timezone
- chapter activation status
- announcements and newsletter content

## 3. Recommended Stack

### 3.1 Frontend

- `Next.js` App Router
- server-rendered public routes for SEO-sensitive pages
- authenticated routes for dashboard and account management
- Payload local API and server-side queries inside the same application boundary where practical

### 3.2 CMS and admin

- `Payload CMS`
- collections for structured business data
- globals for singleton site settings
- access control by role and chapter scope
- drafts, versions, and review workflow for public-facing content

### 3.3 Database

- local `PostgreSQL` server
- Payload PostgreSQL adapter
- application schema managed through Payload migrations

### 3.4 Authentication

- Payload verified email/password auth for core user management
- public signup, login, logout, forgot/reset password, and verification/resend routes
- Google Authorization Code OAuth with PKCE, signed state, nonce validation, verified ID-token claims, and revocable opaque sessions stored only as hashes
- explicit authenticated account linking for matching verified email addresses; an unauthenticated duplicate email is never auto-linked
- self-signup open to everyone while server hooks force the default `member` role and block public hard deletion
- protected account settings with a field allowlist, active-chapter validation, and communication preferences
- transactional logical deletion/anonymization that revokes sessions but preserves stable user relationships for finance and audit
- suspended and deleted accounts are rejected by local login, refresh/me hooks, custom Google sessions, role access helpers, and protected routes

Production email delivery is owned by roadmap Phase 5. Production Google verification requires client credentials and the approved `/api/auth/google/callback` URL.

### 3.5 Payments

- `Zelle` proof submission workflow for membership and paid-event transactions
- authorized chapter-admin/admin/super-admin review
- transaction-safe approval and rejection services

### 3.6 Email and scheduled jobs

- Resend is the production transport; local and test environments use an external-send-free capture adapter
- responsive typed templates are shared by Payload authentication and queued application messages
- private `emailDeliveries` records hold deduplication, preference, attempt, provider, failure, and delivery audit data without storing message bodies
- required system messages bypass optional preferences; optional reminders, announcements, and newsletters honor their specific preferences
- Payload jobs and named queues support:
  - renewal reminders
  - failed-payment reminders
  - waitlist promotion emails
  - newsletter sends
  - approval-status emails
- each queued delivery has a database uniqueness key, exclusive concurrency key, retry/backoff policy, and provider idempotency header
- persistent hosts may run one in-process worker; the Vercel deployment uses Supabase Cron to invoke the authenticated HTTP job runner

### 3.7 File handling

Payload upload collections manage media records. Local development uses disk storage; Vercel uses one private Supabase Storage bucket through Supabase's S3-compatible server endpoint.

The implementation:

- keeps Payload access control in front of stored objects
- separates editorial files under `media/` and private Zelle evidence under `payment-proofs/`
- accepts images and PDFs according to collection-specific MIME rules
- rejects uploads over 4 MiB
- deletes finalized payment-proof binaries after the configurable retention period, defaulting to 180 days
- keeps financial and audit metadata after proof-file deletion

Operational setup is documented in [supabase-storage-operations.md](/Users/shuvomahamud/Projects/RUET_Website/docs/supabase-storage-operations.md).

## 4. High-Level System Layout

```text
Visitors / Members
        |
        v
   Next.js Frontend
        |
        +--> Payload Local API / CMS Logic
        |          |
        |          v
        |      PostgreSQL
        |
        +--> Zelle Proof Submission / Review
        |
        +--> Email Provider / Job Queue
        |
        +--> Media Storage Adapter

Chapter Admin / Admin / Super Admin
        |
        v
    Payload Admin UI
```

## 5. Access Model

The minimum roles are:

- `public`
- `member`
- `chapterAdmin`
- `admin`
- `superAdmin`

### 5.1 Public users

- read public pages, events, chapters, posts, and history
- create an account
- purchase membership
- register for events according to event rules

### 5.2 Members

- manage their own profile
- change chapter where allowed by business rules
- view own membership, payments, and event registrations
- renew or reactivate membership
- delete their own account

### 5.3 Chapter admins

- manage only their assigned chapter or chapters
- receive first visibility of manual payment submissions associated with their chapter
- approve or reject manual payment proofs
- manage chapter announcements, chapter gallery content, local leadership content, and chapter events
- configure timezone and capacity for chapter-owned events

### 5.4 Admins

- approve any manual payment submission
- manage organization-wide content
- manage promotions, newsletters, and reporting
- manage memberships and event records

### 5.5 Super admins

- full system access
- role assignment
- chapter activation / deactivation
- membership plan editing
- global settings and audit visibility

## 6. Payload Data Model

The following collections are the recommended phase-1 baseline.

### 6.1 `users`

Use Payload auth on `users`.

Key fields:

- firstName
- lastName
- email
- password for local auth
- authProviders
- phone optional
- ruetDepartment
- rollNumber (normalized, unique; required for new signups and complete profiles)
- alumniReference optional
- city
- state
- country
- primaryChapter
- employer optional
- professionalTitle optional
- communicationPreferences
- role
- accountStatus
- deletedAt optional

Behavior:

- self-signup creates a standard user account
- admin roles are assigned internally, not via public signup
- self-service delete should anonymize personal data where possible while retaining order and payment references for audit

### 6.2 `chapters`

Key fields:

- name
- slug
- status
- summary
- description
- region or state optional
- chapterAdmins
- contactEmail optional
- heroImage optional
- localAnnouncements
- gallery
- localCommitteePages

Behavior:

- minimum creation input is `name`
- database ID is system-generated
- chapters may be deactivated
- chapter merge support is out of scope in phase 1
- one user has one primary chapter at a time, but chapter changes are allowed later

### 6.3 `chapterRequests`

Recommended because earlier stakeholder answers allow chapter requests before super-admin publication.

Key fields:

- requestedName
- requestedRegion
- motivation
- requester
- status
- notes
- reviewedBy
- reviewedAt
- resultingChapter

Behavior:

- authenticated members may request a chapter
- only super admin can approve or reject a request and publish the resulting chapter record
- terminal review decisions are transactional and idempotent; conflicting repeat decisions are rejected

### 6.4 `membershipPlans`

Key fields:

- title
- slug
- publicDescription
- benefits
- annualPrice
- currency
- active
- renewalReminderEnabled
- gracePeriodDays
- sortOrder

Behavior:

- launch expects one active public plan
- launch placeholder should start at `USD 50 / year`
- super admin can edit plan content and price from admin UI
- chapter affiliation never changes plan price

### 6.5 `memberships`

Key fields:

- user
- plan
- status
- startedAt
- renewalAt
- expiresAt
- graceEndsAt
- renewalMode (`manual_zelle` at launch)
- paymentMethod
- chapterSnapshot
- planTitleSnapshot
- planPriceSnapshot
- currencySnapshot
- billingIntervalSnapshot
- reactivationEligible

Behavior:

- membership starts on the authorized Zelle approval date
- every annual renewal requires a new approved Zelle payment attempt
- price changes take effect at the next annual renewal
- expired members are prompted to pay to reactivate
- failed renewal enters grace period before expiration

### 6.6 `events`

Key fields:

- title
- slug
- chapter
- status
- eventMode
- startAt
- endAt
- timezone
- venue
- virtualLink
- virtualAccessVisibility
- summary
- body
- featuredImage
- isPaid
- basePrice
- currency
- capacity
- waitlistEnabled
- maxRegistrationQuantity
- promoEligible
- memberDiscountRule optional
- galleryAfterCompletion

Behavior:

- support `in-person`, `virtual`, and `hybrid`
- chapter admin selects event timezone
- capacity is configurable
- no QR code or check-in workflow is modeled in phase 1
- no automated refund flow is required

### 6.7 `eventRegistrations`

Key fields:

- event
- user
- quantity
- status
- order
- paymentStatus
- registrationPriceSnapshot
- discountSnapshot
- attendeeDetails optional
- waitlistPosition optional

Behavior:

- quantity supports the group-size rule required by waitlist handling
- paid registrations remain pending until payment succeeds or manual proof is approved

### 6.8 `waitlistEntries`

Recommended as a distinct collection so promotion logic is explicit.

Key fields:

- event
- user
- quantity
- joinedAt
- status
- promotedAt optional
- promotionExpiryAt optional

Behavior:

- when seats open, the system evaluates entries in join order
- the first entry whose quantity fits the available seats is promoted
- entries that do not fit remain in position until more seats open or another entry is promoted

### 6.9 `orders`

Key fields:

- user
- orderType
- chapterAttribution
- status
- subtotal
- discountTotal
- total
- currency
- paymentMethod

### 6.10 `payments`

Key fields:

- order
- paymentSource
- status
- externalReference
- proofImage optional
- proofTransactionId optional
- submittedAt
- firstReviewerChapter
- approvedBy optional
- approvedAt optional
- rejectedBy optional
- rejectedAt optional
- rejectionReason optional

Behavior:

- chapter admin receives submissions first
- chapter admin, admin, and super admin may approve
- rejected proof triggers an email and marks payment failed
- resubmission creates a new payment attempt record rather than mutating history

### 6.11 `promotions`

Key fields:

- code
- scope
- discountType
- discountValue
- startsAt
- endsAt
- usageLimit
- active
- memberOnly optional

Behavior:

- promotions may apply to memberships, events, or both
- one promotion code per checkout
- automatic member discounts are allowed when configured by admin

### 6.12 `committeeTerms`

Key fields:

- committeeType
- chapter optional
- title
- startDate
- endDate
- isCurrent
- members
- eventRecaps

Suggested nested member fields:

- name
- role
- photo optional
- bio optional

Suggested nested event recap fields:

- title
- eventDate
- summary
- photoGallery up to 6 images

Behavior:

- advisory and running committees use the same schema
- default term length is two years, but dates remain configurable
- chapter admins manage chapter-level leadership data

### 6.13 `historyEntries`

Key fields:

- title
- startYear or exactDate
- endYear optional
- summary
- body
- images
- documents
- externalLinks
- sortOrder

Behavior:

- rendered as a timeline
- supports archival documents, media, and links

### 6.14 `posts`

For learning and development content.

Key fields:

- title
- slug
- excerpt
- body
- richBody
- featuredImage
- categories
- authorName
- readingTimeMinutes
- featured
- contentType
- publishedAt and draft status
- seoFields

### 6.15 `announcements`

Site-wide and chapter-specific notices with public/member audiences, optional active windows, safe CTA pairs, draft/publish versions, assigned-chapter authoring, and read-access enforcement that prevents future, expired, draft, or wrong-chapter records from leaking through direct APIs.

### 6.16 `newsletterCampaigns`

Admin-only newsletter authoring and operations. Draft content progresses through scheduled, sending, sent, cancelled, or failed states using row-locked services. Campaigns store schedule/actor/result counts and connect to private per-recipient delivery audits; stable semantic keys, preference suppression, retry, and stale-claim recovery prevent duplicate sending.

### 6.17 `media`

Central upload collection for images, PDFs, and payment-proof assets.

### 6.18 `contactSubmissions`

Private public-inquiry records created only after server validation. Public callers cannot read or mutate submissions, and trusted status, time, and internal-note fields are forced on the server.

### 6.19 `emailDeliveries`

Private, service-written delivery audit records.

Key fields:

- deduplicationKey unique
- category and required classification
- recipient and optional user relationship
- subject and template name
- queue, scheduled time, and Payload job ID
- status, attempts, and last-attempt time
- provider and provider message ID
- sent time, suppressed reason, and sanitized error detail

Behavior:

- normal collection create, update, and delete are denied
- admins may inspect delivery operations; standard members have no read access
- bodies and provider credentials are intentionally excluded
- one semantic business event reuses one delivery record across retries

## 7. Globals

Use Payload globals for:

- site settings
- header navigation
- footer
- homepage settings
- membership landing settings
- contact settings and response guidance
- SEO defaults

The `Pages` collection owns legal page type, approval status, review date, anchored sections, and policy content. Standard policies are published as an immutable dated source snapshot; future changes require a new snapshot and forward migration so payment acceptance evidence remains traceable.

## 8. Frontend Rendering Strategy

### 8.1 Public routes

Use server-rendered routes for:

- home
- about
- history
- committees
- membership pages
- chapters
- events
- learning and development
- contact
- legal pages

### 8.2 Authenticated routes

Use protected routes for:

- member dashboard
- profile settings
- membership management
- event registrations
- payment history
- account deletion

### 8.3 Admin routes

Use Payload Admin UI rather than building a second custom admin app.

## 9. Workflow Design

The project requires draft, review, and publish behavior for public content.

Apply drafts and versions to:

- public pages
- chapters
- events
- posts
- announcements
- committee and history content

Recommended flow:

1. author saves draft
2. reviewer checks content in Payload admin
3. reviewer publishes
4. Payload version history preserves auditability

## 10. Payment Architecture

### 10.1 Zelle

- user submits proof by transaction ID, screenshot, or both
- payment remains pending until approved
- chapter attribution stays in application records
- recipient details and instructions are centrally managed and admin-editable
- manual renewals are required every year and are supported by renewal reminders
- approval and rejection must be idempotent and preserve immutable payment-attempt history

### 10.2 Refund policy

There is no automated refund system in phase 1 because the business rule is `no refund`.

Admins may still need internal notes or manual exception handling, but that should not drive public product flow.

## 11. Key Business Rules To Enforce In Code

- one public membership plan at launch
- annual membership only
- membership price is admin-editable
- chapter affiliation does not alter pricing
- price changes apply at next renewal
- no self-service cancellation workflow
- user account deletion is allowed
- event capacity and waitlist are required
- waitlist promotion must respect registration quantity
- hybrid event support is required
- event check-in and QR support are out of scope

## 12. Remaining Open Items

This policy decision is not an architecture blocker:

- expected SLA for manual approval

The review note remains admin-editable. The production media policy is implemented with private Supabase Storage and documented in the storage operations runbook.
