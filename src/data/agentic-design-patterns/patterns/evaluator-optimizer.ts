import type { Pattern } from '../types'

export const pattern: Pattern = {
  slug: 'evaluator-optimizer',
  name: 'Evaluator-Optimizer',
  alternativeNames: ['Generator-Critic Loop', 'Self-Refine', 'Iterative Refinement'],
  layerId: 'topology',
  topologySubtier: 'single-agent',
  oneLineSummary: 'Generate a draft, score it against a rubric, refine until the critic stops complaining.',
  bodySummary: [
    'Evaluator-Optimizer wraps a single task in a generator-critic loop. A first model call drafts an answer, a second call scores that draft against a written rubric and emits a structured judgement, and a third call regenerates the answer with the critique appended to the prompt. The loop runs until the judgement clears a threshold or a hard iteration cap fires. The critic is what the prompt makes it: a list of acceptance criteria, a unit test runner, an external API check, or another LLM tasked with finding a flaw. The optimizer is the same generator the loop started with, prompted again with everything it produced so far plus the verdict on why that output failed.',
    'The pattern only earns its cost when the rubric is sharper than what the generator can self-correct in a single shot. Translation between languages, code that has to compile, structured outputs that must validate against a schema, and long-form writing with explicit style constraints all expose enough surface for a separate critic to catch what the writer missed. The loop converges when the critique from iteration N flips from listing concrete defects to producing diminishing or contradictory feedback — the operational signal to stop refining and ship.',
    'Evaluator-Optimizer is regularly confused with Reflexion, and the difference is durability. Evaluator-Optimizer is the within-attempt loop: one task, the critique lives inside that task, the buffer is discarded when the answer ships. Reflexion is the across-attempt loop: the lesson written after a failed attempt persists into the next encounter with the same task class. Anthropic frames the within-attempt variant as one of five agentic workflows in their effective-agents essay; Self-Refine is the academic measurement of the same shape. Reach for Evaluator-Optimizer when the next call is the same job, not the next instance of that job.',
  ],
  mermaidSource: `graph TD
  A[Task] --> B[Generator: draft answer]
  B --> C[Evaluator: score against rubric]
  C --> D{Pass or attempts exhausted?}
  D -->|yes| E[Return final answer]
  D -->|no| F[Append critique to prompt]
  F --> B`,
  mermaidAlt: 'A flowchart in which a Task feeds a Generator that drafts an answer, passed to an Evaluator that scores it against a rubric; if the verdict passes or attempts are exhausted the loop returns the final answer, otherwise the critique is appended to the prompt and the Generator runs again.',
  whenToUse: [
    'Apply when the acceptance criteria can be written down and a separate critic can check the draft against them more reliably than the generator can self-correct in one shot.',
    'Use where a single failed iteration is cheap and observable — code that has to compile, JSON that has to validate against a schema, translations a back-translation step can grade, prose that must hit a style or length target.',
    'Reach for it when the critic has access to a signal the generator does not — a unit-test runner, a type checker, a search-grounded fact check, or a stronger model graded against a weaker one.',
    'Prefer it when the user is willing to trade two-to-five times the latency and tokens for a measurable lift in correctness on a high-value request, not for low-stakes chat where the first draft is good enough.',
  ],
  whenNotToUse: [
    'When the rubric collapses to "looks good" the critic invents work, the loop never converges, and the bill grows linearly with iteration count without a quality signal to justify it.',
    'When the generator and critic share weights and prompt context, the second call tends to ratify the first — pick a different model family, a tool-grounded check, or fall back to LLM-as-Judge where the bias is at least measured.',
    'Without a hard iteration cap and a stop condition tied to a delta in the verdict, a stuck loop will spend the entire context window oscillating between two near-identical drafts.',
  ],
  realWorldExamples: [
    {
      text: 'Anthropic publishes a runnable evaluator_optimizer notebook in their cookbook that wires a generator and an evaluator around a single task and loops until the evaluator returns PASS, the canonical reference implementation for the workflow they describe in the effective-agents essay.',
      sourceUrl: 'https://github.com/anthropics/anthropic-cookbook/blob/main/patterns/agents/evaluator_optimizer.ipynb',
    },
    {
      text: 'LangChain documents a Reflection-style agent in their reflection-agents post that pairs a generator with a reflector inside a single LangGraph run, looping until the reflector stops returning critique — the within-attempt shape this pattern names.',
      sourceUrl: 'https://blog.langchain.dev/reflection-agents/',
    },
    {
      text: 'The Vercel AI SDK Agents primitive ships stopWhen and prepareStep hooks so a step can read a tool result, judge it, and either accept the output or schedule another generation pass, expressing the Evaluator-Optimizer loop as a step controller rather than an outer while.',
      sourceUrl: 'https://ai-sdk.dev/docs/foundations/agents',
    },
  ],
  implementationSketch: `import { generateText, generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const Verdict = z.object({
  pass: z.boolean(),
  critique: z.string(),
})

export async function refine(task: string, maxAttempts = 4): Promise<string> {
  let draft = ''
  let critiqueLog = ''
  for (let i = 0; i < maxAttempts; i++) {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      prompt: \`Task: \${task}\\nPrior critique:\\n\${critiqueLog || '(none)'}\\nDraft:\`,
    })
    draft = text
    const { object: verdict } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: Verdict,
      prompt: \`Task: \${task}\\nDraft: \${draft}\\nReturn pass=true only if the draft fully satisfies the task.\`,
    })
    if (verdict.pass) return draft
    critiqueLog += \`\\nIteration \${i + 1}: \${verdict.critique}\`
  }
  return draft
}

export {}
`,
  sdkAvailability: 'first-party-ts',
  readerGotcha: {
    text: 'Madaan et al. report that Self-Refine fails on tasks the base model cannot already nearly solve: when GPT-3.5 is the generator, iterative critique on math reasoning underperforms a single zero-shot pass because the model cannot reliably tell a wrong answer from a right one. Treat the loop as an amplifier of an existing capability, not a way to create one — and measure base-model accuracy on the eval set before adding iterations.',
    sourceUrl: 'https://arxiv.org/abs/2303.17651',
  },
  relatedSlugs: ['reflexion', 'evaluation-llm-as-judge', 'guardrails'],
  frameworks: ['langchain', 'langgraph', 'vercel-ai-sdk'],
  references: [
    {
      title: 'Self-Refine: Iterative Refinement with Self-Feedback',
      url: 'https://arxiv.org/abs/2303.17651',
      authors: 'Madaan et al.',
      year: 2023,
      venue: 'NeurIPS 2023',
      type: 'paper',
      doi: '10.48550/arXiv.2303.17651',
      note: 'foundational measurement of within-attempt critic loops; documents the base-capability ceiling',
    },
    {
      title: 'Reflexion: Language Agents with Verbal Reinforcement Learning',
      url: 'https://arxiv.org/abs/2303.11366',
      authors: 'Shinn et al.',
      year: 2023,
      venue: 'NeurIPS 2023',
      type: 'paper',
      doi: '10.48550/arXiv.2303.11366',
      note: 'across-attempt cousin; cited here for the contrast that decides which loop a deployment wants',
    },
    {
      title: 'CRITIC: Large Language Models Can Self-Correct with Tool-Interactive Critiquing',
      url: 'https://arxiv.org/abs/2305.11738',
      authors: 'Gou et al.',
      year: 2023,
      venue: 'ICLR 2024',
      type: 'paper',
      doi: '10.48550/arXiv.2305.11738',
      note: 'tool-grounded critic variant; addresses the same-model self-ratification failure mode',
    },
    {
      title: 'Building Effective Agents',
      url: 'https://www.anthropic.com/engineering/building-effective-agents',
      authors: 'Anthropic',
      year: 2024,
      type: 'essay',
      note: 'names the workflow Evaluator-Optimizer and lists the conditions under which it pays its cost',
    },
    {
      title: 'Agentic Design Patterns, Chapter 4: Reflection',
      url: 'https://link.springer.com/book/10.1007/978-3-032-01402-3',
      authors: 'Antonio Gulli',
      year: 2026,
      venue: 'Springer',
      type: 'book',
      pages: [56, 68],
    },
    {
      title: 'Anthropic Cookbook — evaluator_optimizer notebook',
      url: 'https://github.com/anthropics/anthropic-cookbook/blob/main/patterns/agents/evaluator_optimizer.ipynb',
      authors: 'Anthropic',
      year: 2024,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'reference implementation of the workflow described in the essay',
    },
    {
      title: 'Vercel AI SDK — Agents (multi-step calls with stopWhen)',
      url: 'https://ai-sdk.dev/docs/foundations/agents',
      authors: 'Vercel',
      year: 2025,
      type: 'docs',
      accessedAt: '2026-05-04',
      note: 'production wiring of the generator-critic loop as a step controller',
    },
  ],
  addedAt: '2026-05-03',
  dateModified: '2026-05-04',
  lastChangeNote: 'Author Evaluator-Optimizer satellite: within-attempt generator-critic loop, contrast with Reflexion, base-capability-ceiling gotcha.',
}
