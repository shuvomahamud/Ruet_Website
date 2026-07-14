import type { CollectionConfig } from 'payload'

import { denyAll } from '@/access/roles'

export const OAuthSessions: CollectionConfig = {
  slug: 'oauthSessions',
  access: {
    create: denyAll,
    delete: denyAll,
    read: denyAll,
    update: denyAll,
  },
  admin: {
    hidden: true,
  },
  fields: [
    {
      name: 'tokenHash',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'user',
      type: 'relationship',
      index: true,
      relationTo: 'users',
      required: true,
    },
    {
      name: 'provider',
      type: 'select',
      defaultValue: 'google',
      options: [{ label: 'Google', value: 'google' }],
      required: true,
    },
    {
      name: 'expiresAt',
      type: 'date',
      index: true,
      required: true,
    },
    {
      name: 'revokedAt',
      type: 'date',
    },
  ],
}
