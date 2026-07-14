import type { CollectionBeforeChangeHook } from 'payload'

import { AppError } from '@/utilities/errors'
import { getRelationshipID } from '@/utilities/relationships'

export const validateUserChapter: CollectionBeforeChangeHook = async ({ data, req }) => {
  if (
    !('primaryChapter' in data) ||
    data.primaryChapter === null ||
    data.primaryChapter === undefined
  ) {
    return data
  }

  const chapterID = getRelationshipID(data.primaryChapter)
  if (!chapterID) {
    throw new AppError('Select a valid primary chapter.', {
      code: 'INVALID_PRIMARY_CHAPTER',
      status: 400,
    })
  }

  const chapter = await req.payload.findByID({
    collection: 'chapters',
    depth: 0,
    id: chapterID,
    overrideAccess: true,
    req,
  })

  if (chapter.chapterStatus !== 'active' || chapter._status !== 'published') {
    throw new AppError('The selected primary chapter is not active and published.', {
      code: 'INACTIVE_PRIMARY_CHAPTER',
      status: 409,
    })
  }

  return data
}
