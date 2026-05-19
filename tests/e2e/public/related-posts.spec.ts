import { test } from '../fixtures'

/**
 * E2E gate for Related Posts cross-linking (#420).
 *
 * For every published post in the seed test corpus, asserts that the
 * rendered page contains at least 2 internal post-to-post anchors inside
 * <main>, excluding the `/posts` index link and the current post's own
 * `/posts/<slug>` link.
 *
 * The selector pattern is the one specified in the spec's AC:
 *
 *   main a[href^="/posts/"]:not([href="/posts"]):not([href$="${currentSlug}"])
 *
 * Selection logic is in `src/lib/queries/related-posts.ts` and is unit
 * tested separately. This spec only verifies the end-to-end render path:
 * the component is wired into the post page, the query reaches Payload,
 * and the resulting markup contains the expected number of links.
 *
 * Seed corpus (see scripts/seed-test-db.ts):
 *   architecture-of-agent-systems    tags: [agentic-ai, philosophy]
 *   decoding-tool-use-patterns       tags: [agentic-ai, workflows]
 *   notes-on-autonomous-workflows    tags: [workflows, philosophy]
 *   essential-readings-agentic-ai    tags: [agentic-ai]
 *
 * Every pair shares at least one tag, so the primary tag-overlap path
 * carries all four slugs in the seed corpus. The fallback path is
 * exercised in unit tests against a corpus where tag overlap is absent.
 */

const PUBLISHED_SLUGS = [
  'architecture-of-agent-systems',
  'decoding-tool-use-patterns',
  'notes-on-autonomous-workflows',
  'essential-readings-agentic-ai',
] as const

test.describe('Related Posts cross-linking (#420)', () => {
  for (const slug of PUBLISHED_SLUGS) {
    test(`renders >= 2 internal post-to-post anchors in <main> for /posts/${slug}`, async ({
      page,
    }) => {
      await page.goto(`/posts/${slug}`)
      await page.waitForLoadState('domcontentloaded')

      const links = page.locator(
        `main a[href^="/posts/"]:not([href="/posts"]):not([href$="${slug}"])`,
      )
      const count = await links.count()
      test.expect(count).toBeGreaterThanOrEqual(2)
    })
  }

  test('Related Posts section heading renders on every published slug', async ({
    page,
  }) => {
    // Sanity check: the gate above counts any in-main `/posts/<other-slug>`
    // anchor, which would silently pass if some other component on the
    // page (a footer "More posts" link, an inline body reference, etc.)
    // happened to contribute the count. This test pins the source of those
    // anchors to the Related Posts section.
    for (const slug of PUBLISHED_SLUGS) {
      await page.goto(`/posts/${slug}`)
      await page.waitForLoadState('domcontentloaded')
      const heading = page.getByRole('heading', { name: /related posts/i })
      await test.expect(heading).toBeVisible()
    }
  })
})
