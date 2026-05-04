import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'agentic-rag',
  name: 'Agentic RAG',
  alternativeNames: ['Iterative RAG', 'Adaptive RAG', 'Self-RAG', 'Active Retrieval'],
  layerId: 'topology',
  topologySubtier: 'single-agent',
  parentPatternSlug: 'rag',
  oneLineSummary: 'Agent reads partial passages, decides whether to re-query, and stops on its own.',
  bodySummary: [
    'Agentic RAG turns retrieval into a tool the model can call as many times as the task warrants. The agent inspects the question, issues a first query, reads what came back, and then decides — based on what it found and what it still needs — whether to rephrase, narrow to a subtopic, fetch a different corpus, or stop and answer. Retrieval is no longer a fixed pre-step that runs before generation; it becomes one action in a Thought–Action–Observation loop, indistinguishable from any other tool call. The runtime owns the bound on iteration; the model owns the decision to keep going.',
    'The pattern sits one layer above vanilla RAG (authored separately at /agentic-design-patterns/rag), which fires a single similarity search and concatenates the top-k chunks into the prompt. That single-shot pipeline is cheap and inspectable but folds on multi-hop questions where the bridging fact lives in a chunk no embedding of the original phrasing will surface. The agentic variant addresses that gap by letting the model rewrite the query mid-trajectory: read the first hit, notice the entity it actually needs, search again. Self-RAG goes further and trains the model to emit reflection tokens that decide when to retrieve, when retrieved passages are relevant, and when the draft is supported — the same control flow learned end-to-end rather than orchestrated externally.',
    'The cost of this flexibility is a longer tail. Each extra retrieval is another similarity search, another set of tokens in the context, and another decision the model can get wrong; runs that should have terminated after one hop drift into four. Two failure modes recur: the agent keeps re-querying because nothing in the trajectory disconfirms its hypothesis, or it terminates early on a confident-but-wrong first hit and never asks the second question that would have surfaced the contradiction. A hard step budget and an answer-level evaluator that scores against ground truth, not retrieval recall, are both load-bearing.',
  ],
  mermaidSource: `graph TD
  A[User question] --> B[Agent reads question]
  B --> C{Need retrieval?}
  C -->|no| H[Answer from parametric memory]
  C -->|yes| D[Formulate query]
  D --> E[Retrieval tool: index search]
  E --> F[Passages appended to context]
  F --> G{Enough evidence?}
  G -->|no, refine| D
  G -->|yes| I[Grounded answer with citations]`,
  mermaidAlt: 'A flowchart in which a User question is read by the Agent, which decides whether retrieval is needed; if not it answers from parametric memory, otherwise it formulates a query that the retrieval tool resolves against an index, appends the passages back to context, and decides whether the evidence is sufficient — looping back to refine the query if not, or emitting a grounded answer with citations if so.',
  whenToUse: [
    'Apply when questions are multi-hop or ambiguous and a single similarity search will miss the bridging fact (cross-document reasoning, follow-up questions that depend on what the first hop returned, vague queries that need a clarifying search).',
    'Use where the agent has access to multiple corpora or tools and must decide which one to consult — internal docs, the public web, a structured database — rather than treating all evidence as one undifferentiated index.',
    'Reach for it when the cost of an extra retrieval is small relative to the cost of an unsupported answer (research assistants, regulatory or medical Q&A, customer-facing support that escalates on uncertainty).',
    'Prefer it over a hand-rolled query-rewriter chain when the number of hops is data-dependent and a fixed pipeline would either over- or under-fetch.',
  ],
  whenNotToUse: [
    'When the question is well-formed and self-contained, vanilla single-shot RAG is cheaper, easier to debug, and competitive on quality — the loop pays no rent on a one-hop question.',
    'When latency budgets are tight (sub-second chat, autocomplete), the extra retrieval round-trips and reasoning tokens compound into a worse user experience than answering from a single retrieval and being wrong sometimes.',
    'Without an answer-level evaluator that catches premature termination, the agent will confidently stop on the first plausible hit and the loop adds cost without measurable accuracy improvement over the single-shot baseline.',
  ],
  realWorldExamples: [
    {
      text: 'Perplexity issues fresh search queries on every conversational turn and reformulates them as the dialogue refines what the user is actually asking, then conditions its grounded answer on the iteratively retrieved passages with inline citations.',
      sourceUrl: 'https://docs.perplexity.ai/getting-started/overview',
    },
    {
      text: "Anthropic's web_search tool lets a Claude model decide mid-trajectory to issue one or more searches, read the results, and either answer or search again — the pattern documented as a first-party tool the model invokes inside a normal tool-use loop.",
      sourceUrl: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool',
    },
    {
      text: "LangGraph's agentic-RAG tutorial wires a graph in which the model first decides whether to retrieve, then grades the retrieved passages, and either rewrites the query and re-retrieves or generates an answer — the iterative control flow this pattern names, runnable end-to-end.",
      sourceUrl: 'https://langchain-ai.github.io/langgraph/tutorials/rag/langgraph_agentic_rag/',
    },
  ],
  implementationSketch: `import { generateText, tool } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

declare const index: { search(q: string, k: number): Promise<{ id: string; text: string }[]> }

const retrieve = tool({
  description: 'Search the corpus and return top-k passages. Call again with a refined query if the first set is insufficient.',
  parameters: z.object({ query: z.string(), k: z.number().int().min(1).max(8).default(4) }),
  execute: async ({ query, k }) => ({ passages: await index.search(query, k) }),
})

const { text } = await generateText({
  model: openai('gpt-4o'),
  tools: { retrieve },
  maxSteps: 5, // bounded retrieval loop; model decides when to stop and answer
  system: 'Use retrieve as many times as needed. Cite passage ids. If the corpus does not support an answer, say so.',
  prompt: 'Which of our SLOs changed between the 2025 and 2026 reliability reviews, and why?',
})

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: "Self-RAG's evaluation reports that adaptive retrieval helps most when the model is trained to emit explicit reflection tokens that decide whether to retrieve and whether the retrieved passages are relevant; bolting an unmodified instruction-tuned model into a retrieve-anything-anytime loop tends to over-retrieve on questions it could have answered from parametric memory and under-verify on questions where the first hit was off-topic. The decision to retrieve is itself a learned skill that the loop alone does not provide.",
    sourceUrl: 'https://arxiv.org/abs/2310.11511',
  },
  relatedSlugs: ['rag', 'tool-use-react', 'reflexion'],
  frameworks: ['langgraph', 'vercel-ai-sdk', 'mastra', 'langchain'],
  references: [
    {
      title: 'Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection',
      url: 'https://arxiv.org/abs/2310.11511',
      authors: 'Asai et al.',
      year: 2023,
      venue: 'ICLR 2024',
      type: 'paper',
      doi: '10.48550/arXiv.2310.11511',
      note: 'foundational paper; reflection-token control flow for adaptive retrieval, relevance grading, and support checking',
    },
    {
      title: 'Enhancing Retrieval-Augmented Large Language Models with Iterative Retrieval-Generation Synergy',
      url: 'https://arxiv.org/abs/2305.15294',
      authors: 'Shao et al.',
      year: 2023,
      venue: 'EMNLP 2023 Findings',
      type: 'paper',
      doi: '10.48550/arXiv.2305.15294',
      note: 'iter-retgen — alternates retrieval and generation across rounds to improve multi-hop QA',
    },
    {
      title: 'Active Retrieval Augmented Generation',
      url: 'https://arxiv.org/abs/2305.06983',
      authors: 'Jiang et al.',
      year: 2023,
      venue: 'EMNLP 2023',
      type: 'paper',
      doi: '10.48550/arXiv.2305.06983',
      note: 'FLARE — anticipates upcoming sentences to decide when to issue the next retrieval',
    },
    {
      title: 'LangGraph — Agentic RAG tutorial',
      url: 'https://langchain-ai.github.io/langgraph/tutorials/rag/langgraph_agentic_rag/',
      authors: 'LangChain team',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'runnable graph that wires retrieval as a tool, grades passages, and re-queries on insufficient evidence',
    },
    {
      title: 'Web search tool',
      url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool',
      authors: 'Anthropic',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'first-party retrieval-as-tool a Claude model invokes inside a normal tool-use loop',
    },
    {
      title: 'Agentic Design Patterns, Chapter 14: Knowledge Retrieval (RAG)',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [277, 320],
      note: 'covers agentic and adaptive variants alongside the vanilla pattern',
    },
  ],
  addedAt: '2026-05-04',
  dateModified: '2026-05-04',
  lastChangeNote: 'Initial authoring of Agentic RAG pattern (iterative retrieval loop; contrasts with single-shot RAG).',
}
