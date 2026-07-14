import { z } from 'zod'

const optionalText = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined),
  z.string().max(120).optional(),
)

export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters.')
  .max(128, 'Password is too long.')
  .regex(/[a-z]/, 'Password must include a lowercase letter.')
  .regex(/[A-Z]/, 'Password must include an uppercase letter.')
  .regex(/[0-9]/, 'Password must include a number.')

export const signupSchema = z
  .object({
    city: z.string().trim().min(1).max(120),
    confirmPassword: z.string(),
    country: z.string().trim().min(1).max(120).default('United States'),
    email: z.email().transform((value) => value.toLowerCase()),
    firstName: z.string().trim().min(1).max(80),
    graduationYear: z.coerce
      .number()
      .int()
      .min(1964)
      .max(new Date().getUTCFullYear() + 8),
    lastName: z.string().trim().min(1).max(80),
    password: passwordSchema,
    primaryChapter: z.coerce.number().int().positive(),
    privacyAccepted: z.literal(true),
    ruetDepartment: z.string().trim().min(1).max(120),
    state: z.string().trim().min(1).max(120),
    termsAccepted: z.literal(true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export const emailSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()),
})

export const profileSchema = z.object({
  alumniReference: optionalText,
  city: z.string().trim().min(1).max(120),
  communicationPreferences: z.object({
    allowAnnouncements: z.boolean(),
    allowNewsletters: z.boolean(),
    allowSystemEmails: z.boolean(),
  }),
  country: z.string().trim().min(1).max(120),
  employer: optionalText,
  firstName: z.string().trim().min(1).max(80),
  graduationYear: z.coerce
    .number()
    .int()
    .min(1964)
    .max(new Date().getUTCFullYear() + 8),
  lastName: z.string().trim().min(1).max(80),
  phoneNumber: optionalText,
  primaryChapter: z.coerce.number().int().positive(),
  professionalTitle: optionalText,
  ruetDepartment: z.string().trim().min(1).max(120),
  state: z.string().trim().min(1).max(120),
})

export const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE MY ACCOUNT'),
  password: z.string().optional(),
})
