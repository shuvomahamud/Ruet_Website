# RUETIAN USA Website ASME-Inspired Design System

Updated: 2026-07-13

## 1. Purpose

This document defines the visual and structural design system for RUETIAN USA.

It is intentionally based on the design patterns observed on the current official ASME website, then translated into a RUETIAN USA-specific system.

## 1.1 Current Implementation Alignment

The live implementation now applies these design-system ownership rules:

- the header logo is loaded from [public/brand](/Users/shuvomahamud/Projects/RUET_Website/public/brand) using the standard `ruetian-usa-logo.*` filename pattern
- public page copy for the core informational and listing pages is now expected to come from Payload CMS rather than hardcoded route text
- this keeps the design system aligned with the original requirement that content density should be CMS-managed, not baked into code
- the header now implements structured desktop mega-menus and a keyboard-contained mobile drawer using the same CMS-owned hierarchy
- the public component library now includes reusable cards, rails, filters, pagination, badges, CTAs, stats, galleries, timelines, and loading/empty/error states
- institutional, learning, contact, and legal templates share the implemented responsive and focus-visible rules

## 2. Reference Inputs

ASME pages reviewed on 2026-03-29:

- `https://www.asme.org/`
- `https://www.asme.org/about-asme`
- `https://www.asme.org/membership/how-to-join`
- `https://www.asme.org/membership/membership-benefits`

Observed ASME patterns worth adopting:

- two-level institutional header
- broad category-first navigation
- dense, information-rich homepage
- rotating hero or headline rail
- numeric credibility strip
- repeated membership CTAs
- strong section-based content modules
- a deep, multi-column footer

## 3. Design Goal

RUETIAN USA should feel like:

- a national alumni association
- a professional society
- an active chapter network
- a credible membership organization

It should not feel like:

- a student club microsite
- a startup landing page
- a generic university department site

## 4. What To Borrow From ASME

Borrow these traits:

- layered navigation and dense information hierarchy
- editorial content blocks with clear section labels
- strong emphasis on membership, events, and organizational credibility
- repeated call-to-action structure across the site
- public content modules that feel operational, not decorative
- section landing pages that work like content hubs

Do not copy:

- ASME branding
- ASME copy
- ASME exact layouts or visual assets
- ASME-specific content taxonomy that does not fit RUETIAN USA

## 5. Brand Translation For RUETIAN USA

The attached RUETIAN USA logo introduces strong national and institutional colors. The website should convert that into a disciplined interface rather than reproducing the logo colors at full intensity everywhere.

## 5.1 Primary color tokens

- `--color-navy-900`: `#12306B`
- `--color-blue-700`: `#1E4FAF`
- `--color-red-600`: `#C9253A`
- `--color-green-700`: `#0C7A43`
- `--color-gold-500`: `#D8A63A`
- `--color-stone-50`: `#F7F5F1`
- `--color-stone-100`: `#EFEAE1`
- `--color-charcoal-900`: `#1A1D21`
- `--color-white`: `#FFFFFF`

## 5.2 Functional color usage

- header, footer, main nav, headings: navy
- links and active states: blue
- primary CTA accent: blue with occasional red campaign emphasis
- positive states and chapter/community accents: green
- timeline milestones and premium markers: gold
- backgrounds: white and warm stone

Rule:

- navy and stone should carry most of the interface
- red and green should be used as accents, not competing base colors

## 5.3 Typography

Recommended type system:

- UI and headings: `IBM Plex Sans`
- editorial serif accent: `Source Serif 4`

Usage guidance:

- H1 and H2 use `IBM Plex Sans` with strong weight
- long history intros, pull quotes, or formal statements may use `Source Serif 4`
- body copy remains sans-serif for readability

## 5.4 Iconography

Use a consistent outline or lightly filled icon family.

Priority icon themes:

- membership
- chapters
- events
- professional development
- announcements
- timeline and history

Icons should support content scanning, similar to ASME benefit and resource modules.

## 6. Layout System

## 6.1 Container widths

- page max width: `1440px`
- primary content container: `1200px`
- readable editorial container: `760px`

## 6.2 Grid

- desktop: `12-column`
- tablet: `8-column`
- mobile: `4-column`

## 6.3 Spacing scale

- `4, 8, 12, 16, 24, 32, 48, 64, 96`

Rule:

- use larger vertical spacing than typical dashboard products
- public pages should breathe, but content density should still feel substantial

## 6.4 Radius and elevation

- card radius: `12px`
- input radius: `10px`
- CTA radius: `999px` for key pills, `10px` for standard buttons
- shadows should be soft and restrained

The site should feel institutional, not glassmorphism-heavy.

## 7. Structural Patterns

## 7.1 Header

The site should use a two-level header inspired by ASME.

### Utility bar

Contents:

- RUETIAN USA brand lockup
- quick chapter link
- contact link
- sign in / create account
- join membership CTA

### Main navigation bar

Top-level items:

- About
- Membership
- Chapters
- Events
- Learning
- Contact

Desktop behavior:

- support mega-menu panels for content-rich sections
- keep the membership CTA visible

Mobile behavior:

