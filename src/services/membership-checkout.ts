import type { File, Payload, PayloadRequest } from 'payload'

import { PAYMENT_TERMS_VERSION } from '@/content/legal-policy-20260714'
import type {
  Chapter,
  Membership,
  MembershipPlan,
  Order,
  Payment,
  PaymentProof,
  Promotion,
  User,
} from '@/payload-types'
import { AppError } from '@/utilities/errors'
import { getRelationshipID } from '@/utilities/relationships'

import { lockWorkflowRecord, runInTransaction } from './transaction'
import { transitionWorkflowRecord } from './workflow-transitions'

export type MembershipIntent = 'join' | 'renewal' | 'reactivation' | 'resubmit'

export type MembershipQuote = {
  currency: string
  discountTotal: number
  planID: number
  planTitle: string
  promotionCode?: string
  promotionID?: number
  subtotal: number
  total: number
}

type CheckoutInput = {
  intent: MembershipIntent
  proofFile?: File
  promotionCode?: string
  req: PayloadRequest
  transactionId?: string
}

export type CheckoutResult = {
  membership: Membership
  order: Order
  payment: Payment
  proof?: PaymentProof
  quote: MembershipQuote
  resubmission: boolean
}

const pendingMembershipStatuses: Membership['status'][] = [
  'pending_payment',
  'pending_manual_approval',
]
const acceptedProofTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
])
const MAX_PROOF_BYTES = 8 * 1024 * 1024

const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

const requireCheckoutProfile = (user: User) => {
  if (user.profileStatus !== 'complete' || !getRelationshipID(user.primaryChapter)) {
    throw new AppError('Complete your member profile and primary chapter before checkout.', {
      code: 'PROFILE_INCOMPLETE',
      status: 409,
    })
  }
}

const getActivePlan = async (payload: Payload, req?: PayloadRequest): Promise<MembershipPlan> => {
  const result = await payload.find({
    collection: 'membershipPlans',
    depth: 0,
    limit: 2,
    overrideAccess: true,
    pagination: false,
    req,
    sort: ['sortOrder', 'id'],
    where: { active: { equals: true } },
  })
  if (!result.docs.length) {
    throw new AppError('Membership enrollment is temporarily unavailable.', {
      code: 'NO_ACTIVE_MEMBERSHIP_PLAN',
      status: 409,
    })
  }
  if (result.docs.length > 1) {
    throw new AppError('Membership enrollment is paused while plan configuration is corrected.', {
      code: 'MULTIPLE_ACTIVE_MEMBERSHIP_PLANS',
      status: 409,
    })
  }
  return result.docs[0]
}

const hasCurrentMembership = async (payload: Payload, userID: number, req?: PayloadRequest) => {
  const result = await payload.find({
    collection: 'memberships',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    where: {
      and: [
        { user: { equals: userID } },
        { status: { in: ['active', 'grace_period'] } },
      ],
    },
  })
  return result.docs.length > 0
}

const getPromotion = async ({
  code,
  payload,
  req,
  user,
}: {
  code?: string
  payload: Payload
  req?: PayloadRequest
  user: User
}): Promise<Promotion | undefined> => {
  const normalizedCode = code?.trim().toUpperCase()
  if (!normalizedCode) return undefined
  const result = await payload.find({
    collection: 'promotions',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    where: { code: { equals: normalizedCode } },
  })
  const promotion = result.docs[0]
  const now = Date.now()
  if (
    !promotion ||
    !promotion.active ||
    !['membership', 'both'].includes(promotion.scope) ||
    (promotion.startsAt && new Date(promotion.startsAt).getTime() > now) ||
    (promotion.endsAt && new Date(promotion.endsAt).getTime() <= now)
  ) {
    throw new AppError('This promotion code is not valid for membership checkout.', {
      code: 'INVALID_PROMOTION',
      status: 400,
    })
  }
  if (promotion.memberOnly && !(await hasCurrentMembership(payload, user.id, req))) {
    throw new AppError('This promotion is available only to current members.', {
      code: 'MEMBER_ONLY_PROMOTION',
      status: 400,
    })
  }
  return promotion
}

