import { NextResponse } from 'next/server'

import { GOOGLE_STATE_COOKIE, OAUTH_STATE_MINUTES, isSecureCookie } from '@/auth/constants'
import { authenticateRequest } from '@/auth/current-user'
import {
  createPKCEChallenge,
  generateOpaqueToken,
  sanitizeReturnTo,
  signOAuthState,
} from '@/auth/crypto'
import { buildGoogleAuthorizationURL } from '@/auth/google'
import {
  enforceRateLimit,
  getRequestAddress,
  rateLimitKey,
  rateLimitResponse,
  RateLimitError,
} from '@/auth/rate-limit'
import { integrationStatus } from '@/utilities/env'

export async function GET(request: Request) {
  try {
    if (!integrationStatus.googleAuth) {
      return Response.json(
        { message: 'Google sign-in is not configured for this environment.' },
        { status: 503 },
      )
    }

    enforceRateLimit({
      key: rateLimitKey('google-start', getRequestAddress(request)),
      limit: 12,
      windowMs: 10 * 60 * 1000,
    })

    const requestURL = new URL(request.url)
    const mode = requestURL.searchParams.get('mode')
    const returnTo = sanitizeReturnTo(requestURL.searchParams.get('returnTo'))
    const currentUser = mode === 'link' ? await authenticateRequest(request.headers) : null
    if (mode === 'link' && !currentUser) {
      return NextResponse.redirect(
        new URL(`/login?returnTo=${encodeURIComponent('/account/settings')}`, request.url),
      )
    }

    const state = generateOpaqueToken(24)
    const nonce = generateOpaqueToken(24)
    const verifier = generateOpaqueToken(48)
    const signedState = signOAuthState({
      expiresAt: Date.now() + OAUTH_STATE_MINUTES * 60 * 1000,
      linkUserID: currentUser?.id,
      nonce,
      returnTo,
      state,
      verifier,
    })
    const authorizationURL = buildGoogleAuthorizationURL({
      challenge: createPKCEChallenge(verifier),
      nonce,
      state,
    })
    const response = NextResponse.redirect(authorizationURL)
    response.cookies.set(GOOGLE_STATE_COOKIE, signedState, {
      httpOnly: true,
      maxAge: OAUTH_STATE_MINUTES * 60,
      path: '/api/auth/google',
      sameSite: 'lax',
      secure: isSecureCookie,
    })
    return response
  } catch (error) {
    if (error instanceof RateLimitError) return rateLimitResponse(error)
    return Response.json({ message: 'Google sign-in could not start.' }, { status: 500 })
  }
}
