# Agentic Design Patterns — Field Reference

**Date:** 2026-05-02
**Status:** Draft (pivot from `2026-05-02-agentic-design-patterns-companion-design.md` — supersedes the prior companion framing)
**Editorial posture:** Field-aware peer reference, living catalog. Cites Anthropic, Gulli, foundational papers, and framework docs as parallel sources of authority. Not a "companion" to any single book.

## Problem

Build a free, web-native, **living catalog of agentic design patterns** at `/agentic-design-patterns` — Detached Node's working reference for patterns the field has converged on (and a few it hasn't fully agreed on yet). The page must:

1. Function as a **reference tool** developers keep open while coding — dense, scannable, fast
2. Be **rigorously cited** — each pattern documents its sources (papers, vendor docs, foundational essays, books) so readers can dive deeper into any thread
3. Be **a living document** — patterns added, refined, and occasionally retired as the field evolves; `dateModified` tracked per pattern; no "21" or "N" hardcoded into branding
4. Demonstrate **2026-era frontend craft** — Next.js 16 server components with minimal client JS, View Transitions API, CSS Container Queries for responsive cards, custom per-pattern OG images via `next/og`, terminal-aesthetic mermaid diagrams

Catalog scope (v1, lean): **23 patterns** drawn from the field-survey waves. The math:

- **15 patterns from Gulli kept** (multi-source consensus): Prompt Chaining (ch.1), Routing (ch.2), Parallelization (ch.3), Reflection→Reflexion (ch.4), Tool Use (ch.5), Planning (ch.6), Multi-Agent→Orchestrator-Workers (ch.7), Memory Management (ch.8), MCP (ch.10), Knowledge Retrieval/RAG (ch.14), A2A (ch.15), Reasoning subset→split into Reasoning patterns under Topology (ch.17), Guardrails/Safety (ch.18), Evaluation/LLM-as-Judge (ch.19), Human-in-the-Loop (ch.13)
- **8 field additions**: Evaluator-Optimizer (Anthropic-named, distinct from Reflexion), Code Agent (smolagents/AutoGen), Agentic RAG (Singh et al. 2025), Context Engineering (Karpathy/Lance Martin), Multi-Agent Debate (Du et al. 2023), Handoffs/Swarm (OpenAI), Streaming (universal), Checkpointing (LangGraph/CrewAI/Mastra), 12-Factor Agent Stance (Dex Horthy) — note this is 9; Reflexion is reclassified as the academic-grounded specialization of Reflection rather than counted as new
- **7 Gulli patterns cut** (lacking field support): Learning and Adaptation (ch.9), Goal Setting and Monitoring (ch.11), Exception Handling (ch.12), Resource-Aware Optimization (ch.16), Prioritization (ch.20), Exploration and Discovery (ch.21), Reasoning Techniques (ch.17 — split into specific named techniques surfaced under Topology)

15 + 8 = 23. Variants (Code Agent, Agentic RAG) are tracked via `parentPatternSlug` so readers see they're specializations, not islands.

## Solution

Static pillar-cluster: one **hub** at `/agentic-design-patterns` linking to **23 satellite pages** at `/agentic-design-patterns/[slug]`. All routes server-rendered, force-static. Hub is a dense reference tool (search, layer-filter chips, all patterns visible). Satellites share a single 8-slot anatomy with a prominent **References** section — *each pattern is a primary reference page, not commentary on a book*. Citations are first-class: every pattern cites multiple sources, sourced to URL.

The page's authority derives from rigorous, multi-source sourcing — not from any single book or author.

## Editorial principles (load-bearing)

Encoded in components, not just docs.

1. **Cite the actual sources** — every pattern's References section lists 3-7 cited works (papers, foundational essays, vendor docs, books), each with author, year, venue, and URL. Where applicable, papers include DOI and books include page ranges. Gulli's book is one citation among several where his treatment is canonical for that pattern.
2. **References are validated, not just URL-checked** — `scripts/validate-references.ts` cross-checks every `type === 'paper'` reference against Crossref / OpenAlex (verifying title + author surname + year actually match the cited URL). Subagent can't fabricate plausible-looking-but-wrong citations and pass review. Runs as part of `npm run lint`.
3. **Original prose only** — we summarize patterns in our own words; we never paraphrase a single source's sentences. The style guide includes worked good-vs-bad examples and a similarity-check tool.
4. **Original diagrams only** — every Mermaid is ours; structurally identical with different fills counts as derivative.
5. **No affiliate tags on ANY outbound link, ever** — not just Amazon, not just for one author. Lint rule scans all outbound URLs and rejects known affiliate query params (`tag=`, `ref=`, `aff=`, etc.).
6. **Page author is named** — Julian Ken's real name appears in `Article.author` schema and in the satellite footer. The "Detached Node" pseudonym is the publication; the page author is named.
7. **Living catalog, not a fixed-N claim** — the catalog count is dynamic in copy and schema. `dateModified` is tracked per pattern. Pattern files include `lastChangeNote` for changelog auto-generation. The hub eyebrow shows "updated [month YYYY]".
8. **Implementation sketches must compile WHERE A TYPESCRIPT SDK EXISTS** — `scripts/typecheck-sketches.ts` validates every TypeScript snippet against the relevant SDK types as part of `npm run lint`. For patterns whose canonical SDKs are Python-only (e.g., AutoGen, original CrewAI, Generative Agents reference impl), the sketch is illustrative pseudocode with a banner: *"This pattern's canonical SDKs are Python; the snippet below illustrates the structure. See References for runnable Python examples."* The `sdkAvailability` field on `Pattern` records which case applies.

