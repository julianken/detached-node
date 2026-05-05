// ---------------------------------------------------------------------------
// Agentic Design Patterns — Type Model
// ---------------------------------------------------------------------------

export type LayerId =
  | 'topology'
  | 'quality'
  | 'state'
  | 'interfaces'
  | 'methodology'

export type TopologySubtier = 'single-agent' | 'multi-agent' | undefined

export type Layer = {
  id: LayerId
  number: 1 | 2 | 3 | 4 | 5
  title: string        // e.g. "Topology / Control Flow"
  question: string     // e.g. "How should my calls flow?"
  description: string  // 1-sentence editorial framing
}

export type Framework =
  | 'langchain'
  | 'langgraph'
  | 'crew-ai'
  | 'google-adk'
  | 'autogen'
  | 'vercel-ai-sdk'
  | 'pydantic-ai'
  | 'openai-agents'
  | 'mastra'
  | 'smolagents'

export type ReferenceType = 'paper' | 'essay' | 'docs' | 'book' | 'spec'

export type Reference = {
  title: string
  url: string
  authors: string    // "Shinn et al." | "Anthropic" | "Antonio Gulli"
  year: number
  venue?: string     // "NeurIPS 2023" | "Springer" | undefined for blog/docs
  type: ReferenceType
  doi?: string       // for papers — canonical identifier
  pages?: [number, number] // for books — exact page range cited
  accessedAt?: string     // ISO date — for vendor docs (which mutate)
  note?: string      // optional 1-line context
}

export type SdkAvailability =
  | 'first-party-ts'
  | 'community-ts'
  | 'python-only'
  | 'no-sdk'

// ---------------------------------------------------------------------------
// Realizing in Claude Code — discriminated field added in W1.0
// ---------------------------------------------------------------------------
// Optional field on Pattern; all 23 existing patterns default undefined.
// Render path guards with pattern.realizingInClaudeCode && so absent values
// produce no output.
// ---------------------------------------------------------------------------

/** A concrete CC primitive name, e.g. "Task() parallel dispatch" */
export type CcPrimitive = string

/** A concrete scaffolding artifact name, e.g. "analysis-funnel/SKILL.md" */
export type CcScaffolding = string

/** A worked example anchor with a verified GitHub URL */
export type CcWorkedExample = {
  url: string
  description: string
}

/** The Monday-morning move: text ≤25 words + SKILL.md or GitHub anchor */
export type CcReaderMove = {
  text: string
  anchorUrl: string
}

/** Cross-links: optional skill path, article slug, sibling pattern slugs */
export type CcSeeAlso = {
  skillPath?: string
  articleSlug?: string
  siblingPatternSlugs?: string[]
}

/** Single row in a Tier-U umbrella pointer list */
export type CcUmbrellaPointer = {
  patternSlug: string
  oneLine: string
}

/**
 * Discriminated union over four tiers:
 * - Tier A: full satellite (ccPrimitives + scaffolding + workedExample + readerMove + seeAlso)
 * - Tier B: compact (readerMove + seeAlso; bodyMarkdown optional)
 * - Tier C: cross-link paragraph (readerMove + seeAlso + bodyMarkdown)
 * - Tier U: umbrella index (openingFraming + umbrellaPointers ≥10 + closingRule + seeAlso)
 */
export type RealizingInClaudeCode = {
  tier: 'A' | 'B' | 'C' | 'U'
  /** Required Tier A: CC primitive names that realize this pattern */
  ccPrimitives?: CcPrimitive[]
  /** Required Tier A: scaffolding artifacts (SKILL.md paths, config files) */
  scaffolding?: CcScaffolding[]
  /** Required Tier A: one verified worked-example PR or tree URL */
  workedExample?: CcWorkedExample
  /** Required Tier A, B, C: the Monday-morning reader move */
  readerMove?: CcReaderMove
  /** Required all tiers: cross-link block */
  seeAlso?: CcSeeAlso
  /** Tier C (and Tier A supplementary): compact paragraph prose */
  bodyMarkdown?: string
  /** Tier U only: ≥10 umbrella pointer rows */
  umbrellaPointers?: CcUmbrellaPointer[]
  /** Tier U only: opening framing paragraph (~100w) */
  openingFraming?: string
  /** Tier U only: closing rule sentence (verbatim meta-rule) */
  closingRule?: string
}

export type Pattern = {
  slug: string                // kebab-case, equals filename
  name: string                // canonical name we use
  alternativeNames?: string[] // synonyms across sources
  layerId: LayerId
  secondaryLayerId?: LayerId  // for dual-layer patterns (e.g. Reflexion: Topology+State)
  topologySubtier?: TopologySubtier // only set when layerId === 'topology'
  parentPatternSlug?: string  // for variants (e.g. agentic-rag → rag)
  oneLineSummary: string      // hub card; ≤ 90 chars (enforced by unit test)
  bodySummary: string[]       // 2-3 paragraphs for satellite (~300 words total)
  mermaidSource: string       // original diagram, mermaid syntax, labeled boxes only
  mermaidAlt: string          // alt text for screen readers
  whenToUse: string[]         // 3-5 bullets
  whenNotToUse: string[]      // 2-3 bullets
  realWorldExamples: { text: string; sourceUrl: string }[] // 3 bullets, each cites public source
  implementationSketch: string // ~15 lines; TypeScript or pseudocode
  sdkAvailability: SdkAvailability
  readerGotcha?: { text: string; sourceUrl: string }
  relatedSlugs: string[]      // 2-4 cross-link chips; build fails if any don't resolve
  frameworks: Framework[]
  references: Reference[]     // 3-7 references
  addedAt: string             // ISO date — pattern joined the catalog
  dateModified: string        // ISO date — last meaningful content edit
  lastChangeNote?: string     // 1-line description of last edit
  archived?: boolean          // true when retired
  /** W1.0: optional bridge field; absent for all 23 patterns until W1.1+ fills them */
  realizingInClaudeCode?: RealizingInClaudeCode
}

export type ChangelogEntryType = 'added' | 'edited' | 'retired'

export type ChangelogEntry = {
  date: string              // ISO date
  slug: string              // pattern slug touched
  type: ChangelogEntryType
  note: string              // 1-line description
  author: string            // PR author's GitHub handle
  prUrl?: string            // link to merged PR
}
