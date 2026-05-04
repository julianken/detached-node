/**
 * lint-changelog.ts
 *
 * Enforces the editorial rule that every PR touching an authored pattern must
 * append a corresponding entry to CHANGELOG. This is the audit trail that
 * makes the catalog reviewable as a living document.
 *
 * Two complementary checks:
 *
 *   1. Detect modified pattern files via `git diff --name-only origin/main...HEAD`.
 *      For every src/data/agentic-design-patterns/patterns/<slug>.ts in the
 *      diff that has been authored (non-empty implementationSketch), ensure
 *      CHANGELOG contains an entry with that slug whose date is a valid ISO
 *      date that is NOT in the future. The original rule required >= today
 *      (force-bump on every edit), which broke long-lived feature branches:
 *      patterns authored on day N would fail the lint on day N+1 even though
 *      their CHANGELOG entry was honestly dated. The relaxed rule still
 *      catches forged future dates and missing entries.
 *
 *      Empty stubs are skipped — they're scaffolding, not content. The audit
 *      trail starts when a pattern has content.
 *
 *   2. Verify that every CHANGELOG slug exists in the pattern set (active OR
 *     archived). A typo here would silently invalidate the audit trail.
 *
 * On main itself (no upstream diff) the script becomes a no-op for check #1.
 *
 * Usage:  tsx scripts/lint-changelog.ts
 * Exit:   0 on success, 1 on first violation.
 */

import { spawnSync } from 'node:child_process'

import { CHANGELOG } from '../src/data/agentic-design-patterns/changelog.js'
import { PATTERNS } from '../src/data/agentic-design-patterns/index.js'

const PATTERN_PATH_PREFIX = 'src/data/agentic-design-patterns/patterns/'
const PATTERN_PATH_SUFFIX = '.ts'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Returns the list of pattern slugs whose files were modified between
 * origin/main and HEAD. Returns an empty array if origin/main is not available
 * (e.g. when running on the main branch or in a clean clone without the
 * remote ref fetched).
 */
function modifiedPatternSlugs(): string[] {
  // Try origin/main first; fall back to upstream main; otherwise no-op.
  for (const ref of ['origin/main', 'upstream/main', 'main']) {
    const result = spawnSync('git', ['diff', '--name-only', `${ref}...HEAD`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    if (result.status === 0) {
      const files = result.stdout.split('\n').map((f) => f.trim()).filter(Boolean)
      const slugs = files
        .filter((f) => f.startsWith(PATTERN_PATH_PREFIX) && f.endsWith(PATTERN_PATH_SUFFIX))
        .map((f) => f.slice(PATTERN_PATH_PREFIX.length, -PATTERN_PATH_SUFFIX.length))
      return Array.from(new Set(slugs))
    }
  }
  console.warn('lint-changelog: no diffable upstream main ref found — skipping diff check')
  return []
}

/**
 * Returns true if the pattern has any authored content. Empty stubs are
 * scaffolding — the editorial audit trail starts when a pattern has content.
 */
function isAuthored(slug: string): boolean {
  const pattern = PATTERNS.find((p) => p.slug === slug)
  if (!pattern) return false
  const sketch = (pattern.implementationSketch ?? '').trim()
  const summary = (pattern.oneLineSummary ?? '').trim()
  return sketch.length > 0 || summary.length > 0
}

function main(): void {
  // Check #1: every modified AUTHORED pattern has a CHANGELOG entry whose
  // date is a valid ISO yyyy-mm-dd that is not in the future. Any past-or-today
  // date is honest. Future dates are a forgery / clock-skew signal.
  const today = todayIso()
  const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
  const touchedSlugs = modifiedPatternSlugs()
  const authoredTouched = touchedSlugs.filter(isAuthored)
  const skippedStubs = touchedSlugs.length - authoredTouched.length

  const failures: string[] = []
  for (const slug of authoredTouched) {
    const entries = CHANGELOG.filter((e) => e.slug === slug)
    if (entries.length === 0) {
      failures.push(
        `pattern "${slug}" was modified but has NO CHANGELOG entry — add one in src/data/agentic-design-patterns/changelog.ts`,
      )
      continue
    }
    for (const entry of entries) {
      if (!ISO_DATE_RE.test(entry.date)) {
        failures.push(
          `pattern "${slug}" CHANGELOG entry has invalid date "${entry.date}" — must be yyyy-mm-dd`,
        )
      }
    }
    const latest = entries.reduce((acc, e) => (e.date > acc ? e.date : acc), '0000-00-00')
    if (latest > today) {
      failures.push(
        `pattern "${slug}" CHANGELOG entry is dated ${latest} (> today ${today}) — future-dated entries are not permitted`,
      )
    }
  }

  // Check #2: every CHANGELOG slug exists in the catalog (active OR archived).
  const knownSlugs = new Set(PATTERNS.map((p) => p.slug))
  for (const entry of CHANGELOG) {
    if (!knownSlugs.has(entry.slug)) {
      failures.push(
        `CHANGELOG entry references unknown slug "${entry.slug}" (date=${entry.date}) — typo or removed pattern?`,
      )
    }
  }

  if (failures.length > 0) {
    console.error('lint-changelog: FAIL')
    for (const f of failures) console.error(`  • ${f}`)
    process.exit(1)
  }

  console.log(
    `lint-changelog: OK (checked ${authoredTouched.length} authored, ` +
      `skipped ${skippedStubs} stub${skippedStubs === 1 ? '' : 's'}, ` +
      `${CHANGELOG.length} changelog entr${CHANGELOG.length === 1 ? 'y' : 'ies'})`,
  )
}

main()
