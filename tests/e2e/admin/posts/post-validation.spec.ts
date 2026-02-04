import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import {
  fillRichText,
  expectValidationError,
  expectNoValidationError,
} from '../../helpers'

/**
 * CON-60: Post Field Validation E2E Tests
 *
 * Tests validation rules for post fields:
 * - Title: required, 5-200 characters
 * - Summary: required, 50-500 characters
 * - Slug: required, unique
 * - Body: required
 * - Validation errors display clearly
 * - Errors cleared when corrected
 *
 * Test Scenarios:
 * 1. Title too short: 4 chars, verify error
 * 2. Title too long: 201 chars, verify error
 * 3. Summary too short: 49 chars, verify error
 * 4. Summary too long: 501 chars, verify error
 * 5. Duplicate slug: verify unique constraint error
 * 6. Missing required: verify all required field errors
 */

test.describe('Post Field Validation', () => {
  // Use authenticated admin session for these tests
  test.use({ storageState: STORAGE_STATE })

  test.beforeEach(async ({ adminCollectionPage }) => {
    // Navigate to Posts collection and create new post
    await adminCollectionPage.goto('posts')
    await adminCollectionPage.clickCreateNew()
  })

  test('should reject title that is too short (< 5 characters)', async ({
    adminEditorPage,
    page,
  }) => {
    // Enter a title with only 4 characters
    const tooShortTitle = 'Test' // 4 characters
    await adminEditorPage.fillField('title', tooShortTitle)

    // Fill in other required fields to isolate title validation
    const validSummary =
      'This is a valid summary that meets the minimum character requirement of fifty characters needed for validation.'
    await adminEditorPage.fillField('summary', validSummary)

    const validBody = 'This is a valid body content for the post.'
    await fillRichText(page, validBody, 'body')

    // Attempt to save
    await adminEditorPage.save()

    // Wait for validation to appear
    await page.waitForTimeout(1000)

    // Verify validation error appears for title
    await expectValidationError(page, 'title', '5')
  })

  test('should reject title that is too long (> 200 characters)', async ({
    adminEditorPage,
    page,
  }) => {
    // Create a title with 201 characters
    const tooLongTitle = 'A'.repeat(201)
    await adminEditorPage.fillField('title', tooLongTitle)

    // Fill in other required fields
    const validSummary =
      'This is a valid summary that meets the minimum character requirement of fifty characters needed for validation.'
    await adminEditorPage.fillField('summary', validSummary)

    const validBody = 'This is a valid body content for the post.'
    await fillRichText(page, validBody, 'body')

    // Attempt to save
    await adminEditorPage.save()

    // Wait for validation
    await page.waitForTimeout(1000)

    // Verify validation error appears for title
    await expectValidationError(page, 'title', '200')
  })

  test('should reject summary that is too short (< 50 characters)', async ({
    adminEditorPage,
    page,
  }) => {
    // Enter valid title
    const validTitle = 'Valid Test Post Title'
    await adminEditorPage.fillField('title', validTitle)

    // Enter summary with only 49 characters
    const tooShortSummary = 'This summary is too short for validation test.' // 49 characters
    await adminEditorPage.fillField('summary', tooShortSummary)

    // Fill in valid body
    const validBody = 'This is a valid body content for the post.'
    await fillRichText(page, validBody, 'body')

    // Attempt to save
    await adminEditorPage.save()

    // Wait for validation
    await page.waitForTimeout(1000)

    // Verify validation error appears for summary
    await expectValidationError(page, 'summary', '50')
  })

  test('should reject summary that is too long (> 500 characters)', async ({
    adminEditorPage,
    page,
  }) => {
    // Enter valid title
    const validTitle = 'Valid Test Post Title'
    await adminEditorPage.fillField('title', validTitle)

    // Create a summary with 501 characters
    const tooLongSummary = 'A'.repeat(501)
    await adminEditorPage.fillField('summary', tooLongSummary)

    // Fill in valid body
    const validBody = 'This is a valid body content for the post.'
    await fillRichText(page, validBody, 'body')

    // Attempt to save
    await adminEditorPage.save()

    // Wait for validation
    await page.waitForTimeout(1000)

    // Verify validation error appears for summary
    await expectValidationError(page, 'summary', '500')
  })

  test('should reject duplicate slug (unique constraint)', async ({
    adminEditorPage,
    page,
  }) => {
    // Enter valid title
    const validTitle = 'Test Post for Duplicate Slug'
    await adminEditorPage.fillField('title', validTitle)

    // Wait for auto-generated slug
    await page.waitForTimeout(800)

    // Manually set slug to an existing one from seeded data
    const duplicateSlug = 'architecture-of-persuasion' // Known existing slug
    await adminEditorPage.fillField('slug', duplicateSlug)

    // Fill in other required fields
    const validSummary =
      'This is a valid summary that meets the minimum character requirement of fifty characters needed for validation.'
    await adminEditorPage.fillField('summary', validSummary)

    const validBody = 'This is a valid body content for the post.'
    await fillRichText(page, validBody, 'body')

    // Attempt to save
    await adminEditorPage.save()

    // Wait for validation
    await page.waitForTimeout(1000)

    // Verify validation error appears for slug (unique constraint)
    await expectValidationError(page, 'slug', 'unique')
  })

  test('should show validation errors for all missing required fields', async ({
    adminEditorPage,
    page,
  }) => {
    // Leave all required fields empty and try to save
    await adminEditorPage.save()

    // Wait for validation
    await page.waitForTimeout(1000)

    // Verify validation errors appear for all required fields
    // Title is required
    await expectValidationError(page, 'title', 'required')

    // Summary is required
    await expectValidationError(page, 'summary', 'required')

    // Body is required
    await expectValidationError(page, 'body', 'required')

    // Slug may also show required error (depending on auto-generation)
    // Note: Slug might auto-generate from title, so it may not show as required
  })

  test('should clear validation errors when fields are corrected', async ({
    adminEditorPage,
    page,
  }) => {
    // First, trigger validation errors by trying to save with invalid data
    const tooShortTitle = 'Test' // 4 characters
    await adminEditorPage.fillField('title', tooShortTitle)

    const tooShortSummary = 'This is too short.' // Less than 50 characters
    await adminEditorPage.fillField('summary', tooShortSummary)

    // Attempt to save
    await adminEditorPage.save()

    // Wait for validation errors
    await page.waitForTimeout(1000)

    // Verify errors are shown
    await expectValidationError(page, 'title', '5')
    await expectValidationError(page, 'summary', '50')

    // Now correct the title
    const validTitle = 'Valid Test Post Title for Validation'
    await adminEditorPage.fillField('title', validTitle)

    // Blur the field to trigger validation check
    await page.locator('input[name="title"]').blur()
    await page.waitForTimeout(500)

    // Verify title error is cleared
    await expectNoValidationError(page, 'title')

    // Now correct the summary
    const validSummary =
      'This is a valid summary that meets the minimum character requirement of fifty characters needed for validation.'
    await adminEditorPage.fillField('summary', validSummary)

    // Blur the field
    await page.locator('textarea[name="summary"]').blur()
    await page.waitForTimeout(500)

    // Verify summary error is cleared
    await expectNoValidationError(page, 'summary')

    // Add valid body
    const validBody = 'This is a valid body content for the post.'
    await fillRichText(page, validBody, 'body')

    // Now save should succeed
    await adminEditorPage.save()

    // Wait for save to complete
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify we successfully saved (redirected to edit page)
    await expect(page).toHaveURL(/\/admin\/collections\/posts\/[a-f0-9-]+/)
  })

  test('should reject another known duplicate slug', async ({
    adminEditorPage,
    page,
  }) => {
    // Enter valid title
    const validTitle = 'Another Test for Duplicate Slug'
    await adminEditorPage.fillField('title', validTitle)

    // Wait for auto-generated slug
    await page.waitForTimeout(800)

    // Manually set slug to the second known existing slug
    const duplicateSlug = 'decoding-corporate-newspeak' // Another known existing slug
    await adminEditorPage.fillField('slug', duplicateSlug)

    // Fill in other required fields
    const validSummary =
      'This is a valid summary that meets the minimum character requirement of fifty characters needed for validation.'
    await adminEditorPage.fillField('summary', validSummary)

    const validBody = 'This is a valid body content for the post.'
    await fillRichText(page, validBody, 'body')

    // Attempt to save
    await adminEditorPage.save()

    // Wait for validation
    await page.waitForTimeout(1000)

    // Verify validation error appears for slug (unique constraint)
    await expectValidationError(page, 'slug', 'unique')
  })
})
