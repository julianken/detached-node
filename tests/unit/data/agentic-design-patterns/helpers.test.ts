import { describe, it, expect } from 'vitest'
import {
  PATTERNS,
  getPattern,
  getPatternsByLayer,
  getTopologyPatterns,
  getPatternSlugs,
  getAdjacentPatterns,
  getCatalogDateModified,
  getCatalogPatternCount,
} from '@/data/agentic-design-patterns/index'

// ---------------------------------------------------------------------------
// Catalog shape
// ---------------------------------------------------------------------------

describe('PATTERNS catalog', () => {
  it('contains exactly 23 patterns', () => {
    expect(PATTERNS).toHaveLength(23)
  })

  it('every pattern slug is unique', () => {
    const slugs = PATTERNS.map((p) => p.slug)
    const unique = new Set(slugs)
    expect(unique.size).toBe(slugs.length)
  })

  it('every pattern slug matches the kebab-case convention', () => {
    for (const p of PATTERNS) {
      expect(p.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    }
  })

  it('every pattern has a non-empty name', () => {
    for (const p of PATTERNS) {
      expect(p.name.length).toBeGreaterThan(0)
    }
  })

  it('every oneLineSummary is ≤ 90 chars', () => {
    for (const p of PATTERNS) {
      expect(p.oneLineSummary.length).toBeLessThanOrEqual(90)
    }
  })

  it('every stub ships with relatedSlugs: []', () => {
    // Phase-2 work populates relatedSlugs; all stubs start empty
    for (const p of PATTERNS) {
      expect(Array.isArray(p.relatedSlugs)).toBe(true)
    }
  })

  it('any non-empty relatedSlugs entry resolves to an existing slug', () => {
    const allSlugs = new Set(PATTERNS.map((p) => p.slug))
    for (const p of PATTERNS) {
      for (const related of p.relatedSlugs) {
        expect(allSlugs.has(related)).toBe(true)
      }
    }
  })

  it('every pattern addedAt is an ISO date', () => {
    for (const p of PATTERNS) {
      expect(p.addedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('every pattern dateModified is an ISO date', () => {
    for (const p of PATTERNS) {
      expect(p.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})

// ---------------------------------------------------------------------------
// Topology membership (exact)
// ---------------------------------------------------------------------------

describe('Topology pattern membership', () => {
  const singleAgentSlugs = [
    'prompt-chaining', 'routing', 'parallelization', 'planning',
    'tool-use-react', 'code-agent', 'evaluator-optimizer',
    'rag', 'agentic-rag', 'reflexion',
  ]
  const multiAgentSlugs = [
    'orchestrator-workers', 'multi-agent-debate', 'handoffs-swarm',
  ]

  it('has exactly 10 single-agent topology patterns', () => {
    const patterns = getTopologyPatterns('single-agent')
    expect(patterns).toHaveLength(10)
  })

  it('single-agent slugs match exactly', () => {
    const patterns = getTopologyPatterns('single-agent')
    const slugs = patterns.map((p) => p.slug).sort()
    expect(slugs).toEqual([...singleAgentSlugs].sort())
  })

  it('has exactly 3 multi-agent topology patterns', () => {
    const patterns = getTopologyPatterns('multi-agent')
    expect(patterns).toHaveLength(3)
  })

  it('multi-agent slugs match exactly', () => {
    const patterns = getTopologyPatterns('multi-agent')
    const slugs = patterns.map((p) => p.slug).sort()
    expect(slugs).toEqual([...multiAgentSlugs].sort())
  })

  it('getTopologyPatterns(undefined) returns all 13 topology patterns', () => {
    const patterns = getTopologyPatterns(undefined)
    expect(patterns).toHaveLength(13)
  })

  it('every topology pattern has a topologySubtier set', () => {
    const topology = getPatternsByLayer('topology')
    for (const p of topology) {
      expect(p.topologySubtier).toBeDefined()
      expect(['single-agent', 'multi-agent']).toContain(p.topologySubtier)
    }
  })

  it('non-topology patterns do not have topologySubtier set', () => {
    const nonTopology = PATTERNS.filter((p) => p.layerId !== 'topology')
    for (const p of nonTopology) {
      expect(p.topologySubtier).toBeUndefined()
    }
  })
})

// ---------------------------------------------------------------------------
// Layer distribution
// ---------------------------------------------------------------------------

describe('getPatternsByLayer', () => {
  it('topology has 13 patterns', () => {
    expect(getPatternsByLayer('topology')).toHaveLength(13)
  })

  it('quality has 3 patterns', () => {
    expect(getPatternsByLayer('quality')).toHaveLength(3)
  })

  it('state has 3 patterns', () => {
    expect(getPatternsByLayer('state')).toHaveLength(3)
  })

  it('interfaces has 3 patterns', () => {
    expect(getPatternsByLayer('interfaces')).toHaveLength(3)
  })

  it('methodology has 1 pattern', () => {
    expect(getPatternsByLayer('methodology')).toHaveLength(1)
  })

  it('layer counts sum to 23', () => {
    const total = ['topology', 'quality', 'state', 'interfaces', 'methodology']
      .map((id) => getPatternsByLayer(id as Parameters<typeof getPatternsByLayer>[0]).length)
      .reduce((a, b) => a + b, 0)
    expect(total).toBe(23)
  })
})

// ---------------------------------------------------------------------------
// getPattern
// ---------------------------------------------------------------------------

describe('getPattern', () => {
  it('returns a pattern for a known slug', () => {
    const p = getPattern('reflexion')
    expect(p).toBeDefined()
    expect(p?.slug).toBe('reflexion')
  })

  it('returns undefined for an unknown slug', () => {
    expect(getPattern('does-not-exist')).toBeUndefined()
  })

  it('12-factor-agent is accessible by slug', () => {
    const p = getPattern('12-factor-agent')
    expect(p).toBeDefined()
    expect(p?.slug).toBe('12-factor-agent')
    expect(p?.layerId).toBe('methodology')
  })
})

// ---------------------------------------------------------------------------
// getPatternSlugs
// ---------------------------------------------------------------------------

describe('getPatternSlugs', () => {
  it('returns exactly 23 slugs', () => {
    expect(getPatternSlugs().length).toBe(23)
  })

  it('includes 12-factor-agent', () => {
    expect(getPatternSlugs()).toContain('12-factor-agent')
  })
})

// ---------------------------------------------------------------------------
// getAdjacentPatterns
// ---------------------------------------------------------------------------

describe('getAdjacentPatterns', () => {
  it('returns null prev for the first pattern in its tier', () => {
    // prompt-chaining is first in single-agent topology
    const { prev } = getAdjacentPatterns('prompt-chaining')
    expect(prev).toBeNull()
  })

  it('returns null next for the last pattern in its tier', () => {
    // reflexion is last in single-agent topology
    const { next } = getAdjacentPatterns('reflexion')
    expect(next).toBeNull()
  })

  it('returns both prev and next for a middle pattern', () => {
    // routing is second in single-agent topology
    const { prev, next } = getAdjacentPatterns('routing')
    expect(prev?.slug).toBe('prompt-chaining')
    expect(next?.slug).toBe('parallelization')
  })

  it('returns null for an unknown slug', () => {
    const { prev, next } = getAdjacentPatterns('does-not-exist')
    expect(prev).toBeNull()
    expect(next).toBeNull()
  })

  it('12-factor-agent is alone in methodology — both null', () => {
    const { prev, next } = getAdjacentPatterns('12-factor-agent')
    expect(prev).toBeNull()
    expect(next).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// getCatalogDateModified
// ---------------------------------------------------------------------------

describe('getCatalogDateModified', () => {
  it('returns an ISO date string', () => {
    const date = getCatalogDateModified()
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('is the maximum dateModified across all patterns', () => {
    const max = PATTERNS.filter((p) => !p.archived)
      .map((p) => p.dateModified)
      .reduce((a, b) => (b > a ? b : a), '1970-01-01')
    expect(getCatalogDateModified()).toBe(max)
  })
})

// ---------------------------------------------------------------------------
// getCatalogPatternCount
// ---------------------------------------------------------------------------

describe('getCatalogPatternCount', () => {
  it('returns 23 (no patterns archived in this PR)', () => {
    expect(getCatalogPatternCount()).toBe(23)
  })
})
