import type { Payload } from 'payload'

import type { Payment } from '@/payload-types'

import { queueEventPaymentReviewNotice } from './event-notifications'
import { queueMembershipReviewNotice } from './membership-notifications'

export const queuePaymentReviewNotice = async (
  payload: Payload,
  payment: Payment,
  decision: 'approve' | 'reject',
) => {
  if (payment.orderTypeSnapshot === 'event') {
    return queueEventPaymentReviewNotice(payload, payment, decision)
  }
  return queueMembershipReviewNotice(payload, payment, decision)
}
