import type { CollectionConfig } from 'payload'

import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { chapterScopedAccess, elevatedOnly } from '@/access/roles'
import { enforceManagedChapter } from '@/hooks/enforceManagedChapter'

export const CommitteeTerms: CollectionConfig = {
  slug: 'committeeTerms',
  access: {
    create: elevatedOnly,
    delete: chapterScopedAccess('chapter'),
    read: authenticatedOrPublished,
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
          relationTo: 'media',
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [enforceManagedChapter('chapter')],
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
