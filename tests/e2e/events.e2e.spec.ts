import config from '@payload-config'
import { expect, test, type Page } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import type { Chapter, Event, SiteSetting, User } from '@/payload-types'

test.describe.serial('Events, waitlists, and Zelle experience', () => {
  let payload: Payload
  let chapter: Chapter
  let freeEvent: Event
  let paidEvent: Event
  let archiveEvent: Event
  let freeMember: User
  let paidMember: User
  let resubmitMember: User
  let reviewer: User
  let originalSettings: SiteSetting
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const password = `Event-E2E-${nonce}-A9!`
  const reviewerPassword = `Event-Reviewer-${nonce}-A9!`

  const signIn = async (page: Page, email: string, credential = password) => {
    await page.goto('/login')
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password').fill(credential)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/dashboard/)
  }

  const signOut = async (page: Page) => {
    await page.goto('/account/settings')
    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/login/)
  }

  const createMember = (label: string) =>
    payload.create({
      collection: 'users',
      data: {
        _verified: true,
        accountStatus: 'active',
        email: `e2e-event-${label.toLowerCase().replaceAll(' ', '-')}-${nonce}@example.test`,
        firstName: 'Event',
        lastName: label,
        password,
        primaryChapter: chapter.id,
        role: 'member',
      },
      overrideAccess: true,
    })

  test.beforeAll(async () => {
    payload = await getPayload({ config })
    originalSettings = await payload.findGlobal({
      depth: 0,
      overrideAccess: true,
      slug: 'siteSettings',
    })
    await payload.updateGlobal({
      data: {
        eventPaymentTerms: 'E2E event payments are manual and non-refundable.',
        manualPaymentReviewNote: 'E2E event proof is reviewed by the assigned chapter.',
        zelleInstructions: 'Send the exact event total and submit proof.',
        zelleRecipient: 'events-e2e@example.test',
        zelleRecipientName: 'RUETIAN USA Events E2E',
      },
      overrideAccess: true,
      slug: 'siteSettings',
    })
    chapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `E2E Events Chapter ${nonce}`,
        slug: `e2e-events-chapter-${nonce}`,
        summary: 'Events browser fixture chapter.',
      },
      overrideAccess: true,
    })
    const upcoming = new Date(Date.now() + 172_800_000)
    const base = {
      _status: 'published' as const,
      chapter: chapter.id,
      currency: 'USD',
      endAt: new Date(upcoming.getTime() + 7_200_000).toISOString(),
      maxRegistrationQuantity: 2,
      registrationClosesAt: new Date(upcoming.getTime() + 3_600_000).toISOString(),
      startAt: upcoming.toISOString(),
      status: 'published' as const,
      timezone: 'America/New_York' as const,
      waitlistEnabled: true,
      waitlistOfferHours: 48,
    }
    freeEvent = await payload.create({
      collection: 'events',
      data: {
        ...base,
        basePrice: 0,
        capacity: 1,
        eventMode: 'inPerson',
        isPaid: false,
        maxRegistrationQuantity: 1,
        slug: `e2e-free-event-${nonce}`,
        summary: 'Free event registration E2E fixture.',
        title: `E2E Free Gathering ${nonce}`,
        venue: 'New York Community Hall',
      },
      overrideAccess: true,
    })
    paidEvent = await payload.create({
      collection: 'events',
      data: {
        ...base,
        basePrice: 30,
        capacity: 2,
        eventMode: 'virtual',
        isPaid: true,
        slug: `e2e-paid-event-${nonce}`,
        summary: 'Paid Zelle event registration E2E fixture.',
        title: `E2E Paid Conference ${nonce}`,
        virtualAccessVisibility: 'registered',
        virtualLink: 'https://meet.example.test/e2e-private-conference',
      },
      overrideAccess: true,
    })
    const past = new Date(Date.now() - 172_800_000)
    archiveEvent = await payload.create({
      collection: 'events',
      data: {
        _status: 'published',
        basePrice: 0,
        capacity: 25,
        chapter: chapter.id,
        currency: 'USD',
        endAt: new Date(past.getTime() + 7_200_000).toISOString(),
        eventMode: 'hybrid',
        isPaid: false,
        maxRegistrationQuantity: 4,
        recapSummary: 'E2E alumni archive recap and outcomes.',
        slug: `e2e-archive-event-${nonce}`,
        startAt: past.toISOString(),
        status: 'archived',
        summary: 'Completed event archive fixture.',
        timezone: 'America/New_York',
        title: `E2E Archived Summit ${nonce}`,
        waitlistEnabled: true,
        waitlistOfferHours: 48,
      },
      overrideAccess: true,
    })
    freeMember = await createMember('Free Member')
    paidMember = await createMember('Paid Member')
    resubmitMember = await createMember('Resubmit Member')
    reviewer = await payload.create({
      collection: 'users',
      data: {
        _verified: true,
        accountStatus: 'active',
        email: `e2e-event-reviewer-${nonce}@example.test`,
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
    const testUsers = [freeMember, paidMember, resubmitMember, reviewer].filter(Boolean)
    const userIDs = testUsers.map((item) => item.id)
    const deliveries = await payload.find({
      collection: 'emailDeliveries',
      limit: 500,
      overrideAccess: true,
      where: { user: { in: userIDs } },
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
      limit: 500,
      overrideAccess: true,
      where: { user: { in: userIDs } },
    })
    const audits = await payload.find({
      collection: 'auditLogs',
      limit: 500,
      overrideAccess: true,
      where: { entityID: { in: payments.docs.map((item) => String(item.id)) } },
    })
    for (const audit of audits.docs) {
      await payload.delete({ collection: 'auditLogs', id: audit.id, overrideAccess: true })
    }
    for (const payment of payments.docs) {
      await payload.delete({ collection: 'payments', id: payment.id, overrideAccess: true })
    }
    const orders = await payload.find({
      collection: 'orders',
      limit: 500,
      overrideAccess: true,
      where: { user: { in: userIDs } },
    })
    for (const order of orders.docs) {
      await payload.delete({ collection: 'orders', id: order.id, overrideAccess: true })
    }
    const registrations = await payload.find({
      collection: 'eventRegistrations',
      limit: 500,
      overrideAccess: true,
      where: { user: { in: userIDs } },
    })
    for (const registration of registrations.docs) {
      await payload.delete({
        collection: 'eventRegistrations',
        id: registration.id,
        overrideAccess: true,
      })
    }
    const waitlist = await payload.find({
      collection: 'waitlistEntries',
      limit: 500,
      overrideAccess: true,
      where: { user: { in: userIDs } },
    })
    for (const entry of waitlist.docs) {
      await payload.delete({ collection: 'waitlistEntries', id: entry.id, overrideAccess: true })
    }
    for (const item of [freeEvent, paidEvent, archiveEvent]) {
      if (item?.id) await payload.delete({ collection: 'events', id: item.id, overrideAccess: true })
    }
    for (const item of testUsers) {
      await payload.delete({ collection: 'users', id: item.id, overrideAccess: true })
    }
    await payload.delete({ collection: 'chapters', id: chapter.id, overrideAccess: true })
    await payload.updateGlobal({
      data: {
        eventPaymentTerms: originalSettings.eventPaymentTerms,
        manualPaymentReviewNote: originalSettings.manualPaymentReviewNote,
        zelleInstructions: originalSettings.zelleInstructions,
        zelleRecipient: originalSettings.zelleRecipient,
        zelleRecipientName: originalSettings.zelleRecipientName,
      },
      overrideAccess: true,
      slug: 'siteSettings',
    })
  })

  test('filters upcoming events and keeps completed recap pages in the archive', async ({ page }) => {
    await page.goto('/events?mode=virtual&price=paid')
    await expect(page.getByText(paidEvent.title)).toBeVisible()
    await expect(page.getByText(freeEvent.title)).toHaveCount(0)
    await page.goto('/events?view=archive')
    await expect(page.getByText(archiveEvent.title)).toBeVisible()
    await page
      .locator('article')
      .filter({ hasText: archiveEvent.title })
      .getByRole('link', { name: 'View recap' })
      .click()
    await expect(page.getByText('E2E alumni archive recap and outcomes.')).toBeVisible()
  })

  test('confirms a free event registration and renders private history responsively', async ({ page }) => {
    await signIn(page, freeMember.email)
    await page.goto(`/events/${freeEvent.slug}`)
    const response = page.waitForResponse(
      (candidate) =>
        candidate.url().endsWith(`/api/events/${freeEvent.slug}/registration`) &&
        candidate.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Confirm free registration' }).click()
    expect((await response).status()).toBe(201)
    await expect(page.getByText('Your event registration is confirmed.')).toBeVisible()
    await page.goto('/events/registrations')
    await expect(page.getByRole('heading', { name: freeEvent.title })).toBeVisible()
    await expect(page.locator('.badge').filter({ hasText: 'Confirmed' }).first()).toBeVisible()
    await page.setViewportSize({ height: 844, width: 390 })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true)
  })

  test('submits a paid event, lets the assigned reviewer approve, and reveals private access', async ({
    page,
  }) => {
    await signIn(page, paidMember.email)
    await page.goto(`/events/${paidEvent.slug}`)
    await expect(page.getByText('events-e2e@example.test')).toBeVisible()
    await expect(page.getByText('https://meet.example.test/e2e-private-conference')).toHaveCount(0)
    await page.getByLabel(/Zelle transaction ID/).fill(`E2E-EVENT-APPROVE-${nonce}`)
    await page.getByRole('button', { name: 'Submit registration for review' }).click()
    await expect(page.getByText(/Zelle payment is pending review/i)).toBeVisible()

    await signOut(page)
    await signIn(page, reviewer.email, reviewerPassword)
    await page.goto('/payments/review?type=event')
    const card = page.getByRole('article').filter({ hasText: paidMember.lastName! })
    await expect(card).toContainText(paidEvent.title)
    const reviewResponse = page.waitForResponse((candidate) =>
      candidate.url().includes('/api/payments/'),
    )
    await card.getByRole('button', { name: 'Approve payment' }).click()
    expect((await reviewResponse).status()).toBe(200)

    await signOut(page)
    await signIn(page, paidMember.email)
    await page.goto(`/events/${paidEvent.slug}`)
    await expect(page.getByRole('link', { name: 'Open virtual event access' })).toHaveAttribute(
      'href',
      'https://meet.example.test/e2e-private-conference',
    )
    await expect(page.getByText('Payment paid')).toBeVisible()
  })

  test('shows rejection history and accepts a new immutable event payment attempt', async ({ page }) => {
    await signIn(page, resubmitMember.email)
    await page.goto(`/events/${paidEvent.slug}`)
    await page.getByLabel(/Zelle transaction ID/).fill(`E2E-EVENT-REJECT-${nonce}`)
    await page.getByRole('button', { name: 'Submit registration for review' }).click()
    await expect(page.getByText(/pending review/i)).toBeVisible()

    await signOut(page)
    await signIn(page, reviewer.email, reviewerPassword)
    await page.goto('/payments/review?type=event')
    const card = page.getByRole('article').filter({ hasText: resubmitMember.lastName! })
    await card.getByLabel(/Rejection reason/).fill('E2E event transaction was not verifiable.')
    await card.getByRole('button', { name: 'Reject payment' }).click()
    await expect(page.getByText(/new attempt/i)).toBeVisible()

    await signOut(page)
    await signIn(page, resubmitMember.email)
    await page.goto(`/events/${paidEvent.slug}`)
    await expect(page.getByRole('heading', { name: 'Resubmit Zelle details' })).toBeVisible()
    await page.getByLabel(/Zelle transaction ID/).fill(`E2E-EVENT-RESUBMIT-${nonce}`)
    await page.getByRole('button', { name: 'Submit registration for review' }).click()
    await expect(page.getByText('Your new event payment details are pending review.')).toBeVisible()
    await page.goto('/events/registrations')
    await expect(page.getByText('E2E event transaction was not verifiable.')).toBeVisible()
    await expect(page.locator('.badge').filter({ hasText: 'Failed' }).first()).toBeVisible()
    await expect(page.locator('.badge').filter({ hasText: 'Pending' }).first()).toBeVisible()
  })
})
