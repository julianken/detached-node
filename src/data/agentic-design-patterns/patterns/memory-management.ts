import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'memory-management',
  name: 'Memory Management',
  alternativeNames: ['Agent Memory', 'Long-Term Memory', 'Working Memory + Long-Term Memory'],
  layerId: 'state',
  oneLineSummary: 'Tier the agent into working, episodic, and semantic stores it can read and edit.',
  bodySummary: [
    "Memory Management treats the agent's state as a tiered system rather than a single ever-growing prompt. The working tier is whatever currently fits in the context window: the system message, the most recent turns, the active tool outputs. Around it sit one or more out-of-context stores the agent reads from and writes to: an episodic log keyed by session or task, a semantic store that holds learned facts about the user or the world, and sometimes a procedural store of routines the agent has learned to invoke. The tiers are connected by explicit operations the agent calls — append, summarise, retrieve, evict — rather than by hidden window-management heuristics.",
    "The pattern earns its keep when conversations or task threads outlive a single context window. MemGPT framed this as paging between fast and slow memory under the agent's own control; LangGraph and Mastra ship the same idea as a store keyed by `(thread_id, namespace)` that survives process restarts. The episodic tier records what happened. The semantic tier records what was learned. A summariser collapses old episodes into stable facts so the working tier stays small. Without the summariser the long-term store grows linearly and retrieval drowns in stale context; without the episodic log the agent forgets the same lesson on every session.",
    "The pattern is distinct from Reflexion's memory layer and from RAG. Reflexion stores critiques across attempts of the same task — a narrow loop. RAG retrieves over a corpus the agent did not write. Memory Management is the broader case: the agent reads and writes its own state across sessions, and the schema is designed up front (what counts as an episode, what counts as a fact, when to evict). The cost is operational: someone decides retention and TTL, namespaces by user, prevents prompt-injection writes, and reconciles contradictory facts written months apart. Most production failures live in those choices, not in the retrieval itself.",
  ],
  mermaidSource: `graph LR
  A[User turn] --> B[Working memory: context window]
  B --> C[Agent step]
  C --> D{Persist?}
  D -->|episode| E[Episodic store]
  D -->|fact| F[Semantic store]
  D -->|skip| G[Discard]
  E --> H[Summariser]
  F --> H
  H --> I[Retriever]
  I --> B`,
  mermaidAlt: 'A horizontal flowchart in which a User turn enters Working memory inside the context window, an Agent step decides whether to persist the turn as an episode, persist a learned fact, or discard it, with the episodic and semantic stores feeding a Summariser and Retriever that re-inject relevant slices back into Working memory on the next turn.',
  whenToUse: [
    'Apply when conversations or task threads span multiple sessions and the agent must recall prior interactions, learned facts, or user preferences after the context window resets.',
    'Use where the working set exceeds the context window in tokens or in cost — long-running assistants, project-scoped coding agents, customer support copilots that accumulate ticket history.',
    'Reach for it when state has clear schema: episodes you can timestamp, facts you can normalise, procedures you can name and retrieve by intent.',
    'Prefer it when retention, eviction, and namespacing matter to the product — per-user memory in a multi-tenant assistant, redaction on request, audit trails on what the agent learned and when.',
  ],
  whenNotToUse: [
    'When the entire interaction fits comfortably in one context window and never needs to outlive the session, the tiering pays no rent and adds a write path that can fail silently.',
    'Without a write policy and an eviction policy, the long-term store grows monotonically and retrieval pulls in stale or contradictory facts the agent will dutifully act on.',
    'When the data the agent would persist is regulated or sensitive and the storage layer has no per-user namespace, encryption, or deletion path, the pattern becomes a compliance liability rather than a feature.',
  ],
  realWorldExamples: [
    {
      text: 'LangGraph ships a long-term memory store keyed by namespace tuple and thread id, exposing get/put/search primitives that agents call inside graph nodes — the canonical worked example of the persistent-store half of this pattern.',
      sourceUrl: 'https://langchain-ai.github.io/langgraph/concepts/memory/',
    },
    {
      text: 'Mastra documents an agent memory layer that combines a recent-messages working window, a semantic-recall index for older turns, and a working-memory document the agent rewrites between sessions — a full three-tier implementation behind a single API surface.',
      sourceUrl: 'https://mastra.ai/docs/memory/overview',
    },
    {
      text: 'Letta (the company spun out of the MemGPT paper) ships an open-source server whose agents page facts in and out of an external store under the model’s own control, exposing the OS-style memory hierarchy as a runnable product.',
      sourceUrl: 'https://github.com/letta-ai/letta',
    },
  ],
  implementationSketch: `import { generateText, tool } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

type Episode = { ts: number; userId: string; text: string }
type Fact = { userId: string; key: string; value: string }
const episodes: Episode[] = []
const facts: Fact[] = []

const recall = tool({
  description: 'Retrieve facts and recent episodes for the current user.',
  parameters: z.object({ userId: z.string(), query: z.string() }),
  execute: async ({ userId, query }) => ({
    facts: facts.filter((f) => f.userId === userId),
    episodes: episodes.filter((e) => e.userId === userId && e.text.includes(query)).slice(-5),
  }),
})

const remember = tool({
  description: 'Persist a durable fact about the user.',
  parameters: z.object({ userId: z.string(), key: z.string(), value: z.string() }),
  execute: async ({ userId, key, value }) => {
    facts.push({ userId, key, value })
    return { ok: true }
  },
})

async function turn(userId: string, message: string): Promise<string> {
  episodes.push({ ts: Date.now(), userId, text: message })
  const { text } = await generateText({
    model: openai('gpt-4o'),
    tools: { recall, remember },
    prompt: \`User \${userId}: \${message}\`,
  })
  return text
}

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: 'A long-term memory the model writes to is also a long-term memory an attacker can write to. Documented prompt-injection demos persist hostile instructions into ChatGPT memory through a single conversation, and the agent then re-reads them on every later turn — including after the operator believes the session ended. Treat any tool that writes durable memory as untrusted input, namespace by user, and confirm writes through a reviewer for sensitive scopes.',
    sourceUrl: 'https://embracethered.com/blog/posts/2024/chatgpt-hacking-memories/',
  },
  relatedSlugs: [],
  frameworks: ['langgraph', 'mastra', 'langchain'],
  references: [
    {
      title: 'MemGPT: Towards LLMs as Operating Systems',
      url: 'https://arxiv.org/abs/2310.08560',
      authors: 'Packer et al.',
      year: 2023,
      type: 'paper',
      doi: '10.48550/arXiv.2310.08560',
      note: 'foundational paper; frames memory as paging between fast and slow tiers under model control',
    },
    {
      title: 'Generative Agents: Interactive Simulacra of Human Behavior',
      url: 'https://arxiv.org/abs/2304.03442',
      authors: 'Park et al.',
      year: 2023,
      venue: 'UIST 2023',
      type: 'paper',
      doi: '10.48550/arXiv.2304.03442',
      note: 'introduces the episodic / semantic / reflection memory tiers most agent stacks now mirror',
    },
    {
      title: 'Prompt caching',
      url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-caching',
      authors: 'Anthropic',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-03',
      note: 'caches the working-tier prefix between turns; the cheap optimisation the pattern enables',
    },
    {
      title: 'LangGraph — Memory concepts',
      url: 'https://langchain-ai.github.io/langgraph/concepts/memory/',
      authors: 'LangChain team',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-03',
    },
    {
      title: 'Mastra — Memory overview',
      url: 'https://mastra.ai/docs/memory/overview',
      authors: 'Mastra team',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-03',
    },
    {
      title: 'Agentic Design Patterns, Chapter 8: Memory Management',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [122, 142],
    },
  ],
  addedAt: '2026-05-03',
  dateModified: '2026-05-03',
  lastChangeNote: 'Initial authoring of Memory Management pattern (wave 2; tiered working/episodic/semantic stores).',
}
