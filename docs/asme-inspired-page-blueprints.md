# RUETIAN USA Website ASME-Inspired Page Blueprints

Updated: 2026-07-13

## 1. Purpose

This document turns the approved sitemap and design direction into page-by-page blueprints.

It is intended to guide:

- UI design
- frontend implementation
- CMS modeling
- content-entry planning

## 1.1 Current Implementation Alignment

The current implementation now maps these public routes to CMS-owned `Pages` records:

- `about`
- `membership`
- `chapters`
- `events`
- `learning`
- `contact`
- `privacy-policy`
- `terms-of-use`
- `membership-terms`

This means the hero and supporting page-copy layers for those routes are now expected to be edited in Payload admin instead of in code.

Roadmap Phase 3 now implements the shared blueprint foundations:

- desktop mega-menus and a keyboard-contained mobile navigation drawer
- reusable cards, rails, badges, filters, pagination, CTA, stats, gallery, timeline, and state components
- a dedicated institutional About composition and protected Contact form
- learning search, filters, rich detail, related content, and page metadata
- legal status, last-updated display, table of contents, anchors, and readable policy width

## 2. Global Page Pattern

Most public pages should follow this overall pattern:

1. utility header
2. primary navigation
3. section hero
4. page-specific modules
5. repeated CTA band where appropriate
6. dense footer

This mirrors the overall operational structure seen on ASME.

## 3. Home Page Blueprint

## 3.1 Goal

Establish trust quickly and route users into membership, chapters, and events.

## 3.2 Section order

1. rotating hero / headline rail
2. credibility metrics strip
3. upcoming events module
4. membership value band
5. chapter spotlight grid
6. RUET history preview
7. current committee preview
8. learning and development feed
9. announcement / campaign banner

## 3.3 ASME-inspired traits

- more than one featured story or action at the top
- visible institutional metrics
- repeated membership CTA
- several modular content blocks on one page

## 4. About RUETIAN USA Blueprint

## 4.1 Goal

Explain the organization, its purpose, and how it operates.

## 4.2 Section order

1. page hero with title and summary
2. who we are
3. mission and vision
4. organization structure
5. chapter network overview
6. metrics strip
7. link grid to history, committees, and chapters

## 4.3 Design note

This page should feel close to ASME’s “About” posture: institutional, numeric, and structured.

## 5. RUET History Blueprint

## 5.1 Goal

Present RUET and RUETIAN USA history as an official evolving timeline.

## 5.2 Section order

1. intro block
2. timeline navigation or filters
3. alternating or stacked timeline entries
4. archival media and document links
5. closing CTA to explore chapters or committees

## 5.3 Entry design

Each timeline entry should show:

- year or date
- title
- summary
- full narrative
- images
- documents
- links

## 6. Committee Pages Blueprint

Required pages:

- Current Running Committee
- Current Advisory Committee
- Committee History

## 6.1 Shared layout

1. page hero
2. term summary bar
3. committee member grid
4. committee-event recaps
5. archive navigation

## 6.2 Member card design

Each member card should support:

- photo optional
- name
- role
- short bio optional

## 6.3 Committee-event recap card

Each recap card should support:

- title
- event date
- short summary
- photo gallery up to 6 images

## 7. Membership Overview Blueprint

## 7.1 Goal

Make the single membership offer feel valuable and official.

## 7.2 Section order

1. page hero
2. single plan card
3. benefits grid
4. membership process summary
5. renewal and reactivation summary
6. FAQ
7. join CTA band

## 7.3 ASME-inspired traits

- strong membership sales positioning
- benefit icons or feature callouts
- repeated apply / renew actions

## 8. Join Membership Blueprint

## 8.1 Goal

Reduce confusion and move users cleanly into account creation and payment.

## 8.2 Flow stages

1. select or review membership
2. sign in or create account
3. fill profile fields
4. review Zelle payment instructions
5. apply promo code
6. review order
7. confirmation or pending approval

## 8.3 UI layout

Desktop:

- form on the left
- sticky order summary on the right

Mobile:

- stacked form
- collapsible order summary

## 8.4 Zelle state

When Zelle is chosen, show:

- instructions
- proof submission fields
- pending approval banner
- next-step explanation

## 9. Renew / Reactivate Membership Blueprint

## 9.1 Goal

Support three states clearly:

- normal renewal
- grace-period recovery
- expired-member reactivation

## 9.2 Sections

1. status summary
2. price and renewal details
3. Zelle payment and proof submission
4. FAQ and policy notes

## 9.3 Required notices

- price changes apply at next annual renewal
- no refund
- cancellation handled by email to admin

## 10. Chapters Directory Blueprint

## 10.1 Goal

Show the breadth of the chapter network and route users to the right local chapter.

