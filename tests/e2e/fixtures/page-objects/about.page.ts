import { Page, Locator } from '@playwright/test'

/**
 * Page Object Model for the About page
 */
export class AboutPage {
  readonly page: Page
  readonly pageTitle: Locator
  readonly pageContent: Locator
  readonly navigation: Locator

  constructor(page: Page) {
    this.page = page
    this.navigation = page.locator('nav')
    this.pageTitle = page.getByRole('heading', { level: 1 }).first()
    this.pageContent = page.locator('main')
  }

  async goto() {
    await this.page.goto('/about')
    await this.page.waitForLoadState('networkidle')
  }

  async getPageTitle() {
    return await this.pageTitle.textContent()
  }
}
