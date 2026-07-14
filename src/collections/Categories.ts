import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { adminsOnly } from '@/access/roles'
import { anyone } from '@/access/anyone'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: anyone,
    update: adminsOnly,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
