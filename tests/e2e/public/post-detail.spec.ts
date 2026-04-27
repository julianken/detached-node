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
 *
 * Post-type labels were removed from the public frontend in #133, so no
 * post type renders a header badge regardless of `Posts.type`.
 */

test.describe('Post Detail Page', () => {
  test('should render essay post detail correctly', async ({ postDetailPage }) => {
    await postDetailPage.goto('architecture-of-agent-systems')

    // Verify page title metadata
    await expectTitle(postDetailPage.page, /The Architecture of Agent Systems/)

    // Verify title displays
    await expectVisible(postDetailPage.postTitle)
    const title = await postDetailPage.getPostTitle()
    test.expect(title).toBe('The Architecture of Agent Systems')

    // Verify published date displays
    await expectVisible(postDetailPage.postDate)
    const date = await postDetailPage.getPostDate()
    test.expect(date).toMatch(/Jan (14|15), 2026/)

    // Verify summary displays
    await expectVisible(postDetailPage.postSummary)
    const summary = await postDetailPage.getPostSummary()
    test.expect(summary).toContain('exploration of how modern agent architectures')
  })

  test('should render decoder post detail correctly', async ({ postDetailPage }) => {
    await postDetailPage.goto('decoding-tool-use-patterns')

    // Verify page title metadata
    await expectTitle(postDetailPage.page, /Decoding Tool Use Patterns/)

    // Verify title displays
    await expectVisible(postDetailPage.postTitle)
    const title = await postDetailPage.getPostTitle()
    test.expect(title).toBe('Decoding Tool Use Patterns')

    // Verify published date displays
    await expectVisible(postDetailPage.postDate)
    const date = await postDetailPage.getPostDate()
    test.expect(date).toMatch(/Jan (19|20), 2026/)

    // Verify summary displays
    await expectVisible(postDetailPage.postSummary)
    const summary = await postDetailPage.getPostSummary()
    test.expect(summary).toContain('systematic breakdown of how AI agents select')
  })

  test('should not render a post type badge in the header', async ({
    postDetailPage,
  }) => {
    await postDetailPage.goto('notes-on-autonomous-workflows')

    // Post-type labels were removed from the frontend in #133.
    // The badge had the distinguishing `uppercase` class; selecting on it
    // avoids matching the (visually similar) date <p> that lives in the
    // same header.
    const badge = postDetailPage.page.locator('article header p.uppercase')
    await test.expect(badge).toHaveCount(0)

    // Verify page title metadata
    await expectTitle(postDetailPage.page, /Notes on Autonomous Workflows/)

    // Verify title displays
    await expectVisible(postDetailPage.postTitle)
    const title = await postDetailPage.getPostTitle()
    test.expect(title).toBe('Notes on Autonomous Workflows')

    // Verify published date displays
    await expectVisible(postDetailPage.postDate)
    const date = await postDetailPage.getPostDate()
    test.expect(date).toMatch(/Jan (24|25), 2026/)

    // Verify summary displays
    await expectVisible(postDetailPage.postSummary)
    const summary = await postDetailPage.getPostSummary()
    test.expect(summary).toContain('Field observations on how autonomous workflows')
  })

  test('should render index post detail correctly', async ({ postDetailPage }) => {
    await postDetailPage.goto('essential-readings-agentic-ai')

    // Verify page title metadata
    await expectTitle(postDetailPage.page, /Essential Readings on Agentic AI/)

    // Verify title displays
    await expectVisible(postDetailPage.postTitle)
    const title = await postDetailPage.getPostTitle()
    test.expect(title).toBe('Essential Readings on Agentic AI')

    // Verify published date displays
    await expectVisible(postDetailPage.postDate)
    const date = await postDetailPage.getPostDate()
    test.expect(date).toMatch(/Jan (9|10), 2026/)

    // Verify summary displays
    await expectVisible(postDetailPage.postSummary)
    const summary = await postDetailPage.getPostSummary()
    test.expect(summary).toContain('curated collection of foundational texts')
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
    test.expect(metaDescription).toContain('systematic breakdown of how AI agents select')
  })
})
