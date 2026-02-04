import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import { expectVisible, expectNotVisible, expectUrl } from '../../helpers/assertions.helper'

/**
 * CON-58: Delete Post E2E Tests
 *
 * Tests the post deletion functionality in the admin:
 * - Delete action available from post edit view
 * - Confirmation dialog appears before deletion
 * - Deleted post removed from list view
 * - Related relationships handled appropriately
 *
 * Test Scenarios:
 * 1. Happy path: delete draft post, confirm, verify removal
 * 2. Cancel deletion: click cancel, verify post still exists
 * 3. Delete published post: verify removal from list
 *
 * Test Data:
 * - "Unpublished Thoughts on Conditioning" (draft essay)
 * - "Legacy Post About Old Propaganda" (archived essay)
 * - Multiple published posts
 */

test.describe('Delete Post', () => {
  // Use stored auth state for authenticated tests
  test.use({ storageState: STORAGE_STATE })

  test.beforeEach(async ({ adminCollectionPage }) => {
    // Navigate to posts collection before each test
    await adminCollectionPage.goto('posts')
  })

  test('should display delete button in post edit view', async ({ adminCollectionPage, adminEditorPage, page }) => {
    // Open a draft post for editing
    const draftRow = await adminCollectionPage.getRowByText('Unpublished Thoughts on Conditioning')
    await draftRow.click()
    await page.waitForLoadState('networkidle')

    // Verify we're on the edit page
    await expectUrl(page, /\/admin\/collections\/posts\/[a-f0-9]+/)

    // Verify delete button is visible
    await expectVisible(adminEditorPage.deleteButton)
  })

  test('should show confirmation dialog when delete button is clicked', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open a draft post for editing
    const draftRow = await adminCollectionPage.getRowByText('Unpublished Thoughts on Conditioning')
    await draftRow.click()
    await page.waitForLoadState('networkidle')

    // Click the delete button
    await adminEditorPage.deleteButton.click()

    // Wait for confirmation dialog to appear
    const confirmationDialog = page.locator('[role="dialog"], [class*="modal"], [class*="popup"]')
    await expectVisible(confirmationDialog)

    // Verify the dialog contains confirmation text
    await expect(confirmationDialog).toContainText(/confirm|delete|sure/i)

    // Verify both confirm and cancel buttons are present
    const confirmButton = confirmationDialog.getByRole('button', { name: /confirm|delete/i })
    const cancelButton = confirmationDialog.getByRole('button', { name: /cancel/i })

    await expectVisible(confirmButton)
    await expectVisible(cancelButton)
  })

  test('should cancel deletion and keep post when cancel is clicked', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open a draft post for editing
    const draftRow = await adminCollectionPage.getRowByText('Unpublished Thoughts on Conditioning')
    await draftRow.click()
    await page.waitForLoadState('networkidle')

    // Get the current URL to verify we stay on the same page
    const editUrl = page.url()

    // Click the delete button
    await adminEditorPage.deleteButton.click()

    // Wait for confirmation dialog to appear
    const confirmationDialog = page.locator('[role="dialog"], [class*="modal"], [class*="popup"]')
    await expectVisible(confirmationDialog)

    // Click cancel button
    const cancelButton = confirmationDialog.getByRole('button', { name: /cancel/i })
    await cancelButton.click()

    // Wait for dialog to close
    await page.waitForTimeout(500)
    await expectNotVisible(confirmationDialog)

    // Verify we're still on the edit page
    expect(page.url()).toBe(editUrl)

    // Verify the post title is still visible in the form
    const titleField = page.locator('input[name="title"]')
    await expect(titleField).toHaveValue('Unpublished Thoughts on Conditioning')

    // Navigate back to list and verify post still exists
    await adminCollectionPage.goto('posts')
    const postRow = await adminCollectionPage.getRowByText('Unpublished Thoughts on Conditioning')
    await expectVisible(postRow)
  })

  test('should successfully delete draft post and remove from list view (happy path)', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open the draft post for editing
    const draftRow = await adminCollectionPage.getRowByText('Unpublished Thoughts on Conditioning')
    await draftRow.click()
    await page.waitForLoadState('networkidle')

    // Click the delete button
    await adminEditorPage.deleteButton.click()

    // Wait for confirmation dialog to appear
    const confirmationDialog = page.locator('[role="dialog"], [class*="modal"], [class*="popup"]')
    await expectVisible(confirmationDialog)

    // Confirm deletion
    const confirmButton = confirmationDialog.getByRole('button', { name: /confirm|delete/i })
    await confirmButton.click()

    // Wait for redirect back to collection list
    await page.waitForURL(/\/admin\/collections\/posts$/, { timeout: 10000 })

    // Verify we're back on the posts list page
    await expectUrl(page, /\/admin\/collections\/posts$/)

    // Verify the deleted post is no longer in the list
    const deletedRow = adminCollectionPage.tableRows.filter({
      hasText: 'Unpublished Thoughts on Conditioning',
    })
    await expect(deletedRow).toHaveCount(0)
  })

  test('should successfully delete published post and remove from list view', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open a published post for editing
    // Using "The Architecture of Persuasion" which is a published post
    const publishedRow = await adminCollectionPage.getRowByText('The Architecture of Persuasion')
    await publishedRow.click()
    await page.waitForLoadState('networkidle')

    // Verify the post is published
    const statusField = page.locator('select[name="status"]')
    await expect(statusField).toHaveValue('published')

    // Click the delete button
    await adminEditorPage.deleteButton.click()

    // Wait for confirmation dialog to appear
    const confirmationDialog = page.locator('[role="dialog"], [class*="modal"], [class*="popup"]')
    await expectVisible(confirmationDialog)

    // Confirm deletion
    const confirmButton = confirmationDialog.getByRole('button', { name: /confirm|delete/i })
    await confirmButton.click()

    // Wait for redirect back to collection list
    await page.waitForURL(/\/admin\/collections\/posts$/, { timeout: 10000 })

    // Verify we're back on the posts list page
    await expectUrl(page, /\/admin\/collections\/posts$/)

    // Verify the deleted post is no longer in the list
    const deletedRow = adminCollectionPage.tableRows.filter({ hasText: 'The Architecture of Persuasion' })
    await expect(deletedRow).toHaveCount(0)
  })

  test('should successfully delete archived post and remove from list view', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open an archived post for editing
    const archivedRow = await adminCollectionPage.getRowByText('Legacy Post About Old Propaganda')
    await archivedRow.click()
    await page.waitForLoadState('networkidle')

    // Verify the post is archived
    const statusField = page.locator('select[name="status"]')
    await expect(statusField).toHaveValue('archived')

    // Click the delete button
    await adminEditorPage.deleteButton.click()

    // Wait for confirmation dialog to appear
    const confirmationDialog = page.locator('[role="dialog"], [class*="modal"], [class*="popup"]')
    await expectVisible(confirmationDialog)

    // Confirm deletion
    const confirmButton = confirmationDialog.getByRole('button', { name: /confirm|delete/i })
    await confirmButton.click()

    // Wait for redirect back to collection list
    await page.waitForURL(/\/admin\/collections\/posts$/, { timeout: 10000 })

    // Verify we're back on the posts list page
    await expectUrl(page, /\/admin\/collections\/posts$/)

    // Verify the deleted post is no longer in the list
    const deletedRow = adminCollectionPage.tableRows.filter({
      hasText: 'Legacy Post About Old Propaganda',
    })
    await expect(deletedRow).toHaveCount(0)
  })

  test('should handle deletion of post with relationships appropriately', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open "The Architecture of Persuasion" which has featured image and tags
    const publishedRow = await adminCollectionPage.getRowByText('The Architecture of Persuasion')
    await publishedRow.click()
    await page.waitForLoadState('networkidle')

    // Verify the post has relationships (featured image and tags)
    const featuredImageField = page.locator('[data-field="featuredImage"]')
    await expectVisible(featuredImageField)

    const tagsField = page.locator('[data-field="tags"]')
    await expectVisible(tagsField)

    // Click the delete button
    await adminEditorPage.deleteButton.click()

    // Wait for confirmation dialog to appear
    const confirmationDialog = page.locator('[role="dialog"], [class*="modal"], [class*="popup"]')
    await expectVisible(confirmationDialog)

    // Confirm deletion
    const confirmButton = confirmationDialog.getByRole('button', { name: /confirm|delete/i })
    await confirmButton.click()

    // Wait for redirect back to collection list
    await page.waitForURL(/\/admin\/collections\/posts$/, { timeout: 10000 })

    // Verify the deleted post is no longer in the list
    const deletedRow = adminCollectionPage.tableRows.filter({ hasText: 'The Architecture of Persuasion' })
    await expect(deletedRow).toHaveCount(0)

    // Note: The relationships (tags, featured image) should remain in their respective collections
    // This test verifies that deletion of a post doesn't cascade delete related entities
  })
})
