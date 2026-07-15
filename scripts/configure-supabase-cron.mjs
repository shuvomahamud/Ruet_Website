import { spawnSync } from 'node:child_process'

const JOB_NAME = 'ruet-website-jobs'
const URL_SECRET_NAME = 'ruet_website_jobs_url'
const AUTH_SECRET_NAME = 'ruet_website_cron_secret'
const DEFAULT_SCHEDULE = '*/5 * * * *'

const mode = process.argv[2] ?? 'configure'
const supportedModes = new Set(['configure', 'disable', 'install', 'status'])

if (!supportedModes.has(mode)) {
  console.error(`Unknown mode "${mode}". Use configure, disable, install, or status.`)
  process.exit(1)
}

const connectionString = process.env.DATABASE_MIGRATION_URL?.trim()
if (!connectionString) {
  console.error('DATABASE_MIGRATION_URL is required to manage Supabase Cron.')
  process.exit(1)
}

const authorityEnd = connectionString.lastIndexOf('@')
const hostStart = authorityEnd + 1
const hostEndCandidates = [
  connectionString.indexOf(':', hostStart),
  connectionString.indexOf('/', hostStart),
  connectionString.indexOf('?', hostStart),
].filter((index) => index >= 0)
const hostEnd = hostEndCandidates.length ? Math.min(...hostEndCandidates) : connectionString.length
const databaseHost =
  authorityEnd >= 0 ? connectionString.slice(hostStart, hostEnd).toLowerCase() : ''

if (!databaseHost.endsWith('.pooler.supabase.com') && !databaseHost.endsWith('.supabase.co')) {
  console.error('Supabase Cron management is restricted to a Supabase database connection.')
  process.exit(1)
}

const runSQL = (sql, extraEnvironment = {}) => {
  const result = spawnSync(
    'psql',
    [
      connectionString,
      '--no-psqlrc',
      '--set',
      'ON_ERROR_STOP=1',
      '--no-align',
      '--tuples-only',
      '--quiet',
    ],
    {
      encoding: 'utf8',
      env: { ...process.env, ...extraEnvironment, PAGER: 'cat' },
      input: sql,
    },
  )

  if (result.error) {
    console.error('Unable to start psql:', result.error.message)
    process.exit(1)
  }
  if (result.status !== 0) {
    console.error('Supabase Cron configuration failed.')
    if (result.stderr.trim()) console.error(result.stderr.trim())
    process.exit(result.status ?? 1)
  }

  return result.stdout.trim()
}

const installExtensions = () => {
  runSQL(`
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    CREATE EXTENSION IF NOT EXISTS pg_net;
  `)
  console.log('Supabase pg_cron and pg_net extensions are enabled.')
}

if (mode === 'install') {
  installExtensions()
  process.exit(0)
}

if (mode === 'status') {
  const extensions = runSQL(`
    SELECT 'extension|' || extname || '|' || extversion
    FROM pg_extension
    WHERE extname IN ('pg_cron', 'pg_net')
    ORDER BY extname;
  `)
  const job = extensions.includes('extension|pg_cron|')
    ? runSQL(`
        SELECT 'job|' || jobname || '|' || schedule || '|' || active
        FROM cron.job
        WHERE jobname = '${JOB_NAME}';
      `)
    : ''
  console.log(
    [extensions, job].filter(Boolean).join('\n') ||
      'No Supabase Cron installation or scheduled application job was found.',
  )
  process.exit(0)
}

installExtensions()

if (mode === 'disable') {
  runSQL(`
    SELECT cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = '${JOB_NAME}';
  `)
  console.log('The Supabase application job is disabled. Vault secrets were retained for rollback.')
  process.exit(0)
}

const siteURLValue = process.env.NEXT_PUBLIC_SITE_URL?.trim()
const cronSecret = process.env.CRON_SECRET?.trim()
const schedule = process.env.SUPABASE_CRON_SCHEDULE?.trim() || DEFAULT_SCHEDULE

