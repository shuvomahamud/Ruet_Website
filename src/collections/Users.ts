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
import { activeAccountHooks } from '@/hooks/enforceActiveAccount'
import { enforceUserRoleHierarchy } from '@/hooks/enforceUserRoleHierarchy'
import { validateUserChapter } from '@/hooks/validateUserChapter'
import { validateResetPassword, validateUserPassword } from '@/hooks/validateUserPassword'
import { env } from '@/utilities/env'

const emailButton = (href: string, label: string) =>
  `<a href="${href}" style="background:#1e4faf;border-radius:8px;color:#fff;display:inline-block;font-family:Arial,sans-serif;font-weight:700;padding:12px 18px;text-decoration:none">${label}</a>`

const emailShell = (heading: string, body: string, action: string) =>
  `<div style="font-family:Arial,sans-serif;line-height:1.6;max-width:600px"><h1 style="color:#12306b">${heading}</h1><p>${body}</p>${action}<p style="color:#5b6572;font-size:14px">If you did not request this, you can ignore this email.</p></div>`

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
    defaultColumns: ['email', 'role', 'accountStatus', 'updatedAt'],
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
        return emailShell(
          'Reset your RUETIAN USA password',
          'Use the secure link below within one hour to choose a new password.',
          emailButton(href, 'Reset password'),
        )
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
        return emailShell(
          'Verify your RUETIAN USA email',
          'Confirm your email address to activate password sign-in.',
          emailButton(href, 'Verify email'),
        )
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
      defaultValue: 'active',
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
      name: 'graduationYear',
      type: 'number',
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
      name: 'privacyAcceptedAt',
      type: 'date',
      access: {
        create: publicSignupFieldAccess,
        update: serverFieldOnly,
      },
      admin: { readOnly: true },
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
      validateUserPassword,
      enforceUserRoleHierarchy,
      validateUserChapter,
      deriveProfileStatus,
    ],
  },
}
