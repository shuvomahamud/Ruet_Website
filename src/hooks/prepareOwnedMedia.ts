import type { CollectionBeforeChangeHook } from 'payload'
import { Forbidden } from 'payload'

import { getManagedChapterIDs, getRole, isAdmin } from '@/access/roles'
import { getRelationshipID } from '@/utilities/relationships'

export const prepareOwnedMedia: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (operation === 'create' && req.user?.id) {
    data.owner = Number(req.user.id)
  }

  if (isAdmin(req.user) || getRole(req.user) !== 'chapterAdmin') return data

  const chapterID = getRelationshipID(data.chapter ?? originalDoc?.chapter)
  if (!chapterID || !getManagedChapterIDs(req.user).includes(chapterID)) {
    throw new Forbidden(req.t)
  }

  return data
}

export const preparePaymentProof: CollectionBeforeChangeHook = ({ data, operation, req }) => {
  if (operation !== 'create' || !req.user?.id) return data

  return {
    ...data,
    chapter: getRelationshipID(req.user.primaryChapter),
    owner: Number(req.user.id),
  }
}
