import config from '@payload-config'
import { createLocalReq, getPayload } from 'payload'

import { getRole } from '@/access/roles'
import { authenticateRequest } from '@/auth/current-user'
import { membershipPaymentReviewSchema } from '@/membership/schema'
import { queuePaymentReviewNotice } from '@/services/payment-notifications'
import { reviewZellePayment } from '@/services/payment-review'
import { AppError } from '@/utilities/errors'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request.headers)
  if (!user) return Response.json({ message: 'Sign in to continue.' }, { status: 401 })
  if (!['chapterAdmin', 'admin', 'superAdmin'].includes(getRole(user) ?? '')) {
    return Response.json({ message: 'You are not authorized to review payments.' }, { status: 403 })
  }

  const input = membershipPaymentReviewSchema.safeParse(await request.json())
  const { id } = await params
  const paymentID = Number(id)
  if (!input.success || !Number.isSafeInteger(paymentID) || paymentID < 1) {
    return Response.json({ message: 'Check the payment review details.' }, { status: 400 })
  }

  try {
    const payload = await getPayload({ config })
    const req = await createLocalReq({ user }, payload)
    const result = await reviewZellePayment({ paymentID, req, ...input.data })
    try {
      await queuePaymentReviewNotice(payload, result.payment, input.data.decision)
    } catch (error) {
      payload.logger.error({ err: error, msg: 'Membership review notification could not queue.' })
    }
    return Response.json({
      message: result.idempotent
        ? 'This payment decision was already recorded.'
        : input.data.decision === 'approve'
          ? 'The payment was approved and the membership term was recorded.'
          : 'The payment was rejected and can be resubmitted.',
    })
  } catch (error) {
    const status =
      error instanceof AppError
        ? error.status
        : typeof error === 'object' && error && 'status' in error
          ? Number(error.status)
          : 500
    return Response.json(
      {
        message:
          error instanceof AppError ? error.message : 'The payment review could not be completed.',
      },
      { status: Number.isInteger(status) ? status : 500 },
    )
  }
}
