import { test, expect } from '../fixtures'

/**
 * E2E verification for issue #418 — Last-Modified headers.
 *
 * Asserts that the proxy middleware (`src/proxy.ts`) injects an RFC 7231
 * `Last-Modified` header on the five Payload-backed route shapes:
 *
 *   - `/posts/<slug>`                       — Payload Posts.updatedAt
 *   - `/agentic-design-patterns/<slug>`     — static pattern dateModified
 *   - `/posts`                              — ISR-snapshot floor
 *   - `/agentic-design-patterns`            — ISR-snapshot floor
 *   - `/about`                              — Payload Pages.updatedAt
 *
 * Seed-test-db post slugs (from `scripts/seed-test-db.ts` and the
 * existing post-detail spec):
 *   - architecture-of-agent-systems
 *   - decoding-tool-use-patterns
 *   - notes-on-autonomous-workflows
 *
 * Pattern slugs come from `src/data/agentic-design-patterns/index.ts`
 * (the static catalog — independent of the seed DB).
 */

const HTTP_DATE_REGEX = /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2} GMT$/

test.describe('Last-Modified header (issue #418)', () => {
  test('post detail emits Last-Modified in RFC 7231 form', async ({ request }) => {
    const response = await request.get('/posts/architecture-of-agent-systems')
    expect(response.status()).toBe(200)
    const lastModified = response.headers()['last-modified']
    expect(lastModified, 'Last-Modified header should be set on post detail').toBeDefined()
    expect(lastModified).toMatch(HTTP_DATE_REGEX)
    // The value must round-trip through Date() — proves it's actually a
    // valid HTTP-date, not just shape-matching.
    expect(Number.isNaN(new Date(lastModified).getTime())).toBe(false)
  })

  test('pattern detail emits Last-Modified in RFC 7231 form', async ({ request }) => {
    const response = await request.get('/agentic-design-patterns/prompt-chaining')
    expect(response.status()).toBe(200)
    const lastModified = response.headers()['last-modified']
    expect(lastModified, 'Last-Modified header should be set on pattern detail').toBeDefined()
    expect(lastModified).toMatch(HTTP_DATE_REGEX)
    expect(Number.isNaN(new Date(lastModified).getTime())).toBe(false)
  })

  test('posts listing emits Last-Modified from the ISR-snapshot floor', async ({ request }) => {
    const response = await request.get('/posts')
    expect(response.status()).toBe(200)
    const lastModified = response.headers()['last-modified']
    expect(lastModified, 'Last-Modified header should be set on /posts').toBeDefined()
    expect(lastModified).toMatch(HTTP_DATE_REGEX)
  })

  test('agentic-design-patterns listing emits Last-Modified from the ISR-snapshot floor', async ({ request }) => {
    const response = await request.get('/agentic-design-patterns')
    expect(response.status()).toBe(200)
    const lastModified = response.headers()['last-modified']
    expect(lastModified, 'Last-Modified header should be set on /agentic-design-patterns').toBeDefined()
    expect(lastModified).toMatch(HTTP_DATE_REGEX)
  })

  test('about emits Last-Modified from the About Pages doc updatedAt', async ({ request }) => {
    const response = await request.get('/about')
    expect(response.status()).toBe(200)
    const lastModified = response.headers()['last-modified']
    expect(lastModified, 'Last-Modified header should be set on /about').toBeDefined()
    expect(lastModified).toMatch(HTTP_DATE_REGEX)
    expect(Number.isNaN(new Date(lastModified).getTime())).toBe(false)
  })

  test('homepage does not emit Last-Modified (out of scope for this proxy)', async ({ request }) => {
    const response = await request.get('/')
    expect(response.status()).toBe(200)
    // The matcher in `src/proxy.ts` enumerates only the five route
    // shapes — `/` is not covered. ETag should still be present (Next.js
    // auto-generates it) but Last-Modified should not be.
    expect(response.headers()['last-modified']).toBeUndefined()
  })

  test('Last-Modified coexists with ETag', async ({ request }) => {
    const response = await request.get('/posts/architecture-of-agent-systems')
    expect(response.status()).toBe(200)
    expect(response.headers()['last-modified']).toBeDefined()
    expect(response.headers()['etag']).toBeDefined()
  })
})
