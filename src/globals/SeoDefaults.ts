import type { GlobalConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { adminsOnly } from '@/access/roles'

export const SeoDefaults: GlobalConfig = {
  slug: 'seoDefaults',
  access: {
    read: anyone,
    update: adminsOnly,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'RUETIAN USA',
    },
    {
      name: 'titleSuffix',
      type: 'text',
      defaultValue: ' | RUETIAN USA',
    },
    {
      name: 'defaultDescription',
      type: 'textarea',
      defaultValue:
        'RUETIAN USA is a chapter-driven alumni association platform built for community, membership, events, and institutional continuity.',
    },
    {
      name: 'defaultImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'socialHandle',
      type: 'text',
      admin: {
        description: 'Optional social handle, including the leading @.',
      },
    },
  ],
}
