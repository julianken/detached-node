import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'routing',
  name: 'Routing',
  alternativeNames: ['Classifier-and-Dispatch', 'Conditional Branching', 'LLM Router'],
  layerId: 'topology',
  topologySubtier: 'single-agent',
  oneLineSummary: 'Classify the input, then dispatch it to the handler that fits.',
  bodySummary: [
    'Routing splits a workload into a classifier and a set of specialised handlers. The classifier inspects the incoming request — text, structured payload, partial trajectory — and emits a label drawn from a small fixed vocabulary. A switch downstream reads the label and forwards the request to the matching prompt, model, tool chain, or sub-agent. The pattern earns its place when the request distribution is genuinely heterogeneous: a single prompt that tries to cover billing, technical support, and refund disputes degrades on each subset to subsidise the others, while three narrower prompts each compile to something tighter and easier to audit.',
    'The classifier itself can be a small LLM called with a constrained output schema, an embedding-nearest-neighbour over a labelled prototype set, a discriminative classifier fine-tuned on logged traffic, or a deterministic rule table over keywords and metadata. Each option trades latency, cost, and recoverability differently, but the topology is the same: a decision node with k outgoing edges, exactly one of which fires per request. A second axis routes by capability rather than by intent — cheap models for tractable queries, frontier models for ones the cheap model would fumble — the form Anthropic\'s essay highlights as the default cost lever and that RouteLLM measures on MT-Bench, MMLU, and GSM8K.',
    'The pattern fails quietly when its assumptions go unwatched. A misclassification sends the request down a handler that cannot recover, and unless that handler exposes confidence or escalates, the caller sees a confidently wrong answer rather than a router error. Drift is the second hazard: the label set was fitted to last quarter\'s traffic and a new request type now arrives unrouted, defaulting to an "other" bucket whose volume creeps up unnoticed. Production deployments log the label, the chosen handler, and the outcome, then sweep for unrouted volume, low-confidence decisions, and accuracy regressions on a fixed eval set as any classifier in the stack would be.',
  ],
  mermaidSource: `graph TD
  A[Incoming request] --> B[Classifier]
  B --> C{Label}
  C -->|intent A| D[Handler A]
  C -->|intent B| E[Handler B]
  C -->|intent C| F[Handler C]
  C -->|low confidence| G[Fallback handler]
  D --> H[Response]
  E --> H
  F --> H
  G --> H`,
  mermaidAlt: 'A flowchart in which an incoming request feeds a classifier node, whose label decision branches into one of three intent-specific handlers or a low-confidence fallback handler, all of which converge on a single response node.',
  whenToUse: [
    'Apply when the input distribution splits into distinct categories that each benefit from a different prompt, tool set, or model size — customer-service intents, document types, programming languages, query difficulty tiers.',
    'Use where one fat prompt is measurably worse than several narrower ones on a held-out eval, and the categories are stable enough that a classifier trained today is still right next quarter.',
    'Reach for it when cost or latency is the binding constraint and a small model can correctly handle most traffic, leaving the frontier model for the residual where quality regresses.',
    'Prefer it when each handler has different tool, data, or permission scopes — keeping refund logic out of the technical-support tool surface is easier with separate paths than with a single prompt and conditional tool gating.',
  ],
  whenNotToUse: [
    'When the work is uniform enough that a single prompt with a few conditionals matches the routed version on quality — the extra hop adds latency and a new failure mode for no measured win.',
    'Without a labelled eval set or production telemetry to detect misclassification, the router\'s errors are invisible and the system silently sends requests to the wrong handler.',
    'When categories blur or shift faster than the classifier can be retrained, the label vocabulary becomes the bottleneck and an open-ended planning agent is the better fit.',
  ],
  realWorldExamples: [
    {
      text: 'Cursor exposes an Auto model that selects between underlying coding models on each turn, balancing intelligence, cost, and reliability for everyday tasks rather than asking the developer to pick.',
      sourceUrl: 'https://cursor.com/docs/models',
    },
    {
      text: 'RouteLLM trains preference-data routers that direct queries between a strong and a weak model, reporting cost reductions of 85% on MT-Bench and 45% on MMLU while preserving 95% of GPT-4 quality.',
      sourceUrl: 'https://lmsys.org/blog/2024-07-01-routellm/',
    },
    {
      text: 'LangGraph documents a Routing workflow built from a classifier node and add_conditional_edges, with conditional branching as the framework primitive for selecting the next node from graph state.',
      sourceUrl: 'https://docs.langchain.com/oss/python/langgraph/workflows-agents',
    },
  ],
  implementationSketch: `import { generateObject, generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const RouteSchema = z.object({
  label: z.enum(['billing', 'technical', 'other']),
  confidence: z.number().min(0).max(1),
})

const handlers = {
  billing: (q: string) => generateText({ model: openai('gpt-4o-mini'), system: 'Billing specialist.', prompt: q }),
  technical: (q: string) => generateText({ model: openai('gpt-4o'), system: 'Technical support specialist.', prompt: q }),
  other: (q: string) => generateText({ model: openai('gpt-4o'), system: 'General assistant; escalate if unsure.', prompt: q }),
} as const

export async function route(query: string) {
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: RouteSchema,
    prompt: \`Classify the request into billing, technical, or other.\\nRequest: \${query}\`,
  })
  const label = object.confidence < 0.6 ? 'other' : object.label
  return handlers[label](query)
}

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: 'Routing by capability tier presumes the cheap model knows when it is over its head; in practice it does not, and a same-model classifier will route too many hard queries to the cheap path. RouteLLM trains the router on preference data precisely because using the weak model to assess its own competence collapses the cost-quality frontier.',
    sourceUrl: 'https://lmsys.org/blog/2024-07-01-routellm/',
  },
  relatedSlugs: [],
  frameworks: ['langchain', 'langgraph', 'vercel-ai-sdk'],
  references: [
    {
      title: 'Building Effective Agents',
      url: 'https://www.anthropic.com/engineering/building-effective-agents',
      authors: 'Anthropic',
      year: 2024,
      type: 'essay',
      note: 'frames routing as one of five workflow building blocks; cites cost-tier model selection as the canonical use',
    },
    {
      title: 'Large Language Model Routing with Benchmark Datasets',
      url: 'https://arxiv.org/abs/2309.15789',
      authors: 'Shnitzer et al.',
      year: 2023,
      venue: 'arXiv preprint',
      type: 'paper',
      doi: '10.48550/arXiv.2309.15789',
      note: 'foundational paper formulating LLM selection as binary classification over benchmark labels',
    },
    {
      title: 'RouteLLM: Learning to Route LLMs with Preference Data',
      url: 'https://arxiv.org/abs/2406.18665',
      authors: 'Ong et al.',
      year: 2024,
      venue: 'arXiv preprint',
      type: 'paper',
      doi: '10.48550/arXiv.2406.18665',
      note: 'preference-data routing measured on MT-Bench, MMLU, GSM8K',
    },
    {
      title: 'Agentic Design Patterns, Chapter 2: Routing',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [36, 49],
    },
    {
      title: 'LangGraph — Workflows and Agents (Routing)',
      url: 'https://docs.langchain.com/oss/python/langgraph/workflows-agents',
      authors: 'LangChain team',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-03',
      note: 'canonical Routing-workflow page; uses add_conditional_edges as the framework primitive',
    },
    {
      title: 'RouteLLM — open implementation and benchmark code',
      url: 'https://github.com/lm-sys/RouteLLM',
      authors: 'LMSYS',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-03',
      note: 'reference implementation accompanying the paper',
    },
  ],
  addedAt: '2026-05-03',
  dateModified: '2026-05-03',
  lastChangeNote: 'Initial authoring of the Routing pattern (wave-1, issue #173).',
}
