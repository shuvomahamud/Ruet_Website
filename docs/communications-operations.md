# Communications Operations

Updated: 2026-07-14

## Purpose

This runbook explains how authorized operators publish announcements, manage newsletter campaigns, monitor delivery, recover failures, and maintain the institutional footer.

## Roles

- `chapterAdmin`: create and manage announcements only for assigned chapters
- `admin` and `superAdmin`: manage site-wide/chapter announcements, newsletters, footer content, and delivery audits
- signed-in users: manage only their own communication preferences

Newsletter campaign actions are organization-wide and therefore admin-only.

## Announcements

In Payload, open `Announcements` and provide:

- title and summary
- optional details
- optional chapter; leave blank for a site-wide notice
- `Public` or `Members` audience
- visual tone
- optional paired CTA label and safe URL
- optional active-from and active-to times
- published status

A public notice appears to all visitors during its active window. A member notice appears only to signed-in active accounts and, when chapter-scoped, only to users whose primary chapter matches. A site-wide member notice is visible to every signed-in active account.

Do not use announcements for required private account/payment information. Those messages belong in system email and the user's protected account screens.

## Newsletter Workflow

1. Create a campaign from Payload `Newsletter Campaigns` with title, email subject, summary, body, and audience.
2. Keep it in `draft` while editing.
3. Open `/communications/newsletters` and select `Preview email` to inspect the exact HTML and plain-text output.
4. Either enter a future local date/time and choose `Schedule`, or choose `Send now`.
5. A scheduled campaign may be rescheduled or cancelled before dispatch.
6. Inspect the campaign card for selected, queued, suppressed, and initial-failure counts; open `Email Deliveries` for provider-level status.

Audience definitions:

- `All active verified accounts`: every account with verified email and active account status
- `Active or grace-period members`: users with an `active` or `grace_period` membership record

The dispatch evaluates each user's current `allowNewsletters` value. An opted-out user is counted as selected and suppressed, receives no job, and retains a private suppression audit.

Campaign content cannot be edited after leaving draft. If content must change, cancel the scheduled campaign and create a new draft so the audit history remains unambiguous.

## Scheduling And Recovery

The `newsletterLifecycle` schedule runs every minute on the `newsletters` queue. Production must execute scheduled Payload jobs at least once per minute using the pattern in [email-and-jobs-operations.md](/Users/shuvomahamud/Projects/RUET_Website/docs/email-and-jobs-operations.md).

The lifecycle:

- atomically claims a due `scheduled` campaign
- changes it to `sending`
- creates one deduplicated delivery per selected user
- records preference suppressions without jobs
- changes the campaign to `sent` after all recipients are queued/suppressed
- changes it to `failed` if recipient queue creation fails
- reclaims an interrupted `sending` campaign after 15 minutes

If a campaign is `failed`, correct the underlying database/job condition and choose `Retry failed dispatch`. Existing successful/suppressed recipient keys remain idempotent. Do not clone delivery records or invent replacement keys for the same campaign.

Provider delivery failures occur after campaign dispatch and remain visible on `Email Deliveries`. Rerun the existing failed Payload delivery job after correcting the provider issue; do not resend the campaign.

## Monitoring

Review:

- campaigns stuck in `scheduled` beyond their send time
- campaigns in `sending` for more than 15 minutes
- campaigns in `failed` and their sanitized `sendError`
- campaign `failedCount`
- delivery audits with `failed` status
- newsletter jobs with final errors
- an unexpected difference between selected and queued plus suppressed plus failed counts

Never paste provider keys, member data exports, or email bodies into logs or campaign errors.

## Communication Preferences

The footer action opens `/communications/preferences`.

- `Scheduled newsletters` controls newsletter campaigns.
- `Optional announcement emails` is reserved for optional email copies of announcements; it does not hide audience-appropriate website notices.
- `Optional account and renewal reminders` controls non-required system reminders.
- Required security, payment, registration, and account-status messages always send.

## Footer Maintenance

Use the Payload `Footer` global for navigation groups, newsletter title/summary/action, legal links, social links, and the legal notice. Use `Site Settings` for the organization name, primary email, phone, mailing address, and footer note.

Only use internal paths or `http`, `https`, `mailto`, and `tel` destinations accepted by the link validator. After an update, verify the footer at desktop and narrow mobile widths and confirm that every destination resolves as intended.

