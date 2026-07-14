# Email And Background-Job Operations

Updated: 2026-07-13

## Purpose

This runbook covers the Phase 5 communication foundation: transport configuration, local capture, queued delivery, retries, preference enforcement, monitoring, and job execution.

## Email Transports

### Local and test capture

Use:

```env
EMAIL_TRANSPORT=capture
EMAIL_FROM_ADDRESS=no-reply@ruetianusa.org
EMAIL_FROM_NAME=RUETIAN USA
```

Capture mode never calls an external provider. Automated tests inspect the in-memory capture store through `getCapturedEmails()`. Capture mode intentionally throws if an application attempts to send while `NODE_ENV=production`, preventing a production deployment from silently treating unsent email as delivered.

### Production Resend transport

Use:

```env
EMAIL_TRANSPORT=resend
RESEND_API_KEY=re_replace_with_sending_key
EMAIL_FROM_ADDRESS=no-reply@verified-domain.example
EMAIL_FROM_NAME=RUETIAN USA
```

The sender domain/address must be verified with Resend. The adapter calls `POST https://api.resend.com/emails`, supplies a user agent, and promotes the application deduplication key to Resend's `Idempotency-Key` request header. It never writes the API key or message body to application logs.

The application refuses to start with the Resend transport if the API key or sender address is missing.

## Delivery Model

Application email should be queued through `queueEmail()` rather than sent directly when it is tied to business state.

Each request creates one private `emailDeliveries` audit record containing:

- a unique business deduplication key
- category and required/optional classification
- recipient, user reference, subject, and template name
- queue and scheduled time
- processing status and attempt count
- provider name/message ID on success
- sanitized failure detail on failure

Email bodies and credentials are not stored in the delivery audit. Delivery records are admin-readable and cannot be created, edited, or deleted through normal collection access.

The unique delivery key, Payload job concurrency key, capture-store key, and Resend idempotency header all use the same business identity. A retry can therefore resume a failed attempt without producing a second delivered message.

## Preference Rules

- Required security, payment, registration, and account-status messages use `category=system` and `required=true`; they are always delivered.
- Optional system reminders honor `allowSystemEmails`.
- Announcements honor `allowAnnouncements`.
- Newsletters honor `allowNewsletters`.
- Deleted accounts receive no optional communication.

The account-settings label explicitly describes the system preference as optional and tells members that required operational messages always send.

## Queues And Scheduling

The `deliverEmail` task has three retries with exponential backoff, exclusive delivery-ID concurrency, and database/provider deduplication.

Available queues:

| Queue           | Intended work                                                         |
| --------------- | --------------------------------------------------------------------- |
| `transactional` | Immediate required account and transaction messages                   |
| `reminders`     | Scheduled membership and operational reminders                        |
| `waitlist`      | Waitlist-related delivery after the Phase 7 state transition succeeds |
| `newsletters`   | Scheduled optional newsletter delivery                                |

Callers may supply `scheduledFor` to persist a future `waitUntil` time. Future waitlist code must complete its idempotent business-state transition separately, then queue email with a stable key; retrying email must never repeat the seat-allocation transition.

## Running Jobs

### External scheduler or one-off execution

Run due scheduled jobs and then drain all queues:

```bash
nvm use
pnpm jobs:run
```

This is the recommended production pattern for serverless or horizontally scaled deployments. Configure the hosting scheduler to run the command at least once per minute, and prevent overlapping invocations at the infrastructure level.

### Persistent Node process

Persistent, single-runner Node hosting may enable Payload's in-process runner:

```env
JOBS_AUTORUN=true
JOBS_POLL_CRON=*/30 * * * * *
```

Do not enable the in-process runner independently on every replica unless the deployment's database/concurrency behavior has been load-tested. Payload's job claims and per-delivery concurrency reduce duplication, but one designated worker remains the simpler operating model.

## Monitoring And Recovery

Monitor the private `Email Deliveries` and `Payload Jobs` admin collections.

Investigate:

- `emailDeliveries.status = failed`
- jobs with `hasError = true`
- jobs whose `processing` state remains true after a worker crash window
- queued records older than the expected scheduler interval
- repeated provider rate-limit or sender-verification errors

For a transient failure, rerun the existing Payload job. Do not create a new delivery key. For a corrected business event that genuinely requires a new message, queue a new semantic key that includes the new event/version identifier.

Provider errors are truncated and scrubbed of bearer/API-key patterns before storage. Never paste full provider credentials, tokens, proof images, or email bodies into audit notes.

## Production Verification Checklist

Before launch:

1. Verify the sender domain and from address.
2. Install a sending-only Resend API key.
3. Set `EMAIL_TRANSPORT=resend`.
4. Send a production-like test to an approved mailbox.
5. Confirm the delivery audit contains provider and message IDs but no message body or secret.
6. Confirm the scheduler runs all four queues at the selected interval.
7. Trigger one controlled retry and confirm only one email is received.
8. Configure alerts for final job failures and an operational owner for remediation.
