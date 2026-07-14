import config from '@payload-config'
import { createLocalReq, getPayload } from 'payload'

import { getRole } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import { chapterRequestReviewSchema } from '@/chapter-requests/schema'
import { reviewChapterRequest } from '@/services/chapter-request-review'
import { AppError } from '@/utilities/errors'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request.headers)
  if (!user) return Response.json({ message: 'Sign in to continue.' }, { status: 401 })
  if (getRole(user) !== 'superAdmin') {
    return Response.json(
      { message: 'You are not authorized to review chapter requests.' },
      { status: 403 },
    )
  }

  const input = chapterRequestReviewSchema.safeParse(await request.json())
  const { id } = await params
  const requestID = Number(id)
  if (!input.success || !Number.isSafeInteger(requestID) || requestID < 1) {
    return Response.json({ message: 'Check the review details.' }, { status: 400 })
  }

  try {
    const payload = await getPayload({ config })
    const req = await createLocalReq({ user }, payload)
    const result = await reviewChapterRequest({ ...input.data, req, requestID })
    return Response.json({
      message: result.idempotent
        ? 'This decision was already recorded.'
        : 'The chapter request was reviewed.',
    })
  } catch (error) {
    const status = error instanceof AppError ? error.status : 400
    return Response.json(
      { message: error instanceof Error ? error.message : 'The review could not be completed.' },
      { status },
    )
  }
}
