import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminsOnly } from '@/access/roles'
import { anyone } from '@/access/anyone'

export const MembershipPlans: CollectionConfig = {
  slug: 'membershipPlans',
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: anyone,
    update: adminsOnly,
  },
  admin: {
    defaultColumns: ['title', 'annualPrice', 'active', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
    {
      name: 'publicSummary',
      type: 'textarea',
    },
    {
      name: 'benefits',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'annualPrice',
      type: 'number',
      defaultValue: 50,
      required: true,
    },
    {
      name: 'currency',
      type: 'text',
      defaultValue: 'USD',
      required: true,
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'autoRenewEnabled',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'gracePeriodDays',
      type: 'number',
      defaultValue: 7,
    },
  ],
}
