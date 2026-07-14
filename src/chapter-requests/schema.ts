import { z } from 'zod'

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined),
    z.string().max(maximum).optional(),
  )

export const chapterRequestSchema = z.object({
  motivation: optionalText(2_000),
  requestedName: z.string().trim().min(3).max(160),
  requestedRegion: optionalText(160),
})

export const chapterRequestReviewSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  notes: optionalText(2_000),
})
