import type { Payload, Where } from 'payload'

import { getManagedChapterIDs, getRole } from '@/access/roles'
import type {
  Chapter,
  Event,
  EventRegistration,
  Membership,
  Order,
  Payment,
  User,
  WaitlistEntry,
} from '@/payload-types'
import { AppError } from '@/utilities/errors'
import { getRelationshipID } from '@/utilities/relationships'

export type ReportFilters = {
  chapterID?: number
  from?: string
  to?: string
}

export type CountMetric = {
  count: number
  status: string
}

export type RevenueMetric = {
  chapter: string
  event: number
  membership: number
  total: number
}

export type MembershipTermMetric = {
  activeOrGrace: number
  expired: number
  failed: number
  kind: Membership['membershipKind']
  pending: number
  total: number
}

export type EventMetric = {
  capacity?: number
  chapter: string
  confirmed: number
  event: string
  pending: number
  remaining?: number
  startAt: string
  waitlisted: number
}

export type PromotionMetric = {
  code: string
  discount: number
  failed: number
  paid: number
  pending: number
  revenue: number
  uses: number
}

export type ReportingData = {
  approvalOutcomes: CountMetric[]
  chapters: Pick<Chapter, 'id' | 'name'>[]
  eventRegistrations: CountMetric[]
  events: EventMetric[]
  filters: ReportFilters
  membershipKinds: CountMetric[]
  membershipTermOutcomes: MembershipTermMetric[]
  memberships: CountMetric[]
  paymentOutcomes: CountMetric[]
  promotions: PromotionMetric[]
  revenue: RevenueMetric[]
  scopeLabel: string
  totals: {
    approvedRevenue: number
    failedPayments: number
    registrations: number
    waitlistEntries: number
  }
  waitlistOutcomes: CountMetric[]
}

type PageResult<T> = {
  docs: T[]
  hasNextPage?: boolean | null
}

const collectPages = async <T>(load: (page: number) => Promise<PageResult<T>>): Promise<T[]> => {
  const docs: T[] = []
  let page = 1

  while (true) {
    const result = await load(page)
    docs.push(...result.docs)
    if (!result.hasNextPage) return docs
    page += 1
  }
}

const andWhere = (clauses: Where[]): Where | undefined =>
  clauses.length ? ({ and: clauses } as Where) : undefined

const dateClauses = (field: string, filters: ReportFilters): Where[] => {
  const clauses: Where[] = []
  if (filters.from) clauses.push({ [field]: { greater_than_equal: `${filters.from}T00:00:00.000Z` } })
  if (filters.to) clauses.push({ [field]: { less_than_equal: `${filters.to}T23:59:59.999Z` } })
  return clauses
}

const countBy = (values: string[], expected: string[]): CountMetric[] => {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return Array.from(new Set([...expected, ...counts.keys()])).map((status) => ({
    count: counts.get(status) ?? 0,
    status,
  }))
}

const roundMoney = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100

const validateFilters = (filters: ReportFilters): ReportFilters => {
  if (filters.from && Number.isNaN(Date.parse(`${filters.from}T00:00:00.000Z`))) {
    throw new AppError('The report start date is invalid.', { code: 'REPORT_DATE_INVALID', status: 400 })
  }
  if (filters.to && Number.isNaN(Date.parse(`${filters.to}T23:59:59.999Z`))) {
    throw new AppError('The report end date is invalid.', { code: 'REPORT_DATE_INVALID', status: 400 })
  }
  if (filters.from && filters.to && filters.from > filters.to) {
    throw new AppError('The report end date must not be before the start date.', {
      code: 'REPORT_DATE_RANGE_INVALID',
      status: 400,
    })
  }
  return filters
}

export const parseReportFilters = (url: URL): ReportFilters => {
  const chapter = url.searchParams.get('chapter')
  const chapterID = chapter && /^\d+$/.test(chapter) ? Number(chapter) : undefined
  return validateFilters({
    chapterID: chapterID && Number.isSafeInteger(chapterID) ? chapterID : undefined,
    from: url.searchParams.get('from') || undefined,
    to: url.searchParams.get('to') || undefined,
  })
}

