import { z } from 'zod'

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== 'string') return value

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required.'),
  EMAIL_FROM_ADDRESS: z.preprocess(emptyToUndefined, z.string().email().optional()),
  GOOGLE_CLIENT_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  GOOGLE_CLIENT_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
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

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const messages = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`)

  throw new Error(`Invalid environment configuration:\n${messages.join('\n')}`)
}

export const env = parsed.data

export const integrationStatus = {
  database: true,
  email: Boolean(env.RESEND_API_KEY && env.EMAIL_FROM_ADDRESS),
  googleAuth: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
  storage: Boolean(env.STORAGE_PROVIDER),
}
