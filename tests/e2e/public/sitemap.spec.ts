import { test, expect } from '../fixtures'

/**
 * E2E Tests: Sitemap (CON-48)
 *
 * Verifies that the sitemap.xml is generated correctly:
 * - Sitemap is accessible at /sitemap.xml
 * - Includes static routes with correct priorities
 * - Includes all published post URLs
 * - Excludes draft posts
 * - Excludes archived posts
 * - Valid XML format
 *
 * Test data from seed-test-db.ts:
 * Published posts:
 * - architecture-of-agent-systems
 * - decoding-tool-use-patterns
 * - notes-on-autonomous-workflows
 * - essential-readings-agentic-ai
 *
 * Draft post (should NOT be in sitemap):
 * - unpublished-thoughts-emergence
 *
 * Archived post (should NOT be in sitemap):
 * - legacy-post-early-automation
 */

test.describe('Sitemap', () => {
  test.describe('Sitemap Accessibility', () => {
    test('should be accessible at /sitemap.xml', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      expect(response?.status()).toBe(200)
    })

    test('should return XML content type', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      const contentType = response?.headers()['content-type']
      expect(contentType).toMatch(/xml/)
    })
  })

  test.describe('XML Format Validation', () => {
    test('should be valid XML', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      const content = await response!.text()

      // Verify XML declaration
      expect(content).toContain('<?xml')

      // Verify urlset root element with namespace
      expect(content).toContain('<urlset')
      expect(content).toContain('xmlns')
    })

    test('should contain url elements with required fields', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      const content = await response!.text()

      // Verify url elements exist
      expect(content).toContain('<url>')
      expect(content).toContain('</url>')

      // Verify required fields exist
      expect(content).toContain('<loc>')
      expect(content).toContain('<lastmod>')
      expect(content).toContain('<changefreq>')
      expect(content).toContain('<priority>')
    })
  })

  test.describe('Static Routes', () => {
    test('should include homepage with priority 1', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      const content = await response!.text()

      // Homepage URL should be present
      const siteUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || 'https://detached-node.vercel.app'
      expect(content).toContain(`<loc>${siteUrl}</loc>`)

      // Extract the homepage entry
      const homeUrlMatch = content.match(
        new RegExp(`<url>.*?<loc>${siteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>.*?</url>`, 's')
      )
      expect(homeUrlMatch).toBeTruthy()

      if (homeUrlMatch) {
        const homeEntry = homeUrlMatch[0]
        expect(homeEntry).toContain('<priority>1')
        expect(homeEntry).toContain('<changefreq>weekly</changefreq>')
      }
    })

    test('should include /posts with priority 0.9', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      const content = await response!.text()

      // Posts listing URL should be present
      const siteUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || 'https://detached-node.vercel.app'
      expect(content).toContain(`<loc>${siteUrl}/posts</loc>`)

      // Extract the posts listing entry
      const postsUrlMatch = content.match(
        new RegExp(`<url>.*?<loc>${siteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/posts</loc>.*?</url>`, 's')
      )
      expect(postsUrlMatch).toBeTruthy()

      if (postsUrlMatch) {
        const postsEntry = postsUrlMatch[0]
        expect(postsEntry).toContain('<priority>0.9')
        expect(postsEntry).toContain('<changefreq>daily</changefreq>')
      }
    })

    test('should include /about with priority 0.8', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      const content = await response!.text()

      // About page URL should be present
      const siteUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || 'https://detached-node.vercel.app'
      expect(content).toContain(`<loc>${siteUrl}/about</loc>`)

      // Extract the about page entry
      const aboutUrlMatch = content.match(
        new RegExp(`<url>.*?<loc>${siteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/about</loc>.*?</url>`, 's')
      )
      expect(aboutUrlMatch).toBeTruthy()

      if (aboutUrlMatch) {
        const aboutEntry = aboutUrlMatch[0]
        expect(aboutEntry).toContain('<priority>0.8')
        expect(aboutEntry).toContain('<changefreq>monthly</changefreq>')
      }
    })
  })

  test.describe('Published Posts', () => {
    test('should include all published posts', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      const content = await response!.text()

      const siteUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || 'https://detached-node.vercel.app'

      // Published posts from seed data
      const publishedPosts = [
        'architecture-of-agent-systems',
        'decoding-tool-use-patterns',
        'notes-on-autonomous-workflows',
        'essential-readings-agentic-ai',
      ]

      for (const slug of publishedPosts) {
        expect(content).toContain(`<loc>${siteUrl}/posts/${slug}</loc>`)
      }
    })

    test('should set correct priority for post URLs', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      const content = await response!.text()

      const siteUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || 'https://detached-node.vercel.app'

      // Check one published post has correct priority
      const postUrlMatch = content.match(
        new RegExp(
          `<url>.*?<loc>${siteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/posts/architecture-of-agent-systems</loc>.*?</url>`,
          's'
        )
      )
      expect(postUrlMatch).toBeTruthy()

      if (postUrlMatch) {
        const postEntry = postUrlMatch[0]
        expect(postEntry).toContain('<priority>0.7')
        expect(postEntry).toContain('<changefreq>weekly</changefreq>')
      }
    })
  })

  test.describe('Draft Post Exclusion', () => {
    test('should NOT include draft posts', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      const content = await response!.text()

      const siteUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || 'https://detached-node.vercel.app'

      // Draft post from seed data (should NOT be in sitemap)
      expect(content).not.toContain(
        `<loc>${siteUrl}/posts/unpublished-thoughts-emergence</loc>`
      )
    })
  })

  test.describe('Archived Post Exclusion', () => {
    test('should NOT include archived posts', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      const content = await response!.text()

      const siteUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || 'https://detached-node.vercel.app'

      // Archived post from seed data (should NOT be in sitemap)
      expect(content).not.toContain(`<loc>${siteUrl}/posts/legacy-post-early-automation</loc>`)
    })
  })

  test.describe('Sitemap Completeness', () => {
    test('should contain all expected URLs', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      const content = await response!.text()

      const siteUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || 'https://detached-node.vercel.app'

      // Count URL entries
      const urlCount = (content.match(/<url>/g) || []).length

      // Expected count:
      // 3 static routes (/, /posts, /about)
      // 4 published posts
      // = 7 total URLs minimum
      expect(urlCount).toBeGreaterThanOrEqual(7)

      // Verify we have exactly the URLs we expect
      // (Static routes + Published posts, no drafts/archived)
      const expectedUrls = [
        siteUrl,
        `${siteUrl}/posts`,
        `${siteUrl}/about`,
        `${siteUrl}/posts/architecture-of-agent-systems`,
        `${siteUrl}/posts/decoding-tool-use-patterns`,
        `${siteUrl}/posts/notes-on-autonomous-workflows`,
        `${siteUrl}/posts/essential-readings-agentic-ai`,
      ]

      for (const url of expectedUrls) {
        expect(content).toContain(`<loc>${url}</loc>`)
      }
    })

    test('should not contain unexpected post URLs', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      const content = await response!.text()

      const siteUrl =
        process.env.NEXT_PUBLIC_SERVER_URL || 'https://detached-node.vercel.app'

      // URLs that should NOT be present
      const forbiddenUrls = [
        `${siteUrl}/posts/unpublished-thoughts-emergence`, // draft
        `${siteUrl}/posts/legacy-post-early-automation`, // archived
      ]

      for (const url of forbiddenUrls) {
        expect(content).not.toContain(`<loc>${url}</loc>`)
      }
    })
  })

  test.describe('XML Structure', () => {
    test('should have valid XML structure', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      const content = await response!.text()

      // Verify well-formed XML
      expect(content).toMatch(/^<\?xml/)
      expect(content).toContain('<urlset')
      expect(content).toContain('</urlset>')

      // Verify matching tags
      const urlOpenCount = (content.match(/<url>/g) || []).length
      const urlCloseCount = (content.match(/<\/url>/g) || []).length
      expect(urlOpenCount).toBe(urlCloseCount)

      const locOpenCount = (content.match(/<loc>/g) || []).length
      const locCloseCount = (content.match(/<\/loc>/g) || []).length
      expect(locOpenCount).toBe(locCloseCount)
    })

    test('should contain sitemap schema namespace', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      const content = await response!.text()

      // Verify sitemap namespace
      expect(content).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"')
    })
  })

  test.describe('lastModified Dates', () => {
    test('should include lastmod for all entries', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      const content = await response!.text()

      // Count URL entries and lastmod entries
      const urlCount = (content.match(/<url>/g) || []).length
      const lastmodCount = (content.match(/<lastmod>/g) || []).length

      // Every URL should have a lastmod
      expect(lastmodCount).toBe(urlCount)
    })

    test('should have valid ISO date format in lastmod', async ({ page }) => {
      const response = await page.goto('/sitemap.xml')
      const content = await response!.text()

      // Extract all lastmod values
      const lastmodMatches = content.matchAll(/<lastmod>(.*?)<\/lastmod>/g)
      const lastmodValues = Array.from(lastmodMatches).map((match) => match[1])

      expect(lastmodValues.length).toBeGreaterThan(0)

      // Verify each is a valid ISO date
      for (const dateStr of lastmodValues) {
        const date = new Date(dateStr)
        expect(date.toString()).not.toBe('Invalid Date')
      }
    })
  })
})
