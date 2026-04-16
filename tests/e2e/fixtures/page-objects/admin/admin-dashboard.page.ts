import { Page, Locator } from '@playwright/test'

/**
 * Page Object Model for Payload Admin Dashboard
 */
export class AdminDashboardPage {
  readonly page: Page
  readonly dashboardHeading: Locator
  readonly collectionsNav: Locator
  readonly userMenu: Locator
  readonly logoutButton: Locator

  constructor(page: Page) {
    this.page = page
    this.dashboardHeading = page.getByRole('heading', { name: /dashboard/i })
    // Payload admin navigation - adjust based on actual DOM structure
    this.collectionsNav = page.locator('nav, [class*="nav"]')
    this.userMenu = page.locator('[class*="account"], [class*="user"]')
    this.logoutButton = page.getByRole('button', { name: /log out|logout|sign out/i })
  }

  async goto() {
    await this.page.goto('/admin')
    await this.page.waitForLoadState('domcontentloaded')
  }

  async navigateToCollection(collectionName: string) {
    // Click on collection link in sidebar
    const collectionLink = this.page.getByRole('link', { name: new RegExp(collectionName, 'i') })
    await collectionLink.click()
    await this.page.waitForURL(new RegExp(`/admin/collections/${collectionName.toLowerCase()}`))
  }

  async logout() {
    await this.userMenu.click()
    await this.logoutButton.click()
    await this.page.waitForURL(/\/admin\/login/)
  }
}
