import type { GlobalConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { adminsOnly } from '@/access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  access: {
    read: anyone,
    update: adminsOnly,
  },
  fields: [
    {
      name: 'organizationName',
      type: 'text',
      defaultValue: 'RUETIAN USA',
      required: true,
    },
    {
      name: 'tagline',
      type: 'text',
      defaultValue: 'RUET alumni community in the United States',
    },
    {
      name: 'primaryEmail',
      type: 'email',
      defaultValue: 'info@ruetianusa.org',
    },
    {
      name: 'utilityMessage',
      type: 'text',
      defaultValue: 'Association website foundation',
    },
    {
      name: 'footerNote',
      type: 'textarea',
      defaultValue:
        'The website content, branding, and legal copy will continue to evolve as later implementation phases are completed.',
    },
  ],
  label: 'Site Settings',
}