const resolveScope = ({ filters, user }: { filters: ReportFilters; user: User }) => {
  const role = getRole(user)
  if (!['chapterAdmin', 'admin', 'superAdmin'].includes(role ?? '')) {
    throw new AppError('You are not authorized to view operational reports.', {
      code: 'REPORT_FORBIDDEN',
      status: 403,
    })
  }

  if (role !== 'chapterAdmin') {
    return {
      allowedChapterIDs: filters.chapterID ? [filters.chapterID] : undefined,
      role,
    }
  }

  const managedChapterIDs = getManagedChapterIDs(user)
  if (!managedChapterIDs.length) {
    throw new AppError('No managed chapter is assigned to this account.', {
      code: 'REPORT_SCOPE_EMPTY',
      status: 403,
    })
  }
  if (filters.chapterID && !managedChapterIDs.includes(filters.chapterID)) {
    throw new AppError('That chapter is outside your reporting scope.', {
      code: 'REPORT_CHAPTER_FORBIDDEN',
      status: 403,
    })
  }
  return {
    allowedChapterIDs: filters.chapterID ? [filters.chapterID] : managedChapterIDs,
    role,
  }
}

export const getReportingData = async ({
  filters: suppliedFilters = {},
  payload,
  user,
}: {
  filters?: ReportFilters
  payload: Payload
  user: User
}): Promise<ReportingData> => {
  const filters = validateFilters(suppliedFilters)
  const scope = resolveScope({ filters, user })
  const chapterClause = (field: string): Where[] =>
    scope.allowedChapterIDs ? [{ [field]: { in: scope.allowedChapterIDs } }] : []
  const pageSize = 250

  const [allChapters, memberships, payments, orders, events, registrations] = await Promise.all([
    collectPages<Chapter>((page) =>
      payload.find({
        collection: 'chapters',
        depth: 0,
        limit: pageSize,
        overrideAccess: true,
        page,
        sort: 'name',
        where: scope.allowedChapterIDs ? { id: { in: scope.allowedChapterIDs } } : undefined,
      }),
    ),
    collectPages<Membership>((page) =>
      payload.find({
        collection: 'memberships',
        depth: 0,
        limit: pageSize,
        overrideAccess: true,
        page,
        where: andWhere([
          ...chapterClause('chapterAttribution'),
          ...dateClauses('createdAt', filters),
        ]),
      }),
    ),
    collectPages<Payment>((page) =>
      payload.find({
        collection: 'payments',
        depth: 0,
        limit: pageSize,
        overrideAccess: true,
        page,
        where: andWhere([
          ...chapterClause('firstReviewerChapter'),
          ...dateClauses('submittedAt', filters),
        ]),
      }),
    ),
    collectPages<Order>((page) =>
      payload.find({
        collection: 'orders',
        depth: 0,
        limit: pageSize,
        overrideAccess: true,
        page,
        where: andWhere([
          ...chapterClause('chapterAttribution'),
          ...dateClauses('createdAt', filters),
        ]),
      }),
    ),
    collectPages<Event>((page) =>
      payload.find({
        collection: 'events',
        depth: 0,
        limit: pageSize,
        overrideAccess: true,
        page,
        sort: '-startAt',
        where: andWhere([...chapterClause('chapter'), ...dateClauses('startAt', filters)]),
      }),
    ),
    collectPages<EventRegistration>((page) =>
      payload.find({
        collection: 'eventRegistrations',
        depth: 0,
        limit: pageSize,
        overrideAccess: true,
        page,
        where: andWhere([
          ...chapterClause('event.chapter'),
          ...dateClauses('eventStartAtSnapshot', filters),
        ]),
      }),
    ),
  ])

  const eventIDs = events.map((event) => event.id)
  const waitlist = eventIDs.length
    ? await collectPages<WaitlistEntry>((page) =>
        payload.find({
          collection: 'waitlistEntries',
          depth: 0,
          limit: pageSize,
          overrideAccess: true,
          page,
          where: { event: { in: eventIDs } },
        }),
      )
    : []

  const chapterNames = new Map(allChapters.map((chapter) => [chapter.id, chapter.name]))
  const revenueMap = new Map<string, RevenueMetric>()
  for (const payment of payments.filter((item) => item.status === 'approved')) {
    const chapter =
      payment.chapterNameSnapshot ||
      chapterNames.get(getRelationshipID(payment.firstReviewerChapter) ?? -1) ||
      'Organization-wide'
    const row = revenueMap.get(chapter) ?? { chapter, event: 0, membership: 0, total: 0 }
    row[payment.orderTypeSnapshot] = roundMoney(
      row[payment.orderTypeSnapshot] + payment.amountSnapshot,
    )
    row.total = roundMoney(row.total + payment.amountSnapshot)
    revenueMap.set(chapter, row)
  }

  const registrationByEvent = new Map<number, EventRegistration[]>()
  for (const registration of registrations) {
    const eventID = getRelationshipID(registration.event)
    if (!eventID) continue
    registrationByEvent.set(eventID, [...(registrationByEvent.get(eventID) ?? []), registration])
  }
  const waitlistByEvent = new Map<number, WaitlistEntry[]>()
  for (const entry of waitlist) {
    const eventID = getRelationshipID(entry.event)
    if (!eventID) continue
    waitlistByEvent.set(eventID, [...(waitlistByEvent.get(eventID) ?? []), entry])
  }
  const eventMetrics = events.map((event): EventMetric => {
    const eventRegistrations = registrationByEvent.get(event.id) ?? []
    const eventWaitlist = waitlistByEvent.get(event.id) ?? []
    const quantity = (status: EventRegistration['status']) =>
      eventRegistrations
        .filter((registration) => registration.status === status)
        .reduce((total, registration) => total + registration.quantity, 0)
    const pending = quantity('pending')
    const confirmed = quantity('confirmed')
    const waitlisted = eventWaitlist
      .filter((entry) => ['waiting', 'promoted'].includes(entry.status))
      .reduce((total, entry) => total + entry.quantity, 0)
    return {
      capacity: event.capacity ?? undefined,
      chapter: chapterNames.get(getRelationshipID(event.chapter) ?? -1) ?? 'Unknown chapter',
      confirmed,
      event: event.title,
      pending,
      remaining:
        event.capacity === null || event.capacity === undefined
          ? undefined
          : Math.max(0, event.capacity - confirmed - pending),
      startAt: event.startAt,
      waitlisted,
    }
  })

  const promotionMap = new Map<string, PromotionMetric>()
  for (const order of orders) {
    if (!order.promotionCodeSnapshot) continue
    const code = order.promotionCodeSnapshot
    const row = promotionMap.get(code) ?? {
      code,
      discount: 0,
      failed: 0,
      paid: 0,
      pending: 0,
      revenue: 0,
      uses: 0,
    }
    row.uses += 1
    row.discount = roundMoney(row.discount + (order.discountTotal ?? 0))
    if (order.status === 'paid') {
      row.paid += 1
      row.revenue = roundMoney(row.revenue + order.total)
    } else if (order.status === 'failed' || order.status === 'cancelled') row.failed += 1
    else row.pending += 1
    promotionMap.set(code, row)
  }

  const paymentOutcomes = countBy(
    payments.map((payment) => payment.status),
    ['pending', 'approved', 'failed'],
  )
  const approvedRevenue = payments
    .filter((payment) => payment.status === 'approved')
    .reduce((total, payment) => total + payment.amountSnapshot, 0)
  const membershipTermOutcomes: MembershipTermMetric[] = (
    ['join', 'renewal', 'reactivation'] as Membership['membershipKind'][]
  ).map((kind) => {
    const terms = memberships.filter((membership) => membership.membershipKind === kind)
    return {
      activeOrGrace: terms.filter((term) => ['active', 'grace_period'].includes(term.status)).length,
      expired: terms.filter((term) => term.status === 'expired').length,
      failed: terms.filter((term) =>
        ['cancelled_by_admin', 'failed_manual_payment'].includes(term.status),
      ).length,
      kind,
      pending: terms.filter((term) =>
        ['pending_manual_approval', 'pending_payment'].includes(term.status),
      ).length,
      total: terms.length,
    }
  })

  return {
    approvalOutcomes: paymentOutcomes,
    chapters: allChapters.map(({ id, name }) => ({ id, name })),
    eventRegistrations: countBy(
      registrations.map((registration) => registration.status),
      ['pending', 'confirmed', 'waitlisted', 'cancelled'],
    ),
    events: eventMetrics,
    filters,
    membershipKinds: countBy(
      memberships.map((membership) => membership.membershipKind),
      ['join', 'renewal', 'reactivation'],
    ),
    membershipTermOutcomes,
    memberships: countBy(
      memberships.map((membership) => membership.status),
      [
        'pending_payment',
        'pending_manual_approval',
        'active',
        'grace_period',
        'expired',
        'failed_manual_payment',
        'cancelled_by_admin',
        'suspended',
      ],
    ),
    paymentOutcomes,
    promotions: [...promotionMap.values()].sort((a, b) => a.code.localeCompare(b.code)),
    revenue: [...revenueMap.values()].sort((a, b) => a.chapter.localeCompare(b.chapter)),
    scopeLabel:
      scope.role === 'chapterAdmin'
        ? filters.chapterID
          ? chapterNames.get(filters.chapterID) ?? 'Selected managed chapter'
          : 'All managed chapters'
        : filters.chapterID
          ? chapterNames.get(filters.chapterID) ?? 'Selected chapter'
          : 'Organization-wide',
    totals: {
      approvedRevenue: roundMoney(approvedRevenue),
      failedPayments: payments.filter((payment) => payment.status === 'failed').length,
      registrations: registrations.reduce((total, registration) => total + registration.quantity, 0),
      waitlistEntries: waitlist.reduce((total, entry) => total + entry.quantity, 0),
    },
    waitlistOutcomes: countBy(
      waitlist.map((entry) => entry.status),
      ['waiting', 'promoted', 'accepted', 'expired'],
    ),
  }
}

