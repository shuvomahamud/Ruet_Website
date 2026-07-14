import type { Access, Where } from 'payload'

import { getManagedChapterIDs, getRole, isAdmin } from '@/access/roles'
import { getRelationshipID } from '@/utilities/relationships'

const activeWindow = (now: string): Where[] => [
  { or: [{ activeFrom: { exists: false } }, { activeFrom: { less_than_equal: now } }] },
  { or: [{ activeTo: { exists: false } }, { activeTo: { greater_than_equal: now } }] },
]

/**
 * Public notices are readable while active. Member-only chapter notices are limited to the
 * member's primary chapter, while site-wide member notices apply to every signed-in member.
 * Chapter admins additionally retain management visibility for their assigned chapter records.
 */
export const announcementReadAccess: Access = ({ req: { user } }) => {
  if (isAdmin(user)) return true

  const now = new Date().toISOString()
  const clauses: Where[] = [
    {
      and: [
        { _status: { equals: 'published' } },
        { audience: { equals: 'public' } },
        ...activeWindow(now),
      ],
    },
  ]

  if (user?.id) {
    const primaryChapterID = getRelationshipID(user.primaryChapter)
    clauses.push({
      and: [
        { _status: { equals: 'published' } },
        { audience: { equals: 'members' } },
        ...activeWindow(now),
        {
          or: [
            { chapter: { exists: false } },
            ...(primaryChapterID ? [{ chapter: { equals: primaryChapterID } }] : []),
          ],
        },
      ],
    })
  }

  if (getRole(user) === 'chapterAdmin') {
    const managedChapterIDs = getManagedChapterIDs(user)
    if (managedChapterIDs.length) clauses.push({ chapter: { in: managedChapterIDs } })
  }

  return { or: clauses }
}

