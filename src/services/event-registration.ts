import type { File, Payload, PayloadRequest } from 'payload'
import { Forbidden } from 'payload'

import { getManagedChapterIDs, getRole, isAdmin } from '@/access/roles'
import type {
  Chapter,
  Event,
  EventRegistration,
  Order,
  Payment,
  PaymentProof,
  Promotion,
  User,
  WaitlistEntry,
} from '@/payload-types'
import { AppError } from '@/utilities/errors'
import { getRelationshipID } from '@/utilities/relationships'

import { lockWorkflowRecord, runInTransaction } from './transaction'
import { transitionWorkflowRecord } from './workflow-transitions'

export type EventRegistrationIntent = 'accept_offer' | 'register' | 'resubmit' | 'waitlist'

export type EventQuote = {
  currency: string
  discountTotal: number
  eventID: number
  eventTitle: string
  promotionCode?: string
  promotionID?: number
  quantity: number
  subtotal: number
  total: number
  unitPrice: number
}

export type EventAvailability = {
  capacity: number | null
  isFull: boolean
  registrationOpen: boolean
  remainingSeats: number | null
  reservedSeats: number
  userRegistration?: EventRegistration
  userWaitlistEntry?: WaitlistEntry
}

export type EventRegistrationResult = {
  outcome: 'confirmed' | 'pending' | 'waitlisted'
  order?: Order
  payment?: Payment
  proof?: PaymentProof
  promoted: WaitlistEntry[]
  quote?: EventQuote
  registration?: EventRegistration
  resubmission: boolean
  waitlistEntry?: WaitlistEntry
}

type SubmissionInput = {
  eventID: number
  intent: EventRegistrationIntent
  proofFile?: File
  promotionCode?: string
  quantity?: number
  req: PayloadRequest
  transactionId?: string
}

const acceptedProofTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
])
const MAX_PROOF_BYTES = 8 * 1024 * 1024
const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100

const assertQuantity = (event: Event, quantity: number): void => {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new AppError('Registration quantity must be a positive whole number.', {
      code: 'INVALID_QUANTITY',
      status: 400,
    })
  }
  if (quantity > (event.maxRegistrationQuantity ?? 1)) {
    throw new AppError(
      `Registration quantity cannot exceed ${event.maxRegistrationQuantity ?? 1}.`,
      { code: 'QUANTITY_LIMIT_EXCEEDED', status: 409 },
    )
  }
}

const isRegistrationOpen = (event: Event, now = new Date()): boolean => {
  const opensAt = event.registrationOpensAt ? new Date(event.registrationOpensAt) : undefined
  const closesAt = new Date(event.registrationClosesAt ?? event.startAt)
  return (!opensAt || opensAt <= now) && closesAt > now && new Date(event.endAt) > now
}

const assertPublicRegistrationEvent = (event: Event, now = new Date()): void => {
  if (event._status !== 'published' || event.status !== 'published') {
    throw new AppError('This event is not available for public registration.', {
      code: 'EVENT_NOT_PUBLISHED',
      status: 404,
    })
  }
  if (!isRegistrationOpen(event, now)) {
    throw new AppError('Registration is not currently open for this event.', {
      code: 'REGISTRATION_CLOSED',
      status: 409,
    })
  }
}

const getChapter = async (payload: Payload, event: Event, req?: PayloadRequest): Promise<Chapter> => {
  if (typeof event.chapter === 'object') return event.chapter
  return payload.findByID({
    collection: 'chapters',
    depth: 0,
    id: event.chapter,
    overrideAccess: true,
    req,
  })
}

const getReservedSeats = async (
  payload: Payload,
  eventID: number,
  now = new Date(),
  req?: PayloadRequest,
): Promise<number> => {
  const [registrations, offers] = await Promise.all([
    payload.find({
      collection: 'eventRegistrations',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
      req,
      where: {
        and: [
          { event: { equals: eventID } },
          { status: { in: ['pending', 'confirmed'] } },
        ],
      },
    }),
    payload.find({
      collection: 'waitlistEntries',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
      req,
      where: {
        and: [
          { event: { equals: eventID } },
          { status: { equals: 'promoted' } },
          { promotionExpiryAt: { greater_than: now.toISOString() } },
        ],
      },
    }),
  ])
  return [...registrations.docs, ...offers.docs].reduce((sum, item) => sum + item.quantity, 0)
}

