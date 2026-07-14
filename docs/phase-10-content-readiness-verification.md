# Phase 10 Content Readiness Verification

Updated: 2026-07-14

## Status

The Phase 10 application work is technically complete. `L-01` and `L-02` meet their acceptance criteria. The stakeholder-authorized standard legal text is installed and approved. `E-01` remains `Partial`, and Phase 10 must remain open until the organization-specific launch content/assets listed in this document are installed and approved.

Phase 11 has not started because the roadmap requires the Phase 10 exit gate to close first.

## Implemented Scope

### Homepage and public discovery

- The homepage renders CMS-managed hero and network content, published credibility metrics, active announcements, membership, featured upcoming events, chapter spotlight, history, current committee, and learning modules.
- Empty and populated states are supported without development-stage fallback copy.
- Home, chapter, event, post, and standard-page metadata can define SEO titles, descriptions, canonicals, social images, and indexing behavior.
- `/sitemap.xml` contains only eligible published public records, and `/robots.txt` excludes admin, account, dashboard, report, preview, and private workflow routes.

### Editorial workflow

- `pages`, `posts`, `announcements`, `chapters`, `events`, `committeeTerms`, and `historyEntries` share an explicit `Draft` → `In review` → `Approved` workflow in addition to Payload's draft/published document state.
- Chapter administrators can author records only within their assigned scope and submit them for review, but cannot approve or publish them.
- Administrators and super administrators can review, approve, and publish; unapproved public records cannot be published.
- Secure admin previews exist for all public collections and the Home global.
- Anonymous HTTP requests cannot read drafts, internal review fields, or collection/global version history, including by adding `draft=true`.
- Published collection and global changes trigger the relevant path and cache-tag revalidation.

### Admin and realistic UAT data

- Payload navigation is grouped by Accounts & access, Content, Communications, Operations, Commerce, Community, Membership, Events, and Website globals.
- Public collections expose useful search fields, default columns, editorial state, descriptions, validation, help text, and preview actions.
- The baseline CMS seed is repeatable and creates the complete public route structure without overwriting unrelated content.
- `pnpm seed:uat` creates realistic non-production plans, chapters, committees, history, posts, announcements, promotions, upcoming/archived events, role-specific test users, membership/payment history, a confirmed registration, and a waitlist record.
- The UAT seed requires an explicit password, refuses production by default, and has been run twice against the same database to verify idempotency.

### Approved legal and payment terms

- Standard U.S.-oriented Privacy Policy, Terms of Use, and Membership Agreement are published with approved status and an effective date of July 14, 2026.
- Membership and event Zelle instructions include recipient verification, no-purchase-protection/cancellation risk, manual-review, and final-payment/no-refund disclosures.
- Paid membership and event forms require explicit agreement; direct requests without agreement are rejected.
- Every new immutable Zelle payment attempt stores the server-recorded acceptance time and policy version `2026-07-14`.
- Every new local account stores the server-recorded Terms and Privacy acknowledgement timestamps and accepted policy version `2026-07-14`.
- The source, application-practice audit, and authoritative guidance are recorded in [legal-policy-review-record.md](/Users/shuvomahamud/Projects/RUET_Website/docs/legal-policy-review-record.md).

## Database and Generated Artifacts

- Forward migration `20260714_080505_phase_10_content_readiness` adds the editorial/SEO/global-version schema and expanded Home global.
- The migration backfills already-published records as editorially approved and updates the exact legacy privacy/payment defaults without changing unrelated editorial content.
- The migration has been applied successfully to the working database.
- Payload types and the admin import map are regenerated from the current schema.

## Automated Verification

- `pnpm verify` passes lint, TypeScript, the complete integration suite, and the production build.
- The integration suite contains `60` passing tests, including draft leakage, review authority, publishing, preview-related access, and global-version security coverage.
- The focused public browser suite passes all `14` tests, including the expanded homepage, sitemap, robots, canonical, and responsive behavior.
- The complete browser suite passes all `36` tests across public, account, chapter, communications, reporting, event, membership, and responsive workflows.

## Phase Exit Items Requiring Stakeholder Input

The stakeholder-authorized standard legal policies and payment language were supplied as a creation request and installed on July 14, 2026. The following organization-specific launch content must still be supplied in approved form; it is intentionally not invented by engineering:

1. Approved organization/about/mission/history copy and launch announcements.
2. Approved chapter names, descriptions, contacts, leadership details, and chapter media.
3. Approved running/advisory committee terms, member details, recaps, and media.
4. Approved homepage, learning, event, and other launch content/assets, including final brand/social imagery.

When these inputs are supplied, the remaining Phase 10 work is to install them through the verified CMS workflow, perform editorial UAT on a fresh seeded database, confirm no placeholders remain, rerun the phase gate, mark `E-01` and Phase 10 `Completed`, and only then begin Phase 11.
