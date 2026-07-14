import type { CollectionConfig } from 'payload'

import { newsletterDeleteAccess } from '@/access/newsletters'
import { adminsOnly, serverFieldOnly } from '@/access/roles'
import { prepareNewsletterCampaign } from '@/hooks/prepareNewsletterCampaign'

export const NewsletterCampaigns: CollectionConfig = {
  slug: 'newsletterCampaigns',
  access: {
    create: adminsOnly,
    delete: newsletterDeleteAccess,
    read: adminsOnly,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ['title', 'audience', 'status', 'scheduledAt', 'sentAt', 'recipientCount'],
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
        { label: 'All active verified accounts', value: 'all' },
        { label: 'Active or grace-period members', value: 'members' },
      ],
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      access: {
        create: serverFieldOnly,
        update: serverFieldOnly,
      },
      defaultValue: 'draft',
      index: true,
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Sending', value: 'sending' },
        { label: 'Sent', value: 'sent' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Dispatch failed', value: 'failed' },
      ],
      required: true,
    },
    {
      name: 'scheduledAt',
      type: 'date',
      access: { create: serverFieldOnly, update: serverFieldOnly },
      index: true,
    },
    {
      name: 'sendStartedAt',
      type: 'date',
      access: { create: serverFieldOnly, update: serverFieldOnly },
    },
    {
      name: 'sentAt',
      type: 'date',
      access: { create: serverFieldOnly, update: serverFieldOnly },
    },
    {
      name: 'cancelledAt',
      type: 'date',
      access: { create: serverFieldOnly, update: serverFieldOnly },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      access: { create: serverFieldOnly, update: serverFieldOnly },
      relationTo: 'users',
    },
    {
      name: 'lastActionBy',
      type: 'relationship',
      access: { create: serverFieldOnly, update: serverFieldOnly },
      relationTo: 'users',
    },
    {
      name: 'recipientCount',
      type: 'number',
      access: { create: serverFieldOnly, update: serverFieldOnly },
      defaultValue: 0,
      min: 0,
      required: true,
    },
    {
      name: 'queuedCount',
      type: 'number',
      access: { create: serverFieldOnly, update: serverFieldOnly },
      defaultValue: 0,
      min: 0,
      required: true,
    },
    {
      name: 'suppressedCount',
      type: 'number',
      access: { create: serverFieldOnly, update: serverFieldOnly },
      defaultValue: 0,
      min: 0,
      required: true,
    },
    {
      name: 'failedCount',
      type: 'number',
      access: { create: serverFieldOnly, update: serverFieldOnly },
      defaultValue: 0,
      min: 0,
      required: true,
    },
    {
      name: 'sendError',
      type: 'textarea',
      access: { create: serverFieldOnly, update: serverFieldOnly },
      admin: { description: 'Sanitized campaign dispatch failure summary.' },
    },
  ],
  hooks: {
    beforeChange: [prepareNewsletterCampaign],
  },
}
