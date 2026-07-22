# RUETIAN USA Website User Guide

Updated: 2026-07-15

## 1. Purpose

This guide explains how to use the complete RUETIAN USA website as a public visitor, registered user, member, chapter administrator, organization administrator, or super administrator.

It covers:

- public navigation and content
- account creation, verification, sign-in, and recovery
- member profiles and communication preferences
- annual membership and Zelle payment review
- events, registrations, waitlists, and private event access
- chapter requests and chapter administration
- announcements, newsletters, reports, and payment review
- editing website content through Payload Admin
- common status labels and troubleshooting

The public website is available at the configured production domain. The administration panel is at `/admin` on the same domain. During local development, the default addresses are `http://localhost:3000` and `http://localhost:3000/admin`.

## Quick Navigation

- [Public website features](#5-public-website-features)
- [Accounts and sign-in](#6-accounts-and-sign-in)
- [Member profile and preferences](#7-member-profile-and-preferences)
- [Annual membership and Zelle](#9-annual-membership-and-zelle)
- [Event registration and waitlists](#10-event-registration-zelle-and-waitlists)
- [Elevated user operations](#12-elevated-user-operations)
- [Payload Admin guide](#13-payload-admin-guide)
- [Status reference](#14-status-reference)
- [Troubleshooting](#15-troubleshooting)

## 2. Important Launch Note About Sample Data

The website is initially populated with editable sample organization, chapter, committee, event, learning, contact, social, and Zelle information. Sample records may include `.test` email addresses, `example.com` links, fictional phone numbers, and clearly labeled sample people or programs.

Before accepting real users or payments, an administrator must replace the sample information in Payload Admin. In particular, verify:

- organization name and contact information
- final Zelle recipient name, email address, or phone number
- chapter names, contacts, and leadership
- committee members and biographies
- events, announcements, articles, and images
- mailing address, social links, and footer links
- membership price, benefits, renewal settings, and promotions
- privacy policy, terms of use, and membership agreement

Do not rerun a sample-content reset after real editors begin making changes unless overwriting the known sample records is intentional. See [sample-content-guide.md](./sample-content-guide.md) for the reset rules.

## 3. Roles And Permissions

The website uses the following roles.

| Role | Main capabilities |
| --- | --- |
| Public visitor | Browse published public content, search chapters and learning content, view events, read legal policies, and submit the contact form. |
| Member account | Everything available publicly, plus a private dashboard, profile, communication preferences, membership checkout, event registration, chapter requests, and personal histories. A paid membership is not required merely to have an account or register for an event. |
| Chapter Admin | Member features plus assigned-chapter content, event operations, chapter-scoped reports, payment review, registration management, media, and limited Payload Admin access. |
| Admin | Organization-wide content, newsletters, promotions, users below the super-admin level, reports, payment review, and most operational records. |
| Super Admin | Full administrative scope, including chapter creation, membership-plan management, super-admin accounts, chapter-request approval, and job administration. |

Permissions are enforced on the server. Changing a URL or calling an API directly does not expand a user's authorized scope.

## 4. Website Navigation

### 4.1 Header

The header contains:

- a utility message and links such as Contact and Sign In
- the RUETIAN USA logo, which returns to the homepage
- desktop drop-down navigation
- a keyboard-accessible mobile navigation drawer
- a primary action, normally **Join Membership**

The default navigation areas are:

| Menu | Available options |
| --- | --- |
| About | About RUETIAN USA, RUET history, running committee, advisory committee, and committee archive |
| Membership | Membership overview, join, renew/reactivate, dashboard, and account settings |
| Chapters | Chapter directory and request a chapter |
| Events | Upcoming events and event archive |
| Learning | Learning hub, articles, and resources |
| Contact | Organization contact information and inquiry form |

On smaller screens, open the menu button, choose a destination, and close the drawer with its close control or the Escape key. Keyboard focus remains inside the open drawer until it is closed.

### 4.2 Footer

The footer provides grouped navigation, legal links, social destinations, contact destinations, and a link to communication preferences. Administrators can change all footer content without changing code.

### 4.3 Private Account Navigation

After signing in, account pages display these options:

| Option | Purpose |
| --- | --- |
| Dashboard | Summary of membership, chapter, registrations, waitlists, payments, and announcements |
| Membership | Complete membership, order, and Zelle-attempt history |
| Payments | Filterable membership and event payment history |
| Registrations | Event registrations and waitlist history |
| Preferences | Newsletter, announcement, and optional reminder settings |
| Profile & security | Profile fields, sign-in methods, sign-out, and account deletion |
| Reports | Shown only to chapter admins, admins, and super admins |
| Payment review | Shown only to chapter admins, admins, and super admins |

## 5. Public Website Features

### 5.1 Homepage

The homepage summarizes the organization and provides direct access to its main services. Depending on the published content, it can show:

- hero message and primary actions
- alumni-network introduction
- live counts for members, chapters, upcoming events, and learning resources
- active announcements
- annual membership overview
- featured or upcoming events
- chapter spotlight
- organization history
- current committee information
- featured learning content

Only published and currently eligible records appear. For example, a future announcement does not appear before its start time, and a draft event does not appear publicly.

### 5.2 About And Legal Pages

Use **About** to read the organization's mission, vision, structure, and supporting sections. Legal pages are available from the footer:

- `/privacy-policy`
- `/terms-of-use`
- `/membership-terms`

Legal pages can include a table of contents, review date, and approval status. Read the membership and Zelle terms before sending money because the website uses manual Zelle review and no automatic refunds.

### 5.3 Chapter Directory

Open **Chapters → Chapter directory** or `/chapters`.

To find a chapter:

1. Enter part of a chapter name or location in **Search**.
2. Optionally select a **State or region**.
3. Select **Apply filters**.
4. Select a chapter card to open its details.
5. Select **Clear** to return to the complete directory.

Only active and published chapters are listed publicly. A chapter page can show:

- region, summary, and full description
- chapter contact email
- current chapter committees and members
- public or member-targeted announcements
- upcoming chapter events
- public chapter gallery images

Signed-in users may see additional member or primary-chapter announcements that anonymous visitors cannot see.

### 5.4 Events Catalog

Open **Events** or `/events`. Available filters include:

- upcoming events or past-event archive
- start and end dates
- chapter
- in-person, virtual, or hybrid mode
- free or paid
- seats available or full/waitlist

Select **Apply filters** to update the catalog or **Reset** to remove all filters. Each event card shows its date, chapter, mode, price, capacity availability, and a link to the detail page.

An event detail page may include:

- schedule and timezone
- venue or virtual format
- public description or completed-event recap
- ticket price and capacity
- registration window
- private or public virtual access
- event gallery after completion
- registration, payment, or waitlist options

Registration requires an active account, but it does not require an active paid membership.

### 5.5 Learning Hub

Open **Learning** or `/learning`.

You can:

1. Select a category chip.
2. Search titles, excerpts, and content.
3. Filter by category.
4. Filter by article, resource, or news.
5. Select **Apply filters**.
6. Open a result to read the full item.

Learning pages can show a featured image, author, published date, reading time, categories, rich content, and related resources. Draft content is never shown publicly.

### 5.6 History And Committees

The history page at `/history` displays published timeline entries. If multiple decades exist, use the decade chips to filter the archive. Entries can include images, documents, and external links.

Committee pages are:

- `/committees/running`
- `/committees/advisory`
- `/committees/history`

Current committee pages show leadership terms, members, roles, photos, biographies, and program recaps. The archive can be filtered by running or advisory committee.

### 5.7 Announcements

Open `/announcements` to view current notices.

- Public notices are visible to everyone.
- Organization member notices are visible after sign-in.
- Chapter member notices are limited to users whose primary chapter matches the announcement.
- Start and end dates control when a notice is active.

An announcement can include an information, success, or alert tone and an optional action link.

### 5.8 Contact Form

Open **Contact** or `/contact`.

1. Enter your name and email address.
2. Select General question, Membership, Chapter support, Events, or Website help.
3. Enter a subject.
4. Enter a message of at least 20 characters.
5. Select **Send message**.

The inquiry is stored privately for authorized administrators. The page can also display the primary email, chapter-support email, phone number, and mailing address.

## 6. Accounts And Sign-In

### 6.1 Create An Email And Password Account

Open `/signup` or select **Create an account** from the sign-in page.

Complete these required fields:

- first and last name
- email address
- password and confirmation
- RUET department
- graduation year
- active primary chapter
- city, state, and country
- acceptance of the Terms of Use
- acknowledgment of the Privacy Policy

Passwords require at least 12 characters and must include uppercase and lowercase letters and a number. Use a unique password that is not used on another website.

After selecting **Create account**, open the verification email and follow its link. Password sign-in remains unavailable until the email is verified. If no active chapters exist, signup is paused until an administrator publishes one.

### 6.2 Resend Email Verification

If the verification link is missing, expired, or already used:

1. Open `/verify-email`.
2. Enter the account email address.
3. Select **Resend verification**.
4. Use the newest verification message.

For security, account-related request forms do not reveal whether a particular email address exists.

### 6.3 Sign In And Sign Out

Open `/login`, enter the verified email and password, and select **Sign in**. Successful sign-in normally opens `/dashboard` or the protected page originally requested.

To sign out, open **Profile & security** and select **Sign out**. Signing out closes both password and Google sessions.

After repeated unsuccessful password attempts, the account can be temporarily locked for 15 minutes. Suspended and deleted accounts cannot sign in.

### 6.4 Reset A Forgotten Password

1. Select **Forgot password?** on `/login`.
2. Enter the account email.
3. Select **Send reset link**.
4. Open the time-limited link from the email.
5. Enter and confirm a new compliant password.
6. Select **Update password**, then sign in.

If the link is invalid or expired, request a new one.

### 6.5 Google Sign-In

Google sign-in is optional. When it is configured, **Continue with Google** appears on signup and login pages. People without Google accounts can always use the normal email-and-password process.

For safety, a Google identity is not silently attached to an existing password account merely because the email addresses match. To connect Google to an existing account:

1. Sign in with the existing password.
2. Open `/account/settings`.
3. Under **Sign-in methods**, select **Link Google account**.
4. Complete the Google authorization flow.

When Google is not configured, its button is disabled and the website explains that the option is unavailable.

## 7. Member Profile And Preferences

### 7.1 Complete Or Update Your Profile

Open **Profile & security** or `/account/settings`.

You can update:

- first and last name
- RUET department and graduation year
- optional alumni reference
- primary chapter
- city, state, and country
- optional phone number
- optional employer and professional title
- communication preferences

The email address is displayed but cannot be changed through the self-service form. Contact an administrator if an email correction is required.

A complete profile requires first and last name, RUET department and graduation year, city, state, country, an active primary chapter, and acceptance of the current Terms of Use and Privacy Policy. If checkout says the profile is incomplete, return to this page, complete the missing fields, and save again.

### 7.2 Communication Preferences

Open **Preferences** or `/communications/preferences`.

You may enable or disable:

- scheduled newsletters
- optional announcement emails
- optional account and renewal reminders

Changes apply to future deliveries. Required security, verification, password-reset, payment, registration, and account-status messages are still sent because they are necessary to complete requested services and protect the account.

Announcements that match your audience can remain visible on the website even when their optional email delivery is disabled.

### 7.3 Delete Your Account

Open `/account/settings` and use **Delete account** only when permanent deletion is intended.

1. Read the deletion notice.
2. Type `DELETE MY ACCOUNT` exactly.
3. If the account has password sign-in, enter the current password.
4. Select **Delete my account**.

The personal profile and sign-in access are removed. Financial and audit records that must be retained are anonymized rather than erased, preserving organizational reconciliation without retaining the normal member identity.

## 8. Member Dashboard And Histories

### 8.1 Dashboard

The dashboard at `/dashboard` provides:

- current membership plan and status
- term type and expiration date
- the correct join, renew, reactivate, or resubmit action
- primary chapter and chapter link
- upcoming event registrations
- active waitlist entries
- recent immutable Zelle payment attempts
- current organization and chapter announcements

### 8.2 Payment History

Open **Payments** or `/account/payments`.

Filter by:

- membership or event purpose
- pending, approved, or failed status
- submitted-from and through dates

Each attempt shows its amount, submission time, transaction ID or image-proof indicator, status, and decision. Rejected attempts retain their rejection reason; they are not overwritten by later submissions.

### 8.3 Event Registration History

Open **Registrations** or `/events/registrations`.

Filter by registration status and upcoming/past timing. Each record can show:

- event title and date
- attendee quantity
- chapter snapshot
- registration total
- registration and payment statuses
- all Zelle attempts and rejection reasons
- a link back to the event

The waitlist section shows requested quantity, join time, current status, and offer expiration when seats have been offered.

## 9. Annual Membership And Zelle

### 9.1 How Membership Payment Works

Zelle is the only website payment method. The website does not connect to a bank account, debit a card, withdraw money, or renew automatically.

The process is:

1. The website calculates the authoritative total.
2. The user separately sends that exact amount through Zelle to the displayed recipient.
3. The user submits a transaction ID, proof file, or both.
4. An authorized chapter or organization reviewer checks the proof.
5. Membership activates only after approval.

The no-refund and membership terms must be accepted for each payment attempt.

### 9.2 Join Membership

1. Sign in with an active account.
2. Complete the profile and choose an active primary chapter.
3. Open `/membership` to review price, benefits, FAQs, renewal policy, and terms.
4. Select **Join membership**.
5. If using a promotion, enter the code and select **Apply code** before sending money.
6. Confirm the recipient and exact total displayed by the website.
7. Send the exact total through your own Zelle application.
8. Enter the Zelle transaction ID, attach proof, or provide both.
9. Accept the Membership Agreement, Zelle terms, and no-refund policy.
10. Select **Submit for manual review**.

Accepted proof files are JPG, PNG, WebP, or PDF and must not exceed 4 MB. Never upload bank passwords, full account statements, or unrelated personal documents.

Checkout is automatically paused when there is no active plan, the final Zelle recipient is not configured, the profile is incomplete, or an existing membership requires a different action.

### 9.3 Membership Statuses

| Status | Meaning and next action |
| --- | --- |
| Pending payment | A membership record exists but payment evidence has not completed the workflow. |
| Pending manual approval | Evidence was submitted and an authorized reviewer must decide. Do not submit duplicate payments. |
| Active | Membership is approved for the displayed term. |
| Grace period | The annual term expired recently; renew before the displayed grace end when possible. |
| Expired | Use **Renew or reactivate** and submit a new annual Zelle payment. |
| Failed manual payment | The latest proof was rejected. Review the reason and resubmit correct evidence without creating a duplicate membership. |
| Cancelled by admin | Contact RUETIAN USA for assistance. |
| Suspended | The membership is not currently usable; contact an administrator. |

### 9.4 Renew, Reactivate, Or Resubmit

Open `/membership/renew`.

- **Renewal** creates the next annual term for an active or grace-period membership.
- **Reactivation** creates a new term after expiration.
- **Resubmission** preserves a rejected attempt and adds new evidence to the same pending order.

Every annual term requires a new manual Zelle payment. The website prevents another checkout when an attempt is already pending or a future annual term is already approved.

### 9.5 Review Complete Membership History

Open `/membership/status`. The page shows:

- plan and price snapshots retained when the order was created
- join, renewal, or reactivation type
- start, expiration, and grace dates
- order amount and status
- every immutable payment attempt
- approval or rejection results

Use **Renew, reactivate, or resubmit** only when the displayed status permits it.

## 10. Event Registration, Zelle, And Waitlists

### 10.1 Free Event

1. Open the event.
2. Sign in.
3. Choose the number of attendees, up to the displayed maximum.
4. Select **Confirm free registration**.
5. Review the confirmed record under `/events/registrations`.

Capacity is reserved transactionally so simultaneous registrations cannot overbook the event.

### 10.2 Paid Event

1. Open the event and choose the attendee quantity.
2. If applicable, enter a promotion code and select **Apply code**.
3. Confirm the website's exact total and Zelle recipient.
4. Send the exact amount through Zelle.
5. Provide the transaction ID, a JPG/PNG/WebP/PDF proof up to 4 MB, or both.
6. Accept the Zelle and no-refund terms.
7. Select **Submit registration for review**.

The registration remains pending while evidence is reviewed. Pending paid registrations reserve their attendee quantity. A rejection remains in history and the event page presents **Resubmit Zelle details** when another attempt is allowed.

### 10.3 Full Event And Waitlist

If enough seats are not available and the waitlist is enabled:

1. Choose the desired attendee quantity.
2. Select **Join waitlist**.
3. No charge is created at this stage.
4. Watch email and `/events/registrations` for an offer.
5. When promoted, return to the event before the displayed offer expiration.
6. Accept the fixed-quantity offer and complete free or paid registration as instructed.

The system promotes the next entry whose entire attendee quantity fits. Expired offers release capacity for another waitlisted user.

### 10.4 Virtual Access

For virtual and hybrid events, the meeting link may be public or restricted to confirmed registrants and authorized event administrators. If access is restricted, sign in with the confirmed registration account and reopen the event page.

## 11. Request A New Chapter

Any signed-in active account can open `/chapters/request`.

1. Enter the proposed chapter name.
2. Optionally enter a city, state, or region.
3. Optionally explain how the chapter would help local alumni.
4. Select **Submit chapter request**.
5. Review the status under **Your requests** on the same page.

Possible statuses are pending, approved, and rejected. Approval is restricted to a super administrator and creates one active published chapter. A rejected request remains in history.

## 12. Elevated User Operations

The following sections apply to chapter admins, admins, and super admins. Sign in through the normal website for operational pages and through `/admin` for Payload CMS.

### 12.1 Zelle Payment Review

Open `/payments/review` or choose **Payment review** from account navigation.

1. Filter by membership/event, status, and permitted chapter.
2. Open the transaction ID and private proof as needed.
3. Verify the payer, target, amount, chapter, and evidence against the actual Zelle receipt.
4. Select **Approve payment** only when the payment is confirmed.
5. To reject, enter a clear reason and select **Reject payment**.

Approval or rejection is final for that attempt and updates the related membership or event registration atomically. A repeated click does not create a second state change. Chapter admins see only payments assigned to their managed chapters; admins and super admins see organization-wide records.

Never approve based only on a screenshot when the organization cannot reconcile the payment in Zelle.

### 12.2 Manage Event Registrations

Open `/events/registrations/manage`.

The page shows pending and confirmed registrations in the authorized scope. Use **Cancel registration** only when operationally required. Cancellation closes pending payment attempts, releases capacity, and immediately reprocesses the waitlist.

Use **Review event payments** to move to the event-only payment queue.

### 12.3 Operational Reports

Open `/reports`.

Filter by permitted chapter and date range. The report includes:

- approved Zelle revenue
- attendee registrations
- waitlist quantities
- failed payments
- membership status and join/renewal/reactivation outcomes
- manual approval outcomes
- approved membership and event revenue by chapter
- event capacity, pending, confirmed, and waitlist totals
- promotion usage, discounts, and recognized revenue

Select **Export summary CSV** to download the current authorized report scope. Chapter admins cannot broaden the report beyond managed chapters.

### 12.4 Review Chapter Requests

This workflow is available only to super admins at `/chapter-requests/review`.

- **Approve and publish chapter** creates one active public chapter and links it to the request.
- **Reject request** requires review notes explaining the decision.

Check for an existing or similarly named chapter before approval.

### 12.5 Newsletter Operations

Newsletter authoring is available to admins and super admins.

1. Open `/communications/newsletters`.
2. Select **Create campaign in Payload**.
3. Enter title, subject, optional summary, body, and audience.
4. Save the campaign as a draft.
5. Return to `/communications/newsletters`.
6. Select **Preview email** and inspect both HTML and plain-text output.
7. Schedule a future local date/time, select **Send now**, or cancel a scheduled campaign.
8. If dispatch fails, review the sanitized error and select **Retry failed dispatch** after correcting the cause.
9. Review selected, queued, suppressed, sent, and failed counts.
10. Use **Inspect delivery audits** for administrative delivery records.

Audiences are either all active verified accounts or active/grace-period members. User preferences are applied during dispatch. Required transactional email is not part of newsletter campaigns.

## 13. Payload Admin Guide

### 13.1 Sign In To Payload

Open `/admin` and sign in with an active chapter-admin, admin, or super-admin account. Normal members cannot use Payload Admin.

On a brand-new installation with no users, the first visit to `/admin` offers initial-account creation. Only the designated site owner should use that form; the first account receives the initial administrative access. After that, administrators create or promote other authorized accounts through the controlled user workflow.

The left navigation groups records by purpose:

- Website
- Content
- Community
- Communications
- Membership
- Events
- Commerce
- Accounts & access
- Operations

The available groups and records depend on role and chapter assignment.

### 13.2 Standard Content Editing Workflow

Public collections use two related controls:

- **Editorial Status**: Draft, In review, or Approved
- Payload document status: Draft or Published

For an admin or super admin:

1. Open or create the record.
2. Complete required fields and save a draft.
3. Use **Preview** to inspect the unpublished version.
4. Set **Editorial Status** to **Approved** after review.
5. Publish immediately or schedule publication.
6. Confirm the public route after publishing.

For a chapter admin:

1. Open or create a record within a managed chapter.
2. Save it as a draft.
3. Add a private review note if useful.
4. Set **Editorial Status** to **In review**.
5. Ask an admin or super admin to approve and publish it.

Chapter admins cannot approve or publish. Content cannot be published until editorial status is Approved. Preview links require an authenticated authorized account and are not public.

Draft-enabled collections retain versions and autosaves. Use version history to compare or restore earlier content carefully. Restoring a version does not remove the need for review and publication.

### 13.3 Website Globals

#### Site Settings

Use **Website → Site Settings** for:

- organization name and tagline
- public email, phone, address, and chapter-support email
- contact response note and utility message
- Zelle recipient name and approved email/phone
- Zelle instructions and manual-review notice
- no-refund language and event payment terms
- payment-proof retention period

The Zelle recipient controls whether membership and paid-event checkout can submit. Verify it directly before enabling real payments.

#### Home

Use **Website → Home** for the homepage hero, calls to action, alumni-network panel, credibility fallbacks, section headings, and homepage SEO. Live database counts can replace configured fallback statistics.

#### Header

Use **Website → Header** for utility links, main navigation, submenu children, featured menu panels, and the primary header button. Test every internal and external link after saving.

#### Footer

Use **Website → Footer** for link groups, legal links, social destinations, newsletter message/action, and legal notice.

#### SEO Defaults

Use **Website → SEO Defaults** for the site name, default description, title suffix, social image, and related default metadata. Individual pages, posts, chapters, and events can override these values.

### 13.4 Content Collections

#### Pages

Use **Content → Pages** for About, Contact, Membership, Chapters, Events, Learning, History, committee landing copy, and legal pages.

Key options include:

- standard, institutional, or legal page type
- hero eyebrow, title, description, and summary
- ordered sections with optional anchors and calls to action
- legal approval state and last-reviewed date
- slug and page-specific SEO

Material legal-policy changes need organizational/legal review and a new acceptance version in the application. Do not merely rewrite a live legal page if the stored acceptance version must also change. Follow [legal-policy-review-record.md](./legal-policy-review-record.md).

#### Posts And Categories

Use **Content → Posts** for articles, resources, and news. Add a title, excerpt, plain fallback body, preferred rich body, featured image, category, author, reading time, content type, publication date, and SEO.

Use **Content → Categories** to organize learning filters. Avoid deleting a category until its related posts have been reassigned.

#### History Entries

Use **Content → History Entries** for timeline records. Enter start/end year, summary, body, sort order, featured flag, images, documents, and external links.

#### Media

Use **Content → Media** to upload images or PDFs.

- Maximum size: 4 MB
- Required: useful alternative text
- Optional: caption and credit
- Visibility: public or private
- Chapter admins must keep media within their assigned chapter

Use public media for website imagery. Zelle proof files use a separate private collection and must never be republished as public media.

### 13.5 Community Collections

#### Chapters

Only a super admin can create or delete a chapter. Admins manage chapter identity and status; assigned chapter admins can update permitted chapter content.

For public visibility, a chapter normally needs:

- active chapter status
- approved editorial status
- published Payload status
- name, slug, region, and summary

Assign chapter administrators through the chapter record and the user's **Managed Chapters** field.

#### Committee Terms

Use **Community → Committee Terms** for national or chapter running/advisory committees. Configure the term dates, current flag, members, roles, photos, biographies, and completed-program recaps. Leave Chapter empty for a national committee; select a chapter for local leadership.

#### Chapter Requests

Use the public super-admin review page for decisions. The Payload collection is useful for audit and historical inspection, but workflow fields should not be manually rewritten.

### 13.6 Communications Collections

#### Announcements

Use **Communications → Announcements** for public or member notices.

Choose:

- optional chapter scope
- public or members audience
- information, success, or alert tone
- optional action label and safe URL
- active-from and active-to dates
- editorial and publication status

Chapter admins may author only assigned-chapter announcements. Organization-wide announcements require an admin or super admin.

#### Contact Submissions

Use **Communications → Contact Submissions** to review inquiries. Update operational status from New to In review to Closed and record internal notes. Contact submissions are private and must not be copied into public content without permission.

#### Newsletter Campaigns

Create and edit only draft campaign content in Payload. Use `/communications/newsletters` for schedule, cancellation, send, retry, preview, and result inspection.

### 13.7 Membership And Commerce Collections

#### Membership Plans

Only a super admin can create or modify membership plans. Exactly one active annual plan is allowed. Configure:

- title, summary, benefits, and FAQs
- annual USD price
- renewal policy and terms summary
- reminder enablement and lead time
- grace-period days

Changing the plan does not rewrite historical memberships because each membership stores immutable plan, price, currency, and policy snapshots.

#### Promotions

Admins and super admins can create promotion codes. Configure membership, event, or combined scope; fixed or percentage discount; start/end dates; usage limit; active state; and optional member-only restriction. Codes are normalized to uppercase, and percentage discounts cannot exceed 100%.

#### Memberships, Orders, Payments, And Proofs

These records are primarily created and changed by controlled website workflows. Use the public payment-review page to approve or reject payments. Do not directly edit statuses, amounts, snapshots, approvers, or rejection fields in Payload.

Payment proofs are private. Open them only for authorized reconciliation and do not share their URLs.

### 13.8 Event Collections

#### Events

Use **Events → Events** to configure:

- title, slug, chapter, and description
- draft, published, or archived operational status
- in-person, virtual, or hybrid mode
- start, end, timezone, venue, and virtual link
- public or confirmed-registrant virtual access
- free/paid flag, USD price, and promotions
- capacity and maximum attendee quantity
- registration opening and closing times
- waitlist enablement and offer duration
- post-event recap and same-chapter public gallery
- editorial, publication, and SEO fields

Free events must have a zero price. Paid events require a positive price. The end must be after the start, registration dates must be valid, and maximum registration quantity cannot exceed capacity.

Chapter admins can manage only events in their assigned chapters and must submit them for administrator publication.

#### Event Registrations And Waitlist Entries

Use `/events/registrations/manage` for authorized cancellation and the website's payment-review page for paid registration decisions. Treat Payload registration and waitlist records as operational history rather than ordinary editable content.

### 13.9 Accounts And Access

Use **Accounts & access → Users** to review accounts.

Important fields are:

- email and verification state
- member, chapter admin, admin, or super-admin role
- pending, active, suspended, or deleted account status
- primary chapter
- managed chapters for chapter admins
- profile fields and communication preferences
- accepted policy versions and timestamps

An admin can manage members and chapter admins but cannot alter a super admin or grant the admin/super-admin role. A super admin manages the full hierarchy. Apply least privilege: give users only the role and chapters needed for their work.

OAuth sessions are security records. Revoke or inspect them only when handling an authentication issue.

### 13.10 Operations Records

Email deliveries and audit logs are private operational evidence. Use them to investigate sending and workflow results; do not delete or rewrite them as routine cleanup.

Scheduled jobs process email, membership reminders and expirations, event waitlists, newsletter campaigns, and payment-proof retention. Super admins should not manually run or cancel jobs unless following the operations runbook. See [email-and-jobs-operations.md](./email-and-jobs-operations.md).

## 14. Status Reference

| Area | Common statuses |
| --- | --- |
| Account | Pending, Active, Suspended, Deleted |
| Editorial review | Draft, In review, Approved |
| Payload publication | Draft, Published |
| Payment | Pending, Approved, Failed |
| Order | Pending, Paid, Failed, Cancelled |
| Membership | Pending payment, Pending manual approval, Active, Grace period, Expired, Failed manual payment, Cancelled by admin, Suspended |
| Event | Draft, Published, Archived |
| Event registration | Pending, Confirmed, Waitlisted, Cancelled |
| Waitlist | Waiting, Promoted, Accepted, Expired |
| Chapter request | Pending, Approved, Rejected |
| Contact submission | New, In review, Closed |
| Newsletter | Draft, Scheduled, Sending, Sent, Cancelled, Failed |
| Email delivery | Queued, Processing, Sent, Failed, Suppressed |

## 15. Troubleshooting

### Signup Has No Chapter Options

No active published chapter is available. Ask a super admin to create or approve a chapter and an admin to publish it.

### Verification Or Reset Email Does Not Arrive

Check spam, confirm the entered address, wait briefly, and request a new message. Production delivery requires a verified Resend sender. Contact an administrator if repeated requests fail.

### Sign-In Fails

Confirm that the email is verified, the password is correct, and the account is active. Wait 15 minutes after repeated failed attempts. Use password reset if necessary.

### Google Button Is Disabled

Google OAuth is not configured. Use email-and-password signup or sign-in.

### Membership Checkout Is Disabled

Check for an incomplete profile, missing active chapter, missing active membership plan, missing Zelle recipient, already-pending payment, rejected attempt requiring resubmission, or an already-approved future term.

### Promotion Code Is Rejected

Confirm spelling, scope, active dates, usage limit, member-only eligibility, and that only one code is being used. Always rely on the total returned by **Apply code**.

### Proof Upload Is Rejected

Use JPG, PNG, WebP, or PDF no larger than 4 MB. A transaction ID can be submitted without a file.

### Payment Remains Pending

Manual review is required. Do not send a duplicate payment. Check membership or event history and contact the organization if the normal review period has passed.

### Event Registration Option Is Missing

The event may have ended, registration may be outside its allowed window, an existing registration may already be active, or a waiting waitlist entry may already exist.

### Content Does Not Appear Publicly

Check editorial approval, Payload publication status, chapter active status, event operational status, announcement time window, and whether the record belongs to the expected chapter or audience.

### Chapter Admin Cannot Find Or Edit A Record

Confirm that the account is active, has the Chapter Admin role, and includes the correct chapter in **Managed Chapters**. Chapter admins cannot manage organization-wide or other-chapter records.

## 16. Security And Privacy Practices

- Never place secrets, API keys, passwords, or private banking details in public content.
- Use the private payment-proof field only for the minimum evidence required for reconciliation.
- Do not share private proof, preview, admin, report, or virtual-event URLs.
- Confirm Zelle receipt independently before approving payment.
- Give administrative access only to trusted people and use the lowest sufficient role.
- Suspend an account promptly when access should be temporarily removed.
- Sign out on shared devices.
- Review legal and privacy obligations before exporting or sharing reports.
- Keep public media alternative text meaningful for accessibility.
- Back up production data before bulk changes or intentional sample resets.

## 17. Where To Get Help

For normal website, membership, chapter, or event questions, use `/contact` and choose the relevant topic. Administrators can use these supporting documents for specialized operations:

- [Editable Sample Content Guide](./sample-content-guide.md)
- [Membership Payment Operations](./membership-payment-operations.md)
- [Event Payment And Waitlist Operations](./event-payment-waitlist-operations.md)
- [Communications Operations](./communications-operations.md)
- [Email And Jobs Operations](./email-and-jobs-operations.md)
- [Supabase Storage Operations](./supabase-storage-operations.md)
- [Vercel And Supabase Launch Runbook](./vercel-supabase-launch-runbook.md)
