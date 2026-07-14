import type { PayloadRequest } from 'payload'
import { Forbidden } from 'payload'

import { getManagedChapterIDs, getRole, isAdmin } from '@/access/roles'
import { assertExpectedStatus } from '@/domain/workflows'
import type { Membership, Order, Payment } from '@/payload-types'
import { AppError } from '@/utilities/errors'
import { getRelationshipID } from '@/utilities/relationships'
import { writeAuditLog } from './audit'
import { lockWorkflowRecord, runInTransaction } from './transaction'
import { transitionWorkflowRecord } from './workflow-transitions'

type ReviewDecision = 'approve' | 'reject'

type ReviewInput = {
  decision: ReviewDecision
  paymentID: number
  reason?: string
  req: PayloadRequest
}

type ReviewResult = {
  idempotent: boolean
  payment: Payment
}

const addOneYear = (date: Date): Date => {
  const result = new Date(date)
  result.setUTCFullYear(result.getUTCFullYear() + 1)
  return result
}

const assertCanReview = (req: PayloadRequest, payment: Payment): void => {
  if (isAdmin(req.user)) return

  const reviewerChapterID = getRelationshipID(payment.firstReviewerChapter)
  if (
    getRole(req.user) !== 'chapterAdmin' ||
    !reviewerChapterID ||
    !getManagedChapterIDs(req.user).includes(reviewerChapterID)
  ) {
    throw new Forbidden(req.t)
  }
}

const updateApprovedTarget = async (
  req: PayloadRequest,
  order: Order,
  approvedAt: Date,
): Promise<void> => {
  const membershipID = getRelationshipID(order.membership)
  const registrationID = getRelationshipID(order.eventRegistration)

  if (membershipID) {
    const membership = (await req.payload.findByID({
      collection: 'memberships',
      depth: 0,
      id: membershipID,
      overrideAccess: true,
      req,
    })) as Membership

    assertExpectedStatus(membership.status, 'pending_manual_approval')
    let startsAt = approvedAt
    const previousMembershipID = getRelationshipID(membership.previousMembership)
    if (membership.membershipKind === 'renewal' && previousMembershipID) {
      const previousMembership = await req.payload.findByID({
        collection: 'memberships',
        depth: 0,
        id: previousMembershipID,
        overrideAccess: true,
        req,
      })
      if (previousMembership.expiresAt) {
        const previousExpiration = new Date(previousMembership.expiresAt)
        if (previousExpiration > approvedAt) startsAt = previousExpiration
      }
    }
    const expiresAt = addOneYear(startsAt)

    await transitionWorkflowRecord({
      collection: 'memberships',
      data: {
        expiresAt: expiresAt.toISOString(),
        graceEndsAt: null,
        reactivationEligible: true,
        renewalAt: expiresAt.toISOString(),
        startedAt: startsAt.toISOString(),
      },
      expectedStatus: 'pending_manual_approval',
      id: membershipID,
      nextStatus: 'active',
      req,
    })

    if (previousMembershipID) {
      const previousMembership = (await req.payload.findByID({
        collection: 'memberships',
        depth: 0,
        id: previousMembershipID,
        overrideAccess: true,
        req,
      })) as Membership
      const previousTermEnded =
        previousMembership.expiresAt && new Date(previousMembership.expiresAt) <= approvedAt
      if (
        previousMembership.status === 'grace_period' ||
        (previousMembership.status === 'active' && previousTermEnded)
      ) {
        await transitionWorkflowRecord({
          collection: 'memberships',
          expectedStatus: previousMembership.status,
          id: previousMembership.id,
          nextStatus: 'expired',
          req,
        })
      }
    }
  }

  if (registrationID) {
    const registration = await req.payload.findByID({
      collection: 'eventRegistrations',
      depth: 0,
      id: registrationID,
      overrideAccess: true,
      req,
    })

    await transitionWorkflowRecord({
      collection: 'eventRegistrations',
      data: { paymentStatus: 'paid' },
      expectedStatus: registration.status,
      id: registrationID,
      nextStatus: 'confirmed',
      req,
    })
  }
}

