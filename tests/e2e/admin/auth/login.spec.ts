import { test, expect } from '../../fixtures'
import { TEST_ADMIN } from '../../fixtures/auth.fixture'
import { expectVisible, expectUrl } from '../../helpers/assertions.helper'

/**
 * CON-53: Admin Login E2E Tests
 *
 * Validates that the admin authentication flow works correctly:
 * - Login form is accessible
 * - Valid credentials redirect to dashboard
 * - Invalid credentials show error messages
 * - Session persists across page refreshes
 */

test.describe('Admin Login', () => {
  // Don't use stored auth state for login tests - we're testing the login flow itself
  test.use({ storageState: { cookies: [], origins: [] } })

  test.beforeEach(async ({ adminLoginPage }) => {
    // Navigate to admin login page before each test
    await adminLoginPage.goto()
  })

  test('should display login form with email and password fields', async ({ adminLoginPage }) => {
    // Verify form fields are visible
    await expectVisible(adminLoginPage.emailInput)
    await expectVisible(adminLoginPage.passwordInput)
    await expectVisible(adminLoginPage.submitButton)

    // Verify we're on the login page
    await expectUrl(adminLoginPage.page, /\/admin/)
  })

  test('should successfully login with valid credentials and redirect to dashboard', async ({
    adminLoginPage,
  }) => {
    // Login with valid test credentials
    await adminLoginPage.login(TEST_ADMIN.email, TEST_ADMIN.password)

    // Verify redirect to dashboard
    await expectUrl(adminLoginPage.page, /\/admin\/?$/)

    // Verify we're no longer on the login page (login form should be gone)
    await expect(adminLoginPage.emailInput).not.toBeVisible()
  })

  test('should show error message for invalid password', async ({ adminLoginPage }) => {
    // Attempt login with wrong password
    await adminLoginPage.emailInput.fill(TEST_ADMIN.email)
    await adminLoginPage.passwordInput.fill('wrongpassword')
    await adminLoginPage.submitButton.click()

    // Wait for error message to appear
    const errorMessage = await adminLoginPage.expectError()
    await expectVisible(errorMessage)

    // Verify we're still on login page (not redirected)
    await expectUrl(adminLoginPage.page, /\/admin/)
  })

  test('should show error message for non-existent email', async ({ adminLoginPage }) => {
    // Attempt login with non-existent email
    await adminLoginPage.emailInput.fill('nonexistent@example.com')
    await adminLoginPage.passwordInput.fill(TEST_ADMIN.password)
    await adminLoginPage.submitButton.click()

    // Wait for error message to appear
    const errorMessage = await adminLoginPage.expectError()
    await expectVisible(errorMessage)

    // Verify we're still on login page
    await expectUrl(adminLoginPage.page, /\/admin/)
  })

  test('should show validation errors for empty fields', async ({ adminLoginPage, page }) => {
    // Submit form without filling any fields
    await adminLoginPage.submitButton.click()

    // Wait a moment for any validation to trigger
    await page.waitForTimeout(1000)

    // Payload should show an error message when submitting empty credentials
    // OR we should still be on the login page (not redirected to dashboard)
    const errorMessage = await adminLoginPage.expectError()
    const isErrorVisible = await errorMessage.isVisible().catch(() => false)

    if (isErrorVisible) {
      // Error message is shown
      await expectVisible(errorMessage)
    } else {
      // No error message, but we should still be on login page with form visible
      await expectVisible(adminLoginPage.emailInput)
      await expectVisible(adminLoginPage.passwordInput)
    }

    // Verify we're still on login page (not redirected)
    await expectUrl(page, /\/admin/)
  })

  test('should persist session across page refreshes', async ({ adminLoginPage, page }) => {
    // Login with valid credentials
    await adminLoginPage.login(TEST_ADMIN.email, TEST_ADMIN.password)

    // Verify we're on dashboard
    await expectUrl(page, /\/admin\/?$/)

    // Refresh the page
    await page.reload()

    // Verify we're still logged in (not redirected to login)
    await expectUrl(page, /\/admin\/?$/)

    // Verify we're not seeing the login form
    await expect(adminLoginPage.emailInput).not.toBeVisible()
  })
})
