import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

import { env } from '@/utilities/env'

export type OAuthState = {
  expiresAt: number
  linkUserID?: number
  nonce: string
  returnTo: string
  state: string
  verifier: string
}

const base64URL = (value: Buffer | string): string => Buffer.from(value).toString('base64url')

const signature = (value: string): string =>
  createHmac('sha256', env.PAYLOAD_SECRET).update(value).digest('base64url')

export const generateOpaqueToken = (bytes = 32): string => randomBytes(bytes).toString('base64url')

export const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex')

export const createPKCEChallenge = (verifier: string): string =>
  createHash('sha256').update(verifier).digest('base64url')

export const signOAuthState = (state: OAuthState): string => {
  const encoded = base64URL(JSON.stringify(state))
  return `${encoded}.${signature(encoded)}`
}

export const verifyOAuthState = (value: string | undefined): OAuthState | null => {
  if (!value) return null

  const [encoded, providedSignature] = value.split('.')
  if (!encoded || !providedSignature) return null

  const expectedSignature = signature(encoded)
  const provided = Buffer.from(providedSignature)
  const expected = Buffer.from(expectedSignature)
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null

  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as OAuthState
    if (
      typeof parsed.expiresAt !== 'number' ||
      parsed.expiresAt <= Date.now() ||
      typeof parsed.nonce !== 'string' ||
      typeof parsed.returnTo !== 'string' ||
      typeof parsed.state !== 'string' ||
      typeof parsed.verifier !== 'string'
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export const sanitizeReturnTo = (value: string | null | undefined): string => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  return value
}

export const readCookie = (headers: Headers, name: string): string | undefined => {
  const cookieHeader = headers.get('cookie')
  if (!cookieHeader) return undefined

  for (const item of cookieHeader.split(';')) {
    const separator = item.indexOf('=')
    if (separator < 0) continue
    const key = item.slice(0, separator).trim()
    if (key === name) return decodeURIComponent(item.slice(separator + 1).trim())
  }

  return undefined
}
