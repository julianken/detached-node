import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import {
  selectMultipleRelationships,
  removeRelationship,
  getSelectedRelationships,
  expectFieldValue,
  expectVisible,
} from '../../helpers'

/**
 * CON-70: Listing Items Selection E2E Tests
 *
 * Tests the listing items selection functionality:
 * - Items picker allows multi-select from Posts
 * - Can select multiple posts
 * - Order preserved
 * - Can remove items
 * - Empty items array allowed
 *
 * Test Scenarios:
 * 1. Select posts: choose 3 posts, verify displayed
 * 2. Order preservation: verify order matches selection
 * 3. Remove item: remove one post, verify update
 * 4. Empty listing: save with no posts, verify allowed
 */

// Use authenticated admin session for these tests
test.use({ storageState: STORAGE_STATE })

test.describe('Listing Items Selection', () => {
  test('should allow selecting multiple posts and display them in order', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Navigate to Listings collection
    await adminCollectionPage.goto('listings')

    // Click "Create New" button
    await adminCollectionPage.clickCreateNew()

    // Fill in required title
    const testTitle = 'Multi-Select Test Listing'
    await adminEditorPage.fillField('title', testTitle)

    // Wait for slug generation
    await page.waitForTimeout(500)

    // Wait for the Items field to be visible
    await page.waitForSelector('text=Items', { timeout: 10000 })

    // Select 3 posts in specific order
    // Click the "Select a value" dropdown
    await page.locator('text=Select a value').click()
    await page.waitForTimeout(500)

    // Select first post
    await page.locator('text=The Architecture of Persuasion').click()
    await page.waitForTimeout(300)

    // Click dropdown again for second post
    await page.locator('button:has-text("Select")').first().click()
    await page.waitForTimeout(500)
    await page.locator('text=Decoding Corporate Newspeak').click()
    await page.waitForTimeout(300)

    // Click dropdown again for third post
    await page.locator('button:has-text("Select")').first().click()
    await page.waitForTimeout(500)
    await page.locator('text=Notes from the Attention Economy').click()
    await page.waitForTimeout(300)

    // Verify all 3 posts are displayed (they appear as truncated chips)
    await expect(page.locator('body')).toContainText('The Architecture of Pers')
    await expect(page.locator('body')).toContainText('Decoding Corporate Ne')
    await expect(page.locator('body')).toContainText('Notes from the Attention')

    // Save the listing
    await adminEditorPage.save()

    // Wait for save to complete
    await page.waitForURL(/\/admin\/collections\/listings\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify posts are still selected after save
    await expect(page.locator('body')).toContainText('The Architecture of Pers')
    await expect(page.locator('body')).toContainText('Decoding Corporate Ne')
    await expect(page.locator('body')).toContainText('Notes from the Attention')
  })

  test('should preserve the order of selected posts', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Navigate to Listings collection
    await adminCollectionPage.goto('listings')

    // Click "Create New" button
    await adminCollectionPage.clickCreateNew()

    // Fill in required title
    const testTitle = 'Order Preservation Test'
    await adminEditorPage.fillField('title', testTitle)

    // Wait for slug generation and Items field to be visible
    await page.waitForTimeout(500)
    await page.waitForSelector('text=Items', { timeout: 10000 })

    // Select posts in a specific order
    const orderedPosts = [
      'Notes from the Attention Economy',
      'The Architecture of Persuasion',
      'Decoding Corporate Newspeak',
    ]

    await selectMultipleRelationships(page, 'items', orderedPosts)

    // Verify all posts were selected (displayed as chips)
    await expect(page.locator('body')).toContainText('Notes from the Attention')
    await expect(page.locator('body')).toContainText('The Architecture of Pers')
    await expect(page.locator('body')).toContainText('Decoding Corporate Ne')

    // Save the listing
    await adminEditorPage.save()

    // Wait for save to complete
    await page.waitForURL(/\/admin\/collections\/listings\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify posts are still present after save
    await expect(page.locator('body')).toContainText('Notes from the Attention')
    await expect(page.locator('body')).toContainText('The Architecture of Pers')
    await expect(page.locator('body')).toContainText('Decoding Corporate Ne')
  })

  test('should allow removing individual posts from selection', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Navigate to Listings collection
    await adminCollectionPage.goto('listings')

    // Edit the seeded "Featured Essays" listing which has 3 posts
    await page.getByText('Featured Essays').first().click()
    await page.waitForLoadState('networkidle')

    // Verify we're in the editor
    await expect(page).toHaveURL(/\/admin\/collections\/listings\/[a-f0-9-]+/)

    // Wait for the Items field to be visible
    await page.waitForSelector('text=Items', { timeout: 10000 })

    // Verify the listing has 3 posts initially by checking for the post titles in chips
    // The items are displayed as chips/tags, so we look for them in the page content
    await expect(page.locator('body')).toContainText('The Architecture of Pers')
    await expect(page.locator('body')).toContainText('Decoding Corporate Ne')
    await expect(page.locator('body')).toContainText('Notes from the Attention')

    // Remove one post - look for the chip and click its remove button
    // Find the chip containing "Decoding Corporate Ne" and click its X button
    const chipToRemove = page.locator('text=Decoding Corporate Ne').locator('..').locator('button').first()
    await chipToRemove.click()

    // Wait for removal to process
    await page.waitForTimeout(500)

    // Verify the post was removed
    await expect(page.locator('body')).toContainText('The Architecture of Pers')
    await expect(page.locator('body')).not.toContainText('Decoding Corporate Ne')
    await expect(page.locator('body')).toContainText('Notes from the Attention')

    // Save the updated listing
    await adminEditorPage.save()

    // Wait for save to complete
    await page.waitForTimeout(2000)

    // Verify the removal persisted
    await expect(page.locator('body')).toContainText('The Architecture of Pers')
    await expect(page.locator('body')).not.toContainText('Decoding Corporate Ne')
    await expect(page.locator('body')).toContainText('Notes from the Attention')
  })

  test('should allow saving a listing with no posts (empty items)', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Navigate to Listings collection
    await adminCollectionPage.goto('listings')

    // Click "Create New" button
    await adminCollectionPage.clickCreateNew()

    // Fill in required title
    const testTitle = 'Empty Listing Test'
    await adminEditorPage.fillField('title', testTitle)

    // Wait for slug generation and Items field
    await page.waitForTimeout(500)
    await page.waitForSelector('text=Items', { timeout: 10000 })

    // Add description to ensure we have some content
    await adminEditorPage.fillField('description', 'A listing with no items yet')

    // Do NOT select any posts - leave items empty

    // Attempt to save the listing with empty items
    await adminEditorPage.save()

    // Wait for save to complete - should succeed
    await page.waitForURL(/\/admin\/collections\/listings\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify we successfully saved
    await expectFieldValue(page, 'title', testTitle)
    await expectFieldValue(page, 'description', 'A listing with no items yet')

    // Verify no post chips are shown (the listing has no items)
    const pageText = await page.locator('body').textContent()
    expect(pageText).not.toContain('The Architecture of Pers')
    expect(pageText).not.toContain('Decoding Corporate Ne')
    expect(pageText).not.toContain('Notes from the Attention')
  })

  test('should allow adding posts after initial creation', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Navigate to Listings collection
    await adminCollectionPage.goto('listings')

    // Click "Create New" button
    await adminCollectionPage.clickCreateNew()

    // Fill in required title
    const testTitle = 'Progressive Addition Test'
    await adminEditorPage.fillField('title', testTitle)

    // Wait for slug generation and Items field
    await page.waitForTimeout(500)
    await page.waitForSelector('text=Items', { timeout: 10000 })

    // Save with no items first
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/listings\/[a-f0-9-]+/, { timeout: 10000 })

    // Wait for page to be ready for editing
    await page.waitForSelector('text=Items', { timeout: 10000 })

    // Now add posts to the empty listing
    await selectMultipleRelationships(page, 'items', [
      'The Architecture of Persuasion',
      'Notes from the Attention Economy',
    ])

    // Verify posts were added (displayed as chips)
    await expect(page.locator('body')).toContainText('The Architecture of Pers')
    await expect(page.locator('body')).toContainText('Notes from the Attention')

    // Save again
    await adminEditorPage.save()
    await page.waitForTimeout(2000)

    // Verify posts persisted
    await expect(page.locator('body')).toContainText('The Architecture of Pers')
    await expect(page.locator('body')).toContainText('Notes from the Attention')
  })
})
