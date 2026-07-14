import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import {
  adminsOrManagedChapterUsers,
  adminsOrSelf,
  adminFieldOnly,
  isElevated,
} from '@/access/roles'
import { assignFirstUserRole } from '@/hooks/assignFirstUserRole'
import { enforceUserRoleHierarchy } from '@/hooks/enforceUserRoleHierarchy'
import { validateUserChapter } from '@/hooks/validateUserChapter'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req }) => isElevated(req.user),
    create: anyone,
    delete: adminsOrSelf,
    read: adminsOrManagedChapterUsers,
    update: adminsOrSelf,
  },
  admin: {
    defaultColumns: ['email', 'role', 'accountStatus', 'updatedAt'],
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
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
  ],
  hooks: {
    beforeChange: [assignFirstUserRole, enforceUserRoleHierarchy, validateUserChapter],
  },
}