## Architecture

### Routes

```
/agentic-design-patterns                    → src/app/(frontend)/agentic-design-patterns/page.tsx
/agentic-design-patterns/[slug]             → src/app/(frontend)/agentic-design-patterns/[slug]/page.tsx
```

Both `export const dynamic = "force-static"`. `dynamicParams: false` on the satellite route — unknown slugs 404 cleanly.

### Slugs (kebab-case from pattern name)

`prompt-chaining`, `routing`, `parallelization`, `orchestrator-workers`, `evaluator-optimizer`, `tool-use-react`, `code-agent`, `planning`, `reflexion`, `rag`, `agentic-rag`, `memory-management`, `context-engineering`, `multi-agent-debate`, `handoffs-swarm`, `a2a`, `mcp`, `human-in-the-loop`, `guardrails`, `evaluation-llm-as-judge`, `streaming`, `checkpointing`, `12-factor-agent`.

### 5-layer organization

```
LAYER 1 — Topology / Control Flow (13 patterns)
  └─ Single-agent (10):
       prompt-chaining, routing, parallelization, planning,
       tool-use-react, code-agent, evaluator-optimizer,
       rag, agentic-rag, reflexion
  └─ Multi-agent (3):
       orchestrator-workers, multi-agent-debate, handoffs-swarm

LAYER 2 — Quality & Control Gates (3)
       guardrails, human-in-the-loop, evaluation-llm-as-judge

LAYER 3 — State & Context (3)
       memory-management, context-engineering, checkpointing

LAYER 4 — Interfaces & Transport (3)
       mcp, a2a, streaming

LAYER 5 — Methodology (1)
       12-factor-agent
```

Sub-tier inside Topology prevents the GoF "Behavioral bloat" failure mode (one bucket dominating > 50% of the catalog).

### Data model

Per-pattern files for parallel agentic dispatch (no merge-conflict contention):

```
src/data/agentic-design-patterns/
├── README.md           // directory purpose + slug→pattern conventions + STYLE_PASS checklist
├── types.ts            // LayerId, Layer, Framework, Reference, Pattern types
├── layers.ts           // LAYERS constant (5 entries with descriptions)
├── index.ts            // barrel: imports all patterns, exports PATTERNS + helpers + dateModified rollup
└── patterns/
    ├── prompt-chaining.ts        // exports `prompt-chaining: Pattern`
    ├── routing.ts
    ├── ... (one file per slug, 23 total)
```

```ts
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
  title: string             // "Topology / Control Flow" etc.
  question: string          // "How should my calls flow?"
  description: string       // 1-sentence editorial framing
}

export type Framework = 'langchain' | 'langgraph' | 'crew-ai' | 'google-adk' | 'autogen' | 'vercel-ai-sdk' | 'pydantic-ai' | 'openai-agents' | 'mastra' | 'smolagents'

export type ReferenceType = 'paper' | 'essay' | 'docs' | 'book' | 'spec'

export type Reference = {
  title: string
  url: string
  authors: string         // "Shinn et al." | "Anthropic" | "Antonio Gulli"
  year: number
  venue?: string          // "NeurIPS 2023" | "Springer" | undefined for blog/docs
  type: ReferenceType
  doi?: string            // for papers — canonical identifier; mapped to schema.org Article.identifier
  pages?: [number, number] // for books — exact page range cited
  accessedAt?: string     // ISO date — for vendor docs (which mutate); when we last verified the citation matches
  note?: string           // optional 1-line context — e.g. "foundational paper" | "chapter 4" | "field-shaping essay"
}

export type SdkAvailability = 'first-party-ts' | 'community-ts' | 'python-only' | 'no-sdk'

export type Pattern = {
  slug: string                    // kebab-case, equals filename
  name: string                    // canonical name we use
  alternativeNames?: string[]     // synonyms across sources (e.g. ["Reflection", "Self-Critique"])
  layerId: LayerId
  secondaryLayerId?: LayerId      // for genuinely dual-layer patterns — e.g. Reflexion is Topology+State; renders cross-link badge in UI
  topologySubtier?: TopologySubtier  // only set when layerId === 'topology'
  parentPatternSlug?: string      // for variants — e.g. agentic-rag.parentPatternSlug = 'rag', code-agent.parentPatternSlug = 'tool-use-react'
  oneLineSummary: string          // hub card; ≤ 90 chars (enforced by unit test)
  bodySummary: string[]           // 2-3 paragraphs for satellite (~300 words total)
  mermaidSource: string           // our original diagram, mermaid syntax, labeled boxes only
  mermaidAlt: string              // alt text for screen readers
  whenToUse: string[]             // 3-5 bullets
  whenNotToUse: string[]          // 2-3 bullets
  realWorldExamples: { text: string; sourceUrl: string }[]   // 3 bullets, each cites a public source
  implementationSketch: string    // ~15 lines; TypeScript that compiles when sdkAvailability is 'first-party-ts'/'community-ts'; pseudocode with banner when 'python-only'/'no-sdk'
  sdkAvailability: SdkAvailability // determines whether typecheck-sketches.ts enforces compilation; documented per pattern
  readerGotcha?: { text: string; sourceUrl: string }   // optional, MUST cite source
  relatedSlugs: string[]          // 2-4 cross-link chips; build fails if any don't resolve
  frameworks: Framework[]         // which frameworks document this pattern
  references: Reference[]         // 3-7 references — the catalog's primary authority signal
  addedAt: string                 // ISO date — pattern joined the catalog
  dateModified: string            // ISO date — last meaningful content edit
  lastChangeNote?: string         // 1-line description of the last edit; feeds the changelog
  archived?: boolean              // true when retired; renders a "retired" notice and excludes from grid + sitemap
}
```

