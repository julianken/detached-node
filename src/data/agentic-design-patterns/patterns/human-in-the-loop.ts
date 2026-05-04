import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'human-in-the-loop',
  name: 'Human in the Loop',
  alternativeNames: ['Human Approval', 'Tool Approval Gates', 'Pause-and-Resume', 'Principal-Agent Approval'],
  layerId: 'quality',
  oneLineSummary: 'Agent pauses on a designated step and waits for a human signal before continuing.',
  bodySummary: [
    'Human in the Loop (HITL) is the runtime discipline of pausing an agent at a designated step, surfacing the pending decision to a person, and resuming only after that person approves, rejects, or edits what the agent proposed. The interruption is structural rather than incidental: the orchestrator declares which tool calls or branch transitions require a signal, serialises the run state at the boundary, and exposes a queue or callback the human reviewer drives. When the signal arrives the run rehydrates from the same checkpoint and continues with the approved arguments, the rejection reason, or the edited payload spliced in.',
    'Three sub-variants share that skeleton. Approve-before-tool-call gates a single side-effecting action (a payment, a destructive shell command, an email send) on a yes-or-no acknowledgement; Claude Code\'s permission prompts and the OpenAI Agents SDK\'s `needs_approval` flag both ship this shape. Choose-between-options surfaces N candidates the agent generated and asks the reviewer to pick or rank — Cursor\'s diff-by-diff accept-and-reject UI on a multi-file edit, or RLHF preference labelling at training time, are both this variant moved to different lifecycle points. Free-form correction lets the reviewer rewrite the proposed arguments, the trajectory, or the next plan step before resume, which LangGraph\'s interrupt primitive supports through state edits between checkpoints.',
    'HITL is distinct from Guardrails, which screens input and output automatically without a person on the path, and from Evaluator-Optimizer, where the critic is another model. The pattern earns its keep when an irreversible action or a reputational risk wants a person\'s name on the commit, and when the queue of pending approvals is staffed densely enough that the wait does not eclipse the work. The cost is wall-clock and operational: an interruption that nobody answers strands the run, a queue routed to one over-loaded reviewer becomes the bottleneck, and a UI that hides the agent\'s rationale produces rubber-stamping that recovers none of the safety the pattern was deployed for.',
  ],
  mermaidSource: `graph TD
  A[Agent step] --> B{Sensitive action?}
  B -->|no| C[Execute and continue]
  B -->|yes| D[Snapshot state and pause]
  D --> E[Surface request to reviewer]
  E --> F{Human signal}
  F -->|approve| G[Resume with original args]
  F -->|edit| H[Resume with edited args]
  F -->|reject| I[Abort or branch to fallback]
  G --> A
  H --> A
  I --> J[Stop]
  C --> A`,
  mermaidAlt: 'A top-down flowchart in which an Agent step branches on whether the next action is sensitive: non-sensitive actions execute and loop back, while sensitive ones snapshot state, pause, and surface the request to a reviewer whose approve, edit, or reject signal either resumes the loop with original or edited arguments, or aborts the run.',
  whenToUse: [
    'Apply when a tool call is irreversible or hard to recover from — money movement, destructive filesystem or database operations, sending external messages — and a wrong call costs more than the latency of waiting.',
    'Use where regulation or policy demands a named human on the commit (clinical orders, legal filings, hiring decisions) so the audit trail attributes the action to a person, not the model.',
    'Reach for it when the task is rare or low-volume enough that a queue of pending approvals stays small, and a reviewer answers within the trust budget of the upstream caller.',
    'Prefer it over fully autonomous execution when the agent\'s confidence on the next step is low, ambiguous, or contested — high-stakes branch points where a fallback prompt is cheaper than a recovery rollback.',
  ],
  whenNotToUse: [
    'When the action volume exceeds the reviewer staffing budget, the queue grows without bound and the pattern collapses into either silent timeouts or rubber-stamping that recovers no safety.',
    'Without a UI that exposes the agent\'s rationale, the proposed arguments, and the consequences of approval, reviewers default to clicking yes and the gate becomes ceremony rather than control.',
    'When the upstream caller cannot tolerate the wall-clock latency of an asynchronous approval round-trip (interactive chat, real-time pipelines), automated Guardrails or a policy-bound autonomous policy is the right shape.',
  ],
  realWorldExamples: [
    {
      text: 'Claude Code\'s permission system pauses execution on every tool invocation that matches a non-allowlisted pattern (`Bash(rm:*)`, `Write(/etc/*)`) and prompts the operator in-terminal to allow once, allow always, or deny — a per-call human approval gate built on the same pause-and-resume primitive the pattern names.',
      sourceUrl: 'https://code.claude.com/docs/en/iam',
    },
    {
      text: 'OpenAI\'s Agents SDK ships a `needs_approval` flag on `function_tool` and `Agent.as_tool`; when the flag trips the run pauses, pending items appear in `result.interruptions`, and the orchestrator resumes only after the host application calls `state.approve()` or `state.reject()`.',
      sourceUrl: 'https://openai.github.io/openai-agents-python/tools/',
    },
    {
      text: 'Anthropic\'s Computer Use documentation explicitly recommends asking a human to confirm decisions with meaningful real-world consequences and any tasks requiring affirmative consent — accepting cookies, executing financial transactions, agreeing to terms of service — as a primary risk mitigation for the beta agent loop.',
      sourceUrl: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool',
    },
  ],
  implementationSketch: `import { generateText, tool } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

type Pending = { resolve: (decision: 'approve' | 'reject') => void; args: unknown }
const pending = new Map<string, Pending>()

declare function notifyReviewer(id: string, args: unknown): void
export function decide(id: string, decision: 'approve' | 'reject') {
  pending.get(id)?.resolve(decision)
  pending.delete(id)
}

const refund = tool({
  description: 'Issue a customer refund — requires human approval before charging.',
  parameters: z.object({ orderId: z.string(), cents: z.number().int().positive() }),
  execute: async (args) => {
    const id = crypto.randomUUID()
    notifyReviewer(id, args)
    const decision = await new Promise<'approve' | 'reject'>((resolve) => pending.set(id, { resolve, args }))
    if (decision === 'reject') return { status: 'rejected' as const }
    return { status: 'refunded' as const, orderId: args.orderId }
  },
})

export async function runAgent(userInput: string) {
  return generateText({ model: openai('gpt-4o'), prompt: userInput, tools: { refund }, maxSteps: 5 })
}

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: 'Reviewers exposed to a long stream of agent proposals drift toward automation bias — they approve faster than they read, the gate becomes a click-through, and the pattern recovers none of the safety it was deployed for. Goddard, Roudsari and Wyatt\'s systematic review of decision-support studies finds that the rate of automation-driven errors rises with reviewer workload and falls when the system surfaces its rationale alongside the proposal. A HITL UI that hides the agent\'s reasoning replicates the same failure mode at agent scale: the reviewer rubber-stamps and the audit trail records consent the operator never actually exercised.',
    sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3240751/',
  },
  relatedSlugs: ['guardrails', 'checkpointing', 'tool-use-react'],
  frameworks: ['langgraph', 'openai-agents', 'vercel-ai-sdk'],
  references: [
    {
      title: 'Deep Reinforcement Learning from Human Preferences',
      url: 'https://arxiv.org/abs/1706.03741',
      authors: 'Christiano et al.',
      year: 2017,
      venue: 'NeurIPS 2017',
      type: 'paper',
      doi: '10.48550/arXiv.1706.03741',
      note: 'foundational paper for HITL-via-preferences; the training-time variant of the runtime pattern',
    },
    {
      title: 'Building Effective Agents',
      url: 'https://www.anthropic.com/engineering/building-effective-agents',
      authors: 'Anthropic',
      year: 2024,
      type: 'essay',
      note: 'frames human approval as a first-class checkpoint in the agent control loop',
    },
    {
      title: 'LangGraph — Interrupts and Human-in-the-Loop',
      url: 'https://docs.langchain.com/oss/python/langgraph/interrupts',
      authors: 'LangChain team',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'interrupt() primitive, state edits between checkpoints, resume semantics',
    },
    {
      title: 'OpenAI Agents SDK — Tools and Approval Flow',
      url: 'https://openai.github.io/openai-agents-python/tools/',
      authors: 'OpenAI',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'needs_approval, on_invoke, result.interruptions and resume contract',
    },
    {
      title: 'Vercel AI SDK — Human in the Loop cookbook',
      url: 'https://ai-sdk.dev/cookbook/next/human-in-the-loop',
      authors: 'Vercel',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'tool-confirmation pattern wired into the Next.js streaming UI',
    },
    {
      title: 'Claude Code — Identity and Access Management',
      url: 'https://code.claude.com/docs/en/iam',
      authors: 'Anthropic',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'permission rules and the per-call approval prompt that gates non-allowlisted tool use',
    },
    {
      title: 'Agentic Design Patterns, Chapter 16: Human-in-the-Loop',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [262, 285],
    },
  ],
  addedAt: '2026-05-04',
  dateModified: '2026-05-04',
  lastChangeNote: 'Author Human in the Loop satellite: pause-snapshot-resume contract, three sub-variants, automation-bias gotcha.',
}
