import type { CollectionConfig } from 'payload'

import { adminsOnly } from '@/access/roles'
import { validateNonNegativeInteger, validateNonNegativeMoney } from '@/domain/validation'

export const Promotions: CollectionConfig = {
  slug: 'promotions',
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: adminsOnly,
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
      validate: validateNonNegativeMoney,
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
      validate: (value: unknown) =>
        value === null || value === undefined ? true : validateNonNegativeInteger(value),
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
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const discountType = data.discountType ?? originalDoc?.discountType
        const discountValue = data.discountValue ?? originalDoc?.discountValue
        const startsAt = data.startsAt ?? originalDoc?.startsAt
        const endsAt = data.endsAt ?? originalDoc?.endsAt

        if (
          discountType === 'percent' &&
          typeof discountValue === 'number' &&
          discountValue > 100
        ) {
          throw new Error('Percentage discounts cannot exceed 100%.')
        }
        if (startsAt && endsAt && new Date(String(endsAt)) <= new Date(String(startsAt))) {
          throw new Error('Promotion end time must be after its start time.')
        }

        return data
      },
    ],
  },
}
