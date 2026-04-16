import { Page, Locator } from '@playwright/test'

/**
 * Page Object Model for Payload document editor
 */
export class AdminEditorPage {
  readonly page: Page
  readonly saveButton: Locator
  readonly saveDraftButton: Locator
  readonly publishButton: Locator
  readonly deleteButton: Locator
  readonly backButton: Locator
  readonly statusBadge: Locator

  constructor(page: Page) {
    this.page = page
    this.saveButton = page.getByRole('button', { name: /^save$/i })
    this.saveDraftButton = page.getByRole('button', { name: /save draft/i })
    this.publishButton = page.getByRole('button', { name: /publish/i })
    this.deleteButton = page.getByRole('button', { name: /delete/i })
    this.backButton = page.locator('a[href*="/admin/collections/"]').first()
    this.statusBadge = page.locator('[class*="status"]')
  }

  async goto(collectionName: string, documentId: string) {
    await this.page.goto(`/admin/collections/${collectionName}/${documentId}`)
    await this.page.waitForLoadState('domcontentloaded')
  }

  async gotoCreate(collectionName: string) {
    await this.page.goto(`/admin/collections/${collectionName}/create`)
    await this.page.waitForLoadState('domcontentloaded')
  }

  async fillField(fieldName: string, value: string) {
    const field = this.page.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"]`)
    await field.fill(value)
  }

  async toggleCheckbox(fieldName: string) {
    const checkbox = this.page.locator(`input[name="${fieldName}"][type="checkbox"]`)
    await checkbox.click()
  }

  async save() {
    await this.saveButton.click()
    await this.page.waitForLoadState('domcontentloaded')
  }

  async saveDraft() {
    await this.saveDraftButton.click()
    await this.page.waitForLoadState('domcontentloaded')
  }

  async publish() {
    await this.publishButton.click()
    await this.page.waitForLoadState('domcontentloaded')
  }

  async delete() {
    await this.deleteButton.click()
    // Wait for confirmation dialog
    const confirmButton = this.page.getByRole('button', { name: /confirm|delete/i })
    await confirmButton.click()
    await this.page.waitForLoadState('domcontentloaded')
  }

  async getFieldValue(fieldName: string) {
    const field = this.page.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"]`)
    return await field.inputValue()
  }

  async getFieldError(fieldName: string) {
    // Payload shows errors near the field
    const fieldContainer = this.page.locator(`[class*="field"][class*="${fieldName}"], [data-field="${fieldName}"]`)
    return fieldContainer.locator('[class*="error"], .error-message')
  }
}