export const getEventAvailability = async ({
  event,
  now = new Date(),
  payload,
  userID,
}: {
  event: Event
  now?: Date
  payload: Payload
  userID?: number
}): Promise<EventAvailability> => {
  const reservedSeats = await getReservedSeats(payload, event.id, now)
  const capacity = event.capacity ?? null
  const remainingSeats = capacity === null ? null : Math.max(0, capacity - reservedSeats)
  let userRegistration: EventRegistration | undefined
  let userWaitlistEntry: WaitlistEntry | undefined
  if (userID) {
    const [registrations, waitlist] = await Promise.all([
      payload.find({
        collection: 'eventRegistrations',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        pagination: false,
        sort: '-createdAt',
        where: {
          and: [
            { event: { equals: event.id } },
            { user: { equals: userID } },
            { status: { not_equals: 'cancelled' } },
          ],
        },
      }),
      payload.find({
        collection: 'waitlistEntries',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        pagination: false,
        sort: '-joinedAt',
        where: {
          and: [
            { event: { equals: event.id } },
            { user: { equals: userID } },
            { status: { in: ['waiting', 'promoted'] } },
          ],
        },
      }),
    ])
    userRegistration = registrations.docs[0]
    userWaitlistEntry = waitlist.docs[0]
  }
  return {
    capacity,
    isFull: remainingSeats === 0,
    registrationOpen: isRegistrationOpen(event, now),
    remainingSeats,
    reservedSeats,
    userRegistration,
    userWaitlistEntry,
  }
}

const hasCurrentMembership = async (payload: Payload, userID: number, req?: PayloadRequest) => {
  const result = await payload.count({
    collection: 'memberships',
    overrideAccess: true,
    req,
    where: {
      and: [{ user: { equals: userID } }, { status: { in: ['active', 'grace_period'] } }],
    },
  })
  return result.totalDocs > 0
}

const getEventPromotion = async ({
  code,
  payload,
  req,
  user,
}: {
  code?: string
  payload: Payload
  req?: PayloadRequest
  user: User
}): Promise<Promotion | undefined> => {
  const normalizedCode = code?.trim().toUpperCase()
  if (!normalizedCode) return undefined
  const result = await payload.find({
    collection: 'promotions',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    where: { code: { equals: normalizedCode } },
  })
  const promotion = result.docs[0]
  const now = Date.now()
  if (
    !promotion ||
    !promotion.active ||
    !['event', 'both'].includes(promotion.scope) ||
    (promotion.startsAt && new Date(promotion.startsAt).getTime() > now) ||
    (promotion.endsAt && new Date(promotion.endsAt).getTime() <= now)
  ) {
    throw new AppError('This promotion code is not valid for event registration.', {
      code: 'INVALID_PROMOTION',
      status: 400,
    })
  }
  if (promotion.memberOnly && !(await hasCurrentMembership(payload, user.id, req))) {
    throw new AppError('This promotion is available only to current members.', {
      code: 'MEMBER_ONLY_PROMOTION',
      status: 400,
    })
  }
  return promotion
}

const assertPromotionCapacity = async (
  payload: Payload,
  promotion: Promotion,
  req?: PayloadRequest,
) => {
  if (promotion.usageLimit === null || promotion.usageLimit === undefined) return
  const usage = await payload.count({
    collection: 'orders',
    overrideAccess: true,
    req,
    where: {
      and: [
        { promotion: { equals: promotion.id } },
        { status: { in: ['pending', 'paid'] } },
      ],
    },
  })
  if (usage.totalDocs >= promotion.usageLimit) {
    throw new AppError('This promotion code has reached its usage limit.', {
      code: 'PROMOTION_LIMIT_REACHED',
      status: 409,
    })
  }
}

