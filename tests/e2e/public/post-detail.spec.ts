import { test } from '../fixtures'
import { expectVisible, expectTitle } from '../helpers'

/**
 * E2E tests for individual post detail page (CON-41)
 * Tests verify that post pages load correctly with all metadata and content
 *
 * Test data from seed-test-db.ts:
 * - "The Architecture of Persuasion" (essay) - slug: architecture-of-persuasion
 * - "Decoding Corporate Newspeak" (decoder) - slug: decoding-corporate-newspeak
 * - "Notes from the Attention Economy" (field-report) - slug: notes-attention-economy
 * - "Essential Readings on Mind Control" (index) - slug: essential-readings-mind-control
 */

test.describe('Post Detail Page', () => {
  test('should display Essay post type badge for essay posts', async ({ postDetailPage }) => {
    await postDetailPage.goto('architecture-of-persuasion')

    // Verify page title metadata
    await expectTitle(postDetailPage.page, /The Architecture of Persuasion/)

    // Verify post type badge displays "Essay"
    await expectVisible(postDetailPage.postType)
    const postType = await postDetailPage.getPostType()
    test.expect(postType?.toUpperCase()).toContain('ESSAY')

    // Verify title displays
    await expectVisible(postDetailPage.postTitle)
    const title = await postDetailPage.getPostTitle()
    test.expect(title).toBe('The Architecture of Persuasion')

    // Verify published date displays
    await expectVisible(postDetailPage.postDate)
    const date = await postDetailPage.getPostDate()
    test.expect(date).toMatch(/January (14|15), 2026/)

    // Verify summary displays
    await expectVisible(postDetailPage.postSummary)
    const summary = await postDetailPage.getPostSummary()
    test.expect(summary).toContain('exploration of how modern persuasion techniques')
  })

  test('should display Decoder post type badge for decoder posts', async ({ postDetailPage }) => {
    await postDetailPage.goto('decoding-corporate-newspeak')

    // Verify page title metadata
    await expectTitle(postDetailPage.page, /Decoding Corporate Newspeak/)

    // Verify post type badge displays "Decoder"
    await expectVisible(postDetailPage.postType)
    const postType = await postDetailPage.getPostType()
    test.expect(postType?.toUpperCase()).toContain('DECODER')

    // Verify title displays
    await expectVisible(postDetailPage.postTitle)
    const title = await postDetailPage.getPostTitle()
    test.expect(title).toBe('Decoding Corporate Newspeak')

    // Verify published date displays
    await expectVisible(postDetailPage.postDate)
    const date = await postDetailPage.getPostDate()
    test.expect(date).toMatch(/January (19|20), 2026/)

    // Verify summary displays
    await expectVisible(postDetailPage.postSummary)
    const summary = await postDetailPage.getPostSummary()
    test.expect(summary).toContain('systematic breakdown of corporate language patterns')
  })

  test('should display Field Report post type badge for field-report posts', async ({
    postDetailPage,
  }) => {
    await postDetailPage.goto('notes-attention-economy')

    // Verify page title metadata
    await expectTitle(postDetailPage.page, /Notes from the Attention Economy/)

    // Verify post type badge displays "Field Report"
    await expectVisible(postDetailPage.postType)
    const postType = await postDetailPage.getPostType()
    test.expect(postType?.toUpperCase()).toContain('FIELD REPORT')

    // Verify title displays
    await expectVisible(postDetailPage.postTitle)
    const title = await postDetailPage.getPostTitle()
    test.expect(title).toBe('Notes from the Attention Economy')

    // Verify published date displays
    await expectVisible(postDetailPage.postDate)
    const date = await postDetailPage.getPostDate()
    test.expect(date).toMatch(/January (24|25), 2026/)

    // Verify summary displays
    await expectVisible(postDetailPage.postSummary)
    const summary = await postDetailPage.getPostSummary()
    test.expect(summary).toContain('Field observations on how attention has become')
  })

  test('should display Index post type badge for index posts', async ({ postDetailPage }) => {
    await postDetailPage.goto('essential-readings-mind-control')

    // Verify page title metadata
    await expectTitle(postDetailPage.page, /Essential Readings on Mind Control/)

    // Verify post type badge displays "Index"
    await expectVisible(postDetailPage.postType)
    const postType = await postDetailPage.getPostType()
    test.expect(postType?.toUpperCase()).toContain('INDEX')

    // Verify title displays
    await expectVisible(postDetailPage.postTitle)
    const title = await postDetailPage.getPostTitle()
    test.expect(title).toBe('Essential Readings on Mind Control')

    // Verify published date displays
    await expectVisible(postDetailPage.postDate)
    const date = await postDetailPage.getPostDate()
    test.expect(date).toMatch(/January (9|10), 2026/)

    // Verify summary displays
    await expectVisible(postDetailPage.postSummary)
    const summary = await postDetailPage.getPostSummary()
    test.expect(summary).toContain('curated collection of foundational texts')
  })

  test('should render rich text body content correctly', async ({ postDetailPage }) => {
    await postDetailPage.goto('architecture-of-persuasion')

    // Verify prose section exists
    await expectVisible(postDetailPage.postContent)

    // Verify rich text content renders (check for expected paragraph text)
    const content = postDetailPage.postContent
    await test
      .expect(content)
      .toContainText('Understanding the architecture of persuasion requires examining')

    // Verify prose styling is applied (check for prose classes)
    const hasProseClass = await postDetailPage.postContent.evaluate((el) =>
      el.classList.contains('prose'),
    )
    test.expect(hasProseClass).toBe(true)
  })

  test('should include correct SEO metadata in page head', async ({ postDetailPage }) => {
    await postDetailPage.goto('decoding-corporate-newspeak')

    // Verify page title
    await expectTitle(postDetailPage.page, /Decoding Corporate Newspeak/)

    // Verify meta description exists and contains summary
    const metaDescription = await postDetailPage.page
      .locator('meta[name="description"]')
      .getAttribute('content')
    test.expect(metaDescription).toContain('systematic breakdown of corporate language patterns')
  })
})
