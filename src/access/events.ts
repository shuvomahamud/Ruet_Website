import type { FieldAccess } from 'payload'

import { getManagedChapterIDs, getRole, isAdmin } from '@/access/roles'
import { getRelationshipID } from '@/utilities/relationships'

/** Prevent private meeting links from leaking through REST, GraphQL, or Local API reads. */
export const eventVirtualLinkReadAccess: FieldAccess = async ({ doc, req, siblingData }) => {
  const visibility =
    (siblingData?.virtualAccessVisibility as string | undefined) ??
    (doc?.virtualAccessVisibility as string | undefined)
  if (visibility === 'public') return true
  if (!req.user?.id) return false
  if (isAdmin(req.user)) return true

  const chapterID = getRelationshipID(
    (siblingData?.chapter ?? doc?.chapter) as number | { id?: number } | null,
  )
  if (
    getRole(req.user) === 'chapterAdmin' &&
    chapterID &&
    getManagedChapterIDs(req.user).includes(chapterID)
  ) {
    return true
  }

  const eventID = typeof doc?.id === 'number' ? doc.id : Number(doc?.id)
  if (!Number.isFinite(eventID)) return false
  const registration = await req.payload.find({
    collection: 'eventRegistrations',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    where: {
      and: [
        { event: { equals: eventID } },
        { user: { equals: Number(req.user.id) } },
        { status: { equals: 'confirmed' } },
      ],
    },
  })
  return registration.docs.length > 0
}
