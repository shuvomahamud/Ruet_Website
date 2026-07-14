import { z } from 'zod'

export const contactSubmissionSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
  message: z.string().trim().min(20, 'Please include at least 20 characters.').max(5_000),
  name: z.string().trim().min(2).max(120),
  subject: z.string().trim().min(3).max(180),
  topic: z.enum(['general', 'membership', 'chapter', 'events', 'website']),
  website: z.string().max(0).optional(),
})
