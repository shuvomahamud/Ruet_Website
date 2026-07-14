import { getPayload } from 'payload'

import config from '../src/payload.config'

const contentOnly = process.env.SEED_CONTENT_ONLY === 'true'
const productionOverride = contentOnly
  ? process.env.ALLOW_PRODUCTION_SAMPLE_SEED === 'true'
  : process.env.ALLOW_PRODUCTION_UAT_SEED === 'true'

if (process.env.NODE_ENV === 'production' && !productionOverride) {
  throw new Error(
    contentOnly
      ? 'Sample content is disabled in production unless ALLOW_PRODUCTION_SAMPLE_SEED=true.'
      : 'UAT fixtures are disabled in production. Use a dedicated non-production database.',
  )
}

const password = process.env.SEED_UAT_PASSWORD
if (!contentOnly && (!password || password.length < 12)) {
  throw new Error('Set SEED_UAT_PASSWORD to a unique password of at least 12 characters.')
}

const payload = await getPayload({ config })
const now = new Date()
const isoDaysFromNow = (days: number, hour = 15) => {
  const value = new Date(now)
  value.setUTCDate(value.getUTCDate() + days)
  value.setUTCHours(hour, 0, 0, 0)
  return value.toISOString()
}
const editorialContext = { editorialWorkflowBypass: true }

const categoryResult = await payload.find({
  collection: 'categories',
  depth: 0,
  limit: 1,
  overrideAccess: true,
  pagination: false,
  where: { slug: { equals: 'professional-development' } },
})
const category =
  categoryResult.docs[0] ??
  (await payload.create({
    collection: 'categories',
    data: { slug: 'professional-development', title: 'Professional Development' },
    overrideAccess: true,
  }))

const communityCategoryResult = await payload.find({
  collection: 'categories',
  depth: 0,
  limit: 1,
  overrideAccess: true,
  pagination: false,
  where: { slug: { equals: 'alumni-community' } },
})
const communityCategory =
  communityCategoryResult.docs[0] ??
  (await payload.create({
    collection: 'categories',
    data: { slug: 'alumni-community', title: 'Alumni Community' },
    overrideAccess: true,
  }))

const chapterFixtures = [
  {
    contactEmail: 'new-york@example.test',
    description:
      'The New York chapter connects alumni through professional programs, family gatherings, mentoring, and volunteer service.',
    name: 'New York Chapter',
    regionOrState: 'New York',
    slug: 'new-york',
    summary: 'RUET alumni community serving New York and nearby areas.',
  },
  {
    contactEmail: 'dmv@example.test',
    description:
      'The DMV chapter brings together alumni across Washington, DC, Maryland, and Virginia for learning and community programs.',
    name: 'DMV Chapter',
    regionOrState: 'District of Columbia, Maryland & Virginia',
    slug: 'dmv',
    summary: 'RUET alumni community across the Washington metropolitan region.',
  },
  {
    contactEmail: 'texas@example.test',
    description:
      'The Texas chapter is sample content for alumni programs, professional exchange, family gatherings, and volunteer service across the state.',
    name: 'Texas Chapter',
    regionOrState: 'Texas',
    slug: 'texas',
    summary: 'Sample RUET alumni community serving Texas and nearby areas.',
  },
  {
    contactEmail: 'california@example.test',
    description:
      'The California chapter is sample content for alumni connections, learning programs, mentoring, and community activities across the state.',
    name: 'California Chapter',
    regionOrState: 'California',
    slug: 'california',
    summary: 'Sample RUET alumni community serving California and nearby areas.',
  },
] satisfies Array<{
  contactEmail: string
  description: string
  name: string
  regionOrState: string
  slug: string
  summary: string
}>

const chapters = []
for (const fixture of chapterFixtures) {
  const existing = await payload.find({
    collection: 'chapters',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: fixture.slug } },
  })
  const chapterData = {
    ...fixture,
    _status: 'published' as const,
    chapterStatus: 'active' as const,
    editorialStatus: 'approved' as const,
    seo: {
      description: fixture.summary,
      title: fixture.name,
    },
  }
  const chapter = existing.docs[0]
    ? contentOnly
      ? await payload.update({
          collection: 'chapters',
          context: editorialContext,
          data: chapterData,
          draft: false,
          id: existing.docs[0].id,
          overrideAccess: true,
        })
      : existing.docs[0]
    : await payload.create({
        collection: 'chapters',
        context: editorialContext,
        data: chapterData,
        draft: false,
        overrideAccess: true,
      })
  chapters.push(chapter)
}
const [newYorkChapter, dmvChapter, texasChapter, californiaChapter] = chapters
if (!newYorkChapter || !dmvChapter || !texasChapter || !californiaChapter) {
  throw new Error('Unable to seed sample chapters.')
}

