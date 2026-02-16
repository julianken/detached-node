import { test, expect } from '../fixtures'
import { expectVisible } from '../helpers'

/**
 * E2E Tests: Dark Mode / Color Scheme (CON-50)
 *
 * Verifies that the site correctly handles system color scheme preferences:
 * - Site respects prefers-color-scheme (light/dark)
 * - Dark mode uses correct background and text colors
 * - All UI elements have appropriate dark mode variants
 * - No text contrast issues in either mode
 * - Header, footer, and post cards are styled correctly in both modes
 *
 * Technical Implementation:
 * - Uses CSS custom properties with @media (prefers-color-scheme: dark)
 * - Light mode: --background: #ffffff, --foreground: #171717
 * - Dark mode: --background: #0a0a0a, --foreground: #ededed
 * - Tailwind dark: classes for additional elements
 *
 * Note: Colors may be returned in different formats (rgb, lab, etc.)
 * We use hex conversion for consistent comparison.
 */

/**
 * Helper function to convert any color format to hex
 */
function colorToHex(color: string): string {
  // If already hex, return as-is
  if (color.startsWith('#')) return color.toLowerCase()

  // Create a temporary element to convert color
  const temp = document.createElement('div')
  temp.style.color = color
  document.body.appendChild(temp)

  const computedColor = window.getComputedStyle(temp).color
  document.body.removeChild(temp)

  // Parse RGB values
  const match = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (match) {
    const r = parseInt(match[1])
    const g = parseInt(match[2])
    const b = parseInt(match[3])
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
  }

  return color
}

/**
 * Helper to get computed color as hex
 * Handles both RGB and LAB color space formats
 */
async function getColorAsHex(element: any, property: 'backgroundColor' | 'color' | 'borderTopColor'): Promise<string> {
  return await element.evaluate((el: HTMLElement, prop: string) => {
    const color = window.getComputedStyle(el)[prop as any]

    // Parse RGB format
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1])
      const g = parseInt(rgbMatch[2])
      const b = parseInt(rgbMatch[3])
      return '#' + [r, g, b].map((x: number) => x.toString(16).padStart(2, '0')).join('')
    }

    // For LAB/other color formats, use canvas to convert to RGB
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')

    if (ctx) {
      // Draw a pixel with the color
      ctx.fillStyle = color
      ctx.fillRect(0, 0, 1, 1)

      // Read back the pixel as RGBA
      const imageData = ctx.getImageData(0, 0, 1, 1).data
      const r = imageData[0]
      const g = imageData[1]
      const b = imageData[2]

      return '#' + [r, g, b].map((x: number) => x.toString(16).padStart(2, '0')).join('')
    }

    return color
  }, property)
}

/**
 * Helper to check if two hex colors are approximately equal
 * Allows for minor differences due to color space conversion
 */
function colorsApproximatelyEqual(actual: string, expected: string, tolerance: number = 3): boolean {
  const actualR = parseInt(actual.slice(1, 3), 16)
  const actualG = parseInt(actual.slice(3, 5), 16)
  const actualB = parseInt(actual.slice(5, 7), 16)

  const expectedR = parseInt(expected.slice(1, 3), 16)
  const expectedG = parseInt(expected.slice(3, 5), 16)
  const expectedB = parseInt(expected.slice(5, 7), 16)

  return (
    Math.abs(actualR - expectedR) <= tolerance &&
    Math.abs(actualG - expectedG) <= tolerance &&
    Math.abs(actualB - expectedB) <= tolerance
  )
}

/**
 * Expect color to match within tolerance
 */
function expectColorMatch(actual: string, expected: string, tolerance: number = 3) {
  if (!colorsApproximatelyEqual(actual, expected, tolerance)) {
    throw new Error(`Expected color ${actual} to approximately match ${expected} (tolerance: ${tolerance})`)
  }
}

