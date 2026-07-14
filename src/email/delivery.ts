import type { Payload, PayloadRequest } from 'payload'

import type { EmailDelivery, User } from '@/payload-types'
import { toErrorMessage } from '@/utilities/errors'
import { getRelationshipID } from '@/utilities/relationships'

import type { EmailSendResult } from './adapter'
import type { EmailTemplateData, EmailTemplateSlug, RenderedEmail } from './templates'
import { renderEmailTemplate } from './templates'

export const emailQueues = ['transactional', 'reminders', 'waitlist', 'newsletters'] as const
export type EmailQueue = (typeof emailQueues)[number]
export type EmailCategory = 'system' | 'announcement' | 'newsletter'

export type DeliverEmailTaskInput = {
  deliveryID: number
  html: string
  text: string
}

export type DeliverEmailTaskOutput = {
  deliveryID: number
  status: 'sent' | 'deduplicated' | 'suppressed'
}

type QueueEmailInput<Template extends EmailTemplateSlug> = {
  campaignID?: number
  category: EmailCategory
  data: EmailTemplateData[Template]
  deduplicationKey: string
  queue?: EmailQueue
  required?: boolean
  scheduledFor?: Date
  template: Template
  to?: string
  userID?: number
}

type QueueEmailResult = {
  deduplicated: boolean
  delivery: EmailDelivery
  queued: boolean
}

const sanitizeError = (error: unknown) =>
  toErrorMessage(error)
    .replace(/re_[A-Za-z0-9_-]+/g, '[redacted]')
    .replace(/Bearer\s+[^\s]+/gi, 'Bearer [redacted]')
    .slice(0, 500)

const getUser = async (payload: Payload, userID?: number): Promise<User | undefined> => {
  if (!userID) return undefined
  return payload.findByID({ collection: 'users', depth: 0, id: userID, overrideAccess: true })
}

export const shouldDeliverEmail = ({
  category,
  required,
  user,
}: {
  category: EmailCategory
  required: boolean
  user?: Pick<User, 'accountStatus' | 'communicationPreferences'>
}) => {
  if (category === 'system' && required) return { deliver: true as const }
  if (user?.accountStatus === 'deleted') {
    return { deliver: false as const, reason: 'Deleted accounts do not receive optional email.' }
  }
  const preferences = user?.communicationPreferences
  if (category === 'announcement' && preferences?.allowAnnouncements === false) {
    return { deliver: false as const, reason: 'Announcement preference is disabled.' }
  }
  if (category === 'newsletter' && preferences?.allowNewsletters === false) {
    return { deliver: false as const, reason: 'Newsletter preference is disabled.' }
  }
  if (category === 'system' && preferences?.allowSystemEmails === false) {
    return { deliver: false as const, reason: 'Optional system reminder preference is disabled.' }
  }
  return { deliver: true as const }
}

const findDelivery = async (payload: Payload, deduplicationKey: string) => {
  const result = await payload.find({
    collection: 'emailDeliveries',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { deduplicationKey: { equals: deduplicationKey } },
  })
  return result.docs[0]
}

const createDelivery = async ({
  payload,
  rendered,
  input,
  user,
  status,
  suppressedReason,
}: {
  input: QueueEmailInput<EmailTemplateSlug>
  payload: Payload
  rendered: RenderedEmail
  status: EmailDelivery['status']
  suppressedReason?: string
  user?: User
}) =>
  payload.create({
    collection: 'emailDeliveries',
    data: {
      attempts: 0,
      campaign: input.campaignID,
      category: input.category,
      deduplicationKey: input.deduplicationKey,
      queue: input.queue ?? 'transactional',
      recipient: input.to ?? user?.email ?? '',
      required: input.category === 'system' && input.required === true,
      scheduledFor: input.scheduledFor?.toISOString(),
      status,
      subject: rendered.subject,
      suppressedReason,
      template: rendered.template,
      user: user?.id,
    },
    overrideAccess: true,
  })

