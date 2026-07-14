import type { CollectionConfig } from 'payload'

import { denyAll, superAdminsOnly } from '@/access/roles'

export const AuditLogs: CollectionConfig = {
  slug: 'auditLogs',
  access: {
    create: denyAll,
    delete: denyAll,
    read: superAdminsOnly,
    update: denyAll,
  },
  admin: {
    defaultColumns: ['action', 'entityType', 'entityID', 'outcome', 'createdAt'],
    useAsTitle: 'action',
  },
  fields: [
    {
      name: 'actor',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'actorRoleSnapshot',
      type: 'text',
    },
    {
      name: 'action',
      type: 'text',
      required: true,
    },
    {
      name: 'entityType',
      type: 'text',
      required: true,
    },
    {
      name: 'entityID',
      type: 'text',
      required: true,
    },
    {
      name: 'outcome',
      type: 'select',
      options: [
        { label: 'Succeeded', value: 'succeeded' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'No Change', value: 'no_change' },
      ],
      required: true,
    },
    {
      name: 'beforeStatus',
      type: 'text',
    },
    {
      name: 'afterStatus',
      type: 'text',
    },
    {
      name: 'metadata',
      type: 'json',
    },
  ],
  timestamps: true,
}
