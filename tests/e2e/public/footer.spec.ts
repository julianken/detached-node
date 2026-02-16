import { test, expect } from '../fixtures'
import { expectVisible, expectUrl } from '../helpers'

/**
 * E2E Tests: Site Footer (CON-39)
 *
 * Verifies that the site footer works correctly across all public pages:
 * - Footer displays copyright text
 * - Footer contains "Posts" and "About" links
 * - Footer is consistent across all pages
 * - Footer links have hover states
 * - Footer has responsive layout on mobile
 */

test.describe('Site Footer', () => {
  test.describe('Footer Visibility', () => {
    test('should display footer on homepage', async ({ homePage }) => {
      await homePage.goto()

      const footer = homePage.page.locator('footer')
      await expectVisible(footer)
    })

    test('should display footer on posts page', async ({ postsPage }) => {
      await postsPage.goto()

      const footer = postsPage.page.locator('footer')
      await expectVisible(footer)
    })

    test('should display footer on about page', async ({ aboutPage }) => {
      await aboutPage.goto()

      const footer = aboutPage.page.locator('footer')
      await expectVisible(footer)
    })
  })

  test.describe('Copyright Text', () => {
    test('should display copyright text on homepage', async ({ homePage }) => {
      await homePage.goto()

      const footer = homePage.page.locator('footer')
      const copyright = footer.getByText(/Detached Node.*All rights reserved/i)

      await expectVisible(copyright)
    })

    test('should display copyright text on posts page', async ({ postsPage }) => {
      await postsPage.goto()

      const footer = postsPage.page.locator('footer')
      const copyright = footer.getByText(/Detached Node.*All rights reserved/i)

      await expectVisible(copyright)
    })

    test('should display copyright text on about page', async ({ aboutPage }) => {
      await aboutPage.goto()

      const footer = aboutPage.page.locator('footer')
      const copyright = footer.getByText(/Detached Node.*All rights reserved/i)

      await expectVisible(copyright)
    })
  })

  test.describe('Footer Links', () => {
    test('should display Posts and About links on homepage', async ({ homePage }) => {
      await homePage.goto()

      const footer = homePage.page.locator('footer')
      const postsLink = footer.getByRole('link', { name: /^Posts$/i })
      const aboutLink = footer.getByRole('link', { name: /^About$/i })

      await expectVisible(postsLink)
      await expectVisible(aboutLink)
    })

    test('should display Posts and About links on posts page', async ({ postsPage }) => {
      await postsPage.goto()

      const footer = postsPage.page.locator('footer')
      const postsLink = footer.getByRole('link', { name: /^Posts$/i })
      const aboutLink = footer.getByRole('link', { name: /^About$/i })

      await expectVisible(postsLink)
      await expectVisible(aboutLink)
    })

    test('should display Posts and About links on about page', async ({ aboutPage }) => {
      await aboutPage.goto()

      const footer = aboutPage.page.locator('footer')
      const postsLink = footer.getByRole('link', { name: /^Posts$/i })
      const aboutLink = footer.getByRole('link', { name: /^About$/i })

      await expectVisible(postsLink)
      await expectVisible(aboutLink)
    })
  })

  test.describe('Link Functionality', () => {
    test('should navigate to posts page from homepage footer', async ({ homePage }) => {
      await homePage.goto()

      const footer = homePage.page.locator('footer')
      const postsLink = footer.getByRole('link', { name: /^Posts$/i })

      await postsLink.click()
      await expectUrl(homePage.page, /\/posts$/)
    })

    test('should navigate to about page from homepage footer', async ({ homePage }) => {
      await homePage.goto()

      const footer = homePage.page.locator('footer')
      const aboutLink = footer.getByRole('link', { name: /^About$/i })

      await aboutLink.click()
      await expectUrl(homePage.page, /\/about$/)
    })

    test('should navigate to posts page from about page footer', async ({ aboutPage }) => {
      await aboutPage.goto()

      const footer = aboutPage.page.locator('footer')
      const postsLink = footer.getByRole('link', { name: /^Posts$/i })

      await postsLink.click()
      await expectUrl(aboutPage.page, /\/posts$/)
    })

    test('should navigate to about page from posts page footer', async ({ postsPage }) => {
      await postsPage.goto()

      const footer = postsPage.page.locator('footer')
      const aboutLink = footer.getByRole('link', { name: /^About$/i })

      await aboutLink.click()
      await expectUrl(postsPage.page, /\/about$/)
    })
  })

  test.describe('Hover States', () => {
    test('should show hover state on footer links', async ({ homePage }) => {
      await homePage.goto()

      const footer = homePage.page.locator('footer')
      const postsLink = footer.getByRole('link', { name: /^Posts$/i })
      const aboutLink = footer.getByRole('link', { name: /^About$/i })

      // Get initial color for Posts link
      const initialColor = await postsLink.evaluate((el) =>
        window.getComputedStyle(el).color
      )

      // Hover and check color changed
      await postsLink.hover()
      const hoverColor = await postsLink.evaluate((el) =>
        window.getComputedStyle(el).color
      )

      // Colors should be different on hover
      expect(hoverColor).not.toBe(initialColor)

      // Verify About link also has hover capability
      await aboutLink.hover()
      const aboutHoverColor = await aboutLink.evaluate((el) =>
        window.getComputedStyle(el).color
      )
      expect(aboutHoverColor).not.toBe(initialColor)
    })
  })

  test.describe('Footer Consistency', () => {
    test('should have identical footer structure across all pages', async ({ page }) => {
      // Get footer structure from homepage
      await page.goto('/')
      const homeFooter = page.locator('footer')
      await expectVisible(homeFooter)

      const homeCopyright = homeFooter.getByText(/Detached Node.*All rights reserved/i)
      await expectVisible(homeCopyright)

      const homeLinksCount = await homeFooter.getByRole('link').count()

      // Verify posts page has same structure
      await page.goto('/posts')
      const postsFooter = page.locator('footer')
      await expectVisible(postsFooter)

      const postsCopyright = postsFooter.getByText(/Detached Node.*All rights reserved/i)
      await expectVisible(postsCopyright)

      const postsLinksCount = await postsFooter.getByRole('link').count()
      expect(postsLinksCount).toBe(homeLinksCount)

      // Verify about page has same structure
      await page.goto('/about')
      const aboutFooter = page.locator('footer')
      await expectVisible(aboutFooter)

      const aboutCopyright = aboutFooter.getByText(/Detached Node.*All rights reserved/i)
      await expectVisible(aboutCopyright)

      const aboutLinksCount = await aboutFooter.getByRole('link').count()
      expect(aboutLinksCount).toBe(homeLinksCount)
    })

    test('should have consistent link text across all pages', async ({ page }) => {
      const pages = ['/', '/posts', '/about']

      for (const pagePath of pages) {
        await page.goto(pagePath)

        const footer = page.locator('footer')
        const links = footer.getByRole('link')

        const linkTexts = await links.allTextContents()

        // Verify we have exactly 2 links: Posts and About
        expect(linkTexts).toHaveLength(2)
        expect(linkTexts).toContain('Posts')
        expect(linkTexts).toContain('About')
      }
    })
  })

  test.describe('Responsive Layout', () => {
    test('should display footer in mobile layout on small screens', async ({ page }) => {
      // Set viewport to mobile size
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      const footer = page.locator('footer')
      await expectVisible(footer)

      // Get the container div with flex layout
      const footerContainer = footer.locator('div').first()

      // Check that the container has flex-col on mobile
      const classList = await footerContainer.getAttribute('class')
      expect(classList).toContain('flex-col')

      // Verify links are still visible
      const postsLink = footer.getByRole('link', { name: /^Posts$/i })
      const aboutLink = footer.getByRole('link', { name: /^About$/i })

      await expectVisible(postsLink)
      await expectVisible(aboutLink)
    })

    test('should display footer in desktop layout on large screens', async ({ page }) => {
      // Set viewport to desktop size
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/')

      const footer = page.locator('footer')
      await expectVisible(footer)

      // Get the container div with flex layout
      const footerContainer = footer.locator('div').first()

      // Check that the container has flex-row and space-between on desktop
      const classList = await footerContainer.getAttribute('class')
      expect(classList).toContain('sm:flex-row')
      expect(classList).toContain('sm:justify-between')

      // Verify links are still visible
      const postsLink = footer.getByRole('link', { name: /^Posts$/i })
      const aboutLink = footer.getByRole('link', { name: /^About$/i })

      await expectVisible(postsLink)
      await expectVisible(aboutLink)
    })

    test('should maintain footer functionality on mobile', async ({ page }) => {
      // Set viewport to mobile size
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      const footer = page.locator('footer')
      const postsLink = footer.getByRole('link', { name: /^Posts$/i })

      await postsLink.click()
      await expectUrl(page, /\/posts$/)
    })
  })
})
