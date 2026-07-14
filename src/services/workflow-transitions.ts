import type { PayloadRequest } from 'payload'

import {
  assertExpectedStatus,
  assertWorkflowTransition,
  type WorkflowName,
} from '@/domain/workflows'
import { lockWorkflowRecord } from './transaction'

type WorkflowCollection =
  | 'eventRegistrations'
  | 'memberships'
  | 'orders'
  | 'payments'
  | 'waitlistEntries'

const workflowByCollection: Record<WorkflowCollection, WorkflowName> = {
  eventRegistrations: 'registration',
  memberships: 'membership',
  orders: 'order',
  payments: 'payment',
  waitlistEntries: 'waitlist',
}

const tableByCollection = {
  eventRegistrations: 'event_registrations',
  memberships: 'memberships',
  orders: 'orders',
  payments: 'payments',
  waitlistEntries: 'waitlist_entries',
} as const

type TransitionInput = {
  collection: WorkflowCollection
  data?: Record<string, unknown>
  expectedStatus: string
  id: number | string
  nextStatus: string
  req: PayloadRequest
}

type TransitionResult = {
  doc: { id: number | string; status: string }
  idempotent: boolean
}

/**
 * Privileged workflow primitive. Callers must authorize the actor before invoking it.
 * All nested operations share `req`, so a surrounding transaction remains atomic.
 */
export const transitionWorkflowRecord = async ({
  collection,
  data = {},
  expectedStatus,
  id,
  nextStatus,
  req,
}: TransitionInput): Promise<TransitionResult> => {
  await lockWorkflowRecord(req, tableByCollection[collection], id)

  const current = (await req.payload.findByID({
    collection,
    depth: 0,
    id,
    overrideAccess: true,
    req,
  })) as unknown as { id: number | string; status: string }

  if (current.status === nextStatus) {
    return { doc: current, idempotent: true }
  }

  assertExpectedStatus(current.status, expectedStatus)
  assertWorkflowTransition(workflowByCollection[collection], current.status, nextStatus)

  const result = (await req.payload.update({
    collection,
    context: {
      workflowTransition: true,
    },
    data: {
      ...data,
      status: nextStatus,
    } as never,
    overrideAccess: true,
    req,
    where: {
      and: [{ id: { equals: id } }, { status: { equals: expectedStatus } }],
    },
  })) as unknown as { docs: Array<{ id: number | string; status: string }> }

  const updated = result.docs[0]
  if (!updated) {
    const latest = (await req.payload.findByID({
      collection,
      depth: 0,
      id,
      overrideAccess: true,
      req,
    })) as unknown as { id: number | string; status: string }

    if (latest.status === nextStatus) {
      return { doc: latest, idempotent: true }
    }

    assertExpectedStatus(latest.status, expectedStatus)
    throw new Error('Workflow transition did not update the expected record.')
  }

  return { doc: updated, idempotent: false }
}
