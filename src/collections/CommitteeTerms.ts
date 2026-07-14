import type { CollectionConfig } from 'payload'

import { chapterScopedAccess, elevatedOnly, publishedOrManagedChapterAccess } from '@/access/roles'
import { enforceManagedChapter } from '@/hooks/enforceManagedChapter'

export const CommitteeTerms: CollectionConfig = {
  slug: 'committeeTerms',
  access: {
    create: elevatedOnly,
    delete: chapterScopedAccess('chapter'),
    read: publishedOrManagedChapterAccess('chapter'),
    update: chapterScopedAccess('chapter'),
  },
  admin: {
    defaultColumns: ['title', 'committeeType', 'chapter', 'isCurrent'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'committeeType',
      type: 'select',
      options: [
        { label: 'Running Committee', value: 'running' },
        { label: 'Advisory Committee', value: 'advisory' },
      ],
      required: true,
    },
    {
      name: 'chapter',
      type: 'relationship',
      relationTo: 'chapters',
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
    },
    {
      name: 'endDate',
      type: 'date',
      required: true,
    },
    {
      name: 'isCurrent',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'members',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
          required: true,
        },
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'bio',
          type: 'textarea',
        },
      ],
    },
    {
      name: 'eventRecaps',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'eventDate',
          type: 'date',
        },
        {
          name: 'summary',
          type: 'textarea',
          required: true,
        },
        {
          name: 'photoGallery',
          type: 'relationship',
          hasMany: true,
          maxRows: 6,
          relationTo: 'media',
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      enforceManagedChapter('chapter'),
      ({ data, originalDoc }) => {
        const startDate = data.startDate ?? originalDoc?.startDate
        const endDate = data.endDate ?? originalDoc?.endDate
        if (startDate && endDate && new Date(String(endDate)) < new Date(String(startDate))) {
          throw new Error('Committee end date must be on or after its start date.')
        }
        return data
      },
    ],
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
