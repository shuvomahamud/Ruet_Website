# RUETIAN USA UAT Guide For Implemented Phases

Updated: 2026-07-14

## 1. Purpose

This document is the user acceptance testing guide for the features that are already implemented in the current codebase.

It is intended to help the stakeholder or tester:

- validate what is working now
- avoid testing future-phase features that are not built yet
- prepare sample data correctly inside Payload admin
- record pass/fail results in a consistent way

This guide covers the implemented work from:

- Phase 0 recovery: pinned runtime, reproducible dependency installation, and automated smoke gates
- Phase 1: Payload schema, roles, access groundwork, and admin structure
- Phase 2: public site shell, homepage foundation, public content routes, and ASME-inspired shared UI
- Remaining-roadmap Phase 1: direct-API ownership/chapter isolation, private payment proofs, legal workflow primitives, and idempotent Zelle review (automated security verification only; public transaction UI remains later scope)
- Remaining-roadmap Phase 2: public local authentication, Google sign-in/linking, protected profile settings, and audited account anonymization
- Remaining-roadmap Phase 3: accessible desktop/mobile navigation, shared public components, institutional/contact pages, learning search/detail, legal templates, and metadata
- Remaining-roadmap Phase 4: searchable chapters, complete chapter detail modules, chapter requests and super-admin review, history archives, committee pages, and chapter isolation
- Remaining-roadmap Phase 5: captured/Resend email adapter, responsive templates, private delivery audits, preference rules, and queued/scheduled job infrastructure
- Remaining-roadmap Phase 6: annual membership overview, profile-gated join, Zelle proof/transaction submission, chapter-scoped approval, immutable resubmission, renewal, grace, expiration, reactivation, and membership notifications
- Remaining-roadmap Phase 7: event discovery and recaps, free/Zelle registration, transaction-safe capacity, waitlists, shared payment review, protected virtual access, and event notifications
- Remaining-roadmap Phase 8: public/member/chapter announcements, newsletter authoring/preview/schedule/cancel/send/retry/history, communication preferences, and the complete institutional footer
- Remaining-roadmap Phase 9: post-login member dashboard, filtered private payment/registration histories, and role/chapter-scoped operational reporting with summary CSV export
- Remaining-roadmap Phase 10 technical checkpoint: complete homepage modules, editorial review/approval/publish workflow, secure previews and versions, content revalidation, realistic UAT seed, admin usability, SEO, sitemap, and robots behavior; final stakeholder-approved launch content remains required before phase sign-off

## 2. UAT Scope

## 2.1 In scope for this UAT

- application startup and database-backed operation
- Payload admin access
- admin globals
- admin collections
- public header, footer, homepage, and shared public shell
- public pages for:
  - home
  - membership
  - chapters listing and chapter detail
  - events listing and event detail
  - learning listing and article detail
  - dynamic content pages such as `about` and `contact`
- basic role data structure and chapter-admin assignment fields
- media upload and content attachment
- database-backed content visibility rules for published vs draft records
- signup, verification/resend, login, logout, forgot/reset password, and protected-route behavior
- Google sign-in and safe account linking when Google credentials are configured
- profile, primary chapter, communication preferences, and account anonymization
- desktop mega-menus, mobile navigation drawer, keyboard focus behavior, and active navigation states
- About mission/vision/governance content, the Contact form, and private contact submissions
- learning search, category/content-type filters, pagination, rich content, related content, and metadata
- approved Privacy Policy, Terms of Use, and Membership Agreement with effective date, versioned payment terms, and explicit Zelle/no-refund acceptance
- chapter directory search/region filtering, localized chapter modules, authenticated requests, and super-admin approval/rejection
- published history timelines with decade archives and committee current/history views with recaps
- automated email transport, template, deduplication, retry, audit, preference, and queue verification
- single-plan membership configuration, promotions, member join/status/renew/reactivate routes, Zelle proof submission, chapter-first review, failed-attempt resubmission, and scheduled lifecycle behavior
- event catalog filtering, free and Zelle-paid registration, immutable registration/payment history, capacity and waitlist operations, protected virtual access, event recap galleries, and shared chapter-scoped payment review
- active-window and audience-aware organization/chapter announcements on home, chapter, and dedicated announcement surfaces
- newsletter preview, scheduling, cancellation, sending, preference suppression, delivery history, and failure visibility
- responsive footer navigation, contact, newsletter preference, social, and legal destinations
- member dashboard membership/chapter/action state, upcoming registrations, waitlist, announcements, and recent Zelle attempts
- private payment-attempt and event-registration filters, pagination, statuses, and ownership isolation
- admin/super-admin organization reports and chapter-admin managed-chapter reports for membership, renewal/reactivation, approved revenue, payments, events, waitlists, and promotions
- complete homepage modules and their populated/empty states
- editorial draft, in-review, approval, preview, publish, and revalidation behavior for all public content types
- public denial of drafts, review-only fields, and version history
- realistic idempotent seed coverage for all public modules and member dashboard histories
- SEO metadata, canonical routes, sitemap eligibility, and private-route robots exclusions

## 2.2 Explicitly out of scope for this UAT

Do not mark these as failures in this round because they are not implemented yet:

- Stripe checkout, which has been superseded by the Zelle-only payment decision
- live Resend delivery until provider credentials and a verified sender are installed
- final stakeholder-approved organization/chapter/committee/launch content and assets; use the UAT fixtures only to validate behavior, not to approve production copy

