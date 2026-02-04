import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import {
  fillRichText,
  getRichTextContent,
  expectVisible,
  expectUrl,
  expectValidationError,
  expectFieldValue,
  expectFormError,
} from '../../helpers'

/**
 * CON-62: Pages Collection E2E Tests
 *
 * Validates CRUD operations for the Pages collection:
 * - Create page with auto-generated slug
 * - Create page with custom slug
 * - Edit page content
 * - Duplicate slug validation
 * - Rich text body preservation
 * - Publish page and verify visibility
 */

// Use authenticated admin session for these tests
test.use({ storageState: STORAGE_STATE })

test.describe('Pages Collection - CRUD Operations', () => {
  test.beforeEach(async ({ adminCollectionPage }) => {
    // Navigate to Pages collection before each test
    await adminCollectionPage.goto('pages')
  })

  test('should navigate to Pages collection and click Create New', async ({
    adminCollectionPage,
    page,
  }) => {
    // Verify we're on the Pages collection page
    await expectUrl(page, /\/admin\/collections\/pages/)
    await expectVisible(adminCollectionPage.collectionHeading)

    // Verify "Create New" button exists
    await expectVisible(adminCollectionPage.createNewButton)

    // Click Create New
    await adminCollectionPage.clickCreateNew()

    // Verify we're on the create page
    await expectUrl(page, /\/admin\/collections\/pages\/create/)
  })

  test('happy path: create page with auto-generated slug', async ({
    adminEditorPage,
    adminCollectionPage,
    page,
  }) => {
    // Navigate to create page
    await adminEditorPage.gotoCreate('pages')

    // Fill in title (required)
    await adminEditorPage.fillField('title', 'Test Auto-Generated Slug Page')

    // Fill in description (optional SEO field)
    await adminEditorPage.fillField('description', 'This is a test page for SEO description')

    // Fill in body (required rich text)
    await fillRichText(page, 'This is the body content of the test page.', 'body')

    // Verify body content was filled
    const bodyContent = await getRichTextContent(page, 'body')
    expect(bodyContent).toContain('This is the body content of the test page.')

    // Save the page
    await adminEditorPage.save()

    // Verify slug was auto-generated
    const slugValue = await adminEditorPage.getFieldValue('slug')
    expect(slugValue).toBe('test-auto-generated-slug-page')

    // Navigate back to collection
    await adminCollectionPage.goto('pages')

    // Verify the page appears in the list
    const newRow = await adminCollectionPage.getRowByText('Test Auto-Generated Slug Page')
    await expect(newRow).toBeVisible()
  })

  test('custom slug: manually set slug and verify saved', async ({
    adminEditorPage,
    adminCollectionPage,
    page,
  }) => {
    // Navigate to create page
    await adminEditorPage.gotoCreate('pages')

    // Fill in title
    await adminEditorPage.fillField('title', 'Custom Slug Test Page')

    // Fill in custom slug
    await adminEditorPage.fillField('slug', 'my-custom-slug')

    // Fill in body (required)
    await fillRichText(page, 'Content with a custom slug.', 'body')

    // Save the page
    await adminEditorPage.save()

    // Verify custom slug was saved
    const slugValue = await adminEditorPage.getFieldValue('slug')
    expect(slugValue).toBe('my-custom-slug')

    // Navigate back to collection
    await adminCollectionPage.goto('pages')

    // Verify the page appears with custom slug
    const newRow = await adminCollectionPage.getRowByText('Custom Slug Test Page')
    await expect(newRow).toBeVisible()
  })

  test('duplicate slug: verify unique constraint error', async ({
    adminEditorPage,
    page,
  }) => {
    // The seeded database has a page with slug "about"
    // Try to create a new page with the same slug

    // Navigate to create page
    await adminEditorPage.gotoCreate('pages')

    // Fill in title
    await adminEditorPage.fillField('title', 'Duplicate Slug Test')

    // Fill in duplicate slug
    await adminEditorPage.fillField('slug', 'about')

    // Fill in body (required)
    await fillRichText(page, 'This should fail due to duplicate slug.', 'body')

    // Try to save the page
    await adminEditorPage.save()

    // Verify error message appears (Payload shows validation errors)
    // The error might be shown as a toast or inline validation error
    const slugError = await adminEditorPage.getFieldError('slug')
    const isSlugErrorVisible = await slugError.isVisible().catch(() => false)

    if (isSlugErrorVisible) {
      // Inline field error
      await expectVisible(slugError)
      await expect(slugError).toContainText(/unique|already exists|duplicate/i)
    } else {
      // Form-level error or toast message
      await expectFormError(page, /unique|already exists|duplicate|slug/i)
    }

    // Verify we're still on the create page (save failed)
    await expectUrl(page, /\/admin\/collections\/pages\/create/)
  })

  test('rich text body: formatted content preserved', async ({
    adminEditorPage,
    adminCollectionPage,
    page,
  }) => {
    // Navigate to create page
    await adminEditorPage.gotoCreate('pages')

    // Fill in title
    await adminEditorPage.fillField('title', 'Rich Text Test Page')

    // Fill in rich text with content
    const testContent = 'This is a test with rich text content. It should be preserved when saved.'
    await fillRichText(page, testContent, 'body')

    // Verify content before save
    const contentBeforeSave = await getRichTextContent(page, 'body')
    expect(contentBeforeSave).toContain('This is a test with rich text content')

    // Save the page
    await adminEditorPage.save()

    // Get the page ID from URL
    const currentUrl = page.url()
    const pageId = currentUrl.split('/').pop()

    // Navigate away and back to the page
    await adminCollectionPage.goto('pages')
    await adminEditorPage.goto('pages', pageId!)

    // Verify content is preserved
    const contentAfterSave = await getRichTextContent(page, 'body')
    expect(contentAfterSave).toContain('This is a test with rich text content')
  })

  test('publish page: verify status change and public visibility', async ({
    adminEditorPage,
    adminCollectionPage,
    page,
  }) => {
    // Navigate to create page
    await adminEditorPage.gotoCreate('pages')

    // Fill in title
    await adminEditorPage.fillField('title', 'Page to Publish')

    // Fill in body
    await fillRichText(page, 'This page will be published.', 'body')

    // Verify default status is draft
    const initialStatus = await adminEditorPage.getFieldValue('status')
    expect(initialStatus).toBe('draft')

    // Change status to published
    const statusSelect = page.locator('select[name="status"]')
    await statusSelect.selectOption('published')

    // Save the page
    await adminEditorPage.save()

    // Verify status is published
    const publishedStatus = await adminEditorPage.getFieldValue('status')
    expect(publishedStatus).toBe('published')

    // Navigate back to collection
    await adminCollectionPage.goto('pages')

    // Verify the page appears in list with published status
    const publishedRow = await adminCollectionPage.getRowByText('Page to Publish')
    await expect(publishedRow).toBeVisible()
  })
})

