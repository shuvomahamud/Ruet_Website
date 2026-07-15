import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const publicRoutes = [
  '/',
  '/about',
  '/membership',
  '/chapters',
  '/events',
  '/learning',
  '/contact',
  '/privacy-policy',
  '/terms-of-use',
  '/login',
  '/signup',
]

const viewports = [
  { height: 900, name: 'desktop', width: 1440 },
  { height: 844, name: 'mobile', width: 390 },
]

test.describe('automated accessibility gate', () => {
  for (const viewport of viewports) {
    test(`${viewport.name} public routes have no serious WCAG A/AA violations`, async ({ page }) => {
      await page.setViewportSize({ height: viewport.height, width: viewport.width })

      for (const route of publicRoutes) {
        const response = await page.goto(route)
        expect(response?.ok(), `${route} should load`).toBe(true)
        await expect(page.locator('.skeleton-grid')).toHaveCount(0, { timeout: 15_000 })

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()
        const blocking = results.violations.filter(({ impact }) =>
          ['critical', 'serious'].includes(impact ?? ''),
        )

        expect(blocking, `${route} accessibility violations`).toEqual([])
      }
    })
  }
})
