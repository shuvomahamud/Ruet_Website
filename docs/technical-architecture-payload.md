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
- the seeded CMS slugs currently include `about`, `membership`, `chapters`, `events`, `learning`, `contact`, `privacy-policy`, `terms-of-use`, and `membership-terms`
- `membershipPlans`, `chapters`, `events`, and `posts` still own the dynamic record-level content rendered inside those route templates
- the header logo asset is loaded from [public/brand](/Users/shuvomahamud/Projects/RUET_Website/public/brand)

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
- public page copy and legal placeholders

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

- Payload auth for core user management
- email/password auth
- Google sign-in
- self-signup open to everyone

### 3.5 Payments

- `Zelle` proof submission workflow for membership and paid-event transactions
- authorized chapter-admin/admin/super-admin review
- transaction-safe approval and rejection services

### 3.6 Email and scheduled jobs

- transactional provider such as `Resend`, `Postmark`, or `SendGrid`
- scheduled jobs for:
  - renewal reminders
  - failed-payment reminders
  - waitlist promotion emails
  - newsletter sends
  - approval-status emails

### 3.7 File handling

Payload upload collections should manage media records, but the long-term production storage backend is still an open policy item.

The implementation should therefore:

- keep storage adapter choice configurable
- avoid hard-coding a provider-specific media strategy
- support images, PDFs, and payment-proof uploads

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
- graduationYear
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
- requester
- status
- notes
- reviewedBy
- reviewedAt

Behavior:

- public users or members may request a chapter
- only super admin can approve and publish the actual chapter record

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
- category
- excerpt
- body
- featuredImage
- publishStatus
- seoFields

### 6.15 `announcements`

For site-wide and chapter-specific notices.

### 6.16 `newsletterCampaigns`

Recommended for scheduled newsletter authoring and send history.

### 6.17 `media`

Central upload collection for images, PDFs, and payment-proof assets.

## 7. Globals

Use Payload globals for:

- site settings
- header navigation
- footer
- homepage settings
- membership landing settings
- contact settings
- legal page placeholders
- SEO defaults

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

These are policy decisions, not architecture blockers:

- final legal text
- expected SLA for manual approval
- production media storage policy

The implementation should leave these configurable and avoid baking assumptions into irreversible schema decisions.
