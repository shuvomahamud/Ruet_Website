import config from '@payload-config'
import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

test.describe.serial('Member authentication', () => {
  let payload: Payload
  let chapterID: number
  let userID: number | undefined
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  const chapterName = `E2E Auth Chapter ${nonce}`
  const email = `e2e-auth-${nonce}@example.test`
  const password = `Strong-E2E-${nonce}-A9`

  test.beforeAll(async () => {
    payload = await getPayload({ config })
    const chapter = await payload.create({
      collection: 'chapters',
      data: {
        _status: 'published',
        chapterStatus: 'active',
        name: chapterName,
        slug: `e2e-auth-${nonce}`,
        summary: 'End-to-end account lifecycle fixture.',
      },
      overrideAccess: true,
    })
    chapterID = chapter.id
  })

  test.afterAll(async () => {
    if (userID) await payload.delete({ collection: 'users', id: userID, overrideAccess: true })
    if (chapterID)
      await payload.delete({ collection: 'chapters', id: chapterID, overrideAccess: true })
  })

  test('signs up, verifies, signs in, edits the profile, and signs out', async ({ page }) => {
    await page.goto('/signup')
    await expect(
      page.getByRole('heading', { name: 'Join the RUETIAN USA community' }),
    ).toBeVisible()

    await page.getByLabel('First name').fill('End')
    await page.getByLabel('Last name').fill('Toend')
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByLabel('Confirm password').fill(password)
    await page.getByLabel('RUET department').fill('CSE')
    await page.getByLabel('Graduation year').fill('2015')
    await page.getByLabel('Primary chapter').selectOption({ label: chapterName })
    await page.getByLabel('City').fill('New York')
    await page.getByLabel('State').fill('NY')
    await page.getByLabel('Country').fill('United States')
    await page.getByLabel(/I agree to the/).check()
    await page.getByLabel(/I acknowledge the/).check()

    const signupResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/auth/signup') && response.request().method() === 'POST',
    )
    await page.getByRole('button', { name: 'Create account' }).click()
    expect((await signupResponse).status()).toBe(201)
    await expect(page.getByText(/Account created/)).toBeVisible()

    const users = await payload.find({
      collection: 'users',
      limit: 1,
      overrideAccess: true,
      showHiddenFields: true,
      where: { email: { equals: email } },
    })
    const user = users.docs[0]
    expect(user?._verificationToken).toBeTruthy()
    expect(user?.privacyVersionAccepted).toBe('2026-07-14')
    expect(user?.termsVersionAccepted).toBe('2026-07-14')
    userID = user?.id

    await page.goto(`/verify-email?token=${encodeURIComponent(user?._verificationToken ?? '')}`)
    await expect(page.getByRole('heading', { name: 'Email verified' })).toBeVisible()

    await page.getByRole('link', { name: 'Sign in' }).last().click()
    await page.getByLabel('Email address').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByRole('heading', { name: /^Welcome/ })).toBeVisible()
    const utilityNavigation = page.getByRole('navigation', { name: 'Utility navigation' })
    await expect(utilityNavigation.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(utilityNavigation.getByRole('button', { name: 'Sign out' })).toBeVisible()
    await expect(utilityNavigation.getByRole('link', { name: 'Sign In' })).toHaveCount(0)
    await expect(utilityNavigation.getByRole('link', { name: 'Payment review' })).toHaveCount(0)
    await page.getByRole('link', { name: 'Profile & security' }).click()
    await expect(page.getByRole('heading', { name: 'Account settings' })).toBeVisible()

    await page.getByLabel('City').fill('Boston')
    await page.getByRole('button', { name: 'Save profile' }).click()
    await expect(page.getByText('Profile saved.')).toBeVisible()

    await page
      .getByRole('navigation', { name: 'Utility navigation' })
      .getByRole('button', { name: 'Sign out' })
      .click()
    await expect(page).toHaveURL(/\/login/)
    await page.goto('/account/settings')
    await expect(page).toHaveURL(/\/login\?returnTo=/)
  })

  test('shows a clear disabled Google option when credentials are absent', async ({ page }) => {
    await page.goto('/login')
    const googleButton = page.getByRole('button', { name: 'Continue with Google' })
    await expect(googleButton).toBeDisabled()
    await expect(page.getByText(/credentials are configured/)).toBeVisible()
  })
})
