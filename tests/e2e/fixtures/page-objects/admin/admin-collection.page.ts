import { Page, Locator } from '@playwright/test'

/**
 * Page Object Model for Payload Collection list view
 */
export class AdminCollectionPage {
  readonly page: Page
  readonly collectionHeading: Locator
  readonly createNewButton: Locator
  readonly tableRows: Locator
  readonly searchInput: Locator
  readonly filterButton: Locator

  constructor(page: Page) {
    this.page = page
    this.collectionHeading = page.locator('h1')
    this.createNewButton = page.getByRole('link', { name: /create new|add new/i }).first()
    this.tableRows = page.locator('table tbody tr, [class*="table"] [class*="row"]')
    this.searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')
    this.filterButton = page.getByRole('button', { name: /filter/i })
  }

  async goto(collectionName: string) {
    await this.page.goto(`/admin/collections/${collectionName}`)
    await this.page.waitForLoadState('networkidle')
  }

  async clickCreateNew() {
    await this.createNewButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  async getRowCount() {
    return await this.tableRows.count()
  }

  async clickRow(index: number) {
    await this.tableRows.nth(index).click()
    await this.page.waitForLoadState('networkidle')
  }

  async searchFor(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForLoadState('networkidle')
  }

  async getRowByText(text: string) {
    return this.tableRows.filter({ hasText: text })
  }
}
