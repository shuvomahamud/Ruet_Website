import { createLocalReq, type Payload, type PayloadRequest } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import type {
  Announcement,
  Chapter,
  Membership,
  MembershipPlan,
  NewsletterCampaign,
  User,
} from '@/payload-types'
import {
  cancelNewsletterCampaign,
  processNewsletterLifecycle,
  scheduleNewsletterCampaign,
  sendNewsletterCampaign,
} from '@/services/newsletter-campaigns'
import { getActiveAnnouncements, getChapterPublicModules } from '@/utilities/payload-public'

import { getTestPayload } from '../helpers/payload'

describe.sequential('announcements, newsletter campaigns, and communication preferences', () => {
  let payload: Payload
  let chapterA: Chapter
  let chapterB: Chapter
  let admin: User
  let chapterAdmin: User
  let memberA: User
  let memberB: User
  let optedOutMember: User
  let plan: MembershipPlan
  const announcements: Announcement[] = []
  const campaigns: NewsletterCampaign[] = []
  const memberships: Membership[] = []
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`

  const requestFor = (user?: User): Promise<PayloadRequest> =>
    createLocalReq(user ? { user } : {}, payload)

  const createUser = async (label: string, chapter: Chapter, allowNewsletters = true) =>
    payload.create({
      collection: 'users',
      data: {
        _verified: true,
        accountStatus: 'active',
        communicationPreferences: {
          allowAnnouncements: true,
          allowNewsletters,
          allowSystemEmails: true,
        },
        email: `communications-${label}-${nonce}@example.test`,
        firstName: 'Communications',
        lastName: label,
        password: `Communications-${label}-${nonce}-Safe9`,
        primaryChapter: chapter.id,
        role: 'member',
      },
      overrideAccess: true,
    })

  const announcement = async (
    label: string,
    data: Partial<Announcement> = {},
  ): Promise<Announcement> => {
    const created = await payload.create({
      collection: 'announcements',
      data: {
        _status: 'published',
        audience: 'public',
        summary: `${label} announcement summary.`,
        title: `${label} ${nonce}`,
        ...data,
      },
      overrideAccess: true,
    })
    announcements.push(created)
    return created
  }

  const campaign = async (label: string): Promise<NewsletterCampaign> => {
    const created = await payload.create({
      collection: 'newsletterCampaigns',
      data: {
        audience: 'members',
        body: `${label} body for the alumni network.`,
        failedCount: 0,
        queuedCount: 0,
        recipientCount: 0,
        status: 'draft',
        subject: `${label} subject`,
        summary: `${label} campaign summary.`,
        suppressedCount: 0,
        title: `${label} ${nonce}`,
      },
      overrideAccess: false,
      user: admin,
    })
    campaigns.push(created)
    return created
  }

  beforeAll(async () => {
    payload = await getTestPayload()
    chapterA = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Communications Chapter A ${nonce}`,
        slug: `communications-a-${nonce}`,
        summary: 'Communications test chapter A.',
      },
      overrideAccess: true,
    })
    chapterB = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Communications Chapter B ${nonce}`,
        slug: `communications-b-${nonce}`,
        summary: 'Communications test chapter B.',
      },
      overrideAccess: true,
    })
    memberA = await createUser('member-a', chapterA)
    memberB = await createUser('member-b', chapterB)
    optedOutMember = await createUser('opted-out', chapterA, false)
    admin = await createUser('admin', chapterA)
    const bootstrap = { accountStatus: 'active', id: -1, role: 'superAdmin' } as User
    admin = await payload.update({
      collection: 'users',
      data: { role: 'superAdmin' },
      id: admin.id,
      overrideAccess: true,
      user: bootstrap,
    })
    chapterAdmin = await createUser('chapter-admin', chapterA)
    chapterAdmin = await payload.update({
      collection: 'users',
      data: { managedChapters: [chapterA.id], role: 'chapterAdmin' },
      id: chapterAdmin.id,
      overrideAccess: true,
    })
    plan = await payload.create({
      collection: 'membershipPlans',
      data: {
        active: false,
        annualPrice: 50,
        currency: 'USD',
        gracePeriodDays: 7,
        renewalPolicy: 'Annual renewal test policy.',
        renewalReminderDaysBefore: 30,
        renewalReminderEnabled: true,
        slug: `communications-plan-${nonce}`,
        termsSummary: 'Manual payment test terms.',
        title: `Communications Plan ${nonce}`,
      },
      overrideAccess: true,
    })
    for (const user of [memberA, optedOutMember]) {
      memberships.push(
        await payload.create({
          collection: 'memberships',
          context: {
            allowInactiveMembershipPlanForTest: true,
            workflowTransition: true,
          },
          data: {
            billingIntervalSnapshot: 'annual',
            chapterAttribution: chapterA.id,
            chapterNameSnapshot: chapterA.name,
            currencySnapshot: 'USD',
            gracePeriodDaysSnapshot: 7,
            membershipKind: 'join',
            paymentMethod: 'zelle',
            plan: plan.id,
            planPriceSnapshot: 50,
            planTitleSnapshot: plan.title,
            renewalReminderDaysBeforeSnapshot: 30,
            renewalReminderEnabledSnapshot: true,
            status: 'active',
            user: user.id,
          },
          overrideAccess: true,
        }),
      )
    }
  })

  afterAll(async () => {
    const campaignIDs = campaigns.map((item) => item.id)
    const deliveries = campaignIDs.length
      ? await payload.find({
          collection: 'emailDeliveries',
          depth: 0,
          limit: 1000,
          overrideAccess: true,
          pagination: false,
          where: { campaign: { in: campaignIDs } },
        })
      : { docs: [] }
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
    const audits = campaignIDs.length
      ? await payload.find({
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
      : { docs: [] }
    for (const audit of audits.docs) {
      await payload.delete({ collection: 'auditLogs', id: audit.id, overrideAccess: true })
    }
    for (const item of campaigns) {
      await payload.delete({ collection: 'newsletterCampaigns', id: item.id, overrideAccess: true })
    }
    for (const item of announcements) {
      await payload.delete({ collection: 'announcements', id: item.id, overrideAccess: true })
    }
    for (const item of memberships) {
      await payload.delete({ collection: 'memberships', id: item.id, overrideAccess: true })
    }
    if (plan?.id) {
      await payload.delete({ collection: 'membershipPlans', id: plan.id, overrideAccess: true })
    }
    for (const user of [memberA, memberB, optedOutMember, chapterAdmin, admin]) {
      if (user?.id) await payload.delete({ collection: 'users', id: user.id, overrideAccess: true })
    }
    for (const chapter of [chapterA, chapterB]) {
      if (chapter?.id) {
        await payload.delete({ collection: 'chapters', id: chapter.id, overrideAccess: true })
      }
    }
  })

  it('enforces active windows, member audience, chapter scope, and surface targeting', async () => {
    const activePublic = await announcement('Active public')
    const siteMembers = await announcement('Site members', { audience: 'members' })
    const chapterAMembers = await announcement('Chapter A members', {
      audience: 'members',
      chapter: chapterA.id,
    })
    const chapterBMembers = await announcement('Chapter B members', {
      audience: 'members',
      chapter: chapterB.id,
    })
    const future = await announcement('Future public', {
      activeFrom: new Date(Date.now() + 86_400_000).toISOString(),
    })
    const expired = await announcement('Expired public', {
      activeTo: new Date(Date.now() - 86_400_000).toISOString(),
    })
    const draft = await announcement('Draft public', { _status: 'draft' })

    const anonymous = await payload.find({
      collection: 'announcements',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      pagination: false,
      where: { id: { in: announcements.map((item) => item.id) } },
    })
    expect(anonymous.docs.map((item) => item.id)).toContain(activePublic.id)
    expect(anonymous.docs.map((item) => item.id)).not.toEqual(
      expect.arrayContaining([siteMembers.id, future.id, expired.id, draft.id]),
    )

    const visibleToA = await payload.find({
      collection: 'announcements',
      depth: 0,
      limit: 100,
      overrideAccess: false,
      pagination: false,
      user: memberA,
      where: { id: { in: announcements.map((item) => item.id) } },
    })
    expect(visibleToA.docs.map((item) => item.id)).toEqual(
      expect.arrayContaining([activePublic.id, siteMembers.id, chapterAMembers.id]),
    )
    expect(visibleToA.docs.map((item) => item.id)).not.toContain(chapterBMembers.id)

    const home = await getActiveAnnouncements({ limit: 100, scope: 'home', user: memberA })
    expect(home.map((item) => item.id)).toEqual(
      expect.arrayContaining([activePublic.id, siteMembers.id]),
    )
    expect(home.map((item) => item.id)).not.toContain(chapterAMembers.id)

    const chapterModules = await getChapterPublicModules(chapterA.id, memberA)
    expect(chapterModules.announcements.map((item) => item.id)).toEqual(
      expect.arrayContaining([activePublic.id, siteMembers.id, chapterAMembers.id]),
    )
    expect(chapterModules.announcements.map((item) => item.id)).not.toContain(chapterBMembers.id)
  })

  it('keeps chapter-admin authoring assigned and validates windows and links', async () => {
    await expect(
      payload.create({
        collection: 'announcements',
        data: {
          _status: 'draft',
          audience: 'public',
          editorialStatus: 'inReview',
          summary: 'A site-wide notice is not chapter-admin scope.',
          title: `Disallowed site notice ${nonce}`,
        },
        draft: true,
        overrideAccess: false,
        user: chapterAdmin,
      }),
    ).rejects.toThrow()
    const owned = await payload.create({
      collection: 'announcements',
      data: {
        _status: 'draft',
        audience: 'public',
        chapter: chapterA.id,
        editorialStatus: 'inReview',
        summary: 'Assigned chapter notice.',
        title: `Owned chapter notice ${nonce}`,
      },
      draft: true,
      overrideAccess: false,
      user: chapterAdmin,
    })
    announcements.push(owned)
    await expect(
      payload.create({
        collection: 'announcements',
        data: {
          _status: 'draft',
          audience: 'public',
          chapter: chapterB.id,
          editorialStatus: 'inReview',
          summary: 'Wrong chapter notice.',
          title: `Wrong chapter notice ${nonce}`,
        },
        draft: true,
        overrideAccess: false,
        user: chapterAdmin,
      }),
    ).rejects.toThrow()
    await expect(
      announcement('Invalid window', {
        activeFrom: new Date(Date.now() + 86_400_000).toISOString(),
        activeTo: new Date().toISOString(),
      }),
    ).rejects.toThrow(/end time/i)
    await expect(
      announcement('Unsafe CTA', { ctaHref: 'javascript:alert(1)', ctaLabel: 'Unsafe' }),
    ).rejects.toThrow()
    await expect(
      announcement('Backslash CTA', { ctaHref: '/\\outside.example', ctaLabel: 'Unsafe' }),
    ).rejects.toThrow()
  })

  it('locks workflow fields and supports idempotent scheduling and cancellation', async () => {
    const draft = await campaign('Schedule and cancel')
    const direct = await payload.update({
      collection: 'newsletterCampaigns',
      data: { status: 'sent' },
      id: draft.id,
      overrideAccess: false,
      user: admin,
    })
    expect(direct.status).toBe('draft')

    const sendAt = new Date(Date.now() + 300_000)
    const scheduled = await scheduleNewsletterCampaign({
      campaignID: draft.id,
      req: await requestFor(admin),
      scheduledAt: sendAt,
    })
    expect(scheduled.campaign.status).toBe('scheduled')
    const repeated = await scheduleNewsletterCampaign({
      campaignID: draft.id,
      req: await requestFor(admin),
      scheduledAt: sendAt,
    })
    expect(repeated.idempotent).toBe(true)
    await expect(
      payload.update({
        collection: 'newsletterCampaigns',
        data: { body: 'Rewriting a scheduled campaign is unsafe.' },
        id: draft.id,
        overrideAccess: false,
        user: admin,
      }),
    ).rejects.toThrow(/draft newsletter/i)
    const cancelled = await cancelNewsletterCampaign({
      campaignID: draft.id,
      req: await requestFor(admin),
    })
    expect(cancelled.campaign.status).toBe('cancelled')
    expect(
      (await cancelNewsletterCampaign({ campaignID: draft.id, req: await requestFor(admin) }))
        .idempotent,
    ).toBe(true)
  })

  it('dispatches a due member campaign once and records preference suppression and history', async () => {
    const draft = await campaign('Due member dispatch')
    const scheduledAt = new Date(Date.now() + 300_000)
    await scheduleNewsletterCampaign({
      campaignID: draft.id,
      req: await requestFor(admin),
      scheduledAt,
    })
    const lifecycle = await processNewsletterLifecycle({
      now: new Date(scheduledAt.getTime() + 60_000),
      req: await requestFor(),
    })
    expect(lifecycle.sentCampaigns).toBe(1)

    const updated = await payload.findByID({
      collection: 'newsletterCampaigns',
      id: draft.id,
      overrideAccess: true,
    })
    expect(updated.status).toBe('sent')
    expect(updated.sentAt).toBeTruthy()
    expect(updated.recipientCount).toBeGreaterThanOrEqual(2)

    const deliveries = await payload.find({
      collection: 'emailDeliveries',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
      where: { campaign: { equals: draft.id } },
    })
    const optedIn = deliveries.docs.find(
      (item) =>
        item.user === memberA.id || (typeof item.user === 'object' && item.user?.id === memberA.id),
    )
    const optedOut = deliveries.docs.find(
      (item) =>
        item.user === optedOutMember.id ||
        (typeof item.user === 'object' && item.user?.id === optedOutMember.id),
    )
    expect(optedIn?.status).toBe('queued')
    expect(optedIn?.subject).toBe(draft.subject)
    expect(optedOut?.status).toBe('suppressed')
    expect(optedOut?.jobId).toBeFalsy()
    expect(
      deliveries.docs.some(
        (item) =>
          item.user === memberB.id ||
          (typeof item.user === 'object' && item.user?.id === memberB.id),
      ),
    ).toBe(false)

    const repeated = await sendNewsletterCampaign({
      campaignID: draft.id,
      req: await requestFor(admin),
    })
    expect(repeated.idempotent).toBe(true)
    const afterRepeat = await payload.count({
      collection: 'emailDeliveries',
      overrideAccess: true,
      where: { campaign: { equals: draft.id } },
    })
    expect(afterRepeat.totalDocs).toBe(deliveries.totalDocs)
  })

  it('repairs a delivery audit whose initial job enqueue failed', async () => {
    const draft = await campaign('Recover initial queue failure')
    const queue = vi
      .spyOn(payload.jobs, 'queue')
      .mockRejectedValueOnce(new Error('Queue unavailable'))
    const first = await sendNewsletterCampaign({
      campaignID: draft.id,
      req: await requestFor(admin),
    })
    queue.mockRestore()
    expect(first.campaign.status).toBe('failed')
    expect(first.failed).toBe(1)

    const failed = await payload.find({
      collection: 'emailDeliveries',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ campaign: { equals: draft.id } }, { status: { equals: 'failed' } }],
      },
    })
    expect(failed.docs[0]?.jobId).toBeFalsy()

    const retried = await sendNewsletterCampaign({
      campaignID: draft.id,
      req: await requestFor(admin),
    })
    expect(retried.campaign.status).toBe('sent')
    expect(retried.failed).toBe(0)

    const repaired = await payload.findByID({
      collection: 'emailDeliveries',
      id: failed.docs[0]!.id,
      overrideAccess: true,
    })
    expect(repaired.status).toBe('queued')
    expect(repaired.jobId).toBeTruthy()
  })
})