const assertPromotionCapacity = async (
  payload: Payload,
  promotion: Promotion,
  req?: PayloadRequest,
) => {
  if (promotion.usageLimit === null || promotion.usageLimit === undefined) return
  const usage = await payload.count({
    collection: 'orders',
    overrideAccess: true,
    req,
    where: {
      and: [
        { promotion: { equals: promotion.id } },
        { status: { in: ['pending', 'paid'] } },
      ],
    },
  })
  if (usage.totalDocs >= promotion.usageLimit) {
    throw new AppError('This promotion code has reached its usage limit.', {
      code: 'PROMOTION_LIMIT_REACHED',
      status: 409,
    })
  }
}

export const calculateMembershipQuote = async ({
  payload,
  promotionCode,
  req,
  user,
}: {
  payload: Payload
  promotionCode?: string
  req?: PayloadRequest
  user: User
}): Promise<{ plan: MembershipPlan; promotion?: Promotion; quote: MembershipQuote }> => {
  requireCheckoutProfile(user)
  let plan = await getActivePlan(payload, req)
  if (req) {
    await lockWorkflowRecord(req, 'membership_plans', plan.id)
    plan = await payload.findByID({
      collection: 'membershipPlans',
      depth: 0,
      id: plan.id,
      overrideAccess: true,
      req,
    })
    if (!plan.active) {
      throw new AppError('The annual membership plan changed during checkout. Try again.', {
        code: 'MEMBERSHIP_PLAN_CHANGED',
        status: 409,
      })
    }
  }
  let promotion = await getPromotion({ code: promotionCode, payload, req, user })
  if (promotion && req) {
    await lockWorkflowRecord(req, 'promotions', promotion.id)
    promotion = await getPromotion({ code: promotionCode, payload, req, user })
  }
  if (promotion) await assertPromotionCapacity(payload, promotion, req)

  const subtotal = money(plan.annualPrice)
  const discountTotal = promotion
    ? promotion.discountType === 'fixed'
      ? Math.min(subtotal, money(promotion.discountValue))
      : Math.min(subtotal, money((subtotal * promotion.discountValue) / 100))
    : 0
  const total = money(subtotal - discountTotal)
  if (total <= 0) {
    throw new AppError('Membership promotions must leave a positive Zelle payment total.', {
      code: 'ZERO_TOTAL_MEMBERSHIP_UNSUPPORTED',
      status: 409,
    })
  }

  return {
    plan,
    promotion,
    quote: {
      currency: plan.currency,
      discountTotal,
      planID: plan.id,
      planTitle: plan.title,
      promotionCode: promotion?.code,
      promotionID: promotion?.id,
      subtotal,
      total,
    },
  }
}

const validateProof = (proofFile: File | undefined, transactionId: string | undefined) => {
  if (!proofFile && !transactionId?.trim()) {
    throw new AppError('Provide a Zelle transaction ID, payment proof, or both.', {
      code: 'PAYMENT_PROOF_REQUIRED',
      status: 400,
    })
  }
  if (proofFile && (!acceptedProofTypes.has(proofFile.mimetype) || proofFile.size > MAX_PROOF_BYTES)) {
    throw new AppError('Payment proof must be a JPG, PNG, WebP, or PDF no larger than 8 MB.', {
      code: 'INVALID_PAYMENT_PROOF',
      status: 400,
    })
  }
}

const createProof = async (
  req: PayloadRequest,
  proofFile: File | undefined,
): Promise<PaymentProof | undefined> => {
  if (!proofFile) return undefined
  return req.payload.create({
    collection: 'paymentProofs',
    data: {
      chapter: getRelationshipID(req.user?.primaryChapter),
      description: 'Membership Zelle payment proof',
      owner: Number(req.user!.id),
    },
    file: proofFile,
    overrideAccess: false,
    req,
  })
}

const getUserMemberships = async (req: PayloadRequest, userID: number) => {
  const result = await req.payload.find({
    collection: 'memberships',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    req,
    sort: '-createdAt',
    where: { user: { equals: userID } },
  })
  return result.docs
}

