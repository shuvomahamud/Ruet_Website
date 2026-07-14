import type { TaskConfig } from 'payload'

import {
  executeEmailDelivery,
  type DeliverEmailTaskInput,
  type DeliverEmailTaskOutput,
} from '@/email/delivery'

type DeliverEmailTask = {
  input: DeliverEmailTaskInput
  output: DeliverEmailTaskOutput
}

export const deliverEmailTask: TaskConfig<DeliverEmailTask> = {
  concurrency: ({ input }) => `email-delivery:${input.deliveryID}`,
  handler: async ({ input, req }) => ({
    output: await executeEmailDelivery({ input, payload: req.payload, req }),
  }),
  inputSchema: [
    { name: 'deliveryID', type: 'number', required: true },
    { name: 'html', type: 'textarea', required: true },
    { name: 'text', type: 'textarea', required: true },
  ],
  interfaceName: 'DeliverEmailJobInput',
  label: 'Deliver email',
  outputSchema: [
    { name: 'deliveryID', type: 'number', required: true },
    {
      name: 'status',
      type: 'select',
      options: ['sent', 'deduplicated', 'suppressed'],
      required: true,
    },
  ],
  retries: {
    attempts: 3,
    backoff: { delay: 30_000, type: 'exponential' },
  },
  slug: 'deliverEmail',
}
