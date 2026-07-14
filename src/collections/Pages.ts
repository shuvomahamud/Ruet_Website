import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminsOnly } from '@/access/roles'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: authenticatedOrPublished,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'heroEyebrow',
      type: 'text',
    },
    {
      name: 'heroTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'heroDescription',
      type: 'textarea',
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'sections',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'eyebrow',
          type: 'text',
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
        },
        {
          name: 'ctaLabel',
          type: 'text',
        },
        {
          name: 'ctaHref',
          type: 'text',
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField({
      position: undefined,
    }),
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
