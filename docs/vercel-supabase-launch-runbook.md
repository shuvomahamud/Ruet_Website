# Vercel And Supabase Launch Runbook

Updated: 2026-07-14

## Deployment Architecture

- Vercel hosts the Next.js and Payload application.
- Supabase provides PostgreSQL, one private Storage bucket, and the recurring scheduler.
- Resend provides production email.
- Google provides optional account sign-in after its production callback is registered.
- Supabase Cron invokes the authenticated Payload job runner every five minutes.
- GitHub `main` is the production deployment branch.

No application upload may rely on Vercel's ephemeral filesystem. Local disk storage is development-only.

## Required Vercel Project Settings

Use Node.js 22 and pnpm. The repository already provides:

- `packageManager: pnpm@10.29.2`
- Node engine `22.x`
- install command `pnpm install --frozen-lockfile`
- build command `pnpm vercel:build`
- Next.js framework detection

Link the GitHub repository `shuvomahamud/Ruet_Website` and use `main` as the production branch. Do not deploy from an unreviewed sample-content branch.

## Environment Variables

Set secrets through Vercel Project Settings. Never paste them into `vercel.json`, commit them, prefix server secrets with `NEXT_PUBLIC_`, or reuse the same value for multiple secrets.

| Variable                             | Preview | Production | Value source / rule                                             |
| ------------------------------------ | ------- | ---------- | --------------------------------------------------------------- |
| `DATABASE_URL`                       | Yes     | Yes        | Supabase transaction pooler, port `6543`                        |
| `DATABASE_MIGRATION_URL`             | Yes     | Yes        | Supabase session pooler, port `5432`                            |
| `DATABASE_POOL_MAX`                  | Yes     | Yes        | Start with `5`                                                  |
| `PAYLOAD_SECRET`                     | Yes     | Yes        | Unique cryptographically random value, at least 32 characters   |
| `NEXT_PUBLIC_SITE_URL`               | Yes     | Yes        | Canonical HTTPS deployment URL                                  |
| `CRON_SECRET`                        | Yes     | Yes        | Different random value, at least 32 characters                  |
| `EMAIL_TRANSPORT`                    | Yes     | Yes        | `resend`                                                        |
| `RESEND_API_KEY`                     | Yes     | Yes        | Sending-only key from Resend                                    |
| `EMAIL_FROM_ADDRESS`                 | Yes     | Yes        | Address on the verified Resend domain                           |
| `EMAIL_FROM_NAME`                    | Yes     | Yes        | `RUETIAN USA`                                                   |
| `GOOGLE_CLIENT_ID`                   | No      | No         | Optional; Google OAuth web client                               |
| `GOOGLE_CLIENT_SECRET`               | No      | No         | Optional; set together with `GOOGLE_CLIENT_ID`                  |
| `JOBS_AUTORUN`                       | Yes     | Yes        | `false` on Vercel                                               |
| `STORAGE_PROVIDER`                   | Yes     | Yes        | `supabase`                                                      |
| `SUPABASE_STORAGE_BUCKET`            | Yes     | Yes        | Existing private file bucket                                    |
| `SUPABASE_STORAGE_REGION`            | Yes     | Yes        | Exact region from Supabase Storage S3 settings                  |
| `SUPABASE_STORAGE_ENDPOINT`          | Yes     | Yes        | Direct `https://REF.storage.supabase.co/storage/v1/s3` endpoint |
| `SUPABASE_STORAGE_ACCESS_KEY_ID`     | Yes     | Yes        | Server-only Supabase Storage S3 credential                      |
| `SUPABASE_STORAGE_SECRET_ACCESS_KEY` | Yes     | Yes        | Server-only Supabase Storage S3 credential                      |
| `LAUNCH_CONTENT_APPROVED_BY`         | No      | Yes        | Named person who approved production content                    |
| `LAUNCH_OPERATIONS_OWNER`            | No      | Yes        | Named person responsible for operational response               |
| `LAUNCH_SECURITY_CONTACT`            | No      | Yes        | Named security contact                                          |
| `LAUNCH_UAT_SIGNED_OFF_BY`           | No      | Yes        | Named person who accepted final UAT                             |

Keep Preview and Production on separate Supabase projects when realistic preview testing may modify data. If they must share a project temporarily, do not run UAT seeds or destructive rehearsal commands from Preview.

## Database And Migration Behavior

`pnpm vercel:build` performs these gates in order:

1. validates production variables without printing their values
2. applies committed forward migrations using `DATABASE_MIGRATION_URL`
3. builds the Next.js application using `DATABASE_URL`

Use the transaction pooler for serverless runtime traffic. Use the session pooler for migrations and logical backups. Do not use `push: true` in production; schema changes must remain committed migrations.

