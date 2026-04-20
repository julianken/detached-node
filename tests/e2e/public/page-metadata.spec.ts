import { test } from '../fixtures'
import { expectTitle } from '../helpers/assertions.helper'

/**
 * E2E tests for page metadata and SEO (CON-52)
 * Tests verify that all pages have correct titles and meta descriptions
 *
 * Test data from seed-test-db.ts:
 * - "The Architecture of Agent Systems" (essay) - slug: architecture-of-agent-systems
 * - "Decoding Tool Use Patterns" (decoder) - slug: decoding-tool-use-patterns
 */

test.describe('Page Metadata and SEO', () => {
  test('should have correct homepage title and description', async ({ homePage }) => {
    await homePage.goto()

    await expectTitle(homePage.page, /detached-node/)

    const metaDescription = await homePage.page
      .locator('meta[name="description"]')
      .getAttribute('content')

    test.expect(metaDescription).toBeTruthy()
    test.expect(metaDescription).toContain('agentic AI')
  })

  test('should have correct posts listing page title', async ({ postsPage }) => {
    await postsPage.goto()

    await expectTitle(postsPage.page, 'Posts | detached-node')
  })

  test('should have dynamic title for post detail page', async ({ postDetailPage }) => {
    await postDetailPage.goto('architecture-of-agent-systems')

    await expectTitle(postDetailPage.page, /The Architecture of Agent Systems/)
    await expectTitle(postDetailPage.page, /detached-node/)
  })

  test('should have correct about page title', async ({ aboutPage }) => {
    await aboutPage.goto()

    await expectTitle(aboutPage.page, /About/)
    await expectTitle(aboutPage.page, /detached-node/)
  })
})
