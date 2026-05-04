import { test, expect } from '@playwright/test'
// No fixture import — these routes are public and DB-independent.

test.describe('/agentic-design-patterns hub', () => {
  test('renders title, all 5 layer sections with dynamic counts', async ({ page }) => {
    await page.goto('/agentic-design-patterns')
    await expect(page.getByRole('heading', { level: 1, name: 'Agentic Design Patterns' })).toBeVisible()
    for (const layer of ['Topology', 'Quality', 'State', 'Interfaces', 'Methodology']) {
      await expect(page.getByText(new RegExp(`Layer .* — ${layer}`))).toBeVisible()
    }
    await expect(page.getByText(/Single-agent \(\d+\)/)).toBeVisible()
    await expect(page.getByText(/Multi-agent \(\d+\)/)).toBeVisible()
    const topologySection = page.getByRole('region', { name: /Topology/ })
    await expect(topologySection.getByRole('link', { name: 'Reflexion' })).toBeVisible()
  })

  test('search bar focuses on / key', async ({ page }) => {
    await page.goto('/agentic-design-patterns')
    // Wait for the search input to be visible — confirms client hydration has
    // completed and the `keydown` listener is attached.
    await expect(page.getByLabel('Search agentic design patterns')).toBeVisible()
    // Click the page body to ensure the document has focus (required for
    // keyboard events to fire) without focusing an input element first.
    await page.locator('body').click()
    await page.keyboard.press('/')
    await expect(page.getByLabel('Search agentic design patterns')).toBeFocused()
  })

  test('layer searchParam filters grid', async ({ page }) => {
    await page.goto('/agentic-design-patterns?layer=quality')
    await expect(page.getByText(/Layer 2 — Quality/)).toBeVisible()
    await expect(page.getByText(/Layer 1 — Topology/)).toHaveCount(0)
  })
})
