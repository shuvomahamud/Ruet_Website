export const fallbackSiteSettings = {
  footerNote:
    'Membership, chapters, events, and learning opportunities for the RUET alumni community.',
  id: 0,
  organizationName: 'RUETIAN USA',
  primaryEmail: 'info@ruetianusa.org',
  tagline: 'RUET alumni community in the United States',
  utilityMessage: 'Connecting RUET alumni across the United States',
  zelleInstructions:
    'Send the exact order total through Zelle, include your name in the memo, then submit the transaction ID, a screenshot, or both. Membership remains pending until an authorized reviewer approves the proof.',
  manualPaymentReviewNote:
    'Payment proof is reviewed by authorized volunteers. No turnaround time is promised until the organization approves a review SLA.',
  noRefundNotice: 'No-refund wording is awaiting final stakeholder and legal approval before launch.',
  eventPaymentTerms:
    'Paid event registration is reserved while Zelle proof is reviewed. Event payments are not automatically debited. No refunds are issued; contact the event chapter for exceptional handling.',
}

export const defaultMainNavigation = [
  {
    children: [
      { link: { href: '/about', label: 'About RUETIAN USA' } },
      { link: { href: '/history', label: 'RUET history' } },
      { link: { href: '/committees/running', label: 'Running committee' } },
      { link: { href: '/committees/advisory', label: 'Advisory committee' } },
      { link: { href: '/committees/history', label: 'Committee archive' } },
    ],
    featured: {
      description: 'Learn how the alumni association is organized and how chapters connect.',
      eyebrow: 'Our organization',
      href: '/about',
      label: 'Explore our mission',
      title: 'Built for alumni continuity',
    },
    link: { href: '/about', label: 'About' },
  },
  {
    children: [
      { link: { href: '/membership', label: 'Membership overview' } },
      { link: { href: '/membership/join', label: 'Join membership' } },
      { link: { href: '/membership/renew', label: 'Renew or reactivate' } },
      { link: { href: '/account/settings', label: 'Account settings' } },
    ],
    featured: {
      description: 'One annual membership connecting RUET alumni across the United States.',
      eyebrow: 'Membership',
      href: '/membership',
      label: 'View membership',
      title: 'Stay connected year-round',
    },
    link: { href: '/membership', label: 'Membership' },
  },
  {
    children: [
      { link: { href: '/chapters', label: 'Chapter directory' } },
      { link: { href: '/chapters/request', label: 'Request a chapter' } },
    ],
    featured: {
      description: 'Find alumni activity, leadership, announcements, and events near you.',
      eyebrow: 'Chapter network',
      href: '/chapters',
      label: 'Find a chapter',
      title: 'Local community, national connection',
    },
    link: { href: '/chapters', label: 'Chapters' },
  },
  {
    children: [
      { link: { href: '/events', label: 'Upcoming events' } },
      { link: { href: '/events?view=archive', label: 'Event archive' } },
    ],
    featured: {
      description: 'Browse in-person, virtual, and hybrid programs from the alumni network.',
      eyebrow: 'Events',
      href: '/events',
      label: 'Browse events',
      title: 'Meet, learn, and participate',
    },
    link: { href: '/events', label: 'Events' },
  },
  {
    children: [
      { link: { href: '/learning', label: 'Learning hub' } },
      { link: { href: '/learning?type=article', label: 'Articles' } },
      { link: { href: '/learning?type=resource', label: 'Resources' } },
    ],
    featured: {
      description: 'Professional knowledge, alumni perspectives, and practical resources.',
      eyebrow: 'Learning',
      href: '/learning',
      label: 'Visit the learning hub',
      title: 'Keep developing together',
    },
    link: { href: '/learning', label: 'Learning' },
  },
  { link: { href: '/contact', label: 'Contact' } },
]

export const fallbackHeader = {
  id: 0,
  mainLinks: defaultMainNavigation,
  primaryCtaHref: '/membership',
  primaryCtaLabel: 'Join Membership',
  utilityLinks: [
    { link: { href: '/contact', label: 'Contact' } },
    { link: { href: '/login', label: 'Sign In' } },
  ],
}

export const fallbackFooter = {
  id: 0,
  groups: [
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
  legalNotice:
    'RUETIAN USA is an alumni-led community serving RUET graduates in the United States.',
  legalLinks: [
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms-of-use', label: 'Website terms' },
    { href: '/membership-terms', label: 'Membership terms' },
  ],
  newsletterCtaHref: '/communications/preferences',
  newsletterCtaLabel: 'Manage newsletter preferences',
  newsletterSummary:
    'Receive organization news, chapter updates, event notices, and learning resources.',
  newsletterTitle: 'Stay connected',
  socialLinks: [],
}

export const fallbackPages: Record<
  string,
  {
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
    title: string
  }
> = {
  about: {
    heroDescription:
      'RUETIAN USA is being structured as a professional, chapter-driven alumni association platform inspired by the information architecture of major engineering organizations.',
    heroEyebrow: 'About RUETIAN USA',
    heroTitle: 'A structured platform for alumni community, chapters, and continuity.',
    sections: [
      {
        body: 'The approved direction is for the website to function as a public institutional site, membership platform, event platform, and chapter network.',
        title: 'What this site is designed to support',
      },
      {
        body: 'This phase establishes the public shell, dynamic content model, and Payload-managed publishing foundation that later feature phases will build on.',
        title: 'Current implementation status',
      },
    ],
    title: 'About RUETIAN USA',
  },
  contact: {
    heroDescription:
      'Formal contact workflows, chapter routing, and newsletter delivery will be expanded later. This placeholder route exists so the approved site structure already has a working contact destination.',
    heroEyebrow: 'Contact',
    heroTitle: 'Contact pathways are part of the site shell now.',
    sections: [
      {
        body: 'Use the site settings global in Payload to manage the primary organization email and public contact copy.',
        title: 'Admin-managed contact information',
      },
    ],
    title: 'Contact',
  },
  'privacy-policy': {
    heroDescription:
      'Final legal copy remains an open item. This placeholder page is here so the legal information architecture already exists in the public site.',
    heroEyebrow: 'Legal Placeholder',
    heroTitle: 'Privacy policy copy is still pending stakeholder approval.',
    sections: [
      {
        body: 'The final privacy policy will be added before launch once stakeholder legal language is approved.',
        title: 'Open legal item',
      },
    ],
    title: 'Privacy Policy',
  },
  'terms-of-use': {
    heroDescription:
      'Final legal copy remains an open item. This route reserves the public location and layout for the site terms.',
    heroEyebrow: 'Legal Placeholder',
    heroTitle: 'Terms of use are still pending stakeholder approval.',
    sections: [
      {
        body: 'The final terms of use will be inserted once approved. The layout and route are already ready for that handoff.',
        title: 'Open legal item',
      },
    ],
    title: 'Terms of Use',
  },
  'membership-terms': {
    heroDescription:
      'Membership terms and final no-refund legal language remain open. This placeholder ensures the route and page template already exist.',
    heroEyebrow: 'Legal Placeholder',
    heroTitle: 'Membership terms are still pending final stakeholder copy.',
    sections: [
      {
        body: 'The final membership legal language will be inserted before launch.',
        title: 'Open legal item',
      },
    ],
    title: 'Membership Terms',
  },
}
