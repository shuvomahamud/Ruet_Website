import type { AuthStrategy } from 'payload'

import { GOOGLE_SESSION_COOKIE } from '@/auth/constants'
import { hashToken, readCookie } from '@/auth/crypto'

export const googleSessionStrategy: AuthStrategy = {
  name: 'google-session',
  authenticate: async ({ headers, payload }) => {
    const token = readCookie(headers, GOOGLE_SESSION_COOKIE)
    if (!token) return { user: null }

    const sessions = await payload.find({
      collection: 'oauthSessions',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [
          { tokenHash: { equals: hashToken(token) } },
          { expiresAt: { greater_than: new Date().toISOString() } },
          { revokedAt: { exists: false } },
        ],
      },
    })

    const userID = sessions.docs[0]?.user
    if (typeof userID !== 'number') return { user: null }

    const user = await payload.findByID({
      collection: 'users',
      depth: 0,
      id: userID,
      overrideAccess: true,
    })

    if (user.accountStatus !== 'active') return { user: null }

    return {
      user: {
        ...user,
        _strategy: 'google-session',
        collection: 'users',
      },
    }
  },
}