test.describe('Dark Mode / Color Scheme', () => {
  test.describe('Light Mode', () => {
    test.beforeEach(async ({ page }) => {
      // Emulate light color scheme preference
      await page.emulateMedia({ colorScheme: 'light' })
    })

    test('should use light background and dark text on homepage', async ({ homePage }) => {
      await homePage.goto()

      // Check body background and text color
      const body = homePage.page.locator('body')
      const bgColor = await getColorAsHex(body, 'backgroundColor')
      const textColor = await getColorAsHex(body, 'color')

      // Light mode: white background #ffffff
      expect(bgColor).toBe('#ffffff')

      // Light mode: dark text #171717
      expect(textColor).toBe('#171717')
    })

    test('should style header correctly in light mode', async ({ homePage }) => {
      await homePage.goto()

      const header = homePage.page.locator('header')
      await expectVisible(header)

      // Check navigation link colors (text-zinc-600)
      const nav = header.locator('nav')
      const homeLink = nav.getByRole('link', { name: /^Home$/i })

      const linkColor = await getColorAsHex(homeLink, 'color')

      // text-zinc-600 in light mode: #52525b (allow small tolerance for color space conversion)
      expectColorMatch(linkColor, '#52525b')
    })

    test('should style footer correctly in light mode', async ({ homePage }) => {
      await homePage.goto()

      const footer = homePage.page.locator('footer')
      await expectVisible(footer)

      // Check footer border color (border-zinc-200)
      const borderColor = await getColorAsHex(footer, 'borderTopColor')

      // border-zinc-200 in light mode: #e4e4e7
      expectColorMatch(borderColor, '#e4e4e7')

      // Check footer text color (text-zinc-600)
      const copyright = footer.getByText(/Detached Node.*All rights reserved/i)
      const textColor = await getColorAsHex(copyright, 'color')

      expectColorMatch(textColor, '#52525b')
    })

    test('should style post cards correctly in light mode', async ({ postsPage }) => {
      await postsPage.goto()

      // Verify body background in light mode
      const body = postsPage.page.locator('body')
      const bodyBgColor = await getColorAsHex(body, 'backgroundColor')

      // Body background should be white in light mode
      expect(bodyBgColor).toBe('#ffffff')

      // Verify posts page has loaded by checking for the page title
      await expectVisible(postsPage.pageTitle)

      // If posts are available, check their styling
      const postCount = await postsPage.getPostCount()
      if (postCount > 0) {
        const firstPost = postsPage.postCards.nth(0)
        await expectVisible(firstPost)

        // Post title should be visible and use proper colors
        const title = firstPost.locator('h2')
        await expectVisible(title)
      }
    })
  })

  test.describe('Dark Mode', () => {
    test.beforeEach(async ({ page }) => {
      // Emulate dark color scheme preference
      await page.emulateMedia({ colorScheme: 'dark' })
    })

    test('should use dark background and light text on homepage', async ({ homePage }) => {
      await homePage.goto()

      // Check body background and text color
      const body = homePage.page.locator('body')
      const bgColor = await getColorAsHex(body, 'backgroundColor')
      const textColor = await getColorAsHex(body, 'color')

      // Dark mode: dark background #0a0a0a
      expect(bgColor).toBe('#0a0a0a')

      // Dark mode: light text #ededed
      expect(textColor).toBe('#ededed')
    })

    test('should style header correctly in dark mode', async ({ homePage }) => {
      await homePage.goto()

      const header = homePage.page.locator('header')
      await expectVisible(header)

      // Check navigation link colors (dark:text-zinc-400)
      const nav = header.locator('nav')
      const homeLink = nav.getByRole('link', { name: /^Home$/i })

      const linkColor = await getColorAsHex(homeLink, 'color')

      // dark:text-zinc-400 in dark mode: #a1a1aa
      expectColorMatch(linkColor, '#a1a1aa')
    })

    test('should style footer correctly in dark mode', async ({ homePage }) => {
      await homePage.goto()

      const footer = homePage.page.locator('footer')
      await expectVisible(footer)

      // Check footer border color (dark:border-zinc-800)
      const borderColor = await getColorAsHex(footer, 'borderTopColor')

      // dark:border-zinc-800 in dark mode: #27272a
      expectColorMatch(borderColor, '#27272a')

      // Check footer text color (dark:text-zinc-400)
      const copyright = footer.getByText(/Detached Node.*All rights reserved/i)
      const textColor = await getColorAsHex(copyright, 'color')

      expectColorMatch(textColor, '#a1a1aa')
    })

    test('should style post cards correctly in dark mode', async ({ postsPage }) => {
      await postsPage.goto()

      // Verify dark background is applied to body
      const body = postsPage.page.locator('body')
      const bodyBgColor = await getColorAsHex(body, 'backgroundColor')

      expect(bodyBgColor).toBe('#0a0a0a')

      // Verify posts page has loaded by checking for the page title
      await expectVisible(postsPage.pageTitle)

      // If posts are available, check their styling
      const postCount = await postsPage.getPostCount()
      if (postCount > 0) {
        const firstPost = postsPage.postCards.nth(0)
        await expectVisible(firstPost)

        // Check post title color for proper contrast
        const title = firstPost.locator('h2')
        await expectVisible(title)

        const titleColor = await getColorAsHex(title, 'color')

        // Title should have light color in dark mode for contrast
        // Should inherit from body text color #ededed
        expect(titleColor).toBe('#ededed')
      }
    })

    test('should have proper link hover states in dark mode', async ({ homePage }) => {
      await homePage.goto()

      const nav = homePage.navigation
      const homeLink = nav.getByRole('link', { name: /^Home$/i })

      // Get initial color (dark:text-zinc-400)
      const initialColor = await getColorAsHex(homeLink, 'color')

      expectColorMatch(initialColor, '#a1a1aa')

      // Hover and check color changed (dark:hover:text-zinc-100)
      await homeLink.hover()
      const hoverColor = await getColorAsHex(homeLink, 'color')

      // dark:hover:text-zinc-100 in dark mode: #f4f4f5
      expectColorMatch(hoverColor, '#f4f4f5')
      expect(hoverColor).not.toBe(initialColor)
    })
  })

  test.describe('Color Scheme Switching', () => {
    test('should update colors when switching from light to dark', async ({ homePage }) => {
      await homePage.goto()

      // Start with light mode
      await homePage.page.emulateMedia({ colorScheme: 'light' })
      await homePage.page.waitForTimeout(100) // Allow time for styles to apply

      const body = homePage.page.locator('body')

      // Verify light mode colors
      let bgColor = await getColorAsHex(body, 'backgroundColor')
      expect(bgColor).toBe('#ffffff')

      // Switch to dark mode
      await homePage.page.emulateMedia({ colorScheme: 'dark' })
      await homePage.page.waitForTimeout(100) // Allow time for styles to apply

      // Verify dark mode colors
      bgColor = await getColorAsHex(body, 'backgroundColor')
      expect(bgColor).toBe('#0a0a0a')
    })

    test('should update colors when switching from dark to light', async ({ homePage }) => {
      await homePage.goto()

      // Start with dark mode
      await homePage.page.emulateMedia({ colorScheme: 'dark' })
      await homePage.page.waitForTimeout(100) // Allow time for styles to apply

      const body = homePage.page.locator('body')

      // Verify dark mode colors
      let bgColor = await getColorAsHex(body, 'backgroundColor')
      expect(bgColor).toBe('#0a0a0a')

      // Switch to light mode
      await homePage.page.emulateMedia({ colorScheme: 'light' })
      await homePage.page.waitForTimeout(100) // Allow time for styles to apply

      // Verify light mode colors
      bgColor = await getColorAsHex(body, 'backgroundColor')
      expect(bgColor).toBe('#ffffff')
    })
  })

  test.describe('Contrast and Accessibility', () => {
    test('should have sufficient contrast in light mode', async ({ homePage }) => {
      await homePage.page.emulateMedia({ colorScheme: 'light' })
      await homePage.goto()

      const body = homePage.page.locator('body')

      const bgColor = await getColorAsHex(body, 'backgroundColor')
      const textColor = await getColorAsHex(body, 'color')

      // Light mode should have dark text on light background
      expect(bgColor).toBe('#ffffff') // White
      expect(textColor).toBe('#171717') // Very dark gray

      // Verify this provides good contrast (visually, not calculated)
      // White (#ffffff) vs. dark gray (#171717) has excellent contrast
    })

    test('should have sufficient contrast in dark mode', async ({ homePage }) => {
      await homePage.page.emulateMedia({ colorScheme: 'dark' })
      await homePage.goto()

      const body = homePage.page.locator('body')

      const bgColor = await getColorAsHex(body, 'backgroundColor')
      const textColor = await getColorAsHex(body, 'color')

      // Dark mode should have light text on dark background
      expect(bgColor).toBe('#0a0a0a') // Very dark gray
      expect(textColor).toBe('#ededed') // Very light gray

      // Verify this provides good contrast (visually, not calculated)
      // Very dark (#0a0a0a) vs. very light (#ededed) has excellent contrast
    })

    test('should maintain readability across all pages in dark mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'dark' })

      const pages = ['/', '/posts', '/about']

      for (const pagePath of pages) {
        await page.goto(pagePath)
        await page.waitForLoadState('networkidle')

        const body = page.locator('body')
        const bgColor = await getColorAsHex(body, 'backgroundColor')
        const textColor = await getColorAsHex(body, 'color')

        // All pages should have consistent dark mode colors
        expect(bgColor).toBe('#0a0a0a')
        expect(textColor).toBe('#ededed')
      }
    })

    test('should maintain readability across all pages in light mode', async ({ page }) => {
      await page.emulateMedia({ colorScheme: 'light' })

      const pages = ['/', '/posts', '/about']

      for (const pagePath of pages) {
        await page.goto(pagePath)
        await page.waitForLoadState('networkidle')

        const body = page.locator('body')
        const bgColor = await getColorAsHex(body, 'backgroundColor')
        const textColor = await getColorAsHex(body, 'color')

        // All pages should have consistent light mode colors
        expect(bgColor).toBe('#ffffff')
        expect(textColor).toBe('#171717')
      }
    })
  })
})
