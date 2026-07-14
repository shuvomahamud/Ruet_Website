import type { Access } from 'payload'

import { isActiveAccount } from './roles'

export const authenticated: Access = ({ req: { user } }) => isActiveAccount(user)
