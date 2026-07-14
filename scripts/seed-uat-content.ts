import { getPayload } from 'payload'

import config from '../src/payload.config'

if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_UAT_SEED !== 'true') {
  throw new Error(
    'UAT fixtures are disabled in production. Use a dedicated non-production database.',
  )
}

const password = process.env.SEED_UAT_PASSWORD
if (!password || password.length < 12) {
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
  const chapter =
    existing.docs[0] ??
    (await payload.create({
      collection: 'chapters',
      context: editorialContext,
      data: {
        ...fixture,
        _status: 'published',
        chapterStatus: 'active',
        editorialStatus: 'approved',
        seo: {
          description: fixture.summary,
          title: fixture.name,
        },
      },
      draft: false,
      overrideAccess: true,
    }))
  chapters.push(chapter)
}
const [newYorkChapter, dmvChapter] = chapters
if (!newYorkChapter || !dmvChapter) throw new Error('Unable to seed UAT chapters.')

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
  if (!existing.docs[0]) {
    await payload.create({
      collection: 'posts',
      context: editorialContext,
      data: {
        ...fixture,
        _status: 'published',
        editorialStatus: 'approved',
        publishedAt: now.toISOString(),
        seo: { description: fixture.excerpt, title: fixture.title },
      },
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
  if (!existing.docs[0]) {
    await payload.create({
      collection: 'historyEntries',
      context: editorialContext,
      data: { ...fixture, _status: 'published', editorialStatus: 'approved' },
      draft: false,
      overrideAccess: true,
    })
  }
}

const committeeFixtures = [
  {
    committeeType: 'running' as const,
    members: [
      {
        bio: 'UAT editorial fixture for national leadership presentation.',
        name: 'Amina Rahman',
        role: 'President',
      },
      {
        bio: 'UAT editorial fixture for national leadership presentation.',
        name: 'Farhan Karim',
        role: 'General Secretary',
      },
      {
        bio: 'UAT editorial fixture for national leadership presentation.',
        name: 'Nadia Ahmed',
        role: 'Treasurer',
      },
    ],
    summary: 'Volunteer leaders coordinating national programs, chapters, and member services.',
    title: `${now.getUTCFullYear()}–${now.getUTCFullYear() + 2} Running Committee`,
  },
  {
    committeeType: 'advisory' as const,
    members: [
      {
        bio: 'UAT editorial fixture for advisory leadership presentation.',
        name: 'Rezaul Hasan',
        role: 'Advisory Chair',
      },
      {
        bio: 'UAT editorial fixture for advisory leadership presentation.',
        name: 'Samira Chowdhury',
        role: 'Advisor',
      },
    ],
    summary: 'Experienced alumni contributing guidance and institutional perspective.',
    title: `${now.getUTCFullYear()}–${now.getUTCFullYear() + 2} Advisory Committee`,
  },
] satisfies Array<{
  committeeType: 'running' | 'advisory'
  members: Array<{ bio: string; name: string; role: string }>
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
  if (!existing.docs[0]) {
    await payload.create({
      collection: 'committeeTerms',
      context: editorialContext,
      data: {
        ...fixture,
        _status: 'published',
        editorialStatus: 'approved',
        endDate: isoDaysFromNow(730),
        isCurrent: true,
        startDate: isoDaysFromNow(-1),
      },
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
if (!chapterCommittee.docs[0]) {
  await payload.create({
    collection: 'committeeTerms',
    context: editorialContext,
    data: {
      _status: 'published',
      chapter: newYorkChapter.id,
      committeeType: 'running',
      editorialStatus: 'approved',
      endDate: isoDaysFromNow(730),
      isCurrent: true,
      members: [
        { name: 'Tasnim Islam', role: 'Chapter Coordinator' },
        { name: 'Mahmud Hossain', role: 'Programs Lead' },
      ],
      startDate: isoDaysFromNow(-1),
      summary: 'Local volunteers coordinating New York chapter programs and outreach.',
      title: 'New York Chapter Leadership Team',
    },
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
  const event =
    existing.docs[0] ??
    (await payload.create({
      collection: 'events',
      context: editorialContext,
      data: {
        ...fixture,
        _status: 'published',
        currency: 'USD',
        editorialStatus: 'approved',
        publishedAt: now.toISOString(),
        seo: { description: fixture.summary, title: fixture.title },
        status: fixture.status || 'published',
        timezone: 'America/New_York',
        waitlistEnabled: true,
        waitlistOfferHours: 48,
      },
      draft: false,
      overrideAccess: true,
    }))
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
  if (!existing.docs[0]) {
    await payload.create({
      collection: 'announcements',
      context: editorialContext,
      data: {
        ...fixture,
        _status: 'published',
        activeFrom: isoDaysFromNow(-1),
        activeTo: isoDaysFromNow(120),
        editorialStatus: 'approved',
        publishedAt: now.toISOString(),
      },
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
if (!promotionResult.docs[0]) {
  await payload.create({
    collection: 'promotions',
    data: {
      active: true,
      code: 'UATWELCOME10',
      discountType: 'percent',
      discountValue: 10,
      endsAt: isoDaysFromNow(120),
      memberOnly: false,
      scope: 'both',
      startsAt: isoDaysFromNow(-1),
      usageLimit: 100,
    },
    overrideAccess: true,
  })
}

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
