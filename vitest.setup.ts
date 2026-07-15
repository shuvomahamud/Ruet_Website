import 'dotenv/config'

const databaseURL = process.env.DATABASE_URL
if (databaseURL && process.env.ALLOW_REMOTE_INTEGRATION_TESTS !== 'true') {
  const hostname = new URL(databaseURL).hostname
  const localHosts = new Set(['127.0.0.1', '::1', 'localhost'])

  if (!localHosts.has(hostname)) {
    throw new Error(
      'Integration tests are restricted to local PostgreSQL. Use an isolated test project and ALLOW_REMOTE_INTEGRATION_TESTS=true only when remote testing is intentional.',
    )
  }
}

process.env.CRON_SECRET ??= 'integration-test-cron-secret-at-least-32-characters'
