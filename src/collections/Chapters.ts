import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import {
  adminFieldOnly,
  managedChapterAccessByDocumentID,
  publishedOrManagedChapterDocumentAccess,
  superAdminsOnly,
} from '@/access/roles'

export const Chapters: CollectionConfig = {
  slug: 'chapters',
  access: {
    create: superAdminsOnly,
    delete: superAdminsOnly,
    read: publishedOrManagedChapterDocumentAccess,
    update: managedChapterAccessByDocumentID,
  },
  admin: {
    defaultColumns: ['name', 'chapterStatus', 'updatedAt'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      access: {
        update: adminFieldOnly,
      },
      required: true,
    },
    slugField({
      position: undefined,
    }),
    {
      name: 'chapterStatus',
      type: 'select',
      access: {
        update: adminFieldOnly,
      },
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
      access: {
        create: adminFieldOnly,
        update: adminFieldOnly,
      },
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
