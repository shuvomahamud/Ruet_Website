import { timingSafeEqual } from 'node:crypto'

import config from '@payload-config'
import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'

import { env } from '@/utilities/env'

export const dynamic = 'force-dynamic'
export const maxDuration = 60
export const runtime = 'nodejs'

const authorized = (request: Request): boolean => {
  if (!env.CRON_SECRET) return false

  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) return false

  const supplied = Buffer.from(authorization.slice('Bearer '.length))
  const expected = Buffer.from(env.CRON_SECRET)
  return supplied.length === expected.length && timingSafeEqual(supplied, expected)
}

const runJobs = async (request: Request): Promise<Response> => {
  if (!env.CRON_SECRET) {
    return Response.json({ message: 'The job runner is not configured.' }, { status: 503 })
  }
  if (!authorized(request)) {
    return Response.json({ message: 'Unauthorized.' }, { status: 401 })
  }

  try {
    const payload = await getPayload({ config })
    const schedules = await payload.jobs.handleSchedules({ allQueues: true })
    const jobs = await payload.jobs.run({
      allQueues: true,
      limit: 25,
      processingOrder: 'createdAt',
      silent: true,
    })

    // The hashed rate-limit keys contain no user data and are disposable after
    // their fixed window. Cleanup piggybacks on the already authenticated cron.
    const database = payload.db as unknown as PostgresAdapter
    await database.drizzle.execute(sql`
      DELETE FROM "rate_limit_buckets"
      WHERE "reset_at" < NOW() - INTERVAL '1 day'
    `)

    return Response.json(
      {
        jobs: {
          noJobsRemaining: jobs.noJobsRemaining ?? false,
          remainingFromBatch: jobs.remainingJobsFromQueried,
        },
        schedules: {
          errored: schedules.errored.length,
          queued: schedules.queued.length,
          skipped: schedules.skipped.length,
        },
        status: 'ok',
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (error) {
    console.error('Scheduled job invocation failed.', error)
    return Response.json(
      { message: 'Scheduled work could not be completed.', status: 'error' },
      { headers: { 'Cache-Control': 'private, no-store' }, status: 500 },
    )
  }
}

export const GET = runJobs
export const POST = runJobs
