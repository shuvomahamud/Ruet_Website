import config from '@payload-config'
import { expect, test, type Page } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import type {
  Announcement,
  Chapter,
  ChapterRequest,
  CommitteeTerm,
  Event,
  HistoryEntry,
  Media,
  User,
} from '@/payload-types'

test.describe.serial('Chapters and governance experience', () => {
  let payload: Payload
  let member: User
  let superAdmin: User
  let chapter: Chapter
  let inactiveChapter: Chapter
  let resultingChapter: Chapter | undefined
  let announcement: Announcement
  let event: Event
  let localCommittee: CommitteeTerm
  let runningCommittee: CommitteeTerm
  let archivedCommittee: CommitteeTerm
  let firstHistory: HistoryEntry
  let secondHistory: HistoryEntry
  let media: Media
  let request: ChapterRequest | undefined
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const memberEmail = `e2e-phase4-member-${nonce}@example.test`
  const memberPassword = `Phase4-member-${nonce}-A9`
  const superEmail = `e2e-phase4-super-${nonce}@example.test`
  const superPassword = `Phase4-super-${nonce}-A9`

  const signIn = async (page: Page, email: string, password: string) => {
    await page.goto('/login')
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/account\/settings/)
  }

  test.beforeAll(async () => {
    payload = await getPayload({ config })
    const bootstrap = { accountStatus: 'active', id: -1, role: 'superAdmin' } as User
    superAdmin = await payload.create({
      collection: 'users',
      data: {
        _verified: true,
        accountStatus: 'active',
        email: superEmail,
        password: superPassword,
        role: 'superAdmin',
      },
      overrideAccess: true,
      user: bootstrap,
    })
    member = await payload.create({
      collection: 'users',
      data: {
        _verified: true,
        accountStatus: 'active',
        email: memberEmail,
        password: memberPassword,
        role: 'member',
      },
      overrideAccess: true,
    })
    chapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        contactEmail: `chapter-${nonce}@example.test`,
        description: 'A complete chapter-detail browser fixture with local community programs.',
        name: `E2E Atlantic Chapter ${nonce}`,
        regionOrState: 'New York',
        slug: `e2e-atlantic-${nonce}`,
        summary: `Searchable E2E chapter summary ${nonce}.`,
      },
      overrideAccess: true,
    })
    inactiveChapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'inactive',
        name: `E2E Hidden Chapter ${nonce}`,
        regionOrState: 'New York',
        slug: `e2e-hidden-${nonce}`,
        summary: 'This inactive chapter must remain hidden.',
      },
      overrideAccess: true,
    })
    const start = new Date(Date.now() + 172_800_000)
    event = await payload.create({
      collection: 'events',
      data: {
        _status: 'published',
        basePrice: 0,
        chapter: chapter.id,
        currency: 'USD',
        endAt: new Date(start.getTime() + 7_200_000).toISOString(),
        eventMode: 'hybrid',
        isPaid: false,
        maxRegistrationQuantity: 2,
        slug: `e2e-phase4-event-${nonce}`,
        startAt: start.toISOString(),
        status: 'published',
        summary: 'Upcoming chapter event browser fixture.',
        timezone: 'America/New_York',
        title: `E2E Chapter Gathering ${nonce}`,
        waitlistEnabled: true,
        waitlistOfferHours: 48,
      },
      overrideAccess: true,
    })
    announcement = await payload.create({
      collection: 'announcements',
      data: {
        _status: 'published',
        audience: 'public',
        chapter: chapter.id,
        summary: 'Public chapter announcement browser fixture.',
        title: `E2E Chapter Update ${nonce}`,
        tone: 'success',
      },
      overrideAccess: true,
    })
    localCommittee = await payload.create({
      collection: 'committeeTerms',
      data: {
        _status: 'published',
        chapter: chapter.id,
        committeeType: 'running',
        endDate: '2027-12-31T00:00:00.000Z',
        isCurrent: true,
        members: [
          { bio: 'Local leadership biography.', name: 'E2E Chapter Leader', role: 'President' },
        ],
        startDate: '2026-01-01T00:00:00.000Z',
        summary: 'Local committee browser fixture.',
        title: `E2E Local Committee ${nonce}`,
      },
      overrideAccess: true,
    })
    runningCommittee = await payload.create({
      collection: 'committeeTerms',
      data: {
        _status: 'published',
        committeeType: 'running',
        endDate: '2027-12-31T00:00:00.000Z',
        eventRecaps: [
          {
            eventDate: '2026-06-01T00:00:00.000Z',
            summary: 'National program recap.',
            title: `E2E National Program ${nonce}`,
          },
        ],
        isCurrent: true,
        members: [
          { bio: 'National leadership biography.', name: 'E2E National Leader', role: 'President' },
        ],
        startDate: '2026-01-01T00:00:00.000Z',
        summary: 'Current national running committee browser fixture.',
        title: `E2E Running Committee ${nonce}`,
      },
      overrideAccess: true,
    })
    archivedCommittee = await payload.create({
      collection: 'committeeTerms',
      data: {
        _status: 'published',
        committeeType: 'advisory',
        endDate: '2023-12-31T00:00:00.000Z',
        isCurrent: false,
        members: [{ name: 'E2E Past Advisor', role: 'Advisor' }],
        startDate: '2022-01-01T00:00:00.000Z',
        title: `E2E Archived Committee ${nonce}`,
      },
      overrideAccess: true,
    })
    firstHistory = await payload.create({
      collection: 'historyEntries',
      data: {
        _status: 'published',
        body: 'First historical narrative.',
        sortOrder: 10,
        startYear: 1985,
        summary: 'First milestone.',
        title: `E2E History 1985 ${nonce}`,
      },
      overrideAccess: true,
    })
    secondHistory = await payload.create({
      collection: 'historyEntries',
      data: {
        _status: 'published',
        body: 'Second historical narrative.',
        sortOrder: 20,
        startYear: 2024,
        summary: 'Second milestone.',
        title: `E2E History 2024 ${nonce}`,
      },
      overrideAccess: true,
    })
    const fileData = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    )
    media = (await payload.create({
      collection: 'media',
      data: { alt: 'E2E chapter gallery image', chapter: chapter.id, visibility: 'public' },
      file: {
        data: fileData,
        mimetype: 'image/png',
        name: `e2e-phase4-${nonce}.png`,
        size: fileData.length,
      },
      overrideAccess: true,
    })) as Media
  })

  test.afterAll(async () => {
    if (request?.id) {
      const audits = await payload.find({
        collection: 'auditLogs',
        limit: 100,
        overrideAccess: true,
        where: {
          and: [
            { entityType: { equals: 'chapterRequest' } },
            { entityID: { equals: String(request.id) } },
          ],
        },
      })
      for (const audit of audits.docs)
        await payload.delete({ collection: 'auditLogs', id: audit.id, overrideAccess: true })
      await payload.delete({ collection: 'chapterRequests', id: request.id, overrideAccess: true })
    }
    if (media?.id) await payload.delete({ collection: 'media', id: media.id, overrideAccess: true })
    for (const item of [announcement])
      if (item?.id)
        await payload.delete({ collection: 'announcements', id: item.id, overrideAccess: true })
    for (const item of [event])
      if (item?.id)
        await payload.delete({ collection: 'events', id: item.id, overrideAccess: true })
    for (const item of [localCommittee, runningCommittee, archivedCommittee])
      if (item?.id)
        await payload.delete({ collection: 'committeeTerms', id: item.id, overrideAccess: true })
    for (const item of [firstHistory, secondHistory])
      if (item?.id)
        await payload.delete({ collection: 'historyEntries', id: item.id, overrideAccess: true })
    for (const item of [resultingChapter, chapter, inactiveChapter])
      if (item?.id)
        await payload.delete({ collection: 'chapters', id: item.id, overrideAccess: true })
    for (const item of [member, superAdmin])
      if (item?.id) await payload.delete({ collection: 'users', id: item.id, overrideAccess: true })
  })

  test('filters the active directory and renders every chapter detail module', async ({ page }) => {
    await page.goto(`/chapters?q=${encodeURIComponent(nonce)}`)
    await expect(page.getByRole('heading', { name: chapter.name })).toBeVisible()
    await expect(page.getByText(inactiveChapter.name)).toHaveCount(0)
    await page.getByRole('link', { name: chapter.name }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(chapter.name)
    await expect(page.getByText('E2E Chapter Leader')).toBeVisible()
    await expect(page.getByText(announcement.title)).toBeVisible()
    await expect(page.getByText(event.title)).toBeVisible()
    await expect(page.getByRole('img', { name: 'E2E chapter gallery image' })).toBeVisible()

    await page.goto(`/chapters/${inactiveChapter.slug}`)
    await expect(page.getByRole('heading', { name: 'We could not find that page.' })).toBeVisible()
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', /noindex/)
  })

  test('renders chronological history and filters its archive by decade', async ({ page }) => {
    await page.goto('/history')
    await expect(page.getByText(firstHistory.title)).toBeVisible()
    await expect(page.getByText(secondHistory.title)).toBeVisible()
    const titles = await page.locator('.timeline__card h3').allTextContents()
    expect(titles.indexOf(firstHistory.title)).toBeLessThan(titles.indexOf(secondHistory.title))

    await page.getByRole('link', { name: '1980s' }).click()
    await expect(page.getByText(firstHistory.title)).toBeVisible()
    await expect(page.getByText(secondHistory.title)).toHaveCount(0)
  })

  test('renders current leadership, recaps, and the filterable committee archive', async ({
    page,
  }) => {
    await page.goto('/committees/running')
    await expect(page.getByText(runningCommittee.title)).toBeVisible()
    await expect(page.getByText('E2E National Leader')).toBeVisible()
    await expect(page.getByText(`E2E National Program ${nonce}`)).toBeVisible()

    await page.goto('/committees/history?type=advisory')
    await expect(page.getByText(archivedCommittee.title)).toBeVisible()
    await expect(page.getByText(runningCommittee.title)).toHaveCount(0)
  })

  test('lets a signed-in member submit and track a chapter request', async ({ page }) => {
    await signIn(page, memberEmail, memberPassword)
    await page.goto('/chapters/request')
    const proposedName = `E2E Requested Chapter ${nonce}`
    await page.getByLabel('Proposed chapter name').fill(proposedName)
    await page.getByLabel(/City, state, or region/).fill('Maryland')
    await page
      .getByLabel(/Why would this chapter help/)
      .fill('Local alumni want a structured community and regular programs.')
    const response = page.waitForResponse(
      (candidate) =>
        candidate.url().endsWith('/api/chapter-requests') &&
        candidate.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Submit chapter request' }).click()
    expect((await response).status()).toBe(201)
    await expect(
      page.getByText('Your chapter request has been submitted for review.'),
    ).toBeVisible()
    const result = await payload.find({
      collection: 'chapterRequests',
      limit: 1,
      overrideAccess: true,
      where: { requestedName: { equals: proposedName } },
    })
    request = result.docs[0]
    expect(request).toMatchObject({ requestedRegion: 'Maryland', status: 'pending' })
  })

  test('lets only a super admin approve the request and provisions one public chapter', async ({
    page,
  }) => {
    expect(request?.id).toBeTruthy()
    await signIn(page, superEmail, superPassword)
    await page.goto('/chapter-requests/review')
    const card = page.getByRole('article').filter({ hasText: request!.requestedName })
    await expect(card).toBeVisible()
    const response = page.waitForResponse((candidate) =>
      candidate.url().endsWith(`/api/chapter-requests/${request!.id}/review`),
    )
    await card.getByRole('button', { name: 'Approve and publish chapter' }).click()
    expect((await response).status()).toBe(200)
    await expect(page.getByText('The chapter request was reviewed.')).toBeVisible()
    request = await payload.findByID({
      collection: 'chapterRequests',
      id: request!.id,
      overrideAccess: true,
    })
    const resultingID =
      typeof request.resultingChapter === 'number'
        ? request.resultingChapter
        : request.resultingChapter?.id
    resultingChapter = await payload.findByID({
      collection: 'chapters',
      id: resultingID!,
      overrideAccess: true,
    })
    expect(resultingChapter).toMatchObject({
      _status: 'published',
      chapterStatus: 'active',
      regionOrState: 'Maryland',
    })
    await page.goto(`/chapters/${resultingChapter.slug}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(resultingChapter.name)
  })
})
