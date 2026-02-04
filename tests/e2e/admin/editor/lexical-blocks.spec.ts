import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import { formatRichText, getRichTextContent } from '../../helpers'

/**
 * CON-73: Lexical Editor Block Elements E2E Tests
 *
 * Tests the Lexical rich text editor block elements:
 * - Inline code formatting works
 * - Horizontal rules work
 * - Content preserved on save
 */

test.describe('Lexical Editor Block Elements', () => {
  // Use authenticated admin session for these tests
  test.use({ storageState: STORAGE_STATE })

  test.beforeEach(async ({ adminCollectionPage, adminEditorPage, page }) => {
    // Navigate to Posts collection and create new post
    await adminCollectionPage.goto('posts')
    await adminCollectionPage.clickCreateNew()

    // Fill in required fields for post creation
    await adminEditorPage.fillField('title', 'Test Post: Lexical Block Elements')
    await page.waitForTimeout(500) // Wait for slug generation

    const testSummary = 'A test post to verify that Lexical editor block elements like inline code and horizontal rules work correctly and persist across save operations.'
    await adminEditorPage.fillField('summary', testSummary)
  })

  test('should apply and preserve inline code formatting', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Type some text with inline code
    await editor.pressSequentially('Use the ')

    // Apply code formatting for inline code
    await formatRichText(page, 'code')
    await editor.pressSequentially('console.log()')
    await formatRichText(page, 'code') // Toggle off

    await editor.pressSequentially(' function to output messages.')

    // Verify code element is applied
    const codeElement = editor.locator('code')
    await expect(codeElement).toBeVisible()
    await expect(codeElement).toContainText('console.log()')

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify inline code formatting is preserved
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const codeElementAfterReload = editorAfterReload.locator('code')
    await expect(codeElementAfterReload).toBeVisible()
    await expect(codeElementAfterReload).toContainText('console.log()')

    // Verify the full text is preserved
    const content = await getRichTextContent(page, 'body')
    expect(content).toContain('Use the')
    expect(content).toContain('console.log()')
    expect(content).toContain('function to output messages')
  })

  test('should preserve multiple inline code elements', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Create text with multiple inline code snippets
    await editor.pressSequentially('The ')

    await formatRichText(page, 'code')
    await editor.pressSequentially('useState')
    await formatRichText(page, 'code')

    await editor.pressSequentially(' and ')

    await formatRichText(page, 'code')
    await editor.pressSequentially('useEffect')
    await formatRichText(page, 'code')

    await editor.pressSequentially(' hooks are essential.')

    // Verify both code elements exist
    const codeElements = editor.locator('code')
    await expect(codeElements).toHaveCount(2)
    await expect(codeElements.nth(0)).toContainText('useState')
    await expect(codeElements.nth(1)).toContainText('useEffect')

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify both code elements are preserved
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const codeElementsAfterReload = editorAfterReload.locator('code')
    await expect(codeElementsAfterReload).toHaveCount(2)
    await expect(codeElementsAfterReload.nth(0)).toContainText('useState')
    await expect(codeElementsAfterReload.nth(1)).toContainText('useEffect')
  })

  test('should insert and preserve horizontal rule', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Add some text before the rule
    await editor.pressSequentially('Text before the horizontal rule.')
    await page.keyboard.press('Enter')

    // Insert horizontal rule - try to find and click the button
    // The button might be labeled as "Horizontal Rule", "Divider", or have an HR icon
    const hrButton = page.getByRole('button', { name: /horizontal rule|divider|hr/i })
    await hrButton.click()

    // Verify hr element is created
    const hrElement = editor.locator('hr')
    await expect(hrElement).toBeVisible()

    // Add text after the rule (need to move cursor after the hr)
    await page.keyboard.press('ArrowDown')
    await editor.pressSequentially('Text after the horizontal rule.')

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify horizontal rule is preserved
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const hrElementAfterReload = editorAfterReload.locator('hr')
    await expect(hrElementAfterReload).toBeVisible()

    // Verify text before and after is preserved
    const content = await getRichTextContent(page, 'body')
    expect(content).toContain('Text before the horizontal rule')
    expect(content).toContain('Text after the horizontal rule')
  })

  test('should preserve multiple horizontal rules', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Add content with multiple horizontal rules
    await editor.pressSequentially('Section 1')
    await page.keyboard.press('Enter')

    // Insert first horizontal rule
    const hrButton = page.getByRole('button', { name: /horizontal rule|divider|hr/i })
    await hrButton.click()
    await page.keyboard.press('ArrowDown')

    await editor.pressSequentially('Section 2')
    await page.keyboard.press('Enter')

    // Insert second horizontal rule
    await hrButton.click()
    await page.keyboard.press('ArrowDown')

    await editor.pressSequentially('Section 3')

    // Verify multiple hr elements exist
    const hrElements = editor.locator('hr')
    await expect(hrElements).toHaveCount(2)

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify both horizontal rules are preserved
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const hrElementsAfterReload = editorAfterReload.locator('hr')
    await expect(hrElementsAfterReload).toHaveCount(2)

    // Verify section text is preserved
    const content = await getRichTextContent(page, 'body')
    expect(content).toContain('Section 1')
    expect(content).toContain('Section 2')
    expect(content).toContain('Section 3')
  })

  test('should preserve mixed content with inline code and horizontal rules', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Create complex content with both inline code and horizontal rules
    await editor.pressSequentially('First, import ')

    await formatRichText(page, 'code')
    await editor.pressSequentially('React')
    await formatRichText(page, 'code')

    await editor.pressSequentially(' from the package.')
    await page.keyboard.press('Enter')

    // Insert horizontal rule
    const hrButton = page.getByRole('button', { name: /horizontal rule|divider|hr/i })
    await hrButton.click()
    await page.keyboard.press('ArrowDown')

    await editor.pressSequentially('Then use ')

    await formatRichText(page, 'code')
    await editor.pressSequentially('useState')
    await formatRichText(page, 'code')

    await editor.pressSequentially(' in your component.')

    // Verify both elements exist
    const codeElements = editor.locator('code')
    await expect(codeElements).toHaveCount(2)

    const hrElement = editor.locator('hr')
    await expect(hrElement).toBeVisible()

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify all content is preserved
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()

    const codeElementsAfterReload = editorAfterReload.locator('code')
    await expect(codeElementsAfterReload).toHaveCount(2)
    await expect(codeElementsAfterReload.nth(0)).toContainText('React')
    await expect(codeElementsAfterReload.nth(1)).toContainText('useState')

    const hrElementAfterReload = editorAfterReload.locator('hr')
    await expect(hrElementAfterReload).toBeVisible()

    const content = await getRichTextContent(page, 'body')
    expect(content).toContain('First, import')
    expect(content).toContain('React')
    expect(content).toContain('Then use')
    expect(content).toContain('useState')
  })

  test('should preserve inline code with special characters', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Type text with special characters in inline code
    await editor.pressSequentially('Access the data with ')

    await formatRichText(page, 'code')
    await editor.pressSequentially('obj.prop["key"]')
    await formatRichText(page, 'code')

    await editor.pressSequentially(' notation.')

    // Verify code element contains special characters
    const codeElement = editor.locator('code')
    await expect(codeElement).toBeVisible()
    await expect(codeElement).toContainText('obj.prop["key"]')

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify special characters are preserved
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const codeElementAfterReload = editorAfterReload.locator('code')
    await expect(codeElementAfterReload).toBeVisible()
    await expect(codeElementAfterReload).toContainText('obj.prop["key"]')
  })
})
