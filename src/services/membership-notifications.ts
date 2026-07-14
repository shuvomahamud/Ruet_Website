import type { Payload } from 'payload'

import { queueEmail } from '@/email/delivery'
import type { Payment } from '@/payload-types'
import { getManagedChapterIDs } from '@/access/roles'
import { env } from '@/utilities/env'
import { formatCurrency } from '@/utilities/formatters'
import { getRelationshipID } from '@/utilities/relationships'

import type { CheckoutResult } from './membership-checkout'

export const queueMembershipSubmissionNotice = async (
  payload: Payload,
  result: CheckoutResult,
) => {
  const userID = getRelationshipID(result.membership.user)
  if (!userID) return
  await queueEmail(payload, {
    category: 'system',
    data: {
      action: { label: 'View membership status', url: `${env.NEXT_PUBLIC_SITE_URL}/membership/status` },
      message: `We received your Zelle payment details for ${formatCurrency(result.order.total, result.order.currency)}. Your membership remains pending until an authorized reviewer approves the payment. No automatic debit will occur.`,
      subject: 'Membership payment submitted',
      title: 'Your payment is pending review',
    },
    deduplicationKey: `membership-payment:${result.payment.id}:submitted`,
    queue: 'transactional',
    required: true,
    template: 'systemNotice',
    userID,
  })

  const chapterID = getRelationshipID(result.membership.chapterAttribution)
  if (!chapterID) return
  const chapterAdmins = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { accountStatus: { equals: 'active' } },
        { role: { equals: 'chapterAdmin' } },
      ],
    },
  })
  const assignedReviewers = chapterAdmins.docs.filter((user) =>
    getManagedChapterIDs(user).includes(chapterID),
  )
  const fallbackAdmins = assignedReviewers.length
    ? []
    : (
        await payload.find({
          collection: 'users',
          depth: 0,
          limit: 1000,
          overrideAccess: true,
          pagination: false,
          where: {
            and: [
              { accountStatus: { equals: 'active' } },
              { role: { in: ['admin', 'superAdmin'] } },
            ],
          },
        })
      ).docs
  await Promise.all(
    [...assignedReviewers, ...fallbackAdmins].map((reviewer) =>
      queueEmail(payload, {
        category: 'system',
        data: {
          action: {
            label: 'Review pending payment',
            url: `${env.NEXT_PUBLIC_SITE_URL}/payments/review?type=membership`,
          },
          message: `A ${formatCurrency(result.order.total, result.order.currency)} membership Zelle payment is waiting for authorized review in your queue.`,
          subject: 'Membership payment awaiting review',
          title: 'A membership payment needs review',
        },
        deduplicationKey: `membership-payment:${result.payment.id}:reviewer:${reviewer.id}`,
        queue: 'transactional',
        required: true,
        template: 'systemNotice',
        userID: reviewer.id,
      }),
    ),
  )
}

export const queueMembershipReviewNotice = async (
  payload: Payload,
  payment: Payment,
  decision: 'approve' | 'reject',
) => {
  const userID = getRelationshipID(payment.user)
  if (!userID) return
  const isApproved = decision === 'approve'
  await queueEmail(payload, {
    category: 'system',
    data: {
      action: {
        label: isApproved ? 'View membership status' : 'Resubmit payment details',
        url: `${env.NEXT_PUBLIC_SITE_URL}/membership/${isApproved ? 'status' : 'renew'}`,
      },
      message: isApproved
        ? 'Your Zelle payment was approved and your annual membership term is now recorded. You will never be charged automatically.'
        : `Your Zelle payment could not be approved.${payment.rejectionReason ? ` Reason: ${payment.rejectionReason}` : ''} You may submit a new transaction ID, payment proof, or both.`,
      subject: isApproved ? 'Membership payment approved' : 'Membership payment needs resubmission',
      title: isApproved ? 'Your membership payment is approved' : 'Please resubmit payment details',
    },
    deduplicationKey: `membership-payment:${payment.id}:${decision}`,
    queue: 'transactional',
    required: true,
    template: 'systemNotice',
    userID,
  })
}