export const queueEmail = async <Template extends EmailTemplateSlug>(
  payload: Payload,
  input: QueueEmailInput<Template>,
): Promise<QueueEmailResult> => {
  const existing = await findDelivery(payload, input.deduplicationKey)
  if (existing) {
    if (existing.status !== 'failed' || existing.jobId) {
      return { deduplicated: true, delivery: existing, queued: false }
    }

    // A delivery audit can exist without a job when the queue write failed after the unique
    // audit insert. Retrying the same semantic key repairs that partial failure in place.
    const user = await getUser(payload, input.userID)
    const recipient = input.to ?? user?.email
    if (!recipient) throw new Error('Email delivery requires a recipient or user ID.')
    const required = input.category === 'system' && input.required === true
    const preference = shouldDeliverEmail({ category: input.category, required, user })
    const rendered = renderEmailTemplate(input.template, input.data)
    if (!preference.deliver) {
      const suppressed = await payload.update({
        collection: 'emailDeliveries',
        data: {
          errorMessage: null,
          status: 'suppressed',
          suppressedReason: preference.reason,
        },
        id: existing.id,
        overrideAccess: true,
      })
      return { deduplicated: false, delivery: suppressed, queued: false }
    }

    try {
      const job = await payload.jobs.queue({
        input: { deliveryID: existing.id, html: rendered.html, text: rendered.text },
        queue: input.queue ?? 'transactional',
        task: 'deliverEmail',
        waitUntil: input.scheduledFor,
      })
      const repaired = await payload.update({
        collection: 'emailDeliveries',
        data: {
          errorMessage: null,
          jobId: String(job.id),
          status: 'queued',
          suppressedReason: null,
        },
        id: existing.id,
        overrideAccess: true,
      })
      return { deduplicated: false, delivery: repaired, queued: true }
    } catch (error) {
      await payload.update({
        collection: 'emailDeliveries',
        data: { errorMessage: sanitizeError(error), status: 'failed' },
        id: existing.id,
        overrideAccess: true,
      })
      throw error
    }
  }

  const user = await getUser(payload, input.userID)
  const recipient = input.to ?? user?.email
  if (!recipient) throw new Error('Email delivery requires a recipient or user ID.')
  const required = input.category === 'system' && input.required === true
  const preference = shouldDeliverEmail({ category: input.category, required, user })
  const rendered = renderEmailTemplate(input.template, input.data)

  let delivery: EmailDelivery
  try {
    delivery = await createDelivery({
      input: { ...input, to: recipient } as QueueEmailInput<EmailTemplateSlug>,
      payload,
      rendered,
      status: preference.deliver ? 'queued' : 'suppressed',
      suppressedReason: preference.deliver ? undefined : preference.reason,
      user,
    })
  } catch (error) {
    const concurrent = await findDelivery(payload, input.deduplicationKey)
    if (concurrent) return { deduplicated: true, delivery: concurrent, queued: false }
    throw error
  }

  if (!preference.deliver) return { deduplicated: false, delivery, queued: false }

  try {
    const job = await payload.jobs.queue({
      input: { deliveryID: delivery.id, html: rendered.html, text: rendered.text },
      queue: input.queue ?? 'transactional',
      task: 'deliverEmail',
      waitUntil: input.scheduledFor,
    })
    delivery = await payload.update({
      collection: 'emailDeliveries',
      data: { jobId: String(job.id) },
      id: delivery.id,
      overrideAccess: true,
    })
    return { deduplicated: false, delivery, queued: true }
  } catch (error) {
    await payload.update({
      collection: 'emailDeliveries',
      data: { errorMessage: sanitizeError(error), status: 'failed' },
      id: delivery.id,
      overrideAccess: true,
    })
    throw error
  }
}

export const executeEmailDelivery = async ({
  input,
  payload,
  req,
  sendEmail = payload.sendEmail.bind(payload),
}: {
  input: DeliverEmailTaskInput
  payload: Payload
  req?: PayloadRequest
  sendEmail?: Payload['sendEmail']
}): Promise<DeliverEmailTaskOutput> => {
  let delivery = await payload.findByID({
    collection: 'emailDeliveries',
    depth: 0,
    id: input.deliveryID,
    overrideAccess: true,
    req,
  })
  if (delivery.status === 'sent') {
    return { deliveryID: delivery.id, status: 'deduplicated' }
  }
  if (delivery.status === 'suppressed') {
    return { deliveryID: delivery.id, status: 'suppressed' }
  }

  const attemptedAt = new Date().toISOString()
  delivery = await payload.update({
    collection: 'emailDeliveries',
    data: {
      attempts: delivery.attempts + 1,
      errorMessage: null,
      lastAttemptAt: attemptedAt,
      status: 'processing',
    },
    id: delivery.id,
    overrideAccess: true,
    req,
  })

  try {
    const result = (await sendEmail({
      headers: { 'X-RUETIAN-Idempotency-Key': delivery.deduplicationKey },
      html: input.html,
      subject: delivery.subject,
      text: input.text,
      to: delivery.recipient,
    })) as EmailSendResult
    await payload.update({
      collection: 'emailDeliveries',
      data: {
        errorMessage: null,
        provider: result.transport,
        providerMessageId: result.id,
        sentAt: new Date().toISOString(),
        status: 'sent',
      },
      id: delivery.id,
      overrideAccess: true,
      req,
    })
    return { deliveryID: delivery.id, status: 'sent' }
  } catch (error) {
    await payload.update({
      collection: 'emailDeliveries',
      data: { errorMessage: sanitizeError(error), status: 'failed' },
      id: delivery.id,
      overrideAccess: true,
      req,
    })
    throw error
  }
}

export const relatedUserID = (delivery: EmailDelivery) => getRelationshipID(delivery.user)
