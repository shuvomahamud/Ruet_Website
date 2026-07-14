import type { CollectionBeforeChangeHook } from 'payload'

import { assertWorkflowTransition, type WorkflowName } from '@/domain/workflows'

export const validateWorkflowTransition =
  (workflow: WorkflowName): CollectionBeforeChangeHook =>
  ({ data, operation, originalDoc }) => {
    if (operation !== 'update' || !originalDoc || typeof data.status !== 'string') return data

    const currentStatus = originalDoc.status
    if (typeof currentStatus === 'string') {
      assertWorkflowTransition(workflow, currentStatus, data.status)
    }

    return data
  }
