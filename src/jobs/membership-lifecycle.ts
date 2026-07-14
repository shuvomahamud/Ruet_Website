import type { TaskConfig } from 'payload'

import {
  processMembershipLifecycle,
  type MembershipLifecycleResult,
} from '@/services/membership-lifecycle'

type MembershipLifecycleTask = {
  input: Record<string, never>
  output: MembershipLifecycleResult
}

export const membershipLifecycleTask: TaskConfig<MembershipLifecycleTask> = {
  concurrency: () => 'membership-lifecycle',
  handler: async ({ req }) => ({ output: await processMembershipLifecycle({ req }) }),
  interfaceName: 'MembershipLifecycleJobInput',
  label: 'Process membership lifecycle',
  outputSchema: [
    { name: 'expired', type: 'number', required: true },
    { name: 'graceStarted', type: 'number', required: true },
    { name: 'remindersQueued', type: 'number', required: true },
  ],
  retries: {
    attempts: 3,
    backoff: { delay: 30_000, type: 'exponential' },
  },
  schedule: [{ cron: '0 15 5 * * *', queue: 'reminders' }],
  slug: 'membershipLifecycle',
}
