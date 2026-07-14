import type { CollectionConfig } from 'payload'

import { adminsOnly, denyAll, isAdmin, publicContactCreateAccess } from '@/access/roles'

export const ContactSubmissions: CollectionConfig = {
  slug: 'contactSubmissions',
  access: {
    create: publicContactCreateAccess,
    delete: denyAll,
    read: adminsOnly,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ['subject', 'name', 'email', 'status', 'submittedAt'],
    useAsTitle: 'subject',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'subject', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'topic',
      type: 'select',
      defaultValue: 'general',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Membership', value: 'membership' },
        { label: 'Chapter support', value: 'chapter' },
        { label: 'Events', value: 'events' },
        { label: 'Website help', value: 'website' },
      ],
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'In review', value: 'in_review' },
        { label: 'Closed', value: 'closed' },
      ],
      required: true,
    },
    {
      name: 'submittedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      required: true,
    },
    {
      name: 'internalNotes',
      type: 'textarea',
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation !== 'create' || isAdmin(req.user)) return data
        return {
          ...data,
          internalNotes: undefined,
          status: 'new',
          submittedAt: new Date().toISOString(),
        }
      },
    ],
  },
}
