// ---------------------------------------------------------------------------
// Realizing-in-Claude-Code validator — W1.0
// ---------------------------------------------------------------------------
// Iterates every pattern in the catalog. If realizingInClaudeCode is absent
// (graceful-absent migration), the test passes with no assertions. When the
// field is present, per-tier required-field invariants are enforced.
//
// Tier A: ccPrimitives + scaffolding + workedExample + readerMove + seeAlso
// Tier B: readerMove + seeAlso (bodyMarkdown optional)
// Tier C: readerMove + seeAlso (bodyMarkdown present)
// Tier U: openingFraming + closingRule + umbrellaPointers (≥10) + seeAlso
//
// Additional cross-tier assertions:
//   - tier field is one of A|B|C|U
//   - readerMove.text word count ≤ 25
//   - workedExample.url parses via new URL()
//   - seeAlso.siblingPatternSlugs all resolve in getPatternSlugs()
//   - umbrellaPointers[].patternSlug all resolve in getPatternSlugs()
// ---------------------------------------------------------------------------

import { describe, it, expect } from 'vitest'
import { PATTERNS, getPatternSlugs } from '@/data/agentic-design-patterns/index'

const VALID_TIERS = new Set(['A', 'B', 'C', 'U'])
const ALL_SLUGS = new Set(getPatternSlugs())

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length
}

function assertValidUrl(url: string, label: string): void {
  expect(() => new URL(url), `${label} must be a parseable URL: "${url}"`).not.toThrow()
}

// ---------------------------------------------------------------------------
// per-pattern loop
// ---------------------------------------------------------------------------

describe('realizingInClaudeCode — per-tier invariants', () => {
  for (const pattern of PATTERNS) {
    const { slug, realizingInClaudeCode: r } = pattern

    if (!r) {
      // Graceful-absent: field not yet populated. No assertions.
      it(`${slug} — absent field passes (graceful-absent migration)`, () => {
        expect(r).toBeUndefined()
      })
      continue
    }

    describe(`${slug} (Tier ${r.tier})`, () => {
      // ── All tiers ──────────────────────────────────────────────────────────

      it('tier is one of A|B|C|U', () => {
        expect(VALID_TIERS.has(r.tier)).toBe(true)
      })

      it('seeAlso is present', () => {
        expect(r.seeAlso).toBeDefined()
      })

      if (r.seeAlso?.siblingPatternSlugs) {
        it('seeAlso.siblingPatternSlugs all resolve in the catalog', () => {
          for (const siblingSlug of r.seeAlso!.siblingPatternSlugs!) {
            expect(ALL_SLUGS.has(siblingSlug), `siblingPatternSlug "${siblingSlug}" not found in catalog`).toBe(true)
          }
        })
      }

      // ── Tier A ─────────────────────────────────────────────────────────────

      if (r.tier === 'A') {
        it('ccPrimitives is present and non-empty', () => {
          expect(r.ccPrimitives).toBeDefined()
          expect(r.ccPrimitives!.length).toBeGreaterThan(0)
        })

        it('scaffolding is present and non-empty', () => {
          expect(r.scaffolding).toBeDefined()
          expect(r.scaffolding!.length).toBeGreaterThan(0)
        })

        it('workedExample is present with a valid URL', () => {
          expect(r.workedExample).toBeDefined()
          assertValidUrl(r.workedExample!.url, `${slug}.workedExample.url`)
          expect(r.workedExample!.description.trim().length).toBeGreaterThan(0)
        })

        it('readerMove is present with text ≤25 words and a valid anchorUrl', () => {
          expect(r.readerMove).toBeDefined()
          expect(wordCount(r.readerMove!.text)).toBeLessThanOrEqual(25)
          assertValidUrl(r.readerMove!.anchorUrl, `${slug}.readerMove.anchorUrl`)
        })
      }

      // ── Tier B ─────────────────────────────────────────────────────────────

      if (r.tier === 'B') {
        it('readerMove is present with text ≤25 words and a valid anchorUrl', () => {
          expect(r.readerMove).toBeDefined()
          expect(wordCount(r.readerMove!.text)).toBeLessThanOrEqual(25)
          assertValidUrl(r.readerMove!.anchorUrl, `${slug}.readerMove.anchorUrl`)
        })
      }

      // ── Tier C ─────────────────────────────────────────────────────────────

      if (r.tier === 'C') {
        it('readerMove is present with text ≤25 words and a valid anchorUrl', () => {
          expect(r.readerMove).toBeDefined()
          expect(wordCount(r.readerMove!.text)).toBeLessThanOrEqual(25)
          assertValidUrl(r.readerMove!.anchorUrl, `${slug}.readerMove.anchorUrl`)
        })

        it('bodyMarkdown is present and non-empty for Tier C', () => {
          expect(r.bodyMarkdown).toBeDefined()
          expect(r.bodyMarkdown!.trim().length).toBeGreaterThan(0)
        })
      }

      // ── Tier U ─────────────────────────────────────────────────────────────

      if (r.tier === 'U') {
        it('openingFraming is present and non-empty', () => {
          expect(r.openingFraming).toBeDefined()
          expect(r.openingFraming!.trim().length).toBeGreaterThan(0)
        })

        it('closingRule is present and non-empty', () => {
          expect(r.closingRule).toBeDefined()
          expect(r.closingRule!.trim().length).toBeGreaterThan(0)
        })

        it('umbrellaPointers is present with ≥10 entries', () => {
          expect(r.umbrellaPointers).toBeDefined()
          expect(r.umbrellaPointers!.length).toBeGreaterThanOrEqual(10)
        })

        if (r.umbrellaPointers) {
          it('all umbrellaPointers[].patternSlug resolve in the catalog', () => {
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
    })
  }
})
