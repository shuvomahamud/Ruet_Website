import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminsOnly } from '@/access/roles'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { seoFields } from '@/fields/seo'

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
      name: 'pageType',
      type: 'select',
      defaultValue: 'standard',
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Institutional', value: 'institutional' },
        { label: 'Legal', value: 'legal' },
      ],
    },
    {
      name: 'legalStatus',
      type: 'select',
      admin: {
        condition: (_, siblingData) => siblingData?.pageType === 'legal',
      },
      defaultValue: 'placeholder',
      options: [
        { label: 'Placeholder — approval pending', value: 'placeholder' },
        { label: 'Approved', value: 'approved' },
      ],
    },
    {
      name: 'lastReviewedAt',
      type: 'date',
      admin: {
        condition: (_, siblingData) => siblingData?.pageType === 'legal',
      },
    },
    {
      name: 'sections',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'anchor',
          type: 'text',
          admin: {
            description: 'Optional URL-safe anchor used by legal tables of contents.',
          },
        },
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
    seoFields(),
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
