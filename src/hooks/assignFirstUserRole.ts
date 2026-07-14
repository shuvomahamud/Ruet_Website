import type { CollectionBeforeChangeHook } from 'payload'

import { isAdmin } from '@/access/roles'

export const assignFirstUserRole: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== 'create') return data

  const usersCount = await req.payload.count({
    collection: 'users',
  })

  const isFirstUserRegistration = new URL(req.url ?? '/', 'http://payload.local').pathname.endsWith(
    '/first-register',
  )

  if (usersCount.totalDocs === 0 && isFirstUserRegistration) {
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
    role: data?.role ?? 'member',
  }
}
