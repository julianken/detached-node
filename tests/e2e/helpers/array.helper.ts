import { Page, Locator } from '@playwright/test'

/**
 * Helper functions for working with array fields in Payload CMS
 * Array fields allow adding/removing/reordering multiple entries with sub-fields
 */

/**
 * Adds a new row to an array field
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the array field
 */
export async function addArrayRow(page: Page, fieldName: string) {
  // Try multiple selectors for Payload's array field containers
  const fieldContainer = page.locator(`[data-field="${fieldName}"], [id*="field-${fieldName}"], .field-type-array[class*="${fieldName}"]`).first()
  const addButton = fieldContainer.locator('button').filter({ hasText: /add|new/i }).first()
  await addButton.click()
  await page.waitForTimeout(500)
}

/**
 * Fills a field within an array row
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the array field
 * @param rowIndex - Zero-based index of the row (0 for first row)
 * @param subFieldName - Name of the sub-field within the row
 * @param value - Value to fill
 */
export async function fillArrayField(
  page: Page,
  fieldName: string,
  rowIndex: number,
  subFieldName: string,
  value: string
) {
  // Try multiple selectors for Payload's array field containers
  const fieldContainer = page.locator(`[data-field="${fieldName}"], [id*="field-${fieldName}"], .field-type-array[class*="${fieldName}"]`).first()
  const rows = fieldContainer.locator('[class*="row"], [data-row], .array-row, [class*="collapsible"]').filter({ hasNotText: '' })
  const targetRow = rows.nth(rowIndex)

  // Find the input within this specific row - try multiple patterns
  const input = targetRow.locator(`input[name*="${subFieldName}"], textarea[name*="${subFieldName}"], [id*="${subFieldName}"] input, [id*="${subFieldName}"] textarea`).first()
  await input.fill(value)
  await page.waitForTimeout(300)
}

/**
 * Fills a date field within an array row
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the array field
 * @param rowIndex - Zero-based index of the row
 * @param subFieldName - Name of the date sub-field
 * @param date - Date string in format YYYY-MM-DD or ISO format
 */
export async function fillArrayDateField(
  page: Page,
  fieldName: string,
  rowIndex: number,
  subFieldName: string,
  date: string
) {
  const fieldContainer = page.locator(`[data-field="${fieldName}"], [id*="field-${fieldName}"], .field-type-array[class*="${fieldName}"]`).first()
  const rows = fieldContainer.locator('[class*="row"], [data-row], .array-row, [class*="collapsible"]').filter({ hasNotText: '' })
  const targetRow = rows.nth(rowIndex)

  // Find the date input within this specific row
  const dateInput = targetRow.locator(`input[name*="${subFieldName}"][type="date"], input[name*="${subFieldName}"][type="datetime-local"], [id*="${subFieldName}"] input[type="date"]`).first()
  await dateInput.fill(date)
  await page.waitForTimeout(300)
}

/**
 * Gets the value of a field within an array row
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the array field
 * @param rowIndex - Zero-based index of the row
 * @param subFieldName - Name of the sub-field
 * @returns The field value
 */
export async function getArrayFieldValue(
  page: Page,
  fieldName: string,
  rowIndex: number,
  subFieldName: string
): Promise<string> {
  const fieldContainer = page.locator(`[data-field="${fieldName}"], [id*="field-${fieldName}"], .field-type-array[class*="${fieldName}"]`).first()
  const rows = fieldContainer.locator(`[class*="row"], [data-row], .array-row, [class*="collapsible"]`).filter({ hasNotText: '' })
  const targetRow = rows.nth(rowIndex)

  const input = targetRow.locator(`input[name*="${subFieldName}"], textarea[name*="${subFieldName}"], [id*="${subFieldName}"] input, [id*="${subFieldName}"] textarea`).first()
  return await input.inputValue()
}

/**
 * Removes a row from an array field
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the array field
 * @param rowIndex - Zero-based index of the row to remove
 */
