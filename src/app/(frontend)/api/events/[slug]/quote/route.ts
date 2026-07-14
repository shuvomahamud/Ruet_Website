import config from '@payload-config'
import { getPayload } from 'payload'

import { authenticateRequest } from '@/auth/current-user'
import { eventQuoteSchema } from '@/events/schema'
import { calculateEventQuote } from '@/services/event-registration'
import { AppError } from '@/utilities/errors'

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await authenticateRequest(request.headers)
  if (!user) return Response.json({ message: 'Sign in to continue.' }, { status: 401 })
  const input = eventQuoteSchema.safeParse(await request.json())
  if (!input.success) return Response.json({ message: 'Check the event quantity and code.' }, { status: 400 })

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'events',
      depth: 1,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      user,
      where: {
        and: [
          { slug: { equals: (await params).slug } },
          { _status: { equals: 'published' } },
          { status: { in: ['published', 'archived'] } },
        ],
      },
    })
    const event = result.docs[0]
    if (!event) return Response.json({ message: 'Event not found.' }, { status: 404 })
    const quote = await calculateEventQuote({ event, payload, user, ...input.data })
    return Response.json({ quote: quote.quote })
  } catch (error) {
    return Response.json(
      { message: error instanceof AppError ? error.message : 'The event price could not be checked.' },
      { status: error instanceof AppError ? error.status : 500 },
    )
  }
}
