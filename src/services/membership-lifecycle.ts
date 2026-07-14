import type { PayloadRequest } from 'payload'

import { queueEmail } from '@/email/delivery'
import type { Membership } from '@/payload-types'
import { env } from '@/utilities/env'
import { getRelationshipID } from '@/utilities/relationships'

import { runInTransaction } from './transaction'
import { transitionWorkflowRecord } from './workflow-transitions'

export type MembershipLifecycleResult = {
  expired: number
  graceStarted: number
  remindersQueued: number
}

const DAY_MS = 86_400_000

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY_MS)

const dateLabel = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(date)

const findAll = async (
  req: PayloadRequest,
  status: Membership['status'],
): Promise<Membership[]> => {
  const docs: Membership[] = []
  let page = 1
  while (true) {
    const result = await req.payload.find({
      collection: 'memberships',
      depth: 0,
      limit: 100,
      overrideAccess: true,
      page,
      req,
      sort: 'id',
      where: { status: { equals: status } },
    })
    docs.push(...result.docs)
    if (!result.hasNextPage) break
    page += 1
  }
  return docs
}

const expireActiveMembership = async (
  membership: Membership,
  now: Date,
  req: PayloadRequest,
): Promise<'expired' | 'grace' | 'unchanged'> => {
  if (!membership.expiresAt || new Date(membership.expiresAt) > now) return 'unchanged'
  const graceEndsAt = addDays(
    new Date(membership.expiresAt),
    Math.max(0, membership.gracePeriodDaysSnapshot),
  )
  const useGrace = membership.gracePeriodDaysSnapshot > 0 && graceEndsAt > now

  await runInTransaction(req, async () => {
    await transitionWorkflowRecord({
      collection: 'memberships',
      data: { graceEndsAt: useGrace ? graceEndsAt.toISOString() : null },
      expectedStatus: 'active',
      id: membership.id,
      nextStatus: useGrace ? 'grace_period' : 'expired',
      req,
    })
  })
  return useGrace ? 'grace' : 'expired'
}

const expireGraceMembership = async (
  membership: Membership,
  now: Date,
  req: PayloadRequest,
): Promise<boolean> => {
  if (!membership.graceEndsAt || new Date(membership.graceEndsAt) > now) return false
  await runInTransaction(req, async () => {
    await transitionWorkflowRecord({
      collection: 'memberships',
      expectedStatus: 'grace_period',
      id: membership.id,
      nextStatus: 'expired',
      req,
    })
  })
  return true
}

const queueRenewalReminder = async (
  membership: Membership,
  now: Date,
  req: PayloadRequest,
): Promise<boolean> => {
  if (!membership.renewalReminderEnabledSnapshot || !membership.expiresAt) return false
  const expiration = new Date(membership.expiresAt)
  if (expiration <= now) return false
  const reminderStartsAt = addDays(expiration, -membership.renewalReminderDaysBeforeSnapshot)
  if (reminderStartsAt > now) return false
  const userID = getRelationshipID(membership.user)
  if (!userID) return false

  const result = await queueEmail(req.payload, {
    category: 'system',
    data: {
      actionUrl: `${env.NEXT_PUBLIC_SITE_URL}/membership/renew`,
      renewalDate: dateLabel(expiration),
    },
    deduplicationKey: `membership:${membership.id}:renewal:${membership.expiresAt}`,
    queue: 'reminders',
    required: false,
    template: 'membershipReminder',
    userID,
  })
  return result.queued
}

const queueGraceReminder = async (
  membership: Membership,
  now: Date,
  req: PayloadRequest,
): Promise<boolean> => {
  if (!membership.renewalReminderEnabledSnapshot || !membership.graceEndsAt) return false
  const graceEndsAt = new Date(membership.graceEndsAt)
  if (graceEndsAt <= now) return false
  const userID = getRelationshipID(membership.user)
  if (!userID) return false
  const result = await queueEmail(req.payload, {
    category: 'system',
    data: {
      action: { label: 'Renew membership', url: `${env.NEXT_PUBLIC_SITE_URL}/membership/renew` },
      message: `Your annual membership is in its grace period through ${dateLabel(graceEndsAt)}. Submit a new Zelle payment for approval before the grace period ends. The website will never debit you automatically.`,
      subject: 'Membership grace-period reminder',
      title: 'Renew before your grace period ends',
    },
    deduplicationKey: `membership:${membership.id}:grace:${membership.graceEndsAt}`,
    queue: 'reminders',
    required: false,
    template: 'systemNotice',
    userID,
  })
  return result.queued
}

export const processMembershipLifecycle = async ({
  now = new Date(),
  req,
}: {
  now?: Date
  req: PayloadRequest
}): Promise<MembershipLifecycleResult> => {
  const result: MembershipLifecycleResult = { expired: 0, graceStarted: 0, remindersQueued: 0 }
  const activeMemberships = await findAll(req, 'active')

  for (const membership of activeMemberships) {
    const transition = await expireActiveMembership(membership, now, req)
    if (transition === 'expired') result.expired += 1
    if (transition === 'grace') result.graceStarted += 1
    if (transition === 'unchanged' && (await queueRenewalReminder(membership, now, req))) {
      result.remindersQueued += 1
    }
  }

  const graceMemberships = await findAll(req, 'grace_period')
  for (const membership of graceMemberships) {
    if (await expireGraceMembership(membership, now, req)) {
      result.expired += 1
    } else if (await queueGraceReminder(membership, now, req)) {
      result.remindersQueued += 1
    }
  }

  return result
}
