import type { Access } from 'payload'

import { isElevated } from './roles'

export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user && isElevated(user)) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
