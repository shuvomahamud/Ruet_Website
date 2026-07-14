import type { UserRole } from '@/types/app'

const elevatedRoles: UserRole[] = ['chapterAdmin', 'admin', 'superAdmin']
const adminRoles: UserRole[] = ['admin', 'superAdmin']

export const isElevatedRole = (role: UserRole | null | undefined): boolean =>
  role ? elevatedRoles.includes(role) : false

export const isAdminRole = (role: UserRole | null | undefined): boolean =>
  role ? adminRoles.includes(role) : false

export const canManageManualPayments = (role: UserRole | null | undefined): boolean =>
  role ? elevatedRoles.includes(role) : false
