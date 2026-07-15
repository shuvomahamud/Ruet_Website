import { createHash } from 'node:crypto'

import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import config from '@payload-config'
import { getPayload } from 'payload'

export class RateLimitError extends Error {
  retryAfterSeconds: number

  constructor(retryAfterSeconds: number) {
    super('Too many requests. Please try again later.')
    this.name = 'RateLimitError'
    this.retryAfterSeconds = retryAfterSeconds
  }
}

export const getRequestAddress = (request: Request): string =>
  request.headers.get('cf-connecting-ip') ||
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  'local'

export const rateLimitKey = (...parts: Array<string | undefined>): string =>
  createHash('sha256')
    .update(parts.map((part) => part?.trim().toLowerCase() || '-').join('|'))
    .digest('hex')

export const enforceRateLimit = ({
  key,
  limit,
  windowMs,
}: {
  key: string
  limit: number
  windowMs: number
}): Promise<void> => {
  return enforceDatabaseRateLimit({ key, limit, windowMs })
}

const enforceDatabaseRateLimit = async ({
  key,
  limit,
  windowMs,
}: {
  key: string
  limit: number
  windowMs: number
}): Promise<void> => {
  const now = Date.now()
  const nowDate = new Date(now)
  const nextReset = new Date(now + windowMs)
  const payload = await getPayload({ config })
  const database = payload.db as unknown as PostgresAdapter
  const result = await database.drizzle.execute(sql`
    INSERT INTO "rate_limit_buckets" ("key", "count", "reset_at")
    VALUES (${key}, 1, ${nextReset})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "rate_limit_buckets"."reset_at" <= ${nowDate} THEN 1
        ELSE "rate_limit_buckets"."count" + 1
      END,
      "reset_at" = CASE
        WHEN "rate_limit_buckets"."reset_at" <= ${nowDate} THEN ${nextReset}
        ELSE "rate_limit_buckets"."reset_at"
      END
    RETURNING "count", "reset_at"
  `)
  const row = result.rows[0] as { count?: number | string; reset_at?: Date | string } | undefined

  if (!row?.count || !row.reset_at) {
    throw new Error('The rate-limit counter could not be updated.')
  }

  const count = Number(row.count)
  const resetAt = new Date(row.reset_at).getTime()
  if (count > limit) {
    throw new RateLimitError(Math.max(1, Math.ceil((resetAt - now) / 1000)))
  }
}

export const rateLimitResponse = (error: RateLimitError): Response =>
  Response.json(
    { message: error.message },
    {
      headers: { 'Retry-After': String(error.retryAfterSeconds) },
      status: 429,
    },
  )
