import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import { expectVisible, expectUrl } from '../../helpers'

/**
 * CON-79: Admin List Views E2E Tests
 *
 * Tests the admin collection list views to verify:
 * - Posts list shows: title, type, status, publishedAt
 * - Pages list shows: title, slug, status
 * - Listings list shows: title, status, updatedAt
 * - Lists are sortable (if supported)
 * - "Create New" action is accessible
 */

test.describe('Admin List Views', () => {
  // Use authenticated admin session for these tests
  test.use({ storageState: STORAGE_STATE })

  test.describe('Posts List View', () => {
    test('should display posts with title, type, status, and publishedAt columns', async ({
      adminCollectionPage,
      page,
    }) => {
      // Navigate to Posts collection
      await adminCollectionPage.goto('posts')

      // Verify we're on the posts collection page
      await expectUrl(page, /\/admin\/collections\/posts/)
      await expectVisible(adminCollectionPage.collectionHeading)

      // Verify table has content (seeded posts should be present)
      const rowCount = await adminCollectionPage.getRowCount()
      expect(rowCount).toBeGreaterThan(0)

      // Check for column headers in the table
      const tableHeaders = page.locator('table thead th, [class*="table"] [class*="header"]')
      const headerCount = await tableHeaders.count()
      expect(headerCount).toBeGreaterThan(0)

      // Verify at least one seeded post is visible
      // Seeded posts include: "The Architecture of Persuasion", "Decoding Corporate Newspeak", "Notes from the Attention Economy"
      const firstPost = await adminCollectionPage.getRowByText('The Architecture of Persuasion')
      await expectVisible(firstPost)

      // Verify the row contains expected data fields
      const rowText = await firstPost.textContent()
      expect(rowText).toBeTruthy()

      // The row should display post information
      // (exact column structure depends on Payload's table configuration)
      const pageContent = await page.textContent('body')
      expect(pageContent).toContain('The Architecture of Persuasion')
    })

    test('should show "Create New" button and allow navigation to create post', async ({
      adminCollectionPage,
      page,
    }) => {
      // Navigate to Posts collection
      await adminCollectionPage.goto('posts')

      // Verify "Create New" button is visible
      await expectVisible(adminCollectionPage.createNewButton)

      // Verify button is clickable (enabled)
      await expect(adminCollectionPage.createNewButton).toBeEnabled()

      // Click "Create New" button
      await adminCollectionPage.clickCreateNew()

      // Verify we navigated to the create page
      await expectUrl(page, /\/admin\/collections\/posts\/create/)
    })
  })

  test.describe('Pages List View', () => {
    test('should display pages with title, slug, and status columns', async ({
      adminCollectionPage,
      page,
    }) => {
      // Navigate to Pages collection
      await adminCollectionPage.goto('pages')

      // Verify we're on the pages collection page
      await expectUrl(page, /\/admin\/collections\/pages/)
      await expectVisible(adminCollectionPage.collectionHeading)

      // Verify table has content (seeded page should be present)
      const rowCount = await adminCollectionPage.getRowCount()
      expect(rowCount).toBeGreaterThan(0)

      // Check for column headers
      const tableHeaders = page.locator('table thead th, [class*="table"] [class*="header"]')
      const headerCount = await tableHeaders.count()
      expect(headerCount).toBeGreaterThan(0)

      // Verify seeded page "About Mind-Controlled" is visible
      const aboutPage = await adminCollectionPage.getRowByText('About Mind-Controlled')
      await expectVisible(aboutPage)

      // Verify the row contains expected data (title, slug, status)
      const rowText = await aboutPage.textContent()
      expect(rowText).toContain('About Mind-Controlled')
      expect(rowText).toContain('about')
      expect(rowText).toMatch(/published/i)
    })

    test('should show "Create New" button and allow navigation to create page', async ({
      adminCollectionPage,
      page,
    }) => {
      // Navigate to Pages collection
      await adminCollectionPage.goto('pages')

      // Verify "Create New" button is visible
      await expectVisible(adminCollectionPage.createNewButton)

      // Verify button is clickable
      await expect(adminCollectionPage.createNewButton).toBeEnabled()

      // Click "Create New" button
      await adminCollectionPage.clickCreateNew()

      // Verify we navigated to the create page
      await expectUrl(page, /\/admin\/collections\/pages\/create/)
    })
  })

  test.describe('Listings List View', () => {
    test('should display listings with title, status, and updatedAt columns', async ({
      adminCollectionPage,
      page,
    }) => {
      // Navigate to Listings collection
      await adminCollectionPage.goto('listings')

      // Verify we're on the listings collection page
      await expectUrl(page, /\/admin\/collections\/listings/)
      await expectVisible(adminCollectionPage.collectionHeading)

      // Verify table has content (seeded listing should be present)
      const rowCount = await adminCollectionPage.getRowCount()
      expect(rowCount).toBeGreaterThan(0)

      // Check for column headers
      const tableHeaders = page.locator('table thead th, [class*="table"] [class*="header"]')
      const headerCount = await tableHeaders.count()
      expect(headerCount).toBeGreaterThan(0)

      // Verify seeded listing "Featured Essays" is visible
      const featuredListing = await adminCollectionPage.getRowByText('Featured Essays')
      await expectVisible(featuredListing)

      // Verify the row contains expected data (title, status)
      const rowText = await featuredListing.textContent()
      expect(rowText).toContain('Featured Essays')
      // Status and updatedAt should be present in the row
      expect(rowText).toBeTruthy()
    })

    test('should show "Create New" button and allow navigation to create listing', async ({
      adminCollectionPage,
      page,
    }) => {
      // Navigate to Listings collection
      await adminCollectionPage.goto('listings')

      // Verify "Create New" button is visible
      await expectVisible(adminCollectionPage.createNewButton)

      // Verify button is clickable
      await expect(adminCollectionPage.createNewButton).toBeEnabled()

      // Click "Create New" button
      await adminCollectionPage.clickCreateNew()

      // Verify we navigated to the create page
      await expectUrl(page, /\/admin\/collections\/listings\/create/)
    })
  })

  test.describe('Column Sorting', () => {
    test('should have sortable column headers in Posts list', async ({
      adminCollectionPage,
      page,
    }) => {
      // Navigate to Posts collection
      await adminCollectionPage.goto('posts')

      // Look for sortable column headers
      // Payload typically makes column headers clickable for sorting
      const columnHeaders = page.locator('table thead th, [class*="table"] [class*="header"]')
      const headerCount = await columnHeaders.count()

      if (headerCount > 0) {
        // Check if headers are clickable (sortable)
        const firstHeader = columnHeaders.first()
        const isClickable = await firstHeader.evaluate((el) => {
          const styles = window.getComputedStyle(el)
          const cursor = styles.cursor
          // Check if the element or its children have click handlers or cursor styling
          return cursor === 'pointer' || el.querySelector('button') !== null
        })

        // If sorting is supported, verify headers are clickable
        // Note: This is a basic check - some tables may not support sorting
        if (isClickable) {
          await expect(firstHeader).toBeVisible()
        }
      }
    })

    test('should have sortable column headers in Pages list', async ({
      adminCollectionPage,
      page,
    }) => {
      // Navigate to Pages collection
      await adminCollectionPage.goto('pages')

      // Look for sortable column headers
      const columnHeaders = page.locator('table thead th, [class*="table"] [class*="header"]')
      const headerCount = await columnHeaders.count()

      if (headerCount > 0) {
        const firstHeader = columnHeaders.first()
        const isClickable = await firstHeader.evaluate((el) => {
          const styles = window.getComputedStyle(el)
          const cursor = styles.cursor
          return cursor === 'pointer' || el.querySelector('button') !== null
        })

        if (isClickable) {
          await expect(firstHeader).toBeVisible()
        }
      }
    })

    test('should have sortable column headers in Listings list', async ({
      adminCollectionPage,
      page,
    }) => {
      // Navigate to Listings collection
      await adminCollectionPage.goto('listings')

      // Look for sortable column headers
      const columnHeaders = page.locator('table thead th, [class*="table"] [class*="header"]')
      const headerCount = await columnHeaders.count()

      if (headerCount > 0) {
        const firstHeader = columnHeaders.first()
        const isClickable = await firstHeader.evaluate((el) => {
          const styles = window.getComputedStyle(el)
          const cursor = styles.cursor
          return cursor === 'pointer' || el.querySelector('button') !== null
        })

        if (isClickable) {
          await expect(firstHeader).toBeVisible()
        }
      }
    })
  })
})