export const calculateEventQuote = async ({
  event,
  payload,
  promotionCode,
  quantity,
  req,
  user,
}: {
  event: Event
  payload: Payload
  promotionCode?: string
  quantity: number
  req?: PayloadRequest
  user: User
}): Promise<{ promotion?: Promotion; quote: EventQuote }> => {
  assertQuantity(event, quantity)
  let promotion = await getEventPromotion({ code: promotionCode, payload, req, user })
  if (promotion && req) {
    await lockWorkflowRecord(req, 'promotions', promotion.id)
    promotion = await getEventPromotion({ code: promotionCode, payload, req, user })
  }
  if (promotion) await assertPromotionCapacity(payload, promotion, req)
  const unitPrice = event.isPaid ? money(event.basePrice ?? 0) : 0
  const subtotal = money(unitPrice * quantity)
  const discountTotal = promotion
    ? promotion.discountType === 'fixed'
      ? Math.min(subtotal, money(promotion.discountValue))
      : Math.min(subtotal, money((subtotal * promotion.discountValue) / 100))
    : 0
  const total = money(subtotal - discountTotal)
  if (event.isPaid && total <= 0) {
    throw new AppError('Event promotions must leave a positive Zelle payment total.', {
      code: 'ZERO_TOTAL_EVENT_UNSUPPORTED',
      status: 409,
    })
  }
  return {
    promotion,
    quote: {
      currency: event.currency ?? 'USD',
      discountTotal,
      eventID: event.id,
      eventTitle: event.title,
      promotionCode: promotion?.code,
      promotionID: promotion?.id,
      quantity,
      subtotal,
      total,
      unitPrice,
    },
  }
}

const validateProof = (proofFile: File | undefined, transactionId: string | undefined) => {
  if (!proofFile && !transactionId?.trim()) {
    throw new AppError('Provide a Zelle transaction ID, payment proof, or both.', {
      code: 'PAYMENT_PROOF_REQUIRED',
      status: 400,
    })
  }
  if (proofFile && (!acceptedProofTypes.has(proofFile.mimetype) || proofFile.size > MAX_PROOF_BYTES)) {
    throw new AppError('Payment proof must be a JPG, PNG, WebP, or PDF no larger than 8 MB.', {
      code: 'INVALID_PAYMENT_PROOF',
      status: 400,
    })
  }
}

const createProof = async (
  req: PayloadRequest,
  event: Event,
  proofFile: File | undefined,
): Promise<PaymentProof | undefined> => {
  if (!proofFile) return undefined
  return req.payload.create({
    collection: 'paymentProofs',
    data: {
      chapter: getRelationshipID(event.chapter),
      description: `Event Zelle payment proof: ${event.title}`,
      owner: Number(req.user!.id),
    },
    file: proofFile,
    overrideAccess: false,
    req,
  })
}

const activeRegistration = async (req: PayloadRequest, eventID: number, userID: number) => {
  const result = await req.payload.find({
    collection: 'eventRegistrations',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    sort: '-createdAt',
    where: {
      and: [
        { event: { equals: eventID } },
        { user: { equals: userID } },
        { status: { not_equals: 'cancelled' } },
      ],
    },
  })
  return result.docs[0]
}

const activeWaitlistEntry = async (req: PayloadRequest, eventID: number, userID: number) => {
  const result = await req.payload.find({
    collection: 'waitlistEntries',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    sort: '-joinedAt',
    where: {
      and: [
        { event: { equals: eventID } },
        { user: { equals: userID } },
        { status: { in: ['waiting', 'promoted'] } },
      ],
    },
  })
  return result.docs[0]
}

const createWaitlistEntry = async (
  req: PayloadRequest,
  event: Event,
  quantity: number,
): Promise<WaitlistEntry> => {
  if (!event.waitlistEnabled) {
    throw new AppError('This event is full and its waitlist is not available.', {
      code: 'EVENT_FULL',
      status: 409,
    })
  }
  const userID = Number(req.user!.id)
  if (await activeWaitlistEntry(req, event.id, userID)) {
    throw new AppError('You already have an active waitlist entry for this event.', {
      code: 'DUPLICATE_WAITLIST_ENTRY',
      status: 409,
    })
  }
  return req.payload.create({
    collection: 'waitlistEntries',
    context: { eventWorkflowValidated: true },
    data: {
      event: event.id,
      joinedAt: new Date().toISOString(),
      quantity,
      status: 'waiting',
      user: userID,
    },
    overrideAccess: false,
    req,
  })
}

