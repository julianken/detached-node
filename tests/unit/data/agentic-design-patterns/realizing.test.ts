// ---------------------------------------------------------------------------
// Realizing-in-IDE validator
// ---------------------------------------------------------------------------
// Iterates every pattern in the catalog and validates BOTH `realizingInClaudeCode`
// and `realizingInCursor` blocks. If a block is absent, the test passes with
// no assertions on it. When present, fields are validated.
// ---------------------------------------------------------------------------

import { describe, it, expect } from 'vitest'
import type { RealizingInClaudeCode } from '@/data/agentic-design-patterns/types'
import { PATTERNS, getPatternSlugs } from '@/data/agentic-design-patterns/index'

const ALL_SLUGS = new Set(getPatternSlugs())

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length
}

function assertValidUrl(url: string, label: string): void {
  expect(() => new URL(url), `${label} must be a parseable URL: "${url}"`).not.toThrow()
}

function assertBlockInvariants(label: string, r: RealizingInClaudeCode): void {
  if (r.keyMoves) {
    it(`${label} — keyMoves has 3-5 entries, each ≤25 words`, () => {
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
    it(`${label} — ccPrimitives is non-empty`, () => {
      expect(r.ccPrimitives!.length).toBeGreaterThan(0)
    })
  }

  if (r.workedExample) {
    it(`${label} — workedExample.url parses`, () => {
      assertValidUrl(r.workedExample!.url, `${label}.workedExample.url`)
      expect(r.workedExample!.description.trim().length).toBeGreaterThan(0)
    })
  }

  // seeAlso is required when a block is populated — keeps related-patterns
  // chips from silently disappearing on a future pattern.
  it(`${label} — seeAlso is present`, () => {
    expect(r.seeAlso, `${label} must declare a seeAlso block`).toBeDefined()
  })

  if (r.seeAlso?.siblingPatternSlugs) {
    it(`${label} — seeAlso.siblingPatternSlugs all resolve`, () => {
      for (const siblingSlug of r.seeAlso!.siblingPatternSlugs!) {
        expect(
          ALL_SLUGS.has(siblingSlug),
          `siblingPatternSlug "${siblingSlug}" not found in catalog`,
        ).toBe(true)
      }
    })
  }

  if (r.umbrellaPointers) {
    it(`${label} — umbrellaPointers slugs all resolve and oneLine is non-empty`, () => {
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
}

describe('realizing-in-IDE invariants', () => {
  for (const pattern of PATTERNS) {
    const { slug, realizingInClaudeCode: rcc, realizingInCursor: rcursor } = pattern

    if (!rcc && !rcursor) {
      it(`${slug} — both IDE blocks absent (graceful-absent)`, () => {
        expect(rcc).toBeUndefined()
        expect(rcursor).toBeUndefined()
      })
      continue
    }

    describe(slug, () => {
      if (rcc) assertBlockInvariants(`${slug}.realizingInClaudeCode`, rcc)
      if (rcursor) assertBlockInvariants(`${slug}.realizingInCursor`, rcursor)
    })
  }
})