## 10.2 Section order

1. page hero
2. chapter finder bar
3. featured chapter cards
4. all chapters grid
5. request-a-chapter CTA

## 10.3 Chapter card

Each chapter card should show:

- chapter name
- location or region
- short summary
- next event preview if available
- activity indicator if useful

## 11. Chapter Detail Blueprint

## 11.1 Goal

Give each chapter a strong local homepage while keeping the main site consistent.

## 11.2 Section order

1. chapter hero
2. chapter overview
3. chapter leadership
4. upcoming events
5. chapter announcements
6. gallery
7. local committees
8. join / contact CTA

## 11.3 ASME-inspired traits

- chapter pages should feel like part of a larger network, similar to ASME sections/divisions
- structure should be consistent even when content differs by chapter

## 12. Events Listing Blueprint

## 12.1 Goal

Make it easy to browse, compare, and filter events.

## 12.2 Filters

- date range
- chapter
- event mode
- free / paid
- upcoming / archived

## 12.3 Layout

- filter rail at top
- card grid or list below
- optional featured event banner

## 13. Event Detail Blueprint

## 13.1 Goal

Turn the event detail page into a clear registration destination.

## 13.2 Layout

Desktop:

- main content column
- sticky right-side registration panel

Mobile:

- top CTA block
- stacked content sections

## 13.3 Required modules

- title and date block
- chapter label
- event mode badge
- timezone label
- venue or virtual access block
- summary
- full content
- pricing
- capacity / waitlist state
- registration CTA
- post-event gallery if archived

## 13.4 Waitlist behavior in UI

- if full, show a waitlist CTA instead of a dead-end state
- if the user requested a group size, reflect that in confirmation language

## 14. Event Archive / Recap Blueprint

## 14.1 Goal

Keep past events valuable as proof of community activity.

## 14.2 Layout

1. archived event summary
2. media gallery
3. organizer or chapter context
4. link to related future events

## 15. Learning And Development Blueprint

## 15.1 Listing page

Sections:

1. featured content
2. category chips
3. search
4. article grid

## 15.2 Article detail

Sections:

1. title and metadata
2. body content
3. related articles
4. CTA to membership or newsletter signup

## 16. Auth Pages Blueprint

Required pages:

- sign up
- sign in
- forgot password
- reset password

## 16.1 Layout

Desktop:

- centered form with supporting value proposition panel

Mobile:

- single-column layout with concise copy

## 16.2 Required options

- email/password flow
- Google sign-in
- clear route between create-account and sign-in screens

## 17. Member Dashboard Blueprint

## 17.1 Goal

Give members a strong operational home after login.

## 17.2 Modules

- membership status card
- renew / reactivate CTA
- upcoming event registrations
- payment history snapshot
- chapter info
- announcements
- communication settings shortcut

## 18. Profile And Settings Blueprint

## 18.1 Sections

- personal details
- RUET profile fields
- chapter affiliation
- communication preferences
- account security
- delete account

## 18.2 Delete account pattern

Use a confirmation modal or dedicated confirmation page with clear warnings.

## 19. Contact Page Blueprint

## 19.1 Sections

- contact form
- direct contact info
- chapter support guidance
- newsletter signup

Implementation note: the form, direct contact info, and chapter-support guidance are complete. Newsletter signup remains with the Phase 8 footer/newsletter work.

## 20. Legal Pages Blueprint

Legal pages should use a simpler editorial layout:

- page title
- last updated date
- section table of contents for long pages
- readable content width

Implementation note: this layout is complete and CMS-driven. The current policies are explicitly marked as approval-pending placeholders until final stakeholder wording is installed.

## 21. Responsive Design Rules

- mega-menus collapse to drawer menus on mobile
- stats strip becomes 2x2 on small screens
- sticky sidebars collapse into top sections on mobile
- card grids reduce cleanly from 4 to 2 to 1 columns

## 22. CMS Ownership By Page Type

The following should be admin-editable:

- home hero items
- metrics strip values
- membership page copy
- chapter content
- event content
- timeline entries
- committee terms
- article content
- announcement banners

## 23. Launch Priority

Highest-priority pages for implementation:

1. home
2. membership overview
3. join membership
4. chapters directory
5. chapter detail
6. events listing
7. event detail
8. sign in / sign up
9. member dashboard
10. contact

Second-wave pages:

- history timeline
- committee archive
- learning detail views
- event recap pages
- legal pages with final approved copy

## 24. Final Direction

If the implementation follows these page blueprints together with the design-system document, RUETIAN USA will look structurally much closer to ASME:

- layered navigation
- dense but organized page composition
- membership-forward messaging
- chapter-network emphasis
- operational event pages
- institutional footer and content architecture

That is the intended outcome for the pre-implementation design phase.
