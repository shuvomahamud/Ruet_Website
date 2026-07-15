import type { TaskConfig } from 'payload'

import {
  processPaymentProofRetention,
  type PaymentProofRetentionResult,
} from '@/services/payment-proof-retention'

type PaymentProofRetentionTask = {
  input: Record<string, never>
  output: PaymentProofRetentionResult
}

export const paymentProofRetentionTask: TaskConfig<PaymentProofRetentionTask> = {
  concurrency: () => 'payment-proof-retention',
  handler: async ({ req }) => ({ output: await processPaymentProofRetention({ req }) }),
  interfaceName: 'PaymentProofRetentionJobInput',
  label: 'Delete expired payment-proof files',
  outputSchema: [
    { name: 'deleted', type: 'number', required: true },
    { name: 'eligible', type: 'number', required: true },
    { name: 'retentionDays', type: 'number', required: true },
  ],
  retries: {
    attempts: 3,
    backoff: { delay: 30_000, type: 'exponential' },
  },
  schedule: [{ cron: '0 45 5 * * *', queue: 'reminders' }],
  slug: 'paymentProofRetention',
}
