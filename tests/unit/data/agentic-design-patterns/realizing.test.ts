// ---------------------------------------------------------------------------
// Realizing-in-Claude-Code validator
// ---------------------------------------------------------------------------
// Iterates every pattern in the catalog. If realizingInClaudeCode is absent,
// the test passes with no assertions. When the field is present, optional
// fields are validated when populated.
// ---------------------------------------------------------------------------

import { describe, it, expect } from 'vitest'
import { PATTERNS, getPatternSlugs } from '@/data/agentic-design-patterns/index'

const ALL_SLUGS = new Set(getPatternSlugs())

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length
}

function assertValidUrl(url: string, label: string): void {
  expect(() => new URL(url), `${label} must be a parseable URL: "${url}"`).not.toThrow()
}

describe('realizingInClaudeCode invariants', () => {
  for (const pattern of PATTERNS) {
    const { slug, realizingInClaudeCode: r } = pattern

    if (!r) {
      it(`${slug} — absent field passes (graceful-absent)`, () => {
        expect(r).toBeUndefined()
      })
      continue
    }

    describe(slug, () => {
      if (r.keyMoves) {
        it('keyMoves has 3-5 entries, each ≤25 words', () => {
          expect(r.keyMoves!.length).toBeGreaterThanOrEqual(3)
          expect(r.keyMoves!.length).toBeLessThanOrEqual(5)
          for (const move of r.keyMoves!) {
            expect(
              wordCount(move),
              `keyMove "${move.slice(0, 40)}..." exceeds 25 words`,
            ).toBeLessThanOrEqual(25)
          }
        })
      }

      if (r.ccPrimitives) {
        it('ccPrimitives is non-empty', () => {
          expect(r.ccPrimitives!.length).toBeGreaterThan(0)
        })
      }

      if (r.workedExample) {
        it('workedExample.url parses', () => {
          assertValidUrl(r.workedExample!.url, `${slug}.workedExample.url`)
          expect(r.workedExample!.description.trim().length).toBeGreaterThan(0)
        })
      }

      if (r.seeAlso?.siblingPatternSlugs) {
        it('seeAlso.siblingPatternSlugs all resolve in the catalog', () => {
          for (const siblingSlug of r.seeAlso!.siblingPatternSlugs!) {
            expect(
              ALL_SLUGS.has(siblingSlug),
              `siblingPatternSlug "${siblingSlug}" not found in catalog`,
            ).toBe(true)
          }
        })
      }

      if (r.umbrellaPointers) {
        it('umbrellaPointers slugs all resolve and oneLine is non-empty', () => {
          for (const pointer of r.umbrellaPointers!) {
            expect(
              ALL_SLUGS.has(pointer.patternSlug),
              `umbrellaPointer.patternSlug "${pointer.patternSlug}" not found in catalog`,
            ).toBe(true)
            expect(
              pointer.oneLine.trim().length,
              `umbrellaPointer.oneLine for "${pointer.patternSlug}" must be non-empty`,
            ).toBeGreaterThan(0)
          }
        })
      }
    })
  }
})
