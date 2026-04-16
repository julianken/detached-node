import { test, expect } from '../fixtures'

/**
 * E2E Tests: Draft and Archived Access Control (CON-75)
 *
 * Verifies that public (unauthenticated) users cannot access draft or archived posts:
 * - Draft posts return 404 on direct URL access
 * - Archived posts return 404 on direct URL access
 * - Draft and archived posts not visible in posts listing
 * - API denies access to draft/archived posts without authentication
 *
 * Test Data (from seed-test-db.ts):
 * - Draft: "Unpublished Thoughts on Emergence" (slug: unpublished-thoughts-emergence)
 * - Archived: "Legacy Post About Early Automation" (slug: legacy-post-early-automation)
 *
 * Note: These tests run WITHOUT authentication to verify public access restrictions
 */

test.describe('Draft and Archived Access Control (Public)', () => {
  test('should return 404 when navigating to draft post URL', async ({ page }) => {
    const response = await page.goto('/posts/unpublished-thoughts-emergence')

    expect(response?.status()).toBe(404)

    const pageContent = await page.textContent('body')
    expect(pageContent).toMatch(/404|not found/i)
  })

  test('should return 404 when navigating to archived post URL', async ({ page }) => {
    const response = await page.goto('/posts/legacy-post-early-automation')

    expect(response?.status()).toBe(404)

    const pageContent = await page.textContent('body')
    expect(pageContent).toMatch(/404|not found/i)
  })

  test('should not display draft or archived posts in listing', async ({ postsPage }) => {
    await postsPage.goto()

    const postCount = await postsPage.getPostCount()
    expect(postCount).toBe(4)

    const titles = await postsPage.getPostTitles()
    expect(titles).not.toContain('Unpublished Thoughts on Emergence')
    expect(titles).not.toContain('Legacy Post About Early Automation')
  })

  test('should show all published posts in listing', async ({ postsPage }) => {
    await postsPage.goto()

    const titles = await postsPage.getPostTitles()
    expect(titles).toContain('Notes on Autonomous Workflows')
    expect(titles).toContain('Decoding Tool Use Patterns')
    expect(titles).toContain('The Architecture of Agent Systems')
    expect(titles).toContain('Essential Readings on Agentic AI')
  })

  test('should only return published posts from API', async ({ request }) => {
    const response = await request.get('/api/posts')

    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data.docs).toBeDefined()
    expect(data.docs.length).toBe(4)

    const slugs = data.docs.map((post: { slug: string }) => post.slug)
    expect(slugs).not.toContain('unpublished-thoughts-emergence')
    expect(slugs).not.toContain('legacy-post-early-automation')
  })
})
