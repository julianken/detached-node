import { test } from '../fixtures'
import { expectVisible, expectTitle } from '../helpers'

/**
 * E2E tests for homepage hero section (CON-36)
 * Tests verify that the hero section renders correctly.
 */

test.describe('Homepage Hero Section', () => {
  test('should load homepage without errors and display hero elements', async ({ homePage }) => {
    await homePage.goto()

    await expectTitle(homePage.page, /detached-node/)
    await expectVisible(homePage.heroTitle)
  })

  test('should display hero on mobile viewport', async ({ homePage }) => {
    await homePage.page.setViewportSize({ width: 375, height: 667 })
    await homePage.goto()

    await expectVisible(homePage.heroTitle)

    const heroSection = homePage.page.locator('section').first()
    await expectVisible(heroSection)
  })
})
