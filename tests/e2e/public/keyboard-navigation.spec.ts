import { test, expect } from '../fixtures'
import { expectVisible } from '../helpers'

/**
 * E2E Tests: Keyboard Navigation and Accessibility (CON-51)
 *
 * Verifies that the site is accessible via keyboard navigation:
 * - All links are focusable via Tab key
 * - Post cards are activatable via Enter key
 * - Focus states are visible (outline styling)
 * - Proper heading hierarchy (h1, h2, etc.)
 * - Language attribute is set (lang="en")
 */

test.describe('Keyboard Navigation - Tab Key', () => {
  test('should allow tabbing through header navigation links on homepage', async ({ homePage }) => {
    await homePage.goto()

    // Focus first element (logo)
    await homePage.page.keyboard.press('Tab')
    const logo = homePage.page.getByRole('link', { name: /^Detached Node$/i })
    await expect(logo).toBeFocused()

    // Tab to Home link
    await homePage.page.keyboard.press('Tab')
    const homeLink = homePage.navigation.getByRole('link', { name: /^Home$/i })
    await expect(homeLink).toBeFocused()

    // Tab to Posts link
    await homePage.page.keyboard.press('Tab')
    const postsLink = homePage.navigation.getByRole('link', { name: /^Posts$/i })
    await expect(postsLink).toBeFocused()

    // Tab to About link
    await homePage.page.keyboard.press('Tab')
    const aboutLink = homePage.navigation.getByRole('link', { name: /^About$/i })
    await expect(aboutLink).toBeFocused()
  })

  test('should allow tabbing through hero section links', async ({ homePage }) => {
    await homePage.goto()

    // Tab through header first (4 tabs: logo + 3 nav links)
    for (let i = 0; i < 4; i++) {
      await homePage.page.keyboard.press('Tab')
    }

    // Next tab should focus "Browse posts" button
    await homePage.page.keyboard.press('Tab')
    const browsePostsButton = homePage.page.getByRole('link', { name: /browse posts/i })
    await expect(browsePostsButton).toBeFocused()

    // Next tab should focus "About the project" button
    await homePage.page.keyboard.press('Tab')
    const aboutButton = homePage.page.getByRole('link', { name: /about the project/i })
    await expect(aboutButton).toBeFocused()
  })

  test('should allow tabbing through featured post cards', async ({ homePage }) => {
    await homePage.goto()

    // Get count of featured posts
    const featuredPostCount = await homePage.getFeaturedPostCount()

    // Skip to featured posts section (logo + 3 nav + 2 hero buttons = 6 tabs)
    for (let i = 0; i < 6; i++) {
      await homePage.page.keyboard.press('Tab')
    }

    // Tab through each featured post card
    if (featuredPostCount > 0) {
      for (let i = 0; i < featuredPostCount; i++) {
        await homePage.page.keyboard.press('Tab')
        const card = homePage.featuredPostCards.nth(i)
        await expect(card).toBeFocused()
      }
    }
  })

  test('should allow tabbing through footer links', async ({ homePage }) => {
    await homePage.goto()

    // Focus on footer posts link directly
    const footerPostsLink = homePage.page.locator('footer').getByRole('link', { name: /^Posts$/i })
    await footerPostsLink.focus()
    await expect(footerPostsLink).toBeFocused()

    // Tab forward to About link
    await homePage.page.keyboard.press('Tab')
    const footerAboutLink = homePage.page.locator('footer').getByRole('link', { name: /^About$/i })
    await expect(footerAboutLink).toBeFocused()
  })

  test('should allow tabbing through all links on posts page', async ({ postsPage }) => {
    await postsPage.goto()

    // Verify header links are focusable
    await postsPage.page.keyboard.press('Tab')
    const logo = postsPage.page.getByRole('link', { name: /^Detached Node$/i })
    await expect(logo).toBeFocused()

    await postsPage.page.keyboard.press('Tab')
    const homeLink = postsPage.navigation.getByRole('link', { name: /^Home$/i })
    await expect(homeLink).toBeFocused()

    await postsPage.page.keyboard.press('Tab')
    const postsLink = postsPage.navigation.getByRole('link', { name: /^Posts$/i })
    await expect(postsLink).toBeFocused()

    await postsPage.page.keyboard.press('Tab')
    const aboutLink = postsPage.navigation.getByRole('link', { name: /^About$/i })
    await expect(aboutLink).toBeFocused()
  })

  test('should allow tabbing through all links on about page', async ({ aboutPage }) => {
    await aboutPage.goto()

    // Verify header links are focusable
    await aboutPage.page.keyboard.press('Tab')
    const logo = aboutPage.page.getByRole('link', { name: /^Detached Node$/i })
    await expect(logo).toBeFocused()

    await aboutPage.page.keyboard.press('Tab')
    const homeLink = aboutPage.navigation.getByRole('link', { name: /^Home$/i })
    await expect(homeLink).toBeFocused()

    await aboutPage.page.keyboard.press('Tab')
    const postsLink = aboutPage.navigation.getByRole('link', { name: /^Posts$/i })
    await expect(postsLink).toBeFocused()

    await aboutPage.page.keyboard.press('Tab')
    const aboutLink = aboutPage.navigation.getByRole('link', { name: /^About$/i })
    await expect(aboutLink).toBeFocused()
  })
})

