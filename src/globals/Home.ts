import type { GlobalConfig } from 'payload'

import { adminsOnly } from '@/access/roles'
import { publishedGlobalRead } from '@/access/authenticatedOrPublished'
import { revalidateGlobal } from '@/cms/revalidation'
import { seoFields } from '@/fields/seo'
import { validateSafeHref } from '@/utilities/links'

export const Home: GlobalConfig = {
  slug: 'home',
  access: {
    read: publishedGlobalRead,
    readVersions: adminsOnly,
    update: adminsOnly,
  },
  admin: {
    description:
      'Homepage copy and section labels. Published records populate each content module.',
    preview: () => '/preview/globals/home',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          description: 'Primary homepage message, actions, and alumni-network panel.',
          fields: [
            {
              name: 'heroEyebrow',
              type: 'text',
              defaultValue: 'RUET Alumni Association',
            },
            {
              name: 'heroTitle',
              type: 'text',
              defaultValue:
                'A professional, chapter-centered home for RUET alumni in the United States.',
              required: true,
            },
            {
              name: 'heroDescription',
              type: 'textarea',
              defaultValue:
                'Connect with RUET alumni across the United States through membership, regional chapters, events, and shared professional learning.',
              required: true,
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'primaryCtaLabel',
                  type: 'text',
                  defaultValue: 'Explore Membership',
                  required: true,
                },
                {
                  name: 'primaryCtaHref',
                  type: 'text',
                  defaultValue: '/membership',
                  required: true,
                  validate: validateSafeHref,
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'secondaryCtaLabel',
                  type: 'text',
                  defaultValue: 'Find a Chapter',
                  required: true,
                },
                {
                  name: 'secondaryCtaHref',
                  type: 'text',
                  defaultValue: '/chapters',
                  required: true,
                  validate: validateSafeHref,
                },
              ],
            },
            {
              name: 'networkPanelEyebrow',
              type: 'text',
              defaultValue: 'Our alumni network',
              required: true,
            },
            {
              name: 'networkPanelTitle',
              type: 'text',
              defaultValue: 'Connected by RUET, strengthened by community.',
              required: true,
            },
            {
              name: 'networkPanelDescription',
              type: 'textarea',
              defaultValue:
                'Discover chapters, upcoming programs, and stories from RUET alumni across the United States.',
              required: true,
            },
          ],
        },
        {
          label: 'Credibility',
          description: 'Live counts use application data; these values are safe fallbacks.',
          fields: [
            {
              name: 'statsSectionEyebrow',
              type: 'text',
              defaultValue: 'Our community at a glance',
            },
            {
              name: 'statsSectionTitle',
              type: 'text',
              defaultValue: 'A growing alumni network built for participation',
            },
            {
              name: 'stats',
              type: 'array',
              defaultValue: [
                { label: 'Active members', value: '0' },
                { label: 'Active chapters', value: '0' },
                { label: 'Upcoming events', value: '0' },
                { label: 'Published resources', value: '0' },
              ],
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'value', type: 'text', required: true },
              ],
              maxRows: 4,
              minRows: 4,
            },
          ],
        },
        {
          label: 'Sections',
          description: 'Headings for each live homepage content module.',
          fields: [
            {
              name: 'announcementSectionTitle',
              type: 'text',
              defaultValue: 'Latest organization notices',
            },
            {
              name: 'announcementSectionDescription',
              type: 'textarea',
              defaultValue:
                'Stay informed about association news, chapter updates, and opportunities across the alumni network.',
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
            {
              name: 'chaptersSectionTitle',
              type: 'text',
              defaultValue: 'Find your local alumni community',
            },
            {
              name: 'chaptersSectionDescription',
              type: 'textarea',
              defaultValue:
                'Regional chapters create opportunities to meet, volunteer, learn, and stay connected.',
            },
            {
              name: 'eventsSectionTitle',
              type: 'text',
              defaultValue: 'Meet, learn, and participate',
            },
            {
              name: 'eventsSectionDescription',
              type: 'textarea',
              defaultValue:
                'Explore in-person, virtual, and hybrid programs hosted across the alumni network.',
            },
            {
              name: 'historySectionTitle',
              type: 'text',
              defaultValue: 'Milestones that connect generations',
            },
            {
              name: 'historySectionDescription',
              type: 'textarea',
              defaultValue:
                'Explore the people, places, and moments that shape RUET and its alumni community.',
            },
            {
              name: 'committeesSectionTitle',
              type: 'text',
              defaultValue: 'Volunteer leadership and continuity',
            },
            {
              name: 'committeesSectionDescription',
              type: 'textarea',
              defaultValue:
                'Meet current running and advisory committee members serving the national organization.',
            },
            {
              name: 'learningSectionTitle',
              type: 'text',
              defaultValue: 'Knowledge shared across generations',
            },
            {
              name: 'learningSectionDescription',
              type: 'textarea',
              defaultValue:
                'Read alumni perspectives, professional development articles, and practical community resources.',
            },
          ],
        },
        {
          label: 'SEO',
          fields: [seoFields()],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateGlobal('home')],
  },
  versions: {
    drafts: {
      autosave: { interval: 500 },
      schedulePublish: true,
    },
  },
}
