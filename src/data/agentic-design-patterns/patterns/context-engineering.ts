import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'context-engineering',
  name: 'Context Engineering',
  alternativeNames: ['Context Curation', 'Context Window Management'],
  layerId: 'state',
  oneLineSummary: 'Pick which tokens enter the window, in what order, with what weighting.',
  bodySummary: [
    "Context engineering is the discipline of deciding what fills the model's window before each call — which system instructions, which retrieved passages, which tool outputs, which scratchpad notes, which prior turns, in what order, and at what fraction of the budget. The pattern treats the window as a finite resource the runtime allocates, not as a place to dump everything that might be relevant. Selection happens upstream of generation: a step ranks candidate items by signal-to-cost, packs the highest-yield ones into a budget, and lays them out so the model attends to the parts that matter most. Longer windows did not eliminate the cost of choosing — they made the choice more consequential.",
    "The pattern is broader than retrieval-augmented generation, which is one specific way to populate the window. RAG answers where new tokens come from; context engineering answers which tokens, of all the candidates, get a seat at the table this turn. It also sits next to but distinct from prompt chaining, which decomposes the task into stages: chaining changes what the model is asked, while context engineering changes what the model sees while answering. A typical implementation composes both — the chain decides the stage, the engineer decides which retrieved chunks, prior summaries, and tool transcripts that stage will read.",
    "The mechanism leans on three operational moves. A relevance signal — embedding similarity, recency, a learned ranker, an explicit user @-reference — orders candidates. A budget — token count, dollar cost, latency target — caps what survives. A layout — system prompt, then evidence, then history, then question — places the surviving tokens where attention is strongest, because models do not weight positions evenly across a long window. The cost is operational: someone has to pick the signal, set the budget, instrument the cache hit rate, and decide what to evict when the window fills. Without those decisions the agent silently degrades as transcripts grow.",
  ],
  mermaidSource: `graph LR
  A[Turn input] --> B[Score candidates: retrieval, memory, tools]
  B --> C[Rank by signal/cost]
  C --> D[Pack into token budget]
  D --> E[Layout: system, evidence, history, question]
  E --> F[Cache-aware prompt assembly]
  F --> G[Model call]`,
  mermaidAlt: 'A left-to-right flowchart in which a Turn input fans into a Score-candidates step that gathers retrievals, memory entries, and tool outputs; the candidates are ranked by signal-to-cost, packed into a token budget, laid out with the system prompt followed by evidence then history then the question, run through cache-aware prompt assembly, and finally sent to the model.',
  whenToUse: [
    'Apply when the candidate set of relevant tokens (transcripts, retrievals, tool outputs, scratchpad notes) regularly exceeds the model window or your latency and cost budget for one turn.',
    'Use where the agent runs many turns and the same prefix can be cached across calls — pin invariant tokens at the head so cache reads pay for themselves.',
    'Reach for it when accuracy depends on which evidence the model attends to, not just on whether the evidence is in the prompt at all (long-context recall degrades by position).',
    'Prefer it when you want to swap retrieval strategies, memory policies, or summarisation cadences without changing the agent\'s control flow — the engineering layer is the seam.',
  ],
  whenNotToUse: [
    'When every candidate token comfortably fits the window with budget to spare and the task is single-shot, ranking and packing add latency without changing the answer.',
    'Without a feedback signal that ties context choices to outcome quality (eval set, user thumbs, downstream tool success), tuning the layout becomes superstition that survives by inertia.',
    'When the task is purely retrieval-bottlenecked and the model is not the limit, work the retrieval pipeline first — engineering the layout cannot rescue evidence that was never fetched.',
  ],
  realWorldExamples: [
    {
      text: "Cursor's @-reference UI lets users hand-pick files, folders, terminals, past chats, and git diffs to inject into the agent's prompt, and falls back to its own search when the user does not — the surface exposes both the user-curated and model-curated halves of the context-selection step.",
      sourceUrl: 'https://cursor.com/help/customization/context',
    },
    {
      text: "Anthropic's Applied AI team frames context engineering as an explicit design discipline distinct from prompt engineering, with named techniques — just-in-time retrieval, compaction, structured note-taking, and sub-agent isolation — that production agent runtimes use to keep the attention budget on the highest-signal tokens.",
      sourceUrl: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
    },
    {
      text: "Anthropic's prompt-caching API exposes the layout decision as a billing primitive: marking up to four cache breakpoints in the request lets the runtime reuse the matching prefix at a tenth of the input price, which is why production agents pin invariant context — system prompt, tool definitions, long documents — at the head of the window.",
      sourceUrl: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching',
    },
  ],
  implementationSketch: `import { embed, generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

type Candidate = { id: string; text: string; tokens: number; recencyBoost?: number }
declare const candidates: Candidate[]
declare function cosine(a: number[], b: number[]): number
declare const embeddings: Record<string, number[]>

async function buildContext(question: string, budgetTokens = 6000): Promise<string> {
  const { embedding: q } = await embed({ model: openai.embedding('text-embedding-3-small'), value: question })
  const ranked = candidates
    .map((c) => ({ c, score: cosine(q, embeddings[c.id]!) + (c.recencyBoost ?? 0) }))
    .sort((a, b) => b.score - a.score)
  const packed: Candidate[] = []
  let used = 0
  for (const { c } of ranked) {
    if (used + c.tokens > budgetTokens) continue
    packed.push(c); used += c.tokens
  }
  const evidence = packed.map((p, i) => \`[\${i + 1}] \${p.text}\`).join('\\n\\n')
  const { text } = await generateText({
    model: openai('gpt-4o'),
    system: 'You are answering using only the numbered evidence below. Cite by bracketed index.',
    prompt: \`Evidence:\\n\${evidence}\\n\\nQuestion: \${question}\`,
  })
  return text
}

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: "Liu et al. document a U-shaped recall curve: language models given a long context attend most reliably to tokens at the start and end and least reliably to tokens in the middle, with accuracy on multi-document QA dropping sharply when the relevant passage sits at position 10 of 20. Stuffing the window is not the same as engineering the window — placement load-bears, and the practitioner who concatenates retrievals in arbitrary order is sampling the worst part of the curve.",
    sourceUrl: 'https://arxiv.org/abs/2307.03172',
  },
  relatedSlugs: [],
  frameworks: ['langchain', 'langgraph', 'vercel-ai-sdk', 'mastra'],
  references: [
    {
      title: 'Lost in the Middle: How Language Models Use Long Contexts',
      url: 'https://arxiv.org/abs/2307.03172',
      authors: 'Liu et al.',
      year: 2024,
      venue: 'TACL 2024',
      type: 'paper',
      doi: '10.1162/tacl_a_00638',
      note: 'foundational paper on positional recall in long-context windows; the empirical case for engineering placement, not just inclusion',
    },
    {
      title: 'Effective Context Engineering for AI Agents',
      url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
      authors: 'Anthropic',
      year: 2025,
      type: 'essay',
      note: 'names the discipline and catalogs the techniques: just-in-time retrieval, compaction, structured note-taking, sub-agent isolation',
    },
    {
      title: 'Prompt caching',
      url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching',
      authors: 'Anthropic',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-03',
      note: 'cache breakpoints as the billing primitive that makes prefix layout load-bearing in production',
    },
    {
      title: 'Context — Cursor Help',
      url: 'https://cursor.com/help/customization/context',
      authors: 'Cursor team',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-03',
      note: 'product surface for user-driven and agent-driven context selection via @-references',
    },
    {
      title: 'Karpathy on context engineering',
      url: 'https://x.com/karpathy/status/1937902205765607626',
      authors: 'Andrej Karpathy',
      year: 2025,
      type: 'essay',
      note: 'popularised the term as the work of packing the context window "just right" — broader than prompt engineering',
    },
    {
      title: 'Agentic Design Patterns, Chapter 1: Prompt Chaining (Context Engineering and Prompt Engineering section)',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [8, 11],
    },
  ],
  addedAt: '2026-05-03',
  dateModified: '2026-05-03',
  lastChangeNote: 'Author Context Engineering pattern (selection, ranking, layout, cache-aware assembly).',
}
