import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'handoffs-swarm',
  name: 'Handoffs / Swarm',
  alternativeNames: ['Agent Handoff', 'Swarm', 'Triage-and-Transfer'],
  layerId: 'topology',
  topologySubtier: 'multi-agent',
  oneLineSummary: 'One agent owns the conversation; transfer-as-tool-call hands it to a specialist.',
  bodySummary: [
    'Handoffs treat a multi-agent system as a single conversation with a moving owner. One agent holds the dialogue at a time; when its scope runs out, it emits a transfer — a tool call whose return value is another agent rather than a string — and the runner switches the active agent for the next turn. The new agent inherits the message history and continues from where the previous one stopped, so the user sees one coherent thread even though several prompts and tool sets handled it. OpenAI shipped this as Swarm in 2024 and folded it into the Agents SDK as `handoff()`; both stay small because the runtime work is just a loop over messages and a pointer to the current agent.',
    'The pattern only earns its name when the transfer is the agent\'s own decision and the chosen specialist takes the conversation forward without supervision. A triage agent inspects the request, picks among a registry of specialists, and yields control; the specialist may hand back, hand to a peer, or finish. Roles are encoded as system prompts plus narrow tool surfaces, and the handoff vocabulary as the names of the transfer tools. Every transition is then a recorded tool call with arguments, replayable from the trace and editable by changing one specialist\'s instructions without touching the others.',
    'Handoffs sit next to but distinct from Routing, Orchestrator-Workers, and Multi-Agent Debate. Routing is a one-shot classifier that fires before any agent runs and never re-routes; orchestrator-workers keeps a central planner that fans sub-tasks out in parallel and synthesises; multi-agent debate runs peer agents in parallel and cross-critiques. Handoffs are sequential and peer-to-peer — exactly one agent is live at any moment and the context is the message history itself. The cost is operational: deciding which agent owns scope creep, preventing two specialists from ping-ponging the same request, and bounding how many turns the swarm can spend electing not to finish.',
  ],
  mermaidSource: `graph TD
  A[User message] --> B[Triage agent]
  B --> C{Decision}
  C -->|in scope| D[Answer in turn]
  C -->|transfer to billing| E[Billing specialist]
  C -->|transfer to refunds| F[Refunds specialist]
  E --> G{Done or transfer?}
  F --> G
  G -->|done| H[Reply to user]
  G -->|hand back| B
  D --> H`,
  mermaidAlt: 'A flowchart in which a user message reaches a triage agent that either answers in turn, transfers to a billing specialist, or transfers to a refunds specialist; each specialist either replies to the user when done or hands the conversation back to the triage agent for re-routing.',
  whenToUse: [
    'Apply when a single conversation spans multiple narrow specialisations and the right specialist is only knowable after the user has spoken (customer support triage, multi-domain copilots, intake-then-treatment flows).',
    'Use where each specialist needs a different system prompt, tool surface, or model tier, and you want the boundary between roles to be visible in the trace as a named transfer rather than buried inside one prompt.',
    'Reach for it when authority and audit matter — handoffs make the moment a conversation crossed from a generalist to a privileged tool surface (refunds, account changes, code-write access) an explicit, logged event.',
    'Prefer it when conversational continuity is the product: the user is talking to one assistant whose voice happens to shift, not filing tickets that get routed and replied to asynchronously.',
  ],
  whenNotToUse: [
    'When the work decomposes into independent parallel sub-tasks that fan out and synthesise, an orchestrator-workers pipeline produces results faster and with fewer round trips than a sequential chain of handoffs.',
    'Without per-handoff scope guards and a turn budget, two specialists trained on adjacent domains will ping-pong the same request, and the swarm will spend tokens electing not to answer.',
    'When the routing decision can be made once from the initial request and never revisited, a Routing classifier is a cheaper and more debuggable substitute than a triage agent that runs every turn.',
  ],
  realWorldExamples: [
    {
      text: 'OpenAI Swarm ships a customer-service starter where a triage agent receives the message and calls `transfer_to_sales_agent` or `transfer_to_refunds_agent`; the chosen agent inherits the thread and either resolves the issue or hands back to triage.',
      sourceUrl: 'https://github.com/openai/swarm',
    },
    {
      text: 'The OpenAI Agents SDK exposes `handoff()` as a first-class primitive in both the Python and TypeScript runtimes; the docs show a triage agent listing specialist agents in its `handoffs` array, with each transfer recorded as a tool call in the trace.',
      sourceUrl: 'https://openai.github.io/openai-agents-js/guides/handoffs/',
    },
    {
      text: 'LangGraph documents a Multi-Agent Supervisor pattern in which a supervisor node decides which worker agent runs next based on conversation state, then routes back to itself when the worker finishes — the same handoff-and-return loop expressed as graph edges.',
      sourceUrl: 'https://langchain-ai.github.io/langgraph/tutorials/multi_agent/agent_supervisor/',
    },
  ],
  implementationSketch: `import { generateText, tool } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

type AgentName = 'triage' | 'billing' | 'refunds'
const agents: Record<AgentName, { system: string }> = {
  triage: { system: 'Triage. Answer general questions; transfer billing or refund requests.' },
  billing: { system: 'Billing specialist. Resolve billing questions; hand back if out of scope.' },
  refunds: { system: 'Refunds specialist. Process refund requests; hand back if out of scope.' },
}

export async function runSwarm(messages: { role: 'user' | 'assistant'; content: string }[]) {
  let active: AgentName = 'triage'
  const handoff = tool({
    description: 'Transfer the conversation to another agent.',
    parameters: z.object({ to: z.enum(['triage', 'billing', 'refunds']) }),
    execute: async ({ to }: { to: AgentName }) => { active = to; return \`transferred to \${to}\` },
  })
  for (let turn = 0; turn < 6; turn++) {
    const prev: AgentName = active
    const { text } = await generateText({ model: openai('gpt-4o'), system: agents[active].system, messages, tools: { handoff }, maxSteps: 4 })
    messages.push({ role: 'assistant', content: text })
    if (active === prev) return text
  }
  throw new Error('Swarm turn budget exhausted')
}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: 'Cognition argues from production experience that conversation-spanning handoffs reliably break because each new agent reads the same message history but reconstructs a different latent context, then makes decisions inconsistent with the prior agent\'s. The fix is not better prompts on each specialist — it is reducing the number of handoffs, or sharing a compact written context that travels with the transfer rather than relying on the raw message log.',
    sourceUrl: 'https://cognition.ai/blog/dont-build-multi-agents',
  },
  relatedSlugs: ['routing', 'planning'],
  frameworks: ['openai-agents', 'langgraph', 'vercel-ai-sdk', 'autogen'],
  references: [
    {
      title: 'Swarm — experimental multi-agent orchestration',
      url: 'https://github.com/openai/swarm',
      authors: 'OpenAI',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'canonical reference implementation; tool returning an Agent triggers the runner to switch active agent',
    },
    {
      title: 'OpenAI Agents SDK (TypeScript) — Handoffs',
      url: 'https://openai.github.io/openai-agents-js/guides/handoffs/',
      authors: 'OpenAI',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'production successor to Swarm; first-class handoff() primitive',
    },
    {
      title: 'OpenAI Agents SDK (Python) — Handoffs',
      url: 'https://openai.github.io/openai-agents-python/handoffs/',
      authors: 'OpenAI',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
    },
    {
      title: 'LangGraph — Multi-Agent Supervisor tutorial',
      url: 'https://langchain-ai.github.io/langgraph/tutorials/multi_agent/agent_supervisor/',
      authors: 'LangChain team',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'graph-shaped supervisor-worker variant of the same handoff loop',
    },
    {
      title: 'AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation',
      url: 'https://arxiv.org/abs/2308.08155',
      authors: 'Wu et al.',
      year: 2023,
      venue: 'COLM 2024',
      type: 'paper',
      doi: '10.48550/arXiv.2308.08155',
      note: 'foundational paper framing multi-agent systems as a conversation between role-specialised agents',
    },
    {
      title: 'Don\'t Build Multi-Agents',
      url: 'https://cognition.ai/blog/dont-build-multi-agents',
      authors: 'Walden Yan (Cognition)',
      year: 2025,
      type: 'essay',
      note: 'production-experience critique of the handoff topology; source for the reader gotcha',
    },
    {
      title: 'Agentic Design Patterns, Chapter 7: Multi-Agent Collaboration',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [102, 117],
    },
  ],
  addedAt: '2026-05-03',
  dateModified: '2026-05-04',
  lastChangeNote: 'Author Handoffs / Swarm satellite: sequential conversation ownership, transfer-as-tool-call, supervisor variant.',
}
