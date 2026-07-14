import type { CollectionConfig } from 'payload'

import { adminsOnly, userScopedAccess } from '@/access/roles'

export const Orders: CollectionConfig = {
  slug: 'orders',
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: userScopedAccess('user'),
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ['orderType', 'status', 'total', 'updatedAt'],
    useAsTitle: 'orderType',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'orderType',
      type: 'select',
      options: [
        { label: 'Membership', value: 'membership' },
        { label: 'Event', value: 'event' },
      ],
      required: true,
    },
    {
      name: 'chapterAttribution',
      type: 'relationship',
      relationTo: 'chapters',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      required: true,
    },
    {
      name: 'subtotal',
      type: 'number',
      required: true,
    },
    {
      name: 'discountTotal',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'total',
      type: 'number',
      required: true,
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
      required: true,
    },
    {
      name: 'paymentMethod',
      type: 'select',
      options: [
        { label: 'Stripe', value: 'stripe' },
        { label: 'Zelle', value: 'zelle' },
      ],
    },
    {
      name: 'stripeSessionId',
      type: 'text',
    },
  ],
}
