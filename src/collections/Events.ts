import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { chapterScopedAccess, elevatedOnly, publishedOrManagedChapterAccess } from '@/access/roles'
import { validateNonNegativeMoney, validatePositiveInteger, validateUSD } from '@/domain/validation'
import { enforceManagedChapter } from '@/hooks/enforceManagedChapter'

export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    create: elevatedOnly,
    delete: chapterScopedAccess('chapter'),
    read: publishedOrManagedChapterAccess('chapter'),
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
      validate: validateNonNegativeMoney,
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
      validate: validateUSD,
    },
    {
      name: 'capacity',
      type: 'number',
      validate: (value: unknown) =>
        value === null || value === undefined ? true : validatePositiveInteger(value),
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
      validate: validatePositiveInteger,
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
    beforeChange: [
      enforceManagedChapter('chapter'),
      ({ data, originalDoc }) => {
        const startAt = data.startAt ?? originalDoc?.startAt
        const endAt = data.endAt ?? originalDoc?.endAt

        if (startAt && endAt && new Date(String(endAt)) <= new Date(String(startAt))) {
          throw new Error('Event end time must be after its start time.')
        }

        const capacity = data.capacity ?? originalDoc?.capacity
        const maximumQuantity =
          data.maxRegistrationQuantity ?? originalDoc?.maxRegistrationQuantity ?? 1
        if (typeof capacity === 'number' && maximumQuantity > capacity) {
          throw new Error('Maximum registration quantity cannot exceed event capacity.')
        }

        const isPaid = data.isPaid ?? originalDoc?.isPaid ?? false
        const basePrice = data.basePrice ?? originalDoc?.basePrice ?? 0
        if ((isPaid && basePrice <= 0) || (!isPaid && basePrice !== 0)) {
          throw new Error('Paid events need a positive price; free events must have a zero price.')
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
