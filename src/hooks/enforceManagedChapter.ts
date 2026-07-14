import type { CollectionBeforeChangeHook } from 'payload'
import { Forbidden } from 'payload'

import { getManagedChapterIDs, getRole, isAdmin } from '@/access/roles'

const normalizeChapterID = (
  value: number | string | { id?: number | string } | null | undefined,
): number | undefined => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  if (value && typeof value === 'object' && value.id !== undefined) return normalizeChapterID(value.id)
  return undefined
}

export const enforceManagedChapter =
  (fieldName = 'chapter'): CollectionBeforeChangeHook =>
  ({ data, originalDoc, req }) => {
    if (isAdmin(req.user)) return data

    if (getRole(req.user) !== 'chapterAdmin') return data

    const managedChapterIDs = getManagedChapterIDs(req.user)
    const targetChapterID = normalizeChapterID(
      (data?.[fieldName] as number | string | { id?: number | string } | null | undefined) ??
        (originalDoc?.[fieldName] as number | string | { id?: number | string } | null | undefined),
    )

    if (!targetChapterID || !managedChapterIDs.includes(targetChapterID)) {
      throw new Forbidden(req.t)
    }

    return data
  }
