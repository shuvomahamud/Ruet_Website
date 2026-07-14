import type { PayloadRequest } from 'payload'

import { isAdmin } from '@/access/roles'
import { queueEmail } from '@/email/delivery'
import type { EmailDelivery, Membership, NewsletterCampaign, User } from '@/payload-types'
import { AppError, toErrorMessage } from '@/utilities/errors'
import { env } from '@/utilities/env'
import { getRelationshipID } from '@/utilities/relationships'

import { writeAuditLog } from './audit'
import { lockWorkflowRecord, runInTransaction } from './transaction'

const RECOVERY_AFTER_MS = 15 * 60 * 1000

export type NewsletterDispatchResult = {
  campaign: NewsletterCampaign
  failed: number
  idempotent: boolean
  processing: boolean
  queued: number
  recipients: number
  suppressed: number
}

export type NewsletterLifecycleResult = {
  failedCampaigns: number
  processedCampaigns: number
  sentCampaigns: number
}

const assertAdmin = (req: PayloadRequest) => {
  if (!isAdmin(req.user)) {
    throw new AppError('Only administrators can manage newsletter campaigns.', {
      code: 'NEWSLETTER_ADMIN_REQUIRED',
      status: 403,
    })
  }
}

const sanitizeError = (error: unknown) =>
  toErrorMessage(error)
    .replace(/re_[A-Za-z0-9_-]+/g, '[redacted]')
    .replace(/Bearer\s+[^\s]+/gi, 'Bearer [redacted]')
    .slice(0, 500)

const updateCampaign = (
  req: PayloadRequest,
  id: number,
  data: Record<string, unknown>,
): Promise<NewsletterCampaign> =>
  req.payload.update({
    collection: 'newsletterCampaigns',
    context: { newsletterWorkflow: true },
    data: data as never,
    id,
    overrideAccess: true,
    req,
  })

const findCampaign = (req: PayloadRequest, id: number) =>
  req.payload.findByID({
    collection: 'newsletterCampaigns',
    depth: 0,
    id,
    overrideAccess: true,
    req,
  })

export const scheduleNewsletterCampaign = async ({
  campaignID,
  req,
  scheduledAt,
}: {
  campaignID: number
  req: PayloadRequest
  scheduledAt: Date
}): Promise<{ campaign: NewsletterCampaign; idempotent: boolean }> => {
  assertAdmin(req)
  if (!Number.isFinite(scheduledAt.getTime()) || scheduledAt <= new Date()) {
    throw new AppError('Choose a newsletter send time in the future.', {
      code: 'INVALID_NEWSLETTER_SCHEDULE',
      status: 400,
    })
  }

  return runInTransaction(req, async () => {
    await lockWorkflowRecord(req, 'newsletter_campaigns', campaignID)
    const current = await findCampaign(req, campaignID)
    if (current.status === 'sent' || current.status === 'sending') {
      throw new AppError('A sent or sending newsletter cannot be rescheduled.', {
        code: 'NEWSLETTER_ALREADY_DISPATCHED',
        status: 409,
      })
    }
    if (
      current.status === 'scheduled' &&
      current.scheduledAt === scheduledAt.toISOString()
    ) {
      return { campaign: current, idempotent: true }
    }
    if (!['draft', 'scheduled', 'cancelled'].includes(current.status)) {
      throw new AppError('Retry a failed campaign instead of scheduling it again.', {
        code: 'INVALID_NEWSLETTER_STATE',
        status: 409,
      })
    }

    const campaign = await updateCampaign(req, campaignID, {
      cancelledAt: null,
      failedCount: 0,
      lastActionBy: req.user?.id,
      queuedCount: 0,
      recipientCount: 0,
      scheduledAt: scheduledAt.toISOString(),
      sendError: null,
      sendStartedAt: null,
      sentAt: null,
      status: 'scheduled',
      suppressedCount: 0,
    })
    await writeAuditLog(req, {
      action: 'newsletter.schedule',
      afterStatus: 'scheduled',
      beforeStatus: current.status,
      entityID: campaignID,
      entityType: 'newsletterCampaign',
      metadata: { scheduledAt: scheduledAt.toISOString() },
      outcome: 'succeeded',
    })
    return { campaign, idempotent: false }
  })
}