const resolvePreviousMembership = (
  memberships: Membership[],
  intent: Exclude<MembershipIntent, 'resubmit'>,
) => {
  const pending = memberships.find((membership) => pendingMembershipStatuses.includes(membership.status))
  if (pending) {
    throw new AppError('A membership payment is already pending.', {
      code: 'MEMBERSHIP_PAYMENT_ALREADY_PENDING',
      status: 409,
    })
  }
  const latest = memberships[0]
  if (intent === 'join') {
    if (latest) {
      throw new AppError('Use renewal, reactivation, or resubmission for your existing membership.', {
        code: 'MEMBERSHIP_ALREADY_EXISTS',
        status: 409,
      })
    }
    return undefined
  }
  if (!latest) {
    throw new AppError('No previous membership was found.', {
      code: 'PREVIOUS_MEMBERSHIP_NOT_FOUND',
      status: 409,
    })
  }
  if (intent === 'renewal' && !['active', 'grace_period'].includes(latest.status)) {
    throw new AppError('Only active or grace-period memberships can be renewed.', {
      code: 'MEMBERSHIP_NOT_RENEWABLE',
      status: 409,
    })
  }
  if (
    intent === 'renewal' &&
    latest.startedAt &&
    new Date(latest.startedAt).getTime() > Date.now()
  ) {
    throw new AppError('Your next annual membership term is already approved.', {
      code: 'MEMBERSHIP_ALREADY_RENEWED',
      status: 409,
    })
  }
  if (intent === 'reactivation' && latest.status !== 'expired') {
    throw new AppError('Only expired memberships can be reactivated.', {
      code: 'MEMBERSHIP_NOT_REACTIVATABLE',
      status: 409,
    })
  }
  return latest
}

const getChapter = async (req: PayloadRequest, user: User): Promise<Chapter> => {
  const chapterID = getRelationshipID(user.primaryChapter)
  if (!chapterID) throw new AppError('Select a primary chapter before checkout.', { status: 409 })
  const chapter = await req.payload.findByID({
    collection: 'chapters',
    depth: 0,
    id: chapterID,
    overrideAccess: true,
    req,
  })
  if (chapter.chapterStatus !== 'active' || chapter._status !== 'published') {
    throw new AppError('Select an active primary chapter before checkout.', {
      code: 'INACTIVE_PRIMARY_CHAPTER',
      status: 409,
    })
  }
  return chapter
}

const createPayment = async ({
  order,
  proof,
  req,
  transactionId,
  user,
}: {
  order: Order
  proof?: PaymentProof
  req: PayloadRequest
  transactionId?: string
  user: User
}) =>
  req.payload.create({
    collection: 'payments',
    data: {
      amountSnapshot: order.total,
      chapterNameSnapshot: order.chapterNameSnapshot,
      currencySnapshot: order.currency,
      firstReviewerChapter: getRelationshipID(order.chapterAttribution),
      order: order.id,
      orderTypeSnapshot: 'membership',
      paymentSource: 'zelle',
      paymentTermsAcceptedAt: new Date().toISOString(),
      paymentTermsVersionSnapshot: PAYMENT_TERMS_VERSION,
      proofImage: proof?.id,
      proofTransactionId: transactionId?.trim() || undefined,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      user: user.id,
    },
    overrideAccess: true,
    req,
  })

const resubmitPayment = async ({
  memberships,
  proofFile,
  req,
  transactionId,
  user,
}: {
  memberships: Membership[]
  proofFile?: File
  req: PayloadRequest
  transactionId?: string
  user: User
}): Promise<CheckoutResult> => {
  const membership = memberships.find((item) => item.status === 'failed_manual_payment')
  if (!membership) {
    throw new AppError('No failed membership payment is available to resubmit.', {
      code: 'NO_FAILED_MEMBERSHIP_PAYMENT',
      status: 409,
    })
  }
  await lockWorkflowRecord(req, 'memberships', membership.id)
  const orders = await req.payload.find({
    collection: 'orders',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    sort: '-createdAt',
    where: {
      and: [{ membership: { equals: membership.id } }, { status: { equals: 'pending' } }],
    },
  })
  const order = orders.docs[0]
  if (!order) {
    throw new AppError('The failed payment no longer has a pending order.', {
      code: 'PENDING_ORDER_NOT_FOUND',
      status: 409,
    })
  }
  await lockWorkflowRecord(req, 'orders', order.id)
  const pendingAttempts = await req.payload.count({
    collection: 'payments',
    overrideAccess: true,
    req,
    where: { and: [{ order: { equals: order.id } }, { status: { equals: 'pending' } }] },
  })
  if (pendingAttempts.totalDocs) {
    throw new AppError('A payment attempt is already pending review.', {
      code: 'PAYMENT_ATTEMPT_ALREADY_PENDING',
      status: 409,
    })
  }
  const proof = await createProof(req, proofFile)
  const payment = await createPayment({ order, proof, req, transactionId, user })
  await transitionWorkflowRecord({
    collection: 'memberships',
    expectedStatus: 'failed_manual_payment',
    id: membership.id,
    nextStatus: 'pending_manual_approval',
    req,
  })
  return {
    membership: { ...membership, status: 'pending_manual_approval' },
    order,
    payment,
    proof,
    quote: {
      currency: order.currency,
      discountTotal: order.discountTotal ?? 0,
      planID: getRelationshipID(membership.plan)!,
      planTitle: membership.planTitleSnapshot,
      promotionCode: order.promotionCodeSnapshot ?? undefined,
      promotionID: getRelationshipID(order.promotion),
      subtotal: order.subtotal,
      total: order.total,
    },
    resubmission: true,
  }
}

