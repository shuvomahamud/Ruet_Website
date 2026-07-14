import type { GlobalConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { adminsOnly } from '@/access/roles'
import { navigationLinkField } from '@/fields/navigationLink'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: anyone,
    update: adminsOnly,
  },
  fields: [
    {
      name: 'utilityLinks',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      defaultValue: [
        {
          link: {
            href: '/contact',
            label: 'Contact',
          },
        },
        {
          link: {
            href: '/login',
            label: 'Sign In',
          },
        },
      ],
      fields: [navigationLinkField()],
    },
    {
      name: 'mainLinks',
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      defaultValue: [
        { link: { href: '/about', label: 'About' } },
        { link: { href: '/membership', label: 'Membership' } },
        { link: { href: '/chapters', label: 'Chapters' } },
        { link: { href: '/events', label: 'Events' } },
        { link: { href: '/learning', label: 'Learning' } },
        { link: { href: '/contact', label: 'Contact' } },
      ],
      fields: [navigationLinkField()],
    },
    {
      name: 'primaryCtaLabel',
      type: 'text',
      defaultValue: 'Join Membership',
      required: true,
    },
    {
      name: 'primaryCtaHref',
      type: 'text',
      defaultValue: '/membership',
      required: true,
    },
  ],
}
