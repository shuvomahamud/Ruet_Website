import type { CollectionConfig } from 'payload'

import {
  adminsOrManagedChapterUsers,
  adminsOrSelf,
  adminFieldOnly,
  denyAll,
  isElevated,
  publicSignupFieldAccess,
  publicUserCreateAccess,
  serverFieldOnly,
} from '@/access/roles'
import { googleSessionStrategy } from '@/auth/google-session-strategy'
import { assignFirstUserRole } from '@/hooks/assignFirstUserRole'
import { deriveProfileStatus } from '@/hooks/deriveProfileStatus'
import { normalizeRollNumber } from '@/hooks/normalizeRollNumber'
import { activeAccountHooks } from '@/hooks/enforceActiveAccount'
import { enforceUserRoleHierarchy } from '@/hooks/enforceUserRoleHierarchy'
import { validateUserChapter } from '@/hooks/validateUserChapter'
import { validateResetPassword, validateUserPassword } from '@/hooks/validateUserPassword'
import { renderEmailTemplate } from '@/email/templates'
import { env } from '@/utilities/env'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req }) => isElevated(req.user),
    create: publicUserCreateAccess,
    delete: denyAll,
    read: adminsOrManagedChapterUsers,
    update: adminsOrSelf,
  },
  admin: {
    components: {
      beforeListTable: ['@/components/admin/UserBulkActions#UserBulkActions'],
    },
    defaultColumns: ['email', 'rollNumber', 'role', 'accountStatus', 'updatedAt'],
    useAsTitle: 'email',
  },
  auth: {
    cookies: {
      sameSite: 'Lax',
      secure: env.NODE_ENV === 'production',
    },
    forgotPassword: {
      expiration: 60 * 60 * 1000,
      generateEmailHTML: (args) => {
        const token = args?.token
        const href = `${env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${encodeURIComponent(token ?? '')}`
        return renderEmailTemplate('passwordReset', { actionUrl: href }).html
      },
      generateEmailSubject: () => 'Reset your RUETIAN USA password',
    },
    lockTime: 15 * 60 * 1000,
    maxLoginAttempts: 5,
    removeTokenFromResponses: true,
    strategies: [googleSessionStrategy],
    tokenExpiration: 7 * 24 * 60 * 60,
    useSessions: true,
    verify: {
      generateEmailHTML: ({ token }) => {
        const href = `${env.NEXT_PUBLIC_SITE_URL}/verify-email?token=${encodeURIComponent(token)}`
        return renderEmailTemplate('accountVerification', { actionUrl: href }).html
      },
      generateEmailSubject: () => 'Verify your RUETIAN USA email',
    },
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      access: {
        update: adminFieldOnly,
      },
      required: true,
      unique: true,
    },
    {
      name: 'firstName',
      type: 'text',
    },
    {
      name: 'lastName',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      access: {
        create: adminFieldOnly,
        update: adminFieldOnly,
      },
      defaultValue: 'member',
      options: [
        { label: 'Member', value: 'member' },
        { label: 'Chapter Admin', value: 'chapterAdmin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Super Admin', value: 'superAdmin' },
      ],
      required: true,
    },
    {
      name: 'accountStatus',
      type: 'select',
      access: {
        create: adminFieldOnly,
        update: adminFieldOnly,
      },
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Deleted', value: 'deleted' },
      ],
      required: true,
    },
    {
      name: 'authMethods',
      type: 'select',
      access: {
        create: serverFieldOnly,
        update: serverFieldOnly,
      },
      defaultValue: ['password'],
      hasMany: true,
      options: [
        { label: 'Password', value: 'password' },
        { label: 'Google', value: 'google' },
      ],
    },
    {
      name: 'googleSubject',
      type: 'text',
      access: {
        create: serverFieldOnly,
        read: serverFieldOnly,
        update: serverFieldOnly,
      },
      admin: { hidden: true },
      index: true,
      unique: true,
    },
    {
      name: 'profileStatus',
      type: 'select',
      access: {
        create: serverFieldOnly,
        update: serverFieldOnly,
      },
      defaultValue: 'incomplete',
      options: [
        { label: 'Incomplete', value: 'incomplete' },
        { label: 'Complete', value: 'complete' },
      ],
    },
    {
      name: 'primaryChapter',
      type: 'relationship',
      relationTo: 'chapters',
    },
    {
      name: 'managedChapters',
      type: 'relationship',
      access: {
        create: adminFieldOnly,
        update: adminFieldOnly,
      },
      hasMany: true,
      relationTo: 'chapters',
    },
    {
      name: 'phoneNumber',
      type: 'text',
    },
    {
      name: 'ruetDepartment',
      type: 'text',
    },
    {
      name: 'rollNumber',
      type: 'text',
      admin: {
        description: 'RUET roll number. Spaces are removed and letters are stored uppercase.',
      },
      index: true,
      unique: true,
    },
    {
      name: 'alumniReference',
      type: 'text',
    },
    {
      name: 'city',
      type: 'text',
    },
    {
      name: 'state',
      type: 'text',
    },
    {
      name: 'country',
      type: 'text',
      defaultValue: 'United States',
    },
    {
      name: 'employer',
      type: 'text',
    },
    {
      name: 'professionalTitle',
      type: 'text',
    },
    {
      name: 'communicationPreferences',
      type: 'group',
      fields: [
        {
          name: 'allowAnnouncements',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'allowNewsletters',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'allowSystemEmails',
          type: 'checkbox',
          admin: {
            description:
              'Controls optional reminders only. Required security and transaction messages always send.',
          },
          defaultValue: true,
        },
      ],
    },
    {
      name: 'termsAcceptedAt',
      type: 'date',
      access: {
        create: publicSignupFieldAccess,
        update: serverFieldOnly,
      },
      admin: { readOnly: true },
    },
    {
      name: 'termsVersionAccepted',
      type: 'text',
      access: {
        create: publicSignupFieldAccess,
        update: serverFieldOnly,
      },
      admin: {
        description: 'Terms of Use version acknowledged when this account was created.',
        readOnly: true,
      },
    },
    {
      name: 'privacyAcceptedAt',
      type: 'date',
      access: {
        create: publicSignupFieldAccess,
        update: serverFieldOnly,
      },
      admin: { readOnly: true },
    },
    {
      name: 'privacyVersionAccepted',
      type: 'text',
      access: {
        create: publicSignupFieldAccess,
        update: serverFieldOnly,
      },
      admin: {
        description: 'Privacy Policy version acknowledged when this account was created.',
        readOnly: true,
      },
    },
    {
      name: 'deletedAt',
      type: 'date',
      access: {
        create: serverFieldOnly,
        update: serverFieldOnly,
      },
      admin: { readOnly: true },
    },
    {
      name: 'anonymizedReference',
      type: 'text',
      access: {
        create: serverFieldOnly,
        update: serverFieldOnly,
      },
      admin: { readOnly: true },
      index: true,
      unique: true,
    },
  ],
  hooks: {
    ...activeAccountHooks,
    beforeOperation: [validateResetPassword],
    beforeChange: [
      assignFirstUserRole,
      normalizeRollNumber,
      validateUserPassword,
      enforceUserRoleHierarchy,
      validateUserChapter,
      deriveProfileStatus,
    ],
  },
}
