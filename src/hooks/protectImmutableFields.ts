import type { CollectionBeforeChangeHook } from 'payload'

import { AppError } from '@/utilities/errors'

const relationshipID = (value: unknown): unknown => {
  if (value && typeof value === 'object' && 'id' in value) {
    return relationshipID((value as { id?: unknown }).id)
  }
  return value
}

const isSameValue = (left: unknown, right: unknown): boolean =>
  JSON.stringify(relationshipID(left)) === JSON.stringify(relationshipID(right))

export const protectImmutableFields =
  (fieldNames: string[]): CollectionBeforeChangeHook =>
  ({ data, operation, originalDoc }) => {
    if (operation !== 'update' || !originalDoc) return data

    for (const fieldName of fieldNames) {
      if (fieldName in data && !isSameValue(data[fieldName], originalDoc[fieldName])) {
        throw new AppError(`${fieldName} is an immutable audit field.`, {
          code: 'IMMUTABLE_AUDIT_FIELD',
          status: 409,
        })
      }
    }

    return data
  }
