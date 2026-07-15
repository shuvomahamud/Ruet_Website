import { describe, expect, it } from 'vitest'

import { GET as runScheduledJobs } from '@/app/(frontend)/api/cron/jobs/route'
import { GET as healthCheck } from '@/app/(frontend)/api/health/route'

describe('launch operations routes', () => {
  it('reports database-backed application health without exposing details', async () => {
    const response = await healthCheck()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ status: 'ok' })
  })

  it('rejects an invalid scheduler bearer token', async () => {
    const response = await runScheduledJobs(
      new Request('http://localhost:3000/api/cron/jobs', {
        headers: { authorization: 'Bearer invalid-secret' },
      }),
    )

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ message: 'Unauthorized.' })
  })
})
