import { Page, Locator } from '@playwright/test'

/**
 * Helper functions for interacting with Payload's Lexical rich text editor
 */

/**
 * Fills a Lexical rich text editor with plain text content
 * Payload CMS uses Lexical editor which has a specific DOM structure
 *
 * @param page - Playwright page instance
 * @param content - Text content to insert
 * @param fieldName - Optional field name to target specific editor
 */
export async function fillRichText(page: Page, content: string, fieldName?: string) {
  let editor: Locator

  if (fieldName) {
    // Target specific editor by field name
    const fieldContainer = page.locator(`[data-field="${fieldName}"]`)
    editor = fieldContainer.locator('.lexical-content-editable, [contenteditable="true"]')
  } else {
    // Target first available editor
    editor = page.locator('.lexical-content-editable, [contenteditable="true"]').first()
  }

  // Click to focus the editor
  await editor.click()

  // Clear existing content
  await page.keyboard.press('Meta+A') // or Control+A on Windows
  await page.keyboard.press('Backspace')

  // Type the new content
  await editor.fill(content)

  // Wait for content to be set
  await page.waitForTimeout(100)
}

/**
 * Formats selected text in the Lexical editor
 * This is useful for applying bold, italic, etc.
 *
 * @param page - Playwright page instance
 * @param format - Format type: 'bold', 'italic', 'underline', 'strikethrough', 'code'
 */
export async function formatRichText(page: Page, format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') {
  const formatButtons = {
    bold: page.getByRole('button', { name: /bold/i }),
    italic: page.getByRole('button', { name: /italic/i }),
    underline: page.getByRole('button', { name: /underline/i }),
    strikethrough: page.getByRole('button', { name: /strikethrough/i }),
    code: page.getByRole('button', { name: /code/i }),
  }

  const button = formatButtons[format]
  if (button) {
    await button.click()
  }
}

/**
 * Inserts a heading in the Lexical editor
 *
 * @param page - Playwright page instance
 * @param level - Heading level (1-6)
 * @param text - Heading text
 */
export async function insertHeading(page: Page, level: 1 | 2 | 3 | 4 | 5 | 6, text: string) {
  // Open block type dropdown
  const blockTypeButton = page.getByRole('button', { name: /paragraph|heading/i })
  await blockTypeButton.click()

  // Select heading level
  const headingOption = page.getByRole('option', { name: new RegExp(`heading ${level}|h${level}`, 'i') })
  await headingOption.click()

  // Type heading text
  const editor = page.locator('.lexical-content-editable, [contenteditable="true"]').first()
  await editor.pressSequentially(text)
  await page.keyboard.press('Enter')
}

/**
 * Inserts a link in the Lexical editor
 *
 * @param page - Playwright page instance
 * @param url - Link URL
 * @param text - Link text (optional, uses URL if not provided)
 */
export async function insertLink(page: Page, url: string, text?: string) {
  const linkButton = page.getByRole('button', { name: /insert link|link/i })
  await linkButton.click()

  // Fill in URL
  const urlInput = page.locator('input[name="url"], input[placeholder*="url" i]')
  await urlInput.fill(url)

  // Fill in text if provided
  if (text) {
    const textInput = page.locator('input[name="text"], input[placeholder*="text" i]')
    await textInput.fill(text)
  }

  // Confirm
  const confirmButton = page.getByRole('button', { name: /confirm|insert|save/i })
  await confirmButton.click()
}

/**
 * Gets the plain text content from a Lexical editor
 *
 * @param page - Playwright page instance
 * @param fieldName - Optional field name to target specific editor
 * @returns Plain text content
 */
export async function getRichTextContent(page: Page, fieldName?: string): Promise<string> {
  let editor: Locator

  if (fieldName) {
    const fieldContainer = page.locator(`[data-field="${fieldName}"]`)
    editor = fieldContainer.locator('.lexical-content-editable, [contenteditable="true"]')
  } else {
    editor = page.locator('.lexical-content-editable, [contenteditable="true"]').first()
  }

  return (await editor.textContent()) || ''
}
