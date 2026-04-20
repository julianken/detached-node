import { test, expect } from '../fixtures'
import { expectVisible, expectUrl } from '../helpers'

/**
 * E2E Tests: Site Header Navigation (CON-38)
 *
 * Verifies that header navigation works correctly:
 * - Logo links to homepage
 * - Navigation contains correct links
 * - Navigation links work correctly
 */

test.describe('Header Navigation', () => {
  test('should navigate to homepage when clicking logo', async ({ postsPage }) => {
    await postsPage.goto()

    const logo = postsPage.page.getByRole('link', { name: /^d-n$/i })
    await expectVisible(logo)

    await logo.click()
    await expectUrl(postsPage.page, /\/$/)
  })

  test('should display all required navigation links', async ({ homePage }) => {
    await homePage.goto()

    const nav = homePage.navigation
    await expectVisible(nav)

    const homeLink = nav.getByRole('link', { name: /^Home$/i })
    const postsLink = nav.getByRole('link', { name: /^Posts$/i })
    const aboutLink = nav.getByRole('link', { name: /^About$/i })

    await expectVisible(homeLink)
    await expectVisible(postsLink)
    await expectVisible(aboutLink)
  })

  test('should navigate to posts page', async ({ homePage }) => {
    await homePage.goto()

    const postsLink = homePage.navigation.getByRole('link', { name: /^Posts$/i })
    await postsLink.click()

    await expectUrl(homePage.page, /\/posts$/)
  })

  test('should navigate to about page', async ({ homePage }) => {
    await homePage.goto()

    const aboutLink = homePage.navigation.getByRole('link', { name: /^About$/i })
    await aboutLink.click()

    await expectUrl(homePage.page, /\/about$/)
  })
})
