/**
 * scripts/__fixtures__/run-negative-tests.ts
 *
 * Manual / CI-optional negative-fixture runner for the lint guardrails.
 * NOT part of `pnpm lint`. Each fixture exercises a single guardrail with a
 * deliberately bad input and asserts the guardrail rejects it.
 *
 * Usage:  tsx scripts/__fixtures__/run-negative-tests.ts
 * Exit:   0 if all guardrails behaved as expected, 1 otherwise.
 *
 * Fixtures:
 *
 *   1. Fabricated DOI 10.48550/arXiv.9999.99999 must cause validate-references
 *      to exit 1 (Crossref 404 + OpenAlex 404 → fabricated).
 *
 *   2. URL with ?tag=foo-20 must cause check-affiliate-links to exit 1.
 *
 *   3. Snippet with top-level await but no exports must compile cleanly via
 *      typecheck-sketches's `ensureModuleScope` injection.
 *
 * Implementation strategy: drop a temporary fixture pattern into the
 * `patterns/` directory + a parallel barrel that imports it, then invoke the
 * lint script with `TSX_ADP_FIXTURES=1` so it loads the fixture barrel
 * instead of the main one. To keep scripts dead-simple we don't add fixture
 * branching to the production scripts — instead we (a) test predicates
 * directly and (b) run a real-network probe for the DOI case.
 */

import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const REPO = resolve(__dirname, '..', '..')

let pass = 0
let fail = 0

