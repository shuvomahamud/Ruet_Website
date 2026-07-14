import type { CollectionBeforeChangeHook } from 'payload'

import { getRole, isAdmin } from '@/access/roles'

export const assignFirstUserRole: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data

  const usersCount = await req.payload.count({
    collection: 'users',
  })

  if (usersCount.totalDocs === 0) {
    return {
      ...data,
      accountStatus: 'active',
      role: 'superAdmin',
    }
  }

  if (!isAdmin(req.user)) {
    return {
      ...data,
      accountStatus: data?.accountStatus ?? 'active',
      managedChapters: [],
      role: 'member',
    }
  }

  return {
    ...data,
    accountStatus: data?.accountStatus ?? 'active',
    role: data?.role ?? getRole(req.user) ?? 'member',
  }
}
