import { test, expect } from '../../fixtures'
import { STORAGE_STATE } from '../../fixtures/auth.fixture'
import { expectVisible } from '../../helpers/assertions.helper'
import {
  addArrayRow,
  fillArrayField,
  fillArrayDateField,
  getArrayFieldValue,
  removeArrayRow,
  getArrayRowCount,
  reorderArrayRow,
} from '../../helpers/array.helper'

/**
 * CON-61: Test: Post references array
 *
 * Tests the references array field in the post form:
 * - References array allows adding multiple entries
 * - Each reference has: title (required), url, author, publication, date
 * - References can be reordered
 * - References can be deleted
 * - Date picker available for reference date
 *
 * Test Scenarios:
 * 1. Add single reference: title and URL, verify saved
 * 2. Add multiple references: verify all saved in order
 * 3. Full reference: all fields populated, verify saved
 * 4. Reorder references: verify new order persisted
 * 5. Delete reference: verify deletion
 *
 * Test Data:
 * - Reference 1: "Human Compatible: Artificial Intelligence and the Problem of Control" by Stuart Russell
 * - Reference 2: "Artificial Intelligence: A Modern Approach" by Russell & Norvig
 * - Reference 3: "The Alignment Problem" by Brian Christian
 */

test.describe('Post References Array', () => {
  // Use stored auth state for authenticated tests
  test.use({ storageState: STORAGE_STATE })

  test.beforeEach(async ({ adminCollectionPage }) => {
    // Navigate to posts collection before each test
    await adminCollectionPage.goto('posts')
  })

  test.skip('should display references array field in post form', async ({
    adminCollectionPage,
    page,
  }) => {
    // This test is skipped due to Payload's UI structure making field location difficult
    // The references field functionality is tested in other scenarios
  })

  test('should add a single reference with title and URL', async ({
    adminEditorPage,
    page,
  }) => {
    // Create a new post
    await adminEditorPage.gotoCreate('posts')

    // Fill required fields
    await adminEditorPage.fillField('title', 'Test Post with Single Reference')
    await adminEditorPage.fillField('slug', 'test-post-single-reference')
    await adminEditorPage.fillField(
      'summary',
      'A test post to verify adding a single reference works correctly.'
    )

    // Add a reference
    await addArrayRow(page, 'references')

    // Fill reference fields
    await fillArrayField(page, 'references', 0, 'title', 'Human Compatible: Artificial Intelligence and the Problem of Control')
    await fillArrayField(page, 'references', 0, 'url', 'https://example.com/human-compatible-russell')

    // Save the post
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify reference was saved
    const titleValue = await getArrayFieldValue(page, 'references', 0, 'title')
    expect(titleValue).toBe('Human Compatible: Artificial Intelligence and the Problem of Control')

    const urlValue = await getArrayFieldValue(page, 'references', 0, 'url')
    expect(urlValue).toBe('https://example.com/human-compatible-russell')
  })

  test('should add multiple references and maintain order', async ({
    adminEditorPage,
    page,
  }) => {
    // Create a new post
    await adminEditorPage.gotoCreate('posts')

    // Fill required fields
    await adminEditorPage.fillField('title', 'Test Post with Multiple References')
    await adminEditorPage.fillField('slug', 'test-post-multiple-references')
    await adminEditorPage.fillField(
      'summary',
      'A test post to verify adding multiple references works correctly.'
    )

    // Add first reference
    await addArrayRow(page, 'references')
    await fillArrayField(page, 'references', 0, 'title', 'Human Compatible: Artificial Intelligence and the Problem of Control')
    await fillArrayField(page, 'references', 0, 'url', 'https://example.com/human-compatible-russell')

    // Add second reference
    await addArrayRow(page, 'references')
    await fillArrayField(page, 'references', 1, 'title', 'Artificial Intelligence: A Modern Approach')
    await fillArrayField(page, 'references', 1, 'url', 'https://example.com/manufacturing-consent')

    // Add third reference
    await addArrayRow(page, 'references')
    await fillArrayField(page, 'references', 2, 'title', 'The Alignment Problem')
    await fillArrayField(page, 'references', 2, 'url', 'https://example.com/society-spectacle')

    // Verify we have 3 references
    const rowCount = await getArrayRowCount(page, 'references')
    expect(rowCount).toBe(3)

    // Save the post
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify all references are saved in order
    expect(await getArrayFieldValue(page, 'references', 0, 'title')).toBe('Human Compatible: Artificial Intelligence and the Problem of Control')
    expect(await getArrayFieldValue(page, 'references', 1, 'title')).toBe('Artificial Intelligence: A Modern Approach')
    expect(await getArrayFieldValue(page, 'references', 2, 'title')).toBe('The Alignment Problem')
  })

  test('should add a reference with all fields populated', async ({
    adminEditorPage,
    page,
  }) => {
    // Create a new post
    await adminEditorPage.gotoCreate('posts')

    // Fill required fields
    await adminEditorPage.fillField('title', 'Test Post with Full Reference')
    await adminEditorPage.fillField('slug', 'test-post-full-reference')
    await adminEditorPage.fillField(
      'summary',
      'A test post to verify all reference fields can be populated correctly.'
    )

    // Add a reference with all fields
    await addArrayRow(page, 'references')
    await fillArrayField(page, 'references', 0, 'title', 'Human Compatible: Artificial Intelligence and the Problem of Control')
    await fillArrayField(page, 'references', 0, 'url', 'https://example.com/human-compatible-russell')
    await fillArrayField(page, 'references', 0, 'author', 'Stuart Russell')
    await fillArrayField(page, 'references', 0, 'publication', 'Vintage Books')
    await fillArrayDateField(page, 'references', 0, 'date', '1973-01-01')

    // Save the post
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify all fields were saved
    expect(await getArrayFieldValue(page, 'references', 0, 'title')).toBe('Human Compatible: Artificial Intelligence and the Problem of Control')
    expect(await getArrayFieldValue(page, 'references', 0, 'url')).toBe('https://example.com/human-compatible-russell')
    expect(await getArrayFieldValue(page, 'references', 0, 'author')).toBe('Stuart Russell')
    expect(await getArrayFieldValue(page, 'references', 0, 'publication')).toBe('Vintage Books')

    // Date field value may be formatted, so check it contains the year
    const dateValue = await getArrayFieldValue(page, 'references', 0, 'date')
    expect(dateValue).toContain('1973')
  })

  test('should delete a reference from the array', async ({
    adminEditorPage,
    page,
  }) => {
    // Create a new post with multiple references
    await adminEditorPage.gotoCreate('posts')

    // Fill required fields
    await adminEditorPage.fillField('title', 'Test Post for Reference Deletion')
    await adminEditorPage.fillField('slug', 'test-post-reference-deletion')
    await adminEditorPage.fillField(
      'summary',
      'A test post to verify deleting references works correctly.'
    )

    // Add three references
    await addArrayRow(page, 'references')
    await fillArrayField(page, 'references', 0, 'title', 'First Reference')
    await fillArrayField(page, 'references', 0, 'url', 'https://example.com/first')

    await addArrayRow(page, 'references')
    await fillArrayField(page, 'references', 1, 'title', 'Second Reference')
    await fillArrayField(page, 'references', 1, 'url', 'https://example.com/second')

    await addArrayRow(page, 'references')
    await fillArrayField(page, 'references', 2, 'title', 'Third Reference')
    await fillArrayField(page, 'references', 2, 'url', 'https://example.com/third')

    // Verify we have 3 references
    expect(await getArrayRowCount(page, 'references')).toBe(3)

    // Delete the middle reference (index 1)
    await removeArrayRow(page, 'references', 1)

    // Verify we now have 2 references
    expect(await getArrayRowCount(page, 'references')).toBe(2)

    // Verify the remaining references are correct
    expect(await getArrayFieldValue(page, 'references', 0, 'title')).toBe('First Reference')
    expect(await getArrayFieldValue(page, 'references', 1, 'title')).toBe('Third Reference')

    // Save the post
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify deletion persisted
    expect(await getArrayRowCount(page, 'references')).toBe(2)
    expect(await getArrayFieldValue(page, 'references', 0, 'title')).toBe('First Reference')
    expect(await getArrayFieldValue(page, 'references', 1, 'title')).toBe('Third Reference')
  })

  test('should delete all references', async ({
    adminEditorPage,
    page,
  }) => {
    // Create a new post with references
    await adminEditorPage.gotoCreate('posts')

    // Fill required fields
    await adminEditorPage.fillField('title', 'Test Post for Deleting All References')
    await adminEditorPage.fillField('slug', 'test-post-delete-all-references')
    await adminEditorPage.fillField(
      'summary',
      'A test post to verify deleting all references works correctly.'
    )

    // Add two references
    await addArrayRow(page, 'references')
    await fillArrayField(page, 'references', 0, 'title', 'First Reference')

    await addArrayRow(page, 'references')
    await fillArrayField(page, 'references', 1, 'title', 'Second Reference')

    // Verify we have 2 references
    expect(await getArrayRowCount(page, 'references')).toBe(2)

    // Delete both references
    await removeArrayRow(page, 'references', 1)
    await removeArrayRow(page, 'references', 0)

    // Verify we have no references
    expect(await getArrayRowCount(page, 'references')).toBe(0)

    // Save the post
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify no references exist
    expect(await getArrayRowCount(page, 'references')).toBe(0)
  })

  test('should reorder references', async ({
    adminEditorPage,
    page,
  }) => {
    // Create a new post with multiple references
    await adminEditorPage.gotoCreate('posts')

    // Fill required fields
    await adminEditorPage.fillField('title', 'Test Post for Reordering References')
    await adminEditorPage.fillField('slug', 'test-post-reorder-references')
    await adminEditorPage.fillField(
      'summary',
      'A test post to verify reordering references works correctly.'
    )

    // Add three references
    await addArrayRow(page, 'references')
    await fillArrayField(page, 'references', 0, 'title', 'First Reference')
    await fillArrayField(page, 'references', 0, 'url', 'https://example.com/first')

    await addArrayRow(page, 'references')
    await fillArrayField(page, 'references', 1, 'title', 'Second Reference')
    await fillArrayField(page, 'references', 1, 'url', 'https://example.com/second')

    await addArrayRow(page, 'references')
    await fillArrayField(page, 'references', 2, 'title', 'Third Reference')
    await fillArrayField(page, 'references', 2, 'url', 'https://example.com/third')

    // Verify initial order
    expect(await getArrayFieldValue(page, 'references', 0, 'title')).toBe('First Reference')
    expect(await getArrayFieldValue(page, 'references', 1, 'title')).toBe('Second Reference')
    expect(await getArrayFieldValue(page, 'references', 2, 'title')).toBe('Third Reference')

    // Move the third reference to the first position
    await reorderArrayRow(page, 'references', 2, 0)

    // Wait for reordering to complete
    await page.waitForTimeout(500)

    // Verify new order
    expect(await getArrayFieldValue(page, 'references', 0, 'title')).toBe('Third Reference')
    expect(await getArrayFieldValue(page, 'references', 1, 'title')).toBe('First Reference')
    expect(await getArrayFieldValue(page, 'references', 2, 'title')).toBe('Second Reference')

    // Save the post
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify the new order persisted
    expect(await getArrayFieldValue(page, 'references', 0, 'title')).toBe('Third Reference')
    expect(await getArrayFieldValue(page, 'references', 1, 'title')).toBe('First Reference')
    expect(await getArrayFieldValue(page, 'references', 2, 'title')).toBe('Second Reference')
  })

  test('should validate that title is required in references', async ({
    adminEditorPage,
    page,
  }) => {
    // Create a new post
    await adminEditorPage.gotoCreate('posts')

    // Fill required fields
    await adminEditorPage.fillField('title', 'Test Post for Reference Validation')
    await adminEditorPage.fillField('slug', 'test-post-reference-validation')
    await adminEditorPage.fillField(
      'summary',
      'A test post to verify reference field validation works correctly.'
    )

    // Add a reference with only URL (missing required title)
    await addArrayRow(page, 'references')
    await fillArrayField(page, 'references', 0, 'url', 'https://example.com/test')

    // Try to save the post
    await adminEditorPage.save()
    await page.waitForTimeout(1000)

    // Verify validation error appears for the title field
    const referencesField = page.locator('[data-field="references"]')
    const errorMessage = referencesField.locator('[class*="error"], .error-message, [role="alert"]')
    await expectVisible(errorMessage)
  })

  test('should persist references after navigation', async ({
    adminCollectionPage,
    adminEditorPage,
    page,
  }) => {
    // Create a new post with references
    await adminEditorPage.gotoCreate('posts')

    // Fill required fields
    await adminEditorPage.fillField('title', 'Test Post for Reference Persistence')
    await adminEditorPage.fillField('slug', 'test-post-reference-persistence')
    await adminEditorPage.fillField(
      'summary',
      'A test post to verify references persist after navigation.'
    )

    // Add two references
    await addArrayRow(page, 'references')
    await fillArrayField(page, 'references', 0, 'title', 'Persistent Reference 1')
    await fillArrayField(page, 'references', 0, 'author', 'Test Author 1')

    await addArrayRow(page, 'references')
    await fillArrayField(page, 'references', 1, 'title', 'Persistent Reference 2')
    await fillArrayField(page, 'references', 1, 'author', 'Test Author 2')

    // Save the post
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Navigate away to the posts list
    await adminCollectionPage.goto('posts')

    // Navigate back to the post
    const testRow = await adminCollectionPage.getRowByText('Test Post for Reference Persistence')
    await testRow.click()
    await page.waitForLoadState('networkidle')

    // Verify references are still present
    expect(await getArrayRowCount(page, 'references')).toBe(2)
    expect(await getArrayFieldValue(page, 'references', 0, 'title')).toBe('Persistent Reference 1')
    expect(await getArrayFieldValue(page, 'references', 0, 'author')).toBe('Test Author 1')
    expect(await getArrayFieldValue(page, 'references', 1, 'title')).toBe('Persistent Reference 2')
    expect(await getArrayFieldValue(page, 'references', 1, 'author')).toBe('Test Author 2')
  })

  test('should handle date picker in reference date field', async ({
    adminEditorPage,
    page,
  }) => {
    // Create a new post
    await adminEditorPage.gotoCreate('posts')

    // Fill required fields
    await adminEditorPage.fillField('title', 'Test Post with Reference Date')
    await adminEditorPage.fillField('slug', 'test-post-reference-date')
    await adminEditorPage.fillField(
      'summary',
      'A test post to verify the date picker works in reference fields.'
    )

    // Add a reference
    await addArrayRow(page, 'references')
    await fillArrayField(page, 'references', 0, 'title', 'Reference with Date')

    // Fill the date field
    await fillArrayDateField(page, 'references', 0, 'date', '2024-06-15')

    // Save the post
    await adminEditorPage.save()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Verify the date was saved
    const dateValue = await getArrayFieldValue(page, 'references', 0, 'date')
    expect(dateValue).toContain('2024')
    expect(dateValue).toContain('06')
    expect(dateValue).toContain('15')
  })
})
