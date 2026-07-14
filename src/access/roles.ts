import type { Access, FieldAccess, Where } from 'payload'

import type { UserRole } from '@/types/app'

const elevatedRoles: UserRole[] = ['chapterAdmin', 'admin', 'superAdmin']
const adminRoles: UserRole[] = ['admin', 'superAdmin']

type AuthUserLike = {
  accountStatus?: string | null
  id?: number | string
  managedChapters?: Array<number | { id?: number | string } | null> | null
  primaryChapter?: number | { id?: number | string } | null
  role?: UserRole | null
}

const normalizeID = (value: number | string | { id?: number | string } | null | undefined) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  if (value && typeof value === 'object' && value.id !== undefined) return normalizeID(value.id)
  return undefined
}

export const isActiveAccount = (user: AuthUserLike | null | undefined): boolean =>
  Boolean(user) && (user?.accountStatus === undefined || user.accountStatus === 'active')

export const getRole = (user: AuthUserLike | null | undefined): UserRole | undefined =>
  isActiveAccount(user) ? (user?.role ?? undefined) : undefined

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

export const denyAll: Access = () => false

export const adminFieldOnly: FieldAccess = ({ req: { user } }) => isAdmin(user)

export const serverFieldOnly: FieldAccess = () => false

export const publicSignupFieldAccess: FieldAccess = ({ req }) =>
  req.context?.publicSignupValidated === true

export const publicUserCreateAccess: Access = ({ req }) => {
  if (isAdmin(req.user)) return true

  const isFirstUserRegistration = new URL(req.url ?? '/', 'http://payload.local').pathname.endsWith(
    '/first-register',
  )

  return isFirstUserRegistration || req.context?.publicSignupValidated === true
}

export const adminsOrSelf: Access = ({ req: { user } }) => {
  if (!isActiveAccount(user)) return false
  if (getRole(user) === 'superAdmin') return true
  if (getRole(user) === 'admin') {
    return {
      role: {
        not_equals: 'superAdmin',
      },
    } as Where
  }
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
  if (!isActiveAccount(user)) return false
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
    if (!isActiveAccount(user)) return false
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
    if (!isActiveAccount(user)) return false
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

export const userOrChapterScopedAccess =
  (userField = 'user', chapterField = 'chapter'): Access =>
  ({ req: { user } }) => {
    if (!isActiveAccount(user)) return false
    if (isAdmin(user)) return true

    if (!user?.id) return false

    const clauses: Where[] = [
      {
        [userField]: {
          equals: Number(user.id),
        },
      } as Where,
    ]

    if (getRole(user) === 'chapterAdmin') {
      const managedChapterIDs = getManagedChapterIDs(user)

      if (managedChapterIDs.length) {
        clauses.push({
          [chapterField]: {
            in: managedChapterIDs,
          },
        } as Where)
      }
    }

    return {
      or: clauses,
    } as Where
  }

export const publishedOrManagedChapterAccess =
  (chapterField = 'chapter'): Access =>
  ({ req: { user } }) => {
    if (isAdmin(user)) return true

    const clauses: Where[] = [
      {
        _status: {
          equals: 'published',
        },
      } as Where,
    ]

    if (getRole(user) === 'chapterAdmin') {
      const managedChapterIDs = getManagedChapterIDs(user)

      if (managedChapterIDs.length) {
        clauses.push({
          [chapterField]: {
            in: managedChapterIDs,
          },
        } as Where)
      }
    }

    return {
      or: clauses,
    } as Where
  }

export const publishedOrManagedChapterDocumentAccess: Access = ({ req: { user } }) => {
  if (isAdmin(user)) return true

  const clauses: Where[] = [
    {
      _status: {
        equals: 'published',
      },
    } as Where,
  ]

  if (getRole(user) === 'chapterAdmin') {
    const managedChapterIDs = getManagedChapterIDs(user)

    if (managedChapterIDs.length) {
      clauses.push({
        id: {
          in: managedChapterIDs,
        },
      } as Where)
    }
  }

  return {
    or: clauses,
  } as Where
}

export const activeOrAdmins: Access = ({ req: { user } }) => {
  if (isAdmin(user)) return true

  return {
    active: {
      equals: true,
    },
  } as Where
}

export const mediaReadAccess: Access = ({ req: { user } }) => {
  if (isAdmin(user)) return true

  const clauses: Where[] = [
    {
      visibility: {
        equals: 'public',
      },
    } as Where,
  ]

  if (getRole(user) === 'chapterAdmin') {
    const managedChapterIDs = getManagedChapterIDs(user)

    if (managedChapterIDs.length) {
      clauses.push({
        chapter: {
          in: managedChapterIDs,
        },
      } as Where)
    }
  }

  return {
    or: clauses,
  } as Where
}

export const mediaMutationAccess: Access = ({ req: { user } }) => {
  if (isAdmin(user)) return true
  if (getRole(user) !== 'chapterAdmin') return false

  const managedChapterIDs = getManagedChapterIDs(user)
  if (!managedChapterIDs.length) return false

  return {
    chapter: {
      in: managedChapterIDs,
    },
  } as Where
}

export const managedChapterAccessByDocumentID: Access = ({ req: { user } }) => {
  if (!isActiveAccount(user)) return false
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