export const submitMembershipCheckout = async ({
  intent,
  proofFile,
  promotionCode,
  req,
  transactionId,
}: CheckoutInput): Promise<CheckoutResult> => {
  validateProof(proofFile, transactionId)
  if (!req.user?.id) throw new AppError('Sign in to continue.', { status: 401 })

  return runInTransaction(req, async () => {
    const userID = Number(req.user!.id)
    await lockWorkflowRecord(req, 'users', userID)
    const user = (await req.payload.findByID({
      collection: 'users',
      depth: 1,
      id: userID,
      overrideAccess: true,
      req,
    })) as User
    requireCheckoutProfile(user)
    const chapter = await getChapter(req, user)
    const memberships = await getUserMemberships(req, user.id)
    if (intent === 'resubmit') {
      return resubmitPayment({ memberships, proofFile, req, transactionId, user })
    }

    const previousMembership = resolvePreviousMembership(memberships, intent)
    const { plan, promotion, quote } = await calculateMembershipQuote({
      payload: req.payload,
      promotionCode,
      req,
      user,
    })
    const proof = await createProof(req, proofFile)
    const membership = await req.payload.create({
      collection: 'memberships',
      data: {
        billingIntervalSnapshot: 'annual',
        chapterAttribution: chapter.id,
        chapterNameSnapshot: chapter.name,
        currencySnapshot: plan.currency,
        gracePeriodDaysSnapshot: plan.gracePeriodDays ?? 7,
        membershipKind: intent,
        paymentMethod: 'zelle',
        plan: plan.id,
        planPriceSnapshot: plan.annualPrice,
        planTitleSnapshot: plan.title,
        previousMembership: previousMembership?.id,
        reactivationEligible: true,
        renewalReminderDaysBeforeSnapshot: plan.renewalReminderDaysBefore ?? 30,
        renewalReminderEnabledSnapshot: plan.renewalReminderEnabled ?? true,
        status: 'pending_payment',
        user: user.id,
      },
      overrideAccess: true,
      req,
    })
    const order = await req.payload.create({
      collection: 'orders',
      data: {
        chapterAttribution: chapter.id,
        chapterNameSnapshot: chapter.name,
        currency: quote.currency,
        discountTotal: quote.discountTotal,
        membership: membership.id,
        orderType: 'membership',
        paymentMethod: 'zelle',
        promotion: promotion?.id,
        promotionCodeSnapshot: promotion?.code,
        promotionDiscountTypeSnapshot: promotion?.discountType,
        promotionDiscountValueSnapshot: promotion?.discountValue,
        status: 'pending',
        subtotal: quote.subtotal,
        total: quote.total,
        user: user.id,
      },
      overrideAccess: true,
      req,
    })
    const payment = await createPayment({ order, proof, req, transactionId, user })
    await transitionWorkflowRecord({
      collection: 'memberships',
      expectedStatus: 'pending_payment',
      id: membership.id,
      nextStatus: 'pending_manual_approval',
      req,
    })

    return {
      membership: { ...membership, status: 'pending_manual_approval' },
      order,
      payment,
      proof,
      quote,
      resubmission: false,
    }
  })
}