**Helpers** (in `index.ts`):

```ts
export const LAYERS: Layer[]
export const PATTERNS: Pattern[]
export function getPattern(slug: string): Pattern | undefined
export function getPatternsByLayer(layerId: LayerId): Pattern[]
export function getTopologyPatterns(subtier: TopologySubtier): Pattern[]
export function getPatternSlugs(): string[]
export function getAdjacentPatterns(slug: string): { prev: Pattern | null; next: Pattern | null }
export function getCatalogDateModified(): string  // most recent dateModified across all patterns
export function getCatalogPatternCount(): number  // dynamic count
```

### Component inventory

**Build new** (companion-specific):
- `<HubHero>` — thin title band: name + subtitle + "updated [month YYYY]" + dynamic pattern count
- `<HubGrid>` — server component rendering 5 layer sections, each with pattern cards. Layer filter state lives in `?layer=` searchParam (server-readable for SSR-correct rendering); search query is local client state.
- `<HubSearchBar>` — client component, `/`-keyed; client-side fuzzy match across pattern names + summaries + alternative names
- `<PatternCard>` — hub grid card. Dense: layer badge, name, oneLineSummary, framework badges row, reference count chip
- `<PatternHeader>` — satellite header (Layer eyebrow, sub-tier if topology, pattern name, alternative names line, "What it does" 1-sentence)
- `<PatternBody>` — the 8-slot template body
- `<ReferencesSection>` — prominent section at bottom of every satellite. Lists 3-7 references with type badges (paper/essay/docs/book/spec), authors, year, venue, URL. Critical authority surface.
- `<RelatedPatternsRow>` — chip row linking to 2-4 sibling patterns
- `<PrevNextNav>` — satellite footer prev/next within current layer (or layer-tier for topology)
- `<LivingCatalogBadge>` — small inline component showing "updated [date]" — used on hub and per-satellite headers

**Reuse as-is**:
- `MermaidDiagram` (`src/components/MermaidDiagram.tsx`) — render `<MermaidDiagram source={pattern.mermaidSource} />` once per satellite
- `Card`, `Button`, `PageLayout`, `PageHeader`, `SchemaScript`, `FadeReveal` — all from `src/components/`
- `next-view-transitions` `<Link>` — for hub→satellite transitions

**New schema utilities**:
- `src/lib/schema/agentic-patterns.ts` — exports `generatePatternArticleSchema()` for satellite Article schema with `dateModified` + `citation: Reference[]` mapping
- `generateHubChildBreadcrumb()` in `src/lib/schema/breadcrumb.ts` — 3-level breadcrumb (Home > Hub > Pattern)

## Hub page composition (top to bottom)

1. Existing site nav (from `(frontend)/layout.tsx`)
2. **Thin title band** — `<HubHero>`:
   - Eyebrow: "A FIELD REFERENCE · UPDATED [MONTH YYYY]" (dynamic from `getCatalogDateModified()`)
   - Title: "Agentic Design Patterns"
   - Subtitle: "Patterns for building autonomous AI systems — drawn from the literature and current practice. Each pattern is summarized, diagrammed, and cited to its sources: papers, foundational essays, vendor docs, and recent books."
   - Tagline: "A working reference — patterns added, refined, and occasionally retired as the field evolves."
3. **Sticky search + layer-filter row** — `<HubSearchBar>` + 6 chips ("All" + 5 layer chips with dynamic counts: "Topology 13 / Quality 3 / State 3 / Interfaces 3 / Methodology 1")
4. **Grid sections by Layer** — 5 sections, each a `<PatternCard>` grid using CSS Container Queries. Topology section has a sub-divider showing "Single-agent (10)" and "Multi-agent (3)" sub-grids.
5. **Sources & influences panel** — short footer block listing the major influences this catalog draws from: Anthropic's "Building Effective Agents" essay, Gulli's *Agentic Design Patterns* (Springer 2026), CoALA, Reflexion paper, Anthropic's MCP, Google's A2A, Cognition's "Don't build multi-agents," Lance Martin's context-engineering essays, 12-Factor Agents (Dex Horthy), Hamel Husain's evals work, Eugene Yan's defensive-UX writing. Each linked.
6. **About this catalog** — short footer: "Maintained by Julian Ken (writing as Detached Node). All summaries and diagrams are original. Catalog evolves — see the [changelog]."
7. **Catalog changelog link** — at footer, links to `/agentic-design-patterns/changelog` (a small page listing pattern additions, edits, retirements with dates). Establishes the living-catalog claim.

## Satellite page anatomy

The page is a primary reference for one pattern. No deferential framing, no "marginalia divider" — this IS the reference page.

### Chrome (rendered by template)

- **(C1)** Breadcrumb back to hub + layer indicator (e.g. "Topology / Single-agent")
- **(C2)** `<PatternHeader>` — Layer eyebrow + sub-tier, pattern name, alternative names line ("Also known as: Reflection, Self-Critique"), 1-sentence "what it does" caption
- **(C3)** `<LivingCatalogBadge>` — "updated [date]" inline near header
- **(C4)** `<PrevNextNav>` after the body — prev/next within current layer (or layer-tier)
- **(C5)** Closing footer: page author byline ("By Julian Ken / Detached Node") + back-to-hub link

