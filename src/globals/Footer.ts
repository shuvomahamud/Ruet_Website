import type { GlobalConfig } from 'payload'

import { publishedGlobalRead } from '@/access/authenticatedOrPublished'
import { adminsOnly } from '@/access/roles'
import { navigationLinkField } from '@/fields/navigationLink'
import { validateSafeHref } from '@/utilities/links'
import { revalidateGlobal } from '@/cms/revalidation'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: publishedGlobalRead,
    readVersions: adminsOnly,
    update: adminsOnly,
  },
  admin: {
    description: 'Footer link groups, legal destinations, newsletter action, and social links.',
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
      defaultValue:
        'Receive organization news, chapter updates, event notices, and learning resources.',
    },
    {
      name: 'newsletterCtaLabel',
      type: 'text',
      defaultValue: 'Manage newsletter preferences',
      required: true,
    },
    {
      name: 'newsletterCtaHref',
      type: 'text',
      defaultValue: '/communications/preferences',
      required: true,
      validate: validateSafeHref,
    },
    {
      name: 'legalLinks',
      type: 'array',
      defaultValue: [
        { href: '/privacy-policy', label: 'Privacy policy' },
        { href: '/terms-of-use', label: 'Website terms' },
        { href: '/membership-terms', label: 'Membership terms' },
      ],
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true, validate: validateSafeHref },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true, validate: validateSafeHref },
      ],
    },
    {
      name: 'legalNotice',
      type: 'textarea',
      defaultValue:
        'RUETIAN USA is an alumni-led community serving RUET graduates in the United States.',
    },
  ],
  hooks: {
    afterChange: [revalidateGlobal('footer')],
  },
  versions: {
    drafts: { autosave: { interval: 500 }, schedulePublish: true },
  },
}
