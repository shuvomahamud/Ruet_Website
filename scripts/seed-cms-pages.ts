import { getPayload } from 'payload'

import config from '../src/payload.config'
import { defaultMainNavigation } from '../src/constants/site'

type SeedPage = {
  _status: 'published'
  heroDescription: string
  heroEyebrow: string
  heroTitle: string
  lastReviewedAt?: string
  legalStatus?: 'approved' | 'placeholder'
  pageType: 'institutional' | 'legal' | 'standard'
  sections: Array<{
    anchor?: string
    body: string
    ctaHref?: string
    ctaLabel?: string
    eyebrow?: string
    title: string
  }>
  seo: {
    description: string
    title: string
  }
  slug: string
  summary: string
  title: string
}

const now = new Date().toISOString()

const pages: SeedPage[] = [
  {
    _status: 'published',
    heroDescription:
      'RUETIAN USA brings graduates together through membership, chapters, events, learning, and a shared commitment to alumni continuity.',
    heroEyebrow: 'About RUETIAN USA',
    heroTitle: 'A lasting home for RUET alumni in the United States.',
    pageType: 'institutional',
    sections: [
      {
        anchor: 'mission',
        body: 'Our mission is to connect, support, and celebrate RUET alumni in the United States by creating meaningful opportunities for service, professional growth, mentorship, and lifelong community.',
        eyebrow: 'Our purpose',
        title: 'Mission',
      },
      {
        anchor: 'vision',
        body: 'We envision an inclusive and enduring alumni network where every RUET graduate can find community, contribute experience, and help future generations thrive.',
        eyebrow: 'Where we are going',
        title: 'Vision',
      },
      {
        anchor: 'community',
        body: 'Regional chapters make the national network locally meaningful. They create space for gatherings, volunteering, family connections, career exchange, and programs shaped by the alumni they serve.',
        ctaHref: '/chapters',
        ctaLabel: 'Explore chapters',
        eyebrow: 'Across the country',
        title: 'A chapter-centered community',
      },
      {
        anchor: 'governance',
        body: 'Member participation, accountable leadership, and an accessible institutional record help preserve knowledge as committees and volunteers change over time.',
        ctaHref: '/committees/running',
        ctaLabel: 'View current leadership',
        eyebrow: 'Continuity',
        title: 'Built to serve for the long term',
      },
    ],
    seo: {
      description:
        'Learn about the mission, vision, chapter network, and governance of RUETIAN USA.',
      title: 'About RUETIAN USA',
    },
    slug: 'about',
    summary: 'Mission, vision, structure, and community overview for RUETIAN USA.',
    title: 'About RUETIAN USA',
  },
  {
    _status: 'published',
    heroDescription: 'Join a nationwide alumni community sustained by one clear annual membership.',
    heroEyebrow: 'Membership',
    heroTitle: 'Stay connected to RUET and to one another.',
    pageType: 'standard',
    sections: [
      {
        anchor: 'why-join',
        body: 'Membership helps sustain alumni programs, regional chapters, professional development, and the systems that keep our community connected year after year.',
        eyebrow: 'Why join',
        title: 'Support a stronger alumni network',
      },
      {
        anchor: 'what-to-expect',
        body: 'Members can participate in chapter activities, organization events, learning opportunities, volunteer programs, and community communications as they become available.',
        title: 'What membership supports',
      },
    ],
    seo: {
      description: 'Explore annual RUETIAN USA membership, benefits, and ways to participate.',
      title: 'Membership',
    },
    slug: 'membership',
    summary: 'Annual membership overview, value, and participation guidance.',
    title: 'Membership',
  },
  {
    _status: 'published',
    heroDescription:
      'Find regional alumni communities and discover opportunities to participate close to home.',
    heroEyebrow: 'Chapters',
    heroTitle: 'Local community, national connection.',
    pageType: 'standard',
    sections: [
      {
        anchor: 'directory',
        body: 'Browse active chapters to find local leadership, events, announcements, and contact information for your region.',
        eyebrow: 'Directory',
        title: 'Explore active chapters',
      },
      {
        anchor: 'start-a-chapter',
        body: 'If your region is not represented, alumni can propose a new chapter for review by the national organization.',
        ctaHref: '/chapters/request',
        ctaLabel: 'Request a chapter',
        title: 'Help organize your region',
      },
    ],
    seo: {
      description:
        'Browse active RUETIAN USA chapters and learn how to organize a regional chapter.',
      title: 'Chapters',
    },
    slug: 'chapters',
    summary: 'Regional chapter directory and participation guidance.',
    title: 'Chapters',
  },
  {
    _status: 'published',
    heroDescription:
      'Browse gatherings, professional programs, family activities, and chapter-led events across the alumni network.',
    heroEyebrow: 'Events',
    heroTitle: 'Meet, learn, and participate.',
    pageType: 'standard',
    sections: [
      {
        anchor: 'upcoming',
        body: 'Event listings include the date, format, location or access details, and registration information you need to plan your participation.',
        eyebrow: 'Calendar',
        title: 'Upcoming alumni programs',
      },
      {
        anchor: 'event-formats',
        body: 'Programs may be in person, virtual, or hybrid and may be organized nationally or by a regional chapter.',
        title: 'Programs designed for broad participation',
      },
    ],
    seo: {
      description: 'Find upcoming RUETIAN USA national and chapter events.',
      title: 'Events',
    },
    slug: 'events',
    summary: 'Upcoming alumni events, programs, and participation details.',
    title: 'Events',
  },
  {
    _status: 'published',
    heroDescription:
      'Explore alumni perspectives, professional development articles, and practical resources shared across the community.',
    heroEyebrow: 'Learning & Development',
    heroTitle: 'Knowledge shared across generations.',
    pageType: 'standard',
    sections: [
      {
        anchor: 'content-hub',
        body: 'Search and filter articles, organization news, and resources created for RUET alumni at every career stage.',
        eyebrow: 'Content hub',
        title: 'Learn from the alumni network',
      },
    ],
    seo: {
      description:
        'Search RUETIAN USA articles, professional resources, news, and alumni perspectives.',
      title: 'Learning & Development',
    },
    slug: 'learning',
    summary: 'Articles, news, resources, and professional development content.',
    title: 'Learning',
  },
  {
    _status: 'published',
    heroDescription:
      'Explore milestones, memories, documents, and community stories preserved across generations.',
    heroEyebrow: 'Our story',
    heroTitle: 'RUET history and alumni continuity.',
    pageType: 'institutional',
    sections: [
      {
        anchor: 'archive',
        body: 'Published timeline entries are arranged chronologically and can include photographs, documents, and links to supporting records.',
        eyebrow: 'Living archive',
        title: 'Preserving the institutional record',
      },
    ],
    seo: {
      description:
        'Explore the RUET and RUETIAN USA history archive, milestones, images, and documents.',
      title: 'Our History',
    },
    slug: 'history',
    summary: 'A chronological archive of RUET and RUETIAN USA milestones.',
    title: 'Our History',
  },
  {
    _status: 'published',
    heroDescription:
      'Meet the volunteers responsible for current programs, operations, and organizational stewardship.',
    heroEyebrow: 'Leadership',
    heroTitle: 'Running Committee',
    pageType: 'institutional',
    sections: [],
    seo: {
      description: 'Meet the current RUETIAN USA running committee and review its programs.',
      title: 'Running Committee',
    },
    slug: 'running-committee',
    summary: 'Current RUETIAN USA running committee.',
    title: 'Running Committee',
  },
  {
    _status: 'published',
    heroDescription:
      'Meet the alumni advisors who contribute experience, guidance, and institutional perspective.',
    heroEyebrow: 'Leadership',
    heroTitle: 'Advisory Committee',
    pageType: 'institutional',
    sections: [],
    seo: {
      description: 'Meet the current RUETIAN USA advisory committee.',
      title: 'Advisory Committee',
    },
    slug: 'advisory-committee',
    summary: 'Current RUETIAN USA advisory committee.',
    title: 'Advisory Committee',
  },
  {
    _status: 'published',
    heroDescription:
      'Review current and past leadership terms, member roles, and programs completed during each term.',
    heroEyebrow: 'Institutional archive',
    heroTitle: 'Committee History',
    pageType: 'institutional',
    sections: [],
    seo: {
      description: 'Browse the RUETIAN USA running and advisory committee archive.',
      title: 'Committee History',
    },
    slug: 'committee-history',
    summary: 'Current and past RUETIAN USA committee terms.',
    title: 'Committee History',
  },
  {
    _status: 'published',
    heroDescription:
      'Send a question or request and it will be routed to the appropriate RUETIAN USA volunteer.',
    heroEyebrow: 'Contact',
    heroTitle: 'We would be glad to hear from you.',
    pageType: 'standard',
    sections: [
      {
        anchor: 'response-expectations',
        body: 'RUETIAN USA is volunteer-led. Response timing may vary, but every valid inquiry is stored securely and can be reviewed by an authorized administrator.',
        eyebrow: 'What to expect',
        title: 'Your message reaches the organization',
      },
      {
        anchor: 'chapter-questions',
        body: 'For chapter-specific questions, include the city, state, or chapter name so the request can be routed accurately.',
        title: 'Help us direct your question',
      },
    ],
    seo: {
      description: 'Contact RUETIAN USA about membership, chapters, events, or general questions.',
      title: 'Contact',
    },
    slug: 'contact',
    summary: 'Contact information and a secure organization inquiry form.',
    title: 'Contact',
  },
  {
    _status: 'published',
    heroDescription:
      'This structured policy template is ready for stakeholder-approved privacy language before public launch.',
    heroEyebrow: 'Legal',
    heroTitle: 'Privacy Policy',
    lastReviewedAt: now,
    legalStatus: 'placeholder',
    pageType: 'legal',
    sections: [
      {
        anchor: 'scope',
        body: 'Approval placeholder: define who operates the website, the policy effective date, and which visitors, members, and services this policy covers.',
        title: 'Scope and responsible organization',
      },
      {
        anchor: 'information-collected',
        body: 'Approval placeholder: document account, membership, payment-proof, event, contact, newsletter, and technical information collected through the website.',
        title: 'Information we collect',
      },
      {
        anchor: 'how-information-is-used',
        body: 'Approval placeholder: explain operational, communication, security, compliance, and organizational uses of collected information.',
        title: 'How information is used',
      },
      {
        anchor: 'retention-and-rights',
        body: 'Approval placeholder: define retention periods, account-deletion effects, available privacy choices, and the process for submitting a request.',
        title: 'Retention, choices, and requests',
      },
      {
        anchor: 'contact',
        body: 'Approval placeholder: provide the approved privacy contact and mailing details.',
        title: 'Privacy contact',
      },
    ],
    seo: {
      description: 'Privacy policy for the RUETIAN USA website and member services.',
      title: 'Privacy Policy',
    },
    slug: 'privacy-policy',
    summary: 'Privacy policy template awaiting final stakeholder approval.',
    title: 'Privacy Policy',
  },
  {
    _status: 'published',
    heroDescription:
      'This structured terms template is ready for stakeholder-approved website terms before public launch.',
    heroEyebrow: 'Legal',
    heroTitle: 'Terms of Use',
    lastReviewedAt: now,
    legalStatus: 'placeholder',
    pageType: 'legal',
    sections: [
      {
        anchor: 'acceptance',
        body: 'Approval placeholder: define acceptance of the terms and the relationship between visitors, registered users, members, and RUETIAN USA.',
        title: 'Acceptance and eligibility',
      },
      {
        anchor: 'accounts',
        body: 'Approval placeholder: define account responsibilities, accurate information requirements, credential security, and suspension or closure rights.',
        title: 'Accounts and acceptable use',
      },
      {
        anchor: 'content',
        body: 'Approval placeholder: define ownership, permitted use, user submissions, external links, and intellectual property expectations.',
        title: 'Website content and submissions',
      },
      {
        anchor: 'disclaimers',
        body: 'Approval placeholder: add reviewed warranty disclaimers, limitation-of-liability language, governing law, and dispute provisions.',
        title: 'Disclaimers and legal provisions',
      },
      {
        anchor: 'contact',
        body: 'Approval placeholder: provide the approved contact for questions about these terms.',
        title: 'Contact',
      },
    ],
    seo: {
      description: 'Terms governing use of the RUETIAN USA website and services.',
      title: 'Terms of Use',
    },
    slug: 'terms-of-use',
    summary: 'Website terms template awaiting final stakeholder approval.',
    title: 'Terms of Use',
  },
  {
    _status: 'published',
    heroDescription:
      'This structured template is ready for stakeholder-approved membership and payment terms before enrollment opens.',
    heroEyebrow: 'Legal',
    heroTitle: 'Membership Terms',
    lastReviewedAt: now,
    legalStatus: 'placeholder',
    pageType: 'legal',
    sections: [
      {
        anchor: 'eligibility',
        body: 'Approval placeholder: define membership eligibility, the annual term, the information applicants must provide, and when membership becomes active.',
        title: 'Eligibility and activation',
      },
      {
        anchor: 'payment',
        body: 'Approval placeholder: document the approved Zelle-only payment process, required reference information, manual verification, and processing expectations.',
        title: 'Payment and verification',
      },
      {
        anchor: 'renewal',
        body: 'Approval placeholder: define expiration, renewal, reactivation, grace periods if any, and whether payments are refundable or transferable.',
        title: 'Renewal, expiration, and refunds',
      },
      {
        anchor: 'conduct',
        body: 'Approval placeholder: define member conduct expectations and the conditions and review process for suspension or termination.',
        title: 'Member responsibilities',
      },
      {
        anchor: 'contact',
        body: 'Approval placeholder: provide the approved membership-support contact.',
        title: 'Membership support',
      },
    ],
    seo: {
      description: 'Terms for RUETIAN USA annual membership and payment verification.',
      title: 'Membership Terms',
    },
    slug: 'membership-terms',
    summary: 'Membership terms template awaiting final stakeholder approval.',
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
    where: { slug: { equals: page.slug } },
  })

  if (existing.docs[0]) {
    await payload.update({
      collection: 'pages',
      data: { ...page, publishedAt: existing.docs[0].publishedAt || now },
      draft: false,
      id: existing.docs[0].id,
      overrideAccess: true,
    })
    console.log(`Updated page: ${page.slug}`)
    continue
  }

  await payload.create({
    collection: 'pages',
    data: { ...page, publishedAt: now },
    draft: false,
    overrideAccess: true,
  })
  console.log(`Created page: ${page.slug}`)
}

