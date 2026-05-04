// ---------------------------------------------------------------------------
// Agentic Design Patterns — Barrel + Helpers
// ---------------------------------------------------------------------------
// Imports all 23 pattern files and exports PATTERNS array + helper functions.
//
// NOTE: The 12-factor-agent slug starts with a digit, which is invalid as a
// JS identifier. We alias it via a named import.

import type { LayerId, Pattern, TopologySubtier } from './types'
export type { LayerId, Layer, Framework, ReferenceType, Reference, SdkAvailability, Pattern, ChangelogEntryType, ChangelogEntry, TopologySubtier } from './types'
export { LAYERS } from './layers'

// ── Pattern imports ──────────────────────────────────────────────────────────

import { pattern as promptChaining }        from './patterns/prompt-chaining'
import { pattern as routing }               from './patterns/routing'
import { pattern as parallelization }       from './patterns/parallelization'
import { pattern as planning }              from './patterns/planning'
import { pattern as toolUseReact }          from './patterns/tool-use-react'
import { pattern as codeAgent }             from './patterns/code-agent'
import { pattern as evaluatorOptimizer }    from './patterns/evaluator-optimizer'
import { pattern as rag }                   from './patterns/rag'
import { pattern as agenticRag }            from './patterns/agentic-rag'
import { pattern as reflexion }             from './patterns/reflexion'
import { pattern as orchestratorWorkers }   from './patterns/orchestrator-workers'
import { pattern as multiAgentDebate }      from './patterns/multi-agent-debate'
import { pattern as handoffsSwarm }         from './patterns/handoffs-swarm'
import { pattern as guardrails }            from './patterns/guardrails'
import { pattern as humanInTheLoop }        from './patterns/human-in-the-loop'
import { pattern as evaluationLlmAsJudge }  from './patterns/evaluation-llm-as-judge'
import { pattern as memoryManagement }      from './patterns/memory-management'
import { pattern as contextEngineering }    from './patterns/context-engineering'
import { pattern as checkpointing }         from './patterns/checkpointing'
import { pattern as mcp }                   from './patterns/mcp'
import { pattern as a2a }                   from './patterns/a2a'
import { pattern as streaming }             from './patterns/streaming'
// Digit-starting slug — must be aliased
import { pattern as twelveFactorAgent }     from './patterns/12-factor-agent'

// ── PATTERNS array — canonical order matches the 5-layer spec ─────────────

export const PATTERNS: Pattern[] = [
  // Layer 1 — Topology / Single-agent (10)
  promptChaining,
  routing,
  parallelization,
  planning,
  toolUseReact,
  codeAgent,
  evaluatorOptimizer,
  rag,
  agenticRag,
  reflexion,
  // Layer 1 — Topology / Multi-agent (3)
  orchestratorWorkers,
  multiAgentDebate,
  handoffsSwarm,
  // Layer 2 — Quality & Control Gates (3)
  guardrails,
  humanInTheLoop,
  evaluationLlmAsJudge,
  // Layer 3 — State & Context (3)
  memoryManagement,
  contextEngineering,
  checkpointing,
  // Layer 4 — Interfaces & Transport (3)
  mcp,
  a2a,
  streaming,
  // Layer 5 — Methodology (1)
  twelveFactorAgent,
]

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Look up a pattern by slug. Returns undefined if not found (or archived).
 */
export function getPattern(slug: string): Pattern | undefined {
  return PATTERNS.find((p) => p.slug === slug && !p.archived)
}

/**
 * Return all non-archived patterns in the given layer.
 */
export function getPatternsByLayer(layerId: LayerId): Pattern[] {
  return PATTERNS.filter((p) => p.layerId === layerId && !p.archived)
}

/**
 * Return topology patterns filtered by sub-tier.
 * - 'single-agent': 10 patterns
 * - 'multi-agent': 3 patterns
 * - undefined: all topology patterns (13)
 */
export function getTopologyPatterns(subtier: TopologySubtier): Pattern[] {
  return PATTERNS.filter(
    (p) =>
      p.layerId === 'topology' &&
      !p.archived &&
      (subtier === undefined ? true : p.topologySubtier === subtier),
  )
}

/**
 * Return slugs of all non-archived patterns in catalog order.
 */
export function getPatternSlugs(): string[] {
  return PATTERNS.filter((p) => !p.archived).map((p) => p.slug)
}

/**
 * Return the previous and next non-archived patterns relative to a given slug.
 * Prev/next are scoped within the same layerId (and topologySubtier for topology).
 */
export function getAdjacentPatterns(slug: string): { prev: Pattern | null; next: Pattern | null } {
  const pattern = PATTERNS.find((p) => p.slug === slug)
  if (!pattern) return { prev: null, next: null }

  // Build the scoped list: same layer; for topology, same sub-tier
  const scoped = PATTERNS.filter((p) => {
    if (p.archived) return false
    if (p.layerId !== pattern.layerId) return false
    if (pattern.layerId === 'topology') {
      return p.topologySubtier === pattern.topologySubtier
    }
    return true
  })

  const idx = scoped.findIndex((p) => p.slug === slug)
  if (idx === -1) return { prev: null, next: null }

  return {
    prev: idx > 0 ? scoped[idx - 1] : null,
    next: idx < scoped.length - 1 ? scoped[idx + 1] : null,
  }
}

/**
 * Return the most recent `dateModified` across all non-archived patterns.
 * Used for the hub's "Updated [month YYYY]" eyebrow.
 */
export function getCatalogDateModified(): string {
  const dates = PATTERNS.filter((p) => !p.archived).map((p) => p.dateModified)
  return dates.reduce((latest, d) => (d > latest ? d : latest), '1970-01-01')
}

/**
 * Return the count of non-archived patterns.
 * Dynamic — never hardcoded.
 */
export function getCatalogPatternCount(): number {
  return PATTERNS.filter((p) => !p.archived).length
}
