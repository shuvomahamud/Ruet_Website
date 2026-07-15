import type { CollectionConfig } from 'payload'

import { elevatedOnly, mediaMutationAccess, mediaReadAccess } from '@/access/roles'
import { prepareOwnedMedia } from '@/hooks/prepareOwnedMedia'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: elevatedOnly,
    delete: mediaMutationAccess,
    read: mediaReadAccess,
    update: mediaMutationAccess,
  },
  admin: {
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'chapter',
      type: 'relationship',
      relationTo: 'chapters',
    },
    {
      name: 'visibility',
      type: 'select',
      defaultValue: 'public',
      options: [
        { label: 'Public', value: 'public' },
        { label: 'Private', value: 'private' },
      ],
      required: true,
    },
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
    pasteURL: false,
  },
  hooks: {
    beforeChange: [prepareOwnedMedia],
  },
}
