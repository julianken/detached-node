# Agentic Design Patterns — Field Reference Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the scaffold + one fully-authored "Reflexion" pattern at `/agentic-design-patterns`, ready to dispatch the remaining 22 patterns via parallel agentic sub-issues (Phase 2 in spec, not in this plan).

**Architecture:** Static Next.js routes (force-static, mirrors `/failure-modes` precedent). Per-pattern data files under `src/data/agentic-design-patterns/patterns/`. Five organizational layers (Topology / Quality / State / Interfaces / Methodology) with Topology sub-divided. Custom lint scripts as guardrails: `typecheck-sketches.ts` (TypeScript SDK enforcement), `validate-references.ts` (Crossref/OpenAlex citation validation), `check-affiliate-links.mjs`, `check-pattern-overlap.mjs`, `check-pattern-links.mjs`, `lint-changelog.mjs`. References section per satellite as primary E-E-A-T signal.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, Tailwind CSS 4, Mermaid (existing component), Vitest (unit), Playwright (e2e), `tsx` (script runner), Crossref/OpenAlex APIs (reference validation).

---

## File structure (locked here; tasks reference)

**Create:**

```
docs/agentic-design-patterns/
  Agentic_Design_Patterns.pdf            // Source for fact-checking only
  LICENSE-NOTICE.md                       // How we use the PDF

docs/superpowers/specs/
  agentic-design-patterns-style-guide.md  // Voice, attribution, mermaid rules

scripts/
  typecheck-sketches.ts                  // Compile every pattern.implementationSketch
  validate-references.ts                 // Crossref/OpenAlex check on paper refs
  check-affiliate-links.mjs              // No affiliate query params anywhere
  check-pattern-overlap.mjs              // Manual prose-similarity tool
  check-pattern-links.mjs                // Weekly URL 200 check
  lint-changelog.mjs                     // Every pattern PR has a changelog entry

src/data/agentic-design-patterns/
  README.md                              // Directory purpose + STYLE_PASS checklist
  types.ts                               // LayerId, Pattern, Reference, etc.
  layers.ts                              // LAYERS constant
  index.ts                               // Barrel + helpers
  changelog.ts                           // Append-only audit trail
  references.lock.json                   // Canonical reference dedup
  patterns/
    reflexion.ts                         // Phase 1 fully-authored exemplar
    prompt-chaining.ts ... (22 stubs)    // Authored in Phase 2

src/lib/
  pattern-search.ts                      // Client-side fuzzy match
  schema/
    agentic-patterns.ts                  // Article + citation schema generator

src/components/agentic-patterns/
  HubHero.tsx                            // Title band
  HubGrid.tsx                            // Server: 5 layer sections
  HubSearchBar.tsx                       // Client: '/'-keyed search
  PatternCard.tsx                        // Hub grid card
  PatternHeader.tsx                      // Satellite header
  PatternBody.tsx                        // 8-slot template
  ReferencesSection.tsx                  // Citation panel (the authority signal)
  RelatedPatternsRow.tsx                 // Cross-link chips
  PrevNextNav.tsx                        // Layer-scoped prev/next
  LivingCatalogBadge.tsx                 // "updated [date]" pill

src/app/(frontend)/agentic-design-patterns/
  page.tsx                               // Hub
  opengraph-image.tsx                    // Hub OG
  changelog/page.tsx                     // /agentic-design-patterns/changelog
  [slug]/
    page.tsx                             // Satellite
    opengraph-image.tsx                  // Per-pattern OG (dynamic)

tests/
  data/agentic-design-patterns/
    helpers.test.ts                      // getPattern, getPatternsByLayer, etc.
    pattern-search.test.ts
  lib/schema/
    agentic-patterns.test.ts
  e2e/agentic-design-patterns/
    hub.spec.ts                          // Filter chips, search, layer sections
    satellite.spec.ts                    // Reflexion page renders all 8 slots

.github/workflows/
  check-pattern-links.yml                // Weekly URL check
```

**Modify:**
- `src/lib/schema/breadcrumb.ts` — add `generateHubChildBreadcrumb()`
- `src/lib/site-config.ts` — add 3 keywords
- `src/app/sitemap.ts` — add 25 URLs (hub + 23 satellites + changelog)
- `src/app/(frontend)/layout.tsx` — add nav link (Phase 3)
- `package.json` — add 6 lint scripts to `scripts`

---

## PHASE 0 — Calibration spike

Before parallel-dispatch can be trusted, verify two of the hardest implementation sketches are actually authorable in honest TypeScript.

### Task 0.1: Hand-write the MCP implementation sketch

**Files:**
- Sketch lives in: `src/data/agentic-design-patterns/patterns/mcp.ts` (will be created in Task 1.4 as a stub; Phase 0 just produces the *snippet text* for later use)
- Scratch file: `docs/agentic-design-patterns/spike/mcp-sketch.ts`

- [ ] **Step 1: Create the scratch file with the snippet**

```bash
mkdir -p /Users/jul/repos/detached-node/docs/agentic-design-patterns/spike
```

Then write `/Users/jul/repos/detached-node/docs/agentic-design-patterns/spike/mcp-sketch.ts`:

```typescript
// MCP — Model Context Protocol pattern
// SDK: @modelcontextprotocol/sdk (first-party TypeScript)
// This snippet shows a minimal MCP server exposing one tool ("read_file")
// and a client that connects, lists tools, and invokes one.

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

const server = new Server(
  { name: 'fs-server', version: '0.1.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: 'read_file',
    description: 'Read a file from disk',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string' } },
      required: ['path'],
    },
  }],
}))

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  if (req.params.name === 'read_file') {
    const { readFile } = await import('node:fs/promises')
    const content = await readFile(req.params.arguments!.path as string, 'utf-8')
    return { content: [{ type: 'text', text: content }] }
  }
  throw new Error(`Unknown tool: ${req.params.name}`)
})

await server.connect(new StdioServerTransport())
```

- [ ] **Step 2: Time the work and validate**

Note start time. Manually compile the snippet by adding the SDK to a sandbox `package.json`:

```bash
cd /tmp && mkdir mcp-sketch-test && cd mcp-sketch-test
npm init -y
npm install @modelcontextprotocol/sdk typescript @types/node
cp /Users/jul/repos/detached-node/docs/agentic-design-patterns/spike/mcp-sketch.ts .
npx tsc --noEmit --moduleResolution bundler --module esnext --target es2022 mcp-sketch.ts
```

Expected: zero compile errors. If errors, iterate until clean.

- [ ] **Step 3: Record the timing**

Append to `/Users/jul/repos/detached-node/docs/agentic-design-patterns/spike/SPIKE_LOG.md`:

```markdown
# Phase 0 Calibration Spike Log

## MCP sketch
- Time to honest, compiling sketch: [N] minutes
- SDK availability: first-party-ts
- Notes: [any gotchas]
```

- [ ] **Step 4: Commit**

```bash
git -C /Users/jul/repos/detached-node add docs/agentic-design-patterns/spike/
git -C /Users/jul/repos/detached-node commit -m "spike(adp): MCP implementation sketch — compiles against @modelcontextprotocol/sdk"
```

---

### Task 0.2: Hand-write the A2A implementation sketch

**Files:**
- Scratch: `docs/agentic-design-patterns/spike/a2a-sketch.ts`

- [ ] **Step 1: Note start time, then write the sketch**

Write `/Users/jul/repos/detached-node/docs/agentic-design-patterns/spike/a2a-sketch.ts`:

```typescript
// A2A — Agent-to-Agent communication pattern
// SDK: community TypeScript clients exist; canonical spec is JSON-over-HTTP.
// This snippet uses fetch directly (always available) to discover an agent's
// capabilities via its Agent Card and post a task.

type AgentCard = {
  name: string
  description: string
  url: string
  capabilities: { skills: { id: string; description: string }[] }
}

type TaskRequest = { skillId: string; input: Record<string, unknown> }

async function discover(agentUrl: string): Promise<AgentCard> {
  const res = await fetch(`${agentUrl}/.well-known/agent.json`)
  if (!res.ok) throw new Error(`Agent discovery failed: ${res.status}`)
  return res.json() as Promise<AgentCard>
}

async function invoke(agentUrl: string, req: TaskRequest): Promise<unknown> {
  const res = await fetch(`${agentUrl}/tasks`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`Task failed: ${res.status} ${await res.text()}`)
  return res.json()
}

const card = await discover('https://research-agent.example.com')
const skill = card.capabilities.skills.find((s) => s.id === 'literature_search')
if (!skill) throw new Error('Required skill not advertised by agent')
const result = await invoke('https://research-agent.example.com', {
  skillId: 'literature_search',
  input: { query: 'agentic design patterns' },
})
console.log(result)
```

- [ ] **Step 2: Compile-check (no SDK needed; fetch is built-in)**

```bash
cd /tmp/mcp-sketch-test  # reuse sandbox
cp /Users/jul/repos/detached-node/docs/agentic-design-patterns/spike/a2a-sketch.ts .
npx tsc --noEmit --moduleResolution bundler --module esnext --target es2022 --lib es2022,dom a2a-sketch.ts
```

Expected: zero compile errors.

- [ ] **Step 3: Append timing to SPIKE_LOG.md**

```markdown
## A2A sketch
- Time to honest, compiling sketch: [N] minutes
- SDK availability: no-sdk (used fetch directly per A2A spec)
- Notes: [any gotchas]
```

- [ ] **Step 4: Commit**

```bash
git -C /Users/jul/repos/detached-node add docs/agentic-design-patterns/spike/
git -C /Users/jul/repos/detached-node commit -m "spike(adp): A2A implementation sketch — fetch-based against agent.json spec"
```

---

### Task 0.3: Decision check — proceed or restructure

- [ ] **Step 1: Compute total spike time**

Sum the two sketch times from `SPIKE_LOG.md`. Decision:
- If total ≤ 90 minutes (< 45 min/sketch average): Phase 2 parallel dispatch is realistic. Proceed.
- If total > 90 minutes: parallel-subagent plan is fiction for the harder patterns. Update spec to mark more patterns `sdkAvailability: 'python-only'` or `'no-sdk'`, accept pseudocode for those.

- [ ] **Step 2: Append decision to SPIKE_LOG.md**

```markdown
## Decision
- Total spike time: [N] minutes
- Phase 2 plan: [proceed as-spec'd | restructure with more pseudocode patterns]
- Patterns to mark non-compilable based on this spike: [list, if any]
```

- [ ] **Step 3: Commit and proceed to Phase 1**

```bash
git -C /Users/jul/repos/detached-node add docs/agentic-design-patterns/spike/SPIKE_LOG.md
git -C /Users/jul/repos/detached-node commit -m "spike(adp): Phase 0 decision — [proceed | restructure]"
```

---

## PHASE 1A — Type model + data scaffold

### Task 1.1: Commit the source PDF + license notice

**Files:**
- Create: `docs/agentic-design-patterns/Agentic_Design_Patterns.pdf`
- Create: `docs/agentic-design-patterns/LICENSE-NOTICE.md`

- [ ] **Step 1: Copy the PDF from /tmp**

```bash
cp /tmp/adp.pdf /Users/jul/repos/detached-node/docs/agentic-design-patterns/Agentic_Design_Patterns.pdf
```

- [ ] **Step 2: Write the LICENSE-NOTICE.md**

Create `/Users/jul/repos/detached-node/docs/agentic-design-patterns/LICENSE-NOTICE.md`:

```markdown
# License notice — Agentic Design Patterns PDF

This directory contains a committed copy of *Agentic Design Patterns: A
Hands-On Guide to Building Intelligent Systems* by Antonio Gulli (Springer,
2026, ISBN 9783032014016). The PDF is publicly distributed by the author at
https://github.com/AnkunHuang/Agentic_Design_Patterns and via the author's
canonical Google Doc.

## How we use this file

- **Fact-checking only.** Subagents authoring pattern satellites read pages
  from this PDF to confirm conceptual accuracy. They do not paraphrase or
  reproduce its text.
- **Not redistributed.** This copy is for repository convenience; readers
  are linked to canonical sources (Springer, Google Doc, the GitHub mirror
  maintained by @AnkunHuang).
- **Citation discipline.** Where we cite this work, we cite by chapter and
  page range; outbound links go to the canonical sources, never to a copy
  hosted on our own infrastructure.

## Other source materials

Other works cited (Anthropic essays, papers, framework docs) are read by
subagents via WebFetch on demand. We do not cache or redistribute them.
```

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add docs/agentic-design-patterns/
git -C /Users/jul/repos/detached-node commit -m "chore(adp): commit Gulli PDF + LICENSE-NOTICE for fact-checking use"
```

---

### Task 1.2: Create types.ts

**Files:**
- Create: `src/data/agentic-design-patterns/types.ts`
- Test: `tests/data/agentic-design-patterns/types.test.ts`

- [ ] **Step 1: Write the failing test**

Create `/Users/jul/repos/detached-node/tests/data/agentic-design-patterns/types.test.ts`:

```typescript
import { describe, it, expectTypeOf } from 'vitest'
import type {
  LayerId,
  TopologySubtier,
  Layer,
  Framework,
  ReferenceType,
  Reference,
  SdkAvailability,
  Pattern,
} from '@/data/agentic-design-patterns/types'

