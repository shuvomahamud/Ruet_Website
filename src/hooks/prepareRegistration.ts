import type { CollectionBeforeChangeHook } from 'payload'

import { AppError } from '@/utilities/errors'
import { getRelationshipID } from '@/utilities/relationships'

export const prepareEventRegistration: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create' || !req.user?.id) return data

  if (req.context?.eventWorkflowValidated === true) {
    return { ...data, user: Number(req.user.id) }
  }

  const eventID = getRelationshipID(data.event)
  const quantity = data.quantity ?? 1

  if (!eventID) {
    throw new AppError('Select a valid event.', { code: 'INVALID_EVENT', status: 400 })
  }
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
    throw new AppError('Registration quantity must be a positive whole number.', {
      code: 'INVALID_QUANTITY',
      status: 400,
    })
  }

  const event = await req.payload.findByID({
    collection: 'events',
    id: eventID,
    overrideAccess: false,
    req,
  })

  if (new Date(event.endAt) <= new Date()) {
    throw new AppError('Registration is closed for this event.', {
      code: 'REGISTRATION_CLOSED',
      status: 409,
    })
  }
  const maximumQuantity = event.maxRegistrationQuantity ?? 1
  if (quantity > maximumQuantity) {
    throw new AppError(`Registration quantity cannot exceed ${maximumQuantity}.`, {
      code: 'QUANTITY_LIMIT_EXCEEDED',
      status: 409,
    })
  }

  const duplicate = await req.payload.find({
    collection: 'eventRegistrations',
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      and: [
        { event: { equals: eventID } },
        { user: { equals: Number(req.user.id) } },
        { status: { not_equals: 'cancelled' } },
      ],
    },
  })

  if (duplicate.totalDocs > 0) {
    throw new AppError('An active registration already exists for this event.', {
      code: 'DUPLICATE_REGISTRATION',
      status: 409,
    })
  }

  const price = event.isPaid ? (event.basePrice ?? 0) : 0
  const chapter =
    typeof event.chapter === 'object'
      ? event.chapter
      : await req.payload.findByID({
          collection: 'chapters',
          depth: 0,
          id: event.chapter,
          overrideAccess: true,
          req,
        })

  return {
    ...data,
    chapterNameSnapshot: chapter.name,
    currencySnapshot: event.currency,
    discountSnapshot: 0,
    eventStartAtSnapshot: event.startAt,
    eventTitleSnapshot: event.title,
    order: undefined,
    paymentStatus: event.isPaid ? 'pending' : undefined,
    quantity,
    registrationPriceSnapshot: price * quantity,
    status: 'pending',
    unitPriceSnapshot: price,
    user: Number(req.user.id),
  }
}

export const prepareWaitlistEntry: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation !== 'create' || !req.user?.id) return data

  if (req.context?.eventWorkflowValidated === true) {
    return { ...data, user: Number(req.user.id) }
  }

  const eventID = getRelationshipID(data.event)
  const quantity = data.quantity ?? 1

  if (!eventID) {
    throw new AppError('Select a valid event.', { code: 'INVALID_EVENT', status: 400 })
  }
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
    throw new AppError('Waitlist quantity must be a positive whole number.', {
      code: 'INVALID_QUANTITY',
      status: 400,
    })
  }

  const event = await req.payload.findByID({
    collection: 'events',
    id: eventID,
    overrideAccess: false,
    req,
  })

  if (!event.waitlistEnabled || new Date(event.endAt) <= new Date()) {
    throw new AppError('The waitlist is not available for this event.', {
      code: 'WAITLIST_CLOSED',
      status: 409,
    })
  }
  const maximumQuantity = event.maxRegistrationQuantity ?? 1
  if (quantity > maximumQuantity) {
    throw new AppError(`Waitlist quantity cannot exceed ${maximumQuantity}.`, {
      code: 'QUANTITY_LIMIT_EXCEEDED',
      status: 409,
    })
  }

  const duplicate = await req.payload.find({
    collection: 'waitlistEntries',
    limit: 1,
    overrideAccess: true,
    req,
    where: {
      and: [
        { event: { equals: eventID } },
        { user: { equals: Number(req.user.id) } },
        { status: { in: ['waiting', 'promoted'] } },
      ],
    },
  })

  if (duplicate.totalDocs > 0) {
    throw new AppError('An active waitlist entry already exists for this event.', {
      code: 'DUPLICATE_WAITLIST_ENTRY',
      status: 409,
    })
  }

  return {
    ...data,
    joinedAt: new Date().toISOString(),
    promotedAt: undefined,
    promotionExpiryAt: undefined,
    quantity,
    status: 'waiting',
    user: Number(req.user.id),
  }
}
