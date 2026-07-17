import type { CollectionConfig } from 'payload'
import { UnauthorizedError } from 'payload'
import { APIError } from 'payload'

type AuthenticatedUser = {
  accountStatus?: string | null
}

const requireActive = (user: AuthenticatedUser): void => {
  if (user.accountStatus === 'pending') {
    throw new APIError(
      'Your account is awaiting administrator approval. You will be able to sign in after it is approved.',
      403,
    )
  }
  if (user.accountStatus !== 'active') throw new UnauthorizedError()
}

export const activeAccountHooks: NonNullable<CollectionConfig['hooks']> = {
  afterRefresh: [({ req }) => requireActive(req.user as AuthenticatedUser)],
  beforeLogin: [({ user }) => requireActive(user)],
  me: [({ user }) => requireActive(user)],
  refresh: [({ user }) => requireActive(user)],
}