### 8 content slots (subagents fill these per pattern)

1. **Overview** — 2-3 paragraph summary (`pattern.bodySummary`) in our voice. The pattern's "what" and "why."
2. **Mermaid diagram** — `<MermaidDiagram source={pattern.mermaidSource} />`. Caption: "Original diagram. See References for canonical visual treatments in the source literature."
3. **When to use / When NOT to use** — two bullet lists side by side. The "when NOT" is the differentiator (most refs only cover when-to).
4. **Implementation sketch** — TypeScript code snippet (~15 lines) using Vercel AI SDK or relevant non-LangChain SDK. **Must compile** via `scripts/typecheck-sketches.ts` (lint gate). Framed: "A working TypeScript example. Source-language examples (often Python) are linked in References."
5. **Real-world examples** — 3 short bullets, each citing a public, observable system. Not invented.
6. **Reader gotcha (optional)** — operational gotcha cited from a public source. Allowed to be empty if no sourced gotcha exists. We don't claim deployment authority we don't have.
7. **Related patterns** — chip row linking to 2-4 sibling patterns (`relatedSlugs`)
8. **References** — prominent section at end of body, before chrome. The catalog's primary authority signal. 3-7 references per pattern, each with type badge (paper/essay/docs/book/spec), authors, year, venue, URL, and optional 1-line context note. Visually distinct (small panel with layered badge styling).

## References section design (the key visual differentiator)

Renders as a clean table at the end of every satellite:

```
REFERENCES
────────────────────────────────────────────────────────────────
[paper]  Shinn et al. (2023) — Reflexion: Language Agents with    →
         Verbal Reinforcement Learning. NeurIPS 2023.
         (foundational paper)

[essay]  Anthropic (2024) — Building Effective Agents.            →
         Engineering blog. (field-shaping essay)

[paper]  Madaan et al. (2023) — Self-Refine: Iterative            →
         Refinement with Self-Feedback.

[book]   Gulli, A. (2026) — Agentic Design Patterns, ch. 4.       →
         Springer. ISBN 9783032014016.

[docs]   LangGraph — Reflection workflow.                          →
```

Type badges use small monospace tags. Each row is a clickable link. This is what readers — and search engines (E-E-A-T signal) — see as the page's authority.

## Schema.org / SEO infrastructure

### Hub
- `Article` schema (matches `/failure-modes` precedent — pillar pages are Article, not BlogPosting)
- `BreadcrumbList` (2-level: Home > Agentic Design Patterns)
- `Article.dateModified = getCatalogDateModified()` — updated whenever any pattern updates
- `Article.author = AUTHOR_CONFIG` (Julian Ken / Detached Node)
- `Article.mentions: [...23 Pattern @ids]`
- `Article.about: { @type: "Thing", name: "Agentic AI design patterns" }`
- `Article.keywords: ["agentic design patterns", "AI agent design patterns", "LLM agents", ...]`

### Each satellite
- `Article` schema
- `BreadcrumbList` (3-level: Home > Agentic Design Patterns > Pattern Name)
- `Article.dateModified = pattern.dateModified` — per-pattern, NOT inherited from hub
- `Article.author = AUTHOR_CONFIG` (Julian Ken)
- `Article.citation: pattern.references.map(toScholarlyArticleSchema)` — every reference becomes a `ScholarlyArticle` / `Book` / `WebPage` schema entry. **This is the most important SEO move** — Google rewards pages with rich citation graphs.

### Other SEO assets
- `metadata.alternates.canonical` set per page (no trailing slashes)
- Per-page unique `<meta description>`
- 24 entries added to `src/app/sitemap.ts` (hub + 23 satellites; hub at priority 0.95, satellites at 0.8)
- Per-pattern OG images via `next/og` — single template at `src/app/(frontend)/agentic-design-patterns/[slug]/opengraph-image.tsx`, dynamic title + layer + reference count
- Hub OG image at `src/app/(frontend)/agentic-design-patterns/opengraph-image.tsx`
- Add `"agentic design patterns"`, `"AI agent design patterns"`, `"agent design patterns"`, `"LLM agent reference"` to `siteKeywords` in `src/lib/site-config.ts`
- All outbound links to references use `rel="noopener"` (intentionally NOT `nofollow` — we pass authority outward)

## Cross-cutting concerns

### Accessibility (a11y)
- Filter chips: `<button>` elements (not divs); arrow-key navigation; `aria-pressed` for active state
- Search input: visible label (`aria-label="Search agentic design patterns"`); `/` shortcut listens at document level but ignores when target is an input/textarea/contenteditable
- Focus order: skip-to-content → site nav → search → filter chips → first card → grid in source order
- Pattern cards: `<a>` (whole card is the link); visible focus ring uses existing `focus-ring` class
- Color contrast: every text/background pair tested against WCAG AA 4.5:1 in both themes
- Mermaid diagrams: include `aria-label` from `pattern.mermaidAlt`
- References table: `<table>` with proper `<caption>` for screen readers
- Reduced motion: respect `prefers-reduced-motion` for FadeReveal, scroll-driven animations, view transitions

### Analytics taxonomy

