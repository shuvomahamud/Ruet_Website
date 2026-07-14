import type { Chapter, Event, Media, User } from '@/payload-types'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { getRelationshipID } from '@/utilities/relationships'
import { getTestPayload } from '../helpers/payload'

const futureDate = (days: number): string => {
  const value = new Date()
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString()
}

describe.sequential('direct API ownership and chapter isolation', () => {
  let payload: Payload
  let memberA: User
  let memberB: User
  let chapterAdmin: User
  let chapterA: Chapter
  let chapterB: Chapter
  let eventA: Event
  let eventB: Event
  let draftA: Event
  let draftB: Event
  const registrationIDs: number[] = []
  const waitlistIDs: number[] = []
  const mediaIDs: number[] = []
  const chapterRequestIDs: number[] = []
  const extraUserIDs: number[] = []

  beforeAll(async () => {
    payload = await getTestPayload()
    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`

    memberA = await payload.create({
      collection: 'users',
      data: {
        accountStatus: 'active',
        email: `phase1-a-${nonce}@example.test`,
        password: `A-${nonce}-safe-password`,
        role: 'member',
      },
      draft: false,
      overrideAccess: true,
    })
    memberB = await payload.create({
      collection: 'users',
      data: {
        accountStatus: 'active',
        email: `phase1-b-${nonce}@example.test`,
        password: `B-${nonce}-safe-password`,
        role: 'member',
      },
      draft: false,
      overrideAccess: true,
    })
    chapterAdmin = await payload.create({
      collection: 'users',
      data: {
        accountStatus: 'active',
        email: `phase1-admin-${nonce}@example.test`,
        password: `C-${nonce}-safe-password`,
        role: 'member',
      },
      draft: false,
      overrideAccess: true,
    })

    chapterA = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Phase 1 A ${nonce}`,
        slug: `phase-1-a-${nonce}`,
        summary: 'Phase 1 access-control fixture.',
      },
      overrideAccess: true,
    })
    chapterB = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Phase 1 B ${nonce}`,
        slug: `phase-1-b-${nonce}`,
        summary: 'Phase 1 access-control fixture.',
      },
      overrideAccess: true,
    })

    memberA = await payload.update({
      collection: 'users',
      data: { primaryChapter: chapterA.id },
      id: memberA.id,
      overrideAccess: true,
    })
    memberB = await payload.update({
      collection: 'users',
      data: { primaryChapter: chapterB.id },
      id: memberB.id,
      overrideAccess: true,
    })
    chapterAdmin = await payload.update({
      collection: 'users',
      data: {
        managedChapters: [chapterA.id],
        primaryChapter: chapterA.id,
        role: 'chapterAdmin',
      },
      id: chapterAdmin.id,
      overrideAccess: true,
    })

    const eventData = {
      _status: 'published' as const,
      basePrice: 0,
      currency: 'USD',
      endAt: futureDate(4),
      eventMode: 'inPerson' as const,
      isPaid: false,
      maxRegistrationQuantity: 2,
      startAt: futureDate(3),
      status: 'published' as const,
      summary: 'Access-control event fixture.',
      timezone: 'America/New_York' as const,
      waitlistEnabled: true,
    }
    eventA = await payload.create({
      collection: 'events',
      data: {
        ...eventData,
        chapter: chapterA.id,
        slug: `event-a-${nonce}`,
        title: `Event A ${nonce}`,
      },
      overrideAccess: true,
    })
    eventB = await payload.create({
      collection: 'events',
      data: {
        ...eventData,
        chapter: chapterB.id,
        slug: `event-b-${nonce}`,
        title: `Event B ${nonce}`,
      },
      overrideAccess: true,
    })
    draftA = await payload.create({
      collection: 'events',
      data: {
        ...eventData,
        _status: 'draft',
        chapter: chapterA.id,
        slug: `draft-a-${nonce}`,
        status: 'draft',
        title: `Draft A ${nonce}`,
      },
      draft: true,
      overrideAccess: true,
    })
    draftB = await payload.create({
      collection: 'events',
      data: {
        ...eventData,
        _status: 'draft',
        chapter: chapterB.id,
        slug: `draft-b-${nonce}`,
        status: 'draft',
        title: `Draft B ${nonce}`,
      },
      draft: true,
      overrideAccess: true,
    })
  })

  afterAll(async () => {
    for (const id of chapterRequestIDs) {
      await payload.delete({ collection: 'chapterRequests', id, overrideAccess: true })
    }
    for (const id of waitlistIDs) {
      await payload.delete({ collection: 'waitlistEntries', id, overrideAccess: true })
    }
    for (const id of registrationIDs) {
      await payload.delete({ collection: 'eventRegistrations', id, overrideAccess: true })
    }
    for (const id of mediaIDs) {
      await payload.delete({ collection: 'media', id, overrideAccess: true })
    }
    for (const event of [eventA, eventB, draftA, draftB]) {
      if (event?.id)
        await payload.delete({ collection: 'events', id: event.id, overrideAccess: true })
    }
    for (const user of [memberA, memberB, chapterAdmin]) {
      if (user?.id) await payload.delete({ collection: 'users', id: user.id, overrideAccess: true })
    }
    for (const id of extraUserIDs) {
      await payload.delete({ collection: 'users', id, overrideAccess: true })
    }
    for (const chapter of [chapterA, chapterB]) {
      if (chapter?.id)
        await payload.delete({ collection: 'chapters', id: chapter.id, overrideAccess: true })
    }
  })

  it('forces a submitted registration owner to the authenticated user', async () => {
    const registration = await payload.create({
      collection: 'eventRegistrations',
      data: {
        event: eventA.id,
        discountSnapshot: 999,
        quantity: 1,
        registrationPriceSnapshot: 999,
        status: 'confirmed',
        user: memberB.id,
      },
      overrideAccess: false,
      user: memberA,
    })
    registrationIDs.push(registration.id)

    expect(getRelationshipID(registration.user)).toBe(memberA.id)
    expect(registration.status).toBe('pending')
    expect(registration.registrationPriceSnapshot).toBe(0)
    expect(registration.discountSnapshot).toBe(0)
  })

  it('isolates member and chapter-admin reads by owner and managed chapter', async () => {
    const otherRegistration = await payload.create({
      collection: 'eventRegistrations',
      data: {
        discountSnapshot: 999,
        event: eventB.id,
        quantity: 1,
        registrationPriceSnapshot: 999,
        status: 'pending',
        user: memberB.id,
      },
      overrideAccess: false,
      user: memberB,
    })
    registrationIDs.push(otherRegistration.id)

    const memberResults = await payload.find({
      collection: 'eventRegistrations',
      overrideAccess: false,
      user: memberA,
    })
    expect(memberResults.docs).toHaveLength(1)
    expect(getRelationshipID(memberResults.docs[0]?.user)).toBe(memberA.id)

    const chapterResults = await payload.find({
      collection: 'eventRegistrations',
      overrideAccess: false,
      user: chapterAdmin,
    })
    expect(chapterResults.docs).toHaveLength(1)
    expect(getRelationshipID(chapterResults.docs[0]?.event)).toBe(eventA.id)
  })

  it('shows a chapter admin only assigned-chapter drafts and blocks cross-chapter mutation', async () => {
    const drafts = await payload.find({
      collection: 'events',
      draft: true,
      overrideAccess: false,
      user: chapterAdmin,
      where: { status: { equals: 'draft' } },
    })
    expect(drafts.docs.map((event) => event.id)).toEqual([draftA.id])

    await expect(
      payload.update({
        collection: 'events',
        data: { summary: 'Unauthorized cross-chapter edit.' },
        id: eventB.id,
        overrideAccess: false,
        user: chapterAdmin,
      }),
    ).rejects.toThrow()
  })

  it('forces waitlist ownership and prevents cross-account profile mutation', async () => {
    const waitlist = await payload.create({
      collection: 'waitlistEntries',
      data: {
        event: eventA.id,
        joinedAt: futureDate(-1),
        quantity: 1,
        status: 'promoted',
        user: memberA.id,
      },
      overrideAccess: false,
      user: memberB,
    })
    waitlistIDs.push(waitlist.id)
    expect(getRelationshipID(waitlist.user)).toBe(memberB.id)
    expect(waitlist.status).toBe('waiting')

    await expect(
      payload.update({
        collection: 'users',
        data: { firstName: 'Unauthorized' },
        id: memberB.id,
        overrideAccess: false,
        user: memberA,
      }),
    ).rejects.toThrow()
  })

  it('forces chapter-request ownership, review state, and safe public signup roles', async () => {
    const request = await payload.create({
      collection: 'chapterRequests',
      data: {
        requestedName: 'Untrusted chapter request',
        requester: memberB.id,
        reviewedAt: new Date().toISOString(),
        reviewedBy: memberB.id,
        status: 'approved',
      },
      overrideAccess: false,
      user: memberA,
    })
    chapterRequestIDs.push(request.id)
    expect(getRelationshipID(request.requester)).toBe(memberA.id)
    expect(request.status).toBe('pending')
    expect(request.reviewedAt).toBeFalsy()
    expect(request.reviewedBy).toBeFalsy()

    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const publicSignup = await payload.create({
      collection: 'users',
      context: { publicSignupValidated: true },
      data: {
        accountStatus: 'active',
        email: `public-role-test-${nonce}@example.test`,
        password: `Public-${nonce}-safe-password`,
        role: 'superAdmin',
      },
      draft: false,
      overrideAccess: false,
    })
    extraUserIDs.push(publicSignup.id)
    expect(publicSignup.role).toBe('member')
  })

  it('keeps private media isolated from public, owners in other chapters, and unrelated chapter admins', async () => {
    const fileData = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    )
    const privateMedia = (await payload.create({
      collection: 'media',
      data: {
        alt: 'Private access-control fixture',
        chapter: chapterB.id,
        owner: memberB.id,
        visibility: 'private',
      },
      file: {
        data: fileData,
        mimetype: 'image/png',
        name: `phase-1-private-${Date.now()}.png`,
        size: fileData.length,
      },
      overrideAccess: true,
    })) as Media
    mediaIDs.push(privateMedia.id)

    const [publicResults, unrelatedMemberResults, ownerResults, chapterAdminResults] =
      await Promise.all([
        payload.find({
          collection: 'media',
          overrideAccess: false,
          where: { id: { equals: privateMedia.id } },
        }),
        payload.find({
          collection: 'media',
          overrideAccess: false,
          user: memberA,
          where: { id: { equals: privateMedia.id } },
        }),
        payload.find({
          collection: 'media',
          overrideAccess: false,
          user: memberB,
          where: { id: { equals: privateMedia.id } },
        }),
        payload.find({
          collection: 'media',
          overrideAccess: false,
          user: chapterAdmin,
          where: { id: { equals: privateMedia.id } },
        }),
      ])

    expect(publicResults.totalDocs).toBe(0)
    expect(unrelatedMemberResults.totalDocs).toBe(0)
    expect(ownerResults.totalDocs).toBe(0)
    expect(chapterAdminResults.totalDocs).toBe(0)
  })

  it('blocks public drafts and direct member commerce creation', async () => {
    const publicDrafts = await payload.find({
      collection: 'events',
      draft: true,
      overrideAccess: false,
      where: { status: { equals: 'draft' } },
    })
    expect(publicDrafts.totalDocs).toBe(0)

    await expect(
      payload.create({
        collection: 'orders',
        data: {
          currency: 'USD',
          orderType: 'event',
          paymentMethod: 'zelle',
          status: 'pending',
          subtotal: 10,
          total: 10,
          user: memberA.id,
        },
        overrideAccess: false,
        user: memberA,
      }),
    ).rejects.toThrow()
  })
})
