import type { Chapter, Membership, MembershipPlan, Order, Payment, User } from '@/payload-types'
import type { Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createGoogleSession, revokeGoogleSession } from '@/auth/session'
import { anonymizeAccount } from '@/services/account-deletion'
import { resolveGoogleAccount } from '@/services/google-account'
import { AppError } from '@/utilities/errors'
import { getRelationshipID } from '@/utilities/relationships'
import { getTestPayload } from '../helpers/payload'

describe.sequential('member account lifecycle', () => {
  let payload: Payload
  let chapter: Chapter
  let user: User
  let googleUser: User
  let plan: MembershipPlan
  let membership: Membership
  let order: Order
  let payment: Payment
  let password: string
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const email = `phase2-member-${nonce}@example.test`

  beforeAll(async () => {
    payload = await getTestPayload()
    password = `Secure-Phase2-${nonce}-9`
    chapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: `Phase 2 Chapter ${nonce}`,
        slug: `phase-2-${nonce}`,
        summary: 'Authentication test chapter.',
      },
      overrideAccess: true,
    })
  })

  afterAll(async () => {
    const auditLogs = user?.id
      ? await payload.find({
          collection: 'auditLogs',
          limit: 100,
          overrideAccess: true,
          where: { entityID: { equals: String(user.id) } },
        })
      : { docs: [] }
    for (const log of auditLogs.docs) {
      await payload.delete({ collection: 'auditLogs', id: log.id, overrideAccess: true })
    }

    const sessions = await payload.find({
      collection: 'oauthSessions',
      limit: 100,
      overrideAccess: true,
      where: {
        user: {
          in: [user?.id, googleUser?.id].filter(
            (value): value is number => typeof value === 'number',
          ),
        },
      },
    })
    for (const session of sessions.docs) {
      await payload.delete({ collection: 'oauthSessions', id: session.id, overrideAccess: true })
    }

    if (payment?.id)
      await payload.delete({ collection: 'payments', id: payment.id, overrideAccess: true })
    if (order?.id)
      await payload.delete({ collection: 'orders', id: order.id, overrideAccess: true })
    if (membership?.id)
      await payload.delete({ collection: 'memberships', id: membership.id, overrideAccess: true })
    if (plan?.id)
      await payload.delete({ collection: 'membershipPlans', id: plan.id, overrideAccess: true })
    if (googleUser?.id)
      await payload.delete({ collection: 'users', id: googleUser.id, overrideAccess: true })
    if (user?.id) await payload.delete({ collection: 'users', id: user.id, overrideAccess: true })
    if (chapter?.id)
      await payload.delete({ collection: 'chapters', id: chapter.id, overrideAccess: true })
  })

  it('registers a least-privilege user and requires verified email before login', async () => {
    const acceptedAt = new Date().toISOString()
    user = await payload.create({
      collection: 'users',
      context: { publicSignupValidated: true },
      data: {
        accountStatus: 'suspended',
        city: 'New York',
        country: 'United States',
        email,
        firstName: 'Phase',
        graduationYear: 2012,
        lastName: 'Two',
        password,
        primaryChapter: chapter.id,
        privacyAcceptedAt: acceptedAt,
        role: 'superAdmin',
        ruetDepartment: 'CSE',
        state: 'NY',
        termsAcceptedAt: acceptedAt,
      },
      draft: false,
      overrideAccess: false,
    })

    expect(user.role).toBe('member')
    expect(user.accountStatus).toBe('active')
    expect(user.profileStatus).toBe('complete')
    expect(user.authMethods).toEqual(['password'])
    await expect(
      payload.login({ collection: 'users', data: { email, password }, overrideAccess: true }),
    ).rejects.toThrow()

    const hidden = await payload.findByID({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
      showHiddenFields: true,
    })
    expect(hidden._verified).toBe(false)
    expect(hidden._verificationToken).toBeTruthy()
    await expect(
      payload.verifyEmail({ collection: 'users', token: hidden._verificationToken ?? '' }),
    ).resolves.toBe(true)

    const login = await payload.login({
      collection: 'users',
      data: { email, password },
      overrideAccess: true,
    })
    expect(login.user?.id).toBe(user.id)
    await expect(
      payload.delete({ collection: 'users', id: user.id, overrideAccess: false, user }),
    ).rejects.toThrow()
  })

  it('limits self-service profile changes and supports forgot/reset password', async () => {
    const updated = await payload.update({
      collection: 'users',
      data: {
        city: 'Boston',
        email: `attacker-${nonce}@example.test`,
        role: 'superAdmin',
      },
      id: user.id,
      overrideAccess: false,
      user,
    })
    expect(updated.city).toBe('Boston')
    expect(updated.email).toBe(email)
    expect(updated.role).toBe('member')

    const token = await payload.forgotPassword({
      collection: 'users',
      data: { email },
      disableEmail: true,
      overrideAccess: true,
    })
    expect(token).toBeTruthy()
    await expect(
      payload.resetPassword({
        collection: 'users',
        data: { password: 'weak', token: token ?? '' },
        overrideAccess: true,
      }),
    ).rejects.toThrow(/12 characters/)
    const nextPassword = `Updated-Phase2-${nonce}-8`
    await payload.resetPassword({
      collection: 'users',
      data: { password: nextPassword, token: token ?? '' },
      overrideAccess: true,
    })
    await expect(
      payload.login({ collection: 'users', data: { email, password }, overrideAccess: true }),
    ).rejects.toThrow()
    const login = await payload.login({
      collection: 'users',
      data: { email, password: nextPassword },
      overrideAccess: true,
    })
    expect(login.user?.id).toBe(user.id)
    password = nextPassword
    user = await payload.findByID({ collection: 'users', id: user.id, overrideAccess: true })
  })

  it('does not auto-link duplicate Google email identities and permits explicit safe linking', async () => {
    const identity = {
      email,
      firstName: 'Phase',
      lastName: 'Two',
      subject: `google-subject-${nonce}`,
    }

    await expect(resolveGoogleAccount({ identity, payload })).rejects.toMatchObject({
      code: 'ACCOUNT_LINK_REQUIRED',
    } satisfies Partial<AppError>)

    const linked = await resolveGoogleAccount({ identity, linkUserID: user.id, payload })
    expect(linked.linked).toBe(true)
    expect(linked.user.authMethods).toEqual(expect.arrayContaining(['password', 'google']))

    const mismatched = {
      email: `other-${nonce}@example.test`,
      subject: `other-google-subject-${nonce}`,
    }
    await expect(
      resolveGoogleAccount({ identity: mismatched, linkUserID: user.id, payload }),
    ).rejects.toMatchObject({ code: 'GOOGLE_EMAIL_MISMATCH' } satisfies Partial<AppError>)
    user = linked.user
  })

  it('creates and revokes opaque Google sessions and rejects inactive accounts', async () => {
    const session = await createGoogleSession(payload, user.id)
    const headers = new Headers({ cookie: `ruet-google-session=${session.token}` })
    const authenticated = await payload.auth({ headers })
    expect(authenticated.user?.id).toBe(user.id)

    await revokeGoogleSession(payload, session.token)
    await expect(payload.auth({ headers })).resolves.toMatchObject({ user: null })

    const inactiveSession = await createGoogleSession(payload, user.id)
    user = await payload.update({
      collection: 'users',
      data: { accountStatus: 'suspended' },
      id: user.id,
      overrideAccess: true,
    })
    await expect(
      payload.login({ collection: 'users', data: { email, password }, overrideAccess: true }),
    ).rejects.toThrow()
    await expect(
      payload.auth({
        headers: new Headers({ cookie: `ruet-google-session=${inactiveSession.token}` }),
      }),
    ).resolves.toMatchObject({ user: null })
    user = await payload.update({
      collection: 'users',
      data: { accountStatus: 'active' },
      id: user.id,
      overrideAccess: true,
    })
  })

  it('creates a new Google-only account without exposing a usable password', async () => {
    const resolved = await resolveGoogleAccount({
      identity: {
        email: `google-new-${nonce}@example.test`,
        firstName: 'Google',
        lastName: 'Member',
        subject: `google-new-subject-${nonce}`,
      },
      payload,
    })
    googleUser = resolved.user
    expect(googleUser.authMethods).toEqual(['google'])
    expect(googleUser._verified).toBe(true)
    expect(googleUser.role).toBe('member')
  })

  it('anonymizes account data while preserving financial and audit relationships', async () => {
    plan = await payload.create({
      collection: 'membershipPlans',
      data: {
        active: true,
        annualPrice: 50,
        currency: 'USD',
        publicSummary: 'Phase 2 test membership.',
        slug: `phase2-${nonce}`,
        title: `Phase 2 Plan ${nonce}`,
      },
      overrideAccess: true,
    })
    membership = await payload.create({
      collection: 'memberships',
      context: { workflowTransition: true },
      data: {
        billingIntervalSnapshot: 'annual',
        chapterAttribution: chapter.id,
        chapterNameSnapshot: chapter.name,
        currencySnapshot: 'USD',
        paymentMethod: 'zelle',
        plan: plan.id,
        planPriceSnapshot: 50,
        planTitleSnapshot: plan.title,
        status: 'pending_payment',
        user: user.id,
      },
      overrideAccess: true,
    })
    order = await payload.create({
      collection: 'orders',
      context: { workflowTransition: true },
      data: {
        chapterAttribution: chapter.id,
        chapterNameSnapshot: chapter.name,
        currency: 'USD',
        discountTotal: 0,
        membership: membership.id,
        orderType: 'membership',
        paymentMethod: 'zelle',
        status: 'pending',
        subtotal: 50,
        total: 50,
        user: user.id,
      },
      overrideAccess: true,
    })
    payment = await payload.create({
      collection: 'payments',
      context: { workflowTransition: true },
      data: {
        amountSnapshot: 50,
        chapterNameSnapshot: chapter.name,
        currencySnapshot: 'USD',
        firstReviewerChapter: chapter.id,
        order: order.id,
        orderTypeSnapshot: 'membership',
        paymentSource: 'zelle',
        proofTransactionId: `phase2-${nonce}`,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        user: user.id,
      },
      overrideAccess: true,
    })

    await anonymizeAccount({ password, payload, user })

    const deleted = await payload.findByID({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
    })
    expect(deleted.accountStatus).toBe('deleted')
    expect(deleted.email).toMatch(/^deleted\+/)
    expect(deleted.googleSubject).toBeFalsy()
    expect(deleted.anonymizedReference).toBeTruthy()
    expect(
      getRelationshipID(
        (await payload.findByID({ collection: 'orders', id: order.id, overrideAccess: true })).user,
      ),
    ).toBe(user.id)
    expect(
      getRelationshipID(
        (await payload.findByID({ collection: 'payments', id: payment.id, overrideAccess: true }))
          .user,
      ),
    ).toBe(user.id)

    const audit = await payload.find({
      collection: 'auditLogs',
      overrideAccess: true,
      where: {
        and: [
          { entityID: { equals: String(user.id) } },
          { action: { equals: 'account.anonymized' } },
        ],
      },
    })
    expect(audit.totalDocs).toBe(1)
    await expect(
      payload.login({ collection: 'users', data: { email, password }, overrideAccess: true }),
    ).rejects.toThrow()
    user = deleted
  })
})
