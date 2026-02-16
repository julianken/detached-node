import { test, expect } from '../../fixtures'
import { expectUrl, fillRichText } from '../../helpers'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'

/**
 * CON-63: Page Status Workflow E2E Tests
 *
 * Tests the page status workflow including:
 * - Draft pages only visible to authenticated users
 * - Published pages visible to public
 * - Status change immediately affects visibility
 */

// Use authenticated admin session for admin tests
test.use({ storageState: STORAGE_STATE })

test.describe('Page Status Workflow', () => {
  test.describe('Admin View - Status Management', () => {
    test('should create draft page and verify status', async ({
      page,
      adminEditorPage,
      adminCollectionPage,
    }) => {
      // Navigate to create page
      await adminEditorPage.gotoCreate('pages')

      // Fill in required fields first
      await adminEditorPage.fillField('title', 'Draft Page for Status Test')
      await fillRichText(page, 'This is a draft page that should not be visible to public.', 'body')

      // Verify default status is draft
      const initialStatus = await adminEditorPage.getFieldValue('status')
      expect(initialStatus).toBe('draft')

      // Save the page
      await adminEditorPage.save()

      // Verify we're on the edit page
      await expect(page).toHaveURL(/\/admin\/collections\/pages\/[a-f0-9]+/)

      // Verify status is still draft
      const statusAfterSave = await adminEditorPage.getFieldValue('status')
      expect(statusAfterSave).toBe('draft')

      // Verify slug was auto-generated
      const slugValue = await adminEditorPage.getFieldValue('slug')
      expect(slugValue).toBe('draft-page-for-status-test')
    })

    test('should change draft page to published status', async ({
      page,
      adminEditorPage,
    }) => {
      // Navigate to create a draft page first
      await adminEditorPage.gotoCreate('pages')

      // Fill in required fields
      await adminEditorPage.fillField('title', 'Page to Publish Status Test')
      await fillRichText(page, 'This page will be changed to published status.', 'body')

      // Save as draft
      await adminEditorPage.save()
      await page.waitForLoadState('networkidle')

      // Get the slug for later verification
      const slug = await adminEditorPage.getFieldValue('slug')
      expect(slug).toBe('page-to-publish-status-test')

      // Change status to published
      const statusSelect = page.locator('select[name="status"]')
      await statusSelect.selectOption('published')

      // Save the changes
      await adminEditorPage.save()
      await page.waitForTimeout(2000)

      // Verify status was saved
      const statusAfterSave = await adminEditorPage.getFieldValue('status')
      expect(statusAfterSave).toBe('published')
    })

    test('should unpublish page by changing status to draft', async ({
      page,
      adminEditorPage,
      adminCollectionPage,
    }) => {
      // Navigate to the seeded "About Detached Node" page (currently published)
      await adminCollectionPage.goto('pages')
      await page.waitForLoadState('networkidle')

      // Click on the About page
      await page.getByText('About Detached Node').first().click()
      await page.waitForLoadState('networkidle')

      // Verify current status is published
      const statusBeforeChange = await adminEditorPage.getFieldValue('status')
      expect(statusBeforeChange).toBe('published')

      // Change status to draft (unpublish)
      const statusSelect = page.locator('select[name="status"]')
      await statusSelect.selectOption('draft')

      // Save the changes
      await adminEditorPage.save()
      await page.waitForTimeout(2000)

      // Verify status was saved
      const statusAfterSave = await adminEditorPage.getFieldValue('status')
      expect(statusAfterSave).toBe('draft')

      // Change it back to published for other tests
      await statusSelect.selectOption('published')
      await adminEditorPage.save()
      await page.waitForTimeout(2000)
    })
  })
})

test.describe('Page Status - Public Visibility', () => {
  // These tests do NOT use authenticated storage state
  test.use({ storageState: undefined })

  test.describe('Public Frontend - Status Visibility', () => {
    test('should NOT show draft pages on public frontend', async ({ page }) => {
      // Try to access a draft page directly by URL (the one we created in admin tests)
      // Note: This will only work if the test order allows the draft page to exist
      // For a more robust test, we would create it via API first

      // Try to access a URL that would be a draft page
      const response = await page.goto('/draft-page-for-status-test')

      // Should return 404 for draft pages
      expect(response?.status()).toBe(404)

      // Verify page shows 404 error
      const pageContent = await page.textContent('body')
      expect(pageContent).toMatch(/404|not found/i)
    })

    test('should show published page on public frontend', async ({ page }) => {
      // Navigate to the published "About" page
      await page.goto('/about')
      await page.waitForLoadState('networkidle')

      // Verify page loads successfully (check for main content, not 404)
      const main = page.locator('main')
      await expect(main).toBeVisible()

      // Verify heading is visible
      const heading = page.locator('h1')
      await expect(heading).toBeVisible()

      // Verify we can see some content (either CMS or fallback)
      const mainText = await main.textContent()
      expect(mainText).toBeTruthy()
      expect(mainText!.length).toBeGreaterThan(10)
    })

    test('should verify published page is accessible at its slug URL', async ({ page }) => {
      // Navigate to the About page by slug
      const response = await page.goto('/about')

      // Should return 200 OK
      expect(response?.status()).toBe(200)

      // Verify page loaded
      await page.waitForLoadState('networkidle')

      // Verify heading is visible
      const heading = page.locator('h1')
      await expect(heading).toBeVisible()

      // Verify content is present
      const main = page.locator('main')
      const mainText = await main.textContent()
      expect(mainText).toBeTruthy()
      expect(mainText!.length).toBeGreaterThan(10)
    })
  })
})

test.describe('Page Status - Admin Visibility', () => {
  // Use authenticated admin session
  test.use({ storageState: STORAGE_STATE })

  test.describe('Admin View - Authenticated User Sees All Statuses', () => {
    test('should show draft pages in admin pages collection', async ({
      page,
      adminEditorPage,
      adminCollectionPage,
    }) => {
      // Create a draft page
      await adminEditorPage.gotoCreate('pages')
      await adminEditorPage.fillField('title', 'Admin Visible Draft Page')
      await fillRichText(page, 'This draft should be visible in admin.', 'body')
      await adminEditorPage.save()
      await page.waitForLoadState('networkidle')

      // Navigate to pages collection (authenticated)
      await adminCollectionPage.goto('pages')
      await page.waitForLoadState('networkidle')

      // Verify draft page is visible
      const pageContent = await page.textContent('body')
      expect(pageContent).toContain('Admin Visible Draft Page')
    })

    test('should show published pages in admin pages collection', async ({
      page,
      adminCollectionPage,
    }) => {
      // Navigate to pages collection (authenticated)
      await adminCollectionPage.goto('pages')
      await page.waitForLoadState('networkidle')

      // Verify published page is visible (seeded "About Detached Node")
      const pageContent = await page.textContent('body')
      expect(pageContent).toContain('About Detached Node')
    })
  })
})
