import type { PayloadRequest } from 'payload'

import { queueWaitlistPromotionNotices } from './event-notifications'
import { processEventWaitlist } from './event-registration'

export type EventLifecycleResult = {
  expiredOffers: number
  promotedOffers: number
  processedEvents: number
}

export const processEventLifecycle = async ({
  now = new Date(),
  req,
}: {
  now?: Date
  req: PayloadRequest
}): Promise<EventLifecycleResult> => {
  const result: EventLifecycleResult = {
    expiredOffers: 0,
    processedEvents: 0,
    promotedOffers: 0,
  }
  const events = await req.payload.find({
    collection: 'events',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    req,
    sort: 'id',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { status: { in: ['published', 'archived'] } },
        { waitlistEnabled: { equals: true } },
        { endAt: { greater_than: now.toISOString() } },
      ],
    },
  })

  for (const event of events.docs) {
    const expired = await req.payload.count({
      collection: 'waitlistEntries',
      overrideAccess: true,
      req,
      where: {
        and: [
          { event: { equals: event.id } },
          { status: { equals: 'promoted' } },
          { promotionExpiryAt: { less_than_equal: now.toISOString() } },
        ],
      },
    })
    const promoted = await processEventWaitlist({ eventID: event.id, now, req })
    result.expiredOffers += expired.totalDocs
    result.promotedOffers += promoted.length
    result.processedEvents += 1
    if (promoted.length) await queueWaitlistPromotionNotices(req.payload, event, promoted)
  }

  return result
}
