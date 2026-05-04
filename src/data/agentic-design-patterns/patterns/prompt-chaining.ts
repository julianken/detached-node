import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'prompt-chaining',
  name: 'Prompt Chaining',
  alternativeNames: ['Pipeline', 'Sequential Prompting', 'LLM Pipeline'],
  layerId: 'topology',
  topologySubtier: 'single-agent',
  oneLineSummary: 'A fixed sequence of LLM calls, each consuming the previous step\'s output.',
  bodySummary: [
    'Prompt chaining decomposes a task into a fixed sequence of LLM calls in which each step\'s output becomes the next step\'s input. The decomposition is editorial: a human picks the seams, names the intermediate artifacts, and writes one prompt per stage so each prompt is small enough to be reliable on its own. Between stages the program holds the artifact in plain memory, and often runs a deterministic gate — a schema validator, a regex, a length check — that decides whether to advance, retry, or fail closed.',
    'The pattern is the first thing the Anthropic taxonomy reaches for when a task can be split cleanly. The trade is latency for accuracy: two or three smaller prompts produce more dependable answers than one heroic prompt that has to plan, retrieve, draft, and proofread inside one inference. Structured output earns the chain its reliability — each stage emits JSON or some other parseable shape so the next stage receives an object, not a paragraph, and the seams stay machine-readable. Without the gates, errors at stage one quietly ride through the rest of the chain.',
    'Prompt chaining sits underneath the more elaborate topologies. Routing picks a chain at runtime; parallelization fans out independent stages; orchestrator-workers and ReAct add a planner that the chain itself does not have. The chain is fixed at author time, which is why it ships the soonest and breaks the latest. The cost is editorial debt: when the task changes shape, the seams have to be redrawn by hand, because no part of the chain decides for itself whether the next call is the right one.',
  ],
  mermaidSource: `graph LR
  A[Input] --> B[Stage 1 prompt]
  B --> C{Schema gate}
  C -->|pass| D[Stage 2 prompt]
  C -->|fail| B
  D --> E{Schema gate}
  E -->|pass| F[Stage 3 prompt]
  E -->|fail| D
  F --> G[Output]`,
  mermaidAlt: 'A left-to-right flowchart in which an Input feeds a Stage 1 prompt whose output passes through a schema gate that either advances to Stage 2 or loops back to retry, with the same gated structure repeating for Stage 2 and Stage 3 before producing the final Output.',
  whenToUse: [
    'Apply when the task decomposes cleanly into 2–5 fixed stages whose order is known up front (extract, normalize, draft, review).',
    'Use where each stage produces a parseable artifact (JSON object, list, scored shortlist) so a deterministic gate can validate the handoff between calls.',
    'Reach for it when accuracy outranks latency and a single monolithic prompt has started to drop instructions or hallucinate intermediate state.',
    'Prefer it as the first agentic shape on a new problem — it ships in a day, runs deterministically, and exposes which stage is the real source of error before any planner is introduced.',
  ],
  whenNotToUse: [
    'When the path through the work is data-dependent and changes per request, a fixed chain forces a wrong shape on the task — route or plan instead.',
    'Without inter-stage validation, a chain becomes a longer monolith: each stage launders the previous stage\'s errors into the next, and end-to-end accuracy falls below the single-prompt baseline.',
    'When stages are mutually independent, sequencing them wastes wall-clock time the parallelization pattern would recover.',
  ],
  realWorldExamples: [
    {
      text: 'Anthropic\'s public agent cookbook ships a runnable prompt-chain workflow that drafts marketing copy, gates the result with a programmatic check, then translates it — exactly the decomposition the essay describes.',
      sourceUrl: 'https://github.com/anthropics/claude-cookbooks/blob/main/patterns/agents/basic_workflows.ipynb',
    },
    {
      text: 'LangGraph documents prompt chaining as one of the canonical workflow shapes, modelled as a small graph of typed nodes whose edges carry the validated artifact between stages.',
      sourceUrl: 'https://docs.langchain.com/oss/javascript/langgraph/use-graph-api',
    },
    {
      text: 'OpenAI\'s Deep Research product runs a multi-stage pipeline that plans sub-questions, retrieves and reads sources for each, then synthesises a report — a long-running chain whose stages are visible to the user as a streaming progress trace.',
      sourceUrl: 'https://openai.com/index/introducing-deep-research/',
    },
  ],
  implementationSketch: `import { generateText, generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const Outline = z.object({ topic: z.string(), sections: z.array(z.string()).min(3) })

async function draftReport(brief: string): Promise<string> {
  const { object: outline } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: Outline,
    prompt: \`Produce an outline for: \${brief}\`,
  })
  if (outline.sections.length < 3) throw new Error('outline gate: too few sections')
  const { text: draft } = await generateText({
    model: openai('gpt-4o'),
    prompt: \`Write the report. Topic: \${outline.topic}. Sections: \${outline.sections.join(', ')}\`,
  })
  const { text: polished } = await generateText({
    model: openai('gpt-4o-mini'),
    prompt: \`Edit for tone and clarity. Return only the edited text.\\n\\n\${draft}\`,
  })
  return polished
}

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: 'Anthropic\'s essay names the failure mode bluntly: the trade is latency for accuracy, and the win evaporates when the chain has no programmatic gate between stages — a malformed JSON or an off-topic draft at stage one rides through and the chain returns a confidently wrong final artifact. The gate is the pattern; the chain without it is just a longer prompt.',
    sourceUrl: 'https://www.anthropic.com/engineering/building-effective-agents',
  },
  relatedSlugs: [],
  frameworks: ['langchain', 'langgraph', 'vercel-ai-sdk', 'mastra'],
  references: [
    {
      title: 'AI Chains: Transparent and Controllable Human-AI Interaction by Chaining Large Language Model Prompts',
      url: 'https://arxiv.org/abs/2110.01691',
      authors: 'Wu et al.',
      year: 2022,
      venue: 'CHI 2022',
      type: 'paper',
      doi: '10.1145/3491102.3517582',
      note: 'foundational paper — coined "AI chains" and introduced the prompt-chain idiom',
    },
    {
      title: 'Building Effective Agents',
      url: 'https://www.anthropic.com/engineering/building-effective-agents',
      authors: 'Anthropic',
      year: 2024,
      type: 'essay',
      note: 'names prompt chaining as the first workflow to reach for, with the latency-for-accuracy trade and the gate discipline',
    },
    {
      title: 'Demonstrate-Search-Predict: Composing retrieval and language models for knowledge-intensive NLP',
      url: 'https://arxiv.org/abs/2212.14024',
      authors: 'Khattab et al.',
      year: 2022,
      venue: 'arXiv',
      type: 'paper',
      doi: '10.48550/arXiv.2212.14024',
      note: 'shows the chain-of-prompts shape for retrieval-augmented question answering — predecessor to DSPy',
    },
    {
      title: 'Agentic Design Patterns, Chapter 1: Prompt Chaining',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [1, 12],
    },
    {
      title: 'LangGraph — Use the graph API (workflow building blocks)',
      url: 'https://docs.langchain.com/oss/javascript/langgraph/use-graph-api',
      authors: 'LangChain team',
      year: 2026,
      type: 'docs',
      accessedAt: '2026-05-03',
    },
    {
      title: 'Anthropic Cookbook — Basic Workflows (prompt chaining notebook)',
      url: 'https://github.com/anthropics/claude-cookbooks/blob/main/patterns/agents/basic_workflows.ipynb',
      authors: 'Anthropic',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-03',
    },
  ],
  addedAt: '2026-05-03',
  dateModified: '2026-05-03',
  lastChangeNote: 'Initial authoring of Prompt Chaining pattern (wave 1).',
}
