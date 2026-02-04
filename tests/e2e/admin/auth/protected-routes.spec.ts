import { test, expect } from '../../fixtures'

/**
 * Protected Routes E2E Tests (CON-55)
 *
 * Tests that admin routes require authentication and redirect properly:
 * - Unauthenticated users are redirected to login
 * - After login, users are redirected to originally requested page
 */

// Override the default storage state to start without authentication
test.use({ storageState: { cookies: [], origins: [] } })

const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'testpassword123',
}

test.describe('Protected Routes Authentication', () => {
  test('should redirect unauthenticated access to /admin to login', async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('/admin')

    // Should redirect to login page
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 })

    // Verify we're on the login page
    await expect(page).toHaveURL(/\/admin\/login/)

    // Verify login form is visible
    const emailInput = page.locator('input[name="email"]')
    const passwordInput = page.locator('input[name="password"]')
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
  })

  test('should redirect unauthenticated access to /admin/collections/posts to login', async ({
    page,
  }) => {
    // Navigate directly to posts collection
    await page.goto('/admin/collections/posts')

    // Should redirect to login page
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 })

    // Verify we're on the login page
    await expect(page).toHaveURL(/\/admin\/login/)

    // Verify login form is visible
    const emailInput = page.locator('input[name="email"]')
    const passwordInput = page.locator('input[name="password"]')
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
  })

  test('should redirect back to /admin after successful login from /admin', async ({ page }) => {
    // Navigate to admin dashboard (will redirect to login)
    await page.goto('/admin')

    // Wait for redirect to login
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 })

    // Fill in login form
    const emailInput = page.locator('input[name="email"]')
    const passwordInput = page.locator('input[name="password"]')
    const submitButton = page.getByRole('button', { name: /log in|login|sign in/i })

    await emailInput.fill(TEST_CREDENTIALS.email)
    await passwordInput.fill(TEST_CREDENTIALS.password)
    await submitButton.click()

    // Should redirect back to admin dashboard
    await page.waitForURL(/\/admin\/?$/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/admin\/?$/)
  })

  test('should redirect back to /admin/collections/posts after successful login', async ({
    page,
  }) => {
    // Navigate to posts collection (will redirect to login)
    await page.goto('/admin/collections/posts')

    // Wait for redirect to login
    await page.waitForURL(/\/admin\/login/, { timeout: 10000 })

    // Fill in login form
    const emailInput = page.locator('input[name="email"]')
    const passwordInput = page.locator('input[name="password"]')
    const submitButton = page.getByRole('button', { name: /log in|login|sign in/i })

    await emailInput.fill(TEST_CREDENTIALS.email)
    await passwordInput.fill(TEST_CREDENTIALS.password)
    await submitButton.click()

    // Should redirect back to posts collection
    await page.waitForURL(/\/admin\/collections\/posts/, { timeout: 10000 })
    await expect(page).toHaveURL(/\/admin\/collections\/posts/)
  })
})
