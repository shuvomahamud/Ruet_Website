import type { Chapter, Membership, MembershipPlan, Order, Payment, User } from '@/payload-types'
import { createLocalReq, type Payload, type PayloadRequest } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { reviewZellePayment } from '@/services/payment-review'
import { getTestPayload } from '../helpers/payload'

describe.sequential('transaction-safe Zelle payment review', () => {
  let payload: Payload
  let owner: User
  let reviewer: User
  let outsiderReviewer: User
  let chapter: Chapter
  let otherChapter: Chapter
  let plan: MembershipPlan
  const membershipIDs: number[] = []
  const orderIDs: number[] = []
  const paymentIDs: number[] = []

  const reviewerRequest = async (user = reviewer): Promise<PayloadRequest> =>
    createLocalReq({ user }, payload)

  const createPaymentScenario = async (
    membershipStatus: Membership['status'] = 'pending_manual_approval',
  ): Promise<{ membership: Membership; order: Order; payment: Payment }> => {
    const membership = await payload.create({
      collection: 'memberships',
      data: {
        billingIntervalSnapshot: 'annual',
        chapterAttribution: chapter.id,
        chapterNameSnapshot: chapter.name,
        currencySnapshot: 'USD',
        paymentMethod: 'zelle',
        plan: plan.id,
        planPriceSnapshot: 50,
        planTitleSnapshot: plan.title,
        status: membershipStatus,
        user: owner.id,
        ...(membershipStatus === 'active'
          ? {
              expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
              startedAt: new Date().toISOString(),
            }
          : {}),
      },
      overrideAccess: true,
    })
    membershipIDs.push(membership.id)

    const order = await payload.create({
      collection: 'orders',
      data: {
        chapterAttribution: chapter.id,
        chapterNameSnapshot: chapter.name,
        currency: 'USD',
        discountTotal: 0,
        membership: membership.id,
        orderType: 'membership',
        paymentMethod: 'zelle',
        status: 'pending',
        subtotal: 50,
        total: 50,
        user: owner.id,
      },
      overrideAccess: true,
    })
    orderIDs.push(order.id)

    const payment = await payload.create({
      collection: 'payments',
      data: {
        amountSnapshot: 50,
        chapterNameSnapshot: chapter.name,
        currencySnapshot: 'USD',
        firstReviewerChapter: chapter.id,
        order: order.id,
        orderTypeSnapshot: 'membership',
        paymentSource: 'zelle',
        proofTransactionId: `ZELLE-${Date.now()}-${Math.random()}`,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        user: owner.id,
      },
      overrideAccess: true,
    })
    paymentIDs.push(payment.id)

    return { membership, order, payment }
  }

  beforeAll(async () => {
    payload = await getTestPayload()
    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`

    owner = await payload.create({
      collection: 'users',
      data: {
        accountStatus: 'active',
        email: `payment-owner-${nonce}@example.test`,
        password: `Owner-${nonce}-password`,
        role: 'member',
      },
      draft: false,
      overrideAccess: true,
    })
    reviewer = await payload.create({
      collection: 'users',
      data: {
        accountStatus: 'active',
        email: `payment-reviewer-${nonce}@example.test`,
        password: `Reviewer-${nonce}-password`,
        role: 'member',
      },
      draft: false,
      overrideAccess: true,
    })
    outsiderReviewer = await payload.create({
      collection: 'users',
      data: {
        accountStatus: 'active',
        email: `payment-outsider-${nonce}@example.test`,
        password: `Outsider-${nonce}-password`,
        role: 'member',
      },
      draft: false,
      overrideAccess: true,
    })
    chapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Payment Chapter ${nonce}`,
        slug: `payment-chapter-${nonce}`,
        summary: 'Payment review fixture.',
      },
      overrideAccess: true,
    })
    otherChapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Other Chapter ${nonce}`,
        slug: `other-payment-chapter-${nonce}`,
        summary: 'Payment review isolation fixture.',
      },
      overrideAccess: true,
    })
    owner = await payload.update({
      collection: 'users',
      data: { primaryChapter: chapter.id },
      id: owner.id,
      overrideAccess: true,
    })
    reviewer = await payload.update({
      collection: 'users',
      data: { managedChapters: [chapter.id], primaryChapter: chapter.id, role: 'chapterAdmin' },
      id: reviewer.id,
      overrideAccess: true,
    })
    outsiderReviewer = await payload.update({
      collection: 'users',
      data: {
        managedChapters: [otherChapter.id],
        primaryChapter: otherChapter.id,
        role: 'chapterAdmin',
      },
      id: outsiderReviewer.id,
      overrideAccess: true,
    })
    plan = await payload.create({
      collection: 'membershipPlans',
      data: {
        active: true,
        annualPrice: 50,
        currency: 'USD',
        gracePeriodDays: 7,
        renewalReminderDaysBefore: 30,
        renewalReminderEnabled: true,
        slug: `annual-${nonce}`,
        title: `Annual ${nonce}`,
      },
      overrideAccess: true,
    })
  })

  afterAll(async () => {
    const audits = await payload.find({
      collection: 'auditLogs',
      limit: 100,
      overrideAccess: true,
      where: { entityID: { in: paymentIDs.map(String) } },
    })
    for (const audit of audits.docs) {
      await payload.delete({ collection: 'auditLogs', id: audit.id, overrideAccess: true })
    }
    for (const id of paymentIDs)
      await payload.delete({ collection: 'payments', id, overrideAccess: true })
    for (const id of orderIDs)
      await payload.delete({ collection: 'orders', id, overrideAccess: true })
    for (const id of membershipIDs)
      await payload.delete({ collection: 'memberships', id, overrideAccess: true })
    if (plan?.id)
      await payload.delete({ collection: 'membershipPlans', id: plan.id, overrideAccess: true })
    for (const user of [owner, reviewer, outsiderReviewer]) {
      if (user?.id) await payload.delete({ collection: 'users', id: user.id, overrideAccess: true })
    }
    for (const item of [chapter, otherChapter]) {
      if (item?.id)
        await payload.delete({ collection: 'chapters', id: item.id, overrideAccess: true })
    }
  })

  it('approves once and treats a repeated approval as an idempotent no-op', async () => {
    const scenario = await createPaymentScenario()
    const first = await reviewZellePayment({
      decision: 'approve',
      paymentID: scenario.payment.id,
      req: await reviewerRequest(),
    })
    expect(first.idempotent).toBe(false)

    const second = await reviewZellePayment({
      decision: 'approve',
      paymentID: scenario.payment.id,
      req: await reviewerRequest(),
    })
    expect(second.idempotent).toBe(true)

    const [payment, order, membership] = await Promise.all([
      payload.findByID({ collection: 'payments', id: scenario.payment.id, overrideAccess: true }),
      payload.findByID({ collection: 'orders', id: scenario.order.id, overrideAccess: true }),
      payload.findByID({
        collection: 'memberships',
        id: scenario.membership.id,
        overrideAccess: true,
      }),
    ])
    expect(payment.status).toBe('approved')
    expect(order.status).toBe('paid')
    expect(membership.status).toBe('active')
    expect(membership.startedAt).toBeTruthy()
    expect(membership.expiresAt).toBeTruthy()
  })

  it('rejects an unauthorized chapter reviewer without changing state', async () => {
    const scenario = await createPaymentScenario()

    const [ownerPayments, assignedChapterPayments, otherChapterPayments] = await Promise.all([
      payload.find({
        collection: 'payments',
        overrideAccess: false,
        user: owner,
        where: { id: { equals: scenario.payment.id } },
      }),
      payload.find({
        collection: 'payments',
        overrideAccess: false,
        user: reviewer,
        where: { id: { equals: scenario.payment.id } },
      }),
      payload.find({
        collection: 'payments',
        overrideAccess: false,
        user: outsiderReviewer,
        where: { id: { equals: scenario.payment.id } },
      }),
    ])
    expect(ownerPayments.totalDocs).toBe(1)
    expect(assignedChapterPayments.totalDocs).toBe(1)
    expect(otherChapterPayments.totalDocs).toBe(0)

    const [ownerOrders, outsiderOrders, ownerMemberships, outsiderMemberships] = await Promise.all([
      payload.find({
        collection: 'orders',
        overrideAccess: false,
        user: owner,
        where: { id: { equals: scenario.order.id } },
      }),
      payload.find({
        collection: 'orders',
        overrideAccess: false,
        user: outsiderReviewer,
        where: { id: { equals: scenario.order.id } },
      }),
      payload.find({
        collection: 'memberships',
        overrideAccess: false,
        user: owner,
        where: { id: { equals: scenario.membership.id } },
      }),
      payload.find({
        collection: 'memberships',
        overrideAccess: false,
        user: outsiderReviewer,
        where: { id: { equals: scenario.membership.id } },
      }),
    ])
    expect(ownerOrders.totalDocs).toBe(1)
    expect(outsiderOrders.totalDocs).toBe(0)
    expect(ownerMemberships.totalDocs).toBe(1)
    expect(outsiderMemberships.totalDocs).toBe(0)

    await expect(
      payload.update({
        collection: 'payments',
        data: { status: 'approved' },
        id: scenario.payment.id,
        overrideAccess: false,
        user: reviewer,
      }),
    ).rejects.toThrow()

    await expect(
      reviewZellePayment({
        decision: 'approve',
        paymentID: scenario.payment.id,
        req: await reviewerRequest(outsiderReviewer),
      }),
    ).rejects.toThrow()

    const payment = await payload.findByID({
      collection: 'payments',
      id: scenario.payment.id,
      overrideAccess: true,
    })
    expect(payment.status).toBe('pending')
  })

  it('rejects once, preserves the attempt, and makes repeated rejection a no-op', async () => {
    const scenario = await createPaymentScenario()

    const first = await reviewZellePayment({
      decision: 'reject',
      paymentID: scenario.payment.id,
      reason: 'Transaction could not be verified.',
      req: await reviewerRequest(),
    })
    const second = await reviewZellePayment({
      decision: 'reject',
      paymentID: scenario.payment.id,
      reason: 'Transaction could not be verified.',
      req: await reviewerRequest(),
    })
    expect(first.idempotent).toBe(false)
    expect(second.idempotent).toBe(true)

    const [payment, order, membership] = await Promise.all([
      payload.findByID({ collection: 'payments', id: scenario.payment.id, overrideAccess: true }),
      payload.findByID({ collection: 'orders', id: scenario.order.id, overrideAccess: true }),
      payload.findByID({
        collection: 'memberships',
        id: scenario.membership.id,
        overrideAccess: true,
      }),
    ])
    expect(payment.status).toBe('failed')
    expect(payment.rejectionReason).toBe('Transaction could not be verified.')
    expect(order.status).toBe('pending')
    expect(membership.status).toBe('failed_manual_payment')

    await expect(
      reviewZellePayment({
        decision: 'approve',
        paymentID: scenario.payment.id,
        req: await reviewerRequest(),
      }),
    ).rejects.toMatchObject({ code: 'PAYMENT_ALREADY_REVIEWED' })
  })

  it('serializes simultaneous duplicate approvals into one change and one no-op', async () => {
    const scenario = await createPaymentScenario()
    const results = await Promise.all([
      reviewZellePayment({
        decision: 'approve',
        paymentID: scenario.payment.id,
        req: await reviewerRequest(),
      }),
      reviewZellePayment({
        decision: 'approve',
        paymentID: scenario.payment.id,
        req: await reviewerRequest(),
      }),
    ])

    expect(results.filter((result) => result.idempotent)).toHaveLength(1)
    expect(results.filter((result) => !result.idempotent)).toHaveLength(1)
  })

  it('rolls back every change when a downstream state is stale', async () => {
    const scenario = await createPaymentScenario('active')

    await expect(
      reviewZellePayment({
        decision: 'approve',
        paymentID: scenario.payment.id,
        req: await reviewerRequest(),
      }),
    ).rejects.toThrow(/record changed/i)

    const [payment, order, membership] = await Promise.all([
      payload.findByID({ collection: 'payments', id: scenario.payment.id, overrideAccess: true }),
      payload.findByID({ collection: 'orders', id: scenario.order.id, overrideAccess: true }),
      payload.findByID({
        collection: 'memberships',
        id: scenario.membership.id,
        overrideAccess: true,
      }),
    ])
    expect(payment.status).toBe('pending')
    expect(order.status).toBe('pending')
    expect(membership.status).toBe('active')
  })
})
