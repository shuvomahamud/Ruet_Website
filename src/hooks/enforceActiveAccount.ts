import type { CollectionConfig } from 'payload'
import { UnauthorizedError } from 'payload'

type AuthenticatedUser = {
  accountStatus?: string | null
}

const requireActive = (user: AuthenticatedUser): void => {
  if (user.accountStatus !== 'active') throw new UnauthorizedError()
}

export const activeAccountHooks: NonNullable<CollectionConfig['hooks']> = {
  afterRefresh: [({ req }) => requireActive(req.user as AuthenticatedUser)],
  beforeLogin: [({ user }) => requireActive(user)],
  me: [({ user }) => requireActive(user)],
  refresh: [({ user }) => requireActive(user)],
}
