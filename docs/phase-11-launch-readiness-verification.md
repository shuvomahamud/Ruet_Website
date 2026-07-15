# Phase 11 Launch Readiness Verification

Updated: 2026-07-14

Status: `In progress — technically deployable, not launch approved`

## Implemented And Verified

- Vercel install and build configuration with Node 22, frozen pnpm installation, production-variable validation, forward migrations, and Next.js build
- Supabase transaction-pooler runtime connectivity on port 6543
- Supabase session-pooler migration connectivity on port 5432
- 18 committed migrations applied to the hosted Supabase database
- private Supabase Storage upload, read, delete, deletion confirmation, and anonymous-denial checks
- authenticated `/api/cron/jobs` runner and database-backed `/api/health`
- Supabase `pg_cron` and `pg_net` enabled, with an idempotent Vault-backed configuration utility and no paid Vercel cron dependency
- persistent PostgreSQL rate limiting suitable for serverless replicas
- private 4 MiB proof uploads with MIME validation and negative access coverage
- configurable payment-proof deletion, defaulting to 180 days after a final decision
- clean-database migration and backup/restore rehearsal
- CI, tracked-secret scanning, accessibility checks, Lighthouse thresholds, and security headers
- exact `pnpm vercel:build` success using the real Supabase database and storage connections
- compatibility with Vercel's real `VERCEL=1` environment value

Latest automated evidence:

- lint: passed
- typecheck: passed
- integration: 68/68 passed
- accessibility: passed across the public route matrix at desktop and mobile sizes
- Lighthouse: passed all configured assertions across six representative routes
- production build: passed
- exact Vercel build pipeline: passed, including production validation and migration check
- tracked-secret scan: passed

## Hosted Launch Audit

Passing:

- Site Settings published
- primary organization email populated
- manual-review and proof-retention policies configured
- exactly one active membership plan
- approved legal pages published
- active chapters published
- verified active super administrator

Blocking:

- sample chapter-support email, phone, mailing address, and Zelle recipient
- sample chapter copy/contact markers
- sample footer social destinations
- no separate verified least-privilege administrator
- no named content approver, operations owner, security contact, or UAT signer

`pnpm audit:launch` intentionally exits nonzero while any blocker remains.

## External Deployment Inputs

- valid Vercel CLI/account login or dashboard project linkage; the cached local token is invalid and `.vercel/project.json` does not exist
- production `DATABASE_URL`, `DATABASE_MIGRATION_URL`, `NEXT_PUBLIC_SITE_URL`, and `CRON_SECRET` installed in Vercel
- verified Resend domain, sending key, and live mailbox test
- Google OAuth client, production callback, and live login test
- final public HTTPS URL, followed by activation and live verification of the prepared Supabase Cron job
- replacement of sample content and named launch sign-off

## Release Rule

A GitHub push may trigger a technical deployment after the Vercel project and variables are configured, but it must not be promoted or represented as the live approved website until the hosted launch audit and final UAT pass. See [vercel-supabase-launch-runbook.md](/Users/shuvomahamud/Projects/RUET_Website/docs/vercel-supabase-launch-runbook.md).
