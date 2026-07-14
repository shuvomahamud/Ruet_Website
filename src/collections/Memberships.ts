import type { CollectionConfig } from 'payload'

import { adminsOnly, userScopedAccess } from '@/access/roles'

export const Memberships: CollectionConfig = {
  slug: 'memberships',
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: userScopedAccess('user'),
    update: adminsOnly,
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
      name: 'autoRenewEnabled',
      type: 'checkbox',
      defaultValue: true,
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
      name: 'chapterSnapshot',
      type: 'text',
    },
    {
      name: 'planTitleSnapshot',
      type: 'text',
    },
    {
      name: 'planPriceSnapshot',
      type: 'number',
    },
    {
      name: 'currencySnapshot',
      type: 'text',
    },
    {
      name: 'billingIntervalSnapshot',
      type: 'text',
      defaultValue: 'annual',
    },
    {
      name: 'reactivationEligible',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