const postFixtures = [
  {
    authorName: 'RUETIAN USA Learning Team',
    body: 'Strong alumni mentoring begins with a clear goal, a reliable meeting rhythm, and space for both practical advice and long-term professional reflection.',
    categories: [category.id],
    contentType: 'article' as const,
    excerpt:
      'A practical framework for building useful, respectful mentoring relationships across career stages.',
    featured: true,
    readingTimeMinutes: 5,
    slug: 'building-a-strong-alumni-mentoring-relationship',
    title: 'Building a Strong Alumni Mentoring Relationship',
  },
  {
    authorName: 'RUETIAN USA Community Team',
    body: 'Regional chapters make a national alumni association locally meaningful by creating repeatable ways to meet, volunteer, share experience, and welcome new alumni.',
    categories: [communityCategory.id],
    contentType: 'resource' as const,
    excerpt: 'Ways alumni can participate in chapter programs, service, and community leadership.',
    featured: true,
    readingTimeMinutes: 4,
    slug: 'five-ways-to-participate-in-your-local-chapter',
    title: 'Five Ways to Participate in Your Local Chapter',
  },
  {
    authorName: 'RUETIAN USA Learning Team',
    body: 'A focused professional conversation is easier when participants prepare a short introduction, one current goal, and two questions they genuinely want to explore.',
    categories: [category.id],
    contentType: 'article' as const,
    excerpt: 'Simple preparation steps for making alumni networking conversations more useful.',
    featured: false,
    readingTimeMinutes: 3,
    slug: 'prepare-for-an-alumni-networking-conversation',
    title: 'Prepare for an Alumni Networking Conversation',
  },
  {
    authorName: 'RUETIAN USA Sample Editorial Team',
    body: 'This sample news article demonstrates how organization updates appear in the learning hub. Replace it in Payload Admin with an approved announcement, program recap, or alumni story before launch.',
    categories: [communityCategory.id],
    contentType: 'news' as const,
    excerpt: 'Sample organization news content that editors can replace from Payload Admin.',
    featured: false,
    readingTimeMinutes: 2,
    slug: 'sample-organization-news-update',
    title: 'Sample Organization News Update',
  },
] satisfies Array<{
  authorName: string
  body: string
  categories: number[]
  contentType: 'article' | 'resource' | 'news'
  excerpt: string
  featured: boolean
  readingTimeMinutes: number
  slug: string
  title: string
}>

for (const fixture of postFixtures) {
  const existing = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: fixture.slug } },
  })
  const data = {
    ...fixture,
    _status: 'published' as const,
    editorialStatus: 'approved' as const,
    publishedAt: existing.docs[0]?.publishedAt || now.toISOString(),
    seo: { description: fixture.excerpt, title: fixture.title },
  }
  if (existing.docs[0]) {
    if (contentOnly) {
      await payload.update({
        collection: 'posts',
        context: editorialContext,
        data,
        draft: false,
        id: existing.docs[0].id,
        overrideAccess: true,
      })
    }
  } else {
    await payload.create({
      collection: 'posts',
      context: editorialContext,
      data,
      draft: false,
      overrideAccess: true,
    })
  }
}

const historyFixtures = [
  {
    body: 'The engineering institution in Rajshahi began a lasting educational tradition that now connects graduates serving communities around the world.',
    sortOrder: 10,
    startYear: 1964,
    summary: 'An engineering education tradition begins in Rajshahi.',
    title: 'An Engineering Legacy Takes Root',
  },
  {
    body: 'Generations of graduates carried RUET knowledge, friendship, and service into professional and community life across the United States.',
    sortOrder: 20,
    startYear: 2000,
    summary: 'Alumni connections grow across cities, careers, and generations.',
    title: 'A Wider Alumni Network',
  },
  {
    body: 'RUETIAN USA brings national continuity together with locally meaningful chapter programs, events, learning, and volunteer leadership.',
    featured: true,
    sortOrder: 30,
    startYear: now.getUTCFullYear(),
    summary: 'A chapter-centered alumni community continues to grow.',
    title: 'Connected Through Chapters and Service',
  },
] satisfies Array<{
  body: string
  featured?: boolean
  sortOrder: number
  startYear: number
  summary: string
  title: string
}>

