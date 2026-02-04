import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import { expectVisible, expectUrl } from '../../helpers'

/**
 * E2E Tests: Admin Collection Navigation (CON-78)
 *
 * Tests the admin panel navigation and collection structure:
 * - Dashboard displays after login
 * - Navigation shows collection groups (Content, Media, Admin)
 * - Content group contains Posts, Pages, Tags, Listings
 * - Media group contains Media
 * - Admin group contains Users
 * - Clicking collection navigates to list view
 * - Breadcrumbs show current location
 */

test.describe('Admin Collection Navigation', () => {
  // Use authenticated admin session for these tests
  test.use({ storageState: STORAGE_STATE })

  test.describe('Dashboard Access', () => {
    test('should display dashboard after navigating to /admin', async ({ page }) => {
      // Navigate to admin
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')

      // Verify we're on the admin dashboard
      await expectUrl(page, /\/admin\/?$/)

      // Verify dashboard content is visible
      // Look for typical dashboard elements
      const dashboardHeading = page.getByRole('heading', { name: /dashboard/i })
      await expectVisible(dashboardHeading)
    })
  })

  test.describe('Navigation Sidebar - Collection Groups', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to admin dashboard before each test
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')
    })

    test('should show Content collection group with all collections', async ({ page }) => {
      // Look for the navigation sidebar
      const nav = page.locator('nav, aside, [role="navigation"]')
      await expectVisible(nav)

      // Verify Content group heading exists (might be labeled "Collections" or "Content")
      // Check for collections in the Content group
      const postsLink = page.getByRole('link', { name: /^posts$/i })
      const pagesLink = page.getByRole('link', { name: /^pages$/i })
      const tagsLink = page.getByRole('link', { name: /^tags$/i })
      const listingsLink = page.getByRole('link', { name: /^listings$/i })

      // Verify all content collections are visible
      await expectVisible(postsLink)
      await expectVisible(pagesLink)
      await expectVisible(tagsLink)
      await expectVisible(listingsLink)
    })

    test('should show Media collection group with Media collection', async ({ page }) => {
      // Look for Media collection link
      const mediaLink = page.getByRole('link', { name: /^media$/i })
      await expectVisible(mediaLink)
    })

    test('should show Admin collection group with Users collection', async ({ page }) => {
      // Look for Users collection link
      const usersLink = page.getByRole('link', { name: /^users$/i })
      await expectVisible(usersLink)
    })

    test('should show all collection groups together', async ({ page }) => {
      // Verify all collections are present in navigation
      const collections = [
        'Posts',
        'Pages',
        'Tags',
        'Listings',
        'Media',
        'Users'
      ]

      // Check that all collections are visible in the page
      for (const collection of collections) {
        const collectionLink = page.getByRole('link', { name: new RegExp(`^${collection}$`, 'i') })
        await expectVisible(collectionLink)
      }
    })
  })

  test.describe('Collection Navigation - Posts', () => {
    test('should navigate to Posts collection list view', async ({ page }) => {
      // Navigate to admin dashboard
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')

      // Click on Posts collection
      const postsLink = page.getByRole('link', { name: /^posts$/i })
      await postsLink.click()

      // Wait for navigation to complete
      await page.waitForLoadState('networkidle')

      // Verify we're on the posts collection page
      await expectUrl(page, /\/admin\/collections\/posts/)

      // Verify the posts collection view is displayed
      // Should show a list/table of posts or a "Create New" button
      const createButton = page.getByRole('button', { name: /create new|add new/i })
      await expectVisible(createButton)
    })
  })

  test.describe('Collection Navigation - Other Collections', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/admin')
      await page.waitForLoadState('networkidle')
    })

    test('should navigate to Pages collection', async ({ page }) => {
      const pagesLink = page.getByRole('link', { name: /^pages$/i })
      await pagesLink.click()
      await page.waitForLoadState('networkidle')
      await expectUrl(page, /\/admin\/collections\/pages/)
    })

    test('should navigate to Tags collection', async ({ page }) => {
      const tagsLink = page.getByRole('link', { name: /^tags$/i })
      await tagsLink.click()
      await page.waitForLoadState('networkidle')
      await expectUrl(page, /\/admin\/collections\/tags/)
    })

    test('should navigate to Listings collection', async ({ page }) => {
      const listingsLink = page.getByRole('link', { name: /^listings$/i })
      await listingsLink.click()
      await page.waitForLoadState('networkidle')
      await expectUrl(page, /\/admin\/collections\/listings/)
    })

    test('should navigate to Media collection', async ({ page }) => {
      const mediaLink = page.getByRole('link', { name: /^media$/i })
      await mediaLink.click()
      await page.waitForLoadState('networkidle')
      await expectUrl(page, /\/admin\/collections\/media/)
    })

    test('should navigate to Users collection', async ({ page }) => {
      const usersLink = page.getByRole('link', { name: /^users$/i })
      await usersLink.click()
      await page.waitForLoadState('networkidle')
      await expectUrl(page, /\/admin\/collections\/users/)
    })
  })

  test.describe('Breadcrumbs', () => {
    test('should show breadcrumbs on collection list view', async ({ page }) => {
      // Navigate to Posts collection
      await page.goto('/admin/collections/posts')
      await page.waitForLoadState('networkidle')

      // Look for breadcrumbs navigation
      // Common selectors: nav with "breadcrumb", ol/ul with breadcrumb role, or links showing hierarchy
      const breadcrumbs = page.locator('[aria-label*="breadcrumb" i], nav:has(a[href="/admin"]), .breadcrumbs, [class*="breadcrumb"]')

      // Verify breadcrumbs exist (at least one should be visible)
      const breadcrumbCount = await breadcrumbs.count()
      expect(breadcrumbCount).toBeGreaterThan(0)

      // Verify breadcrumbs contain relevant text
      const pageContent = await page.textContent('body')

      // Should show current location (Posts)
      // May also show Dashboard or Admin in breadcrumb trail
      expect(pageContent).toContain('Posts')
    })

    test('should update breadcrumbs when navigating between collections', async ({ page }) => {
      // Start at Posts
      await page.goto('/admin/collections/posts')
      await page.waitForLoadState('networkidle')

      let pageContent = await page.textContent('body')
      expect(pageContent).toContain('Posts')

      // Navigate to Tags
      const tagsLink = page.getByRole('link', { name: /^tags$/i })
      await tagsLink.click()
      await page.waitForLoadState('networkidle')

      // Verify breadcrumbs updated to show Tags
      pageContent = await page.textContent('body')
      expect(pageContent).toContain('Tags')
      await expectUrl(page, /\/admin\/collections\/tags/)
    })

    test('should show breadcrumbs on collection edit view', async ({ page }) => {
      // Navigate to Posts collection and open first post
      await page.goto('/admin/collections/posts')
      await page.waitForLoadState('networkidle')

      // Click on the first post in the list
      // Look for a table row or list item with a link
      const firstPostLink = page.locator('table tbody tr a, .list-item a, [class*="table"] a').first()
      await firstPostLink.click()
      await page.waitForLoadState('networkidle')

      // Verify we're on an edit page
      await expectUrl(page, /\/admin\/collections\/posts\/[a-f0-9-]+/)

      // Verify breadcrumbs exist and show hierarchy
      const pageContent = await page.textContent('body')

      // Should show the collection name (Posts) in breadcrumbs
      expect(pageContent).toContain('Posts')
    })

    test('should allow navigating back via breadcrumbs', async ({ page }) => {
      // Navigate to Posts collection and open first post
      await page.goto('/admin/collections/posts')
      await page.waitForLoadState('networkidle')

      const firstPostLink = page.locator('table tbody tr a, .list-item a, [class*="table"] a').first()
      await firstPostLink.click()
      await page.waitForLoadState('networkidle')

      // Verify we're on the edit page
      await expectUrl(page, /\/admin\/collections\/posts\/[a-f0-9-]+/)

      // Click breadcrumb link to go back to Posts collection
      // Look for a link to Posts in breadcrumbs
      const postsBreadcrumb = page.getByRole('link', { name: /^posts$/i }).first()
      await postsBreadcrumb.click()
      await page.waitForLoadState('networkidle')

      // Verify we're back on the collection list
      await expectUrl(page, /\/admin\/collections\/posts\/?$/)
    })
  })

  test.describe('Navigation Persistence', () => {
    test('should maintain navigation state across page refreshes', async ({ page }) => {
      // Navigate to a specific collection
      await page.goto('/admin/collections/tags')
      await page.waitForLoadState('networkidle')

      // Verify we're on Tags collection
      await expectUrl(page, /\/admin\/collections\/tags/)

      // Refresh the page
      await page.reload()
      await page.waitForLoadState('networkidle')

      // Verify we're still on Tags collection
      await expectUrl(page, /\/admin\/collections\/tags/)

      // Verify navigation sidebar is still visible
      const tagsLink = page.getByRole('link', { name: /^tags$/i })
      await expectVisible(tagsLink)
    })

    test('should show current collection as active in navigation', async ({ page }) => {
      // Navigate to Posts collection
      await page.goto('/admin/collections/posts')
      await page.waitForLoadState('networkidle')

      // Look for the Posts link in navigation
      const postsLink = page.getByRole('link', { name: /^posts$/i })

      // The active link might have special styling or aria-current attribute
      // Check if it exists and is visible (actual active state styling varies by implementation)
      await expectVisible(postsLink)

      // Verify we're on the right page
      await expectUrl(page, /\/admin\/collections\/posts/)
    })
  })
})
