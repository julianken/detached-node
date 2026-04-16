import { Page, expect, Locator } from '@playwright/test'

/**
 * Common assertion helpers for Payload CMS forms and validation
 */

/**
 * Asserts that a field shows a validation error with specific message
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the field to check
 * @param message - Expected error message (can be partial match)
 */
export async function expectValidationError(page: Page, fieldName: string, message: string) {
  // Payload shows validation errors near the field
  const fieldContainer = page.locator(`[data-field="${fieldName}"]`)
  const errorElement = fieldContainer.locator('[class*="error"], .error-message, [role="alert"]')

  await expect(errorElement).toBeVisible()
  await expect(errorElement).toContainText(message)
}

/**
 * Asserts that a field does NOT show any validation error
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the field to check
 */
export async function expectNoValidationError(page: Page, fieldName: string) {
  const fieldContainer = page.locator(`[data-field="${fieldName}"]`)
  const errorElement = fieldContainer.locator('[class*="error"], .error-message, [role="alert"]')

  await expect(errorElement).not.toBeVisible()
}

/**
 * Asserts that a required field shows the "required" error
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the required field
 */
export async function expectRequiredError(page: Page, fieldName: string) {
  await expectValidationError(page, fieldName, 'required')
}

/**
 * Asserts that a form submission fails with specific error message
 *
 * @param page - Playwright page instance
 * @param errorMessage - Expected error message
 */
export async function expectFormError(page: Page, errorMessage: string | RegExp) {
  const formError = page.locator('[class*="form-error"], [class*="toast"], [role="alert"]').first()

  await expect(formError).toBeVisible()
  await expect(formError).toContainText(errorMessage)
}

/**
 * Asserts that a success message/toast is shown
 *
 * @param page - Playwright page instance
 * @param message - Expected success message (optional)
 */
export async function expectSuccess(page: Page, message?: string) {
  const successToast = page.locator('[class*="success"], [class*="toast"]')

  await expect(successToast).toBeVisible()

  if (message) {
    await expect(successToast).toContainText(message)
  }
}

/**
 * Asserts that a field has a specific value
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the field
 * @param expectedValue - Expected value
 */
export async function expectFieldValue(page: Page, fieldName: string, expectedValue: string) {
  const field = page.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"]`)
  await expect(field).toHaveValue(expectedValue)
}

/**
 * Asserts that a checkbox field is checked
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the checkbox field
 */
export async function expectFieldChecked(page: Page, fieldName: string) {
  const checkbox = page.locator(`input[name="${fieldName}"][type="checkbox"]`)
  await expect(checkbox).toBeChecked()
}

/**
 * Asserts that a checkbox field is NOT checked
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the checkbox field
 */
export async function expectFieldUnchecked(page: Page, fieldName: string) {
  const checkbox = page.locator(`input[name="${fieldName}"][type="checkbox"]`)
  await expect(checkbox).not.toBeChecked()
}

/**
 * Asserts that a field is disabled
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the field
 */
export async function expectFieldDisabled(page: Page, fieldName: string) {
  const field = page.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"], select[name="${fieldName}"]`)
  await expect(field).toBeDisabled()
}

/**
 * Asserts that a field is enabled
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the field
 */
export async function expectFieldEnabled(page: Page, fieldName: string) {
  const field = page.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"], select[name="${fieldName}"]`)
  await expect(field).toBeEnabled()
}

/**
 * Asserts that a locator contains exactly N elements
 *
 * @param locator - Playwright locator
 * @param count - Expected count
 */
export async function expectCount(locator: Locator, count: number) {
  await expect(locator).toHaveCount(count)
}

/**
 * Asserts that we're on a specific URL (full or partial match)
 *
 * @param page - Playwright page instance
 * @param urlPattern - URL pattern (string or regex)
 */
export async function expectUrl(page: Page, urlPattern: string | RegExp) {
  await expect(page).toHaveURL(urlPattern)
}

/**
 * Asserts that the page title matches
 *
 * @param page - Playwright page instance
 * @param titlePattern - Title pattern (string or regex)
 */
export async function expectTitle(page: Page, titlePattern: string | RegExp) {
  await expect(page).toHaveTitle(titlePattern)
}

/**
 * Asserts that an element is visible on the page
 *
 * @param locator - Playwright locator
 */
export async function expectVisible(locator: Locator) {
  await expect(locator).toBeVisible()
}

/**
 * Asserts that an element is NOT visible on the page
 *
 * @param locator - Playwright locator
 */
export async function expectNotVisible(locator: Locator) {
  await expect(locator).not.toBeVisible()
}
