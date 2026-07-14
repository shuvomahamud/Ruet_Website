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
    'Payment proof is reviewed manually by authorized volunteers. Review timing may vary.',
  noRefundNotice:
    'Zelle payments are non-refundable. Contact RUETIAN USA before paying if you have questions about an order.',
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
      { link: { href: '/dashboard', label: 'Member dashboard' } },
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
    { href: '/privacy-policy', label: 'Privacy policy' },
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
