import { test, expect } from '../fixtures'

/**
 * E2E visual regression test: hero image loading state on /posts.
 *
 * This is the targeted regression test for the original bug — Next.js's
 * `placeholder="blur"` SVG filter chain rendered a 1×1 transparent PNG
 * fallback as bright olive (dark mode) / highlighter-yellow (light mode)
 * for ~0.5–4s during loading. The bug existed for ~9 months because
 * nothing tested for it.
 *
 * The assertion is colour-band-based, not snapshot-based: scan the hero
 * area for any pixel whose colour sits in the yellow band defined as
 * (R ≈ G > B and R > 200, with tolerance). If any such pixel is found
 * during the loading window, the test fails.
 *
 * The test:
 *  1. Throttles the network to "Slow 3G"-ish speeds so the hero takes
 *     long enough to load that we can sample it mid-fade.
 *  2. Navigates to /posts.
 *  3. Captures a screenshot of the post-listing hero region BEFORE the
 *     real images have finished loading.
 *  4. Walks every pixel and counts those in the yellow band.
 *  5. Fails if more than a tiny epsilon (1‰ to absorb anti-aliasing
 *     against legitimate yellows in the page chrome) of pixels are
 *     yellow.
 *
 * The new ASCII halftone path eliminates the SVG-blur codepath entirely
 * for backfilled docs. For the dual-read fallback (lqip path) on
 * non-backfilled docs, the test still runs against whatever the live
 * placeholder is, ensuring no regression sneaks in via OptimizedImage.
 */

test.describe('Hero loading state — yellow flood regression', () => {
  test('no pixels in the yellow placeholder band on /posts during loading', async ({
    page,
  }) => {
    // Slow the loading enough to capture mid-fade. We don't need to be
    // strict about the throttle profile — anything slower than fibre
    // gives the placeholder a visible window.
    const client = await page.context().newCDPSession(page)
    await client.send('Network.enable')
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (200 * 1024) / 8, // ~200 kbit/s
      uploadThroughput: (50 * 1024) / 8,
      latency: 100,
    })

    // Navigate but do NOT wait for networkidle — we want the loading
    // state, not the loaded state.
    await page.goto('/posts', { waitUntil: 'commit' })

    // Wait just long enough for the layout to settle so the hero region
    // is positioned, but short enough that the actual <img> hasn't
    // finished its byte stream.
    await page.waitForSelector('h1', { timeout: 5000 })
    await page.waitForTimeout(300)

    // Screenshot the visible viewport (which contains the first PostCard
    // hero). We don't scope to a single locator because the bug repaints
    // the whole image rectangle — full-viewport sample is the safer net.
    const png = await page.screenshot({
      animations: 'disabled',
      type: 'png',
      fullPage: false,
    })

    // Decode the PNG inline using the browser. Playwright doesn't ship a
    // PNG decoder for Node and we don't want to add `pngjs` as a dep just
    // for this test, so we hand the buffer back to the page and decode
    // via Canvas.
    const yellowFraction = await page.evaluate(async (b64) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
      const blob = new Blob([bytes], { type: 'image/png' })
      const bitmap = await createImageBitmap(blob)
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(bitmap, 0, 0)
      const { data } = ctx.getImageData(0, 0, bitmap.width, bitmap.height)

      let yellowCount = 0
      const total = data.length / 4
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        // Yellow band per bug definition: R high, G high, R ≈ G, both > B.
        const isYellow =
          r > 200 &&
          g > 200 &&
          Math.abs(r - g) <= 20 &&
          r - b > 60
        if (isYellow) yellowCount++
      }
      return yellowCount / total
    }, png.toString('base64'))

    // Tolerance: 0.1% of pixels. The page chrome (links, accent colors,
    // potential text-glitch flashes) can include genuine yellow-ish
    // pixels at the edge cases of the band. The bug repainted entire
    // hero rectangles (typically ~20–40% of the viewport), well above
    // any reasonable tolerance threshold.
    expect(yellowFraction).toBeLessThan(0.001)
  })
})
