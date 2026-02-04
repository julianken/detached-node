import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import {
  expectVisible,
  expectFieldValue,
  expectSuccess,
  expectFieldChecked,
  expectFieldUnchecked,
} from '../../helpers/assertions.helper'
import { removeRelationship, selectRelationship } from '../../helpers/relationship.helper'

/**
 * CON-57: Edit Existing Post E2E Tests
 *
 * Tests the ability to edit existing posts in the admin:
 * - Post list view shows title, type, status, publishedAt
 * - Clicking a post opens the edit form with data populated
 * - All fields are editable
 * - Slug can be manually changed (unique constraint)
 * - Save updates the post successfully
 * - Changes are reflected in the list view
 *
 * Test Data:
 * - Published post: "The Architecture of Persuasion" (essay, published, featured)
 * - Draft post: "Unpublished Thoughts on Conditioning" (essay, draft)
 */

test.describe('Edit Existing Post', () => {
  // Use stored auth state for authenticated tests
  test.use({ storageState: STORAGE_STATE })

  test.beforeEach(async ({ adminCollectionPage }) => {
    // Navigate to posts collection before each test
    await adminCollectionPage.goto('posts')
  })

  test('should display post list with title, type, status, and publishedAt columns', async ({
    adminCollectionPage,
  }) => {
    // Verify the collection heading
    await expectVisible(adminCollectionPage.collectionHeading)
    await expect(adminCollectionPage.collectionHeading).toHaveText(/posts/i)

    // Verify we have posts in the list
    const rowCount = await adminCollectionPage.getRowCount()
    expect(rowCount).toBeGreaterThan(0)

    // Verify we can see the published post in the list
    const architectureRow = await adminCollectionPage.getRowByText('The Architecture of Persuasion')
    await expectVisible(architectureRow)

    // Verify the row contains type and status information
    await expect(architectureRow).toContainText(/essay/i)
    await expect(architectureRow).toContainText(/published/i)
  })

  test('should open edit form with populated data when clicking a post', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Click on the published post
    const architectureRow = await adminCollectionPage.getRowByText('The Architecture of Persuasion')
    await architectureRow.click()
    await page.waitForLoadState('networkidle')

    // Verify we're on the edit page (URL should contain the collection and document ID)
    await expect(page).toHaveURL(/\/admin\/collections\/posts\/[a-f0-9]+/)

    // Verify form fields are populated with existing data
    await expectFieldValue(page, 'title', 'The Architecture of Persuasion')
    await expectFieldValue(page, 'slug', 'architecture-of-persuasion')

    // Verify summary is populated
    const summary = await adminEditorPage.getFieldValue('summary')
    expect(summary).toContain('exploration of how modern persuasion')

    // Verify sidebar fields
    // Type should be 'essay'
    const typeField = page.locator('select[name="type"]')
    await expect(typeField).toHaveValue('essay')

    // Status should be 'published'
    const statusField = page.locator('select[name="status"]')
    await expect(statusField).toHaveValue('published')

    // Featured should be checked
    await expectFieldChecked(page, 'featured')

    // Save button should be visible
    await expectVisible(adminEditorPage.saveButton)
  })

  test('should successfully edit title and summary and save changes', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open the draft post for editing
    const draftRow = await adminCollectionPage.getRowByText('Unpublished Thoughts on Conditioning')
    await draftRow.click()
    await page.waitForLoadState('networkidle')

    // Edit the title
    const newTitle = 'Updated: Thoughts on Modern Conditioning'
    await adminEditorPage.fillField('title', newTitle)

    // Edit the summary
    const newSummary =
      'A comprehensive examination of behavioral conditioning mechanisms in contemporary society, exploring how subtle environmental cues shape our actions without conscious awareness.'
    await adminEditorPage.fillField('summary', newSummary)

    // Save the changes
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')

    // Wait for success indicator (either a toast or staying on the edit page without errors)
    // After save, Payload might show a success message or just reload the page
    await page.waitForTimeout(1000)

    // Verify changes persisted by checking field values
    await expectFieldValue(page, 'title', newTitle)
    await expectFieldValue(page, 'summary', newSummary)

    // Navigate back to the list
    await adminCollectionPage.goto('posts')

    // Verify the updated title appears in the list
    const updatedRow = await adminCollectionPage.getRowByText(newTitle)
    await expectVisible(updatedRow)
  })

  test('should change status from draft to published and verify update', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open the draft post
    const draftRow = await adminCollectionPage.getRowByText('Unpublished Thoughts on Conditioning')
    await draftRow.click()
    await page.waitForLoadState('networkidle')

    // Verify current status is draft
    const statusField = page.locator('select[name="status"]')
    await expect(statusField).toHaveValue('draft')

    // Change status to published
    await statusField.selectOption('published')

    // Set a published date
    const publishedAtField = page.locator('input[name="publishedAt"]')
    await publishedAtField.fill('2026-02-03T12:00')

    // Save the changes
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify status changed
    await expect(statusField).toHaveValue('published')

    // Navigate back to list
    await adminCollectionPage.goto('posts')

    // Verify the post now shows as published in the list
    const updatedRow = await adminCollectionPage.getRowByText('Unpublished Thoughts on Conditioning')
    await expect(updatedRow).toContainText(/published/i)
  })

  test('should update slug to new unique value and verify change', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open the draft post
    const draftRow = await adminCollectionPage.getRowByText('Unpublished Thoughts on Conditioning')
    await draftRow.click()
    await page.waitForLoadState('networkidle')

    // Verify current slug
    await expectFieldValue(page, 'slug', 'unpublished-thoughts-conditioning')

    // Change slug to a new unique value
    const newSlug = 'modern-conditioning-analysis'
    await adminEditorPage.fillField('slug', newSlug)

    // Save the changes
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify slug was updated
    await expectFieldValue(page, 'slug', newSlug)

    // Verify URL includes the new ID (the URL uses ID, not slug)
    await expect(page).toHaveURL(/\/admin\/collections\/posts\/[a-f0-9]+/)
  })

  test('should add and remove featured image relationship', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open the draft post (which doesn't have a featured image)
    const draftRow = await adminCollectionPage.getRowByText('Unpublished Thoughts on Conditioning')
    await draftRow.click()
    await page.waitForLoadState('networkidle')

    // Add a featured image by selecting from existing media
    await selectRelationship(page, 'featuredImage', 'Test featured image 1')

    // Save the changes
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify the relationship was saved
    // The field should now show the selected image
    const featuredImageField = page.locator('[data-field="featuredImage"]')
    await expect(featuredImageField).toContainText(/Test featured image 1/i)

    // Now remove the featured image
    await removeRelationship(page, 'featuredImage')

    // Save the changes
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify the relationship was removed
    // The field should no longer show an image selection
    const fieldButton = featuredImageField.locator('button, [role="combobox"]').first()
    await expectVisible(fieldButton)
  })

  test('should toggle featured checkbox and verify change', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open the published post (which is featured)
    const publishedRow = await adminCollectionPage.getRowByText('The Architecture of Persuasion')
    await publishedRow.click()
    await page.waitForLoadState('networkidle')

    // Verify featured is currently checked
    await expectFieldChecked(page, 'featured')

    // Uncheck featured
    await adminEditorPage.toggleCheckbox('featured')

    // Save the changes
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify featured is now unchecked
    await expectFieldUnchecked(page, 'featured')

    // Check it again
    await adminEditorPage.toggleCheckbox('featured')

    // Save again
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify it's checked again
    await expectFieldChecked(page, 'featured')
  })

  test('should edit post type and verify change', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open the draft post
    const draftRow = await adminCollectionPage.getRowByText('Unpublished Thoughts on Conditioning')
    await draftRow.click()
    await page.waitForLoadState('networkidle')

    // Verify current type is essay
    const typeField = page.locator('select[name="type"]')
    await expect(typeField).toHaveValue('essay')

    // Change type to field-report
    await typeField.selectOption('field-report')

    // Save the changes
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify type changed
    await expect(typeField).toHaveValue('field-report')

    // Navigate back to list
    await adminCollectionPage.goto('posts')

    // Verify the post now shows the new type in the list
    const updatedRow = await adminCollectionPage.getRowByText('Unpublished Thoughts on Conditioning')
    await expect(updatedRow).toContainText(/field-report|Field Report/i)
  })
})
