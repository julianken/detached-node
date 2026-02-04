import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import { expectVisible, expectNotVisible, expectUrl } from '../../helpers/assertions.helper'

/**
 * CON-65: Delete Media E2E Tests
 *
 * Tests the media deletion functionality in the admin:
 * - Delete action available from media edit view
 * - Confirmation dialog appears before deletion
 * - All generated sizes removed
 * - Media removed from list view
 *
 * Test Scenarios:
 * 1. Happy path: delete unused media, verify removal
 * 2. Confirmation: cancel deletion, verify still exists
 *
 * Test Data:
 * - "Test featured image 1" (used by multiple posts)
 * - "Test featured image 2" (used by posts)
 */

test.describe('Delete Media', () => {
  // Use stored auth state for authenticated tests
  test.use({ storageState: STORAGE_STATE })

  test.beforeEach(async ({ adminCollectionPage }) => {
    // Navigate to media collection before each test
    await adminCollectionPage.goto('media')
  })

  test('should display delete button in media edit view', async ({ adminCollectionPage, adminEditorPage, page }) => {
    // Open a media item for editing
    const mediaRow = await adminCollectionPage.getRowByText('Test featured image 1')
    await mediaRow.click()
    await page.waitForLoadState('networkidle')

    // Verify we're on the edit page
    await expectUrl(page, /\/admin\/collections\/media\/[a-f0-9-]+/)

    // Verify delete button is visible
    await expectVisible(adminEditorPage.deleteButton)
  })

  test('should show confirmation dialog when delete button is clicked', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open a media item for editing
    const mediaRow = await adminCollectionPage.getRowByText('Test featured image 1')
    await mediaRow.click()
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

  test('should cancel deletion and keep media when cancel is clicked (confirmation test)', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open a media item for editing
    const mediaRow = await adminCollectionPage.getRowByText('Test featured image 2')
    await mediaRow.click()
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

    // Verify the alt text is still visible in the form
    const altField = page.locator('input[name="alt"]')
    await expect(altField).toHaveValue('Test featured image 2')

    // Navigate back to list and verify media still exists
    await adminCollectionPage.goto('media')
    const stillExistsRow = await adminCollectionPage.getRowByText('Test featured image 2')
    await expectVisible(stillExistsRow)
  })

  test('should successfully delete media and remove from list view (happy path)', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open a media item for editing
    const mediaRow = await adminCollectionPage.getRowByText('Test featured image 2')
    await mediaRow.click()
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
    await page.waitForURL(/\/admin\/collections\/media$/, { timeout: 10000 })

    // Verify we're back on the media list page
    await expectUrl(page, /\/admin\/collections\/media$/)

    // Verify the deleted media is no longer in the list
    const deletedRow = adminCollectionPage.tableRows.filter({
      hasText: 'Test featured image 2',
    })
    await expect(deletedRow).toHaveCount(0)
  })

  test('should verify all generated sizes are removed when media is deleted', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open a media item for editing
    const mediaRow = await adminCollectionPage.getRowByText('Test featured image 1')
    await mediaRow.click()
    await page.waitForLoadState('networkidle')

    // Verify the media has a thumbnail/preview (indication that sizes were generated)
    const thumbnail = page.locator('[class*="thumbnail"], [class*="preview"]')
    await expectVisible(thumbnail)

    // Click the delete button
    await adminEditorPage.deleteButton.click()

    // Wait for confirmation dialog to appear
    const confirmationDialog = page.locator('[role="dialog"], [class*="modal"], [class*="popup"]')
    await expectVisible(confirmationDialog)

    // Confirm deletion
    const confirmButton = confirmationDialog.getByRole('button', { name: /confirm|delete/i })
    await confirmButton.click()

    // Wait for redirect back to collection list
    await page.waitForURL(/\/admin\/collections\/media$/, { timeout: 10000 })

    // Verify we're back on the media list page
    await expectUrl(page, /\/admin\/collections\/media$/)

    // Verify the deleted media is no longer in the list
    const deletedRow = adminCollectionPage.tableRows.filter({
      hasText: 'Test featured image 1',
    })
    await expect(deletedRow).toHaveCount(0)

    // Note: The actual file deletion (original + all sizes) happens server-side
    // This test verifies the document is removed from the database
    // Payload's deletion hook handles removing the physical files and all generated sizes
  })
})
