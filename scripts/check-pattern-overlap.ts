/**
 * check-pattern-overlap.ts
 *
 * MANUAL editorial tool. NOT wired into `pnpm lint` and NOT run in CI. The
 * editor runs this when adding a new pattern or restructuring layers, to
 * surface pairs of patterns whose summaries / when-to-use bullets overlap
 * heavily — a sign that the field-of-thought boundary may not be sharp.
 *
 * Heuristic: token-overlap ratio between each pair of patterns'
 * `oneLineSummary + bodySummary + whenToUse` text. We strip stop words and
 * dedupe tokens per pattern before computing Jaccard overlap.
 *
 * Output: a sorted list of pairs whose overlap exceeds a threshold (default
 * 0.55). Threshold can be overridden with `--threshold=0.5`. Always exits 0
 * (this is informational, not a gate).
 *
 * Usage:  tsx scripts/check-pattern-overlap.ts [--threshold=0.55]
 */

import { PATTERNS } from '../src/data/agentic-design-patterns/index.js'
import type { Pattern } from '../src/data/agentic-design-patterns/types.js'

const STOP_WORDS = new Set<string>([
  'a', 'an', 'and', 'or', 'but', 'the', 'of', 'for', 'to', 'in', 'on', 'at',
  'by', 'with', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their',
  'we', 'us', 'our', 'you', 'your', 'i', 'me', 'my',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
  'can', 'could', 'may', 'might', 'must', 'shall',
  'when', 'where', 'how', 'why', 'what', 'which', 'who',
  'use', 'using', 'used', 'one', 'two', 'three', 'each', 'every', 'all',
  'no', 'not', 'than', 'then', 'so', 'if', 'because',
])

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .normalize('NFKD')
      .replace(/\p{M}+/gu, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2 && !STOP_WORDS.has(t)),
  )
}

function patternTokens(pattern: Pattern): Set<string> {
  const text = [
    pattern.oneLineSummary,
    ...(pattern.bodySummary ?? []),
    ...(pattern.whenToUse ?? []),
  ].join(' ')
  return tokenize(text)
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0
  let intersection = 0
  for (const t of a) if (b.has(t)) intersection += 1
  const union = a.size + b.size - intersection
  return union === 0 ? 0 : intersection / union
}

function parseThreshold(): number {
  const arg = process.argv.find((a) => a.startsWith('--threshold='))
  if (!arg) return 0.55
  const v = Number.parseFloat(arg.slice('--threshold='.length))
  if (Number.isFinite(v) && v >= 0 && v <= 1) return v
  console.error(`check-pattern-overlap: invalid --threshold (got "${arg}"); using 0.55`)
  return 0.55
}

function main(): void {
  const threshold = parseThreshold()
  const active = PATTERNS.filter((p) => !p.archived)
  const tokensBySlug = new Map<string, Set<string>>()
  for (const p of active) tokensBySlug.set(p.slug, patternTokens(p))

  const pairs: { a: string; b: string; overlap: number }[] = []
  for (let i = 0; i < active.length; i += 1) {
    for (let j = i + 1; j < active.length; j += 1) {
      const a = active[i]!
      const b = active[j]!
      const overlap = jaccard(tokensBySlug.get(a.slug)!, tokensBySlug.get(b.slug)!)
      if (overlap >= threshold) {
        pairs.push({ a: a.slug, b: b.slug, overlap })
      }
    }
  }

  pairs.sort((x, y) => y.overlap - x.overlap)

  console.log(
    `check-pattern-overlap: ${active.length} active patterns, threshold=${threshold.toFixed(2)}\n`,
  )
  if (pairs.length === 0) {
    console.log('No overlapping pairs above threshold. (This does not prove field-sharpness, just absence of obvious overlap.)')
    return
  }
  console.log(`${pairs.length} pair${pairs.length === 1 ? '' : 's'} above threshold:\n`)
  for (const { a, b, overlap } of pairs) {
    console.log(`  ${overlap.toFixed(3)}  ${a}  ↔  ${b}`)
  }
  console.log('\nNote: high overlap is a smell, not a verdict. Read the pair and decide if the boundary is sharp enough.')
}

main()
