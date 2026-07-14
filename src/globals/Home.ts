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
        'Connect with RUET alumni across the United States through membership, regional chapters, events, and shared professional learning.',
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
      defaultValue: 'One community, year-round connection',
    },
    {
      name: 'membershipSectionDescription',
      type: 'textarea',
      defaultValue:
        'Annual membership helps sustain alumni programming, regional chapters, professional development, and community connections.',
    },
  ],
}
