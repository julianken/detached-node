import { describe, it, expect } from 'vitest'
import { CHANGELOG } from '@/data/agentic-design-patterns/changelog'
import { getPatternSlugs } from '@/data/agentic-design-patterns/index'

describe('CHANGELOG', () => {
  it('is an array', () => {
    expect(Array.isArray(CHANGELOG)).toBe(true)
  })

  it('has at least 1 entry (the Phase-1 scaffold launch)', () => {
    // Phase 1 seeded a single entry. Phase 2 wave-1 prepends one entry per
    // authored pattern; the lower bound stays at 1.
    expect(CHANGELOG.length).toBeGreaterThanOrEqual(1)
  })

  it('every entry has an ISO date', () => {
    for (const entry of CHANGELOG) {
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('every entry type is added, edited, or retired', () => {
    for (const entry of CHANGELOG) {
      expect(['added', 'edited', 'retired']).toContain(entry.type)
    }
  })

  it('every entry has a non-empty note', () => {
    for (const entry of CHANGELOG) {
      expect(entry.note.length).toBeGreaterThan(0)
    }
  })

  it('every entry has a non-empty author', () => {
    for (const entry of CHANGELOG) {
      expect(entry.author.length).toBeGreaterThan(0)
    }
  })

  it('Phase 1 Reflexion seed entry is preserved (date, type, note verbatim per #152/#158 AC)', () => {
    // T1 (#152) seeded the entry as '2026-05-02'. Per issue #158 step 6 the
    // entry's date is bumped to the Reflexion authoring date so lint-changelog's
    // "latest CHANGELOG date >= today" check passes alongside pattern.dateModified.
    // Phase 2 prepends new entries, so this seed is no longer guaranteed at
    // index 0 — locate it by slug+type and assert its preserved fields.
    const seed = CHANGELOG.find(
      (e) => e.slug === 'reflexion' && e.type === 'added',
    )
    expect(seed).toBeDefined()
    expect(seed!.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(seed!.date >= '2026-05-02').toBe(true)
    expect(seed!.note).toBe(
      'Catalog scaffold launched; Reflexion exemplar shipped in #158.',
    )
  })

  it('every entry slug is in getPatternSlugs() (vacuously true for archives — will need updating in Phase 2)', () => {
    // NOTE: This test is intentionally incomplete — archived patterns won't be
    // in getPatternSlugs(). Deliberately not "fixed" preemptively (per issue AC).
    const slugs = new Set(getPatternSlugs())
    for (const entry of CHANGELOG) {
      // If slug is in the active catalog, it must resolve.
      // Retired patterns are excluded from getPatternSlugs() — skip them.
      if (entry.type !== 'retired') {
        expect(slugs.has(entry.slug)).toBe(true)
      }
    }
  })
})
