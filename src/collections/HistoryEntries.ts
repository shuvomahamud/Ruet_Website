import type { CollectionConfig } from 'payload'

import { adminsOnly } from '@/access/roles'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'

export const HistoryEntries: CollectionConfig = {
  slug: 'historyEntries',
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: authenticatedOrPublished,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ['title', 'startYear', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'startYear',
      type: 'number',
      required: true,
    },
    {
      name: 'endYear',
      type: 'number',
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
    },
    {
      name: 'images',
      type: 'relationship',
      hasMany: true,
      relationTo: 'media',
    },
    {
      name: 'externalLinks',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
      ],
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
