import type { CollectionConfig } from 'payload'

import { denyAll, userOrChapterScopedAccess } from '@/access/roles'
import {
  validateNonNegativeMoney,
  validateOptionalNonNegativeMoney,
  validateUSD,
} from '@/domain/validation'
import { protectImmutableFields } from '@/hooks/protectImmutableFields'
import { validateOrderRelationships } from '@/hooks/validateCommerceRelationships'
import { validateWorkflowTransition } from '@/hooks/validateWorkflowTransition'

export const Orders: CollectionConfig = {
  slug: 'orders',
  access: {
    create: denyAll,
    delete: denyAll,
    read: userOrChapterScopedAccess('user', 'chapterAttribution'),
    update: denyAll,
  },
  admin: {
    defaultColumns: ['orderType', 'paymentMethod', 'promotionCodeSnapshot', 'status', 'total'],
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
      defaultValue: 'pending',
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
      validate: validateNonNegativeMoney,
    },
    {
      name: 'discountTotal',
      type: 'number',
      defaultValue: 0,
      validate: validateNonNegativeMoney,
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      validate: validateNonNegativeMoney,
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
      required: true,
      validate: validateUSD,
    },
    {
      name: 'paymentMethod',
      type: 'select',
      defaultValue: 'zelle',
      options: [
        { label: 'Zelle', value: 'zelle' },
        { label: 'Admin Bulk', value: 'adminBulk' },
      ],
      required: true,
    },
    {
      name: 'membership',
      type: 'relationship',
      relationTo: 'memberships',
    },
    {
      name: 'eventRegistration',
      type: 'relationship',
      relationTo: 'eventRegistrations',
    },
    {
      name: 'promotion',
      type: 'relationship',
      relationTo: 'promotions',
    },
    {
      name: 'promotionCodeSnapshot',
      type: 'text',
    },
    {
      name: 'promotionDiscountTypeSnapshot',
      type: 'select',
      options: [
        { label: 'Fixed Amount', value: 'fixed' },
        { label: 'Percentage', value: 'percent' },
      ],
    },
    {
      name: 'promotionDiscountValueSnapshot',
      type: 'number',
      validate: validateOptionalNonNegativeMoney,
    },
    {
      name: 'chapterNameSnapshot',
      type: 'text',
    },
  ],
  hooks: {
    beforeChange: [
      validateOrderRelationships,
      protectImmutableFields([
        'user',
        'orderType',
        'chapterAttribution',
        'subtotal',
        'discountTotal',
        'total',
        'currency',
        'paymentMethod',
        'membership',
        'eventRegistration',
        'promotion',
        'promotionCodeSnapshot',
        'promotionDiscountTypeSnapshot',
        'promotionDiscountValueSnapshot',
        'chapterNameSnapshot',
      ]),
      validateWorkflowTransition('order'),
      ({ data, originalDoc }) => {
        const subtotal = data.subtotal ?? originalDoc?.subtotal
        const discount = data.discountTotal ?? originalDoc?.discountTotal ?? 0
        const total = data.total ?? originalDoc?.total

        if (
          typeof subtotal === 'number' &&
          typeof discount === 'number' &&
          typeof total === 'number' &&
          Math.abs(subtotal - discount - total) > 0.001
        ) {
          throw new Error('Order total must equal subtotal minus discount.')
        }
        if (typeof subtotal === 'number' && typeof discount === 'number' && discount > subtotal) {
          throw new Error('Order discount cannot exceed its subtotal.')
        }

        return data
      },
    ],
  },
}
