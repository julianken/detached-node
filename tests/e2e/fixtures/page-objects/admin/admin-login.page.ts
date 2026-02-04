import { Page, Locator } from '@playwright/test'

/**
 * Page Object Model for Payload Admin Login page
 */
export class AdminLoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    // Payload uses specific field names
    this.emailInput = page.locator('input[name="email"]')
    this.passwordInput = page.locator('input[name="password"]')
    this.submitButton = page.getByRole('button', { name: /log in|login|sign in/i })
    this.errorMessage = page.locator('.error, [class*="error"], [role="alert"]')
  }

  async goto() {
    await this.page.goto('/admin')
    await this.page.waitForLoadState('networkidle')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
    // Wait for navigation to admin dashboard
    await this.page.waitForURL(/\/admin\/?$/, { timeout: 10000 })
  }

  async expectError() {
    return this.errorMessage
  }
}
