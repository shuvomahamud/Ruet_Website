import config from '@payload-config'
import { getPayload } from 'payload'

import type { User } from '@/payload-types'

export const authenticateRequest = async (headers: Headers): Promise<User | null> => {
  const payload = await getPayload({ config })
  const result = await payload.auth({ headers })
  const user = result.user as User | null

  return user?.collection === 'users' && user.accountStatus === 'active' ? user : null
}
