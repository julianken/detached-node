import { test, expect } from '../fixtures'
import { expectUrl, expectTitle, expectVisible } from '../helpers'

/**
 * E2E Tests: Post Not Found (404) Page (CON-44)
 *
 * Verifies that the post 404 page displays correctly when:
 * - Navigating to an invalid/nonexistent post slug
 * - Attempting to access a draft post (returns 404 for public users)
 * - Attempting to access an archived post (returns 404 for public users)
 *
 * Acceptance Criteria:
 * - 404 indicator displays
 * - "Post not found" heading visible
 * - Helpful message displays
 * - "Browse all posts" link works
 * - Page centered vertically
 *
 * Test Data (from seed-test-db.ts):
 * - Draft: "Unpublished Thoughts on Conditioning" (slug: unpublished-thoughts-conditioning)
 * - Archived: "Legacy Post About Old Propaganda" (slug: legacy-post-old-propaganda)
 *
 * Note: These tests run WITHOUT authentication to verify public 404 behavior
 */

test.describe('Post Not Found (404) Page', () => {
  test.describe('Invalid Slug - Nonexistent Post', () => {
    test('should return 404 status when navigating to nonexistent post', async ({ page }) => {
      // Navigate to a post slug that doesn't exist
      const response = await page.goto('/posts/nonexistent-slug-that-does-not-exist')

      // Verify 404 response
      expect(response?.status()).toBe(404)
    })

    test('should display 404 indicator', async ({ page }) => {
      await page.goto('/posts/nonexistent-slug-that-does-not-exist')

      // Verify "404" text is visible
      const indicator = page.getByText('404', { exact: true })
      await expectVisible(indicator)
    })

    test('should display "Post not found" heading', async ({ page }) => {
      await page.goto('/posts/nonexistent-slug-that-does-not-exist')

      // Verify heading displays
      const heading = page.getByRole('heading', { name: /Post not found/i })
      await expectVisible(heading)

      // Verify heading text is correct
      const headingText = await heading.textContent()
      expect(headingText).toBe('Post not found')
    })

    test('should display helpful message', async ({ page }) => {
      await page.goto('/posts/nonexistent-slug-that-does-not-exist')

      // Verify message displays
      const message = page.getByText(/This post does not exist, or may have been removed/i)
      await expectVisible(message)
    })

    test('should display "Browse all posts" link', async ({ page }) => {
      await page.goto('/posts/nonexistent-slug-that-does-not-exist')

      // Verify link displays
      const link = page.getByRole('link', { name: /Browse all posts/i })
      await expectVisible(link)

      // Verify link href points to /posts
      const href = await link.getAttribute('href')
      expect(href).toBe('/posts')
    })

    test('should navigate to posts listing when clicking "Browse all posts"', async ({ page }) => {
      await page.goto('/posts/nonexistent-slug-that-does-not-exist')

      // Click "Browse all posts" link
      const link = page.getByRole('link', { name: /Browse all posts/i })
      await link.click()

      // Verify navigation to /posts
      await expectUrl(page, /\/posts$/)

      // Verify posts listing page loaded
      const heading = page.getByRole('heading', { name: /Posts/i })
      await expectVisible(heading)
    })

    test('should center content vertically on page', async ({ page }) => {
      await page.goto('/posts/nonexistent-slug-that-does-not-exist')

      // Verify the container has vertical centering classes
      const container = page.locator('div.flex.min-h-\\[50vh\\].items-center.justify-center')
      await expectVisible(container)

      // Verify content is within the centered container
      const heading = container.getByRole('heading', { name: /Post not found/i })
      await expectVisible(heading)
    })

    test('should include correct SEO metadata for 404', async ({ page }) => {
      await page.goto('/posts/nonexistent-slug-that-does-not-exist')

      // Verify page title includes "Post Not Found" or similar
      await expectTitle(page, /Post Not Found/i)
    })
  })

  test.describe('Draft Post - Returns 404 for Public Users', () => {
    test('should return 404 when navigating to draft post URL', async ({ page }) => {
      // Navigate to draft post URL
      const response = await page.goto('/posts/unpublished-thoughts-conditioning')

      // Verify 404 response
      expect(response?.status()).toBe(404)
    })

    test('should display 404 page for draft post', async ({ page }) => {
      await page.goto('/posts/unpublished-thoughts-conditioning')

      // Verify 404 indicator displays
      const indicator = page.getByText('404', { exact: true })
      await expectVisible(indicator)

      // Verify "Post not found" heading displays
      const heading = page.getByRole('heading', { name: /Post not found/i })
      await expectVisible(heading)

      // Verify helpful message displays
      const message = page.getByText(/This post does not exist, or may have been removed/i)
      await expectVisible(message)
    })

    test('should not leak draft post metadata in 404 response', async ({ page }) => {
      await page.goto('/posts/unpublished-thoughts-conditioning')

      // Verify draft post title does not appear
      const pageContent = await page.textContent('body')
      expect(pageContent).not.toContain('Unpublished Thoughts on Conditioning')

      // Verify draft post summary does not appear
      expect(pageContent).not.toContain('Early draft exploring behavioral conditioning')
    })

    test('should provide recovery link to browse all posts', async ({ page }) => {
      await page.goto('/posts/unpublished-thoughts-conditioning')

      // Verify "Browse all posts" link is available
      const link = page.getByRole('link', { name: /Browse all posts/i })
      await expectVisible(link)

      // Click link and verify navigation works
      await link.click()
      await expectUrl(page, /\/posts$/)
    })
  })

  test.describe('Archived Post - Returns 404 for Public Users', () => {
    test('should return 404 when navigating to archived post URL', async ({ page }) => {
      // Navigate to archived post URL
      const response = await page.goto('/posts/legacy-post-old-propaganda')

      // Verify 404 response
      expect(response?.status()).toBe(404)
    })

    test('should display 404 page for archived post', async ({ page }) => {
      await page.goto('/posts/legacy-post-old-propaganda')

      // Verify 404 indicator displays
      const indicator = page.getByText('404', { exact: true })
      await expectVisible(indicator)

      // Verify "Post not found" heading displays
      const heading = page.getByRole('heading', { name: /Post not found/i })
      await expectVisible(heading)

      // Verify helpful message displays
      const message = page.getByText(/This post does not exist, or may have been removed/i)
      await expectVisible(message)
    })

    test('should not leak archived post metadata in 404 response', async ({ page }) => {
      await page.goto('/posts/legacy-post-old-propaganda')

      // Verify archived post title does not appear
      const pageContent = await page.textContent('body')
      expect(pageContent).not.toContain('Legacy Post About Old Propaganda')

      // Verify archived post summary does not appear
      expect(pageContent).not.toContain(
        'Historical analysis of propaganda techniques from the Cold War',
      )
    })

    test('should provide recovery link to browse all posts', async ({ page }) => {
      await page.goto('/posts/legacy-post-old-propaganda')

      // Verify "Browse all posts" link is available
      const link = page.getByRole('link', { name: /Browse all posts/i })
      await expectVisible(link)

      // Click link and verify navigation works
      await link.click()
      await expectUrl(page, /\/posts$/)
    })
  })

  test.describe('404 Page Accessibility and Layout', () => {
    test('should maintain consistent layout across different 404 scenarios', async ({ page }) => {
      // Test nonexistent slug
      await page.goto('/posts/nonexistent-slug')
      const container1 = page.locator('div.flex.min-h-\\[50vh\\].items-center.justify-center')
      await expectVisible(container1)

      // Test draft post
      await page.goto('/posts/unpublished-thoughts-conditioning')
      const container2 = page.locator('div.flex.min-h-\\[50vh\\].items-center.justify-center')
      await expectVisible(container2)

      // Test archived post
      await page.goto('/posts/legacy-post-old-propaganda')
      const container3 = page.locator('div.flex.min-h-\\[50vh\\].items-center.justify-center')
      await expectVisible(container3)
    })

    test('should display all required elements in correct order', async ({ page }) => {
      await page.goto('/posts/nonexistent-slug')

      // Get all content elements
      const indicator = page.getByText('404', { exact: true })
      const heading = page.getByRole('heading', { name: /Post not found/i })
      const message = page.getByText(/This post does not exist, or may have been removed/i)
      const link = page.getByRole('link', { name: /Browse all posts/i })

      // Verify all elements are visible
      await expectVisible(indicator)
      await expectVisible(heading)
      await expectVisible(message)
      await expectVisible(link)

      // Verify elements appear in semantic order (check bounding boxes)
      const indicatorBox = await indicator.boundingBox()
      const headingBox = await heading.boundingBox()
      const messageBox = await message.boundingBox()
      const linkBox = await link.boundingBox()

      expect(indicatorBox).not.toBeNull()
      expect(headingBox).not.toBeNull()
      expect(messageBox).not.toBeNull()
      expect(linkBox).not.toBeNull()

      // Verify vertical ordering (indicator -> heading -> message -> link)
      expect(indicatorBox!.y).toBeLessThan(headingBox!.y)
      expect(headingBox!.y).toBeLessThan(messageBox!.y)
      expect(messageBox!.y).toBeLessThan(linkBox!.y)
    })

    test('should have accessible link with proper styling', async ({ page }) => {
      await page.goto('/posts/nonexistent-slug')

      // Verify link is accessible
      const link = page.getByRole('link', { name: /Browse all posts/i })
      await expectVisible(link)

      // Verify link has underline (check for underline class)
      const hasUnderline = await link.evaluate((el) =>
        el.classList.contains('underline') || el.classList.contains('underline-offset-4'),
      )
      expect(hasUnderline).toBe(true)
    })
  })
})