Membership and event Zelle execution now share one role-scoped review queue and are in scope. Evidence is in [phase-6-membership-zelle-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-6-membership-zelle-verification.md) and [phase-7-events-manual-review-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-7-events-manual-review-verification.md).

## 3. Tester Prerequisites

Before running UAT:

1. Select the pinned runtime and install dependencies:

```bash
nvm use
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

2. Ensure local PostgreSQL is running.
3. From the project root, run:

```bash
pnpm dev
```

4. Open:

- public site: `http://localhost:3000`
- admin panel: `http://localhost:3000/admin`

5. Sign in with the existing admin account.

For a complete, repeatable non-production dataset, seed the baseline and UAT fixtures before starting the content cases:

```bash
SEED_UAT_PASSWORD='use-a-unique-12-character-or-longer-test-password' pnpm seed:uat
```

Never reuse that password outside UAT or commit a real test password. The UAT seed refuses to run in production unless a separate explicit override is provided.

To populate only editable public CMS content without creating test accounts or transaction history, use:

```bash
pnpm seed:sample
pnpm audit:sample
```

This content-only dataset is already installed in the working database. See [sample-content-guide.md](/Users/shuvomahamud/Projects/RUET_Website/docs/sample-content-guide.md) for the Payload Admin locations and reset warning.

Before manual UAT, the automated baseline should pass:

```bash
pnpm verify
pnpm test:e2e
```

The expected automated result at the Phase 10 technical checkpoint is `60` integration tests and `36` browser tests passing.

For live verification/reset delivery, configure the production Resend adapter and verified sender; local/test capture remains available for safe non-production checks. Live Google UAT requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and an approved callback URL. Missing external credentials should be recorded as `Blocked`, not as missing application logic.

## 4. Important Visibility Rules

Many public pages will appear empty until admin content is created correctly.

Use these rules during UAT:

- `pages`, `posts`, `announcements`, `events`, `chapters`, `committeeTerms`, and `historyEntries` use draft/publish workflow
- for a record to appear publicly, it usually must be published
- for a chapter to appear publicly, it must also have `chapterStatus = active`
- for the membership page to show real pricing, at least one `membershipPlans` record must have `active = true`
- seeded `pages` records now exist for `about`, `membership`, `chapters`, `events`, `learning`, `contact`, `history`, `running-committee`, `advisory-committee`, `committee-history`, `privacy-policy`, `terms-of-use`, and `membership-terms`
- if one of those pages is unpublished or deleted, the route should now return `not-found` instead of showing fallback placeholder copy

## 5. Recommended Sample Data For UAT

Create the following records first. This will make the public-site tests easier.

## 5.1 Globals

- `Site Settings`
  - organization name: `RUETIAN USA`
  - primary email: `info@ruetianusa.org`
  - utility message: `Professional alumni association platform`
  - Zelle recipient name: an obvious UAT-only name
  - Zelle recipient: a stakeholder-approved UAT email or phone (never use a fake address for real payment)
  - Zelle instructions, review note, and no-refund notice: recognizable approved test wording
- `Header`
  - confirm top-level links for `About`, `Membership`, `Chapters`, `Events`, `Learning`, `Contact`
  - confirm child links and a featured panel for at least one mega-menu
- `Footer`
  - confirm at least four link groups
- `Home`
  - set hero title and CTA labels to something easy to recognize during testing

## 5.2 Membership plan

- title: `Annual Membership`
- annual price: `50`
- currency: `USD`
- active: `true`
- add 2 to 4 benefits
- add at least 2 FAQs
- enter the annual renewal policy and terms summary
- renewal reminders: enabled, `30` days before expiration
- grace period: `7` days

## 5.3 Chapter

- name: `New York Chapter`
- chapter status: `active`
- region or state: `New York`
- summary: any short summary
- description: any longer description
- publish the record

## 5.4 Event

- title: `RUETIAN USA Networking Evening`
- chapter: `New York Chapter`
- event mode: `hybrid`
- timezone: `America/New_York`
- start date: a future date
- end date: a future date after the start
- summary: any short summary
- details: any longer description
- publish the record

## 5.5 Post

- title: `Professional Development for Alumni`
- excerpt: short summary
- body: 2 to 3 paragraphs of text
- rich body: add at least one heading, paragraph, and link
- category: create and select a test category
- content type: `article`
- author and reading time: add recognizable test values
- SEO title and description: add recognizable test values
- publish the record

## 5.6 Announcement

- title: `Spring update`
- summary: short announcement summary
- audience: `public`
- tone: `info`
- publish the record

## 5.7 Standard page

- collection: `Pages`
- slug: `about`
- title: `About RUETIAN USA`
- hero title: clearly different from the currently seeded title
- add 2 content sections
- publish the record

## 5.8 Governance content

- create one published history entry with a recognizable date, image, document, and external link
- create current running and advisory committee terms with members, roles, bios, and one event recap
- add no more than six images to the recap gallery
- create one older published committee term for archive testing

## 6. UAT Test Cases

Use this status legend:

- `Pass`
- `Fail`
- `Blocked`
- `Not In Scope`

## 6.1 Environment And Startup

### UAT-ENV-01: App starts locally

Steps:

