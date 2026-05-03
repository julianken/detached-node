import { test, expect } from '@playwright/test'
import { SATELLITE_H2_HEADINGS } from './_satellite-fixtures'
// No fixture import — these routes are public and DB-independent.

test('renders Reflexion: 1 h1 + 7 h2 slots + Overview prose + Mermaid SVG', async ({ page }) => {
  await page.goto('/agentic-design-patterns/reflexion')
  await expect(page.getByRole('heading', { level: 1, name: 'Reflexion' })).toBeVisible()
  for (const h of SATELLITE_H2_HEADINGS) {
    await expect(page.getByRole('heading', h)).toBeVisible()
  }
  // Overview slot is prose under h1, no h2 — assert via stable phrase.
  // Scope to first match: the phrase appears in bodySummary paragraphs (not
  // headings), so .first() is safe here — it picks the earliest prose match.
  await expect(page.getByText(/episodic memory/i).first()).toBeVisible()
  // Mermaid SVG (with role qualifier — matches mermaid.spec.ts:24 precedent)
  await expect(
    page.locator('.mermaid-figure svg[id^="mermaid-"][role*="graphics-document"]')
  ).toBeVisible({ timeout: 10000 })
  await expect(page.locator('.mermaid-figure')).toHaveCount(1)
})

test('emits Article schema with citations', async ({ page }) => {
  await page.goto('/agentic-design-patterns/reflexion')
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents()
  expect(scripts.length).toBeGreaterThanOrEqual(1)
  // Each script may contain a single object OR an array of objects — flatten both cases.
  const parsed: Record<string, unknown>[] = scripts.flatMap(s => {
    const val = JSON.parse(s)
    return Array.isArray(val) ? val : [val]
  })
  const article = parsed.find(s => s?.['@type'] === 'Article')
  expect(article, 'Article schema should be emitted').toBeDefined()
  const citation = article!.citation as Record<string, unknown>[]
  expect(citation, 'Article.citation must be an array').toEqual(expect.any(Array))
  expect(citation.length, 'spec requires 3-7 references per pattern').toBeGreaterThanOrEqual(3)
  expect(String(citation[0]['@type'])).toMatch(/ScholarlyArticle|Book|WebPage/)
})

test('unknown slug returns 404', async ({ page }) => {
  const response = await page.goto('/agentic-design-patterns/not-a-real-pattern')
  expect(response?.status()).toBe(404)
  // Defend against catch-all route silently rendering Reflexion content
  await expect(page.getByRole('heading', { level: 1, name: 'Reflexion' })).toHaveCount(0)
})
