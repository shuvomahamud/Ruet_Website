# RUETIAN USA Website Requirements Baseline

Updated: 2026-07-13

## Purpose

This document replaces the earlier gap list with a normalized decision baseline for the RUETIAN USA website. It reflects the latest stakeholder direction and identifies only the items that are still genuinely open.

## Current Implementation Alignment

The current implementation now adds these resolved delivery details:

- informational page copy is no longer intended to live as route-level fallback text
- `about`, `membership`, `chapters`, `events`, `learning`, `contact`, and legal placeholder copy are now expected to come from the Payload `Pages` collection
- the header logo asset path is standardized through [public/brand](/Users/shuvomahamud/Projects/RUET_Website/public/brand)
- current task completion status is tracked in:
  - [developer-task-list.md](/Users/shuvomahamud/Projects/RUET_Website/docs/developer-task-list.md)
  - [developer-task-status.csv](/Users/shuvomahamud/Projects/RUET_Website/docs/developer-task-status.csv)
- the authorization and transaction foundation now enforces authenticated ownership, assigned-chapter isolation, private Zelle proofs, service-only commerce mutation, row-locked legal state transitions, immutable snapshots, and append-only audit records; verification is recorded in [phase-1-security-workflow-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-1-security-workflow-verification.md)
- the public account lifecycle now includes verification-gated email/password auth, Google OAuth with explicit safe linking, profile/preferences management, active-account enforcement, and audited in-place account anonymization; verification is recorded in [phase-2-auth-account-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-2-auth-account-verification.md)
- the shared public experience now includes CMS-driven desktop/mobile navigation, reusable responsive components, institutional and contact templates, protected contact submissions, a searchable rich-content learning hub, reusable legal templates, and canonical/social metadata; verification is recorded in [phase-3-public-experience-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-3-public-experience-verification.md)

## Reviewed Inputs

- `mynote.txt`
- `question.txt`
- existing markdown requirement and architecture documents
- latest stakeholder decisions captured on 2026-03-29

## Decisions That Are Now Final

### 1. Platform and architecture

The project direction is no longer `Next.js + Supabase`.

The normalized stack is:

- `Next.js` for the frontend
- `Payload CMS` for content, admin, auth, workflow, and structured business data
- local `PostgreSQL` as the primary database
- `Zelle` as the only payment method, using manual proof and approval workflows

This is the approved architecture baseline.

### 2. Design direction

The client wants RUETIAN USA to feel as close as practical to the professionalism and information architecture style of `asme.org`, while still remaining RUETIAN USA's own website.

Current design direction is therefore:

- use the attached RUETIAN USA logo as the brand anchor
- use `asme.org` as the structural and UX reference
- keep the site chapter-centered, membership-oriented, and event-driven
- preserve an original implementation rather than directly copying or scraping external content without approval

This is defined well enough to proceed with design and engineering.

### 3. Sitemap direction

The proposed sitemap is accepted and should be treated as the working information architecture for phase 1.

The site must include at least:

- home
- about RUETIAN USA
- RUET history timeline
- current and past committee pages
- membership overview
- join membership
- renew/reactivate membership
- chapters directory
- chapter detail pages
- events listing
- event detail pages
- event archive / recap views
- learning and development listing
- article detail pages
- sign up / sign in / reset password
- member dashboard
- profile and account settings
- payment and registration history
- contact page
- legal pages

### 4. Self-signup and auth

Self-signup is open to everyone.

Normalized account rules:

- public users may create accounts directly
- email/password and Google sign-in are both supported
- chapter admin, admin, and super admin roles are not public self-signup roles
- users may delete their own accounts

### 5. Membership model

Membership business rules are now sufficiently defined for implementation:

- one membership type at launch
- annual billing only
- placeholder launch price should be created as dummy data and remain editable by super admin from admin UI without code changes
- chapter affiliation does not affect pricing
- annual renewal is required through a new Zelle proof submission; the website does not automatically debit members
- membership starts on payment date or manual payment approval date
- price changes apply at the next annual renewal
- expired members are prompted to pay to reactivate
- there is no self-service cancellation flow on the website
- cancellation requests are handled manually by email to admin
- no refunds

