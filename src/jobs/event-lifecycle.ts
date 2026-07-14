import type { TaskConfig } from 'payload'

import { processEventLifecycle, type EventLifecycleResult } from '@/services/event-lifecycle'

type EventLifecycleTask = {
  input: Record<string, never>
  output: EventLifecycleResult
}

export const eventLifecycleTask: TaskConfig<EventLifecycleTask> = {
  concurrency: () => 'event-lifecycle',
  handler: async ({ req }) => ({ output: await processEventLifecycle({ req }) }),
  interfaceName: 'EventLifecycleJobInput',
  label: 'Process event waitlist offers',
  outputSchema: [
    { name: 'expiredOffers', type: 'number', required: true },
    { name: 'promotedOffers', type: 'number', required: true },
    { name: 'processedEvents', type: 'number', required: true },
  ],
  retries: {
    attempts: 3,
    backoff: { delay: 30_000, type: 'exponential' },
  },
  schedule: [{ cron: '0 */15 * * * *', queue: 'waitlist' }],
  slug: 'eventLifecycle',
}
