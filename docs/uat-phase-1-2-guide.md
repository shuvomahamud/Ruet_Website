# RUETIAN USA UAT Guide For Implemented Phases

Updated: 2026-07-13

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
- privacy, terms-of-use, and membership-terms templates with explicit approval status
- chapter directory search/region filtering, localized chapter modules, authenticated requests, and super-admin approval/rejection
- published history timelines with decade archives and committee current/history views with recaps
- automated email transport, template, deduplication, retry, audit, preference, and queue verification

## 2.2 Explicitly out of scope for this UAT

Do not mark these as failures in this round because they are not implemented yet:

- Stripe checkout, which has been superseded by the Zelle-only payment decision
- Zelle/manual payment workflow execution
- member dashboard
- event registration flow
- waitlist promotion logic execution
- membership purchase, renewal, or reactivation flow execution
- newsletters sending
- phase-specific membership/event status emails and newsletter campaigns, which use this foundation in later phases
- live Resend delivery until provider credentials and a verified sender are installed

The transaction primitives behind Zelle review are implemented and automated, but they do not make the public membership/event flows or the manual-review queue part of this manual UAT round. Their evidence is in [phase-1-security-workflow-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-1-security-workflow-verification.md).

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

Before manual UAT, the automated baseline should pass:

```bash
pnpm verify
pnpm test:e2e
```

The expected automated result after the remaining-roadmap Phase 5 gate is `36` integration tests and `20` browser tests passing.

For manual verification/reset delivery, configure the production-like email adapter when it becomes available in Phase 5 or use a test-only database token locally. Live Google UAT requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and an approved callback URL. Missing external credentials should be recorded as `Blocked`, not as missing application logic.

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

Expected result:

- footer link groups render
- newsletter summary area renders
- legal note and primary email render
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

## 6.4 Membership Plan

### UAT-MEM-01: Membership plan record can be created

Steps:

1. Open `Membership Plans`.
2. Create the sample plan.
3. Save it as active.

Expected result:

- record saves successfully
- fields for price, currency, active flag, and benefits are present

### UAT-MEM-02: Membership page reads the active plan

Steps:

1. Open `/membership`.
2. Compare the page with the active membership plan record.

Expected result:

- membership title appears
- price appears
- benefits list appears if entered
- homepage membership section also reflects the active plan

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

- fields exist for chapter, event mode, timezone, capacity, waitlist enabled, and pricing inputs
- record saves successfully

### UAT-EVT-02: Published event appears in public listing

Steps:

1. Publish the sample event.
2. Open `/events`.

Expected result:

- event appears in the public events listing
- event card shows title and descriptive text

### UAT-EVT-03: Event detail page renders

Steps:

1. Open the event detail page from `/events`.

Expected result:

- event title and summary render
- detail page shows start, end, timezone, capacity, and waitlist values

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

### UAT-ANN-01: Published announcement appears on homepage

Steps:

1. Create and publish the sample announcement.
2. Open `/`.

Expected result:

- announcement appears in the homepage announcement area
- CTA link appears if CTA fields were set

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

- each route shows its placeholder or approved status and last-updated date
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

## 6.13 Data-Model-Only Collections

These collections are implemented at schema/admin level but do not yet have complete public workflows.

### UAT-DAT-01: Admin can create records in operational collections

Test the ability to create at least one draft or placeholder record in:

- Memberships
- Event Registrations
- Waitlist Entries
- Orders
- Payments
- Promotions
- Newsletter Campaigns

Expected result:

- each collection opens
- form fields render
- records can be saved when required fields are provided

Note:

- successful record creation is the UAT target here
- end-to-end business workflow execution for these collections is not part of this round

### UAT-DAT-02: Email delivery audits are private and immutable

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

## 7. Suggested UAT Execution Order

Recommended order:

1. Environment and admin access
2. Globals and media
3. Desktop and mobile navigation
4. Institutional, contact, and legal pages
5. Learning search, filters, detail, and metadata
6. Membership plan
7. Chapters and chapter requests
8. History and committees
9. Events
10. Announcements
11. Users and role fields
12. Authentication and account lifecycle
13. Data-model-only collections

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
- the repo is ready to continue into remaining-roadmap Phase 6
