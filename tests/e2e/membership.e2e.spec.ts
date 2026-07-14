import config from '@payload-config'
import { expect, test, type Page } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import type { Chapter, MembershipPlan, SiteSetting, User } from '@/payload-types'

test.describe.serial('Membership and Zelle experience', () => {
  let payload: Payload
  let chapter: Chapter
  let member: User
  let resubmitMember: User
  let incompleteMember: User
  let reviewer: User
  let createdPlan: MembershipPlan | undefined
  let originalSettings: SiteSetting
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const memberPassword = `Member-${nonce}-A9!`
  const resubmitPassword = `Resubmit-${nonce}-A9!`
  const incompletePassword = `Incomplete-${nonce}-A9!`
  const reviewerPassword = `Reviewer-${nonce}-A9!`

  const signIn = async (page: Page, email: string, password: string) => {
    await page.goto('/login')
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/dashboard/)
  }

  const signOut = async (page: Page) => {
    await page.goto('/account/settings')
    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/login/)
  }

  const createMember = async (label: string, password: string, complete = true) => {
    const acceptedAt = new Date().toISOString()
    return payload.create({
      collection: 'users',
      data: {
        _verified: true,
        accountStatus: 'active',
        city: complete ? 'New York' : undefined,
        country: complete ? 'United States' : undefined,
        email: `e2e-membership-${label}-${nonce}@example.test`,
        firstName: complete ? 'E2E' : undefined,
        graduationYear: complete ? 2014 : undefined,
        lastName: complete ? label : undefined,
        password,
        primaryChapter: complete ? chapter.id : undefined,
        privacyAcceptedAt: complete ? acceptedAt : undefined,
        role: 'member',
        ruetDepartment: complete ? 'EEE' : undefined,
        state: complete ? 'NY' : undefined,
        termsAcceptedAt: complete ? acceptedAt : undefined,
      },
      overrideAccess: true,
    })
  }

  test.beforeAll(async () => {
    payload = await getPayload({ config })
    originalSettings = await payload.findGlobal({
      depth: 0,
      overrideAccess: true,
      slug: 'siteSettings',
    })
    await payload.updateGlobal({
      data: {
        manualPaymentReviewNote: 'E2E payment proofs are reviewed manually.',
        noRefundNotice: 'E2E payment terms apply.',
        zelleInstructions:
          'Send the exact displayed total and submit the transaction ID, proof, or both.',
        zelleRecipient: 'payments-e2e@example.test',
        zelleRecipientName: 'RUETIAN USA E2E',
      },
      overrideAccess: true,
      slug: 'siteSettings',
    })
    const activePlans = await payload.find({
      collection: 'membershipPlans',
      depth: 0,
      limit: 2,
      overrideAccess: true,
      where: { active: { equals: true } },
    })
    if (!activePlans.docs.length) {
      createdPlan = await payload.create({
        collection: 'membershipPlans',
        data: {
          active: true,
          annualPrice: 55,
          benefits: [{ label: 'Participate in alumni programs' }],
          currency: 'USD',
          faqs: [{ answer: 'Each term uses a new Zelle submission.', question: 'How do I renew?' }],
          gracePeriodDays: 7,
          publicSummary: 'A complete annual membership browser fixture.',
          renewalPolicy: 'Renew manually each year. There is no automatic debit.',
          renewalReminderDaysBefore: 30,
          renewalReminderEnabled: true,
          slug: `e2e-annual-membership-${nonce}`,
          termsSummary: 'Manual Zelle review is required before activation.',
          title: `E2E Annual Membership ${nonce}`,
        },
        overrideAccess: true,
      })
    }
    chapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `E2E Membership Chapter ${nonce}`,
        slug: `e2e-membership-chapter-${nonce}`,
        summary: 'Membership browser fixture.',
      },
      overrideAccess: true,
    })
    member = await createMember('approved', memberPassword)
    resubmitMember = await createMember('resubmit', resubmitPassword)
    incompleteMember = await createMember('incomplete', incompletePassword, false)
    reviewer = await payload.create({
      collection: 'users',
      data: {
        _verified: true,
        accountStatus: 'active',
        email: `e2e-membership-reviewer-${nonce}@example.test`,
        password: reviewerPassword,
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
  })

  test.afterAll(async () => {
    const testUsers = [member, resubmitMember, incompleteMember, reviewer].filter(Boolean)
    const deliveries = await payload.find({
      collection: 'emailDeliveries',
      limit: 100,
      overrideAccess: true,
      where: { user: { in: testUsers.map((user) => user.id) } },
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
    const payments = await payload.find({
      collection: 'payments',
      limit: 100,
      overrideAccess: true,
      where: { user: { in: testUsers.map((user) => user.id) } },
    })
    const audits = await payload.find({
      collection: 'auditLogs',
      limit: 100,
      overrideAccess: true,
      where: { entityID: { in: payments.docs.map((payment) => String(payment.id)) } },
    })
    for (const audit of audits.docs) {
      await payload.delete({ collection: 'auditLogs', id: audit.id, overrideAccess: true })
    }
    for (const payment of payments.docs) {
      await payload.delete({ collection: 'payments', id: payment.id, overrideAccess: true })
    }
    const orders = await payload.find({
      collection: 'orders',
      limit: 100,
      overrideAccess: true,
      where: { user: { in: testUsers.map((user) => user.id) } },
    })
    for (const order of orders.docs) {
      await payload.delete({ collection: 'orders', id: order.id, overrideAccess: true })
    }
    const memberships = await payload.find({
      collection: 'memberships',
      limit: 100,
      overrideAccess: true,
      where: { user: { in: testUsers.map((user) => user.id) } },
    })
    for (const membership of memberships.docs) {
      await payload.delete({ collection: 'memberships', id: membership.id, overrideAccess: true })
    }
    for (const user of testUsers) {
      await payload.delete({ collection: 'users', id: user.id, overrideAccess: true })
    }
    await payload.delete({ collection: 'chapters', id: chapter.id, overrideAccess: true })
    if (createdPlan) {
      await payload.delete({ collection: 'membershipPlans', id: createdPlan.id, overrideAccess: true })
    }
    await payload.updateGlobal({
      data: {
        manualPaymentReviewNote: originalSettings.manualPaymentReviewNote,
        noRefundNotice: originalSettings.noRefundNotice,
        zelleInstructions: originalSettings.zelleInstructions,
        zelleRecipient: originalSettings.zelleRecipient,
        zelleRecipientName: originalSettings.zelleRecipientName,
      },
      overrideAccess: true,
      slug: 'siteSettings',
    })
  })

  test('renders the annual overview and prevents incomplete-profile checkout', async ({ page }) => {
    await page.goto('/membership')
    await expect(page.getByRole('heading', { name: 'Annual renewal' })).toBeVisible()
    await expect(page.getByText(/never renews or debits automatically/i)).toBeVisible()

    await signIn(page, incompleteMember.email, incompletePassword)
    await page.setViewportSize({ height: 844, width: 390 })
    await page.goto('/membership/join')
    await expect(page.getByRole('heading', { name: 'Complete your profile first' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Complete account profile' })).toBeVisible()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true)
  })

  test('submits a transaction-ID-only membership and shows pending status', async ({ page }) => {
    await signIn(page, member.email, memberPassword)
    await page.goto('/membership/join')
    await expect(page.getByText('payments-e2e@example.test')).toBeVisible()
    await page.getByLabel(/Zelle transaction ID/).fill(`E2E-ZELLE-APPROVE-${nonce}`)
    const response = page.waitForResponse(
      (candidate) =>
        candidate.url().endsWith('/api/membership/checkout') &&
        candidate.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Submit for manual review' }).click()
    expect((await response).status()).toBe(201)
    await expect(page.getByText('Your membership payment is pending review.')).toBeVisible()
    const reviewerNotice = await payload.find({
      collection: 'emailDeliveries',
      limit: 10,
      overrideAccess: true,
      where: {
        and: [
          { user: { equals: reviewer.id } },
          { subject: { equals: 'Membership payment awaiting review' } },
        ],
      },
    })
    expect(reviewerNotice.totalDocs).toBe(1)
    await page.getByRole('link', { name: 'View membership status' }).click()
    await expect(page.getByText('pending manual approval')).toBeVisible()
    await expect(page.getByText(/Attempt #/)).toBeVisible()
    await page.setViewportSize({ height: 844, width: 390 })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true)
  })

  test('lets the assigned chapter reviewer approve and activates only afterward', async ({ page }) => {
    await signIn(page, reviewer.email, reviewerPassword)
    await page.setViewportSize({ height: 844, width: 390 })
    await page.goto('/membership/payments/review')
    const card = page.getByRole('article').filter({ hasText: 'E2E approved' })
    await expect(card).toBeVisible()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true)
    const response = page.waitForResponse((candidate) =>
      candidate.url().includes('/api/membership/payments/'),
    )
    await card.getByRole('button', { name: 'Approve payment' }).click()
    expect((await response).status()).toBe(200)
    await expect(page.getByText(/membership term was recorded/i)).toBeVisible()

    await signOut(page)
    await signIn(page, member.email, memberPassword)
    await page.goto('/membership/status')
    await expect(page.getByText('active', { exact: true })).toBeVisible()
    await expect(page.getByText('Not set', { exact: true })).toHaveCount(1)
  })

  test('preserves a rejection and permits a new payment attempt through resubmission', async ({
    page,
  }) => {
    await signIn(page, resubmitMember.email, resubmitPassword)
    await page.goto('/membership/join')
    await page.getByLabel(/Zelle transaction ID/).fill(`E2E-ZELLE-REJECT-${nonce}`)
    await page.getByRole('button', { name: 'Submit for manual review' }).click()
    await expect(page.getByText('Your membership payment is pending review.')).toBeVisible()

    await signOut(page)
    await signIn(page, reviewer.email, reviewerPassword)
    await page.goto('/membership/payments/review')
    const card = page.getByRole('article').filter({ hasText: 'E2E resubmit' })
    await card.getByLabel(/Rejection reason/).fill('E2E transaction could not be verified.')
    await card.getByRole('button', { name: 'Reject payment' }).click()
    await expect(page.getByText(/can be resubmitted/i)).toBeVisible()

    await signOut(page)
    await signIn(page, resubmitMember.email, resubmitPassword)
    await page.goto('/membership/renew')
    await expect(page.getByRole('heading', { name: 'Resubmit Zelle details' })).toBeVisible()
    await page.getByLabel(/Zelle transaction ID/).fill(`E2E-ZELLE-RESUBMIT-${nonce}`)
    await page.getByRole('button', { name: 'Submit for manual review' }).click()
    await expect(page.getByText('Your new payment details are pending review.')).toBeVisible()
    await page.goto('/membership/status')
    await expect(page.getByText('failed', { exact: true })).toBeVisible()
    await expect(page.getByText('pending', { exact: true })).toHaveCount(2)
    await expect(page.getByText('E2E transaction could not be verified.')).toBeVisible()
  })
})