| Event | Trigger | Properties |
|---|---|---|
| `agentic_patterns_hub_view` | Hub page mount | `referrer`, `viewport_width` |
| `agentic_patterns_filter_change` | User clicks a layer chip | `from_layer`, `to_layer` |
| `agentic_patterns_search` | User submits search (debounced 300ms) | `query_length`, `result_count` |
| `agentic_patterns_card_click` | User clicks a `<PatternCard>` | `slug`, `layer`, `position_in_grid` |
| `agentic_patterns_satellite_view` | Satellite page mount | `slug`, `layer`, `referrer` |
| `agentic_patterns_reference_click` | User clicks a reference link | `slug`, `reference_url`, `reference_type`, `reference_authors` |
| `agentic_patterns_related_click` | User clicks a related-pattern chip | `from_slug`, `to_slug` |
| `agentic_patterns_prev_next` | User clicks prev/next nav | `from_slug`, `to_slug`, `direction` |

`reference_click` is the headline metric: did this catalog actually help readers reach the underlying source literature? (Internal — not surfaced in artifacts.)

### Performance budget

| Page | LCP target | CLS | TBT | JS shipped | Lighthouse |
|---|---|---|---|---|---|
| Hub | ≤ 1.8s on Slow 4G | < 0.05 | < 200ms | ≤ 30KB (search component is the only client JS beyond global) | ≥ 95 |
| Satellite | ≤ 1.5s on Slow 4G | < 0.05 | < 100ms | ≤ 50KB (mermaid runtime, lazy-loaded) | ≥ 95 |

Mitigations: Mermaid lazy-loaded via `next/dynamic` `ssr: false`; Crimson Pro + JetBrains Mono subset to Latin with `display: swap`; OG images cached by edge; CSS Container Queries (no JS for responsive).

### Mobile
- Sticky search/filter row collapses: search bar full-width on its own row; layer chips horizontally scrollable on second row with scroll-snap
- Pattern cards stack to 1 column under 480px container width (Container Queries)
- References section stacks compactly on narrow screens; each row remains tappable (≥ 44px tall)
- Mermaid diagrams: pinch-zoom enabled (existing MermaidDiagram lightbox)

