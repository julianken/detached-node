import { test, expect } from '@playwright/test'

/**
 * E2E coverage for issue #414 — soft-404 fix + trailing-punctuation
 * redirect on the /posts/<slug> route.
 *
 * These specs intentionally use raw `@playwright/test` (not the fixtures
 * base) because they only need raw HTTP-status assertions on the dev
 * server — no Page Object indirection.
 */

test.describe('posts/[slug] — HTTP contract', () => {
  test('unknown slug returns HTTP 404 (not a cacheable 200)', async ({ page }) => {
    const response = await page.goto('/posts/does-not-exist-12345')
    expect(response, 'page.goto should return a response').not.toBeNull()
    expect(response!.status()).toBe(404)
    // Defensive: the not-found.tsx body must be what rendered, not the
    // listing page or a real post.
    await expect(page.getByRole('heading', { name: /post not found/i })).toBeVisible()
  })

  test('trailing apostrophe on a known slug 301-redirects to the canonical URL', async ({
    page,
  }) => {
    // Use the slug from the issue — the apostrophe is the AI-generated
    // typo we're protecting against. We follow the redirect chain via
    // page.goto and assert (a) the final URL is canonical, and (b) the
    // first response in the chain is a 301.
    //
    // page.goto returns the LAST response. To prove the redirect was 301,
    // we listen to the response event for the leading hop.
    const redirectResponses: { url: string; status: number }[] = []
    page.on('response', (resp) => {
      if (resp.status() >= 300 && resp.status() < 400) {
        redirectResponses.push({ url: resp.url(), status: resp.status() })
      }
    })

    const finalResponse = await page.goto(
      "/posts/agentic-patterns-in-your-coding-workflow'",
    )
    expect(finalResponse, 'page.goto should return a response').not.toBeNull()

    // The first redirect we captured must be a 301 on the punctuated URL.
    const firstRedirect = redirectResponses[0]
    expect(firstRedirect, 'a 3xx hop was expected').toBeDefined()
    expect(firstRedirect!.status, 'redirect must be 301 (permanent)').toBe(301)
    expect(firstRedirect!.url).toMatch(
      /\/posts\/agentic-patterns-in-your-coding-workflow'$/,
    )

    // Final URL is the canonical slug (no apostrophe). The page may
    // resolve to a 200 (post exists) or a 404 (post not seeded in test
    // DB) — both are acceptable for proving the redirect happened.
    // The contract under test is the 301; the destination's own status
    // is not in scope of issue #414.
    expect(page.url()).toMatch(
      /\/posts\/agentic-patterns-in-your-coding-workflow$/,
    )
  })

  test('trailing parenthesis on a slug also 301-redirects', async ({ page }) => {
    // Defensive coverage for the second punctuation class — apostrophe
    // is the wild-traffic case, but the spec requires the full set.
    const redirectResponses: { url: string; status: number }[] = []
    page.on('response', (resp) => {
      if (resp.status() >= 300 && resp.status() < 400) {
        redirectResponses.push({ url: resp.url(), status: resp.status() })
      }
    })

    await page.goto('/posts/some-test-slug)')
    const firstRedirect = redirectResponses[0]
    expect(firstRedirect).toBeDefined()
    expect(firstRedirect!.status).toBe(301)
    expect(page.url()).toMatch(/\/posts\/some-test-slug$/)
  })
})
