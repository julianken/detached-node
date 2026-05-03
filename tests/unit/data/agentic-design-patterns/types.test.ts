import { describe, it, expect } from 'vitest'
import type {
  LayerId,
  TopologySubtier,
  ReferenceType,
  SdkAvailability,
  ChangelogEntryType,
  Layer,
  Reference,
  Pattern,
  ChangelogEntry,
  Framework,
} from '@/data/agentic-design-patterns/types'

// ---------------------------------------------------------------------------
// Type-level assertions — these fail at compile time if types change
// ---------------------------------------------------------------------------

describe('LayerId', () => {
  it('accepts all five layer ids', () => {
    const ids: LayerId[] = ['topology', 'quality', 'state', 'interfaces', 'methodology']
    expect(ids).toHaveLength(5)
  })
})

describe('TopologySubtier', () => {
  it('accepts single-agent, multi-agent, and undefined', () => {
    const subtiers: TopologySubtier[] = ['single-agent', 'multi-agent', undefined]
    expect(subtiers).toHaveLength(3)
  })
})

describe('ReferenceType', () => {
  it('accepts all five reference types', () => {
    const types: ReferenceType[] = ['paper', 'essay', 'docs', 'book', 'spec']
    expect(types).toHaveLength(5)
  })
})

describe('SdkAvailability', () => {
  it('accepts all four sdk availability values', () => {
    const vals: SdkAvailability[] = ['first-party-ts', 'community-ts', 'python-only', 'no-sdk']
    expect(vals).toHaveLength(4)
  })
})

describe('ChangelogEntryType', () => {
  it('accepts added, edited, retired', () => {
    const types: ChangelogEntryType[] = ['added', 'edited', 'retired']
    expect(types).toHaveLength(3)
  })
})

describe('Framework', () => {
  it('accepts all ten frameworks', () => {
    const frameworks: Framework[] = [
      'langchain', 'langgraph', 'crew-ai', 'google-adk', 'autogen',
      'vercel-ai-sdk', 'pydantic-ai', 'openai-agents', 'mastra', 'smolagents',
    ]
    expect(frameworks).toHaveLength(10)
  })
})

describe('Layer shape', () => {
  it('constructs a valid Layer object', () => {
    const layer: Layer = {
      id: 'topology',
      number: 1,
      title: 'Topology / Control Flow',
      question: 'How should my calls flow?',
      description: 'Patterns that govern how agent steps are arranged and sequenced.',
    }
    expect(layer.id).toBe('topology')
    expect(layer.number).toBe(1)
  })
})

describe('Reference shape', () => {
  it('constructs a minimal valid Reference', () => {
    const ref: Reference = {
      title: 'Reflexion: Language Agents with Verbal Reinforcement Learning',
      url: 'https://arxiv.org/abs/2303.11366',
      authors: 'Shinn et al.',
      year: 2023,
      type: 'paper',
    }
    expect(ref.type).toBe('paper')
  })

  it('constructs a Reference with all optional fields', () => {
    const ref: Reference = {
      title: 'Agentic Design Patterns',
      url: 'https://link.springer.com/book/9783032014016',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [72, 95],
      accessedAt: '2026-05-02',
      note: 'chapter 4',
    }
    expect(ref.pages).toEqual([72, 95])
  })
})

describe('Pattern shape', () => {
  it('constructs a valid stub Pattern', () => {
    const pattern: Pattern = {
      slug: 'reflexion',
      name: 'Reflexion',
      layerId: 'topology',
      topologySubtier: 'single-agent',
      oneLineSummary: 'An agent critiques its own output verbally and retries until a quality threshold is met.',
      bodySummary: [],
      mermaidSource: '',
      mermaidAlt: '',
      whenToUse: [],
      whenNotToUse: [],
      realWorldExamples: [],
      implementationSketch: '',
      sdkAvailability: 'first-party-ts',
      relatedSlugs: [],
      frameworks: [],
      references: [],
      addedAt: '2026-05-02',
      dateModified: '2026-05-02',
    }
    expect(pattern.slug).toBe('reflexion')
    expect(pattern.layerId).toBe('topology')
    expect(pattern.oneLineSummary.length).toBeLessThanOrEqual(90)
  })

  it('accepts optional fields', () => {
    const pattern: Pattern = {
      slug: 'agentic-rag',
      name: 'Agentic RAG',
      layerId: 'topology',
      topologySubtier: 'single-agent',
      parentPatternSlug: 'rag',
      alternativeNames: ['Self-RAG', 'Active RAG'],
      oneLineSummary: 'A retrieval-augmented agent that decides when and what to retrieve mid-generation.',
      bodySummary: [],
      mermaidSource: '',
      mermaidAlt: '',
      whenToUse: [],
      whenNotToUse: [],
      realWorldExamples: [],
      implementationSketch: '',
      sdkAvailability: 'community-ts',
      readerGotcha: { text: 'Naive chunking defeats relevance.', sourceUrl: 'https://example.com' },
      relatedSlugs: [],
      frameworks: [],
      references: [],
      addedAt: '2026-05-02',
      dateModified: '2026-05-02',
      lastChangeNote: 'Initial scaffold',
      archived: false,
    }
    expect(pattern.parentPatternSlug).toBe('rag')
    expect(pattern.alternativeNames).toHaveLength(2)
  })
})

describe('ChangelogEntry shape', () => {
  it('constructs a valid ChangelogEntry', () => {
    const entry: ChangelogEntry = {
      date: '2026-05-02',
      slug: 'reflexion',
      type: 'added',
      note: 'Catalog scaffold launched; Reflexion exemplar shipped in #158.',
      author: 'julianken',
      prUrl: 'https://github.com/julianken/detached-node/pull/152',
    }
    expect(entry.type).toBe('added')
    expect(entry.slug).toBe('reflexion')
  })
})
