import type {
  Chapter,
  Membership,
  MembershipPlan,
  Promotion,
  User,
} from '@/payload-types'
import { createLocalReq, type File, type Payload, type PayloadRequest } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import {
  calculateMembershipQuote,
  submitMembershipCheckout,
  type CheckoutResult,
} from '@/services/membership-checkout'
import { processMembershipLifecycle } from '@/services/membership-lifecycle'
import { reviewZellePayment } from '@/services/payment-review'
import { getRelationshipID } from '@/utilities/relationships'
import { getTestPayload } from '../helpers/payload'

describe.sequential('annual membership and Zelle checkout lifecycle', () => {
  let payload: Payload
  let chapter: Chapter
  let plan: MembershipPlan
  let promotion: Promotion
  let reviewer: User
  const users: User[] = []
  const membershipIDs = new Set<number>()
  const orderIDs = new Set<number>()
  const paymentIDs = new Set<number>()
  const proofIDs = new Set<number>()
  const previousActivePlanIDs: number[] = []
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`

  const remember = (result: CheckoutResult) => {
    membershipIDs.add(result.membership.id)
    orderIDs.add(result.order.id)
    paymentIDs.add(result.payment.id)
    if (result.proof) proofIDs.add(result.proof.id)
    return result
  }

  const createUser = async (label: string, complete = true) => {
    const acceptedAt = new Date().toISOString()
    const user = await payload.create({
      collection: 'users',
      data: {
        _verified: true,
        accountStatus: 'active',
        city: complete ? 'New York' : undefined,
        country: complete ? 'United States' : undefined,
        email: `membership-${label}-${nonce}@example.test`,
        firstName: complete ? 'Test' : undefined,
        graduationYear: complete ? 2012 : undefined,
        lastName: complete ? label : undefined,
        password: `Membership-${label}-${nonce}!`,
        primaryChapter: complete ? chapter.id : undefined,
        privacyAcceptedAt: complete ? acceptedAt : undefined,
        role: 'member',
        ruetDepartment: complete ? 'CSE' : undefined,
        state: complete ? 'NY' : undefined,
        termsAcceptedAt: complete ? acceptedAt : undefined,
      },
      overrideAccess: true,
    })
    users.push(user)
    return user
  }

  const requestFor = (user: User): Promise<PayloadRequest> => createLocalReq({ user }, payload)

  const checkout = async (
    user: User,
    input: Omit<Parameters<typeof submitMembershipCheckout>[0], 'req'>,
  ) => remember(await submitMembershipCheckout({ ...input, req: await requestFor(user) }))

  const png = (name: string): File => ({
    data: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    ),
    mimetype: 'image/png',
    name,
    size: 68,
  })

  const createDirectMembership = async ({
    expiresAt,
    graceDays = 7,
    reminderDays = 30,
    startedAt,
    status,
    user,
  }: {
    expiresAt?: Date
    graceDays?: number
    reminderDays?: number
    startedAt?: Date
    status: Membership['status']
    user: User
  }) => {
    const membership = await payload.create({
      collection: 'memberships',
      data: {
        billingIntervalSnapshot: 'annual',
        chapterAttribution: chapter.id,
        chapterNameSnapshot: chapter.name,
        currencySnapshot: 'USD',
        expiresAt: expiresAt?.toISOString(),
        gracePeriodDaysSnapshot: graceDays,
        membershipKind: 'join',
        paymentMethod: 'zelle',
        plan: plan.id,
        planPriceSnapshot: plan.annualPrice,
        planTitleSnapshot: plan.title,
        reactivationEligible: true,
        renewalAt: expiresAt?.toISOString(),
        renewalReminderDaysBeforeSnapshot: reminderDays,
        renewalReminderEnabledSnapshot: true,
        startedAt: startedAt?.toISOString(),
        status,
        user: user.id,
      },
      overrideAccess: true,
    })
    membershipIDs.add(membership.id)
    return membership
  }

  beforeAll(async () => {
    payload = await getTestPayload()
    const activePlans = await payload.find({
      collection: 'membershipPlans',
      limit: 100,
      overrideAccess: true,
      where: { active: { equals: true } },
    })
    for (const activePlan of activePlans.docs) {
      previousActivePlanIDs.push(activePlan.id)
      await payload.update({
        collection: 'membershipPlans',
        data: { active: false },
        id: activePlan.id,
        overrideAccess: true,
      })
    }

    chapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Membership Chapter ${nonce}`,
        slug: `membership-chapter-${nonce}`,
        summary: 'Membership lifecycle integration fixture.',
      },
      overrideAccess: true,
    })
    reviewer = await payload.create({
      collection: 'users',
      data: {
        _verified: true,
        accountStatus: 'active',
        email: `membership-reviewer-${nonce}@example.test`,
        password: `Reviewer-${nonce}!`,
        role: 'member',
      },
      overrideAccess: true,
    })
    reviewer = await payload.update({
      collection: 'users',
      data: {
        managedChapters: [chapter.id],
        primaryChapter: chapter.id,
        role: 'chapterAdmin',
      },
      id: reviewer.id,
      overrideAccess: true,
    })
    users.push(reviewer)
    plan = await payload.create({
      collection: 'membershipPlans',
      data: {
        active: true,
        annualPrice: 50,
        benefits: [{ label: 'Test annual benefit' }],
        currency: 'USD',
        gracePeriodDays: 7,
        renewalPolicy: 'Every annual term requires a new manually approved Zelle payment.',
        renewalReminderDaysBefore: 30,
        renewalReminderEnabled: true,
        slug: `annual-membership-${nonce}`,
        termsSummary: 'Test terms summary.',
        title: `Annual Membership ${nonce}`,
      },
      overrideAccess: true,
    })
    promotion = await payload.create({
      collection: 'promotions',
      data: {
        active: true,
        code: `SAVE10-${nonce}`,
        discountType: 'fixed',
        discountValue: 10,
        memberOnly: false,
        scope: 'membership',
        usageLimit: 1,
      },
      overrideAccess: true,
    })
  })

  afterAll(async () => {
    const deliveries = await payload.find({
      collection: 'emailDeliveries',
      limit: 1000,
      overrideAccess: true,
      where: { user: { in: users.map((user) => user.id) } },
    })
    for (const delivery of deliveries.docs) {
      if (delivery.jobId) {
        await payload.delete({
          collection: 'payload-jobs',
          id: Number(delivery.jobId),
          overrideAccess: true,
        })
      }
      await payload.delete({ collection: 'emailDeliveries', id: delivery.id, overrideAccess: true })
    }
    const audits = await payload.find({
      collection: 'auditLogs',
      limit: 1000,
      overrideAccess: true,
      where: { entityID: { in: [...paymentIDs].map(String) } },
    })
    for (const audit of audits.docs) {
      await payload.delete({ collection: 'auditLogs', id: audit.id, overrideAccess: true })
    }
    for (const id of paymentIDs) {
      await payload.delete({ collection: 'payments', id, overrideAccess: true })
    }
    for (const id of orderIDs) {
      await payload.delete({ collection: 'orders', id, overrideAccess: true })
    }
    for (const id of membershipIDs) {
      await payload.delete({ collection: 'memberships', id, overrideAccess: true })
    }
    for (const id of proofIDs) {
      await payload.delete({ collection: 'paymentProofs', id, overrideAccess: true })
    }
    await payload.delete({ collection: 'promotions', id: promotion.id, overrideAccess: true })
    await payload.delete({ collection: 'membershipPlans', id: plan.id, overrideAccess: true })
    for (const user of users) {
      await payload.delete({ collection: 'users', id: user.id, overrideAccess: true })
    }
    await payload.delete({ collection: 'chapters', id: chapter.id, overrideAccess: true })
    for (const id of previousActivePlanIDs) {
      await payload.update({
        collection: 'membershipPlans',
        data: { active: true },
        id,
        overrideAccess: true,
      })
    }
  })

  it('enforces one active annual plan and requires a complete profile', async () => {
    await expect(
      payload.create({
        collection: 'membershipPlans',
        data: {
          active: true,
          annualPrice: 75,
          currency: 'USD',
          renewalPolicy: 'Manual renewal.',
          slug: `second-active-${nonce}`,
          termsSummary: 'Terms.',
          title: 'Second active plan',
        },
        overrideAccess: true,
      }),
    ).rejects.toThrow(/only one membership plan/i)

    const incomplete = await createUser('incomplete', false)
    await expect(
      submitMembershipCheckout({
        intent: 'join',
        req: await requestFor(incomplete),
        transactionId: 'INCOMPLETE-PROFILE',
      }),
    ).rejects.toMatchObject({ code: 'PROFILE_INCOMPLETE' })
  })

  it('accepts transaction-ID-only payment and applies one server-authoritative promotion', async () => {
    const user = await createUser('transaction')
    const quote = await calculateMembershipQuote({
      payload,
      promotionCode: promotion.code.toLowerCase(),
      user,
    })
    expect(quote.quote).toMatchObject({ discountTotal: 10, subtotal: 50, total: 40 })

    const result = await checkout(user, {
      intent: 'join',
      promotionCode: promotion.code.toLowerCase(),
      transactionId: 'ZELLE-TRANSACTION-ONLY',
    })
    expect(result.membership.status).toBe('pending_manual_approval')
    expect(result.order).toMatchObject({
      discountTotal: 10,
      promotionCodeSnapshot: promotion.code,
      subtotal: 50,
      total: 40,
    })
    expect(result.payment).toMatchObject({
      amountSnapshot: 40,
      proofImage: null,
      proofTransactionId: 'ZELLE-TRANSACTION-ONLY',
      status: 'pending',
    })
    expect(result.membership.startedAt).toBeNull()

    const secondUser = await createUser('promotion-limit')
    await expect(
      submitMembershipCheckout({
        intent: 'join',
        promotionCode: promotion.code,
        req: await requestFor(secondUser),
        transactionId: 'PROMOTION-LIMIT',
      }),
    ).rejects.toMatchObject({ code: 'PROMOTION_LIMIT_REACHED' })
  })

  it('accepts proof-only and combined proof submissions but rejects missing evidence', async () => {
    const proofOnlyUser = await createUser('proof-only')
    const proofOnly = await checkout(proofOnlyUser, {
      intent: 'join',
      proofFile: png(`proof-only-${nonce}.png`),
    })
    expect(proofOnly.payment.proofImage).toBeTruthy()
    expect(proofOnly.payment.proofTransactionId).toBeNull()

    const combinedUser = await createUser('combined')
    const combined = await checkout(combinedUser, {
      intent: 'join',
      proofFile: png(`combined-${nonce}.png`),
      transactionId: 'ZELLE-COMBINED',
    })
    expect(combined.payment.proofImage).toBeTruthy()
    expect(combined.payment.proofTransactionId).toBe('ZELLE-COMBINED')

    const missingUser = await createUser('missing-proof')
    await expect(
      submitMembershipCheckout({ intent: 'join', req: await requestFor(missingUser) }),
    ).rejects.toMatchObject({ code: 'PAYMENT_PROOF_REQUIRED' })
  })

  it('preserves configurable price and grace snapshots after plan changes', async () => {
    plan = await payload.update({
      collection: 'membershipPlans',
      data: { annualPrice: 60, gracePeriodDays: 14 },
      id: plan.id,
      overrideAccess: true,
    })
    const user = await createUser('snapshots')
    const result = await checkout(user, {
      intent: 'join',
      transactionId: 'ZELLE-SNAPSHOT',
    })
    expect(result.order.total).toBe(60)
    expect(result.membership).toMatchObject({
      gracePeriodDaysSnapshot: 14,
      planPriceSnapshot: 60,
    })
    await payload.update({
      collection: 'membershipPlans',
      data: { annualPrice: 80, gracePeriodDays: 3 },
      id: plan.id,
      overrideAccess: true,
    })
    const unchanged = await payload.findByID({
      collection: 'memberships',
      id: result.membership.id,
      overrideAccess: true,
    })
    expect(unchanged).toMatchObject({ gracePeriodDaysSnapshot: 14, planPriceSnapshot: 60 })
    plan = await payload.update({
      collection: 'membershipPlans',
      data: { annualPrice: 60, gracePeriodDays: 7 },
      id: plan.id,
      overrideAccess: true,
    })
  })

  it('serializes duplicate checkout and rejected-payment resubmission attempts', async () => {
    const duplicateUser = await createUser('concurrent-checkout')
    const checkoutAttempts = await Promise.allSettled([
      submitMembershipCheckout({
        intent: 'join',
        req: await requestFor(duplicateUser),
        transactionId: 'CONCURRENT-CHECKOUT-A',
      }),
      submitMembershipCheckout({
        intent: 'join',
        req: await requestFor(duplicateUser),
        transactionId: 'CONCURRENT-CHECKOUT-B',
      }),
    ])
    const successfulCheckout = checkoutAttempts.find(
      (item): item is PromiseFulfilledResult<CheckoutResult> => item.status === 'fulfilled',
    )
    expect(checkoutAttempts.filter((item) => item.status === 'fulfilled')).toHaveLength(1)
    expect(checkoutAttempts.filter((item) => item.status === 'rejected')).toHaveLength(1)
    remember(successfulCheckout!.value)

    await reviewZellePayment({
      decision: 'reject',
      paymentID: successfulCheckout!.value.payment.id,
      reason: 'Unable to match the transaction.',
      req: await requestFor(reviewer),
    })
    const resubmissions = await Promise.allSettled([
      submitMembershipCheckout({
        intent: 'resubmit',
        req: await requestFor(duplicateUser),
        transactionId: 'RESUBMIT-A',
      }),
      submitMembershipCheckout({
        intent: 'resubmit',
        req: await requestFor(duplicateUser),
        transactionId: 'RESUBMIT-B',
      }),
    ])
    const successfulResubmission = resubmissions.find(
      (item): item is PromiseFulfilledResult<CheckoutResult> => item.status === 'fulfilled',
    )
    expect(resubmissions.filter((item) => item.status === 'fulfilled')).toHaveLength(1)
    expect(resubmissions.filter((item) => item.status === 'rejected')).toHaveLength(1)
    remember(successfulResubmission!.value)
    await reviewZellePayment({
      decision: 'approve',
      paymentID: successfulResubmission!.value.payment.id,
      req: await requestFor(reviewer),
    })
    const membership = await payload.findByID({
      collection: 'memberships',
      id: successfulCheckout!.value.membership.id,
      overrideAccess: true,
    })
    expect(membership.status).toBe('active')
    expect(membership.startedAt).toBeTruthy()
  })

  it('records renewal from the prior expiration and blocks another future-term renewal', async () => {
    const user = await createUser('renewal')
    const previousExpiration = new Date(Date.now() + 60 * 86_400_000)
    const previous = await createDirectMembership({
      expiresAt: previousExpiration,
      startedAt: new Date(Date.now() - 305 * 86_400_000),
      status: 'active',
      user,
    })
    const renewal = await checkout(user, {
      intent: 'renewal',
      transactionId: 'ZELLE-RENEWAL',
    })
    expect(getRelationshipID(renewal.membership.previousMembership)).toBe(previous.id)
    await reviewZellePayment({
      decision: 'approve',
      paymentID: renewal.payment.id,
      req: await requestFor(reviewer),
    })
    const approved = await payload.findByID({
      collection: 'memberships',
      id: renewal.membership.id,
      overrideAccess: true,
    })
    expect(approved.status).toBe('active')
    expect(approved.startedAt).toBe(previousExpiration.toISOString())
    expect(new Date(approved.expiresAt!).getUTCFullYear()).toBe(
      previousExpiration.getUTCFullYear() + 1,
    )
    await expect(
      submitMembershipCheckout({
        intent: 'renewal',
        req: await requestFor(user),
        transactionId: 'ZELLE-RENEWAL-AGAIN',
      }),
    ).rejects.toMatchObject({ code: 'MEMBERSHIP_ALREADY_RENEWED' })
  })

  it('queues one reminder and moves memberships through grace, expiration, and reactivation', async () => {
    const now = new Date()
    const lifecycleUser = await createUser('lifecycle')
    const graceMembership = await createDirectMembership({
      expiresAt: new Date(now.getTime() - 86_400_000),
      graceDays: 7,
      startedAt: new Date(now.getTime() - 367 * 86_400_000),
      status: 'active',
      user: lifecycleUser,
    })
    const reminderUser = await createUser('reminder')
    const reminderMembership = await createDirectMembership({
      expiresAt: new Date(now.getTime() + 10 * 86_400_000),
      reminderDays: 30,
      startedAt: new Date(now.getTime() - 355 * 86_400_000),
      status: 'active',
      user: reminderUser,
    })
    const graceRecoveryUser = await createUser('grace-recovery')
    const recoveryMembership = await createDirectMembership({
      expiresAt: new Date(now.getTime() - 86_400_000),
      graceDays: 7,
      startedAt: new Date(now.getTime() - 367 * 86_400_000),
      status: 'active',
      user: graceRecoveryUser,
    })

    const first = await processMembershipLifecycle({ now, req: await requestFor(reviewer) })
    expect(first.graceStarted).toBeGreaterThanOrEqual(1)
    expect(first.remindersQueued).toBeGreaterThanOrEqual(1)
    const grace = await payload.findByID({
      collection: 'memberships',
      id: graceMembership.id,
      overrideAccess: true,
    })
    expect(grace.status).toBe('grace_period')
    const recoveryRenewal = await checkout(graceRecoveryUser, {
      intent: 'renewal',
      transactionId: 'ZELLE-GRACE-RECOVERY',
    })
    await reviewZellePayment({
      decision: 'approve',
      paymentID: recoveryRenewal.payment.id,
      req: await requestFor(reviewer),
    })
    const [recoveredPrevious, recoveredCurrent] = await Promise.all([
      payload.findByID({
        collection: 'memberships',
        id: recoveryMembership.id,
        overrideAccess: true,
      }),
      payload.findByID({
        collection: 'memberships',
        id: recoveryRenewal.membership.id,
        overrideAccess: true,
      }),
    ])
    expect(recoveredPrevious.status).toBe('expired')
    expect(recoveredCurrent.status).toBe('active')
    const repeated = await processMembershipLifecycle({ now, req: await requestFor(reviewer) })
    expect(repeated.remindersQueued).toBe(0)

    await processMembershipLifecycle({
      now: new Date(now.getTime() + 9 * 86_400_000),
      req: await requestFor(reviewer),
    })
    const expired = await payload.findByID({
      collection: 'memberships',
      id: graceMembership.id,
      overrideAccess: true,
    })
    expect(expired.status).toBe('expired')

    const reactivation = await checkout(lifecycleUser, {
      intent: 'reactivation',
      transactionId: 'ZELLE-REACTIVATION',
    })
    expect(getRelationshipID(reactivation.membership.previousMembership)).toBe(graceMembership.id)
    await reviewZellePayment({
      decision: 'approve',
      paymentID: reactivation.payment.id,
      req: await requestFor(reviewer),
    })
    const activeAgain = await payload.findByID({
      collection: 'memberships',
      id: reactivation.membership.id,
      overrideAccess: true,
    })
    expect(activeAgain.status).toBe('active')

    const delivery = await payload.find({
      collection: 'emailDeliveries',
      limit: 10,
      overrideAccess: true,
      where: {
        deduplicationKey: {
          equals: `membership:${reminderMembership.id}:renewal:${reminderMembership.expiresAt}`,
        },
      },
    })
    expect(delivery.totalDocs).toBe(1)
  })
})
