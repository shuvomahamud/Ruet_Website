import type { PayloadRequest } from 'payload'

import { getRole } from '@/access/roles'
import { logger } from '@/utilities/logger'

type AuditInput = {
  action: string
  afterStatus?: string
  beforeStatus?: string
  entityID: number | string
  entityType: string
  metadata?: Record<string, boolean | number | string | null>
  outcome: 'succeeded' | 'rejected' | 'no_change'
}

export const writeAuditLog = async (req: PayloadRequest, input: AuditInput): Promise<void> => {
  const actorID = req.user?.id ? Number(req.user.id) : undefined
  const actorRole = getRole(req.user)

  await req.payload.create({
    collection: 'auditLogs',
    data: {
      action: input.action,
      actor: actorID,
      actorRoleSnapshot: actorRole,
      afterStatus: input.afterStatus,
      beforeStatus: input.beforeStatus,
      entityID: String(input.entityID),
      entityType: input.entityType,
      metadata: input.metadata,
      outcome: input.outcome,
    },
    overrideAccess: true,
    req,
  })

  logger.info('workflow_audit', {
    action: input.action,
    actorID,
    actorRole,
    afterStatus: input.afterStatus,
    beforeStatus: input.beforeStatus,
    entityID: String(input.entityID),
    entityType: input.entityType,
    outcome: input.outcome,
  })
}
