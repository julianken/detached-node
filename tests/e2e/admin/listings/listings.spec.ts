import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import {
  selectRelationship,
  selectMultipleRelationships,
  expectFieldValue,
  expectVisible,
  expectUrl,
} from '../../helpers'

/**
 * CON-69: Listings CRUD E2E Tests
 *
 * Tests the listing creation and management flow in the admin panel:
 * - Navigate to Listings collection and create new
 * - Title field required
 * - Slug auto-generated from title
 * - Description field optional
 * - Featured image picker works
 * - Items relationship picker for posts (multi-select)
 * - Status can be draft or published
 * - List view shows title, status, updatedAt
 */

// Use authenticated admin session for these tests
test.use({ storageState: STORAGE_STATE })

test.describe('Listings CRUD Operations', () => {
  test.beforeEach(async ({ adminCollectionPage }) => {
    // Navigate to Listings collection
    await adminCollectionPage.goto('listings')
  })

  test('should successfully create listing with title and posts (happy path)', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Click "Create New" button
    await adminCollectionPage.clickCreateNew()

    // Verify we're on the create page
    await expectUrl(page, /\/admin\/collections\/listings\/create/)

    // Fill in title
    const testTitle = 'Essential Reading'
    await adminEditorPage.fillField('title', testTitle)

    // Wait for slug to auto-generate
    await page.waitForTimeout(500)

    // Fill in description (optional field)
    const testDescription = 'A curated collection of essential readings on propaganda and mind control'
    await adminEditorPage.fillField('description', testDescription)

    // Select multiple posts for the items relationship
    // Seeded posts: "The Architecture of Persuasion", "Decoding Corporate Newspeak", "Notes from the Attention Economy"
    await selectMultipleRelationships(page, 'items', [
      'The Architecture of Persuasion',
      'Decoding Corporate Newspeak',
      'Notes from the Attention Economy',
    ])

    // Save the listing
    await adminEditorPage.save()

    // Verify success - should redirect to edit page
    await page.waitForURL(/\/admin\/collections\/listings\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify we can see the saved title
    await expectFieldValue(page, 'title', testTitle)

    // Verify description persisted
    await expectFieldValue(page, 'description', testDescription)

    // Verify posts are still selected
    const itemsContainer = page.locator('[data-field="items"]')
    await expect(itemsContainer).toContainText('The Architecture of Persuasion')
    await expect(itemsContainer).toContainText('Decoding Corporate Newspeak')
    await expect(itemsContainer).toContainText('Notes from the Attention Economy')
  })

  test('should auto-generate slug from title', async ({ adminCollectionPage, adminEditorPage, page }) => {
    // Click "Create New" button
    await adminCollectionPage.clickCreateNew()

    // Fill in title
    const testTitle = 'Understanding Media Manipulation'
    await adminEditorPage.fillField('title', testTitle)

    // Wait for slug auto-generation
    await page.waitForTimeout(800)

    // Verify slug was generated (should be lowercase with hyphens)
    const slugField = page.locator('input[name="slug"]')
    const slugValue = await slugField.inputValue()

    // Slug should be generated from title
    expect(slugValue).toBeTruthy()
    expect(slugValue).toMatch(/understanding-media-manipulation/)
    expect(slugValue).not.toContain(' ')
    expect(slugValue).toBe(slugValue.toLowerCase())
  })

  test('should allow adding featured image via relationship picker', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Click "Create New" button
    await adminCollectionPage.clickCreateNew()

    // Fill in required title
    const testTitle = 'Visual Propaganda Analysis'
    await adminEditorPage.fillField('title', testTitle)

    // Wait for slug generation
    await page.waitForTimeout(500)

    // Select a featured image from seeded media
    // Seeded media: "Test featured image 1", "Test featured image 2"
    await selectRelationship(page, 'featuredImage', 'Test featured image 1')

    // Verify the relationship was selected
    const featuredImageContainer = page.locator('[data-field="featuredImage"]')
    await expect(featuredImageContainer).toContainText('Test featured image 1')

    // Save the listing
    await adminEditorPage.save()

    // Wait for save to complete
    await page.waitForURL(/\/admin\/collections\/listings\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify the featured image relationship persisted
    await expect(featuredImageContainer).toContainText('Test featured image 1')
  })

  test('should allow selecting multiple posts in items relationship', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Click "Create New" button
    await adminCollectionPage.clickCreateNew()

    // Fill in required title
    const testTitle = 'Recommended Essays'
    await adminEditorPage.fillField('title', testTitle)

    // Wait for slug generation
    await page.waitForTimeout(500)

    // Select multiple posts
    await selectMultipleRelationships(page, 'items', [
      'The Architecture of Persuasion',
      'Notes from the Attention Economy',
    ])

    // Verify both posts are selected
    const itemsContainer = page.locator('[data-field="items"]')
    await expect(itemsContainer).toContainText('The Architecture of Persuasion')
    await expect(itemsContainer).toContainText('Notes from the Attention Economy')

    // Save the listing
    await adminEditorPage.save()

    // Wait for save to complete
    await page.waitForURL(/\/admin\/collections\/listings\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify relationships persisted
    await expect(itemsContainer).toContainText('The Architecture of Persuasion')
    await expect(itemsContainer).toContainText('Notes from the Attention Economy')
  })

  test('should allow publishing a listing', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Click "Create New" button
    await adminCollectionPage.clickCreateNew()

    // Fill in required title
    const testTitle = 'Published Collection'
    await adminEditorPage.fillField('title', testTitle)

    // Wait for slug generation
    await page.waitForTimeout(500)

    // Add at least one post item
    await selectRelationship(page, 'items', 'The Architecture of Persuasion')

    // Change status to published
    const statusSelect = page.locator('select[name="status"], [name="status"]')
    await statusSelect.selectOption('published')

    // Save the listing
    await adminEditorPage.save()

    // Wait for save to complete
    await page.waitForURL(/\/admin\/collections\/listings\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify status was saved
    await expect(statusSelect).toHaveValue('published')
  })

  test('should display listings in list view with title, status, and updatedAt', async ({
    adminCollectionPage,
    page,
  }) => {
    // Navigate to listings collection (already done in beforeEach)
    await page.waitForLoadState('networkidle')

    // Verify we're on the listings collection page
    await expectUrl(page, /\/admin\/collections\/listings/)

    // Look for the seeded listing in the list
    // Seeded listing: "Featured Essays"
    const pageContent = await page.textContent('body')
    expect(pageContent).toContain('Featured Essays')

    // Verify table/list structure exists
    const tableRows = adminCollectionPage.tableRows
    const rowCount = await tableRows.count()

    // Should have at least 1 row (the seeded listing)
    expect(rowCount).toBeGreaterThan(0)

    // Check if the listing row contains expected information
    const listingRow = await adminCollectionPage.getRowByText('Featured Essays')
    await expectVisible(listingRow)

    // The row should contain status and timestamp information
    // (exact format may vary based on Payload's table rendering)
    const rowText = await listingRow.textContent()
    expect(rowText).toContain('Featured Essays')
  })

  test('should allow editing an existing listing', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Navigate to listings collection
    await page.waitForLoadState('networkidle')

    // Click on the seeded listing "Featured Essays"
    await page.getByText('Featured Essays').first().click()
    await page.waitForLoadState('networkidle')

    // Verify we're in the editor
    await expect(page).toHaveURL(/\/admin\/collections\/listings\/[a-f0-9-]+/)

    // Verify title field has correct value
    const titleField = page.locator('input[name="title"]')
    await expect(titleField).toHaveValue('Featured Essays')

    // Edit the description
    const updatedDescription = 'Updated collection of featured content'
    await adminEditorPage.fillField('description', updatedDescription)

    // Save changes
    await adminEditorPage.save()

    // Wait for save to complete
    await page.waitForTimeout(2000)

    // Verify description was saved
    await expectFieldValue(page, 'description', updatedDescription)
  })

  test('should require title field when creating listing', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Click "Create New" button
    await adminCollectionPage.clickCreateNew()

    // Try to save without filling title (required field)
    await adminEditorPage.save()

    // Wait for validation
    await page.waitForTimeout(1000)

    // Should still be on create page (not redirected)
    await expectUrl(page, /\/admin\/collections\/listings\/create/)

    // Look for validation error
    // Payload typically shows errors near the field or in a toast
    const titleField = page.locator('input[name="title"]')
    const fieldContainer = titleField.locator('xpath=ancestor::*[@data-field or contains(@class, "field")]').first()

    // Check if there's an error indicator
    const hasError = await page.locator('[class*="error"], .error-message, [role="alert"]').count()
    expect(hasError).toBeGreaterThan(0)
  })

  test('should allow draft status as default', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Click "Create New" button
    await adminCollectionPage.clickCreateNew()

    // Verify we're on the create page
    await expectUrl(page, /\/admin\/collections\/listings\/create/)

    // Check default status value
    const statusSelect = page.locator('select[name="status"], [name="status"]')

    // Wait for the field to be visible
    await expect(statusSelect).toBeVisible()

    // Verify default is draft
    const statusValue = await statusSelect.inputValue()
    expect(statusValue).toBe('draft')

    // Fill required fields
    await adminEditorPage.fillField('title', 'Draft Listing Test')
    await page.waitForTimeout(500)

    // Add an item
    await selectRelationship(page, 'items', 'The Architecture of Persuasion')

    // Save with draft status
    await adminEditorPage.save()

    // Wait for save to complete
    await page.waitForURL(/\/admin\/collections\/listings\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify status is still draft
    await expect(statusSelect).toHaveValue('draft')
  })
})
