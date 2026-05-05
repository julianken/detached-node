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
  dateModified: '2026-05-05',
  lastChangeNote: 'W3.1 additive: add 12-factor-agent to seeAlso.siblingPatternSlugs, resolving W1.2 forward-reference.',
  realizingInClaudeCode: {
    tier: 'A',
    ccPrimitives: [
      'CLAUDE.md always-on-files trio (CLAUDE.md, settings.json, .claude/skills/)',
      'prompt-caching prefix pinning (invariant system prompt at window head)',
      'tiktoken cl100k_base token counting / wc -w × 1.8 fallback',
    ],
    scaffolding: [
      'CLAUDE.md (always-on project-level instructions)',
      '.claude/skills/analysis-funnel/SKILL.md (carry-forward context structure)',
    ],
    workedExample: {
      url: 'https://github.com/julianken/detached-node/blob/main/CLAUDE.md',
      description: 'The project-root CLAUDE.md is itself a worked example of context engineering: it loads on every Claude Code session as always-on context, before any tool call or task instruction. Its contents enact the editorial discipline the pattern describes — unconditional project facts (framework, conventions, design system) stay in the file; trigger-bearing rules migrate to `.claude/skills/` so they consume window budget only when the trigger fires. Reading the file end-to-end shows what survives the always-on slot and what is structured to load on demand.',
    },
    readerMove: {
      text: 'Count your three always-on files with tiktoken cl100k_base or wc -w × 1.8; if over 3 K tokens, move trigger-bearing rules into skills.',
      anchorUrl: 'https://github.com/julianken/detached-node/blob/main/CLAUDE.md',
    },
    seeAlso: {
      skillPath: '.claude/skills/analysis-funnel/SKILL.md',
      siblingPatternSlugs: ['memory-management', 'checkpointing', '12-factor-agent'],
    },
    bodyMarkdown: `Context engineering in a Claude Code setup begins with the three files that load on every session — \`CLAUDE.md\`, \`settings.json\`, and the skills directory. These are the always-on context: they arrive before any tool call, before any task instruction, before any retrieved content. The user-level \`~/.claude/CLAUDE.md\` token-economics meta-rule captures the load-bearing editorial discipline for this file class: "If a rule has a trigger ("when adding screenshots", "before committing", "during PR review"), it belongs in a skill, not here." ([source](https://github.com/julianken/detached-node/blob/main/CLAUDE.md)). Rules without triggers stay in \`CLAUDE.md\`; rules with triggers migrate to skills. The discipline is token-economic: every unconditional rule that migrates to a skill is a line evicted from the always-on budget.

### Realization in this repo

The project-root [\`CLAUDE.md\`](https://github.com/julianken/detached-node/blob/main/CLAUDE.md) is the worked example: every Claude Code session in this repo loads it before any tool call, so its contents define what the model sees while answering. Read end-to-end, the file is a deliberately curated set of unconditional project facts — framework choice, design-system pointers, content-model summary, phase status — and a "Files to Read First" pointer list that nominates the next budgeted reads. Trigger-bearing behaviors are absent by design: pre-commit checks, screenshot procedures, and PR review rubrics live in \`.claude/skills/\` and load only when invoked. The split is the pattern in action — selection happens upstream of generation, and the always-on slot pays its rent in signal per token.

The three-move mechanical implementation mirrors the pattern's abstract structure. A relevance signal — the editorial test "does this rule have a trigger?" — orders candidates between the always-on file and the on-demand skills. A budget — the target token count for the three-file always-on slot, calibrated so retrieved content and task instructions still fit the session's practical limit — caps what survives in \`CLAUDE.md\`. A layout — project invariants pinned at the \`CLAUDE.md\` head, then any phase-boundary summary the user has produced, then the live task — places surviving tokens where attention is strongest.

Measuring the always-on budget is the prerequisite step. Count tokens in \`CLAUDE.md\` + \`settings.json\` + the relevant skill using tiktoken \`cl100k_base\`, or multiply the raw word count by 1.8 as a fast proxy (tiktoken cl100k_base is the canonical measure; wc -w × 1.8 is the fast fallback). If the total exceeds 3 K tokens, the always-on context is consuming budget that limits how much retrieved or task-specific content can be packed in. The repair is the meta-rule: any rule with a trigger migrates to a skill so it loads only when the trigger fires.

<details>
<summary>Cross-link: minimal-CLAUDE.md pattern</summary>

The minimal-CLAUDE.md configuration applies the same token-economics meta-rule at the file level. The editorial split is: unconditional facts about the project (framework, conventions, non-goals) stay in \`CLAUDE.md\`; triggered behaviors (pre-commit checks, screenshot procedures, PR review rubrics) live in \`.claude/skills/\` and load only when invoked. The result is a \`CLAUDE.md\` that is dense with signal per token rather than exhaustive. The user-level meta-rule — "If a rule has a trigger, it belongs in a skill, not here" — is the one-sentence specification for this configuration. Context Engineering names the budget rationale; minimal-CLAUDE.md names the file-level split that implements it.

</details>

<details>
<summary>Cross-link: 5-section PR body as reviewer context packet</summary>

The five-section PR body (Diagrams / Summary / Screenshots / Test plan / Plan reference) is an engineered context packet for the reviewer's first read. Each section maps to a distinct attention slot: Diagrams anchors visual changes before the diff is opened; Summary compresses scope to a single scroll; Test plan itemizes the pre-review checklist the bot is expected to verify claim-by-claim before scoring the implementation. Placing Test plan before Plan reference is a layout choice, not convention — the sections that require active checking arrive before the sections that are reference-only, matching the U-shape recall curve the pattern documents. [PR #339 (W1.1 Orchestrator-Workers)](https://github.com/julianken/detached-node/pull/339) shows the full five-section structure as read by the julianken-bot reviewer on its first cycle.

</details>`,
  },
}