describe('agentic-design-patterns types', () => {
  it('LayerId is the 5-layer enum', () => {
    expectTypeOf<LayerId>().toEqualTypeOf<
      'topology' | 'quality' | 'state' | 'interfaces' | 'methodology'
    >()
  })

  it('TopologySubtier covers single/multi/undefined', () => {
    expectTypeOf<TopologySubtier>().toEqualTypeOf<
      'single-agent' | 'multi-agent' | undefined
    >()
  })

  it('SdkAvailability has 4 cases', () => {
    expectTypeOf<SdkAvailability>().toEqualTypeOf<
      'first-party-ts' | 'community-ts' | 'python-only' | 'no-sdk'
    >()
  })

  it('Reference has required + optional fields', () => {
    const r: Reference = {
      title: 'X', url: 'https://x', authors: 'A et al.',
      year: 2024, type: 'paper',
    }
    expectTypeOf(r).toMatchTypeOf<Reference>()
  })

  it('Pattern requires core fields', () => {
    expectTypeOf<Pattern>().toHaveProperty('slug')
    expectTypeOf<Pattern>().toHaveProperty('layerId')
    expectTypeOf<Pattern>().toHaveProperty('references')
    expectTypeOf<Pattern>().toHaveProperty('sdkAvailability')
    expectTypeOf<Pattern>().toHaveProperty('addedAt')
    expectTypeOf<Pattern>().toHaveProperty('dateModified')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/jul/repos/detached-node && npm run test:unit -- tests/data/agentic-design-patterns/types.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write the types module**

Create `/Users/jul/repos/detached-node/src/data/agentic-design-patterns/types.ts`:

```typescript
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
  title: string
  question: string
  description: string
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
  authors: string
  year: number
  venue?: string
  type: ReferenceType
  doi?: string
  pages?: [number, number]
  accessedAt?: string
  note?: string
}

export type SdkAvailability =
  | 'first-party-ts'
  | 'community-ts'
  | 'python-only'
  | 'no-sdk'

export type RealWorldExample = { text: string; sourceUrl: string }
export type ReaderGotcha = { text: string; sourceUrl: string }

export type Pattern = {
  slug: string
  name: string
  alternativeNames?: string[]
  layerId: LayerId
  secondaryLayerId?: LayerId
  topologySubtier?: TopologySubtier
  parentPatternSlug?: string
  oneLineSummary: string
  bodySummary: string[]
  mermaidSource: string
  mermaidAlt: string
  whenToUse: string[]
  whenNotToUse: string[]
  realWorldExamples: RealWorldExample[]
  implementationSketch: string
  sdkAvailability: SdkAvailability
  readerGotcha?: ReaderGotcha
  relatedSlugs: string[]
  frameworks: Framework[]
  references: Reference[]
  addedAt: string
  dateModified: string
  lastChangeNote?: string
  archived?: boolean
}
```

- [ ] **Step 4: Run test, expect pass**

```bash
npm run test:unit -- tests/data/agentic-design-patterns/types.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/data/agentic-design-patterns/types.ts tests/data/agentic-design-patterns/types.test.ts
git -C /Users/jul/repos/detached-node commit -m "feat(adp): type model — LayerId, Pattern, Reference"
```

---

### Task 1.3: Create layers.ts

**Files:**
- Create: `src/data/agentic-design-patterns/layers.ts`
- Test: `tests/data/agentic-design-patterns/layers.test.ts`

- [ ] **Step 1: Write the failing test**

Create `/Users/jul/repos/detached-node/tests/data/agentic-design-patterns/layers.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { LAYERS } from '@/data/agentic-design-patterns/layers'

describe('LAYERS', () => {
  it('has exactly 5 entries', () => {
    expect(LAYERS).toHaveLength(5)
  })

  it('numbers are 1..5 in order', () => {
    expect(LAYERS.map((l) => l.number)).toEqual([1, 2, 3, 4, 5])
  })

  it('ids match the LayerId union', () => {
    expect(LAYERS.map((l) => l.id)).toEqual([
      'topology', 'quality', 'state', 'interfaces', 'methodology',
    ])
  })

  it('every layer has a non-empty question and description', () => {
    for (const l of LAYERS) {
      expect(l.question.length).toBeGreaterThan(5)
      expect(l.description.length).toBeGreaterThan(10)
      expect(l.title.length).toBeGreaterThan(3)
    }
  })
})
```

- [ ] **Step 2: Run test to verify failure**

```bash
npm run test:unit -- tests/data/agentic-design-patterns/layers.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write layers.ts**

Create `/Users/jul/repos/detached-node/src/data/agentic-design-patterns/layers.ts`:

```typescript
import type { Layer } from './types'

export const LAYERS: Layer[] = [
  {
    id: 'topology',
    number: 1,
    title: 'Topology / Control Flow',
    question: 'How should my calls flow?',
    description: 'Patterns governing how LLM calls compose: chains, branches, fans, loops, and multi-agent coordination.',
  },
  {
    id: 'quality',
    number: 2,
    title: 'Quality & Control Gates',
    question: 'How do I keep it from going wrong?',
    description: 'Patterns that wrap or interrupt the topology to enforce safety, oversight, and measurable correctness.',
  },
  {
    id: 'state',
    number: 3,
    title: 'State & Context',
    question: 'What should I remember and how?',
    description: 'Patterns governing what persists across turns, sessions, and runs — and how it gets curated.',
  },
  {
    id: 'interfaces',
    number: 4,
    title: 'Interfaces & Transport',
    question: 'How do other systems talk to me?',
    description: 'Protocols and transport patterns that define how agents communicate with tools, peers, and clients.',
  },
  {
    id: 'methodology',
    number: 5,
    title: 'Methodology',
    question: 'How should my code be structured?',
    description: 'Engineering practices for building agents that survive contact with production.',
  },
]
```

- [ ] **Step 4: Run test, expect pass**

```bash
npm run test:unit -- tests/data/agentic-design-patterns/layers.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/data/agentic-design-patterns/layers.ts tests/data/agentic-design-patterns/layers.test.ts
git -C /Users/jul/repos/detached-node commit -m "feat(adp): LAYERS constant — 5 organizational layers"
```

---

### Task 1.4: Create 23 stub pattern files

**Files:**
- Create: `src/data/agentic-design-patterns/patterns/<slug>.ts` × 23

The 23 slugs (matches the spec):
`prompt-chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer, tool-use-react, code-agent, planning, reflexion, rag, agentic-rag, memory-management, context-engineering, multi-agent-debate, handoffs-swarm, a2a, mcp, human-in-the-loop, guardrails, evaluation-llm-as-judge, streaming, checkpointing, 12-factor-agent`

- [ ] **Step 1: Write a stub generator script (one-shot)**

Create `/Users/jul/repos/detached-node/scripts/scaffold-pattern-stubs.mjs`:

```javascript
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const TODAY = new Date().toISOString().slice(0, 10)

const STUBS = [
  // [slug, name, layerId, topologySubtier, oneLineSummary, sdkAvailability]
  ['prompt-chaining', 'Prompt Chaining', 'topology', 'single-agent', 'Decompose a task into ordered LLM calls; output of N feeds N+1.', 'first-party-ts'],
  ['routing', 'Routing', 'topology', 'single-agent', 'Classify input and dispatch to the right specialist handler.', 'first-party-ts'],
  ['parallelization', 'Parallelization', 'topology', 'single-agent', 'Fan out concurrent LLM calls and merge or vote on the results.', 'first-party-ts'],
  ['orchestrator-workers', 'Orchestrator-Workers', 'topology', 'multi-agent', 'A central LLM dynamically delegates subtasks to worker LLMs.', 'first-party-ts'],
  ['evaluator-optimizer', 'Evaluator-Optimizer', 'topology', 'single-agent', 'Generator + critic loop; iterate until acceptance criteria pass.', 'first-party-ts'],
  ['tool-use-react', 'Tool Use / ReAct', 'topology', 'single-agent', 'LLM iteratively calls tools and observes results until done.', 'first-party-ts'],
  ['code-agent', 'Code Agent', 'topology', 'single-agent', "The agent's actions are executable code rather than JSON tool calls.", 'community-ts'],
  ['planning', 'Planning', 'topology', 'single-agent', 'Emit a plan of steps before executing actions.', 'first-party-ts'],
  ['reflexion', 'Reflexion', 'topology', 'single-agent', 'Agent writes self-critiques into memory to improve next attempts.', 'first-party-ts'],
  ['rag', 'RAG', 'topology', 'single-agent', 'Retrieve passages from an external corpus to ground generation.', 'first-party-ts'],
  ['agentic-rag', 'Agentic RAG', 'topology', 'single-agent', 'Agent loop that decides retrieval strategy and validates evidence.', 'first-party-ts'],
  ['memory-management', 'Memory Management', 'state', undefined, 'Persist context across turns, sessions, and runs.', 'first-party-ts'],
  ['context-engineering', 'Context Engineering', 'state', undefined, 'Curate the context window via Write/Select/Compress/Isolate.', 'no-sdk'],
  ['multi-agent-debate', 'Multi-Agent Debate', 'topology', 'multi-agent', 'Multiple agents propose answers and critique each other across rounds.', 'community-ts'],
  ['handoffs-swarm', 'Handoffs / Swarm', 'topology', 'multi-agent', 'An agent transfers active control of the conversation to a peer.', 'first-party-ts'],
  ['a2a', 'A2A', 'interfaces', undefined, 'Agent-to-agent communication protocol with capability discovery.', 'no-sdk'],
  ['mcp', 'MCP', 'interfaces', undefined, 'Model Context Protocol — standardized tool surface for any LLM client.', 'first-party-ts'],
  ['human-in-the-loop', 'Human-in-the-Loop', 'quality', undefined, 'Pause for human review or approval at defined checkpoints.', 'first-party-ts'],
  ['guardrails', 'Guardrails / Safety', 'quality', undefined, 'Validation rules that block or rewrite unsafe inputs and outputs.', 'first-party-ts'],
  ['evaluation-llm-as-judge', 'Evaluation / LLM-as-Judge', 'quality', undefined, 'LLM-with-rubric scoring at scale, validated against human labels.', 'first-party-ts'],
  ['streaming', 'Streaming', 'interfaces', undefined, 'Stream tokens, events, or step traces in real time.', 'first-party-ts'],
  ['checkpointing', 'Checkpointing / Durable Execution', 'state', undefined, 'Persist intermediate state so a long agent run can resume.', 'first-party-ts'],
  ['12-factor-agent', '12-Factor Agent Stance', 'methodology', undefined, 'Operational discipline: stateless reducers, small focused agents.', 'no-sdk'],
]

const PATTERNS_DIR = '/Users/jul/repos/detached-node/src/data/agentic-design-patterns/patterns'
mkdirSync(PATTERNS_DIR, { recursive: true })

for (const [slug, name, layerId, subtier, summary, sdkAvail] of STUBS) {
  const path = join(PATTERNS_DIR, `${slug}.ts`)
  if (existsSync(path)) {
    console.log(`SKIP ${slug} (exists)`)
    continue
  }
  const content = `import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: '${slug}',
  name: '${name}',
  layerId: '${layerId}',
  ${subtier ? `topologySubtier: '${subtier}',` : ''}
  oneLineSummary: ${JSON.stringify(summary)},
  bodySummary: [],
  mermaidSource: '',
  mermaidAlt: '',
  whenToUse: [],
  whenNotToUse: [],
  realWorldExamples: [],
  implementationSketch: '',
  sdkAvailability: '${sdkAvail}',
  relatedSlugs: [],
  frameworks: [],
  references: [],
  addedAt: '${TODAY}',
  dateModified: '${TODAY}',
}
`
  writeFileSync(path, content)
  console.log(`CREATE ${slug}`)
}
console.log(`\nDone. ${STUBS.length} patterns processed.`)
```

- [ ] **Step 2: Run the scaffold script**

```bash
cd /Users/jul/repos/detached-node && npx tsx scripts/scaffold-pattern-stubs.mjs
```

Expected: 23 lines of `CREATE <slug>` output.

- [ ] **Step 3: Verify file count**

```bash
ls /Users/jul/repos/detached-node/src/data/agentic-design-patterns/patterns/ | wc -l
```

Expected: `23`.

- [ ] **Step 4: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/data/agentic-design-patterns/patterns/ scripts/scaffold-pattern-stubs.mjs
git -C /Users/jul/repos/detached-node commit -m "feat(adp): 23 pattern stubs scaffolded"
```

---

### Task 1.5: Create barrel + helpers (index.ts)

**Files:**
- Create: `src/data/agentic-design-patterns/index.ts`
- Test: `tests/data/agentic-design-patterns/helpers.test.ts`

- [ ] **Step 1: Write the failing test**

Create `/Users/jul/repos/detached-node/tests/data/agentic-design-patterns/helpers.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  PATTERNS,
  LAYERS,
  getPattern,
  getPatternsByLayer,
  getTopologyPatterns,
  getPatternSlugs,
  getAdjacentPatterns,
  getCatalogDateModified,
  getCatalogPatternCount,
} from '@/data/agentic-design-patterns'

describe('catalog helpers', () => {
  it('PATTERNS has 23 entries', () => {
    expect(PATTERNS.length).toBe(23)
  })

  it('LAYERS has 5 entries', () => {
    expect(LAYERS.length).toBe(5)
  })

  it('every pattern has a unique slug', () => {
    const slugs = PATTERNS.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every pattern slug equals its filename root', () => {
    // implicit by import — the test just verifies all slugs are kebab-case
    for (const p of PATTERNS) {
      expect(p.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    }
  })

  it('every pattern.layerId resolves to a known layer', () => {
    const layerIds = new Set(LAYERS.map((l) => l.id))
    for (const p of PATTERNS) expect(layerIds.has(p.layerId)).toBe(true)
  })

  it('topology layer has exactly 13 patterns (10 single + 3 multi)', () => {
    const topo = getPatternsByLayer('topology')
    expect(topo).toHaveLength(13)
    expect(getTopologyPatterns('single-agent')).toHaveLength(10)
    expect(getTopologyPatterns('multi-agent')).toHaveLength(3)
  })

  it('every pattern.oneLineSummary is ≤ 90 chars', () => {
    for (const p of PATTERNS) {
      expect(p.oneLineSummary.length, `${p.slug} too long`).toBeLessThanOrEqual(90)
    }
  })

  it('relatedSlugs all resolve to existing patterns', () => {
    const slugs = new Set(PATTERNS.map((p) => p.slug))
    for (const p of PATTERNS) {
      for (const rs of p.relatedSlugs) {
        expect(slugs.has(rs), `${p.slug} -> unknown ${rs}`).toBe(true)
      }
    }
  })

  it('getPattern returns the pattern or undefined', () => {
    expect(getPattern('reflexion')?.slug).toBe('reflexion')
    expect(getPattern('not-a-pattern')).toBeUndefined()
  })

  it('getPatternSlugs returns all 23', () => {
    expect(getPatternSlugs()).toHaveLength(23)
  })

  it('getAdjacentPatterns returns prev/next within layer (or layer-tier for topology)', () => {
    const adj = getAdjacentPatterns('routing')
    // Routing is in topology/single-agent; prev/next should be in same tier
    expect(adj.prev).toBeDefined()
    expect(adj.next).toBeDefined()
  })

  it('getCatalogDateModified returns the most recent date', () => {
    const max = PATTERNS.reduce((acc, p) => (p.dateModified > acc ? p.dateModified : acc), '0')
    expect(getCatalogDateModified()).toBe(max)
  })

  it('getCatalogPatternCount excludes archived', () => {
    const active = PATTERNS.filter((p) => !p.archived).length
    expect(getCatalogPatternCount()).toBe(active)
  })
})
```

- [ ] **Step 2: Run test to verify failure**

```bash
npm run test:unit -- tests/data/agentic-design-patterns/helpers.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write the barrel**

Create `/Users/jul/repos/detached-node/src/data/agentic-design-patterns/index.ts`:

```typescript
import type { Pattern, LayerId, TopologySubtier } from './types'

// Stub list — every pattern stub registers itself here. Order follows the
// 5-layer organization (topology single → topology multi → quality → state →
// interfaces → methodology).
import { pattern as promptChaining } from './patterns/prompt-chaining'
import { pattern as routing } from './patterns/routing'
import { pattern as parallelization } from './patterns/parallelization'
import { pattern as planning } from './patterns/planning'
import { pattern as toolUseReact } from './patterns/tool-use-react'
import { pattern as codeAgent } from './patterns/code-agent'
import { pattern as evaluatorOptimizer } from './patterns/evaluator-optimizer'
import { pattern as rag } from './patterns/rag'
import { pattern as agenticRag } from './patterns/agentic-rag'
import { pattern as reflexion } from './patterns/reflexion'
import { pattern as orchestratorWorkers } from './patterns/orchestrator-workers'
import { pattern as multiAgentDebate } from './patterns/multi-agent-debate'
import { pattern as handoffsSwarm } from './patterns/handoffs-swarm'
import { pattern as guardrails } from './patterns/guardrails'
import { pattern as humanInTheLoop } from './patterns/human-in-the-loop'
import { pattern as evaluationLlmAsJudge } from './patterns/evaluation-llm-as-judge'
import { pattern as memoryManagement } from './patterns/memory-management'
import { pattern as contextEngineering } from './patterns/context-engineering'
import { pattern as checkpointing } from './patterns/checkpointing'
import { pattern as mcp } from './patterns/mcp'
import { pattern as a2a } from './patterns/a2a'
import { pattern as streaming } from './patterns/streaming'
import { pattern as twelveFactorAgent } from './patterns/12-factor-agent'

export { LAYERS } from './layers'
export type * from './types'

export const PATTERNS: Pattern[] = [
  // Layer 1 — Topology (Single-agent)
  promptChaining, routing, parallelization, planning, toolUseReact,
  codeAgent, evaluatorOptimizer, rag, agenticRag, reflexion,
  // Layer 1 — Topology (Multi-agent)
  orchestratorWorkers, multiAgentDebate, handoffsSwarm,
  // Layer 2 — Quality
  guardrails, humanInTheLoop, evaluationLlmAsJudge,
  // Layer 3 — State
  memoryManagement, contextEngineering, checkpointing,
  // Layer 4 — Interfaces
  mcp, a2a, streaming,
  // Layer 5 — Methodology
  twelveFactorAgent,
]

export function getPattern(slug: string): Pattern | undefined {
  return PATTERNS.find((p) => p.slug === slug)
}

export function getPatternsByLayer(layerId: LayerId): Pattern[] {
  return PATTERNS.filter((p) => !p.archived && p.layerId === layerId)
}

export function getTopologyPatterns(subtier: TopologySubtier): Pattern[] {
  return getPatternsByLayer('topology').filter((p) => p.topologySubtier === subtier)
}

export function getPatternSlugs(): string[] {
  return PATTERNS.filter((p) => !p.archived).map((p) => p.slug)
}

export function getAdjacentPatterns(slug: string): {
  prev: Pattern | null
  next: Pattern | null
} {
  const target = getPattern(slug)
  if (!target) return { prev: null, next: null }
  // Adjacency within the same layer; topology uses sub-tier as additional filter
  const peers = target.layerId === 'topology'
    ? getTopologyPatterns(target.topologySubtier)
    : getPatternsByLayer(target.layerId)
  const i = peers.findIndex((p) => p.slug === slug)
  return {
    prev: i > 0 ? peers[i - 1] : null,
    next: i < peers.length - 1 ? peers[i + 1] : null,
  }
}

export function getCatalogDateModified(): string {
  return PATTERNS.reduce(
    (acc, p) => (p.dateModified > acc ? p.dateModified : acc),
    '0',
  )
}

export function getCatalogPatternCount(): number {
  return PATTERNS.filter((p) => !p.archived).length
}
```

- [ ] **Step 4: Run test, expect pass**

```bash
npm run test:unit -- tests/data/agentic-design-patterns/helpers.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/data/agentic-design-patterns/index.ts tests/data/agentic-design-patterns/helpers.test.ts
git -C /Users/jul/repos/detached-node commit -m "feat(adp): barrel + helpers (getPattern, getPatternsByLayer, etc.)"
```

---

### Task 1.6: Create changelog.ts + initial entries

**Files:**
- Create: `src/data/agentic-design-patterns/changelog.ts`

- [ ] **Step 1: Write the changelog with initial Phase-1 entries**

Create `/Users/jul/repos/detached-node/src/data/agentic-design-patterns/changelog.ts`:

```typescript
export type ChangelogEntryType = 'added' | 'edited' | 'retired'

export type ChangelogEntry = {
  date: string
  slug: string
  type: ChangelogEntryType
  note: string
  author: string
  prUrl?: string
}

// Sorted newest-first.
export const CHANGELOG: ChangelogEntry[] = [
  // Phase 1 catalog launch — Reflexion exemplar.
  // Other patterns added in Phase 2 will append entries here.
  {
    date: '2026-05-02',
    slug: 'reflexion',
    type: 'added',
    note: 'Initial catalog launch — Reflexion authored as the editorial voice exemplar.',
    author: 'julianken',
  },
]
```

- [ ] **Step 2: Add a quick test**

Create `/Users/jul/repos/detached-node/tests/data/agentic-design-patterns/changelog.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { CHANGELOG } from '@/data/agentic-design-patterns/changelog'
import { getPatternSlugs } from '@/data/agentic-design-patterns'

describe('CHANGELOG', () => {
  it('is sorted newest-first', () => {
    for (let i = 1; i < CHANGELOG.length; i++) {
      expect(CHANGELOG[i - 1].date >= CHANGELOG[i].date).toBe(true)
    }
  })

  it('every entry slug resolves to an existing (or recently-archived) pattern', () => {
    const slugs = new Set(getPatternSlugs())
    // For now, just check known slugs exist; archived support added later
    for (const e of CHANGELOG) {
      expect(slugs.has(e.slug)).toBe(true)
    }
  })

  it('every date is ISO format', () => {
    for (const e of CHANGELOG) {
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})
```

- [ ] **Step 3: Run tests, expect pass**

```bash
npm run test:unit -- tests/data/agentic-design-patterns/changelog.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/data/agentic-design-patterns/changelog.ts tests/data/agentic-design-patterns/changelog.test.ts
git -C /Users/jul/repos/detached-node commit -m "feat(adp): CHANGELOG with initial Reflexion-launch entry"
```

---

### Task 1.7: Create references.lock.json + README

**Files:**
- Create: `src/data/agentic-design-patterns/references.lock.json`
- Create: `src/data/agentic-design-patterns/README.md`

- [ ] **Step 1: Write the empty lock file**

Create `/Users/jul/repos/detached-node/src/data/agentic-design-patterns/references.lock.json`:

```json
{
  "version": 1,
  "doiToReference": {}
}
```

This file gets populated as Phase 2 PRs add references with DOIs.

- [ ] **Step 2: Write the README**

Create `/Users/jul/repos/detached-node/src/data/agentic-design-patterns/README.md`:

```markdown
# `src/data/agentic-design-patterns/`

Curated, version-controlled, type-safe content for the static
`/agentic-design-patterns` reference. One file per pattern slug to enable
parallel agentic dispatch (PRs don't conflict). Barrel `index.ts` is the
public API surface — only consumers should import from there.

## Files

- `types.ts` — `LayerId`, `Pattern`, `Reference`, etc.
- `layers.ts` — the 5 organizational layers
- `patterns/<slug>.ts` — one file per pattern; named export `pattern: Pattern`
- `index.ts` — barrel + helpers (`getPattern`, `getPatternsByLayer`, ...)
- `changelog.ts` — append-only audit trail
- `references.lock.json` — canonical reference dedup (DOI → reference)

## Adding a new pattern

1. Open a sub-issue under the GitHub epic
2. Create `patterns/<slug>.ts` with the named export
3. Add the import + entry to `index.ts` PATTERNS array (in correct layer order)
4. Add a CHANGELOG entry with `type: 'added'`
5. Run `npm run lint` — must pass `typecheck-sketches`, `validate-references`,
   `check-affiliate-links`, and `lint-changelog`

## Editing an existing pattern

1. Edit `patterns/<slug>.ts`
2. Bump `dateModified` to today
3. Set `lastChangeNote` to a 1-line description
4. Add a CHANGELOG entry with `type: 'edited'`
5. Run `npm run lint`

## Retiring a pattern

1. Set `archived: true` on the pattern
2. Add a CHANGELOG entry with `type: 'retired'` and the reason
3. Verify it's excluded from hub grid + sitemap (helpers filter on `archived`)

## STYLE_PASS checklist

Every PR that adds or edits a pattern MUST tick all of:

- [ ] All required slots populated; types compile (`npm run typecheck`)
- [ ] `npm run lint` passes (typecheck-sketches, validate-references,
      check-affiliate-links, lint-changelog)
- [ ] Voice matches the Reflexion exemplar
- [ ] No prose copied or paraphrased from any source
- [ ] Mermaid diagram renders in `npm run dev`; alt text written
- [ ] All outbound URLs return 200
- [ ] Cross-links in `relatedSlugs` resolve to populated patterns (not stubs)
- [ ] References section has 3-7 entries with authors, year, venue, URL, type;
      papers include DOI
- [ ] Did NOT modify any other pattern's file (single-file PRs only in Phase 2)

## Kill switch / takedown

The page is gated behind the `AGENTIC_DESIGN_PATTERNS_PUBLIC` env var
(default `false`). Routes return `notFound()` and emit `noindex` when off.
To respond to a takedown request, flip the var to `false` — this is
immediate and reversible.
```

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/data/agentic-design-patterns/references.lock.json src/data/agentic-design-patterns/README.md
git -C /Users/jul/repos/detached-node commit -m "docs(adp): README + empty references.lock.json"
```

---

## PHASE 1B — Lint scripts (the guardrails)

### Task 1.8: scripts/typecheck-sketches.ts

**Files:**
- Create: `scripts/typecheck-sketches.ts`

- [ ] **Step 1: Write the script**

Create `/Users/jul/repos/detached-node/scripts/typecheck-sketches.ts`:

```typescript
#!/usr/bin/env tsx
/**
 * typecheck-sketches.ts
 *
 * For every Pattern with sdkAvailability ∈ {'first-party-ts', 'community-ts'}:
 *   - extracts implementationSketch
 *   - writes it to a temp .ts file
 *   - compiles with `tsc --noEmit` against installed @ai-sdk/* + SDK packages
 *
 * For 'python-only' / 'no-sdk' patterns:
 *   - verifies a banner string is present in the sketch
 *
 * Exits non-zero on any failure. Run as part of `npm run lint`.
 */
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'
import { PATTERNS } from '../src/data/agentic-design-patterns'

const PSEUDO_BANNER = "canonical SDKs are Python"

let failed = 0
const dir = mkdtempSync(join(tmpdir(), 'sketch-check-'))

for (const p of PATTERNS) {
  const sketch = p.implementationSketch.trim()
  if (sketch === '') continue // stub patterns skipped

  if (p.sdkAvailability === 'python-only' || p.sdkAvailability === 'no-sdk') {
    if (!sketch.includes(PSEUDO_BANNER)) {
      console.error(`✗ ${p.slug}: pseudocode sketch missing banner "${PSEUDO_BANNER}"`)
      failed++
    }
    continue
  }

  // first-party-ts / community-ts — must compile
  const file = join(dir, `${p.slug}.ts`)
  writeFileSync(file, sketch)
  try {
    execSync(
      `npx tsc --noEmit --moduleResolution bundler --module esnext --target es2022 --lib es2022,dom --skipLibCheck --strict ${file}`,
      { cwd: '/Users/jul/repos/detached-node', stdio: 'pipe' },
    )
    console.log(`✓ ${p.slug}`)
  } catch (err) {
    const e = err as { stdout?: Buffer; stderr?: Buffer }
    console.error(`✗ ${p.slug}: TypeScript compile failed`)
    console.error((e.stdout ?? Buffer.from('')).toString())
    console.error((e.stderr ?? Buffer.from('')).toString())
    failed++
  }
}

rmSync(dir, { recursive: true, force: true })
if (failed > 0) {
  console.error(`\n${failed} pattern(s) failed sketch check.`)
  process.exit(1)
}
console.log(`\nAll non-empty sketches passed.`)
```

- [ ] **Step 2: Run it (should pass with all stubs empty)**

```bash
cd /Users/jul/repos/detached-node && npx tsx scripts/typecheck-sketches.ts
```

Expected: `All non-empty sketches passed.`

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add scripts/typecheck-sketches.ts
git -C /Users/jul/repos/detached-node commit -m "build(adp): typecheck-sketches.ts — TypeScript compilation gate for sketches"
```

---

### Task 1.9: scripts/validate-references.ts (Crossref/OpenAlex)

**Files:**
- Create: `scripts/validate-references.ts`

- [ ] **Step 1: Write the script**

Create `/Users/jul/repos/detached-node/scripts/validate-references.ts`:

```typescript
#!/usr/bin/env tsx
/**
 * validate-references.ts
 *
 * For every Pattern.references[] with type === 'paper':
 *   - if doi is set: query Crossref, verify title fuzzy-matches + year matches
 *   - if doi unset but URL is arxiv: query OpenAlex by URL, verify
 *   - first-author surname must appear in the API response's author list
 *
 * Exits non-zero on any reference that doesn't validate.
 * Skipped: type !== 'paper' (essay/docs/book/spec — URL-200 check covers those).
 */
import { PATTERNS } from '../src/data/agentic-design-patterns'

type CrossrefMessage = {
  title: string[]
  'published-print'?: { 'date-parts': number[][] }
  'published-online'?: { 'date-parts': number[][] }
  author?: { family: string; given: string }[]
}

async function fetchCrossref(doi: string): Promise<CrossrefMessage> {
  const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
    headers: { 'User-Agent': 'detached-node/agentic-patterns-validator (https://detached-node.com)' },
  })
  if (!res.ok) throw new Error(`Crossref ${res.status} for ${doi}`)
  const json = await res.json() as { message: CrossrefMessage }
  return json.message
}

async function fetchOpenAlexByDoi(doi: string) {
  const res = await fetch(`https://api.openalex.org/works/doi:${doi}`)
  if (!res.ok) throw new Error(`OpenAlex ${res.status} for ${doi}`)
  return res.json() as Promise<{ title: string; publication_year: number; authorships: { author: { display_name: string } }[] }>
}

function fuzzyTitleMatch(a: string, b: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()
  return norm(a).includes(norm(b).slice(0, 20)) || norm(b).includes(norm(a).slice(0, 20))
}

function firstAuthorSurname(authorsField: string): string {
  // "Shinn et al." -> "Shinn" ; "Antonio Gulli" -> "Gulli"
  const cleaned = authorsField.replace(/ et al\.?$/i, '').trim()
  const parts = cleaned.split(/\s+/)
  return parts[parts.length - 1] // last word = surname
}

let failed = 0
let checked = 0

for (const p of PATTERNS) {
  for (const ref of p.references) {
    if (ref.type !== 'paper') continue
    checked++
    try {
      if (!ref.doi) {
        console.warn(`! ${p.slug} → "${ref.title}": no DOI; skipping (consider adding)`)
        continue
      }
      const cr = await fetchCrossref(ref.doi)
      const apiTitle = cr.title?.[0] ?? ''
      const apiYear = cr['published-print']?.['date-parts']?.[0]?.[0]
        ?? cr['published-online']?.['date-parts']?.[0]?.[0]
      const apiSurnames = (cr.author ?? []).map((a) => a.family.toLowerCase())
      const surname = firstAuthorSurname(ref.authors).toLowerCase()

      if (!fuzzyTitleMatch(apiTitle, ref.title)) {
        throw new Error(`title mismatch: cited "${ref.title}" vs Crossref "${apiTitle}"`)
      }
      if (apiYear !== ref.year) {
        throw new Error(`year mismatch: cited ${ref.year} vs Crossref ${apiYear}`)
      }
      if (!apiSurnames.includes(surname)) {
        throw new Error(`first-author surname "${surname}" not in Crossref authors [${apiSurnames.join(', ')}]`)
      }
      console.log(`✓ ${p.slug} → ${ref.doi}`)
    } catch (err) {
      console.error(`✗ ${p.slug} → "${ref.title}": ${(err as Error).message}`)
      failed++
    }
  }
}

console.log(`\nChecked ${checked} paper reference(s); ${failed} failed.`)
if (failed > 0) process.exit(1)
```

- [ ] **Step 2: Run it (should pass — no paper references yet)**

```bash
cd /Users/jul/repos/detached-node && npx tsx scripts/validate-references.ts
```

Expected: `Checked 0 paper reference(s); 0 failed.`

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add scripts/validate-references.ts
git -C /Users/jul/repos/detached-node commit -m "build(adp): validate-references.ts — Crossref check for paper citations"
```

---

### Task 1.10: scripts/check-affiliate-links.mjs

**Files:**
- Create: `scripts/check-affiliate-links.mjs`

- [ ] **Step 1: Write the script**

Create `/Users/jul/repos/detached-node/scripts/check-affiliate-links.mjs`:

```javascript
#!/usr/bin/env node
/**
 * check-affiliate-links.mjs
 *
 * Scans every outbound URL in Pattern data for known affiliate query params.
 * Fails the build on any hit.
 */
import { PATTERNS } from '../src/data/agentic-design-patterns/index.js'

const AFFILIATE_PARAMS = [
  'tag', 'ref', 'aff', 'linkCode', 'via', 'partner', 'affiliate',
  'affid', 'aff_id', 'partnerid', 'utm_source_aff',
]

function hasAffiliate(url) {
  try {
    const u = new URL(url)
    for (const p of AFFILIATE_PARAMS) {
      if (u.searchParams.has(p)) return p
    }
  } catch {
    return null
  }
  return null
}

let failed = 0
for (const p of PATTERNS) {
  const urls = [
    ...p.references.map((r) => r.url),
    ...p.realWorldExamples.map((e) => e.sourceUrl),
    ...(p.readerGotcha ? [p.readerGotcha.sourceUrl] : []),
  ]
  for (const url of urls) {
    const param = hasAffiliate(url)
    if (param) {
      console.error(`✗ ${p.slug} → ${url} contains affiliate param "${param}"`)
      failed++
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} affiliate-tagged URL(s) found. Strip the affiliate params.`)
  process.exit(1)
}
console.log('No affiliate-tagged URLs found.')
```

Note: this requires `index.js` ESM import. Since our barrel is `.ts`, we'll wrap in tsx-compatible:

Actually, simpler — rewrite as `.ts`:

- [ ] **Step 1 (corrected): Rewrite as TypeScript**

Replace with `/Users/jul/repos/detached-node/scripts/check-affiliate-links.ts`:

```typescript
#!/usr/bin/env tsx
import { PATTERNS } from '../src/data/agentic-design-patterns'

const AFFILIATE_PARAMS = [
  'tag', 'ref', 'aff', 'linkCode', 'via', 'partner', 'affiliate',
  'affid', 'aff_id', 'partnerid', 'utm_source_aff',
]

function hasAffiliate(url: string): string | null {
  try {
    const u = new URL(url)
    for (const p of AFFILIATE_PARAMS) {
      if (u.searchParams.has(p)) return p
    }
  } catch {
    return null
  }
  return null
}

let failed = 0
for (const p of PATTERNS) {
  const urls = [
    ...p.references.map((r) => r.url),
    ...p.realWorldExamples.map((e) => e.sourceUrl),
    ...(p.readerGotcha ? [p.readerGotcha.sourceUrl] : []),
  ]
  for (const url of urls) {
    const param = hasAffiliate(url)
    if (param) {
      console.error(`✗ ${p.slug} → ${url} contains affiliate param "${param}"`)
      failed++
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} affiliate-tagged URL(s) found.`)
  process.exit(1)
}
console.log('No affiliate-tagged URLs found.')
```

(Delete the `.mjs` version if created.)

- [ ] **Step 2: Run it**

```bash
cd /Users/jul/repos/detached-node && npx tsx scripts/check-affiliate-links.ts
```

Expected: `No affiliate-tagged URLs found.` (stubs have no URLs yet.)

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add scripts/check-affiliate-links.ts
git -C /Users/jul/repos/detached-node commit -m "build(adp): check-affiliate-links.ts — no affiliate query params allowed"
```

---

### Task 1.11: scripts/check-pattern-overlap.mjs (manual prose-similarity tool)

**Files:**
- Create: `scripts/check-pattern-overlap.ts`

- [ ] **Step 1: Write the script**

Create `/Users/jul/repos/detached-node/scripts/check-pattern-overlap.ts`:

```typescript
#!/usr/bin/env tsx
/**
 * check-pattern-overlap.ts <pattern-slug> <source-text-file>
 *
 * Manual tool. Computes word-level Jaccard similarity between a pattern's
 * bodySummary and a provided source text file (e.g., a chapter you copied
 * from the PDF). Threshold: ≥ 30% similarity flags potential paraphrase.
 *
 * Exempts proper-noun runs (chapter titles, framework names like
 * "LangGraph"/"Crew AI") to avoid false positives.
 */
import { readFileSync } from 'node:fs'
import { getPattern } from '../src/data/agentic-design-patterns'

const PROPER_NOUN_EXEMPTIONS = new Set([
  'langchain', 'langgraph', 'crewai', 'crew', 'autogen', 'mastra',
  'pydantic', 'smolagents', 'reflexion', 'react', 'rag', 'mcp', 'a2a',
  'gulli', 'anthropic', 'openai', 'google', 'springer', 'gpt',
])

function tokenize(text: string): Set<string> {
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9 ]+/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !PROPER_NOUN_EXEMPTIONS.has(w))
  )
}

const [, , slug, sourcePath] = process.argv
if (!slug || !sourcePath) {
  console.error('Usage: tsx scripts/check-pattern-overlap.ts <slug> <source-file>')
  process.exit(2)
}

const pattern = getPattern(slug)
if (!pattern) {
  console.error(`Unknown pattern slug: ${slug}`)
  process.exit(2)
}

const ourText = pattern.bodySummary.join(' ')
const sourceText = readFileSync(sourcePath, 'utf-8')

const ours = tokenize(ourText)
const theirs = tokenize(sourceText)
const intersection = new Set([...ours].filter((w) => theirs.has(w)))
const union = new Set([...ours, ...theirs])

const jaccard = intersection.size / union.size
const pct = (jaccard * 100).toFixed(1)

console.log(`Pattern: ${slug}`)
console.log(`Our tokens: ${ours.size}`)
console.log(`Source tokens: ${theirs.size}`)
console.log(`Overlap: ${intersection.size}`)
console.log(`Jaccard similarity: ${pct}%`)
if (jaccard >= 0.3) {
  console.warn('\n⚠ Similarity ≥ 30% — review for paraphrase.')
  process.exit(1)
}
console.log('\nOK — below paraphrase threshold.')
```

- [ ] **Step 2: Smoke test (no source needed for stub)**

```bash
cd /Users/jul/repos/detached-node
echo "" > /tmp/empty-source.txt
npx tsx scripts/check-pattern-overlap.ts reflexion /tmp/empty-source.txt
```

Expected: runs without crashing; reports 0% similarity (Reflexion has empty bodySummary at this stage too).

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add scripts/check-pattern-overlap.ts
git -C /Users/jul/repos/detached-node commit -m "build(adp): check-pattern-overlap.ts — manual paraphrase-similarity tool"
```

---

### Task 1.12: scripts/check-pattern-links.mjs + GitHub workflow

**Files:**
- Create: `scripts/check-pattern-links.ts`
- Create: `.github/workflows/check-pattern-links.yml`

- [ ] **Step 1: Write the script**

Create `/Users/jul/repos/detached-node/scripts/check-pattern-links.ts`:

```typescript
#!/usr/bin/env tsx
/**
 * check-pattern-links.ts
 *
 * HEADs every URL in Pattern data; reports non-200 responses.
 * Run weekly via GitHub Action; opens an issue on failure.
 */
import { PATTERNS } from '../src/data/agentic-design-patterns'

type Check = { url: string; pattern: string; field: string }

const checks: Check[] = []
for (const p of PATTERNS) {
  for (const r of p.references) checks.push({ url: r.url, pattern: p.slug, field: 'references' })
  for (const e of p.realWorldExamples) checks.push({ url: e.sourceUrl, pattern: p.slug, field: 'realWorldExamples' })
  if (p.readerGotcha) checks.push({ url: p.readerGotcha.sourceUrl, pattern: p.slug, field: 'readerGotcha' })
}

let failed = 0
const limit = 5
const queue = [...checks]
const inflight: Promise<void>[] = []

async function check(c: Check) {
  try {
    const res = await fetch(c.url, { method: 'HEAD', redirect: 'follow' })
    if (!res.ok) {
      console.error(`✗ ${c.pattern}.${c.field}: ${res.status} ${c.url}`)
      failed++
    } else {
      console.log(`✓ ${c.pattern}.${c.field}: ${c.url}`)
    }
  } catch (err) {
    console.error(`✗ ${c.pattern}.${c.field}: ${(err as Error).message} ${c.url}`)
    failed++
  }
}

while (queue.length || inflight.length) {
  while (inflight.length < limit && queue.length) {
    const c = queue.shift()!
    const p = check(c).then(() => { inflight.splice(inflight.indexOf(p), 1) })
    inflight.push(p)
  }
  await Promise.race(inflight)
}

console.log(`\nChecked ${checks.length}; ${failed} failed.`)
if (failed > 0) process.exit(1)
```

- [ ] **Step 2: Write the GitHub workflow**

Create `/Users/jul/repos/detached-node/.github/workflows/check-pattern-links.yml`:

```yaml
name: check-pattern-links

on:
  schedule:
    - cron: '0 6 * * 1' # Mondays 06:00 UTC
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
      - id: links
        run: npx tsx scripts/check-pattern-links.ts
        continue-on-error: true
      - if: steps.links.outcome == 'failure'
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Pattern reference link check failed',
              body: `Weekly link check found broken references. See workflow run ${context.runId}.`,
              labels: [],
            })
```

- [ ] **Step 3: Smoke test the script**

```bash
cd /Users/jul/repos/detached-node && npx tsx scripts/check-pattern-links.ts
```

Expected: `Checked 0; 0 failed.` (no URLs yet in stubs).

- [ ] **Step 4: Commit**

```bash
git -C /Users/jul/repos/detached-node add scripts/check-pattern-links.ts .github/workflows/check-pattern-links.yml
git -C /Users/jul/repos/detached-node commit -m "build(adp): check-pattern-links.ts + weekly GitHub workflow"
```

---

### Task 1.13: scripts/lint-changelog.mjs

**Files:**
- Create: `scripts/lint-changelog.ts`

- [ ] **Step 1: Write the script**

Create `/Users/jul/repos/detached-node/scripts/lint-changelog.ts`:

```typescript
#!/usr/bin/env tsx
/**
 * lint-changelog.ts
 *
 * Validates that:
 *   - every CHANGELOG entry's slug resolves to an existing (or archived) pattern
 *   - dates are ISO format
 *   - the most-recent CHANGELOG date matches the highest dateModified across
 *     all patterns (catches "forgot to add changelog entry" bugs)
 */
import { CHANGELOG } from '../src/data/agentic-design-patterns/changelog'
import { PATTERNS, getCatalogDateModified } from '../src/data/agentic-design-patterns'

let failed = 0

const slugs = new Set(PATTERNS.map((p) => p.slug))
for (const e of CHANGELOG) {
  if (!slugs.has(e.slug)) {
    console.error(`✗ CHANGELOG entry references unknown slug: ${e.slug}`)
    failed++
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date)) {
    console.error(`✗ CHANGELOG entry has bad date format: ${e.date}`)
    failed++
  }
}

const latestEntryDate = CHANGELOG[0]?.date ?? '0'
const latestPatternDate = getCatalogDateModified()
if (latestEntryDate !== latestPatternDate) {
  console.error(
    `✗ Most-recent CHANGELOG date (${latestEntryDate}) != latest pattern dateModified (${latestPatternDate}).`,
  )
  console.error(`  Did you forget to add a changelog entry for the most recent edit?`)
  failed++
}

if (failed > 0) {
  console.error(`\n${failed} changelog issue(s).`)
  process.exit(1)
}
console.log(`CHANGELOG OK (${CHANGELOG.length} entries).`)
```

- [ ] **Step 2: Run it**

```bash
cd /Users/jul/repos/detached-node && npx tsx scripts/lint-changelog.ts
```

Expected: `CHANGELOG OK (1 entries).`

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add scripts/lint-changelog.ts
git -C /Users/jul/repos/detached-node commit -m "build(adp): lint-changelog.ts — every PR adds a matching entry"
```

---

### Task 1.14: Wire scripts into npm run lint

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Read current scripts**

```bash
cat /Users/jul/repos/detached-node/package.json | python3 -c "import json,sys; print(json.load(sys.stdin)['scripts'].get('lint',''))"
```

Expected output: `eslint`

- [ ] **Step 2: Replace lint script with composite**

Edit `package.json` `"scripts"` section. Change:

```json
"lint": "eslint",
```

to:

```json
"lint": "eslint && npm run lint:adp",
"lint:adp": "tsx scripts/typecheck-sketches.ts && tsx scripts/validate-references.ts && tsx scripts/check-affiliate-links.ts && tsx scripts/lint-changelog.ts",
```

- [ ] **Step 3: Run the full lint**

```bash
cd /Users/jul/repos/detached-node && npm run lint
```

Expected: ESLint passes, then all 4 ADP checks pass.

- [ ] **Step 4: Commit**

```bash
git -C /Users/jul/repos/detached-node add package.json
git -C /Users/jul/repos/detached-node commit -m "build(adp): wire ADP guardrails into npm run lint"
```

---

## PHASE 1C — Schema utilities

### Task 1.15: src/lib/schema/agentic-patterns.ts

**Files:**
- Create: `src/lib/schema/agentic-patterns.ts`
- Test: `tests/lib/schema/agentic-patterns.test.ts`

- [ ] **Step 1: Write the failing test**

Create `/Users/jul/repos/detached-node/tests/lib/schema/agentic-patterns.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  generatePatternArticleSchema,
  referenceToScholarlyArticleSchema,
} from '@/lib/schema/agentic-patterns'
import type { Pattern, Reference } from '@/data/agentic-design-patterns/types'

const FIXTURE_PATTERN: Pattern = {
  slug: 'reflexion',
  name: 'Reflexion',
  layerId: 'topology',
  topologySubtier: 'single-agent',
  oneLineSummary: 'Agent writes self-critiques into memory to improve next attempts.',
  bodySummary: ['Para 1.', 'Para 2.'],
  mermaidSource: 'graph TD; A-->B',
  mermaidAlt: 'A graph showing A flows to B',
  whenToUse: ['When you can express success criteria.'],
  whenNotToUse: ['When the critic is the same model as the generator.'],
  realWorldExamples: [{ text: 'Example', sourceUrl: 'https://example.com' }],
  implementationSketch: '// stub',
  sdkAvailability: 'first-party-ts',
  relatedSlugs: [],
  frameworks: ['langchain'],
  references: [
    { title: 'Reflexion', url: 'https://arxiv.org/abs/2303.11366', authors: 'Shinn et al.', year: 2023, type: 'paper', doi: '10.48550/arXiv.2303.11366', venue: 'NeurIPS 2023' },
  ],
  addedAt: '2026-05-02',
  dateModified: '2026-05-02',
}

describe('generatePatternArticleSchema', () => {
  it('emits Article with isBasedOn and citation array', () => {
    const schema = generatePatternArticleSchema(FIXTURE_PATTERN)
    expect(schema['@type']).toBe('Article')
    expect(schema.dateModified).toBe('2026-05-02')
    expect(Array.isArray(schema.citation)).toBe(true)
    expect((schema.citation as unknown[]).length).toBe(1)
  })

  it('reference → ScholarlyArticle schema preserves DOI as identifier', () => {
    const ref: Reference = FIXTURE_PATTERN.references[0]
    const schema = referenceToScholarlyArticleSchema(ref)
    expect(schema['@type']).toBe('ScholarlyArticle')
    expect(schema.identifier).toEqual({
      '@type': 'PropertyValue',
      propertyID: 'DOI',
      value: '10.48550/arXiv.2303.11366',
    })
  })
})
```

- [ ] **Step 2: Run test, verify fail**

```bash
cd /Users/jul/repos/detached-node && npm run test:unit -- tests/lib/schema/agentic-patterns.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write the schema module**

Create `/Users/jul/repos/detached-node/src/lib/schema/agentic-patterns.ts`:

```typescript
import { siteUrl } from '@/lib/site-config'
import { AUTHOR_CONFIG } from '@/lib/schema/config'
import type { Pattern, Reference } from '@/data/agentic-design-patterns/types'

type Schema = Record<string, unknown>

export function referenceToScholarlyArticleSchema(ref: Reference): Schema {
  const base: Schema = {
    '@type': ref.type === 'book'
      ? 'Book'
      : ref.type === 'docs' || ref.type === 'spec' || ref.type === 'essay'
        ? 'WebPage'
        : 'ScholarlyArticle',
    name: ref.title,
    url: ref.url,
    author: { '@type': 'Person', name: ref.authors },
    datePublished: String(ref.year),
  }
  if (ref.venue) base.publisher = { '@type': 'Organization', name: ref.venue }
  if (ref.doi) {
    base.identifier = {
      '@type': 'PropertyValue',
      propertyID: 'DOI',
      value: ref.doi,
    }
  }
  return base
}

export function generatePatternArticleSchema(pattern: Pattern): Schema {
  const url = `${siteUrl}/agentic-design-patterns/${pattern.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: pattern.name,
    description: pattern.oneLineSummary,
    url,
    datePublished: pattern.addedAt,
    dateModified: pattern.dateModified,
    author: { '@id': AUTHOR_CONFIG.id },
    publisher: { '@id': AUTHOR_CONFIG.id },
    keywords: [
      'agentic design pattern',
      pattern.name.toLowerCase(),
      ...(pattern.alternativeNames ?? []).map((n) => n.toLowerCase()),
    ],
    citation: pattern.references.map(referenceToScholarlyArticleSchema),
  }
}
```

- [ ] **Step 4: Run test, expect pass**

```bash
npm run test:unit -- tests/lib/schema/agentic-patterns.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/lib/schema/agentic-patterns.ts tests/lib/schema/agentic-patterns.test.ts
git -C /Users/jul/repos/detached-node commit -m "feat(adp): pattern Article schema with citation array (E-E-A-T signal)"
```

---

### Task 1.16: Add generateHubChildBreadcrumb to existing breadcrumb.ts

**Files:**
- Modify: `src/lib/schema/breadcrumb.ts`

- [ ] **Step 1: Read current file**

```bash
cat /Users/jul/repos/detached-node/src/lib/schema/breadcrumb.ts
```

(Note the existing helpers' shape so the new function matches.)

- [ ] **Step 2: Append the new function at the end of breadcrumb.ts**

Add to `/Users/jul/repos/detached-node/src/lib/schema/breadcrumb.ts`:

```typescript

/**
 * 3-level breadcrumb: Home > Hub > Child.
 * Used for /agentic-design-patterns/[slug] satellites.
 */
export function generateHubChildBreadcrumb(
  hubSlug: string,
  hubTitle: string,
  childSlug: string,
  childTitle: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: hubTitle, item: `${siteUrl}/${hubSlug}` },
      { '@type': 'ListItem', position: 3, name: childTitle, item: `${siteUrl}/${hubSlug}/${childSlug}` },
    ],
  }
}
```

If `siteUrl` isn't already imported in `breadcrumb.ts`, add: `import { siteUrl } from '@/lib/site-config'` at top.

- [ ] **Step 3: Quick test**

Create `/Users/jul/repos/detached-node/tests/lib/schema/breadcrumb-hub.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { generateHubChildBreadcrumb } from '@/lib/schema/breadcrumb'

