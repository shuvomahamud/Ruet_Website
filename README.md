# RUETIAN USA Website

RUETIAN USA membership, chapter, event, learning, and administration website.

Current stack:

- `Next.js`
- `Payload CMS`
- local `PostgreSQL` for development
- Supabase Postgres, private Supabase Storage, and Supabase Cron for production
- `pnpm`

## User documentation

- [Complete website user guide](docs/website-user-guide.md)
- [Editable sample content guide](docs/sample-content-guide.md)

## Current implementation status

The codebase is now:

- fully implemented through `A-01` to `B-08`
- partially implemented in later public-shell/content tasks as tracked in:
  - [developer-task-list.md](/Users/shuvomahamud/Projects/RUET_Website/docs/developer-task-list.md)
  - [developer-task-status.csv](/Users/shuvomahamud/Projects/RUET_Website/docs/developer-task-status.csv)
  - [remaining-implementation-roadmap.md](/Users/shuvomahamud/Projects/RUET_Website/docs/remaining-implementation-roadmap.md)

Important current implementation notes:

- core public page copy for `about`, `membership`, `chapters`, `events`, `learning`, `contact`, and legal pages is now managed in the `Pages` collection
- those CMS pages can be seeded with:

```bash
pnpm seed:cms-pages
```

- the header logo auto-detects a file placed in:
  - [public/brand](/Users/shuvomahamud/Projects/RUET_Website/public/brand)
- supported logo names are:
  - `ruetian-usa-logo.svg`
  - `ruetian-usa-logo.png`
  - `ruetian-usa-logo.webp`
  - `ruetian-usa-logo.jpg`
  - `ruetian-usa-logo.jpeg`

## Local setup

1. Copy `.env.example` to `.env`.
2. Update `DATABASE_URL` if your local PostgreSQL user or port is different.
3. Install dependencies:

```bash
nvm use
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

4. Ensure the database exists:

```bash
pnpm db:ensure
```

5. Run the initial migrations and regenerate types:

```bash
pnpm bootstrap
```

6. Seed the CMS page records used by the public informational routes:

```bash
pnpm seed:cms-pages
```

7. Start the app:

```bash
pnpm dev
```

8. Open:

- public site: `http://localhost:3000`
- admin panel: `http://localhost:3000/admin`

## First admin user

On first visit to `/admin`, Payload will prompt you to create the initial admin account.

## Required local prerequisites

- Node.js `22.22.0` (pinned in `.nvmrc` and `.node-version`)
- `pnpm 10.x` (`10.29.2` recorded in `package.json`)
- local PostgreSQL server running on your machine
- `psql` CLI available in your shell

## What you still need to provide later

The remaining production integrations require:

- optional Google OAuth credentials, if Google sign-in will be enabled
- final Zelle recipient details and payment instructions to replace samples
- email provider credentials
- Supabase Storage bucket and server-side S3-protocol credentials
- stakeholder review of the installed standard legal policies

## Helpful commands

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test:int
pnpm test:e2e
pnpm verify
pnpm db:migrate
pnpm generate:types
pnpm generate:importmap
pnpm seed:cms-pages
pnpm audit:sample
pnpm supabase:cron:status
```

Production uploads use private Supabase Storage. Setup and rotation instructions are in [supabase-storage-operations.md](/Users/shuvomahamud/Projects/RUET_Website/docs/supabase-storage-operations.md).

Vercel deployment, environment, migration, cron, monitoring, backup, and rollback instructions are in [vercel-supabase-launch-runbook.md](/Users/shuvomahamud/Projects/RUET_Website/docs/vercel-supabase-launch-runbook.md).

## Reproducible verification

With PostgreSQL running and `.env` configured:

```bash
nvm use
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm verify
pnpm test:e2e
```

Phase-by-phase verification evidence is recorded in [phase-0-verification.md](/Users/shuvomahamud/Projects/RUET_Website/docs/phase-0-verification.md).
