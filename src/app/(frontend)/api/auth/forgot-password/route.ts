import config from '@payload-config'
import { getPayload } from 'payload'

import {
  enforceRateLimit,
  getRequestAddress,
  rateLimitKey,
  rateLimitResponse,
  RateLimitError,
} from '@/auth/rate-limit'
import { emailSchema } from '@/auth/schemas'

const genericMessage = 'If an eligible account exists, password reset instructions have been sent.'

export async function POST(request: Request) {
  try {
    const input = emailSchema.safeParse(await request.json())
    if (!input.success) return Response.json({ message: genericMessage })

    await enforceRateLimit({
      key: rateLimitKey('forgot', getRequestAddress(request), input.data.email),
      limit: 4,
      windowMs: 30 * 60 * 1000,
    })

    const payload = await getPayload({ config })
    try {
      await payload.forgotPassword({
        collection: 'users',
        data: { email: input.data.email },
        overrideAccess: true,
      })
    } catch {
      // The public response must not disclose account existence or state.
    }

    return Response.json({ message: genericMessage })
  } catch (error) {
    if (error instanceof RateLimitError) return rateLimitResponse(error)
    return Response.json({ message: genericMessage })
  }
}
