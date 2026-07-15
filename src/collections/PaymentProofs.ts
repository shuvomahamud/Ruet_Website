import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { denyAll, userOrChapterScopedAccess } from '@/access/roles'
import { preparePaymentProof } from '@/hooks/prepareOwnedMedia'

export const PaymentProofs: CollectionConfig = {
  slug: 'paymentProofs',
  access: {
    create: authenticated,
    delete: denyAll,
    read: userOrChapterScopedAccess('owner', 'chapter'),
    update: denyAll,
  },
  admin: {
    defaultColumns: ['filename', 'owner', 'chapter', 'createdAt'],
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'chapter',
      type: 'relationship',
      relationTo: 'chapters',
    },
    {
      name: 'description',
      type: 'text',
    },
  ],
  hooks: {
    beforeChange: [preparePaymentProof],
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
    pasteURL: false,
  },
}