function record(name: string, ok: boolean, detail = ''): void {
  if (ok) {
    console.log(`  PASS  ${name}`)
    pass += 1
  } else {
    console.error(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
    fail += 1
  }
}

// ── Fixture 1: fabricated DOI ──────────────────────────────────────────────
//
// Probes both the script-level behaviour (does the real script exit 1 when
// fed a Reference with the fake DOI) AND the underlying network shape
// (Crossref 404, OpenAlex 404, real arXiv DOI 200 via OpenAlex fallback).

console.log('\n[1/3] Fabricated DOI 10.48550/arXiv.9999.99999 must cause validate-references to exit 1')
{
  const fixtureSlug = '__neg-doi-fixture__'
  const fixturePath = resolve(REPO, 'src/data/agentic-design-patterns/patterns', `${fixtureSlug}.ts`)
  const indexPath = resolve(REPO, 'src/data/agentic-design-patterns/index.ts')
  const indexBackup = `${indexPath}.bak`
  const fs = await import('node:fs')
  const originalIndex = fs.readFileSync(indexPath, 'utf8')
  fs.copyFileSync(indexPath, indexBackup)
  try {
    fs.writeFileSync(
      fixturePath,
      `import type { Pattern } from '../types'
export const pattern: Pattern = {
  slug: '${fixtureSlug}',
  name: 'DOI Fixture',
  layerId: 'topology',
  topologySubtier: 'single-agent',
  oneLineSummary: 'fixture',
  bodySummary: ['fixture'],
  mermaidSource: '',
  mermaidAlt: '',
  whenToUse: [],
  whenNotToUse: [],
  realWorldExamples: [],
  implementationSketch: '',
  sdkAvailability: 'no-sdk',
  relatedSlugs: [],
  frameworks: [],
  references: [{
    title: 'A Fabricated Paper That Does Not Exist',
    url: 'https://arxiv.org/abs/9999.99999',
    authors: 'Nobody et al.',
    year: 9999,
    type: 'paper',
    doi: '10.48550/arXiv.9999.99999',
  }],
  addedAt: '2026-05-03',
  dateModified: '2026-05-03',
}
`,
      'utf8',
    )
    const patched = originalIndex
      .replace(
        '// ── PATTERNS array',
        `import { pattern as __negDoiFixture } from './patterns/${fixtureSlug}'\n\n// ── PATTERNS array`,
      )
      .replace(
        'export const PATTERNS: Pattern[] = [',
        'export const PATTERNS: Pattern[] = [\n  __negDoiFixture,',
      )
    fs.writeFileSync(indexPath, patched, 'utf8')

    const result = spawnSync(
      resolve(REPO, 'node_modules/.bin/tsx'),
      ['scripts/validate-references.ts'],
      { encoding: 'utf8', cwd: REPO },
    )
    record(
      'validate-references exits 1 on fabricated DOI',
      result.status === 1,
      result.status === 1
        ? ''
        : `exit=${result.status} stdout=${result.stdout?.trim()} stderr=${result.stderr?.trim()}`,
    )
  } finally {
    rmSync(fixturePath, { force: true })
    fs.copyFileSync(indexBackup, indexPath)
    rmSync(indexBackup, { force: true })
  }
}

console.log('\n[1.b] Network shape sanity (Crossref 404 + OpenAlex 404 for fake; OpenAlex 200 for real arXiv DOI)')
try {
  const ua = 'detached-node-validator/0.1 (mailto:juliankennon@gmail.com)'
  const headers = { 'user-agent': ua, accept: 'application/json' }
  const c = await fetch(
    `https://api.crossref.org/works/${encodeURIComponent('10.48550/arXiv.9999.99999')}`,
    { headers },
  )
  const o = await fetch(`https://api.openalex.org/works/doi:10.48550/arXiv.9999.99999`, { headers })
  record(
    'Crossref 404 for fabricated DOI',
    c.status === 404,
    c.status === 404 ? '' : `got HTTP ${c.status}`,
  )
  record(
    'OpenAlex 404 for fabricated DOI',
    o.status === 404,
    o.status === 404 ? '' : `got HTTP ${o.status}`,
  )
  const real = await fetch(`https://api.openalex.org/works/doi:10.48550/arXiv.2303.11366`, { headers })
  record(
    'real arXiv DOI 10.48550/arXiv.2303.11366 resolves via OpenAlex (the OpenAlex fallback works)',
    real.status === 200,
    real.status === 200 ? '' : `got HTTP ${real.status}`,
  )
} catch (err) {
  console.warn(`  SKIP  network unavailable: ${String(err)}`)
}

// ── Fixture 2: affiliate-link URL ──────────────────────────────────────────
//
// We assemble a fixture barrel that imports the production types, drop a
// fixture pattern with a `?tag=` URL, and invoke check-affiliate-links via
// tsx with the cwd pointed at a scratch project.

console.log('\n[2/3] URL with ?tag=foo-20 must cause check-affiliate-links to exit 1')
{
  const fixtureSlug = '__neg-affiliate-fixture__'
  const fixturePath = resolve(REPO, 'src/data/agentic-design-patterns/patterns', `${fixtureSlug}.ts`)
  const indexPath = resolve(REPO, 'src/data/agentic-design-patterns/index.ts')
  const indexBackup = `${indexPath}.bak`

  const fs = await import('node:fs')
  const originalIndex = fs.readFileSync(indexPath, 'utf8')
  fs.copyFileSync(indexPath, indexBackup)
  try {
    fs.writeFileSync(
      fixturePath,
      `import type { Pattern } from '../types'
export const pattern: Pattern = {
  slug: '${fixtureSlug}',
  name: 'Affiliate Fixture',
  layerId: 'topology',
  topologySubtier: 'single-agent',
  oneLineSummary: 'fixture',
  bodySummary: ['fixture'],
  mermaidSource: '',
  mermaidAlt: '',
  whenToUse: [],
  whenNotToUse: [],
  realWorldExamples: [{ text: 'x', sourceUrl: 'https://www.amazon.com/dp/B0XYZ?tag=detachednode-20' }],
  implementationSketch: '',
  sdkAvailability: 'no-sdk',
  relatedSlugs: [],
  frameworks: [],
  references: [],
  addedAt: '2026-05-03',
  dateModified: '2026-05-03',
}
`,
      'utf8',
    )
    // Append the fixture to the barrel.
    const patched = originalIndex
      .replace(
        '// ── PATTERNS array',
        `import { pattern as __negAffiliateFixture } from './patterns/${fixtureSlug}'\n\n// ── PATTERNS array`,
      )
      .replace(
        'export const PATTERNS: Pattern[] = [',
        'export const PATTERNS: Pattern[] = [\n  __negAffiliateFixture,',
      )
    fs.writeFileSync(indexPath, patched, 'utf8')

    const result = spawnSync(
      resolve(REPO, 'node_modules/.bin/tsx'),
      ['scripts/check-affiliate-links.ts'],
      { encoding: 'utf8', cwd: REPO },
    )
    record(
      'check-affiliate-links exits 1 on ?tag=detachednode-20',
      result.status === 1,
      result.status === 1
        ? ''
        : `exit=${result.status} stdout=${result.stdout?.trim()} stderr=${result.stderr?.trim()}`,
    )
  } finally {
    rmSync(fixturePath, { force: true })
    fs.copyFileSync(indexBackup, indexPath)
    rmSync(indexBackup, { force: true })
  }
}

// ── Fixture 3: top-level-await snippet without export ──────────────────────

console.log('\n[3/3] Snippet with top-level await but no exports must compile after export {} injection')
{
  const tscBin = resolve(REPO, 'node_modules/.bin/tsc')
  const dir = mkdtempSync(join(tmpdir(), 'adp-tla-'))
  const file = join(dir, 'snippet.ts')
  const flags = [
    '--ignoreConfig',
    '--noEmit',
    '--types', 'node',
    '--skipLibCheck',
    '--lib', 'es2022,dom',
    '--module', 'esnext',
    '--target', 'es2022',
    '--moduleResolution', 'bundler',
    '--strict',
  ]

  // Without injection — must fail with TS1375.
  const raw = 'const x = await Promise.resolve(42)\nconsole.log(x)\n'
  writeFileSync(file, raw, 'utf8')
  const before = spawnSync(tscBin, [...flags, file], { encoding: 'utf8' })
  const beforeOut = `${before.stdout}${before.stderr}`
  record(
    'without export {}: tsc reports TS1375',
    before.status !== 0 && /TS1375/.test(beforeOut),
    `status=${before.status}`,
  )

  // With injection — must compile cleanly.
  writeFileSync(file, `${raw}export {}\n`, 'utf8')
  const after = spawnSync(tscBin, [...flags, file], { encoding: 'utf8' })
  record(
    'with injected export {}: tsc compiles cleanly',
    after.status === 0,
    after.status === 0 ? '' : `${after.stdout}${after.stderr}`,
  )
  rmSync(dir, { recursive: true, force: true })
}

// ── Fixture 3.b: end-to-end via typecheck-sketches.ts ──────────────────────
//
// A pattern with `sdkAvailability: 'first-party-ts'` and a sketch that uses
// top-level await but has NO export. typecheck-sketches must inject the
// export and compile cleanly.

console.log('\n[3.b] typecheck-sketches.ts wraps a top-level-await sketch and exits 0')
{
  const fixtureSlug = '__neg-tla-fixture__'
  const fixturePath = resolve(REPO, 'src/data/agentic-design-patterns/patterns', `${fixtureSlug}.ts`)
  const indexPath = resolve(REPO, 'src/data/agentic-design-patterns/index.ts')
  const indexBackup = `${indexPath}.bak`
  const fs = await import('node:fs')
  const originalIndex = fs.readFileSync(indexPath, 'utf8')
  fs.copyFileSync(indexPath, indexBackup)
  try {
    fs.writeFileSync(
      fixturePath,
      `import type { Pattern } from '../types'
const sketch = [
  '// Top-level await with no export — typecheck-sketches must inject export {}',
  'const x = await Promise.resolve(42)',
  'console.log(x)',
].join('\\n')
export const pattern: Pattern = {
  slug: '${fixtureSlug}',
  name: 'TLA Fixture',
  layerId: 'topology',
  topologySubtier: 'single-agent',
  oneLineSummary: 'fixture',
  bodySummary: ['fixture'],
  mermaidSource: '',
  mermaidAlt: '',
  whenToUse: [],
  whenNotToUse: [],
  realWorldExamples: [],
  implementationSketch: sketch,
  sdkAvailability: 'first-party-ts',
  relatedSlugs: [],
  frameworks: [],
  references: [],
  addedAt: '2026-05-03',
  dateModified: '2026-05-03',
}
`,
      'utf8',
    )
    const patched = originalIndex
      .replace(
        '// ── PATTERNS array',
        `import { pattern as __negTlaFixture } from './patterns/${fixtureSlug}'\n\n// ── PATTERNS array`,
      )
      .replace(
        'export const PATTERNS: Pattern[] = [',
        'export const PATTERNS: Pattern[] = [\n  __negTlaFixture,',
      )
    fs.writeFileSync(indexPath, patched, 'utf8')

    const result = spawnSync(
      resolve(REPO, 'node_modules/.bin/tsx'),
      ['scripts/typecheck-sketches.ts'],
      { encoding: 'utf8', cwd: REPO },
    )
    record(
      'typecheck-sketches.ts exits 0 on a TLA-only sketch (export {} injected)',
      result.status === 0,
      result.status === 0
        ? ''
        : `exit=${result.status} stdout=${result.stdout?.trim()} stderr=${result.stderr?.trim()}`,
    )
  } finally {
    rmSync(fixturePath, { force: true })
    fs.copyFileSync(indexBackup, indexPath)
    rmSync(indexBackup, { force: true })
  }
}

console.log(`\n${pass} passed, ${fail} failed`)
if (fail > 0) process.exit(1)