const processWaitlistLocked = async (
  req: PayloadRequest,
  event: Event,
  now: Date,
): Promise<WaitlistEntry[]> => {
  const expiredOffers = await req.payload.find({
    collection: 'waitlistEntries',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    req,
    where: {
      and: [
        { event: { equals: event.id } },
        { status: { equals: 'promoted' } },
        { promotionExpiryAt: { less_than_equal: now.toISOString() } },
      ],
    },
  })
  for (const offer of expiredOffers.docs) {
    await transitionWorkflowRecord({
      collection: 'waitlistEntries',
      expectedStatus: 'promoted',
      id: offer.id,
      nextStatus: 'expired',
      req,
    })
  }

  if (!event.waitlistEnabled || new Date(event.endAt) <= now) return []
  const reserved = await getReservedSeats(req.payload, event.id, now, req)
  let available = event.capacity === null || event.capacity === undefined ? Infinity : event.capacity - reserved
  if (available <= 0) return []
  const waiting = await req.payload.find({
    collection: 'waitlistEntries',
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    req,
    sort: ['joinedAt', 'id'],
    where: {
      and: [{ event: { equals: event.id } }, { status: { equals: 'waiting' } }],
    },
  })
  const promoted: WaitlistEntry[] = []
  for (const entry of waiting.docs) {
    if (entry.quantity > available) continue
    const expiry = new Date(now.getTime() + (event.waitlistOfferHours ?? 48) * 60 * 60 * 1000)
    const transition = await transitionWorkflowRecord({
      collection: 'waitlistEntries',
      data: {
        promotedAt: now.toISOString(),
        promotionExpiryAt: expiry.toISOString(),
      },
      expectedStatus: 'waiting',
      id: entry.id,
      nextStatus: 'promoted',
      req,
    })
    if (!transition.idempotent) {
      promoted.push({
        ...entry,
        promotedAt: now.toISOString(),
        promotionExpiryAt: expiry.toISOString(),
        status: 'promoted',
      })
      available -= entry.quantity
    }
    if (available <= 0) break
  }
  return promoted
}

const createRegistration = async ({
  chapter,
  event,
  quote,
  req,
  status,
  waitlistEntry,
}: {
  chapter: Chapter
  event: Event
  quote: EventQuote
  req: PayloadRequest
  status: EventRegistration['status']
  waitlistEntry?: WaitlistEntry
}): Promise<EventRegistration> =>
  req.payload.create({
    collection: 'eventRegistrations',
    context: { eventWorkflowValidated: true },
    data: {
      chapterNameSnapshot: chapter.name,
      currencySnapshot: quote.currency,
      discountSnapshot: quote.discountTotal,
      event: event.id,
      eventStartAtSnapshot: event.startAt,
      eventTitleSnapshot: event.title,
      paymentStatus: event.isPaid ? 'pending' : undefined,
      quantity: quote.quantity,
      registrationPriceSnapshot: quote.subtotal,
      status,
      unitPriceSnapshot: quote.unitPrice,
      user: Number(req.user!.id),
      waitlistEntry: waitlistEntry?.id,
    },
    overrideAccess: false,
    req,
  })

const createOrder = async ({
  chapter,
  promotion,
  quote,
  registration,
  req,
}: {
  chapter: Chapter
  promotion?: Promotion
  quote: EventQuote
  registration: EventRegistration
  req: PayloadRequest
}): Promise<Order> =>
  req.payload.create({
    collection: 'orders',
    data: {
      chapterAttribution: chapter.id,
      chapterNameSnapshot: chapter.name,
      currency: quote.currency,
      discountTotal: quote.discountTotal,
      eventRegistration: registration.id,
      orderType: 'event',
      paymentMethod: 'zelle',
      promotion: promotion?.id,
      promotionCodeSnapshot: promotion?.code,
      promotionDiscountTypeSnapshot: promotion?.discountType,
      promotionDiscountValueSnapshot: promotion?.discountValue,
      status: 'pending',
      subtotal: quote.subtotal,
      total: quote.total,
      user: Number(req.user!.id),
    },
    overrideAccess: true,
    req,
  })

const createPayment = async ({
  order,
  proof,
  req,
  transactionId,
}: {
  order: Order
  proof?: PaymentProof
  req: PayloadRequest
  transactionId?: string
}): Promise<Payment> =>
  req.payload.create({
    collection: 'payments',
    data: {
      amountSnapshot: order.total,
      chapterNameSnapshot: order.chapterNameSnapshot,
      currencySnapshot: order.currency,
      firstReviewerChapter: getRelationshipID(order.chapterAttribution),
      order: order.id,
      orderTypeSnapshot: 'event',
      paymentSource: 'zelle',
      proofImage: proof?.id,
      proofTransactionId: transactionId?.trim() || undefined,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      user: Number(req.user!.id),
    },
    overrideAccess: true,
    req,
  })