for (const fixture of historyFixtures) {
  const existing = await payload.find({
    collection: 'historyEntries',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { title: { equals: fixture.title } },
  })
  const data = { ...fixture, _status: 'published' as const, editorialStatus: 'approved' as const }
  if (existing.docs[0]) {
    if (contentOnly) {
      await payload.update({
        collection: 'historyEntries',
        context: editorialContext,
        data,
        draft: false,
        id: existing.docs[0].id,
        overrideAccess: true,
      })
    }
  } else {
    await payload.create({
      collection: 'historyEntries',
      context: editorialContext,
      data,
      draft: false,
      overrideAccess: true,
    })
  }
}

const committeeFixtures = [
  {
    committeeType: 'running' as const,
    endDate: isoDaysFromNow(730),
    eventRecaps: [
      {
        eventDate: isoDaysFromNow(-90),
        summary:
          'Sample recap showing how committee programs appear in the public leadership archive.',
        title: 'Sample Alumni Program Recap',
      },
    ],
    isCurrent: true,
    members: [
      {
        bio: 'Sample leadership profile. Replace this name, biography, and photo in Payload Admin.',
        name: 'Sample Member One',
        role: 'President',
      },
      {
        bio: 'Sample leadership profile. Replace this name, biography, and photo in Payload Admin.',
        name: 'Sample Member Two',
        role: 'General Secretary',
      },
      {
        bio: 'Sample leadership profile. Replace this name, biography, and photo in Payload Admin.',
        name: 'Sample Member Three',
        role: 'Treasurer',
      },
    ],
    startDate: isoDaysFromNow(-30),
    summary: 'Volunteer leaders coordinating national programs, chapters, and member services.',
    title: `${now.getUTCFullYear()}–${now.getUTCFullYear() + 2} Running Committee`,
  },
  {
    committeeType: 'advisory' as const,
    endDate: isoDaysFromNow(730),
    eventRecaps: [],
    isCurrent: true,
    members: [
      {
        bio: 'Sample advisory profile. Replace this name, biography, and photo in Payload Admin.',
        name: 'Sample Advisor One',
        role: 'Advisory Chair',
      },
      {
        bio: 'Sample advisory profile. Replace this name, biography, and photo in Payload Admin.',
        name: 'Sample Advisor Two',
        role: 'Advisor',
      },
    ],
    startDate: isoDaysFromNow(-30),
    summary: 'Experienced alumni contributing guidance and institutional perspective.',
    title: `${now.getUTCFullYear()}–${now.getUTCFullYear() + 2} Advisory Committee`,
  },
  {
    committeeType: 'running' as const,
    endDate: isoDaysFromNow(-60),
    eventRecaps: [
      {
        eventDate: isoDaysFromNow(-180),
        summary:
          'Sample historical recap demonstrating the committee archive. Replace it with an approved program record.',
        title: 'Sample Community Program',
      },
    ],
    isCurrent: false,
    members: [
      {
        bio: 'Sample historical profile for demonstrating past leadership records.',
        name: 'Sample Past Member One',
        role: 'President',
      },
      {
        bio: 'Sample historical profile for demonstrating past leadership records.',
        name: 'Sample Past Member Two',
        role: 'General Secretary',
      },
    ],
    startDate: isoDaysFromNow(-790),
    summary: 'Sample prior running committee retained to demonstrate the leadership archive.',
    title: `${now.getUTCFullYear() - 2}–${now.getUTCFullYear()} Running Committee`,
  },
  {
    committeeType: 'advisory' as const,
    endDate: isoDaysFromNow(-60),
    eventRecaps: [],
    isCurrent: false,
    members: [
      {
        bio: 'Sample historical profile for demonstrating past advisory records.',
        name: 'Sample Past Advisor',
        role: 'Advisory Chair',
      },
    ],
    startDate: isoDaysFromNow(-790),
    summary: 'Sample prior advisory committee retained to demonstrate the leadership archive.',
    title: `${now.getUTCFullYear() - 2}–${now.getUTCFullYear()} Advisory Committee`,
  },
] satisfies Array<{
  committeeType: 'running' | 'advisory'
  endDate: string
  eventRecaps: Array<{ eventDate: string; summary: string; title: string }>
  isCurrent: boolean
  members: Array<{ bio: string; name: string; role: string }>
  startDate: string
  summary: string
  title: string
}>

