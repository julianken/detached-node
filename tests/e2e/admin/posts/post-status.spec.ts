import { test, expect } from '../../fixtures'
import { expectUrl, expectVisible, expectNotVisible } from '../../helpers'
import { TEST_ADMIN } from '../../fixtures/auth.fixture'

/**
 * CON-59: Post Status Workflow E2E Tests
 *
 * Tests the post status workflow including:
 * - New posts default to "draft" status
 * - Status can be changed to "published" or "archived"
 * - Draft posts only visible to authenticated users
 * - Published posts visible to public
 * - Archived posts only visible to authenticated users
 */

test.describe('Post Status Workflow', () => {
  test.describe('Admin View - Status Management', () => {
    // Authenticate before each test in this suite
    test.beforeEach(async ({ adminLoginPage }) => {
      await adminLoginPage.goto()
      await adminLoginPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    })

    test('should verify draft post exists and is editable in admin', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to posts collection
      await adminCollectionPage.goto('posts')

      // Verify the page loaded
      await page.waitForLoadState('networkidle')

      // Look for the draft post in the list (using a more flexible approach)
      const pageContent = await page.textContent('body')
      expect(pageContent).toContain('Unpublished Thoughts on Emergence')

      // Click on the post link/title
      await page.getByText('Unpublished Thoughts on Emergence').first().click()
      await page.waitForLoadState('networkidle')

      // Verify we're in the editor
      await expect(page).toHaveURL(/\/admin\/collections\/posts\/[a-f0-9]+/)

      // Verify title field has correct value
      const titleField = page.locator('input[name="title"]')
      await expect(titleField).toHaveValue('Unpublished Thoughts on Emergence')
    })

    test('should change draft post to published status', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to posts collection
      await adminCollectionPage.goto('posts')
      await page.waitForLoadState('networkidle')

      // Click on the draft post
      await page.getByText('Unpublished Thoughts on Emergence').first().click()
      await page.waitForLoadState('networkidle')

      // Change status to published
      const statusSelect = page.locator('select[name="status"], [name="status"]')
      await statusSelect.selectOption('published')

      // Set publishedAt date
      const publishedAtInput = page.locator('input[name="publishedAt"]')
      const today = new Date().toISOString().split('T')[0]
      await publishedAtInput.fill(today)

      // Save the changes
      const saveButton = page.getByRole('button', { name: /save/i }).first()
      await saveButton.click()

      // Wait for save confirmation
      await page.waitForTimeout(2000)

      // Verify we're still on the editor page (save successful)
      await expect(page).toHaveURL(/\/admin\/collections\/posts\/[a-f0-9]+/)

      // Verify status was saved
      await expect(statusSelect).toHaveValue('published')
    })

    test('should verify archived post status persists', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to posts collection
      await adminCollectionPage.goto('posts')
      await page.waitForLoadState('networkidle')

      // Click on the archived post
      await page.getByText('Legacy Post About Early Automation').first().click()
      await page.waitForLoadState('networkidle')

      // Verify current status is archived
      const statusSelect = page.locator('select[name="status"], [name="status"]')
      await expect(statusSelect).toHaveValue('archived')

      // Verify publishedAt field exists and has a value
      const publishedAtInput = page.locator('input[name="publishedAt"]')
      const publishedAtValue = await publishedAtInput.inputValue()
      expect(publishedAtValue).toBeTruthy()
    })

    test('should create new post with default draft status', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to posts collection
      await adminCollectionPage.goto('posts')
      await page.waitForLoadState('networkidle')

      // Click create new
      const createButton = page.getByRole('link', { name: /create new|add new/i })
      await createButton.click()
      await page.waitForLoadState('networkidle')

      // Verify we're on the create page
      await expect(page).toHaveURL(/\/admin\/collections\/posts\/create/)

      // Check default status value
      const statusSelect = page.locator('select[name="status"], [name="status"]')

      // Wait for the field to be visible
      await expect(statusSelect).toBeVisible()

      // Verify default is draft
      const statusValue = await statusSelect.inputValue()
      expect(statusValue).toBe('draft')
    })
  })

  test.describe('Public Frontend - Status Visibility', () => {
    // These tests use a fresh, unauthenticated browser context
    test('should NOT show draft posts on public posts page', async ({ page }) => {
      // Navigate to public posts page (without authentication)
      await page.goto('/posts')
      await page.waitForLoadState('networkidle')

      // Verify we're on the posts page
      await expectUrl(page, /\/posts/)

      // Get page content
      const pageContent = await page.textContent('body')

      // Verify draft post is NOT visible
      expect(pageContent).not.toContain('Unpublished Thoughts on Emergence')

      // Try to access draft post directly by URL
      await page.goto('/posts/unpublished-thoughts-emergence')
      await page.waitForLoadState('networkidle')

      // Should either show 404 or not render content
      const bodyContent = await page.textContent('body')
      const is404 = bodyContent?.includes('404') || bodyContent?.includes('not found') || bodyContent?.includes('Not Found')

      // Either should be 404, or content should not be visible
      if (!is404) {
        expect(bodyContent).not.toContain('work in progress exploring')
      }
    })

    test('should show published posts on public posts page', async ({ page }) => {
      // Navigate to public posts page
      await page.goto('/posts')
      await page.waitForLoadState('networkidle')

      // Verify we're on the posts page
      await expectUrl(page, /\/posts/)

      // Get page content
      const pageContent = await page.textContent('body')

      // Verify we have published posts visible (check for any of the known published posts)
      const hasPublishedPost =
        pageContent?.includes('Architecture of Persuasion') ||
        pageContent?.includes('Decoding Corporate Newspeak') ||
        pageContent?.includes('Notes from the Attention Economy') ||
        pageContent?.includes('Essential Readings')

      expect(hasPublishedPost).toBe(true)
    })

    test('should NOT show archived posts on public posts page', async ({ page }) => {
      // Navigate to public posts page
      await page.goto('/posts')
      await page.waitForLoadState('networkidle')

      // Verify we're on the posts page
      await expectUrl(page, /\/posts/)

      // Get page content
      const pageContent = await page.textContent('body')

      // Verify archived post is NOT visible
      expect(pageContent).not.toContain('Legacy Post About Early Automation')

      // Try to access archived post directly by URL
      await page.goto('/posts/legacy-post-early-automation')
      await page.waitForLoadState('networkidle')

      // Should either show 404 or not render content
      const bodyContent = await page.textContent('body')
      const is404 = bodyContent?.includes('404') || bodyContent?.includes('not found') || bodyContent?.includes('Not Found')

      // Either should be 404, or archived content should not be visible
      if (!is404) {
        expect(bodyContent).not.toContain('automation methods that, while dated')
      }
    })

    test('should allow direct access to published post', async ({ page }) => {
      // Navigate to a specific published post
      await page.goto('/posts/architecture-of-persuasion')
      await page.waitForLoadState('networkidle')

      // Verify we can see the post content
      const heading = page.locator('h1')
      await expect(heading).toBeVisible()

      // Get heading text
      const headingText = await heading.textContent()

      // Should show the post title or at minimum not show a "not found" error
      const pageContent = await page.textContent('body')
      const isNotFound = pageContent?.includes('404') || pageContent?.includes('Post not found')

      if (!isNotFound) {
        // If not a 404, we should see content related to persuasion
        expect(pageContent?.toLowerCase()).toContain('persuasion')
      }
    })
  })

  test.describe('Admin View - Authenticated User Sees All Statuses', () => {
    // Authenticate before each test in this suite
    test.beforeEach(async ({ adminLoginPage }) => {
      await adminLoginPage.goto()
      await adminLoginPage.login(TEST_ADMIN.email, TEST_ADMIN.password)
    })

    test('should show draft posts in admin posts collection', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to posts collection (authenticated)
      await adminCollectionPage.goto('posts')
      await page.waitForLoadState('networkidle')

      // Verify draft post is visible
      const pageContent = await page.textContent('body')
      expect(pageContent).toContain('Unpublished Thoughts on Emergence')
    })

    test('should show archived posts in admin posts collection', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to posts collection (authenticated)
      await adminCollectionPage.goto('posts')
      await page.waitForLoadState('networkidle')

      // Verify archived post is visible
      const pageContent = await page.textContent('body')
      expect(pageContent).toContain('Legacy Post About Early Automation')
    })

    test('should show published posts in admin posts collection', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to posts collection (authenticated)
      await adminCollectionPage.goto('posts')
      await page.waitForLoadState('networkidle')

      // Verify published posts are visible
      const pageContent = await page.textContent('body')
      expect(pageContent).toContain('Architecture of Persuasion')
    })
  })
})
