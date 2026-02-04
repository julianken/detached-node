import { test, expect } from '../fixtures'

/**
 * E2E tests for robots.txt (CON-49)
 * Tests verify that robots.txt is accessible and contains correct disallow rules
 */

test.describe('Robots.txt', () => {
  test('should be accessible at /robots.txt', async ({ page }) => {
    const response = await page.goto('/robots.txt')

    // Verify the request was successful
    expect(response?.status()).toBe(200)

    // Verify content type is text/plain
    const contentType = response?.headers()['content-type']
    expect(contentType).toContain('text/plain')
  })

  test('should disallow /admin path', async ({ page }) => {
    await page.goto('/robots.txt')

    // Get the text content
    const content = await page.textContent('body')
    expect(content).toBeTruthy()

    // Verify /admin is in disallow rules
    expect(content).toContain('Disallow: /admin')
  })

  test('should disallow /api path', async ({ page }) => {
    await page.goto('/robots.txt')

    // Get the text content
    const content = await page.textContent('body')
    expect(content).toBeTruthy()

    // Verify /api is in disallow rules
    expect(content).toContain('Disallow: /api')
  })

  test('should allow root path', async ({ page }) => {
    await page.goto('/robots.txt')

    // Get the text content
    const content = await page.textContent('body')
    expect(content).toBeTruthy()

    // Verify root path is allowed
    expect(content).toContain('Allow: /')
  })

  test('should reference sitemap URL', async ({ page }) => {
    await page.goto('/robots.txt')

    // Get the text content
    const content = await page.textContent('body')
    expect(content).toBeTruthy()

    // Verify sitemap reference is included
    expect(content).toContain('Sitemap:')
    expect(content).toMatch(/Sitemap: https?:\/\/.*\/sitemap\.xml/)
  })

  test('should have wildcard user agent', async ({ page }) => {
    await page.goto('/robots.txt')

    // Get the text content
    const content = await page.textContent('body')
    expect(content).toBeTruthy()

    // Verify user agent is set to all crawlers
    expect(content).toContain('User-agent: *')
  })

  test('should have proper robots.txt structure', async ({ page }) => {
    await page.goto('/robots.txt')

    // Get the text content
    const content = await page.textContent('body')
    expect(content).toBeTruthy()

    // Parse and verify the complete structure
    const lines = content!.split('\n').map(line => line.trim()).filter(line => line.length > 0)

    // Should contain all expected directives
    const hasUserAgent = lines.some(line => line.startsWith('User-agent:'))
    const hasAllow = lines.some(line => line.startsWith('Allow:'))
    const hasDisallowAdmin = lines.some(line => line === 'Disallow: /admin')
    const hasDisallowApi = lines.some(line => line === 'Disallow: /api')
    const hasSitemap = lines.some(line => line.startsWith('Sitemap:'))

    expect(hasUserAgent).toBe(true)
    expect(hasAllow).toBe(true)
    expect(hasDisallowAdmin).toBe(true)
    expect(hasDisallowApi).toBe(true)
    expect(hasSitemap).toBe(true)
  })
})
