import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { activeOrAdmins, superAdminsOnly } from '@/access/roles'
import {
  validateNonNegativeInteger,
  validateNonNegativeMoney,
  validateUSD,
} from '@/domain/validation'
import { validateSingleActiveMembershipPlan } from '@/hooks/validateMembershipPlan'

export const MembershipPlans: CollectionConfig = {
  slug: 'membershipPlans',
  access: {
    create: superAdminsOnly,
    delete: superAdminsOnly,
    read: activeOrAdmins,
    update: superAdminsOnly,
  },
  admin: {
    defaultColumns: ['title', 'annualPrice', 'gracePeriodDays', 'active', 'updatedAt'],
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
      name: 'faqs',
      type: 'array',
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
    {
      name: 'renewalPolicy',
      type: 'textarea',
      defaultValue:
        'Membership is annual and renews only after a new Zelle payment proof is approved. The website never debits members automatically.',
      required: true,
    },
    {
      name: 'termsSummary',
      type: 'textarea',
      defaultValue:
        'Membership activates after the annual Zelle payment is manually approved. Payments are non-refundable and renewal is never automatic.',
      required: true,
    },
    {
      name: 'annualPrice',
      type: 'number',
      defaultValue: 50,
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
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'renewalReminderEnabled',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'renewalReminderDaysBefore',
      type: 'number',
      defaultValue: 30,
      validate: validateNonNegativeInteger,
    },
    {
      name: 'gracePeriodDays',
      type: 'number',
      defaultValue: 7,
      validate: validateNonNegativeInteger,
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      validate: validateNonNegativeInteger,
    },
  ],
  hooks: {
    beforeChange: [validateSingleActiveMembershipPlan],
  },
}
