import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import {
  expectVisible,
  expectUrl,
  expectFieldValue,
  expectFormError,
} from '../../helpers'

/**
 * CON-67: Tags Collection E2E Tests
 *
 * Validates CRUD operations for the Tags collection:
 * - Navigate to Tags collection and create new
 * - Name field required and unique
 * - Slug auto-generated from name
 * - Slug must be unique
 * - Description field optional
 * - Tags appear in post relationship picker
 */

// Use authenticated admin session for these tests
test.use({ storageState: STORAGE_STATE })

test.describe('Tags Collection - CRUD Operations', () => {
  test.beforeEach(async ({ adminCollectionPage }) => {
    // Navigate to Tags collection before each test
    await adminCollectionPage.goto('tags')
  })

  test('should navigate to Tags collection and click Create New', async ({
    adminCollectionPage,
    page,
  }) => {
    // Verify we're on the Tags collection page
    await expectUrl(page, /\/admin\/collections\/tags/)
    await expectVisible(adminCollectionPage.collectionHeading)

    // Verify "Create New" button exists
    await expectVisible(adminCollectionPage.createNewButton)

    // Click Create New
    await adminCollectionPage.clickCreateNew()

    // Verify we're on the create page
    await expectUrl(page, /\/admin\/collections\/tags\/create/)
  })

  test('happy path: create tag with auto-generated slug', async ({
    adminEditorPage,
    adminCollectionPage,
    page,
  }) => {
    // Navigate to create tag
    await adminEditorPage.gotoCreate('tags')

    // Fill in name (required)
    const testName = 'Test Auto-Generated Slug Tag'
    await adminEditorPage.fillField('name', testName)

    // Wait for slug to auto-generate
    await page.waitForTimeout(500)

    // Verify slug was auto-generated from name
    const slugValue = await adminEditorPage.getFieldValue('slug')
    expect(slugValue).toBe('test-auto-generated-slug-tag')
    expect(slugValue).not.toContain(' ')
    expect(slugValue).toBe(slugValue.toLowerCase())

    // Save the tag
    await adminEditorPage.save()

    // Verify we're on the edit page (save succeeded)
    await page.waitForURL(/\/admin\/collections\/tags\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify the name and slug are saved
    await expectFieldValue(page, 'name', testName)
    await expectFieldValue(page, 'slug', 'test-auto-generated-slug-tag')

    // Navigate back to collection
    await adminCollectionPage.goto('tags')

    // Verify the tag appears in the list
    const newRow = await adminCollectionPage.getRowByText('Test Auto-Generated Slug Tag')
    await expect(newRow).toBeVisible()
  })

  test('custom slug: manually set slug and verify saved', async ({
    adminEditorPage,
    adminCollectionPage,
    page,
  }) => {
    // Navigate to create tag
    await adminEditorPage.gotoCreate('tags')

    // Fill in name
    const testName = 'Custom Slug Test Tag'
    await adminEditorPage.fillField('name', testName)

    // Fill in custom slug
    const customSlug = 'my-custom-tag-slug'
    await adminEditorPage.fillField('slug', customSlug)

    // Save the tag
    await adminEditorPage.save()

    // Verify we're on the edit page (save succeeded)
    await page.waitForURL(/\/admin\/collections\/tags\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify custom slug was saved
    await expectFieldValue(page, 'slug', customSlug)
    await expectFieldValue(page, 'name', testName)

    // Navigate back to collection
    await adminCollectionPage.goto('tags')

    // Verify the tag appears in the list
    const newRow = await adminCollectionPage.getRowByText('Custom Slug Test Tag')
    await expect(newRow).toBeVisible()
  })

  test('duplicate name: verify unique constraint error', async ({
    adminEditorPage,
    page,
  }) => {
    // The seeded database has a tag with name "Propaganda"
    // Try to create a new tag with the same name

    // Navigate to create tag
    await adminEditorPage.gotoCreate('tags')

    // Fill in duplicate name
    await adminEditorPage.fillField('name', 'Propaganda')

    // Try to save the tag
    await adminEditorPage.save()

    // Verify error message appears
    const nameError = await adminEditorPage.getFieldError('name')
    const isNameErrorVisible = await nameError.isVisible().catch(() => false)

    if (isNameErrorVisible) {
      // Inline field error
      await expectVisible(nameError)
      await expect(nameError).toContainText(/unique|already exists|duplicate/i)
    } else {
      // Form-level error or toast message
      await expectFormError(page, /unique|already exists|duplicate|name/i)
    }

    // Verify we're still on the create page (save failed)
    await expectUrl(page, /\/admin\/collections\/tags\/create/)
  })

  test('duplicate slug: verify unique constraint error', async ({
    adminEditorPage,
    page,
  }) => {
    // The seeded database has a tag with slug "propaganda"
    // Try to create a new tag with the same slug

    // Navigate to create tag
    await adminEditorPage.gotoCreate('tags')

    // Fill in a different name
    await adminEditorPage.fillField('name', 'Different Name')

    // Fill in duplicate slug
    await adminEditorPage.fillField('slug', 'propaganda')

    // Try to save the tag
    await adminEditorPage.save()

    // Verify error message appears
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
    await expectUrl(page, /\/admin\/collections\/tags\/create/)
  })

  test('add description: create tag with description and verify saved', async ({
    adminEditorPage,
    adminCollectionPage,
    page,
  }) => {
    // Navigate to create tag
    await adminEditorPage.gotoCreate('tags')

    // Fill in name (required)
    const testName = 'Tag with Description'
    await adminEditorPage.fillField('name', testName)

    // Fill in description (optional)
    const testDescription = 'This is a test tag with a description to verify it is saved correctly.'
    await adminEditorPage.fillField('description', testDescription)

    // Wait for slug to auto-generate
    await page.waitForTimeout(500)

    // Save the tag
    await adminEditorPage.save()

    // Verify we're on the edit page (save succeeded)
    await page.waitForURL(/\/admin\/collections\/tags\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify the description was saved
    await expectFieldValue(page, 'name', testName)
    await expectFieldValue(page, 'description', testDescription)

    // Navigate back to collection
    await adminCollectionPage.goto('tags')

    // Verify the tag appears in the list
    const newRow = await adminCollectionPage.getRowByText('Tag with Description')
    await expect(newRow).toBeVisible()
  })
})

test.describe('Tags Collection - Field Validation', () => {
  test.use({ storageState: STORAGE_STATE })

  test('name field should be required', async ({ adminEditorPage, page }) => {
    // Navigate to create tag
    await adminEditorPage.gotoCreate('tags')

    // Try to save without filling name
    await adminEditorPage.save()

    // Verify name field shows required error
    const nameError = await adminEditorPage.getFieldError('name')
    const isNameErrorVisible = await nameError.isVisible().catch(() => false)

    if (isNameErrorVisible) {
      await expectVisible(nameError)
      await expect(nameError).toContainText(/required/i)
    } else {
      // Form-level error
      await expectFormError(page, /required|name/i)
    }

    // Verify we're still on the create page (save failed)
    await expectUrl(page, /\/admin\/collections\/tags\/create/)
  })
})

test.describe('Tags Collection - List View', () => {
  test.use({ storageState: STORAGE_STATE })

  test('list view should show seeded tags', async ({
    adminCollectionPage,
    page,
  }) => {
    // Navigate to Tags collection
    await adminCollectionPage.goto('tags')

    // Verify we're on the collection page
    await expectUrl(page, /\/admin\/collections\/tags/)

    // Verify seeded tags appear in the list
    // Seeded tags: "Propaganda", "Technology", "Culture"
    const propagandaRow = await adminCollectionPage.getRowByText('Propaganda')
    await expect(propagandaRow).toBeVisible()

    const technologyRow = await adminCollectionPage.getRowByText('Technology')
    await expect(technologyRow).toBeVisible()

    const cultureRow = await adminCollectionPage.getRowByText('Culture')
    await expect(cultureRow).toBeVisible()
  })
})

test.describe('Tags in Post Relationship Picker', () => {
  test.use({ storageState: STORAGE_STATE })

  test('tags should appear in post relationship picker', async ({
    adminEditorPage,
    page,
  }) => {
    // Navigate to create post
    await adminEditorPage.gotoCreate('posts')

    // Find the tags relationship field
    const tagsField = page.locator('[data-field="tags"]')
    await expectVisible(tagsField)

    // Click to open the relationship picker
    const addButton = tagsField.locator('button', { hasText: /add|select/i })

    // If the add button exists, click it to open the picker
    const addButtonVisible = await addButton.isVisible().catch(() => false)
    if (addButtonVisible) {
      await addButton.click()
      await page.waitForTimeout(500)
    }

    // Verify the seeded tags are available in the picker
    // Note: The exact selector might vary based on Payload's relationship UI
    // We'll look for the tag names in the modal or dropdown
    const pickerModal = page.locator('[class*="modal"], [role="dialog"], [class*="drawer"]')
    const isModalVisible = await pickerModal.isVisible().catch(() => false)

    if (isModalVisible) {
      // Check if seeded tags appear in the modal
      await expect(pickerModal).toContainText('Propaganda')
      await expect(pickerModal).toContainText('Technology')
      await expect(pickerModal).toContainText('Culture')
    } else {
      // If no modal, tags might be in an inline list or dropdown
      await expect(tagsField).toContainText('Propaganda')
      await expect(tagsField).toContainText('Technology')
      await expect(tagsField).toContainText('Culture')
    }
  })
})
