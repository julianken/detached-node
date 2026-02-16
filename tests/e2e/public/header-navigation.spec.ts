import { test, expect } from '../fixtures'
import { expectVisible, expectUrl } from '../helpers'

/**
 * E2E Tests: Site Header Navigation (CON-38)
 *
 * Verifies that header navigation works correctly across all public pages:
 * - Logo links to homepage
 * - Navigation contains correct links (Home, Posts, About)
 * - All navigation links work correctly
 * - Hover states are visible
 * - Header is consistent across all pages
 */

test.describe('Header Navigation', () => {
  test.describe('Logo Navigation', () => {
    test('should navigate to homepage when clicking logo from homepage', async ({ homePage }) => {
      await homePage.goto()

      const logo = homePage.page.getByRole('link', { name: /^Detached Node$/i })
      await expectVisible(logo)

      await logo.click()
      await expectUrl(homePage.page, /\/$/)
    })

    test('should navigate to homepage when clicking logo from posts page', async ({ postsPage }) => {
      await postsPage.goto()

      const logo = postsPage.page.getByRole('link', { name: /^Detached Node$/i })
      await expectVisible(logo)

      await logo.click()
      await expectUrl(postsPage.page, /\/$/)
    })

    test('should navigate to homepage when clicking logo from about page', async ({ aboutPage }) => {
      await aboutPage.goto()

      const logo = aboutPage.page.getByRole('link', { name: /^Detached Node$/i })
      await expectVisible(logo)

      await logo.click()
      await expectUrl(aboutPage.page, /\/$/)
    })
  })

  test.describe('Navigation Links', () => {
    test('should display all required navigation links on homepage', async ({ homePage }) => {
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

    test('should display all required navigation links on posts page', async ({ postsPage }) => {
      await postsPage.goto()

      const nav = postsPage.navigation
      await expectVisible(nav)

      const homeLink = nav.getByRole('link', { name: /^Home$/i })
      const postsLink = nav.getByRole('link', { name: /^Posts$/i })
      const aboutLink = nav.getByRole('link', { name: /^About$/i })

      await expectVisible(homeLink)
      await expectVisible(postsLink)
      await expectVisible(aboutLink)
    })

    test('should display all required navigation links on about page', async ({ aboutPage }) => {
      await aboutPage.goto()

      const nav = aboutPage.navigation
      await expectVisible(nav)

      const homeLink = nav.getByRole('link', { name: /^Home$/i })
      const postsLink = nav.getByRole('link', { name: /^Posts$/i })
      const aboutLink = nav.getByRole('link', { name: /^About$/i })

      await expectVisible(homeLink)
      await expectVisible(postsLink)
      await expectVisible(aboutLink)
    })
  })

  test.describe('Link Functionality', () => {
    test('should navigate to posts page from homepage', async ({ homePage }) => {
      await homePage.goto()

      const postsLink = homePage.navigation.getByRole('link', { name: /^Posts$/i })
      await postsLink.click()

      await expectUrl(homePage.page, /\/posts$/)
    })

    test('should navigate to about page from homepage', async ({ homePage }) => {
      await homePage.goto()

      const aboutLink = homePage.navigation.getByRole('link', { name: /^About$/i })
      await aboutLink.click()

      await expectUrl(homePage.page, /\/about$/)
    })

    test('should navigate to homepage from posts page', async ({ postsPage }) => {
      await postsPage.goto()

      const homeLink = postsPage.navigation.getByRole('link', { name: /^Home$/i })
      await homeLink.click()

      await expectUrl(postsPage.page, /\/$/)
    })

    test('should navigate to about page from posts page', async ({ postsPage }) => {
      await postsPage.goto()

      const aboutLink = postsPage.navigation.getByRole('link', { name: /^About$/i })
      await aboutLink.click()

      await expectUrl(postsPage.page, /\/about$/)
    })

    test('should navigate to homepage from about page', async ({ aboutPage }) => {
      await aboutPage.goto()

      const homeLink = aboutPage.navigation.getByRole('link', { name: /^Home$/i })
      await homeLink.click()

      await expectUrl(aboutPage.page, /\/$/)
    })

    test('should navigate to posts page from about page', async ({ aboutPage }) => {
      await aboutPage.goto()

      const postsLink = aboutPage.navigation.getByRole('link', { name: /^Posts$/i })
      await postsLink.click()

      await expectUrl(aboutPage.page, /\/posts$/)
    })
  })

  test.describe('Hover States', () => {
    test('should show hover state on navigation links', async ({ homePage }) => {
      await homePage.goto()

      const homeLink = homePage.navigation.getByRole('link', { name: /^Home$/i })
      const postsLink = homePage.navigation.getByRole('link', { name: /^Posts$/i })
      const aboutLink = homePage.navigation.getByRole('link', { name: /^About$/i })

      // Get initial color
      const initialColor = await homeLink.evaluate((el) =>
        window.getComputedStyle(el).color
      )

      // Hover and check color changed
      await homeLink.hover()
      const hoverColor = await homeLink.evaluate((el) =>
        window.getComputedStyle(el).color
      )

      // Colors should be different on hover
      expect(hoverColor).not.toBe(initialColor)

      // Verify other links also have hover capability
      await postsLink.hover()
      const postsHoverColor = await postsLink.evaluate((el) =>
        window.getComputedStyle(el).color
      )
      expect(postsHoverColor).not.toBe(initialColor)

      await aboutLink.hover()
      const aboutHoverColor = await aboutLink.evaluate((el) =>
        window.getComputedStyle(el).color
      )
      expect(aboutHoverColor).not.toBe(initialColor)
    })
  })

  test.describe('Header Consistency', () => {
    test('should have identical header structure across all pages', async ({ page }) => {
      // Get header structure from homepage
      await page.goto('/')
      const homeHeader = page.locator('header').first()
      await expectVisible(homeHeader)

      const homeLogo = homeHeader.getByRole('link', { name: /^Detached Node$/i })
      const homeNav = homeHeader.locator('nav')
      await expectVisible(homeLogo)
      await expectVisible(homeNav)

      const homeNavLinks = await homeNav.getByRole('link').count()

      // Verify posts page has same structure
      await page.goto('/posts')
      const postsHeader = page.locator('header').first()
      await expectVisible(postsHeader)

      const postsLogo = postsHeader.getByRole('link', { name: /^Detached Node$/i })
      const postsNav = postsHeader.locator('nav')
      await expectVisible(postsLogo)
      await expectVisible(postsNav)

      const postsNavLinks = await postsNav.getByRole('link').count()
      expect(postsNavLinks).toBe(homeNavLinks)

      // Verify about page has same structure
      await page.goto('/about')
      const aboutHeader = page.locator('header').first()
      await expectVisible(aboutHeader)

      const aboutLogo = aboutHeader.getByRole('link', { name: /^Detached Node$/i })
      const aboutNav = aboutHeader.locator('nav')
      await expectVisible(aboutLogo)
      await expectVisible(aboutNav)

      const aboutNavLinks = await aboutNav.getByRole('link').count()
      expect(aboutNavLinks).toBe(homeNavLinks)
    })

    test('should have consistent link text across all pages', async ({ page }) => {
      const pages = ['/', '/posts', '/about']

      for (const pagePath of pages) {
        await page.goto(pagePath)

        const nav = page.locator('nav')
        const links = nav.getByRole('link')

        const linkTexts = await links.allTextContents()

        // Verify we have exactly 3 links: Home, Posts, About
        expect(linkTexts).toHaveLength(3)
        expect(linkTexts).toContain('Home')
        expect(linkTexts).toContain('Posts')
        expect(linkTexts).toContain('About')
      }
    })
  })
})
