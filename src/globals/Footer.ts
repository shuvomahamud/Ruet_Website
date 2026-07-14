import type { GlobalConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { adminsOnly } from '@/access/roles'
import { navigationLinkField } from '@/fields/navigationLink'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: anyone,
    update: adminsOnly,
  },
  fields: [
    {
      name: 'groups',
      type: 'array',
      defaultValue: [
        {
          links: [{ link: { href: '/about', label: 'About RUETIAN USA' } }],
          title: 'About',
        },
        {
          links: [{ link: { href: '/membership', label: 'Membership Overview' } }],
          title: 'Membership',
        },
        {
          links: [{ link: { href: '/chapters', label: 'Chapters Directory' } }],
          title: 'Chapters',
        },
        {
          links: [{ link: { href: '/events', label: 'Events' } }],
          title: 'Events',
        },
      ],
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'links',
          type: 'array',
          fields: [navigationLinkField()],
        },
      ],
    },
    {
      name: 'newsletterTitle',
      type: 'text',
      defaultValue: 'Stay connected',
    },
    {
      name: 'newsletterSummary',
      type: 'textarea',
      defaultValue: 'Newsletter sending will be enabled in a later phase once the email provider is configured.',
    },
    {
      name: 'legalNotice',
      type: 'textarea',
      defaultValue: 'Final legal copy is still an open item and will be added before launch.',
    },
  ],
}