### Search component spec
- **Algorithm:** prefix + substring match across `pattern.name`, `pattern.alternativeNames`, `pattern.oneLineSummary`, `pattern.layerId` label. Single function in `src/lib/pattern-search.ts`.
- **Behavior:** filters visible cards client-side; empty query shows all; no-results state shows "no patterns matched X" + clear-search button
- **Debouncing:** 150ms after last keystroke
- **URL state:** Layer chip state in `?layer=` (shareable). Search query NOT in URL state. SSR reads `?layer=` and renders filtered grid server-side.
- **Keyboard:** `/` focuses search (when focus isn't already in an input); `Esc` clears; `Tab` moves to first chip
- **Accessibility:** `<input type="search">` with `aria-label`; live region announces `n results`

### Internationalization
v1 English-only. `lang="en"` on the global `<html>`.

### Content licensing
The catalog cites public works. Each reference links to its canonical URL (publisher page, arxiv, vendor doc) — we do not host PDFs, do not reproduce diagrams, do not quote more than 2 sentences from any single source. Documented in `docs/agentic-design-patterns/LICENSE-NOTICE.md` (also covers the consultative use of Gulli's PDF for fact-checking — committed to repo for subagent reads).

## Build sequence

Project delivered via parallel agentic work, not a staged editorial calendar.

### Phase 1 — Scaffold + template + one proving pattern + agentic prerequisites

**Code & data scaffold:**
1. Create `src/data/agentic-design-patterns/` with `types.ts`, `layers.ts`, empty `index.ts`, and 23 stub `patterns/<slug>.ts` files (each: `oneLineSummary` + `layerId` + `topologySubtier` + empty arrays + `addedAt` + `dateModified`)
2. Create `src/data/agentic-design-patterns/README.md` documenting purpose + STYLE_PASS checklist
3. Build hub route + `<HubHero>`, `<HubGrid>`, `<HubSearchBar>`, `<PatternCard>` — renders all 23 cards (linking to satellite stubs); 5-layer organization with Topology sub-tier
4. Build satellite route + 8-slot template (`<PatternHeader>`, `<PatternBody>`, `<ReferencesSection>`, `<RelatedPatternsRow>`, `<PrevNextNav>`, `<LivingCatalogBadge>`)
5. Build `generatePatternArticleSchema()` + `generateHubChildBreadcrumb()` + reference→`ScholarlyArticle` mapper in `src/lib/schema/`
6. Wire sitemap entries and per-page metadata; set `dynamicParams: false` on the satellite route
7. **Author one pattern fully** (recommended: **Reflexion** — well-grounded foundational paper, exercises every slot including the References section). This is the template proof and editorial-voice anchor that every Phase-2 subagent reads before authoring.
8. Build the **`/agentic-design-patterns/changelog`** route — simple list of pattern adds/edits/retires with dates; Phase 1 ships an empty list, populated as patterns are added.

**Agentic-dispatch prerequisites:**

9. **Commit the source PDF** (Gulli's, for fact-checking only) to `docs/agentic-design-patterns/Agentic_Design_Patterns.pdf` with a `LICENSE-NOTICE.md` covering use. (Other sources are read by subagents via WebFetch/WebSearch on demand.)
10. **Write `docs/superpowers/specs/agentic-design-patterns-style-guide.md`** — voice rules (terse, diagnostic, second-person imperative for "When to use" bullets, third-person observational for prose), the 8 editorial principles, no-paraphrase rule with worked examples, mermaid security rules, References section formatting standard.
11. **Add `scripts/check-pattern-overlap.mjs`** as optional manual tool — word-level Jaccard between a pattern's `bodySummary` and named source materials, exempting proper nouns and chapter titles. Julian runs locally during PR review.
12. **Add `scripts/typecheck-sketches.ts`** — compiles every `Pattern.implementationSketch` against the relevant SDK types in a sandbox. **Skips patterns with `sdkAvailability === 'python-only'` or `'no-sdk'`** but enforces a banner-text check on those (the pseudocode banner must be present). Run as part of `npm run lint`. The single most important guardrail against fabricated TypeScript.
13. **Add `scripts/validate-references.ts`** — for every `Reference` with `type === 'paper'`, queries Crossref and OpenAlex APIs to verify the title + first-author surname + year actually correspond to the cited URL. Fails the build if any paper reference is unverifiable. **The teeth on the citation rigor claim** — a subagent cannot fabricate a plausible-looking citation and pass review. Run as part of `npm run lint`.
14. **Add `scripts/check-affiliate-links.mjs`** — scans every outbound URL across all pattern data for known affiliate query parameters (`tag=`, `ref=`, `aff=`, `linkCode=`, `?via=`, etc.). Fails build on any hit. Run as part of `npm run lint`.
15. **Hand-write 2 implementation sketches as Phase-0 spike** — A2A (`sdkAvailability: 'community-ts'`) and MCP (`'first-party-ts'`). Time the work. If a single sketch takes >45 min to produce something honest, the parallel-subagent plan is fiction and Phase 2 must be re-shaped (e.g., more pseudocode patterns, fewer compileable ones).
16. **Add `STYLE_PASS` checklist** to the `agentic-design-patterns/README.md`: every PR-author subagent checks off these items in PR body — same items Julian checks during review.

### Phase 2 — GitHub epic + 22 sub-issues, dispatched to subagents in waves

1. **Create GitHub epic** "Author all 23 agentic design pattern satellites" — pinned, lists all 22 remaining sub-issues, links: Phase-1 Reflexion exemplar, style guide, committed PDF, STYLE_PASS checklist, the 5-layer organization map.
2. **Create 22 sub-issues**, one per remaining pattern. Each uses the sub-issue template (below).
3. **Resolve cross-link dependencies first.** `relatedSlugs` build-fails if any target doesn't exist. Phase-1 stubs export with `relatedSlugs: []`; Phase-2 PRs populate `relatedSlugs` only after both ends exist (Julian enforces during review).
4. **Dispatch subagents in waves of 4-5 patterns** to keep PR review tractable. Wave order priority: foundational topology patterns first (others reference them).
5. **Julian reviews every PR** — standard workflow with Claude Code. Checks: slot completeness; voice match against Reflexion exemplar; `npm run lint` passes (typecheck-sketches included); mermaid renders; no prose drift toward source materials; cross-links resolve; references format correct; all outbound URLs return 200.
6. **If a PR fails review:** Julian comments specifics. Originating subagent (or fresh dispatch) re-attempts. No formal retry counter; if a pattern is intractable for the agent, Julian writes it himself.
7. **Final consistency pass** once all 23 are merged: Julian re-reads in sequence; fix cross-pattern drift in language or structure. Single-pass, single editor.

### Phase 3 — Polish and launch

- Hand-designed OG images for the most-shareable patterns (top 5)
- Analytics events wired (especially `reference_click`)
- Add the page to global site nav
- Launch push: HN Show, Lobste.rs, AI newsletters, social with thread linking the page

### Sub-issue template (for the GitHub epic)

```markdown
## Pattern: {NAME}

**Slug:** /agentic-design-patterns/{slug}
**Layer:** {LAYER} (sub-tier: {SINGLE_AGENT | MULTI_AGENT | n/a})

### Reference exemplar
The Reflexion satellite at `/agentic-design-patterns/reflexion` is the canonical template for tone, depth, structure, and References section formatting. Read it before authoring this pattern.

### Source materials to consult
- Foundational paper(s) for this pattern (named in initial brief)
- Anthropic's "Building Effective Agents" essay sections (if applicable)
- Relevant framework docs (LangGraph / AutoGen / etc. — named in brief)
- Gulli ch.N if applicable (read pages from `docs/agentic-design-patterns/Agentic_Design_Patterns.pdf`)
Use these to confirm conceptual accuracy. Do not paraphrase. See style guide for "good vs. bad paraphrase" examples.

### Slots to populate (edit `src/data/agentic-design-patterns/patterns/{slug}.ts`)
- `bodySummary: string[]` — 2-3 paragraphs (~300 words) in Detached Node voice
- `mermaidSource` + `mermaidAlt` — original Mermaid diagram (labeled boxes only — `securityLevel: 'strict'` rejects icon shortcodes); alt text for screen readers
- `whenToUse: string[]` — 3-5 bullets
- `whenNotToUse: string[]` — 2-3 bullets
- `realWorldExamples: { text, sourceUrl }[]` — 3 bullets, each citing a public observable system
- `implementationSketch: string` — ~15 lines TypeScript using Vercel AI SDK or relevant non-LangChain SDK. **Must compile** via `scripts/typecheck-sketches.ts`.
- `readerGotcha?: { text, sourceUrl }` — operational gotcha cited from a public source; **leave undefined rather than invent**
- `relatedSlugs: string[]` — 2-4 sibling patterns whose `patterns/<slug>.ts` is already populated (not stub)
- `references: Reference[]` — 3-7 references; each with title, url, authors, year, venue, type, optional note. **This is the page's primary authority signal — get it right.** Include foundational papers, key framework docs, and Gulli ch. N if applicable.
- `dateModified: string` — set to today

### STYLE_PASS checklist (paste into PR body, check each item)
- [ ] All required slots populated; types compile (`npm run typecheck`)
- [ ] `npm run lint` passes (includes implementation-sketch type-check)
- [ ] Read style guide; voice matches Reflexion exemplar
- [ ] No prose copied or paraphrased from any source (ran `scripts/check-pattern-overlap.mjs` if prose felt close)
- [ ] Mermaid diagram renders in `npm run dev` (visual check; alt text written)
- [ ] All outbound URLs in this PR return 200
- [ ] Cross-links in `relatedSlugs` resolve to populated patterns (not stubs)
- [ ] References section has 3-7 entries with authors, year, venue, URL, type
- [ ] Did NOT modify any other pattern's file
```

## Living catalog upkeep

This catalog is a living document. The mechanism that makes that real:

### Changelog (`src/data/agentic-design-patterns/changelog.ts`)

Single source-of-truth array. Each PR that touches `patterns/<slug>.ts` MUST add an entry. CI lint fails if a pattern PR doesn't include a corresponding changelog entry.

```ts
export type ChangelogEntryType = 'added' | 'edited' | 'retired'

export type ChangelogEntry = {
  date: string                // ISO date
  slug: string                // pattern slug touched
  type: ChangelogEntryType
  note: string                // 1-line description (mirrors pattern.lastChangeNote when type === 'edited')
  author: string              // PR author's GitHub handle
  prUrl?: string              // link to merged PR
}

export const CHANGELOG: ChangelogEntry[]  // sorted newest-first
```

Rendered at `/agentic-design-patterns/changelog` as a reverse-chronological list grouped by month.

### Mechanics

- **Adding a pattern**: open a sub-issue under the GitHub epic (stays open indefinitely). Author follows the standard sub-issue template. PR includes a changelog entry with `type: 'added'`. Sets `addedAt` to today.
- **Editing a pattern**: PR updates the pattern file. PR MUST: bump `dateModified`, set `lastChangeNote` to the same string used in the changelog entry, add a changelog entry with `type: 'edited'`. The hub's "Updated [month YYYY]" eyebrow auto-recomputes from `getCatalogDateModified()`.
- **Retiring a pattern**: set `archived: true` on the pattern file. The satellite renders a "Retired" notice with explanation. Hub grid excludes archived patterns. Sitemap excludes them on next regeneration. Changelog entry with `type: 'retired'` records the reason.
- **Reorganizing layers**: if the catalog grows past ~30 patterns and the 5-layer scheme strains, revisit in a dedicated brainstorm. The data model supports this — `layerId` is enum, can be extended; no migration penalty.

### CI enforcement

A small lint check (`scripts/lint-changelog.mjs`, runs as part of `npm run lint`) verifies:
- Any PR modifying a `patterns/<slug>.ts` file includes a matching `CHANGELOG` entry for that slug
- Each entry's `slug` resolves to an existing pattern (or a recently-archived one)
- Dates are ISO format
- Latest entry's date matches the most recent `pattern.dateModified` (catches the "forgot to bump" mistake)

### Why this matters

`dateModified` exposed in schema + UI + the visible changelog is the proof of life for the catalog. Google rewards demonstrably-updated reference pages; readers trust pages that show their work. Without these mechanics, "living catalog" is theatrical — with them, it's verifiable.

## Testing strategy

- **Unit tests** for `getPattern`, `getPatternsByLayer`, `getTopologyPatterns`, `getAdjacentPatterns`, `getCatalogDateModified`, `getCatalogPatternCount`; slug consistency (all slugs in data match URLs); reference URL format validation
- **Schema validation** — every page emits valid JSON-LD; `Article.citation` correctly maps each reference; Rich Results Test passes
- **Mermaid render smoke** — every `mermaidSource` parses without error
- **Implementation sketch type-check** — `scripts/typecheck-sketches.ts` runs as part of `npm run lint`; fails any sketch that doesn't compile
- **Playwright E2E** smoke per page type:
  - Hub: layer filter chips switch state, search returns expected hits
  - Satellite (one example): all 8 content slots render, References section renders, prev/next navigation works, mermaid renders
- **Link integrity** — every URL across all `pattern.references[].url`, `pattern.realWorldExamples[].sourceUrl`, `pattern.readerGotcha?.sourceUrl` returns 200; weekly scheduled `scripts/check-pattern-links.mjs` opens an issue on failure
- **Sitemap test** — verify all 24 URLs (hub + 23 satellites) present after build

## Out of scope for v1 (deliberate)

- Search across pattern *bodies* (only across names + summaries + alternative names)
- Filter dimensions beyond Layer (no maturity / use-case / framework filters)
- "Browse by problem" tertiary navigation (deferred to v2)
- Live pattern sandbox / interactive simulation
- Command palette (⌘K)
- Collapsible layer sections (deferred until usage data warrants)
- Per-pattern hand-designed OG images (auto for v1; hand-designed for top 5 in Phase 3)
- A/B comparison view between patterns (interesting but adds curation complexity)
- CMS migration of pattern data (only if editing convenience materially exceeds git-tracked authorship)
- Multi-language UI

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| **Voice inconsistency across 23 parallel-authored satellites** | Mandatory pre-authoring read of Phase-1 Reflexion exemplar; style guide at `docs/superpowers/specs/agentic-design-patterns-style-guide.md`; Julian reviews every PR; final cross-pattern consistency pass after all 23 are merged |
| **Subagent paraphrases a source** | Style guide includes worked good-vs-bad paraphrase examples; Julian eyeballs prose during PR review; `scripts/check-pattern-overlap.mjs` available as optional manual tool when prose feels close |
| **Subagent fabricates an `implementationSketch`** for patterns without canonical SDK shape (A2A, MCP, multi-agent) | `scripts/typecheck-sketches.ts` compiles every sketch against `@ai-sdk/openai`/equivalent types as part of `npm run lint`; Phase-0 spike hand-writes 2 sketches as calibration check before parallel dispatch |
| **Subagent fabricates a reference** (citing nonexistent paper) | `scripts/validate-references.ts` cross-checks every paper reference against Crossref + OpenAlex (title + first-author surname + year must match the URL). Runs as `npm run lint` gate. URL-200 check is necessary but insufficient — the validator is the actual teeth. |
| **Subagent fabricates TypeScript for a Python-only pattern** | `sdkAvailability` field forces honest declaration. `python-only`/`no-sdk` patterns use pseudocode with a mandatory banner; `typecheck-sketches.ts` enforces TS compilation only when `'first-party-ts'` or `'community-ts'` is declared. |
| **Subagent affiliate-links a citation** (e.g., Amazon URL with `tag=` parameter) | `scripts/check-affiliate-links.mjs` scans all outbound URLs for known affiliate query params; lint fails on any hit. |
| **Pattern citations duplicate across satellites with slight variations** (same paper, different titles/years) | Reference deduplication: a `references.lock.json` file tracks canonical `{ doi → reference }` entries. Lint warns if a new reference matches an existing canonical by DOI but with different metadata. |
| **Cold-start authority** — domain lacks backlinks to outrank Anthropic/LangChain | Launch push (HN, Lobste.rs, AI newsletters); rich citation graph in schema is itself a ranking signal; "field reference" framing positions us differently from any single competitor |
| **Mermaid `securityLevel: 'strict'` breaks diagrams using icon shortcodes** | Diagram standard: labeled boxes only. Code review enforces on every `mermaidSource` |
| **Subagent context dilution** — each subagent sees only its sub-issue, may miss cross-pattern references | Epic issue carries the shared style guide, exemplar link, "patterns already in flight" status table; build fails if any `relatedSlugs` target doesn't exist |
| **Living catalog upkeep falls off** | `dateModified` exposed in schema + UI; quarterly self-review reminder via cron; changelog page makes inactivity visible |
| **A pattern we picked turns out to be obsolete** | Built-in retire mechanism: `archived: true` + redirect notice; no need to re-architect |
| **Pattern naming wars** — "Evaluator-Optimizer" vs "Reflection" etc. | `pattern.alternativeNames` array surfaces synonyms; satellite header shows them; search matches across all names |

## Pre-launch checklist

**Content & build:**
1. [ ] All 23 satellites authored, reviewed, voice-passed
2. [ ] Phase-0 spike done: 2 hand-written `implementationSketch`es validated as honest TypeScript
3. [ ] Schema validates in Google Rich Results Test for hub + 3 random satellites; `Article.citation` correctly populated
4. [ ] All outbound URLs return 200 (manual verification + scheduled `check-pattern-links.mjs`)
5. [ ] No affiliate tags in any reference URL (lint rule + manual review)
6. [ ] Sitemap includes all 24 URLs (hub + 23 satellites)
7. [ ] Per-pattern OG images render correctly for hub + 5 random satellites
8. [ ] Mobile review on iPhone + Android
9. [ ] Lighthouse score ≥ 95 on hub and 3 random satellites
10. [ ] Changelog page populated with initial v1 patterns and `addedAt` dates

**Editorial integrity:**
11. [ ] References section on every satellite has 3-7 entries with authors + year + venue + URL + type
12. [ ] No fabricated references — spot-check 20 random references actually exist at the cited URL
13. [ ] No prose paraphrased from any source — random spot check via `check-pattern-overlap.mjs`
14. [ ] Implementation sketches all compile via `npm run lint`
15. [ ] Every `readerGotcha` cites a public source (none invented)
16. [ ] Pattern names are canonical; alternative names captured in `alternativeNames` field

**Site integration:**
17. [ ] Page added to global site nav
18. [ ] Hub footer "Sources & influences" panel renders with all major influences linked
19. [ ] Per-pattern footer author byline names Julian Ken
20. [ ] `dateModified` schema correctly inherits from `getCatalogDateModified()` on hub, `pattern.dateModified` on satellites
21. [ ] Reference dedup check passes (`references.lock.json` is consistent — no duplicate DOIs with different metadata across patterns)
22. [ ] No outbound affiliate-tagged URLs anywhere (`scripts/check-affiliate-links.mjs` clean)
23. [ ] Every reference validated against Crossref/OpenAlex (`scripts/validate-references.ts` clean)

## Success metrics (private — internal planning only)

These live in this spec for internal alignment. Not surfaced in any artifact.

- ≥ 200 unique outbound `reference_click` events in first 90 days (proxy for "did this catalog actually help readers reach source literature?")
- ≥ 50 unique referrers from non-search traffic in first 90 days (proxy for "is this getting shared / linked")
- Organic search visibility growth — measured via existing search-console pipeline; ranking thresholds not committed in writing
- A reference-author publicly engages with the page (any of: Anthropic engineers, paper authors, framework maintainers, Gulli) in first 180 days — strong signal that the citation rigor lands
