import { test, expect } from '../fixtures'
import { expectUrl } from '../helpers'

/**
 * E2E Tests: Draft and Archived Access Control (CON-75)
 *
 * Verifies that public (unauthenticated) users cannot access draft or archived posts:
 * - Draft posts return 404 on direct URL access
 * - Archived posts return 404 on direct URL access
 * - Draft posts not visible in posts listing
 * - Archived posts not visible in posts listing
 * - API denies access to draft/archived posts without authentication
 *
 * Test Data (from seed-test-db.ts):
 * - Draft: "Unpublished Thoughts on Emergence" (slug: unpublished-thoughts-emergence)
 * - Archived: "Legacy Post About Early Automation" (slug: legacy-post-early-automation)
 *
 * Note: These tests run WITHOUT authentication to verify public access restrictions
 */

test.describe('Draft and Archived Access Control (Public)', () => {
  test.describe('Direct URL Access - Draft Posts', () => {
    test('should return 404 when navigating to draft post URL without auth', async ({ page }) => {
      // Navigate to draft post URL
      const response = await page.goto('/posts/unpublished-thoughts-emergence')

      // Verify 404 response
      expect(response?.status()).toBe(404)

      // Verify page content shows 404 error (Next.js default 404 page)
      const pageContent = await page.textContent('body')
      expect(pageContent).toMatch(/404|not found/i)
    })

    test('should not leak draft post metadata in 404 response', async ({ page }) => {
      await page.goto('/posts/unpublished-thoughts-emergence')

      // Verify draft post title does not appear
      const pageContent = await page.textContent('body')
      expect(pageContent).not.toContain('Unpublished Thoughts on Emergence')

      // Verify draft post summary does not appear
      expect(pageContent).not.toContain('Early draft exploring emergent AI behaviors')
    })
  })

  test.describe('Direct URL Access - Archived Posts', () => {
    test('should return 404 when navigating to archived post URL without auth', async ({ page }) => {
      // Navigate to archived post URL
      const response = await page.goto('/posts/legacy-post-early-automation')

      // Verify 404 response
      expect(response?.status()).toBe(404)

      // Verify page content shows 404 error
      const pageContent = await page.textContent('body')
      expect(pageContent).toMatch(/404|not found/i)
    })

    test('should not leak archived post metadata in 404 response', async ({ page }) => {
      await page.goto('/posts/legacy-post-early-automation')

      // Verify archived post title does not appear
      const pageContent = await page.textContent('body')
      expect(pageContent).not.toContain('Legacy Post About Early Automation')

      // Verify archived post summary does not appear
      expect(pageContent).not.toContain('Historical analysis of early automation techniques')
    })
  })

  test.describe('Posts Listing - Draft Posts', () => {
    test('should not display draft posts in public posts listing', async ({ postsPage }) => {
      await postsPage.goto()

      // Verify draft post title is not visible
      const draftTitle = postsPage.page.getByRole('heading', {
        name: /Unpublished Thoughts on Emergence/i,
      })
      await expect(draftTitle).not.toBeVisible()

      // Verify draft post summary is not visible
      const draftSummary = postsPage.page.getByText(/Early draft exploring emergent AI behaviors/)
      await expect(draftSummary).not.toBeVisible()
    })

    test('should only show published posts count (excluding drafts)', async ({ postsPage }) => {
      await postsPage.goto()

      // Verify we have exactly 4 published posts (not 5 with draft)
      const postCount = await postsPage.getPostCount()
      expect(postCount).toBe(4)

      // Verify all visible posts are published ones
      const titles = await postsPage.getPostTitles()
      expect(titles).toContain('Notes on Autonomous Workflows')
      expect(titles).toContain('Decoding Tool Use Patterns')
      expect(titles).toContain('The Architecture of Agent Systems')
      expect(titles).toContain('Essential Readings on Agentic AI')
      expect(titles).not.toContain('Unpublished Thoughts on Emergence')
    })
  })

  test.describe('Posts Listing - Archived Posts', () => {
    test('should not display archived posts in public posts listing', async ({ postsPage }) => {
      await postsPage.goto()

      // Verify archived post title is not visible
      const archivedTitle = postsPage.page.getByRole('heading', {
        name: /Legacy Post About Early Automation/i,
      })
      await expect(archivedTitle).not.toBeVisible()

      // Verify archived post summary is not visible
      const archivedSummary = postsPage.page.getByText(
        /Historical analysis of early automation techniques from the Cold War/,
      )
      await expect(archivedSummary).not.toBeVisible()
    })

    test('should only show published posts count (excluding archived)', async ({ postsPage }) => {
      await postsPage.goto()

      // Verify we have exactly 4 published posts (not 5 or 6 with draft/archived)
      const postCount = await postsPage.getPostCount()
      expect(postCount).toBe(4)

      // Verify archived post is not in the list
      const titles = await postsPage.getPostTitles()
      expect(titles).not.toContain('Legacy Post About Early Automation')
    })
  })

  test.describe('API Access Control', () => {
    test('should deny API access to draft posts without authentication', async ({ request }) => {
      // Attempt to fetch draft post via API
      const response = await request.get('/api/posts', {
        params: {
          'where[slug][equals]': 'unpublished-thoughts-emergence',
        },
      })

      // API should return success but with empty results (filtered by access control)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.docs).toBeDefined()
      expect(data.docs.length).toBe(0)
    })

    test('should deny API access to archived posts without authentication', async ({ request }) => {
      // Attempt to fetch archived post via API
      const response = await request.get('/api/posts', {
        params: {
          'where[slug][equals]': 'legacy-post-early-automation',
        },
      })

      // API should return success but with empty results (filtered by access control)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.docs).toBeDefined()
      expect(data.docs.length).toBe(0)
    })

    test('should only return published posts from public API endpoint', async ({ request }) => {
      // Fetch all posts via API
      const response = await request.get('/api/posts')

      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.docs).toBeDefined()

      // Should have exactly 4 published posts
      expect(data.docs.length).toBe(4)

      // Verify no draft or archived posts in results
      const slugs = data.docs.map((post: { slug: string }) => post.slug)
      expect(slugs).not.toContain('unpublished-thoughts-emergence')
      expect(slugs).not.toContain('legacy-post-early-automation')

      // Verify all published posts are included
      expect(slugs).toContain('architecture-of-agent-systems')
      expect(slugs).toContain('decoding-tool-use-patterns')
      expect(slugs).toContain('notes-on-autonomous-workflows')
      expect(slugs).toContain('essential-readings-agentic-ai')
    })

    test('should filter draft and archived posts by status field', async ({ request }) => {
      // Attempt to explicitly fetch draft posts
      const draftResponse = await request.get('/api/posts', {
        params: {
          'where[_status][equals]': 'draft',
        },
      })

      expect(draftResponse.ok()).toBeTruthy()
      const draftData = await draftResponse.json()
      expect(draftData.docs.length).toBe(0)

      // Attempt to explicitly fetch archived posts
      const archivedResponse = await request.get('/api/posts', {
        params: {
          'where[_status][equals]': 'archived',
        },
      })

      expect(archivedResponse.ok()).toBeTruthy()
      const archivedData = await archivedResponse.json()
      expect(archivedData.docs.length).toBe(0)
    })
  })

  test.describe('Comprehensive Access Control', () => {
    test('should maintain access control across all public routes and APIs', async ({
      page,
      postsPage,
      request,
    }) => {
      // 1. Verify posts listing excludes draft and archived
      await postsPage.goto()
      const listingPostCount = await postsPage.getPostCount()
      expect(listingPostCount).toBe(4)

      // 2. Verify direct URL access returns 404 for draft
      const draftResponse = await page.goto('/posts/unpublished-thoughts-emergence')
      expect(draftResponse?.status()).toBe(404)

      // 3. Verify direct URL access returns 404 for archived
      await page.goto('/')
      const archivedResponse = await page.goto('/posts/legacy-post-early-automation')
      expect(archivedResponse?.status()).toBe(404)

      // 4. Verify API excludes draft and archived
      const apiResponse = await request.get('/api/posts')
      const apiData = await apiResponse.json()
      expect(apiData.docs.length).toBe(4)

      const apiSlugs = apiData.docs.map((post: { slug: string }) => post.slug)
      expect(apiSlugs).not.toContain('unpublished-thoughts-emergence')
      expect(apiSlugs).not.toContain('legacy-post-early-automation')
    })
  })
})
