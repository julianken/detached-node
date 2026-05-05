import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'parallelization',
  name: 'Parallelization',
  alternativeNames: ['Sectioning', 'Voting', 'Self-Consistency', 'Fan-out / Fan-in'],
  layerId: 'topology',
  topologySubtier: 'single-agent',
  oneLineSummary: 'Fan a fixed set of LLM calls out at once, collapse with a deterministic aggregator.',
  bodySummary: [
    'Parallelization issues N independent LLM calls at the same time and reduces their outputs through a deterministic aggregator. The fan-out shape is decided at author time, not by an LLM at runtime: the program either splits the input into pre-defined sections that each get their own prompt, or fires the same prompt N times to get diverse rollouts of the same question. Anthropic\'s essay names these the Sectioning and Voting variants — the topology and aggregation discipline are identical; what differs is whether the N prompts are different sub-task instructions or N copies of the same one.',
    'Sectioning earns its rent when attention degrades inside a single prompt — a long document split into chunks each summarised in isolation, a guardrails screen running alongside the content model, or independent tool calls hitting different APIs whose latency would otherwise add up sequentially. Voting earns it on tasks with verifiable answers where errors across rollouts are uncorrelated: Wang and colleagues show that sampling several chain-of-thought paths and taking the majority answer raises arithmetic and commonsense accuracy past greedy decoding without any new training. The aggregator is the part the pattern lives or dies on — majority vote, sum, schema-typed merge, LLM-as-judge — whichever rule fires must be deterministic enough that the same N answers always collapse to the same commit.',
    'Parallelization sits next to but distinct from Orchestrator-Workers and Multi-Agent Debate. Orchestrator-Workers asks an LLM planner what to dispatch and how to merge, so the decomposition is dynamic and the aggregator is itself a model call; here the dispatch list is fixed and the aggregator is code. Multi-Agent Debate fires prompts in parallel too, but agents then read each other\'s answers and revise across rounds before any vote; these branches never see one another. Cost profile differs: parallelization pays N times the prompt overhead but wall-clock is bounded by the slowest branch — buying latency at the price of tokens.',
  ],
  mermaidSource: `graph LR
  A[Input] --> B[Fan-out]
  B --> C1[LLM call 1]
  B --> C2[LLM call 2]
  B --> C3[LLM call N]
  C1 --> D[Deterministic aggregator]
  C2 --> D
  C3 --> D
  D --> E[Final answer]`,
  mermaidAlt: 'A left-to-right flowchart in which an Input feeds a Fan-out node that dispatches the work to N independent LLM calls running in parallel, whose outputs all converge on a deterministic aggregator that produces the final answer.',
  whenToUse: [
    'Apply when the workload decomposes into independent sub-tasks at author time — long-document chunks, multi-API lookups, parallel guardrail screens — and the slowest branch is what gates wall-clock latency.',
    'Use where the aggregation rule is decidable in code — majority vote on a single answer field, sum or concatenation by section, schema-typed merge, longest-justification heuristic — so the parallel branches collapse to one committable output.',
    'Reach for it on questions with verifiable answers where uncorrelated samples raise accuracy past greedy decoding (arithmetic, multiple choice, code generation), as the Self-Consistency line of work demonstrates.',
    'Prefer it for safety-critical reads where one model handles the user query while a sibling model independently screens it, so the guardrail decision is not entangled with the response prompt.',
  ],
  whenNotToUse: [
    'When the sub-tasks are not knowable up front and the planner must read the input before deciding what to dispatch, the Orchestrator-Workers pattern is the right shape and parallelization will under-cover the request.',
    'Without a deterministic aggregator that collapses N candidates to one commit, the system has no contract for what to return and silently drifts between branches on otherwise identical inputs.',
    'When the branches need to react to each other\'s findings mid-task — debate, refinement, hand-off — the lack of cross-talk in parallelization defeats the purpose and Multi-Agent Debate or a sequential chain is the better fit.',
  ],
  realWorldExamples: [
    {
      text: 'Anthropic\'s public cookbook ships a runnable parallelization workflow whose top-level helper takes a single prompt and a list of N inputs, runs them concurrently with asyncio.gather, and returns the per-input outputs ready for an aggregator step — the exact fan-out shape this pattern names.',
      sourceUrl: 'https://github.com/anthropics/anthropic-cookbook/blob/main/patterns/agents/basic_workflows.ipynb',
    },
    {
      text: 'LangGraph documents a Parallelization workflow built from two nodes that share a common parent and converge on an aggregator, the framework primitive for branching from one state into N concurrent paths and merging their results back.',
      sourceUrl: 'https://docs.langchain.com/oss/python/langgraph/workflows-agents',
    },
    {
      text: 'Google ADK exposes a ParallelAgent primitive whose sub-agents run concurrently and write into shared session state, paired with a downstream merger agent that synthesises their outputs — a production wiring of the fan-out and aggregator split.',
      sourceUrl: 'https://google.github.io/adk-docs/agents/multi-agents/',
    },
  ],
  implementationSketch: `import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const Vote = z.object({ answer: z.string() })

export async function selfConsistency(question: string, samples = 5): Promise<string> {
  const rollouts = await Promise.all(
    Array.from({ length: samples }, () =>
      generateObject({
        model: openai('gpt-4o-mini'),
        schema: Vote,
        prompt: \`Think step by step, then return only the final answer.\\nQuestion: \${question}\`,
      }).then((r) => r.object.answer.trim()),
    ),
  )
  const tally = new Map<string, number>()
  for (const a of rollouts) tally.set(a, (tally.get(a) ?? 0) + 1)
  let best = rollouts[0]!
  let bestCount = 0
  for (const [a, n] of tally) if (n > bestCount) { best = a; bestCount = n }
  return best
}

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: 'Wang and colleagues show that self-consistency only beats greedy decoding when the sampled chains are diverse enough to disagree — when temperature is low or the prompt over-constrains the rollouts, the N samples concentrate on the same answer and the majority vote inherits whatever bias the single rollout had. The fix is to perturb sampling (raise temperature, vary the prompt seed, swap demonstration orderings) so the rollouts genuinely explore the answer space rather than re-rendering the same trajectory.',
    sourceUrl: 'https://arxiv.org/abs/2203.11171',
  },
  relatedSlugs: ['orchestrator-workers', 'multi-agent-debate', 'prompt-chaining', 'routing'],
  frameworks: ['langgraph', 'langchain', 'google-adk', 'vercel-ai-sdk'],
  references: [
    {
      title: 'Self-Consistency Improves Chain of Thought Reasoning in Language Models',
      url: 'https://arxiv.org/abs/2203.11171',
      authors: 'Wang et al.',
      year: 2022,
      venue: 'ICLR 2023',
      type: 'paper',
      doi: '10.48550/arXiv.2203.11171',
      note: 'foundational voting variant: sample N chains-of-thought, take the majority answer; source for the diversity gotcha',
    },
    {
      title: 'Skeleton-of-Thought: Prompting LLMs for Efficient Parallel Generation',
      url: 'https://arxiv.org/abs/2307.15337',
      authors: 'Ning et al.',
      year: 2023,
      venue: 'ICLR 2024',
      type: 'paper',
      doi: '10.48550/arXiv.2307.15337',
      note: 'sectioning variant: a skeleton pass plans bullets, then point bodies are generated in parallel and assembled',
    },
    {
      title: 'Building Effective Agents',
      url: 'https://www.anthropic.com/engineering/building-effective-agents',
      authors: 'Anthropic',
      year: 2024,
      type: 'essay',
      note: 'names parallelization as a workflow with Sectioning and Voting variants; contrasts it with Orchestrator-Workers',
    },
    {
      title: 'LangGraph — Workflows and agents (parallelization section)',
      url: 'https://docs.langchain.com/oss/python/langgraph/workflows-agents',
      authors: 'LangChain team',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'reference implementation: branch from a parent node into N concurrent paths and aggregate at a join node',
    },
    {
      title: 'Anthropic Cookbook — Basic agent workflows (parallelization)',
      url: 'https://github.com/anthropics/anthropic-cookbook/blob/main/patterns/agents/basic_workflows.ipynb',
      authors: 'Anthropic',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'runnable parallel(prompt, inputs, n_workers) helper with stakeholder-impact-analysis worked example',
    },
    {
      title: 'Google ADK — Multi-Agent Systems (ParallelAgent)',
      url: 'https://google.github.io/adk-docs/agents/multi-agents/',
      authors: 'Google',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'ParallelAgent primitive runs sub-agents concurrently and writes results into session state for a merger agent',
    },
    {
      title: 'Agentic Design Patterns, Chapter 3: Parallelization',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [49, 64],
    },
  ],
  addedAt: '2026-05-03',
  dateModified: '2026-05-05',
  lastChangeNote: 'W2.1: add realizingInClaudeCode Tier A — dispatch-mechanic altitude, PR #218 worked example, single-message multi-Task() mechanic.',
  realizingInClaudeCode: {
    tier: 'A',
    ccPrimitives: [
      'single-message multi-Task() mechanic — dispatching all N Task() calls inside one assistant message is the primitive that converts N serial round-trips into one parallel wall-clock window; Claude Code executes concurrent tool_use blocks for every call in the message simultaneously',
      'Task tool (sub-agent dispatch) — each branch runs in its own context window with its own prompt, tool subset, and scratch space; branches are isolated by construction, not by opt-in configuration',
      'Deterministic aggregation step — the dispatching session reads worker output files from disk after all Task() calls complete; the aggregation rule (concatenate by section, pick majority answer, schema-typed merge) is encoded in the orchestrator prompt, not delegated back to a model call',
    ],
    scaffolding: [
      '.claude/skills/analysis-funnel/SKILL.md — the orchestrator prompt that encodes the phase cardinality (5+5+3+1), the single-message dispatch constraint, and the disk-checkpoint protocol between phases; loaded into the dispatching session before any Task() call fires',
      'phase-{N}/{role}-{slug}.md artifact convention — each worker writes its output to a deterministic file path before the wave ends; the aggregation step reads these files rather than accumulating worker transcripts in the orchestrator context',
      'context-packet forwarding — between phases the orchestrator assembles a 1–2 K token summary from the current-phase artifacts and passes it as the dispatch payload for the next wave; keeps worker contexts clean and prevents the orchestrator context from growing unbounded',
      'Worktree-per-issue branch convention — each subagent workflow runs on a dedicated branch and a dedicated git worktree; the dispatching session and worker sessions do not share a working tree, which prevents file-system race conditions during parallel writes',
      'Parallel fan-out cardinality — five investigators in Phase 1, five iterators in Phase 2, three synthesizers in Phase 3 (5+5+3+1 cardinality); the specific cardinality is a choice encoded in the analysis-funnel skill, not a CC-native primitive',
      'Phase-boundary disk checkpoint — workers write findings to disk before the next phase dispatches; the checkpoint protocol is a convention encoded in the analysis-funnel SKILL.md, not a feature of Claude Code itself',
    ],
    workedExample: {
      url: 'https://github.com/julianken/detached-node/pull/218',
      description: `PR #218 — "feat: agentic design patterns reference — 23 satellites" — is the canonical instance of the Parallelization pattern at dispatch-mechanic altitude in this repository. The configuration that produced it ran the analysis-funnel skill and dispatched five parallel investigators in a single assistant message: schema design, satellite page layout, mermaid rendering, reference validation, and E2E coverage. All five Task() calls were issued in one message. Claude Code executed all five tool_use blocks concurrently. Each investigator wrote findings to a phase-1 artifact file on disk before the orchestrator read them back.

