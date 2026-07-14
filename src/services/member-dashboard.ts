import type { Payload } from 'payload'

import type {
  Announcement,
  Chapter,
  EventRegistration,
  Membership,
  Payment,
  User,
  WaitlistEntry,
} from '@/payload-types'
import { getRelationshipID } from '@/utilities/relationships'
import { getActiveAnnouncements } from '@/utilities/payload-public'

export type MemberDashboardData = {
  announcements: Announcement[]
  chapter?: Chapter
  membership?: Membership
  payments: Payment[]
  registrations: EventRegistration[]
  waitlist: WaitlistEntry[]
}

export const getMemberDashboardData = async ({
  now = new Date(),
  payload,
  user,
}: {
  now?: Date
  payload: Payload
  user: User
}): Promise<MemberDashboardData> => {
  const [memberships, registrations, payments, waitlist, announcements] = await Promise.all([
    payload.find({
      collection: 'memberships',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      sort: '-createdAt',
      user,
      where: { user: { equals: user.id } },
    }),
    payload.find({
      collection: 'eventRegistrations',
      depth: 1,
      limit: 5,
      overrideAccess: false,
      pagination: false,
      sort: 'eventStartAtSnapshot',
      user,
      where: {
        and: [
          { user: { equals: user.id } },
          { eventStartAtSnapshot: { greater_than_equal: now.toISOString() } },
          { status: { in: ['pending', 'confirmed'] } },
        ],
      },
    }),
    payload.find({
      collection: 'payments',
      depth: 1,
      limit: 5,
      overrideAccess: false,
      pagination: false,
      sort: '-submittedAt',
      user,
      where: { user: { equals: user.id } },
    }),
    payload.find({
      collection: 'waitlistEntries',
      depth: 1,
      limit: 3,
      overrideAccess: false,
      pagination: false,
      sort: '-joinedAt',
      user,
      where: {
        and: [
          { user: { equals: user.id } },
          { status: { in: ['waiting', 'promoted'] } },
        ],
      },
    }),
    getActiveAnnouncements({ limit: 3, scope: 'all', user }),
  ])

  const chapterID = getRelationshipID(user.primaryChapter)
  let chapter: Chapter | undefined
  if (chapterID) {
    try {
      chapter = await payload.findByID({
        collection: 'chapters',
        depth: 0,
        id: chapterID,
        overrideAccess: true,
      })
    } catch {
      chapter = undefined
    }
  }

  return {
    announcements,
    chapter,
    membership: memberships.docs[0],
    payments: payments.docs,
    registrations: registrations.docs,
    waitlist: waitlist.docs,
  }
}

export const getMembershipDashboardAction = (membership?: Membership) => {
  if (!membership) return { href: '/membership/join', label: 'Join membership' }
  if (['active', 'grace_period'].includes(membership.status)) {
    return { href: '/membership/renew', label: 'Renew membership' }
  }
  if (membership.status === 'expired') {
    return { href: '/membership/renew', label: 'Reactivate membership' }
  }
  if (membership.status === 'failed_manual_payment') {
    return { href: '/membership/renew', label: 'Resubmit Zelle proof' }
  }
  if (['pending_payment', 'pending_manual_approval'].includes(membership.status)) {
    return { href: '/membership/status', label: 'View pending membership' }
  }
  return { href: '/contact', label: 'Contact membership support' }
}