const resubmitEventPayment = async ({
  event,
  proofFile,
  req,
  transactionId,
}: {
  event: Event
  proofFile?: File
  req: PayloadRequest
  transactionId?: string
}): Promise<EventRegistrationResult> => {
  const registration = await activeRegistration(req, event.id, Number(req.user!.id))
  if (!registration || registration.status !== 'pending' || registration.paymentStatus !== 'failed') {
    throw new AppError('No rejected event payment is available to resubmit.', {
      code: 'NO_FAILED_EVENT_PAYMENT',
      status: 409,
    })
  }
  await lockWorkflowRecord(req, 'event_registrations', registration.id)
  const orders = await req.payload.find({
    collection: 'orders',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    where: {
      and: [
        { eventRegistration: { equals: registration.id } },
        { status: { equals: 'pending' } },
      ],
    },
  })
  const order = orders.docs[0]
  if (!order) {
    throw new AppError('The rejected event payment no longer has a pending order.', {
      code: 'PENDING_ORDER_NOT_FOUND',
      status: 409,
    })
  }
  await lockWorkflowRecord(req, 'orders', order.id)
  const pending = await req.payload.count({
    collection: 'payments',
    overrideAccess: true,
    req,
    where: { and: [{ order: { equals: order.id } }, { status: { equals: 'pending' } }] },
  })
  if (pending.totalDocs) {
    throw new AppError('A payment attempt is already pending review.', {
      code: 'PAYMENT_ATTEMPT_ALREADY_PENDING',
      status: 409,
    })
  }
  const proof = await createProof(req, event, proofFile)
  const payment = await createPayment({ order, proof, req, transactionId })
  const updated = await req.payload.update({
    collection: 'eventRegistrations',
    context: { workflowTransition: true },
    data: { paymentStatus: 'pending' },
    id: registration.id,
    overrideAccess: true,
    req,
  })
  return {
    outcome: 'pending',
    order,
    payment,
    proof,
    promoted: [],
    quote: {
      currency: order.currency,
      discountTotal: order.discountTotal ?? 0,
      eventID: event.id,
      eventTitle: registration.eventTitleSnapshot,
      promotionCode: order.promotionCodeSnapshot ?? undefined,
      promotionID: getRelationshipID(order.promotion),
      quantity: registration.quantity,
      subtotal: order.subtotal,
      total: order.total,
      unitPrice: registration.unitPriceSnapshot,
    },
    registration: updated,
    resubmission: true,
  }
}

