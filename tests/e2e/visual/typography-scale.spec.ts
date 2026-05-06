import { test, expect } from '@playwright/test'

/**
 * Verifies the magazine-scale typography spec
 * (docs/superpowers/specs/2026-05-05-magazine-scale-typography-design.md)
 *
 * Asserts computed CSS at the spec's three reference viewports:
 *   375px → body 19px, frame fits viewport
 *   768px → body roughly mid-clamp
 *   1280px → body 22px, frame 1280px, prose 960px
 *
 * Slug 'architecture-of-agent-systems' is one of the seed-test-db post
 * slugs (see seed-test-db.ts and tests/e2e/public/post-detail.spec.ts).
 */

const POST_SLUG = 'architecture-of-agent-systems'

async function getComputedNumber(page, selector: string, prop: string): Promise<number> {
  return await page.locator(selector).first().evaluate(
    (el, p) => parseFloat(window.getComputedStyle(el).getPropertyValue(p)),
    prop,
  )
}

test.describe('Magazine-scale typography', () => {
  test('body type at 1280 viewport is 22px (max of clamp)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto(`/posts/${POST_SLUG}`)
    const fontSize = await getComputedNumber(page, '.prose', 'font-size')
    expect(fontSize).toBeGreaterThanOrEqual(21.5)
    expect(fontSize).toBeLessThanOrEqual(22.5)
  })

  test('body type at 375 viewport is 19px (min of clamp)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 })
    await page.goto(`/posts/${POST_SLUG}`)
    const fontSize = await getComputedNumber(page, '.prose', 'font-size')
    expect(fontSize).toBeGreaterThanOrEqual(18.5)
    expect(fontSize).toBeLessThanOrEqual(19.5)
  })

  test('site frame max-width is 1280px on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto('/')
    const frameWidth = await getComputedNumber(page, '.site-frame', 'max-width')
    expect(frameWidth).toBe(1280)
  })

  test('prose container max-width is 960px on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 900 })
    await page.goto(`/posts/${POST_SLUG}`)
    const proseWrapper = page.locator('main > div').first()
    const w = await proseWrapper.evaluate(el =>
      parseFloat(window.getComputedStyle(el).maxWidth)
    )
    expect(w).toBe(960)
  })

  test('body type scales fluidly between min and max at 768 viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 900 })
    await page.goto(`/posts/${POST_SLUG}`)
    const fontSize = await getComputedNumber(page, '.prose', 'font-size')
    expect(fontSize).toBeGreaterThan(19.5)
    expect(fontSize).toBeLessThan(21.0)
  })
})
