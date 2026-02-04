import { test, expect } from '../fixtures'
import { expectVisible, expectUrl, expectTitle } from '../helpers'

/**
 * E2E Tests: General 404 Page (CON-45)
 *
 * Verifies that the general 404 page renders correctly and provides
 * a way for users to return to the homepage:
 * - 404 indicator displays
 * - "Page not found" heading visible
 * - "Return home" link works
 * - Page centered vertically
 */

test.describe('General 404 Page', () => {
  test.describe('404 Page Rendering', () => {
    test('should display 404 indicator when navigating to invalid route', async ({ page }) => {
      await page.goto('/invalid-page')

      // Verify 404 indicator is visible
      const indicator = page.getByText('404')
      await expectVisible(indicator)
    })

    test('should display "Page not found" heading when navigating to invalid route', async ({ page }) => {
      await page.goto('/invalid-page')

      // Verify heading is visible
      const heading = page.getByRole('heading', { name: /Page not found/i })
      await expectVisible(heading)
    })

    test('should display descriptive message on 404 page', async ({ page }) => {
      await page.goto('/invalid-page')

      // Verify descriptive message is visible
      const message = page.getByText(/The page you are looking for does not exist, or has been moved/i)
      await expectVisible(message)
    })

    test('should display "Return home" link on 404 page', async ({ page }) => {
      await page.goto('/invalid-page')

      // Verify "Return home" link is visible
      const returnHomeLink = page.getByRole('link', { name: /Return home/i })
      await expectVisible(returnHomeLink)
    })
  })

  test.describe('404 Page Navigation', () => {
    test('should navigate to homepage when clicking "Return home" link', async ({ page }) => {
      await page.goto('/invalid-page')

      // Click "Return home" link
      const returnHomeLink = page.getByRole('link', { name: /Return home/i })
      await returnHomeLink.click()

      // Verify navigation to homepage
      await expectUrl(page, /\/$/)
    })

    test('should navigate to homepage from deep invalid route', async ({ page }) => {
      await page.goto('/some/deep/path')

      // Verify 404 page renders
      const heading = page.getByRole('heading', { name: /Page not found/i })
      await expectVisible(heading)

      // Click "Return home" link
      const returnHomeLink = page.getByRole('link', { name: /Return home/i })
      await returnHomeLink.click()

      // Verify navigation to homepage
      await expectUrl(page, /\/$/)
    })
  })

  test.describe('404 Page Layout', () => {
    test('should center content vertically on the page', async ({ page }) => {
      await page.goto('/invalid-page')

      // Get the container div that should be vertically centered
      const container = page.locator('div').filter({ hasText: '404' }).first()
      await expectVisible(container)

      // Verify the container has vertical centering classes
      const classAttribute = await container.getAttribute('class')
      expect(classAttribute).toContain('items-center')
      expect(classAttribute).toContain('justify-center')
    })

    test('should display all elements in proper hierarchy', async ({ page }) => {
      await page.goto('/invalid-page')

      // Get the main content container
      const contentContainer = page.locator('div').filter({ hasText: 'Page not found' }).first()
      await expectVisible(contentContainer)

      // Verify all key elements are present within the container
      const indicator = contentContainer.getByText('404')
      const heading = contentContainer.getByRole('heading', { name: /Page not found/i })
      const message = contentContainer.getByText(/The page you are looking for does not exist/i)
      const link = contentContainer.getByRole('link', { name: /Return home/i })

      await expectVisible(indicator)
      await expectVisible(heading)
      await expectVisible(message)
      await expectVisible(link)
    })
  })

  test.describe('404 Page Scenarios', () => {
    test('should handle invalid route at root level', async ({ page }) => {
      await page.goto('/nonexistent')

      // Verify 404 page renders correctly
      const indicator = page.getByText('404')
      const heading = page.getByRole('heading', { name: /Page not found/i })

      await expectVisible(indicator)
      await expectVisible(heading)
    })

    test('should handle deeply nested invalid route', async ({ page }) => {
      await page.goto('/some/deeply/nested/invalid/path')

      // Verify 404 page renders correctly
      const indicator = page.getByText('404')
      const heading = page.getByRole('heading', { name: /Page not found/i })
      const returnHomeLink = page.getByRole('link', { name: /Return home/i })

      await expectVisible(indicator)
      await expectVisible(heading)
      await expectVisible(returnHomeLink)
    })

    test('should handle invalid route with query parameters', async ({ page }) => {
      await page.goto('/invalid-page?param=value')

      // Verify 404 page renders correctly
      const indicator = page.getByText('404')
      const heading = page.getByRole('heading', { name: /Page not found/i })

      await expectVisible(indicator)
      await expectVisible(heading)
    })
  })
})
