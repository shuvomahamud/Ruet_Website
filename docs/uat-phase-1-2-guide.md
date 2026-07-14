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

## 2.2 Explicitly out of scope for this UAT

Do not mark these as failures in this round because they are not implemented yet:

- Stripe checkout, which has been superseded by the Zelle-only payment decision
- Zelle/manual payment workflow execution
- public signup page
- public sign-in page
- forgot-password and reset-password UI
- Google sign-in
- member dashboard
- event registration flow
- waitlist promotion logic execution
- membership purchase, renewal, or reactivation flow execution
- newsletters sending
- system email delivery
- chapter request public form
- committee/history public pages beyond admin data entry
- SEO metadata behavior beyond saving the admin records

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

The expected automated result after the remaining-roadmap Phase 1 gate is `15` integration tests and `6` browser tests passing.

## 4. Important Visibility Rules

Many public pages will appear empty until admin content is created correctly.

Use these rules during UAT:

- `pages`, `posts`, `announcements`, `events`, `chapters`, `committeeTerms`, and `historyEntries` use draft/publish workflow
- for a record to appear publicly, it usually must be published
- for a chapter to appear publicly, it must also have `chapterStatus = active`
- for the membership page to show real pricing, at least one `membershipPlans` record must have `active = true`
- seeded `pages` records now exist for `about`, `membership`, `chapters`, `events`, `learning`, `contact`, `privacy-policy`, `terms-of-use`, and `membership-terms`
- if one of those pages is unpublished or deleted, the route should now return `not-found` instead of showing fallback placeholder copy

## 5. Recommended Sample Data For UAT

Create the following records first. This will make the public-site tests easier.

## 5.1 Globals

- `Site Settings`
  - organization name: `RUETIAN USA`
  - primary email: `info@ruetianusa.org`
  - utility message: `Professional alumni association platform`
- `Header`
  - confirm links for `About`, `Membership`, `Chapters`, `Events`, `Learning`, `Contact`
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

## 6.6 Events

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

## 6.7 Learning Content

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

## 6.8 Announcements

### UAT-ANN-01: Published announcement appears on homepage

Steps:

1. Create and publish the sample announcement.
2. Open `/`.

Expected result:

- announcement appears in the homepage announcement area
- CTA link appears if CTA fields were set

## 6.9 Standard Pages

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

## 6.10 Users And Role Data

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

Note:

- full public auth flows are not part of this UAT
- if you want to test restricted admin access with a second login, that is optional exploratory testing in this round, not a required pass/fail item

## 6.11 Data-Model-Only Collections

These collections are implemented at schema/admin level but do not yet have complete public workflows.

### UAT-DAT-01: Admin can create records in operational collections

Test the ability to create at least one draft or placeholder record in:

- Chapter Requests
- Memberships
- Event Registrations
- Waitlist Entries
- Orders
- Payments
- Promotions
- Committee Terms
- History Entries
- Newsletter Campaigns

Expected result:

- each collection opens
- form fields render
- records can be saved when required fields are provided

Note:

- successful record creation is the UAT target here
- end-to-end business workflow execution for these collections is not part of this round

## 7. Suggested UAT Execution Order

Recommended order:

1. Environment and admin access
2. Globals and media
3. Membership plan
4. Chapters
5. Events
6. Posts
7. Announcements
8. Standard pages
9. Users and role fields
10. Data-model-only collections

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
- the repo is ready to continue into the next feature phase
