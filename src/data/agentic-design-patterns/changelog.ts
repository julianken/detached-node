import type { ChangelogEntry } from './types'

// ---------------------------------------------------------------------------
// Agentic Design Patterns — Catalog Changelog
// ---------------------------------------------------------------------------
// Append-only audit trail. Every PR that touches patterns/<slug>.ts MUST add
// an entry here. CI (scripts/lint-changelog.mjs) enforces this in Phase 2.
//
// Sort: newest-first. When adding an entry, prepend to CHANGELOG.
//
// Fields:
//   date      ISO date the change landed (PR merge date)
//   slug      Pattern slug that was touched
//   type      'added' | 'edited' | 'retired'
//   note      1-line description (mirrors pattern.lastChangeNote for 'edited')
//   author    GitHub handle of the PR author
//   prUrl     Link to the merged PR (fill in after merge)

export const CHANGELOG: ChangelogEntry[] = [
  {
    // Phase 1A scaffold: type model, layers, 23 stubs, helpers, changelog.
    // Reflexion stub is added here; full authoring ships in Phase 1F (#158).
    // date is intentionally '2026-05-02' per issue #152 AC — #158 bumps it.
    date: '2026-05-02',
    slug: 'reflexion',
    type: 'added',
    note: 'Catalog scaffold launched; Reflexion exemplar shipped in #158.',
    author: 'julianken',
  },
]