await payload.updateGlobal({
  slug: 'header',
  data: {
    mainLinks: defaultMainNavigation,
    primaryCtaHref: '/membership',
    primaryCtaLabel: 'Join Membership',
    utilityLinks: [
      { link: { href: '/contact', label: 'Contact' } },
      { link: { href: '/login', label: 'Sign In' } },
    ],
  },
  overrideAccess: true,
})

await payload.updateGlobal({
  slug: 'footer',
  data: {
    groups: [
      {
        links: [
          { link: { href: '/about', label: 'About RUETIAN USA' } },
          { link: { href: '/history', label: 'RUET History' } },
          { link: { href: '/committees/running', label: 'Leadership' } },
        ],
        title: 'About',
      },
      {
        links: [
          { link: { href: '/membership', label: 'Membership Overview' } },
          { link: { href: '/membership/join', label: 'Join Membership' } },
          { link: { href: '/chapters', label: 'Chapter Directory' } },
        ],
        title: 'Participate',
      },
      {
        links: [
          { link: { href: '/events', label: 'Events' } },
          { link: { href: '/learning', label: 'Learning & Development' } },
          { link: { href: '/contact', label: 'Contact' } },
        ],
        title: 'Explore',
      },
      {
        links: [
          { link: { href: '/privacy-policy', label: 'Privacy Policy' } },
          { link: { href: '/terms-of-use', label: 'Terms of Use' } },
          { link: { href: '/membership-terms', label: 'Membership Terms' } },
        ],
        title: 'Legal',
      },
    ],
    legalNotice:
      'RUETIAN USA is an alumni-led community serving RUET graduates in the United States.',
    newsletterSummary:
      'Receive organization news, chapter updates, event notices, and learning resources.',
    newsletterTitle: 'Stay connected',
  },
  overrideAccess: true,
})

