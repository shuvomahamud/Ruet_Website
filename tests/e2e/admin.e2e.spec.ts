import { expect, test } from '@playwright/test'

test.describe('Admin panel', () => {
  test('renders the login surface without mutating local users', async ({ page }) => {
    const response = await page.goto('/admin/login')

    expect(response?.ok()).toBe(true)
    await expect(page.locator('#field-email')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('#field-password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })
})
