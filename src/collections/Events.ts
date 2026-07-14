import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { chapterScopedAccess, elevatedOnly } from '@/access/roles'
import { enforceManagedChapter } from '@/hooks/enforceManagedChapter'

export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    create: elevatedOnly,
    delete: chapterScopedAccess('chapter'),
    read: authenticatedOrPublished,
    update: chapterScopedAccess('chapter'),
  },
  admin: {
    defaultColumns: ['title', 'chapter', 'status', 'startAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
    {
      name: 'chapter',
      type: 'relationship',
      relationTo: 'chapters',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
      required: true,
    },
    {
      name: 'eventMode',
      type: 'select',
      options: [
        { label: 'In Person', value: 'inPerson' },
        { label: 'Virtual', value: 'virtual' },
        { label: 'Hybrid', value: 'hybrid' },
      ],
      required: true,
    },
    {
      name: 'startAt',
      type: 'date',
      required: true,
    },
    {
      name: 'endAt',
      type: 'date',
      required: true,
    },
    {
      name: 'timezone',
      type: 'select',
      defaultValue: 'America/New_York',
      options: [
        { label: 'Eastern Time', value: 'America/New_York' },
        { label: 'Central Time', value: 'America/Chicago' },
        { label: 'Mountain Time', value: 'America/Denver' },
        { label: 'Pacific Time', value: 'America/Los_Angeles' },
      ],
      required: true,
    },
    {
      name: 'venue',
      type: 'text',
    },
    {
      name: 'virtualLink',
      type: 'text',
    },
    {
      name: 'virtualAccessVisibility',
      type: 'select',
      defaultValue: 'public',
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Registered Users', value: 'registered' },
      ],
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'details',
      type: 'textarea',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'isPaid',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'basePrice',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
    },
    {
      name: 'capacity',
      type: 'number',
    },
    {
      name: 'waitlistEnabled',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'maxRegistrationQuantity',
      type: 'number',
      defaultValue: 1,
    },
    {
      name: 'galleryAfterCompletion',
      type: 'relationship',
      hasMany: true,
      relationTo: 'media',
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
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
