import { test } from '../fixtures'
import { expectVisible } from '../helpers'

/**
 * E2E tests for post type badges (CON-43)
 * Tests verify that each post type displays the correct badge with consistent styling
 *
 * Test data from seed-test-db.ts:
 * - "The Architecture of Agent Systems" (essay) - slug: architecture-of-agent-systems
 * - "Decoding Tool Use Patterns" (decoder) - slug: decoding-tool-use-patterns
 * - "Notes on Autonomous Workflows" (field-report) - slug: notes-on-autonomous-workflows
 * - "Essential Readings on Agentic AI" (index) - slug: essential-readings-agentic-ai
 */

test.describe('Post Type Badges', () => {
  test('should display "Essay" badge for essay posts', async ({ postDetailPage }) => {
    await postDetailPage.goto('architecture-of-agent-systems')

    // Verify badge is visible
    await expectVisible(postDetailPage.postType)

    // Verify badge text is correct
    const postType = await postDetailPage.getPostType()
    test.expect(postType?.toUpperCase()).toContain('ESSAY')
  })

  test('should display "Decoder" badge for decoder posts', async ({ postDetailPage }) => {
    await postDetailPage.goto('decoding-tool-use-patterns')

    // Verify badge is visible
    await expectVisible(postDetailPage.postType)

    // Verify badge text is correct
    const postType = await postDetailPage.getPostType()
    test.expect(postType?.toUpperCase()).toContain('DECODER')
  })

  test('should display "Field Report" badge for field-report posts', async ({
    postDetailPage,
  }) => {
    await postDetailPage.goto('notes-on-autonomous-workflows')

    // Verify badge is visible
    await expectVisible(postDetailPage.postType)

    // Verify badge text is correct
    const postType = await postDetailPage.getPostType()
    test.expect(postType?.toUpperCase()).toContain('FIELD REPORT')
  })

  test('should display "Index" badge for index posts', async ({ postDetailPage }) => {
    await postDetailPage.goto('essential-readings-agentic-ai')

    // Verify badge is visible
    await expectVisible(postDetailPage.postType)

    // Verify badge text is correct
    const postType = await postDetailPage.getPostType()
    test.expect(postType?.toUpperCase()).toContain('INDEX')
  })

  test('should have consistent styling across all badge types', async ({ postDetailPage }) => {
    const posts = [
      { slug: 'architecture-of-agent-systems', type: 'essay' },
      { slug: 'decoding-tool-use-patterns', type: 'decoder' },
      { slug: 'notes-on-autonomous-workflows', type: 'field-report' },
      { slug: 'essential-readings-agentic-ai', type: 'index' },
    ]

    const badgeStyles: Array<{
      type: string
      fontSize: string
      fontWeight: string
      textTransform: string
      letterSpacing: string
    }> = []

    // Collect badge styles from all post types
    for (const post of posts) {
      await postDetailPage.goto(post.slug)

      const badge = postDetailPage.postType
      await expectVisible(badge)

      // Get computed styles
      const styles = await badge.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          textTransform: computed.textTransform,
          letterSpacing: computed.letterSpacing,
        }
      })

      badgeStyles.push({
        type: post.type,
        ...styles,
      })
    }

    // Verify all badges have the same styling
    const firstStyle = badgeStyles[0]
    for (let i = 1; i < badgeStyles.length; i++) {
      const style = badgeStyles[i]
      test.expect(style.fontSize).toBe(firstStyle.fontSize)
      test.expect(style.fontWeight).toBe(firstStyle.fontWeight)
      test.expect(style.textTransform).toBe(firstStyle.textTransform)
      test.expect(style.letterSpacing).toBe(firstStyle.letterSpacing)
    }
  })

  test('should have accessible badge typography', async ({ postDetailPage }) => {
    await postDetailPage.goto('architecture-of-agent-systems')

    const badge = postDetailPage.postType
    await expectVisible(badge)

    // Verify badge has appropriate styling for readability
    const styles = await badge.evaluate((el) => {
      const computed = window.getComputedStyle(el)
      return {
        fontSize: parseFloat(computed.fontSize),
        fontWeight: computed.fontWeight,
        textTransform: computed.textTransform,
      }
    })

    // Badge should have uppercase text
    test.expect(styles.textTransform).toBe('uppercase')

    // Badge should have appropriate font weight (600 or higher for small text)
    const fontWeight = parseInt(styles.fontWeight)
    test.expect(fontWeight).toBeGreaterThanOrEqual(600)

    // Badge should have readable font size (at least 12px)
    test.expect(styles.fontSize).toBeGreaterThanOrEqual(12)
  })
})
