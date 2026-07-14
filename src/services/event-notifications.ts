import type { Payload } from 'payload'

import { getManagedChapterIDs } from '@/access/roles'
import { queueEmail } from '@/email/delivery'
import type { Event, Payment, WaitlistEntry } from '@/payload-types'
import { env } from '@/utilities/env'
import { formatCurrency } from '@/utilities/formatters'
import { getRelationshipID } from '@/utilities/relationships'

import type { EventRegistrationResult } from './event-registration'

const eventUrl = (event: Event) => `${env.NEXT_PUBLIC_SITE_URL}/events/${event.slug}`

const findReviewers = async (payload: Payload, chapterID?: number) => {
  if (chapterID) {
    const chapterAdmins = await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
      where: {
        and: [
          { accountStatus: { equals: 'active' } },
          { role: { equals: 'chapterAdmin' } },
        ],
      },
    })
    const assigned = chapterAdmins.docs.filter((user) =>
      getManagedChapterIDs(user).includes(chapterID),
    )
    if (assigned.length) return assigned
  }
  const admins = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { accountStatus: { equals: 'active' } },
        { role: { in: ['admin', 'superAdmin'] } },
      ],
    },
  })
  return admins.docs
}

export const queueEventSubmissionNotices = async (
  payload: Payload,
  event: Event,
  result: EventRegistrationResult,
) => {
  if (result.outcome === 'waitlisted' && result.waitlistEntry) {
    const userID = getRelationshipID(result.waitlistEntry.user)
    if (!userID) return
    await queueEmail(payload, {
      category: 'system',
      data: {
        action: { label: 'View event', url: eventUrl(event) },
        message: `You joined the waitlist for ${event.title} for ${result.waitlistEntry.quantity} attendee${result.waitlistEntry.quantity === 1 ? '' : 's'}. We will email you if a fitting seat offer becomes available.`,
        subject: `Waitlisted: ${event.title}`,
        title: 'You are on the event waitlist',
      },
      deduplicationKey: `event-waitlist:${result.waitlistEntry.id}:joined`,
      queue: 'waitlist',
      required: true,
      template: 'systemNotice',
      userID,
    })
    return
  }

  const registration = result.registration
  if (!registration) return
  const userID = getRelationshipID(registration.user)
  if (!userID) return
  if (result.outcome === 'confirmed') {
    await queueEmail(payload, {
      category: 'system',
      data: {
        action: { label: 'View registration', url: eventUrl(event) },
        message: `Your registration for ${event.title} is confirmed for ${registration.quantity} attendee${registration.quantity === 1 ? '' : 's'}.`,
        subject: `Registration confirmed: ${event.title}`,
        title: 'Your event registration is confirmed',
      },
      deduplicationKey: `event-registration:${registration.id}:confirmed`,
      queue: 'transactional',
      required: true,
      template: 'systemNotice',
      userID,
    })
    return
  }

  if (!result.payment || !result.order) return
  await queueEmail(payload, {
    category: 'system',
    data: {
      action: { label: 'View event registration', url: eventUrl(event) },
      message: `We received your Zelle details for ${formatCurrency(result.order.total, result.order.currency)}. Your ${registration.quantity}-attendee registration is reserved and remains pending until an authorized reviewer approves the payment.`,
      subject: `Event payment submitted: ${event.title}`,
      title: 'Your event payment is pending review',
    },
    deduplicationKey: `event-payment:${result.payment.id}:submitted`,
    queue: 'transactional',
    required: true,
    template: 'systemNotice',
    userID,
  })
  const chapterID = getRelationshipID(result.order.chapterAttribution)
  const reviewers = await findReviewers(payload, chapterID)
  await Promise.all(
    reviewers.map((reviewer) =>
      queueEmail(payload, {
        category: 'system',
        data: {
          action: {
            label: 'Review pending payment',
            url: `${env.NEXT_PUBLIC_SITE_URL}/payments/review?type=event`,
          },
          message: `A ${formatCurrency(result.order!.total, result.order!.currency)} Zelle payment for ${event.title} is waiting in your authorized review queue.`,
          subject: 'Event payment awaiting review',
          title: 'An event payment needs review',
        },
        deduplicationKey: `event-payment:${result.payment!.id}:reviewer:${reviewer.id}`,
        queue: 'transactional',
        required: true,
        template: 'systemNotice',
        userID: reviewer.id,
      }),
    ),
  )
}

