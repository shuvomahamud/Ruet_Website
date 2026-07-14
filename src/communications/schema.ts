import { z } from 'zod'

export const communicationPreferencesSchema = z.object({
  allowAnnouncements: z.boolean(),
  allowNewsletters: z.boolean(),
  allowSystemEmails: z.boolean(),
})

export const newsletterCampaignActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('cancel') }),
  z.object({ action: z.enum(['retry', 'send']) }),
  z.object({
    action: z.literal('schedule'),
    scheduledAt: z.iso.datetime({ offset: true }),
  }),
])

