import { describe, expect, it } from 'vitest'
import type { Where } from 'payload'

import type { User } from '@/payload-types'
import { getTestPayload } from '../helpers/payload'

const future = (days: number) => {
  const value = new Date()
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString()
}

describe('content publishing workflow', () => {
  it('denies public version access for published globals', async () => {
    const payload = await getTestPayload()

    await expect(
      payload.findGlobalVersions({
        overrideAccess: false,
        slug: 'home',
      }),
    ).rejects.toThrow()
  })

  it('keeps drafts private for every public collection', async () => {
    const payload = await getTestPayload()
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const chapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Publishing Parent ${suffix}`,
        slug: `publishing-parent-${suffix}`,
        summary: 'Published parent used only for public draft-isolation verification.',
      },
      draft: false,
      overrideAccess: true,
    })

    const fixtures = [
      {
        collection: 'pages' as const,
        data: {
          _status: 'draft' as const,
          editorialStatus: 'draft' as const,
          heroTitle: `Draft Page ${suffix}`,
          pageType: 'standard' as const,
          sections: [],
          slug: `draft-page-${suffix}`,
          title: `Draft Page ${suffix}`,
        },
        where: { slug: { equals: `draft-page-${suffix}` } },
      },
      {
        collection: 'posts' as const,
        data: {
          _status: 'draft' as const,
          body: 'Private draft article body.',
          contentType: 'article' as const,
          editorialStatus: 'draft' as const,
          excerpt: 'Private draft article excerpt.',
          slug: `draft-post-${suffix}`,
          title: `Draft Post ${suffix}`,
        },
        where: { slug: { equals: `draft-post-${suffix}` } },
      },
      {
        collection: 'chapters' as const,
        data: {
          _status: 'draft' as const,
          chapterStatus: 'planning' as const,
          editorialStatus: 'draft' as const,
          name: `Draft Chapter ${suffix}`,
          slug: `draft-chapter-${suffix}`,
          summary: 'Private draft chapter summary.',
        },
        where: { slug: { equals: `draft-chapter-${suffix}` } },
      },
      {
        collection: 'events' as const,
        data: {
          _status: 'draft' as const,
          basePrice: 0,
          chapter: chapter.id,
          currency: 'USD',
          editorialStatus: 'draft' as const,
          endAt: future(3),
          eventMode: 'virtual' as const,
          isPaid: false,
          maxRegistrationQuantity: 1,
          slug: `draft-event-${suffix}`,
          startAt: future(2),
          status: 'draft' as const,
          summary: 'Private draft event summary.',
          timezone: 'America/New_York' as const,
          title: `Draft Event ${suffix}`,
          waitlistEnabled: true,
          waitlistOfferHours: 48,
        },
        where: { slug: { equals: `draft-event-${suffix}` } },
      },
      {
        collection: 'committeeTerms' as const,
        data: {
          _status: 'draft' as const,
          committeeType: 'running' as const,
          editorialStatus: 'draft' as const,
          endDate: future(365),
          isCurrent: true,
          members: [{ name: 'Draft Leader', role: 'Draft Role' }],
          startDate: future(1),
          title: `Draft Committee ${suffix}`,
        },
        where: { title: { equals: `Draft Committee ${suffix}` } },
      },
      {
        collection: 'historyEntries' as const,
        data: {
          _status: 'draft' as const,
          editorialStatus: 'draft' as const,
          sortOrder: 99,
          startYear: 2026,
          summary: 'Private draft history summary.',
          title: `Draft History ${suffix}`,
        },
        where: { title: { equals: `Draft History ${suffix}` } },
      },
      {
        collection: 'announcements' as const,
        data: {
          _status: 'draft' as const,
          audience: 'public' as const,
          editorialStatus: 'draft' as const,
          summary: 'Private draft announcement summary.',
          title: `Draft Announcement ${suffix}`,
        },
        where: { title: { equals: `Draft Announcement ${suffix}` } },
      },
    ]

    for (const fixture of fixtures) {
      await payload.create({
        collection: fixture.collection,
        data: fixture.data,
        draft: true,
        overrideAccess: true,
      })
      const publicResult = await payload.find({
        collection: fixture.collection,
        depth: 0,
        limit: 1,
        overrideAccess: false,
        where: fixture.where as unknown as Where,
      })
      expect(publicResult.totalDocs, fixture.collection).toBe(0)
    }
  })

  it('lets chapter editors submit but only administrators approve and publish', async () => {
    const payload = await getTestPayload()
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const chapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Review Chapter ${suffix}`,
        slug: `review-chapter-${suffix}`,
        summary: 'Published chapter used for editorial review verification.',
      },
      draft: false,
      overrideAccess: true,
    })
    const chapterEditor = await payload.create({
      collection: 'users',
      context: { seedTestUser: true },
      data: {
        _verified: true,
        accountStatus: 'active',
        email: `editor-${suffix}@example.test`,
        managedChapters: [chapter.id],
        password: 'Strong-Review-Password-2026!',
        role: 'chapterAdmin',
      },
      overrideAccess: true,
    })
    const administrator = await payload.create({
      collection: 'users',
      context: { seedTestUser: true },
      data: {
        _verified: true,
        accountStatus: 'active',
        email: `reviewer-${suffix}@example.test`,
        password: 'Strong-Review-Password-2026!',
        role: 'admin',
      },
      overrideAccess: true,
    })

    const draft = await payload.create({
      collection: 'announcements',
      data: {
        _status: 'draft',
        audience: 'public',
        chapter: chapter.id,
        editorialStatus: 'inReview',
        reviewNote: 'Ready for administrator review.',
        summary: 'Editorial workflow announcement summary.',
        title: `Editorial Workflow ${suffix}`,
      },
      draft: true,
      overrideAccess: false,
      user: chapterEditor as User,
    })
    expect(draft.editorialStatus).toBe('inReview')

    await expect(
      payload.update({
        collection: 'announcements',
        data: { _status: 'published', editorialStatus: 'approved' },
        draft: false,
        id: draft.id,
        overrideAccess: false,
        user: chapterEditor as User,
      }),
    ).rejects.toMatchObject({ status: 403 })

    const approved = await payload.update({
      collection: 'announcements',
      data: { editorialStatus: 'approved', reviewNote: 'Approved for publication.' },
      draft: true,
      id: draft.id,
      overrideAccess: false,
      user: administrator as User,
    })
    expect(approved.editorialStatus).toBe('approved')
    expect(typeof approved.reviewedAt).toBe('string')

    const beforePublish = await payload.find({
      collection: 'announcements',
      limit: 1,
      overrideAccess: false,
      where: { title: { equals: `Editorial Workflow ${suffix}` } },
    })
    expect(beforePublish.totalDocs).toBe(0)

    await payload.update({
      collection: 'announcements',
      data: { _status: 'published', editorialStatus: 'approved' },
      draft: false,
      id: draft.id,
      overrideAccess: false,
      user: administrator as User,
    })
    const published = await payload.find({
      collection: 'announcements',
      limit: 1,
      overrideAccess: false,
      where: { title: { equals: `Editorial Workflow ${suffix}` } },
    })
    expect(published.totalDocs).toBe(1)
    expect(published.docs[0]?.editorialStatus).toBeUndefined()
    expect(published.docs[0]?.reviewNote).toBeUndefined()
  })
})
