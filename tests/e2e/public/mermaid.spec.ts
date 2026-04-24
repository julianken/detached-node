import { test, expect } from '../fixtures'

/**
 * E2E smoke tests for mermaid block rendering (issue #104 T5)
 *
 * Test data: the seeded "Mermaid Diagram Test Post" at
 *   slug: mermaid-diagram-test-post
 * contains a sequenceDiagram block with actors "User" and "Server".
 *
 * The mermaid render is async post-hydration, so all SVG assertions use
 * explicit timeouts rather than fixed sleeps.
 *
 * Selector note: mermaid sets role="graphics-document document" (two tokens)
 * on the <svg>, so we match with the CSS substring operator [role*="graphics-document"]
 * and also verify the id prefix "mermaid-" to avoid matching unrelated SVGs.
 */

const MERMAID_POST_SLUG = 'mermaid-diagram-test-post'
const SVG_TIMEOUT = 10_000

// Mermaid emits role="graphics-document document" (two space-separated tokens).
// Use [role*="graphics-document"] so both the exact and combined values match.
const MERMAID_SVG = 'svg[id^="mermaid-"][role*="graphics-document"]'

test.describe('Mermaid block rendering', () => {
  test('renders a mermaid block as SVG on the post page', async ({ postDetailPage }) => {
    await postDetailPage.goto(MERMAID_POST_SLUG)

    const svg = postDetailPage.page.locator(MERMAID_SVG)

    await expect(svg).toBeVisible({ timeout: SVG_TIMEOUT })

    // The sequenceDiagram source contains "User" and "Server"; mermaid emits
    // these as <text> nodes inside the SVG.
    await expect(svg).toContainText('User', { timeout: SVG_TIMEOUT })
    await expect(svg).toContainText('Server', { timeout: SVG_TIMEOUT })
  })

  test('re-renders the SVG when the theme is toggled', async ({ postDetailPage }) => {
    await postDetailPage.goto(MERMAID_POST_SLUG)

    const svg = postDetailPage.page.locator(MERMAID_SVG)

    // Wait for the initial render before reading the id
    await expect(svg).toBeVisible({ timeout: SVG_TIMEOUT })

    const idBefore = await svg.getAttribute('id')

    // The theme toggle label in light mode is "Switch to dark mode".
    // Scope to the page <header> (banner role) to avoid matching the
    // second toggle rendered in the footer status-bar.
    const themeToggle = postDetailPage.page
      .getByRole('banner')
      .getByRole('button', { name: 'Switch to dark mode' })
    await expect(themeToggle).toBeVisible()
    await themeToggle.click()

    // After toggling, html element should carry the "dark" class
    await expect(postDetailPage.page.locator('html')).toHaveClass(/dark/, {
      timeout: 5_000,
    })

    // MermaidDiagram re-renders on theme change; the new SVG gets a fresh UUID
    // id, so waiting for it to differ from the previous id confirms re-render.
    await expect(svg).toBeVisible({ timeout: SVG_TIMEOUT })
    await expect
      .poll(
        async () => {
          const idAfter = await svg.getAttribute('id')
          return idAfter !== idBefore
        },
        { timeout: SVG_TIMEOUT },
      )
      .toBe(true)
  })
})