Before the first deployment, confirm `pnpm db:rehearse` passes against the isolated local rehearsal database. Do not point the rehearsal script at Supabase unless its explicit remote-rehearsal override is intentionally enabled for a disposable project.

## Storage Gate

Follow [supabase-storage-operations.md](/Users/shuvomahamud/Projects/RUET_Website/docs/supabase-storage-operations.md). The bucket must remain private. Confirm upload, authenticated read, anonymous denial, and deletion before promotion.

## Email And Google Gate

Before promotion:

1. Verify the sending domain and from address in Resend.
2. Send signup verification and password-reset messages to an approved mailbox.
3. Confirm Payload records delivery metadata without bodies or credentials.
4. If Google sign-in is enabled, add `https://PRODUCTION_DOMAIN/api/auth/google/callback` to the Google OAuth client.
5. If Google sign-in is enabled, test new Google signup, same-email linking, logout, and revoked/inactive account behavior.

## Scheduled Jobs

The authenticated endpoint is `GET /api/cron/jobs`. Supabase Cron calls it every five minutes with `Authorization: Bearer $CRON_SECRET`. Vercel's paid cron service is not used, and `vercel.json` intentionally contains no cron declaration.

The hosted Supabase project already has `pg_cron` and `pg_net` enabled. The setup utility stores the endpoint and bearer credential encrypted in Supabase Vault, then creates one idempotently named job:

```bash
pnpm supabase:cron:configure
pnpm supabase:cron:status
```

Run `configure` only after `NEXT_PUBLIC_SITE_URL` contains the final public HTTPS deployment URL and the same `CRON_SECRET` is installed in Vercel. It defaults to `*/5 * * * *`; an operator may temporarily set `SUPABASE_CRON_SCHEDULE` to another five-field numeric expression when configuring. Do not enable `JOBS_AUTORUN` on Vercel, expose the secret to browser code, or run job processing from login requests.

For rollback or maintenance:

```bash
pnpm supabase:cron:disable
```

Disabling unschedules the job but retains its encrypted Vault values so it can be restored safely.

After deployment, confirm the endpoint returns `401` without a secret and `200` with the correct secret. Confirm new schedule/job records appear and no queue remains older than the expected interval.

## First Deployment

1. Confirm `pnpm audit:launch` passes against the intended production database.
2. Confirm `pnpm verify`, browser tests, accessibility tests, and performance assertions pass.
3. Confirm the Git working tree contains only reviewed project changes and the secret scan passes.
4. Push the reviewed commit to GitHub `main`.
5. Watch the Vercel build logs for environment validation, all migrations, and the Next.js build.
6. Set the final URL locally, run `pnpm supabase:cron:configure`, and confirm `pnpm supabase:cron:status` reports an active job.
7. Open `/api/health`; expect `200` with `{ "status": "ok" }`.
8. Test `/`, `/admin`, login, signup, content pages, one upload, and one controlled Zelle proof workflow.
9. Test email delivery, job execution, proof privacy, and admin access; test the Google callback only if Google sign-in is enabled.
10. Record the deployed commit, approver, time, and smoke-test result.

## Monitoring

Use Vercel runtime/build logs and observability for response errors and latency. Operational owners must also monitor:

- health-check failures
- repeated `5xx` responses
- failed Payload jobs and stale queues
- failed `emailDeliveries`
- Resend bounces or sender errors
- Supabase database/storage capacity and connection errors
- failed authentication, payment-review, and retention audit events

Never log passwords, database URLs, storage keys, Google/Resend secrets, proof images, transaction identifiers, or email bodies.

## Backup And Restore

Enable and review the Supabase project's managed backup policy before launch. For an additional logical snapshot, use `pg_dump` with the session-pooler or supported direct connection and store the encrypted artifact outside the repository.

Restore only into a separate recovery project first. Apply application migrations, compare migration and core-record counts, verify authentication/content/payment history, and run smoke tests before deciding on a production cutover. Storage objects require their own inventory/backup procedure; a database-only dump is not a complete file backup.

## Rollback And Incident Response

For an application regression, redeploy the last known-good Vercel commit. Do not automatically run migration `down` files against production: application rollbacks must remain compatible with already-applied forward schema changes.

For a data incident:

1. stop the affected workflow or cron without deleting evidence
2. record the incident time, commit, affected records, and owner
3. rotate exposed credentials immediately
4. preserve Vercel, Payload audit, Supabase, and provider logs
5. restore into an isolated project and verify before any cutover
6. notify the named security and operations contacts

The release is not production-ready while `pnpm audit:launch` fails, any required Vercel variable is absent, the Supabase Cron job is inactive, or final UAT lacks a named sign-off.
