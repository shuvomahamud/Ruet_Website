import { spawnSync } from 'node:child_process'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('DATABASE_URL is required before running db:ensure.')
  process.exit(1)
}

let databaseUrl

try {
  databaseUrl = new URL(connectionString)
} catch {
  console.error('DATABASE_URL is not a valid connection string.')
  process.exit(1)
}

const databaseName = databaseUrl.pathname.replace(/^\//, '')

if (!databaseName) {
  console.error('DATABASE_URL must include a database name.')
  process.exit(1)
}

const args = []

if (databaseUrl.hostname) args.push('-h', databaseUrl.hostname)
if (databaseUrl.port) args.push('-p', databaseUrl.port)
if (databaseUrl.username) args.push('-U', decodeURIComponent(databaseUrl.username))

const sharedEnv = {
  ...process.env,
  PGPASSWORD: databaseUrl.password ? decodeURIComponent(databaseUrl.password) : process.env.PGPASSWORD,
}

const existsResult = spawnSync(
  'psql',
  [...args, '-d', 'postgres', '-tAc', `SELECT 1 FROM pg_database WHERE datname = '${databaseName}'`],
  {
    env: sharedEnv,
    encoding: 'utf8',
  },
)

if (existsResult.status !== 0) {
  process.exit(existsResult.status ?? 1)
}

if (existsResult.stdout.trim() === '1') {
  console.log(`Database "${databaseName}" is ready.`)
  process.exit(0)
}

const createResult = spawnSync('createdb', [...args, databaseName], {
  env: {
    ...sharedEnv,
  },
  stdio: 'inherit',
})

if (createResult.status !== 0) {
  process.exit(createResult.status ?? 1)
}

console.log(`Database "${databaseName}" is ready.`)