await payload.updateGlobal({
  slug: 'home',
  data: {
    heroDescription:
      'Connect with RUET alumni across the United States through membership, regional chapters, events, and shared professional learning.',
    heroEyebrow: 'RUET Alumni Association',
    heroTitle: 'A professional, chapter-centered home for RUET alumni in the United States.',
    membershipSectionDescription:
      'Annual membership helps sustain alumni programming, regional chapters, professional development, and community connections.',
    membershipSectionTitle: 'One community, year-round connection',
    primaryCtaHref: '/membership',
    primaryCtaLabel: 'Explore Membership',
    secondaryCtaHref: '/chapters',
    secondaryCtaLabel: 'Find a Chapter',
  },
  overrideAccess: true,
})

await payload.updateGlobal({
  slug: 'siteSettings',
  data: {
    contactResponseNote:
      'Send us a message and the appropriate RUETIAN USA volunteer will follow up when available.',
    footerNote:
      'Membership, chapters, events, and learning opportunities for the RUET alumni community.',
    organizationName: 'RUETIAN USA',
    manualPaymentReviewNote:
      'Payment proof is reviewed by authorized volunteers. No turnaround time is promised until the organization approves a review SLA.',
    noRefundNotice: 'No-refund wording is awaiting final stakeholder and legal approval before launch.',
    primaryEmail: 'info@ruetianusa.org',
    tagline: 'RUET alumni community in the United States',
    utilityMessage: 'Connecting RUET alumni across the United States',
    zelleInstructions:
      'Send the exact order total through Zelle, include your name in the memo, then submit the transaction ID, a screenshot, or both. Membership remains pending until an authorized reviewer approves the proof.',
    zelleRecipientName: 'RUETIAN USA',
  },
  overrideAccess: true,
})

