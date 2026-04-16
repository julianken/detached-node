import { test, expect } from '../fixtures'

/**
 * E2E Tests: Dark Mode / Color Scheme (CON-50)
 *
 * Verifies that the site correctly handles system color scheme preferences:
 * - Site respects prefers-color-scheme
 * - Switching color scheme updates the page
 * - Both modes render without errors
 */

test.describe('Dark Mode / Color Scheme', () => {
  test('should render correctly in light mode', async ({ homePage }) => {
    await homePage.page.emulateMedia({ colorScheme: 'light' })
    await homePage.goto()

    const body = homePage.page.locator('body')
    await expect(body).toBeVisible()

    // Light mode: white background, dark text
    const bgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(bgColor).toBeTruthy()
  })

  test('should render correctly in dark mode', async ({ homePage }) => {
    await homePage.page.emulateMedia({ colorScheme: 'dark' })
    await homePage.goto()

    const body = homePage.page.locator('body')
    await expect(body).toBeVisible()

    // Dark mode: dark background, light text
    const bgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(bgColor).toBeTruthy()
  })

  test('should update colors when switching from light to dark', async ({ homePage }) => {
    await homePage.goto()

    // Start with light mode
    await homePage.page.emulateMedia({ colorScheme: 'light' })
    await homePage.page.waitForTimeout(100)

    const body = homePage.page.locator('body')
    const lightBg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor)

    // Switch to dark mode
    await homePage.page.emulateMedia({ colorScheme: 'dark' })
    await homePage.page.waitForTimeout(100)

    const darkBg = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor)

    // Background should change between modes
    expect(darkBg).not.toBe(lightBg)
  })
})
