import { test } from '../fixtures'
import { expectTitle } from '../helpers/assertions.helper'

/**
 * E2E tests for page metadata and SEO (CON-52)
 * Tests verify that all pages have correct titles, meta descriptions, and Open Graph tags
 *
 * Test data from seed-test-db.ts:
 * - "The Architecture of Persuasion" (essay) - slug: architecture-of-persuasion
 * - "Decoding Corporate Newspeak" (decoder) - slug: decoding-corporate-newspeak
 */

test.describe('Page Metadata and SEO', () => {
  test.describe('Homepage metadata', () => {
    test('should have correct page title containing "Mind-Controlled"', async ({ homePage }) => {
      await homePage.goto()

      // Verify page title contains site name
      await expectTitle(homePage.page, /Mind-Controlled/)
    })

    test('should have meta description tag', async ({ homePage }) => {
      await homePage.goto()

      // Verify meta description exists
      const metaDescription = await homePage.page
        .locator('meta[name="description"]')
        .getAttribute('content')

      test.expect(metaDescription).toBeTruthy()
      test.expect(metaDescription).toContain('propaganda')
    })

    test('should have Open Graph title tag', async ({ homePage }) => {
      await homePage.goto()

      // Verify og:title exists
      const ogTitle = await homePage.page.locator('meta[property="og:title"]').getAttribute('content')

      test.expect(ogTitle).toBeTruthy()
      test.expect(ogTitle).toContain('Mind-Controlled')
    })

    test('should have Open Graph description tag', async ({ homePage }) => {
      await homePage.goto()

      // Verify og:description exists
      const ogDescription = await homePage.page
        .locator('meta[property="og:description"]')
        .getAttribute('content')

      test.expect(ogDescription).toBeTruthy()
      test.expect(ogDescription).toContain('propaganda')
    })

    test('should have Open Graph type tag', async ({ homePage }) => {
      await homePage.goto()

      // Verify og:type exists
      const ogType = await homePage.page.locator('meta[property="og:type"]').getAttribute('content')

      test.expect(ogType).toBe('website')
    })
  })

  test.describe('Posts listing page metadata', () => {
    test('should have correct page title "Posts | Mind-Controlled"', async ({ postsPage }) => {
      await postsPage.goto()

      // Verify page title matches expected format
      await expectTitle(postsPage.page, 'Posts | Mind-Controlled')
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
      await postDetailPage.goto('architecture-of-persuasion')

      // Verify page title includes the post title
      await expectTitle(postDetailPage.page, /The Architecture of Persuasion/)
      await expectTitle(postDetailPage.page, /Mind-Controlled/)
    })

    test('should have meta description with post summary for essay post', async ({
      postDetailPage,
    }) => {
      await postDetailPage.goto('architecture-of-persuasion')

      // Verify meta description contains post summary
      const metaDescription = await postDetailPage.page
        .locator('meta[name="description"]')
        .getAttribute('content')

      test.expect(metaDescription).toBeTruthy()
      test.expect(metaDescription).toContain('exploration of how modern persuasion techniques')
    })

    test('should have Open Graph title for essay post', async ({ postDetailPage }) => {
      await postDetailPage.goto('architecture-of-persuasion')

      // Verify og:title exists
      const ogTitle = await postDetailPage.page
        .locator('meta[property="og:title"]')
        .getAttribute('content')

      test.expect(ogTitle).toBeTruthy()
      test.expect(ogTitle).toContain('The Architecture of Persuasion')
    })

    test('should have Open Graph description for essay post', async ({ postDetailPage }) => {
      await postDetailPage.goto('architecture-of-persuasion')

      // Verify og:description exists
      const ogDescription = await postDetailPage.page
        .locator('meta[property="og:description"]')
        .getAttribute('content')

      test.expect(ogDescription).toBeTruthy()
      test.expect(ogDescription).toContain('exploration of how modern persuasion techniques')
    })

    test('should have page title including post title for decoder post', async ({
      postDetailPage,
    }) => {
      await postDetailPage.goto('decoding-corporate-newspeak')

      // Verify page title includes the post title
      await expectTitle(postDetailPage.page, /Decoding Corporate Newspeak/)
      await expectTitle(postDetailPage.page, /Mind-Controlled/)
    })

    test('should have meta description with post summary for decoder post', async ({
      postDetailPage,
    }) => {
      await postDetailPage.goto('decoding-corporate-newspeak')

      // Verify meta description contains post summary
      const metaDescription = await postDetailPage.page
        .locator('meta[name="description"]')
        .getAttribute('content')

      test.expect(metaDescription).toBeTruthy()
      test.expect(metaDescription).toContain('systematic breakdown of corporate language patterns')
    })
  })

  test.describe('About page metadata', () => {
    test('should have page title including "About"', async ({ aboutPage }) => {
      await aboutPage.goto()

      // Verify page title includes About
      await expectTitle(aboutPage.page, /About/)
      await expectTitle(aboutPage.page, /Mind-Controlled/)
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

      await postDetailPage.goto('architecture-of-persuasion')
      const postTitle = await postDetailPage.page.title()

      await aboutPage.goto()
      const aboutTitle = await aboutPage.page.title()

      // Verify all titles are different
      const titles = [homeTitle, postsTitle, postTitle, aboutTitle]
      const uniqueTitles = new Set(titles)

      test.expect(uniqueTitles.size).toBe(titles.length)

      // Verify all titles end with site name (except possibly homepage)
      test.expect(postsTitle).toContain('Mind-Controlled')
      test.expect(postTitle).toContain('Mind-Controlled')
      test.expect(aboutTitle).toContain('Mind-Controlled')
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
      await postDetailPage.goto('architecture-of-persuasion')
      const postTitle = await postDetailPage.page.title()
      test.expect(postTitle).toContain('Architecture')

      // About page title should be descriptive
      await aboutPage.goto()
      const aboutTitle = await aboutPage.page.title()
      test.expect(aboutTitle).toContain('About')
    })
  })
})
