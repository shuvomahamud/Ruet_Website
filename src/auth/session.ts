import type { Payload, PayloadRequest } from 'payload'

import { GOOGLE_SESSION_COOKIE, GOOGLE_SESSION_DAYS, isSecureCookie } from '@/auth/constants'
import { generateOpaqueToken, hashToken } from '@/auth/crypto'

export const googleSessionCookieOptions = {
  httpOnly: true,
  maxAge: GOOGLE_SESSION_DAYS * 24 * 60 * 60,
  path: '/',
  sameSite: 'lax' as const,
  secure: isSecureCookie,
}

export const createGoogleSession = async (payload: Payload, userID: number) => {
  const token = generateOpaqueToken()
  const expiresAt = new Date(Date.now() + GOOGLE_SESSION_DAYS * 24 * 60 * 60 * 1000)

  await payload.create({
    collection: 'oauthSessions',
    data: {
      expiresAt: expiresAt.toISOString(),
      provider: 'google',
      tokenHash: hashToken(token),
      user: userID,
    },
    overrideAccess: true,
  })

  return { expiresAt, token }
}

export const revokeGoogleSession = async (payload: Payload, token: string | undefined) => {
  if (!token) return

  await payload.update({
    collection: 'oauthSessions',
    data: { revokedAt: new Date().toISOString() },
    overrideAccess: true,
    where: {
      and: [{ tokenHash: { equals: hashToken(token) } }, { revokedAt: { exists: false } }],
    },
  })
}

export const revokeAllGoogleSessions = async (
  payload: Payload,
  userID: number,
  req?: PayloadRequest,
) => {
  await payload.update({
    collection: 'oauthSessions',
    data: { revokedAt: new Date().toISOString() },
    overrideAccess: true,
    req,
    where: {
      and: [{ user: { equals: userID } }, { revokedAt: { exists: false } }],
    },
  })
}

export const clearGoogleSessionCookie = {
  ...googleSessionCookieOptions,
  maxAge: 0,
  name: GOOGLE_SESSION_COOKIE,
  value: '',
}