export const cancelNewsletterCampaign = async ({
  campaignID,
  req,
}: {
  campaignID: number
  req: PayloadRequest
}): Promise<{ campaign: NewsletterCampaign; idempotent: boolean }> => {
  assertAdmin(req)
  return runInTransaction(req, async () => {
    await lockWorkflowRecord(req, 'newsletter_campaigns', campaignID)
    const current = await findCampaign(req, campaignID)
    if (current.status === 'cancelled') return { campaign: current, idempotent: true }
    if (current.status !== 'scheduled') {
      throw new AppError('Only a scheduled newsletter can be cancelled.', {
        code: 'NEWSLETTER_NOT_SCHEDULED',
        status: 409,
      })
    }
    const campaign = await updateCampaign(req, campaignID, {
      cancelledAt: new Date().toISOString(),
      lastActionBy: req.user?.id,
      status: 'cancelled',
    })
    await writeAuditLog(req, {
      action: 'newsletter.cancel',
      afterStatus: 'cancelled',
      beforeStatus: current.status,
      entityID: campaignID,
      entityType: 'newsletterCampaign',
      outcome: 'succeeded',
    })
    return { campaign, idempotent: false }
  })
}

const findMembershipUserIDs = async (req: PayloadRequest): Promise<Set<number>> => {
  const ids = new Set<number>()
  let page = 1
  while (true) {
    const result = await req.payload.find({
      collection: 'memberships',
      depth: 0,
      limit: 250,
      overrideAccess: true,
      page,
      req,
      where: { status: { in: ['active', 'grace_period'] } },
    })
    for (const membership of result.docs as Membership[]) {
      const userID = getRelationshipID(membership.user)
      if (userID) ids.add(userID)
    }
    if (!result.hasNextPage) break
    page += 1
  }
  return ids
}

const findRecipients = async (
  req: PayloadRequest,
  audience: NewsletterCampaign['audience'],
): Promise<User[]> => {
  const memberIDs = audience === 'members' ? await findMembershipUserIDs(req) : undefined
  if (memberIDs && !memberIDs.size) return []

  const users: User[] = []
  let page = 1
  while (true) {
    const result = await req.payload.find({
      collection: 'users',
      depth: 0,
      limit: 250,
      overrideAccess: true,
      page,
      req,
      sort: 'id',
      where: {
        and: [
          { accountStatus: { equals: 'active' } },
          { _verified: { equals: true } },
          ...(memberIDs ? [{ id: { in: [...memberIDs] } }] : []),
        ],
      },
    })
    users.push(...result.docs)
    if (!result.hasNextPage) break
    page += 1
  }
  return users
}

const claimCampaign = async ({
  campaignID,
  now,
  req,
  system,
}: {
  campaignID: number
  now: Date
  req: PayloadRequest
  system: boolean
}): Promise<{ campaign: NewsletterCampaign; idempotent: boolean; processing: boolean }> =>
  runInTransaction(req, async () => {
    await lockWorkflowRecord(req, 'newsletter_campaigns', campaignID)
    const current = await findCampaign(req, campaignID)
    if (current.status === 'sent') {
      return { campaign: current, idempotent: true, processing: false }
    }
    if (current.status === 'cancelled') {
      throw new AppError('A cancelled newsletter cannot be sent.', {
        code: 'NEWSLETTER_CANCELLED',
        status: 409,
      })
    }
    if (system && current.status === 'scheduled') {
      if (!current.scheduledAt || new Date(current.scheduledAt) > now) {
        throw new AppError('The newsletter is not due yet.', {
          code: 'NEWSLETTER_NOT_DUE',
          status: 409,
        })
      }
    }
    if (current.status === 'sending') {
      const startedAt = current.sendStartedAt ? new Date(current.sendStartedAt) : now
      if (now.getTime() - startedAt.getTime() < RECOVERY_AFTER_MS) {
        return { campaign: current, idempotent: true, processing: true }
      }
    }
    const allowed = system
      ? ['scheduled', 'sending']
      : ['draft', 'scheduled', 'failed', 'sending']
    if (!allowed.includes(current.status)) {
      throw new AppError('The newsletter is not in a sendable state.', {
        code: 'INVALID_NEWSLETTER_STATE',
        status: 409,
      })
    }
    const campaign = await updateCampaign(req, campaignID, {
      failedCount: 0,
      lastActionBy: req.user?.id ?? current.lastActionBy,
      queuedCount: 0,
      recipientCount: 0,
      sendError: null,
      sendStartedAt: now.toISOString(),
      status: 'sending',
      suppressedCount: 0,
    })
    return { campaign, idempotent: false, processing: true }
  })