export const queueWaitlistPromotionNotices = async (
  payload: Payload,
  event: Event,
  entries: WaitlistEntry[],
) => {
  await Promise.all(
    entries.map(async (entry) => {
      const userID = getRelationshipID(entry.user)
      if (!userID || !entry.promotionExpiryAt) return
      const expires = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: event.timezone,
      }).format(new Date(entry.promotionExpiryAt))
      await queueEmail(payload, {
        category: 'system',
        data: {
          action: { label: 'Accept event offer', url: eventUrl(event) },
          message: `${entry.quantity} seat${entry.quantity === 1 ? '' : 's'} became available for ${event.title}. Sign in and accept by ${expires} (${event.timezone}); otherwise the offer expires automatically.`,
          subject: `Seats available: ${event.title}`,
          title: 'Your waitlist offer is ready',
        },
        deduplicationKey: `event-waitlist:${entry.id}:promoted:${entry.promotionExpiryAt}`,
        queue: 'waitlist',
        required: true,
        template: 'systemNotice',
        userID,
      })
    }),
  )
}

export const queueEventPaymentReviewNotice = async (
  payload: Payload,
  payment: Payment,
  decision: 'approve' | 'reject',
) => {
  const userID = getRelationshipID(payment.user)
  const orderID = getRelationshipID(payment.order)
  if (!userID || !orderID) return
  const order = await payload.findByID({
    collection: 'orders',
    depth: 0,
    id: orderID,
    overrideAccess: true,
  })
  const registrationID = getRelationshipID(order.eventRegistration)
  if (!registrationID) return
  const registration = await payload.findByID({
    collection: 'eventRegistrations',
    depth: 0,
    id: registrationID,
    overrideAccess: true,
  })
  const eventID = getRelationshipID(registration.event)
  if (!eventID) return
  const event = await payload.findByID({
    collection: 'events',
    depth: 0,
    id: eventID,
    overrideAccess: true,
  })
  const approved = decision === 'approve'
  await queueEmail(payload, {
    category: 'system',
    data: {
      action: { label: approved ? 'View confirmed event' : 'Resubmit payment', url: eventUrl(event) },
      message: approved
        ? `Your Zelle payment was approved. Your registration for ${event.title} is now confirmed for ${registration.quantity} attendee${registration.quantity === 1 ? '' : 's'}.`
        : `Your Zelle payment for ${event.title} could not be approved.${payment.rejectionReason ? ` Reason: ${payment.rejectionReason}` : ''} Your seats remain reserved while you submit a new transaction ID, proof, or both.`,
      subject: approved
        ? `Event payment approved: ${event.title}`
        : `Event payment needs resubmission: ${event.title}`,
      title: approved
        ? 'Your event registration is confirmed'
        : 'Please resubmit event payment details',
    },
    deduplicationKey: `event-payment:${payment.id}:${decision}`,
    queue: 'transactional',
    required: true,
    template: 'systemNotice',
    userID,
  })
}

export const queueEventCancellationNotice = async (
  payload: Payload,
  event: Event,
  registrationID: number,
  userID: number,
) => {
  await queueEmail(payload, {
    category: 'system',
    data: {
      action: { label: 'Browse events', url: `${env.NEXT_PUBLIC_SITE_URL}/events` },
      message: `An authorized event administrator cancelled your registration for ${event.title}. Any pending Zelle attempt was closed. Automated refunds are not issued; contact the chapter for exceptional handling.`,
      subject: `Registration cancelled: ${event.title}`,
      title: 'Your event registration was cancelled',
    },
    deduplicationKey: `event-registration:${registrationID}:cancelled`,
    queue: 'transactional',
    required: true,
    template: 'systemNotice',
    userID,
  })
}
