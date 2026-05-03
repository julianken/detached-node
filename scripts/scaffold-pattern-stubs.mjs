#!/usr/bin/env node
// scripts/scaffold-pattern-stubs.mjs
//
// One-shot generator for agentic-design-patterns stub files.
// Safe to re-run — skips existing files (won't overwrite modified content).
// Delete a file and re-run to regenerate it from scratch.
//
// Usage:
//   node scripts/scaffold-pattern-stubs.mjs

import { writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PATTERNS_DIR = join(ROOT, 'src/data/agentic-design-patterns/patterns')

// addedAt / dateModified for stubs — today's date at generation time
const TODAY = new Date().toISOString().slice(0, 10)

// ---------------------------------------------------------------------------
// STUBS table — [slug, name, layerId, topologySubtier, parentPatternSlug]
// 6 positional fields total; parentPatternSlug may be undefined.
// secondaryLayerId is NOT here — Reflexion's dual-layer patch happens in #158.
// ---------------------------------------------------------------------------

/** @type {[string, string, string, string|null, string|undefined][]} */
const STUBS = [
  // ── Topology / Single-agent (10) ─────────────────────────────────────────
  ['prompt-chaining',     'Prompt Chaining',           'topology', 'single-agent', undefined],
  ['routing',             'Routing',                   'topology', 'single-agent', undefined],
  ['parallelization',     'Parallelization',           'topology', 'single-agent', undefined],
  ['planning',            'Planning',                  'topology', 'single-agent', undefined],
  ['tool-use-react',      'Tool Use / ReAct',          'topology', 'single-agent', undefined],
  ['code-agent',          'Code Agent',                'topology', 'single-agent', 'tool-use-react'],
  ['evaluator-optimizer', 'Evaluator-Optimizer',       'topology', 'single-agent', undefined],
  ['rag',                 'RAG',                       'topology', 'single-agent', undefined],
  ['agentic-rag',         'Agentic RAG',               'topology', 'single-agent', 'rag'],
  ['reflexion',           'Reflexion',                 'topology', 'single-agent', undefined],

  // ── Topology / Multi-agent (3) ────────────────────────────────────────────
  ['orchestrator-workers', 'Orchestrator-Workers',    'topology', 'multi-agent',  undefined],
  ['multi-agent-debate',   'Multi-Agent Debate',      'topology', 'multi-agent',  undefined],
  ['handoffs-swarm',       'Handoffs / Swarm',        'topology', 'multi-agent',  undefined],

  // ── Quality & Control Gates (3) ───────────────────────────────────────────
  ['guardrails',            'Guardrails',              'quality',     null, undefined],
  ['human-in-the-loop',    'Human-in-the-Loop',       'quality',     null, undefined],
  ['evaluation-llm-as-judge', 'Evaluation / LLM-as-Judge', 'quality', null, undefined],

  // ── State & Context (3) ───────────────────────────────────────────────────
  ['memory-management',   'Memory Management',        'state',       null, undefined],
  ['context-engineering', 'Context Engineering',      'state',       null, undefined],
  ['checkpointing',       'Checkpointing',            'state',       null, undefined],

  // ── Interfaces & Transport (3) ────────────────────────────────────────────
  ['mcp',                 'MCP',                      'interfaces',  null, undefined],
  ['a2a',                 'A2A',                      'interfaces',  null, undefined],
  ['streaming',           'Streaming',                'interfaces',  null, undefined],

  // ── Methodology (1) ───────────────────────────────────────────────────────
  ['12-factor-agent',     '12-Factor Agent',          'methodology', null, undefined],
]

function generateStub(slug, name, layerId, topologySubtier, parentPatternSlug) {
  // All stub files use a named export `pattern: Pattern` for consistency.
  // The digit-leading slug 12-factor-agent is aliased in index.ts barrel.

  const topologySubtierLine =
    topologySubtier
      ? `  topologySubtier: '${topologySubtier}',\n`
      : ''

  const parentLine =
    parentPatternSlug
      ? `  parentPatternSlug: '${parentPatternSlug}',\n`
      : ''

  return `import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: '${slug}',
  name: '${name}',
  layerId: '${layerId}',
${topologySubtierLine}${parentLine}  oneLineSummary: '', // TODO: fill in ≤ 90 chars
  bodySummary: [],
  mermaidSource: '',
  mermaidAlt: '',
  whenToUse: [],
  whenNotToUse: [],
  realWorldExamples: [],
  implementationSketch: '',
  sdkAvailability: 'no-sdk',
  relatedSlugs: [],
  frameworks: [],
  references: [],
  addedAt: '${TODAY}',
  dateModified: '${TODAY}',
}
`
}

let created = 0
let skipped = 0

for (const [slug, name, layerId, topologySubtier, parentPatternSlug] of STUBS) {
  const filePath = join(PATTERNS_DIR, `${slug}.ts`)
  if (existsSync(filePath)) {
    console.log(`  skip  ${slug}.ts (already exists)`)
    skipped++
    continue
  }
  const content = generateStub(slug, name, layerId, topologySubtier, parentPatternSlug)
  writeFileSync(filePath, content, 'utf-8')
  console.log(`  write ${slug}.ts`)
  created++
}

console.log(`\nDone — ${created} created, ${skipped} skipped.`)