for (const fixture of committeeFixtures) {
  const existing = await payload.find({
    collection: 'committeeTerms',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { title: { equals: fixture.title } },
  })
  const data = {
    ...fixture,
    _status: 'published' as const,
    editorialStatus: 'approved' as const,
  }
  if (existing.docs[0]) {
    if (contentOnly) {
      await payload.update({
        collection: 'committeeTerms',
        context: editorialContext,
        data,
        draft: false,
        id: existing.docs[0].id,
        overrideAccess: true,
      })
    }
  } else {
    await payload.create({
      collection: 'committeeTerms',
      context: editorialContext,
      data,
      draft: false,
      overrideAccess: true,
    })
  }
}

const chapterCommittee = await payload.find({
  collection: 'committeeTerms',
  depth: 0,
  limit: 1,
  overrideAccess: true,
  pagination: false,
  where: { title: { equals: 'New York Chapter Leadership Team' } },
})
const chapterCommitteeData = {
  _status: 'published' as const,
  chapter: newYorkChapter.id,
  committeeType: 'running' as const,
  editorialStatus: 'approved' as const,
  endDate: isoDaysFromNow(730),
  eventRecaps: [
    {
      eventDate: isoDaysFromNow(-45),
      summary: 'Sample chapter activity recap. Replace this text from the committee record.',
      title: 'Sample Chapter Volunteer Gathering',
    },
  ],
  isCurrent: true,
  members: [
    {
      bio: 'Sample chapter leader profile.',
      name: 'Sample Chapter Leader One',
      role: 'Chapter Coordinator',
    },
    {
      bio: 'Sample chapter leader profile.',
      name: 'Sample Chapter Leader Two',
      role: 'Programs Lead',
    },
  ],
  startDate: isoDaysFromNow(-30),
  summary: 'Local volunteers coordinating New York chapter programs and outreach.',
  title: 'New York Chapter Leadership Team',
}
if (chapterCommittee.docs[0]) {
  if (contentOnly) {
    await payload.update({
      collection: 'committeeTerms',
      context: editorialContext,
      data: chapterCommitteeData,
      draft: false,
      id: chapterCommittee.docs[0].id,
      overrideAccess: true,
    })
  }
} else {
  await payload.create({
    collection: 'committeeTerms',
    context: editorialContext,
    data: chapterCommitteeData,
    draft: false,
    overrideAccess: true,
  })
}

