import type { TaskConfig } from 'payload'

import {
  processNewsletterLifecycle,
  type NewsletterLifecycleResult,
} from '@/services/newsletter-campaigns'

type NewsletterLifecycleTask = {
  input: Record<string, never>
  output: NewsletterLifecycleResult
}

export const newsletterLifecycleTask: TaskConfig<NewsletterLifecycleTask> = {
  concurrency: () => 'newsletter-lifecycle',
  handler: async ({ req }) => ({ output: await processNewsletterLifecycle({ req }) }),
  interfaceName: 'NewsletterLifecycleJobInput',
  label: 'Dispatch scheduled newsletter campaigns',
  outputSchema: [
    { name: 'failedCampaigns', type: 'number', required: true },
    { name: 'processedCampaigns', type: 'number', required: true },
    { name: 'sentCampaigns', type: 'number', required: true },
  ],
  retries: {
    attempts: 3,
    backoff: { delay: 30_000, type: 'exponential' },
  },
  schedule: [{ cron: '0 * * * * *', queue: 'newsletters' }],
  slug: 'newsletterLifecycle',
}