export const submitEventRegistration = async ({
  eventID,
  intent,
  proofFile,
  promotionCode,
  quantity = 1,
  req,
  transactionId,
}: SubmissionInput): Promise<EventRegistrationResult> => {
  if (!req.user?.id) throw new AppError('Sign in to continue.', { status: 401 })
  if (['register', 'accept_offer', 'resubmit'].includes(intent) && (proofFile || transactionId)) {
    // Validate uploads before opening a transaction; free registrations simply ignore absent proof.
    if (proofFile && (!acceptedProofTypes.has(proofFile.mimetype) || proofFile.size > MAX_PROOF_BYTES)) {
      validateProof(proofFile, transactionId)
    }
  }

  return runInTransaction(req, async () => {
    const userID = Number(req.user!.id)
    await lockWorkflowRecord(req, 'users', userID)
    await lockWorkflowRecord(req, 'events', eventID)
    const [event, user] = await Promise.all([
      req.payload.findByID({
        collection: 'events',
        depth: 1,
        id: eventID,
        overrideAccess: true,
        req,
      }) as Promise<Event>,
      req.payload.findByID({
        collection: 'users',
        depth: 0,
        id: userID,
        overrideAccess: true,
        req,
      }) as Promise<User>,
    ])
    assertPublicRegistrationEvent(event)

    if (intent === 'resubmit') {
      if (!event.isPaid) {
        throw new AppError('Free event registrations do not have payments to resubmit.', {
          code: 'FREE_EVENT_RESUBMISSION',
          status: 409,
        })
      }
      validateProof(proofFile, transactionId)
      return resubmitEventPayment({ event, proofFile, req, transactionId })
    }

    if (intent !== 'accept_offer') assertQuantity(event, quantity)
    const existingRegistration = await activeRegistration(req, event.id, userID)
    if (existingRegistration) {
      throw new AppError('You already have an active registration for this event.', {
        code: 'DUPLICATE_REGISTRATION',
        status: 409,
      })
    }

    let promoted: WaitlistEntry[] = []
    let offer: WaitlistEntry | undefined
    if (intent === 'accept_offer') {
      offer = await activeWaitlistEntry(req, event.id, userID)
      if (!offer || offer.status !== 'promoted') {
        throw new AppError('No active waitlist offer is available to accept.', {
          code: 'WAITLIST_OFFER_NOT_FOUND',
          status: 409,
        })
      }
      await lockWorkflowRecord(req, 'waitlist_entries', offer.id)
      if (!offer.promotionExpiryAt || new Date(offer.promotionExpiryAt) <= new Date()) {
        await transitionWorkflowRecord({
          collection: 'waitlistEntries',
          expectedStatus: 'promoted',
          id: offer.id,
          nextStatus: 'expired',
          req,
        })
        throw new AppError('This waitlist offer has expired.', {
          code: 'WAITLIST_OFFER_EXPIRED',
          status: 409,
        })
      }
      quantity = offer.quantity
      assertQuantity(event, quantity)
    } else {
      const activeWaitlist = await activeWaitlistEntry(req, event.id, userID)
      if (activeWaitlist) {
        throw new AppError(
          activeWaitlist.status === 'promoted'
            ? 'Accept your existing waitlist offer to register.'
            : 'You are already on the waitlist for this event.',
          { code: 'ACTIVE_WAITLIST_ENTRY', status: 409 },
        )
      }
      promoted = await processWaitlistLocked(req, event, new Date())
    }

    if (intent === 'waitlist') {
      const reserved = await getReservedSeats(req.payload, event.id, new Date(), req)
      const available =
        event.capacity === null || event.capacity === undefined
          ? Infinity
          : event.capacity - reserved
      if (quantity <= available) {
        throw new AppError('Seats are available; register instead of joining the waitlist.', {
          code: 'EVENT_SEATS_AVAILABLE',
          status: 409,
        })
      }
      const waitlistEntry = await createWaitlistEntry(req, event, quantity)
      return {
        outcome: 'waitlisted',
        promoted,
        resubmission: false,
        waitlistEntry,
      }
    }

    const reserved = await getReservedSeats(req.payload, event.id, new Date(), req)
    const offerReservation = offer ? offer.quantity : 0
    const available =
      event.capacity === null || event.capacity === undefined
        ? Infinity
        : event.capacity - reserved + offerReservation
    if (quantity > available) {
      const waitlistEntry = await createWaitlistEntry(req, event, quantity)
      return {
        outcome: 'waitlisted',
        promoted,
        resubmission: false,
        waitlistEntry,
      }
    }

    const chapter = await getChapter(req.payload, event, req)
    const { promotion, quote } = await calculateEventQuote({
      event,
      payload: req.payload,
      promotionCode,
      quantity,
      req,
      user,
    })
    if (event.isPaid) validateProof(proofFile, transactionId)
    if (offer) {
      await transitionWorkflowRecord({
        collection: 'waitlistEntries',
        data: { acceptedAt: new Date().toISOString() },
        expectedStatus: 'promoted',
        id: offer.id,
        nextStatus: 'accepted',
        req,
      })
    }
    const registration = await createRegistration({
      chapter,
      event,
      quote,
      req,
      status: event.isPaid ? 'pending' : 'confirmed',
      waitlistEntry: offer,
    })
    if (!event.isPaid) {
      return {
        outcome: 'confirmed',
        promoted,
        quote,
        registration,
        resubmission: false,
      }
    }
    const proof = await createProof(req, event, proofFile)
    const order = await createOrder({ chapter, promotion, quote, registration, req })
    const payment = await createPayment({ order, proof, req, transactionId })
    return {
      outcome: 'pending',
      order,
      payment,
      proof,
      promoted,
      quote,
      registration,
      resubmission: false,
    }
  })
}

export const processEventWaitlist = async ({
  eventID,
  now = new Date(),
  req,
}: {
  eventID: number
  now?: Date
  req: PayloadRequest
}): Promise<WaitlistEntry[]> =>
  runInTransaction(req, async () => {
    await lockWorkflowRecord(req, 'events', eventID)
    const event = (await req.payload.findByID({
      collection: 'events',
      depth: 0,
      id: eventID,
      overrideAccess: true,
      req,
    })) as Event
    return processWaitlistLocked(req, event, now)
  })

