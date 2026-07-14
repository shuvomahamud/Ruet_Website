import type { CollectionBeforeChangeHook, CollectionBeforeOperationHook } from 'payload'

import { passwordSchema } from '@/auth/schemas'
import { AppError } from '@/utilities/errors'

export const validateUserPassword: CollectionBeforeChangeHook = ({ data, req }) => {
  if (typeof data.password !== 'string' || req.context?.systemGeneratedPassword === true)
    return data

  const result = passwordSchema.safeParse(data.password)
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message ?? 'Use a stronger password.', {
      code: 'WEAK_PASSWORD',
      status: 400,
    })
  }

  return data
}

export const validateResetPassword: CollectionBeforeOperationHook<'users'> = ({
  args,
  operation,
}) => {
  if (operation !== 'resetPassword') return args

  const password = args.data.password
  const result = passwordSchema.safeParse(password)
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message ?? 'Use a stronger password.', {
      code: 'WEAK_PASSWORD',
      status: 400,
    })
  }

  return args
}
