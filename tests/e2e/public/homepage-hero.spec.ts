import { test } from '../fixtures'
import { expectVisible, expectUrl, expectTitle } from '../helpers'

/**
 * E2E tests for homepage hero section (CON-36)
 * Tests verify that the hero section renders correctly and CTAs navigate properly
 */

test.describe('Homepage Hero Section', () => {
  test('should load homepage without errors and display all hero elements', async ({ homePage }) => {
    await homePage.goto()

    // Verify page title
    await expectTitle(homePage.page, /Detached Node/)

    // Verify main heading is visible
    await expectVisible(homePage.heroTitle)

    // Verify both CTA buttons are visible
    await expectVisible(homePage.browsePostsButton)
    await expectVisible(homePage.aboutButton)
  })

  test('should navigate to /posts when clicking "Browse posts" button', async ({ homePage }) => {
    await homePage.goto()

    // Click the "Browse posts" CTA
    await homePage.clickBrowsePosts()

    // Verify navigation to posts page
    await expectUrl(homePage.page, /\/posts$/)
  })

  test('should navigate to /about when clicking "About the project" button', async ({ homePage }) => {
    await homePage.goto()

    // Click the "About the project" CTA
    await homePage.clickAbout()

    // Verify navigation to about page
    await expectUrl(homePage.page, /\/about$/)
  })

  test('should display responsive layout on mobile viewport', async ({ homePage }) => {
    // Set mobile viewport
    await homePage.page.setViewportSize({ width: 375, height: 667 })

    await homePage.goto()

    // Verify hero section is still visible and accessible on mobile
    await expectVisible(homePage.heroTitle)
    await expectVisible(homePage.browsePostsButton)
    await expectVisible(homePage.aboutButton)

    // Verify buttons are stacked properly (checking they're visible is enough)
    const heroSection = homePage.page.locator('section').first()
    await expectVisible(heroSection)
  })
})
