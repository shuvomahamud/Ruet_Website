import config from '@payload-config'
import { getPayload } from 'payload'

import { signupSchema } from '@/auth/schemas'
import {
  enforceRateLimit,
  getRequestAddress,
  rateLimitKey,
  rateLimitResponse,
  RateLimitError,
} from '@/auth/rate-limit'
import { LEGAL_POLICY_EFFECTIVE_DATE } from '@/content/legal-policy-20260714'
import { normalizeRollNumberValue } from '@/hooks/normalizeRollNumber'

export async function POST(request: Request) {
  try {
    const input = signupSchema.safeParse(await request.json())
    if (!input.success) {
      return Response.json(
        { issues: input.error.flatten().fieldErrors, message: 'Check the highlighted fields.' },
        { status: 400 },
      )
    }

    await enforceRateLimit({
      key: rateLimitKey('signup-ip', getRequestAddress(request)),
      limit: 5,
      windowMs: 15 * 60 * 1000,
    })
    await enforceRateLimit({
      key: rateLimitKey('signup-email', input.data.email),
      limit: 3,
      windowMs: 60 * 60 * 1000,
    })

    const payload = await getPayload({ config })
    const acceptedAt = new Date().toISOString()
    const rollNumber = normalizeRollNumberValue(input.data.rollNumber)!
    const existingRoll = await payload.count({
      collection: 'users',
      overrideAccess: true,
      where: { rollNumber: { equals: rollNumber } },
    })
    if (existingRoll.totalDocs) {
      return Response.json(
        {
          issues: { rollNumber: ['This roll number is already registered.'] },
          message: 'This roll number is already registered.',
        },
        { status: 409 },
      )
    }

    await payload.create({
      collection: 'users',
      context: { publicSignupValidated: true },
      data: {
        accountStatus: 'pending',
        city: input.data.city,
        country: input.data.country,
        email: input.data.email,
        firstName: input.data.firstName,
        rollNumber,
        lastName: input.data.lastName,
        password: input.data.password,
        primaryChapter: input.data.primaryChapter,
        privacyAcceptedAt: acceptedAt,
        privacyVersionAccepted: LEGAL_POLICY_EFFECTIVE_DATE,
        role: 'member',
        ruetDepartment: input.data.ruetDepartment,
        state: input.data.state,
        termsAcceptedAt: acceptedAt,
        termsVersionAccepted: LEGAL_POLICY_EFFECTIVE_DATE,
      },
      overrideAccess: false,
    })

    return Response.json(
      { message: 'Account created. Verify your email, then wait for administrator approval.' },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof RateLimitError) return rateLimitResponse(error)

    // Email duplicates remain intentionally non-enumerating. A roll number is not an
    // authentication identifier, so a race on its unique index may use a field error.
    if (error instanceof Error && /roll.?number|users_roll_number/i.test(error.message)) {
      return Response.json(
        {
          issues: { rollNumber: ['This roll number is already registered.'] },
          message: 'This roll number is already registered.',
        },
        { status: 409 },
      )
    }
    return Response.json(
      {
        message:
          'If this address can be registered, verification instructions will be sent. You can also try signing in or resetting your password.',
      },
      { status: 202 },
    )
  }
}
