import type { GlobalConfig } from 'payload'

import { publishedGlobalRead } from '@/access/authenticatedOrPublished'
import { adminsOnly } from '@/access/roles'
import { navigationLinkField } from '@/fields/navigationLink'
import { defaultMainNavigation } from '@/constants/site'
import { revalidateGlobal } from '@/cms/revalidation'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: publishedGlobalRead,
    readVersions: adminsOnly,
    update: adminsOnly,
  },
  admin: {
    description: 'Utility links, primary navigation, menus, and the header action.',
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
      defaultValue: defaultMainNavigation,
      fields: [
        navigationLinkField(),
        {
          name: 'children',
          type: 'array',
          admin: {
            description: 'Optional child destinations displayed in desktop and mobile menus.',
            initCollapsed: true,
          },
          fields: [navigationLinkField()],
          maxRows: 8,
        },
        {
          name: 'featured',
          type: 'group',
          fields: [
            { name: 'eyebrow', type: 'text' },
            { name: 'title', type: 'text' },
            { name: 'description', type: 'textarea' },
            { name: 'label', type: 'text' },
            { name: 'href', type: 'text' },
          ],
        },
      ],
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
  hooks: {
    afterChange: [revalidateGlobal('header')],
  },
  versions: {
    drafts: { autosave: { interval: 500 }, schedulePublish: true },
  },
}
