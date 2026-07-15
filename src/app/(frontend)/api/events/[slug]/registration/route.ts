import config from '@payload-config'
import { createLocalReq, getPayload, type File as PayloadFile } from 'payload'

import { authenticateRequest } from '@/auth/current-user'
import {
  enforceRateLimit,
  rateLimitKey,
  rateLimitResponse,
  RateLimitError,
} from '@/auth/rate-limit'
import { eventRegistrationSchema } from '@/events/schema'
import {
  queueEventSubmissionNotices,
  queueWaitlistPromotionNotices,
} from '@/services/event-notifications'
import { submitEventRegistration } from '@/services/event-registration'
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MEGABYTES } from '@/storage/config'
import { AppError } from '@/utilities/errors'

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await authenticateRequest(request.headers)
  if (!user) return Response.json({ message: 'Sign in to continue.' }, { status: 401 })

  try {
    await enforceRateLimit({
      key: rateLimitKey('event-registration', String(user.id)),
      limit: 20,
      windowMs: 60 * 60 * 1000,
    })
    const form = await request.formData()
    const value = (name: string) => {
      const item = form.get(name)
      return typeof item === 'string' && item.trim() ? item : undefined
    }
    const input = eventRegistrationSchema.safeParse({
      intent: value('intent'),
      paymentTermsAccepted: form.get('paymentTermsAccepted') === 'on',
      promotionCode: value('promotionCode'),
      quantity: value('quantity') ?? '1',
      transactionId: value('transactionId'),
    })
    if (!input.success) {
      return Response.json({ message: 'Check the event registration details.' }, { status: 400 })
    }
    const upload = form.get('proof')
    let proofFile: PayloadFile | undefined
    if (upload instanceof File && upload.size > 0) {
      if (upload.size > MAX_UPLOAD_BYTES) {
        return Response.json(
          { message: `Payment proof cannot exceed ${MAX_UPLOAD_MEGABYTES} MB.` },
          { status: 400 },
        )
      }
      proofFile = {
        data: Buffer.from(await upload.arrayBuffer()),
        mimetype: upload.type,
        name: upload.name,
        size: upload.size,
      }
    }

    const payload = await getPayload({ config })
    const eventResult = await payload.find({
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
    const event = eventResult.docs[0]
    if (!event) return Response.json({ message: 'Event not found.' }, { status: 404 })
    if (event.isPaid && input.data.intent !== 'waitlist' && !input.data.paymentTermsAccepted) {
      return Response.json(
        { message: 'Accept the Zelle payment and no-refund terms to continue.' },
        { status: 400 },
      )
    }
    const req = await createLocalReq({ user }, payload)
    const { paymentTermsAccepted: _paymentTermsAccepted, ...registrationInput } = input.data
    const result = await submitEventRegistration({
      eventID: event.id,
      proofFile,
      req,
      ...registrationInput,
    })
    try {
      await Promise.all([
        queueEventSubmissionNotices(payload, event, result),
        queueWaitlistPromotionNotices(payload, event, result.promoted),
      ])
    } catch (error) {
      payload.logger.error({ err: error, msg: 'Event registration notification could not queue.' })
    }
    const message =
      result.outcome === 'confirmed'
        ? 'Your event registration is confirmed.'
        : result.outcome === 'waitlisted'
          ? 'The requested seats are not available. You are now on the waitlist.'
          : result.resubmission
            ? 'Your new event payment details are pending review.'
            : 'Your seats are reserved and your Zelle payment is pending review.'
    return Response.json(
      {
        message,
        outcome: result.outcome,
        paymentID: result.payment?.id,
        registrationID: result.registration?.id,
        total: result.order?.total,
        waitlistEntryID: result.waitlistEntry?.id,
      },
      { status: result.resubmission ? 200 : 201 },
    )
  } catch (error) {
    if (error instanceof RateLimitError) return rateLimitResponse(error)
    const status = error instanceof AppError ? error.status : 500
    return Response.json(
      {
        message:
          error instanceof AppError
            ? error.message
            : 'The event registration could not be submitted.',
      },
      { status },
    )
  }
}
