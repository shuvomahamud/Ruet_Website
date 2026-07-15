import type { PayloadRequest } from 'payload'

import type { Payment } from '@/payload-types'
import { getRelationshipID } from '@/utilities/relationships'

import { writeAuditLog } from './audit'

const DAY_MS = 86_400_000

export type PaymentProofRetentionResult = {
  deleted: number
  eligible: number
  retentionDays: number
}

export const processPaymentProofRetention = async ({
  now = new Date(),
  req,
}: {
  now?: Date
  req: PayloadRequest
}): Promise<PaymentProofRetentionResult> => {
  const settings = await req.payload.findGlobal({
    slug: 'siteSettings',
    depth: 0,
    overrideAccess: true,
    req,
  })
  const retentionDays = Math.max(30, settings.paymentProofRetentionDays ?? 180)
  const cutoff = new Date(now.getTime() - retentionDays * DAY_MS).toISOString()
  const result = await req.payload.find({
    collection: 'payments',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    req,
    sort: 'id',
    where: {
      and: [
        { proofImage: { exists: true } },
        { status: { in: ['approved', 'failed'] } },
        {
          or: [
            { approvedAt: { less_than_equal: cutoff } },
            { rejectedAt: { less_than_equal: cutoff } },
          ],
        },
      ],
    },
  })

  let deleted = 0
  for (const payment of result.docs as Payment[]) {
    const proofID = getRelationshipID(payment.proofImage)
    if (!proofID) continue

    await req.payload.delete({
      collection: 'paymentProofs',
      id: proofID,
      overrideAccess: true,
      req,
    })
    await writeAuditLog(req, {
      action: 'payment_proof.retention_delete',
      entityID: proofID,
      entityType: 'paymentProof',
      metadata: { paymentID: payment.id, retentionDays },
      outcome: 'succeeded',
    })
    deleted += 1
  }

  return { deleted, eligible: result.docs.length, retentionDays }
}
