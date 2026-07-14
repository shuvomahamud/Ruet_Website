import { z } from 'zod'

const quantity = z.coerce.number().int().min(1).max(100)

export const eventQuoteSchema = z.object({
  promotionCode: z
    .string()
    .trim()
    .max(80)
    .transform((value) => value.toUpperCase())
    .optional(),
  quantity,
})

export const eventRegistrationSchema = z.object({
  intent: z.enum(['accept_offer', 'register', 'resubmit', 'waitlist']),
  paymentTermsAccepted: z.boolean().default(false),
  promotionCode: z
    .string()
    .trim()
    .max(80)
    .transform((value) => value.toUpperCase())
    .optional(),
  quantity,
  transactionId: z.string().trim().max(160).optional(),
})
