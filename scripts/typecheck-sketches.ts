/**
 * typecheck-sketches.ts
 *
 * Compiles every `implementationSketch` from the agentic-design-patterns
 * catalog through `tsc --noEmit`. Subagent-fabricated TypeScript that does not
 * compile is the highest-leverage failure mode in this catalog, so this script
 * is the most important guardrail in the lint chain.
 *
 * Lessons applied from docs/agentic-design-patterns/spike/SPIKE_LOG.md:
 *  1. tsc flags include `--types node --skipLibCheck --lib es2022,dom` so that
 *     fetch / console / process compile without a per-snippet tsconfig.
 *  2. We inject `export {}` at end of any snippet that lacks an import or
 *     export declaration. Without this, top-level `await` triggers TS1375
 *     ("await expression at top level only allowed within a module").
 *  3. We capture both stdout AND stderr from tsc — depending on which check
 *     fails, error output goes to one or the other.
 *
 * Sketches whose pattern's `sdkAvailability` is `'python-only'` or `'no-sdk'`
 * are NOT compiled (they may be pseudocode), but we DO require a "pseudocode"
 * banner in the snippet so a reader is not misled into thinking it runs.
 *
 * Usage:  tsx scripts/typecheck-sketches.ts
 * Exit:   0 on success, 1 on first compile failure.
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { PATTERNS } from '../src/data/agentic-design-patterns/index.js'
import type { Pattern } from '../src/data/agentic-design-patterns/types.js'

// Resolve tsc from node_modules/.bin so we use the project's pinned TypeScript,
// not whatever happens to be on PATH. `--ignoreConfig` keeps tsc from picking
// up the project tsconfig.json (which excludes scripts/ and tightens libs).
const TSC_BIN = resolve(process.cwd(), 'node_modules/.bin/tsc')

const TSC_FLAGS = [
  '--ignoreConfig',
  '--noEmit',
  '--types',
  'node',
  '--skipLibCheck',
  '--lib',
  'es2022,dom',
  '--module',
  'esnext',
  '--target',
  'es2022',
  '--moduleResolution',
  'bundler',
  '--strict',
]

const PSEUDOCODE_BANNER = /pseudocode/i

/**
 * Returns the snippet wrapped with `export {}` if it has no top-level import
 * or export declaration. Without a module marker, TypeScript treats top-level
 * await as a script-mode error (TS1375).
 */
export function ensureModuleScope(sketch: string): string {
  const hasImport = /^\s*import\s/m.test(sketch)
  const hasExport = /^\s*export\s/m.test(sketch)
  if (hasImport || hasExport) return sketch
  const trailingNewline = sketch.endsWith('\n') ? '' : '\n'
  return `${sketch}${trailingNewline}export {}\n`
}

type CompilationResult =
  | { ok: true }
  | { ok: false; output: string }

function compileSnippet(sketch: string, slug: string): CompilationResult {
  if (!existsSync(TSC_BIN)) {
    return {
      ok: false,
      output: `tsc binary not found at ${TSC_BIN} — run \`pnpm install\` and retry`,
    }
  }
  // Slugs starting with a digit (e.g. "12-factor-agent") are invalid as JS
  // identifiers — but they're valid filenames, so this is purely cosmetic.
  const dir = mkdtempSync(join(tmpdir(), `adp-sketch-${slug}-`))
  const file = join(dir, `${slug}.ts`)
  try {
    writeFileSync(file, ensureModuleScope(sketch), 'utf8')
    const result = spawnSync(TSC_BIN, [...TSC_FLAGS, file], {
      encoding: 'utf8',
      // Capture both — tsc writes diagnostics to stdout but warnings to stderr.
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    if (result.status === 0) return { ok: true }
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim()
    return { ok: false, output: output || `tsc exited with code ${result.status}` }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function shouldSkipCompilation(pattern: Pattern): boolean {
  return pattern.sdkAvailability === 'python-only' || pattern.sdkAvailability === 'no-sdk'
}

function main(): void {
  const failures: { slug: string; reason: string }[] = []
  let compiled = 0
  let skipped = 0

  for (const pattern of PATTERNS) {
    if (pattern.archived) continue
    const sketch = pattern.implementationSketch?.trim()
    if (!sketch) {
      // Empty stub — Phase 1 patterns ship empty until the satellite is authored.
      continue
    }

    if (shouldSkipCompilation(pattern)) {
      if (!PSEUDOCODE_BANNER.test(sketch)) {
        failures.push({
          slug: pattern.slug,
          reason: `sdkAvailability=${pattern.sdkAvailability} but sketch has no "pseudocode" banner; readers will be misled`,
        })
      } else {
        skipped += 1
      }
      continue
    }

    const result = compileSnippet(sketch, pattern.slug)
    if (!result.ok) {
      failures.push({ slug: pattern.slug, reason: result.output })
    } else {
      compiled += 1
    }
  }

  if (failures.length > 0) {
    console.error('typecheck-sketches: FAIL')
    for (const f of failures) {
      console.error(`\n[${f.slug}]\n${f.reason}\n`)
    }
    process.exit(1)
  }

  console.log(
    `typecheck-sketches: OK (compiled ${compiled}, skipped ${skipped} pseudocode, total ${PATTERNS.filter((p) => !p.archived).length})`,
  )
}

main()
