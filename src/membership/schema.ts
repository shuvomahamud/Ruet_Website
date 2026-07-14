import { z } from 'zod'

export const membershipQuoteSchema = z.object({
  promotionCode: z
    .string()
    .trim()
    .max(80)
    .transform((value) => value.toUpperCase())
    .optional(),
})

export const membershipCheckoutSchema = z.object({
  intent: z.enum(['join', 'renewal', 'reactivation', 'resubmit']),
  paymentTermsAccepted: z.literal(true),
  promotionCode: z
    .string()
    .trim()
    .max(80)
    .transform((value) => value.toUpperCase())
    .optional(),
  transactionId: z.string().trim().max(160).optional(),
})

export const membershipPaymentReviewSchema = z.object({
  decision: z.enum(['approve', 'reject']),
  reason: z.string().trim().max(2_000).optional(),
})
