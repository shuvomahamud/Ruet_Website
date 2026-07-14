import type { CollectionBeforeChangeHook } from 'payload'

import { AppError } from '@/utilities/errors'
import { getRelationshipID } from '@/utilities/relationships'

const assertSameRelationship = (
  actual: unknown,
  expected: unknown,
  message: string,
  code: string,
): void => {
  if (
    getRelationshipID(actual as number | { id?: number } | null) !==
    getRelationshipID(expected as number | { id?: number } | null)
  ) {
    throw new AppError(message, { code, status: 409 })
  }
}

export const validateOrderRelationships: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data

  const userID = getRelationshipID(data.user)
  if (!userID) {
    throw new AppError('The order must belong to a valid user.', {
      code: 'INVALID_ORDER_USER',
      status: 400,
    })
  }

  if (data.orderType === 'membership') {
    const membershipID = getRelationshipID(data.membership)
    if (!membershipID || data.eventRegistration) {
      throw new AppError('A membership order must reference exactly one membership.', {
        code: 'INVALID_MEMBERSHIP_ORDER_TARGET',
        status: 400,
      })
    }
    const membership = await req.payload.findByID({
      collection: 'memberships',
      depth: 0,
      id: membershipID,
      overrideAccess: true,
      req,
    })
    assertSameRelationship(
      membership.user,
      userID,
      'The membership and order must belong to the same user.',
      'ORDER_OWNER_MISMATCH',
    )
  } else if (data.orderType === 'event') {
    const registrationID = getRelationshipID(data.eventRegistration)
    if (!registrationID || data.membership) {
      throw new AppError('An event order must reference exactly one event registration.', {
        code: 'INVALID_EVENT_ORDER_TARGET',
        status: 400,
      })
    }
    const registration = await req.payload.findByID({
      collection: 'eventRegistrations',
      depth: 0,
      id: registrationID,
      overrideAccess: true,
      req,
    })
    assertSameRelationship(
      registration.user,
      userID,
      'The registration and order must belong to the same user.',
      'ORDER_OWNER_MISMATCH',
    )
  }

  return data
}

export const validateMembershipSnapshots: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data

  const planID = getRelationshipID(data.plan)
  const userID = getRelationshipID(data.user)
  if (!planID || !userID) {
    throw new AppError('Membership requires a valid user and plan.', {
      code: 'INVALID_MEMBERSHIP_RELATIONSHIP',
      status: 400,
    })
  }

  const [plan, user] = await Promise.all([
    req.payload.findByID({
      collection: 'membershipPlans',
      depth: 0,
      id: planID,
      overrideAccess: true,
      req,
    }),
    req.payload.findByID({
      collection: 'users',
      depth: 0,
      id: userID,
      overrideAccess: true,
      req,
    }),
  ])

  if (!plan.active) {
    throw new AppError('The selected membership plan is inactive.', {
      code: 'INACTIVE_MEMBERSHIP_PLAN',
      status: 409,
    })
  }
  if (
    data.planTitleSnapshot !== plan.title ||
    data.planPriceSnapshot !== plan.annualPrice ||
    data.currencySnapshot !== plan.currency ||
    data.billingIntervalSnapshot !== 'annual'
  ) {
    throw new AppError('Membership plan snapshots do not match the selected plan.', {
      code: 'INVALID_MEMBERSHIP_SNAPSHOT',
      status: 409,
    })
  }

  const userChapterID = getRelationshipID(user.primaryChapter)
  const membershipChapterID = getRelationshipID(data.chapterAttribution)
  if (membershipChapterID !== userChapterID) {
    throw new AppError('Membership chapter attribution must match the user at checkout.', {
      code: 'MEMBERSHIP_CHAPTER_MISMATCH',
      status: 409,
    })
  }

  return data
}

export const validatePaymentSnapshots: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create') return data

  const orderID = getRelationshipID(data.order)
  const userID = getRelationshipID(data.user)
  if (!orderID || !userID) {
    throw new AppError('Payment requires a valid order and user.', {
      code: 'INVALID_PAYMENT_RELATIONSHIP',
      status: 400,
    })
  }

  const order = await req.payload.findByID({
    collection: 'orders',
    depth: 0,
    id: orderID,
    overrideAccess: true,
    req,
  })

  assertSameRelationship(
    order.user,
    userID,
    'The payment and order must belong to the same user.',
    'PAYMENT_OWNER_MISMATCH',
  )
  assertSameRelationship(
    order.chapterAttribution,
    data.firstReviewerChapter,
    'The first reviewer chapter must match the order attribution.',
    'PAYMENT_CHAPTER_MISMATCH',
  )

  if (
    order.status !== 'pending' ||
    data.amountSnapshot !== order.total ||
    data.currencySnapshot !== order.currency ||
    data.orderTypeSnapshot !== order.orderType
  ) {
    throw new AppError('Payment snapshots do not match the pending order.', {
      code: 'INVALID_PAYMENT_SNAPSHOT',
      status: 409,
    })
  }

  const proofID = getRelationshipID(data.proofImage)
  if (proofID) {
    const proof = await req.payload.findByID({
      collection: 'paymentProofs',
      depth: 0,
      id: proofID,
      overrideAccess: true,
      req,
    })
    assertSameRelationship(
      proof.owner,
      userID,
      'The payment proof and payment must belong to the same user.',
      'PAYMENT_PROOF_OWNER_MISMATCH',
    )
  }

  return {
    ...data,
    proofTransactionId:
      typeof data.proofTransactionId === 'string'
        ? data.proofTransactionId.trim()
        : data.proofTransactionId,
  }
}
