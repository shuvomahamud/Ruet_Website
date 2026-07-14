import type { CollectionConfig } from 'payload'

import { adminsOnly } from '@/access/roles'
import { anyone } from '@/access/anyone'

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: anyone,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ['code', 'scope', 'discountType', 'active'],
    useAsTitle: 'code',
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'scope',
      type: 'select',
      options: [
        { label: 'Membership', value: 'membership' },
        { label: 'Event', value: 'event' },
        { label: 'Both', value: 'both' },
      ],
      required: true,
    },
    {
      name: 'discountType',
      type: 'select',
      options: [
        { label: 'Fixed Amount', value: 'fixed' },
        { label: 'Percentage', value: 'percent' },
      ],
      required: true,
    },
    {
      name: 'discountValue',
      type: 'number',
      required: true,
    },
    {
      name: 'startsAt',
      type: 'date',
    },
    {
      name: 'endsAt',
      type: 'date',
    },
    {
      name: 'usageLimit',
      type: 'number',
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'memberOnly',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