test.describe('Keyboard Navigation - Enter Key Activation', () => {
  test('should activate navigation links with Enter key', async ({ homePage }) => {
    await homePage.goto()

    // Tab to Posts link
    await homePage.page.keyboard.press('Tab') // logo
    await homePage.page.keyboard.press('Tab') // Home
    await homePage.page.keyboard.press('Tab') // Posts

    // Press Enter to navigate
    await homePage.page.keyboard.press('Enter')
    await homePage.page.waitForURL(/\/posts$/)

    // Verify we're on posts page
    await expect(homePage.page).toHaveURL(/\/posts$/)
  })

  test('should activate hero buttons with Enter key', async ({ homePage }) => {
    await homePage.goto()

    // Tab to "Browse posts" button (4 tabs for header + 1 for button)
    for (let i = 0; i < 5; i++) {
      await homePage.page.keyboard.press('Tab')
    }

    // Press Enter to navigate
    await homePage.page.keyboard.press('Enter')
    await homePage.page.waitForURL(/\/posts$/)

    // Verify navigation worked
    await expect(homePage.page).toHaveURL(/\/posts$/)
  })

  test('should activate featured post cards with Enter key', async ({ homePage }) => {
    await homePage.goto()

    const featuredPostCount = await homePage.getFeaturedPostCount()

    if (featuredPostCount > 0) {
      // Tab to first featured post card (6 tabs to skip header + hero)
      for (let i = 0; i < 7; i++) {
        await homePage.page.keyboard.press('Tab')
      }

      // Get the href of the focused card for verification
      const firstCard = homePage.featuredPostCards.first()
      const href = await firstCard.getAttribute('href')

      // Press Enter to navigate
      await homePage.page.keyboard.press('Enter')

      // Verify we navigated to the post detail page
      if (href) {
        await homePage.page.waitForURL(new RegExp(href))
        await expect(homePage.page).toHaveURL(new RegExp(href))
      }
    }
  })

  test('should activate footer links with Enter key', async ({ homePage }) => {
    await homePage.goto()

    // Focus on footer About link directly
    const footerAboutLink = homePage.page.locator('footer').getByRole('link', { name: /^About$/i })
    await footerAboutLink.focus()

    // Press Enter to navigate
    await homePage.page.keyboard.press('Enter')
    await homePage.page.waitForURL(/\/about$/)

    // Verify navigation worked
    await expect(homePage.page).toHaveURL(/\/about$/)
  })
})

test.describe('Focus Visibility', () => {
  test('should show visible focus outline on navigation links', async ({ homePage }) => {
    await homePage.goto()

    // Tab to first link
    await homePage.page.keyboard.press('Tab')
    const logo = homePage.page.getByRole('link', { name: /^Detached Node$/i })

    // Verify focus ring is visible (outline should be set)
    const outlineStyle = await logo.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return {
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
        outlineColor: styles.outlineColor,
      }
    })

    // Outline should exist and not be "none"
    expect(outlineStyle.outlineStyle).not.toBe('none')
    expect(outlineStyle.outlineWidth).not.toBe('0px')
  })

  test('should show visible focus outline on buttons', async ({ homePage }) => {
    await homePage.goto()

    // Tab to "Browse posts" button
    for (let i = 0; i < 5; i++) {
      await homePage.page.keyboard.press('Tab')
    }

    const browsePostsButton = homePage.page.getByRole('link', { name: /browse posts/i })

    // Verify focus ring is visible
    const outlineStyle = await browsePostsButton.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return {
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
      }
    })

    expect(outlineStyle.outlineStyle).not.toBe('none')
    expect(outlineStyle.outlineWidth).not.toBe('0px')
  })

  test('should show visible focus outline on post cards', async ({ homePage }) => {
    await homePage.goto()

    const featuredPostCount = await homePage.getFeaturedPostCount()

    if (featuredPostCount > 0) {
      // Tab to first featured post card
      for (let i = 0; i < 7; i++) {
        await homePage.page.keyboard.press('Tab')
      }

      const firstCard = homePage.featuredPostCards.first()

      // Verify focus ring is visible
      const outlineStyle = await firstCard.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return {
          outlineWidth: styles.outlineWidth,
          outlineStyle: styles.outlineStyle,
        }
      })

      expect(outlineStyle.outlineStyle).not.toBe('none')
      expect(outlineStyle.outlineWidth).not.toBe('0px')
    }
  })

  test('should maintain focus visibility across different pages', async ({ page }) => {
    const pages = ['/', '/posts', '/about']

    for (const pagePath of pages) {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')

      // Tab to first navigation link
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')

      const homeLink = page.locator('nav').getByRole('link', { name: /^Home$/i })

      // Verify focus ring is visible on each page
      const outlineStyle = await homeLink.evaluate((el) => {
        const styles = window.getComputedStyle(el)
        return {
          outlineWidth: styles.outlineWidth,
          outlineStyle: styles.outlineStyle,
        }
      })

      expect(outlineStyle.outlineStyle).not.toBe('none')
      expect(outlineStyle.outlineWidth).not.toBe('0px')
    }
  })
})

