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
    // Date bumped to today by #158 so lint-changelog matches the now-authored
    // Reflexion pattern's dateModified. Note text is mandated by #152 — do not
    // change it; do not append a duplicate entry for this slug+type.
    date: new Date().toISOString().slice(0, 10),
    slug: 'reflexion',
    type: 'added',
    note: 'Catalog scaffold launched; Reflexion exemplar shipped in #158.',
    author: 'julianken',
  },
]