export const sendNewsletterCampaign = async ({
  campaignID,
  now = new Date(),
  req,
  system = false,
}: {
  campaignID: number
  now?: Date
  req: PayloadRequest
  system?: boolean
}): Promise<NewsletterDispatchResult> => {
  if (!system) assertAdmin(req)
  const claim = await claimCampaign({ campaignID, now, req, system })
  if (claim.idempotent) {
    return {
      campaign: claim.campaign,
      failed: claim.campaign.failedCount ?? 0,
      idempotent: true,
      processing: claim.processing,
      queued: claim.campaign.queuedCount ?? 0,
      recipients: claim.campaign.recipientCount ?? 0,
      suppressed: claim.campaign.suppressedCount ?? 0,
    }
  }

  const recipients = await findRecipients(req, claim.campaign.audience)
  let queued = 0
  let suppressed = 0
  let failed = 0
  const errors: string[] = []
  for (const user of recipients) {
    try {
      const result = await queueEmail(req.payload, {
        campaignID,
        category: 'newsletter',
        data: {
          body: claim.campaign.body,
          subject: claim.campaign.subject,
          title: claim.campaign.title,
          unsubscribeUrl: `${env.NEXT_PUBLIC_SITE_URL}/communications/preferences?source=newsletter`,
        },
        deduplicationKey: `newsletter:${campaignID}:user:${user.id}`,
        queue: 'newsletters',
        template: 'newsletter',
        userID: user.id,
      })
      if (result.delivery.status === 'suppressed') suppressed += 1
      else queued += 1
    } catch (error) {
      failed += 1
      errors.push(sanitizeError(error))
    }
  }

  const finalStatus = failed ? 'failed' : 'sent'
  const campaign = await updateCampaign(req, campaignID, {
    failedCount: failed,
    queuedCount: queued,
    recipientCount: recipients.length,
    sendError: errors.length ? [...new Set(errors)].join(' | ').slice(0, 500) : null,
    sentAt: failed ? null : now.toISOString(),
    status: finalStatus,
    suppressedCount: suppressed,
  })
  await writeAuditLog(req, {
    action: failed ? 'newsletter.dispatch_failed' : 'newsletter.dispatch',
    afterStatus: finalStatus,
    beforeStatus: claim.campaign.status,
    entityID: campaignID,
    entityType: 'newsletterCampaign',
    metadata: { failed, queued, recipients: recipients.length, suppressed },
    outcome: failed ? 'rejected' : 'succeeded',
  })
  return {
    campaign,
    failed,
    idempotent: false,
    processing: false,
    queued,
    recipients: recipients.length,
    suppressed,
  }
}

export const processNewsletterLifecycle = async ({
  now = new Date(),
  req,
}: {
  now?: Date
  req: PayloadRequest
}): Promise<NewsletterLifecycleResult> => {
  const staleBefore = new Date(now.getTime() - RECOVERY_AFTER_MS).toISOString()
  const due = await req.payload.find({
    collection: 'newsletterCampaigns',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    req,
    sort: 'scheduledAt',
    where: {
      or: [
        {
          and: [
            { status: { equals: 'scheduled' } },
            { scheduledAt: { less_than_equal: now.toISOString() } },
          ],
        },
        {
          and: [
            { status: { equals: 'sending' } },
            { sendStartedAt: { less_than_equal: staleBefore } },
          ],
        },
      ],
    },
  })

  let sentCampaigns = 0
  let failedCampaigns = 0
  for (const campaign of due.docs) {
    try {
      const result = await sendNewsletterCampaign({ campaignID: campaign.id, now, req, system: true })
      if (result.failed) failedCampaigns += 1
      else if (!result.processing) sentCampaigns += 1
    } catch (error) {
      failedCampaigns += 1
      req.payload.logger.error({
        err: error,
        msg: `Newsletter campaign ${campaign.id} could not be dispatched.`,
      })
    }
  }
  return { failedCampaigns, processedCampaigns: due.docs.length, sentCampaigns }
}

export const getNewsletterDeliverySummary = async (
  req: PayloadRequest,
  campaignID: number,
): Promise<Record<EmailDelivery['status'], number>> => {
  const counts: Record<EmailDelivery['status'], number> = {
    failed: 0,
    processing: 0,
    queued: 0,
    sent: 0,
    suppressed: 0,
  }
  let page = 1
  while (true) {
    const result = await req.payload.find({
      collection: 'emailDeliveries',
      depth: 0,
      limit: 250,
      overrideAccess: true,
      page,
      req,
      where: { campaign: { equals: campaignID } },
    })
    for (const delivery of result.docs) counts[delivery.status] += 1
    if (!result.hasNextPage) break
    page += 1
  }
  return counts
}
