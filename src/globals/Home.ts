import type { GlobalConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { adminsOnly } from '@/access/roles'

export const Home: GlobalConfig = {
  slug: 'home',
  access: {
    read: anyone,
    update: adminsOnly,
  },
  fields: [
    {
      name: 'heroEyebrow',
      type: 'text',
      defaultValue: 'RUET Alumni Association',
    },
    {
      name: 'heroTitle',
      type: 'text',
      defaultValue: 'A professional, chapter-centered home for RUET alumni in the United States.',
      required: true,
    },
    {
      name: 'heroDescription',
      type: 'textarea',
      defaultValue:
        'This foundation now supports dynamic content, publishing workflows, chapter structure, membership data models, and the public site shell needed for the next implementation phases.',
    },
    {
      name: 'primaryCtaLabel',
      type: 'text',
      defaultValue: 'Join Membership',
    },
    {
      name: 'primaryCtaHref',
      type: 'text',
      defaultValue: '/membership',
    },
    {
      name: 'secondaryCtaLabel',
      type: 'text',
      defaultValue: 'Explore Chapters',
    },
    {
      name: 'secondaryCtaHref',
      type: 'text',
      defaultValue: '/chapters',
    },
    {
      name: 'stats',
      type: 'array',
      defaultValue: [
        { label: 'Members', value: '0+' },
        { label: 'Chapters', value: '0' },
        { label: 'Upcoming Events', value: '0' },
        { label: 'Years of Community', value: '0' },
      ],
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'membershipSectionTitle',
      type: 'text',
      defaultValue: 'Membership foundation',
    },
    {
      name: 'membershipSectionDescription',
      type: 'textarea',
      defaultValue:
        'The site is structured for one annual membership plan at launch, with configurable pricing and future-ready schema support.',
    },
  ],
}
