import { test } from '../fixtures'
import { expectTitle } from '../helpers/assertions.helper'

/**
 * E2E tests for page metadata and SEO (CON-52)
 * Tests verify that all pages have correct titles, meta descriptions, and Open Graph tags
 *
 * Test data from seed-test-db.ts:
 * - "The Architecture of Agent Systems" (essay) - slug: architecture-of-agent-systems
 * - "Decoding Tool Use Patterns" (decoder) - slug: decoding-tool-use-patterns
 */

test.describe('Page Metadata and SEO', () => {
  test.describe('Homepage metadata', () => {
    test('should have correct page title containing "Detached Node"', async ({ homePage }) => {
      await homePage.goto()

      // Verify page title contains site name
      await expectTitle(homePage.page, /Detached Node/)
    })

    test('should have meta description tag', async ({ homePage }) => {
      await homePage.goto()

      // Verify meta description exists
      const metaDescription = await homePage.page
        .locator('meta[name="description"]')
        .getAttribute('content')

      test.expect(metaDescription).toBeTruthy()
      test.expect(metaDescription).toContain('agentic AI')
    })

    test('should have Open Graph title tag', async ({ homePage }) => {
      await homePage.goto()

      // Verify og:title exists
      const ogTitle = await homePage.page.locator('meta[property="og:title"]').getAttribute('content')

      test.expect(ogTitle).toBeTruthy()
      test.expect(ogTitle).toContain('Detached Node')
    })

    test('should have Open Graph description tag', async ({ homePage }) => {
      await homePage.goto()

      // Verify og:description exists
      const ogDescription = await homePage.page
        .locator('meta[property="og:description"]')
        .getAttribute('content')

      test.expect(ogDescription).toBeTruthy()
      test.expect(ogDescription).toContain('agentic AI')
    })

    test('should have Open Graph type tag', async ({ homePage }) => {
      await homePage.goto()

      // Verify og:type exists
      const ogType = await homePage.page.locator('meta[property="og:type"]').getAttribute('content')

      test.expect(ogType).toBe('website')
    })
  })

  test.describe('Posts listing page metadata', () => {
    test('should have correct page title "Posts | Detached Node"', async ({ postsPage }) => {
      await postsPage.goto()

      // Verify page title matches expected format
      await expectTitle(postsPage.page, 'Posts | Detached Node')
    })

    test('should have meta description tag', async ({ postsPage }) => {
      await postsPage.goto()

      // Verify meta description exists
      const metaDescription = await postsPage.page
        .locator('meta[name="description"]')
        .getAttribute('content')

      test.expect(metaDescription).toBeTruthy()
    })

    test('should have Open Graph tags', async ({ postsPage }) => {
      await postsPage.goto()

      // Verify og:title exists
      const ogTitle = await postsPage.page.locator('meta[property="og:title"]').getAttribute('content')

      test.expect(ogTitle).toBeTruthy()

      // Verify og:description exists
      const ogDescription = await postsPage.page
        .locator('meta[property="og:description"]')
        .getAttribute('content')

      test.expect(ogDescription).toBeTruthy()
    })
  })

  test.describe('Post detail page metadata', () => {
    test('should have page title including post title for essay post', async ({ postDetailPage }) => {
      await postDetailPage.goto('architecture-of-agent-systems')

      // Verify page title includes the post title
      await expectTitle(postDetailPage.page, /The Architecture of Agent Systems/)
      await expectTitle(postDetailPage.page, /Detached Node/)
    })

    test('should have meta description with post summary for essay post', async ({
      postDetailPage,
    }) => {
      await postDetailPage.goto('architecture-of-agent-systems')

      // Verify meta description contains post summary
      const metaDescription = await postDetailPage.page
        .locator('meta[name="description"]')
        .getAttribute('content')

      test.expect(metaDescription).toBeTruthy()
      test.expect(metaDescription).toContain('exploration of how modern agent architectures')
    })

    test('should have Open Graph title for essay post', async ({ postDetailPage }) => {
      await postDetailPage.goto('architecture-of-agent-systems')

      // Verify og:title exists
      const ogTitle = await postDetailPage.page
        .locator('meta[property="og:title"]')
        .getAttribute('content')

      test.expect(ogTitle).toBeTruthy()
      test.expect(ogTitle).toContain('The Architecture of Agent Systems')
    })

    test('should have Open Graph description for essay post', async ({ postDetailPage }) => {
      await postDetailPage.goto('architecture-of-agent-systems')

      // Verify og:description exists
      const ogDescription = await postDetailPage.page
        .locator('meta[property="og:description"]')
        .getAttribute('content')

      test.expect(ogDescription).toBeTruthy()
      test.expect(ogDescription).toContain('exploration of how modern agent architectures')
    })

    test('should have page title including post title for decoder post', async ({
      postDetailPage,
    }) => {
      await postDetailPage.goto('decoding-tool-use-patterns')

      // Verify page title includes the post title
      await expectTitle(postDetailPage.page, /Decoding Tool Use Patterns/)
      await expectTitle(postDetailPage.page, /Detached Node/)
    })

    test('should have meta description with post summary for decoder post', async ({
      postDetailPage,
    }) => {
      await postDetailPage.goto('decoding-tool-use-patterns')

      // Verify meta description contains post summary
      const metaDescription = await postDetailPage.page
        .locator('meta[name="description"]')
        .getAttribute('content')

      test.expect(metaDescription).toBeTruthy()
      test.expect(metaDescription).toContain('systematic breakdown of tool use patterns')
    })
  })

  test.describe('About page metadata', () => {
    test('should have page title including "About"', async ({ aboutPage }) => {
      await aboutPage.goto()

      // Verify page title includes About
      await expectTitle(aboutPage.page, /About/)
      await expectTitle(aboutPage.page, /Detached Node/)
    })

    test('should have meta description tag', async ({ aboutPage }) => {
      await aboutPage.goto()

      // Verify meta description exists
      const metaDescription = await aboutPage.page
        .locator('meta[name="description"]')
        .getAttribute('content')

      test.expect(metaDescription).toBeTruthy()
    })

    test('should have Open Graph tags', async ({ aboutPage }) => {
      await aboutPage.goto()

      // Verify og:title exists
      const ogTitle = await aboutPage.page.locator('meta[property="og:title"]').getAttribute('content')

      test.expect(ogTitle).toBeTruthy()

      // Verify og:description exists
      const ogDescription = await aboutPage.page
        .locator('meta[property="og:description"]')
        .getAttribute('content')

      test.expect(ogDescription).toBeTruthy()
    })
  })

  test.describe('Metadata uniqueness', () => {
    test('should have unique page titles across different page types', async ({
      homePage,
      postsPage,
      postDetailPage,
      aboutPage,
    }) => {
      // Collect all page titles
      await homePage.goto()
      const homeTitle = await homePage.page.title()

      await postsPage.goto()
      const postsTitle = await postsPage.page.title()

      await postDetailPage.goto('architecture-of-agent-systems')
      const postTitle = await postDetailPage.page.title()

      await aboutPage.goto()
      const aboutTitle = await aboutPage.page.title()

      // Verify all titles are different
      const titles = [homeTitle, postsTitle, postTitle, aboutTitle]
      const uniqueTitles = new Set(titles)

      test.expect(uniqueTitles.size).toBe(titles.length)

      // Verify all titles end with site name (except possibly homepage)
      test.expect(postsTitle).toContain('Detached Node')
      test.expect(postTitle).toContain('Detached Node')
      test.expect(aboutTitle).toContain('Detached Node')
    })

    test('should have descriptive page titles for each page type', async ({
      postsPage,
      postDetailPage,
      aboutPage,
    }) => {
      // Posts page title should be descriptive
      await postsPage.goto()
      const postsTitle = await postsPage.page.title()
      test.expect(postsTitle).toContain('Posts')

      // Post detail page title should include post name
      await postDetailPage.goto('architecture-of-agent-systems')
      const postTitle = await postDetailPage.page.title()
      test.expect(postTitle).toContain('Architecture')

      // About page title should be descriptive
      await aboutPage.goto()
      const aboutTitle = await aboutPage.page.title()
      test.expect(aboutTitle).toContain('About')
    })
  })
})
