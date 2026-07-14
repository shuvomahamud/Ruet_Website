import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import { GOOGLE_SESSION_COOKIE, GOOGLE_STATE_COOKIE, isSecureCookie } from '@/auth/constants'
import { readCookie, verifyOAuthState } from '@/auth/crypto'
import { exchangeGoogleCode } from '@/auth/google'
import { createGoogleSession, googleSessionCookieOptions } from '@/auth/session'
import { resolveGoogleAccount } from '@/services/google-account'
import { AppError } from '@/utilities/errors'

const clearStateCookie = (response: NextResponse) =>
  response.cookies.set(GOOGLE_STATE_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/api/auth/google',
    sameSite: 'lax',
    secure: isSecureCookie,
  })

export async function GET(request: Request) {
  const requestURL = new URL(request.url)
  const signedState = readCookie(request.headers, GOOGLE_STATE_COOKIE)
  const stored = verifyOAuthState(signedState)
  const returnedState = requestURL.searchParams.get('state')

  if (!stored || stored.state !== returnedState) {
    const response = NextResponse.redirect(new URL('/login?error=oauth_state_invalid', request.url))
    clearStateCookie(response)
    return response
  }

  try {
    if (requestURL.searchParams.get('error')) {
      throw new AppError('Google sign-in was cancelled.', {
        code: 'GOOGLE_AUTH_CANCELLED',
        status: 401,
      })
    }
    const code = requestURL.searchParams.get('code')
    if (!code) {
      throw new AppError('Google did not return an authorization code.', {
        code: 'GOOGLE_CODE_MISSING',
        status: 401,
      })
    }

    const identity = await exchangeGoogleCode({
      code,
      nonce: stored.nonce,
      verifier: stored.verifier,
    })
    const payload = await getPayload({ config })
    const { user } = await resolveGoogleAccount({
      identity,
      linkUserID: stored.linkUserID,
      payload,
    })
    const session = await createGoogleSession(payload, user.id)
    const destination = stored.linkUserID
      ? `${stored.returnTo}${stored.returnTo.includes('?') ? '&' : '?'}google=linked`
      : stored.returnTo
    const response = NextResponse.redirect(new URL(destination, request.url))
    response.cookies.set(GOOGLE_SESSION_COOKIE, session.token, googleSessionCookieOptions)
    clearStateCookie(response)
    return response
  } catch (error) {
    const code = error instanceof AppError ? error.code.toLowerCase() : 'google_auth_failed'
    const destination = stored.linkUserID ? '/account/settings' : '/login'
    const response = NextResponse.redirect(new URL(`${destination}?error=${code}`, request.url))
    clearStateCookie(response)
    return response
  }
}
