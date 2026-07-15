import { randomUUID } from 'node:crypto'

import { afterEach, describe, expect, it } from 'vitest'

import { enforceRateLimit, RateLimitError } from '@/auth/rate-limit'
import { getTestPayload } from '../helpers/payload'

const keys: string[] = []

const createKey = () => {
  const key = `test-${randomUUID()}`
  keys.push(key)
  return key
}

afterEach(async () => {
  if (!keys.length) return
  const payload = await getTestPayload()
  await payload.delete({
    collection: 'rateLimitBuckets',
    overrideAccess: true,
    where: { key: { in: keys.splice(0) } },
  })
})

describe('shared rate limiting', () => {
  it('allows the configured count and rejects the next request', async () => {
    const key = createKey()

    await expect(enforceRateLimit({ key, limit: 2, windowMs: 60_000 })).resolves.toBeUndefined()
    await expect(enforceRateLimit({ key, limit: 2, windowMs: 60_000 })).resolves.toBeUndefined()
    await expect(enforceRateLimit({ key, limit: 2, windowMs: 60_000 })).rejects.toBeInstanceOf(
      RateLimitError,
    )
  })

  it('updates concurrent requests atomically across a shared database row', async () => {
    const key = createKey()
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () => enforceRateLimit({ key, limit: 5, windowMs: 60_000 })),
    )

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(5)
    expect(
      results.filter(
        (result) => result.status === 'rejected' && result.reason instanceof RateLimitError,
      ),
    ).toHaveLength(5)
  })
})