export const assertEventRegistrationApprovalCapacity = async (
  req: PayloadRequest,
  registrationID: number,
): Promise<EventRegistration> => {
  await lockWorkflowRecord(req, 'event_registrations', registrationID)
  const registration = (await req.payload.findByID({
    collection: 'eventRegistrations',
    depth: 0,
    id: registrationID,
    overrideAccess: true,
    req,
  })) as EventRegistration
  if (registration.status !== 'pending' || registration.paymentStatus !== 'pending') {
    throw new AppError('The event registration is not awaiting payment approval.', {
      code: 'REGISTRATION_NOT_PENDING_APPROVAL',
      status: 409,
    })
  }
  const eventID = getRelationshipID(registration.event)
  if (!eventID) throw new AppError('Registration is not linked to an event.', { status: 409 })
  await lockWorkflowRecord(req, 'events', eventID)
  const event = (await req.payload.findByID({
    collection: 'events',
    depth: 0,
    id: eventID,
    overrideAccess: true,
    req,
  })) as Event
  if (event.capacity !== null && event.capacity !== undefined) {
    const reserved = await getReservedSeats(req.payload, event.id, new Date(), req)
    if (reserved > event.capacity) {
      throw new AppError('Approval is paused because this event is over capacity.', {
        code: 'EVENT_APPROVAL_WOULD_OVERBOOK',
        status: 409,
      })
    }
  }
  return registration
}

const assertCanManageEvent = (req: PayloadRequest, event: Event): void => {
  if (isAdmin(req.user)) return
  const chapterID = getRelationshipID(event.chapter)
  if (
    getRole(req.user) !== 'chapterAdmin' ||
    !chapterID ||
    !getManagedChapterIDs(req.user).includes(chapterID)
  ) {
    throw new Forbidden(req.t)
  }
}

export const cancelEventRegistration = async ({
  registrationID,
  req,
}: {
  registrationID: number
  req: PayloadRequest
}): Promise<{ promoted: WaitlistEntry[]; registration: EventRegistration }> =>
  runInTransaction(req, async () => {
    await lockWorkflowRecord(req, 'event_registrations', registrationID)
    const registration = (await req.payload.findByID({
      collection: 'eventRegistrations',
      depth: 0,
      id: registrationID,
      overrideAccess: true,
      req,
    })) as EventRegistration
    const eventID = getRelationshipID(registration.event)
    if (!eventID) throw new AppError('Registration is not linked to an event.', { status: 409 })
    await lockWorkflowRecord(req, 'events', eventID)
    const event = (await req.payload.findByID({
      collection: 'events',
      depth: 0,
      id: eventID,
      overrideAccess: true,
      req,
    })) as Event
    assertCanManageEvent(req, event)
    if (registration.status === 'cancelled') return { promoted: [], registration }

    const orders = await req.payload.find({
      collection: 'orders',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      req,
      where: {
        and: [
          { eventRegistration: { equals: registration.id } },
          { status: { equals: 'pending' } },
        ],
      },
    })
    const order = orders.docs[0]
    if (order) {
      const attempts = await req.payload.find({
        collection: 'payments',
        depth: 0,
        limit: 1000,
        overrideAccess: true,
        pagination: false,
        req,
        where: { and: [{ order: { equals: order.id } }, { status: { equals: 'pending' } }] },
      })
      for (const attempt of attempts.docs) {
        await transitionWorkflowRecord({
          collection: 'payments',
          data: {
            rejectedAt: new Date().toISOString(),
            rejectionReason: 'Registration cancelled by an authorized event administrator.',
          },
          expectedStatus: 'pending',
          id: attempt.id,
          nextStatus: 'failed',
          req,
        })
      }
      await transitionWorkflowRecord({
        collection: 'orders',
        expectedStatus: 'pending',
        id: order.id,
        nextStatus: 'cancelled',
        req,
      })
    }
    const transition = await transitionWorkflowRecord({
      collection: 'eventRegistrations',
      expectedStatus: registration.status,
      id: registration.id,
      nextStatus: 'cancelled',
      req,
    })
    const promoted = await processWaitlistLocked(req, event, new Date())
    return {
      promoted,
      registration: transition.doc as unknown as EventRegistration,
    }
  })
