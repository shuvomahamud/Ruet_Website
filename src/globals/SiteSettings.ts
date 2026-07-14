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
      name: 'chapterSupportEmail',
      type: 'email',
    },
    {
      name: 'primaryPhone',
      type: 'text',
    },
    {
      name: 'mailingAddress',
      type: 'textarea',
    },
    {
      name: 'contactResponseNote',
      type: 'textarea',
      defaultValue:
        'Send us a message and the appropriate RUETIAN USA volunteer will follow up when available.',
    },
    {
      name: 'utilityMessage',
      type: 'text',
      defaultValue: 'Connecting RUET alumni across the United States',
    },
    {
      name: 'footerNote',
      type: 'textarea',
      defaultValue:
        'Membership, chapters, events, and learning opportunities for the RUET alumni community.',
    },
  ],
  label: 'Site Settings',
}
