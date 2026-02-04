import { Page } from '@playwright/test'
import { AdminLoginPage } from './page-objects/admin/admin-login.page'
import path from 'path'

/**
 * Storage state file for authenticated admin session
 * This file is saved after login and reused across tests for performance
 */
export const STORAGE_STATE = path.join(__dirname, '../../.auth/admin.json')

/**
 * Test credentials for admin user
 * These credentials are seeded by the test database setup
 */
export const TEST_ADMIN = {
  email: 'test@example.com',
  password: 'testpassword123',
}

/**
 * Sets up authenticated admin session
 * This should run once before all tests that need admin access
 * The session is saved to a file and reused for efficiency
 *
 * @param page - Playwright page instance
 */
export async function setupAuth(page: Page) {
  console.log('Setting up admin authentication...')

  const loginPage = new AdminLoginPage(page)
  await loginPage.goto()
  await loginPage.login(TEST_ADMIN.email, TEST_ADMIN.password)

  // Wait for dashboard to confirm successful login
  await page.waitForURL(/\/admin\/?$/, { timeout: 10000 })

  // Save storage state (cookies, local storage, etc.)
  await page.context().storageState({ path: STORAGE_STATE })

  console.log('Admin authentication saved to:', STORAGE_STATE)
}