The single-message dispatch is the structural detail that makes PR #218 evidence for Parallelization rather than for a sequential chain. The same five investigators run serially — one Task() call per assistant message — would produce identical output files and identical final PR content, but the elapsed time would be five times longer, because each investigator would have to wait for the prior one to complete before its tool_use block could start. The single-message fan-out is the specific mechanic that buys the latency reduction; everything else — the phase structure, the disk checkpoints, the context-packet forwarding — is scaffolding that makes the mechanic reliable across multiple waves.

Anthropic's multi-agent research blog (https://www.anthropic.com/engineering/multi-agent-research-system) describes structurally identical mechanics at production scale. Their research system dispatches parallel subagents that explore branches of a search question concurrently, each in its own context window, with outputs later aggregated by a synthesis pass. The claimed ~90% latency reduction relative to a sequential search reflects the same arithmetic: wall-clock is bounded by the slowest branch, not the sum of all branches. The five-investigator run in PR #218 is the same shape at smaller cardinality — same parallel dispatch, same context isolation, same disk-read aggregation.

The distinction from the Orchestrator-Workers framing is altitude, not mechanics. The Orchestrator-Workers realization frames PR #218 at the architecture altitude: a central planner decided at runtime how many workers to spawn and what each one was asked to do, based on the input scope. This section frames the same PR at the dispatch-mechanic altitude: the single-message multi-Task() block is the specific Claude Code primitive that realizes the fan-out topology, and the parallel-wall-clock arithmetic is the reason the mechanic is worth using. Both framings cite the same evidence anchor; they describe different questions about it.

