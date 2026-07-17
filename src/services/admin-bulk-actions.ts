import type { PayloadRequest } from 'payload'
import { Forbidden } from 'payload'

import { getRole, isAdmin } from '@/access/roles'
import type { Membership, MembershipPlan, User } from '@/payload-types'
import { AppError } from '@/utilities/errors'
import { getRelationshipID } from '@/utilities/relationships'

import { writeAuditLog } from './audit'
import { lockWorkflowRecord, runInTransaction } from './transaction'
import { transitionWorkflowRecord } from './workflow-transitions'

const blockingMembershipStatuses = [
  'active',
  'grace_period',
  'pending_payment',
  'pending_manual_approval',
] as const
const cancellableMembershipStatuses = ['active', 'grace_period', 'suspended'] as const

export type SelectionEligibility = { eligible: boolean; id: number; reason?: string }
export type BulkActionResult = {
  failed: Array<{ id: number; message: string }>
  succeeded: number[]
}

const assertAdmin = (req: PayloadRequest) => {
  if (!isAdmin(req.user)) throw new Forbidden(req.t)
}

const isEmailVerified = (user: User) =>
  user._verified === true || user.authMethods?.includes('google') === true

export const getApprovalEligibility = async (
  req: PayloadRequest,
  ids: number[],
): Promise<SelectionEligibility[]> => {
  assertAdmin(req)
  return Promise.all(
    ids.map(async (id) => {
      const user = (await req.payload.findByID({
        collection: 'users', depth: 0, id, overrideAccess: true, req, showHiddenFields: true,
      })) as User
      if (user.accountStatus !== 'pending') return { eligible: false, id, reason: 'Account is not pending.' }
      if (!isEmailVerified(user)) return { eligible: false, id, reason: 'Email is not verified.' }
      return { eligible: true, id }
    }),
  )
}

export const approveUsers = async (req: PayloadRequest, ids: number[]): Promise<BulkActionResult> => {
  assertAdmin(req)
  const result: BulkActionResult = { failed: [], succeeded: [] }
  for (const id of ids) {
    try {
      await runInTransaction(req, async () => {
        await lockWorkflowRecord(req, 'users', id)
        const [eligibility] = await getApprovalEligibility(req, [id])
        if (!eligibility?.eligible) throw new AppError(eligibility?.reason ?? 'User is not eligible.', { status: 409 })
        await req.payload.update({
          collection: 'users', data: { accountStatus: 'active' }, id, overrideAccess: true, req,
        })
        await writeAuditLog(req, {
          action: 'user.approve', afterStatus: 'active', beforeStatus: 'pending', entityID: id,
          entityType: 'user', outcome: 'succeeded',
        })
      })
      result.succeeded.push(id)
      await queueAdminNotice(req, id, 'Account approved', 'Your RUETIAN USA account was approved. You can now sign in and access member pages.')
    } catch (error) {
      result.failed.push({ id, message: error instanceof Error ? error.message : 'Approval failed.' })
    }
  }
  return result
}

export const getPaidMembershipEligibility = async (
  req: PayloadRequest,
  ids: number[],
): Promise<SelectionEligibility[]> => {
  assertAdmin(req)
  return Promise.all(ids.map(async (id) => {
    const user = (await req.payload.findByID({ collection: 'users', depth: 0, id, overrideAccess: true, req })) as User
    if (user.accountStatus !== 'active') return { eligible: false, id, reason: 'Account must be approved and active.' }
    if (!getRelationshipID(user.primaryChapter)) return { eligible: false, id, reason: 'A primary chapter is required.' }
    const blocking = await req.payload.count({
      collection: 'memberships', overrideAccess: true, req,
      where: { and: [{ user: { equals: id } }, { status: { in: [...blockingMembershipStatuses] } }] },
    })
    return blocking.totalDocs
      ? { eligible: false, id, reason: 'A current or pending membership already exists.' }
      : { eligible: true, id }
  }))
}

const addOneYear = (date: Date) => {
  const next = new Date(date)
  next.setUTCFullYear(next.getUTCFullYear() + 1)
  return next
}

