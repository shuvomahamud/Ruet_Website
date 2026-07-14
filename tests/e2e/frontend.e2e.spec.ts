import config from '@payload-config'
import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import type { Category, Post } from '@/payload-types'

const richBody: NonNullable<Post['richBody']> = {
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Rich E2E article body for the public learning detail page.',
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        type: 'paragraph',
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
}

test.describe.serial('Public experience', () => {
  let payload: Payload
  let category: Category
  let article: Post
  let resource: Post
  let draft: Post
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const contactEmail = `e2e-contact-${nonce}@example.test`

  test.beforeAll(async () => {
    payload = await getPayload({ config })
    category = await payload.create({
      collection: 'categories',
      data: { slug: `e2e-learning-${nonce}`, title: `E2E Learning ${nonce}` },
      overrideAccess: true,
    })

    const publishedAt = new Date().toISOString()
    article = await payload.create({
      collection: 'posts',
      data: {
        _status: 'published',
        authorName: 'RUETIAN USA Editorial Team',
        body: 'Plain-text fallback for the rich browser fixture.',
        categories: [category.id],
        contentType: 'article',
        excerpt: `E2E searchable engineering insight ${nonce}.`,
        featured: true,
        publishedAt,
        readingTimeMinutes: 5,
        richBody,
        seo: {
          description: `Metadata description ${nonce}`,
          title: `Metadata title ${nonce}`,
        },
        slug: `e2e-learning-article-${nonce}`,
        title: `E2E Learning Article ${nonce}`,
      },
      draft: false,
      overrideAccess: true,
    })
    resource = await payload.create({
      collection: 'posts',
      data: {
        _status: 'published',
        body: `Related public resource body ${nonce}.`,
        categories: [category.id],
        contentType: 'resource',
        excerpt: `Related alumni resource ${nonce}.`,
        publishedAt,
        slug: `e2e-learning-resource-${nonce}`,
        title: `E2E Related Resource ${nonce}`,
      },
      draft: false,
      overrideAccess: true,
    })
    draft = await payload.create({
      collection: 'posts',
      data: {
        _status: 'draft',
        body: `Private draft content ${nonce}.`,
        categories: [category.id],
        contentType: 'article',
        excerpt: `E2E searchable engineering insight ${nonce}.`,
        slug: `e2e-learning-draft-${nonce}`,
        title: `E2E Hidden Draft ${nonce}`,
      },
      draft: true,
      overrideAccess: true,
    })
  })

  test.afterAll(async () => {
    const submissions = await payload.find({
      collection: 'contactSubmissions',
      limit: 20,
      overrideAccess: true,
      where: { email: { equals: contactEmail } },
    })
    for (const submission of submissions.docs) {
      await payload.delete({
        collection: 'contactSubmissions',
        id: submission.id,
        overrideAccess: true,
      })
    }
    for (const post of [article, resource, draft]) {
      if (post?.id) await payload.delete({ collection: 'posts', id: post.id, overrideAccess: true })
    }
    if (category?.id) {
      await payload.delete({ collection: 'categories', id: category.id, overrideAccess: true })
    }
  })

  test('renders the public shell and an accessible desktop mega menu', async ({ page }) => {
    const response = await page.goto('/')

    expect(response?.ok()).toBe(true)
    await expect(page).toHaveTitle(/RUETIAN USA/)
    await expect(page.locator('h1')).toHaveCount(1)
    const primaryNavigation = page.getByRole('navigation', { name: 'Primary navigation' })
    await expect(primaryNavigation).toBeVisible()

    const aboutTrigger = primaryNavigation.getByRole('button', { name: 'About' })
    await aboutTrigger.click()
    await expect(aboutTrigger).toHaveAttribute('aria-expanded', 'true')
    await expect(primaryNavigation.getByRole('link', { name: 'RUET history' })).toBeVisible()
    await expect(primaryNavigation.getByText('Built for alumni continuity')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(aboutTrigger).toHaveAttribute('aria-expanded', 'false')
    await expect(aboutTrigger).toBeFocused()
  })

  test('renders every required homepage module', async ({ page }) => {
    await page.goto('/')

    for (const heading of [
      'A growing alumni network built for participation',
      'Latest organization notices',
      'One community, year-round connection',
      'Meet, learn, and participate',
      'Find your local alumni community',
      'Milestones that connect generations',
      'Volunteer leadership and continuity',
      'Knowledge shared across generations',
    ]) {
      await expect(page.getByRole('heading', { name: heading })).toBeVisible()
    }
    await expect(page.getByText('Annual membership', { exact: true })).toBeVisible()
  })

  test('publishes crawl controls and keeps previews out of public access', async ({ page }) => {
    const robots = await page.request.get('/robots.txt')
    expect(robots.ok()).toBe(true)
    expect(await robots.text()).toContain('Disallow: /preview/')

    const sitemap = await page.request.get('/sitemap.xml')
    expect(sitemap.ok()).toBe(true)
    expect(await sitemap.text()).toContain('<loc>http://localhost:3000/</loc>')

    const draftGlobal = await page.request.get('/api/globals/home?draft=true')
    expect(draftGlobal.status()).toBe(403)
    const globalVersions = await page.request.get('/api/globals/home/versions')
    expect(globalVersions.status()).toBe(403)

    await page.goto('/preview/pages/999999')
    await expect(page).toHaveURL(/\/login\?returnTo=/)
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  })

  test('traps and restores focus in the mobile navigation drawer', async ({ page }) => {
    await page.setViewportSize({ height: 844, width: 390 })
    await page.goto('/')

    const trigger = page.getByRole('button', { name: 'Open navigation menu' })
    await expect(trigger).toBeVisible()
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Mobile navigation' })
    await expect(dialog).toBeVisible()
    await expect(page.getByRole('button', { name: 'Close navigation menu' }).last()).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('renders institutional and legal templates with semantic navigation', async ({ page }) => {
    await page.goto('/about')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('lasting home')
    await expect(page.locator('#mission').getByRole('heading', { name: 'Mission' })).toBeVisible()
    await expect(page.locator('#vision').getByRole('heading', { name: 'Vision' })).toBeVisible()

    await page.goto('/privacy-policy')
    await expect(page.getByText('Approved policy')).toBeVisible()
    const toc = page.getByRole('navigation', { name: 'On this page' })
    await expect(toc).toBeVisible()
    await expect(toc.getByRole('link', { name: 'Information you provide' })).toBeVisible()
    await expect(page.locator('#information-you-provide')).toContainText('RUET department')
    await expect(page.locator('#membership-events-and-payments')).toContainText(
      'We do not ask for or store your online-banking password',
    )
  })

  test('searches learning content, hides drafts, renders rich text, and exposes metadata', async ({
    page,
  }) => {
    await page.goto('/learning')
    await page.getByLabel('Search', { exact: true }).fill(`engineering insight ${nonce}`)
    await page.getByLabel('Content type').selectOption('article')
    await page.getByRole('button', { name: 'Apply filters' }).click()

    await expect(page).toHaveURL(/q=engineering(?:\+|%20)insight/)
    await expect(page.getByRole('link', { name: new RegExp(article.title) })).toBeVisible()
    await expect(page.getByText(draft.title)).toHaveCount(0)
    await expect(page.getByText(resource.title)).toHaveCount(0)

    await page.getByRole('link', { name: new RegExp(article.title) }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(article.title)
    await expect(
      page.getByText('Rich E2E article body for the public learning detail page.'),
    ).toBeVisible()
    await expect(page.getByText('RUETIAN USA Editorial Team')).toBeVisible()
    await expect(page.getByText(resource.title)).toBeVisible()
    await expect(page).toHaveTitle(`Metadata title ${nonce} | RUETIAN USA`)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      `Metadata description ${nonce}`,
    )
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`/learning/${article.slug}$`),
    )
  })

  test('submits and stores a validated contact inquiry', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('glad to hear')
    await page.getByLabel('Name').fill('End to End Contact')
    await page.getByLabel('Email address').fill(contactEmail)
    await page.getByLabel('Topic').selectOption('membership')
    await page.getByLabel('Subject').fill('Membership support question')
    await page
      .getByLabel('Message')
      .fill('Please share more information about the annual membership process.')

    const response = page.waitForResponse(
      (candidate) =>
        candidate.url().endsWith('/api/contact') && candidate.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Send message' }).click()
    expect((await response).status()).toBe(201)
    await expect(page.getByText('Thanks—your message has been received.')).toBeVisible()

    const stored = await payload.find({
      collection: 'contactSubmissions',
      limit: 1,
      overrideAccess: true,
      where: { email: { equals: contactEmail } },
    })
    expect(stored.docs[0]).toMatchObject({ status: 'new', topic: 'membership' })
  })

  for (const route of [
    '/',
    '/about',
    '/membership',
    '/chapters',
    '/events',
    '/learning',
    '/contact',
  ]) {
    test(`${route} has a single main landmark and no narrow-screen overflow`, async ({ page }) => {
      await page.setViewportSize({ height: 844, width: 390 })
      const response = await page.goto(route)
      expect(response?.ok()).toBe(true)
      await expect(page.locator('main')).toHaveCount(1)
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('img:not([alt])')).toHaveCount(0)
      expect(await page.locator('html').getAttribute('lang')).toBe('en')
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      ).toBe(true)
    })
  }
})
