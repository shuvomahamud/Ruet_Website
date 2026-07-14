import { createLocalReq, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { Chapter, Event, Membership, MembershipPlan, Order, User } from '@/payload-types'
import { getMemberDashboardData } from '@/services/member-dashboard'
import { getReportingData, reportingDataToCSV } from '@/services/reporting'
import { getRelationshipID } from '@/utilities/relationships'

import { getTestPayload } from '../helpers/payload'

describe.sequential('member dashboard, private history, and scoped operational reporting', () => {
  let payload: Payload
  let chapter: Chapter
  let otherChapter: Chapter
  let plan: MembershipPlan
  let member: User
  let otherMember: User
  let chapterAdmin: User
  let admin: User
  let event: Event
  const userIDs: number[] = []
  const membershipIDs: number[] = []
  const orderIDs: number[] = []
  const paymentIDs: number[] = []
  const registrationIDs: number[] = []
  const waitlistIDs: number[] = []
  const eventIDs: number[] = []
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`

  const createMembership = async ({
    kind = 'join',
    owner,
    previous,
    status,
  }: {
    kind?: Membership['membershipKind']
    owner: User
    previous?: Membership
    status: Membership['status']
  }) => {
    const created = await payload.create({
      collection: 'memberships',
      context: { allowInactiveMembershipPlanForTest: true },
      data: {
        billingIntervalSnapshot: 'annual',
        chapterAttribution:
          owner.primaryChapter && typeof owner.primaryChapter === 'object'
            ? owner.primaryChapter.id
            : owner.primaryChapter,
        chapterNameSnapshot:
          owner.primaryChapter && typeof owner.primaryChapter === 'object'
            ? owner.primaryChapter.name
            : undefined,
        currencySnapshot: 'USD',
        gracePeriodDaysSnapshot: 7,
        membershipKind: kind,
        paymentMethod: 'zelle',
        plan: plan.id,
        planPriceSnapshot: 40,
        planTitleSnapshot: plan.title,
        previousMembership: previous?.id,
        renewalReminderDaysBeforeSnapshot: 30,
        renewalReminderEnabledSnapshot: true,
        status,
        user: owner.id,
      },
      overrideAccess: true,
    })
    membershipIDs.push(created.id)
    return created
  }

  const createOrder = async ({
    amount,
    membership,
    owner,
    promotionCode,
    registration,
    status: _status,
    type,
  }: {
    amount: number
    membership?: Membership
    owner: User
    promotionCode?: string
    registration?: number
    status: Order['status']
    type: Order['orderType']
  }) => {
    const ownerChapter =
      typeof owner.primaryChapter === 'object' ? owner.primaryChapter : type === 'event' ? chapter : undefined
    const created = await payload.create({
      collection: 'orders',
      data: {
        chapterAttribution: ownerChapter?.id ?? owner.primaryChapter,
        chapterNameSnapshot: ownerChapter?.name,
        currency: 'USD',
        discountTotal: promotionCode ? 2 : 0,
        eventRegistration: registration,
        membership: membership?.id,
        orderType: type,
        paymentMethod: 'zelle',
        promotionCodeSnapshot: promotionCode,
        promotionDiscountTypeSnapshot: promotionCode ? 'fixed' : undefined,
        promotionDiscountValueSnapshot: promotionCode ? 2 : undefined,
        status: 'pending',
        subtotal: amount + (promotionCode ? 2 : 0),
        total: amount,
        user: owner.id,
      },
      overrideAccess: true,
    })
    orderIDs.push(created.id)
    return created
  }

  const createPayment = async ({
    amount,
    order,
    owner,
    status,
    type,
  }: {
    amount: number
    order: Order
    owner: User
    status: 'approved' | 'failed' | 'pending'
    type: 'event' | 'membership'
  }) => {
    const ownerChapter = typeof owner.primaryChapter === 'object' ? owner.primaryChapter : undefined
    const created = await payload.create({
      collection: 'payments',
      data: {
        amountSnapshot: amount,
        chapterNameSnapshot: ownerChapter?.name,
        currencySnapshot: 'USD',
        firstReviewerChapter: ownerChapter?.id ?? owner.primaryChapter,
        order: order.id,
        orderTypeSnapshot: type,
        paymentSource: 'zelle',
        proofTransactionId: `PHASE9-${nonce}-${paymentIDs.length}`,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        user: owner.id,
      },
      overrideAccess: true,
    })
    paymentIDs.push(created.id)
    if (status === 'pending') return created
    await payload.update({
      collection: 'orders',
      data: { status: status === 'approved' ? 'paid' : 'failed' },
      id: order.id,
      overrideAccess: true,
    })
    return payload.update({
      collection: 'payments',
      data: {
        approvedAt: status === 'approved' ? new Date().toISOString() : undefined,
        rejectedAt: status === 'failed' ? new Date().toISOString() : undefined,
        rejectionReason: status === 'failed' ? 'Fixture rejection' : undefined,
        status,
      },
      id: created.id,
      overrideAccess: true,
    })
  }

  beforeAll(async () => {
    payload = await getTestPayload()
    chapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Phase 9 Chapter ${nonce}`,
        slug: `phase-9-${nonce}`,
        summary: 'Phase 9 reporting scope.',
      },
      overrideAccess: true,
    })
    otherChapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Phase 9 Other ${nonce}`,
        slug: `phase-9-other-${nonce}`,
        summary: 'Phase 9 reporting isolation scope.',
      },
      overrideAccess: true,
    })
    const createUser = async (label: string, role: User['role'], primaryChapter?: number) => {
      const created = await payload.create({
        collection: 'users',
        data: {
          _verified: true,
          accountStatus: 'active',
          email: `phase9-${label}-${nonce}@example.test`,
          firstName: 'Phase',
          lastName: label,
          password: `Phase9-${label}-${nonce}-A9!`,
          primaryChapter,
          role,
        },
        overrideAccess: true,
      })
      userIDs.push(created.id)
      return created
    }
    member = await createUser('member', 'member', chapter.id)
    otherMember = await createUser('other', 'member', otherChapter.id)
    chapterAdmin = await createUser('chapter-admin', 'member', chapter.id)
    chapterAdmin = await payload.update({
      collection: 'users',
      data: { managedChapters: [chapter.id], role: 'chapterAdmin' },
      id: chapterAdmin.id,
      overrideAccess: true,
    })
    admin = await createUser('admin', 'member')
    const bootstrap = { accountStatus: 'active', id: -1, role: 'superAdmin' } as User
    admin = await payload.update({
      collection: 'users',
      data: { role: 'admin' },
      id: admin.id,
      overrideAccess: true,
      user: bootstrap,
    })
    plan = await payload.create({
      collection: 'membershipPlans',
      data: {
        active: false,
        annualPrice: 40,
        currency: 'USD',
        gracePeriodDays: 7,
        renewalReminderDaysBefore: 30,
        renewalReminderEnabled: true,
        renewalPolicy: 'Phase 9 manual renewal fixture.',
        slug: `phase-9-plan-${nonce}`,
        termsSummary: 'Phase 9 terms.',
        title: `Phase 9 Annual ${nonce}`,
      },
      overrideAccess: true,
    })

    const active = await createMembership({ owner: member, status: 'active' })
    const renewal = await createMembership({
      kind: 'renewal',
      owner: member,
      previous: active,
      status: 'failed_manual_payment',
    })
    const memberOrder = await createOrder({
      amount: 40,
      membership: active,
      owner: member,
      status: 'paid',
      type: 'membership',
    })
    await createPayment({ amount: 40, order: memberOrder, owner: member, status: 'approved', type: 'membership' })
    const failedOrder = await createOrder({
      amount: 40,
      membership: renewal,
      owner: member,
      status: 'failed',
      type: 'membership',
    })
    await createPayment({ amount: 40, order: failedOrder, owner: member, status: 'failed', type: 'membership' })

    const otherMembership = await createMembership({ owner: otherMember, status: 'grace_period' })
    const otherOrder = await createOrder({
      amount: 40,
      membership: otherMembership,
      owner: otherMember,
      status: 'paid',
      type: 'membership',
    })
    await createPayment({ amount: 40, order: otherOrder, owner: otherMember, status: 'approved', type: 'membership' })

    const startAt = new Date(Date.now() + 172_800_000).toISOString()
    event = await payload.create({
      collection: 'events',
      data: {
        _status: 'published',
        basePrice: 10,
        capacity: 5,
        chapter: chapter.id,
        currency: 'USD',
        endAt: new Date(Date.now() + 180_000_000).toISOString(),
        eventMode: 'inPerson',
        isPaid: true,
        maxRegistrationQuantity: 2,
        slug: `phase-9-event-${nonce}`,
        startAt,
        status: 'published',
        summary: 'Phase 9 reporting event.',
        timezone: 'America/New_York',
        title: `Phase 9 Event ${nonce}`,
        waitlistEnabled: true,
        waitlistOfferHours: 24,
      },
      overrideAccess: true,
    })
    eventIDs.push(event.id)
    const memberReq = await createLocalReq({ user: member }, payload)
    const registration = await payload.create({
      collection: 'eventRegistrations',
      context: { eventWorkflowValidated: true },
      data: {
        chapterNameSnapshot: chapter.name,
        currencySnapshot: 'USD',
        discountSnapshot: 2,
        event: event.id,
        eventStartAtSnapshot: event.startAt,
        eventTitleSnapshot: event.title,
        paymentStatus: 'paid',
        quantity: 2,
        registrationPriceSnapshot: 20,
        status: 'confirmed',
        unitPriceSnapshot: 10,
        user: member.id,
      },
      overrideAccess: false,
      req: memberReq,
    })
    registrationIDs.push(registration.id)
    const eventOrder = await createOrder({
      amount: 18,
      owner: member,
      promotionCode: `SAVE2-${nonce}`,
      registration: registration.id,
      status: 'paid',
      type: 'event',
    })
    await createPayment({ amount: 18, order: eventOrder, owner: member, status: 'approved', type: 'event' })

    const otherReq = await createLocalReq({ user: otherMember }, payload)
    const waitlist = await payload.create({
      collection: 'waitlistEntries',
      context: { eventWorkflowValidated: true },
      data: {
        event: event.id,
        joinedAt: new Date().toISOString(),
        quantity: 1,
        status: 'waiting',
        user: otherMember.id,
      },
      overrideAccess: false,
      req: otherReq,
    })
    waitlistIDs.push(waitlist.id)
  })

  afterAll(async () => {
    for (const id of paymentIDs) await payload.delete({ collection: 'payments', id, overrideAccess: true })
    for (const id of orderIDs) await payload.delete({ collection: 'orders', id, overrideAccess: true })
    for (const id of registrationIDs) await payload.delete({ collection: 'eventRegistrations', id, overrideAccess: true })
    for (const id of waitlistIDs) await payload.delete({ collection: 'waitlistEntries', id, overrideAccess: true })
    for (const id of membershipIDs) await payload.delete({ collection: 'memberships', id, overrideAccess: true })
    for (const id of eventIDs) await payload.delete({ collection: 'events', id, overrideAccess: true })
    if (plan?.id) await payload.delete({ collection: 'membershipPlans', id: plan.id, overrideAccess: true })
    for (const id of userIDs) await payload.delete({ collection: 'users', id, overrideAccess: true })
    for (const item of [chapter, otherChapter]) {
      if (item?.id) await payload.delete({ collection: 'chapters', id: item.id, overrideAccess: true })
    }
  })

  it('assembles only the authenticated member dashboard and history records', async () => {
    const dashboard = await getMemberDashboardData({ payload, user: member })
    expect(dashboard.membership?.user).toBe(member.id)
    expect(dashboard.chapter?.id).toBe(chapter.id)
    expect(dashboard.payments).toHaveLength(3)
    expect(dashboard.payments.every((payment) => getRelationshipID(payment.user) === member.id)).toBe(
      true,
    )
    expect(dashboard.registrations).toHaveLength(1)

    const directOtherOwnerQuery = await payload.find({
      collection: 'payments',
      overrideAccess: false,
      user: otherMember,
      where: { id: { equals: paymentIDs[0] } },
    })
    expect(directOtherOwnerQuery.totalDocs).toBe(0)
  })

  it('reconciles chapter report totals with immutable fixture records', async () => {
    const report = await getReportingData({ filters: { chapterID: chapter.id }, payload, user: admin })
    expect(report.memberships.find((item) => item.status === 'active')?.count).toBe(1)
    expect(report.memberships.find((item) => item.status === 'failed_manual_payment')?.count).toBe(1)
    expect(report.membershipKinds.find((item) => item.status === 'renewal')?.count).toBe(1)
    expect(report.membershipTermOutcomes.find((item) => item.kind === 'renewal')).toMatchObject({
      failed: 1,
      total: 1,
    })
    expect(report.paymentOutcomes.find((item) => item.status === 'approved')?.count).toBe(2)
    expect(report.totals).toMatchObject({
      approvedRevenue: 58,
      failedPayments: 1,
      registrations: 2,
      waitlistEntries: 1,
    })
    expect(report.revenue).toEqual([
      { chapter: chapter.name, event: 18, membership: 40, total: 58 },
    ])
    expect(report.events[0]).toMatchObject({ confirmed: 2, pending: 0, remaining: 3, waitlisted: 1 })
    expect(report.promotions[0]).toMatchObject({ discount: 2, paid: 1, revenue: 18, uses: 1 })
    expect(reportingDataToCSV(report)).toContain('promotion_usage')
  })

  it('enforces managed-chapter scope and rejects member reporting access', async () => {
    const chapterReport = await getReportingData({ payload, user: chapterAdmin })
    expect(chapterReport.scopeLabel).toBe('All managed chapters')
    expect(chapterReport.totals.approvedRevenue).toBe(58)
    await expect(
      getReportingData({ filters: { chapterID: otherChapter.id }, payload, user: chapterAdmin }),
    ).rejects.toMatchObject({ status: 403 })
    await expect(getReportingData({ payload, user: member })).rejects.toMatchObject({ status: 403 })
  })
})
