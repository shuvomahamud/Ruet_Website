import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import { authenticateRequest } from '@/auth/current-user'
import {
  enforceRateLimit,
  getRequestAddress,
  rateLimitKey,
  rateLimitResponse,
  RateLimitError,
} from '@/auth/rate-limit'
import { deleteAccountSchema } from '@/auth/schemas'
import { clearGoogleSessionCookie } from '@/auth/session'
import { anonymizeAccount } from '@/services/account-deletion'
import { AppError } from '@/utilities/errors'

export async function POST(request: Request) {
  const user = await authenticateRequest(request.headers)
  if (!user) return Response.json({ message: 'Sign in to continue.' }, { status: 401 })

  const input = deleteAccountSchema.safeParse(await request.json())
  if (!input.success) {
    return Response.json({ message: 'Type DELETE MY ACCOUNT exactly to confirm.' }, { status: 400 })
  }

  try {
    await enforceRateLimit({
      key: rateLimitKey('account-delete', getRequestAddress(request), String(user.id)),
      limit: 5,
      windowMs: 15 * 60 * 1000,
    })
    const payload = await getPayload({ config })
    await anonymizeAccount({ password: input.data.password, payload, user })

    const response = NextResponse.json({ message: 'Your account has been deleted.' })
    response.cookies.set(clearGoogleSessionCookie)
    response.cookies.set('payload-token', '', { httpOnly: true, maxAge: 0, path: '/' })
    return response
  } catch (error) {
    if (error instanceof RateLimitError) return rateLimitResponse(error)
    const status = error instanceof AppError ? error.status : 500
    return Response.json(
      { message: error instanceof Error ? error.message : 'Account deletion failed.' },
      { status },
    )
  }
}
