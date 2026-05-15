import { test } from '../fixtures'
import { expect } from '@playwright/test'

/**
 * E2E Test: Back-button (popstate) navigation must not freeze (#377)
 *
 * Regression guard for the popstate-driven view-transition freeze. The
 * `next-view-transitions` library used to register a `popstate` listener that
 * wrapped every back/forward navigation in `document.startViewTransition()`,
 * which held the previous-page snapshot on screen for the entire RSC fetch
 * (multi-second on cold Cloud Run). We neutralize that path via a
 * `pnpm patch` of the library — see `patches/next-view-transitions.patch`.
 *
 * This test asserts the back navigation completes within a generous budget
 * (well under the multi-second freeze the bug produced) and that the
 * destination URL updates without blocking.
 */
test.describe('Back-button (popstate) navigation', () => {
  test('returns to /posts quickly after back-button on a post detail page', async ({
    postsPage,
  }) => {
    await postsPage.goto()
    await expect(postsPage.pageTitle).toBeVisible()

    const postCount = await postsPage.getPostCount()
    test.skip(postCount === 0, 'No posts seeded; cannot exercise back-nav')

    // Forward navigation: click into the first post
    await postsPage.postCards.first().click()
    await postsPage.page.waitForLoadState('domcontentloaded')
    expect(postsPage.page.url()).toMatch(/\/posts\/[^/]+\/?$/)

    // Back navigation via the browser back button (triggers `popstate`)
    const start = Date.now()
    await postsPage.page.goBack({ waitUntil: 'domcontentloaded' })
    const elapsedMs = Date.now() - start

    // The page must land back on /posts and DOM must be interactive.
    await expect(postsPage.pageTitle).toBeVisible()
    expect(postsPage.page.url()).toMatch(/\/posts\/?$/)

    // The bug produced 1000–5000ms of frozen snapshot before commit. A 4s
    // ceiling is permissive enough for cold dev + still fails loud on a
    // regression of the popstate freeze path.
    expect(elapsedMs).toBeLessThan(4000)
  })
})
