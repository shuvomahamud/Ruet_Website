import { createRemoteJWKSet, jwtVerify } from 'jose'

import { env } from '@/utilities/env'
import { AppError } from '@/utilities/errors'

const GOOGLE_AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const googleJWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

export type GoogleIdentity = {
  email: string
  firstName?: string
  lastName?: string
  subject: string
}

export const googleCallbackURL = `${env.NEXT_PUBLIC_SITE_URL}/api/auth/google/callback`

export const buildGoogleAuthorizationURL = ({
  challenge,
  nonce,
  state,
}: {
  challenge: string
  nonce: string
  state: string
}) => {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new AppError('Google sign-in is not configured.', {
      code: 'GOOGLE_AUTH_UNAVAILABLE',
      status: 503,
    })
  }

  const url = new URL(GOOGLE_AUTHORIZATION_ENDPOINT)
  url.searchParams.set('client_id', env.GOOGLE_CLIENT_ID)
  url.searchParams.set('redirect_uri', googleCallbackURL)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'openid email profile')
  url.searchParams.set('state', state)
  url.searchParams.set('nonce', nonce)
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('prompt', 'select_account')
  return url
}

export const exchangeGoogleCode = async ({
  code,
  nonce,
  verifier,
}: {
  code: string
  nonce: string
  verifier: string
}): Promise<GoogleIdentity> => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new AppError('Google sign-in is not configured.', {
      code: 'GOOGLE_AUTH_UNAVAILABLE',
      status: 503,
    })
  }

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      code,
      code_verifier: verifier,
      grant_type: 'authorization_code',
      redirect_uri: googleCallbackURL,
    }),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  })
  const body = (await response.json()) as { error?: string; id_token?: string }

  if (!response.ok || !body.id_token) {
    throw new AppError('Google could not complete sign-in.', {
      code: 'GOOGLE_TOKEN_EXCHANGE_FAILED',
      status: 401,
    })
  }

  const verified = await jwtVerify(body.id_token, googleJWKS, {
    audience: env.GOOGLE_CLIENT_ID,
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
  })
  const claims = verified.payload

  if (
    claims.nonce !== nonce ||
    claims.email_verified !== true ||
    typeof claims.email !== 'string' ||
    typeof claims.sub !== 'string'
  ) {
    throw new AppError('Google returned an invalid identity.', {
      code: 'GOOGLE_IDENTITY_INVALID',
      status: 401,
    })
  }

  return {
    email: claims.email.toLowerCase(),
    firstName: typeof claims.given_name === 'string' ? claims.given_name : undefined,
    lastName: typeof claims.family_name === 'string' ? claims.family_name : undefined,
    subject: claims.sub,
  }
}
