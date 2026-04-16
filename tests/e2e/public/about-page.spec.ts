import { test } from '../fixtures'
import { expectVisible, expectTitle } from '../helpers'

/**
 * E2E tests for About page loading from CMS (CON-42)
 * Tests verify that the About page loads correctly with CMS content
 *
 * Test data from seed-test-db.ts:
 * - "About Detached Node" page with rich text body
 */

test.describe('About Page', () => {
  test('should load About page with correct title', async ({ aboutPage }) => {
    await aboutPage.goto()

    await expectTitle(aboutPage.page, /About/)

    await expectVisible(aboutPage.pageTitle)
    const title = await aboutPage.getPageTitle()
    test.expect(title).toBeTruthy()
    test.expect(title).toContain('About')
  })

  test('should render page content', async ({ aboutPage }) => {
    await aboutPage.goto()

    await expectVisible(aboutPage.pageContent)

    const text = await aboutPage.pageContent.textContent()
    test.expect(text).toBeTruthy()
    test.expect(text!.length).toBeGreaterThan(0)
  })

  test('should have meta description', async ({ aboutPage }) => {
    await aboutPage.goto()

    const metaDescription = await aboutPage.page
      .locator('meta[name="description"]')
      .getAttribute('content')
    test.expect(metaDescription).toBeTruthy()
  })
})
