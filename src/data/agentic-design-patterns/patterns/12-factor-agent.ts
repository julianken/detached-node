import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: '12-factor-agent',
  name: '12-Factor Agent',
  alternativeNames: ['12-Factor Agents', '12FA'],
  layerId: 'methodology',
  oneLineSummary: 'Catalogues twelve principles a team applies to push an agent from demo to production.',
  bodySummary: [
    "12-Factor Agent is a methodology, not a mechanism. Dexter Horthy and the HumanLayer community catalogued twelve principles a team applies to push an agent across the gap between a 70-percent demo and software a customer touches: own your prompts, own your context window, treat tools as structured outputs, unify execution and business state, expose launch / pause / resume as APIs, contact humans through tool calls, own your control flow, compact errors back into the window, keep agents small and focused, trigger from anywhere, and make the agent a stateless reducer over an event log. The lineage to Adam Wiggins' 12-Factor App is deliberate: a cloud-portable operational mindset, applied to LLM-powered software.",
    "The pattern sits one layer up from the rest of this catalog. Reflexion, Checkpointing, Tool Use ReAct, and the others are mechanisms: concrete loops or protocols a system either runs or does not. 12-Factor is the lens that decides which mechanisms an agent assembles, which abstractions it owns rather than imports, and which framework defaults it dismantles to keep production behaviour legible. The methodology is opinionated about plumbing: the loop is code a developer can step through, the prompt lives in the repo, the context window is assembled by a function a reviewer can read, and the run survives a restart because its state is durable and its reducer is pure.",
    "The principles compose with the rest of the catalog rather than competing. Factor 3 (own your context window) is the operational shape of Context Engineering. Factor 5 (unify state) and factor 12 (stateless reducer) are the contract Checkpointing relies on. Factor 7 (contact humans with tool calls) is one Human-in-the-Loop implementation. Factor 4 (tools as structured outputs) is the wire shape Tool Use ReAct emits. Adoption costs the work of taking abstractions back from a framework; the payoff is that every later debugging session, eval, or incident touches code the team owns end to end.",
  ],
  mermaidSource: `graph LR
  A[Existing agent: framework hides prompt, loop, state] --> B[Audit against 12 factors]
  B --> C[Own your prompts and context window]
  B --> D[Tools as structured outputs; unify state]
  B --> E[Own your control flow; stateless reducer]
  B --> F[Launch/pause/resume; contact humans via tool calls]
  C --> G[Production-grade agent: legible, durable, portable]
  D --> G
  E --> G
  F --> G`,
  mermaidAlt: 'Twelve principles applied as a methodology: an existing agent is audited against the factors, and four refactor tracks — own the prompt and context, tools as structured outputs, own the control flow, expose lifecycle APIs — converge on a production-grade agent the team can step through and own end to end.',
  whenToUse: [
    'Right call when an agent prototype has hit the 70–80 percent quality wall and the next gain requires reaching past framework abstractions into the prompt, the loop, and the state machine.',
    'Justified where a team owns the agent in production (they answer the pages, write the evals, and ship the patches) and needs every layer of the runtime to be code they can read and step through.',
    'A good fit when porting an agent across runtimes (web request, queue worker, cron, webhook, Slack bot) and the same business logic must trigger from anywhere without a rewrite.',
    'Worth the cost when an audit, compliance review, or incident review will demand an account of exactly what the model saw, what it returned, and which deterministic code acted on the result.',
  ],
  whenNotToUse: [
    'When the agent is a one-off prototype, an internal demo, or a research notebook whose lifetime is shorter than the cost of dismantling a framework abstraction.',
    'Without a team that owns the runtime end to end, the methodology produces a half-refactored codebase whose framework defaults and hand-rolled pieces fight each other in production.',
    'When the bottleneck is base-model capability rather than engineering: owning your prompts will not rescue an agent whose underlying reasoning cannot solve the task at any prompt.',
  ],
  realWorldExamples: [
    {
      text: 'HumanLayer publishes the methodology as an open guide with twelve linked factor essays, an AI Engineer World\'s Fair conference talk, and a public Discord. It is the canonical reference and the only widely-cited treatment of 12-factor for agents.',
      sourceUrl: 'https://github.com/humanlayer/12-factor-agents',
    },
    {
      text: 'The got-agents/agents repository ships deploybot-ts and linear-assistant-ts as worked examples that embody the methodology: small, focused TypeScript agents whose loop, prompts, and state are owned by the application code rather than a framework.',
      sourceUrl: 'https://github.com/got-agents/agents',
    },
    {
      text: 'HumanLayer\'s own kubechain runtime applies the principles to distributed agents on Kubernetes, with explicit launch/pause/resume APIs and a stateless reducer model so workers can be evicted and rescheduled without losing run state.',
      sourceUrl: 'https://github.com/humanlayer/kubechain',
    },
  ],
  implementationSketch: `// Demonstrates Factor 12: agent as a stateless reducer over an event log.
// The loop, the prompt, and the context assembly are all owned by application
// code rather than hidden behind a framework Agent class.
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

type Event =
  | { kind: 'user_message'; text: string }
  | { kind: 'tool_call'; name: string; args: unknown }
  | { kind: 'tool_result'; name: string; result: unknown }
  | { kind: 'done'; answer: string }

const NextStep = z.discriminatedUnion('intent', [
  z.object({ intent: z.literal('call_tool'), name: z.string(), args: z.record(z.unknown()) }),
  z.object({ intent: z.literal('done'), answer: z.string() }),
])

declare function renderContext(events: Event[]): string                // Factor 3: own the window
declare function executeTool(name: string, args: unknown): Promise<unknown>

async function step(events: Event[]): Promise<Event> {                  // Factor 12: pure reducer
  const { object } = await generateObject({                             // Factor 4: tools as structured output
    model: openai('gpt-4o'),
    schema: NextStep,
    prompt: renderContext(events),                                      // Factor 2: own the prompt
  })
  if (object.intent === 'done') return { kind: 'done', answer: object.answer }
  const result = await executeTool(object.name, object.args)
  return { kind: 'tool_result', name: object.name, result }
}

async function run(initial: Event[]): Promise<string> {                 // Factor 8: own the loop
  const events = [...initial]
  while (true) {
    const next = await step(events)
    events.push(next)                                                   // Factor 5: unified state
    if (next.kind === 'done') return next.answer
  }
}

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: "Factor 12's stateless reducer only holds if the reducer is actually pure: a stray Date.now(), an unguarded fetch, or a closure over module-level mutable state inside the step function silently breaks resume, replay, and audit. HumanLayer documents this as the price of admission for owning your control flow: side-effecting work belongs in the executeTool boundary, not in the reducer that decides the next step.",
    sourceUrl: 'https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-12-stateless-reducer.md',
  },
  relatedSlugs: ['checkpointing', 'context-engineering', 'tool-use-react', 'evaluation-llm-as-judge'],
  frameworks: [],
  references: [
    {
      title: '12-Factor Agents — Principles for building reliable LLM applications',
      url: 'https://github.com/humanlayer/12-factor-agents',
      authors: 'Dexter Horthy and HumanLayer contributors',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'canonical and load-bearing reference; the twelve factors and their per-factor essays',
    },
    {
      title: 'Factor 3: Own your context window',
      url: 'https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-03-own-your-context-window.md',
      authors: 'Dexter Horthy',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'the factor that sits underneath Context Engineering; explicit prompt assembly over framework defaults',
    },
    {
      title: 'Factor 12: Make your agent a stateless reducer',
      url: 'https://github.com/humanlayer/12-factor-agents/blob/main/content/factor-12-stateless-reducer.md',
      authors: 'Dexter Horthy',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'reducer-shaped agent that composes with Checkpointing and journal-based durable execution',
    },
    {
      title: 'The Twelve-Factor App',
      url: 'https://12factor.net/',
      authors: 'Adam Wiggins',
      year: 2011,
      type: 'essay',
      note: 'the Heroku-era predecessor whose framing 12-factor agents adapts; methodology lineage, not direct technical content',
    },
    {
      title: 'Building Effective Agents',
      url: 'https://www.anthropic.com/engineering/building-effective-agents',
      authors: 'Anthropic',
      year: 2024,
      type: 'essay',
      note: 'companion field guide; the 12-factor essays cite this as the catalog of mechanisms the methodology selects among',
    },
    {
      title: '12-Factor Agents: Patterns of reliable LLM applications (AI Engineer World\'s Fair)',
      url: 'https://www.youtube.com/watch?v=8kMaTybvDUw',
      authors: 'Dexter Horthy',
      year: 2025,
      type: 'essay',
      note: 'conference talk presenting the methodology; treated as a primary source by HumanLayer',
    },
    {
      title: 'Agentic Design Patterns — A Thought Leader\'s Perspective: Power and Responsibility (foreword)',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Marco Argenti (foreword); Antonio Gulli (book)',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [4, 6],
      note: 'frames agent engineering as a tenet-driven discipline ("Build with Purpose, Look Around Corners, Inspire Trust") — a parallel methodology argument from the CIO of Goldman Sachs',
    },
  ],
  addedAt: '2026-05-04',
  dateModified: '2026-05-05',
  lastChangeNote: 'W3.0 — Update background-agent → cloud-agent URL in realizingInCursor.',
  realizingInClaudeCode: {
    openingFraming: '12-Factor Agent is a methodology, not a single mechanism. Each factor maps to one or more patterns in this catalog; the table below names the most direct correspondence. Apply the factors by reaching for the matching patterns in the order your agent needs them.',
    umbrellaPointers: [
      { patternSlug: 'context-engineering', oneLine: 'Factor 3 (own your context window) — explicit context assembly over framework defaults.' },
      { patternSlug: 'checkpointing', oneLine: 'Factor 5 (unify state) + Factor 12 (stateless reducer) — durable state machine the reducer runs over.' },
      { patternSlug: 'tool-use-react', oneLine: 'Factor 4 (tools as structured outputs) — structured tool call shape the React loop emits.' },
      { patternSlug: 'human-in-the-loop', oneLine: 'Factor 7 (contact humans via tool calls) — pause-and-resume pattern wired to the human approval gate.' },
      { patternSlug: 'guardrails', oneLine: 'Factor 6 (own your control flow) — runtime enforcement layer the owning code can audit and update.' },
      { patternSlug: 'evaluation-llm-as-judge', oneLine: 'Factor 11 (trigger from anywhere) — evaluator running as CI step independent of the agent runtime.' },
    ],
    closingRule: 'If a rule has a trigger ("when adding screenshots", "before committing", "during PR review"), it belongs in a skill, not here.',
    ccPrimitives: [
      'CLAUDE.md (prompt ownership)',
      'settings.json (loop configuration)',
      'Task tool (subagent boundaries)',
      'Disk artifacts (unified state store)',
    ],
    seeAlso: {
      siblingPatternSlugs: ['checkpointing', 'context-engineering', 'tool-use-react', 'evaluation-llm-as-judge'],
    },
  },
  realizingInCursor: {
    keyMoves: [
      'Write the agent\'s prompt in a `.cursor/rules/*.mdc` file with `alwaysApply: true` — factor 2: prompt lives in the repo.',
      'Use Agent mode for the executor loop; write intermediate state to disk files and read them back via `@file` — factor 5.',
      'Use [Plan mode](https://cursor.com/docs/agent/plan-mode) to draft the step list before execution — factor 8 (own the loop).',
      'Gate each phase on a CI check via [cloud agents](https://cursor.com/docs/cloud-agent) PR-based flow — factors 9 and 10.',
    ],
    ccPrimitives: [
      '.cursor/rules/*.mdc (prompt ownership)',
      '@file (unified state between steps)',
      'Plan mode (explicit step list)',
      'Cloud agents (CI-gated phases)',
    ],
    seeAlso: {
      siblingPatternSlugs: ['checkpointing', 'context-engineering', 'tool-use-react', 'evaluation-llm-as-judge'],
    },
  },
}