const updateRejectedTarget = async (req: PayloadRequest, order: Order): Promise<void> => {
  const membershipID = getRelationshipID(order.membership)
  const registrationID = getRelationshipID(order.eventRegistration)

  if (membershipID) {
    await transitionWorkflowRecord({
      collection: 'memberships',
      expectedStatus: 'pending_manual_approval',
      id: membershipID,
      nextStatus: 'failed_manual_payment',
      req,
    })
  }

  if (registrationID) {
    await req.payload.update({
      collection: 'eventRegistrations',
      context: { workflowTransition: true },
      data: { paymentStatus: 'failed' },
      id: registrationID,
      overrideAccess: true,
      req,
    })
  }
}

export const reviewZellePayment = async ({
  decision,
  paymentID,
  reason,
  req,
}: ReviewInput): Promise<ReviewResult> =>
  runInTransaction(req, async () => {
    await lockWorkflowRecord(req, 'payments', paymentID)

    const payment = (await req.payload.findByID({
      collection: 'payments',
      depth: 0,
      id: paymentID,
      overrideAccess: true,
      req,
    })) as Payment

    assertCanReview(req, payment)

    const terminalStatus = decision === 'approve' ? 'approved' : 'failed'
    if (payment.status === terminalStatus) {
      await writeAuditLog(req, {
        action: `payment.${decision}`,
        afterStatus: terminalStatus,
        beforeStatus: terminalStatus,
        entityID: payment.id,
        entityType: 'payment',
        metadata: { idempotent: true, orderID: getRelationshipID(payment.order) ?? null },
        outcome: 'no_change',
      })
      return { idempotent: true, payment }
    }
    if (payment.status !== 'pending') {
      throw new AppError('This payment has already received a different final decision.', {
        code: 'PAYMENT_ALREADY_REVIEWED',
        status: 409,
      })
    }
    if (decision === 'reject' && !reason?.trim()) {
      throw new AppError('A rejection reason is required.', {
        code: 'REJECTION_REASON_REQUIRED',
        status: 400,
      })
    }

    const orderID = getRelationshipID(payment.order)
    if (!orderID) {
      throw new AppError('The payment is not linked to a valid order.', {
        code: 'INVALID_PAYMENT_ORDER',
        status: 409,
      })
    }

    const order = (await req.payload.findByID({
      collection: 'orders',
      depth: 0,
      id: orderID,
      overrideAccess: true,
      req,
    })) as Order
    assertExpectedStatus(order.status, 'pending')

    const reviewedAt = new Date()
    const reviewerID = req.user?.id ? Number(req.user.id) : undefined
    const reviewerRole = getRole(req.user)

    const paymentTransition = await transitionWorkflowRecord({
      collection: 'payments',
      data:
        decision === 'approve'
          ? {
              approvedAt: reviewedAt.toISOString(),
              approvedBy: reviewerID,
              approvedByRoleSnapshot: reviewerRole,
              rejectedAt: null,
              rejectedBy: null,
              rejectedByRoleSnapshot: null,
              rejectionReason: null,
            }
          : {
              approvedAt: null,
              approvedBy: null,
              approvedByRoleSnapshot: null,
              rejectedAt: reviewedAt.toISOString(),
              rejectedBy: reviewerID,
              rejectedByRoleSnapshot: reviewerRole,
              rejectionReason: reason?.trim(),
            },
      expectedStatus: 'pending',
      id: payment.id,
      nextStatus: terminalStatus,
      req,
    })

    if (paymentTransition.idempotent) {
      await writeAuditLog(req, {
        action: `payment.${decision}`,
        afterStatus: terminalStatus,
        beforeStatus: terminalStatus,
        entityID: payment.id,
        entityType: 'payment',
        metadata: { idempotent: true, orderID },
        outcome: 'no_change',
      })
      return {
        idempotent: true,
        payment: paymentTransition.doc as unknown as Payment,
      }
    }

    if (decision === 'approve') {
      await transitionWorkflowRecord({
        collection: 'orders',
        expectedStatus: 'pending',
        id: order.id,
        nextStatus: 'paid',
        req,
      })
      await updateApprovedTarget(req, order, reviewedAt)
    } else {
      await updateRejectedTarget(req, order)
    }

    await writeAuditLog(req, {
      action: `payment.${decision}`,
      afterStatus: terminalStatus,
      beforeStatus: payment.status,
      entityID: payment.id,
      entityType: 'payment',
      metadata: { idempotent: false, orderID },
      outcome: 'succeeded',
    })

    return {
      idempotent: false,
      payment: paymentTransition.doc as unknown as Payment,
    }
  })
