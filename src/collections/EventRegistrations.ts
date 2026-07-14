import type { CollectionConfig } from 'payload'

import { denyAll, eventWorkflowCreateAccess, userOrChapterScopedAccess } from '@/access/roles'
import { validateNonNegativeMoney, validatePositiveInteger } from '@/domain/validation'
import { forceAuthenticatedUser } from '@/hooks/forceAuthenticatedUser'
import { prepareEventRegistration } from '@/hooks/prepareRegistration'
import { protectImmutableFields } from '@/hooks/protectImmutableFields'
import { validateWorkflowTransition } from '@/hooks/validateWorkflowTransition'

export const EventRegistrations: CollectionConfig = {
  slug: 'eventRegistrations',
  access: {
    create: eventWorkflowCreateAccess,
    delete: denyAll,
    read: userOrChapterScopedAccess('user', 'event.chapter'),
    update: denyAll,
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
      validate: validatePositiveInteger,
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
      required: true,
      validate: validateNonNegativeMoney,
    },
    {
      name: 'unitPriceSnapshot',
      type: 'number',
      required: true,
      validate: validateNonNegativeMoney,
    },
    {
      name: 'currencySnapshot',
      type: 'text',
      defaultValue: 'USD',
      required: true,
    },
    {
      name: 'eventTitleSnapshot',
      type: 'text',
      required: true,
    },
    {
      name: 'eventStartAtSnapshot',
      type: 'date',
      required: true,
    },
    {
      name: 'chapterNameSnapshot',
      type: 'text',
      required: true,
    },
    {
      name: 'waitlistEntry',
      type: 'relationship',
      relationTo: 'waitlistEntries',
    },
    {
      name: 'discountSnapshot',
      type: 'number',
      defaultValue: 0,
      required: true,
      validate: validateNonNegativeMoney,
    },
    {
      name: 'waitlistPosition',
      type: 'number',
    },
  ],
  hooks: {
    beforeChange: [
      forceAuthenticatedUser('user'),
      prepareEventRegistration,
      protectImmutableFields([
        'event',
        'user',
        'quantity',
        'order',
        'registrationPriceSnapshot',
        'discountSnapshot',
        'unitPriceSnapshot',
        'currencySnapshot',
        'eventTitleSnapshot',
        'eventStartAtSnapshot',
        'chapterNameSnapshot',
        'waitlistEntry',
      ]),
      validateWorkflowTransition('registration'),
    ],
  },
}
