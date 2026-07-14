import type { CollectionBeforeChangeHook } from 'payload'

import { AppError } from '@/utilities/errors'

const workflowFields = [
  'cancelledAt',
  'failedCount',
  'lastActionBy',
  'queuedCount',
  'recipientCount',
  'scheduledAt',
  'sendError',
  'sendStartedAt',
  'sentAt',
  'status',
  'suppressedCount',
] as const

export const prepareNewsletterCampaign: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (req.context?.newsletterWorkflow === true) return data

  if (operation === 'create') {
    const cleaned = { ...data }
    for (const field of workflowFields) delete cleaned[field]
    return {
      ...cleaned,
      createdBy: req.user?.id,
      failedCount: 0,
      queuedCount: 0,
      recipientCount: 0,
      status: 'draft',
      suppressedCount: 0,
    }
  }

  if (originalDoc?.status !== 'draft') {
    throw new AppError('Only draft newsletter content can be edited. Use the campaign actions.', {
      code: 'NEWSLETTER_CONTENT_LOCKED',
      status: 409,
    })
  }

  return data
}

