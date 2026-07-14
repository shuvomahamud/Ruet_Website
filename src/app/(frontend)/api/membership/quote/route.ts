import config from '@payload-config'
import { getPayload } from 'payload'

import { authenticateRequest } from '@/auth/current-user'
import {
  enforceRateLimit,
  rateLimitKey,
  rateLimitResponse,
  RateLimitError,
} from '@/auth/rate-limit'
import { membershipQuoteSchema } from '@/membership/schema'
import { calculateMembershipQuote } from '@/services/membership-checkout'
import { AppError } from '@/utilities/errors'

export async function POST(request: Request) {
  const user = await authenticateRequest(request.headers)
  if (!user) return Response.json({ message: 'Sign in to continue.' }, { status: 401 })

  try {
    enforceRateLimit({
      key: rateLimitKey('membership-quote', String(user.id)),
      limit: 30,
      windowMs: 60 * 60 * 1000,
    })
    const input = membershipQuoteSchema.safeParse(await request.json())
    if (!input.success) {
      return Response.json({ message: 'Check the promotion code.' }, { status: 400 })
    }
    const payload = await getPayload({ config })
    const result = await calculateMembershipQuote({ payload, user, ...input.data })
    return Response.json({ quote: result.quote })
  } catch (error) {
    if (error instanceof RateLimitError) return rateLimitResponse(error)
    const status = error instanceof AppError ? error.status : 500
    return Response.json(
      {
        message:
          error instanceof AppError ? error.message : 'The membership total could not be calculated.',
      },
      { status },
    )
  }
}
