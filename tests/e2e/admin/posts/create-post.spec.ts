import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import {
  fillRichText,
  selectMultipleRelationships,
  expectFieldValue,
  expectVisible,
  expectUrl,
  createTestImage,
} from '../../helpers'

/**
 * CON-56: Create New Post E2E Tests
 *
 * Tests the post creation flow in the admin panel:
 * - Navigate to Posts collection and click "Create New"
 * - Title field accepts 5-200 characters (required)
 * - Slug auto-generated from title
 * - Type selector shows Essay, Decoder, Index, Field Report
 * - Summary field accepts 50-500 characters (required)
 * - Body field uses Lexical rich text editor (required)
 * - Featured image picker works
 * - Tags relationship picker works
 * - Status defaults to "draft"
 * - Save creates post successfully
 */

test.describe('Create New Post', () => {
  // Use authenticated admin session for these tests
  test.use({ storageState: STORAGE_STATE })

  test.beforeEach(async ({ adminCollectionPage }) => {
    // Navigate to Posts collection
    await adminCollectionPage.goto('posts')
  })

  test('should successfully create post with all required fields (happy path)', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Click "Create New" button
    await adminCollectionPage.clickCreateNew()

    // Verify we're on the create page
    await expectUrl(page, /\/admin\/collections\/posts\/create/)

    // Fill in title
    const testTitle = 'Test Post: The Psychology of Digital Propaganda'
    await adminEditorPage.fillField('title', testTitle)

    // Wait for slug to auto-generate
    await page.waitForTimeout(500)

    // Fill in type selector
    const typeField = page.locator('select[name="type"], [name="type"]')
    await typeField.selectOption('essay')

    // Fill in summary
    const testSummary =
      'An in-depth exploration of how digital platforms weaponize psychological mechanisms to shape public opinion and behavior patterns.'
    await adminEditorPage.fillField('summary', testSummary)

    // Fill in body using Lexical rich text editor
    const testBody =
      'This essay examines the intersection of propaganda techniques and digital technology. Modern social media platforms have created unprecedented opportunities for manipulating collective consciousness through algorithmic amplification and targeted messaging.'
    await fillRichText(page, testBody, 'body')

    // Save the post
    await adminEditorPage.save()

    // Verify success - should redirect to edit page or show success message
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify we can see the saved title
    await expectFieldValue(page, 'title', testTitle)
  })

  test('should auto-generate slug from title', async ({ adminCollectionPage, adminEditorPage, page }) => {
    // Click "Create New" button
    await adminCollectionPage.clickCreateNew()

    // Fill in title
    const testTitle = 'Understanding Mind Control Through Media'
    await adminEditorPage.fillField('title', testTitle)

    // Wait for slug auto-generation
    await page.waitForTimeout(800)

    // Verify slug was generated (should be lowercase with hyphens)
    const slugField = page.locator('input[name="slug"]')
    const slugValue = await slugField.inputValue()

    // Slug should be generated from title
    expect(slugValue).toBeTruthy()
    expect(slugValue).toMatch(/understanding-mind-control/)
    expect(slugValue).not.toContain(' ')
    expect(slugValue).toBe(slugValue.toLowerCase())
  })

  test('should allow selecting post type and persist selection', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Click "Create New" button
    await adminCollectionPage.clickCreateNew()

    // Fill in required fields first
    const testTitle = 'Decoder: Breaking Down Propaganda Techniques'
    await adminEditorPage.fillField('title', testTitle)

    // Select "decoder" type
    const typeField = page.locator('select[name="type"], [name="type"]')
    await typeField.selectOption('decoder')

    // Fill in other required fields
    const testSummary =
      'A systematic breakdown of common propaganda techniques used in contemporary media and political discourse.'
    await adminEditorPage.fillField('summary', testSummary)

    const testBody = 'This decoder analyzes key propaganda mechanisms and their real-world applications.'
    await fillRichText(page, testBody, 'body')

    // Save the post
    await adminEditorPage.save()

    // Wait for save to complete
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify the type was saved correctly
    const savedTypeField = page.locator('select[name="type"], [name="type"]')
    const savedValue = await savedTypeField.inputValue()
    expect(savedValue).toBe('decoder')
  })

  test('should allow adding tags via relationship picker', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Click "Create New" button
    await adminCollectionPage.clickCreateNew()

    // Fill in required fields
    const testTitle = 'Technology and the Conditioning of Society'
    await adminEditorPage.fillField('title', testTitle)

    const testSummary =
      'An examination of how technological systems create new forms of social conditioning and behavioral modification.'
    await adminEditorPage.fillField('summary', testSummary)

    const testBody =
      'Modern technology serves not just as a tool but as a medium for reshaping human consciousness and social relationships.'
    await fillRichText(page, testBody, 'body')

    // Select multiple tags using the relationship helper
    // Seeded tags: "Propaganda", "Technology", "Culture"
    await selectMultipleRelationships(page, 'tags', ['Propaganda', 'Technology'])

    // Save the post
    await adminEditorPage.save()

    // Wait for save to complete
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify tags are still selected after save
    const tagsContainer = page.locator('[data-field="tags"]')
    await expect(tagsContainer).toContainText('Propaganda')
    await expect(tagsContainer).toContainText('Technology')
  })

  test('should allow adding featured image via media picker', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Click "Create New" button
    await adminCollectionPage.clickCreateNew()

    // Fill in required fields
    const testTitle = 'Visual Rhetoric in Modern Propaganda'
    await adminEditorPage.fillField('title', testTitle)

    const testSummary =
      'Analyzing how visual elements are weaponized in contemporary propaganda campaigns to bypass rational thought.'
    await adminEditorPage.fillField('summary', testSummary)

    const testBody = 'Images communicate faster than words and evade critical analysis more easily.'
    await fillRichText(page, testBody, 'body')

    // Create a test image
    const testImagePath = await createTestImage('test-featured-image.png')

    // Find the featured image field and upload
    const featuredImageField = page.locator('[data-field="featuredImage"]')
    const fileInput = featuredImageField.locator('input[type="file"]')

    // Upload the image
    await fileInput.setInputFiles(testImagePath)

    // Wait for upload to complete (look for thumbnail or preview)
    await page.waitForSelector('[data-field="featuredImage"] [class*="thumbnail"], [data-field="featuredImage"] [class*="preview"]', {
      state: 'visible',
      timeout: 10000,
    })

    // Save the post
    await adminEditorPage.save()

    // Wait for save to complete
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify the image is still present after save
    const thumbnail = page.locator('[data-field="featuredImage"] [class*="thumbnail"], [data-field="featuredImage"] [class*="preview"]')
    await expectVisible(thumbnail)
  })
})
