import type { CollectionConfig } from 'payload'

import { adminsOnly, userScopedAccess } from '@/access/roles'
import { authenticated } from '@/access/authenticated'

export const EventRegistrations: CollectionConfig = {
  slug: 'eventRegistrations',
  access: {
    create: authenticated,
    delete: adminsOnly,
    read: userScopedAccess('user'),
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ['event', 'user', 'status', 'paymentStatus'],
    useAsTitle: 'status',
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'quantity',
      type: 'number',
      defaultValue: 1,
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Waitlisted', value: 'waitlisted' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      required: true,
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders',
    },
    {
      name: 'paymentStatus',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'registrationPriceSnapshot',
      type: 'number',
    },
    {
      name: 'discountSnapshot',
      type: 'number',
    },
    {
      name: 'waitlistPosition',
      type: 'number',
    },
  ],
}
