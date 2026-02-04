import { Page, Locator } from '@playwright/test'

/**
 * Helper functions for selecting relationships in Payload CMS
 * Payload uses a custom relationship field UI with searchable dropdowns
 */

/**
 * Selects a relationship option by text
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the relationship field
 * @param optionText - Text of the option to select
 */
export async function selectRelationship(page: Page, fieldName: string, optionText: string) {
  // Find the relationship field container
  const fieldContainer = page.locator(`[data-field="${fieldName}"]`)

  // Click the relationship field to open dropdown
  const fieldButton = fieldContainer.locator('button, [role="combobox"]').first()
  await fieldButton.click()

  // Wait for options to appear
  await page.waitForSelector('[role="option"], [class*="option"]', { state: 'visible' })

  // Select the option
  const option = page.locator('[role="option"], [class*="option"]').filter({ hasText: optionText })
  await option.click()

  // Wait for selection to be applied
  await page.waitForTimeout(300)
}

/**
 * Selects multiple relationship options
 * For multi-select relationship fields
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the relationship field
 * @param optionTexts - Array of option texts to select
 */
export async function selectMultipleRelationships(page: Page, fieldName: string, optionTexts: string[]) {
  const fieldContainer = page.locator(`[data-field="${fieldName}"]`)

  for (const optionText of optionTexts) {
    // Click the field to open dropdown
    const fieldButton = fieldContainer.locator('button, [role="combobox"]').first()
    await fieldButton.click()

    // Wait for options
    await page.waitForSelector('[role="option"], [class*="option"]', { state: 'visible' })

    // Select the option
    const option = page.locator('[role="option"], [class*="option"]').filter({ hasText: optionText })
    await option.click()

    // Wait between selections
    await page.waitForTimeout(300)
  }
}

/**
 * Searches for a relationship option before selecting
 * Useful for large relationship lists
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the relationship field
 * @param searchQuery - Search query to filter options
 * @param optionText - Text of the option to select from filtered results
 */
export async function searchAndSelectRelationship(
  page: Page,
  fieldName: string,
  searchQuery: string,
  optionText: string
) {
  const fieldContainer = page.locator(`[data-field="${fieldName}"]`)

  // Click to open dropdown
  const fieldButton = fieldContainer.locator('button, [role="combobox"]').first()
  await fieldButton.click()

  // Find and use the search input
  const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')
  await searchInput.fill(searchQuery)

  // Wait for filtered results
  await page.waitForTimeout(500)

  // Select the option
  const option = page.locator('[role="option"], [class*="option"]').filter({ hasText: optionText })
  await option.click()

  await page.waitForTimeout(300)
}

/**
 * Removes a selected relationship
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the relationship field
 * @param optionText - Text of the relationship to remove (for multi-select)
 */
export async function removeRelationship(page: Page, fieldName: string, optionText?: string) {
  const fieldContainer = page.locator(`[data-field="${fieldName}"]`)

  let removeButton: Locator

  if (optionText) {
    // For multi-select, find specific tag/chip to remove
    const tag = fieldContainer.locator('[class*="tag"], [class*="chip"]').filter({ hasText: optionText })
    removeButton = tag.locator('button, [role="button"]')
  } else {
    // For single select, find the clear button
    removeButton = fieldContainer.locator('button[aria-label*="clear"], button[title*="clear"]')
  }

  await removeButton.click()
  await page.waitForTimeout(300)
}

/**
 * Gets the currently selected relationship value(s)
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the relationship field
 * @returns Array of selected option texts
 */
export async function getSelectedRelationships(page: Page, fieldName: string): Promise<string[]> {
  const fieldContainer = page.locator(`[data-field="${fieldName}"]`)

  // Look for selected tags/chips or the single value display
  const selections = fieldContainer.locator('[class*="tag"], [class*="chip"], [class*="value"]')

  const count = await selections.count()
  const values: string[] = []

  for (let i = 0; i < count; i++) {
    const text = await selections.nth(i).textContent()
    if (text) {
      // Clean up the text (remove close buttons, etc.)
      values.push(text.trim())
    }
  }

  return values
}

/**
 * Clears all selected relationships in a multi-select field
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the relationship field
 */
export async function clearAllRelationships(page: Page, fieldName: string) {
  const fieldContainer = page.locator(`[data-field="${fieldName}"]`)

  // Find all remove buttons for tags/chips
  const removeButtons = fieldContainer.locator(
    '[class*="tag"] button, [class*="chip"] button, button[aria-label*="remove"]'
  )

  const count = await removeButtons.count()

  // Remove in reverse order to avoid index shifting
  for (let i = count - 1; i >= 0; i--) {
    await removeButtons.nth(i).click()
    await page.waitForTimeout(200)
  }
}
