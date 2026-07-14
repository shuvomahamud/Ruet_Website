import type {
  Announcement,
  Chapter,
  ChapterRequest,
  CommitteeTerm,
  Event,
  HistoryEntry,
  Media,
  User,
} from '@/payload-types'
import { createLocalReq, type Payload, type PayloadRequest } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { reviewChapterRequest } from '@/services/chapter-request-review'
import { getRelationshipID } from '@/utilities/relationships'
import {
  getChapterDirectory,
  getChapterPublicModules,
  getNationalCommitteeTerms,
  getPublishedHistoryEntries,
} from '@/utilities/payload-public'
import { getTestPayload } from '../helpers/payload'

describe.sequential('chapters, history, and governance workflows', () => {
  let payload: Payload
  let superAdmin: User
  let member: User
  let chapterAdmin: User
  let chapterA: Chapter
  let chapterB: Chapter
  let inactiveChapter: Chapter
  let approvedChapter: Chapter | undefined
  let announcement: Announcement
  let event: Event
  let chapterCommittee: CommitteeTerm
  let nationalCommittee: CommitteeTerm
  let currentHistory: HistoryEntry
  let draftHistory: HistoryEntry
  let media: Media
  let approvedRequest: ChapterRequest
  let rejectedRequest: ChapterRequest
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`

  const superAdminRequest = async (): Promise<PayloadRequest> =>
    createLocalReq({ user: superAdmin }, payload)

  beforeAll(async () => {
    payload = await getTestPayload()
    const bootstrap = { accountStatus: 'active', id: -1, role: 'superAdmin' } as User
    superAdmin = await payload.create({
      collection: 'users',
      data: {
        accountStatus: 'active',
        email: `phase4-super-${nonce}@example.test`,
        password: `Phase4-super-${nonce}-safe-password`,
        role: 'superAdmin',
      },
      overrideAccess: true,
      user: bootstrap,
    })
    member = await payload.create({
      collection: 'users',
      data: {
        accountStatus: 'active',
        email: `phase4-member-${nonce}@example.test`,
        password: `Phase4-member-${nonce}-safe-password`,
        role: 'member',
      },
      overrideAccess: true,
    })
    chapterAdmin = await payload.create({
      collection: 'users',
      data: {
        accountStatus: 'active',
        email: `phase4-admin-${nonce}@example.test`,
        password: `Phase4-admin-${nonce}-safe-password`,
        role: 'member',
      },
      overrideAccess: true,
    })

    chapterA = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Phase 4 Atlantic ${nonce}`,
        regionOrState: 'New York',
        slug: `phase4-atlantic-${nonce}`,
        summary: 'Active searchable chapter fixture.',
      },
      overrideAccess: true,
    })
    chapterB = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Phase 4 Pacific ${nonce}`,
        regionOrState: 'California',
        slug: `phase4-pacific-${nonce}`,
        summary: 'Cross-chapter isolation fixture.',
      },
      overrideAccess: true,
    })
    inactiveChapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'inactive',
        name: `Phase 4 Inactive ${nonce}`,
        regionOrState: 'Texas',
        slug: `phase4-inactive-${nonce}`,
        summary: 'Inactive public-visibility fixture.',
      },
      overrideAccess: true,
    })
    member = await payload.update({
      collection: 'users',
      data: { primaryChapter: chapterA.id },
      id: member.id,
      overrideAccess: true,
    })
    chapterAdmin = await payload.update({
      collection: 'users',
      data: { managedChapters: [chapterA.id], primaryChapter: chapterA.id, role: 'chapterAdmin' },
      id: chapterAdmin.id,
      overrideAccess: true,
    })
  })

  afterAll(async () => {
    const requestIDs = [approvedRequest?.id, rejectedRequest?.id].filter(
      (value): value is number => typeof value === 'number',
    )
    if (requestIDs.length) {
      const audits = await payload.find({
        collection: 'auditLogs',
        limit: 100,
        overrideAccess: true,
        where: {
          and: [
            { entityType: { equals: 'chapterRequest' } },
            { entityID: { in: requestIDs.map(String) } },
          ],
        },
      })
      for (const audit of audits.docs)
        await payload.delete({ collection: 'auditLogs', id: audit.id, overrideAccess: true })
    }
    if (media?.id) await payload.delete({ collection: 'media', id: media.id, overrideAccess: true })
    for (const item of [announcement])
      if (item?.id)
        await payload.delete({ collection: 'announcements', id: item.id, overrideAccess: true })
    for (const item of [event])
      if (item?.id)
        await payload.delete({ collection: 'events', id: item.id, overrideAccess: true })
    for (const item of [chapterCommittee, nationalCommittee])
      if (item?.id)
        await payload.delete({ collection: 'committeeTerms', id: item.id, overrideAccess: true })
    for (const item of [currentHistory, draftHistory])
      if (item?.id)
        await payload.delete({ collection: 'historyEntries', id: item.id, overrideAccess: true })
    for (const item of [approvedRequest, rejectedRequest])
      if (item?.id)
        await payload.delete({ collection: 'chapterRequests', id: item.id, overrideAccess: true })
    for (const item of [approvedChapter, chapterA, chapterB, inactiveChapter])
      if (item?.id)
        await payload.delete({ collection: 'chapters', id: item.id, overrideAccess: true })
    for (const item of [member, chapterAdmin, superAdmin])
      if (item?.id) await payload.delete({ collection: 'users', id: item.id, overrideAccess: true })
  })

  it('searches active chapters by text and region while excluding inactive records', async () => {
    const search = await getChapterDirectory({ query: `Atlantic ${nonce}` })
    expect(search.docs.map((chapter) => chapter.id)).toEqual([chapterA.id])

    const region = await getChapterDirectory({ region: 'California' })
    expect(region.docs.map((chapter) => chapter.id)).toContain(chapterB.id)

    const all = await getChapterDirectory({ limit: 100 })
    expect(all.docs.map((chapter) => chapter.id)).not.toContain(inactiveChapter.id)
  })

  it('lets a chapter admin submit assigned content for administrator publication and blocks cross-chapter edits', async () => {
    announcement = await payload.create({
      collection: 'announcements',
      data: {
        _status: 'draft',
        audience: 'public',
        chapter: chapterA.id,
        editorialStatus: 'inReview',
        summary: 'Assigned chapter announcement.',
        title: `Phase 4 Announcement ${nonce}`,
      },
      draft: true,
      overrideAccess: false,
      user: chapterAdmin,
    })
    const start = new Date(Date.now() + 86_400_000)
    event = await payload.create({
      collection: 'events',
      data: {
        _status: 'draft',
        basePrice: 0,
        chapter: chapterA.id,
        currency: 'USD',
        editorialStatus: 'inReview',
        endAt: new Date(start.getTime() + 3_600_000).toISOString(),
        eventMode: 'inPerson',
        isPaid: false,
        maxRegistrationQuantity: 1,
        slug: `phase4-event-${nonce}`,
        startAt: start.toISOString(),
        status: 'draft',
        summary: 'Assigned chapter event.',
        timezone: 'America/New_York',
        title: `Phase 4 Event ${nonce}`,
        waitlistEnabled: true,
        waitlistOfferHours: 48,
      },
      draft: true,
      overrideAccess: false,
      user: chapterAdmin,
    })
    chapterCommittee = await payload.create({
      collection: 'committeeTerms',
      data: {
        _status: 'draft',
        chapter: chapterA.id,
        committeeType: 'running',
        editorialStatus: 'inReview',
        endDate: new Date(Date.now() + 31_536_000_000).toISOString(),
        isCurrent: true,
        members: [{ name: 'Chapter Leader', role: 'President' }],
        startDate: new Date().toISOString(),
        summary: 'Current local leadership.',
        title: `Phase 4 Local Committee ${nonce}`,
      },
      draft: true,
      overrideAccess: false,
      user: chapterAdmin,
    })

    for (const item of [
      { collection: 'announcements' as const, id: announcement.id },
      { collection: 'committeeTerms' as const, id: chapterCommittee.id },
    ]) {
      await payload.update({
        collection: item.collection,
        data: { editorialStatus: 'approved' },
        draft: true,
        id: item.id,
        overrideAccess: false,
        user: superAdmin,
      })
    }
    await payload.update({
      collection: 'events',
      data: { editorialStatus: 'approved' },
      draft: true,
      id: event.id,
      overrideAccess: false,
      user: superAdmin,
    })
    announcement = await payload.update({
      collection: 'announcements',
      data: { _status: 'published', editorialStatus: 'approved' },
      draft: false,
      id: announcement.id,
      overrideAccess: false,
      user: superAdmin,
    })
    event = await payload.update({
      collection: 'events',
      data: { _status: 'published', editorialStatus: 'approved', status: 'published' },
      draft: false,
      id: event.id,
      overrideAccess: false,
      user: superAdmin,
    })
    chapterCommittee = await payload.update({
      collection: 'committeeTerms',
      data: { _status: 'published', editorialStatus: 'approved' },
      draft: false,
      id: chapterCommittee.id,
      overrideAccess: false,
      user: superAdmin,
    })

    const fileData = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    )
    media = (await payload.create({
      collection: 'media',
      data: { alt: 'Public chapter gallery fixture', chapter: chapterA.id, visibility: 'public' },
      file: {
        data: fileData,
        mimetype: 'image/png',
        name: `phase4-gallery-${nonce}.png`,
        size: fileData.length,
      },
      overrideAccess: false,
      user: chapterAdmin,
    })) as Media

    await expect(
      payload.create({
        collection: 'announcements',
        data: {
          _status: 'draft',
          audience: 'public',
          chapter: chapterB.id,
          editorialStatus: 'inReview',
          summary: 'Unauthorized.',
          title: 'Unauthorized',
        },
        draft: true,
        overrideAccess: false,
        user: chapterAdmin,
      }),
    ).rejects.toThrow()
    await expect(
      payload.update({
        collection: 'chapters',
        data: { summary: 'Unauthorized edit.' },
        id: chapterB.id,
        overrideAccess: false,
        user: chapterAdmin,
      }),
    ).rejects.toThrow()

    const modules = await getChapterPublicModules(chapterA.id)
    expect(modules.announcements.map((item) => item.id)).toContain(announcement.id)
    expect(modules.events.map((item) => item.id)).toContain(event.id)
    expect(modules.committees.map((item) => item.id)).toContain(chapterCommittee.id)
    expect(modules.media.map((item) => item.id)).toContain(media.id)
  })

  it('publishes ordered history and national committee archives without leaking drafts', async () => {
    currentHistory = await payload.create({
      collection: 'historyEntries',
      data: {
        _status: 'published',
        body: 'Published history body.',
        editorialStatus: 'approved',
        sortOrder: 10,
        startYear: 1990,
        summary: 'Published milestone.',
        title: `Phase 4 History ${nonce}`,
      },
      overrideAccess: false,
      user: superAdmin,
    })
    draftHistory = await payload.create({
      collection: 'historyEntries',
      data: {
        _status: 'draft',
        sortOrder: 1,
        startYear: 1980,
        summary: 'Hidden draft milestone.',
        title: `Phase 4 Draft History ${nonce}`,
      },
      draft: true,
      overrideAccess: true,
    })
    nationalCommittee = await payload.create({
      collection: 'committeeTerms',
      data: {
        _status: 'published',
        committeeType: 'advisory',
        editorialStatus: 'approved',
        endDate: new Date(Date.now() + 31_536_000_000).toISOString(),
        eventRecaps: [{ summary: 'Six-photo-limited recap fixture.', title: 'Community program' }],
        isCurrent: true,
        members: [{ bio: 'Governance test biography.', name: 'National Advisor', role: 'Advisor' }],
        startDate: new Date().toISOString(),
        summary: 'National advisory committee fixture.',
        title: `Phase 4 National Committee ${nonce}`,
      },
      overrideAccess: false,
      user: superAdmin,
    })

    const history = await getPublishedHistoryEntries()
    expect(history.map((entry) => entry.id)).toContain(currentHistory.id)
    expect(history.map((entry) => entry.id)).not.toContain(draftHistory.id)
    const committees = await getNationalCommitteeTerms({ committeeType: 'advisory', current: true })
    expect(committees.map((term) => term.id)).toContain(nationalCommittee.id)
  })

  it('approves a member request once, publishes one chapter, and records immutable review data', async () => {
    approvedRequest = await payload.create({
      collection: 'chapterRequests',
      data: {
        motivation: 'A local alumni group is already organizing programs.',
        requestedName: `Phase 4 Approved Chapter ${nonce}`,
        requestedRegion: 'Virginia',
        requester: chapterAdmin.id,
        status: 'rejected',
      },
      overrideAccess: false,
      user: member,
    })
    expect(getRelationshipID(approvedRequest.requester)).toBe(member.id)
    expect(approvedRequest.status).toBe('pending')

    const first = await reviewChapterRequest({
      decision: 'approve',
      req: await superAdminRequest(),
      requestID: approvedRequest.id,
    })
    expect(first.idempotent).toBe(false)
    approvedRequest = first.request
    const resultingID = getRelationshipID(approvedRequest.resultingChapter)
    expect(resultingID).toBeTypeOf('number')
    approvedChapter = await payload.findByID({
      collection: 'chapters',
      id: resultingID!,
      overrideAccess: true,
    })
    expect(approvedChapter).toMatchObject({
      _status: 'published',
      chapterStatus: 'active',
      regionOrState: 'Virginia',
    })
    expect(getRelationshipID(approvedRequest.reviewedBy)).toBe(superAdmin.id)
    expect(approvedRequest.reviewedAt).toBeTruthy()

    const repeated = await reviewChapterRequest({
      decision: 'approve',
      req: await superAdminRequest(),
      requestID: approvedRequest.id,
    })
    expect(repeated.idempotent).toBe(true)
    const matchingChapters = await payload.find({
      collection: 'chapters',
      overrideAccess: true,
      where: { name: { equals: approvedRequest.requestedName } },
    })
    expect(matchingChapters.totalDocs).toBe(1)
    await expect(
      reviewChapterRequest({
        decision: 'reject',
        notes: 'Conflict',
        req: await superAdminRequest(),
        requestID: approvedRequest.id,
      }),
    ).rejects.toThrow(/different final decision/)
  })

  it('requires a rejection reason and preserves a rejected request without creating a chapter', async () => {
    rejectedRequest = await payload.create({
      collection: 'chapterRequests',
      data: {
        requestedName: `Phase 4 Rejected Chapter ${nonce}`,
        requester: member.id,
        status: 'pending',
      },
      overrideAccess: false,
      user: member,
    })
    await expect(
      reviewChapterRequest({
        decision: 'reject',
        req: await superAdminRequest(),
        requestID: rejectedRequest.id,
      }),
    ).rejects.toThrow(/reason is required/)
    const result = await reviewChapterRequest({
      decision: 'reject',
      notes: 'The proposed region is already served.',
      req: await superAdminRequest(),
      requestID: rejectedRequest.id,
    })
    rejectedRequest = result.request
    expect(rejectedRequest.status).toBe('rejected')
    expect(rejectedRequest.notes).toBe('The proposed region is already served.')
    expect(rejectedRequest.resultingChapter).toBeFalsy()
  })
})
