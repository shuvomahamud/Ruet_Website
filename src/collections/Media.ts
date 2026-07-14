import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { elevatedOnly } from '@/access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: elevatedOnly,
    delete: elevatedOnly,
    read: anyone,
    update: elevatedOnly,
  },
  admin: {
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
    {
      name: 'credit',
      type: 'text',
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'application/pdf'],
  },
}
