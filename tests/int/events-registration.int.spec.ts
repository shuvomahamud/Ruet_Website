import { createLocalReq, type Payload, type PayloadRequest } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import type { Chapter, Event, Media, User } from '@/payload-types'
import { queueEventSubmissionNotices, queueWaitlistPromotionNotices } from '@/services/event-notifications'
import {
  cancelEventRegistration,
  getEventAvailability,
  processEventWaitlist,
  submitEventRegistration,
} from '@/services/event-registration'
import { queuePaymentReviewNotice } from '@/services/payment-notifications'
import { reviewZellePayment } from '@/services/payment-review'
import { getEventCatalog } from '@/utilities/payload-public'

import { getTestPayload } from '../helpers/payload'

describe.sequential('event registration, Zelle, capacity, waitlist, and archive lifecycle', () => {
  let payload: Payload
  let chapter: Chapter
  let otherChapter: Chapter
  let reviewer: User
  let outsiderReviewer: User
  let publicMedia: Media
  const users: User[] = []
  const events: Event[] = []
  const promotionIDs: number[] = []
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`

  const user = async (label: string) => {
    const created = await payload.create({
      collection: 'users',
      data: {
        accountStatus: 'active',
        _verified: true,
        email: `event-${label}-${nonce}@example.test`,
        password: `Event-${label}-${nonce}-safe-password`,
        primaryChapter: chapter.id,
        profileStatus: 'complete',
        role: 'member',
      },
      overrideAccess: true,
    })
    users.push(created)
    return created
  }

  const requestFor = (actor: User): Promise<PayloadRequest> => createLocalReq({ user: actor }, payload)

  const event = async ({
    capacity = 4,
    isPaid = false,
    label,
    maxQuantity = capacity,
    past = false,
    virtual = false,
  }: {
    capacity?: number
    isPaid?: boolean
    label: string
    maxQuantity?: number
    past?: boolean
    virtual?: boolean
  }) => {
    const start = new Date(Date.now() + (past ? -172_800_000 : 172_800_000))
    const created = await payload.create({
      collection: 'events',
      data: {
        _status: 'published',
        basePrice: isPaid ? 25 : 0,
        capacity,
        chapter: chapter.id,
        currency: 'USD',
        endAt: new Date(start.getTime() + 7_200_000).toISOString(),
        eventMode: virtual ? 'virtual' : 'inPerson',
        isPaid,
        maxRegistrationQuantity: maxQuantity,
        registrationClosesAt: past
          ? new Date(start.getTime() - 3_600_000).toISOString()
          : new Date(start.getTime() + 3_600_000).toISOString(),
        slug: `phase7-${label}-${nonce}`,
        startAt: start.toISOString(),
        status: past ? 'archived' : 'published',
        summary: `Phase 7 ${label} event fixture.`,
        timezone: 'America/New_York',
        title: `Phase 7 ${label} ${nonce}`,
        virtualAccessVisibility: virtual ? 'registered' : 'public',
        virtualLink: virtual ? 'https://meet.example.test/private-phase-7' : undefined,
        waitlistEnabled: true,
        waitlistOfferHours: 1,
      },
      overrideAccess: true,
    })
    events.push(created)
    return created
  }

  beforeAll(async () => {
    payload = await getTestPayload()
    chapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Phase 7 Chapter ${nonce}`,
        slug: `phase7-chapter-${nonce}`,
        summary: 'Phase 7 event chapter.',
      },
      overrideAccess: true,
    })
    otherChapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Phase 7 Other Chapter ${nonce}`,
        slug: `phase7-other-chapter-${nonce}`,
        summary: 'Unrelated review scope.',
      },
      overrideAccess: true,
    })
    reviewer = await payload.create({
      collection: 'users',
      data: {
        accountStatus: 'active',
        _verified: true,
        email: `event-reviewer-${nonce}@example.test`,
        password: `Event-reviewer-${nonce}-safe-password`,
        role: 'member',
      },
      overrideAccess: true,
    })
    outsiderReviewer = await payload.create({
      collection: 'users',
      data: {
        accountStatus: 'active',
        _verified: true,
        email: `event-outsider-${nonce}@example.test`,
        password: `Event-outsider-${nonce}-safe-password`,
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
    outsiderReviewer = await payload.update({
      collection: 'users',
      data: {
        managedChapters: [otherChapter.id],
        primaryChapter: otherChapter.id,
        role: 'chapterAdmin',
      },
      id: outsiderReviewer.id,
      overrideAccess: true,
    })
    users.push(reviewer, outsiderReviewer)

    const image = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    )
    publicMedia = await payload.create({
      collection: 'media',
      data: {
        alt: 'Phase 7 archived event gallery',
        chapter: chapter.id,
        visibility: 'public',
      },
      file: {
        data: image,
        mimetype: 'image/png',
        name: `phase7-gallery-${nonce}.png`,
        size: image.length,
      },
      overrideAccess: true,
    })
  })

  afterAll(async () => {
    const userIDs = users.map((item) => item.id)
    const payments = await payload.find({
      collection: 'payments',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
      where: { user: { in: userIDs } },
    })
    const paymentIDs = payments.docs.map((item) => item.id)
    const audits = paymentIDs.length
      ? await payload.find({
          collection: 'auditLogs',
          depth: 0,
          limit: 1000,
          overrideAccess: true,
          pagination: false,
          where: {
            and: [
              { entityType: { equals: 'payment' } },
              { entityID: { in: paymentIDs.map(String) } },
            ],
          },
        })
      : { docs: [] }
    for (const audit of audits.docs) {
      await payload.delete({ collection: 'auditLogs', id: audit.id, overrideAccess: true })
    }
    for (const payment of payments.docs) {
      await payload.delete({ collection: 'payments', id: payment.id, overrideAccess: true })
    }
    const orders = await payload.find({
      collection: 'orders',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
      where: { user: { in: userIDs } },
    })
    for (const order of orders.docs) {
      await payload.delete({ collection: 'orders', id: order.id, overrideAccess: true })
    }
    const registrations = await payload.find({
      collection: 'eventRegistrations',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
      where: { user: { in: userIDs } },
    })
    for (const registration of registrations.docs) {
      await payload.delete({ collection: 'eventRegistrations', id: registration.id, overrideAccess: true })
    }
    const waitlist = await payload.find({
      collection: 'waitlistEntries',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
      where: { user: { in: userIDs } },
    })
    for (const entry of waitlist.docs) {
      await payload.delete({ collection: 'waitlistEntries', id: entry.id, overrideAccess: true })
    }
    const deliveries = await payload.find({
      collection: 'emailDeliveries',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
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
    for (const item of events) {
      await payload.delete({ collection: 'events', id: item.id, overrideAccess: true })
    }
    for (const id of promotionIDs) {
      await payload.delete({ collection: 'promotions', id, overrideAccess: true })
    }
    await payload.delete({ collection: 'media', id: publicMedia.id, overrideAccess: true })
    for (const item of users) {
      await payload.delete({ collection: 'users', id: item.id, overrideAccess: true })
    }
    await payload.delete({ collection: 'chapters', id: chapter.id, overrideAccess: true })
    await payload.delete({ collection: 'chapters', id: otherChapter.id, overrideAccess: true })
  })

  it('confirms free registrations and serializes concurrent capacity without overbooking', async () => {
    const free = await event({ capacity: 1, label: 'free-concurrency', maxQuantity: 1 })
    const first = await user('free-first')
    const second = await user('free-second')
    const [left, right] = await Promise.all([
      submitEventRegistration({
        eventID: free.id,
        intent: 'register',
        quantity: 1,
        req: await requestFor(first),
      }),
      submitEventRegistration({
        eventID: free.id,
        intent: 'register',
        quantity: 1,
        req: await requestFor(second),
      }),
    ])
    expect([left.outcome, right.outcome].sort()).toEqual(['confirmed', 'waitlisted'])
    const availability = await getEventAvailability({ event: free, payload })
    expect(availability).toMatchObject({ isFull: true, remainingSeats: 0, reservedSeats: 1 })
    const registrations = await payload.find({
      collection: 'eventRegistrations',
      depth: 0,
      limit: 10,
      overrideAccess: true,
      where: { event: { equals: free.id } },
    })
    expect(registrations.docs).toHaveLength(1)
    expect(registrations.docs[0]).toMatchObject({
      chapterNameSnapshot: chapter.name,
      currencySnapshot: 'USD',
      registrationPriceSnapshot: 0,
      status: 'confirmed',
    })
  })

  it('reserves paid seats, scopes review, approves safely, and preserves promotion snapshots', async () => {
    const paid = await event({ capacity: 1, isPaid: true, label: 'paid-approval', maxQuantity: 1 })
    const payer = await user('paid-payer')
    const next = await user('paid-waitlist')
    const promotion = await payload.create({
      collection: 'promotions',
      data: {
        active: true,
        code: `EVENT10-${nonce}`,
        discountType: 'percent',
        discountValue: 10,
        scope: 'event',
      },
      overrideAccess: true,
    })
    promotionIDs.push(promotion.id)
    const result = await submitEventRegistration({
      eventID: paid.id,
      intent: 'register',
      promotionCode: promotion.code,
      quantity: 1,
      req: await requestFor(payer),
      transactionId: 'EVENT-PAID-APPROVAL',
    })
    expect(result.outcome).toBe('pending')
    expect(result.quote).toMatchObject({ discountTotal: 2.5, subtotal: 25, total: 22.5 })
    expect(result.order).toMatchObject({
      paymentMethod: 'zelle',
      promotionCodeSnapshot: promotion.code,
      status: 'pending',
      total: 22.5,
    })
    const waiting = await submitEventRegistration({
      eventID: paid.id,
      intent: 'register',
      quantity: 1,
      req: await requestFor(next),
      transactionId: 'SHOULD-NOT-CREATE-A-PAYMENT',
    })
    expect(waiting.outcome).toBe('waitlisted')
    await expect(
      reviewZellePayment({
        decision: 'approve',
        paymentID: result.payment!.id,
        req: await requestFor(outsiderReviewer),
      }),
    ).rejects.toThrow()
    await reviewZellePayment({
      decision: 'approve',
      paymentID: result.payment!.id,
      req: await requestFor(reviewer),
    })
    const [registration, order] = await Promise.all([
      payload.findByID({
        collection: 'eventRegistrations',
        id: result.registration!.id,
        overrideAccess: true,
      }),
      payload.findByID({ collection: 'orders', id: result.order!.id, overrideAccess: true }),
    ])
    expect(registration).toMatchObject({ paymentStatus: 'paid', status: 'confirmed' })
    expect(order.status).toBe('paid')
    expect((await getEventAvailability({ event: paid, payload })).reservedSeats).toBe(1)
  })

  it('preserves rejected attempts and creates one new payment on resubmission', async () => {
    const paid = await event({ capacity: 2, isPaid: true, label: 'paid-resubmit', maxQuantity: 2 })
    const payer = await user('resubmit-payer')
    const initial = await submitEventRegistration({
      eventID: paid.id,
      intent: 'register',
      quantity: 2,
      req: await requestFor(payer),
      transactionId: 'EVENT-REJECT-ONE',
    })
    await reviewZellePayment({
      decision: 'reject',
      paymentID: initial.payment!.id,
      reason: 'The transaction reference could not be verified.',
      req: await requestFor(reviewer),
    })
    const resubmitted = await submitEventRegistration({
      eventID: paid.id,
      intent: 'resubmit',
      quantity: 1,
      req: await requestFor(payer),
      transactionId: 'EVENT-RESUBMIT-TWO',
    })
    expect(resubmitted.resubmission).toBe(true)
    expect(resubmitted.payment!.id).not.toBe(initial.payment!.id)
    expect(resubmitted.order!.id).toBe(initial.order!.id)
    const attempts = await payload.find({
      collection: 'payments',
      depth: 0,
      limit: 10,
      overrideAccess: true,
      sort: 'submittedAt',
      where: { order: { equals: initial.order!.id } },
    })
    expect(attempts.docs.map((item) => item.status)).toEqual(['failed', 'pending'])
    expect(attempts.docs[0]?.proofTransactionId).toBe('EVENT-REJECT-ONE')
    await reviewZellePayment({
      decision: 'approve',
      paymentID: resubmitted.payment!.id,
      req: await requestFor(reviewer),
    })
    expect(
      (
        await payload.findByID({
          collection: 'eventRegistrations',
          id: initial.registration!.id,
          overrideAccess: true,
        })
      ).status,
    ).toBe('confirmed')
  })

  it('releases cancelled capacity, skips oversized groups, expires offers, and promotes the next fit', async () => {
    const limited = await event({ capacity: 4, label: 'waitlist-fit', maxQuantity: 3 })
    const occupantA = await user('occupant-a')
    const occupantB = await user('occupant-b')
    const groupThree = await user('group-three')
    const groupTwo = await user('group-two')
    const groupOne = await user('group-one')
    const first = await submitEventRegistration({
      eventID: limited.id,
      intent: 'register',
      quantity: 2,
      req: await requestFor(occupantA),
    })
    const second = await submitEventRegistration({
      eventID: limited.id,
      intent: 'register',
      quantity: 2,
      req: await requestFor(occupantB),
    })
    const large = await submitEventRegistration({
      eventID: limited.id,
      intent: 'waitlist',
      quantity: 3,
      req: await requestFor(groupThree),
    })
    const fitting = await submitEventRegistration({
      eventID: limited.id,
      intent: 'waitlist',
      quantity: 2,
      req: await requestFor(groupTwo),
    })
    const smallest = await submitEventRegistration({
      eventID: limited.id,
      intent: 'waitlist',
      quantity: 1,
      req: await requestFor(groupOne),
    })
    expect(first.outcome).toBe('confirmed')
    expect(second.outcome).toBe('confirmed')
    const cancellation = await cancelEventRegistration({
      registrationID: second.registration!.id,
      req: await requestFor(reviewer),
    })
    expect(cancellation.promoted.map((item) => item.id)).toEqual([fitting.waitlistEntry!.id])
    expect(
      (
        await payload.findByID({
          collection: 'waitlistEntries',
          id: large.waitlistEntry!.id,
          overrideAccess: true,
        })
      ).status,
    ).toBe('waiting')
    await payload.update({
      collection: 'waitlistEntries',
      context: { workflowTransition: true },
      data: { promotionExpiryAt: new Date(Date.now() - 1_000).toISOString() },
      id: fitting.waitlistEntry!.id,
      overrideAccess: true,
    })
    const promoted = await processEventWaitlist({
      eventID: limited.id,
      now: new Date(),
      req: await createLocalReq({}, payload),
    })
    expect(promoted.map((item) => item.id)).toEqual([smallest.waitlistEntry!.id])
    const expired = await payload.findByID({
      collection: 'waitlistEntries',
      id: fitting.waitlistEntry!.id,
      overrideAccess: true,
    })
    expect(expired.status).toBe('expired')
    const accepted = await submitEventRegistration({
      eventID: limited.id,
      intent: 'accept_offer',
      quantity: 99,
      req: await requestFor(groupOne),
    })
    expect(accepted.outcome).toBe('confirmed')
    expect(accepted.registration?.quantity).toBe(1)
    expect(
      (
        await payload.findByID({
          collection: 'waitlistEntries',
          id: smallest.waitlistEntry!.id,
          overrideAccess: true,
        })
      ).status,
    ).toBe('accepted')
  })

  it('protects private virtual links and keeps completed events useful as gallery recaps', async () => {
    const archived = await event({ capacity: 10, label: 'archive', past: true, virtual: true })
    const updated = await payload.update({
      collection: 'events',
      data: {
        galleryAfterCompletion: [publicMedia.id],
        recapSummary: 'A completed event recap with a chapter gallery.',
      },
      id: archived.id,
      overrideAccess: true,
    })
    Object.assign(archived, updated)
    const attendee = await user('archive-attendee')
    const attendeeReq = await requestFor(attendee)
    const registration = await payload.create({
      collection: 'eventRegistrations',
      context: { eventWorkflowValidated: true },
      data: {
        chapterNameSnapshot: chapter.name,
        currencySnapshot: 'USD',
        discountSnapshot: 0,
        event: archived.id,
        eventStartAtSnapshot: archived.startAt,
        eventTitleSnapshot: archived.title,
        quantity: 1,
        registrationPriceSnapshot: 0,
        status: 'confirmed',
        unitPriceSnapshot: 0,
        user: attendee.id,
      },
      overrideAccess: false,
      req: attendeeReq,
    })
    expect(registration.status).toBe('confirmed')
    const [publicEvent, attendeeEvent, archive] = await Promise.all([
      payload.findByID({ collection: 'events', id: archived.id, overrideAccess: false }),
      payload.findByID({
        collection: 'events',
        id: archived.id,
        overrideAccess: false,
        user: attendee,
      }),
      getEventCatalog({ view: 'archive' }),
    ])
    expect(publicEvent.virtualLink).toBeFalsy()
    expect(attendeeEvent.virtualLink).toBe('https://meet.example.test/private-phase-7')
    expect(archive.items.map((item) => item.event.id)).toContain(archived.id)
    expect(attendeeEvent.galleryAfterCompletion).toHaveLength(1)

    const future = await event({ capacity: 2, label: 'future-gallery', maxQuantity: 2 })
    await expect(
      payload.update({
        collection: 'events',
        data: { galleryAfterCompletion: [publicMedia.id] },
        id: future.id,
        overrideAccess: true,
      }),
    ).rejects.toThrow(/only after the event ends/i)
  })

  it('deduplicates registration, reviewer, waitlist, promotion, and review notifications', async () => {
    const paid = await event({ capacity: 1, isPaid: true, label: 'notifications', maxQuantity: 1 })
    const payer = await user('notice-payer')
    const waitingUser = await user('notice-waiting')
    const registration = await submitEventRegistration({
      eventID: paid.id,
      intent: 'register',
      quantity: 1,
      req: await requestFor(payer),
      transactionId: 'EVENT-NOTICE-PAYMENT',
    })
    const waiting = await submitEventRegistration({
      eventID: paid.id,
      intent: 'waitlist',
      quantity: 1,
      req: await requestFor(waitingUser),
    })
    await queueEventSubmissionNotices(payload, paid, registration)
    await queueEventSubmissionNotices(payload, paid, registration)
    await queueEventSubmissionNotices(payload, paid, waiting)
    await queueEventSubmissionNotices(payload, paid, waiting)
    const cancelled = await cancelEventRegistration({
      registrationID: registration.registration!.id,
      req: await requestFor(reviewer),
    })
    await queueWaitlistPromotionNotices(payload, paid, cancelled.promoted)
    await queueWaitlistPromotionNotices(payload, paid, cancelled.promoted)
    const rejectedPayment = await payload.findByID({
      collection: 'payments',
      id: registration.payment!.id,
      overrideAccess: true,
    })
    await queuePaymentReviewNotice(payload, rejectedPayment, 'reject')
    await queuePaymentReviewNotice(payload, rejectedPayment, 'reject')

    const deliveries = await payload.find({
      collection: 'emailDeliveries',
      depth: 0,
      limit: 100,
      overrideAccess: true,
      pagination: false,
      where: {
        or: [
          { user: { equals: payer.id } },
          { user: { equals: waitingUser.id } },
          { user: { equals: reviewer.id } },
        ],
      },
    })
    const keys = deliveries.docs.map((item) => item.deduplicationKey)
    expect(new Set(keys).size).toBe(keys.length)
    expect(keys).toContain(`event-payment:${registration.payment!.id}:submitted`)
    expect(keys).toContain(`event-waitlist:${waiting.waitlistEntry!.id}:joined`)
    expect(keys.some((key) => key.startsWith(`event-waitlist:${waiting.waitlistEntry!.id}:promoted:`))).toBe(true)
    expect(keys).toContain(`event-payment:${registration.payment!.id}:reject`)
  })
})
