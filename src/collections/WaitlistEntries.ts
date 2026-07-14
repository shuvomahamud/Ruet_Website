import type { CollectionConfig } from 'payload'

import { adminsOnly, userScopedAccess } from '@/access/roles'
import { authenticated } from '@/access/authenticated'

export const WaitlistEntries: CollectionConfig = {
  slug: 'waitlistEntries',
  access: {
    create: authenticated,
    delete: adminsOnly,
    read: userScopedAccess('user'),
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ['event', 'user', 'status', 'joinedAt'],
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
      name: 'joinedAt',
      type: 'date',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Waiting', value: 'waiting' },
        { label: 'Promoted', value: 'promoted' },
        { label: 'Expired', value: 'expired' },
      ],
      required: true,
    },
    {
      name: 'promotedAt',
      type: 'date',
    },
    {
      name: 'promotionExpiryAt',
      type: 'date',
    },
  ],
}
