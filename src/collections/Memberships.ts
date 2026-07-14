import type { CollectionConfig } from 'payload'

import { denyAll, userOrChapterScopedAccess } from '@/access/roles'
import { validateNonNegativeMoney, validateUSD } from '@/domain/validation'
import { protectImmutableFields } from '@/hooks/protectImmutableFields'
import { validateMembershipSnapshots } from '@/hooks/validateCommerceRelationships'
import { validateWorkflowTransition } from '@/hooks/validateWorkflowTransition'

export const Memberships: CollectionConfig = {
  slug: 'memberships',
  access: {
    create: denyAll,
    delete: denyAll,
    read: userOrChapterScopedAccess('user', 'chapterAttribution'),
    update: denyAll,
  },
  admin: {
    defaultColumns: ['user', 'status', 'renewalAt', 'updatedAt'],
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
      name: 'plan',
      type: 'relationship',
      relationTo: 'membershipPlans',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Pending Payment', value: 'pending_payment' },
        { label: 'Pending Manual Approval', value: 'pending_manual_approval' },
        { label: 'Active', value: 'active' },
        { label: 'Grace Period', value: 'grace_period' },
        { label: 'Expired', value: 'expired' },
        { label: 'Failed Manual Payment', value: 'failed_manual_payment' },
        { label: 'Cancelled By Admin', value: 'cancelled_by_admin' },
        { label: 'Suspended', value: 'suspended' },
      ],
    },
    {
      name: 'startedAt',
      type: 'date',
    },
    {
      name: 'renewalAt',
      type: 'date',
    },
    {
      name: 'expiresAt',
      type: 'date',
    },
    {
      name: 'graceEndsAt',
      type: 'date',
    },
    {
      name: 'paymentMethod',
      type: 'select',
      defaultValue: 'zelle',
      options: [{ label: 'Zelle', value: 'zelle' }],
      required: true,
    },
    {
      name: 'chapterAttribution',
      type: 'relationship',
      relationTo: 'chapters',
    },
    {
      name: 'chapterNameSnapshot',
      type: 'text',
    },
    {
      name: 'planTitleSnapshot',
      type: 'text',
      required: true,
    },
    {
      name: 'planPriceSnapshot',
      type: 'number',
      required: true,
      validate: validateNonNegativeMoney,
    },
    {
      name: 'currencySnapshot',
      type: 'text',
      required: true,
      validate: validateUSD,
    },
    {
      name: 'billingIntervalSnapshot',
      type: 'text',
      defaultValue: 'annual',
      required: true,
    },
    {
      name: 'reactivationEligible',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
  hooks: {
    beforeChange: [
      validateMembershipSnapshots,
      protectImmutableFields([
        'user',
        'plan',
        'paymentMethod',
        'chapterAttribution',
        'chapterNameSnapshot',
        'planTitleSnapshot',
        'planPriceSnapshot',
        'currencySnapshot',
        'billingIntervalSnapshot',
      ]),
      validateWorkflowTransition('membership'),
      ({ data, originalDoc }) => {
        const startedAt = data.startedAt ?? originalDoc?.startedAt
        const renewalAt = data.renewalAt ?? originalDoc?.renewalAt
        const expiresAt = data.expiresAt ?? originalDoc?.expiresAt
        const graceEndsAt = data.graceEndsAt ?? originalDoc?.graceEndsAt

        if (startedAt && expiresAt && new Date(String(expiresAt)) <= new Date(String(startedAt))) {
          throw new Error('Membership expiration must be after its start date.')
        }
        if (startedAt && renewalAt && new Date(String(renewalAt)) < new Date(String(startedAt))) {
          throw new Error('Membership renewal cannot be before its start date.')
        }
        if (
          expiresAt &&
          graceEndsAt &&
          new Date(String(graceEndsAt)) < new Date(String(expiresAt))
        ) {
          throw new Error('Membership grace period cannot end before expiration.')
        }

        return data
      },
    ],
  },
}