test.describe('Heading Hierarchy', () => {
  test('should have proper heading hierarchy on homepage', async ({ homePage }) => {
    await homePage.goto()

    // Verify h1 exists and is unique
    const h1Elements = await homePage.page.locator('h1').count()
    expect(h1Elements).toBe(1)

    const h1 = homePage.page.getByRole('heading', { level: 1 })
    await expectVisible(h1)
    const h1Text = await h1.textContent()
    expect(h1Text).toContain('clean, repeatable structure')

    // Verify h2 exists for Featured posts
    const h2Elements = await homePage.page.locator('h2').count()
    expect(h2Elements).toBeGreaterThanOrEqual(1)

    const h2 = homePage.page.getByRole('heading', { level: 2, name: /featured posts/i })
    await expectVisible(h2)
  })

  test('should have proper heading hierarchy on posts page', async ({ postsPage }) => {
    await postsPage.goto()

    // Verify h1 exists and is unique
    const h1Elements = await postsPage.page.locator('h1').count()
    expect(h1Elements).toBe(1)

    const h1 = postsPage.page.getByRole('heading', { level: 1 })
    await expectVisible(h1)
    const h1Text = await h1.textContent()
    expect(h1Text).toBeTruthy()
  })

  test('should have proper heading hierarchy on about page', async ({ aboutPage }) => {
    await aboutPage.goto()

    // Verify h1 exists and is unique
    const h1Elements = await aboutPage.page.locator('h1').count()
    expect(h1Elements).toBe(1)

    const h1 = aboutPage.page.getByRole('heading', { level: 1 })
    await expectVisible(h1)
    const h1Text = await h1.textContent()
    expect(h1Text).toBeTruthy()
  })

  test('should not skip heading levels on homepage', async ({ homePage }) => {
    await homePage.goto()

    // Get all headings in order
    const headings = await homePage.page.locator('h1, h2, h3, h4, h5, h6').all()
    const headingLevels = await Promise.all(
      headings.map(async (heading) => {
        const tagName = await heading.evaluate((el) => el.tagName.toLowerCase())
        return parseInt(tagName.substring(1))
      })
    )

    // Verify we start with h1
    expect(headingLevels[0]).toBe(1)

    // Verify no level skips (e.g., h1 -> h3 without h2)
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1]
      // Difference should be 0 (same level), 1 (next level), or negative (going back up)
      expect(diff).toBeLessThanOrEqual(1)
    }
  })

  test('should have h3 headings for post card titles', async ({ homePage }) => {
    await homePage.goto()

    const featuredPostCount = await homePage.getFeaturedPostCount()

    if (featuredPostCount > 0) {
      // Verify post cards use h3 for titles
      const h3Elements = await homePage.page.locator('h3').count()
      expect(h3Elements).toBeGreaterThanOrEqual(featuredPostCount)

      // Verify each card has an h3
      for (let i = 0; i < featuredPostCount; i++) {
        const card = homePage.featuredPostCards.nth(i)
        const h3 = card.locator('h3')
        await expectVisible(h3)
      }
    }
  })
})

test.describe('Language Attribute', () => {
  test('should have lang="en" attribute on html element', async ({ page }) => {
    await page.goto('/')

    // Verify html element has lang attribute set to "en"
    const htmlLang = await page.locator('html').getAttribute('lang')
    expect(htmlLang).toBe('en')
  })

  test('should have lang="en" on all pages', async ({ page }) => {
    const pages = ['/', '/posts', '/about']

    for (const pagePath of pages) {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')

      const htmlLang = await page.locator('html').getAttribute('lang')
      expect(htmlLang).toBe('en')
    }
  })
})