let siteURL
try {
  siteURL = new URL(siteURLValue)
} catch {
  console.error(
    'NEXT_PUBLIC_SITE_URL must be a valid production URL before configuring Supabase Cron.',
  )
  process.exit(1)
}

if (
  siteURL.protocol !== 'https:' ||
  ['localhost', '127.0.0.1', '::1'].includes(siteURL.hostname) ||
  /(?:example|replace|your[-_])/i.test(siteURL.hostname)
) {
  console.error('NEXT_PUBLIC_SITE_URL must be the final public HTTPS deployment URL.')
  process.exit(1)
}
if (!cronSecret || cronSecret.length < 32) {
  console.error('CRON_SECRET must contain at least 32 characters.')
  process.exit(1)
}
if (!/^[0-9*,/\-]+(?:\s+[0-9*,/\-]+){4}$/.test(schedule)) {
  console.error('SUPABASE_CRON_SCHEDULE must be a five-field numeric cron expression.')
  process.exit(1)
}

const jobsURL = new URL('/api/cron/jobs', siteURL.origin).toString()

runSQL(
  `
    \\getenv jobs_url SUPABASE_CRON_JOBS_URL
    \\getenv cron_secret CRON_SECRET
    \\getenv cron_schedule SUPABASE_CRON_SCHEDULE

    SELECT vault.update_secret(
      id,
      :'jobs_url',
      '${URL_SECRET_NAME}',
      'Public HTTPS endpoint used by Supabase Cron to run RUETIAN USA application jobs.'
    )
    FROM vault.secrets
    WHERE name = '${URL_SECRET_NAME}';

    SELECT vault.create_secret(
      :'jobs_url',
      '${URL_SECRET_NAME}',
      'Public HTTPS endpoint used by Supabase Cron to run RUETIAN USA application jobs.'
    )
    WHERE NOT EXISTS (
      SELECT 1 FROM vault.secrets WHERE name = '${URL_SECRET_NAME}'
    );

    SELECT vault.update_secret(
      id,
      :'cron_secret',
      '${AUTH_SECRET_NAME}',
      'Bearer credential used only for the RUETIAN USA scheduled-jobs endpoint.'
    )
    FROM vault.secrets
    WHERE name = '${AUTH_SECRET_NAME}';

    SELECT vault.create_secret(
      :'cron_secret',
      '${AUTH_SECRET_NAME}',
      'Bearer credential used only for the RUETIAN USA scheduled-jobs endpoint.'
    )
    WHERE NOT EXISTS (
      SELECT 1 FROM vault.secrets WHERE name = '${AUTH_SECRET_NAME}'
    );

    SELECT cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = '${JOB_NAME}';

    SELECT cron.schedule(
      '${JOB_NAME}',
      :'cron_schedule',
      $job$
        SELECT net.http_get(
          url := (
            SELECT decrypted_secret
            FROM vault.decrypted_secrets
            WHERE name = '${URL_SECRET_NAME}'
            LIMIT 1
          ),
          headers := jsonb_build_object(
            'Accept', 'application/json',
            'Authorization', 'Bearer ' || (
              SELECT decrypted_secret
              FROM vault.decrypted_secrets
              WHERE name = '${AUTH_SECRET_NAME}'
              LIMIT 1
            )
          ),
          timeout_milliseconds := 55000
        );
      $job$
    );
  `,
  {
    CRON_SECRET: cronSecret,
    SUPABASE_CRON_JOBS_URL: jobsURL,
    SUPABASE_CRON_SCHEDULE: schedule,
  },
)

const status = runSQL(`
  SELECT jobname || '|' || schedule || '|' || active
  FROM cron.job
  WHERE jobname = '${JOB_NAME}';
`)

if (!status) {
  console.error('Supabase Cron did not return the configured job.')
  process.exit(1)
}

console.log(`Supabase Cron configured successfully: ${status}`)
console.log('No login-triggered job runner is required.')