The worked example also shows where the pattern's aggregation discipline matters in practice. Phase 1 produces five artifact files; the aggregation step must read all five and produce a coherent context packet before Phase 2 can dispatch. If the aggregation rule is underspecified — if the orchestrator prompt does not tell the session how to resolve disagreements between investigators or how to weight their outputs — the context packet for Phase 2 will carry conflicting signals that downstream workers have to untangle. In PR #218, the analysis-funnel SKILL.md encodes the aggregation rule alongside the dispatch constraint, so both halves of the pattern are expressed in one artifact.`,
    },
    readerMove: {
      text: 'Inspect every dispatch message: N Task() calls in one message buys parallel wall-clock; N messages × 1 call serializes the work.',
      anchorUrl: 'https://github.com/julianken/detached-node/blob/main/.claude/skills/analysis-funnel/SKILL.md',
    },
    seeAlso: {
      skillPath: '.claude/skills/analysis-funnel/SKILL.md',
      siblingPatternSlugs: ['orchestrator-workers', 'checkpointing'],
    },
    bodyMarkdown: `Parallelization in Claude Code reduces to one structural choice: how many Task() calls appear in a single assistant message. Dispatching N workers in one message tells Claude Code to execute all N tool_use blocks concurrently — wall-clock is bounded by the slowest worker, not the sum. Dispatching one worker per message serializes the work and multiplies wall-clock by N. The fan-out shape, the context isolation, and the deterministic aggregator that the abstract pattern describes all depend on that single dispatch decision being made correctly.

### The single-message mechanic

A Task() call issues a sub-agent into its own context window with its own prompt, tool surface, and scratch space. When multiple Task() calls appear in the same assistant message, Claude Code runs them as concurrent tool_use blocks. The parallelism is not opt-in and requires no framework configuration — it is the default behavior when the dispatch message contains more than one tool call. The practitioner's job is to ensure that the N workers actually arrive in one message rather than being issued sequentially across N messages.

The analysis-funnel SKILL.md encodes this as an explicit constraint: dispatching Phase 1 investigators one at a time is treated as a defect, not a style preference. The SKILL.md carries the phase cardinality (5+5+3+1), the disk-checkpoint protocol between phases, and the context-packet forwarding convention — but the single-message dispatch constraint is the load-bearing rule the skill exists to enforce.

### Why the Anthropic blog arithmetic holds

Anthropic's multi-agent research blog (https://www.anthropic.com/engineering/multi-agent-research-system) reports roughly 90% latency reduction from parallel dispatch relative to sequential search. The arithmetic is straightforward: if each worker takes time T and you dispatch N workers, sequential execution takes N × T while parallel execution takes max(T₁, T₂, … Tₙ). At five workers of roughly equal cost, the parallel wall-clock approaches 20% of the sequential wall-clock — the reported ~90% reduction is the same bound from the other side. The blog describes structurally identical mechanics at production scale; PR #218 is the same pattern at five-investigator cardinality.

The token economics run in the opposite direction. N concurrent workers pay N times the prompt overhead. That cost is unavoidable and worth instrumenting: the analysis-funnel configuration pays five times the Phase 1 brief cost plus the skill context cost, and the aggregation step pays again over the merged artifacts. The pattern earns its token multiplier when the task is parallelisable enough that the wall-clock savings justify the cost — and when the fan-out topology maps cleanly to the actual sub-task structure.

### Aggregation discipline

A parallel fan-out without a specified aggregation rule is a pattern fragment. The outputs arrive on disk from all N workers; something has to read them and produce a single committable result. In the analysis-funnel configuration, the aggregation rule is encoded in the SKILL.md alongside the dispatch constraint: the orchestrator assembles a 1–2 K token context packet from the phase artifacts and passes it as the dispatch payload for the next wave. The rule is deterministic (the same N artifact files always collapse to the same context packet structure) and the context packet is what isolates the next wave's workers from each other's intermediate details.

Parallelization is the abstract pattern. The single-message multi-Task() mechanic, the phase-artifact disk checkpoint, and the context-packet forwarding are the configuration that has realized it in this repository. The mechanics generalize; the 5+5+3+1 cardinality is one specific composition suited to the investigation-and-synthesis shape of the analysis-funnel skill.`,
  },
}
