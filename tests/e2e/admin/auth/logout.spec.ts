import { test, expect } from '../../fixtures'
import { TEST_ADMIN } from '../../fixtures/auth.fixture'
import { expectUrl } from '../../helpers/assertions.helper'

/**
 * CON-54: Admin Logout E2E Tests
 *
 * Acceptance Criteria:
 * - Logout option accessible from admin interface
 * - Clicking logout clears authentication token
 * - User redirected to login page after logout
 * - Protected routes inaccessible after logout
 */

test.describe('Admin Logout', () => {
  test('should successfully logout from admin dashboard and redirect to login page', async ({
    adminDashboardPage,
  }) => {
    // Navigate to admin dashboard (should be authenticated from global setup)
    await adminDashboardPage.goto()

    // Verify we're on the admin URL (authenticated)
    await expectUrl(adminDashboardPage.page, /\/admin/)

    // Perform logout
    await adminDashboardPage.logout()

    // Verify redirect to login page
    await expectUrl(adminDashboardPage.page, /\/admin\/login/)

    // Verify login form is visible
    const loginPage = adminDashboardPage.page
    await expect(loginPage.locator('input[name="email"]')).toBeVisible()
    await expect(loginPage.locator('input[name="password"]')).toBeVisible()
  })

  test('should clear authentication token and prevent access to protected routes after logout', async ({
    adminDashboardPage,
    page,
  }) => {
    // Navigate to admin dashboard
    await adminDashboardPage.goto()

    // Verify we're authenticated (on admin page)
    await expectUrl(page, /\/admin/)

    // Perform logout
    await adminDashboardPage.logout()

    // Wait for redirect to login page
    await expectUrl(page, /\/admin\/login/)

    // Try to access a protected route (admin dashboard)
    await page.goto('/admin')

    // Should remain on login page or redirect to login
    await page.waitForURL(/\/admin\/login/, { timeout: 5000 })
    await expectUrl(page, /\/admin\/login/)

    // Verify login form is still visible (not authenticated)
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
  })

  test('should require re-authentication after logout', async ({
    adminLoginPage,
    adminDashboardPage,
  }) => {
    // Navigate to admin dashboard
    await adminDashboardPage.goto()

    // Verify we're authenticated (on admin page)
    await expectUrl(adminDashboardPage.page, /\/admin/)

    // Perform logout
    await adminDashboardPage.logout()

    // Wait for redirect to login page
    await expectUrl(adminDashboardPage.page, /\/admin\/login/)

    // Verify that login credentials are required to access admin again
    await adminLoginPage.login(TEST_ADMIN.email, TEST_ADMIN.password)

    // Verify successful re-authentication by checking URL
    await expectUrl(adminLoginPage.page, /\/admin\/?$/)

    // Verify we can navigate to admin again
    await adminLoginPage.page.goto('/admin')
    await expectUrl(adminLoginPage.page, /\/admin/)
  })
})
