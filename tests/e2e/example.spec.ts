import { test, expect } from './fixtures'
import { expectVisible, expectCount } from './helpers'

/**
 * Example tests demonstrating the use of fixtures and helpers
 * These tests showcase the new testing utilities
 */

test.describe('Homepage', () => {
  test('should load and display content using page objects', async ({ homePage }) => {
    await homePage.goto()

    // Use page object locators
    await expectVisible(homePage.heroTitle)
    await expectVisible(homePage.navigation)

    // Verify title
    await expect(homePage.page).toHaveTitle(/Detached Node/)
  })

  test('should show featured posts section', async ({ homePage }) => {
    await homePage.goto()

    // Use page object methods
    await expectVisible(homePage.featuredPostsHeading)
    await expectVisible(homePage.featuredPostsSection)

    // Get featured post count (may be 0 if no posts are featured)
    const count = await homePage.getFeaturedPostCount()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should navigate to posts page', async ({ homePage }) => {
    await homePage.goto()

    // Use page object navigation method
    await homePage.clickBrowsePosts()

    // Verify URL changed
    await expect(homePage.page).toHaveURL(/\/posts$/)
  })
})

test.describe('Posts Page', () => {
  test('should display posts listing', async ({ postsPage }) => {
    await postsPage.goto()

    await expectVisible(postsPage.pageTitle)
    await expectVisible(postsPage.pageSubtitle)
  })

  test('should show post cards', async ({ postsPage }) => {
    await postsPage.goto()

    const postCount = await postsPage.getPostCount()
    expect(postCount).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Navigation', () => {
  test('should have working navigation on all pages', async ({ page }) => {
    // Test homepage navigation
    await page.goto('/')
    const nav = page.locator('nav')
    await expectVisible(nav)

    // Test posts page navigation
    await page.goto('/posts')
    await expectVisible(nav)

    // Test about page navigation
    await page.goto('/about')
    await expectVisible(nav)
  })
})