1. Run `pnpm dev`.
2. Confirm there is no fatal startup error.

Expected result:

- the app starts successfully
- local site is reachable on port `3000`

### UAT-ENV-02: Public and admin routes open

Steps:

1. Open `/`
2. Open `/admin`

Expected result:

- both routes load successfully
- admin login screen or authenticated admin view is shown

## 6.2 Admin Foundation

### UAT-ADM-01: Collections and globals exist in Payload

Steps:

1. Sign in to Payload admin.
2. Review the left navigation.

Expected result:

- collections visible:
  - Users
  - Media
  - Categories
  - Pages
  - Posts
  - Announcements
  - Chapters
  - Chapter Requests
  - Membership Plans
  - Memberships
  - Events
  - Event Registrations
  - Waitlist Entries
  - Orders
  - Payments
  - Promotions
  - Committee Terms
  - History Entries
  - Newsletter Campaigns
  - Contact Submissions
- globals visible:
  - Site Settings
  - Header
  - Footer
  - Home
  - Seo Defaults

### UAT-ADM-02: Globals save correctly

Steps:

1. Edit `Site Settings`, `Header`, `Footer`, and `Home`.
2. Save each one.

Expected result:

- save succeeds without server errors
- values remain after refresh

### UAT-ADM-03: Media upload works

Steps:

1. Open `Media`.
2. Upload an image.
3. Add optional caption and credit.
4. Save the record.

Expected result:

- file uploads successfully
- media record saves
- uploaded media becomes selectable in other collections

## 6.3 Public Shell

### UAT-PUB-01: Header renders with admin-driven navigation

Steps:

1. Open `/`.
2. Compare the header with the links configured in the `Header` global.

Expected result:

- utility and main navigation render
- primary CTA is visible
- changing header global data changes the public header after refresh

### UAT-PUB-02: Footer renders with admin-driven content

Steps:

1. Open `/`.
2. Scroll to the footer.
3. Compare the footer with the `Footer` global.
4. Repeat at a narrow mobile width.

Expected result:

- footer link groups render
- newsletter summary and `Manage newsletter preferences` action render
- legal notice, legal destinations, optional social links, and organization contact data render
- the newsletter action opens `/communications/preferences`
- privacy, website-terms, membership-terms, announcements, account-settings, contact, email, and optional phone links use their intended destinations
- the footer does not overflow or hide actions on mobile
- changing footer data updates the public footer after refresh

### UAT-PUB-03: Homepage loads with home-global content

Steps:

1. Open `/`.
2. Review the hero area and CTA buttons.

Expected result:

- homepage loads successfully
- hero title, description, and CTA labels reflect `Home` global values

### UAT-PUB-04: Desktop and mobile navigation are keyboard usable

Steps:

1. At desktop width, tab to a top-level menu and open it.
2. Press `Escape`.
3. At a narrow mobile width, open the navigation drawer.
4. Tab through the drawer and press `Escape`.

Expected result:

- the desktop panel exposes its child and featured links
- `Escape` closes each menu and restores focus to its trigger
- keyboard focus remains within the open mobile drawer
- the membership CTA is visible in both layouts

## 6.4 Membership And Zelle

### UAT-MEM-01: One active membership plan is editable

Steps:

1. Open `Membership Plans`.
2. Edit the existing active sample plan, or create it if none exists.
3. Save it as active and try to activate a second plan.

Expected result:

- record saves successfully
- fields for price, currency, active flag, benefits, FAQs, reminder timing, grace days, renewal policy, and terms are present
- a second active plan is rejected; inactive historical/configuration records remain allowed

### UAT-MEM-02: Membership page reads the active plan

Steps:

1. Open `/membership`.
2. Compare the page with the active membership plan record.

Expected result:

- membership title appears
- price appears
- benefits list appears if entered
- FAQs and policy/terms content appear if entered
- join, renew/reactivate, and status calls to action appear
- homepage membership section also reflects the active plan

### UAT-MEM-03: Join requires authentication and a complete profile

Steps:

1. Open `/membership/join` while signed out.
2. Sign in with an account whose profile is incomplete and return to the join route.
3. Complete all required alumni fields, accept the required terms/privacy fields, choose an active primary chapter, and return.

Expected result:

- signed-out access redirects to login with a safe return path
- incomplete profiles see a clear account-settings action and no checkout form
- a complete profile with an active primary chapter can reach the Zelle step

### UAT-MEM-04: Promotion and total are server authoritative

Steps:

1. Create one active membership-scoped promotion in Payload.
2. On `/membership/join`, apply the code in lowercase or mixed case.
3. Compare subtotal, discount, and total with the configured plan and promotion.
4. Try an expired, inactive, wrong-scope, member-only-ineligible, or exhausted code.

Expected result:

- one valid code is normalized and applied
- the displayed and stored totals match the server calculation
- an ineligible code is rejected without creating membership, order, or payment data

### UAT-MEM-05: Submit each permitted Zelle evidence combination

Steps:

1. Configure the UAT Zelle recipient in Site Settings.
2. Complete three isolated checkouts: transaction ID only, screenshot/PDF only, and both.
3. Before each submission, explicitly accept the linked Membership Agreement, Zelle terms, and no-refund policy.
4. Send a direct request without acceptance, then try once with neither evidence field and once with an unsupported/oversized file.

