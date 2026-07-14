import type { CollectionConfig } from 'payload'

import { denyAll, eventWorkflowCreateAccess, userOrChapterScopedAccess } from '@/access/roles'
import { validatePositiveInteger } from '@/domain/validation'
import { forceAuthenticatedUser } from '@/hooks/forceAuthenticatedUser'
import { prepareWaitlistEntry } from '@/hooks/prepareRegistration'
import { protectImmutableFields } from '@/hooks/protectImmutableFields'
import { validateWorkflowTransition } from '@/hooks/validateWorkflowTransition'

export const WaitlistEntries: CollectionConfig = {
  slug: 'waitlistEntries',
  access: {
    create: eventWorkflowCreateAccess,
    delete: denyAll,
    read: userOrChapterScopedAccess('user', 'event.chapter'),
    update: denyAll,
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
      validate: validatePositiveInteger,
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
        { label: 'Accepted', value: 'accepted' },
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
    {
      name: 'acceptedAt',
      type: 'date',
    },
  ],
  hooks: {
    beforeChange: [
      forceAuthenticatedUser('user'),
      prepareWaitlistEntry,
      protectImmutableFields(['event', 'user', 'quantity', 'joinedAt']),
      validateWorkflowTransition('waitlist'),
    ],
  },
}
