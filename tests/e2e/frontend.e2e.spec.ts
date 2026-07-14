import { expect, test } from '@playwright/test'

test.describe('Frontend', () => {
  test('renders the public homepage shell', async ({ page }) => {
    const response = await page.goto('/')

    expect(response?.ok()).toBe(true)
    await expect(page).toHaveTitle(/RUETIAN USA/)
    await expect(page.locator('h1').first()).toBeVisible()
    const primaryNavigation = page.getByRole('navigation', { name: 'Primary navigation' })

    await expect(primaryNavigation).toBeVisible()
    await expect(primaryNavigation.getByRole('link', { name: 'Membership' })).toBeVisible()
    await expect(primaryNavigation.getByRole('link', { name: 'Chapters' })).toBeVisible()
    await expect(primaryNavigation.getByRole('link', { name: 'Events' })).toBeVisible()
  })

  for (const route of ['/membership', '/chapters', '/events', '/learning']) {
    test(`renders ${route}`, async ({ page }) => {
      const response = await page.goto(route)

      expect(response?.ok()).toBe(true)
      await expect(page.locator('h1').first()).toBeVisible()
    })
  }
})