Expected result:

- all three permitted combinations create a pending membership, immutable order, and pending payment attempt
- missing acceptance or missing/invalid evidence is rejected by the server
- each accepted attempt stores policy version `2026-07-14` and a server acceptance timestamp
- the member does not become active before approval
- payer and assigned chapter reviewer receive one queued required notice per submission

### UAT-MEM-06: Assigned chapter reviewer approves payment

Steps:

1. Assign a chapter admin to the payer's primary chapter.
2. Sign in as that chapter admin and open `/membership/payments/review`.
3. Confirm the exact amount and evidence, then approve.
4. Sign back in as the member and open `/membership/status`.

Expected result:

- the assigned reviewer sees the attempt; a chapter admin for another chapter does not
- approval records reviewer metadata, pays the order, and activates the membership once
- start/expiration dates are recorded from authorized approval rules
- the member receives one approval notice and sees the immutable history

### UAT-MEM-07: Rejection preserves history and permits resubmission

Steps:

1. Reject a pending payment with a reason.
2. Sign in as the payer and review `/membership/status`.
3. Open `/membership/renew`, submit a new transaction ID or proof, and review status again.

Expected result:

- the first attempt remains failed with its reason and reviewer metadata
- the membership is not active after rejection
- resubmission creates a new pending payment attempt against the existing order
- the member receives one rejection/action-needed notice

### UAT-MEM-08: Renewal, grace, expiration, and reactivation use manual Zelle

Steps:

1. Use controlled test dates or the automated lifecycle test to place a membership near expiration, then in grace and expired states.
2. Renew an active or grace-period membership through `/membership/renew` and approve it.
3. Reactivate an expired membership through the same route and approve it.

Expected result:

- reminder jobs are deduplicated before expiration and during grace
- configured grace days determine the transition to expired
- grace renewal closes the old term and creates one active linked annual term
- expired membership offers pay-to-reactivate and preserves the old history
- every term requires a new Zelle proof; there is no automatic debit

### UAT-MEM-09: Admin records and configuration remain usable

Steps:

1. Filter Memberships by pending, active, grace, expired, and failed states.
2. Filter Payments by pending/failed and membership order type.
3. Inspect Orders, Promotions, reviewer metadata, snapshots, and attempts.
4. Change plan price and grace days, then create a later checkout without editing code.

Expected result:

- authorized admins can inspect all required records and chapter admins remain scoped
- earlier membership/order/payment snapshots do not change
- the next checkout uses the newly configured price and grace value

## 6.5 Chapters

### UAT-CH-01: Active published chapter appears publicly

Steps:

1. Create the sample chapter.
2. Make sure it is published.
3. Set `chapterStatus` to `active`.
4. Open `/chapters`.

Expected result:

- chapter appears in the chapter listing
- chapter card links to its detail page

### UAT-CH-02: Chapter detail page renders saved content

Steps:

1. Open the chapter detail page from `/chapters`.

Expected result:

- chapter name renders
- summary or description renders
- operational status section shows the saved `chapterStatus`
- contact email appears if provided

### UAT-CH-03: Non-active or non-published chapter stays hidden

Steps:

1. Create another chapter.
2. Either leave it in draft or set `chapterStatus` to `inactive`.
3. Open `/chapters`.

Expected result:

- inactive or draft chapter does not appear in the public list

### UAT-CH-04: Search and region filters narrow the directory

Steps:

1. Create active published chapters in at least two regions.
2. Open `/chapters` and search for one chapter by name.
3. Clear the search and select one region.

Expected result:

- the name search returns only matching active chapters
- the region filter returns only chapters in that region
- filter values remain visible in the URL and controls

### UAT-CH-05: Chapter detail modules remain chapter-local

Steps:

1. Add a public announcement, future event, gallery image, and current local committee to `New York Chapter`.
2. Add different content to a second active chapter.
3. Open both chapter detail pages.

Expected result:

- each page shows its own overview/contact, leadership, announcements, events, gallery, and local committee content
- content belonging to the other chapter does not leak into either page

### UAT-CH-06: Member requests a chapter and super admin reviews it

Steps:

1. Sign in as a verified member and open `/chapters/request`.
2. Submit a unique chapter name, region, and motivation.
3. Confirm the pending request appears on the same page.
4. Sign in as a super admin and open `/chapter-requests/review`.
5. Approve the request.

Expected result:

- anonymous users are redirected to sign in
- duplicate pending requests for the same name are rejected
- only a super admin can access the review page/API
- approval marks the request approved and creates exactly one active published chapter linked to it
- repeating the same approval does not create another chapter

## 6.6 History And Committees

### UAT-GOV-01: Published history renders in archive order

Steps:

1. Open `/history` with published entries spanning at least two decades.
2. Select a decade archive filter.
3. Open the entry's image, document, and external link.

Expected result:

- published entries follow their configured date/order
- the decade filter narrows results and remains in the URL
- media, document, and external links work
- draft history entries remain hidden

### UAT-GOV-02: Current and historical committees share one content model

Steps:

1. Open `/committees/running` and `/committees/advisory`.
2. Open `/committees/current`.
3. Open `/committees/history` and filter by committee type.

Expected result:

- current running and advisory terms show the correct members, roles, photos, and bios
- current view combines the active committee types
- history exposes older terms and filters correctly
- recap summaries, dates, and galleries render, with at most six photos per recap

