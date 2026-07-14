# RUETIAN USA Website GUI / UX Design Specification

Updated: 2026-07-13

## 1. Design Intent

The RUETIAN USA website should feel like a credible professional association platform, not a generic school portal and not a lightweight community blog.

The client direction is clear:

- take strong structural and visual inspiration from `asme.org`
- use the RUETIAN USA logo as the local brand anchor
- keep the website chapter-centered, event-driven, and membership-focused

This specification assumes inspiration, not direct duplication. No external scraping or visual copying is required to proceed with design.

## 1.1 Current Implementation Alignment

Current implementation details that now affect design ownership:

- the header logo is loaded from [public/brand](/Users/shuvomahamud/Projects/RUET_Website/public/brand)
- the visible route copy for `about`, `membership`, `chapters`, `events`, `learning`, `contact`, and approved legal-policy pages is owned by Payload CMS page records
- design changes to those pages should therefore assume CMS-managed heroes and section blocks rather than route-level hardcoded copy
- structured desktop mega-menus, the focus-contained mobile drawer, and active navigation states now implement the shared header behavior
- institutional, contact, learning, and legal compositions now use the shared cards, rails, filters, pagination, badges, CTA, stats, gallery, timeline, loading, empty, and error patterns
- Phase 3 browser checks cover keyboard focus restoration and narrow-screen overflow on the main public routes

## 2. Experience Goals

The interface should communicate these points immediately:

1. RUET alumni in the USA are organized, credible, and active.
2. Membership is valuable and easy to understand.
3. Chapters and events are the living center of the organization.
4. RUET history and committee continuity are part of the institution's identity.

## 3. Visual Direction

### 3.1 Brand posture

The site should feel:

- professional
- institutional
- energetic
- community-oriented
- trustworthy enough for payments and approvals

### 3.2 Color direction

Use the attached logo as the palette reference, but apply it with restraint so the site does not become visually noisy.

Recommended working palette:

- `Association Navy` for header, footer, and core navigation
- `RUET Blue` for links, active states, and primary highlights
- `Signal Red` for urgent badges and selected CTA accents
- `Bangladesh Green` for community, chapter, and success accents
- `Engineering Gold` for timeline markers, committee accents, and section details
- `Warm White` and `Stone` for large backgrounds

Design rule:

- navy and white should dominate
- red and green should be used intentionally, not everywhere
- gold should act as a supporting accent rather than a primary brand color

### 3.3 Typography

Use a type system that feels technical and editorial, not startup-generic.

Recommended direction:

- primary UI and headings: `IBM Plex Sans`
- long-form editorial accents and timeline quotes: `Source Serif 4`

This pairing supports engineering credibility while giving history and long-form content a more archival feel.

### 3.4 Imagery and graphic language

Use:

- chapter and event photography
- structured grids and editorial spacing
- subtle engineering-inspired lines, diagrams, or geometric dividers
- timeline markers and milestone cards for history content

Avoid:

- overly playful illustrations
- generic university stock photography everywhere
- heavy gradient overload

## 4. Information Architecture

The accepted phase-1 sitemap is:

### 4.1 Public pages

- Home
- About RUETIAN USA
- Mission / Overview
- RUET History Timeline
- Current Running Committee
- Current Advisory Committee
- Committee History
- Membership Overview
- Join Membership
- Renew / Reactivate Membership
- Chapters Directory
- Chapter Detail
- Request a Chapter
- Events Listing
- Event Detail
- Event Archive / Recap
- Learning and Development Listing
- Article Detail
- Contact
- Privacy Policy
- Terms of Use
- Membership Terms

### 4.2 Authentication pages

- Sign Up
- Sign In
- Forgot Password
- Reset Password
- Verify Email

### 4.3 Member account pages

- Member Dashboard
- Profile and Account Settings
- Membership Status
- Payment History
- Event Registrations
- Communication Preferences
- Delete Account

### 4.4 Admin surface

- Payload admin for content, membership, chapters, approvals, events, newsletters, and reporting

## 5. Global UX Rules

### 5.1 Header

Desktop header should have two layers:

- utility row with chapter link, contact, sign in, and membership CTA
- main navigation with About, Membership, Chapters, Events, Learning, Contact

Mobile header should keep:

- logo
- menu trigger
- sign in
- visible membership CTA

### 5.2 Footer

The footer should be dense and practical.

It should include:

- major navigation links
- chapter directory shortcut
- membership links
- events shortcut
- learning shortcut
- contact details
- newsletter signup
- legal links
- social links

### 5.3 Search

Global search should support:

- posts
- chapters
- events
- public pages

### 5.4 Repeated calls to action

Persistent CTAs should include:

- Join Membership
- Find Your Chapter
- View Events
- Read Latest News

## 6. Core Page Specifications

## 6.1 Home Page

### Goal

Establish credibility fast and route users toward membership, chapters, and events.

### Recommended sections

1. Hero with strong organizational headline and two CTAs:
   - `Join Membership`
   - `Explore Chapters`
2. Key metrics strip:
   - members
   - chapters
   - upcoming events
   - years of community
3. Featured upcoming events
4. Membership value block
5. Chapter spotlight grid
6. RUET history preview
7. Leadership / committee preview
8. Latest learning and development content
9. Announcement or campaign banner

## 6.2 About RUETIAN USA

This page should explain:

- who RUETIAN USA is
- mission
- chapter network
- why membership matters
- how the association is organized

The layout should feel editorial and institutional, not text-dump heavy.