const eventFixtures = [
  {
    basePrice: 0,
    capacity: 80,
    chapter: newYorkChapter.id,
    details:
      'A facilitated conversation about volunteer leadership, mentoring, and sustaining useful alumni programs.',
    endAt: isoDaysFromNow(31, 19),
    eventMode: 'hybrid' as const,
    isPaid: false,
    maxRegistrationQuantity: 4,
    slug: 'alumni-leadership-forum',
    startAt: isoDaysFromNow(31, 16),
    summary: 'Connect with alumni leaders and explore practical ways to serve the community.',
    title: 'Alumni Leadership Forum',
    venue: 'New York, NY',
  },
  {
    basePrice: 20,
    capacity: 40,
    chapter: dmvChapter.id,
    details:
      'A small-group workshop focused on professional introductions, career conversations, and peer connections.',
    endAt: isoDaysFromNow(45, 20),
    eventMode: 'inPerson' as const,
    isPaid: true,
    maxRegistrationQuantity: 2,
    slug: 'professional-connections-workshop',
    startAt: isoDaysFromNow(45, 17),
    summary:
      'Practice useful networking conversations with alumni across industries and career stages.',
    title: 'Professional Connections Workshop',
    venue: 'Arlington, VA',
  },
  {
    basePrice: 0,
    capacity: 120,
    chapter: newYorkChapter.id,
    details:
      'An alumni and family community gathering with chapter updates and volunteer recognition.',
    endAt: isoDaysFromNow(-30, 20),
    eventMode: 'inPerson' as const,
    isPaid: false,
    maxRegistrationQuantity: 6,
    recapSummary:
      'Alumni and families gathered for conversation, community updates, and recognition of chapter volunteers.',
    slug: 'community-family-gathering',
    startAt: isoDaysFromNow(-30, 15),
    status: 'archived' as const,
    summary: 'A completed chapter gathering for alumni and families.',
    title: 'Community Family Gathering',
    venue: 'Queens, NY',
  },
  {
    basePrice: 0,
    capacity: 100,
    chapter: californiaChapter.id,
    details:
      'A sample virtual alumni session demonstrating online event discovery and registration. Replace the program details before launch.',
    endAt: isoDaysFromNow(60, 21),
    eventMode: 'virtual' as const,
    isPaid: false,
    maxRegistrationQuantity: 1,
    slug: 'sample-virtual-career-conversation',
    startAt: isoDaysFromNow(60, 19),
    summary: 'Sample virtual program for alumni career conversations and peer learning.',
    timezone: 'America/Los_Angeles' as const,
    title: 'Sample Virtual Career Conversation',
    venue: 'Online',
  },
] satisfies Array<{
  basePrice: number
  capacity: number
  chapter: number
  details: string
  endAt: string
  eventMode: 'inPerson' | 'virtual' | 'hybrid'
  isPaid: boolean
  maxRegistrationQuantity: number
  recapSummary?: string
  slug: string
  startAt: string
  status?: 'archived'
  summary: string
  timezone?: 'America/New_York' | 'America/Los_Angeles'
  title: string
  venue: string
}>

const events = []
for (const fixture of eventFixtures) {
  const existing = await payload.find({
    collection: 'events',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: fixture.slug } },
  })
  const eventData = {
    ...fixture,
    _status: 'published' as const,
    currency: 'USD',
    editorialStatus: 'approved' as const,
    publishedAt: existing.docs[0]?.publishedAt || now.toISOString(),
    seo: { description: fixture.summary, title: fixture.title },
    status: fixture.status || ('published' as const),
    timezone: fixture.timezone || ('America/New_York' as const),
    waitlistEnabled: true,
    waitlistOfferHours: 48,
  }
  const event = existing.docs[0]
    ? contentOnly
      ? await payload.update({
          collection: 'events',
          context: editorialContext,
          data: eventData,
          draft: false,
          id: existing.docs[0].id,
          overrideAccess: true,
        })
      : existing.docs[0]
    : await payload.create({
        collection: 'events',
        context: editorialContext,
        data: eventData,
        draft: false,
        overrideAccess: true,
      })
  events.push(event)
}
const [freeEvent, paidEvent] = events
if (!freeEvent || !paidEvent) throw new Error('Unable to seed UAT events.')

const announcementFixtures = [
  {
    audience: 'public' as const,
    ctaHref: '/events',
    ctaLabel: 'Browse events',
    details: 'Explore upcoming national and chapter programs and register from your account.',
    summary: 'New alumni programs are open for registration.',
    title: 'Upcoming Programs Across the Alumni Network',
    tone: 'info' as const,
  },
  {
    audience: 'members' as const,
    chapter: newYorkChapter.id,
    details:
      'Members can review upcoming New York programs and contact local leadership from the chapter page.',
    summary: 'A member update from the New York chapter.',
    title: 'New York Chapter Member Update',
    tone: 'success' as const,
  },
  {
    audience: 'public' as const,
    chapter: texasChapter.id,
    ctaHref: '/chapters/texas',
    ctaLabel: 'View sample chapter',
    details:
      'This sample chapter announcement demonstrates regional targeting and can be replaced or unpublished from Payload Admin.',
    summary: 'Sample public update from the Texas chapter.',
    title: 'Sample Texas Chapter Announcement',
    tone: 'info' as const,
  },
] as const

for (const fixture of announcementFixtures) {
  const existing = await payload.find({
    collection: 'announcements',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { title: { equals: fixture.title } },
  })
  const data = {
    ...fixture,
    _status: 'published' as const,
    activeFrom: isoDaysFromNow(-1),
    activeTo: isoDaysFromNow(120),
    editorialStatus: 'approved' as const,
    publishedAt: existing.docs[0]?.publishedAt || now.toISOString(),
  }
  if (existing.docs[0]) {
    if (contentOnly) {
      await payload.update({
        collection: 'announcements',
        context: editorialContext,
        data,
        draft: false,
        id: existing.docs[0].id,
        overrideAccess: true,
      })
    }
  } else {
    await payload.create({
      collection: 'announcements',
      context: editorialContext,
      data,
      draft: false,
      overrideAccess: true,
    })
  }
}