## 6.7 Events

### UAT-EVT-01: Event record can be created with required operational fields

Steps:

1. Open `Events`.
2. Create the sample event.

Expected result:

- fields exist for chapter, event mode, timezone, capacity, waitlist enabled, configurable offer hours, pricing, registration dates, recap, and gallery inputs
- record saves successfully
- gallery media cannot be assigned before the event has ended

### UAT-EVT-02: Published event appears in public listing

Steps:

1. Publish the sample event.
2. Open `/events`.

Expected result:

- event appears in the public events listing
- event card shows title, schedule/timezone, chapter, mode, price, and capacity state
- date, chapter, mode, price, upcoming/archive, and availability filters return the expected published events
- draft events remain hidden

### UAT-EVT-03: Event detail page renders

Steps:

1. Open the event detail page from `/events`.

Expected result:

- event title and summary render
- detail page shows start, end, timezone, venue/mode, authoritative price, capacity, remaining seats, and the correct register/waitlist state
- a private virtual link is hidden from anonymous and unconfirmed users
- an authorized manager or confirmed registrant can see that private link

### UAT-EVT-04: Free registration confirms without overbooking

Steps:

1. Sign in as a complete-profile member and open a free event with available capacity.
2. Register for a quantity within the remaining capacity.
3. Open `/events/registrations`.
4. In a second browser session, attempt concurrent registrations that together exceed the remaining capacity.

Expected result:

- the first registration is confirmed immediately and has immutable event/date/chapter/price snapshots
- history shows the confirmed state and quantity
- concurrent requests never confirm more seats than capacity; the losing eligible request is offered the waitlist path
- exactly one confirmation notice is queued for a successful registration

### UAT-EVT-05: Paid Zelle registration and shared review

Steps:

1. Open a paid event, accept the linked Zelle/no-refund terms, and submit a transaction ID, proof image, or both.
2. Open `/payments/review` as the event's chapter admin.
3. Filter to `Event` and `Pending`, inspect the proof, and approve it.
4. Repeat with a different registration and reject it with a reason.

Expected result:

- a pending registration, order, and immutable payment attempt are created with server-calculated totals
- direct submission without payment-term acceptance is rejected; accepted attempts store policy version `2026-07-14` and a server timestamp
- pending quantity reserves capacity
- the event chapter admin sees the proof; an unrelated chapter admin does not
- approval confirms the registration without overbooking and queues one approval notice
- rejection fails the attempt, releases capacity, preserves the attempt, and queues one rejection notice

### UAT-EVT-06: Rejected payment can be resubmitted

Steps:

1. Sign in as the owner of a rejected paid registration.
2. Submit new Zelle evidence from the event detail page.
3. Inspect both payment records as an authorized reviewer.

Expected result:

- a new pending payment attempt is created
- the failed attempt and its evidence/reviewer metadata remain unchanged
- the registration returns to pending payment and reserves capacity

### UAT-EVT-07: Quantity-aware waitlist, cancellation, and expiry

Steps:

1. Fill an event, then join its waitlist with groups of different quantities.
2. Cancel a confirmed/pending registration from `/events/registrations/manage` as an authorized manager.
3. Verify that the earliest waiting group that fits is promoted even when an earlier oversized group does not fit.
4. Accept one offer from the public event page.
5. Allow another offer to pass its configured expiry and run `pnpm jobs:run`.

Expected result:

- an unexpired offer reserves its group quantity and cannot cause overbooking
- accepting the offer creates the correct free-confirmed or paid-pending state
- expiry returns the stale offer to expired, releases capacity, and considers the next earliest-fitting group
- promotion and expiry messages are each queued once
- cancellation does not perform or promise an automated refund

### UAT-EVT-08: Completed event archive and gallery

Steps:

1. Configure a completed event with a recap summary and same-chapter public gallery media.
2. Open `/events?period=archive` and then the event detail page.

Expected result:

- the event remains discoverable in the archive
- its recap and gallery render publicly
- future events cannot use post-event galleries and cross-chapter/private media is rejected

## 6.8 Learning Content

### UAT-LRN-01: Published post appears in public learning list

Steps:

1. Create and publish the sample post.
2. Open `/learning`.

Expected result:

- post appears in the list
- title and excerpt are visible

### UAT-LRN-02: Learning detail page renders post content

Steps:

1. Open the article detail page from `/learning`.

Expected result:

- post title renders
- excerpt renders in the hero
- body content renders in the article section
- rich content is preferred when present
- author, publication date, reading time, and category render when configured
- related published content from the same category appears when available
- the browser title and description use the post SEO values

### UAT-LRN-03: Learning search and filters preserve public visibility rules

Steps:

1. Create two published posts and one draft post with distinguishable titles.
2. Assign a category and different content types to the published posts.
3. Search for one published title, then filter by category and content type.

Expected result:

- search and filters update the URL and results
- only matching published posts appear
- draft posts never appear
- clearing filters restores the full published list

## 6.9 Announcements

### UAT-ANN-01: Public announcement obeys its active window

Steps:

1. Create and publish a site-wide `Public` announcement with an active-from time in the past and active-to time in the future.
2. Open `/` and `/announcements` while signed out.
3. Move its active-from time into the future and refresh both routes.

Expected result:

