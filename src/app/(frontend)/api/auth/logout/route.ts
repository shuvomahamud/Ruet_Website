import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import { GOOGLE_SESSION_COOKIE } from '@/auth/constants'
import { readCookie } from '@/auth/crypto'
import { clearGoogleSessionCookie, revokeGoogleSession } from '@/auth/session'

export async function POST(request: Request) {
  const payload = await getPayload({ config })
  await revokeGoogleSession(payload, readCookie(request.headers, GOOGLE_SESSION_COOKIE))

  const response = NextResponse.json({ message: 'Signed out.' })
  response.cookies.set(clearGoogleSessionCookie)
  return response
}