const csvCell = (value: number | string): string => {
  const text = String(value)
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text
  return `"${safe.replaceAll('"', '""')}"`
}

export const reportingDataToCSV = (data: ReportingData): string => {
  const rows: Array<Array<number | string>> = [
    ['category', 'metric', 'scope', 'count', 'amount_usd'],
    ...data.memberships.map((item) => ['membership_status', item.status, data.scopeLabel, item.count, '']),
    ...data.membershipKinds.map((item) => ['membership_kind', item.status, data.scopeLabel, item.count, '']),
    ...data.membershipTermOutcomes.flatMap((item) => [
      ['membership_term_outcome', `${item.kind}:pending`, data.scopeLabel, item.pending, ''],
      ['membership_term_outcome', `${item.kind}:active_or_grace`, data.scopeLabel, item.activeOrGrace, ''],
      ['membership_term_outcome', `${item.kind}:failed`, data.scopeLabel, item.failed, ''],
      ['membership_term_outcome', `${item.kind}:expired`, data.scopeLabel, item.expired, ''],
    ]),
    ...data.paymentOutcomes.map((item) => ['payment_outcome', item.status, data.scopeLabel, item.count, '']),
    ...data.eventRegistrations.map((item) => [
      'registration_status',
      item.status,
      data.scopeLabel,
      item.count,
      '',
    ]),
    ...data.waitlistOutcomes.map((item) => ['waitlist_outcome', item.status, data.scopeLabel, item.count, '']),
    ...data.revenue.map((item) => ['revenue', 'approved', item.chapter, '', item.total]),
    ...data.promotions.map((item) => ['promotion_usage', item.code, data.scopeLabel, item.uses, item.revenue]),
  ]
  return `${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}\r\n`
}
