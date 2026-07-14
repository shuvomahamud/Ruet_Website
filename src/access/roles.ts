import type { Access, FieldAccess, Where } from 'payload'

import type { UserRole } from '@/types/app'

const elevatedRoles: UserRole[] = ['chapterAdmin', 'admin', 'superAdmin']
const adminRoles: UserRole[] = ['admin', 'superAdmin']

type AuthUserLike = {
  id?: number | string
  managedChapters?: Array<number | { id?: number | string } | null> | null
  primaryChapter?: number | { id?: number | string } | null
  role?: UserRole | null
}

const normalizeID = (value: number | string | { id?: number | string } | null | undefined) => {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  if (value && typeof value === 'object' && value.id !== undefined) return normalizeID(value.id)
  return undefined
}

export const getRole = (user: AuthUserLike | null | undefined): UserRole | undefined =>
  user?.role ?? undefined

export const getManagedChapterIDs = (user: AuthUserLike | null | undefined): number[] => {
  if (!user?.managedChapters?.length) return []

  return user.managedChapters
    .map((chapter) => normalizeID(chapter))
    .filter((value): value is number => typeof value === 'number')
}

export const isElevated = (user: AuthUserLike | null | undefined): boolean => {
  const role = getRole(user)
  return role ? elevatedRoles.includes(role) : false
}

export const isAdmin = (user: AuthUserLike | null | undefined): boolean => {
  const role = getRole(user)
  return role ? adminRoles.includes(role) : false
}

export const adminsOnly: Access = ({ req: { user } }) => isAdmin(user)

export const superAdminsOnly: Access = ({ req: { user } }) => getRole(user) === 'superAdmin'

export const elevatedOnly: Access = ({ req: { user } }) => isElevated(user)

export const adminFieldOnly: FieldAccess = ({ req: { user } }) => isAdmin(user)

export const adminsOrSelf: Access = ({ req: { user } }) => {
  if (isAdmin(user)) return true
  if (user?.id) {
    return {
      id: {
        equals: Number(user.id),
      },
    }
  }
  return false
}

export const adminsOrManagedChapterUsers: Access = ({ req: { user } }) => {
  if (isAdmin(user)) return true

  if (getRole(user) === 'chapterAdmin') {
    const managedChapterIDs = getManagedChapterIDs(user)

    if (!managedChapterIDs.length) return false

    return {
      primaryChapter: {
        in: managedChapterIDs,
      },
    } as Where
  }

  if (user?.id) {
    return {
      id: {
        equals: Number(user.id),
      },
    } as Where
  }

  return false
}

export const userScopedAccess =
  (fieldName = 'user'): Access =>
  ({ req: { user } }) => {
    if (isAdmin(user)) return true

    if (user?.id) {
      return {
        [fieldName]: {
          equals: Number(user.id),
        },
      } as Where
    }

    return false
  }

export const chapterScopedAccess =
  (fieldName = 'chapter'): Access =>
  ({ req: { user } }) => {
    if (isAdmin(user)) return true

    if (getRole(user) === 'chapterAdmin') {
      const managedChapterIDs = getManagedChapterIDs(user)

      if (!managedChapterIDs.length) return false

      return {
        [fieldName]: {
          in: managedChapterIDs,
        },
      } as Where
    }

    return false
  }

export const managedChapterAccessByDocumentID: Access = ({ req: { user } }) => {
  if (isAdmin(user)) return true

  if (getRole(user) === 'chapterAdmin') {
    const managedChapterIDs = getManagedChapterIDs(user)

    if (!managedChapterIDs.length) return false

    return {
      id: {
        in: managedChapterIDs,
      },
    } as Where
  }

  return false
}
