import type { CollectionBeforeChangeHook } from 'payload'
import { Forbidden } from 'payload'

export const forceAuthenticatedUser =
  (fieldName = 'user'): CollectionBeforeChangeHook =>
  ({ data, operation, req }) => {
    if (operation !== 'create') return data

    if (!req.user?.id) {
      throw new Forbidden(req.t)
    }

    return {
      ...data,
      [fieldName]: Number(req.user.id),
    }
  }
