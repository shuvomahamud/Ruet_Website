import type { CollectionConfig } from 'payload'

import { adminsOnly, userScopedAccess } from '@/access/roles'

export const Payments: CollectionConfig = {
  slug: 'payments',
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: userScopedAccess('user'),
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ['paymentSource', 'status', 'submittedAt', 'updatedAt'],
    useAsTitle: 'status',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
      required: true,
    },
    {
      name: 'paymentSource',
      type: 'select',
      options: [
        { label: 'Stripe', value: 'stripe' },
        { label: 'Zelle', value: 'zelle' },
      ],
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Failed', value: 'failed' },
      ],
      required: true,
    },
    {
      name: 'externalReference',
      type: 'text',
    },
    {
      name: 'proofImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'proofTransactionId',
      type: 'text',
    },
    {
      name: 'submittedAt',
      type: 'date',
    },
    {
      name: 'firstReviewerChapter',
      type: 'relationship',
      relationTo: 'chapters',
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'approvedAt',
      type: 'date',
    },
    {
      name: 'rejectedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'rejectedAt',
      type: 'date',
    },
    {
      name: 'rejectionReason',
      type: 'textarea',
    },
  ],
}