const promotionResult = await payload.find({
  collection: 'promotions',
  depth: 0,
  limit: 1,
  overrideAccess: true,
  pagination: false,
  where: { code: { equals: 'UATWELCOME10' } },
})
const promotionData = {
  active: true,
  code: 'UATWELCOME10',
  discountType: 'percent' as const,
  discountValue: 10,
  endsAt: isoDaysFromNow(120),
  memberOnly: false,
  scope: 'both' as const,
  startsAt: isoDaysFromNow(-1),
  usageLimit: 100,
}
if (promotionResult.docs[0]) {
  if (contentOnly) {
    await payload.update({
      collection: 'promotions',
      data: promotionData,
      id: promotionResult.docs[0].id,
      overrideAccess: true,
    })
  }
} else {
  await payload.create({
    collection: 'promotions',
    data: promotionData,
    overrideAccess: true,
  })
}

if (contentOnly) {
  console.log(
    'Seeded editable sample chapters, committees, history, learning posts, events, announcements, categories, and promotion data.',
  )
  console.log(
    'No users, memberships, orders, payments, registrations, or waitlist entries were created.',
  )
  await payload.destroy()
  process.exit(0)
}

if (!password) throw new Error('SEED_UAT_PASSWORD is required for UAT accounts.')

const userFixtures = [
  {
    email: 'uat.superadmin@example.test',
    firstName: 'UAT',
    lastName: 'Super Admin',
    role: 'superAdmin' as const,
  },
  {
    email: 'uat.admin@example.test',
    firstName: 'UAT',
    lastName: 'Administrator',
    role: 'admin' as const,
  },
  {
    email: 'uat.chapteradmin@example.test',
    firstName: 'UAT',
    lastName: 'Chapter Admin',
    role: 'chapterAdmin' as const,
  },
  {
    email: 'uat.member@example.test',
    firstName: 'UAT',
    lastName: 'Member',
    role: 'member' as const,
  },
] as const

const users = []
for (const fixture of userFixtures) {
  const existing = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { email: { equals: fixture.email } },
  })
  const user =
    existing.docs[0] ??
    (await payload.create({
      collection: 'users',
      context: { seedTestUser: true },
      data: {
        ...fixture,
        _verified: true,
        accountStatus: 'active',
        city: 'New York',
        communicationPreferences: {
          allowAnnouncements: true,
          allowNewsletters: true,
          allowSystemEmails: true,
        },
        country: 'United States',
        graduationYear: 2010,
        managedChapters: fixture.role === 'chapterAdmin' ? [newYorkChapter.id] : [],
        password,
        primaryChapter: newYorkChapter.id,
        privacyAcceptedAt: now.toISOString(),
        ruetDepartment: 'Electrical and Computer Engineering',
        state: 'New York',
        termsAcceptedAt: now.toISOString(),
      },
      overrideAccess: true,
    }))
  users.push(user)
}
const member = users[3]
if (!member) throw new Error('Unable to seed the UAT member.')

await payload.update({
  collection: 'chapters',
  context: editorialContext,
  data: { chapterAdmins: [users[2]?.id].filter((id): id is number => typeof id === 'number') },
  draft: false,
  id: newYorkChapter.id,
  overrideAccess: true,
})

const planResult = await payload.find({
  collection: 'membershipPlans',
  depth: 0,
  limit: 1,
  overrideAccess: true,
  pagination: false,
  where: { active: { equals: true } },
})
const plan = planResult.docs[0]
if (!plan) throw new Error('Run the CMS page seed first so the active membership plan exists.')

