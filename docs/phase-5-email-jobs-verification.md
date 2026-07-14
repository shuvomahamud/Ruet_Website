# Phase 5 Email And Jobs Verification

Updated: 2026-07-13

## Outcome

Roadmap Phase 5 is complete. The application now has a production-capable Payload email adapter, shared responsive typed templates, a safe local/test capture transport, private delivery audits, preference-aware deduplication, and a retrying/scheduled Payload job foundation for transactional, reminder, waitlist, and newsletter work.

Completed task disposition:

- `J-01` Transactional email foundation

## Implemented Infrastructure

### Adapter and templates

- Payload now uses the RUETIAN USA email adapter rather than its unaudited console fallback.
- Capture transport stores emails in memory for local and automated verification and never calls an external provider.
- Capture transport is blocked from reporting successful sends in production.
- Resend transport calls the official HTTPS email endpoint with bearer authentication, an explicit user agent, validated sender configuration, and an `Idempotency-Key` header.
- Provider credentials and message bodies are not logged.
- Shared typed templates cover account verification, password reset, generic system notices, membership reminders, waitlist promotion, and newsletters.
- The base HTML uses table-safe email structure, inline styles, a mobile media query, hidden preheader, text alternative, escaped untrusted text, and HTTP(S)-only action links.
- Payload verification and reset-password emails now use the shared templates.

### Delivery audit, preferences, and deduplication

- `emailDeliveries` is a private, service-written audit collection.
- Audits record semantic deduplication key, category, required flag, recipient/user, subject/template, queue/schedule, status, attempts, provider/message ID, timestamps, and sanitized failure detail.
- Audits never store the email body or provider credential.
- Required system messages bypass communication preferences.
- Optional system reminders, announcements, and newsletters honor their respective user preferences; deleted accounts receive no optional email.
- A unique database key, Payload concurrency key, capture key, and Resend idempotency header share the same business identity.
- A repeated business event returns the existing audit instead of queueing or sending again.

### Jobs and operations

- Payload's `deliverEmail` task uses exclusive delivery-ID concurrency and three retries with exponential backoff.
- Failed attempts update the same audit, increment attempts, truncate and scrub error detail, and throw so Payload can apply its retry policy.
- Successful retries clear the error and retain one provider message identity.
- `transactional`, `reminders`, `waitlist`, and `newsletters` queues accept immediate or future `waitUntil` jobs.
- Job queue/run/cancel endpoints require a super admin when access is not overridden by trusted server code.
- Persistent hosts may opt into one in-process worker; external schedulers can run `pnpm jobs:run` to handle schedules and drain all queues.
- Worker setup, monitoring, recovery, security, and production verification are documented in [email-and-jobs-operations.md](/Users/shuvomahamud/Projects/RUET_Website/docs/email-and-jobs-operations.md).

## Data And Migration Verification

- Forward migration: `20260714_051235`
- Adds the `email_deliveries` audit table and enums.
- Adds the `deliverEmail` Payload task enum values.
- Adds indexed Payload job concurrency keys.
- The down migration removes dependent relationships before the audit table and removes delivery jobs before narrowing task enums.
- Generated Payload collection/job types are current.
- `pnpm payload migrate:status` confirms every migration through `20260714_051235` has run.
- `pnpm payload migrate:create` reports no schema changes after the migration.

## Automated Verification

The supported runtime is Node 22 selected through `.nvmrc`.

Quality gate:

```bash
nvm use
pnpm verify
pnpm test:e2e
pnpm jobs:run
pnpm payload migrate:status
pnpm payload migrate:create
```

Verified result:

- lint passed
- TypeScript passed
- `36` integration tests passed
- production build passed
- `20` Chromium browser tests passed
- the all-queue worker command completed
- every migration is applied
- schema-drift check reported no changes

Phase 5-specific coverage verifies:

- responsive template structure, plain-text alternatives, and HTML escaping
- capture transport idempotency without an external call
- production-like Resend URL, headers, body, response ID, and secret separation through a mocked fetch
- optional newsletter suppression and required-system preference bypass
- real database queueing, task execution, capture delivery, audit updates, and repeated-event deduplication
- sanitized failure persistence and successful retry on the same delivery
- future scheduling, queue isolation, concurrency keys, and private collection access
- existing signup, verification, reset, profile, chapter, governance, public-content, payment-review, and access-control regressions

## Required External Inputs

Production delivery verification still requires:

- a Resend sending API key
- a verified sender domain and from address
- the production hosting choice that determines in-process versus external-scheduler job execution
- an operational owner and alert destination for final delivery failures

These inputs are deployment configuration, not missing Phase 5 application code. Until supplied, local and automated environments remain safely on capture transport.
