import { createHash } from 'node:crypto'

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

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
}): void => {
  const now = Date.now()
  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  if (existing.count >= limit) {
    throw new RateLimitError(Math.max(1, Math.ceil((existing.resetAt - now) / 1000)))
  }

  existing.count += 1

  if (buckets.size > 2_000) {
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(bucketKey)
    }
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
