const errors = []

const required = (name) => {
  const value = process.env[name]?.trim()
  if (!value) errors.push(`${name} is required.`)
  return value
}

const rejectPlaceholder = (name, value) => {
  if (value && /(replace|example|your[-_]|localhost|127\.0\.0\.1)/i.test(value)) {
    errors.push(`${name} still contains a local or placeholder value.`)
  }
}

const databaseURL = required('DATABASE_URL')
if (databaseURL) {
  try {
    const parsed = new URL(databaseURL)
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
      errors.push('DATABASE_URL must use the postgres or postgresql protocol.')
    }
    rejectPlaceholder('DATABASE_URL', parsed.hostname)
  } catch {
    errors.push('DATABASE_URL must be a valid PostgreSQL URL.')
  }
}

const migrationURL = required('DATABASE_MIGRATION_URL')
if (migrationURL) {
  try {
    const parsed = new URL(migrationURL)
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
      errors.push('DATABASE_MIGRATION_URL must use the postgres or postgresql protocol.')
    }
    rejectPlaceholder('DATABASE_MIGRATION_URL', parsed.hostname)
  } catch {
    errors.push('DATABASE_MIGRATION_URL must be a valid PostgreSQL URL.')
  }
}

const siteURL = required('NEXT_PUBLIC_SITE_URL')
if (siteURL) {
  try {
    const parsed = new URL(siteURL)
    if (parsed.protocol !== 'https:') errors.push('NEXT_PUBLIC_SITE_URL must use HTTPS.')
    rejectPlaceholder('NEXT_PUBLIC_SITE_URL', parsed.hostname)
  } catch {
    errors.push('NEXT_PUBLIC_SITE_URL must be a valid URL.')
  }
}

for (const secretName of ['PAYLOAD_SECRET', 'CRON_SECRET']) {
  const value = required(secretName)
  if (value && value.length < 32) errors.push(`${secretName} must contain at least 32 characters.`)
  rejectPlaceholder(secretName, value)
}

if (
  process.env.PAYLOAD_SECRET &&
  process.env.CRON_SECRET &&
  process.env.PAYLOAD_SECRET === process.env.CRON_SECRET
) {
  errors.push('PAYLOAD_SECRET and CRON_SECRET must be different secrets.')
}

if (process.env.EMAIL_TRANSPORT !== 'resend') {
  errors.push('EMAIL_TRANSPORT must be resend in a deployable environment.')
}
for (const name of ['RESEND_API_KEY', 'EMAIL_FROM_ADDRESS']) {
  rejectPlaceholder(name, required(name))
}

const googleClientID = process.env.GOOGLE_CLIENT_ID?.trim()
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
if (Boolean(googleClientID) !== Boolean(googleClientSecret)) {
  errors.push('GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must either both be set or both be omitted.')
}
for (const [name, value] of [
  ['GOOGLE_CLIENT_ID', googleClientID],
  ['GOOGLE_CLIENT_SECRET', googleClientSecret],
]) {
  rejectPlaceholder(name, value)
}

if (process.env.STORAGE_PROVIDER !== 'supabase') {
  errors.push('STORAGE_PROVIDER must be supabase in a deployable environment.')
}
for (const name of [
  'SUPABASE_STORAGE_BUCKET',
  'SUPABASE_STORAGE_REGION',
  'SUPABASE_STORAGE_ACCESS_KEY_ID',
  'SUPABASE_STORAGE_SECRET_ACCESS_KEY',
]) {
  rejectPlaceholder(name, required(name))
}

const storageEndpoint = required('SUPABASE_STORAGE_ENDPOINT')
if (storageEndpoint) {
  try {
    const parsed = new URL(storageEndpoint)
    if (parsed.protocol !== 'https:') {
      errors.push('SUPABASE_STORAGE_ENDPOINT must use HTTPS.')
    }
    if (!parsed.hostname.endsWith('.storage.supabase.co')) {
      errors.push('SUPABASE_STORAGE_ENDPOINT must use the direct Supabase Storage hostname.')
    }
    if (parsed.pathname.replace(/\/$/, '') !== '/storage/v1/s3') {
      errors.push('SUPABASE_STORAGE_ENDPOINT must end with /storage/v1/s3.')
    }
  } catch {
    errors.push('SUPABASE_STORAGE_ENDPOINT must be a valid URL.')
  }
}

if (process.env.JOBS_AUTORUN === 'true') {
  errors.push(
    'JOBS_AUTORUN must be false on serverless deployments; Supabase Cron invokes the authenticated job route.',
  )
}

if (errors.length) {
  console.error('Production environment validation failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log('Production environment validation passed without printing secret values.')
