import type { Payload } from 'payload'

import { generateOpaqueToken } from '@/auth/crypto'
import type { GoogleIdentity } from '@/auth/google'
import type { User } from '@/payload-types'
import { AppError } from '@/utilities/errors'

const findByGoogleSubject = async (payload: Payload, subject: string) => {
  const result = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { googleSubject: { equals: subject } },
  })
  return result.docs[0]
}

const findByEmail = async (payload: Payload, email: string) => {
  const result = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: email.toLowerCase() } },
  })
  return result.docs[0]
}

const requireActive = (user: User): User => {
  if (user.accountStatus !== 'active') {
    throw new AppError('This account is not available.', {
      code: 'ACCOUNT_UNAVAILABLE',
      status: 403,
    })
  }
  return user
}

export const resolveGoogleAccount = async ({
  identity,
  linkUserID,
  payload,
}: {
  identity: GoogleIdentity
  linkUserID?: number
  payload: Payload
}): Promise<{ linked: boolean; user: User }> => {
  const subjectAccount = await findByGoogleSubject(payload, identity.subject)
  if (subjectAccount) {
    if (linkUserID && subjectAccount.id !== linkUserID) {
      throw new AppError('This Google account is linked to another member.', {
        code: 'GOOGLE_ALREADY_LINKED',
        status: 409,
      })
    }
    return { linked: false, user: requireActive(subjectAccount) }
  }

  if (linkUserID) {
    const account = requireActive(
      await payload.findByID({
        collection: 'users',
        depth: 0,
        id: linkUserID,
        overrideAccess: true,
      }),
    )

    if (account.email.toLowerCase() !== identity.email.toLowerCase()) {
      throw new AppError('Use the Google account with the same verified email address.', {
        code: 'GOOGLE_EMAIL_MISMATCH',
        status: 409,
      })
    }

    const user = await payload.update({
      collection: 'users',
      data: {
        authMethods: Array.from(new Set([...(account.authMethods ?? ['password']), 'google'])),
        googleSubject: identity.subject,
      },
      id: account.id,
      overrideAccess: true,
    })
    return { linked: true, user }
  }

  if (await findByEmail(payload, identity.email)) {
    throw new AppError('Sign in with your password, then link Google in account settings.', {
      code: 'ACCOUNT_LINK_REQUIRED',
      status: 409,
    })
  }

  const user = await payload.create({
    collection: 'users',
    context: { systemGeneratedPassword: true },
    data: {
      _verified: true,
      accountStatus: 'active',
      authMethods: ['google'],
      email: identity.email,
      firstName: identity.firstName,
      googleSubject: identity.subject,
      lastName: identity.lastName,
      password: generateOpaqueToken(48),
      role: 'member',
    },
    disableVerificationEmail: true,
    overrideAccess: true,
  })

  return { linked: false, user }
}
