import { test } from '../fixtures'
import { expectVisible, expectTitle } from '../helpers'

/**
 * E2E tests for individual post detail page (CON-41)
 * Tests verify that post pages load correctly with all metadata and content
 *
 * Test data from seed-test-db.ts:
 * - "The Architecture of Agent Systems" (essay) - slug: architecture-of-agent-systems
 * - "Decoding Tool Use Patterns" (decoder) - slug: decoding-tool-use-patterns
 * - "Notes on Autonomous Workflows" (field-report) - slug: notes-on-autonomous-workflows
 * - "Essential Readings on Agentic AI" (index) - slug: essential-readings-agentic-ai
 */

test.describe('Post Detail Page', () => {
  test('should display Essay post type badge for essay posts', async ({ postDetailPage }) => {
    await postDetailPage.goto('architecture-of-agent-systems')

    // Verify page title metadata
    await expectTitle(postDetailPage.page, /The Architecture of Agent Systems/)

    // Verify post type badge displays "Essay"
    await expectVisible(postDetailPage.postType)
    const postType = await postDetailPage.getPostType()
    test.expect(postType?.toUpperCase()).toContain('ESSAY')

    // Verify title displays
    await expectVisible(postDetailPage.postTitle)
    const title = await postDetailPage.getPostTitle()
    test.expect(title).toBe('The Architecture of Agent Systems')

    // Verify published date displays
    await expectVisible(postDetailPage.postDate)
    const date = await postDetailPage.getPostDate()
    test.expect(date).toMatch(/January (14|15), 2026/)

    // Verify summary displays
    await expectVisible(postDetailPage.postSummary)
    const summary = await postDetailPage.getPostSummary()
    test.expect(summary).toContain('exploration of how modern agent architectures')
  })

  test('should display Decoder post type badge for decoder posts', async ({ postDetailPage }) => {
    await postDetailPage.goto('decoding-tool-use-patterns')

    // Verify page title metadata
    await expectTitle(postDetailPage.page, /Decoding Tool Use Patterns/)

    // Verify post type badge displays "Decoder"
    await expectVisible(postDetailPage.postType)
    const postType = await postDetailPage.getPostType()
    test.expect(postType?.toUpperCase()).toContain('DECODER')

    // Verify title displays
    await expectVisible(postDetailPage.postTitle)
    const title = await postDetailPage.getPostTitle()
    test.expect(title).toBe('Decoding Tool Use Patterns')

    // Verify published date displays
    await expectVisible(postDetailPage.postDate)
    const date = await postDetailPage.getPostDate()
    test.expect(date).toMatch(/January (19|20), 2026/)

    // Verify summary displays
    await expectVisible(postDetailPage.postSummary)
    const summary = await postDetailPage.getPostSummary()
    test.expect(summary).toContain('systematic breakdown of tool use patterns')
  })

  test('should display Field Report post type badge for field-report posts', async ({
    postDetailPage,
  }) => {
    await postDetailPage.goto('notes-on-autonomous-workflows')

    // Verify page title metadata
    await expectTitle(postDetailPage.page, /Notes on Autonomous Workflows/)

    // Verify post type badge displays "Field Report"
    await expectVisible(postDetailPage.postType)
    const postType = await postDetailPage.getPostType()
    test.expect(postType?.toUpperCase()).toContain('FIELD REPORT')

    // Verify title displays
    await expectVisible(postDetailPage.postTitle)
    const title = await postDetailPage.getPostTitle()
    test.expect(title).toBe('Notes on Autonomous Workflows')

    // Verify published date displays
    await expectVisible(postDetailPage.postDate)
    const date = await postDetailPage.getPostDate()
    test.expect(date).toMatch(/January (24|25), 2026/)

    // Verify summary displays
    await expectVisible(postDetailPage.postSummary)
    const summary = await postDetailPage.getPostSummary()
    test.expect(summary).toContain('Field observations on how autonomous AI workflows')
  })

  test('should display Index post type badge for index posts', async ({ postDetailPage }) => {
    await postDetailPage.goto('essential-readings-agentic-ai')

    // Verify page title metadata
    await expectTitle(postDetailPage.page, /Essential Readings on Agentic AI/)

    // Verify post type badge displays "Index"
    await expectVisible(postDetailPage.postType)
    const postType = await postDetailPage.getPostType()
    test.expect(postType?.toUpperCase()).toContain('INDEX')

    // Verify title displays
    await expectVisible(postDetailPage.postTitle)
    const title = await postDetailPage.getPostTitle()
    test.expect(title).toBe('Essential Readings on Agentic AI')

    // Verify published date displays
    await expectVisible(postDetailPage.postDate)
    const date = await postDetailPage.getPostDate()
    test.expect(date).toMatch(/January (9|10), 2026/)

    // Verify summary displays
    await expectVisible(postDetailPage.postSummary)
    const summary = await postDetailPage.getPostSummary()
    test.expect(summary).toContain('curated collection of foundational resources')
  })

  test('should render rich text body content correctly', async ({ postDetailPage }) => {
    await postDetailPage.goto('architecture-of-agent-systems')

    // Verify prose section exists
    await expectVisible(postDetailPage.postContent)

    // Verify rich text content renders (check for expected paragraph text)
    const content = postDetailPage.postContent
    await test
      .expect(content)
      .toContainText('Understanding the architecture of agent systems requires examining')

    // Verify prose styling is applied (check for prose classes)
    const hasProseClass = await postDetailPage.postContent.evaluate((el) =>
      el.classList.contains('prose'),
    )
    test.expect(hasProseClass).toBe(true)
  })

  test('should include correct SEO metadata in page head', async ({ postDetailPage }) => {
    await postDetailPage.goto('decoding-tool-use-patterns')

    // Verify page title
    await expectTitle(postDetailPage.page, /Decoding Tool Use Patterns/)

    // Verify meta description exists and contains summary
    const metaDescription = await postDetailPage.page
      .locator('meta[name="description"]')
      .getAttribute('content')
    test.expect(metaDescription).toContain('systematic breakdown of tool use patterns')
  })
})
