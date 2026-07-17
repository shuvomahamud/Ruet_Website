import config from '@payload-config'
import { expect, test, type Page } from '@playwright/test'
import { createLocalReq, getPayload, type Payload } from 'payload'

import type { Chapter, Event, MembershipPlan, User } from '@/payload-types'

test.describe.serial('Member dashboard, private histories, and reporting scope', () => {
  let payload: Payload
  let chapter: Chapter
  let otherChapter: Chapter
  let plan: MembershipPlan
  let member: User
  let otherMember: User
  let chapterAdmin: User
  let event: Event
  let otherEvent: Event
  let planCreated = false
  const membershipIDs: number[] = []
  const orderIDs: number[] = []
  const paymentIDs: number[] = []
  const registrationIDs: number[] = []
  const eventIDs: number[] = []
  const userIDs: number[] = []
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const password = `Dashboard-${nonce}-A9!`
  const memberTransaction = `DASHBOARD-MEMBER-${nonce}`
  const otherTransaction = `DASHBOARD-OTHER-${nonce}`

  const signIn = async (page: Page, user: User) => {
    await page.goto('/login')
    await page.getByLabel('Email address').fill(user.email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/dashboard/)
  }

  const signOut = async (page: Page) => {
    await page.goto('/account/settings')
    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/login/)
  }

  const createUser = async (label: string, primaryChapter: number) => {
    const created = await payload.create({
      collection: 'users',
      data: {
        _verified: true,
        accountStatus: 'active',
        email: `dashboard-${label}-${nonce}@example.test`,
        firstName: 'Dashboard',
        lastName: label,
        password,
        primaryChapter,
        role: 'member',
      },
      overrideAccess: true,
    })
    userIDs.push(created.id)
    return created
  }

  const createMembershipPayment = async (
    owner: User,
    ownerChapter: Chapter,
    transactionID: string,
  ) => {
    const membership = await payload.create({
      collection: 'memberships',
      context: { allowInactiveMembershipPlanForTest: true },
      data: {
        billingIntervalSnapshot: 'annual',
        chapterAttribution: ownerChapter.id,
        chapterNameSnapshot: ownerChapter.name,
        currencySnapshot: plan.currency,
        expiresAt: new Date(Date.now() + 31_536_000_000).toISOString(),
        gracePeriodDaysSnapshot: plan.gracePeriodDays ?? 7,
        membershipKind: 'join',
        paymentMethod: 'zelle',
        plan: plan.id,
        planPriceSnapshot: plan.annualPrice,
        planTitleSnapshot: plan.title,
        renewalReminderDaysBeforeSnapshot: plan.renewalReminderDaysBefore ?? 30,
        renewalReminderEnabledSnapshot: plan.renewalReminderEnabled ?? true,
        startedAt: new Date().toISOString(),
        status: 'active',
        user: owner.id,
      },
      overrideAccess: true,
    })
    membershipIDs.push(membership.id)
    const order = await payload.create({
      collection: 'orders',
      data: {
        chapterAttribution: ownerChapter.id,
        chapterNameSnapshot: ownerChapter.name,
        currency: 'USD',
        discountTotal: 0,
        membership: membership.id,
        orderType: 'membership',
        paymentMethod: 'zelle',
        status: 'pending',
        subtotal: plan.annualPrice,
        total: plan.annualPrice,
        user: owner.id,
      },
      overrideAccess: true,
    })
    orderIDs.push(order.id)
    const payment = await payload.create({
      collection: 'payments',
      data: {
        amountSnapshot: plan.annualPrice,
        chapterNameSnapshot: ownerChapter.name,
        currencySnapshot: 'USD',
        firstReviewerChapter: ownerChapter.id,
        order: order.id,
        orderTypeSnapshot: 'membership',
        paymentSource: 'zelle',
        proofTransactionId: transactionID,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        user: owner.id,
      },
      overrideAccess: true,
    })
    paymentIDs.push(payment.id)
    await payload.update({
      collection: 'orders',
      data: { status: 'paid' },
      id: order.id,
      overrideAccess: true,
    })
    await payload.update({
      collection: 'payments',
      data: { approvedAt: new Date().toISOString(), status: 'approved' },
      id: payment.id,
      overrideAccess: true,
    })
  }

  const createEvent = async (ownerChapter: Chapter, label: string) => {
    const startAt = new Date(Date.now() + 172_800_000).toISOString()
    const created = await payload.create({
      collection: 'events',
      data: {
        _status: 'published',
        basePrice: 0,
        capacity: 10,
        chapter: ownerChapter.id,
        currency: 'USD',
        endAt: new Date(Date.now() + 180_000_000).toISOString(),
        eventMode: 'inPerson',
        isPaid: false,
        maxRegistrationQuantity: 2,
        slug: `dashboard-${label}-${nonce}`,
        startAt,
        status: 'published',
        summary: `Dashboard ${label} event fixture.`,
        timezone: 'America/New_York',
        title: `Dashboard ${label} Event ${nonce}`,
        waitlistEnabled: true,
        waitlistOfferHours: 24,
      },
      overrideAccess: true,
    })
    eventIDs.push(created.id)
    return created
  }

  const createRegistration = async (owner: User, targetEvent: Event, ownerChapter: Chapter) => {
    const req = await createLocalReq({ user: owner }, payload)
    const created = await payload.create({
      collection: 'eventRegistrations',
      context: { eventWorkflowValidated: true },
      data: {
        chapterNameSnapshot: ownerChapter.name,
        currencySnapshot: 'USD',
        discountSnapshot: 0,
        event: targetEvent.id,
        eventStartAtSnapshot: targetEvent.startAt,
        eventTitleSnapshot: targetEvent.title,
        quantity: 1,
        registrationPriceSnapshot: 0,
        status: 'confirmed',
        unitPriceSnapshot: 0,
        user: owner.id,
      },
      overrideAccess: false,
      req,
    })
    registrationIDs.push(created.id)
  }

  test.beforeAll(async () => {
    payload = await getPayload({ config })
    chapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Dashboard Chapter ${nonce}`,
        slug: `dashboard-chapter-${nonce}`,
        summary: 'Dashboard chapter fixture.',
      },
      overrideAccess: true,
    })
    otherChapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Dashboard Other Chapter ${nonce}`,
        slug: `dashboard-other-${nonce}`,
        summary: 'Dashboard scope isolation fixture.',
      },
      overrideAccess: true,
    })
    member = await createUser('member', chapter.id)
    otherMember = await createUser('other', otherChapter.id)
    chapterAdmin = await createUser('chapter-admin', chapter.id)
    chapterAdmin = await payload.update({
      collection: 'users',
      data: { managedChapters: [chapter.id], role: 'chapterAdmin' },
      id: chapterAdmin.id,
      overrideAccess: true,
    })
    const activePlans = await payload.find({
      collection: 'membershipPlans',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { active: { equals: true } },
    })
    if (activePlans.docs[0]) plan = activePlans.docs[0]
    else {
      plan = await payload.create({
        collection: 'membershipPlans',
        data: {
          active: true,
          annualPrice: 25,
          currency: 'USD',
          gracePeriodDays: 7,
          renewalReminderDaysBefore: 30,
          renewalReminderEnabled: true,
          renewalPolicy: 'Dashboard manual renewal fixture.',
          slug: `dashboard-plan-${nonce}`,
          termsSummary: 'Dashboard plan terms.',
          title: `Dashboard Annual Plan ${nonce}`,
        },
        overrideAccess: true,
      })
      planCreated = true
    }
    await createMembershipPayment(member, chapter, memberTransaction)
    await createMembershipPayment(otherMember, otherChapter, otherTransaction)
    event = await createEvent(chapter, 'Member')
    otherEvent = await createEvent(otherChapter, 'Other')
    await createRegistration(member, event, chapter)
    await createRegistration(otherMember, otherEvent, otherChapter)
  })

  test.afterAll(async () => {
    for (const id of paymentIDs) await payload.delete({ collection: 'payments', id, overrideAccess: true })
    for (const id of orderIDs) await payload.delete({ collection: 'orders', id, overrideAccess: true })
    for (const id of registrationIDs) {
      await payload.delete({ collection: 'eventRegistrations', id, overrideAccess: true })
    }
    for (const id of membershipIDs) await payload.delete({ collection: 'memberships', id, overrideAccess: true })
    for (const id of eventIDs) await payload.delete({ collection: 'events', id, overrideAccess: true })
    if (planCreated && plan?.id) {
      await payload.delete({ collection: 'membershipPlans', id: plan.id, overrideAccess: true })
    }
    for (const id of userIDs) await payload.delete({ collection: 'users', id, overrideAccess: true })
    for (const item of [chapter, otherChapter]) {
      if (item?.id) await payload.delete({ collection: 'chapters', id: item.id, overrideAccess: true })
    }
  })

  test('shows a member dashboard and keeps direct private histories owner-scoped', async ({ page }) => {
    await signIn(page, member)
    await expect(page.getByRole('heading', { name: plan.title })).toBeVisible()
    await expect(page.getByRole('heading', { name: event.title })).toBeVisible()
    await expect(page.getByText(otherEvent.title)).toHaveCount(0)

    await page.goto('/account/payments')
    await expect(page.getByText(memberTransaction)).toBeVisible()
    await expect(page.getByText(otherTransaction)).toHaveCount(0)

    await page.goto('/events/registrations')
    await expect(page.getByRole('heading', { name: event.title })).toBeVisible()
    await expect(page.getByText(otherEvent.title)).toHaveCount(0)

    const forbiddenReport = await page.evaluate(async () => (await fetch('/api/reports')).status)
    expect(forbiddenReport).toBe(403)
    await signOut(page)
  })

  test('limits chapter-admin report pages and direct APIs to managed chapters', async ({ page }) => {
    await signIn(page, chapterAdmin)
    await expect(
      page
        .getByRole('navigation', { name: 'Utility navigation' })
        .getByRole('link', { name: 'Payment review' }),
    ).toBeVisible()
    await page.goto('/reports')
    await expect(page.getByRole('heading', { name: 'Operational reports' })).toBeVisible()
    await expect(page.getByText('All managed chapters')).toBeVisible()
    await expect(page.getByRole('rowheader', { name: event.title })).toBeVisible()
    await expect(page.getByText(otherEvent.title)).toHaveCount(0)

    const reportResponse = await page.evaluate(async () => {
      const response = await fetch('/api/reports')
      return { body: await response.json(), status: response.status }
    })
    expect(reportResponse.status).toBe(200)
    const report = reportResponse.body
    expect(report.totals.approvedRevenue).toBe(plan.annualPrice)
    expect(report.totals.registrations).toBe(1)

    const forbiddenChapter = await page.evaluate(
      async (chapterID) => (await fetch(`/api/reports?chapter=${chapterID}`)).status,
      otherChapter.id,
    )
    expect(forbiddenChapter).toBe(403)
  })
})
