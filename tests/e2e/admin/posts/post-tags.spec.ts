import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import { expectVisible } from '../../helpers/assertions.helper'
import {
  selectMultipleRelationships,
  getSelectedRelationships,
  removeRelationship,
  clearAllRelationships,
} from '../../helpers/relationship.helper'

/**
 * CON-68: Test: Use tags in posts
 *
 * Tests the tags relationship picker in the post form:
 * - Tags relationship picker in post form
 * - Can select multiple tags
 * - Selected tags displayed
 * - Relationships saved correctly
 * - Can remove tags
 *
 * Test Scenarios:
 * 1. Select tags: choose multiple, verify displayed
 * 2. Save relationships: verify persisted
 * 3. Remove tags: deselect, verify removal
 * 4. Add new tags: select different tags, verify update
 *
 * Test Data:
 * - Tags: "Propaganda", "Technology", "Culture"
 * - Posts with tags already assigned for testing removal
 */

test.describe('Post Tags Relationship', () => {
  // Use stored auth state for authenticated tests
  test.use({ storageState: STORAGE_STATE })

  test.beforeEach(async ({ adminCollectionPage }) => {
    // Navigate to posts collection before each test
    await adminCollectionPage.goto('posts')
  })

  test('should display tags relationship picker in post form', async ({
    adminCollectionPage,
    page,
  }) => {
    // Click on a post that has tags
    const architectureRow = await adminCollectionPage.getRowByText('The Architecture of Persuasion')
    await architectureRow.click()
    await page.waitForLoadState('networkidle')

    // Verify the tags field is visible
    const tagsField = page.locator('[data-field="tags"]')
    await expectVisible(tagsField)

    // Verify field has a combobox button for selecting tags
    const fieldButton = tagsField.locator('button, [role="combobox"]').first()
    await expectVisible(fieldButton)
  })

  test('should select multiple tags and display them', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Create a new post without tags
    await adminEditorPage.gotoCreate('posts')

    // Fill required fields
    await adminEditorPage.fillField('title', 'Test Post with Multiple Tags')
    await adminEditorPage.fillField('slug', 'test-post-multiple-tags')
    await adminEditorPage.fillField(
      'summary',
      'A test post to verify multiple tag selection works correctly.'
    )

    // Select multiple tags
    await selectMultipleRelationships(page, 'tags', ['Propaganda', 'Technology'])

    // Verify the selected tags are displayed
    const tagsField = page.locator('[data-field="tags"]')
    await expect(tagsField).toContainText(/Propaganda/i)
    await expect(tagsField).toContainText(/Technology/i)

    // Verify we have 2 tags selected
    const selectedTags = await getSelectedRelationships(page, 'tags')
    expect(selectedTags.length).toBeGreaterThanOrEqual(2)
  })

  test('should save tag relationships and persist them', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Create a new post with tags
    await adminEditorPage.gotoCreate('posts')

    // Fill required fields
    await adminEditorPage.fillField('title', 'Test Post for Tag Persistence')
    await adminEditorPage.fillField('slug', 'test-post-tag-persistence')
    await adminEditorPage.fillField(
      'summary',
      'A test post to verify tag relationships are saved correctly.'
    )

    // Select multiple tags
    await selectMultipleRelationships(page, 'tags', ['Culture', 'Technology'])

    // Save the post
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify tags are still displayed after save
    const tagsField = page.locator('[data-field="tags"]')
    await expect(tagsField).toContainText(/Culture/i)
    await expect(tagsField).toContainText(/Technology/i)

    // Navigate back to the post list
    await adminCollectionPage.goto('posts')

    // Navigate back to the post to verify persistence
    const testRow = await adminCollectionPage.getRowByText('Test Post for Tag Persistence')
    await testRow.click()
    await page.waitForLoadState('networkidle')

    // Verify tags are still present
    await expect(tagsField).toContainText(/Culture/i)
    await expect(tagsField).toContainText(/Technology/i)
  })

  test('should remove individual tags from a post', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open a post that has multiple tags (Post 1: Propaganda, Culture)
    const architectureRow = await adminCollectionPage.getRowByText('The Architecture of Persuasion')
    await architectureRow.click()
    await page.waitForLoadState('networkidle')

    // Verify the post has tags
    const tagsField = page.locator('[data-field="tags"]')
    await expect(tagsField).toContainText(/Propaganda/i)
    await expect(tagsField).toContainText(/Culture/i)

    // Remove one tag
    await removeRelationship(page, 'tags', 'Propaganda')

    // Verify the tag was removed from display
    await expect(tagsField).not.toContainText(/Propaganda/i)
    await expect(tagsField).toContainText(/Culture/i)

    // Save the changes
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify the tag is still removed after save
    await expect(tagsField).not.toContainText(/Propaganda/i)
    await expect(tagsField).toContainText(/Culture/i)
  })

  test('should clear all tags from a post', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open a post that has multiple tags (Post 2: Propaganda, Technology)
    const decoderRow = await adminCollectionPage.getRowByText('Decoding Corporate Newspeak')
    await decoderRow.click()
    await page.waitForLoadState('networkidle')

    // Verify the post has tags
    const tagsField = page.locator('[data-field="tags"]')
    await expect(tagsField).toContainText(/Propaganda/i)
    await expect(tagsField).toContainText(/Technology/i)

    // Remove all tags
    await clearAllRelationships(page, 'tags')

    // Wait a moment for UI to update
    await page.waitForTimeout(500)

    // Save the changes
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify no tags are displayed
    // The field should now show the combobox button for adding tags
    const fieldButton = tagsField.locator('button, [role="combobox"]').first()
    await expectVisible(fieldButton)
  })

  test('should add different tags to replace existing ones', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open a post that has one tag (Post 4: Propaganda)
    const readingsRow = await adminCollectionPage.getRowByText('Essential Readings on Mind Control')
    await readingsRow.click()
    await page.waitForLoadState('networkidle')

    // Verify the post currently has Propaganda tag
    const tagsField = page.locator('[data-field="tags"]')
    await expect(tagsField).toContainText(/Propaganda/i)

    // Remove the existing tag
    await removeRelationship(page, 'tags', 'Propaganda')

    // Add different tags
    await selectMultipleRelationships(page, 'tags', ['Culture', 'Technology'])

    // Verify the new tags are displayed
    await expect(tagsField).toContainText(/Culture/i)
    await expect(tagsField).toContainText(/Technology/i)
    await expect(tagsField).not.toContainText(/Propaganda/i)

    // Save the changes
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify the tags persisted correctly
    await expect(tagsField).toContainText(/Culture/i)
    await expect(tagsField).toContainText(/Technology/i)
    await expect(tagsField).not.toContainText(/Propaganda/i)
  })

  test('should select all three available tags on a post', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open a post with only one tag (Post 5: Culture)
    const unpublishedRow = await adminCollectionPage.getRowByText(
      'Unpublished Thoughts on Conditioning'
    )
    await unpublishedRow.click()
    await page.waitForLoadState('networkidle')

    // Add the other two tags
    await selectMultipleRelationships(page, 'tags', ['Propaganda', 'Technology'])

    // Verify all three tags are displayed
    const tagsField = page.locator('[data-field="tags"]')
    await expect(tagsField).toContainText(/Propaganda/i)
    await expect(tagsField).toContainText(/Technology/i)
    await expect(tagsField).toContainText(/Culture/i)

    // Save the changes
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify all three tags persisted
    await expect(tagsField).toContainText(/Propaganda/i)
    await expect(tagsField).toContainText(/Technology/i)
    await expect(tagsField).toContainText(/Culture/i)
  })

  test('should handle tag selection on a new post without errors', async ({
    adminEditorPage,
    page,
  }) => {
    // Create a new post
    await adminEditorPage.gotoCreate('posts')

    // Fill required fields
    await adminEditorPage.fillField('title', 'New Post Tag Selection Test')
    await adminEditorPage.fillField('slug', 'new-post-tag-selection-test')
    await adminEditorPage.fillField(
      'summary',
      'Testing tag selection on a completely new post.'
    )

    // Verify tags field is present and empty
    const tagsField = page.locator('[data-field="tags"]')
    await expectVisible(tagsField)

    // Select tags
    await selectMultipleRelationships(page, 'tags', ['Propaganda'])

    // Verify tag is displayed
    await expect(tagsField).toContainText(/Propaganda/i)

    // Add another tag
    await selectMultipleRelationships(page, 'tags', ['Culture'])

    // Verify both tags are displayed
    await expect(tagsField).toContainText(/Propaganda/i)
    await expect(tagsField).toContainText(/Culture/i)

    // Save the post
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify tags persisted on the new post
    await expect(tagsField).toContainText(/Propaganda/i)
    await expect(tagsField).toContainText(/Culture/i)
  })
})
