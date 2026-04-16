import { test, expect } from '../fixtures'
import { expectVisible, expectUrl } from '../helpers'

/**
 * E2E Tests: Site Footer (CON-39)
 *
 * Verifies that the site footer works correctly:
 * - Footer displays copyright text
 * - Footer contains "Posts" and "About" links
 * - Footer links navigate correctly
 */

test.describe('Site Footer', () => {
  test('should display footer with copyright text', async ({ homePage }) => {
    await homePage.goto()

    const footer = homePage.page.locator('footer')
    await expectVisible(footer)

    const copyright = footer.getByText(/Detached Node.*All rights reserved/i)
    await expectVisible(copyright)
  })

  test('should display Posts and About links', async ({ homePage }) => {
    await homePage.goto()

    const footer = homePage.page.locator('footer')
    const postsLink = footer.getByRole('link', { name: /^Posts$/i })
    const aboutLink = footer.getByRole('link', { name: /^About$/i })

    await expectVisible(postsLink)
    await expectVisible(aboutLink)
  })

  test('should navigate to posts page from footer', async ({ homePage }) => {
    await homePage.goto()

    const footer = homePage.page.locator('footer')
    const postsLink = footer.getByRole('link', { name: /^Posts$/i })

    await postsLink.click()
    await expectUrl(homePage.page, /\/posts$/)
  })

  test('should navigate to about page from footer', async ({ homePage }) => {
    await homePage.goto()

    const footer = homePage.page.locator('footer')
    const aboutLink = footer.getByRole('link', { name: /^About$/i })

    await aboutLink.click()
    await expectUrl(homePage.page, /\/about$/)
  })
})
