export const fallbackSiteSettings = {
  footerNote:
    'The website content, branding, and legal copy will continue to evolve as later implementation phases are completed.',
  id: 0,
  organizationName: 'RUETIAN USA',
  primaryEmail: 'info@ruetianusa.org',
  tagline: 'RUET alumni community in the United States',
  utilityMessage: 'Association website foundation',
}

export const fallbackHeader = {
  id: 0,
  mainLinks: [
    { link: { href: '/about', label: 'About' } },
    { link: { href: '/membership', label: 'Membership' } },
    { link: { href: '/chapters', label: 'Chapters' } },
    { link: { href: '/events', label: 'Events' } },
    { link: { href: '/learning', label: 'Learning' } },
    { link: { href: '/contact', label: 'Contact' } },
  ],
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
  legalNotice: 'Final legal copy is still an open item and will be added before launch.',
  newsletterSummary:
    'Newsletter sending will be enabled in a later phase once the email provider is configured.',
  newsletterTitle: 'Stay connected',
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
