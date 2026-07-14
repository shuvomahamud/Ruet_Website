import type { CollectionConfig } from 'payload'

import { adminsOnly } from '@/access/roles'

export const NewsletterCampaigns: CollectionConfig = {
  slug: 'newsletterCampaigns',
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: adminsOnly,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ['title', 'status', 'scheduledAt', 'sentAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
    },
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
    {
      name: 'audience',
      type: 'select',
      options: [
        { label: 'All Users', value: 'all' },
        { label: 'Members', value: 'members' },
      ],
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Sent', value: 'sent' },
      ],
      required: true,
    },
    {
      name: 'scheduledAt',
      type: 'date',
    },
    {
      name: 'sentAt',
      type: 'date',
    },
  ],
}
