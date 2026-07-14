import config from '@payload-config'
import { getPayload } from 'payload'

import { authenticateRequest } from '@/auth/current-user'
import {
  enforceRateLimit,
  rateLimitKey,
  rateLimitResponse,
  RateLimitError,
} from '@/auth/rate-limit'
import { chapterRequestSchema } from '@/chapter-requests/schema'

export async function POST(request: Request) {
  const user = await authenticateRequest(request.headers)
  if (!user) return Response.json({ message: 'Sign in to continue.' }, { status: 401 })

  try {
    enforceRateLimit({
      key: rateLimitKey('chapter-request', String(user.id)),
      limit: 3,
      windowMs: 24 * 60 * 60 * 1000,
    })
    const input = chapterRequestSchema.safeParse(await request.json())
    if (!input.success) {
      return Response.json(
        { issues: input.error.flatten().fieldErrors, message: 'Check the submitted details.' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })
    const duplicate = await payload.find({
      collection: 'chapterRequests',
      limit: 1,
      overrideAccess: false,
      user,
      where: {
        and: [
          { requestedName: { equals: input.data.requestedName } },
          { status: { equals: 'pending' } },
        ],
      },
    })
    if (duplicate.docs.length) {
      return Response.json(
        { message: 'You already have a pending request with this name.' },
        { status: 409 },
      )
    }

    await payload.create({
      collection: 'chapterRequests',
      data: { ...input.data, requester: user.id, status: 'pending' },
      overrideAccess: false,
      user,
    })
    return Response.json(
      { message: 'Your chapter request has been submitted for review.' },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof RateLimitError) return rateLimitResponse(error)
    return Response.json(
      { message: 'The chapter request could not be submitted.' },
      { status: 500 },
    )
  }
}
