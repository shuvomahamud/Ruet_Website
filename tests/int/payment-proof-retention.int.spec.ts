import type { PayloadRequest } from 'payload'
import { describe, expect, it, vi } from 'vitest'

import { processPaymentProofRetention } from '@/services/payment-proof-retention'

describe('payment-proof retention', () => {
  it('deletes only the finalized proofs selected by the retention query and audits each deletion', async () => {
    const create = vi.fn().mockResolvedValue({ id: 1 })
    const remove = vi.fn().mockResolvedValue({ id: 42 })
    const find = vi.fn().mockResolvedValue({
      docs: [
        { id: 10, proofImage: 42, status: 'approved' },
        { id: 11, proofImage: 43, status: 'failed' },
      ],
    })
    const req = {
      payload: {
        create,
        delete: remove,
        find,
        findGlobal: vi.fn().mockResolvedValue({ paymentProofRetentionDays: 90 }),
      },
    } as unknown as PayloadRequest

    const result = await processPaymentProofRetention({
      now: new Date('2026-07-14T12:00:00.000Z'),
      req,
    })

    expect(result).toEqual({ deleted: 2, eligible: 2, retentionDays: 90 })
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'payments',
        where: expect.objectContaining({ and: expect.any(Array) }),
      }),
    )
    expect(remove).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ collection: 'paymentProofs', id: 42, overrideAccess: true }),
    )
    expect(remove).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ collection: 'paymentProofs', id: 43, overrideAccess: true }),
    )
    expect(create).toHaveBeenCalledTimes(2)
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'auditLogs',
        data: expect.objectContaining({ action: 'payment_proof.retention_delete' }),
      }),
    )
  })
})
