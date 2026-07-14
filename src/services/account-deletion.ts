import { createLocalReq, type Payload } from 'payload'

import { generateOpaqueToken } from '@/auth/crypto'
import { revokeAllGoogleSessions } from '@/auth/session'
import type { User } from '@/payload-types'
import { runInTransaction } from '@/services/transaction'
import { AppError } from '@/utilities/errors'

export const anonymizeAccount = async ({
  password,
  payload,
  user,
}: {
  password?: string
  payload: Payload
  user: User
}): Promise<void> => {
  if ((user.authMethods ?? ['password']).includes('password')) {
    if (!password) {
      throw new AppError('Enter your password to delete this account.', {
        code: 'PASSWORD_REQUIRED',
        status: 400,
      })
    }

    try {
      await payload.login({
        collection: 'users',
        data: { email: user.email, password },
        overrideAccess: true,
      })
    } catch {
      throw new AppError('The password is incorrect.', {
        code: 'INVALID_PASSWORD',
        status: 401,
      })
    }
  }

  const req = await createLocalReq({ context: { systemGeneratedPassword: true }, user }, payload)
  const deletedAt = new Date().toISOString()
  const reference = generateOpaqueToken(18)

  await runInTransaction(req, async () => {
    await payload.update({
      collection: 'users',
      data: {
        _verified: false,
        accountStatus: 'deleted',
        alumniReference: null,
        anonymizedReference: reference,
        authMethods: ['password'],
        city: null,
        communicationPreferences: {
          allowAnnouncements: false,
          allowNewsletters: false,
          allowSystemEmails: false,
        },
        country: null,
        deletedAt,
        email: `deleted+${reference}@invalid.ruetianusa.local`,
        employer: null,
        firstName: 'Deleted',
        googleSubject: null,
        lastName: 'Member',
        managedChapters: [],
        password: generateOpaqueToken(48),
        phoneNumber: null,
        primaryChapter: null,
        privacyAcceptedAt: null,
        privacyVersionAccepted: null,
        professionalTitle: null,
        ruetDepartment: null,
        sessions: [],
        state: null,
        termsAcceptedAt: null,
        termsVersionAccepted: null,
      },
      id: user.id,
      overrideAccess: true,
      req,
    })

    await revokeAllGoogleSessions(payload, user.id, req)

    await payload.create({
      collection: 'auditLogs',
      data: {
        action: 'account.anonymized',
        actor: user.id,
        actorRoleSnapshot: user.role,
        afterStatus: 'deleted',
        beforeStatus: user.accountStatus,
        entityID: String(user.id),
        entityType: 'user',
        metadata: { anonymizedReference: reference },
        outcome: 'succeeded',
      },
      overrideAccess: true,
      req,
    })
  })
}