const activePlans = await payload.find({
  collection: 'membershipPlans',
  depth: 0,
  limit: 2,
  overrideAccess: true,
  pagination: false,
  where: { active: { equals: true } },
})
if (activePlans.docs.length > 1) {
  throw new Error('More than one active membership plan exists. Resolve the data before seeding.')
}
const membershipPlanData = {
  active: true,
  annualPrice: 50,
  benefits: [
    { label: 'Participate in national and chapter alumni programs' },
    { label: 'Access member opportunities and professional learning' },
    { label: 'Support long-term alumni operations and community continuity' },
    { label: 'Receive renewal reminders when optional system email is enabled' },
  ],
  currency: 'USD',
  faqs: [
    {
      answer:
        'Send the exact server-confirmed total through Zelle and submit the transaction ID, a screenshot or PDF, or both. Membership remains pending until manual approval.',
      question: 'How is membership payment verified?',
    },
    {
      answer:
        'No. The website does not store bank details, debit an account, or automatically renew membership. Every annual term requires a new Zelle submission.',
      question: 'Will membership renew automatically?',
    },
    {
      answer:
        'Update your complete member profile and primary chapter, then use the renewal page to submit a new annual payment. Expired memberships use the same page to reactivate.',
      question: 'How do I renew or reactivate?',
    },
  ],
  gracePeriodDays: 7,
  publicSummary:
    'One annual membership connects RUET alumni across chapters, events, learning, service, and professional community.',
  renewalPolicy:
    'Membership is annual and renews only after a new Zelle payment proof is approved. The website never debits members automatically. A configurable grace period follows expiration before reactivation is required.',
  renewalReminderDaysBefore: 30,
  renewalReminderEnabled: true,
  slug: 'annual-membership',
  sortOrder: 0,
  termsSummary:
    'Zelle payments are reviewed manually. Final membership and no-refund language must be approved before public launch.',
  title: 'Annual RUETIAN USA Membership',
}
if (activePlans.docs[0]) {
  await payload.update({
    collection: 'membershipPlans',
    data: membershipPlanData,
    id: activePlans.docs[0].id,
    overrideAccess: true,
  })
  console.log('Updated active annual membership plan.')
} else {
  await payload.create({
    collection: 'membershipPlans',
    data: membershipPlanData,
    overrideAccess: true,
  })
  console.log('Created active annual membership plan.')
}

await payload.updateGlobal({
  slug: 'seoDefaults',
  data: {
    defaultDescription:
      'RUETIAN USA connects RUET alumni across the United States through membership, chapters, events, and professional learning.',
    siteName: 'RUETIAN USA',
    titleSuffix: ' | RUETIAN USA',
  },
  overrideAccess: true,
})

console.log('CMS pages, navigation, membership, footer, home, contact, and SEO defaults are seeded.')
await payload.destroy()
process.exit(0)
