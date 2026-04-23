import { test, expect } from '../fixtures'

/**
 * E2E tests for theme-aware hero images (issue #53).
 *
 * Both the post detail page and the PostCard on the listing render two
 * stacked hero images — one visible in light mode, one in dark mode.
 * The theme toggle wraps setTheme in document.startViewTransition(), so
 * the browser crossfades between the two variants as part of the
 * page-wide theme transition.
 *
 * Assertions here cover:
 *  - correct variant visible per theme (display: block vs display: none)
 *  - toggling swaps which variant is visible
 *  - no layout shift (the container bounding box stays identical)
 *  - no console errors
 *
 * Uses the seeded post 'architecture-of-agent-systems' — per seed-test-db.ts
 * both variants are populated (with the same underlying image, which is
 * sufficient to exercise the rendering + toggle machinery; production
 * data has genuinely different light/dark assets).
 */

const DETAIL_SLUG = 'architecture-of-agent-systems'

async function setThemeAndGoto(
  page: import('@playwright/test').Page,
  theme: 'light' | 'dark',
  url: string,
) {
  // addInitScript runs on every new navigation, so set localStorage before
  // the first goto. Reloading/waiting before any navigation has occurred
  // (page is still about:blank) would time out — next-themes only runs
  // once the app loads.
  await page.addInitScript((t) => {
    localStorage.setItem('theme', t)
  }, theme)
  await page.goto(url)
  await page.waitForFunction(
    (expected) =>
      document.documentElement.classList.contains(expected) ||
      // next-themes sometimes writes the attribute before the class during
      // first paint; accept either signal.
      document.documentElement.getAttribute('data-theme') === expected,
    theme,
  )
}

async function toggleTheme(page: import('@playwright/test').Page) {
  // Use the header toggle (there may be additional theme toggles elsewhere,
  // e.g. a text indicator button; .first() picks the canonical one).
  await page.locator('button[aria-label*="mode"]').first().click()
  // The view-transition animation runs for 400ms; give it a little headroom
  // plus one extra frame for any settle effects.
  await page.waitForTimeout(500)
}

test.describe('Theme-aware hero', () => {
  test.describe('Post detail page', () => {
    test('renders the light hero visible and the dark hero hidden in light mode', async ({
      page,
    }) => {
      await setThemeAndGoto(page, 'light', `/posts/${DETAIL_SLUG}`)
      await page.waitForLoadState('domcontentloaded')

      const heroWrapper = page.locator('article div.relative').filter({
        has: page.locator('img'),
      }).first()
      await expect(heroWrapper).toBeVisible()

      const lightImg = heroWrapper.locator('img').nth(0)
      const darkImg = heroWrapper.locator('img').nth(1)

      // In light mode: light is visible, dark is display:none
      await expect(lightImg).toBeVisible()
      const lightBox = await lightImg.boundingBox()
      expect(lightBox).not.toBeNull()
      expect(lightBox!.width).toBeGreaterThan(0)
      expect(lightBox!.height).toBeGreaterThan(0)

      const darkDisplay = await darkImg.evaluate(
        (el) => window.getComputedStyle(el).display,
      )
      expect(darkDisplay).toBe('none')
    })

    test('crossfades to the dark hero when the theme toggles, with no layout shift', async ({
      page,
    }) => {
      const consoleErrors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text())
      })

      await setThemeAndGoto(page, 'light', `/posts/${DETAIL_SLUG}`)
      await page.waitForLoadState('domcontentloaded')

      const heroWrapper = page
        .locator('article div.relative')
        .filter({ has: page.locator('img') })
        .first()
      await expect(heroWrapper).toBeVisible()

      const boxBefore = await heroWrapper.boundingBox()
      expect(boxBefore).not.toBeNull()

      const lightImg = heroWrapper.locator('img').nth(0)
      const darkImg = heroWrapper.locator('img').nth(1)

      // Pre-toggle: light visible, dark hidden.
      await expect(lightImg).toBeVisible()
      let darkDisplay = await darkImg.evaluate(
        (el) => window.getComputedStyle(el).display,
      )
      expect(darkDisplay).toBe('none')

      await toggleTheme(page)

      // Post-toggle: dark visible, light hidden.
      await expect(darkImg).toBeVisible()
      const lightDisplay = await lightImg.evaluate(
        (el) => window.getComputedStyle(el).display,
      )
      expect(lightDisplay).toBe('none')

      // Sanity check: dark wasn't a red herring that was always visible.
      darkDisplay = await darkImg.evaluate(
        (el) => window.getComputedStyle(el).display,
      )
      expect(darkDisplay).not.toBe('none')

      // No layout shift: the container bounding box must match.
      // toBeCloseTo(x, 0) allows 0.5px tolerance — absorbs sub-pixel rounding
      // after the view transition without letting real layout shift through.
      const boxAfter = await heroWrapper.boundingBox()
      expect(boxAfter).not.toBeNull()
      expect(boxAfter!.width).toBeCloseTo(boxBefore!.width, 0)
      expect(boxAfter!.height).toBeCloseTo(boxBefore!.height, 0)
      expect(boxAfter!.x).toBeCloseTo(boxBefore!.x, 0)
      expect(boxAfter!.y).toBeCloseTo(boxBefore!.y, 0)

      expect(consoleErrors).toEqual([])
    })
  })

  test.describe('Post listing', () => {
    test('renders theme-appropriate hero on PostCard and swaps on toggle', async ({
      page,
    }) => {
      await setThemeAndGoto(page, 'light', '/posts')
      await page.waitForLoadState('domcontentloaded')

      // Find the first PostCard that actually has a hero (some seeded posts
      // may not — the spec requires coverage of 'at least one' card).
      const cardHero = page
        .locator('a[href^="/posts/"] div.relative')
        .filter({ has: page.locator('img') })
        .first()
      await expect(cardHero).toBeVisible()

      const lightImg = cardHero.locator('img').nth(0)
      const darkImg = cardHero.locator('img').nth(1)

      await expect(lightImg).toBeVisible()
      let darkDisplay = await darkImg.evaluate(
        (el) => window.getComputedStyle(el).display,
      )
      expect(darkDisplay).toBe('none')

      const boxBefore = await cardHero.boundingBox()
      expect(boxBefore).not.toBeNull()

      await toggleTheme(page)

      await expect(darkImg).toBeVisible()
      const lightDisplay = await lightImg.evaluate(
        (el) => window.getComputedStyle(el).display,
      )
      expect(lightDisplay).toBe('none')
      darkDisplay = await darkImg.evaluate(
        (el) => window.getComputedStyle(el).display,
      )
      expect(darkDisplay).not.toBe('none')

      const boxAfter = await cardHero.boundingBox()
      expect(boxAfter).not.toBeNull()
      expect(boxAfter!.width).toBeCloseTo(boxBefore!.width, 0)
      expect(boxAfter!.height).toBeCloseTo(boxBefore!.height, 0)
    })
  })
})
