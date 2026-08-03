import { z } from 'zod'

const quantity = z.coerce.number().int().min(1).max(100)
const ticketSelections = z
  .array(
    z.object({
      quantity,
      tierID: z.string().trim().min(1).max(120),
    }),
  )
  .max(20)
  .optional()

export const eventQuoteSchema = z.object({
  promotionCode: z
    .string()
    .trim()
    .max(80)
    .transform((value) => value.toUpperCase())
    .optional(),
  quantity,
  ticketSelections,
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
  ticketSelections,
  transactionId: z.string().trim().max(160).optional(),
})