export const addPaidMemberships = async (req: PayloadRequest, ids: number[]): Promise<BulkActionResult> => {
  assertAdmin(req)
  const plans = await req.payload.find({
    collection: 'membershipPlans', depth: 0, limit: 2, overrideAccess: true, pagination: false, req,
    where: { active: { equals: true } },
  })
  if (plans.docs.length !== 1) throw new AppError('Exactly one active membership plan is required.', { status: 409 })
  const plan = plans.docs[0] as MembershipPlan
  const result: BulkActionResult = { failed: [], succeeded: [] }
  const batchDate = new Date().toISOString().slice(0, 10).replaceAll('-', '')

  for (const id of ids) {
    try {
      const created = await runInTransaction(req, async () => {
        await lockWorkflowRecord(req, 'users', id)
        await lockWorkflowRecord(req, 'membership_plans', plan.id)
        const [eligibility] = await getPaidMembershipEligibility(req, [id])
        if (!eligibility?.eligible) throw new AppError(eligibility?.reason ?? 'User is not eligible.', { status: 409 })
        const user = (await req.payload.findByID({ collection: 'users', depth: 0, id, overrideAccess: true, req })) as User
        const chapterID = getRelationshipID(user.primaryChapter)!
        const chapter = await req.payload.findByID({ collection: 'chapters', depth: 0, id: chapterID, overrideAccess: true, req })
        const history = await req.payload.find({
          collection: 'memberships', depth: 0, limit: 1, overrideAccess: true, pagination: false, req,
          sort: '-createdAt', where: { user: { equals: id } },
        })
        const previous = history.docs[0] as Membership | undefined
        const now = new Date()
        const expires = addOneYear(now)
        const reference = `ADMIN-BULK-${batchDate}-USER${id}`
        const membership = await req.payload.create({
          collection: 'memberships', overrideAccess: true, req,
          data: {
            billingIntervalSnapshot: 'annual', chapterAttribution: chapterID,
            chapterNameSnapshot: chapter.name, currencySnapshot: plan.currency,
            expiresAt: expires.toISOString(), gracePeriodDaysSnapshot: plan.gracePeriodDays ?? 7,
            membershipKind: previous ? 'reactivation' : 'join', membershipSource: 'adminBulk',
            paymentMethod: 'adminBulk', plan: plan.id, planPriceSnapshot: plan.annualPrice,
            planTitleSnapshot: plan.title, previousMembership: previous?.id,
            reactivationEligible: true, renewalAt: expires.toISOString(),
            renewalReminderDaysBeforeSnapshot: plan.renewalReminderDaysBefore ?? 30,
            renewalReminderEnabledSnapshot: plan.renewalReminderEnabled ?? true,
            startedAt: now.toISOString(), status: 'active', user: id,
          },
        })
        const order = await req.payload.create({
          collection: 'orders', overrideAccess: true, req,
          data: {
            chapterAttribution: chapterID, chapterNameSnapshot: chapter.name, currency: plan.currency,
            discountTotal: 0, membership: membership.id, orderType: 'membership',
            paymentMethod: 'adminBulk', status: 'paid', subtotal: plan.annualPrice,
            total: plan.annualPrice, user: id,
          },
        })
        const payment = await req.payload.create({
          collection: 'payments', overrideAccess: true, req,
          data: {
            amountSnapshot: plan.annualPrice, approvedAt: now.toISOString(), approvedBy: Number(req.user!.id),
            approvedByRoleSnapshot: getRole(req.user), chapterNameSnapshot: chapter.name,
            currencySnapshot: plan.currency, firstReviewerChapter: chapterID, order: order.id,
            orderTypeSnapshot: 'membership', paymentSource: 'adminBulk', proofTransactionId: reference,
            status: 'approved', submittedAt: now.toISOString(), user: id,
          },
        })
        await writeAuditLog(req, {
          action: 'membership.admin_bulk_grant', afterStatus: 'active', beforeStatus: previous?.status,
          entityID: membership.id, entityType: 'membership', metadata: { orderID: order.id, paymentID: payment.id, reference, userID: id }, outcome: 'succeeded',
        })
        return { membershipID: membership.id, reference }
      })
      result.succeeded.push(id)
      await queueAdminNotice(req, id, 'Paid membership added', `An administrator added your annual paid membership. Reference: ${created.reference}`)
    } catch (error) {
      result.failed.push({ id, message: error instanceof Error ? error.message : 'Membership could not be added.' })
    }
  }
  return result
}

export const getCancellationEligibility = async (req: PayloadRequest, ids: number[]): Promise<SelectionEligibility[]> => {
  assertAdmin(req)
  return Promise.all(ids.map(async (id) => {
    const membership = (await req.payload.findByID({ collection: 'memberships', depth: 0, id, overrideAccess: true, req })) as Membership
    return (cancellableMembershipStatuses as readonly string[]).includes(membership.status)
      ? { eligible: true, id }
      : { eligible: false, id, reason: 'Only active, grace-period, or suspended memberships can be cancelled.' }
  }))
}

export const cancelMemberships = async (req: PayloadRequest, ids: number[], reason: string): Promise<BulkActionResult> => {
  assertAdmin(req)
  const normalizedReason = reason.trim()
  if (!normalizedReason) throw new AppError('A cancellation reason is required.', { status: 400 })
  const result: BulkActionResult = { failed: [], succeeded: [] }
  for (const id of ids) {
    try {
      const userID = await runInTransaction(req, async () => {
        await lockWorkflowRecord(req, 'memberships', id)
        const membership = (await req.payload.findByID({ collection: 'memberships', depth: 0, id, overrideAccess: true, req })) as Membership
        if (!(cancellableMembershipStatuses as readonly string[]).includes(membership.status)) throw new AppError('Membership is not cancellable.', { status: 409 })
        await transitionWorkflowRecord({ collection: 'memberships', expectedStatus: membership.status, id, nextStatus: 'cancelled_by_admin', req })
        await writeAuditLog(req, {
          action: 'membership.admin_bulk_cancel', afterStatus: 'cancelled_by_admin', beforeStatus: membership.status,
          entityID: id, entityType: 'membership', metadata: { reason: normalizedReason }, outcome: 'succeeded',
        })
        return getRelationshipID(membership.user)
      })
      result.succeeded.push(id)
      if (userID) await queueAdminNotice(req, userID, 'Membership cancelled', `An administrator cancelled your membership. Reason: ${normalizedReason}\n\nThis action does not issue a refund.`)
    } catch (error) {
      result.failed.push({ id, message: error instanceof Error ? error.message : 'Cancellation failed.' })
    }
  }
  return result
}

const queueAdminNotice = async (req: PayloadRequest, userID: number, title: string, message: string) => {
  try {
    const { queueEmail } = await import('@/email/delivery')
    await queueEmail(req.payload, {
      category: 'system', data: { message, subject: title, title },
      deduplicationKey: `admin-bulk:${title}:${userID}:${Date.now()}`, queue: 'transactional',
      required: true, template: 'systemNotice', userID,
    })
  } catch (error) {
    req.payload.logger.error({ err: error, msg: 'Admin bulk action notification could not queue.' })
  }
}
