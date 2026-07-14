import config from '@payload-config'
import { expect, test, type Page } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import type { Announcement, Chapter, NewsletterCampaign, User } from '@/payload-types'

test.describe.serial('Announcements, newsletters, and footer experience', () => {
  let payload: Payload
  let chapterA: Chapter
  let chapterB: Chapter
  let member: User
  let admin: User
  let scheduledCampaign: NewsletterCampaign
  let sendCampaign: NewsletterCampaign
  const announcements: Announcement[] = []
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const memberPassword = `Communications-Member-${nonce}-A9!`
  const adminPassword = `Communications-Admin-${nonce}-A9!`

  const titles = {
    chapter: `E2E Chapter Member Notice ${nonce}`,
    future: `E2E Future Notice ${nonce}`,
    otherChapter: `E2E Other Chapter Notice ${nonce}`,
    public: `E2E Public Notice ${nonce}`,
    siteMembers: `E2E Site Member Notice ${nonce}`,
  }

  const signIn = async (page: Page, email: string, password: string) => {
    await page.goto('/login')
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/dashboard/)
  }

  const createAnnouncement = async (
    title: string,
    data: Partial<Announcement> = {},
  ): Promise<Announcement> => {
    const announcement = await payload.create({
      collection: 'announcements',
      data: {
        _status: 'published',
        audience: 'public',
        summary: `${title} summary.`,
        title,
        ...data,
      },
      overrideAccess: true,
    })
    announcements.push(announcement)
    return announcement
  }

  test.beforeAll(async () => {
    payload = await getPayload({ config })
    chapterA = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `E2E Communications Chapter A ${nonce}`,
        slug: `e2e-communications-a-${nonce}`,
        summary: 'Communications browser fixture chapter A.',
      },
      overrideAccess: true,
    })
    chapterB = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `E2E Communications Chapter B ${nonce}`,
        slug: `e2e-communications-b-${nonce}`,
        summary: 'Communications browser fixture chapter B.',
      },
      overrideAccess: true,
    })
    member = await payload.create({
      collection: 'users',
      data: {
        _verified: true,
        accountStatus: 'active',
        communicationPreferences: {
          allowAnnouncements: true,
          allowNewsletters: true,
          allowSystemEmails: true,
        },
        email: `e2e-communications-member-${nonce}@example.test`,
        firstName: 'Communication',
        lastName: 'Member',
        password: memberPassword,
        primaryChapter: chapterA.id,
        role: 'member',
      },
      overrideAccess: true,
    })
    admin = await payload.create({
      collection: 'users',
      data: {
        _verified: true,
        accountStatus: 'active',
        email: `e2e-communications-admin-${nonce}@example.test`,
        firstName: 'Communication',
        lastName: 'Administrator',
        password: adminPassword,
        role: 'member',
      },
      overrideAccess: true,
    })
    const bootstrap = { accountStatus: 'active', id: -1, role: 'superAdmin' } as User
    admin = await payload.update({
      collection: 'users',
      data: { role: 'superAdmin' },
      id: admin.id,
      overrideAccess: true,
      user: bootstrap,
    })

    await createAnnouncement(titles.public)
    await createAnnouncement(titles.siteMembers, { audience: 'members' })
    await createAnnouncement(titles.chapter, { audience: 'members', chapter: chapterA.id })
    await createAnnouncement(titles.otherChapter, { audience: 'members', chapter: chapterB.id })
    await createAnnouncement(titles.future, {
      activeFrom: new Date(Date.now() + 86_400_000).toISOString(),
    })

    scheduledCampaign = await payload.create({
      collection: 'newsletterCampaigns',
      data: {
        audience: 'all',
        body: `Schedule and cancellation browser body ${nonce}.`,
        failedCount: 0,
        queuedCount: 0,
        recipientCount: 0,
        status: 'draft',
        subject: `Schedule browser subject ${nonce}`,
        summary: 'Browser coverage for schedule and cancellation.',
        suppressedCount: 0,
        title: `E2E Schedule Campaign ${nonce}`,
      },
      overrideAccess: false,
      user: admin,
    })
    sendCampaign = await payload.create({
      collection: 'newsletterCampaigns',
      data: {
        audience: 'all',
        body: `Immediate dispatch browser body ${nonce}.`,
        failedCount: 0,
        queuedCount: 0,
        recipientCount: 0,
        status: 'draft',
        subject: `Immediate browser subject ${nonce}`,
        summary: 'Browser coverage for immediate sending and preference suppression.',
        suppressedCount: 0,
        title: `E2E Send Campaign ${nonce}`,
      },
      overrideAccess: false,
      user: admin,
    })
  })

  test.afterAll(async () => {
    const campaignIDs = [scheduledCampaign, sendCampaign].filter(Boolean).map((item) => item.id)
    if (campaignIDs.length) {
      const deliveries = await payload.find({
        collection: 'emailDeliveries',
        depth: 0,
        limit: 1000,
        overrideAccess: true,
        pagination: false,
        where: { campaign: { in: campaignIDs } },
      })
      for (const delivery of deliveries.docs) {
        if (delivery.jobId) {
          const jobs = await payload.find({
            collection: 'payload-jobs',
            depth: 0,
            limit: 1,
            overrideAccess: true,
            where: { id: { equals: Number(delivery.jobId) } },
          })
          if (jobs.docs[0]) {
            await payload.delete({
              collection: 'payload-jobs',
              id: jobs.docs[0].id,
              overrideAccess: true,
            })
          }
        }
        await payload.delete({
          collection: 'emailDeliveries',
          id: delivery.id,
          overrideAccess: true,
        })
      }
      const audits = await payload.find({
        collection: 'auditLogs',
        depth: 0,
        limit: 1000,
        overrideAccess: true,
        pagination: false,
        where: {
          and: [
            { entityType: { equals: 'newsletterCampaign' } },
            { entityID: { in: campaignIDs.map(String) } },
          ],
        },
      })
      for (const audit of audits.docs) {
        await payload.delete({ collection: 'auditLogs', id: audit.id, overrideAccess: true })
      }
    }
    for (const campaign of [scheduledCampaign, sendCampaign]) {
      if (campaign?.id) {
        await payload.delete({
          collection: 'newsletterCampaigns',
          id: campaign.id,
          overrideAccess: true,
        })
      }
    }
    for (const announcement of announcements) {
      await payload.delete({
        collection: 'announcements',
        id: announcement.id,
        overrideAccess: true,
      })
    }
    for (const user of [member, admin]) {
      if (user?.id) await payload.delete({ collection: 'users', id: user.id, overrideAccess: true })
    }
    for (const chapter of [chapterA, chapterB]) {
      if (chapter?.id) {
        await payload.delete({ collection: 'chapters', id: chapter.id, overrideAccess: true })
      }
    }
  })

  test('renders a complete, responsive footer with working contact and legal destinations', async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 })
    await page.goto('/')
    const footer = page.locator('#site-footer')
    await expect(footer).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Manage newsletter preferences' })).toHaveAttribute(
      'href',
      '/communications/preferences',
    )
    await expect(footer.getByRole('link', { name: 'Privacy', exact: true })).toHaveAttribute(
      'href',
      '/privacy',
    )
    await expect(footer.getByRole('link', { name: 'Website terms' })).toHaveAttribute(
      'href',
      '/terms-of-use',
    )
    await expect(footer.getByRole('link', { name: 'Membership terms' })).toHaveAttribute(
      'href',
      '/membership-terms',
    )
    await expect(footer.getByRole('link', { name: 'Announcements' })).toHaveAttribute(
      'href',
      '/announcements',
    )
    await expect(footer.getByRole('link', { name: 'Member dashboard' })).toHaveAttribute(
      'href',
      '/dashboard',
    )
    await expect(footer.locator('a[href^="mailto:"]')).toBeVisible()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBe(true)
  })

  test('targets public, member, chapter, and future announcements across their surfaces', async ({
    page,
  }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: titles.public, exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: titles.siteMembers, exact: true })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: titles.chapter, exact: true })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: titles.future, exact: true })).toHaveCount(0)

    await signIn(page, member.email, memberPassword)
    await page.goto('/')
    await expect(page.getByRole('heading', { name: titles.public, exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: titles.siteMembers, exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: titles.chapter, exact: true })).toHaveCount(0)

    await page.goto('/announcements')
    await expect(page.getByRole('heading', { name: titles.public, exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: titles.siteMembers, exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: titles.chapter, exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: titles.otherChapter, exact: true })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: titles.future, exact: true })).toHaveCount(0)

    await page.goto(`/chapters/${chapterA.slug}`)
    await expect(page.getByRole('heading', { name: titles.siteMembers, exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: titles.chapter, exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: titles.otherChapter, exact: true })).toHaveCount(0)
  })

  test('updates newsletter preferences from the footer destination', async ({ page }) => {
    await signIn(page, member.email, memberPassword)
    await page.goto('/')
    await page
      .locator('#site-footer')
      .getByRole('link', { name: 'Manage newsletter preferences' })
      .click()
    await expect(page).toHaveURL(/\/communications\/preferences/)
    await page.getByLabel('Scheduled newsletters').uncheck()
    const response = page.waitForResponse(
      (candidate) =>
        candidate.url().endsWith('/api/account/communication-preferences') &&
        candidate.request().method() === 'PATCH',
    )
    await page.getByRole('button', { name: 'Save communication preferences' }).click()
    expect((await response).status()).toBe(200)
    await expect(page.getByText('Communication preferences saved.')).toBeVisible()

    const updated = await payload.findByID({
      collection: 'users',
      id: member.id,
      overrideAccess: true,
    })
    expect(updated.communicationPreferences?.allowNewsletters).toBe(false)
  })

  test('previews, schedules, cancels, sends, and records newsletter results', async ({ page }) => {
    await signIn(page, admin.email, adminPassword)
    await page.goto('/communications/newsletters')

    let scheduleCard = page.getByRole('article').filter({ hasText: scheduledCampaign.title })
    await scheduleCard.getByRole('link', { name: 'Preview email' }).click()
    await expect(page.getByText(`Subject: ${scheduledCampaign.subject}`)).toBeVisible()
    await expect(page.frameLocator('iframe').getByText(scheduledCampaign.body)).toBeVisible()
    await page.getByRole('link', { name: 'Back to campaigns' }).click()

    scheduleCard = page.getByRole('article').filter({ hasText: scheduledCampaign.title })
    const future = new Date(Date.now() + 3_600_000)
    const localFuture = new Date(future.getTime() - future.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 16)
    await scheduleCard.getByLabel('Send date and time').fill(localFuture)
    const scheduleResponse = page.waitForResponse(
      (candidate) =>
        candidate.url().endsWith(`/api/newsletters/${scheduledCampaign.id}/action`) &&
        candidate.request().method() === 'POST',
    )
    await scheduleCard.getByRole('button', { name: 'Schedule' }).click()
    expect((await scheduleResponse).status()).toBe(200)
    scheduleCard = page.getByRole('article').filter({ hasText: scheduledCampaign.title })
    await expect(scheduleCard.getByText('scheduled', { exact: true })).toBeVisible()

    const cancelResponse = page.waitForResponse(
      (candidate) =>
        candidate.url().endsWith(`/api/newsletters/${scheduledCampaign.id}/action`) &&
        candidate.request().method() === 'POST',
    )
    await scheduleCard.getByRole('button', { name: 'Cancel schedule' }).click()
    expect((await cancelResponse).status()).toBe(200)
    scheduleCard = page.getByRole('article').filter({ hasText: scheduledCampaign.title })
    await expect(scheduleCard.getByText('cancelled', { exact: true })).toBeVisible()

    let sendCard = page.getByRole('article').filter({ hasText: sendCampaign.title })
    const sendResponse = page.waitForResponse(
      (candidate) =>
        candidate.url().endsWith(`/api/newsletters/${sendCampaign.id}/action`) &&
        candidate.request().method() === 'POST',
    )
    await sendCard.getByRole('button', { name: 'Send now' }).click()
    expect((await sendResponse).status()).toBe(200)
    sendCard = page.getByRole('article').filter({ hasText: sendCampaign.title })
    await expect(sendCard.getByText('sent', { exact: true })).toBeVisible()
    await expect(sendCard).toContainText('Queued / suppressed')

    const memberDelivery = await payload.find({
      collection: 'emailDeliveries',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [
          { campaign: { equals: sendCampaign.id } },
          { user: { equals: member.id } },
        ],
      },
    })
    expect(memberDelivery.docs[0]?.status).toBe('suppressed')
  })
})