- the active announcement appears in the homepage announcement area and dedicated listing
- CTA link appears if CTA fields were set
- the future announcement disappears from both public surfaces
- draft and expired announcements are also absent

### UAT-ANN-02: Member and chapter targeting is enforced

Steps:

1. Create one site-wide `Members` announcement and one `Members` announcement for Chapter A.
2. Create a second member announcement for Chapter B.
3. Open `/announcements` signed out, signed in as a Chapter A member, and signed in as a Chapter B member.
4. Open both public chapter detail pages with each account.

Expected result:

- signed-out visitors see none of the member announcements
- both members see the site-wide member announcement
- each member sees only the member announcement for their primary chapter
- chapter pages combine active site-wide notices with only the appropriate local notices

### UAT-ANN-03: Chapter admin authoring is isolated

Steps:

1. Sign in to Payload as a chapter admin assigned only to Chapter A.
2. Create and publish a Chapter A announcement.
3. Try to create a site-wide announcement or assign it to Chapter B.

Expected result:

- the Chapter A record can be managed
- site-wide and Chapter B authoring are rejected server-side
- unsafe CTA schemes and an active-to time before active-from are rejected

## 6.10 Standard Pages

### UAT-PAG-01: Published page renders from CMS

Steps:

1. Open the existing `Pages` record with slug `about`.
2. Edit the hero title or section copy.
3. Save and publish the record.
4. Open `/about`.

Expected result:

- the page uses the saved CMS content
- the updated hero or section content appears publicly after refresh

### UAT-PAG-02: Unknown slug returns not-found page

Steps:

1. Open a route for a slug that does not exist in the `Pages` collection.

Expected result:

- the custom not-found page appears

### UAT-PAG-03: Contact form stores a protected submission

Steps:

1. Open `/contact` and submit valid name, email, topic, subject, and a message of at least 20 characters.
2. Sign in as an admin and open `Contact Submissions`.

Expected result:

- the public form shows a success message
- the submission is stored with status `new`
- the collection is not publicly readable
- public input cannot set internal notes, review status, or a trusted submission time

### UAT-PAG-04: Legal templates expose approval state and navigation

Steps:

1. Open `/privacy-policy`, `/terms-of-use`, and `/membership-terms`.
2. Edit one legal page in Payload, change a section, and republish it.

Expected result:

- each route shows `Approved policy`, the July 14, 2026 effective/last-updated date, and no approval-placeholder language
- long pages show an on-page table of contents linked to section anchors
- published CMS edits appear without a code or layout change

## 6.11 Users And Role Data

### UAT-USR-01: User record can be created in admin

Steps:

1. Open `Users`.
2. Create a new user with email and password.
3. Assign role and account status.

Expected result:

- user record saves successfully
- role and account status fields are present
- chapter relationship fields are present

### UAT-USR-02: Chapter-admin assignment fields exist

Steps:

1. Edit a user intended to be a chapter admin.
2. Assign `role = chapterAdmin`.
3. Assign one or more managed chapters.

Expected result:

- role can be set
- managed chapters field is available
- primary chapter field is available

### UAT-USR-03: Suspended user loses account access

Steps:

1. Sign in with a verified test member.
2. In a separate admin session, set that user's account status to `suspended`.
3. Sign out and try to sign in again.

Expected result:

- login is rejected without exposing sensitive account-state details
- protected account routes redirect to sign in

## 6.12 Authentication And Account Lifecycle

### UAT-AUTH-01: Local signup and email verification

Steps:

1. Ensure at least one active, published chapter exists.
2. Open `/signup` and submit all required fields, consent checkboxes, a 12+ character mixed-case password, and a primary chapter.
3. Open the verification link delivered to the test address.
4. Sign in at `/login`.

Expected result:

- signup creates a standard `member`, never an elevated role
- signup records the server-side Terms and Privacy acknowledgement timestamps and policy version `2026-07-14`
- password login is blocked before verification
- the verification link activates password sign-in
- successful login opens `/account/settings`

### UAT-AUTH-02: Recovery does not enumerate accounts

Steps:

1. Open `/forgot-password` and submit a registered address.
2. Repeat with an unregistered address.
3. Use the registered account's reset link to set a strong password.

Expected result:

- both requests show the same generic public response
- weak replacement passwords are rejected
- the new strong password works and the old password no longer works

### UAT-AUTH-03: Profile fields and chapter change

Steps:

1. Sign in and open `/account/settings`.
2. Change allowed profile fields, communication preferences, and the primary chapter.
3. Save and reload.

Expected result:

- allowed values persist
- email, role, account status, managed chapters, Google subject, and audit fields are not editable
- only an active, published chapter can be selected

### UAT-AUTH-04: Google sign-in and explicit linking

Prerequisite: Google OAuth credentials and the exact environment callback URL are configured.

Steps:

1. Sign up with a new Google identity.
2. Sign out and sign in again with that identity.
3. For a separate password account, try Google with the same email while signed out.
4. Sign in with the password and use `Link Google account` in settings.

Expected result:

- a new Google identity creates one standard member account
- returning Google sign-in reuses that account
- the duplicate password email is not auto-linked while signed out
- explicit linking succeeds only with the same verified email

### UAT-AUTH-05: Account anonymization

Steps:

