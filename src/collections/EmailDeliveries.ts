import type { CollectionConfig } from 'payload'

import { adminsOnly, denyAll } from '@/access/roles'

export const EmailDeliveries: CollectionConfig = {
  slug: 'emailDeliveries',
  access: {
    create: denyAll,
    delete: denyAll,
    read: adminsOnly,
    update: denyAll,
  },
  admin: {
    defaultColumns: ['recipient', 'category', 'status', 'attempts', 'sentAt', 'updatedAt'],
    useAsTitle: 'subject',
  },
  fields: [
    {
      name: 'deduplicationKey',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Required or optional system message', value: 'system' },
        { label: 'Announcement', value: 'announcement' },
        { label: 'Newsletter', value: 'newsletter' },
      ],
      required: true,
    },
    {
      name: 'required',
      type: 'checkbox',
      defaultValue: false,
      required: true,
    },
    {
      name: 'recipient',
      type: 'email',
      index: true,
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
    },
    {
      name: 'template',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'queued',
      index: true,
      options: [
        { label: 'Queued', value: 'queued' },
        { label: 'Processing', value: 'processing' },
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
        { label: 'Suppressed by preference', value: 'suppressed' },
      ],
      required: true,
    },
    {
      name: 'attempts',
      type: 'number',
      defaultValue: 0,
      min: 0,
      required: true,
    },
    {
      name: 'queue',
      type: 'select',
      options: [
        { label: 'Transactional', value: 'transactional' },
        { label: 'Reminders', value: 'reminders' },
        { label: 'Waitlist', value: 'waitlist' },
        { label: 'Newsletters', value: 'newsletters' },
      ],
      required: true,
    },
    {
      name: 'jobId',
      type: 'text',
    },
    {
      name: 'provider',
      type: 'select',
      options: [
        { label: 'Local/test capture', value: 'capture' },
        { label: 'Resend', value: 'resend' },
      ],
    },
    {
      name: 'providerMessageId',
      type: 'text',
    },
    {
      name: 'lastAttemptAt',
      type: 'date',
    },
    {
      name: 'sentAt',
      type: 'date',
    },
    {
      name: 'scheduledFor',
      type: 'date',
    },
    {
      name: 'suppressedReason',
      type: 'text',
    },
    {
      name: 'errorMessage',
      type: 'textarea',
    },
  ],
}
