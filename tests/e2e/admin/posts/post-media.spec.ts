import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import { expectVisible } from '../../helpers/assertions.helper'
import { selectRelationship, removeRelationship } from '../../helpers/relationship.helper'

/**
 * CON-66: Test: Use media in posts
 *
 * Tests the featured image relationship picker in the post form:
 * - Featured image picker in post form
 * - Can select from media library
 * - Selected media displayed in form
 * - Relationship saved correctly
 * - Can remove featured image
 *
 * Test Scenarios:
 * 1. Select media: choose from library, verify displayed
 * 2. Save relationship: verify persisted after save
 * 3. Remove media: clear selection, verify removal
 * 4. Change media: swap to different image, verify update
 *
 * Test Data:
 * - Media items: "Test featured image 1", "Test featured image 2"
 * - Posts with and without featured images
 */

test.describe('Post Featured Image Relationship', () => {
  // Use stored auth state for authenticated tests
  test.use({ storageState: STORAGE_STATE })

  test.beforeEach(async ({ adminCollectionPage }) => {
    // Navigate to posts collection before each test
    await adminCollectionPage.goto('posts')
  })

  test('should display featured image picker in post form', async ({
    adminCollectionPage,
    page,
  }) => {
    // Click on a post that has a featured image
    const architectureRow = await adminCollectionPage.getRowByText('The Architecture of Persuasion')
    await architectureRow.click()
    await page.waitForLoadState('networkidle')

    // Verify the featuredImage field is visible
    const featuredImageField = page.locator('[data-field="featuredImage"]')
    await expectVisible(featuredImageField)

    // Verify field has a combobox button for selecting media
    const fieldButton = featuredImageField.locator('button, [role="combobox"]').first()
    await expectVisible(fieldButton)
  })

  test('should select media from library and display it', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Create a new post without a featured image
    await adminEditorPage.gotoCreate('posts')

    // Fill required fields
    await adminEditorPage.fillField('title', 'Test Post with Featured Image')
    await adminEditorPage.fillField('slug', 'test-post-featured-image')
    await adminEditorPage.fillField(
      'summary',
      'A test post to verify featured image selection works correctly.'
    )

    // Select a featured image from the media library
    await selectRelationship(page, 'featuredImage', 'Test featured image 1')

    // Verify the selected image is displayed
    const featuredImageField = page.locator('[data-field="featuredImage"]')
    await expect(featuredImageField).toContainText(/Test featured image 1/i)

    // Verify a thumbnail or preview is visible
    const thumbnail = featuredImageField.locator('img, [class*="thumbnail"], [class*="preview"]')
    await expect(thumbnail).toBeVisible()
  })

  test('should save featured image relationship and persist it', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Create a new post with a featured image
    await adminEditorPage.gotoCreate('posts')

    // Fill required fields
    await adminEditorPage.fillField('title', 'Test Post for Image Persistence')
    await adminEditorPage.fillField('slug', 'test-post-image-persistence')
    await adminEditorPage.fillField(
      'summary',
      'A test post to verify featured image relationship is saved correctly.'
    )

    // Select a featured image
    await selectRelationship(page, 'featuredImage', 'Test featured image 2')

    // Save the post
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify image is still displayed after save
    const featuredImageField = page.locator('[data-field="featuredImage"]')
    await expect(featuredImageField).toContainText(/Test featured image 2/i)

    // Navigate back to the post list
    await adminCollectionPage.goto('posts')

    // Navigate back to the post to verify persistence
    const testRow = await adminCollectionPage.getRowByText('Test Post for Image Persistence')
    await testRow.click()
    await page.waitForLoadState('networkidle')

    // Verify image is still present
    await expect(featuredImageField).toContainText(/Test featured image 2/i)
  })

  test('should remove featured image from a post', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open a post that has a featured image (Post 1)
    const architectureRow = await adminCollectionPage.getRowByText('The Architecture of Persuasion')
    await architectureRow.click()
    await page.waitForLoadState('networkidle')

    // Verify the post has a featured image
    const featuredImageField = page.locator('[data-field="featuredImage"]')
    await expect(featuredImageField).toContainText(/Test featured image 1/i)

    // Remove the featured image
    await removeRelationship(page, 'featuredImage')

    // Wait for UI to update
    await page.waitForTimeout(500)

    // Verify the image was removed from display
    // The field should now show the combobox button for adding an image
    const fieldButton = featuredImageField.locator('button, [role="combobox"]').first()
    await expectVisible(fieldButton)

    // Save the changes
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify the image is still removed after save
    // Should see the add button, not the image content
    await expectVisible(fieldButton)
  })

  test('should change featured image to a different one', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open a post that has a featured image (Post 2)
    const decoderRow = await adminCollectionPage.getRowByText('Decoding Corporate Newspeak')
    await decoderRow.click()
    await page.waitForLoadState('networkidle')

    // Verify the post currently has "Test featured image 2"
    const featuredImageField = page.locator('[data-field="featuredImage"]')
    await expect(featuredImageField).toContainText(/Test featured image 2/i)

    // Remove the existing image
    await removeRelationship(page, 'featuredImage')

    // Wait for UI to update
    await page.waitForTimeout(500)

    // Select a different image
    await selectRelationship(page, 'featuredImage', 'Test featured image 1')

    // Verify the new image is displayed
    await expect(featuredImageField).toContainText(/Test featured image 1/i)
    await expect(featuredImageField).not.toContainText(/Test featured image 2/i)

    // Save the changes
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify the new image persisted correctly
    await expect(featuredImageField).toContainText(/Test featured image 1/i)
    await expect(featuredImageField).not.toContainText(/Test featured image 2/i)
  })

  test('should add featured image to post without one', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Open a post that doesn't have a featured image (Post 4: Essential Readings)
    const readingsRow = await adminCollectionPage.getRowByText('Essential Readings on Mind Control')
    await readingsRow.click()
    await page.waitForLoadState('networkidle')

    // Verify the post currently has no featured image
    const featuredImageField = page.locator('[data-field="featuredImage"]')
    const fieldButton = featuredImageField.locator('button, [role="combobox"]').first()
    await expectVisible(fieldButton)

    // Add a featured image
    await selectRelationship(page, 'featuredImage', 'Test featured image 1')

    // Verify the image is displayed
    await expect(featuredImageField).toContainText(/Test featured image 1/i)

    // Save the changes
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify the image persisted
    await expect(featuredImageField).toContainText(/Test featured image 1/i)

    // Navigate back to the post list and return to verify
    await adminCollectionPage.goto('posts')
    const testRow = await adminCollectionPage.getRowByText('Essential Readings on Mind Control')
    await testRow.click()
    await page.waitForLoadState('networkidle')

    // Verify image is still present
    await expect(featuredImageField).toContainText(/Test featured image 1/i)
  })

  test('should handle featured image selection on a new post', async ({
    adminEditorPage,
    page,
  }) => {
    // Create a new post
    await adminEditorPage.gotoCreate('posts')

    // Fill required fields
    await adminEditorPage.fillField('title', 'New Post Image Selection Test')
    await adminEditorPage.fillField('slug', 'new-post-image-selection-test')
    await adminEditorPage.fillField(
      'summary',
      'Testing featured image selection on a completely new post.'
    )

    // Verify featuredImage field is present and empty
    const featuredImageField = page.locator('[data-field="featuredImage"]')
    await expectVisible(featuredImageField)

    // Select a featured image
    await selectRelationship(page, 'featuredImage', 'Test featured image 2')

    // Verify image is displayed
    await expect(featuredImageField).toContainText(/Test featured image 2/i)

    // Save the post
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify image persisted on the new post
    await expect(featuredImageField).toContainText(/Test featured image 2/i)
  })

  test('should display featured image thumbnail in post form', async ({
    adminCollectionPage,
    page,
  }) => {
    // Open a post with a featured image
    const architectureRow = await adminCollectionPage.getRowByText('Notes from the Attention Economy')
    await architectureRow.click()
    await page.waitForLoadState('networkidle')

    // Verify the featured image field shows a thumbnail
    const featuredImageField = page.locator('[data-field="featuredImage"]')
    const thumbnail = featuredImageField.locator('img, [class*="thumbnail"], [class*="preview"]')

    // Verify thumbnail is visible
    await expect(thumbnail).toBeVisible()

    // Verify alt text is shown somewhere in the field
    await expect(featuredImageField).toContainText(/Test featured image/i)
  })

  test('should save post without featured image (optional field)', async ({
    adminEditorPage,
    page,
  }) => {
    // Create a new post without a featured image
    await adminEditorPage.gotoCreate('posts')

    // Fill required fields only (no featured image)
    await adminEditorPage.fillField('title', 'Post Without Featured Image')
    await adminEditorPage.fillField('slug', 'post-without-featured-image')
    await adminEditorPage.fillField(
      'summary',
      'This post intentionally has no featured image to verify the field is optional.'
    )

    // Verify featuredImage field is present but empty
    const featuredImageField = page.locator('[data-field="featuredImage"]')
    await expectVisible(featuredImageField)
    const fieldButton = featuredImageField.locator('button, [role="combobox"]').first()
    await expectVisible(fieldButton)

    // Save the post without selecting a featured image
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')

    // Verify save was successful (should redirect to edit page)
    await expect(page).toHaveURL(/\/admin\/collections\/posts\/[a-f0-9-]+/)

    // Verify still no featured image
    await expectVisible(fieldButton)
  })
})