describe('generateHubChildBreadcrumb', () => {
  it('emits 3 items', () => {
    const b = generateHubChildBreadcrumb('agentic-design-patterns', 'Agentic Design Patterns', 'reflexion', 'Reflexion')
    expect(b['@type']).toBe('BreadcrumbList')
    expect((b.itemListElement as unknown[]).length).toBe(3)
  })
})
```

- [ ] **Step 4: Run test, expect pass**

```bash
npm run test:unit -- tests/lib/schema/breadcrumb-hub.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/lib/schema/breadcrumb.ts tests/lib/schema/breadcrumb-hub.test.ts
git -C /Users/jul/repos/detached-node commit -m "feat(schema): generateHubChildBreadcrumb — 3-level breadcrumb"
```

---

## PHASE 1D — Components

### Task 1.17: PatternCard component

**Files:**
- Create: `src/components/agentic-patterns/PatternCard.tsx`

- [ ] **Step 1: Write the component**

Create `/Users/jul/repos/detached-node/src/components/agentic-patterns/PatternCard.tsx`:

```tsx
import { Link } from 'next-view-transitions'
import type { Pattern } from '@/data/agentic-design-patterns/types'

export function PatternCard({ pattern }: { pattern: Pattern }) {
  return (
    <Link
      href={`/agentic-design-patterns/${pattern.slug}`}
      className="group rounded-sm border border-border bg-surface p-4 transition-colors hover:border-border-hover hover:bg-hover-bg focus-ring"
    >
      <div className="flex items-baseline justify-between text-[0.625rem] font-mono text-text-tertiary tracking-[0.05em]">
        <span>{pattern.layerId.toUpperCase()}{pattern.topologySubtier ? ` / ${pattern.topologySubtier.toUpperCase()}` : ''}</span>
        <span>{pattern.references.length > 0 ? `${pattern.references.length} REFS` : 'STUB'}</span>
      </div>
      <h3 className="mt-2 font-mono text-base font-semibold text-text-primary [text-wrap:balance]">
        {pattern.name}
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary [text-wrap:pretty]">
        {pattern.oneLineSummary}
      </p>
      {pattern.frameworks.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {pattern.frameworks.map((fw) => (
            <span
              key={fw}
              className="font-mono text-[0.6rem] uppercase tracking-[0.05em] text-text-tertiary border border-border px-1.5 py-0.5 rounded-sm"
            >
              {fw}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
```

- [ ] **Step 2: Smoke type-check**

```bash
cd /Users/jul/repos/detached-node && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/components/agentic-patterns/PatternCard.tsx
git -C /Users/jul/repos/detached-node commit -m "feat(adp): PatternCard component (hub grid card)"
```

---

### Task 1.18: HubHero component

**Files:**
- Create: `src/components/agentic-patterns/HubHero.tsx`

- [ ] **Step 1: Write the component**

Create `/Users/jul/repos/detached-node/src/components/agentic-patterns/HubHero.tsx`:

```tsx
import { LivingCatalogBadge } from './LivingCatalogBadge'

export function HubHero({ dateModified, patternCount }: { dateModified: string; patternCount: number }) {
  const date = new Date(dateModified)
  const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
  return (
    <section className="border-b border-border pb-8">
      <div className="font-mono text-[0.7rem] uppercase tracking-[0.25em] text-accent">
        A field reference · updated {monthYear}
      </div>
      <h1 className="mt-3 font-mono text-3xl font-semibold tracking-tight text-text-primary">
        Agentic Design Patterns
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary">
        Patterns for building autonomous AI systems — drawn from the literature and current practice.
        Each pattern is summarized, diagrammed, and cited to its sources: papers, foundational essays,
        vendor docs, and recent books.
      </p>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-text-tertiary">
        A working reference of {patternCount} patterns — added, refined, and occasionally retired as the
        field evolves. <LivingCatalogBadge dateModified={dateModified} />
      </p>
    </section>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors (LivingCatalogBadge will be created in Task 1.19).

If it errors (because LivingCatalogBadge doesn't exist yet), do Task 1.19 next — that's fine.

- [ ] **Step 3: Commit (after Task 1.19 lands so type-check passes)**

```bash
git -C /Users/jul/repos/detached-node add src/components/agentic-patterns/HubHero.tsx
# Wait until LivingCatalogBadge exists; then commit both together
```

---

### Task 1.19: LivingCatalogBadge component

**Files:**
- Create: `src/components/agentic-patterns/LivingCatalogBadge.tsx`

- [ ] **Step 1: Write the component**

Create `/Users/jul/repos/detached-node/src/components/agentic-patterns/LivingCatalogBadge.tsx`:

```tsx
export function LivingCatalogBadge({ dateModified }: { dateModified: string }) {
  return (
    <span
      className="ml-2 inline-block font-mono text-[0.65rem] uppercase tracking-[0.1em] text-text-tertiary border border-border px-1.5 py-0.5 rounded-sm"
      title={`Catalog last updated ${dateModified}`}
    >
      updated {dateModified}
    </span>
  )
}
```

- [ ] **Step 2: Commit (with HubHero from Task 1.18)**

```bash
git -C /Users/jul/repos/detached-node add src/components/agentic-patterns/HubHero.tsx src/components/agentic-patterns/LivingCatalogBadge.tsx
git -C /Users/jul/repos/detached-node commit -m "feat(adp): HubHero + LivingCatalogBadge components"
```

---

### Task 1.20: HubGrid component (server, layer sections with sub-tier)

**Files:**
- Create: `src/components/agentic-patterns/HubGrid.tsx`

- [ ] **Step 1: Write the component**

Create `/Users/jul/repos/detached-node/src/components/agentic-patterns/HubGrid.tsx`:

```tsx
import { LAYERS, getPatternsByLayer, getTopologyPatterns } from '@/data/agentic-design-patterns'
import type { LayerId } from '@/data/agentic-design-patterns/types'
import { PatternCard } from './PatternCard'

export function HubGrid({ activeLayer }: { activeLayer?: LayerId }) {
  const layersToRender = activeLayer
    ? LAYERS.filter((l) => l.id === activeLayer)
    : LAYERS
  return (
    <div className="flex flex-col gap-12 mt-8">
      {layersToRender.map((layer) => (
        <section key={layer.id}>
          <header className="mb-4 border-b border-border pb-2">
            <div className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-accent">
              Layer {layer.number} — {layer.title}
            </div>
            <p className="mt-1 text-sm text-text-secondary">{layer.question}</p>
          </header>
          {layer.id === 'topology' ? <TopologyLayer /> : <PatternGrid patterns={getPatternsByLayer(layer.id)} />}
        </section>
      ))}
    </div>
  )
}

function TopologyLayer() {
  const single = getTopologyPatterns('single-agent')
  const multi = getTopologyPatterns('multi-agent')
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-text-tertiary">
          Single-agent ({single.length})
        </div>
        <PatternGrid patterns={single} />
      </div>
      <div>
        <div className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-text-tertiary">
          Multi-agent ({multi.length})
        </div>
        <PatternGrid patterns={multi} />
      </div>
    </div>
  )
}

function PatternGrid({ patterns }: { patterns: Parameters<typeof PatternCard>[0]['pattern'][] }) {
  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {patterns.map((p) => (
        <PatternCard key={p.slug} pattern={p} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/components/agentic-patterns/HubGrid.tsx
git -C /Users/jul/repos/detached-node commit -m "feat(adp): HubGrid component with sub-tiered topology section"
```

---

### Task 1.21: HubSearchBar (client)

**Files:**
- Create: `src/components/agentic-patterns/HubSearchBar.tsx`
- Create: `src/lib/pattern-search.ts`
- Test: `tests/lib/pattern-search.test.ts`

- [ ] **Step 1: Write pattern-search.ts test**

Create `/Users/jul/repos/detached-node/tests/lib/pattern-search.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { searchPatterns } from '@/lib/pattern-search'
import { PATTERNS } from '@/data/agentic-design-patterns'

describe('searchPatterns', () => {
  it('returns all patterns for empty query', () => {
    expect(searchPatterns(PATTERNS, '').length).toBe(PATTERNS.length)
  })

  it('matches by name prefix', () => {
    const r = searchPatterns(PATTERNS, 'rou')
    expect(r.find((p) => p.slug === 'routing')).toBeDefined()
  })

  it('matches by oneLineSummary substring', () => {
    const r = searchPatterns(PATTERNS, 'fan out')
    expect(r.find((p) => p.slug === 'parallelization')).toBeDefined()
  })

  it('case-insensitive', () => {
    expect(searchPatterns(PATTERNS, 'REFLEXION').find((p) => p.slug === 'reflexion')).toBeDefined()
  })

  it('returns empty for no-match query', () => {
    expect(searchPatterns(PATTERNS, 'asdfqwerzxcv')).toEqual([])
  })
})
```

- [ ] **Step 2: Write pattern-search.ts**

Create `/Users/jul/repos/detached-node/src/lib/pattern-search.ts`:

```typescript
import type { Pattern } from '@/data/agentic-design-patterns/types'

export function searchPatterns(patterns: Pattern[], query: string): Pattern[] {
  const q = query.toLowerCase().trim()
  if (q === '') return patterns
  const matches: { p: Pattern; rank: number }[] = []
  for (const p of patterns) {
    const name = p.name.toLowerCase()
    const summary = p.oneLineSummary.toLowerCase()
    const alts = (p.alternativeNames ?? []).map((s) => s.toLowerCase())
    let rank = 0
    if (name === q) rank = 100
    else if (name.startsWith(q)) rank = 80
    else if (alts.some((a) => a.startsWith(q))) rank = 70
    else if (name.includes(q)) rank = 60
    else if (alts.some((a) => a.includes(q))) rank = 50
    else if (summary.includes(q)) rank = 30
    else if (p.layerId.includes(q)) rank = 10
    if (rank > 0) matches.push({ p, rank })
  }
  return matches.sort((a, b) => b.rank - a.rank).map((m) => m.p)
}
```

- [ ] **Step 3: Run test, expect pass**

```bash
npm run test:unit -- tests/lib/pattern-search.test.ts
```

Expected: PASS.

- [ ] **Step 4: Write the client component**

Create `/Users/jul/repos/detached-node/src/components/agentic-patterns/HubSearchBar.tsx`:

```tsx
'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import type { Pattern } from '@/data/agentic-design-patterns/types'
import { searchPatterns } from '@/lib/pattern-search'

export function HubSearchBar({
  patterns,
  onResults,
}: {
  patterns: Pattern[]
  onResults: (results: Pattern[]) => void
}) {
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [, startTransition] = useTransition()
  const [count, setCount] = useState(patterns.length)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return
      if (e.key === '/') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      const results = searchPatterns(patterns, q)
      startTransition(() => {
        setCount(results.length)
        onResults(results)
      })
    }, 150)
    return () => clearTimeout(t)
  }, [q, patterns, onResults])

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="adp-search" className="sr-only">Search agentic design patterns</label>
      <div className="flex items-center gap-2 border border-border bg-surface px-3 py-2 rounded-sm">
        <span className="text-text-tertiary text-sm">⌕</span>
        <input
          ref={inputRef}
          id="adp-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search patterns…"
          className="flex-1 bg-transparent outline-none text-sm text-text-primary placeholder:text-text-tertiary"
          onKeyDown={(e) => { if (e.key === 'Escape') setQ('') }}
        />
        <span className="font-mono text-[0.65rem] text-text-tertiary border border-border px-1 rounded-sm">/</span>
      </div>
      <div aria-live="polite" className="sr-only">{count} pattern{count === 1 ? '' : 's'} match</div>
    </div>
  )
}
```

- [ ] **Step 5: Type-check + commit**

```bash
npx tsc --noEmit
git -C /Users/jul/repos/detached-node add src/lib/pattern-search.ts src/components/agentic-patterns/HubSearchBar.tsx tests/lib/pattern-search.test.ts
git -C /Users/jul/repos/detached-node commit -m "feat(adp): HubSearchBar (client) + pattern-search utility"
```

---

### Task 1.22: PatternHeader, ReferencesSection, RelatedPatternsRow, PrevNextNav, PatternBody

These are smaller; group into one task.

**Files:**
- Create: `src/components/agentic-patterns/PatternHeader.tsx`
- Create: `src/components/agentic-patterns/ReferencesSection.tsx`
- Create: `src/components/agentic-patterns/RelatedPatternsRow.tsx`
- Create: `src/components/agentic-patterns/PrevNextNav.tsx`
- Create: `src/components/agentic-patterns/PatternBody.tsx`

- [ ] **Step 1: PatternHeader**

Create `/Users/jul/repos/detached-node/src/components/agentic-patterns/PatternHeader.tsx`:

```tsx
import type { Pattern } from '@/data/agentic-design-patterns/types'
import { LAYERS } from '@/data/agentic-design-patterns'
import { LivingCatalogBadge } from './LivingCatalogBadge'

export function PatternHeader({ pattern }: { pattern: Pattern }) {
  const layer = LAYERS.find((l) => l.id === pattern.layerId)!
  const tier = pattern.topologySubtier
  return (
    <header className="border-b border-border pb-6">
      <div className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
        Layer {layer.number} — {layer.title}{tier ? ` / ${tier}` : ''}
      </div>
      <h1 className="mt-2 font-mono text-3xl font-semibold tracking-tight text-text-primary">
        {pattern.name}
      </h1>
      {pattern.alternativeNames && pattern.alternativeNames.length > 0 && (
        <p className="mt-1 text-sm text-text-tertiary">
          Also known as: {pattern.alternativeNames.join(', ')}
        </p>
      )}
      <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary">
        {pattern.oneLineSummary}
      </p>
      <div className="mt-3">
        <LivingCatalogBadge dateModified={pattern.dateModified} />
      </div>
    </header>
  )
}
```

- [ ] **Step 2: ReferencesSection**

Create `/Users/jul/repos/detached-node/src/components/agentic-patterns/ReferencesSection.tsx`:

```tsx
import type { Reference } from '@/data/agentic-design-patterns/types'

export function ReferencesSection({ references }: { references: Reference[] }) {
  if (references.length === 0) return null
  return (
    <section className="border-t border-border pt-8 mt-12">
      <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-accent mb-4">
        References
      </h2>
      <ul className="flex flex-col gap-3">
        {references.map((r) => (
          <li key={r.url} className="flex gap-3 items-baseline text-sm">
            <span className="font-mono text-[0.65rem] uppercase text-text-tertiary border border-border px-1.5 py-0.5 rounded-sm w-16 text-center shrink-0">
              {r.type}
            </span>
            <div className="flex-1">
              <a
                href={r.url}
                rel="noopener"
                className="text-text-primary hover:text-accent transition-colors"
              >
                {r.authors} ({r.year}) — {r.title}{r.venue ? `. ${r.venue}` : ''}.
              </a>
              {r.note && <span className="ml-2 text-text-tertiary text-xs">({r.note})</span>}
              {r.doi && <span className="ml-2 text-text-tertiary text-xs">DOI:{r.doi}</span>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

- [ ] **Step 3: RelatedPatternsRow**

Create `/Users/jul/repos/detached-node/src/components/agentic-patterns/RelatedPatternsRow.tsx`:

```tsx
import { Link } from 'next-view-transitions'
import { getPattern } from '@/data/agentic-design-patterns'

export function RelatedPatternsRow({ slugs }: { slugs: string[] }) {
  if (slugs.length === 0) return null
  return (
    <section className="mt-8">
      <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-text-tertiary mb-2">
        Related patterns
      </h2>
      <div className="flex flex-wrap gap-2">
        {slugs.map((s) => {
          const p = getPattern(s)
          if (!p) return null
          return (
            <Link
              key={s}
              href={`/agentic-design-patterns/${s}`}
              className="font-mono text-xs px-2 py-1 border border-border rounded-sm text-text-secondary hover:text-accent hover:border-border-hover transition-colors focus-ring"
            >
              → {p.name}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: PrevNextNav**

Create `/Users/jul/repos/detached-node/src/components/agentic-patterns/PrevNextNav.tsx`:

```tsx
import { Link } from 'next-view-transitions'
import { getAdjacentPatterns } from '@/data/agentic-design-patterns'

export function PrevNextNav({ slug }: { slug: string }) {
  const { prev, next } = getAdjacentPatterns(slug)
  return (
    <nav className="mt-12 flex justify-between border-t border-border pt-6 text-sm font-mono">
      {prev ? (
        <Link
          href={`/agentic-design-patterns/${prev.slug}`}
          className="text-text-tertiary hover:text-accent transition-colors focus-ring"
        >
          ← Previous: {prev.name}
        </Link>
      ) : <span />}
      {next ? (
        <Link
          href={`/agentic-design-patterns/${next.slug}`}
          className="text-text-tertiary hover:text-accent transition-colors focus-ring"
        >
          Next: {next.name} →
        </Link>
      ) : <span />}
    </nav>
  )
}
```

- [ ] **Step 5: PatternBody (composes the 8 slots)**

Create `/Users/jul/repos/detached-node/src/components/agentic-patterns/PatternBody.tsx`:

```tsx
import { MermaidDiagram } from '@/components/MermaidDiagram'
import type { Pattern } from '@/data/agentic-design-patterns/types'
import { ReferencesSection } from './ReferencesSection'
import { RelatedPatternsRow } from './RelatedPatternsRow'

const PSEUDOCODE_BANNER = "This pattern's canonical SDKs are Python; the snippet below illustrates the structure. See References for runnable Python examples."

export function PatternBody({ pattern }: { pattern: Pattern }) {
  const isPseudocode = pattern.sdkAvailability === 'python-only' || pattern.sdkAvailability === 'no-sdk'
  return (
    <div className="prose dark:prose-invert max-w-none">
      {/* Slot 1 — Overview */}
      <section>
        {pattern.bodySummary.map((para, i) => (
          <p key={i} className="text-base leading-7 text-text-primary">{para}</p>
        ))}
      </section>

      {/* Slot 2 — Diagram */}
      {pattern.mermaidSource && (
        <section className="my-8">
          <MermaidDiagram source={pattern.mermaidSource} />
          <p className="text-xs text-text-tertiary mt-2 italic">
            Original diagram. See References for canonical visual treatments in the source literature.
          </p>
        </section>
      )}

      {/* Slot 3 — When to use / not to use */}
      {(pattern.whenToUse.length > 0 || pattern.whenNotToUse.length > 0) && (
        <section className="my-8 grid gap-6 sm:grid-cols-2">
          {pattern.whenToUse.length > 0 && (
            <div>
              <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-accent">When to use</h2>
              <ul className="mt-2 list-disc pl-5 text-sm leading-6 text-text-secondary">
                {pattern.whenToUse.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}
          {pattern.whenNotToUse.length > 0 && (
            <div>
              <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-text-tertiary">When NOT to use</h2>
              <ul className="mt-2 list-disc pl-5 text-sm leading-6 text-text-secondary">
                {pattern.whenNotToUse.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Slot 4 — Implementation sketch */}
      {pattern.implementationSketch && (
        <section className="my-8">
          <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-accent mb-2">Implementation sketch</h2>
          {isPseudocode && (
            <p className="text-xs text-text-tertiary mb-2 italic">{PSEUDOCODE_BANNER}</p>
          )}
          <pre className="bg-surface border border-border p-4 rounded-sm overflow-x-auto text-xs">
            <code>{pattern.implementationSketch}</code>
          </pre>
        </section>
      )}

      {/* Slot 5 — Real-world examples */}
      {pattern.realWorldExamples.length > 0 && (
        <section className="my-8">
          <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-accent mb-2">In the wild</h2>
          <ul className="list-disc pl-5 text-sm leading-6 text-text-secondary">
            {pattern.realWorldExamples.map((e, i) => (
              <li key={i}>
                {e.text} — <a href={e.sourceUrl} rel="noopener" className="text-accent hover:underline">source</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Slot 6 — Reader gotcha (optional) */}
      {pattern.readerGotcha && (
        <section className="my-8 border-l-2 border-accent pl-4">
          <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-accent mb-2">Reader gotcha</h2>
          <p className="text-sm text-text-secondary">
            {pattern.readerGotcha.text}{' '}
            <a href={pattern.readerGotcha.sourceUrl} rel="noopener" className="text-accent hover:underline">[source]</a>
          </p>
        </section>
      )}

      {/* Slot 7 — Related patterns */}
      <RelatedPatternsRow slugs={pattern.relatedSlugs} />

      {/* Slot 8 — References */}
      <ReferencesSection references={pattern.references} />
    </div>
  )
}
```

- [ ] **Step 6: Type-check + commit**

```bash
npx tsc --noEmit
git -C /Users/jul/repos/detached-node add src/components/agentic-patterns/PatternHeader.tsx src/components/agentic-patterns/ReferencesSection.tsx src/components/agentic-patterns/RelatedPatternsRow.tsx src/components/agentic-patterns/PrevNextNav.tsx src/components/agentic-patterns/PatternBody.tsx
git -C /Users/jul/repos/detached-node commit -m "feat(adp): satellite components — header, body (8 slots), references, related, prev/next"
```

---

## PHASE 1E — Routes + sitemap

### Task 1.23: Hub route page.tsx

**Files:**
- Create: `src/app/(frontend)/agentic-design-patterns/page.tsx`

- [ ] **Step 1: Write the route**

Create `/Users/jul/repos/detached-node/src/app/(frontend)/agentic-design-patterns/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { PageLayout } from '@/components/PageLayout'
import { SchemaScript } from '@/components/SchemaScript'
import { HubHero } from '@/components/agentic-patterns/HubHero'
import { HubGrid } from '@/components/agentic-patterns/HubGrid'
import { LAYERS, getCatalogDateModified, getCatalogPatternCount } from '@/data/agentic-design-patterns'
import type { LayerId } from '@/data/agentic-design-patterns/types'
import { siteUrl } from '@/lib/site-config'
import { AUTHOR_CONFIG } from '@/lib/schema/config'
import { generateBreadcrumbForPath } from '@/lib/schema/breadcrumb'

export const dynamic = 'force-static'
export const revalidate = false

const PAGE_URL = `${siteUrl}/agentic-design-patterns`
const PAGE_TITLE = 'Agentic Design Patterns'
const PAGE_DESC = 'A field reference of patterns for building autonomous AI systems — cited to papers, foundational essays, vendor docs, and recent books.'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESC,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: PAGE_TITLE, description: PAGE_DESC, url: PAGE_URL },
}

export default function HubPage({ searchParams }: { searchParams: { layer?: string } }) {
  const dateModified = getCatalogDateModified()
  const count = getCatalogPatternCount()
  const layerFilter = LAYERS.find((l) => l.id === searchParams.layer)?.id as LayerId | undefined

  const articleSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${PAGE_URL}#article`,
    headline: PAGE_TITLE,
    description: PAGE_DESC,
    url: PAGE_URL,
    dateModified,
    author: { '@id': AUTHOR_CONFIG.id },
    publisher: { '@id': AUTHOR_CONFIG.id },
  }

  return (
    <PageLayout>
      <SchemaScript schema={[articleSchema, generateBreadcrumbForPath('/agentic-design-patterns', PAGE_TITLE)]} />
      <HubHero dateModified={dateModified} patternCount={count} />
      <HubGrid activeLayer={layerFilter} />
    </PageLayout>
  )
}
```

(Note: `generateBreadcrumbForPath` should already exist in the project's breadcrumb module from the existing 2-level helper. If named differently, look in `src/lib/schema/breadcrumb.ts` for the closest existing helper.)

- [ ] **Step 2: Build smoke test**

```bash
cd /Users/jul/repos/detached-node && npm run dev &
sleep 5
curl -s http://localhost:3000/agentic-design-patterns | head -50
kill %1
```

Expected: HTML response with "Agentic Design Patterns" in the title.

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/app/(frontend)/agentic-design-patterns/page.tsx
git -C /Users/jul/repos/detached-node commit -m "feat(adp): hub route /agentic-design-patterns"
```

---

### Task 1.24: Satellite route [slug]/page.tsx

**Files:**
- Create: `src/app/(frontend)/agentic-design-patterns/[slug]/page.tsx`

- [ ] **Step 1: Write the route**

Create `/Users/jul/repos/detached-node/src/app/(frontend)/agentic-design-patterns/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Link } from 'next-view-transitions'
import { PageLayout } from '@/components/PageLayout'
import { SchemaScript } from '@/components/SchemaScript'
import { PatternHeader } from '@/components/agentic-patterns/PatternHeader'
import { PatternBody } from '@/components/agentic-patterns/PatternBody'
import { PrevNextNav } from '@/components/agentic-patterns/PrevNextNav'
import { getPattern, getPatternSlugs } from '@/data/agentic-design-patterns'
import { generatePatternArticleSchema } from '@/lib/schema/agentic-patterns'
import { generateHubChildBreadcrumb } from '@/lib/schema/breadcrumb'
import { siteUrl } from '@/lib/site-config'

export const dynamic = 'force-static'
export const dynamicParams = false
export const revalidate = false

export function generateStaticParams() {
  return getPatternSlugs().map((slug) => ({ slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pattern = getPattern(slug)
  if (!pattern) return { title: 'Pattern Not Found' }
  const url = `${siteUrl}/agentic-design-patterns/${slug}`
  return {
    title: pattern.name,
    description: pattern.oneLineSummary,
    alternates: { canonical: url },
    openGraph: { title: pattern.name, description: pattern.oneLineSummary, url },
  }
}

export default async function SatellitePage({ params }: Props) {
  const { slug } = await params
  const pattern = getPattern(slug)
  if (!pattern || pattern.archived) notFound()

  return (
    <PageLayout maxWidth="prose">
      <SchemaScript schema={[
        generatePatternArticleSchema(pattern),
        generateHubChildBreadcrumb('agentic-design-patterns', 'Agentic Design Patterns', slug, pattern.name),
      ]} />
      <Link
        href="/agentic-design-patterns"
        className="text-sm font-mono text-text-tertiary hover:text-accent transition-colors focus-ring"
      >
        ← Back to catalog
      </Link>
      <article className="mt-4">
        <PatternHeader pattern={pattern} />
        <div className="mt-8">
          <PatternBody pattern={pattern} />
        </div>
        <PrevNextNav slug={slug} />
        <footer className="mt-8 text-xs text-text-tertiary font-mono">
          By Julian Ken / Detached Node · <Link href="/agentic-design-patterns" className="hover:text-accent">back to catalog</Link>
        </footer>
      </article>
    </PageLayout>
  )
}
```

- [ ] **Step 2: Smoke test**

```bash
cd /Users/jul/repos/detached-node && npm run dev &
sleep 5
curl -sI http://localhost:3000/agentic-design-patterns/reflexion | head -3
kill %1
```

Expected: HTTP 200.

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add 'src/app/(frontend)/agentic-design-patterns/[slug]/page.tsx'
git -C /Users/jul/repos/detached-node commit -m "feat(adp): satellite route /agentic-design-patterns/[slug]"
```

---

### Task 1.25: Changelog route

**Files:**
- Create: `src/app/(frontend)/agentic-design-patterns/changelog/page.tsx`

- [ ] **Step 1: Write the route**

Create `/Users/jul/repos/detached-node/src/app/(frontend)/agentic-design-patterns/changelog/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { Link } from 'next-view-transitions'
import { PageLayout } from '@/components/PageLayout'
import { CHANGELOG } from '@/data/agentic-design-patterns/changelog'
import { siteUrl } from '@/lib/site-config'

export const dynamic = 'force-static'

const PAGE_URL = `${siteUrl}/agentic-design-patterns/changelog`

export const metadata: Metadata = {
  title: 'Catalog Changelog — Agentic Design Patterns',
  description: 'Pattern additions, edits, and retirements.',
  alternates: { canonical: PAGE_URL },
}

const TYPE_LABEL: Record<string, string> = {
  added: 'ADDED',
  edited: 'EDITED',
  retired: 'RETIRED',
}

export default function ChangelogPage() {
  // Group by month
  const byMonth = new Map<string, typeof CHANGELOG>()
  for (const entry of CHANGELOG) {
    const month = entry.date.slice(0, 7)
    if (!byMonth.has(month)) byMonth.set(month, [])
    byMonth.get(month)!.push(entry)
  }

  return (
    <PageLayout>
      <Link
        href="/agentic-design-patterns"
        className="text-sm font-mono text-text-tertiary hover:text-accent transition-colors focus-ring"
      >
        ← Back to catalog
      </Link>
      <h1 className="mt-4 font-mono text-3xl font-semibold text-text-primary">Catalog Changelog</h1>
      <p className="mt-2 text-base text-text-secondary">
        Patterns added, refined, and occasionally retired. Newest first.
      </p>
      <div className="mt-8 flex flex-col gap-8">
        {[...byMonth.entries()].map(([month, entries]) => (
          <section key={month}>
            <h2 className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-accent border-b border-border pb-2">
              {new Date(`${month}-01`).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {entries.map((e) => (
                <li key={`${e.date}-${e.slug}`} className="text-sm">
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-text-tertiary mr-2">
                    {e.date} · {TYPE_LABEL[e.type]}
                  </span>
                  <Link href={`/agentic-design-patterns/${e.slug}`} className="text-text-primary hover:text-accent">
                    {e.slug}
                  </Link>
                  <span className="text-text-secondary"> — {e.note}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageLayout>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/app/(frontend)/agentic-design-patterns/changelog/page.tsx
git -C /Users/jul/repos/detached-node commit -m "feat(adp): /agentic-design-patterns/changelog route"
```

---

### Task 1.26: OG images

**Files:**
- Create: `src/app/(frontend)/agentic-design-patterns/opengraph-image.tsx`
- Create: `src/app/(frontend)/agentic-design-patterns/[slug]/opengraph-image.tsx`

- [ ] **Step 1: Hub OG**

Create `/Users/jul/repos/detached-node/src/app/(frontend)/agentic-design-patterns/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Agentic Design Patterns — A Field Reference'

export default function OG() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', background: '#0a0a0a', color: '#f4f4f5',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '60px 80px', fontFamily: 'JetBrains Mono, monospace',
      }}>
        <div style={{ fontSize: 18, color: '#b49cff', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          A FIELD REFERENCE — DETACHED NODE
        </div>
        <div>
          <div style={{ fontSize: 84, fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Agentic Design Patterns
          </div>
          <div style={{ fontSize: 26, color: '#a1a1aa', marginTop: 24, maxWidth: 900 }}>
            Patterns for building autonomous AI systems, cited to source.
          </div>
        </div>
        <div style={{ fontSize: 16, color: '#71717a' }}>detached-node.com / agentic-design-patterns</div>
      </div>
    ),
    size,
  )
}
```

- [ ] **Step 2: Satellite OG**

Create `/Users/jul/repos/detached-node/src/app/(frontend)/agentic-design-patterns/[slug]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import { getPattern } from '@/data/agentic-design-patterns'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getPattern(slug)
  const name = p?.name ?? 'Pattern'
  const layer = p ? p.layerId.toUpperCase() : ''
  const refs = p?.references.length ?? 0

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', background: '#0a0a0a', color: '#f4f4f5',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '60px 80px', fontFamily: 'JetBrains Mono, monospace',
      }}>
        <div style={{ fontSize: 18, color: '#b49cff', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          AGENTIC DESIGN PATTERNS · {layer}
        </div>
        <div>
          <div style={{ fontSize: 84, fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            {name}
          </div>
          {p && (
            <div style={{ fontSize: 22, color: '#a1a1aa', marginTop: 24, maxWidth: 1000 }}>
              {p.oneLineSummary}
            </div>
          )}
        </div>
        <div style={{ fontSize: 16, color: '#71717a' }}>{refs} cited reference{refs === 1 ? '' : 's'} · detached-node.com</div>
      </div>
    ),
    size,
  )
}
```

- [ ] **Step 3: Smoke test (build)**

```bash
cd /Users/jul/repos/detached-node && npx next build 2>&1 | tail -30
```

Expected: "Compiled successfully" or similar; no errors.

- [ ] **Step 4: Commit**

```bash
git -C /Users/jul/repos/detached-node add 'src/app/(frontend)/agentic-design-patterns/opengraph-image.tsx' 'src/app/(frontend)/agentic-design-patterns/[slug]/opengraph-image.tsx'
git -C /Users/jul/repos/detached-node commit -m "feat(adp): OG image templates for hub + per-pattern"
```

---

### Task 1.27: Sitemap entries + site-config keywords

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/lib/site-config.ts`

- [ ] **Step 1: Add sitemap entries**

Edit `/Users/jul/repos/detached-node/src/app/sitemap.ts`. Add two imports near the top (after existing imports):

```typescript
import { getPatternSlugs, getCatalogDateModified } from '@/data/agentic-design-patterns'
```

Then in the `staticRoutes` array, after the failure-modes entry (or wherever feels natural), add:

```typescript
    {
      url: `${siteUrl}/agentic-design-patterns`,
      lastModified: new Date(getCatalogDateModified()),
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${siteUrl}/agentic-design-patterns/changelog`,
      lastModified: new Date(getCatalogDateModified()),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
```

Then before the `return [...]` line, add:

```typescript
  // Per-pattern satellites
  const patternRoutes: MetadataRoute.Sitemap = getPatternSlugs().map((slug) => ({
    url: `${siteUrl}/agentic-design-patterns/${slug}`,
    lastModified: new Date(getCatalogDateModified()),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))
```

And update the return:

```typescript
  return [...staticRoutes, ...postRoutes, ...pageRoutes, ...patternRoutes];
```

- [ ] **Step 2: Add keywords**

Edit `/Users/jul/repos/detached-node/src/lib/site-config.ts`. Replace the `siteKeywords` array:

```typescript
export const siteKeywords = [
  "agentic AI",
  "autonomous systems",
  "AI workflows",
  "machine intelligence",
  "failure modes",
  "agentic design patterns",
  "AI agent design patterns",
  "agent design patterns",
  "LLM agent reference",
];
```

- [ ] **Step 3: Verify sitemap renders**

```bash
cd /Users/jul/repos/detached-node && npm run dev &
sleep 5
curl -s http://localhost:3000/sitemap.xml | grep agentic-design-patterns | wc -l
kill %1
```

Expected: 25 (1 hub + 1 changelog + 23 satellites).

- [ ] **Step 4: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/app/sitemap.ts src/lib/site-config.ts
git -C /Users/jul/repos/detached-node commit -m "feat(adp): sitemap entries + site-config keywords"
```

---

## PHASE 1F — Reflexion exemplar

### Task 1.28: Author Reflexion fully

**Files:**
- Modify: `src/data/agentic-design-patterns/patterns/reflexion.ts`

- [ ] **Step 1: Replace the stub with full content**

Overwrite `/Users/jul/repos/detached-node/src/data/agentic-design-patterns/patterns/reflexion.ts`:

```typescript
import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'reflexion',
  name: 'Reflexion',
  alternativeNames: ['Verbal RL', 'Self-Reflection'],
  layerId: 'topology',
  secondaryLayerId: 'state',
  topologySubtier: 'single-agent',
  oneLineSummary: 'Agent writes self-critiques into memory to improve next attempts.',
  bodySummary: [
    'Reflexion lets an agent learn from its own trajectories without updating model weights. After an attempt fails (or succeeds with regrets), the agent generates a verbal critique — a short text describing what went wrong and how to handle the same situation next time — and stores that critique in episodic memory. On the next attempt, the agent retrieves relevant prior critiques and conditions its plan on those lessons.',
    'The mechanism sits at the intersection of Topology (it shapes the agent loop) and State (the lessons are persistent memory). It works best when failures are diagnosable from the trajectory itself — the agent has to be able to articulate what went wrong, which requires the failure mode to be visible in the available signal.',
    'Compared to a generator-critic loop within a single attempt, Reflexion operates across attempts. The critique survives the run; the next time the same problem class appears, the agent starts informed.',
  ],
  mermaidSource: `graph TD
  A[Task] --> B[Generate]
  B --> C[Execute]
  C --> D{Success?}
  D -->|yes| E[Return]
  D -->|no| F[Generate verbal critique]
  F --> G[Append to episodic memory]
  G --> A`,
  mermaidAlt: 'A flowchart: Task feeds Generate, which feeds Execute, which checks Success. On success, Return. On failure, generate a verbal critique, append it to episodic memory, and loop back to Task.',
  whenToUse: [
    'You have a problem class that the agent attempts repeatedly (multi-turn assistant, recurring task type, agent benchmark)',
    'Failures are diagnosable from the trajectory — the agent can articulate what went wrong',
    'You can store and retrieve episodic memory cheaply',
  ],
  whenNotToUse: [
    "The agent is single-shot — there's no second attempt to benefit from the lesson",
    'The critic is the same model with the same prompt — risk of sycophantic self-approval (use a different model or a tool-grounded check; see CRITIC pattern)',
    'Failures are not visible in the trajectory (e.g., stale data — the agent had no way to know it was wrong)',
  ],
  realWorldExamples: [
    { text: 'Cognition\'s Devin uses verbal post-trajectory critique to improve subsequent runs on the same project', sourceUrl: 'https://cognition.ai/blog/devin' },
    { text: 'LangGraph ships a reflection-loop tutorial built on this pattern', sourceUrl: 'https://langchain-ai.github.io/langgraph/tutorials/reflection/reflection/' },
    { text: 'AgentBench reports significant uplift from Reflexion on programming and operating-system tasks', sourceUrl: 'https://arxiv.org/abs/2308.03688' },
  ],
  implementationSketch: `import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

type Episode = { task: string; outcome: 'success' | 'failure'; critique: string }
const memory: Episode[] = []

async function attemptWithReflexion(task: string, maxAttempts = 3): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const lessons = memory
      .filter((m) => m.outcome === 'failure')
      .slice(-3)
      .map((m) => m.critique)
      .join('\\n')
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: \`Lessons from prior attempts:\\n\${lessons}\\n\\nTask: \${task}\`,
    })
    const success = await evaluate(text)
    if (success) return text
    const critique = await generateText({
      model: openai('gpt-4o'),
      prompt: \`Task: \${task}\\nAttempt: \${text}\\nWhy did this fail? Write a one-paragraph lesson for next time.\`,
    })
    memory.push({ task, outcome: 'failure', critique: critique.text })
  }
  throw new Error('Max attempts exceeded')
}

declare function evaluate(output: string): Promise<boolean>`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: 'Same-model critique often produces sycophantic agreement — the model approves its own work even when it shouldn\'t. Pair Reflexion with a different model as the critic, or with a tool-grounded check (see CRITIC).',
    sourceUrl: 'https://arxiv.org/abs/2305.11738',
  },
  relatedSlugs: ['evaluator-optimizer', 'memory-management', 'evaluation-llm-as-judge'],
  frameworks: ['langchain', 'langgraph'],
  references: [
    {
      title: 'Reflexion: Language Agents with Verbal Reinforcement Learning',
      url: 'https://arxiv.org/abs/2303.11366',
      authors: 'Shinn et al.',
      year: 2023,
      venue: 'NeurIPS 2023',
      type: 'paper',
      doi: '10.48550/arXiv.2303.11366',
      note: 'foundational paper',
    },
    {
      title: 'Self-Refine: Iterative Refinement with Self-Feedback',
      url: 'https://arxiv.org/abs/2303.17651',
      authors: 'Madaan et al.',
      year: 2023,
      type: 'paper',
      doi: '10.48550/arXiv.2303.17651',
      note: 'closely related single-attempt variant',
    },
    {
      title: 'CRITIC: Large Language Models Can Self-Correct with Tool-Interactive Critiquing',
      url: 'https://arxiv.org/abs/2305.11738',
      authors: 'Gou et al.',
      year: 2023,
      type: 'paper',
      doi: '10.48550/arXiv.2305.11738',
      note: 'tool-grounded variant — addresses the same-model sycophancy gotcha',
    },
    {
      title: 'Building Effective Agents',
      url: 'https://www.anthropic.com/engineering/building-effective-agents',
      authors: 'Schluntz, E. and Zhang, B. (Anthropic)',
      year: 2024,
      type: 'essay',
      note: 'field-shaping essay; subsumes this pattern as "evaluator-optimizer"',
    },
    {
      title: 'Agentic Design Patterns, Chapter 4: Reflection',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [56, 68],
    },
    {
      title: 'LangGraph — Reflection workflow',
      url: 'https://langchain-ai.github.io/langgraph/tutorials/reflection/reflection/',
      authors: 'LangChain team',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-02',
    },
  ],
  addedAt: '2026-05-02',
  dateModified: '2026-05-02',
  lastChangeNote: 'Initial authoring as the Phase-1 exemplar.',
}
```

- [ ] **Step 2: Run all guardrails**

```bash
cd /Users/jul/repos/detached-node && npm run lint
```

Expected: ESLint passes; typecheck-sketches passes (sketch compiles); validate-references passes (Crossref returns matching titles for the 3 papers — Reflexion, Self-Refine, CRITIC); check-affiliate-links passes; lint-changelog passes.

If validate-references fails on a Crossref hit, double-check the DOI or author surname; tweak.

- [ ] **Step 3: Smoke test in dev**

```bash
npm run dev &
sleep 5
curl -s http://localhost:3000/agentic-design-patterns/reflexion | grep -E '(Reflexion|Reflection|References)' | head -10
kill %1
```

Expected: HTML output shows "Reflexion", "References" headings.

- [ ] **Step 4: Commit**

```bash
git -C /Users/jul/repos/detached-node add src/data/agentic-design-patterns/patterns/reflexion.ts
git -C /Users/jul/repos/detached-node commit -m "feat(adp): author Reflexion satellite — Phase 1 editorial exemplar"
```

---

## PHASE 1G — E2E tests + style guide

### Task 1.29: Hub E2E test

**Files:**
- Create: `tests/e2e/agentic-design-patterns/hub.spec.ts`

- [ ] **Step 1: Write the test**

Create `/Users/jul/repos/detached-node/tests/e2e/agentic-design-patterns/hub.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('/agentic-design-patterns hub', () => {
  test('renders title, all 5 layer sections, and pattern cards', async ({ page }) => {
    await page.goto('/agentic-design-patterns')
    await expect(page.getByRole('heading', { level: 1, name: 'Agentic Design Patterns' })).toBeVisible()
    // 5 layer headers
    for (const layer of ['Topology', 'Quality', 'State', 'Interfaces', 'Methodology']) {
      await expect(page.getByText(new RegExp(`Layer .* — ${layer}`))).toBeVisible()
    }
    // Topology has sub-tier headers
    await expect(page.getByText(/Single-agent \(\d+\)/)).toBeVisible()
    await expect(page.getByText(/Multi-agent \(\d+\)/)).toBeVisible()
    // Reflexion card should be present
    await expect(page.getByRole('link', { name: /Reflexion/ })).toBeVisible()
  })

  test('search bar focuses on / key', async ({ page }) => {
    await page.goto('/agentic-design-patterns')
    await page.keyboard.press('/')
    const search = page.getByLabel('Search agentic design patterns')
    await expect(search).toBeFocused()
  })

  test('layer search-param filters grid', async ({ page }) => {
    await page.goto('/agentic-design-patterns?layer=quality')
    // Quality is visible
    await expect(page.getByText(/Layer 2 — Quality/)).toBeVisible()
    // Topology should NOT render in this filter
    await expect(page.getByText(/Layer 1 — Topology/)).toHaveCount(0)
  })
})
```

- [ ] **Step 2: Run the test**

```bash
cd /Users/jul/repos/detached-node && npm run test:e2e -- tests/e2e/agentic-design-patterns/hub.spec.ts
```

Expected: 3 tests pass.

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add tests/e2e/agentic-design-patterns/hub.spec.ts
git -C /Users/jul/repos/detached-node commit -m "test(adp): hub E2E — layers, search, filter"
```

---

### Task 1.30: Satellite E2E test

**Files:**
- Create: `tests/e2e/agentic-design-patterns/satellite.spec.ts`

- [ ] **Step 1: Write the test**

Create `/Users/jul/repos/detached-node/tests/e2e/agentic-design-patterns/satellite.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('/agentic-design-patterns/reflexion satellite', () => {
  test('renders all 8 content slots', async ({ page }) => {
    await page.goto('/agentic-design-patterns/reflexion')
    // Header
    await expect(page.getByRole('heading', { level: 1, name: 'Reflexion' })).toBeVisible()
    // Slot 1 — overview
    await expect(page.getByText(/learn from its own trajectories/i)).toBeVisible()
    // Slot 2 — diagram
    await expect(page.locator('.mermaid-figure').first()).toBeVisible({ timeout: 10000 })
    // Slot 3 — when to use / not to use
    await expect(page.getByRole('heading', { name: 'When to use' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'When NOT to use' })).toBeVisible()
    // Slot 4 — implementation sketch
    await expect(page.getByRole('heading', { name: 'Implementation sketch' })).toBeVisible()
    await expect(page.getByText('attemptWithReflexion')).toBeVisible()
    // Slot 5 — real-world examples
    await expect(page.getByRole('heading', { name: 'In the wild' })).toBeVisible()
    // Slot 6 — reader gotcha
    await expect(page.getByRole('heading', { name: 'Reader gotcha' })).toBeVisible()
    await expect(page.getByText(/sycophantic agreement/i)).toBeVisible()
    // Slot 7 — related patterns
    await expect(page.getByRole('heading', { name: 'Related patterns' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Evaluator-Optimizer/ })).toBeVisible()
    // Slot 8 — references
    await expect(page.getByRole('heading', { name: 'References' })).toBeVisible()
    await expect(page.getByText('Shinn et al.')).toBeVisible()
    await expect(page.getByText('Madaan et al.')).toBeVisible()
  })

  test('emits Article schema with citations', async ({ page }) => {
    await page.goto('/agentic-design-patterns/reflexion')
    const schema = await page.locator('script[type="application/ld+json"]').first().textContent()
    expect(schema).toBeTruthy()
    const parsed = JSON.parse(schema!)
    const article = Array.isArray(parsed) ? parsed.find((s) => s['@type'] === 'Article') : parsed
    expect(article['@type']).toBe('Article')
    expect(Array.isArray(article.citation)).toBe(true)
    expect(article.citation.length).toBeGreaterThan(0)
  })

  test('unknown slug returns 404', async ({ page }) => {
    const response = await page.goto('/agentic-design-patterns/not-a-real-pattern')
    expect(response?.status()).toBe(404)
  })
})
```

- [ ] **Step 2: Run**

```bash
cd /Users/jul/repos/detached-node && npm run test:e2e -- tests/e2e/agentic-design-patterns/satellite.spec.ts
```

Expected: 3 tests pass.

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add tests/e2e/agentic-design-patterns/satellite.spec.ts
git -C /Users/jul/repos/detached-node commit -m "test(adp): satellite E2E — Reflexion all 8 slots, schema, 404"
```

---

### Task 1.31: Style guide doc

**Files:**
- Create: `docs/superpowers/specs/agentic-design-patterns-style-guide.md`

- [ ] **Step 1: Write the style guide**

Create `/Users/jul/repos/detached-node/docs/superpowers/specs/agentic-design-patterns-style-guide.md`:

```markdown
# Agentic Design Patterns — Style Guide

For subagents (and humans) authoring pattern satellites. Read the
**Reflexion** satellite at `/agentic-design-patterns/reflexion` first;
this guide articulates the rules its content follows.

## Voice

- **Terse, diagnostic.** No marketing. No hedging. State what the pattern
  does and what fails.
- **Second-person imperative for "When to use" and "When NOT to use" bullets.**
  *"You have a problem class the agent attempts repeatedly"* — not *"This
  pattern is appropriate when…"*
- **Third-person observational for `bodySummary` paragraphs.**
  *"Reflexion lets an agent learn from its own trajectories…"* — not *"You
  use Reflexion to…"* (which would conflict with the bullet voice).
- **Paragraphs ≤ 100 words.** Three paragraphs total per `bodySummary`,
  ~300 words combined.

## Attribution rules

The 8 editorial principles from the spec are non-negotiable:
1. Cite the actual sources (3-7 references; papers include DOI)
2. References are validated (lint enforces Crossref/OpenAlex)
3. Original prose only
4. Original diagrams only
5. No affiliate tags on ANY outbound link
6. Page author is named (Julian Ken)
7. Living catalog — bump `dateModified`, add `lastChangeNote` per edit
8. Implementation sketches must compile (or use the pseudocode banner)

## No paraphrasing

The model's instinct will be to compress the source's sentences. Don't.
Read the source, close it, write your own summary from your own
understanding. The style guide includes worked examples below.

### BAD — paraphrase

Source (Shinn et al. 2023):
> "We propose Reflexion, a novel framework to reinforce language agents
> not by updating weights, but instead through linguistic feedback."

Bad summary:
> "Reflexion is a novel framework to reinforce language agents not by
> updating weights, but through linguistic feedback."

(Just changed two words. This is paraphrase.)

### GOOD — original synthesis

> "Reflexion lets an agent learn from its own trajectories without
> updating model weights. After an attempt fails, the agent generates a
> verbal critique and stores it in episodic memory; the next attempt
> conditions on that lesson."

(Captures the same concept in its own structure and vocabulary.)

## Mermaid diagram rules

- Labeled boxes only. **No icon shortcodes** (e.g., `fa:fa-cog`,
  `mdi:foo`) — `securityLevel: 'strict'` rejects them.
- Use `graph TD` for top-down flows; `sequenceDiagram` for protocol
  patterns; `flowchart LR` for left-right pipelines.
- Include `mermaidAlt` text describing the diagram for screen readers.
- Caption auto-renders: *"Original diagram. See References for canonical
  visual treatments in the source literature."* — don't restate this.

## References section

- 3-7 entries per pattern. Fewer than 3 = thin; more than 7 = noise.
- Required fields: `title`, `url`, `authors`, `year`, `type`.
- Papers MUST include `doi` (canonical identifier; lint validates against
  Crossref).
- Books include `pages` for the cited chapter.
- Vendor docs include `accessedAt` (ISO date).
- Order: foundational papers first, then derivative work, then essays,
  then docs.
- `note` is optional but recommended for the foundational entry.

## Implementation sketch

- ~15 lines of TypeScript. Vercel AI SDK or another non-LangChain SDK
  preferred.
- **MUST compile** when `sdkAvailability` is `'first-party-ts'` or
  `'community-ts'`. Lint runs `tsc --strict` against the snippet.
- For `'python-only'` or `'no-sdk'` patterns: snippet is illustrative
  pseudocode and MUST include the banner text *"This pattern's canonical
  SDKs are Python; the snippet below illustrates the structure. See
  References for runnable Python examples."*
- The book uses Python/LangChain — our sketches are for the TypeScript
  audience and should not duplicate the book's example.

## Reader gotcha

- **Optional.** Leave `readerGotcha` undefined rather than fabricate.
- If included: must cite a public source. The text states an operational
  failure mode someone has reported in writing.
- Voice: terse, observational. Not a personal opinion ("I think this
  fails when…") — a sourced report ("Cognition reports this fails
  when…").

## Related patterns

- 2-4 entries. Each MUST resolve to an existing populated pattern (lint
  enforces).
- Order matters: list the most directly related first.

## Common mistakes to avoid

1. **Inventing references.** A 200-OK URL is not enough — the cited
   author/year/venue must match what's at the URL. Lint catches this.
2. **TypeScript that looks plausible but doesn't compile.** Lint catches
   this.
3. **Affiliate-tagged Amazon URLs.** Lint catches this.
4. **Forgetting the changelog entry.** Lint catches this.
5. **Modifying another pattern's file in your PR.** Reviewer (Julian)
   catches this.
6. **Paraphrasing the source's prose.** Hard to catch automatically;
   `scripts/check-pattern-overlap.mjs` is a manual tool.

## STYLE_PASS checklist

Paste into PR body:

- [ ] All required slots populated; types compile
- [ ] `npm run lint` passes (typecheck-sketches, validate-references,
      check-affiliate-links, lint-changelog)
- [ ] Voice matches Reflexion exemplar
- [ ] No prose copied or paraphrased from sources
- [ ] Mermaid renders in `npm run dev`; alt text written
- [ ] All outbound URLs return 200
- [ ] Cross-links resolve to populated patterns
- [ ] References: 3-7 entries; papers have DOIs
- [ ] Did NOT modify any other pattern's file
- [ ] CHANGELOG entry added with matching date
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/jul/repos/detached-node add docs/superpowers/specs/agentic-design-patterns-style-guide.md
git -C /Users/jul/repos/detached-node commit -m "docs(adp): style guide for pattern authoring"
```

---

## PHASE 3 — Polish & launch

### Task 3.1: Add navigation link

**Files:**
- Modify: `src/app/(frontend)/layout.tsx`

- [ ] **Step 1: Add to nav**

Edit `/Users/jul/repos/detached-node/src/app/(frontend)/layout.tsx`. Find the `<nav>` block (around line 97-107) and add a new `<Link>`:

```tsx
                <nav className="flex flex-wrap items-center gap-4 text-sm font-mono tracking-[0.04em] text-text-secondary sm:gap-6" aria-label="Main navigation">
                  <Link className="hover:text-accent py-2 transition-colors focus-ring" href="/">
                    Home
                  </Link>
                  <Link className="hover:text-accent py-2 transition-colors focus-ring" href="/posts">
                    Posts
                  </Link>
                  <Link className="hover:text-accent py-2 transition-colors focus-ring" href="/agentic-design-patterns">
                    Patterns
                  </Link>
                  <Link className="hover:text-accent py-2 transition-colors focus-ring" href="/about">
                    About
                  </Link>
                </nav>
```

- [ ] **Step 2: Smoke test**

```bash
cd /Users/jul/repos/detached-node && npm run dev &
sleep 5
curl -s http://localhost:3000 | grep "agentic-design-patterns" | head -3
kill %1
```

Expected: at least one match.

- [ ] **Step 3: Commit**

```bash
git -C /Users/jul/repos/detached-node add 'src/app/(frontend)/layout.tsx'
git -C /Users/jul/repos/detached-node commit -m "feat(adp): add Patterns to global nav"
```

---

### Task 3.2: Final verification + Lighthouse

- [ ] **Step 1: Run full test suite**

```bash
cd /Users/jul/repos/detached-node && npm run lint && npm run test:unit && npm run test:e2e
```

Expected: all green.

- [ ] **Step 2: Build production**

```bash
npx next build
```

Expected: success.

- [ ] **Step 3: Run Lighthouse against hub + Reflexion satellite**

```bash
npm run start &
sleep 5
npx lighthouse http://localhost:3000/agentic-design-patterns --output json --output-path /tmp/lh-hub.json --only-categories=performance,accessibility,best-practices,seo
npx lighthouse http://localhost:3000/agentic-design-patterns/reflexion --output json --output-path /tmp/lh-reflexion.json --only-categories=performance,accessibility,best-practices,seo
kill %1
```

Verify each category ≥ 95. If not, investigate (likely candidate: optimize first paint or a11y miss).

- [ ] **Step 4: Schema validation**

Open https://search.google.com/test/rich-results manually and validate:
- `https://[your-preview-domain]/agentic-design-patterns`
- `https://[your-preview-domain]/agentic-design-patterns/reflexion`

Expected: Article schema detected; citation array present on satellite.

- [ ] **Step 5: Pre-launch checklist sign-off**

Open the spec's pre-launch checklist (in `docs/superpowers/specs/2026-05-02-agentic-design-patterns-reference-design.md`) and tick each item.

- [ ] **Step 6: Commit any final fixes from steps 3-5**

```bash
git -C /Users/jul/repos/detached-node add -p
# Stage selectively
git -C /Users/jul/repos/detached-node commit -m "chore(adp): pre-launch fixes from Lighthouse + Rich Results validation"
```

---

### Task 3.3: Open the GitHub epic for Phase 2

- [ ] **Step 1: Open the epic issue**

```bash
gh -R julianken/detached-node issue create --title "Author all remaining 22 agentic design pattern satellites (Phase 2 epic)" --body "$(cat <<'EOF'
This epic tracks Phase 2 of the agentic-design-patterns reference: authoring
the 22 pattern satellites that ship as stubs alongside the Reflexion
exemplar.

## Reference materials

- **Spec:** \`docs/superpowers/specs/2026-05-02-agentic-design-patterns-reference-design.md\`
- **Plan:** \`docs/superpowers/plans/2026-05-02-agentic-design-patterns-reference.md\` (this Phase 2 happens AFTER the plan completes Phase 1+3)
- **Style guide:** \`docs/superpowers/specs/agentic-design-patterns-style-guide.md\`
- **Editorial exemplar:** the **Reflexion** satellite at \`/agentic-design-patterns/reflexion\`
- **Source PDF (fact-checking only):** \`docs/agentic-design-patterns/Agentic_Design_Patterns.pdf\`

## Sub-issues

22 sub-issues, one per pattern (linked here as they're created):

- [ ] prompt-chaining
- [ ] routing
- [ ] parallelization
- [ ] orchestrator-workers
- [ ] evaluator-optimizer
- [ ] tool-use-react
- [ ] code-agent
- [ ] planning
- [ ] rag
- [ ] agentic-rag
- [ ] memory-management
- [ ] context-engineering
- [ ] multi-agent-debate
- [ ] handoffs-swarm
- [ ] a2a
- [ ] mcp
- [ ] human-in-the-loop
- [ ] guardrails
- [ ] evaluation-llm-as-judge
- [ ] streaming
- [ ] checkpointing
- [ ] 12-factor-agent

## Wave order

Foundational topology first; multi-agent and interfaces last:
- Wave 1: prompt-chaining, routing, parallelization, planning, tool-use-react
- Wave 2: rag, evaluator-optimizer, code-agent, agentic-rag
- Wave 3: memory-management, context-engineering, checkpointing
- Wave 4: orchestrator-workers, multi-agent-debate, handoffs-swarm
- Wave 5: mcp, a2a, streaming
- Wave 6: guardrails, human-in-the-loop, evaluation-llm-as-judge, 12-factor-agent

## STYLE_PASS checklist

Every PR uses the checklist from the style guide.
EOF
)"
```

(If `gh` complains, fall back to opening it manually in the browser.)

- [ ] **Step 2: Verify it opened**

```bash
gh -R julianken/detached-node issue list --limit 3
```

Expected: the new epic appears in the list.

---

## Self-review

(Inline check after writing the plan.)

- ✓ **Spec coverage:** Every section of the spec maps to tasks above. Phase 0 spike tasks 0.1-0.3; Phase 1A data scaffold tasks 1.1-1.7; Phase 1B lint scripts tasks 1.8-1.14; Phase 1C schema tasks 1.15-1.16; Phase 1D components tasks 1.17-1.22; Phase 1E routes tasks 1.23-1.27; Phase 1F Reflexion exemplar task 1.28; Phase 1G tests + style guide tasks 1.29-1.31; Phase 3 launch tasks 3.1-3.3. Phase 2 (parallel agentic dispatch) deliberately not in plan — it's an epic + sub-issues workflow that runs after this plan ships, captured in Task 3.3.
- ✓ **Placeholder scan:** No "TBD/TODO/fill in details." Every code block has the actual code. Every command has the expected output.
- ✓ **Type consistency:** `Pattern`, `Reference`, `Layer`, `LayerId`, `TopologySubtier`, `SdkAvailability` types defined in Task 1.2 and consistently used in helpers (Task 1.5), schema (Task 1.15), components (1.17-1.22), routes (1.23-1.24), and lint scripts (1.8-1.13).
- ✓ **Naming consistency:** `getPattern`, `getPatternsByLayer`, `getTopologyPatterns`, `getPatternSlugs`, `getAdjacentPatterns`, `getCatalogDateModified`, `getCatalogPatternCount` defined once and used as-is throughout.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-05-02-agentic-design-patterns-reference.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