1. Use a disposable verified member that has a related test order/payment.
2. Open account settings and type `DELETE MY ACCOUNT`.
3. Enter the current password if requested and confirm.
4. Try to sign in again and inspect the related records as an authorized admin.

Expected result:

- the member loses access immediately
- personal/authentication fields are anonymized and sessions are revoked
- related financial records retain the stable user relationship
- an `account.anonymized` audit entry exists
- direct hard deletion is not available to the member

## 6.13 Newsletter Campaigns And Preferences

### UAT-COM-01: Admin previews, schedules, and cancels a campaign

Steps:

1. As an admin, create a draft `Newsletter Campaign` with a unique title, subject, body, and audience.
2. Open `/communications/newsletters` and select `Preview email`.
3. Confirm the HTML and plain-text content, then schedule the campaign for a future time.
4. Reschedule it once, then cancel the schedule.

Expected result:

- the preview uses the saved subject/body and does not execute embedded content
- the card changes from `draft` to `scheduled`, shows the chosen time, and supports rescheduling
- cancellation changes it to `cancelled`
- direct editing of campaign content after leaving draft is denied
- schedule/cancel actions are recorded in audit history

### UAT-COM-02: Due campaign selects recipients and sends once

Steps:

1. Prepare verified active accounts that are opted in and opted out of newsletters.
2. For a `members` campaign, ensure only intended users have active or grace-period memberships.
3. Schedule a campaign for the next scheduler run or choose `Send now`.
4. Run `pnpm jobs:run` if no worker is active.
5. Refresh `/communications/newsletters` and inspect `Email Deliveries`.
6. Repeat the send action or lifecycle execution.

Expected result:

- the campaign reaches `sent` after recipient deliveries are queued/suppressed
- only the selected audience receives campaign-linked delivery records
- opted-in recipients are queued and opted-out recipients are `suppressed` with no job
- selected, queued, suppressed, failed, and live delivery counts are visible
- the repeated action does not create a second delivery for any user

### UAT-COM-03: User manages newsletter preferences

Steps:

1. Follow `Manage newsletter preferences` from the footer while signed out.
2. Sign in to a verified account and return to `/communications/preferences`.
3. Disable `Scheduled newsletters`, save, and refresh.

Expected result:

- a signed-out visitor receives sign-in and create-account actions rather than an unverified email form
- the authenticated preference saves and remains disabled after refresh
- future campaign dispatch records a suppression and does not queue that user's newsletter
- required security/payment/registration emails remain unaffected

## 6.14 Delivery Audits

### UAT-COM-04: Email delivery audits are private and immutable

Steps:

1. Run the automated Phase 5 email/job test or queue a test delivery through application code.
2. Sign in as an admin and open `Email Deliveries`.
3. Inspect the delivery and try to create, edit, or delete an audit record through normal collection access.
4. Try to read the collection as a standard member.

Expected result:

- admins can inspect recipient, category, required flag, queue, attempts, status, provider ID, and sanitized error fields
- email bodies and credentials are not stored in the audit
- normal create, update, and delete operations are denied
- standard members cannot read delivery audits

## 6.15 Member Dashboard, Histories, And Reports

### UAT-ACC-01: Login opens the complete member dashboard

Steps:

1. Sign in as a standard member with a primary chapter, membership record, registration, and Zelle attempt.
2. Confirm the destination is `/dashboard`.
3. Inspect membership, chapter, upcoming events, waitlist, payments, and announcements.
4. Follow the membership action and each account-navigation destination.

Expected result:

- the dashboard shows only the signed-in member's records
- the membership action matches join, renew, reactivate, resubmit, or pending state
- chapter, event, payment, announcement, and account links work

### UAT-ACC-02: Payment and registration histories filter and paginate

Steps:

1. Open `/account/payments` and filter by purpose, Zelle status, and submitted date.
2. Create enough UAT attempts to verify a second page, then use Previous/Next.
3. Open `/events/registrations` and filter by status and upcoming/past timing.
4. Inspect a rejected attempt and its replacement submission.

Expected result:

- filters narrow the correct immutable attempts/registrations and reset cleanly
- pagination retains active filters
- human-readable pending, approved/confirmed, and failed states and rejection reasons are clear
- no record owned by a different test member is shown

### UAT-RPT-01: Organization report reconciles selected source records

Steps:

1. Sign in as an admin or super admin and open `/reports`.
2. Select a UAT chapter and a date range containing the sample records.
3. Compare membership statuses and term outcomes to Memberships.
4. Compare approved revenue to approved Payments only; compare events, capacity, waitlist, and promotions to their source records.
5. Export the summary CSV.

Expected result:

- membership, failed-renewal, approval, registration, waitlist, promotion, and revenue totals reconcile
- pending or failed payments are not counted as approved revenue
- the CSV contains summary metrics without member names, emails, transaction IDs, or proof links

### UAT-RPT-02: Chapter scope cannot be broadened

Steps:

1. Sign in as a chapter administrator assigned to exactly one UAT chapter.
2. Open `/reports` and confirm only the managed chapter is selectable and represented.
3. Directly request `/api/reports?chapter=<unmanaged-id>` and `/api/reports/export?chapter=<unmanaged-id>`.
4. Sign in as a standard member and request `/api/reports`.

Expected result:

- managed-chapter totals are visible
- unmanaged chapter requests return `403`
- standard-member report requests return `403`

