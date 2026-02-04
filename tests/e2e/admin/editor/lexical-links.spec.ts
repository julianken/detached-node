import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import { insertLink, getRichTextContent } from '../../helpers'

/**
 * CON-72: Lexical Editor Links E2E Tests
 *
 * Tests the Lexical rich text editor link functionality:
 * - Can insert links with URL
 * - Can set link text
 * - Links preserved on save
 * - Can edit existing links
 * - Can remove links
 *
 * Test Scenarios:
 * 1. Insert link: add URL and text, save, verify preserved
 * 2. Edit link: change URL, save, verify update
 * 3. Remove link: remove link formatting, verify removal
 */

test.describe('Lexical Editor Links', () => {
  // Use authenticated admin session for these tests
  test.use({ storageState: STORAGE_STATE })

  test.beforeEach(async ({ adminCollectionPage, adminEditorPage, page }) => {
    // Navigate to Posts collection and create new post
    await adminCollectionPage.goto('posts')
    await adminCollectionPage.clickCreateNew()

    // Fill in required fields for post creation
    await adminEditorPage.fillField('title', 'Test Post: Lexical Links')
    await page.waitForTimeout(500) // Wait for slug generation

    const testSummary = 'A test post to verify that Lexical editor link features work correctly and persist across save operations.'
    await adminEditorPage.fillField('summary', testSummary)
  })

  test('should insert a link with URL and text', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Type some text first
    await editor.pressSequentially('Check out ')

    // Insert link with custom text
    await insertLink(page, 'https://example.com', 'this example site')

    // Verify link is inserted
    const linkElement = editor.locator('a[href="https://example.com"]')
    await expect(linkElement).toBeVisible()
    await expect(linkElement).toContainText('this example site')

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify link is preserved after reload
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const linkAfterReload = editorAfterReload.locator('a[href="https://example.com"]')
    await expect(linkAfterReload).toBeVisible()
    await expect(linkAfterReload).toContainText('this example site')
  })

  test('should insert a link with URL only (no custom text)', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Type some text first
    await editor.pressSequentially('Visit ')

    // Insert link without custom text (should use URL as text)
    await insertLink(page, 'https://example.com')

    // Verify link is inserted
    const linkElement = editor.locator('a[href="https://example.com"]')
    await expect(linkElement).toBeVisible()

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify link is preserved after reload
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const linkAfterReload = editorAfterReload.locator('a[href="https://example.com"]')
    await expect(linkAfterReload).toBeVisible()
  })

  test('should preserve multiple links in content', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Insert first link
    await editor.pressSequentially('Visit ')
    await insertLink(page, 'https://example.com', 'Example')

    // Continue typing
    await editor.pressSequentially(' or check out ')

    // Insert second link
    await insertLink(page, 'https://test.com', 'Test Site')

    // Continue typing
    await editor.pressSequentially(' for more information.')

    // Verify both links are present
    const link1 = editor.locator('a[href="https://example.com"]')
    const link2 = editor.locator('a[href="https://test.com"]')
    await expect(link1).toBeVisible()
    await expect(link2).toBeVisible()
    await expect(link1).toContainText('Example')
    await expect(link2).toContainText('Test Site')

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify both links are preserved
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const link1AfterReload = editorAfterReload.locator('a[href="https://example.com"]')
    const link2AfterReload = editorAfterReload.locator('a[href="https://test.com"]')
    await expect(link1AfterReload).toBeVisible()
    await expect(link2AfterReload).toBeVisible()
    await expect(link1AfterReload).toContainText('Example')
    await expect(link2AfterReload).toContainText('Test Site')
  })

  test('should edit an existing link URL', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Insert initial link
    await editor.pressSequentially('Visit ')
    await insertLink(page, 'https://example.com', 'this site')

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify initial link
    const initialLink = editor.locator('a[href="https://example.com"]')
    await expect(initialLink).toBeVisible()

    // Click on the link to select it
    await initialLink.click()

    // Wait a moment for the link toolbar to appear
    await page.waitForTimeout(300)

    // Look for the edit link button in the toolbar
    const editLinkButton = page.getByRole('button', { name: /edit link|edit/i }).first()
    await editLinkButton.click()

    // Clear and update the URL
    const urlInput = page.locator('input[name="url"], input[placeholder*="url" i]')
    await urlInput.fill('https://updated-example.com')

    // Confirm the change
    const confirmButton = page.getByRole('button', { name: /confirm|save|update/i })
    await confirmButton.click()

    // Verify the link URL is updated
    const updatedLink = editor.locator('a[href="https://updated-example.com"]')
    await expect(updatedLink).toBeVisible()
    await expect(updatedLink).toContainText('this site')

    // Save the post again
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify the updated link is preserved
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const linkAfterReload = editorAfterReload.locator('a[href="https://updated-example.com"]')
    await expect(linkAfterReload).toBeVisible()
    await expect(linkAfterReload).toContainText('this site')

    // Verify old URL is gone
    const oldLink = editorAfterReload.locator('a[href="https://example.com"]')
    await expect(oldLink).not.toBeVisible()
  })

  test('should edit link text', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Insert initial link
    await editor.pressSequentially('Visit ')
    await insertLink(page, 'https://example.com', 'original text')

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Verify initial link
    const initialLink = editor.locator('a[href="https://example.com"]')
    await expect(initialLink).toContainText('original text')

    // Click on the link to select it
    await initialLink.click()

    // Wait a moment for the link toolbar to appear
    await page.waitForTimeout(300)

    // Look for the edit link button in the toolbar
    const editLinkButton = page.getByRole('button', { name: /edit link|edit/i }).first()
    await editLinkButton.click()

    // Update the link text
    const textInput = page.locator('input[name="text"], input[placeholder*="text" i]')
    await textInput.fill('updated link text')

    // Confirm the change
    const confirmButton = page.getByRole('button', { name: /confirm|save|update/i })
    await confirmButton.click()

    // Verify the link text is updated
    const updatedLink = editor.locator('a[href="https://example.com"]')
    await expect(updatedLink).toContainText('updated link text')

    // Save the post again
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify the updated link text is preserved
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const linkAfterReload = editorAfterReload.locator('a[href="https://example.com"]')
    await expect(linkAfterReload).toBeVisible()
    await expect(linkAfterReload).toContainText('updated link text')
  })

  test('should remove link formatting', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Insert a link
    await editor.pressSequentially('Visit ')
    await insertLink(page, 'https://example.com', 'this site')
    await editor.pressSequentially(' for more info.')

    // Verify link exists
    const link = editor.locator('a[href="https://example.com"]')
    await expect(link).toBeVisible()

    // Get initial content
    const initialContent = await getRichTextContent(page, 'body')
    expect(initialContent).toContain('this site')

    // Click on the link to select it
    await link.click()

    // Wait for the link toolbar to appear
    await page.waitForTimeout(300)

    // Look for the remove/unlink button in the toolbar
    const removeLinkButton = page.getByRole('button', { name: /remove link|unlink|remove/i }).first()
    await removeLinkButton.click()

    // Verify link is removed but text remains
    await expect(link).not.toBeVisible()
    const contentAfterRemoval = await getRichTextContent(page, 'body')
    expect(contentAfterRemoval).toContain('this site') // Text should still be there
    expect(contentAfterRemoval).toContain('Visit this site for more info.')

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify link removal is preserved (link should still be gone)
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const linkAfterReload = editorAfterReload.locator('a[href="https://example.com"]')
    await expect(linkAfterReload).not.toBeVisible()

    // But text should still be present
    const contentAfterReload = await getRichTextContent(page, 'body')
    expect(contentAfterReload).toContain('this site')
  })

  test('should preserve links with other formatting (bold, italic)', async ({ adminEditorPage, page }) => {
    // Get editor
    const editor = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    await editor.click()

    // Type some text with bold formatting
    const boldButton = page.getByRole('button', { name: /bold/i })
    await boldButton.click()
    await editor.pressSequentially('This is bold text with ')
    await boldButton.click() // toggle off

    // Insert a link
    await insertLink(page, 'https://example.com', 'a link')

    // Continue with italic formatting
    const italicButton = page.getByRole('button', { name: /italic/i })
    await italicButton.click()
    await editor.pressSequentially(' and italic text')
    await italicButton.click() // toggle off

    // Verify bold, link, and italic elements exist
    const boldElement = editor.locator('strong, [style*="font-weight"]')
    const linkElement = editor.locator('a[href="https://example.com"]')
    const italicElement = editor.locator('em, i, [style*="font-style"]')

    await expect(boldElement).toBeVisible()
    await expect(linkElement).toBeVisible()
    await expect(italicElement).toBeVisible()

    await expect(boldElement).toContainText('This is bold text')
    await expect(linkElement).toContainText('a link')
    await expect(italicElement).toContainText('and italic text')

    // Save the post
    await adminEditorPage.save()
    await page.waitForURL(/\/admin\/collections\/posts\/[a-f0-9-]+/, { timeout: 10000 })

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Verify all formatting is preserved
    const editorAfterReload = page.locator('[data-field="body"] .lexical-content-editable, [data-field="body"] [contenteditable="true"]').first()
    const boldAfterReload = editorAfterReload.locator('strong, [style*="font-weight"]')
    const linkAfterReload = editorAfterReload.locator('a[href="https://example.com"]')
    const italicAfterReload = editorAfterReload.locator('em, i, [style*="font-style"]')

    await expect(boldAfterReload).toBeVisible()
    await expect(linkAfterReload).toBeVisible()
    await expect(italicAfterReload).toBeVisible()

    await expect(linkAfterReload).toContainText('a link')
  })
})