export async function removeArrayRow(page: Page, fieldName: string, rowIndex: number) {
  const fieldContainer = page.locator(`[data-field="${fieldName}"], [id*="field-${fieldName}"], .field-type-array[class*="${fieldName}"]`).first()
  const rows = fieldContainer.locator('[class*="row"], [data-row], .array-row, [class*="collapsible"]').filter({ hasNotText: '' })
  const targetRow = rows.nth(rowIndex)

  // Find the remove/delete button within this row
  const removeButton = targetRow.locator('button[aria-label*="remove"], button[aria-label*="delete"], button[class*="remove"], button[class*="delete"], button').filter({ hasText: /remove|delete|×/i }).first()
  await removeButton.click()
  await page.waitForTimeout(500)
}

/**
 * Gets the count of rows in an array field
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the array field
 * @returns Number of rows
 */
export async function getArrayRowCount(page: Page, fieldName: string): Promise<number> {
  const fieldContainer = page.locator(`[data-field="${fieldName}"], [id*="field-${fieldName}"], .field-type-array[class*="${fieldName}"]`).first()
  const rows = fieldContainer.locator('[class*="row"], [data-row], .array-row, [class*="collapsible"]').filter({ hasNotText: '' })
  return await rows.count()
}

/**
 * Reorders an array row by dragging it to a new position
 * Note: This uses keyboard shortcuts as drag-and-drop can be unreliable in tests
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the array field
 * @param fromIndex - Current zero-based index of the row
 * @param toIndex - Target zero-based index
 */
export async function reorderArrayRow(
  page: Page,
  fieldName: string,
  fromIndex: number,
  toIndex: number
) {
  if (fromIndex === toIndex) return

  const fieldContainer = page.locator(`[data-field="${fieldName}"], [id*="field-${fieldName}"], .field-type-array[class*="${fieldName}"]`).first()
  const rows = fieldContainer.locator('[class*="row"], [data-row], .array-row, [class*="collapsible"]').filter({ hasNotText: '' })
  const sourceRow = rows.nth(fromIndex)

  // Try to find a drag handle or use the row itself
  const dragHandle = sourceRow.locator('[class*="drag"], button[aria-label*="drag"], [aria-label*="reorder"], [class*="handle"]').first()

  // Focus the drag handle or row
  try {
    await dragHandle.focus()
  } catch {
    await sourceRow.focus()
  }

  // Move up or down using keyboard
  const moveUp = toIndex < fromIndex
  const times = Math.abs(toIndex - fromIndex)

  for (let i = 0; i < times; i++) {
    if (moveUp) {
      await page.keyboard.press('ArrowUp')
    } else {
      await page.keyboard.press('ArrowDown')
    }
    await page.waitForTimeout(300)
  }
}

/**
 * Collapses an array row
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the array field
 * @param rowIndex - Zero-based index of the row
 */
export async function collapseArrayRow(page: Page, fieldName: string, rowIndex: number) {
  const fieldContainer = page.locator(`[data-field="${fieldName}"], [id*="field-${fieldName}"], .field-type-array[class*="${fieldName}"]`).first()
  const rows = fieldContainer.locator('[class*="row"], [data-row], .array-row, [class*="collapsible"]').filter({ hasNotText: '' })
  const targetRow = rows.nth(rowIndex)

  // Find the collapse button
  const collapseButton = targetRow.locator('button[aria-label*="collapse"], button[aria-expanded="true"]').first()
  await collapseButton.click()
  await page.waitForTimeout(300)
}

/**
 * Expands an array row
 *
 * @param page - Playwright page instance
 * @param fieldName - Name of the array field
 * @param rowIndex - Zero-based index of the row
 */
export async function expandArrayRow(page: Page, fieldName: string, rowIndex: number) {
  const fieldContainer = page.locator(`[data-field="${fieldName}"], [id*="field-${fieldName}"], .field-type-array[class*="${fieldName}"]`).first()
  const rows = fieldContainer.locator('[class*="row"], [data-row], .array-row, [class*="collapsible"]').filter({ hasNotText: '' })
  const targetRow = rows.nth(rowIndex)

  // Find the expand button
  const expandButton = targetRow.locator('button[aria-label*="expand"], button[aria-expanded="false"]').first()
  await expandButton.click()
  await page.waitForTimeout(300)
}