## 6.3 RUET History Timeline

This page is a structured timeline, not a long unbroken article.

Each timeline entry should support:

- date or year
- title
- short summary
- extended narrative
- images
- documents
- external links

The page should support incremental future additions without redesign.

## 6.4 Committee Pages

Required pages:

- Current Running Committee
- Current Advisory Committee
- Committee History

The same layout pattern can be reused across advisory and running committees.

Each term view should show:

- term title
- start and end dates
- committee members with role
- optional photo and short bio
- committee-event recap list

Each committee-event recap should support:

- event title
- event summary
- up to 6 photos

## 6.5 Membership Overview

This page should feel like a professional-association membership page.

Recommended sections:

- why join
- single membership plan card
- member benefits
- renewal and reactivation summary
- pricing note
- FAQ
- CTA block

The launch plan should display the placeholder price clearly, but the content must be admin-editable.

## 6.6 Join Membership

This flow should be direct and conversion-focused.

Recommended steps:

1. review membership plan
2. create account or sign in
3. complete profile details
4. review Zelle payment instructions
5. apply one promo code if eligible
6. review and submit
7. see confirmation or pending-approval state

### Signup fields

The sign-up form should capture:

- first name
- last name
- email
- password for local auth
- phone number optional
- RUET department / program
- graduation year
- student ID or alumni reference optional
- city
- state
- country
- chapter
- employer optional
- professional title optional
- communication preferences

Self-signup is open to everyone.

### Payment presentation

The join flow uses Zelle manual payment only.

For Zelle, the UI must show:

- payment instructions
- proof fields for transaction ID and screenshot
- clear `Pending Approval` status
- no misleading promise about review timing until SLA is finalized

## 6.7 Renew / Reactivate Membership

This page should handle:

- normal annual renewal
- renewal during grace period
- reactivation after expiration

UX rules:

- explain that price changes apply at next annual renewal
- show no-refund language clearly
- show that cancellation requests are handled manually by email

## 6.8 Chapters Directory

This page should help users quickly find the right local chapter.

Recommended features:

- search
- state or region filter
- chapter cards
- `Request a Chapter` CTA

Each chapter card should show:

- chapter name
- location or region if available
- short summary
- next event preview if available
- chapter CTA

## 6.9 Chapter Detail

Each chapter page should function like a mini-homepage.

Recommended sections:

- hero
- chapter overview
- chapter leadership
- upcoming events
- past event gallery
- announcements
- local committee page links
- join / contact CTA

There can be multiple chapter admins per chapter, but the public page should present a unified chapter identity.

## 6.10 Events Listing

The listing page should support filters for:

- upcoming / archived
- free / paid
- in-person / virtual / hybrid
- chapter
- date range

Cards should show:

- title
- chapter
- date
- timezone
- format badge
- price or free label
- CTA

## 6.11 Event Detail

This is the main conversion page for event registration.

Required content:

- title
- chapter
- date and time
- timezone
- format type
- venue or virtual access information
- registration CTA
- pricing
- capacity state
- waitlist state
- summary and full body
- related gallery after completion if available

Important behavior:

- hybrid events must be clearly labeled
- chapter admin-configured timezone must be shown explicitly
- if capacity is reached, the page should switch to waitlist CTA
- if a registration quantity does not fit newly opened seats, the system should waitlist-promote the next fitting entry

### Out-of-scope event UI

Do not design phase-1 UI for:

- event check-in
- QR codes
- barcode scanning
- refund self-service

## 6.12 Event Recap / Archive

Archived events should not disappear into plain lists.

Recommended archived-event view:

- recap header
- event summary
- image gallery
- chapter attribution
- committee or organizer context when relevant

## 6.13 Learning And Development

The site should include a professional content area for articles, blog posts, or updates.

Required features:

- listing page
- category filters
- search
- article detail page

## 6.14 Sign In And Auth Pages

These pages should be simple and trustworthy.

Required options:

- email/password sign-up
- email/password sign-in
- Google sign-in
- reset password

Google sign-in should be a first-class option, not hidden.

## 6.15 Member Dashboard

The dashboard should be utility-focused.

Recommended modules:

- membership status
- renew or reactivate CTA
- upcoming event registrations
- payment history
- chapter information
- announcements
- communication preferences

## 6.16 Profile And Settings

This area should include:

- personal details
- RUET profile fields
- chapter affiliation
- membership details
- communication preferences
- delete account action

### Delete account UX

Account deletion must be available to the user, but the flow should warn that:

- membership access ends
- personal profile data may be removed or anonymized
- financial records may be retained for audit reasons

## 6.17 Contact Page

Include:

- contact form
- general contact email
- chapter contact direction
- newsletter signup

## 7. Content Governance In The UI

The design should assume structured admin-managed content rather than hard-coded pages.

Important admin-managed areas:

- homepage modules
- chapter pages
- membership content
- events
- announcements
- history entries
- committee terms
- newsletters

Where useful, the public UI should support previewing structured blocks consistently across sections.

## 8. Open Design-Adjacent Items

These still depend on stakeholder or policy closure:

- expected SLA wording for manual payment approval
- production media/storage policy

These are not blockers for page design, but they affect final copy and operational messaging.

## 9. Final Direction

The website should read visually as:

- a national alumni association
- a professional membership organization
- a chapter network with active local communities

The design should therefore stay closer to the discipline and confidence of `asme.org` than to a typical university microsite, while using RUETIAN USA's logo, history, chapters, and events to make the experience distinctly its own.
