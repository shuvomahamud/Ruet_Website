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
import { env } from '@/utilities/env'

const genericMessage = 'If verification is still required, a new message has been sent.'

export async function POST(request: Request) {
  try {
    const input = emailSchema.safeParse(await request.json())
    if (!input.success) return Response.json({ message: genericMessage })

    enforceRateLimit({
      key: rateLimitKey('verify', getRequestAddress(request), input.data.email),
      limit: 3,
      windowMs: 60 * 60 * 1000,
    })

    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      showHiddenFields: true,
      where: {
        and: [
          { email: { equals: input.data.email } },
          { _verified: { equals: false } },
          { accountStatus: { equals: 'active' } },
        ],
      },
    })
    const user = result.docs[0]

    if (user?._verificationToken) {
      const href = `${env.NEXT_PUBLIC_SITE_URL}/verify-email?token=${encodeURIComponent(user._verificationToken)}`
      try {
        await payload.sendEmail({
          html: `<h1>Verify your RUETIAN USA email</h1><p><a href="${href}">Verify email</a></p>`,
          subject: 'Verify your RUETIAN USA email',
          to: user.email,
        })
      } catch {
        // Preserve the generic response even if the development email adapter is unavailable.
      }
    }

    return Response.json({ message: genericMessage })
  } catch (error) {
    if (error instanceof RateLimitError) return rateLimitResponse(error)
    return Response.json({ message: genericMessage })
  }
}
