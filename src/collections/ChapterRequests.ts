import type { CollectionConfig } from 'payload'

import { superAdminsOnly, userScopedAccess } from '@/access/roles'
import { authenticated } from '@/access/authenticated'
import { forceAuthenticatedUser } from '@/hooks/forceAuthenticatedUser'

export const ChapterRequests: CollectionConfig = {
  slug: 'chapterRequests',
  access: {
    create: authenticated,
    delete: superAdminsOnly,
    read: userScopedAccess('requester'),
    update: superAdminsOnly,
  },
  admin: {
    defaultColumns: ['requestedName', 'status', 'reviewedAt', 'updatedAt'],
    useAsTitle: 'requestedName',
  },
  fields: [
    {
      name: 'requestedName',
      type: 'text',
      required: true,
    },
    {
      name: 'requestedRegion',
      type: 'text',
    },
    {
      name: 'motivation',
      type: 'textarea',
    },
    {
      name: 'requester',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      required: true,
    },
    {
      name: 'notes',
      type: 'textarea',
    },
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'reviewedAt',
      type: 'date',
    },
    {
      name: 'resultingChapter',
      type: 'relationship',
      relationTo: 'chapters',
    },
  ],
  hooks: {
    beforeChange: [
      forceAuthenticatedUser('requester'),
      ({ data, operation, originalDoc, req }) => {
        if (operation === 'create') {
          return {
            ...data,
            resultingChapter: undefined,
            reviewedAt: undefined,
            reviewedBy: undefined,
            status: 'pending',
          }
        }

        if (req.context?.chapterRequestReview !== true) {
          return {
            ...data,
            resultingChapter: originalDoc?.resultingChapter,
            reviewedAt: originalDoc?.reviewedAt,
            reviewedBy: originalDoc?.reviewedBy,
            status: originalDoc?.status,
          }
        }

        return data
      },
    ],
  },
}