## 6.16 Homepage, Editorial Workflow, And Content Readiness

### UAT-CMS-01: Homepage renders every managed module

Steps:

1. Run the baseline and UAT seeds on a non-production database.
2. Open `/` in a signed-out browser.
3. Inspect the hero/network panel, credibility metrics, announcements, membership, featured events, chapter spotlight, history, current committee, and learning sections.
4. Open the linked chapter, event, history, committee, learning, and membership destinations.

Expected result:

- every module renders realistic published data or a deliberate empty state
- credibility totals include only eligible published/active/upcoming records
- no developer-handoff or foundation-stage wording is visible
- module links open the correct canonical public destinations

### UAT-CMS-02: Chapter editor submits and an administrator publishes

Steps:

1. Sign in to Payload as a chapter administrator and edit content belonging to an assigned chapter.
2. Keep Payload document status as `Draft`, set Editorial status to `Draft`, and save.
3. Change Editorial status to `In review` and save the draft.
4. Confirm the chapter administrator cannot set `Approved` or publish.
5. Sign in as an administrator, use Preview, add an optional review note, set Editorial status to `Approved`, save, and publish.
6. Open the public destination in a signed-out browser.

Expected result:

- the editor can work only inside an assigned chapter and cannot self-approve
- preview requires an authorized account and shows the selected draft
- publishing is rejected until an authorized reviewer approves the record
- the approved publication appears publicly after publish without a server restart

### UAT-CMS-03: Drafts and versions never leak publicly

Steps:

1. Save an obvious unpublished change to each public collection type and to a versioned public global.
2. While signed out, request its normal route and corresponding Payload API with `draft=true`.
3. While signed out, request collection and global version endpoints.
4. Publish one approved change and reload the normal public route.

Expected result:

- signed-out visitors see only the last published collection/global value
- draft and version requests are denied and review-only fields are absent
- the approved published change appears after revalidation

### UAT-CMS-04: SEO, sitemap, and robots expose only public content

Steps:

1. Set an SEO title, description, canonical URL, social image, and indexing preference on representative public records.
2. Open the public pages and inspect their document metadata.
3. Open `/sitemap.xml` and `/robots.txt`.
4. Compare the sitemap to published, indexable content and inspect the robots exclusions.

Expected result:

- representative pages expose their configured canonical and social metadata
- drafts, `noIndex` records, admin, preview, account, dashboard, and report routes are not promoted as public search destinations
- eligible published pages, posts, chapters, and events use canonical public URLs

## 7. Suggested UAT Execution Order

Recommended order:

1. Environment and admin access
2. Globals and media
3. Desktop and mobile navigation
4. Institutional, contact, and legal pages
5. Learning search, filters, detail, and metadata
6. Membership plan, join, Zelle review, renewal, and lifecycle
7. Chapters and chapter requests
8. History and committees
9. Events
10. Announcements
11. Newsletter campaigns and communication preferences
12. Footer contact/legal destinations
13. Users and role fields
14. Authentication and account lifecycle
15. Delivery audits
16. Member dashboard and account histories
17. Admin and chapter-admin reporting reconciliation/export
18. Homepage modules, editorial submission/review/publish, preview security, SEO, sitemap, and robots

## 8. Defect Logging Template

Use this format for every issue found:

- `Test Case ID`:
- `Title`:
- `Severity`: Critical / High / Medium / Low
- `Environment`: local
- `Precondition`:
- `Steps to reproduce`:
- `Expected result`:
- `Actual result`:
- `Screenshot or screen recording`:
- `Notes`:

## 9. UAT Sign-Off Template

- `Date tested`:
- `Tester name`:
- `Build or branch reference`:
- `Passed test cases`:
- `Failed test cases`:
- `Blocked test cases`:
- `Out-of-scope items observed`:
- `Decision`: Approve / Approve with issues / Reject for now

## 10. Summary

This UAT round should confirm that:

- the application foundation is stable
- the Payload data model is present and usable
- the public shell is connected to admin-managed content
- the currently implemented public routes render real data correctly
- the public account lifecycle is safe and usable
- Phase 3 navigation, shared components, contact, learning, legal, metadata, responsive, and keyboard behavior meet their acceptance criteria
- Phase 4 chapters, chapter requests/review, chapter isolation, history, and committees meet their acceptance criteria
- Phase 5 email transport, templates, capture, preference enforcement, delivery audit, deduplication, retry, and job queues meet their acceptance criteria
- Phase 6 membership plan, profile gating, promotion, Zelle evidence, chapter review, status history, resubmission, renewal, grace, expiration, reactivation, and notifications meet their acceptance criteria
- Phase 7 event discovery, registration, capacity, Zelle review, rejection/resubmission, waitlist, protected access, recap/archive, and notification behavior meet their acceptance criteria
- Phase 8 announcement targeting/windows, newsletter workflow/preferences/history, and complete responsive footer meet their acceptance criteria
- Phase 9 member dashboard, private histories, reconciled operational reports, and role/chapter scope meet their acceptance criteria
- Phase 10 homepage, editorial workflow, draft/version isolation, realistic seeding, admin usability, SEO, sitemap, and robots behavior meet their technical acceptance criteria
- approved organization-specific launch content/assets are installed before Phase 10 receives sign-off and Phase 11 begins; the stakeholder-authorized standard legal text is already approved and installed
