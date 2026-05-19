import { test, expect } from '../fixtures'

/**
 * E2E verification for issue #426 — Microsoft Clarity localhost runtime
 * guard. This is Defense B in the dual-defense scheme (Defense A is the
 * build-time env-var gate in `src/app/(frontend)/layout.tsx`).
 *
 * The bot review on #426 flagged that the original acceptance-criteria
 * verification step for Defense B (a curl invocation against the local
 * prod-mode server) is structurally unverifiable — curl does not execute
 * JavaScript, so it cannot exercise the runtime hostname guard. The
 * correct verification is a real browser (Playwright) that:
 *
 *   (a) loads `http://localhost:3000/`,
 *   (b) waits long enough for any deferred / `afterInteractive` scripts
 *       to run, and
 *   (c) asserts that no network request is ever made to `clarity.ms`.
 *
 * The build-time half of the verification (Defense A — the inline
 * <script id="microsoft-clarity"> tag must still appear in the HTML when
 * the env var is set at build time, so that production receives the
 * tag) is verified separately via a curl-equivalent HTML-text assertion
 * below. Splitting the two halves keeps the failure modes legible:
 *
 *   - "script tag missing in HTML" -> Defense A broke (build-time gate)
 *   - "clarity.ms request observed" -> Defense B broke (runtime guard)
 *
 * Note on `pnpm dev`: in the default local dev run (no CI), the
 * Playwright webServer runs `pnpm dev`, where NODE_ENV is "development"
 * and the env var is unset on Julian's machine. In that case both
 * defenses prevent the script tag from rendering — the "tag is present"
 * assertion below is conditionally skipped. In CI (`pnpm start` with
 * the env var baked into the build via `--build-arg` if/when CI sets
 * it), the tag is present and the runtime guard is the load-bearing
 * defense. The runtime-guard "no clarity.ms request" assertion runs
 * unconditionally because it must hold in BOTH cases.
 */

test.describe('Microsoft Clarity localhost guard (issue #426)', () => {
  test('does not issue any network request to clarity.ms from a localhost session', async ({ page }) => {
    const clarityRequests: string[] = []

    // Attach the listener BEFORE navigation so the very first script
    // evaluation can't slip a request past us.
    page.on('request', (req) => {
      const url = req.url()
      if (url.includes('clarity.ms')) {
        clarityRequests.push(url)
      }
    })

    await page.goto('/')

    // The Clarity script uses `strategy="afterInteractive"`, which Next.js
    // injects after hydration. Wait for the network to settle so the
    // afterInteractive hook has had a chance to fire. If the guard works,
    // the inline IIFE returns early on the hostname check and no further
    // request is issued. If the guard is broken, the script appends a
    // `<script src="https://www.clarity.ms/tag/..." async>` tag here.
    await page.waitForLoadState('networkidle')

    // Hard assert: no `clarity.ms` URL was requested at all. The list is
    // included in the failure message so a regression points directly at
    // the offending URL (helpful if the project ID is ever rotated and
    // somehow a stale ID escapes).
    expect(
      clarityRequests,
      `Expected no requests to clarity.ms from a localhost session, but observed:\n${clarityRequests.join('\n')}`,
    ).toEqual([])
  })

  test('script tag presence in HTML reflects build-time env-var gate', async ({ request }) => {
    // Defense A check via plain HTTP fetch (no JS execution needed).
    // Reads the homepage HTML and looks for the inline Clarity initializer.
    // The script body is the load-bearing fingerprint — we look for the
    // `clarity.ms/tag/` literal because (a) it's stable across project-ID
    // rotation, and (b) it is unique to the Clarity init script in this
    // codebase.
    const response = await request.get('/')
    expect(response.status()).toBe(200)
    const html = await response.text()

    // Whether the tag is present depends on whether the build that
    // produced this server had the env var set. In local dev (no env
    // var), the tag is correctly absent — that's the build-time gate
    // doing its job. We assert both cases by reading the page's HTML
    // and reporting the observation: the test passes either way, but
    // the assertion text doubles as documentation of the contract.
    const hasTag = html.includes('microsoft-clarity') && html.includes('clarity.ms/tag/')
    const envVarSetAtBuild = Boolean(process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID)
    if (envVarSetAtBuild) {
      expect(
        hasTag,
        'NEXT_PUBLIC_CLARITY_PROJECT_ID is set at test runtime, so the HTML should contain the inline Clarity init script (Defense A allows it through). If this fails, the build-time gate is broken.',
      ).toBe(true)
      // When the tag is present, it MUST also contain the localhost
      // guard string. Otherwise Defense B was stripped from the build.
      expect(
        html.includes('localhost') && html.includes('127.0.0.1') && html.includes('::1'),
        'Inline Clarity script must contain the localhost/127.0.0.1/::1 guard (Defense B).',
      ).toBe(true)
    } else {
      // No env var at build time -> the tag must NOT be in HTML.
      // This is the dev / E2E / preview-blank-by-default contract.
      expect(
        hasTag,
        'NEXT_PUBLIC_CLARITY_PROJECT_ID is unset, so the Clarity tag must not appear in HTML (Defense A blocks it).',
      ).toBe(false)
    }
  })
})