- stacked menu drawer
- keep join-membership CTA pinned near top

## 7.2 Mega-menu model

Use structured multi-column panels for:

- About
- Membership
- Chapters
- Events
- Learning

Each panel should include:

- section overview link
- 3 to 6 meaningful child links
- one featured panel card or CTA

This is important if the site is to feel closer to ASME than to a basic navbar.

## 7.3 Footer

The footer should be large, dense, and operational.

Recommended columns:

- About RUETIAN USA
- Membership
- Chapters
- Events
- Learning
- Contact and social

Additional footer content:

- newsletter signup
- legal links
- chapter directory shortcut
- account links

## 8. Homepage System

The homepage should be modular and information-dense.

## 8.1 Hero system

The homepage hero should behave more like an ASME-style rotating highlight rail than a single oversized static banner.

Recommended hero content types:

- membership campaign
- featured event
- major announcement
- history or milestone feature

Hero layout:

- large left-aligned headline
- short supporting text
- primary CTA
- secondary CTA
- optional media panel
- slide controls only if there are multiple high-quality items

## 8.2 Credibility strip

Immediately after the hero, add a numeric credibility strip.

Suggested metrics:

- total members
- total chapters
- upcoming events
- years of community

This is directly aligned with the ASME-style “by the numbers” pattern.

## 8.3 Content modules

The homepage should use section modules such as:

- membership benefits band
- upcoming events rail
- chapter spotlight grid
- RUET history preview
- current leadership preview
- learning and development content rail
- announcement banner

## 9. Core Component Library

## 9.1 Buttons

Primary:

- filled blue button

Secondary:

- outlined navy button

Tertiary:

- text link with arrow

Campaign / alert:

- red-accented button for time-sensitive announcements only

## 9.2 Cards

Required card families:

- event card
- chapter card
- article card
- committee member card
- timeline card
- stat card
- announcement card
- benefit card

Shared rules:

- clear eyebrow or category labels
- strong title hierarchy
- meta row for date, chapter, or status
- CTA or inline link

## 9.3 Filters and search

List pages should use compact filter bars rather than huge form blocks.

Required filter patterns:

- chip filters
- dropdowns
- search input
- clear-all action

## 9.4 CTAs and promo bands

Like ASME, the site should repeat clear calls to action across section boundaries.

Required reusable CTA bands:

- join membership
- find your chapter
- register for events
- subscribe to updates

## 9.5 Stats strip

Use a full-width band with 4 concise metrics.

Styling:

- navy or stone background
- large numeric type
- short label beneath each number

## 9.6 Timeline system

For RUET history:

- vertical timeline on desktop
- stacked cards on mobile
- gold or blue milestone markers
- optional archival image or document preview

## 9.7 Committee system

Committee views should use:

- term switcher or archive selector
- leadership member cards
- event recap cards tied to the committee term

## 10. Page-Specific Visual Rules

## 10.1 About pages

Use editorial layouts with:

- strong page title
- intro summary block
- supporting image or graphic
- metrics and mission blocks
- linked subtopics

## 10.2 Membership pages

Use a more conversion-oriented layout:

- plan card
- benefits grid
- FAQ accordion
- recurring CTA band

## 10.3 Chapters pages

Chapters should feel like a structured network, similar to ASME’s sections/divisions pattern.

Visual direction:

- directory grid
- geographic cues
- chapter activity indicators
- chapter-local announcements and event modules

## 10.4 Events pages

Events should feel operational and high-value.

Required visual elements:

- date block
- format badge
- timezone label
- chapter label
- sticky CTA or sidebar registration panel on desktop

## 10.5 Learning pages

Use an editorial publication model:

- featured article
- category rail
- card grid
- search and filters

## 11. Motion And Interaction

Motion should be restrained and purposeful.

Use:

- hero slide transitions
- staggered card reveal on major sections
- subtle hover elevation
- accordion transitions

Avoid:

- excessive parallax
- decorative floating shapes
- gratuitous animation loops

## 12. Accessibility Rules

- maintain strong color contrast
- do not rely on color alone for status
- ensure keyboard support for mega-menus, filters, accordions, and dialogs
- keep heading hierarchy consistent
- use visible focus styles
- ensure forms provide clear error messaging

## 13. CMS And Admin Implications

To preserve the ASME-like richness without hard-coding, the CMS must support:

- home hero slides
- statistics strip values
- announcement banners
- featured events
- featured chapters
- committee term switching
- history timeline entries
- membership benefits blocks
- chapter galleries
- article categories

## 14. Anti-Patterns To Avoid

- oversized empty hero sections with almost no content
- purple-heavy generic SaaS styling
- flat one-column university layouts
- inconsistent chapter pages
- tiny footers with only a few links
- hidden membership CTA
- minimal navigation that cannot scale

## 15. Final Design Direction

If the goal is for RUETIAN USA to feel more like ASME, the site must emphasize:

- hierarchy over minimalism
- credibility over novelty
- reusable institutional modules over one-off custom layouts
- dense but organized content blocks over sparse landing-page aesthetics

That should guide both the visual design and the frontend implementation.
