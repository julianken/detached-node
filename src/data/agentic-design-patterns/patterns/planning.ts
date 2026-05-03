import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'planning',
  name: 'Planning',
  alternativeNames: ['Plan-and-Execute', 'Decompose-then-Act'],
  layerId: 'topology',
  topologySubtier: 'single-agent',
  oneLineSummary: 'Agent drafts a multi-step plan, executes it, and rewrites the tail when reality bites.',
  bodySummary: [
    'Planning splits an agent run into two phases the literature treats as separable: a planner that decomposes a goal into ordered steps, and an executor that takes one step at a time. The planner reasons about the task end-to-end before any tool fires, so the system commits to a structure rather than improvising token by token. The executor walks the step list, calling tools or sub-agents, and the orchestration layer holds onto the plan as a contract the run can be checked against. The split exists because language-model strengths on long-horizon tasks live mostly in the upfront decomposition, not in step-wise reactive choice.',
    'The pattern only earns its name when the plan can be revised. After each step the executor compares results against the plan and routes back to the planner whenever a precondition fails, a tool returns the wrong shape, or a later step turns out to be unreachable. The planner edits the tail rather than restarting, preserving work already done and bounding the cost of a mistake. Variants branch differently: tree-of-thoughts expands candidate plans in parallel and prunes by a value heuristic; HuggingGPT picks tools eagerly from a registry; Plan-and-Solve prompting collapses the loop into a single chain-of-thought that emits the plan inline.',
    'Planning sits next to but distinct from chain-of-thought, ReAct, and orchestrator-workers. Chain-of-thought reasons within one response and never names a step list the rest of the system can read; ReAct interleaves reasoning and acting at every turn without an explicit forward plan; orchestrator-workers fans a fixed plan out to specialists. Planning insists on a written, inspectable plan that survives across LLM calls and can be re-edited. The cost is operational: someone has to decide step granularity, when a deviation justifies a re-plan rather than a retry, and how many revisions are allowed before the run aborts. Plans that cannot be checked against ground truth degrade into expensive prose.',
  ],
  mermaidSource: `graph TD
  A[Goal] --> B[Plan: ordered step list]
  B --> C[Pop next step]
  C --> D[Execute step]
  D --> E{Step succeeded and plan still valid?}
  E -->|yes, more steps| C
  E -->|yes, no steps left| F[Return result]
  E -->|no| G[Re-plan tail from current state]
  G --> C`,
  mermaidAlt: 'A flowchart in which a Goal feeds a Plan that produces an ordered step list; a loop pops and executes one step at a time, and a decision node either advances to the next step, returns the final result when the list is empty, or routes back to a re-plan node that rewrites the remaining steps from the current state before continuing.',
  whenToUse: [
    'Apply when the task has interdependent sub-goals whose order matters and at least one early step constrains the choices available later (research reports, multi-tool workflows, code-mod sequences).',
    'Use where the cost of a wrong step is high enough that committing to a forward plan and reviewing it once is cheaper than ten reactive turns.',
    'Reach for it when the executor benefits from a written contract a different process (a reviewer, a checkpoint, a human) can read between steps.',
    'Prefer it when tools or sub-agents are heterogeneous and the planner needs to pick which to invoke, in what order, and on what input.',
  ],
  whenNotToUse: [
    'When the goal is single-shot or a fixed pipeline already encodes the right order, the planner step pays no rent and adds an extra LLM call to every run.',
    'Without a check that can detect a bad step (tool error, unmet precondition, evaluator), the re-plan loop has nothing to fire on and the agent will execute a wrong plan to completion.',
    'When step latency dominates and the goal tolerates greedy local choice, ReAct-style interleaved reasoning is usually faster and indistinguishable in quality.',
  ],
  realWorldExamples: [
    {
      text: 'Cognition’s Devin produces a step-by-step task plan that streams in the side panel and is rewritten as the agent learns the codebase, exposing the plan as the user-facing artifact of the run.',
      sourceUrl: 'https://cognition.ai/blog/swe-bench-technical-report',
    },
    {
      text: 'AutoGPT’s classic agent loop instructs the model to think, plan, criticise, and choose the next command on every turn, then writes the resulting plan into the prompt for the following step — the canonical popular-press demonstration of the planner-executor split.',
      sourceUrl: 'https://github.com/Significant-Gravitas/AutoGPT/blob/master/classic/README.md',
    },
    {
      text: 'BabyAGI maintains an explicit task list, executes the top task, and uses a task-creation step to append new tasks based on the result before reprioritising — the minimum viable planning loop in roughly a hundred lines of Python.',
      sourceUrl: 'https://github.com/yoheinakajima/babyagi/blob/main/main.py',
    },
  ],
  implementationSketch: `import { generateObject, generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const Plan = z.object({ steps: z.array(z.string()).min(1).max(8) })

declare function execute(step: string): Promise<{ ok: boolean; observation: string }>

async function planAndExecute(goal: string, maxRevisions = 3): Promise<string> {
  let plan = (await generateObject({
    model: openai('gpt-4o'),
    schema: Plan,
    prompt: \`Goal: \${goal}\\nDecompose into 3-8 ordered steps.\`,
  })).object.steps
  const trace: string[] = []
  for (let revisions = 0; plan.length > 0; ) {
    const step = plan.shift()!
    const { ok, observation } = await execute(step)
    trace.push(\`\${step} -> \${observation}\`)
    if (ok) continue
    if (++revisions > maxRevisions) throw new Error('Re-plan budget exhausted')
    plan = (await generateObject({
      model: openai('gpt-4o'),
      schema: Plan,
      prompt: \`Goal: \${goal}\\nTrace:\\n\${trace.join('\\n')}\\nRewrite the remaining steps.\`,
    })).object.steps
  }
  return (await generateText({ model: openai('gpt-4o'), prompt: \`Goal: \${goal}\\nTrace:\\n\${trace.join('\\n')}\\nSummarise the result.\` })).text
}

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: 'Plan-and-Solve prompting reports gains over chain-of-thought because the explicit plan suppresses missed-step errors, but the same paper documents that calculation errors and step-ordering mistakes survive untouched — the plan looks coherent while a single arithmetic slip propagates through every downstream step. Planning without a per-step check produces a confidently wrong execution trace.',
    sourceUrl: 'https://arxiv.org/abs/2305.04091',
  },
  relatedSlugs: [],
  frameworks: ['langgraph', 'crew-ai', 'vercel-ai-sdk'],
  references: [
    {
      title: 'Tree of Thoughts: Deliberate Problem Solving with Large Language Models',
      url: 'https://arxiv.org/abs/2305.10601',
      authors: 'Yao et al.',
      year: 2023,
      venue: 'NeurIPS 2023',
      type: 'paper',
      doi: '10.48550/arXiv.2305.10601',
      note: 'branching planner that searches over candidate plans',
    },
    {
      title: 'HuggingGPT: Solving AI Tasks with ChatGPT and its Friends in Hugging Face',
      url: 'https://arxiv.org/abs/2303.17580',
      authors: 'Shen et al.',
      year: 2023,
      venue: 'NeurIPS 2023',
      type: 'paper',
      doi: '10.48550/arXiv.2303.17580',
      note: 'planner picks specialist models from a registry per step',
    },
    {
      title: 'Plan-and-Solve Prompting: Improving Zero-Shot Chain-of-Thought Reasoning by Large Language Models',
      url: 'https://arxiv.org/abs/2305.04091',
      authors: 'Wang et al.',
      year: 2023,
      venue: 'ACL 2023',
      type: 'paper',
      doi: '10.48550/arXiv.2305.04091',
      note: 'collapses the planner-executor split into a single prompt',
    },
    {
      title: 'Building Effective Agents',
      url: 'https://www.anthropic.com/engineering/building-effective-agents',
      authors: 'Anthropic',
      year: 2024,
      type: 'essay',
      note: 'orchestrator-workers section frames planning as the dynamic-decomposition workflow',
    },
    {
      title: 'Agentic Design Patterns, Chapter 6: Planning',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [89, 101],
    },
    {
      title: 'LangGraph — Plan-and-Execute tutorial',
      url: 'https://langchain-ai.github.io/langgraph/tutorials/plan-and-execute/plan-and-execute/',
      authors: 'LangChain team',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-03',
    },
    {
      title: 'CrewAI — Planning concept',
      url: 'https://docs.crewai.com/en/concepts/planning',
      authors: 'CrewAI team',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-03',
    },
  ],
  addedAt: '2026-05-03',
  dateModified: '2026-05-03',
  lastChangeNote: 'Author Planning satellite: planner-executor split, re-plan loop, ToT/HuggingGPT/Plan-and-Solve variants.',
}
