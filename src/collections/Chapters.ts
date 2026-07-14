import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminsOnly, superAdminsOnly } from '@/access/roles'
import { anyone } from '@/access/anyone'

export const Chapters: CollectionConfig = {
  slug: 'chapters',
  access: {
    create: superAdminsOnly,
    delete: superAdminsOnly,
    read: anyone,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ['name', 'chapterStatus', 'updatedAt'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
    {
      name: 'chapterStatus',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Planning', value: 'planning' },
      ],
      required: true,
    },
    {
      name: 'regionOrState',
      type: 'text',
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'chapterAdmins',
      type: 'relationship',
      hasMany: true,
      relationTo: 'users',
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 250,
      },
      schedulePublish: true,
    },
  },
}
