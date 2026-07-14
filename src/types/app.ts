export const USER_ROLES = ['member', 'chapterAdmin', 'admin', 'superAdmin'] as const

export type UserRole = (typeof USER_ROLES)[number]

export const ACCOUNT_STATUSES = ['pending', 'active', 'suspended', 'deleted'] as const

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number]

export const MEMBERSHIP_STATUSES = [
  'pending_payment',
  'pending_manual_approval',
  'active',
  'grace_period',
  'expired',
  'failed_manual_payment',
  'cancelled_by_admin',
  'suspended',
] as const

export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number]

export const EVENT_MODES = ['inPerson', 'virtual', 'hybrid'] as const

export type EventMode = (typeof EVENT_MODES)[number]

export const PAYMENT_METHODS = ['stripe', 'zelle'] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]
