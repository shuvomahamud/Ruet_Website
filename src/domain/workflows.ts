import { AppError } from '@/utilities/errors'

export const WORKFLOW_TRANSITIONS = {
  order: {
    cancelled: [],
    failed: [],
    paid: [],
    pending: ['cancelled', 'failed', 'paid'],
  },
  payment: {
    approved: [],
    failed: [],
    pending: ['approved', 'failed'],
  },
  membership: {
    active: ['cancelled_by_admin', 'expired', 'grace_period', 'suspended'],
    cancelled_by_admin: [],
    expired: ['pending_manual_approval', 'suspended'],
    failed_manual_payment: ['pending_manual_approval', 'suspended'],
    grace_period: ['active', 'cancelled_by_admin', 'expired', 'suspended'],
    pending_manual_approval: ['active', 'cancelled_by_admin', 'failed_manual_payment'],
    pending_payment: ['cancelled_by_admin', 'pending_manual_approval'],
    suspended: ['active', 'cancelled_by_admin', 'expired'],
  },
  registration: {
    cancelled: [],
    confirmed: ['cancelled'],
    pending: ['cancelled', 'confirmed', 'waitlisted'],
    waitlisted: ['cancelled', 'confirmed'],
  },
  waitlist: {
    accepted: [],
    expired: [],
    promoted: ['accepted', 'expired'],
    waiting: ['expired', 'promoted'],
  },
} as const

export type WorkflowName = keyof typeof WORKFLOW_TRANSITIONS

export const assertWorkflowTransition = (
  workflow: WorkflowName,
  currentStatus: string,
  nextStatus: string,
): void => {
  if (currentStatus === nextStatus) return

  const workflowTransitions = WORKFLOW_TRANSITIONS[workflow] as Record<string, readonly string[]>
  const allowedStatuses = workflowTransitions[currentStatus]

  if (!allowedStatuses?.includes(nextStatus)) {
    throw new AppError(`Cannot transition ${workflow} from ${currentStatus} to ${nextStatus}.`, {
      code: 'INVALID_WORKFLOW_TRANSITION',
      status: 409,
    })
  }
}

export const assertExpectedStatus = (actualStatus: string, expectedStatus: string): void => {
  if (actualStatus !== expectedStatus) {
    throw new AppError(
      `The record changed before this action completed. Expected ${expectedStatus}, found ${actualStatus}.`,
      {
        code: 'STALE_WORKFLOW_ACTION',
        status: 409,
      },
    )
  }
}
