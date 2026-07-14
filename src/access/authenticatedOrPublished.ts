import type { Access } from 'payload'

import { isAdmin } from './roles'

export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user && isAdmin(user)) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
