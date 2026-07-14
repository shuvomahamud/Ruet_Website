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
  ],
}
