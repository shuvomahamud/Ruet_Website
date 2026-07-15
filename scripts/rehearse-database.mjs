import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    env: options.env ?? process.env,
    encoding: options.capture ? 'utf8' : undefined,
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  })

  if (result.error) throw result.error
  if (result.status !== 0) {
    if (options.capture && result.stderr) console.error(result.stderr.trim())
    throw new Error(`${command} exited with status ${result.status}.`)
  }
  return options.capture ? result.stdout.trim() : ''
}

const sourceConnection = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL
if (!sourceConnection) {
  console.error('DATABASE_URL or DATABASE_MIGRATION_URL is required.')
  process.exit(1)
}

let parsed
try {
  parsed = new URL(sourceConnection)
} catch {
  console.error('The database rehearsal connection string is not a valid URL.')
  process.exit(1)
}

const localHosts = new Set(['127.0.0.1', '::1', 'localhost'])
if (!localHosts.has(parsed.hostname) && process.env.ALLOW_REMOTE_DATABASE_REHEARSAL !== 'true') {
  console.error(
    'Remote rehearsal is disabled. Use an isolated staging server and set ALLOW_REMOTE_DATABASE_REHEARSAL=true explicitly.',
  )
  process.exit(1)
}

const nonce = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
const sourceName = `ruet_rehearsal_${nonce}`
const restoreName = `ruet_restore_${nonce}`
const maintenanceURL = new URL(sourceConnection)
maintenanceURL.pathname = '/postgres'
maintenanceURL.search = ''

const databaseURL = (name) => {
  const value = new URL(sourceConnection)
  value.pathname = `/${name}`
  value.search = ''
  return value.toString()
}

const sourceURL = databaseURL(sourceName)
const restoreURL = databaseURL(restoreName)
const workDir = mkdtempSync(join(tmpdir(), 'ruet-db-rehearsal-'))
const backupPath = join(workDir, 'backup.dump')
const payloadCLI = resolve('node_modules/payload/bin.js')

const cleanup = () => {
  for (const database of [restoreName, sourceName]) {
    spawnSync(
      'dropdb',
      ['--if-exists', '--force', '--maintenance-db', maintenanceURL.toString(), database],
      { stdio: 'ignore' },
    )
  }
  rmSync(workDir, { force: true, recursive: true })
}

const snapshot = (connection) =>
  run(
    'psql',
    [
      '--dbname',
      connection,
      '--no-align',
      '--tuples-only',
      '--command',
      `SELECT json_build_object(
        'migrations', (SELECT COUNT(*) FROM payload_migrations),
        'pages', (SELECT COUNT(*) FROM pages),
        'chapters', (SELECT COUNT(*) FROM chapters),
        'committees', (SELECT COUNT(*) FROM committee_terms),
        'plans', (SELECT COUNT(*) FROM membership_plans)
      )::text;`,
    ],
    { capture: true },
  )

try {
  run('createdb', ['--maintenance-db', maintenanceURL.toString(), sourceName])
  const sourceEnv = {
    ...process.env,
    DATABASE_URL: sourceURL,
    EMAIL_TRANSPORT: 'capture',
    NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3000',
    STORAGE_PROVIDER: 'local',
  }

  run(process.execPath, [payloadCLI, 'migrate'], { env: sourceEnv })
  run('pnpm', ['seed:sample'], { env: sourceEnv })
  run('pnpm', ['audit:sample'], { env: sourceEnv })
  const before = snapshot(sourceURL)

  run('pg_dump', [
    '--dbname',
    sourceURL,
    '--file',
    backupPath,
    '--format=custom',
    '--no-owner',
    '--no-privileges',
  ])
  run('createdb', ['--maintenance-db', maintenanceURL.toString(), restoreName])
  run('pg_restore', [
    '--dbname',
    restoreURL,
    '--no-owner',
    '--no-privileges',
    '--exit-on-error',
    backupPath,
  ])
  const after = snapshot(restoreURL)

  if (before !== after) throw new Error('The restored database snapshot does not match the source.')
  console.log(`Database migration, sample seed, backup, and restore rehearsal passed: ${after}`)
} finally {
  cleanup()
}