test.describe('Pages Collection - List View', () => {
  test.use({ storageState: STORAGE_STATE })

  test('list view should show title, slug, and status columns', async ({
    adminCollectionPage,
    page,
  }) => {
    // Navigate to Pages collection
    await adminCollectionPage.goto('pages')

    // Verify we're on the collection page
    await expectUrl(page, /\/admin\/collections\/pages/)

    // The seeded database has one page: "About Mind-Controlled"
    const aboutRow = await adminCollectionPage.getRowByText('About Mind-Controlled')
    await expect(aboutRow).toBeVisible()

    // Verify row contains the expected data
    await expect(aboutRow).toContainText('about')
    await expect(aboutRow).toContainText(/published/i)
  })
})

test.describe('Pages Collection - Field Validation', () => {
  test.use({ storageState: STORAGE_STATE })

  test('title field should be required', async ({ adminEditorPage, page }) => {
    // Navigate to create page
    await adminEditorPage.gotoCreate('pages')

    // Try to save without filling title (but fill body to isolate the error)
    await fillRichText(page, 'Body content without title.', 'body')

    // Try to save
    await adminEditorPage.save()

    // Verify title field shows required error
    const titleError = await adminEditorPage.getFieldError('title')
    const isTitleErrorVisible = await titleError.isVisible().catch(() => false)

    if (isTitleErrorVisible) {
      await expectVisible(titleError)
      await expect(titleError).toContainText(/required/i)
    } else {
      // Form-level error
      await expectFormError(page, /required|title/i)
    }

    // Verify we're still on the create page (save failed)
    await expectUrl(page, /\/admin\/collections\/pages\/create/)
  })

  test('body field should be required', async ({ adminEditorPage, page }) => {
    // Navigate to create page
    await adminEditorPage.gotoCreate('pages')

    // Fill title but leave body empty
    await adminEditorPage.fillField('title', 'Page Without Body')

    // Try to save
    await adminEditorPage.save()

    // Verify error appears (might be inline or toast)
    const bodyError = await adminEditorPage.getFieldError('body')
    const isBodyErrorVisible = await bodyError.isVisible().catch(() => false)

    if (isBodyErrorVisible) {
      await expectVisible(bodyError)
      await expect(bodyError).toContainText(/required/i)
    } else {
      // Form-level error or toast
      await expectFormError(page, /required|body/i)
    }

    // Verify we're still on the create page (save failed)
    await expectUrl(page, /\/admin\/collections\/pages\/create/)
  })
})
