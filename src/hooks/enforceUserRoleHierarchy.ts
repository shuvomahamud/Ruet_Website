import type { CollectionBeforeChangeHook } from 'payload'
import { Forbidden } from 'payload'

import { getRole } from '@/access/roles'

export const enforceUserRoleHierarchy: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  req,
}) => {
  if (req.context?.seedTestUser === true && process.env.NODE_ENV !== 'production') return data

  const actorRole = getRole(req.user)
  const requestedRole = typeof data.role === 'string' ? data.role : undefined
  const originalRole = typeof originalDoc?.role === 'string' ? originalDoc.role : undefined

  if (actorRole === 'superAdmin') return data

  const isFirstUserRegistration = new URL(req.url ?? '/', 'http://payload.local').pathname.endsWith(
    '/first-register',
  )
  if (requestedRole === 'superAdmin' && isFirstUserRegistration) return data

  if (originalRole === 'superAdmin') {
    throw new Forbidden(req.t)
  }

  if (requestedRole && !['member', 'chapterAdmin'].includes(requestedRole)) {
    throw new Forbidden(req.t)
  }

  return data
}
