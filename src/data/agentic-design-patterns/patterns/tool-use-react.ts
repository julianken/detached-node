import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'tool-use-react',
  name: 'Tool Use / ReAct',
  alternativeNames: ['Reasoning + Acting', 'Function Calling', 'Tool-Calling Loop'],
  layerId: 'topology',
  topologySubtier: 'single-agent',
  oneLineSummary: 'Agent interleaves a thought, a tool call, and the result until it can answer.',
  bodySummary: [
    'Tool Use / ReAct fuses two capabilities the model has on its own — generating a chain of thought and emitting a structured function call — into a single control loop. At each step the agent writes a private rationale (the Thought), chooses an action from a typed tool catalog (the Action), and is then handed the tool\'s output (the Observation) before it decides what to do next. The loop continues until the agent emits a terminal answer rather than another action. The rationale is what makes the trajectory legible and what lets the next step condition on more than just the last observation.',
    'Mechanically, the runtime owns the loop: it parses the tool call out of the model output, dispatches it to the registered handler, appends the result back into the conversation, and re-invokes the model. A maximum-step budget bounds the recursion. The tool schema is the contract — names, JSON-schema arguments, and a one-line description per tool — and the model only sees actions it could plausibly take. Provider-side function calling pushes the parsing concern down into the model API, so the loop above is now the canonical agent skeleton in the OpenAI, Anthropic, and Vercel AI SDKs.',
    'The pattern earns its keep when the answer requires fresh data, side effects, or computation the model is bad at — search, code execution, database lookup, calendar mutation — and where each tool result genuinely changes what to do next. Two failure modes recur. The catalog grows past the model\'s working memory and tool selection degrades; or the agent loops between two near-identical tool calls because nothing in the trajectory disconfirms its current hypothesis. Both have the same root: the loop runs without a stopping criterion that is independent of the model\'s own confidence.',
  ],
  mermaidSource: `graph TD
  A[User task] --> B[Thought]
  B --> C{Need a tool?}
  C -->|yes| D[Action: pick tool and arguments]
  D --> E[Runtime executes tool]
  E --> F[Observation appended to context]
  F --> B
  C -->|no| G[Final answer]`,
  mermaidAlt: 'A flowchart showing a User task entering a Thought node, which branches on whether a tool is needed; the yes branch emits an Action that the runtime executes, appends the Observation back to context, and returns to Thought, while the no branch emits a Final answer.',
  whenToUse: [
    'Apply when answering the question requires data the model does not have at training time (current prices, account state, the contents of a file, the result of a search).',
    'Use where each tool result genuinely shifts the next step — code execution, database queries, retrieval against a corpus the model has not memorised.',
    'Reach for it when the underlying provider already exposes structured tool calling, so the parser, retry semantics, and schema validation are not your code to write.',
    'Prefer it over a hand-rolled chain when the number of steps is data-dependent and a fixed pipeline would either over- or under-fetch.',
  ],
  whenNotToUse: [
    'When the task can be answered from the prompt and a single retrieval, a static RAG pipeline is cheaper and more predictable than letting the model decide whether to search.',
    'When the action space is closed and known in advance, a router or finite state machine pays less per step than re-asking the model what to do at every turn.',
    'Without a hard step budget and a way to detect repeated near-identical tool calls, the loop will burn tokens chasing its own tail on tasks that have no answer.',
  ],
  realWorldExamples: [
    {
      text: 'Anthropic\'s tool-use API documents the exact loop this pattern names — the model emits a tool_use block, the client runs the tool, returns a tool_result, and the model is re-invoked until it stops requesting tools.',
      sourceUrl: 'https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview',
    },
    {
      text: 'Claude Code ships the loop as its core runtime: the CLI exposes filesystem, shell, and search tools, parses the model\'s tool calls, executes them locally, and feeds results back until the agent emits a final response.',
      sourceUrl: 'https://docs.claude.com/en/docs/claude-code/overview',
    },
    {
      text: 'Cognition\'s Devin documentation describes the same Thought-Action-Observation cycle layered on a sandboxed shell, browser, and code editor — the agent\'s plan branches on each tool result rather than running to a fixed script.',
      sourceUrl: 'https://www.cognition.ai/blog/introducing-devin',
    },
  ],
  implementationSketch: `import { generateText, tool } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const tools = {
  searchDocs: tool({
    description: 'Search the docs corpus for a query and return top-k snippets.',
    parameters: z.object({ query: z.string(), k: z.number().int().min(1).max(10).default(5) }),
    execute: async ({ query, k }) => {
      // Real implementation hits a vector store; stubbed here.
      return { snippets: Array.from({ length: k }, (_, i) => \`hit \${i} for \${query}\`) }
    },
  }),
  fetchUrl: tool({
    description: 'Fetch a URL and return its text body, truncated to 4 KB.',
    parameters: z.object({ url: z.string().url() }),
    execute: async ({ url }) => (await fetch(url)).text().then((t) => t.slice(0, 4096)),
  }),
}

const { text } = await generateText({
  model: openai('gpt-4o'),
  tools,
  maxSteps: 6, // bounded ReAct loop; runtime parses tool calls and feeds results back
  prompt: 'Find the current rate-limit policy in our docs and summarise it in one sentence.',
})

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: 'Tool catalogues that grow past roughly a dozen entries degrade selection accuracy: the model picks plausible-but-wrong tools and reasoning quality drops. Anthropic documents the same effect in production deployments and recommends scoping the catalogue per task or routing to subagents with smaller toolsets.',
    sourceUrl: 'https://www.anthropic.com/engineering/building-effective-agents',
  },
  relatedSlugs: ['reflexion'],
  frameworks: ['vercel-ai-sdk', 'langgraph', 'openai-agents', 'mastra'],
  references: [
    {
      title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
      url: 'https://arxiv.org/abs/2210.03629',
      authors: 'Yao et al.',
      year: 2022,
      venue: 'ICLR 2023',
      type: 'paper',
      doi: '10.48550/arXiv.2210.03629',
      note: 'foundational paper; introduces the Thought–Action–Observation interleaving',
    },
    {
      title: 'Toolformer: Language Models Can Teach Themselves to Use Tools',
      url: 'https://arxiv.org/abs/2302.04761',
      authors: 'Schick et al.',
      year: 2023,
      venue: 'NeurIPS 2023',
      type: 'paper',
      doi: '10.48550/arXiv.2302.04761',
      note: 'self-supervised tool-use training; complementary to inference-time ReAct',
    },
    {
      title: 'Building Effective Agents',
      url: 'https://www.anthropic.com/engineering/building-effective-agents',
      authors: 'Anthropic',
      year: 2024,
      type: 'essay',
      note: 'frames the loop as the canonical "augmented LLM" and warns about tool catalog size',
    },
    {
      title: 'Tool use with Claude',
      url: 'https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview',
      authors: 'Anthropic',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-03',
      note: 'canonical client-side loop documented end-to-end',
    },
    {
      title: 'AI SDK — Tools and Tool Calling',
      url: 'https://sdk.vercel.ai/docs/foundations/tools',
      authors: 'Vercel',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-03',
      note: 'first-party TypeScript implementation used in this pattern\'s sketch',
    },
    {
      title: 'Agentic Design Patterns, Chapter 5: Tool Use',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [69, 86],
    },
  ],
  addedAt: '2026-05-03',
  dateModified: '2026-05-03',
  lastChangeNote: 'Initial authoring of Tool Use / ReAct pattern (Phase-2 wave-1).',
}
