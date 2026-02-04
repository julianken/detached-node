import { test } from '../fixtures'
import { expectVisible, expectTitle } from '../helpers'

/**
 * E2E tests for About page loading from CMS (CON-42)
 * Tests verify that the About page loads correctly with CMS content and handles fallback state
 *
 * Test data from seed-test-db.ts:
 * - "About Mind-Controlled" page with rich text body
 */

test.describe('About Page - CMS Content', () => {
  test('should load About page without errors', async ({ aboutPage }) => {
    await aboutPage.goto()

    // Verify page title metadata (with fallback)
    await expectTitle(aboutPage.page, /About/)

    // Verify page header displays
    await expectVisible(aboutPage.pageTitle)
  })

  test('should display title as page header', async ({ aboutPage }) => {
    await aboutPage.goto()

    // Verify the h1 title displays (either CMS title or fallback)
    await expectVisible(aboutPage.pageTitle)
    const title = await aboutPage.getPageTitle()
    test.expect(title).toBeTruthy()
    test.expect(title).toContain('About')
  })

  test('should render page content correctly', async ({ aboutPage }) => {
    await aboutPage.goto()

    // Verify main content area exists
    await expectVisible(aboutPage.pageContent)

    // Verify content is present (either CMS content or fallback)
    const content = aboutPage.pageContent
    const text = await content.textContent()
    test.expect(text).toBeTruthy()
    test.expect(text!.length).toBeGreaterThan(0)
  })

  test('should include correct SEO metadata in page head', async ({ aboutPage }) => {
    await aboutPage.goto()

    // Verify page title contains "About"
    await expectTitle(aboutPage.page, /About/)

    // Verify meta description exists
    const metaDescription = await aboutPage.page
      .locator('meta[name="description"]')
      .getAttribute('content')
    test.expect(metaDescription).toBeTruthy()
  })
})

test.describe('About Page - Content Rendering', () => {
  test('should display page content without errors', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')

    // The page should load successfully (no 404)
    const main = page.locator('main')
    await expectVisible(main)

    // Verify a heading is present
    const hasTitle = await page.getByRole('heading', { level: 1 }).count()
    test.expect(hasTitle).toBeGreaterThan(0)
  })

  test('should render content with proper structure', async ({ page }) => {
    await page.goto('/about')
    await page.waitForLoadState('networkidle')

    // Page should load without errors
    const main = page.locator('main')
    await expectVisible(main)

    // Verify some content is present
    const mainText = await main.textContent()
    test.expect(mainText).toBeTruthy()
    test.expect(mainText!.length).toBeGreaterThan(10)
  })
})

test.describe('About Page - Typography and Styling', () => {
  test('should render content with proper HTML structure', async ({ aboutPage }) => {
    await aboutPage.goto()

    // Verify content contains paragraph or section elements
    const main = aboutPage.pageContent
    const hasContent = await main.locator('p, section').count()
    test.expect(hasContent).toBeGreaterThan(0)
  })

  test('should apply appropriate styling classes', async ({ aboutPage }) => {
    await aboutPage.goto()

    // Check for either prose styling (CMS content) or custom styling (fallback)
    const hasProseOrCustom =
      (await aboutPage.page.locator('.prose').count()) +
      (await aboutPage.page.locator('section').count())
    test.expect(hasProseOrCustom).toBeGreaterThan(0)
  })

  test('should render content with readable layout', async ({ aboutPage }) => {
    await aboutPage.goto()

    // Verify main content area has appropriate styling
    const main = aboutPage.pageContent
    await expectVisible(main)

    // Content should be readable
    const text = await main.textContent()
    test.expect(text).toBeTruthy()
  })
})

test.describe('About Page - Responsive Layout', () => {
  test('should display correctly on mobile viewport', async ({ aboutPage }) => {
    // Set mobile viewport
    await aboutPage.page.setViewportSize({ width: 375, height: 667 })

    await aboutPage.goto()

    // Verify page elements are visible on mobile
    await expectVisible(aboutPage.pageTitle)
    await expectVisible(aboutPage.pageContent)

    // Verify content is readable (not truncated or hidden)
    const title = await aboutPage.getPageTitle()
    test.expect(title).toBeTruthy()
  })

  test('should maintain proper spacing on tablet viewport', async ({ aboutPage }) => {
    // Set tablet viewport
    await aboutPage.page.setViewportSize({ width: 768, height: 1024 })

    await aboutPage.goto()

    // Verify layout remains intact
    await expectVisible(aboutPage.pageTitle)
    await expectVisible(aboutPage.pageContent)

    // Verify prose styling applies at tablet width
    const proseSection = aboutPage.page.locator('.prose')
    await expectVisible(proseSection)
  })
})
