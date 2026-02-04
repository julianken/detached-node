import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import { fillRichText, formatRichText, insertHeading, getRichTextContent } from '../../helpers'

/**
 * CON-71: Lexical Editor Formatting E2E Tests
 *
 * Tests the Lexical rich text editor formatting capabilities:
 * - Bold text formatting works
 * - Italic text formatting works
 * - Heading levels (H1-H6) available
 * - Unordered lists work
 * - Ordered lists work
 * - Blockquotes work
 * - Content preserved on save and reload
 */

test.describe('Lexical Editor Formatting', () => {
  // Use authenticated admin session for these tests
  test.use({ storageState: STORAGE_STATE })

  test.beforeEach(async ({ adminCollectionPage, adminEditorPage, page }) => {
    // Navigate to Posts collection and create new post
    await adminCollectionPage.goto('posts')
    await adminCollectionPage.clickCreateNew()

    // Fill in required fields for post creation
    await adminEditorPage.fillField('title', 'Test Post: Lexical Formatting')
    await page.waitForTimeout(500) // Wait for slug generation

    const testSummary = 'A test post to verify that Lexical editor formatting features work correctly and persist across save operations.'
    await adminEditorPage.fillField('summary', testSummary)
  })

  test('should apply and preserve bold formatting', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Type some text
    await editor.pressSequentially('This text will be bold.')

    // Select all the text
    await page.keyboard.press('Meta+A')

    // Apply bold formatting
    await formatRichText(page, 'bold')

    // Verify bold is applied (check for <strong> tag or bold class)
    const boldElement = editor.locator('strong, [style*="font-weight"]')
    await expect(boldElement).toBeVisible()

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify bold formatting is preserved
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const boldElementAfterReload = editorAfterReload.locator('strong, [style*="font-weight"]')
    await expect(boldElementAfterReload).toBeVisible()
    await expect(boldElementAfterReload).toContainText('This text will be bold.')
  })

  test('should apply and preserve italic formatting', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Type some text
    await editor.pressSequentially('This text will be italic.')

    // Select all the text
    await page.keyboard.press('Meta+A')

    // Apply italic formatting
    await formatRichText(page, 'italic')

    // Verify italic is applied (check for <em> or <i> tag)
    const italicElement = editor.locator('em, i, [style*="font-style"]')
    await expect(italicElement).toBeVisible()

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify italic formatting is preserved
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const italicElementAfterReload = editorAfterReload.locator('em, i, [style*="font-style"]')
    await expect(italicElementAfterReload).toBeVisible()
    await expect(italicElementAfterReload).toContainText('This text will be italic.')
  })

  test('should create and preserve H2 heading', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Insert H2 heading using the helper
    await insertHeading(page, 2, 'Test Heading Level 2')

    // Verify H2 is created
    const h2Element = editor.locator('h2')
    await expect(h2Element).toBeVisible()
    await expect(h2Element).toContainText('Test Heading Level 2')

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify H2 is preserved
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const h2ElementAfterReload = editorAfterReload.locator('h2')
    await expect(h2ElementAfterReload).toBeVisible()
    await expect(h2ElementAfterReload).toContainText('Test Heading Level 2')
  })

  test('should create and preserve unordered (bulleted) list', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Type first list item
    await editor.pressSequentially('First bullet point')

    // Find and click the unordered list button
    const bulletListButton = page.getByRole('button', { name: /bullet list|unordered list|ul/i })
    await bulletListButton.click()

    // Verify ul/li is created
    const ulElement = editor.locator('ul')
    await expect(ulElement).toBeVisible()

    const firstLi = editor.locator('ul li').first()
    await expect(firstLi).toContainText('First bullet point')

    // Add second list item
    await page.keyboard.press('Enter')
    await editor.pressSequentially('Second bullet point')

    // Add third list item
    await page.keyboard.press('Enter')
    await editor.pressSequentially('Third bullet point')

    // Verify all list items
    const allListItems = editor.locator('ul li')
    await expect(allListItems).toHaveCount(3)

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify list is preserved
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const ulElementAfterReload = editorAfterReload.locator('ul')
    await expect(ulElementAfterReload).toBeVisible()

    const listItemsAfterReload = editorAfterReload.locator('ul li')
    await expect(listItemsAfterReload).toHaveCount(3)
    await expect(listItemsAfterReload.nth(0)).toContainText('First bullet point')
    await expect(listItemsAfterReload.nth(1)).toContainText('Second bullet point')
    await expect(listItemsAfterReload.nth(2)).toContainText('Third bullet point')
  })

  test('should create and preserve ordered (numbered) list', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Type first list item
    await editor.pressSequentially('First numbered item')

    // Find and click the ordered list button
    const numberedListButton = page.getByRole('button', { name: /numbered list|ordered list|ol/i })
    await numberedListButton.click()

    // Verify ol/li is created
    const olElement = editor.locator('ol')
    await expect(olElement).toBeVisible()

    const firstLi = editor.locator('ol li').first()
    await expect(firstLi).toContainText('First numbered item')

    // Add second list item
    await page.keyboard.press('Enter')
    await editor.pressSequentially('Second numbered item')

    // Add third list item
    await page.keyboard.press('Enter')
    await editor.pressSequentially('Third numbered item')

    // Verify all list items
    const allListItems = editor.locator('ol li')
    await expect(allListItems).toHaveCount(3)

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify list is preserved
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const olElementAfterReload = editorAfterReload.locator('ol')
    await expect(olElementAfterReload).toBeVisible()

    const listItemsAfterReload = editorAfterReload.locator('ol li')
    await expect(listItemsAfterReload).toHaveCount(3)
    await expect(listItemsAfterReload.nth(0)).toContainText('First numbered item')
    await expect(listItemsAfterReload.nth(1)).toContainText('Second numbered item')
    await expect(listItemsAfterReload.nth(2)).toContainText('Third numbered item')
  })

  test('should create and preserve blockquote', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Type quote text
    await editor.pressSequentially('This is a blockquote containing important cited text.')

    // Select all the text
    await page.keyboard.press('Meta+A')

    // Find and click the blockquote button
    const blockquoteButton = page.getByRole('button', { name: /quote|blockquote/i })
    await blockquoteButton.click()

    // Verify blockquote is created
    const blockquoteElement = editor.locator('blockquote')
    await expect(blockquoteElement).toBeVisible()
    await expect(blockquoteElement).toContainText('This is a blockquote containing important cited text.')

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify blockquote is preserved
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const blockquoteElementAfterReload = editorAfterReload.locator('blockquote')
    await expect(blockquoteElementAfterReload).toBeVisible()
    await expect(blockquoteElementAfterReload).toContainText('This is a blockquote containing important cited text.')
  })

  test('should preserve mixed formatting (bold + italic in list)', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Create a list item with mixed formatting
    await editor.pressSequentially('This item has ')

    // Add bold text
    const boldButton = page.getByRole('button', { name: /bold/i })
    await boldButton.click()
    await editor.pressSequentially('bold')
    await boldButton.click() // toggle off

    await editor.pressSequentially(' and ')

    // Add italic text
    const italicButton = page.getByRole('button', { name: /italic/i })
    await italicButton.click()
    await editor.pressSequentially('italic')
    await italicButton.click() // toggle off

    await editor.pressSequentially(' formatting.')

    // Convert to bullet list
    const bulletListButton = page.getByRole('button', { name: /bullet list|unordered list|ul/i })
    await bulletListButton.click()

    // Verify mixed formatting in list
    const listItem = editor.locator('ul li').first()
    await expect(listItem).toContainText('This item has bold and italic formatting.')

    const boldInList = listItem.locator('strong, [style*="font-weight"]')
    await expect(boldInList).toContainText('bold')

    const italicInList = listItem.locator('em, i, [style*="font-style"]')
    await expect(italicInList).toContainText('italic')

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify mixed formatting is preserved
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const listItemAfterReload = editorAfterReload.locator('ul li').first()
    await expect(listItemAfterReload).toContainText('This item has bold and italic formatting.')

    const boldInListAfterReload = listItemAfterReload.locator('strong, [style*="font-weight"]')
    await expect(boldInListAfterReload).toContainText('bold')

    const italicInListAfterReload = listItemAfterReload.locator('em, i, [style*="font-style"]')
    await expect(italicInListAfterReload).toContainText('italic')
  })
})