Implementation defaults adopted for documentation:

- placeholder launch price: `USD 50 / year`
- failed renewal grace period: `7 days`, configurable by super admin

### 6. Payment routing

Payment routing is finalized.

- Zelle recipient details and payment instructions are centrally managed and admin-editable
- chapter attribution is stored in application data
- chapter-level financial distribution is handled operationally outside the website

### 7. Conference and Zoom access

Conference and Zoom requirements are clarified.

- the website supports virtual, in-person, and hybrid events
- Zoom or conference access can be publicly visible when configured that way
- events may be free or paid
- both paid and unpaid users may register for events where the event rules allow it

### 8. Event operations

The event baseline is now:

- event capacity is configurable
- waitlist is required
- if seats open, the system should promote the earliest waitlisted registration whose group size fits the newly available seats
- if the first waitlisted group does not fit, the system should evaluate the next waitlisted group
- event check-in is out of scope
- QR code and barcode support are out of scope
- chapter admin can set the event timezone
- chapter admin can upload event gallery media after completion
- no refunds

### 9. Manual payment approval workflow

The Zelle and proof-review workflow is now mostly defined:

- proof may be transaction ID, screenshot, or both
- the relevant chapter admin receives the submission first
- chapter admin, admin, and super admin roles may approve
- memberships and paid event registrations remain pending until approval
- if proof is invalid, the payer is notified by email and the payment is marked failed
- any resubmission is treated as a new payment attempt / transaction

### 10. Chapter model

Chapter requirements are now:

- members have one primary chapter at a time
- members may later change chapters
- a chapter can have multiple chapter admins
- users may request a new chapter with only a chapter name as the required input
- only super admin can approve and publish the actual chapter record
- the minimum information required to create a chapter is `name`
- database ID is system-generated
- chapters can be deactivated
- chapter merging is out of scope for now
- chapters need their own galleries, announcements, and local committee pages
- chapter leadership records are managed by chapter admins

### 11. Committee and history model

The normalized content rules are:

- committee term length defaults to `2 years`
- start and end dates remain configurable
- advisory and running committees use the same structure
- each committee term stores committee members and role assignments
- each committee term also stores events completed by that committee, a summary for each event, and a small photo set for each event
- documentation baseline will support up to `6` photos per committee-event recap
- RUET history is displayed as structured timeline entries
- history entries support documents, images, and links

### 12. Communications

All three communication modes are in scope:

- system-triggered emails
- manual admin announcements
- scheduled newsletters

## Recommended Finalized Signup Fields

No external site scraping was used in this baseline. The following signup fields are recommended so implementation can proceed without waiting for further clarification:

- first name
- last name
- email
- password for local auth
- Google sign-in alternative
- phone number optional
- RUET department / program
- graduation year
- student ID or alumni reference optional
- current city
- current state
- current country
- primary chapter selection
- employer or professional title optional
- communication preferences and consent

These fields are sufficient for alumni identification, chapter routing, and later membership conversion.

## Items Removed From The Prior Conflict List

These should no longer appear as unresolved conflicts in downstream documents:

- technology stack direction
- conference / Zoom access ambiguity
- payment routing ambiguity
- membership structure ambiguity

## Remaining Open Items

Only the following items still need stakeholder closure:

### 1. Legal content

The website still needs finalized content for:

- privacy policy
- terms of use
- membership terms / agreement
- payment and no-refund wording

### 2. Expected SLA for manual approval

The payment proof workflow is defined, but the expected review window is still open. The product should not promise a turnaround time until this is confirmed.

### 3. Media and storage policy

There is no finalized policy yet for:

- production media storage backend
- file retention rules
- image/document size limits
- archival and cleanup rules

## Implementation Direction

Engineering and design can proceed immediately with the current baseline if they treat the three items above as open policy decisions rather than blockers for schema and interface design.

The main implementation posture should be:

1. build the system in a configurable way
2. keep membership plan, grace period, and event capacity admin-editable
3. model chapter and committee content as structured Payload data
4. avoid hard-coding assumptions that belong in admin configuration