const membershipResult = await payload.find({
  collection: 'memberships',
  depth: 0,
  limit: 1,
  overrideAccess: true,
  pagination: false,
  where: { and: [{ user: { equals: member.id } }, { status: { equals: 'active' } }] },
})
const membership =
  membershipResult.docs[0] ??
  (await payload.create({
    collection: 'memberships',
    data: {
      billingIntervalSnapshot: 'annual',
      chapterAttribution: newYorkChapter.id,
      chapterNameSnapshot: newYorkChapter.name,
      currencySnapshot: plan.currency,
      expiresAt: isoDaysFromNow(365),
      graceEndsAt: isoDaysFromNow(372),
      gracePeriodDaysSnapshot: plan.gracePeriodDays ?? 7,
      membershipKind: 'join',
      paymentMethod: 'zelle',
      plan: plan.id,
      planPriceSnapshot: plan.annualPrice,
      planTitleSnapshot: plan.title,
      reactivationEligible: true,
      renewalAt: isoDaysFromNow(335),
      renewalReminderDaysBeforeSnapshot: plan.renewalReminderDaysBefore ?? 30,
      renewalReminderEnabledSnapshot: plan.renewalReminderEnabled ?? true,
      startedAt: isoDaysFromNow(-1),
      status: 'active',
      user: member.id,
    },
    overrideAccess: true,
  }))

const orderResult = await payload.find({
  collection: 'orders',
  depth: 0,
  limit: 1,
  overrideAccess: true,
  pagination: false,
  where: { membership: { equals: membership.id } },
})
let order = orderResult.docs[0]
if (!order) {
  order = await payload.create({
    collection: 'orders',
    data: {
      chapterAttribution: newYorkChapter.id,
      chapterNameSnapshot: newYorkChapter.name,
      currency: plan.currency,
      discountTotal: 0,
      membership: membership.id,
      orderType: 'membership',
      paymentMethod: 'zelle',
      status: 'pending',
      subtotal: plan.annualPrice,
      total: plan.annualPrice,
      user: member.id,
    },
    overrideAccess: true,
  })
  await payload.create({
    collection: 'payments',
    data: {
      amountSnapshot: order.total,
      approvedAt: now.toISOString(),
      approvedBy: users[1]?.id,
      approvedByRoleSnapshot: 'admin',
      chapterNameSnapshot: newYorkChapter.name,
      currencySnapshot: order.currency,
      firstReviewerChapter: newYorkChapter.id,
      order: order.id,
      orderTypeSnapshot: 'membership',
      paymentSource: 'zelle',
      proofTransactionId: `UAT-${now.getUTCFullYear()}-MEMBER`,
      status: 'approved',
      submittedAt: isoDaysFromNow(-1),
      user: member.id,
    },
    overrideAccess: true,
  })
  order = await payload.update({
    collection: 'orders',
    data: { status: 'paid' },
    id: order.id,
    overrideAccess: true,
  })
}

const registrationResult = await payload.find({
  collection: 'eventRegistrations',
  depth: 0,
  limit: 1,
  overrideAccess: true,
  pagination: false,
  where: { and: [{ event: { equals: freeEvent.id } }, { user: { equals: member.id } }] },
})
if (!registrationResult.docs[0]) {
  await payload.create({
    collection: 'eventRegistrations',
    context: { eventWorkflowValidated: true },
    data: {
      chapterNameSnapshot: newYorkChapter.name,
      currencySnapshot: 'USD',
      discountSnapshot: 0,
      event: freeEvent.id,
      eventStartAtSnapshot: freeEvent.startAt,
      eventTitleSnapshot: freeEvent.title,
      quantity: 1,
      registrationPriceSnapshot: 0,
      status: 'confirmed',
      unitPriceSnapshot: 0,
      user: member.id,
    },
    overrideAccess: true,
    user: member,
  })
}

const waitlistResult = await payload.find({
  collection: 'waitlistEntries',
  depth: 0,
  limit: 1,
  overrideAccess: true,
  pagination: false,
  where: { and: [{ event: { equals: paidEvent.id } }, { user: { equals: member.id } }] },
})
if (!waitlistResult.docs[0]) {
  await payload.create({
    collection: 'waitlistEntries',
    context: { eventWorkflowValidated: true },
    data: {
      event: paidEvent.id,
      joinedAt: now.toISOString(),
      quantity: 1,
      status: 'waiting',
      user: member.id,
    },
    overrideAccess: true,
    user: member,
  })
}

console.log('Seeded realistic public content and role-based UAT fixtures.')
console.log('UAT accounts use the password supplied through SEED_UAT_PASSWORD:')
for (const fixture of userFixtures) console.log(`- ${fixture.email} (${fixture.role})`)

await payload.destroy()
process.exit(0)
