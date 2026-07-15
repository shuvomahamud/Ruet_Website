import config from '@payload-config'
import { createLocalReq, getPayload, type File as PayloadFile } from 'payload'

import { authenticateRequest } from '@/auth/current-user'
import {
  enforceRateLimit,
  rateLimitKey,
  rateLimitResponse,
  RateLimitError,
} from '@/auth/rate-limit'
import { membershipCheckoutSchema } from '@/membership/schema'
import { submitMembershipCheckout } from '@/services/membership-checkout'
import { queueMembershipSubmissionNotice } from '@/services/membership-notifications'
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MEGABYTES } from '@/storage/config'
import { AppError } from '@/utilities/errors'

export async function POST(request: Request) {
  const user = await authenticateRequest(request.headers)
  if (!user) return Response.json({ message: 'Sign in to continue.' }, { status: 401 })

  try {
    await enforceRateLimit({
      key: rateLimitKey('membership-checkout', String(user.id)),
      limit: 10,
      windowMs: 60 * 60 * 1000,
    })
    const form = await request.formData()
    const paymentTermsAccepted = form.get('paymentTermsAccepted') === 'on'
    if (!paymentTermsAccepted) {
      return Response.json(
        { message: 'Accept the Membership Agreement, Zelle payment terms, and no-refund policy.' },
        { status: 400 },
      )
    }
    const value = (name: string) => {
      const item = form.get(name)
      return typeof item === 'string' && item.trim() ? item : undefined
    }
    const input = membershipCheckoutSchema.safeParse({
      intent: value('intent'),
      paymentTermsAccepted,
      promotionCode: value('promotionCode'),
      transactionId: value('transactionId'),
    })
    if (!input.success) {
      return Response.json({ message: 'Check the membership payment details.' }, { status: 400 })
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
    const req = await createLocalReq({ user }, payload)
    const { paymentTermsAccepted: _paymentTermsAccepted, ...checkoutInput } = input.data
    const result = await submitMembershipCheckout({ ...checkoutInput, proofFile, req })
    try {
      await queueMembershipSubmissionNotice(payload, result)
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: 'Membership submission notification could not queue.',
      })
    }
    return Response.json(
      {
        message: result.resubmission
          ? 'Your new payment details are pending review.'
          : 'Your membership payment is pending review.',
        paymentID: result.payment.id,
        status: result.membership.status,
        total: result.order.total,
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
            : 'The membership payment could not be submitted.',
      },
      { status },
    )
  }
}
