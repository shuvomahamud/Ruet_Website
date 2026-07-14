import { getPayload } from 'payload'

import config from '../src/payload.config'

type SeedPage = {
  _status?: 'draft' | 'published'
  heroDescription: string
  heroEyebrow: string
  heroTitle: string
  sections: Array<{
    body: string
    ctaHref?: string
    ctaLabel?: string
    eyebrow?: string
    title: string
  }>
  slug: string
  summary?: string
  title: string
}

const now = new Date().toISOString()

const pages: SeedPage[] = [
  {
    _status: 'published',
    heroDescription:
      'RUETIAN USA is building a professional alumni platform for membership, chapters, events, and long-term organizational continuity.',
    heroEyebrow: 'About RUETIAN USA',
    heroTitle: 'A structured home for RUET alumni in the United States.',
    sections: [
      {
        body: 'RUETIAN USA is being positioned as a chapter-driven alumni association platform with a professional public presence inspired by the structure of major engineering organizations.',
        eyebrow: 'Overview',
        title: 'What this organization site is intended to support',
      },
      {
        body: 'This page is fully CMS-managed. Update the hero and sections from Payload admin through the Pages collection.',
        title: 'How to manage this page',
      },
    ],
    slug: 'about',
    summary: 'Institutional overview page',
    title: 'About RUETIAN USA',
  },
  {
    _status: 'published',
    heroDescription:
      'Use this page for membership overview copy, value proposition, and joining guidance while plan pricing remains connected to the Membership Plans collection.',
    heroEyebrow: 'Membership',
    heroTitle: 'Membership content is now managed through the CMS.',
    sections: [
      {
        body: 'This introductory section is editable from Payload and appears above the live membership plan card on the public site.',
        eyebrow: 'Overview',
        title: 'Why alumni should join',
      },
      {
        body: 'You can add more membership information sections here without changing code.',
        title: 'Additional membership content',
      },
    ],
    slug: 'membership',
    summary: 'Membership landing page',
    title: 'Membership',
  },
  {
    _status: 'published',
    heroDescription:
      'Use this page to explain how the chapter network works, what regional chapters do, and how members can participate.',
    heroEyebrow: 'Chapters',
    heroTitle: 'Chapter directory content is now managed through the CMS.',
    sections: [
      {
        body: 'This section is editable from Payload and appears above the live chapter listing.',
        eyebrow: 'Directory',
        title: 'Explore active chapters',
      },
      {
        body: 'Add any supporting chapter-program explanation, volunteer information, or regional guidance here.',
        title: 'Additional chapter information',
      },
    ],
    slug: 'chapters',
    summary: 'Chapters landing page',
    title: 'Chapters',
  },
  {
    _status: 'published',
    heroDescription:
      'Use this page to explain the event program, event formats, registration expectations, and chapter-led activities.',
    heroEyebrow: 'Events',
    heroTitle: 'Events page content is now managed through the CMS.',
    sections: [
      {
        body: 'This section is editable from Payload and appears above the live event listing.',
        eyebrow: 'Events Program',
        title: 'Upcoming events and chapter activities',
      },
      {
        body: 'Add more event-program guidance here, including expectations for hybrid, virtual, or chapter-specific programming.',
        title: 'Additional event information',
      },
    ],
    slug: 'events',
    summary: 'Events landing page',
    title: 'Events',
  },
  {
    _status: 'published',
    heroDescription:
      'Use this page to introduce articles, updates, professional development content, and any learning-oriented publishing strategy.',
    heroEyebrow: 'Learning & Development',
    heroTitle: 'Learning page content is now managed through the CMS.',
    sections: [
      {
        body: 'This section is editable from Payload and appears above the live article listing.',
        eyebrow: 'Content Hub',
        title: 'Articles, updates, and development resources',
      },
      {
        body: 'Add additional explanation, editorial positioning, or reader guidance here.',
        title: 'Additional learning information',
      },
    ],
    slug: 'learning',
    summary: 'Learning landing page',
    title: 'Learning',
  },
  {
    _status: 'published',
    heroDescription:
      'Use this page for organization contact instructions, response expectations, and routing guidance. Public email values can still be managed globally from Site Settings.',
    heroEyebrow: 'Contact',
    heroTitle: 'Contact page content is now managed through the CMS.',
    sections: [
      {
        body: 'Update this page in Payload to explain how members, prospective members, and chapter organizers should contact RUETIAN USA.',
        eyebrow: 'Contact',
        title: 'How to reach the organization',
      },
      {
        body: 'You can also update the public email shown in the footer through Site Settings.',
        title: 'Related global settings',
      },
    ],
    slug: 'contact',
    summary: 'Contact page',
    title: 'Contact',
  },
  {
    _status: 'published',
    heroDescription:
      'Final legal copy is still pending. This placeholder content is in the CMS so it can be replaced later without code changes.',
    heroEyebrow: 'Legal Placeholder',
    heroTitle: 'Privacy policy content will be finalized later.',
    sections: [
      {
        body: 'Replace this placeholder with approved legal language before launch.',
        title: 'Open legal item',
      },
    ],
    slug: 'privacy-policy',
    summary: 'Legal placeholder',
    title: 'Privacy Policy',
  },
  {
    _status: 'published',
    heroDescription:
      'Final legal copy is still pending. This placeholder content is in the CMS so it can be replaced later without code changes.',
    heroEyebrow: 'Legal Placeholder',
    heroTitle: 'Terms of use content will be finalized later.',
    sections: [
      {
        body: 'Replace this placeholder with approved legal language before launch.',
        title: 'Open legal item',
      },
    ],
    slug: 'terms-of-use',
    summary: 'Legal placeholder',
    title: 'Terms of Use',
  },
  {
    _status: 'published',
    heroDescription:
      'Final membership legal copy is still pending. This placeholder content is in the CMS so it can be replaced later without code changes.',
    heroEyebrow: 'Legal Placeholder',
    heroTitle: 'Membership terms content will be finalized later.',
    sections: [
      {
        body: 'Replace this placeholder with approved membership legal language before launch.',
        title: 'Open legal item',
      },
    ],
    slug: 'membership-terms',
    summary: 'Legal placeholder',
    title: 'Membership Terms',
  },
]

const payload = await getPayload({ config })

for (const page of pages) {
  const existing = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      slug: {
        equals: page.slug,
      },
    },
  })

  if (existing.docs[0]) {
    await payload.update({
      collection: 'pages',
      data: {
        ...page,
        publishedAt: existing.docs[0].publishedAt || now,
      },
      draft: false,
      id: existing.docs[0].id,
      overrideAccess: true,
    })

    console.log(`Updated page: ${page.slug}`)
    continue
  }

  await payload.create({
    collection: 'pages',
    data: {
      ...page,
      publishedAt: now,
    },
    draft: false,
    overrideAccess: true,
  })

  console.log(`Created page: ${page.slug}`)
}

console.log('CMS pages are seeded.')
