import config from '@payload-config'
import { getPayload } from 'payload'

import {
  enforceRateLimit,
  getRequestAddress,
  rateLimitKey,
  rateLimitResponse,
  RateLimitError,
} from '@/auth/rate-limit'
import { contactSubmissionSchema } from '@/contact/schema'

export async function POST(request: Request) {
  try {
    const input = contactSubmissionSchema.safeParse(await request.json())
    if (!input.success) {
      return Response.json(
        { issues: input.error.flatten().fieldErrors, message: 'Check the highlighted fields.' },
        { status: 400 },
      )
    }

    enforceRateLimit({
      key: rateLimitKey('contact-ip', getRequestAddress(request)),
      limit: 5,
      windowMs: 30 * 60 * 1000,
    })
    enforceRateLimit({
      key: rateLimitKey('contact-email', input.data.email),
      limit: 3,
      windowMs: 60 * 60 * 1000,
    })

    const payload = await getPayload({ config })
    await payload.create({
      collection: 'contactSubmissions',
      context: { publicContactSubmissionValidated: true },
      data: {
        email: input.data.email,
        message: input.data.message,
        name: input.data.name,
        status: 'new',
        subject: input.data.subject,
        submittedAt: new Date().toISOString(),
        topic: input.data.topic,
      },
      overrideAccess: false,
    })

    return Response.json({ message: 'Thanks—your message has been received.' }, { status: 201 })
  } catch (error) {
    if (error instanceof RateLimitError) return rateLimitResponse(error)
    return Response.json(
      { message: 'Your message could not be sent. Please try again.' },
      { status: 500 },
    )
  }
}
