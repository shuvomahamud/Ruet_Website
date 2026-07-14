import type { CollectionConfig } from 'payload'

import { adminsOnly } from '@/access/roles'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import {
  createPreviewURL,
  editorialFields,
  enforceEditorialWorkflow,
} from '@/cms/editorial-workflow'
import { revalidateCollectionPaths } from '@/cms/revalidation'

const revalidation = revalidateCollectionPaths(['/history'])

export const HistoryEntries: CollectionConfig = {
  slug: 'historyEntries',
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: authenticatedOrPublished,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ['title', 'startYear', 'featured', 'editorialStatus', '_status', 'updatedAt'],
    description: 'Chronological milestones, supporting media, documents, and external records.',
    listSearchableFields: ['title', 'summary', 'body'],
    preview: createPreviewURL('historyEntries'),
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
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      required: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'images',
      type: 'relationship',
      hasMany: true,
      relationTo: 'media',
    },
    {
      name: 'documents',
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
    ...editorialFields(),
  ],
  hooks: {
    afterChange: [revalidation.afterChange],
    afterDelete: [revalidation.afterDelete],
    beforeChange: [enforceEditorialWorkflow],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 250,
      },
      schedulePublish: true,
    },
  },
}
