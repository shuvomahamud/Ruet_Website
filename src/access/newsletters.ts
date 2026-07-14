import type { Access } from 'payload'

import { isAdmin } from '@/access/roles'

export const newsletterDeleteAccess: Access = ({ req: { user } }) =>
  isAdmin(user) ? { status: { in: ['draft', 'cancelled'] } } : false

