import type { GlobalConfig } from 'payload'

import { publishedGlobalRead } from '@/access/authenticatedOrPublished'
import { adminsOnly } from '@/access/roles'
import { revalidateGlobal } from '@/cms/revalidation'

export const SeoDefaults: GlobalConfig = {
  slug: 'seoDefaults',
  access: {
    read: publishedGlobalRead,
    readVersions: adminsOnly,
    update: adminsOnly,
  },
  admin: {
    description: 'Default search and social metadata used when a page has no override.',
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
  hooks: {
    afterChange: [revalidateGlobal('seoDefaults')],
  },
  versions: {
    drafts: { autosave: { interval: 500 }, schedulePublish: true },
  },
}
