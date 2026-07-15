import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const validator = resolve('scripts/validate-production-env.mjs')

const validEnvironment = {
  ...process.env,
  CRON_SECRET: 'cron-secret-with-at-least-thirty-two-characters',
  DATABASE_MIGRATION_URL:
    'postgresql://migration-user:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
  DATABASE_URL:
    'postgresql://runtime-user:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres',
  EMAIL_FROM_ADDRESS: 'no-reply@ruetianusa.org',
  EMAIL_TRANSPORT: 'resend',
  GOOGLE_CLIENT_ID: 'google-client.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'google-client-secret-value',
  JOBS_AUTORUN: 'false',
  NEXT_PUBLIC_SITE_URL: 'https://ruetianusa.org',
  PAYLOAD_SECRET: 'payload-secret-with-at-least-thirty-two-characters',
  RESEND_API_KEY: 're_valid_sending_key',
  STORAGE_PROVIDER: 'supabase',
  SUPABASE_STORAGE_ACCESS_KEY_ID: 'storage-access-key-id',
  SUPABASE_STORAGE_BUCKET: 'ruetian-usa',
  SUPABASE_STORAGE_ENDPOINT: 'https://projectref.storage.supabase.co/storage/v1/s3',
  SUPABASE_STORAGE_REGION: 'us-east-1',
  SUPABASE_STORAGE_SECRET_ACCESS_KEY: 'storage-secret-access-key',
  VERCEL: '1',
  VERCEL_ENV: 'production',
}

const validate = (overrides: Record<string, string | undefined> = {}) =>
  spawnSync(process.execPath, [validator], {
    encoding: 'utf8',
    env: { ...validEnvironment, ...overrides },
  })

describe('production environment validation', () => {
  it('accepts a complete Supabase Storage configuration', () => {
    const result = validate()

    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toContain('Production environment validation passed')
  })

  it('accepts production without the optional Google OAuth integration', () => {
    const result = validate({
      GOOGLE_CLIENT_ID: undefined,
      GOOGLE_CLIENT_SECRET: undefined,
    })

    expect(result.status, result.stderr).toBe(0)
  })

  it('rejects a partially configured Google OAuth integration', () => {
    const result = validate({ GOOGLE_CLIENT_SECRET: undefined })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('must either both be set or both be omitted')
  })

  it('rejects the former generic S3 provider configuration', () => {
    const result = validate({ STORAGE_PROVIDER: 's3' })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('STORAGE_PROVIDER must be supabase')
  })

  it('rejects a non-Supabase or malformed storage endpoint', () => {
    const result = validate({
      SUPABASE_STORAGE_ENDPOINT: 'https://storage.invalid.example/bucket',
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('direct Supabase Storage hostname')
    expect(result.stderr).toContain('/storage/v1/s3')
  })
})
