import { z } from 'zod'

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== 'string') return value

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const stringToBoolean = (value: unknown) => {
  if (typeof value !== 'string') return value
  if (value.toLowerCase() === 'true') return true
  if (value.toLowerCase() === 'false' || value.trim() === '') return false
  return value
}

const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required.'),
    EMAIL_FROM_ADDRESS: z.preprocess(emptyToUndefined, z.string().email().optional()),
    EMAIL_FROM_NAME: z.preprocess(emptyToUndefined, z.string().max(120).default('RUETIAN USA')),
    EMAIL_TRANSPORT: z.preprocess(
      emptyToUndefined,
      z.enum(['capture', 'resend']).default('capture'),
    ),
    GOOGLE_CLIENT_ID: z.preprocess(emptyToUndefined, z.string().optional()),
    GOOGLE_CLIENT_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
    JOBS_AUTORUN: z.preprocess(stringToBoolean, z.boolean().default(false)),
    JOBS_POLL_CRON: z.preprocess(emptyToUndefined, z.string().default('*/30 * * * * *')),
    NEXT_PUBLIC_SITE_URL: z.preprocess(
      emptyToUndefined,
      z.string().url().default('http://localhost:3000'),
    ),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PAYLOAD_SECRET: z.string().min(32, 'PAYLOAD_SECRET must be at least 32 characters long.'),
    RESEND_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
    S3_ACCESS_KEY_ID: z.preprocess(emptyToUndefined, z.string().optional()),
    S3_BUCKET: z.preprocess(emptyToUndefined, z.string().optional()),
    S3_ENDPOINT: z.preprocess(emptyToUndefined, z.string().optional()),
    S3_REGION: z.preprocess(emptyToUndefined, z.string().optional()),
    S3_SECRET_ACCESS_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
    STORAGE_PROVIDER: z.preprocess(emptyToUndefined, z.string().optional()),
  })
  .superRefine((data, context) => {
    if (data.EMAIL_TRANSPORT !== 'resend') return
    if (!data.RESEND_API_KEY) {
      context.addIssue({
        code: 'custom',
        message: 'RESEND_API_KEY is required when EMAIL_TRANSPORT=resend.',
        path: ['RESEND_API_KEY'],
      })
    }
    if (!data.EMAIL_FROM_ADDRESS) {
      context.addIssue({
        code: 'custom',
        message: 'EMAIL_FROM_ADDRESS is required when EMAIL_TRANSPORT=resend.',
        path: ['EMAIL_FROM_ADDRESS'],
      })
    }
  })

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const messages = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)

  throw new Error(`Invalid environment configuration:\n${messages.join('\n')}`)
}

export const env = parsed.data

export const integrationStatus = {
  database: true,
  email: env.EMAIL_TRANSPORT === 'resend',
  googleAuth: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  storage: Boolean(env.STORAGE_PROVIDER),
}
