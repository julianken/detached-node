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
  dateModified: '2026-05-04',
  lastChangeNote: 'Author Parallelization satellite: fan-out with deterministic aggregator, Sectioning vs Voting variants, self-consistency diversity gotcha.',
}
